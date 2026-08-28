import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { RiderDashboardPage } from './pages/RiderDashboardPage';
import { CreatePaymentPage } from './pages/CreatePaymentPage';
import { QRPaymentPage } from './pages/QRPaymentPage';
import { PassengerPaymentPage } from './pages/PassengerPaymentPage';
import { PaymentSuccessPage } from './pages/PaymentSuccessPage';
import { TransactionHistoryPage } from './pages/TransactionHistoryPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';

export const App: React.FC = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [pageParams, setPageParams] = useState<any>({});

  // Check URL path on mount (for /pay/:paymentId QR scans)
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/pay/')) {
      const paymentId = path.replace('/pay/', '');
      if (paymentId) {
        setCurrentPage('passenger-pay');
        setPageParams({ paymentId });
      }
    } else if (user) {
      if (user.user_type === 'rider') {
        setCurrentPage('rider-dashboard');
      }
    }
  }, [user]);

  const handleNavigate = (page: string, params?: any) => {
    setCurrentPage(page);
    if (params) {
      setPageParams(params);
    }
    // Update browser history if applicable
    if (page === 'passenger-pay' && params?.paymentId) {
      window.history.pushState({}, '', `/pay/${params.paymentId}`);
    } else if (page === 'landing') {
      window.history.pushState({}, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} />;

      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;

      case 'signup':
        return <SignupPage onNavigate={handleNavigate} />;

      case 'rider-dashboard':
        return <RiderDashboardPage onNavigate={handleNavigate} />;

      case 'create-payment':
        return <CreatePaymentPage onNavigate={handleNavigate} />;

      case 'qr-payment':
        return (
          <QRPaymentPage
            paymentId={pageParams.paymentId || 'PAY_DEMO'}
            onNavigate={handleNavigate}
          />
        );

      case 'passenger-pay':
      case 'passenger-pay-direct':
        return (
          <PassengerPaymentPage
            paymentId={pageParams.paymentId || 'PAY_OKD_8391'}
            onNavigate={handleNavigate}
          />
        );

      case 'payment-success':
        return (
          <PaymentSuccessPage
            paymentId={pageParams.paymentId || ''}
            onNavigate={handleNavigate}
          />
        );

      case 'history':
        return <TransactionHistoryPage onNavigate={handleNavigate} />;

      case 'profile':
        return <ProfileSettingsPage onNavigate={handleNavigate} />;

      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar onNavigate={handleNavigate} currentPage={currentPage} />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto">
        {renderPage()}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav currentPage={currentPage} onNavigate={handleNavigate} />
    </div>
  );
};
