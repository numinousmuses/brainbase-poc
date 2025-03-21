"use client";

import * as React from "react";
import { useState } from "react";
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

export default function Workspace({ workspaceData }: { workspaceData: WorkspaceType }) {
  const router = useRouter();

  // Local state for dialogs and form inputs
  const [files, setFiles] = useState<FileType[]>(workspaceData.files || []);
  const [chats, setChats] = useState<ChatType[]>(workspaceData.chats || []);
  const [selectedWorkspace, setSelectedWorkspace] = useState<WorkspaceType>(workspaceData);
  const [newWorkspaceOpen, setNewWorkspaceOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [newChatName, setNewChatName] = useState("");
  const [selectedFilesForChat, setSelectedFilesForChat] = useState<string[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Handlers for files
  const handleUploadWorkspaceFile = () => {
    // TODO: open file dialog and POST to /file/upload (only txt/pdf allowed)
    console.log("Upload file to workspace", selectedWorkspace.id);
  };

  const handleRenameFile = (fileId: string) => {
    // TODO: open a rename file dialog and call /file/rename
    console.log("Rename file", fileId);
  };

  const handleDeleteFile = (fileId: string) => {
    // TODO: call DELETE /file/{fileId} and update local state
    console.log("Delete file", fileId);
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  // Handlers for chats
  const handleRenameChat = (chatId: string) => {
    // TODO: open a rename chat dialog and call PATCH /chat/rename
    console.log("Rename chat", chatId);
  };

  const handleDeleteChat = (chatId: string) => {
    // TODO: call DELETE /chat/{chatId} and update local state
    console.log("Delete chat", chatId);
    setChats((prev) => prev.filter((c) => c.id !== chatId));
  };

  const handleOpenChat = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };

  // Handlers for new workspace (dialog)
  const handleCreateNewWorkspace = () => {
    // TODO: call /workspace/new with newWorkspaceName and file uploads
    console.log("Create new workspace:", newWorkspaceName);
    setNewWorkspaceOpen(false);
  };

  // Handlers for new chat (dialog)
  const handleCreateNewChat = () => {
    // TODO: call /chat/new with newChatName and selectedFilesForChat
    console.log("Create new chat:", newChatName, "with files", selectedFilesForChat);
    setNewChatOpen(false);
  };

  // Handlers for settings dialog (listing models, adding a model, deleting workspace)
  const handleDeleteWorkspace = () => {
    // TODO: call DELETE /workspace/delete/{workspaceId}
    console.log("Delete workspace", selectedWorkspace.id);
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
                  <Button variant="ghost" size="icon" onClick={() => handleRenameFile(file.id)} className="cursor-pointer">
                    <Edit className="h-4 w-4" />
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
            <Card key={chat.id} className="bg-neutral-950 border border-neutral-800 w-1/4 rounded-none">
              <CardHeader className="flex items-center justify-between">
                <div>
                  <CardTitle>{chat.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {new Date(chat.last_updated).toLocaleString()}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleRenameChat(chat.id)} className="cursor-pointer">
                  <Edit className="h-4 w-4" />
                </Button>
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