import { Search, CheckCircle2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Book, Student } from '../types';

export default function LoanForm({ onSuccess, ppssId }: { onSuccess: () => void, ppssId: string }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  
  const defaultReturn = new Date();
  defaultReturn.setDate(defaultReturn.getDate() + 7);
  const [returnDate, setReturnDate] = useState(defaultReturn.toISOString().split('T')[0]);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [studentsData, booksData] = await Promise.all([
          api.getStudents(),
          api.getBooks()
        ]);
        setStudents(Array.isArray(studentsData) ? studentsData : []);
        setBooks(Array.isArray(booksData) ? booksData : []);
      } catch (error) {
        console.error('Error fetching data', error);
        setStudents([]);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredStudents = students.filter(s => s.className === selectedClass);
  const availableClasses = Array.from(new Set(students.map(s => s.className)))
    .filter((c): c is string => typeof c === 'string' && c !== 'undefined' && c.trim() !== '')
    .sort();
  const searchResults = searchQuery 
    ? books.filter(b => 
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.author && b.author.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (b.id && b.id.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedBook || !startDate || !returnDate) {
      // Custom error handling instead of alert
      return;
    }

    const studentObj = students.find(s => s.id === selectedStudent);
    if (!studentObj) return;

    setSubmitting(true);
    try {
      await api.createLoan({
        studentName: studentObj.name,
        studentClass: studentObj.className,
        bookTitle: selectedBook.title,
        startDate,
        returnDate,
        ppssId
      });
      
      setSuccessMessage(true);
      setTimeout(() => {
        setSuccessMessage(false);
        onSuccess();
      }, 2000);
      
    } catch (error) {
      console.error('Error creating loan', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-800"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden max-w-3xl mx-auto">
      <div className="px-8 py-6 border-b border-slate-200 bg-white">
        <h3 className="font-bold text-xl text-slate-800">Borang Pinjaman Baru</h3>
        <p className="text-sm text-slate-500 mt-1">Sila lengkapkan butiran di bawah untuk merekod pinjaman buku.</p>
      </div>
      
      {successMessage && (
        <div className="mx-8 mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-3 text-amber-800">
          <CheckCircle2 className="w-5 h-5 text-amber-600" />
          <p className="font-medium">Pinjaman berjaya direkodkan!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        {/* Student Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2.5">
            <label className="block text-sm font-semibold text-slate-700">Kelas</label>
            <select 
              value={selectedClass} 
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedStudent('');
              }}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-slate-50 hover:bg-white"
            >
              <option value="">-- Pilih Kelas --</option>
              {availableClasses.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2.5">
            <label className="block text-sm font-semibold text-slate-700">Nama Murid</label>
            <select 
              value={selectedStudent} 
              onChange={(e) => setSelectedStudent(e.target.value)}
              disabled={!selectedClass}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:border-amber-600 outline-none transition-all bg-slate-50 hover:bg-white disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              <option value="">-- Pilih Murid --</option>
              {filteredStudents.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Book Selection */}
        <div className="space-y-2.5">
          <label className="block text-sm font-semibold text-slate-700">Carian Buku</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Taip tajuk buku untuk mencari..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (selectedBook && e.target.value !== selectedBook.title) {
                  setSelectedBook(null);
                }
              }}
              className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:border-amber-600 outline-none transition-all bg-slate-50 hover:bg-white"
            />
          </div>
          
          {searchQuery && !selectedBook && (
            <div className="mt-2 border border-slate-200 rounded-xl max-h-60 overflow-y-auto bg-white shadow-xl absolute z-20 w-full max-w-[calc(100%-4rem)] md:max-w-[calc(48rem-4rem)]">
              {searchResults.length === 0 ? (
                <div className="p-6 text-sm text-slate-500 text-center">Tiada buku dijumpai.</div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {searchResults.map(book => {
                    const isAvailable = !book.status || book.status.trim().toLowerCase() !== 'dipinjam';
                    return (
                      <li key={book.id}>
                        <button
                          type="button"
                          disabled={!isAvailable}
                          onClick={() => {
                            if (isAvailable) {
                              setSelectedBook(book);
                              setSearchQuery(book.title);
                            }
                          }}
                          className={`w-full text-left px-5 py-4 flex justify-between items-center group transition-colors ${
                            isAvailable 
                              ? 'hover:bg-amber-50 cursor-pointer' 
                              : 'opacity-60 cursor-not-allowed bg-slate-50'
                          }`}
                        >
                          <div>
                            <p className={`font-semibold transition-colors ${isAvailable ? 'text-slate-800 group-hover:text-amber-800' : 'text-slate-500'}`}>
                              {book.title}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">{book.author} &bull; {book.category}</p>
                          </div>
                          <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                            isAvailable 
                              ? 'text-amber-900 bg-yellow-400' 
                              : 'text-red-700 bg-red-100'
                          }`}>
                            {isAvailable ? 'Pilih' : 'Dipinjam'}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
          <div className="space-y-2.5">
            <label className="block text-sm font-semibold text-slate-700">Tarikh Pinjam</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:border-amber-600 outline-none transition-all bg-slate-50 hover:bg-white"
            />
          </div>
          <div className="space-y-2.5">
            <label className="block text-sm font-semibold text-slate-700">Tarikh Pulang</label>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:border-amber-600 outline-none transition-all bg-slate-50 hover:bg-white"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-8 flex justify-end">
          <button
            type="submit"
            disabled={submitting || !selectedStudent || !selectedBook || successMessage}
            className="bg-amber-800 hover:bg-amber-900 text-white font-semibold py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Menyimpan...
              </>
            ) : (
              'Rekod Pinjaman'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
