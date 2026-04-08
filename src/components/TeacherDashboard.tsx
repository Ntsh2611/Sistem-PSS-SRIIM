import { AlertCircle, BookCheck, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Loan } from '../types';
import { calculateFine, isOverdue } from '../utils/dateUtils';

export default function TeacherDashboard() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await api.getTeacherLoans();
      setLoans(data);
    } catch (error) {
      console.error('Failed to fetch data', error);
      setLoans([]);
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setLoans(prev => prev.map(l => l.id === loan.id ? { ...l, status: 'Selesai', fine } : l));
    } catch (error) {
      console.error('Failed to return book', error);
    }
  };

  const [returnModal, setReturnModal] = useState<{isOpen: boolean, loan: Loan | null, fine: number}>({
    isOpen: false,
    loan: null,
    fine: 0
  });

  const [activePage, setActivePage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  const confirmReturn = (loan: Loan) => {
    const fine = isOverdue(loan.returnDate) ? calculateFine(loan.returnDate) : 0;
    setReturnModal({ isOpen: true, loan, fine });
  };

  const executeReturn = async () => {
    if (!returnModal.loan) return;
    try {
      await api.returnTeacherBook(returnModal.loan.id, returnModal.fine);
      setReturnModal({ isOpen: false, loan: null, fine: 0 });
      fetchData();
    } catch (error) {
      console.error('Failed to return book', error);
    }
  };

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

  const totalActivePages = Math.max(1, Math.ceil(activeLoans.length / ITEMS_PER_PAGE));
  const paginatedActiveLoans = activeLoans.slice((activePage - 1) * ITEMS_PER_PAGE, activePage * ITEMS_PER_PAGE);

  const totalHistoryPages = Math.max(1, Math.ceil(completedLoans.length / ITEMS_PER_PAGE));
  const paginatedCompletedLoans = completedLoans.slice((historyPage - 1) * ITEMS_PER_PAGE, historyPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center gap-5 transition-transform hover:scale-[1.01]">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
            <BookCheck className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Sedang Dipinjam (Guru)</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{activeLoans.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center gap-5 transition-transform hover:scale-[1.01]">
          <div className="p-4 bg-red-50 text-red-600 rounded-xl">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Lewat Pulang (Guru)</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{overdueLoans.length}</p>
          </div>
        </div>
      </div>

      {/* Active Loans Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-white flex justify-between items-center">
          <h3 className="font-semibold text-lg text-slate-800">Senarai Buku Sedang Dipinjam (Guru)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-sm border-b border-slate-200">
                <th className="px-6 py-4 font-medium">ID Pinjaman</th>
                <th className="px-6 py-4 font-medium">Nama Guru</th>
                <th className="px-6 py-4 font-medium">Jawatan/Subjek</th>
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
                      <p>Tiada rekod pinjaman aktif untuk guru.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedActiveLoans.map((loan) => {
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
        {activeLoans.length > ITEMS_PER_PAGE && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
            <span className="text-sm text-slate-500">
              Memaparkan <span className="font-medium">{(activePage - 1) * ITEMS_PER_PAGE + 1}</span> hingga <span className="font-medium">{Math.min(activePage * ITEMS_PER_PAGE, activeLoans.length)}</span> daripada <span className="font-medium">{activeLoans.length}</span> rekod
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setActivePage(p => Math.max(1, p - 1))}
                disabled={activePage === 1}
                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActivePage(p => Math.min(totalActivePages, p + 1))}
                disabled={activePage === totalActivePages}
                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Completed Loans Table (History) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-white flex justify-between items-center">
          <h3 className="font-semibold text-lg text-slate-800">Sejarah Peminjaman Guru</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-sm border-b border-slate-200">
                <th className="px-6 py-4 font-medium">ID Pinjaman</th>
                <th className="px-6 py-4 font-medium">Nama Guru</th>
                <th className="px-6 py-4 font-medium">Jawatan/Subjek</th>
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
                      <p>Tiada rekod sejarah peminjaman guru.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedCompletedLoans.map((loan) => (
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
        {completedLoans.length > ITEMS_PER_PAGE && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
            <span className="text-sm text-slate-500">
              Memaparkan <span className="font-medium">{(historyPage - 1) * ITEMS_PER_PAGE + 1}</span> hingga <span className="font-medium">{Math.min(historyPage * ITEMS_PER_PAGE, completedLoans.length)}</span> daripada <span className="font-medium">{completedLoans.length}</span> rekod
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                disabled={historyPage === 1}
                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setHistoryPage(p => Math.min(totalHistoryPages, p + 1))}
                disabled={historyPage === totalHistoryPages}
                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Custom Modal for Return Confirmation */}
      {returnModal.isOpen && returnModal.loan && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Pengesahan Pulangan Buku (Guru)</h3>
            <div className="space-y-3 mb-6 text-sm text-slate-600">
              <p><span className="font-medium text-slate-700">Guru:</span> {returnModal.loan.studentName}</p>
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
