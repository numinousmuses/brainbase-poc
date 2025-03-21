"use client";

import * as React from "react";
import { useState, useEffect } from "react";

// Shadcn UI components (adjust imports as needed)
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Workspace from "@/components/workspace/workspace";
import { AuthResponse } from "@/lib/interfaces";

export default function Home() {
  const [email, setEmail] = useState("");
  const [workspaceData, setWorkspaceData] = useState<AuthResponse | null>(null);

  // On mount, rehydrate from localStorage if available
  useEffect(() => {
    const storedAuth = localStorage.getItem("authResponse");
    if (storedAuth) {
      setWorkspaceData(JSON.parse(storedAuth));
    }
  }, []);

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
      
      // Save the auth response in localStorage
      localStorage.setItem("authResponse", JSON.stringify(data));
      setWorkspaceData(data);
    } catch (error) {
      console.error(error);
      // TODO: show error to user
    }
  };

  return (
    <>
      {workspaceData ? (
        <Workspace workspaceData={workspaceData.workspaces} />
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
                Enter your email address to register or log in.
              </p>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
}
