# VizThink AI Specification (Updated)

## 1. Project Overview

### 1.1 Purpose
VizThink AI is a desktop application designed for visual thinkers ("VizThinkers") to interact with large language models (LLMs) through a node-based, interactive graph interface. It replaces linear chat formats with a dynamic, web-like structure where prompts and responses form nodes connected by edges, reflecting non-linear thought processes.

### 1.2 Objectives
- Provide a node-based interface for LLM interactions, enabling users to create, navigate, and visualize idea graphs.
- Support deep dives (vertical connections) and tangents (horizontal connections) to mirror complex thought patterns.
- Enable local storage of multiple graph sessions for offline access and persistence.
- Deliver a secure, polished, cross-platform desktop experience with an intuitive UI/UX.
- Consolidate all nodes and connections to generate a holistic report for your chat graph.
- Ensure extensibility for future features like collaboration, multimedia nodes, and graph exports.

### 1.3 Target Audience
VizThinkers: Individuals who prefer visual, networked thinking, including researchers, creatives, and professionals organizing complex ideas.

## 2. Functional Requirements

### 2.1 Core Features
1. **Node-Based Chats**:
   - Users can create a root node with an initial prompt.
   - Add follow-up nodes (vertical connections) or branching nodes (horizontal connections).
   - Nodes contain text content (prompt or LLM response).
2. **Dynamic Graph**:
   - Display nodes and edges in an interactive graph with clear visual distinctions for connection types.
   - Support drag-and-drop, pan, and zoom for navigation.
3. **LLM Integration**:
   - Send node content to an LLM (e.g., OpenAI GPT-4) and display responses as new nodes.
   - Maintain context for follow-up prompts within the same branch.
4. **Interactive Canvas**:
   - Provide a responsive canvas for graph manipulation (e.g., rearranging nodes, collapsing branches).
   - Include context menus for node actions (e.g., edit, delete, branch).
5. **Save & Load**:
   - Save multiple graph sessions locally as SQLite records.
   - Load previous sessions by graph ID to resume work.
6. **Consolidate**
   - Consolidate all nodes and connections to generate a holistic report for your chat graph.

### 2.2 User Stories
- As a VizThinker, I want to see my chat as a graph to track how ideas connect.
- As a VizThinker, I want to branch off a specific point in an LLM response to dig into it without losing the main thread.
- As a VizThinker, I want to save and load multiple idea graphs locally.

### 2.3 Future Features

- Multimedia nodes (images, links).
- Export graphs as PNG or JSON.
- Real-time collaboration for multiple users.
- Search functionality for large graphs.# VizThink AI Specification (Updated)

## 1. Project Overview

### 1.1 Purpose
VizThink AI is a desktop application designed for visual thinkers ("VizThinkers") to interact with large language models (LLMs) through a node-based, interactive graph interface. It replaces linear chat formats with a dynamic, web-like structure where prompts and responses form nodes connected by edges, reflecting non-linear thought processes.

### 1.2 Objectives
- Provide a node-based interface for LLM interactions, enabling users to create, navigate, and visualize idea graphs.
- Support deep dives (vertical connections) and tangents (horizontal connections) to mirror complex thought patterns.
- Enable local storage of multiple graph sessions for offline access and persistence.
- Deliver a secure, polished, cross-platform desktop experience with an intuitive UI/UX.
- Ensure extensibility for future features like collaboration, multimedia nodes, and graph exports.

### 1.3 Target Audience
VizThinkers: Individuals who prefer visual, networked thinking, including researchers, creatives, and professionals organizing complex ideas.

## 2. Functional Requirements

### 2.1 Core Features
1. **Node-Based Chats**:
   - Users can create a root node with an initial prompt.
   - Add follow-up nodes (vertical connections) or branching nodes (horizontal connections).
   - Nodes contain text content (prompt or LLM response).
2. **Dynamic Graph**:
   - Display nodes and edges in an interactive graph with clear visual distinctions for connection types.
   - Support drag-and-drop, pan, and zoom for navigation.
3. **LLM Integration**:
   - Send node content to an LLM (e.g., OpenAI GPT-4) and display responses as new nodes.
   - Maintain context for follow-up prompts within the same branch.
