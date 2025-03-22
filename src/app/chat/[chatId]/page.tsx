"use client";

import * as React from "react";
import { useState, useEffect, useRef, DragEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { History, MessageSquare, Upload, CircleHelp, Send, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { ChatFileBased, ChatFileBasedVersion, ChatFileText, ChatMessage } from "@/lib/interfaces";


interface ChatHistoryItem {
    role: string;
    content: string;
    type: string;
}

import Editor from 'react-simple-code-editor';
// @ts-ignore
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css'; 
import VersionDiffExplorer from "@/components/versionDiffExplorer/versionDIffExplorer";
import { send } from "process";

export default function ChatPage() {
  const router = useRouter();
  const { chatId } = useParams();
  const [isSending, setIsSending] = useState(false);

  // State for the code viewer (left panel)
  const [selectedBasedFileContent, setSelectedBasedFileContent] = useState<string>("");
  const [selectedBasedFileName, setSelectedBasedFileName] = useState<string>("");

  // state for chat or composer mode
  const [isChatOrComposer, setIsChatOrComposer] = useState(false); // if false is composer
  
  // Breadcrumbs
  const [breadcrumbWorkspace, setBreadcrumbWorkspace] = useState("My Workspace");
  const [breadcrumbChat, setBreadcrumbChat] = useState("General Chat");

  // View mode for right panel: either chat history or diff explorer
  const [viewMode, setViewMode] = useState<"chat" | "diff">("chat");

  // Placeholder state for models; in a real app, you'd load these via API or WebSocket
  const [models, setModels] = useState<string[]>(["Model A", "Model B", "Model C"]);
  const [selectedModel, setSelectedModel] = useState<string>("Model A");

  // Placeholder file explorer lists
  const [basedFiles, setBasedFiles] = useState<ChatFileBased[]>([]);
  const [contextFiles, setContextFiles] = useState<ChatFileText[]>([]);

  // Chat history placeholder
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);

  // Version diff placeholder state for diff explorer
  const [versionDiff, setVersionDiff] = useState<string>("Diff output placeholder...");

  // Prompt text
  const [promptText, setPromptText] = useState<string>("");

  // Ref for WebSocket instance
  const wsRef = useRef<WebSocket | null>(null);

  // Handle drag and drop over the entire page (placeholder)
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    // You could extract e.dataTransfer.files and call your upload function.
    console.log("File(s) dropped", e.dataTransfer.files);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // When a based file is clicked, update the left panel's code content and record the file name.
  const handleBasedFileSelect = (fileName: string, fileContent: string) => {
    setSelectedBasedFileName(fileName);
    setSelectedBasedFileContent(fileContent);
  };

  const connectWebSocket = () => {
    const ws = new WebSocket(`ws://127.0.0.1:8000/ws/${chatId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
        setIsSending(false);
        try {
          // For text messages
          if (typeof event.data === 'string' && !event.data.startsWith('{')) {
            // Direct text response (for "response" type)
            setChatHistory(prev => [
              ...prev, 
              { role: 'assistant', content: event.data, type: 'text' } as ChatMessage
            ]);
            return;
          }
      
          const data = JSON.parse(event.data);
          console.log("Received WebSocket message:", data);
      
          if (data.chat_name) {
            setBreadcrumbChat(data.chat_name);
          }
      
          // Handle structured responses
          if (data.action === "agent_response") {
            setIsSending(false);
            const responseData = data.message;
            
            // Handle file responses (based or diff types)
            if (responseData.type === "file") {
              const fileContent = typeof responseData.content === 'string' 
                ? JSON.parse(responseData.content) 
                : responseData.content;
      
              // Update chat history
              setChatHistory(prev => [
                ...prev,
                {
                  role: responseData.role,
                  content: typeof fileContent === 'string' 
                    ? fileContent 
                    : JSON.stringify(fileContent),
                  type: 'file'
                } as ChatMessage
              ]);
      
              // Update the based files list if it's a new file or modified file
              // Process based file content
                if (fileContent.based_filename && fileContent.based_content) {
                    setBasedFiles(prevFiles => {
                    // Check if the file already exists
                    const existingFileIndex = prevFiles.findIndex(
                        file => file.name === fileContent.based_filename
                    );
            
                    const currentTimestamp = new Date().toISOString();
            
                    if (existingFileIndex >= 0) {
                        // Update existing file
                        const updatedFiles = [...prevFiles];
                        const updatedFile = {...updatedFiles[existingFileIndex]};
                        
                        // Create a new version
                        const newVersion: ChatFileBasedVersion = {
                        version_id: `v-${Date.now()}`,
                        diff: fileContent.based_content,
                        timestamp: currentTimestamp
                        };
                        
                        // Add to versions array and update latest content
                        updatedFile.latest_content = fileContent.based_content;
                        updatedFile.versions = [...updatedFile.versions, newVersion];
                        
                        updatedFiles[existingFileIndex] = updatedFile;
                        
                        return updatedFiles;
                    } else {
                        // Add new file with initial version
                        return [...prevFiles, {
                        file_id: `file-${Date.now()}`,
                        name: fileContent.based_filename,
                        latest_content: fileContent.based_content,
                        versions: [{
                            version_id: `v-${Date.now()}`,
                            diff: fileContent.based_content,
                            timestamp: currentTimestamp
                        }],
                        type: "based"
                        } as ChatFileBased];
                    }
                });
  
      
                // Update the editor if this is the currently selected file or a new file
                if (!selectedBasedFileName || selectedBasedFileName === fileContent.based_filename) {
                  setSelectedBasedFileName(fileContent.based_filename);
                  setSelectedBasedFileContent(fileContent.based_content);
                }
              }
            }
          } else if (data.action === "revert_complete") {
            setIsSending(false);
            const responseData = data.message;
            
            // Process the reverted file update
            if (responseData.type === "file" && responseData.content) {
              const fileContent = typeof responseData.content === 'string'
                ? JSON.parse(responseData.content)
                : responseData.content;
              
              // Update chat history
              setChatHistory(prev => [
                ...prev,
                {
                  role: responseData.role,
                  content: typeof fileContent === 'string'
                    ? fileContent
                    : JSON.stringify(fileContent),
                  type: 'file'
                } as ChatMessage
              ]);
              
              // Update file in basedFiles list
              if (fileContent.based_filename && fileContent.based_content) {
                setBasedFiles(prevFiles => {
                    // Check if the file already exists
                    const existingFileIndex = prevFiles.findIndex(
                        file => file.name === fileContent.based_filename
                    );
            
                    const currentTimestamp = new Date().toISOString();
            
                    if (existingFileIndex >= 0) {
                        // Update existing file
                        const updatedFiles = [...prevFiles];
                        const updatedFile = {...updatedFiles[existingFileIndex]};
                        
                        // Create a new version
                        const newVersion: ChatFileBasedVersion = {
                        version_id: `v-${Date.now()}`,
                        diff: fileContent.based_content,
                        timestamp: currentTimestamp
                        };
                        
                        // Add to versions array and update latest content
                        updatedFile.latest_content = fileContent.based_content;
                        updatedFile.versions = [...updatedFile.versions, newVersion];
                        
                        updatedFiles[existingFileIndex] = updatedFile;
                        
                        return updatedFiles;
                    } else {
                        // Add new file with initial version
                        return [...prevFiles, {
                        file_id: `file-${Date.now()}`,
                        name: fileContent.based_filename,
                        latest_content: fileContent.based_content,
                        versions: [{
                            version_id: `v-${Date.now()}`,
                            diff: fileContent.based_content,
                            timestamp: currentTimestamp
                        }],
                        type: "based"
                        } as ChatFileBased];
                    }
                })
                
                // Update the editor if this is the currently selected file
                if (selectedBasedFileName === fileContent.based_filename) {
                  setSelectedBasedFileContent(fileContent.based_content);
                }
              }
            }
          }

          
          // Handle existing data format for conversation, models, files
          if (data.conversation) {
            setChatHistory(data.conversation);
          }
          if (data.models) {
            setModels(data.models);
          }
          if (data.chat_files_based) {
            setBasedFiles(data.chat_files_based);
            if (data.chat_files_based.length > 0 && !selectedBasedFileName) {
              handleBasedFileSelect(
                data.chat_files_based[0].name, 
                data.chat_files_based[0].latest_content
              );
            }
          }
          if (data.chat_files_text) {
            setContextFiles(data.chat_files_text);
          }
        } catch (err) {
          console.error("Error parsing WebSocket message", err);
          
          // If parsing fails, it might be a plain text message
          if (typeof event.data === 'string') {
            setChatHistory(prev => [
              ...prev, 
              { role: 'assistant', content: event.data, type: 'text' } as ChatMessage
            ]);
          }
        }
      };
      
      

    ws.onclose = () => {
      setIsSending(false);
      console.log("WebSocket connection closed");
    };
  }

  // Initialize WebSocket connection on mount
  useEffect(() => {
    if (chatId) {
      connectWebSocket();
    }
    // Cleanup on unmount
    return () => {
      wsRef.current?.close();
    };
  }, [chatId]);

  const ensureWebSocket = (): Promise<void> => {
    return new Promise((resolve) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        resolve();
      } else {
        // Reconnect and wait until open
        connectWebSocket();
        const interval = setInterval(() => {
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            clearInterval(interval);
            resolve();
          }
        }, 100); // check every 100ms
      }
    });
  };



  // Function to send a message via WebSocket
  const handleSend = async () => {

    setIsSending(true);
    // Make sure the WebSocket is connected
    await ensureWebSocket();

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        console.error("WebSocket is not connected.");
        return;
      }

    // Add user message to chat history immediately for better UX
    setChatHistory(prev => [
        ...prev,
        {
        role: "user",
        content: promptText,
        type: "text"
        } as ChatMessage // Type assertion to ensure compatibility
    ]);
  


    const messageData = {
        action: "new_message",
        prompt: promptText,
        model: selectedModel,
        is_first_prompt: basedFiles.length === 0 || chatHistory.length === 0,
        is_chat_or_composer: !isChatOrComposer,
        selected_filename: selectedBasedFileName,
        chat_files_based: basedFiles, // <-- add this line
        chat_files_text: contextFiles  // (optional, if needed)
    };      
    wsRef.current.send(JSON.stringify(messageData));
    setPromptText("");
  };

  return (
    <div 
      className="h-screen"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <ResizablePanelGroup direction="horizontal" className="h-full w-screen">
        {/* Left Panel: Code Viewer */}
        <ResizablePanel className="p-4 w-1/3 ">
          <div className="language-python bg-neutral-950 overflow-y-auto h-lvh p-2">
            <pre style={{ whiteSpace: "pre-wrap" }} className="text-xs">
                <Editor
                    value={selectedBasedFileContent}
                    onValueChange={code => setSelectedBasedFileContent(code)}
                    highlight={code => highlight(code, languages.js)}
                    padding={10}
                    style={{
                        fontSize: 12,
                        outline: "none",
                        border: "none",
                        height: "100%"
                    }}
                />
            </pre>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        
        {/* Right Section: Contains header with breadcrumb and right panels */}
        <ResizablePanel className="flex flex-col w-2/3">
          {/* Header / Breadcrumb */}
          <div className="border-b p-2 flex items-center justify-between">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">{breadcrumbWorkspace}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>{breadcrumbChat}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <Button onClick={() => setViewMode(viewMode === "chat" ? "diff" : "chat")} className="bg-neutral-950 hover:bg-neutral-800 text-white cursor-pointer">
               {viewMode === "chat" ? <History /> : <MessageSquare />}
            </Button>
          </div>
          {/* Container for middle and right panels */}
          <ResizablePanelGroup direction="horizontal" className="flex flex-1 overflow-hidden">
            {/* Middle Panel: File Explorer and Model Combobox */}
            <ResizablePanel className="w-1/3 border-r flex flex-col">
              {/* Model Combobox */}
              <div className="">
                <Select
                  value={selectedModel}
                  onValueChange={setSelectedModel}
                >
                    <SelectTrigger className="w-full p-6 rounded-none bg-neutral-950 text-white border-0 border-b-1 cursor-pointer mb-1">
                        <SelectValue placeholder="Model" />
                    </SelectTrigger>
                  
                  <SelectContent>
                    {models.map((model, idx) => (
                        <SelectItem 
                            className=" cursor-pointer outline-0"
                            key={idx} value={model}>{model}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* File Explorer */}
              <div className="p-2 flex-1 overflow-auto">
                <div className="flex justify-between align-center"> 
                    <h2 className="text-sm text-neutral-400 mb-2">FILES </h2>
                    <Button variant="ghost" className="cursor-pointer">
                        <Upload />
                    </Button>
                </div>
                <h2 className="text-xs text-neutral-400 mt-4 mb-2">BASED</h2>
                {basedFiles.map((file) => (
                  <div 
                    key={file.file_id} 
                    className="p-2 rounded mb-1 cursor-pointer hover:bg-neutral-800"
                    onClick={() => handleBasedFileSelect(file.name, file.latest_content)}
                  >
                    {file.name}
                  </div>
                ))}
                <h2 className="text-xs text-neutral-400 mt-4 mb-2">CONTEXT</h2>
                {contextFiles.map((file) => (
                  <div key={file.file_id} className="p-2 text-base rounded mb-1 cursor-pointer hover:bg-neutral-800">
                    {file.name}
                  </div>
                ))}
                <div className="mt-4">
                  
                </div>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            {/* Right Panel: Chat / Diff Explorer */}
            <ResizablePanel className="flex-1 flex flex-col">
              {/* Content area for chat history or diff explorer */}
              <div className="flex-1 p-2 overflow-auto">
                {viewMode === "chat" ? (
                  <div>
                    {chatHistory.map((msg, idx) => (
                        <div key={idx} className={`mb-2 p-2 rounded ${msg.role === "user" ? "bg-neutral-900" : "bg-neutral-950"}`}>
                            {msg.type === 'file' ? (
                            <div>
                                <div className="font-medium mb-1">
                                {msg.role === 'user' ? 'You' : 'Assistant'} 
                                {' '} shared a file
                                </div>
                                {typeof msg.content === 'string' && msg.content.includes('based_filename') ? (
                                (() => {
                                    try {
                                    const fileData = JSON.parse(msg.content) as {based_filename: string, based_content: string};
                                    return (
                                        <div>
                                        <div className="text-sm text-blue-400 underline cursor-pointer" 
                                            onClick={() => handleBasedFileSelect(fileData.based_filename, fileData.based_content)}>
                                            {fileData.based_filename}
                                        </div>
                                        {fileData.based_content && fileData.based_content.length < 500 && (
                                            <pre className="mt-2 bg-black rounded p-2 text-xs overflow-x-auto">
                                            {fileData.based_content}
                                            </pre>
                                        )}
                                        </div>
                                    );
                                    } catch (e) {
                                    return <div>{msg.content}</div>;
                                    }
                                })()
                                ) : (
                                <div>{msg.content}</div>
                                )}
                            </div>
                            ) : (
                            <div>
                                <div className="font-medium mb-1">
                                {/* {msg.role === 'user' ? 'You' : 'Assistant'} */}
                                </div>
                                <div className="whitespace-pre-wrap">{msg.content}</div>
                            </div>
                            )}
                        </div>
                    ))}


                  </div>
                ) : (
                    <VersionDiffExplorer 
                        basedFiles={basedFiles}
                        selectedBasedFileName={selectedBasedFileName}
                        selectedBasedFileContent={selectedBasedFileContent}
                        wsRef={wsRef}
                    />
                )}
              </div>
              {/* Footer: Prompt Box */}
              <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 w-full max-w-2xl border p-5 bg-neutral-950">
                <Textarea
                  placeholder="Enter message..."
                  className="w-full p-4 border rounded-5 mb-5 text-white"
                  rows={3}
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {/* Placeholder for chat/composer switch */}
                    <Switch onCheckedChange={setIsChatOrComposer} />
                    
                    <span className="ml-2">{isChatOrComposer ? "CHAT" : "COMPOSER"}</span>
                    <div className="ml-4">
                        {/* Placeholder for help icon */}
                        <Button variant="ghost" className="cursor-pointer">
                            <CircleHelp />
                            Help
                        </Button>
                    </div>
                  </div>
                  
                  <div>
                    {isSending ? (
                        <Button disabled>
                            <Loader2 className="animate-spin" />
                            <Send />
                        </Button>
                    ) : (
                        <Button onClick={handleSend} className="cursor-pointer">
                            <Send />
                        </Button>
                    )}
                    
                  </div>
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
