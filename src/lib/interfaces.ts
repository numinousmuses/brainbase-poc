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
  }
  