4. **Interactive Canvas**:
   - Provide a responsive canvas for graph manipulation (e.g., rearranging nodes, collapsing branches).
   - Include context menus for node actions (e.g., edit, delete, branch).
5. **Save & Load**:
   - Save multiple graph sessions locally as SQLite records.
   - Load previous sessions by graph ID to resume work.

### 2.2 User Stories
- As a VizThinker, I want to see my chat as a graph to track how ideas connect.
- As a VizThinker, I want to branch off a specific point in an LLM response to dig into it without losing the main thread.
- As a VizThinker, I want to save and load multiple idea graphs locally.

### 2.3 Future Features
- Custom node layouts via drag-and-drop.
- Multimedia nodes (images, links).
- Export graphs as PNG or JSON.
- Real-time collaboration for multiple users.
- Search functionality for large graphs.

## 3. Non-Functional Requirements
- **Performance**: Smooth graph rendering for up to 500 nodes; API response time under 2 seconds (excluding LLM latency).
- **Usability**: Intuitive UI/UX with accessibility (WCAG compliance).
- **Portability**: Cross-platform support (Windows, macOS, Linux); installation <500 MB.
- **Security**: Secure API key storage; sanitized inputs; secure Electron configuration.
- **Extensibility**: Modular codebase for future features.
- **Offline Capability**: Local storage 

## 4. Tech Stack

### 4.1 Frontend
- **Framework**: **React** (18.x) for a component-based, dynamic UI.
- **Graph Library**: **React Flow** (current package: `reactflow`, replacing deprecated `react-flow-renderer`) for node-based graph rendering with drag-and-drop, pan, zoom, and edge connections.
- **UI Library**: **Chakra UI** for accessible, responsive components (modals, buttons, toolbars).
- **State Management**: **Zustand** for lightweight, scalable state management of nodes and edges.
- **HTTP Client**: **Axios** for API calls to the backend.
- **Desktop Framework**: **Electron** (25.x) for cross-platform desktop deployment.
- **Type System**: **TypeScript** for type safety and maintainability.
- **Testing**: **Jest** and **React Testing Library** for unit and integration tests.

### 4.2 Backend
- **Framework**: **FastAPI** for a high-performance, asynchronous API to handle LLM requests and local storage.
- **LLM Integration**:
  - **OpenAI API** (GPT-4) for cloud-based LLM interactions.
  - **Google Gemini** for cloud-based LLM interactions.
  - **Claude** for cloud-based LLM interactions.
- **Storage**: **SQLite** (via `aiosqlite` for async support) for structured storage of multiple graphs.
- **WebSocket**: FastAPI’s WebSocket support for future collaboration.
- **Testing**: **Pytest** for API endpoint tests.
- **Environment Management**: **Poetry** for dependency management.

### 4.3 Development Tools
- **IDE**: VS Code with TypeScript, Python, and Electron extensions.
- **Version Control**: Git with GitHub for collaboration and issue tracking.
- **Build Tools**: **Electron Builder** for packaging.
- **Linter/Formatter**: ESLint (frontend), Black (backend).

## 5. System Architecture

### 5.1 Overview
VizThink AI uses a client-server architecture within a desktop application:
- **Frontend (React + Electron)**: Handles UI, graph rendering, and user interactions. Communicates with the backend via HTTP (REST) or WebSocket (future).
- **Backend (Python + FastAPI)**: Manages LLM interactions, local storage, and session persistence. Runs as a child process within Electron.
- **Local Storage**: Stores multiple graphs in SQLite using `aiosqlite`.
- **LLM**: Integrates with external APIs (e.g., OpenAI) or local models.

### 5.2 Backend Process Management
- **Child Process**: The FastAPI server runs as a child process of Electron using Node.js’s `child_process` module.
- **Crash Handling**:
  - The Electron main process monitors the FastAPI child process using event listeners (`exit`, `error`).
  - If the server crashes, Electron restarts it automatically, logging the event and notifying the user via a non-intrusive toast message.
  - Example:
    ```javascript
    const { spawn } = require('child_process');
    let serverProcess;

    function startServer() {
        serverProcess = spawn('python', ['server/main.py'], { stdio: 'inherit' });
        serverProcess.on('exit', (code) => {
            if (code !== 0) {
                console.error('Server crashed, restarting...');
                startServer();
            }
        });
    }
    ```
