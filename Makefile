# Makefile for VizThinker

# Default target is 'help'
.PHONY: default
default: help

# Variables
VENV_DIR = .venv
PYTHON = $(VENV_DIR)/bin/python
PIP = $(VENV_DIR)/bin/pip

# Phony targets prevent conflicts with files of the same name
.PHONY: help setup install run dev start build backend frontend clean

help:
	@echo "Makefile for VizThinker"
	@echo ""
	@echo "Usage:"
	@echo "  make install      - Set up project and install all dependencies."
	@echo "  make run          - Run the complete application (backend, frontend, and Electron)."
	@echo "  make dev          - Run backend and frontend servers for development."
	@echo "  make start        - Run the Electron app (use after 'make dev')."
	@echo "  make build        - Build the frontend application for production."
	@echo "  make backend      - Run the Python backend server."
	@echo "  make frontend     - Run the Vite frontend dev server."
	@echo "  make clean        - Remove all generated files and virtual environments."
	@echo ""

# Target to set up the Python virtual environment
setup:
	@if [ ! -d "$(VENV_DIR)" ]; then \
		echo "Creating Python virtual environment in $(VENV_DIR)..."; \
		python3 -m venv $(VENV_DIR); \
	else \
		echo "Virtual environment already exists."; \
	fi

# Target to install all dependencies
install: setup
	@echo "Checking for Node.js and npm..."
	@command -v npm >/dev/null 2>&1 || { echo "Error: npm is not installed. Please install Node.js (which includes npm) and try again."; exit 1; }
	@echo "Installing Node.js dependencies..."
	@npm install
	@echo "Installing Python dependencies..."
	@$(PIP) install -r res/requirements.txt
	@echo "All dependencies installed successfully."

# Target to run the backend server
backend:
	@echo "Starting Python backend server on http://127.0.0.1:8000..."
	@$(PYTHON) -m uvicorn server.main:app --reload

# Target to run the frontend dev server
frontend:
	@echo "Starting Vite frontend dev server..."
	@npm run dev

# Target to run both dev servers concurrently
dev:
	@echo "Starting backend and frontend development servers..."
	@npx concurrently -k -n "BACKEND,FRONTEND" -c "yellow,blue" "make backend" "make frontend"

# Target to start the Electron application
start:
	@echo "Waiting for frontend dev server to be ready on http://localhost:5173..."
	@npx wait-on http://localhost:5173 -t 30000
	@echo "Frontend is ready. Starting Electron application..."
	@npm run electron

# Target to run the entire application stack
run:
	@echo "Starting the entire VizThinker application..."
	@npx concurrently -k -n "DEV,ELECTRON" -c "cyan,magenta" "make dev" "make start"

# Target to build the frontend application
build:
	@echo "Building the frontend application..."
	@npm run build

# Target to clean up the project
clean:
	@echo "Cleaning up project..."
	@rm -rf node_modules dist .cache .vite $(VENV_DIR)
	@echo "Cleanup complete."
