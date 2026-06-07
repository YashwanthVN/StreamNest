# StreamNest Architecture

## Overview

StreamNest is a self-hosted music streaming platform.

## Components

### Backend

Spring Boot REST API

Responsibilities:

- Music discovery
- Metadata extraction
- Streaming
- Search

### Frontend

React PWA

Responsibilities:

- Search
- Playback
- Queue
- Library browsing

### Server

Samsung Galaxy A50

Responsibilities:

- Store music
- Run backend
- Serve audio files

## Deployment

Laptop
  ↓
Build JAR
  ↓
Copy to Android
  ↓
Run via Termux