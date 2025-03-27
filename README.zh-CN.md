# SuperDrive 云存储解决方案

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
npm install
npm run build
npm start
```