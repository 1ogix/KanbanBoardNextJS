export type TaskStatus = 'todo' | 'inprogress' | 'done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: number;
}

export interface Column {
  id: TaskStatus;
  title: string;
  color: string;
  headerColor: string;
  badgeColor: string;
  addButtonColor: string;
}

export const COLUMNS: Column[] = [
  {
    id: 'todo',
    title: 'To Do',
    color: 'border-t-slate-400',
    headerColor: 'text-slate-600',
    badgeColor: 'bg-slate-100 text-slate-600',
    addButtonColor: 'hover:bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300',
  },
  {
    id: 'inprogress',
    title: 'In Progress',
    color: 'border-t-amber-400',
    headerColor: 'text-amber-600',
    badgeColor: 'bg-amber-50 text-amber-600',
    addButtonColor: 'hover:bg-amber-50 text-amber-500 border-amber-200 hover:border-amber-300',
  },
  {
    id: 'done',
    title: 'Done',
    color: 'border-t-emerald-400',
    headerColor: 'text-emerald-600',
    badgeColor: 'bg-emerald-50 text-emerald-600',
    addButtonColor: 'hover:bg-emerald-50 text-emerald-500 border-emerald-200 hover:border-emerald-300',
  },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: 'Design wireframes',
    description: 'Create initial mockups for the new dashboard',
    status: 'todo',
    createdAt: Date.now() - 3000,
  },
  {
    id: '2',
    title: 'Set up project repository',
    description: 'Initialize Git repo and configure CI/CD pipeline',
    status: 'todo',
    createdAt: Date.now() - 2000,
  },
  {
    id: '3',
    title: 'Build authentication flow',
    description: 'Implement login, signup and OAuth',
    status: 'inprogress',
    createdAt: Date.now() - 1500,
  },
  {
    id: '4',
    title: 'Write API documentation',
    description: 'Document all REST endpoints with examples',
    status: 'inprogress',
    createdAt: Date.now() - 1000,
  },
  {
    id: '5',
    title: 'Deploy staging environment',
    description: 'Set up staging server on AWS',
    status: 'done',
    createdAt: Date.now() - 500,
  },
];
