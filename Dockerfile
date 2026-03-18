# Multi-stage Dockerfile for Tauri + Angular application
# This Dockerfile is designed to run on Windows using Docker Desktop with WSL2

# Stage 1: Build the Angular frontend and Tauri application
FROM node:20-slim AS builder

# Install system dependencies required for Tauri
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    file \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    libwebkit2gtk-4.1-dev \
    build-essential \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Install Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm install --include=dev

# Copy the entire project
COPY . .

# Build the Angular application
RUN npx ng build

# Build the Tauri application (development build)
RUN npx tauri build

# Stage 2: Runtime environment with GUI support
FROM node:20-slim

# Install runtime dependencies for GUI applications
RUN apt-get update && apt-get install -y \
    libgtk-3-0 \
    libayatana-appindicator3-1 \
    librsvg2-2 \
    libwebkit2gtk-4.1-0 \
    libglib2.0-0 \
    libdbus-1-3 \
    xdg-utils \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy built application from builder stage
COPY --from=builder /app/src-tauri/target/release/financeiro-angular* /app/

# Copy any required runtime files
COPY --from=builder /app/src-tauri/migrations /app/migrations

# Set environment variables for GUI
ENV DISPLAY=host.docker.internal:0

# Expose any ports if needed (for dev server)
EXPOSE 4200

# Create entrypoint script
RUN echo '#!/bin/bash\n\
if [ "$1" = "dev" ]; then\n\
  exec npm run start\n\
elif [ "$1" = "tauri" ]; then\n\
  exec /app/financeiro-angular\n\
else\n\
  exec "$@"\n\
fi' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["tauri"]
