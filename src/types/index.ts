// src/types/index.ts

// Existing Types
export interface RelationshipType {
  label: string;
  color: string;
  examples?: string[];
}

export interface AccessLevel {
  label: string;
  description: string;
  tooltip: string;
}

export interface FamilyMember {
  id: string | number;
  name: string;
  nicknames: string[];
  birthday: string;
  relationship: string;
  customRole: string;
  accessLevel: string;
  dashboard_type?: 'play' | 'guided' | 'independent'; // Dashboard mode for household members
  inHousehold: boolean;
  permissions: Record<string, boolean>;
  notes: string;
  family_id?: string;
  selected?: boolean; // For AI processing flow
}

export interface ShowPermissionsState {
  [key: string]: boolean;
}

export interface CollapsedState {
  [key: string]: boolean;
}

export interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
}

// New Modular Types
export * from './family';
export * from './dashboard';
export * from './tasks';
export * from './auth';
export * from './context';
export * from './ai';
export * from './shared';