#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, Address, Env, Symbol, Vec,
};

/// Payment statuses representing the lifecycle of an OKADA ride payment
#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum PaymentStatus {
    Pending = 0,
    Processing = 1,
    Completed = 2,
    Failed = 3,
}

/// Custom contract errors
#[contracterror]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Error {
    AlreadyExists = 1,
    NotFound = 2,
    InvalidState = 3,
    Unauthorized = 4,
    InvalidAmount = 5,
    AlreadyCompleted = 6,
}

/// Storage keys
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Payment(Symbol),
    RiderPayments(Address),
    Admin,
}

/// Detailed ride payment record stored on Soroban
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PaymentRecord {
    pub payment_id: Symbol,
    pub rider_wallet_address: Address,
    pub passenger_wallet_address: Option<Address>,
    pub amount: i128,
    pub asset: Symbol,
    pub ride_reference: Symbol,
    pub status: PaymentStatus,
    pub stellar_tx_hash: Symbol,
    pub created_at: u64,
    pub completed_at: u64,
}

#[contract]
pub struct OkadaPaymentContract;

#[contractimpl]
impl OkadaPaymentContract {
    /// Initialize the contract with an admin (optional for upgradeability)
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
    }

    /// Step 1: Rider creates a ride payment request with fare amount & reference
    pub fn create_payment_request(
        env: Env,
        payment_id: Symbol,
        rider: Address,
        amount: i128,
        asset: Symbol,
        ride_reference: Symbol,
    ) -> Result<PaymentRecord, Error> {
        // Authenticate the rider
        rider.require_auth();

        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        let key = DataKey::Payment(payment_id.clone());
        if env.storage().persistent().has(&key) {
            return Err(Error::AlreadyExists);
        }

        let current_time = env.ledger().timestamp();
        let record = PaymentRecord {
            payment_id: payment_id.clone(),
            rider_wallet_address: rider.clone(),
            passenger_wallet_address: None,
            amount,
            asset,
            ride_reference,
            status: PaymentStatus::Pending,
            stellar_tx_hash: Symbol::new(&env, "pending"),
            created_at: current_time,
            completed_at: 0,
        };

        // Persist payment record
        env.storage().persistent().set(&key, &record);

        // Append to rider's payment index
        let rider_key = DataKey::RiderPayments(rider.clone());
        let mut rider_history: Vec<Symbol> = env
            .storage()
            .persistent()
            .get(&rider_key)
            .unwrap_or_else(|| Vec::new(&env));
        rider_history.push_back(payment_id);
        env.storage().persistent().set(&rider_key, &rider_history);

        Ok(record)
    }

    /// Step 2: Passenger initiates/processes the payment
    pub fn process_payment(
        env: Env,
        payment_id: Symbol,
        passenger: Address,
    ) -> Result<PaymentRecord, Error> {
        passenger.require_auth();

        let key = DataKey::Payment(payment_id.clone());
        let mut record: PaymentRecord = env
            .storage()
            .persistent()
            .get(&key)
            .ok_or(Error::NotFound)?;

        if record.status == PaymentStatus::Completed {
            return Err(Error::AlreadyCompleted);
        }

        record.passenger_wallet_address = Some(passenger);
        record.status = PaymentStatus::Processing;

        env.storage().persistent().set(&key, &record);
        Ok(record)
    }

    /// Step 3: Confirm payment with Stellar transaction hash and finalize status
    pub fn confirm_payment(
        env: Env,
        payment_id: Symbol,
        stellar_tx_hash: Symbol,
    ) -> Result<PaymentRecord, Error> {
        let key = DataKey::Payment(payment_id.clone());
        let mut record: PaymentRecord = env
            .storage()
            .persistent()
            .get(&key)
            .ok_or(Error::NotFound)?;

        // Ensure idempotency - payment cannot be confirmed twice
        if record.status == PaymentStatus::Completed {
            return Err(Error::AlreadyCompleted);
        }

        record.status = PaymentStatus::Completed;
        record.stellar_tx_hash = stellar_tx_hash;
        record.completed_at = env.ledger().timestamp();

        env.storage().persistent().set(&key, &record);
        Ok(record)
    }

    /// Mark payment as failed
    pub fn fail_payment(env: Env, payment_id: Symbol) -> Result<PaymentRecord, Error> {
        let key = DataKey::Payment(payment_id.clone());
        let mut record: PaymentRecord = env
            .storage()
            .persistent()
            .get(&key)
            .ok_or(Error::NotFound)?;

        if record.status == PaymentStatus::Completed {
            return Err(Error::AlreadyCompleted);
        }

        record.status = PaymentStatus::Failed;
        record.completed_at = env.ledger().timestamp();

        env.storage().persistent().set(&key, &record);
        Ok(record)
    }

    /// Fetch a single payment record by payment_id
    pub fn get_payment(env: Env, payment_id: Symbol) -> Option<PaymentRecord> {
        let key = DataKey::Payment(payment_id);
        env.storage().persistent().get(&key)
    }

    /// Fetch all payment IDs for a given rider
    pub fn get_rider_payments(env: Env, rider: Address) -> Vec<PaymentRecord> {
        let rider_key = DataKey::RiderPayments(rider);
        let payment_ids: Vec<Symbol> = env
            .storage()
            .persistent()
            .get(&rider_key)
            .unwrap_or_else(|| Vec::new(&env));

        let mut results = Vec::new(&env);
        for id in payment_ids.iter() {
            if let Some(record) = Self::get_payment(env.clone(), id) {
                results.push_back(record);
            }
        }
        results
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_create_and_confirm_payment() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, OkadaPaymentContract);
        let client = OkadaPaymentContractClient::new(&env, &contract_id);

        let rider = Address::generate(&env);
        let passenger = Address::generate(&env);
        let payment_id = Symbol::new(&env, "PAY_839201");
        let asset = Symbol::new(&env, "USDC");
        let reference = Symbol::new(&env, "OKD_VI_90");
        let amount: i128 = 1_500_0000; // 1.50 USDC

        // 1. Create request
        let record = client.create_payment_request(
            &payment_id,
            &rider,
            &amount,
            &asset,
            &reference,
        );
        assert_eq!(record.amount, amount);
        assert_eq!(record.status, PaymentStatus::Pending);

        // 2. Process
        let processed = client.process_payment(&payment_id, &passenger);
        assert_eq!(processed.status, PaymentStatus::Processing);

        // 3. Confirm
        let tx_hash = Symbol::new(&env, "7e8a9...b4c2");
        let completed = client.confirm_payment(&payment_id, &tx_hash);
        assert_eq!(completed.status, PaymentStatus::Completed);
        assert_eq!(completed.stellar_tx_hash, tx_hash);

        // 4. Query
        let fetched = client.get_payment(&payment_id).unwrap();
        assert_eq!(fetched.status, PaymentStatus::Completed);

        // 5. Rider list
        let rider_list = client.get_rider_payments(&rider);
        assert_eq!(rider_list.len(), 1);
    }
}