- **Shutdown**: Electron gracefully terminates the child process on app exit.

### 5.3 Data Flow
1. User creates a node with a prompt in the React frontend.
2. Frontend sends the prompt to the FastAPI backend via POST `/graphs/{graph_id}/llm`.
3. Backend processes the prompt using LangChain and queries the LLM.
4. LLM response is stored as a new node in SQLite and returned to the frontend.
5. Frontend updates the graph with the new node and edge using React Flow.
6. User saves the graph, triggering POST `/graphs` to store in SQLite.

### 5.4 Data Models
- **Node**:
  ```python
  class Node(BaseModel):
      id: str            # Unique identifier (UUID)
      prompt: str       
      response: str          
      position: dict     # {x: float, y: float} for graph layout
      parent_id: str     # ID of parent node (optional, for storage)
  ```
- **Edge**:
  ```python
  class Edge(BaseModel):
      id: str            # Unique identifier
      source: str        # Source node ID
      target: str        # Target node ID
      type: str          # "vertical" (deep dive) or "horizontal" (branch)
  ```
- **Graph**:
  ```python
  class Graph(BaseModel):
      id: str            # Unique graph identifier
      nodes: List[Node]
      edges: List[Edge]
  ```
- **Storage Strategy**:
  - Store nodes with `parent_id` in SQLite to reconstruct edges on load, reducing redundancy.
  - Edges are maintained in memory by React Flow but regenerated from `parent_id` during load if needed.

## 6. Backend Specification (Python + FastAPI)

### 6.1 API Endpoints
- **POST /graphs**: Create or update a graph.
  - Input: `{id: str, nodes: [], edges: []}`
  - Output: `{status: str, graph_id: str}`
- **GET /graphs/{graph_id}**: Load a specific graph.
  - Output: `{id: str, nodes: [], edges: []}` or 404 if not found.
- **POST /graphs/{graph_id}/llm**: Query the LLM for a node, and update the response in the graph.
  - Input: `{id: str, prompt: str}`
  - Output: `{id: str, response: str}`
- **GET /health**: Check backend status.
  - Output: `{status: str}`

### 6.2 Implementation Details
- **FastAPI Setup**:
  - Use `uvicorn` to run the server locally (`http://localhost:8000`).
  - Enable CORS for React frontend communication.
  - Use `aiosqlite` for asynchronous SQLite operations.
  - Example:
    ```python
    from fastapi import FastAPI, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    from pydantic import BaseModel
    import aiosqlite
    import json
    from openai import OpenAI
    import os
    import uuid

    app = FastAPI()

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    class Node(BaseModel):
        id: str
        content: str
        type: str  # "prompt" or "response"
        position: dict
        parent_id: str | None = None

    class Graph(BaseModel):
        id: str
        nodes: list[Node]
        edges: list[dict]

    async def init_db():
        async with aiosqlite.connect("vizthink.db") as db:
            await db.execute("CREATE TABLE IF NOT EXISTS graphs (id TEXT PRIMARY KEY, data TEXT)")
            await db.commit()

    @app.on_event("startup")
    async def startup_event():
        await init_db()

    @app.post("/graphs")
    async def save_graph(graph: Graph):
        async with aiosqlite.connect("vizthink.db") as db:
            await db.execute("INSERT OR REPLACE INTO graphs (id, data) VALUES (?, ?)", (graph.id, json.dumps(graph.dict())))
            await db.commit()
        return {"status": "saved", "graph_id": graph.id}

    @app.get("/graphs/{graph_id}")
    async def load_graph(graph_id: str):
        async with aiosqlite.connect("vizthink.db") as db:
            cursor = await db.execute("SELECT data FROM graphs WHERE id = ?", (graph_id,))
            result = await cursor.fetchone()
            if result:
                return json.loads(result[0])
            raise HTTPException(status_code=404, detail="Graph not found")

    @app.get("/graphs")
    async def list_graphs():
        async with aiosqlite.connect("vizthink.db") as db:
            cursor = await db.execute("SELECT id FROM graphs")
            graph_ids = [row[0] async for row in cursor]
        return {"graph_ids": graph_ids}

    @app.post("/graphs/{graph_id}/llm")
    async def query_llm(graph_id: str, node: Node):
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": node.content}]
        )
        return {"id": node.id, "content": response.choices[0].message.content, "type": "response"}
    ```

