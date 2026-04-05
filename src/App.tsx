import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import Layout from './components/Layout';
import LoanForm from './components/LoanForm';
import Login from './components/Login';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} onLogout={() => setIsAuthenticated(false)}>
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'loan' && <LoanForm onSuccess={() => setActiveTab('dashboard')} />}
    </Layout>
  );
}
