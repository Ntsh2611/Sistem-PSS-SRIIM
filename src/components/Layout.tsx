import { BookOpen, LayoutDashboard, PlusCircle, LogOut } from 'lucide-react';
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export default function Layout({ children, activeTab, setActiveTab, onLogout }: LayoutProps) {
  const navItems = [
    { id: 'dashboard', label: 'Rekod Pinjaman Murid', icon: LayoutDashboard },
    { id: 'teacher-dashboard', label: 'Rekod Pinjaman Guru', icon: LayoutDashboard },
    { id: 'loan', label: 'Pinjaman Baru Murid', icon: PlusCircle },
    { id: 'teacher-loan', label: 'Pinjaman Baru Guru', icon: PlusCircle },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-900 text-white flex flex-col shadow-xl z-10">
        <div className="p-6 flex items-center gap-3 border-b border-neutral-800">
          <div className="bg-amber-900 p-2 rounded-lg">
            <BookOpen className="w-6 h-6 text-yellow-400" />
          </div>
          <h1 className="text-lg font-bold leading-tight tracking-wide">Pusat Sumber<br/><span className="text-yellow-400">SRI I Musleh</span></h1>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === item.id 
                    ? 'bg-amber-900 text-yellow-400 font-medium shadow-md' 
                    : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${activeTab === item.id ? 'text-yellow-400' : 'text-neutral-500'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 text-xs text-neutral-500 text-center border-t border-neutral-800">
          &copy; {new Date().getFullYear()} SRI I Musleh
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-neutral-200 px-8 py-5 flex justify-between items-center shrink-0 shadow-sm z-0">
          <h2 className="text-2xl font-semibold text-neutral-800 capitalize tracking-tight">
            {navItems.find(i => i.id === activeTab)?.label}
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold text-neutral-800 text-sm">Admin Perpustakaan</p>
              <p className="text-xs text-neutral-500">Pengawas PSS</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-yellow-100 border border-yellow-200 flex items-center justify-center text-amber-900 font-bold shadow-sm">
              A
            </div>
            <div className="w-px h-8 bg-neutral-200 mx-2"></div>
            <button 
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Log Keluar"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Log Keluar</span>
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8 bg-neutral-50/50">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
