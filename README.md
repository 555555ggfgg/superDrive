# SuperDrive 云存储解决方案

本项目采用GNU通用公共许可证（GPL）版本 3 或（根据您的选择）任何更高版本进行许可。

许可证全文请见 [LICENSE](LICENSE) 文件。

Copyright (C) 2025 yinyuAN

## 一、项目概述
SuperDrive 是一个企业级分布式存储解决方案，支持 PB 级数据存储和跨区域同步。它采用 AES - 256 加密算法保障数据安全，通过分块传输和断点续传优化大文件处理。基于 Node.js 构建，具备文件加密、分块上传和分享链接等功能。

## 二、核心功能
1. **文件分块加密存储**：将文件分割成小块并进行加密存储，提高数据安全性和存储效率。
2. **智能缓存加速**：利用缓存技术，加速文件的访问和读取。
3. **跨平台客户端支持**：支持多种操作系统和设备，方便用户随时随地访问数据。
4. **实时文件版本管理**：记录文件的所有版本，方便用户回溯和恢复历史版本。

## 三、技术栈
### 架构图
![架构图](docs/architecture_zh.png)

### 详细技术栈
1. **前端**：React 18 + Vite，提供高效的用户界面和交互体验。
2. **网关**：Nginx + OpenResty，实现高性能的反向代理和负载均衡。
3. **存储层**：Ceph + MinIO，构建分布式存储系统，提供高可靠性和可扩展性。
4. **数据库**：MongoDB 分片集群，支持大规模数据存储和高效查询。

## 四、系统架构
```plaintext
客户端 (React) → API 网关 → 微服务集群
　　　　　　　　　　　├─ 文件管理
　　　　　　　　　　　├─ 加密模块
　　　　　　　　　　　└─ 分享服务
