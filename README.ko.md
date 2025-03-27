# SuperDrive 클라우드 스토리지 솔루션

## 프로젝트 개요
Node.js 기반 분산형 클라우드 스토리지 시스템 (파일 암호화, 청크 업로드, 공유 링크 기능 지원)

## 아키텍처
```
클라이언트 (React) → API 게이트웨이 → 마이크로서비스
                    ├─ 파일 관리
                    ├─ 암호화 모듈
                    └─ 공유 서비스
```

## 요구사항
1. Node.js 16+
2. MongoDB 5.0+
3. Redis 6.0+

## 시작하기
```bash
npm install
npm run build
npm start
```