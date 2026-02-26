'use client';

import { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, GripVertical, Check, X, Pencil } from 'lucide-react';
import { Task } from './types';

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string, description: string) => void;
  isDraggingOver?: boolean;
}

export default function TaskCard({ task, onDelete, onEdit }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description ?? '');
  const titleRef = useRef<HTMLTextAreaElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {
    if (isEditing && titleRef.current) {
      titleRef.current.focus();
      titleRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle) return;
    onEdit(task.id, trimmedTitle, editDescription.trim());
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDescription(task.description ?? '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave();
    }
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-white rounded-xl border-2 border-dashed border-indigo-300 opacity-40 h-20 shadow-sm"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 ${
        isEditing ? 'ring-2 ring-indigo-400 ring-offset-1' : 'hover:border-gray-200'
      }`}
    >
      {isEditing ? (
        <div className="p-3.5">
          <textarea
            ref={titleRef}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Task title..."
            rows={2}
            className="w-full text-sm font-medium text-gray-800 bg-transparent border-none outline-none resize-none placeholder-gray-300 leading-snug"
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a description... (optional)"
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
              onClick={handleSave}
              disabled={!editTitle.trim()}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Check size={12} />
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3.5">
          <div className="flex items-start gap-2">
            {/* Drag handle */}
            <button
              {...attributes}
              {...listeners}
              className="mt-0.5 flex-shrink-0 text-gray-300 hover:text-gray-400 cursor-grab active:cursor-grabbing transition-colors touch-none"
              aria-label="Drag task"
            >
              <GripVertical size={15} />
            </button>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 leading-snug break-words">
                {task.title}
              </p>
              {task.description && (
                <p className="mt-1 text-xs text-gray-400 leading-relaxed break-words line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex-shrink-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                aria-label="Edit task"
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                aria-label="Delete task"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
