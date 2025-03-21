"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WorkspaceCombobox } from "./workspaceCombobox";
// Shadcn UI components
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

import { Upload, Trash, Edit, Settings, Plus, X } from "lucide-react";

interface FileType {
  id: string;
  filename: string;
}
interface ChatType {
  id: string;
  name: string;
  last_updated: string;
}
interface WorkspaceType {
  id: string;
  name: string;
  files: FileType[];
  chats: ChatType[];
}

export interface WorkspaceProps {
  workspaceData: WorkspaceType[];
  userId: string;
}

export default function Workspace({ workspaceData, userId }: WorkspaceProps) {

  // select the first workspace in the array as the default
  const defaultWorkspace = workspaceData[0];

  const router = useRouter();

  // Local state for dialogs and form inputs
  // Initialize a local state with the initial workspaces.
  const [workspaces, setWorkspaces] = useState<WorkspaceType[]>(workspaceData);

  const [selectedWorkspace, setSelectedWorkspace] = useState<WorkspaceType>(defaultWorkspace);
  const [files, setFiles] = useState<FileType[]>(selectedWorkspace.files || []);
  const [chats, setChats] = useState<ChatType[]>(selectedWorkspace.chats || []);
  const [newWorkspaceOpen, setNewWorkspaceOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspaceFiles, setNewWorkspaceFiles] = useState<File[]>([]);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [newChatName, setNewChatName] = useState("");
  const [selectedFilesForChat, setSelectedFilesForChat] = useState<string[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Handlers for files
  const handleUploadWorkspaceFile = async () => {
    // Create a hidden file input element.
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".pdf,.txt";
    fileInput.multiple = true;
    
    // When files are selected...
    fileInput.onchange = async () => {
      const selectedFiles = fileInput.files;
      if (selectedFiles && selectedFiles.length > 0) {
        // Build FormData with target_id, is_chat, and files.
        const formData = new FormData();
        formData.append("target_id", selectedWorkspace.id);
        formData.append("is_chat", "false"); // Uploading to workspace only
        
        // Append each selected file to the FormData
        for (let i = 0; i < selectedFiles.length; i++) {
          formData.append("files", selectedFiles[i]);
        }
        
        try {
          const res = await fetch("http://127.0.0.1:8000/file/upload", {
            method: "POST",
            body: formData,
          });
          if (!res.ok) {
            throw new Error(`Upload failed with status ${res.status}`);
          }
          const data = await res.json();
          console.log("Upload response:", data);
          
          // data.files is expected to be an array of new file IDs.
          // We know the file names from the FileList.
          const newFiles: FileType[] = [];
          for (let i = 0; i < selectedFiles.length; i++) {
            newFiles.push({
              id: data.files[i],
              filename: selectedFiles[i].name,
            });
          }
          
          // Update local state: append the new files to the existing files.
          setFiles((prevFiles) => [...prevFiles, ...newFiles]);
        } catch (error) {
          console.error("Error uploading file:", error);
        }
      }
    };
    
    // Trigger the file dialog
    fileInput.click();
  };

  useEffect(() => {
    setFiles(selectedWorkspace.files || []);
    setChats(selectedWorkspace.chats || []);
  }, [selectedWorkspace]);

  // Replace your existing handleRenameFile function with this version:
  const handleRenameFile = async (fileId: string, newName: string) => {
    const formData = new FormData();
    formData.append("file_id", fileId);
    formData.append("new_name", newName);

    try {
      const res = await fetch("http://127.0.0.1:8000/file/rename", {
        method: "PATCH",
        body: formData,
      });
      if (!res.ok) {
        throw new Error(`Rename failed with status ${res.status}`);
      }
      const data = await res.json();
      console.log("Rename response:", data);
      
      setFiles((prevFiles) =>
        prevFiles.map((file) =>
          file.id === fileId ? { ...file, filename: data.new_filename } : file
        )
      );
    } catch (error) {
      console.error("Error renaming file:", error);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/file/delete/${fileId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error(`Delete failed with status ${res.status}`);
      }
      const data = await res.json();
      console.log("Delete response:", data);
      
      // Remove the deleted file from the local state.
      setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  // Handlers for chats
  const handleRenameChat = async (chatId: string, newName: string) => {
    const formData = new FormData();
    formData.append("chat_id", chatId);
    formData.append("new_name", newName);

    try {
      const res = await fetch("http://127.0.0.1:8000/chat/rename", {
        method: "PATCH",
        body: formData,
      });
      if (!res.ok) {
        throw new Error(`Rename chat failed with status ${res.status}`);
      }
      const data = await res.json();
      console.log("Rename chat response:", data);
      
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === chatId
            ? { ...chat, name: data.name, last_updated: data.last_updated }
            : chat
        )
      );
    } catch (error) {
      console.error("Error renaming chat:", error);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/chat/${chatId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error(`Delete chat failed with status ${res.status}`);
      }
      const data = await res.json();
      console.log("Delete chat response:", data);
      
      setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  const handleOpenChat = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };

  // Handlers for new workspace (dialog)
  const handleCreateNewWorkspace = async () => {
    const formData = new FormData();
    formData.append("owner_id", userId);
    formData.append("name", newWorkspaceName);
    
    // Append each new workspace file.
    newWorkspaceFiles.forEach((file) => {
      formData.append("files", file);
    });
    
    try {
      const res = await fetch("http://127.0.0.1:8000/workspace/new", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        throw new Error(`Create workspace failed with status ${res.status}`);
      }
      const data = await res.json();
      console.log("Create workspace response:", data);
      
      // Update local workspaces state; assuming data.workspace contains the new workspace info.
      setWorkspaces((prev) => [...prev, data.workspace]);
      // Optionally set the new workspace as selected.
      setSelectedWorkspace(data.workspace);
      
      setNewWorkspaceOpen(false);
      setNewWorkspaceName("");
      setNewWorkspaceFiles([]);
    } catch (error) {
      console.error("Error creating workspace:", error);
    }
  };

  // Handlers for new chat (dialog)
  const handleCreateNewChat = async () => {
    
    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("workspace_id", selectedWorkspace.id);
    formData.append("chat_name", newChatName);
    
    // Append each selected file id as form field with the same name.
    selectedFilesForChat.forEach((fileId) => {
      formData.append("selected_file_ids", fileId);
    });
    
    try {
      const res = await fetch("http://127.0.0.1:8000/chat/new", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        throw new Error(`Create chat failed with status ${res.status}`);
      }
      const data = await res.json();
      console.log("Create chat response:", data);
      
      // Append the new chat to the chats state.
      setChats((prevChats) => [
        ...prevChats,
        {
          id: data.chat_id,
          name: data.name,
          last_updated: data.last_updated,
        },
      ]);
      setNewChatOpen(false);
      setNewChatName("");
      setSelectedFilesForChat([]); // Clear selected files after creation
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };
  

  // Handlers for settings dialog (listing models, adding a model, deleting workspace)
  const handleDeleteWorkspace = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/workspace/delete/${selectedWorkspace.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error(`Delete workspace failed with status ${res.status}`);
      }
      const data = await res.json();
      console.log("Delete workspace response:", data);
      
      // Remove the deleted workspace from state.
      setWorkspaces((prev) => prev.filter((ws) => ws.id !== selectedWorkspace.id));
    } catch (error) {
      console.error("Error deleting workspace:", error);
    }
  };

  return (
    <div className="flex h-screen bg-neutral-950 text-neutral-100">
      {/* Left Pane */}
      <aside className="w-1/4 bg-neutral-950 flex flex-col border-r border-neutral-800">
        {/* Workspace Combobox */}
        <div className="">
          <WorkspaceCombobox
            selectedWorkspace={selectedWorkspace}
            onSelect={(ws) => setSelectedWorkspace(ws)}
            onNewWorkspace={() => setNewWorkspaceOpen(true)}
            allWorkspaces={workspaces}
          />
        </div>

        {/* Files Header */}
        <div className="flex items-center justify-between mb-2  p-2">
          <h3 className="text-lg font-semibold">Files</h3>
          <Button variant="outline" size="icon" onClick={handleUploadWorkspaceFile} className="cursor-pointer">
            <Upload className="h-4 w-4" />
          </Button>
        </div>

        {/* Files ScrollArea */}
        <ScrollArea className="flex-1 border-t border-neutral-800">
          {files.length > 0 ? (
            files.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-2 border-b border-neutral-800">
                <span className="truncate">{file.filename}</span>
                <div className="flex gap-2">
                  <RenameFilePopover file={file} onRename={handleRenameFile} />
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteFile(file.id)} className="cursor-pointer">
                    <Trash className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteFile(file.id)} className="cursor-pointer">
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-2 text-center text-neutral-500">No files</div>
          )}
        </ScrollArea>

        {/* Bottom Avatar */}
        <div className="mt-auto pt-4 border-t border-neutral-800 p-4">
          <Popover>
            <PopoverTrigger asChild>
              <Avatar className="cursor-pointer">
                <AvatarImage src="https://usebrainbase.xyz/bb_logo_white.svg" alt="User Avatar" />
              </Avatar>
            </PopoverTrigger>
            <PopoverContent className="w-56 m-2 bg-neutral-950 border border-neutral-800">
              <div className="flex flex-col space-y-2">
                <Button 
                  variant="ghost" 
                  onClick={() => setSettingsOpen(true)}
                  className="justify-start cursor-pointer"
                >
                  <Settings className=" h-4 w-4" />
                  Settings
                </Button>
                <Button
                  variant="ghost"
                  className="text-destructive justify-start cursor-pointer"
                  onClick={handleDeleteWorkspace}
                >
                  <Trash className="h-4 w-4" />
                  Delete Workspace
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </aside>

      {/* Right Pane */}
      <main className="flex-1 flex flex-col bg-neutral-950 ">
        {/* Header with New Chat Button and Avatar with Popover for Settings */}
        <div className="flex items-end justify-end p-4 border-b border-neutral-800">
          <Button onClick={() => setNewChatOpen(true)} className="cursor-pointer">
            
            New Chat
            <Plus className="h-4 w-4" />
          </Button>
          
        </div>

        {/* Chats List */}
        <div className="flex flex-wrap gap-4 overflow-auto mt-2 p-5">
          {chats.map((chat) => (
            <Card key={chat.id} className="bg-neutral-950 border border-neutral-800 w-1/3 rounded-none">
              <CardHeader className="flex items-center justify-between">
                <div>
                  <CardTitle>{chat.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {new Date(chat.last_updated).toLocaleString()}
                  </CardDescription>
                </div>
                <RenameChatPopover chat={chat} onRename={handleRenameChat} />
                {/* <Button variant="ghost" size="icon" onClick={() => handleRenameChat(chat.id)} className="cursor-pointer">
                  <Edit className="h-4 w-4" />
                </Button> */}
              </CardHeader>
              <CardFooter className="flex justify-between">
                <Button variant="destructive" onClick={() => handleDeleteChat(chat.id)} className="cursor-pointer">
                  <Trash className="h-4 w-4" />
                  Delete
                </Button>
                <Button onClick={() => handleOpenChat(chat.id)} className="cursor-pointer">Open</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>

      {/* New Workspace Dialog */}
      <Dialog open={newWorkspaceOpen} onOpenChange={setNewWorkspaceOpen}>
        <DialogTrigger asChild>
          {/* Hidden trigger – opened programmatically */}
          <Button className="hidden" />
        </DialogTrigger>
        <DialogContent className="bg-neutral-950 border border-neutral-800 rounded-none">
          <DialogHeader>
            <DialogTitle>New Workspace</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Label htmlFor="workspace-name">Workspace Name</Label>
            <Input
              id="workspace-name"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              placeholder="Enter workspace name"
            />
            {/* TODO: File upload input that accepts .txt and .pdf */}
          </div>
          <DialogFooter>
            <Button variant="destructive" onClick={() => setNewWorkspaceOpen(false)} className="cursor-pointer">
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleCreateNewWorkspace} className="cursor-pointer">Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Chat Dialog */}
      <Dialog open={newChatOpen} onOpenChange={setNewChatOpen}>
        <DialogTrigger asChild>
          <Button className="hidden" />
        </DialogTrigger>
        <DialogContent className="bg-neutral-950 border border-neutral-800 rounded-none">
          <DialogHeader>
            <DialogTitle>New Chat</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Label htmlFor="chat-name">Chat Name</Label>
            <Input
              id="chat-name"
              value={newChatName}
              onChange={(e) => setNewChatName(e.target.value)}
              placeholder="Enter chat name"
            />
            {/* TODO: Render a checkbox list of workspace files for selection */}
            <div className="mt-2">
              <p className="text-sm text-neutral-400 mb-1">Select files to include in chat:</p>
              {files.map((file) => (
                <div key={file.id} className="flex items-center space-x-2 mb-2 ml-2">
                  <input
                  type="checkbox"
                  id={file.id}
                  checked={selectedFilesForChat.includes(file.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                    setSelectedFilesForChat((prev) => [...prev, file.id]);
                    } else {
                    setSelectedFilesForChat((prev) => prev.filter((id) => id !== file.id));
                    }
                  }}
                  />
                  <Label htmlFor={file.id}>{file.filename}</Label>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="destructive" onClick={() => setNewChatOpen(false)} className="cursor-pointer">
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleCreateNewChat} className="cursor-pointer">Create Chat</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogTrigger asChild>
          <Button className="hidden" />
        </DialogTrigger>
        <DialogContent className="bg-neutral-950 border border-neutral-800 rounded-none">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          {/* TODO: List user models and include a form to add a new model */}
          <div className="space-y-4 py-2">
            <p className="text-sm text-neutral-400">User Models:</p>
            {/* Placeholder for models list */}
            <div className="border border-neutral-800 p-2">Model A</div>
            <div className="border border-neutral-800 p-2">Model B</div>
            <Button variant="outline" className="mt-2 cursor-pointer">
              Add New Model
            </Button>
          </div>
          <DialogFooter>
            <Button variant="destructive" onClick={() => setSettingsOpen(false)} className="cursor-pointer">
              <X className="h-4 w-4" />
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RenameFilePopover({ file, onRename }: { file: FileType; onRename: (fileId: string, newName: string) => Promise<void> }) {
  const [newName, setNewName] = useState(file.filename);
  const [open, setOpen] = useState(false);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      await onRename(file.id, newName);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="cursor-pointer">
          <Edit className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2 bg-neutral-950 border border-neutral-800">
        <Input 
          value={newName} 
          onChange={(e) => setNewName(e.target.value)} 
          onKeyDown={handleKeyDown}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}

function RenameChatPopover({ chat, onRename }: { chat: ChatType; onRename: (chatId: string, newName: string) => Promise<void>; }) {
  const [newName, setNewName] = useState(chat.name);
  const [open, setOpen] = useState(false);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      await onRename(chat.id, newName);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="cursor-pointer">
          <Edit className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2 bg-neutral-950 border border-neutral-800">
        <Input 
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}