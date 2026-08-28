# OKADA Soroban Smart Contract

This directory contains the Soroban smart contract for the **OKADA** decentralized ride payment platform.

## Architecture

The contract manages ride payment lifecycle on Stellar:
1. `create_payment_request`: Rider sets fare and creates a pending payment state.
2. `process_payment`: Passenger connects wallet and starts processing.
3. `confirm_payment`: Commits the verified Stellar transaction hash and marks the ride payment completed.
4. `get_payment` & `get_rider_payments`: Inspect payment status and fetch historical ride receipts.

---

## Prerequisites

1. **Install Rust & Cargo**:
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   rustup target add wasm32-unknown-unknown
   ```

2. **Install Stellar CLI**:
   ```bash
   cargo install --locked stellar-cli --features opt
   ```

---

## Build & Test Contract

### 1. Run Contract Unit Tests
```bash
cd contracts/okada_payment
cargo test
```

### 2. Build Optimized WASM Bytecode
```bash
stellar contract build
```
This produces `target/wasm32-unknown-unknown/release/okada_payment_contract.wasm`.

### 3. Optimize the WASM binary
```bash
stellar contract optimize --wasm target/wasm32-unknown-unknown/release/okada_payment_contract.wasm
```

---

## Deploy to Stellar Testnet

### 1. Configure Stellar Testnet Identity
```bash
stellar keys generate --global okada-admin --network testnet
stellar keys fund okada-admin --network testnet
```

### 2. Deploy the Contract WASM
```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/okada_payment_contract.optimized.wasm \
  --source okada-admin \
  --network testnet
```

**Output:**
```
CA7Q2...YOUR_DEPLOYED_CONTRACT_ID...9KZL
```

### 3. Set Contract ID in Frontend `.env`
Copy the resulting Contract ID and paste it into your root `.env` file:
```env
VITE_SOROBAN_CONTRACT_ID="CA7Q2...YOUR_DEPLOYED_CONTRACT_ID...9KZL"
```

---

## Migration from Testnet to Mainnet

To move to Stellar Mainnet:
1. Change network flag from `--network testnet` to `--network pubnet` (or `mainnet`).
2. Provide a funded Mainnet source account.
3. Update `.env` variables:
   - `VITE_STELLAR_NETWORK=PUBLIC`
   - `VITE_STELLAR_HORIZON_URL=https://horizon.stellar.org`
   - `VITE_STELLAR_RPC_URL=https://mainnet.sorobanrpc.com`
   - `VITE_SOROBAN_CONTRACT_ID=<MAINNET_CONTRACT_ID>`
