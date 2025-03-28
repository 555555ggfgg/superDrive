# SuperDrive 云存储解决方案

## 项目背景
企业级分布式存储解决方案，支持PB级数据存储和跨区域同步。采用AES-256加密算法保障数据安全，通过分块传输和断点续传优化大文件处理。

## 核心功能
- 文件分块加密存储
- 智能缓存加速
- 跨平台客户端支持
- 实时文件版本管理

## 技术栈
![架构图](docs/architecture_zh.png)
- 前端：React 18 + Vite
- 网关：Nginx + OpenResty
- 存储层：Ceph + MinIO
- 数据库：MongoDB分片集群

## 项目概述
基于Node.js的分布式云存储系统，支持文件加密、分块上传和分享链接功能

## 系统架构
```
客户端 (React) → API网关 → 微服务集群
　　　　　　　　　　　├─ 文件管理
　　　　　　　　　　　├─ 加密模块
　　　　　　　　　　　└─ 分享服务
```

## 部署要求
1. Node.js 16+
2. MongoDB 5.0+
3. Redis 6.0+

## 快速启动
```bash
# 初始化环境变量
cp .env.example .env

# 安装依赖
npm install --registry=https://registry.npmmirror.com

# 启动开发模式
npm run dev

# 初始化数据库
npm run db:seed
```

## 压力测试
```
wrk -t12 -c400 -d30s http://localhost:3000/api/benchmark
```