import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import TeacherDashboard from './components/TeacherDashboard';
import NilamDashboard from './components/NilamDashboard';
import Layout from './components/Layout';
import LoanForm from './components/LoanForm';
import TeacherLoanForm from './components/TeacherLoanForm';
import Login from './components/Login';
import { User } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);

  if (!user) {
    return <Login onLogin={(user) => setUser(user)} />;
  }

  return (
    <Layout user={user} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={() => setUser(null)}>
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'teacher-dashboard' && <TeacherDashboard />}
      {activeTab === 'nilam' && <NilamDashboard />}
      {activeTab === 'loan' && <LoanForm ppssId={user.id} onSuccess={() => setActiveTab('dashboard')} />}
      {activeTab === 'teacher-loan' && <TeacherLoanForm ppssId={user.id} onSuccess={() => setActiveTab('teacher-dashboard')} />}
    </Layout>
  );
}
