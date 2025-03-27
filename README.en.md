# SuperDrive Cloud Storage Solution

## Project Overview
Node.js based distributed cloud storage system with file encryption, chunked uploads and shareable links

## Architecture
```
Client (React) → API Gateway → Microservices
                    ├─ File Management
                    ├─ Encryption Module
                    └─ Sharing Service
```

## Requirements
1. Node.js 16+
2. MongoDB 5.0+
3. Redis 6.0+

## Quick Start
```bash
npm install
npm run build
npm start
```