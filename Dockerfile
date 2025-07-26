# -----------------------------
# VizThinker Dockerfile
# -----------------------------
# 1) Build the React frontend using Node
# 2) Build the Python backend with Poetry
# 3) Copy the compiled frontend into the backend image and run Uvicorn

###############################
# ----- Stage 1: Frontend ----
###############################
FROM node:20-alpine AS frontend-builder
# Create app directory
WORKDIR /usr/src/app

# Install dependencies first (cache layer)
COPY package*.json ./
RUN npm ci --silent

# Copy the rest of the source and build for production
COPY . .
RUN npm run build

###############################
# ----- Stage 2: Backend -----
###############################
FROM python:3.11-slim AS backend

# Install all system packages in one layer
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       build-essential \
       libpq-dev \
       curl \
       postgresql \
       postgresql-contrib \
    && rm -rf /var/lib/apt/lists/*

# Set work directory
WORKDIR /app

# Copy static config files first (better caching)
COPY tsconfig.json ./
COPY res/requirements.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir ollama openai

# Copy backend source code (changes more frequently)
COPY server ./server

# Copy compiled frontend from the builder stage
COPY --from=frontend-builder /usr/src/app/dist ./dist

# Expose API port
EXPOSE 8000

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start FastAPI using Uvicorn
CMD ["uvicorn", "server.main:app", "--host", "0.0.0.0", "--port", "8000"]