import { Search, CheckCircle2, X, PlusCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Book, Teacher } from '../types';

const SUBJECTS = [
  'Bahasa Melayu',
  'Bahasa Inggeris',
  'Matematik',
  'Sains',
  'Pendidikan Islam',
  'Sejarah',
  'Reka Bentuk & Teknologi (RBT)'
];

export default function TeacherLoanForm({ onSuccess }: { onSuccess: () => void }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  
  const [teacherName, setTeacherName] = useState('');
  const [subjectSearchQuery, setSubjectSearchQuery] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooks, setSelectedBooks] = useState<Book[]>([]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  
  const defaultReturn = new Date();
  defaultReturn.setMonth(defaultReturn.getMonth() + 10); // Teachers get 10 months
  const [returnDate, setReturnDate] = useState(defaultReturn.toISOString().split('T')[0]);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [booksData, teachersData] = await Promise.all([
          api.getBooks(),
          api.getTeachers()
        ]);
        setBooks(Array.isArray(booksData) ? booksData : []);
        setTeachers(Array.isArray(teachersData) ? teachersData : []);
      } catch (error) {
        console.error('Error fetching data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredSubjects = subjectSearchQuery
    ? SUBJECTS.filter(s => s.toLowerCase().includes(subjectSearchQuery.toLowerCase()))
    : [];

  const handleAddSubject = (s: string) => {
    if (selectedSubjects.length >= 10) {
      alert("Maksimum 10 subjek sahaja dibenarkan.");
      return;
    }
    if (!selectedSubjects.includes(s)) {
      setSelectedSubjects([...selectedSubjects, s]);
    }
    setSubjectSearchQuery('');
  };

  const handleRemoveSubject = (s: string) => {
    setSelectedSubjects(selectedSubjects.filter(item => item !== s));
  };

  const searchResults = searchQuery 
    ? books.filter(b => 
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.author && b.author.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  const handleAddBook = (book: Book) => {
    if (selectedBooks.length >= 14) {
      alert("Maksimum 14 buah buku sahaja dibenarkan untuk satu pinjaman.");
      return;
    }
    if (!selectedBooks.find(b => b.id === book.id)) {
      setSelectedBooks([...selectedBooks, book]);
    }
    setSearchQuery('');
  };

  const handleRemoveBook = (bookId: string) => {
    setSelectedBooks(selectedBooks.filter(b => b.id !== bookId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName || selectedSubjects.length === 0 || selectedBooks.length === 0 || !startDate || !returnDate) {
      return;
    }

    setSubmitting(true);
    try {
      const subjectsString = selectedSubjects.join(', ');
      await Promise.all(selectedBooks.map(book => 
        api.createTeacherLoan({
          studentName: teacherName,
          studentClass: subjectsString,
          bookTitle: book.title,
          startDate,
          returnDate
        })
      ));
      
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
        <h3 className="font-bold text-xl text-slate-800">Borang Pinjaman Guru</h3>
        <p className="text-sm text-slate-500 mt-1">Sila lengkapkan butiran di bawah untuk merekod pinjaman buku guru.</p>
      </div>
      
      {successMessage && (
        <div className="mx-8 mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-3 text-amber-800">
          <CheckCircle2 className="w-5 h-5 text-amber-600" />
          <p className="font-medium">Pinjaman berjaya direkodkan!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2.5">
            <label className="block text-sm font-semibold text-slate-700">Nama Guru</label>
            <select 
              value={teacherName}
              onChange={(e) => {
                setTeacherName(e.target.value);
                const selectedTeacher = teachers.find(t => t.name === e.target.value);
                if (selectedTeacher && selectedTeacher.subject) {
                  // If teacher has a subject in data, add it if not already there
                  if (!selectedSubjects.includes(selectedTeacher.subject)) {
                    setSelectedSubjects(prev => [...prev, selectedTeacher.subject!].slice(0, 10));
                  }
                }
              }}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:border-amber-600 outline-none transition-all bg-slate-50 hover:bg-white"
              required
            >
              <option value="">-- Pilih Guru --</option>
              {teachers.map(t => (
                <option key={t.id} value={t.name}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2.5">
            <label className="block text-sm font-semibold text-slate-700">Subjek Diajar (Maksimum 10)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Cari subjek..."
                value={subjectSearchQuery}
                onChange={(e) => setSubjectSearchQuery(e.target.value)}
                disabled={selectedSubjects.length >= 10}
                className="w-full pl-11 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:border-amber-600 outline-none transition-all bg-slate-50 hover:bg-white disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
            </div>
            
            {subjectSearchQuery && (
              <div className="mt-1 border border-slate-200 rounded-xl max-h-48 overflow-y-auto bg-white shadow-lg absolute z-30 w-full max-w-[calc(100%-4rem)] md:max-w-[calc(24rem-4rem)]">
                {filteredSubjects.length === 0 ? (
                  <div className="p-4 text-sm text-slate-500 text-center">Tiada subjek dijumpai.</div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {filteredSubjects.map(s => {
                      const isSelected = selectedSubjects.includes(s);
                      return (
                        <li key={s}>
                          <button
                            type="button"
                            disabled={isSelected}
                            onClick={() => handleAddSubject(s)}
                            className={`w-full text-left px-4 py-3 flex justify-between items-center group transition-colors ${
                              !isSelected ? 'hover:bg-amber-50 cursor-pointer' : 'opacity-50 cursor-not-allowed bg-slate-50'
                            }`}
                          >
                            <span className="text-sm font-medium text-slate-800">{s}</span>
                            {!isSelected && <PlusCircle className="w-4 h-4 text-amber-600" />}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}

            {selectedSubjects.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedSubjects.map(s => (
                  <span key={s} className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-full border border-amber-200">
                    {s}
                    <button type="button" onClick={() => handleRemoveSubject(s)} className="hover:text-red-600">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2.5">
          <label className="block text-sm font-semibold text-slate-700">Carian Buku (Maksimum 14)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Taip tajuk buku untuk mencari..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={selectedBooks.length >= 14}
              className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:border-amber-600 outline-none transition-all bg-slate-50 hover:bg-white disabled:bg-slate-100 disabled:cursor-not-allowed"
            />
          </div>
          
          {searchQuery && (
            <div className="mt-2 border border-slate-200 rounded-xl max-h-60 overflow-y-auto bg-white shadow-xl absolute z-20 w-full max-w-[calc(100%-4rem)] md:max-w-[calc(48rem-4rem)]">
              {searchResults.length === 0 ? (
                <div className="p-6 text-sm text-slate-500 text-center">Tiada buku dijumpai.</div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {searchResults.map(book => {
                    const isSelected = selectedBooks.some(b => b.id === book.id);
                    return (
                      <li key={book.id}>
                        <button
                          type="button"
                          disabled={isSelected}
                          onClick={() => handleAddBook(book)}
                          className={`w-full text-left px-5 py-4 flex justify-between items-center group transition-colors ${
                            !isSelected 
                              ? 'hover:bg-amber-50 cursor-pointer' 
                              : 'opacity-50 cursor-not-allowed bg-slate-50'
                          }`}
                        >
                          <div>
                            <p className={`font-semibold transition-colors ${!isSelected ? 'text-slate-800 group-hover:text-amber-800' : 'text-slate-500'}`}>
                              {book.title}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">{book.author} &bull; {book.category}</p>
                          </div>
                          <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                            !isSelected 
                              ? 'text-amber-900 bg-yellow-400' 
                              : 'text-slate-500 bg-slate-200'
                          }`}>
                            {isSelected ? 'Telah Dipilih' : 'Pilih'}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          {selectedBooks.length > 0 && (
            <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <p className="text-sm font-medium text-slate-700 mb-3">Buku Terpilih ({selectedBooks.length}/14):</p>
              <ul className="space-y-2">
                {selectedBooks.map(book => (
                  <li key={book.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                    <span className="text-sm font-medium text-slate-800">{book.title}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveBook(book.id)}
                      className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
          <div className="space-y-2.5">
            <label className="block text-sm font-semibold text-slate-700">Tarikh Pinjam</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:border-amber-600 outline-none transition-all bg-slate-50 hover:bg-white"
              required
            />
          </div>
          <div className="space-y-2.5">
            <label className="block text-sm font-semibold text-slate-700">Tarikh Pulang</label>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:border-amber-600 outline-none transition-all bg-slate-50 hover:bg-white"
              required
            />
          </div>
        </div>

        <div className="pt-8 flex justify-end">
          <button
            type="submit"
            disabled={submitting || !teacherName || selectedSubjects.length === 0 || selectedBooks.length === 0 || successMessage}
            className="bg-amber-800 hover:bg-amber-900 text-white font-semibold py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Menyimpan...
              </>
            ) : (
              'Rekod Pinjaman Guru'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
