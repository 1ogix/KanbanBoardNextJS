'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Task, TaskStatus, COLUMNS, INITIAL_TASKS } from './types';
import Column from './Column';
import TaskCard from './TaskCard';
import { GripVertical, LayoutDashboard } from 'lucide-react';

const STORAGE_KEY = 'kanban-tasks-v1';

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: { opacity: '0.4' },
    },
  }),
};

function generateId(): string {
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTasks(parsed);
        } else {
          setTasks(INITIAL_TASKS);
        }
      } else {
        setTasks(INITIAL_TASKS);
      }
    } catch {
      setTasks(INITIAL_TASKS);
    }
    setHydrated(true);
  }, []);

  // Persist to localStorage when tasks change
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [tasks, hydrated]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const found = tasks.find((t) => t.id === event.active.id);
    setActiveTask(found ?? null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // Dropped over a column directly
    const isOverColumn = COLUMNS.some((c) => c.id === overId);
    if (isOverColumn && activeTask.status !== overId) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === activeId ? { ...t, status: overId as TaskStatus } : t
        )
      );
      return;
    }

    // Dropped over another task
    const overTask = tasks.find((t) => t.id === overId);
    if (!overTask) return;

    if (activeTask.status !== overTask.status) {
      // Move to the other task's column
      setTasks((prev) =>
        prev.map((t) =>
          t.id === activeId ? { ...t, status: overTask.status } : t
        )
      );
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // Dropped on a column
    const isOverColumn = COLUMNS.some((c) => c.id === overId);
    if (isOverColumn) {
      if (activeTask.status !== overId) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === activeId ? { ...t, status: overId as TaskStatus } : t
          )
        );
      }
      return;
    }

    // Dropped on another task — reorder within same column
    const overTask = tasks.find((t) => t.id === overId);
    if (!overTask) return;

    if (activeTask.status === overTask.status) {
      const columnTasks = tasks.filter((t) => t.status === activeTask.status);
      const oldIndex = columnTasks.findIndex((t) => t.id === activeId);
      const newIndex = columnTasks.findIndex((t) => t.id === overId);

      if (oldIndex !== newIndex) {
        const reordered = arrayMove(columnTasks, oldIndex, newIndex);
        setTasks((prev) => [
          ...prev.filter((t) => t.status !== activeTask.status),
          ...reordered,
        ]);
      }
    }
  };

  const handleAddTask = (status: TaskStatus, title: string, description: string) => {
    const newTask: Task = {
      id: generateId(),
      title,
      description: description || undefined,
      status,
      createdAt: Date.now(),
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleEditTask = (id: string, title: string, description: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, title, description: description || undefined } : t
      )
    );
  };

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 bg-indigo-500 rounded-lg">
            <LayoutDashboard size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-gray-900 leading-tight">Kanban Board</h1>
            <p className="text-xs text-gray-400">
              {tasks.length} task{tasks.length !== 1 ? 's' : ''} &middot; Drag to reorder
            </p>
          </div>
        </div>
      </header>

      {/* Board */}
      <main className="px-8 py-8">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-3 gap-5 items-start">
            {COLUMNS.map((column) => (
              <Column
                key={column.id}
                column={column}
                tasks={tasks.filter((t) => t.status === column.id)}
                onAddTask={handleAddTask}
                onDeleteTask={handleDeleteTask}
                onEditTask={handleEditTask}
              />
            ))}
          </div>

          <DragOverlay dropAnimation={dropAnimation}>
            {activeTask ? (
              <div className="rotate-1 scale-105 shadow-2xl shadow-indigo-200/60">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3.5 opacity-95">
                  <div className="flex items-start gap-2">
                    <GripVertical size={15} className="mt-0.5 flex-shrink-0 text-gray-300" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 leading-snug">
                        {activeTask.title}
                      </p>
                      {activeTask.description && (
                        <p className="mt-1 text-xs text-gray-400 leading-relaxed line-clamp-2">
                          {activeTask.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>
    </div>
  );
}
