# OKADA — Fast Payments for Every Ride 🏍️⚡

**OKADA** is a mobile-first digital payment platform built specifically for commercial motorcycle and bike riders ("okadas") and passengers in West Africa (Nigeria, Ghana, Côte d'Ivoire, Sierra Leone, etc.).

Powered by the **Stellar blockchain** and a **Soroban smart contract**, OKADA makes paying for a ride as simple and fast as scanning a QR code.

---

## 🌟 Key Features

- ⚡ **3-Second Settlement on Stellar**: Fast and low-cost digital payments settling via Stellar Testnet USDC / native assets.
- 📜 **Soroban Smart Contract Verification**: State-machine managing payment creation, verification, idempotency (no double spending), and ride history records on-chain.
- 📱 **Mobile-First Rider & Passenger UX**:
  - **Rider Dashboard**: Today's earnings in NGN & USDC, completed rides counter, pending requests.
  - **Quick Fare Keypad**: Preset buttons (₦500, ₦1,000, ₦1,500, ₦2,000, ₦5,000) with live USDC conversion.
  - **Instant QR Payment**: Generates dynamic QR code and shareable `/pay/:paymentId` link.
  - **Real-Time Payment Listener**: Instant sound/confetti feedback as soon as passenger confirms payment.
  - **Focused Passenger Checkout**: Clean, zero-friction payment page with instant wallet signing.
  - **Digital Ride Receipt**: Verified Stellar transaction hash, explorer link, and printable receipt.
- 🌍 **Multi-Currency Support**:
  - 🇳🇬 Nigerian Naira (NGN - ₦)
  - 🇬🇭 Ghanaian Cedi (GHS - GH₵)
  - 🇨🇮 West African CFA Franc (XOF - CFA)
  - 🇸🇱 Sierra Leonean Leone (SLE - NLe)
- 👛 **Dual Wallet Integration**:
  - **Freighter Wallet** browser extension integration.
  - **Built-in In-App Testnet Wallet** with 1-click **Friendbot Faucet** (+10,000 XLM) for instant testing on any device without browser extensions.

---

## 🏗️ Project Architecture

```
okada-app/
├── contracts/
│   └── okada_payment/
│       ├── Cargo.toml                    # Soroban SDK Rust configuration
│       ├── src/
│       │   └── lib.rs                    # Soroban smart contract source code
│       └── README.md                     # Smart contract build & deployment guide
├── supabase/
│   ├── migrations/
│   │   └── 20260828000000_init_okada_schema.sql  # SQL schema, tables, indexes & RLS
│   └── functions/
│       ├── create-payment-request/       # Secure payment creation edge function
│       └── verify-stellar-payment/       # Stellar transaction verification function
├── src/
│   ├── components/
│   │   ├── layout/                       # Navbar, BottomNav, NetworkBadge
│   │   └── payment/                      # QRCodeDisplay, FareInput, CurrencySelector, StatusBadge
│   ├── context/                          # AuthContext, WalletContext, PaymentContext
│   ├── pages/                            # Landing, RiderDashboard, CreatePayment, QR, PassengerPay, Success, History, Profile
│   ├── services/
│   │   ├── stellar.ts                    # Stellar SDK Horizon & Transaction builder
│   │   ├── soroban.ts                    # Soroban RPC client & contract interactions
│   │   ├── wallet.ts                     # Freighter & In-App testnet wallet engine
│   │   ├── rates.ts                      # Multi-currency exchange rate engine
│   │   └── supabase.ts                   # Supabase client & offline fallback store
│   ├── types/
│   │   └── okada.types.ts                # Full TypeScript type definitions
│   ├── App.tsx                           # Main router & state coordinator
│   └── main.tsx                          # App root
├── tailwind.config.js
├── vite.config.ts
└── tsconfig.json
```

---

## 🗄️ Database Schema & RLS

### Tables

1. **`profiles`**:
   - `id`: UUID (Primary Key, references `auth.users`)
   - `full_name`: Text
   - `phone_number`: Text
   - `wallet_address`: Text
   - `user_type`: Text (`rider` | `passenger`)
   - `currency_preference`: Text (`NGN`, `GHS`, `XOF`, `SLE`)
   - `created_at`: Timestamp

2. **`rides`**:
   - `id`: UUID (Primary Key)
   - `rider_id`: UUID (references `profiles.id`)
   - `passenger_id`: UUID (references `profiles.id`, nullable)
   - `amount_ngn`: Numeric
   - `settlement_amount`: Numeric (USDC)
   - `settlement_asset`: Text (`USDC`)
   - `currency`: Text (`NGN`)
   - `passenger_name`: Text
   - `ride_reference`: Text (Unique)
   - `status`: Text (`pending` | `completed` | `cancelled`)
   - `created_at`: Timestamp

3. **`payments`**:
   - `id`: UUID (Primary Key)
   - `ride_id`: UUID (references `rides.id`)
   - `payment_id`: Text (Unique, e.g. `PAY_OKD_8391`)
   - `rider_wallet_address`: Text
   - `passenger_wallet_address`: Text (nullable)
   - `amount`: Numeric
   - `asset`: Text (`USDC`)
   - `stellar_transaction_hash`: Text
   - `soroban_transaction_hash`: Text
   - `status`: Text (`pending` | `processing` | `completed` | `failed`)
   - `created_at`: Timestamp
   - `completed_at`: Timestamp

### Row Level Security (RLS) Policies
- Riders can only view and update their own rides and payments.
- Passengers can view payments associated with their payment request.
- Public read access for pending payment IDs enables quick passenger QR scans.

---

## 🦀 Soroban Smart Contract (Rust)

The contract is located in `contracts/okada_payment/src/lib.rs`.

### Contract Functions:
- `create_payment_request(env, payment_id, rider, amount, asset, ride_reference) -> Result<PaymentRecord, Error>`
- `process_payment(env, payment_id, passenger) -> Result<PaymentRecord, Error>`
- `confirm_payment(env, payment_id, stellar_tx_hash) -> Result<PaymentRecord, Error>`
- `get_payment(env, payment_id) -> Option<PaymentRecord>`
- `get_rider_payments(env, rider) -> Vec<PaymentRecord>`

### How to Build & Deploy the Contract

1. **Install Prerequisites**:
   ```bash
   rustup target add wasm32-unknown-unknown
   cargo install --locked stellar-cli --features opt
   ```

2. **Build & Optimize WASM**:
   ```bash
   cd contracts/okada_payment
   stellar contract build
   stellar contract optimize --wasm target/wasm32-unknown-unknown/release/okada_payment_contract.wasm
   ```

3. **Deploy to Stellar Testnet**:
   ```bash
   stellar keys generate --global okada-admin --network testnet
   stellar keys fund okada-admin --network testnet
   stellar contract deploy \
     --wasm target/wasm32-unknown-unknown/release/okada_payment_contract.optimized.wasm \
     --source okada-admin \
     --network testnet
   ```

4. **Set Contract ID in `.env`**:
   ```env
   VITE_SOROBAN_CONTRACT_ID="CA7Q2...YOUR_DEPLOYED_CONTRACT_ID..."
   ```

---

## 🚀 Running the Web Application

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Local Dev Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

3. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 🧪 Testing the Complete End-to-End Payment Flow

### Step 1: Rider Creates Payment
1. Open the app and click **"Launch Rider Mode"** (or log in as Musa).
2. On the **Rider Dashboard**, tap the large **"Request Payment"** button.
3. Enter the trip fare (e.g. ₦1,500 = 1.00 USDC) and click **"Generate Passenger QR Code"**.
4. The QR Code screen opens, displaying the live payment status.

### Step 2: Passenger Scans & Pays
- **Option A (Single-Device Demo)**: Click **"Simulate Instant Passenger Payment"** on the QR screen.
- **Option B (Two Tabs / Two Phones)**: Click **"Open Passenger View in Tab"** or scan the QR code.
- Click **"Pay ₦1,500 (1.00 USDC)"**. The app signs and broadcasts the transaction to the Stellar Testnet ledger and updates the Soroban contract.

### Step 3: Instant Confirmation
1. Both the rider screen and the passenger screen immediately receive the payment confirmation.
2. A digital ride receipt is presented with the **Stellar Transaction Hash**.
3. Click **"View on Stellar Expert Explorer"** to inspect the verified transaction on the public Testnet explorer!

---

## 🌐 Mainnet Migration Guide

To migrate OKADA from Stellar Testnet to Mainnet:
1. Update `.env`:
   ```env
   VITE_STELLAR_NETWORK="PUBLIC"
   VITE_STELLAR_HORIZON_URL="https://horizon.stellar.org"
   VITE_STELLAR_RPC_URL="https://mainnet.sorobanrpc.com"
   VITE_SOROBAN_CONTRACT_ID="<YOUR_MAINNET_SOROBAN_CONTRACT_ID>"
   ```
2. Deploy the compiled WASM to Mainnet using `--network pubnet`.
3. Configure your production Supabase database credentials.

---

## 📄 License
MIT License. Built for African mobility and financial inclusion on Stellar.