## 7. Frontend Specification (React + Electron)

### 7.1 Components
- **GraphCanvas**: Renders the node-based graph using `reactflow`.
- **NodeEditor**: Modal for editing node content or adding prompts.
- **Toolbar**: Buttons for save/load, add node, and zoom controls.
- **App**: Root component integrating GraphCanvas, NodeEditor, and Toolbar.

### 7.2 Implementation Details
- **React Flow Setup**:
  - Use `reactflow` (not `react-flow-renderer`) for graph rendering.
  - Example:
    ```tsx
    import React, { useState } from 'react';
    import ReactFlow, { addEdge, Controls, Background } from 'reactflow';
    import 'reactflow/dist/style.css';
    import axios from 'axios';
    import { useGraphStore } from '../store';

    const GraphCanvas: React.FC<{ graphId: string }> = ({ graphId }) => {
        const { nodes, edges, addNode, addEdge } = useGraphStore();

        const onConnect = (params: any) => addEdge(params);

        const addNodeHandler = async (content: string) => {
            const response = await axios.post(`http://localhost:8000/graphs/${graphId}/llm`, {
                id: `node-${nodes.length + 1}`,
                content,
                type: 'prompt',
                position: { x: Math.random() * 500, y: Math.random() * 500 },
            });
            addNode({ ...response.data, position: { x: Math.random() * 500, y: Math.random() * 500 } });
        };

        return (
            <div style={{ height: '100vh' }}>
                <ReactFlow nodes={nodes} edges={edges} onConnect={onConnect}>
                    <Controls />
                    <Background />
                </ReactFlow>
                <button onClick={() => addNodeHandler('Ask something...')}>Add Node</button>
            </div>
        );
    };

    export default GraphCanvas;
    ```
- **Electron Setup**:
  - Use secure configuration with `contextIsolation: true` and `nodeIntegration: false`.
  - Implement a preload script for safe communication:
    ```javascript
    // electron.js
    const { app, BrowserWindow, ipcMain } = require('electron');
    const { spawn } = require('child_process');
    const path = require('path');

    let serverProcess;

    function startServer() {
        serverProcess = spawn('python', [path.join(__dirname, '../server/main.py')], { stdio: 'inherit' });
        serverProcess.on('exit', (code) => {
            if (code !== 0) {
                console.error('Server crashed, restarting...');
                startServer();
            }
        });
    }

    function createWindow() {
        const win = new BrowserWindow({
            width: 1200,
            height: 800,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                preload: path.join(__dirname, 'preload.js'),
            },
        });
        win.loadURL('http://localhost:3000');
    }

    app.whenReady().then(() => {
        startServer();
        createWindow();
    });

    app.on('window-all-closed', () => {
        if (serverProcess) serverProcess.kill();
        if (process.platform !== 'darwin') app.quit();
    });

    // Handle server status checks
    ipcMain.handle('check-server', async () => {
        return serverProcess && !serverProcess.killed ? 'running' : 'stopped';
    });
    ```
  - Preload script (`preload.js`):
    ```javascript
    const { contextBridge, ipcRenderer } = require('electron');

    contextBridge.exposeInMainWorld('electronAPI', {
        checkServer: () => ipcRenderer.invoke('check-server'),
    });
    ```
  - React usage:
    ```tsx
    const serverStatus = await window.electronAPI.checkServer();
    ```
- **State Management**:
  - Zustand for nodes, edges, and active graph ID:
    ```tsx
    import create from 'zustand';

    type GraphState = {
        nodes: any[];
        edges: any[];
        graphId: string;
        setGraphId: (id: string) => void;
        addNode: (node: any) => void;
        addEdge: (edge: any) => void;
    };

    const useGraphStore = create<GraphState>((set) => ({
        nodes: [],
        edges: [],
        graphId: '',
        setGraphId: (id) => set({ graphId: id }),
        addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
        addEdge: (edge) => set((state) => ({ edges: [...state.edges, edge] })),
    }));
    ```

## 8. Development Roadmap

### Phase 1 (6 Weeks): Core Functionality
- **Backend**: FastAPI with `/graphs`, `/graphs/{graph_id}`, `/graphs/{graph_id}/llm` endpoints using `aiosqlite`.
- **Frontend**: GraphCanvas with `reactflow`, NodeEditor, and Electron with secure configuration.
- **Deliverables**: MVP with node-based chats, LLM integration, and multi-graph storage.

### Phase 2 (4 Weeks): UI/UX Polish
- **Backend**: Optimize LLM caching and add validation.
- **Frontend**: Enhance graph layout (dagre), add context menus, and implement save/load.
- **Feedback Loop**: Gather feedback from a closed group of VizThinkers via GitHub Discussions or a survey to prioritize UI/UX improvements.
- **Deliverables**: Polished UI with user-driven refinements.

### Phase 3 (2 Weeks): Testing and Release
- **Testing**: Unit tests (Pytest, Jest) and user testing with VizThinkers.
- **Release**: Package with Electron Builder for cross-platform distribution; publish beta on GitHub.
- **Deliverables**: Beta release with documentation.

### Future Features
- Custom node layouts, multimedia nodes, PNG/JSON export, collaboration, and search.

## 9. Implementation Considerations
- **Performance**: Use `useMemo` for graph rendering; virtualize large graphs.
- **Security**: Secure Electron with `contextIsolation`; sanitize inputs with `bleach`.
- **Usability**: WCAG compliance; onboarding tooltips.
- **Extensibility**: Modular backend (LLM, storage) and component-based frontend.

## 10. Contributing
- Use GitHub for issues, PRs, and feedback via Discussions.
- Enforce ESLint and Black for code consistency.

## 11. License
- MIT License for free use, modification, and distribution.

## 12. Conclusion
This updated specification addresses critical issues, including deprecated libraries (`reactflow`), secure Electron configuration, async SQLite operations, multi-graph support, and clarified data models. The React + Python + Electron stack ensures a robust, user-friendly application for VizThinkers, with a clear roadmap for development and future enhancements.

## 3. Non-Functional Requirements
- **Performance**: Smooth graph rendering for up to 50 nodes; API response time under 2 seconds (excluding LLM latency).
- **Usability**: Intuitive UI/UX with accessibility (WCAG compliance).
- **Portability**: Cross-platform support (Windows, macOS, Linux); installation <500 MB.
- **Security**: Secure API key storage; sanitized inputs; secure Electron configuration.
- **Extensibility**: Modular codebase for future features.
- **Offline Capability**: Local storage and optional offline LLM hosting.

## 4. Tech Stack

### 4.1 Frontend
- **Framework**: **React** (18.x) for a component-based, dynamic UI.
- **Graph Library**: **React Flow** (current package: `reactflow`, replacing deprecated `react-flow-renderer`) for node-based graph rendering with drag-and-drop, pan, zoom, and edge connections.
- **UI Library**: **Chakra UI** for accessible, responsive components (modals, buttons, toolbars).
- **State Management**: **Zustand** for lightweight, scalable state management of nodes and edges.
- **HTTP Client**: **Axios** for API calls to the backend.
- **Desktop Framework**: **Electron** (25.x) for cross-platform desktop deployment.
- **Type System**: **TypeScript** for type safety and maintainability.
- **Testing**: **Jest** and **React Testing Library** for unit and integration tests.

### 4.2 Backend
- **Framework**: **FastAPI** for a high-performance, asynchronous API to handle LLM requests and local storage.
- **LLM Integration**:
  - **OpenAI API** (GPT-4) for cloud-based LLM interactions.
  - **LangChain** for prompt context and response parsing.
  - **Hugging Face Transformers** (optional) for local LLM hosting.
- **Storage**: **SQLite** (via `aiosqlite` for async support) for structured storage of multiple graphs.
- **WebSocket**: FastAPI’s WebSocket support for future collaboration.
- **Testing**: **Pytest** for API endpoint tests.
- **Environment Management**: **Poetry** for dependency management.

### 4.3 Development Tools
- **IDE**: VS Code with TypeScript, Python, and Electron extensions.
- **Version Control**: Git with GitHub for collaboration and issue tracking.
- **Build Tools**: **Electron Builder** for packaging.
- **Linter/Formatter**: ESLint (frontend), Black (backend).

## 5. System Architecture

### 5.1 Overview
VizThink AI uses a client-server architecture within a desktop application:
- **Frontend (React + Electron)**: Handles UI, graph rendering, and user interactions. Communicates with the backend via HTTP (REST) or WebSocket (future).
- **Backend (Python + FastAPI)**: Manages LLM interactions, local storage, and session persistence. Runs as a child process within Electron.
- **Local Storage**: Stores multiple graphs in SQLite using `aiosqlite`.
- **LLM**: Integrates with external APIs (e.g., OpenAI) or local models.

### 5.2 Backend Process Management
- **Child Process**: The FastAPI server runs as a child process of Electron using Node.js’s `child_process` module.
- **Crash Handling**:
  - The Electron main process monitors the FastAPI child process using event listeners (`exit`, `error`).
  - If the server crashes, Electron restarts it automatically, logging the event and notifying the user via a non-intrusive toast message.
  - Example:
    ```javascript
    const { spawn } = require('child_process');
    let serverProcess;

    function startServer() {
        serverProcess = spawn('python', ['server/main.py'], { stdio: 'inherit' });
        serverProcess.on('exit', (code) => {
            if (code !== 0) {
                console.error('Server crashed, restarting...');
                startServer();
            }
        });
    }
    ```
- **Shutdown**: Electron gracefully terminates the child process on app exit.

### 5.3 Data Flow
1. User creates a node with a prompt in the React frontend.
2. Frontend sends the prompt to the FastAPI backend via POST `/graphs/{graph_id}/llm`.
3. Backend processes the prompt using LangChain and queries the LLM.
4. LLM response is stored as a new node in SQLite and returned to the frontend.
5. Frontend updates the graph with the new node and edge using React Flow.
6. User saves the graph, triggering POST `/graphs` to store in SQLite.

### 5.4 Data Models
- **Node**:
  ```python
  class Node(BaseModel):
      id: str            # Unique identifier (UUID)
      content: str       # Prompt or LLM response
      type: str          # "prompt" or "response"
      position: dict     # {x: float, y: float} for graph layout
      parent_id: str     # ID of parent node (optional, for storage)
  ```
- **Edge**:
  ```python
  class Edge(BaseModel):
      id: str            # Unique identifier
      source: str        # Source node ID
      target: str        # Target node ID
      type: str          # "vertical" (deep dive) or "horizontal" (branch)
  ```
- **Graph**:
  ```python
  class Graph(BaseModel):
      id: str            # Unique graph identifier
      nodes: List[Node]
      edges: List[Edge]
  ```
- **Storage Strategy**:
  - Store nodes with `parent_id` in SQLite to reconstruct edges on load, reducing redundancy.
  - Edges are maintained in memory by React Flow but regenerated from `parent_id` during load if needed.

## 6. Backend Specification (Python + FastAPI)

### 6.1 API Endpoints
- **POST /graphs**: Create or update a graph.
  - Input: `{id: str, nodes: [], edges: []}`
  - Output: `{status: str, graph_id: str}`
- **GET /graphs/{graph_id}**: Load a specific graph.
  - Output: `{id: str, nodes: [], edges: []}` or 404 if not found.
- **POST /graphs/{graph_id}/llm**: Query the LLM for a node.
  - Input: `{id: str, content: str, type: str}`
  - Output: `{id: str, content: str, type: str}`
- **GET /graphs**: List all graph IDs.
  - Output: `{graph_ids: []}`
- **GET /health**: Check backend status.
  - Output: `{status: str}`

### 6.2 Implementation Details
- **FastAPI Setup**:
  - Use `uvicorn` to run the server locally (`http://localhost:8000`).
  - Enable CORS for React frontend communication.
  - Use `aiosqlite` for asynchronous SQLite operations.
  - Example:
    ```python
    from fastapi import FastAPI, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    from pydantic import BaseModel
    import aiosqlite
    import json
    from openai import OpenAI
    import os
    import uuid

    app = FastAPI()

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    class Node(BaseModel):
        id: str
        content: str
        type: str  # "prompt" or "response"
        position: dict
        parent_id: str | None = None

    class Graph(BaseModel):
        id: str
        nodes: list[Node]
        edges: list[dict]

    async def init_db():
        async with aiosqlite.connect("vizthink.db") as db:
            await db.execute("CREATE TABLE IF NOT EXISTS graphs (id TEXT PRIMARY KEY, data TEXT)")
            await db.commit()

    @app.on_event("startup")
    async def startup_event():
        await init_db()

    @app.post("/graphs")
    async def save_graph(graph: Graph):
        async with aiosqlite.connect("vizthink.db") as db:
            await db.execute("INSERT OR REPLACE INTO graphs (id, data) VALUES (?, ?)", (graph.id, json.dumps(graph.dict())))
            await db.commit()
        return {"status": "saved", "graph_id": graph.id}

    @app.get("/graphs/{graph_id}")
    async def load_graph(graph_id: str):
        async with aiosqlite.connect("vizthink.db") as db:
            cursor = await db.execute("SELECT data FROM graphs WHERE id = ?", (graph_id,))
            result = await cursor.fetchone()
            if result:
                return json.loads(result[0])
            raise HTTPException(status_code=404, detail="Graph not found")

    @app.get("/graphs")
    async def list_graphs():
        async with aiosqlite.connect("vizthink.db") as db:
            cursor = await db.execute("SELECT id FROM graphs")
            graph_ids = [row[0] async for row in cursor]
        return {"graph_ids": graph_ids}

    @app.post("/graphs/{graph_id}/llm")
    async def query_llm(graph_id: str, node: Node):
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": node.content}]
        )
        return {"id": node.id, "content": response.choices[0].message.content, "type": "response"}
    ```

