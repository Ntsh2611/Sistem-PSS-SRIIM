import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import TeacherDashboard from './components/TeacherDashboard';
import NilamDashboard from './components/NilamDashboard';
import Layout from './components/Layout';
import LoanForm from './components/LoanForm';
import TeacherLoanForm from './components/TeacherLoanForm';
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
      {activeTab === 'teacher-dashboard' && <TeacherDashboard />}
      {activeTab === 'nilam' && <NilamDashboard />}
      {activeTab === 'loan' && <LoanForm onSuccess={() => setActiveTab('dashboard')} />}
      {activeTab === 'teacher-loan' && <TeacherLoanForm onSuccess={() => setActiveTab('teacher-dashboard')} />}
    </Layout>
  );
}
