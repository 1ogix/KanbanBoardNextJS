'use client';

import { useState, useRef, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, X, Check } from 'lucide-react';
import { Task, Column as ColumnType } from './types';
import TaskCard from './TaskCard';

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
  onAddTask: (status: ColumnType['id'], title: string, description: string) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (id: string, title: string, description: string) => void;
  isOver?: boolean;
}

export default function Column({
  column,
  tasks,
  onAddTask,
  onDeleteTask,
  onEditTask,
}: ColumnProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const handleAdd = () => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    onAddTask(column.id, trimmed, newDescription.trim());
    setNewTitle('');
    setNewDescription('');
    setIsAdding(false);
  };

  const handleCancel = () => {
    setNewTitle('');
    setNewDescription('');
    setIsAdding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleAdd();
    }
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="flex flex-col min-w-0">
      {/* Column Header */}
      <div className={`flex items-center justify-between mb-3`}>
        <div className="flex items-center gap-2.5">
          <h2 className={`text-sm font-semibold tracking-wide uppercase ${column.headerColor}`}>
            {column.title}
          </h2>
          <span
            className={`inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 text-xs font-semibold rounded-full ${column.badgeColor}`}
          >
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Column Body */}
      <div
        ref={setNodeRef}
        className={`flex-1 flex flex-col rounded-2xl p-3 gap-2.5 transition-colors duration-200 min-h-[120px] border-2 ${
          isOver
            ? 'bg-indigo-50 border-indigo-200 border-dashed'
            : 'bg-gray-50/70 border-transparent'
        }`}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDelete={onDeleteTask}
              onEdit={onEditTask}
            />
          ))}
        </SortableContext>

        {/* Empty state */}
        {tasks.length === 0 && !isAdding && (
          <div className="flex-1 flex items-center justify-center py-6">
            <p className="text-xs text-gray-300 text-center">
              No tasks yet
            </p>
          </div>
        )}

        {/* Add task inline form */}
        {isAdding && (
          <div className="bg-white rounded-xl border-2 border-indigo-300 shadow-sm ring-1 ring-indigo-100 p-3.5">
            <textarea
              ref={inputRef}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Task title..."
              rows={2}
              className="w-full text-sm font-medium text-gray-800 bg-transparent border-none outline-none resize-none placeholder-gray-300 leading-snug"
            />
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Description... (optional)"
              rows={2}
              className="w-full mt-1 text-xs text-gray-500 bg-transparent border-none outline-none resize-none placeholder-gray-300 leading-snug"
            />
            <div className="flex items-center justify-end gap-1.5 mt-2 pt-2 border-t border-gray-100">
              <button
                onClick={handleCancel}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-gray-500 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={12} />
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!newTitle.trim()}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Check size={12} />
                Add task
              </button>
            </div>
          </div>
        )}

        {/* Add task button */}
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className={`flex items-center justify-center gap-1.5 w-full py-2 text-xs font-medium rounded-xl border border-dashed transition-all duration-150 ${column.addButtonColor}`}
          >
            <Plus size={13} />
            Add task
          </button>
        )}
      </div>
    </div>
  );
}
