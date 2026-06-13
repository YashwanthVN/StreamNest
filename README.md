# StreamNest

A self-hosted music streaming platform that turns an Android device into a personal music server.

## Features

- Stream music from your personal library
- Android phone acts as the media server
- React Progressive Web App (PWA) frontend
- Search songs, artists, and albums
- Remote access through Tailscale
- Lightweight and self-hosted

## Architecture

```text
                      React PWA
                          │
                          ▼
                    Spring Boot API
                          │
                          ▼
                   Android Phone Server
                          │
        ┌─────────────────┴─────────────────┐
        │                                   │
        ▼                                   ▼
Metadata Cache                         Music Files
```

## Tech Stack

## API Endpoints

### Health Check

```http
GET /api/health
```

Example Response:

```json
{
  "status": "ok",
  "service": "StreamNest",
  "version": "0.0.1"
}
```

### List Songs

```http
GET /api/songs
```

### Stream Audio

```http
GET /api/stream/{filename}
```

## Local Development

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

```
Server: http://localhost:8080
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Server:

```text
http://localhost:5173
```

### Backend
- Spring Boot
- Java
- SQLite

### Infrastructure
- Android (Server)
- Tailscale

## Project Status

Phase 1: Backend MVP
- ✓ Health API
- ✓ Music Scan API
- ✓ Metadata API
- ✓ Audio Streaming API

Phase 2: Frontend
- ✓ React + Vite
- ✓ Song List
- ✓ Search
- ✓ Audio Player

Phase 3: Phone Deployment
- ✓ Build Jar
- ⬜ Copy to Android
- ⬜ Run via Termux

Phase 4: Remote Access
- ⬜ Tailscale
- ⬜ Global streaming

🚧 Active Development

Current Progress:
- ✅ Spring Boot backend initialized
- ✅ Music library scanning
- ✅ MP3 metadata extraction (ID3 tags)
- ✅ Audio streaming endpoint
- ✅ React + TypeScript frontend initialized
- ✅ Frontend song browser
- ✅ Audio player UI
- ⏳ Android deployment

## Roadmap

- [ ] Setup Android server environment
- [ ] Setup Spring Boot backend
- [ ] Scan local music library
- [ ] Search API
- [ ] Audio streaming API
- [ ] React PWA frontend
- [ ] Global access via Tailscale
- [ ] Playlists

## Version 1 Goals

The initial release focuses on:

- Music library scanning
- Metadata extraction
- Search functionality
- Audio streaming
- Android phone deployment

The first version intentionally avoids:
- Recommendation systems
- Authentication
- Database persistence
- User accounts