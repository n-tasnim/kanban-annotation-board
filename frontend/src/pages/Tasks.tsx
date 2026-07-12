import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { useTaskStore } from '../store/useTaskStore';
import { useNavigate } from 'react-router-dom';
import DateSelector from '../components/DateSelector';
import Board from '../components/Board';
import '../lib/api';
import { Calendar, ChevronLeft, ChevronRight, LogOut, Plus, X } from 'lucide-react';
import type { Priority, Status, Task } from '../types/task';

const API_BASE = 'http://localhost:8000/api/tasks'; 

export default function Tasks() {
  const logout = useAuthStore((state) => state.logout);
  const selectedDate = useTaskStore((state) => state.selectedDate);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Task Board';
    return () => {
      document.title = 'VaiRadiology';
    };
  }, []);
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newPriority, setNewPriority] = useState<Priority>('MEDIUM');
  const [newTags, setNewTags] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(() => new Date());

  const handleSubmit = (e: React.FormEvent) => {
      if (editingTask) {
          handleUpdateTask(e);
      } else {
          handleAddTask(e);
      }
  };
  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingTask) return;

    const token = useAuthStore.getState().accessToken;

    const updatedTask = {
        title: newTitle,
        priority: newPriority,
        task_date: editingTask.task_date,
        due_date: newDueDate || null,
        tags: newTags
            .split(",")
            .map(t => t.trim())
            .filter(Boolean)
    };

    const response = await axios.patch(
        `${API_BASE}/${editingTask.id}/`,
        updatedTask,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    setTasks(tasks.map(task =>
        task.id === editingTask.id ? response.data : task
    ));

    setEditingTask(null);
    setIsModalOpen(false);

    setNewTitle("");
    setNewPriority("MEDIUM");
    setNewTags("");
    setNewDueDate("");
};

  useEffect(() => {
    const fetchTasks = async () => {
      const token = useAuthStore.getState().accessToken;
      try {
        const response = await axios.get(`${API_BASE}/?task_date=${selectedDate}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTasks(response.data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };
    fetchTasks();
  }, [selectedDate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDisplayDate = (value: string) => {
    if (!value) return 'Due Date';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return 'Due Date';
    return parsed.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfWeek = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handleSelectDate = (dateString: string) => {
    setNewDueDate(dateString);
    setIsDatePickerOpen(false);
  };

  const openDatePicker = () => {
    const baseDate = newDueDate ? new Date(newDueDate) : new Date();
    if (!Number.isNaN(baseDate.getTime())) {
      setPickerMonth(new Date(baseDate.getFullYear(), baseDate.getMonth(), 1));
    }
    setIsDatePickerOpen((prev) => !prev);
  };

  const renderCalendarDays = () => {
    const year = pickerMonth.getFullYear();
    const month = pickerMonth.getMonth();
    const totalDays = getDaysInMonth(year, month);
    const firstDayOffset = getFirstDayOfWeek(year, month);
    const days: Array<{ day: number; isCurrentMonth: boolean; dateString: string }> = [];

    for (let i = 0; i < firstDayOffset; i += 1) {
      days.push({ day: 0, isCurrentMonth: false, dateString: '' });
    }

    for (let day = 1; day <= totalDays; day += 1) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      days.push({ day, isCurrentMonth: true, dateString });
    }

    return days;
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: Status) => {
  const taskId = e.dataTransfer.getData("text/plain");

  const token = useAuthStore.getState().accessToken;

  setTasks((prev) =>
    prev.map((task) =>
      String(task.id) === taskId
        ? { ...task, status: targetStatus }
        : task
    )
  );

  try {
    await axios.patch(
      `${API_BASE}/${taskId}/`,
      { status: targetStatus },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.error(error);
  }
};

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const token = useAuthStore.getState().accessToken;
    console.log("Access Token:", token);
    const newTaskData = {
      title: newTitle,
      priority: newPriority,
      status: 'TODO',
      task_date: selectedDate,
      due_date: newDueDate || null,
      tags: newTags.split(',').map(t => t.trim()).filter(t => t.length > 0)
    };

    try {
      const response = await axios.post(`${API_BASE}/`, newTaskData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setTasks([...tasks, response.data]);
      setIsModalOpen(false);
      setNewTitle('');
      setNewPriority('MEDIUM');
      setNewTags('');
      setNewDueDate('');
    } catch (error: any) {
      console.error("401 Error details:", error.response?.data);
      alert("Unauthorized: Please log in again.");
    }
  };

    const handleEditTask = (task: Task) => {
        setEditingTask(task);

        setNewTitle(task.title);
        setNewPriority(task.priority);
        setNewTags(task.tags.join(", "));
        setNewDueDate(task.due_date ?? '');

        setIsModalOpen(true);
    };

  const handleDeleteTask = async (taskId: number | string) => {
    try {
        const token = useAuthStore.getState().accessToken;

        await axios.delete(
            `${API_BASE}/${taskId}/`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
      setTasks(tasks.filter((t) => String(t.id) !== String(taskId)));
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  return (
    <div className="h-screen w-full bg-slate-950 flex flex-col overflow-hidden text-slate-200 font-sans">
    
      <header className="bg-slate-950/95 border-b border-slate-800/60 px-4 py-3 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-light tracking-tight text-white">VaiRadiology</h1>
          <p className="text-[9px] text-cyan-400/80 uppercase tracking-[0.24em] mt-0.5">Clinical Task Board</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate('/annotation')} className="flex items-center gap-2 border border-slate-800 bg-slate-900/40 text-slate-300 px-5 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white hover:border-slate-700 transition-colors text-sm font-medium">
            <span>Annotation Suite</span>
          </button>
          <button onClick={() => {
            setEditingTask(null);
            setNewTitle('');
            setNewPriority('MEDIUM');
            setNewTags('');
            setNewDueDate('');
            setIsModalOpen(true);
          }} className="flex items-center gap-2 bg-cyan-800 text-white px-5 py-1.5 rounded-lg hover:bg-cyan-500 transition-colors shadow-lg shadow-cyan-500/20 text-sm font-medium">
            <Plus size={16} />
            <span>Create Task</span>
          </button>
          <div className="w-px h-5 bg-slate-800 mx-1"></div>
          <button onClick={handleLogout} className="flex items-center space-x-2 text-slate-400 hover:text-white">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <DateSelector />

      <main className="flex-1 min-h-0 p-3 bg-[radial-gradient(circle_at_20%_10%,_rgba(34,211,238,0.12),_transparent_28%),radial-gradient(circle_at_80%_20%,_rgba(14,165,233,0.08),_transparent_24%),linear-gradient(135deg,_rgba(2,6,23,0.95),_rgba(15,23,42,0.97))] overflow-hidden">
        <Board tasks={tasks} onDragStart={handleDragStart} onDrop={handleDrop} onDelete={handleDeleteTask} onEdit={handleEditTask} />
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={18} /></button>
            <h2 className="text-xl font-semibold text-white mb-4">{editingTask ? 'Edit Task' : 'Create New Task'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Task Title" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm" />
              <select value={newPriority} onChange={e => setNewPriority(e.target.value as Priority)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm">
                <option value="LOW">Low Priority</option><option value="MEDIUM">Medium Priority</option><option value="HIGH">High Priority</option>
              </select>
              <div className="relative">
                <button
                  type="button"
                  onClick={openDatePicker}
                  className="flex w-full items-center justify-between rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-left text-sm text-slate-200 transition hover:border-cyan-500/50 focus:outline-none"
                >
                  <span className={newDueDate ? 'text-slate-200' : 'text-slate-500'}>{formatDisplayDate(newDueDate)}</span>
                  <Calendar size={16} className="text-cyan-300" />
                </button>

                {isDatePickerOpen && (
                  <div className="absolute left-0 right-0 z-20 mt-2 rounded-xl border border-slate-800 bg-slate-900 p-3 shadow-2xl shadow-black/60">
                    <div className="mb-3 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setPickerMonth(new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() - 1, 1))}
                        className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-cyan-300"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="text-sm font-semibold text-white">
                        {pickerMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPickerMonth(new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() + 1, 1))}
                        className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-cyan-300"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>

                    <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                        <span key={day}>{day}</span>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {renderCalendarDays().map((item, index) => {
                        if (!item.isCurrentMonth) {
                          return <div key={`empty-${index}`} className="h-8" />;
                        }

                        const isSelected = item.dateString === newDueDate;
                        return (
                          <button
                            key={item.dateString}
                            type="button"
                            onClick={() => handleSelectDate(item.dateString)}
                            className={`h-8 rounded-lg text-sm transition ${
                              isSelected
                                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`}
                          >
                            {item.day}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-3">
                      <button
                        type="button"
                        onClick={() => {
                          setNewDueDate('');
                          setIsDatePickerOpen(false);
                        }}
                        className="text-xs text-slate-400 hover:text-cyan-300"
                      >
                        Clear
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsDatePickerOpen(false)}
                        className="text-xs text-slate-400 hover:text-white"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <input value={newTags} onChange={e => setNewTags(e.target.value)} placeholder="Tags (comma separated)" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm" />
              <button type="submit" className="w-full bg-cyan-900 py-2 rounded-lg text-white font-medium hover:bg-cyan-900">Commit Task</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

