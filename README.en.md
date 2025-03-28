# SuperDrive Cloud Storage Solution

## Project Background
Enterprise-grade distributed storage solution supporting PB-level data storage and cross-region sync. Utilizes AES-256 encryption and chunked transfer optimization.

## Key Features
- Encrypted chunked storage
- Intelligent caching
- Cross-platform clients
- Real-time versioning

## Tech Stack
![Architecture](docs/architecture_en.png)
- Frontend: React 18 + Vite
- Gateway: Nginx + OpenResty
- Storage: Ceph + MinIO
- Database: MongoDB Sharded Cluster

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
# Init environment
cp .env.example .env

# Install dependencies
npm install --registry=https://registry.npmmirror.com

# Start dev server
npm run dev

# Initialize DB
npm run db:seed
```

## API Documentation
https://api.superdrive/docs

## Contribution Guidelines
Please read [CONTRIBUTING.md](docs/CONTRIBUTING.md) before submitting PRs