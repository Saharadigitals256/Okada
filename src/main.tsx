import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AuthProvider } from './context/AuthContext';
import { WalletProvider } from './context/WalletContext';
import { PaymentProvider } from './context/PaymentContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <WalletProvider>
        <PaymentProvider>
          <App />
        </PaymentProvider>
      </WalletProvider>
    </AuthProvider>
  </React.StrictMode>
);
