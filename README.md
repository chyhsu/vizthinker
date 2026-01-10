<p align="center">
  <img src="src/asset/images/Title.jpg" alt="VizThinker logo" width="1000" />
</p>

# VizThinker

**A visual AI thinking platform that transforms conversations into interactive node-based graphs.**

VizThinker combines AI-powered conversations with visual node-based thinking, letting you branch, connect, and explore concepts in an intuitive canvas. Move beyond linear chats and visualize the flow of your ideas.

> **Bring Your Own API Key** — Use your own API keys to access your preferred LLM models. VizThinker supports multiple providers, giving you full control over which AI powers your thinking.

## Screenshots

### Authentication Page
<p align="center">
  <img src="src/asset/images/auth_page.png" alt="VizThinker Auth Page" width="800" />
</p>

*Modern, minimalist authentication with secure password validation and an introduction to VizThinker's core features.*

### Main Interface
<p align="center">
  <img src="src/asset/images/main_interface.png" alt="VizThinker Main Interface" width="800" />
</p>

*Node-based conversation canvas where each prompt and response becomes a visual node you can branch and connect.*

### Settings Panel
<p align="center">
  <img src="src/asset/images/settings.png" alt="VizThinker Settings" width="500" />
</p>

*Configure your preferred LLM provider, API keys, and customize your experience.*

## Key Features

- **🧠 Node-Based Conversations**: Every prompt and response becomes a node in a graph. Create direct follow-ups or branch out to explore new ideas without losing context.
- **🔗 Visual Branching**: Differentiate between deep dives (vertical, solid lines) and exploratory tangents (horizontal, dotted lines) for a clear, organized thought process.
- **🔑 Bring Your Own API Key**: Use your own API keys to access your preferred models. Supports **Google (Gemini)**, **OpenAI (GPT)**, **Anthropic (Claude)**, **X (Grok)**, and local instances via **Ollama**.
- **🔐 Secure Authentication**: Modern login and signup system with password strength validation to keep your conversation maps private and persistent.
- **💾 Persistent Sessions**: Your conversations are automatically saved. Log in from anywhere and pick up right where you left off.
- **⚙️ Customizable Experience**: Use the settings panel to configure API keys, select your preferred provider and model, and customize the look and feel of your graph.
- **📤 Multiple Export Options**:
  - **HTML**: Export your conversation as a fully interactive, self-contained web page.
  - **PNG**: Save a high-quality image of your entire thinking map.
  - **Markdown**: Use the AI to generate a structured, professional summary of your conversation.
- **🖱️ Intuitive Interface**: A polished and responsive interface with an infinite canvas, smooth panning/zooming, and a clean, modern design.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React, Vite, TypeScript, Chakra UI, ReactFlow, Zustand |
| **Backend** | FastAPI (Python), Uvicorn |
| **Database** | PostgreSQL |
| **LLM Integration** | Google Gemini, OpenAI GPT, Anthropic Claude, X Grok, Ollama |

## Installation & Running

### Prerequisites
- Node.js & npm
- Python 3.11+
- PostgreSQL

### Quick Start

**1. Clone the repository:**
```bash
git clone https://github.com/jasoncyhsu/vizthinker.git
cd vizthinker
```

**2. Configure Environment Variables:**
Create a `.env` file in the root directory:
```env
DATABASE_URL=postgresql://vizthinker:password@localhost:5432/vizthinker
```

**3. Install Dependencies:**
```bash
make install
```
This will create a Python virtual environment (`.venv`) and install all required `npm` and `pip` packages.

**4. Build the Application:**
```bash
make build
```

**5. Run the Application:**
```bash
make run
```

The application will be available at:
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:8000`

## Running with Docker

Alternatively, you can run the entire application using Docker Compose.

**1. Clone and configure:**
```bash
git clone https://github.com/jasoncyhsu/vizthinker.git
cd vizthinker
```

Create a `.env` file as described above.

**2. Run with Docker Compose:**
```bash
docker-compose up --build
```

The application will be available at `http://localhost:8000`.

## Makefile Commands

| Command | Description |
|---------|-------------|
| `make install` | Set up project and install all dependencies |
| `make build` | Build the frontend application for production |
| `make run` | Run the complete application (backend + frontend) |
| `make dev` | Run development servers with hot reload |
| `make backend` | Run only the Python backend server |
| `make frontend` | Run only the Vite frontend dev server |
| `make clean` | Remove all generated files and virtual environments |

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
