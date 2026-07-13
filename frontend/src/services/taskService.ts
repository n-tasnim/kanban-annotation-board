import axios from 'axios';

const API_URL = 'https://ntasnim.pythonanywhere.com/api/tasks';

export const taskService = {
  getTasks: (date: string) => axios.get(`${API_URL}/?task_date=${date}`),
  createTask: (task: any) => axios.post(`${API_URL}/`, task),
  updateTask: (id: string, task: any) => axios.patch(`${API_URL}/${id}/`, task),
  deleteTask: (id: string) => axios.delete(`${API_URL}/${id}/`),
};