## 7. Frontend Specification (React + Electron)

### 7.1 Components
- **GraphCanvas**: Renders the node-based graph using `reactflow`.
- **NodeEditor**: Modal for editing node content or adding prompts.
- **Toolbar**: Buttons for save/load, add node, and zoom controls.
- **App**: Root component integrating GraphCanvas, NodeEditor, and Toolbar.

### 7.2 Implementation Details
- **React Flow Setup**:
  - Use `reactflow` (not `react-flow-renderer`) for graph rendering.
  - Example:
    ```tsx
    import React, { useState } from 'react';
    import ReactFlow, { addEdge, Controls, Background } from 'reactflow';
    import 'reactflow/dist/style.css';
    import axios from 'axios';
    import { useGraphStore } from '../store';

    const GraphCanvas: React.FC<{ graphId: string }> = ({ graphId }) => {
        const { nodes, edges, addNode, addEdge } = useGraphStore();

        const onConnect = (params: any) => addEdge(params);

        const addNodeHandler = async (content: string) => {
            const response = await axios.post(`http://localhost:8000/graphs/${graphId}/llm`, {
                id: `node-${nodes.length + 1}`,
                content,
                type: 'prompt',
                position: { x: Math.random() * 500, y: Math.random() * 500 },
            });
            addNode({ ...response.data, position: { x: Math.random() * 500, y: Math.random() * 500 } });
        };

        return (
            <div style={{ height: '100vh' }}>
                <ReactFlow nodes={nodes} edges={edges} onConnect={onConnect}>
                    <Controls />
                    <Background />
                </ReactFlow>
                <button onClick={() => addNodeHandler('Ask something...')}>Add Node</button>
            </div>
        );
    };

    export default GraphCanvas;
    ```
- **Electron Setup**:
  - Use secure configuration with `contextIsolation: true` and `nodeIntegration: false`.
  - Implement a preload script for safe communication:
    ```javascript
    // electron.js
    const { app, BrowserWindow, ipcMain } = require('electron');
    const { spawn } = require('child_process');
    const path = require('path');

    let serverProcess;

    function startServer() {
        serverProcess = spawn('python', [path.join(__dirname, '../server/main.py')], { stdio: 'inherit' });
        serverProcess.on('exit', (code) => {
            if (code !== 0) {
                console.error('Server crashed, restarting...');
                startServer();
            }
        });
    }

    function createWindow() {
        const win = new BrowserWindow({
            width: 1200,
            height: 800,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                preload: path.join(__dirname, 'preload.js'),
            },
        });
        win.loadURL('http://localhost:3000');
    }

    app.whenReady().then(() => {
        startServer();
        createWindow();
    });

    app.on('window-all-closed', () => {
        if (serverProcess) serverProcess.kill();
        if (process.platform !== 'darwin') app.quit();
    });

    // Handle server status checks
    ipcMain.handle('check-server', async () => {
        return serverProcess && !serverProcess.killed ? 'running' : 'stopped';
    });
    ```
  - Preload script (`preload.js`):
    ```javascript
    const { contextBridge, ipcRenderer } = require('electron');

    contextBridge.exposeInMainWorld('electronAPI', {
        checkServer: () => ipcRenderer.invoke('check-server'),
    });
    ```
  - React usage:
    ```tsx
    const serverStatus = await window.electronAPI.checkServer();
    ```
- **State Management**:
  - Zustand for nodes, edges, and active graph ID:
    ```tsx
    import create from 'zustand';

    type GraphState = {
        nodes: any[];
        edges: any[];
        graphId: string;
        setGraphId: (id: string) => void;
        addNode: (node: any) => void;
        addEdge: (edge: any) => void;
    };

    const useGraphStore = create<GraphState>((set) => ({
        nodes: [],
        edges: [],
        graphId: '',
        setGraphId: (id) => set({ graphId: id }),
        addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
        addEdge: (edge) => set((state) => ({ edges: [...state.edges, edge] })),
    }));
    ```

## 8. Development Roadmap

### Phase 1 (6 Weeks): Core Functionality
- **Backend**: FastAPI with `/graphs`, `/graphs/{graph_id}`, `/graphs/{graph_id}/llm` endpoints using `aiosqlite`.
- **Frontend**: GraphCanvas with `reactflow`, NodeEditor, and Electron with secure configuration.
- **Deliverables**: MVP with node-based chats, LLM integration, and multi-graph storage.

### Phase 2 (4 Weeks): UI/UX Polish
- **Backend**: Optimize LLM caching and add validation.
- **Frontend**: Enhance graph layout (dagre), add context menus, and implement save/load.
- **Feedback Loop**: Gather feedback from a closed group of VizThinkers via GitHub Discussions or a survey to prioritize UI/UX improvements.
- **Deliverables**: Polished UI with user-driven refinements.

### Phase 3 (2 Weeks): Testing and Release
- **Testing**: Unit tests (Pytest, Jest) and user testing with VizThinkers.
- **Release**: Package with Electron Builder for cross-platform distribution; publish beta on GitHub.
- **Deliverables**: Beta release with documentation.

### Future Features
- Custom node layouts, multimedia nodes, PNG/JSON export, collaboration, and search.

## 9. Implementation Considerations
- **Performance**: Use `useMemo` for graph rendering; virtualize large graphs.
- **Security**: Secure Electron with `contextIsolation`; sanitize inputs with `bleach`.
- **Usability**: WCAG compliance; onboarding tooltips.
- **Extensibility**: Modular backend (LLM, storage) and component-based frontend.

## 10. Contributing
- Use GitHub for issues, PRs, and feedback via Discussions.
- Enforce ESLint and Black for code consistency.

## 11. License
- MIT License for free use, modification, and distribution.

## 12. Conclusion
This updated specification addresses critical issues, including deprecated libraries (`reactflow`), secure Electron configuration, async SQLite operations, multi-graph support, and clarified data models. The React + Python + Electron stack ensures a robust, user-friendly application for VizThinkers, with a clear roadmap for development and future enhancements.