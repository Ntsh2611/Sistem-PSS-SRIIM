import { Book, Loan, Student, Teacher } from '../types';

// Replace this with your deployed Google Apps Script Web App URL
const GAS_URL = import.meta.env.VITE_GAS_URL || 'https://script.google.com/macros/s/AKfycbwAF2pQMt5H6qvCY5r1NEzQI5HIiAcCdjSTg9Z6wEOLWSREl35NsJSs66bcerwe3Vofsw/exec';

// Mock data for development when GAS_URL is not set
const MOCK_BOOKS: Book[] = [
  { id: 'B001', title: 'Sejarah Islam', author: 'Ahmad Zaki', category: 'Agama', status: 'Tersedia' },
  { id: 'B002', title: 'Sains Tahun 4', author: 'KPM', category: 'Akademik', status: 'Tersedia' },
  { id: 'B003', title: 'Kisah Nabi Muhammad', author: 'Ustaz Don', category: 'Agama', status: 'Dipinjam' },
  { id: 'B004', title: 'Matematik Tahun 6', author: 'KPM', category: 'Akademik', status: 'Tersedia' },
];

const MOCK_STUDENTS: Student[] = [
  { id: 'M001', name: 'Ali bin Abu', className: 'Tahun 1' },
  { id: 'M002', name: 'Siti Nurhaliza', className: 'Tahun 4' },
  { id: 'M003', name: 'Ahmad Albab', className: 'Tahun 6' },
  { id: 'M004', name: 'Fatimah Az-Zahra', className: 'Tahun 1' },
];

const MOCK_TEACHERS: Teacher[] = [
  { id: 'G001', name: 'Cikgu Aminah', subject: 'Sains' },
  { id: 'G002', name: 'Ustaz Don', subject: 'Pendidikan Islam' },
];

let MOCK_LOANS: Loan[] = [
  {
    id: 'P001',
    studentName: 'Ahmad Albab',
    studentClass: 'Tahun 6',
    bookTitle: 'Kisah Nabi Muhammad',
    startDate: '2026-03-20',
    returnDate: '2026-03-27',
    status: 'Aktif',
    fine: 0
  }
];

let MOCK_TEACHER_LOANS: Loan[] = [
  {
    id: 'G001',
    studentName: 'Cikgu Aminah',
    studentClass: 'Sains',
    bookTitle: 'Sains Tahun 4',
    startDate: '2026-03-15',
    returnDate: '2026-04-15',
    status: 'Aktif',
    fine: 0
  }
];

