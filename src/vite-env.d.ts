/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STELLAR_NETWORK?: string;
  readonly VITE_STELLAR_HORIZON_URL?: string;
  readonly VITE_STELLAR_RPC_URL?: string;
  readonly VITE_SOROBAN_CONTRACT_ID?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
