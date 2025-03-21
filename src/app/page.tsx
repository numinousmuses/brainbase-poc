"use client";

import * as React from "react";
import { useState } from "react";

// Shadcn UI components (adjust imports as needed)
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Workspace from "@/components/workspace/workspace";

// Sample data based on the /auth/login response docs.
const dummyWorkspaceData = {
  id: "workspace-uuid-string",
  name: "Default Workspace",
  files: [
    { id: "file-uuid-1", filename: "document.pdf" },
    { id: "file-uuid-2", filename: "notes.txt" }
  ],
  chats: [
    {
      id: "chat-uuid-string",
      name: "General Chat",
      last_updated: "2025-03-20T11:00:00"
      // num_versions is in the docs but our Workspace component uses chats without that key.
      // You can add it if needed.
    }
  ]
};

export default function Home() {
  const [email, setEmail] = useState("");
  const [workspaceData, setWorkspaceData] = useState(null);

  

  // Simple handler to POST to /auth/login
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const res = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        throw new Error(`Login request failed: ${res.status}`);
      }

      const data = await res.json();
      console.log("Login response:", data);
      // TODO: handle user_id, workspaces, etc. (e.g., store in context, redirect)

      setWorkspaceData(data)
    } catch (error) {
      console.error(error);
      // TODO: show error to user
    }
  };

  return (
    <>
    {workspaceData ? (
      <Workspace workspaceData={workspaceData} />
    ) : (
      <div className="dark min-h-screen flex items-center justify-center bg-gradient-to-b from-neutral-900 via-neutral-950 to-black text-neutral-100">
        <Card className="w-full max-w-md mx-auto bg-neutral-950 rounded-none">
          <CardHeader>
            <CardTitle className="text-xl">Sign in</CardTitle>
            <CardDescription>Enter your email to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="someone@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full mt-4">
                Sign in
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-neutral-500">
              Enter your email address to receive an register or log in.
            </p>
          </CardFooter>
        </Card>
      </div>
    )}
    </>
  );
}
