import React, { useEffect, useState, useMemo } from 'react';
import { Trophy, Award, Medal, BookOpen, Star, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import { NilamRecord } from '../types';

export default function NilamDashboard() {
  const [loading, setLoading] = useState(true);
  const [nilamRecords, setNilamRecords] = useState<NilamRecord[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    const fetchNilam = async () => {
      setLoading(true);
      try {
        const records = await api.getNilamRecords();
        setNilamRecords(records);
      } catch (error) {
        console.error('Failed to fetch NILAM records', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNilam();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedClass]);

  // Compute unique classes for filter
  const classes = useMemo(() => {
    const classList = Array.from(new Set(nilamRecords.map(r => r.className).filter(Boolean)));
    return classList.sort();
  }, [nilamRecords]);

  // Compute unique months for filter from the pre-defined list
  const months = ['MAC', 'APRIL', 'MEI', 'JUN', 'JULAI', 'OGOS', 'SEPTEMBER', 'OKTOBER'];

  // Compute top 5 monthly (using monthlyData mapping instead of singular month string)
  const top5 = useMemo(() => {
    return [...nilamRecords].map(student => {
      // If a specific month is selected, compute score using that month ONLY
      // otherwise fallback to their overall total JUMLAH books
      const score = selectedMonth !== 'all' 
        ? (student.monthlyData[selectedMonth.toUpperCase()] || 0)
        : student.totalBooks;
      
      return {
        ...student,
        computedScore: score
      };
    }).filter(s => s.computedScore > 0) // only include those with actual scores
      .sort((a, b) => b.computedScore - a.computedScore)
      .slice(0, 5);
  }, [nilamRecords, selectedMonth]);

  // Filter valid student records for the table display
  const filteredRecords = useMemo(() => {
    return nilamRecords.filter(r => {
      const matchClass = selectedClass === 'all' || r.className === selectedClass;
      const matchSearch = r.studentName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchClass && matchSearch;
    }).sort((a, b) => a.studentName.localeCompare(b.studentName));
  }, [nilamRecords, selectedClass, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / ITEMS_PER_PAGE));
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-800"></div>
      </div>
    );
  }

  const getRankIcon = (index: number) => {
    switch(index) {
      case 0: return <Trophy className="w-6 h-6 text-yellow-400 drop-shadow-md" />;
      case 1: return <Medal className="w-6 h-6 text-slate-300 drop-shadow-md" />;
      case 2: return <Medal className="w-6 h-6 text-amber-700 drop-shadow-md" />;
      default: return <Star className="w-5 h-5 text-indigo-300" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-gradient-to-br from-indigo-800 to-purple-900 rounded-2xl shadow-lg p-6 md:p-8 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <Trophy className="w-8 h-8 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Leaderboard NILAM</h2>
              <p className="text-indigo-200">Top 5 Individu Tertinggi</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-indigo-200 font-medium text-sm">Pilih Bulan:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 bg-indigo-900/50 border border-indigo-400/30 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all text-white min-w-[120px] font-medium"
            >
              <option value="all">Semua Bulan</option>
              {months.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {top5.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {top5.map((student, index) => (
              <div 
                key={student.id} 
                className={`relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 flex flex-col items-center text-center transition-transform hover:scale-105 hover:bg-white/20 ${index === 0 ? 'ring-2 ring-yellow-400 shadow-yellow-400/20 shadow-xl md:-translate-y-4' : ''}`}
              >
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-black/30 rounded-full flex items-center justify-center font-bold text-sm border border-white/10">
                  #{index + 1}
                </div>
                <div className="mb-3">
                  {getRankIcon(index)}
                </div>
                <h3 className="font-bold text-sm line-clamp-3 leading-tight mb-1" title={student.studentName}>{student.studentName}</h3>
                <p className="text-xs text-indigo-200 mb-3">{student.className}</p>
                <div className="mt-auto px-4 py-1.5 bg-black/20 rounded-full flex items-center justify-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="font-bold text-lg text-yellow-400">{student.computedScore}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/10 p-8 rounded-xl text-center backdrop-blur-sm border border-white/20">
            <p>Tiada data NILAM buat masa ini.</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-200 bg-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-xl text-slate-800">Senarai Rekod NILAM Murid</h3>
              <p className="text-sm text-slate-500 mt-1">Tapisan mengikut kelas dan nama</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative min-w-[200px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Cari nama murid..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600 outline-none transition-all bg-slate-50 hover:bg-white text-sm"
                />
              </div>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600 outline-none transition-all bg-slate-50 hover:bg-white text-sm font-medium text-slate-700 min-w-[150px]"
              >
                <option value="all">Semua Kelas</option>
                {classes.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                <th className="px-6 py-4 font-semibold w-16 text-center">No.</th>
                <th className="px-6 py-4 font-semibold">Nama Murid</th>
                <th className="px-6 py-4 font-semibold">Kelas</th>
                <th className="px-6 py-4 font-semibold text-center">Rekod Bulanan</th>
                <th className="px-6 py-4 font-semibold text-right">Jumlah Bacaan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Star className="w-8 h-8 text-slate-300" />
                      <p>Tiada rekod NILAM dijumpai bagi tapisan ini.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((record, index) => (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-500 text-center font-medium">
                      {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {record.studentName}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-800">
                        {record.className}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {Object.entries(record.monthlyData).map(([m, count]) => (
                          <span key={m} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-600 border border-indigo-100" title={`${m}: ${count} buku`}>
                            {m.slice(0, 3)}: {count}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <span className="text-lg font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                          {record.totalBooks}
                        </span>
                        <Award className={`w-5 h-5 ${record.totalBooks >= 40 ? 'text-yellow-500' : 'text-slate-300'}`} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {filteredRecords.length > ITEMS_PER_PAGE && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
            <span className="text-sm text-slate-500">
              Memaparkan <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> hingga <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredRecords.length)}</span> daripada <span className="font-medium">{filteredRecords.length}</span> rekod
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Halaman Seterusnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
