import React, { useState } from 'react';
import { Lock, ArrowRight } from 'lucide-react';
import { bgImage, logoImage } from '../assets/images';

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'pssriim0001') {
      onLogin();
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden bg-amber-950">
      <img 
        src={bgImage} 
        alt="Background" 
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-90"
      />
      <div className="absolute inset-0 bg-black/30 z-0"></div>
      
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-amber-900/20 overflow-hidden relative z-10">
        <div className="bg-amber-900 p-8 text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-white rounded-2xl p-2 shadow-lg flex items-center justify-center">
            <img src={logoImage} alt="Logo SRIIM" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-white">Sistem PSS SRIIM</h1>
          <p className="text-yellow-100 mt-2 text-sm">Sila masukkan kata laluan untuk log masuk</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-neutral-800">Kata Laluan</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-neutral-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                placeholder="Masukkan kata laluan..."
                className={`w-full pl-11 pr-4 py-3 border rounded-xl outline-none transition-all ${
                  error 
                    ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                    : 'border-neutral-300 focus:ring-2 focus:ring-amber-600 focus:border-amber-600 bg-neutral-50 hover:bg-white'
                }`}
                autoFocus
              />
            </div>
            {error && (
              <p className="text-sm text-red-500 font-medium mt-2">Kata laluan tidak sah. Sila cuba lagi.</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-amber-950 font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            Log Masuk
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>
      <p className="text-white/80 text-sm mt-8 relative z-10 font-medium drop-shadow-md">&copy; {new Date().getFullYear()} Pusat Sumber SRI I Musleh</p>
    </div>
  );
}
