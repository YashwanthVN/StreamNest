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
Metadata Cache                  Music Files
```

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- PWA

### Backend
- Spring Boot
- Java
- SQLite

### Infrastructure
- Android (Server)
- Tailscale

## Project Status

🚧 Planning & Setup Phase

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