import { create } from 'zustand';

export const formatDateForApi = (value: string | Date): string => {
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return trimmed;
};

interface TaskState {
  selectedDate: string; 
  setSelectedDate: (date: string) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  selectedDate: formatDateForApi(new Date()),
  setSelectedDate: (date) => set({ selectedDate: formatDateForApi(date) }),
}));