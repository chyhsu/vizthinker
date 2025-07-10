# Makefile for VizThinker

export PATH := /usr/local/bin:$(PATH)

# Default target is 'help'
.PHONY: default
default: help

# Variables
VENV_DIR = .venv
PYTHON = $(VENV_DIR)/bin/python
PIP = $(VENV_DIR)/bin/pip
CONFIG_DIR = config

# Phony targets prevent conflicts with files of the same name
.PHONY: help setup install run dev build backend frontend clean

help:
	@echo ""
	@echo "Usage:"
	@echo "  make install      - Set up project and install all dependencies."
	@echo "  make run          - Run the complete application (backend and frontend)."
	@echo "  make dev          - Run backend and frontend servers for development (same as run)."
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
	@rm -rf node_modules dist .cache .vite $(VENV_DIR)
	@echo "Cleanup complete."
