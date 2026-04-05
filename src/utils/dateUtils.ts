import { differenceInDays, parseISO } from 'date-fns';

export const calculateFine = (returnDateStr: string): number => {
  const returnDate = parseISO(returnDateStr);
  const today = new Date();
  
  // Set times to 00:00:00 to only compare dates
  today.setHours(0, 0, 0, 0);
  returnDate.setHours(0, 0, 0, 0);

  const daysLate = differenceInDays(today, returnDate);
  
  if (daysLate > 0) {
    return daysLate * 0.50; // RM0.50 per day
  }
  
  return 0;
};

export const isOverdue = (returnDateStr: string): boolean => {
  const returnDate = parseISO(returnDateStr);
  const today = new Date();
  
  today.setHours(0, 0, 0, 0);
  returnDate.setHours(0, 0, 0, 0);

  return today > returnDate;
};
