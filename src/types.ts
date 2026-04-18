export interface User {
  id: string;
  name: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  status: 'Tersedia' | 'Dipinjam';
}

export interface Student {
  id: string;
  name: string;
  className: string;
}

export interface Teacher {
  id: string;
  name: string;
  subject?: string;
}

export interface NilamRecord {
  id: string;
  studentName: string;
  className: string;
  totalBooks: number;
  monthlyData: Record<string, number>;
}

export interface Loan {
  id: string;
  studentName: string;
  studentClass: string;
  bookTitle: string;
  startDate: string;
  returnDate: string;
  status: 'Aktif' | 'Selesai';
  fine: number;
}
