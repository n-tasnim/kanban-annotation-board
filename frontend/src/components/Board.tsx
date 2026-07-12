import type { Task, Status, Priority } from '../types/task';

interface BoardProps {
  tasks: Task[];
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onDrop: (e: React.DragEvent, targetStatus: Status) => void;
  onDelete: (taskId: number | string) => void;
  onEdit: (task: Task) => void;
}

export default function Board({ tasks, onDragStart, onDrop, onDelete, onEdit }: BoardProps) {
  const columns: Status[] = ['TODO', 'IN_PROGRESS', 'DONE'];

  return (
    <div className="grid grid-cols-1 gap-6 h-full w-full xl:grid-cols-3 overflow-hidden">
      {columns.map((col) => (
        <Column
          key={col}
          title={col}
          tasks={tasks.filter((task) => task.status === col)}
          onDragStart={onDragStart}
          onDrop={onDrop}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}

function Column({
  title,
  tasks,
  onDragStart,
  onDrop,
  onDelete,
  onEdit,
}: {
  title: Status;
  tasks: Task[];
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onDrop: (e: React.DragEvent, targetStatus: Status) => void;
  onDelete: (taskId: number | string) => void;
  onEdit: (task: Task) => void;
}) {
  const columnLabels: Record<Status, string> = {
    TODO: 'To Do',
    IN_PROGRESS: 'In Progress',
    DONE: 'Done',
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => onDrop(e, title)}
      className="flex flex-col h-full min-h-0 bg-slate-900/30 rounded-2xl p-2.5 border border-slate-800/40 overflow-hidden"
    >
      <h2 className="text-base font-semibold text-white mb-2.5">
        {columnLabels[title]}
        <span className="text-slate-400"> ({tasks.length})</span>
      </h2>

      <div className="flex-1 min-h-0 overflow-y-auto pr-1 pt-1 space-y-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-cyan-500/60 [&::-webkit-scrollbar-track]:bg-slate-800/40 [scrollbar-width:thin] [scrollbar-color:#22d3ee40_#1e293b66]">
        {tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-3 text-sm text-slate-500">
            No tasks in this column for the selected day.
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDragStart={onDragStart}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))
        )}
      </div>
    </div>
  );
}

function TaskCard({
  task,
  onDragStart,
  onDelete,
  onEdit,
}: {
  task: Task;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onDelete: (taskId: number | string) => void;
  onEdit: (task: Task) => void;
}) {
  const priorityColor: Record<Priority, string> = {
    HIGH: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    MEDIUM: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    LOW: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, String(task.id))}
      className="group cursor-grab rounded-xl border border-slate-700/80 bg-slate-800/40 backdrop-blur-sm p-2.5 shadow-[0_8px_24px_rgba(2,6,23,0.25)] transition-all duration-200 hover:-translate-y-1 hover:border-cyan-400/70 hover:bg-slate-900/55 hover:shadow-[0_0_0_1px_rgba(34,211,238,0.2),0_10px_24px_rgba(8,15,28,0.45)] active:scale-[0.98]"
    >
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[11px] text-slate-500 font-mono">TSK-{String(task.id).padStart(3, '0')}</span>
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${priorityColor[task.priority]}`}>
          {task.priority}
        </span>
      </div>

      <h3 className="text-sm font-semibold text-white mb-1.5 line-clamp-2 leading-snug">{task.title}</h3>

      <div className="flex flex-wrap gap-1 mb-1.5">
        {task.tags?.map((tag) => (
          <span key={tag} className="bg-slate-900 border border-slate-700 rounded-md px-1.5 py-0.5 text-[10px] leading-none">
            {tag}
          </span>
        ))}
      </div>

      <hr className="border-slate-700 mb-1.5" />

      <div className="space-y-0.5 text-[11px] text-slate-400">
        <p>📅 Due: {task.due_date ?? 'No due date'}</p>
        <p>📝 Assigned: {task.task_date ?? 'No date'}</p>
      </div>

      <div className="flex justify-end gap-2 mt-1.5">
        <button onClick={() => onEdit(task)} className="text-cyan-400 hover:text-cyan-300 text-xs">
          Edit
        </button>
        <button onClick={() => onDelete(task.id)} className="text-red-400 hover:text-red-300 text-xs">
          Delete
        </button>
      </div>
    </div>
  );
}
