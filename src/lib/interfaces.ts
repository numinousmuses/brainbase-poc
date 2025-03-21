export interface FileType {
    id: string;
    filename: string;
  }
export interface ChatType {
    id: string;
    name: string;
    last_updated: string;
}
export interface WorkspaceType {
    id: string;
    name: string;
    files: FileType[];
    chats: ChatType[];
}

export interface AuthResponse {
  user_id: string;
  email: string;
  workspaces: WorkspaceType[];
  models: ModelType[]; // New field for model names
}


export interface ModelType {
  id: string;
  name: string;
  base_url: string;
  user_id: string;
}

export interface ChatMessage {
  role: string;
  type: string;
  content: string;
}

export interface ChatFileText {
  file_id: string;
  name: string;
  content: string;
  type: string; // "text" or "image"
}

export interface ChatFileBasedVersion {
  version_id: string;
  timestamp: string;
  diff: string;
}

export interface ChatFileBased {
  file_id: string;
  name: string;
  latest_content: string;
  versions: ChatFileBasedVersion[];
  type: "based";
}

export interface WorkspaceFile {
  file_id: string;
  name: string;
}

export interface WsInitialPayload {
  chat_id: string;
  conversation: ChatMessage[];
  chat_files_text: ChatFileText[];
  chat_files_based: ChatFileBased[];
  workspace_files: WorkspaceFile[];
  workspace_id: string;
  models: string[];
}