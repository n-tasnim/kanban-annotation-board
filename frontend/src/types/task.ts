export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type Status = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface Task {
  id: number;
  title: string;
  priority: Priority;
  status: Status;
  task_date: string;
  assigned_date?: string;
  due_date: string | null;
  tags: string[];
}
