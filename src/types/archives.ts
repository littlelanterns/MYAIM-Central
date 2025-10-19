// src/types/archives.ts - TypeScript types for Family Archives system

export interface ArchiveFolder {
  id: string;
  family_id: string;
  parent_folder_id: string | null;
  folder_name: string;
  folder_type:
    | 'master_family'
    | 'master_best_intentions'
    | 'master_extended_family'
    | 'master_personal'
    | 'family_member'
    | 'custom_project'
    | 'extended_family_member'
    | 'best_intention_item';
  member_id: string | null;
  icon: string;
  cover_photo_url: string | null;
  color_hex: string;
  description: string | null;
  is_active: boolean;
  is_master?: boolean;
  required_tier: 'essential' | 'enhanced' | 'full_magic' | 'creator';
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ArchiveContextItem {
  id: string;
  folder_id: string;
  context_field: string;
  context_value: string;
  context_type: 'text' | 'list' | 'date' | 'number' | 'boolean';
  use_for_context: boolean;
  added_by: 'manual' | 'interview' | 'conversation' | 'import';
  conversation_reference: string | null;
  suggested_by_lila: boolean;
  suggestion_accepted: boolean | null;
  suggestion_reasoning: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArchiveInheritanceRule {
  id: string;
  child_folder_id: string;
  parent_folder_id: string;
  inherit_all: boolean;
  inherit_fields: string[] | null;
  allow_override: boolean;
  created_at: string;
}

export interface PersonalPrompt {
  id: string;
  family_id: string;
  created_by: string | null;
  prompt_title: string;
  prompt_description: string | null;
  original_request: string | null;
  optimized_prompt: string;
  category: 'homework' | 'meals' | 'behavior' | 'creative' | 'schedule' | 'communication' | 'parenting' | 'learning' | 'custom' | 'other' | null;
  tags: string[];
  context_snapshot: Record<string, any> | null;
  folders_used: string[] | null;
  target_platform: 'chatgpt' | 'claude' | 'gemini' | 'copilot' | 'perplexity' | 'generic';
  times_used: number;
  last_used_at: string | null;
  is_favorite: boolean;
  is_archived: boolean;
  archived_at: string | null;
  is_public: boolean;
  share_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface LiLaContextSuggestion {
  id: string;
  family_id: string;
  conversation_reference: string | null;
  suggested_context_field: string;
  suggested_context_value: string;
  suggested_folder_id: string | null;
  suggestion_type: 'context_item' | 'best_intention' | 'custom_folder' | 'schedule_item';
  reasoning: string | null;
  confidence_score: number | null;
  detected_pattern: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'modified';
  mom_modified_value: string | null;
  responded_at: string | null;
  responded_by: string | null;
  created_at: string;
}

// Component Props Types

export interface FolderGridProps {
  folders: ArchiveFolder[];
  onFolderClick: (folder: ArchiveFolder) => void;
  onCreateFolder?: () => void;
  selectedFolderId?: string | null;
}

export interface ContextItemsListProps {
  folderId: string;
  items: ArchiveContextItem[];
  onToggleUse: (itemId: string, currentValue: boolean) => void;
  onEdit: (item: ArchiveContextItem) => void;
  onDelete: (itemId: string) => void;
  onAdd: () => void;
}

export interface LiLaInterviewProps {
  folder: ArchiveFolder;
  onComplete: () => void;
  onClose: () => void;
}

export interface PromptCardProps {
  prompt: PersonalPrompt;
  onClick: () => void;
  onRefresh: () => void;
}

export interface PromptDetailModalProps {
  prompt: PersonalPrompt;
  onClose: () => void;
  onUpdate: () => void;
}

// API Request/Response Types

export interface CreateFolderRequest {
  family_id: string;
  parent_folder_id: string | null;
  folder_name: string;
  folder_type: ArchiveFolder['folder_type'];
  member_id?: string | null;
  icon?: string;
  color_hex?: string;
  description?: string | null;
}

export interface CreateContextItemRequest {
  folder_id: string;
  context_field: string;
  context_value: string;
  context_type?: ArchiveContextItem['context_type'];
  use_for_context?: boolean;
  added_by?: ArchiveContextItem['added_by'];
}

export interface UpdateContextItemRequest {
  context_field?: string;
  context_value?: string;
  use_for_context?: boolean;
}

export interface CreatePromptRequest {
  family_id: string;
  created_by: string;
  prompt_title: string;
  prompt_description?: string | null;
  original_request?: string | null;
  optimized_prompt: string;
  category?: PersonalPrompt['category'];
  tags?: string[];
  context_snapshot?: Record<string, any>;
  folders_used?: string[];
  target_platform?: PersonalPrompt['target_platform'];
}

// Interview Question Type
export interface InterviewQuestion {
  field: string;
  question: string;
  example: string;
  icon: string;
  memberSpecific: boolean;
}
