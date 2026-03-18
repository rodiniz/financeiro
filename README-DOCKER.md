# Docker Setup for Financeiro Angular + Tauri Application

This project includes Docker support for running on Windows using Docker Desktop.

## Prerequisites

1. **Docker Desktop for Windows** - [Download here](https://www.docker.com/products/docker-desktop)
2. **WSL2** - Required for Docker Desktop
3. **X Server** (for GUI support) - VcXsrv or Xming

## Setup Instructions

### 1. Install X Server (for running GUI)

To run the Tauri GUI application from Docker, you need an X Server on Windows:

**Option A: VcXsrv (Recommended)**
1. Download and install [VcXsrv](https://sourceforge.net/projects/vcxsrv/)
2. Launch XLaunch
3. Select "Multiple windows" and set display number to 0
4. Select "Start no client"
5. **Important**: Check "Disable access control"
6. Save configuration for future use

**Option B: Xming**
1. Download and install [Xming](https://sourceforge.net/projects/xming/)
2. Run Xming (icon should appear in system tray)

### 2. Build the Docker Image

```powershell
docker-compose build
```

### 3. Run the Application

**Option A: Run Development Server (Angular only)**
```powershell
docker-compose up dev
```
Then open http://localhost:4200 in your browser.

**Option B: Run Full Tauri Application (with GUI)**
```powershell
# Make sure X Server is running first!
docker-compose up financeiro-app
```

**Option C: Run with Docker directly**
```powershell
# Build
docker build -t financeiro-angular .

# Run development server
docker run -p 4200:4200 -v ${PWD}:/app financeiro-angular dev

# Run Tauri GUI (requires X Server)
docker run -e DISPLAY=host.docker.internal:0 financeiro-angular tauri
```

## Development Workflow

### Watch Mode for Angular
```powershell
docker-compose run --rm dev npm run watch
```

### Run Tests
```powershell
docker-compose run --rm dev npm test
```

### Build for Production
```powershell
docker-compose run --rm financeiro-app npm run tauri build
```

## Troubleshooting

### GUI Application Won't Start

1. **Verify X Server is running**: Check for VcXsrv or Xming icon in system tray
2. **Check DISPLAY variable**: Should be `host.docker.internal:0`
3. **Disable access control**: In VcXsrv, make sure "Disable access control" is checked
4. **Firewall**: Allow VcXsrv through Windows Firewall

### Port Already in Use

If port 4200 is already in use, change it in `docker-compose.yml`:
```yaml
ports:
  - "3000:4200"  # Use port 3000 instead
```

### Build Errors

**Out of memory**: Increase Docker Desktop memory allocation:
1. Open Docker Desktop Settings
2. Go to Resources → Advanced
3. Increase Memory to at least 4GB
4. Click "Apply & Restart"

**Rust compilation fails**: The first build takes longer as it compiles Rust dependencies. Be patient.

## Alternative: Development Without Docker

If GUI support is problematic, you can still use Docker for development:

1. Run Angular development server in Docker:
   ```powershell
   docker-compose up dev
   ```

2. Run Tauri natively on Windows:
   ```powershell
   npm install
   npm run tauri dev
   ```

## Notes

- The Dockerfile uses a multi-stage build to keep the final image smaller
- SQLite database is stored inside the container. For persistent data, add a volume mount
- For production deployment, consider building native Windows executables instead of Docker
- Tauri applications are primarily designed for native desktop deployment, not containerization

## Database Persistence

To persist the SQLite database between container restarts, add a volume:

```yaml
volumes:
  - ./data:/app/data
```

Then configure Tauri to use `/app/data` for the database location.
