import { Book, Loan, Student } from '../types';

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

export const api = {
  async getBooks(): Promise<Book[]> {
    if (!GAS_URL) return [...MOCK_BOOKS];
    const res = await fetch(`${GAS_URL}?action=getBooks`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return Array.isArray(data) ? data.map((b, i) => ({
      ...b, 
      id: b.id && b.id !== 'undefined' && b.id !== '' ? b.id : `book-${i}`
    })) : [];
  },

  async getStudents(): Promise<Student[]> {
    if (!GAS_URL) return [...MOCK_STUDENTS];
    const res = await fetch(`${GAS_URL}?action=getStudents`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return Array.isArray(data) ? data.map((s, i) => ({
      ...s, 
      id: s.id && s.id !== 'undefined' && s.id !== '' ? s.id : `student-${i}`
    })) : [];
  },

  async getLoans(): Promise<Loan[]> {
    if (!GAS_URL) return [...MOCK_LOANS];
    const res = await fetch(`${GAS_URL}?action=getLoans`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return Array.isArray(data) ? data.map((l, i) => ({
      ...l, 
      id: l.id && l.id !== 'undefined' && l.id !== '' ? l.id : `loan-${i}`
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
  }
};
