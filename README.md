# Brainbase Kafka POC

---

## Approach

1. **Plan the System**
2. **Build the System**

---

## Architecture Overview

### Frontend

**Technologies:**
- **Framework:** Next.js (TypeScript)
- **Styling:** Tailwind CSS
- **Additional:** Sharon (UI component framework or design system)

**Pages & Key Components:**

- **Root (/):**
  - Acts as both login and workspace.
  - Users enter their email; a UUID is generated and stored on the backend.
  - Lists all workspaces.
  - Options to:
    - Create new workspaces (with an optional file upload)
    - Rename and delete workspaces

- **Workspace:**
  - Displays a list of chats within the workspace.
  - Features:
    - Chat list with title, last edited time, and action buttons (open, chat, rename, delete).
    - Ability to create new chats.
    - File upload and deletion.
  - **Note:** Workspaces serve as file systems, and users can choose which files are used as context for each chat. Multi-workspace support is included.

- **Chat (/chat/{chatID}):**
  - Main chat interface including:
    - A canvas for agent-based code.
    - File management: view chat files and add workspace files to the chat context.
    - Agent version history with diff comparisons.

- **Settings:**
  - Input model API keys (with a fallback to an open router key).

**UI Elements:**
- Workspace Section
- Explorer Section
- File Section
- Chat UI components (Context, Help, Send)

---

### Backend

**Technologies:**
- **Language:** Python
- **Framework:** FastAPI
- **Communication:** Websockets

**Core Functions & Endpoints:**

- **Authentication:**
  - Very basic auth for development purposes.
  - Email-based login.
  - Checks for existing email; if new, generates and returns a UUID as a session token.

- **Workspace Management:**
  - Retrieve workspaces.
  - Create, rename, and delete workspaces.
  - Upload and delete files (supporting PDFs, text files, and images).

- **Chat Management:**
  - Create, rename, and delete chats.
  - Start chat sessions via websockets.
  - Persist chat history, files, messages, and version history.

- **Agent Interaction:**
  - **Based Agent (Initial Message Handling):**
    - Processes the first message using a “based guide” and an engineered prompt.
    - Integrates context from files (text extraction, image handling).
    - Supports multiple reasoning models (e.g., Claude 3.7, o1, o3mini, QWQ).
    - Validates output via an API and allows iterative reprompting (max 5 iterations).
  
  - **Iterator Agent (Diff Generation and Application):**
    - Generates and applies diffs to update the agent’s output.
    - Checks diff validity and reprompts if necessary (max 5 iterations).
    - Updates chat with the new version and displays diff comparisons.

- **Additional Functionalities:**
  - File upload handling and assignment to chats.
  - Context filtering to determine which parts of files should be sent as context.
  - Handling websocket disconnections:
    - Persist chat state, file associations, messages, and version history.

---

### Milestones

1. **Agent for Code Writing and Iteration:**
   - Develop an agent capable of generating and refining code.

2. **Agent for Diff Generation and Application:**
   - Create an agent that can produce diffs and apply them to update code.

3. **WebSocket Agent Integration:**
   - Implement the agent to work over websockets for real-time communication.

4. **Client Chat Interface:**
   - Build the frontend chat client to interact with the websocket agent.

---

## Additional Notes

- **Single-Page Application (SPA):**
  - Simplified authentication for the proof of concept.
  - Users can manage agents, chats, and workspaces seamlessly.

- **Multi-Workspace Support:**
  - Allows the user to manage multiple file systems.
  - Each chat can select which workspace files serve as context.

- **Agent Version Management:**
  - Track version history.
  - Allow users to revert to previous agent versions.

---

## Next Steps after POC

- **Scalability Enhancements**
- **Security Improvements**
- **File Viewing Capabilities**
- **Agent Testing**
- **UI/UX and Responsiveness Improvements**
- **Better memory handling**
- **Choose any version to compare diffs**
