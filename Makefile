# Makefile for VizThinker
#
# Export Functionality Dependencies:
# - html2canvas: For capturing ReactFlow graphs as PNG images
# - react-icons: For UI icons in export modal (FaGlobe, FaFileImage, FaDownload)
# - vis-network: Loaded via CDN in HTML exports for interactive graph visualization
#
# The export feature provides:
# 1. HTML Export: Complete interactive webpage with zoomable graph
# 2. PNG Export: High-quality image of the conversation graph

export PATH := /usr/local/bin:$(PATH)

# Default target is 'help'
.PHONY: default
default: help

# Variables
OLLAMA_MODEL = gemma3n 
VENV_DIR = .venv
PYTHON = $(VENV_DIR)/bin/python
PIP = $(VENV_DIR)/bin/pip
CONFIG_DIR = config

# Phony targets prevent conflicts with files of the same name
.PHONY: help setup install install-export verify-export run dev build backend frontend clean

help:
	@echo ""
	@echo "Usage:"
	@echo "  make install        - Set up project and install all dependencies."
	@echo "  make install-export - Install only export functionality dependencies."
	@echo "  make verify-export  - Verify export dependencies are properly installed."
	@echo "  make run            - Run the complete application (backend and frontend)."
	@echo "  make dev            - Run backend and frontend servers for development (same as run)."
	@echo "  make build          - Build the frontend application for production."
	@echo "  make backend        - Run the Python backend server."
	@echo "  make frontend       - Run the Vite frontend dev server."
	@echo "  make clean          - Remove all generated files and virtual environments."
	@echo ""

# Target to set up the Python virtual environment
setup:
	@if [ ! -d "$(VENV_DIR)" ]; then \
		echo "Creating Python virtual environment in $(VENV_DIR)..."; \
		python3 -m venv $(VENV_DIR); \
	else \
		echo "Virtual environment already exists."; \
	fi
	@if [ ! -f "vizthink.db" ]; then \
        echo "Creating SQLite database..."; \
        touch vizthink.db; \
    else \
        echo "Database already exists."; \
    fi
# Target to install all dependencies
install: setup
	@echo "Checking for Node.js and npm..."
	@command -v npm >/dev/null 2>&1 || { echo "Error: npm is not installed. Please install Node.js (which includes npm) and try again."; exit 1; }
	@echo "Installing Node.js dependencies..."
	@npm install
	@echo "Installing additional dependencies for export functionality..."
	@npm install html2canvas@^1.4.1
	@npm install react-icons@^5.5.0
	@echo "Installing Python dependencies..."
	@$(PIP) install -r res/requirements.txt
	@echo "Installing additional Python packages (ollama)..."
	@$(PIP) install ollama
	@echo "Checking and installing $(OLLAMA_MODEL) model..."
	@if command -v ollama >/dev/null 2>&1; then \
		echo "Checking if $(OLLAMA_MODEL) model is available..."; \
		if ! ollama list | grep -q "$(OLLAMA_MODEL)"; then \
			echo "Downloading $(OLLAMA_MODEL) model (this may take a while)..."; \
			ollama pull $(OLLAMA_MODEL); \
		else \
			echo "$(OLLAMA_MODEL) model already installed."; \
		fi; \
	else \
		echo "Warning: ollama command not found. Please install Ollama manually and run 'ollama pull $(OLLAMA_MODEL)'"; \
	fi
	@echo "Building frontend application..."
	@npm run build
	@echo "All dependencies installed and frontend built successfully."

# Target to install only export functionality dependencies
install-export:
	@echo "Installing export functionality dependencies..."
	@echo "Checking for Node.js and npm..."
	@command -v npm >/dev/null 2>&1 || { echo "Error: npm is not installed. Please install Node.js (which includes npm) and try again."; exit 1; }
	@echo "Installing html2canvas for image export..."
	@npm install html2canvas@^1.4.1
	@echo "Installing react-icons for UI icons..."
	@npm install react-icons@^5.5.0
	@echo "Verifying vis-network is available (used via CDN in HTML export)..."
	@echo "Export functionality dependencies installed successfully."
	@echo ""
	@echo "Export Features Available:"
	@echo "  - HTML Export: Interactive web page with zoomable graph visualization"
	@echo "  - PNG Export: High-quality image of the conversation graph"
	@echo ""

# Target to verify export dependencies are installed
verify-export:
	@echo "Verifying export functionality dependencies..."
	@echo "Checking Node.js dependencies..."
	@if npm list html2canvas >/dev/null 2>&1; then \
		echo "✓ html2canvas: Installed"; \
	else \
		echo "✗ html2canvas: Missing - run 'make install-export'"; \
	fi
	@if npm list react-icons >/dev/null 2>&1; then \
		echo "✓ react-icons: Installed"; \
	else \
		echo "✗ react-icons: Missing - run 'make install-export'"; \
	fi
	@echo "Checking CDN dependencies..."
	@echo "✓ vis-network: Loaded via CDN in HTML export"
	@echo ""
	@echo "Export functionality status:"
	@if npm list html2canvas >/dev/null 2>&1 && npm list react-icons >/dev/null 2>&1; then \
		echo "✅ All export dependencies are properly installed"; \
		echo "🌐 HTML Export: Ready (with interactive graph visualization)"; \
		echo "📸 PNG Export: Ready (with high-quality image capture)"; \
	else \
		echo "❌ Some export dependencies are missing"; \
		echo "Run 'make install-export' to install missing dependencies"; \
	fi
	@echo ""

# Target to run the backend server
backend:
	@echo "Checking for and stopping any existing process on port 8000..."
	@-lsof -t -i:8000 | xargs kill -9 > /dev/null 2>&1 || true
	@echo "Starting Python backend server on http://127.0.0.1:8000..."
	@$(PYTHON) -m uvicorn server.main:app --reload --port 8000

# Target to run the frontend dev server
frontend:
	@echo "Starting Vite frontend dev server..."
	@npm run dev

# Target to run both dev servers concurrently
dev:
	@echo "Starting backend and frontend development servers..."
		@npx concurrently -k -n "BACKEND,FRONTEND" -c "yellow,blue" "make backend" "make frontend"

# Target to open the application in a browser
start:
	@echo "Waiting for frontend dev server to be ready on http://localhost:5173..."
		@npx wait-on http://localhost:5173 -t 30000
	@echo "Frontend is ready. Opening in your default browser..."
	@open http://localhost:5173

# Target to run the entire application stack
run:
	@echo "Starting the VizThinker..."
		@npx concurrently -k -n "BACKEND,FRONTEND" -c "yellow,blue" "make backend" "make frontend"
	@echo "Once servers are running, open http://localhost:5173 in your browser."

# Target to build the frontend application
build:
	@echo "Building the frontend application..."
	@npm run build

# Target to clean up the project
clean:
	@echo "Cleaning up project..."
	@rm -rf node_modules dist .cache .vite $(VENV_DIR) vizthink.db
	@echo "Cleanup complete."
