import { AlertCircle, BookCheck, Clock, BarChart3 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../services/api';
import { Loan, Book } from '../types';
import { calculateFine, isOverdue } from '../utils/dateUtils';

export default function Dashboard() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [loansData, booksData] = await Promise.all([
        api.getLoans(),
        api.getBooks()
      ]);
      setLoans(Array.isArray(loansData) ? loansData : []);
      setBooks(Array.isArray(booksData) ? booksData : []);
    } catch (error) {
      console.error('Failed to fetch data', error);
      setLoans([]);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReturn = async (loan: Loan) => {
    const fine = isOverdue(loan.returnDate) ? calculateFine(loan.returnDate) : 0;
    if (fine > 0) {
      // Handled by modal
    }
    
    try {
      await api.returnBook(loan.id, loan.bookTitle, fine);
      fetchData(); // Refresh
    } catch (error) {
      console.error('Failed to return book', error);
    }
  };

  const [returnModal, setReturnModal] = useState<{isOpen: boolean, loan: Loan | null, fine: number}>({
    isOpen: false,
    loan: null,
    fine: 0
  });

  const confirmReturn = (loan: Loan) => {
    const fine = isOverdue(loan.returnDate) ? calculateFine(loan.returnDate) : 0;
    setReturnModal({ isOpen: true, loan, fine });
  };

  const executeReturn = async () => {
    if (!returnModal.loan) return;
    try {
      await api.returnBook(returnModal.loan.id, returnModal.loan.bookTitle, returnModal.fine);
      setReturnModal({ isOpen: false, loan: null, fine: 0 });
      fetchData();
    } catch (error) {
      console.error('Failed to return book', error);
    }
  };

  // Calculate category frequencies
  const getCategoryData = () => {
    const categoryCounts: Record<string, number> = {};
    
    loans.forEach(loan => {
      const book = books.find(b => b.title === loan.bookTitle);
      if (book && book.category) {
        categoryCounts[book.category] = (categoryCounts[book.category] || 0) + 1;
      } else {
        // Fallback if category is not found
        categoryCounts['Lain-lain'] = (categoryCounts['Lain-lain'] || 0) + 1;
      }
    });

    return Object.entries(categoryCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Sort descending by frequency
  };

  const categoryData = getCategoryData();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-800"></div>
      </div>
    );
  }

  const activeLoans = loans.filter(l => l.status === 'Aktif');
  const overdueLoans = activeLoans.filter(l => isOverdue(l.returnDate));
  const completedLoans = loans.filter(l => l.status === 'Selesai');

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center gap-5 transition-transform hover:scale-[1.01]">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
            <BookCheck className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Sedang Dipinjam</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{activeLoans.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center gap-5 transition-transform hover:scale-[1.01]">
          <div className="p-4 bg-red-50 text-red-600 rounded-xl">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Lewat Pulang</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{overdueLoans.length}</p>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-amber-50 text-amber-800 rounded-lg">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-slate-800">Kekerapan Pinjaman Mengikut Kategori</h3>
            <p className="text-sm text-slate-500">Statistik jenis buku yang paling kerap dipinjam oleh murid</p>
          </div>
        </div>
        
        {categoryData.length > 0 ? (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar 
                  dataKey="value" 
                  name="Jumlah Pinjaman" 
                  fill="#92400e" 
                  radius={[4, 4, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400">
            <BarChart3 className="w-12 h-12 mb-3 opacity-20" />
            <p>Tiada data pinjaman yang mencukupi untuk menjana graf.</p>
          </div>
        )}
      </div>

      {/* Active Loans Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-white flex justify-between items-center">
          <h3 className="font-semibold text-lg text-slate-800">Senarai Buku Sedang Dipinjam</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-sm border-b border-slate-200">
                <th className="px-6 py-4 font-medium">ID Pinjaman</th>
                <th className="px-6 py-4 font-medium">Nama Murid</th>
                <th className="px-6 py-4 font-medium">Kelas</th>
                <th className="px-6 py-4 font-medium">Tajuk Buku</th>
                <th className="px-6 py-4 font-medium">Tarikh Pulang</th>
                <th className="px-6 py-4 font-medium">Denda Semasa</th>
                <th className="px-6 py-4 font-medium text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeLoans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <BookCheck className="w-8 h-8 text-slate-300" />
                      <p>Tiada rekod pinjaman aktif.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                activeLoans.map((loan) => {
                  const overdue = isOverdue(loan.returnDate);
                  const currentFine = overdue ? calculateFine(loan.returnDate) : 0;

                  return (
                    <tr key={loan.id} className={`hover:bg-slate-50 transition-colors ${overdue ? 'bg-red-50/30' : ''}`}>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{loan.id}</td>
                      <td className="px-6 py-4 text-sm text-slate-700 font-medium">{loan.studentName}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{loan.studentClass}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{loan.bookTitle}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                          overdue ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-yellow-50 text-amber-800 border border-yellow-200'
                        }`}>
                          {overdue && <AlertCircle className="w-3.5 h-3.5" />}
                          {loan.returnDate}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                        {currentFine > 0 ? <span className="text-red-600">RM {currentFine.toFixed(2)}</span> : <span className="text-slate-400">-</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        <button
                          onClick={() => confirmReturn(loan)}
                          className="text-blue-600 hover:text-white font-medium bg-blue-50 hover:bg-blue-600 px-4 py-2 rounded-lg transition-all duration-200 shadow-sm"
                        >
                          Pulangkan
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Completed Loans Table (History) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-white flex justify-between items-center">
          <h3 className="font-semibold text-lg text-slate-800">Sejarah Peminjaman</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-sm border-b border-slate-200">
                <th className="px-6 py-4 font-medium">ID Pinjaman</th>
                <th className="px-6 py-4 font-medium">Nama Murid</th>
                <th className="px-6 py-4 font-medium">Kelas</th>
                <th className="px-6 py-4 font-medium">Tajuk Buku</th>
                <th className="px-6 py-4 font-medium">Tarikh Pinjam</th>
                <th className="px-6 py-4 font-medium">Tarikh Pulang</th>
                <th className="px-6 py-4 font-medium">Denda Dibayar</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {completedLoans.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <BookCheck className="w-8 h-8 text-slate-300" />
                      <p>Tiada rekod sejarah peminjaman.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                completedLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{loan.id}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 font-medium">{loan.studentName}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{loan.studentClass}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{loan.bookTitle}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{loan.startDate}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{loan.returnDate}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                      {loan.fine > 0 ? <span className="text-red-600">RM {loan.fine.toFixed(2)}</span> : <span className="text-slate-400">-</span>}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        Selesai
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Modal for Return Confirmation */}
      {returnModal.isOpen && returnModal.loan && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Pengesahan Pulangan Buku</h3>
            <div className="space-y-3 mb-6 text-sm text-slate-600">
              <p><span className="font-medium text-slate-700">Murid:</span> {returnModal.loan.studentName}</p>
              <p><span className="font-medium text-slate-700">Buku:</span> {returnModal.loan.bookTitle}</p>
              {returnModal.fine > 0 && (
                <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl">
                  <p className="text-red-800 font-medium flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Lewat Pulang! Denda Dikenakan.
                  </p>
                  <p className="text-2xl font-bold text-red-600 mt-2">RM {returnModal.fine.toFixed(2)}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setReturnModal({ isOpen: false, loan: null, fine: 0 })}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-medium rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={executeReturn}
                className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white font-medium rounded-lg shadow-sm transition-colors"
              >
                Sahkan Pulangan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
