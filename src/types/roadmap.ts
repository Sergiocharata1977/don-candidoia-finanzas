// Roadmap/Kanban types

export type CardStatus =
  | 'backlog'
  | 'todo'
  | 'in_progress'
  | 'in_review'
  | 'done';
export type CardPriority = 'low' | 'medium' | 'high' | 'critical';

export interface RoadmapCard {
  id: string;
  orgId: string;
  title: string;
  description?: string;
  status: CardStatus;
  priority: CardPriority;

  // Assignment
  assignedTo?: string; // User ID
  assignedToName?: string;
  assignedToPhoto?: string;

  // Organization
  labels: string[];
  dueDate?: Date;
  estimatedHours?: number;

  // Tracking
  createdBy: string;
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;

  // Order within column
  order: number;
}

// Kanban column configuration
export interface KanbanColumn {
  id: CardStatus;
  title: string;
  color: string;
  icon?: string;
}

export const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: 'backlog', title: 'Backlog', color: '#6B7280' },
  { id: 'todo', title: 'Por Hacer', color: '#3B82F6' },
  { id: 'in_progress', title: 'En Progreso', color: '#F59E0B' },
  { id: 'in_review', title: 'En Revisión', color: '#8B5CF6' },
  { id: 'done', title: 'Completado', color: '#10B981' },
];

// Priority configuration
export interface PriorityConfig {
  value: CardPriority;
  label: string;
  color: string;
  icon?: string;
}

export const PRIORITY_CONFIG: PriorityConfig[] = [
  { value: 'low', label: 'Baja', color: '#6B7280' },
  { value: 'medium', label: 'Media', color: '#3B82F6' },
  { value: 'high', label: 'Alta', color: '#F59E0B' },
  { value: 'critical', label: 'Crítica', color: '#EF4444' },
];

// Card creation/update forms
export interface CreateCardData {
  title: string;
  description?: string;
  status?: CardStatus;
  priority?: CardPriority;
  assignedTo?: string;
  labels?: string[];
  dueDate?: Date;
  estimatedHours?: number;
}

export interface UpdateCardData extends Partial<CreateCardData> {
  order?: number;
  completedAt?: Date;
}