export const api = {
  async getBooks(): Promise<Book[]> {
    if (!GAS_URL) return [...MOCK_BOOKS];
    const res = await fetch(`${GAS_URL}?action=getBooks`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return Array.isArray(data) ? data.map((b, i) => ({
      ...b, 
      id: b.id || b.ID_BUKU || b.ID || `book-${i}`,
      title: b.title || b.TAJUK || b.Tajuk || 'Tanpa Tajuk',
      author: b.author || b.PENGARANG || b.Pengarang || '',
      category: b.category || b.KATEGORI || b.Kategori || '',
      status: b.status || b.STATUS || b.Status || 'Tersedia'
    })) : [];
  },

  async getStudents(): Promise<Student[]> {
    if (!GAS_URL) return [...MOCK_STUDENTS];
    const res = await fetch(`${GAS_URL}?action=getStudents`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return Array.isArray(data) ? data.map((s, i) => ({
      ...s, 
      id: s.id || s.ID_MURID || s.ID || `student-${i}`,
      name: s.name || s['NAMA '] || s.NAMA || s.Nama || 'Tanpa Nama',
      className: s.className || s.KELAS || s.Kelas || ''
    })) : [];
  },

  async getTeachers(): Promise<Teacher[]> {
    if (!GAS_URL) return [...MOCK_TEACHERS];
    const res = await fetch(`${GAS_URL}?action=getTeachers`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return Array.isArray(data) ? data.map((t, i) => ({
      ...t, 
      id: t.id || t.ID || `teacher-${i}`,
      name: t.name || t.Name || t.NAMA || t.Nama || 'Tanpa Nama',
      subject: t.subject || t.Subject || t.SUBJEK || t.Subjek || ''
    })) : [];
  },

  async getLoans(): Promise<Loan[]> {
    if (!GAS_URL) return [...MOCK_LOANS];
    const res = await fetch(`${GAS_URL}?action=getLoans`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return Array.isArray(data) ? data.map((l, i) => ({
      ...l, 
      id: l.id || l['ID PINJAM'] || l.ID || `loan-${i}`,
      studentName: l.studentName || l['NAMA MURID'] || l.NAMA || l.Nama || '',
      studentClass: l.studentClass || l.KELAS || l.Kelas || '',
      bookTitle: l.bookTitle || l['TAJUK BUKU'] || l.TAJUK || '',
      startDate: (l.startDate || l['TARIKH PINJAM'] || '').toString().split('T')[0],
      returnDate: (l.returnDate || l['TARIKH PULANG'] || '').toString().split('T')[0],
      status: l.status || l['STATUS PINJAMAN'] || l.STATUS || 'Aktif',
      fine: Number(l.fine || l.DENDA || 0)
    })) : [];
  },

  async createLoan(payload: Omit<Loan, 'id' | 'status' | 'fine'>): Promise<{ success: boolean; id?: string }> {
    if (!GAS_URL) {
      const newLoan: Loan = {
        ...payload,
        id: `P${Date.now()}`,
        status: 'Aktif',
        fine: 0
      };
      MOCK_LOANS.push(newLoan);
      const bookIndex = MOCK_BOOKS.findIndex(b => b.title === payload.bookTitle);
      if (bookIndex > -1) MOCK_BOOKS[bookIndex].status = 'Dipinjam';
      return { success: true, id: newLoan.id };
    }

    const res = await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'createLoan', payload }),
    });
    return res.json();
  },

  async returnBook(loanId: string, bookTitle: string, fine: number): Promise<{ success: boolean }> {
    if (!GAS_URL) {
      const loanIndex = MOCK_LOANS.findIndex(l => l.id === loanId);
      if (loanIndex > -1) {
        MOCK_LOANS[loanIndex].status = 'Selesai';
        MOCK_LOANS[loanIndex].fine = fine;
      }
      const bookIndex = MOCK_BOOKS.findIndex(b => b.title === bookTitle);
      if (bookIndex > -1) MOCK_BOOKS[bookIndex].status = 'Tersedia';
      return { success: true };
    }

    const res = await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'returnBook', payload: { loanId, bookTitle, fine } }),
    });
    return res.json();
  },

  async getTeacherLoans(): Promise<Loan[]> {
    if (!GAS_URL) return [...MOCK_TEACHER_LOANS];
    const res = await fetch(`${GAS_URL}?action=getTeacherLoans`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return Array.isArray(data) ? data.map((l, i) => ({
      ...l, 
      id: l.id || l['ID PINJAM'] || l.ID || `tloan-${i}`,
      studentName: l.studentName || l['NAMA GURU'] || l.NAMA || '',
      studentClass: l.studentClass || l.KELAS || l.Kelas || '',
      bookTitle: l.bookTitle || l['TAJUK BUKU'] || l.TAJUK || '',
      startDate: (l.startDate || l['TARIKH PINJAM'] || '').toString().split('T')[0],
      returnDate: (l.returnDate || l['TARIKH PULANG'] || '').toString().split('T')[0],
      status: l.status || l['STATUS PINJAMAN'] || l.STATUS || 'Aktif',
      fine: Number(l.fine || l.DENDA || 0)
    })) : [];
  },

  async createTeacherLoan(payload: Omit<Loan, 'id' | 'status' | 'fine'>): Promise<{ success: boolean; id?: string }> {
    if (!GAS_URL) {
      const newLoan: Loan = {
        ...payload,
        id: `G${Date.now()}-${Math.floor(Math.random()*1000)}`,
        status: 'Aktif',
        fine: 0
      };
      MOCK_TEACHER_LOANS.push(newLoan);
      return { success: true, id: newLoan.id };
    }

    const res = await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'createTeacherLoan', payload }),
    });
    return res.json();
  },

  async returnTeacherBook(loanId: string, fine: number): Promise<{ success: boolean }> {
    if (!GAS_URL) {
      const loanIndex = MOCK_TEACHER_LOANS.findIndex(l => l.id === loanId);
      if (loanIndex > -1) {
        MOCK_TEACHER_LOANS[loanIndex].status = 'Selesai';
        MOCK_TEACHER_LOANS[loanIndex].fine = fine;
      }
      return { success: true };
    }

    const res = await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'returnTeacherBook', payload: { loanId, fine } }),
    });
    return res.json();
  }
};
