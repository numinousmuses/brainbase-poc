// components/WorkspaceCombobox.tsx
"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { ChevronsUpDown } from "lucide-react";

interface WorkspaceType {
  id: string;
  name: string;
  files: any[];
  chats: any[];
}

interface WorkspaceComboboxProps {
  selectedWorkspace: WorkspaceType;
  onSelect: (ws: WorkspaceType) => void;
  onNewWorkspace: () => void;
  allWorkspaces: WorkspaceType[]
}

export function WorkspaceCombobox({
  selectedWorkspace,
  onSelect,
  onNewWorkspace,
  allWorkspaces
}: WorkspaceComboboxProps) {
  // Dummy list – in a real scenario, these would come from your user data.
  const workspaces: WorkspaceType[] = [
    {
      id: "new",
      name: "+ New Workspace",
      files: [],
      chats: [],
    },
    // ...other workspaces
    ...allWorkspaces,
  ];

//   console.log(selectedWorkspace)

  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="w-full p-7 justify-between rounded-none cursor-pointer">
          {selectedWorkspace.name}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-neutral-950 border border-neutral-800 rounded-none">
        <div className="flex flex-col">
            {workspaces.map((ws, index) => (
                <Button
                    key={`${ws.id}-${index}`}
                    variant="ghost"
                    className="justify-start rounded-none w-full cursor-pointer"
                    onClick={() => {
                    setOpen(false);
                    if (ws.id === "new") {
                        onNewWorkspace();
                    } else {
                        onSelect(ws);
                    }
                    }}
                >
                    {ws.name}
                </Button>
            ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
