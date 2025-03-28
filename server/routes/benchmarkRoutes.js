const express = require('express');
const router = express.Router();
const { File } = require('../models/fileModel');
const redis = require('redis');
const { performance } = require('perf_hooks');
const uuid = require('uuid');

// Redis连接池配置
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD
});

// 请求追踪中间件
router.use((req, res, next) => {
  req.requestId = uuid.v4();
  console.log(`[Benchmark] ${new Date().toISOString()} - 请求ID: ${req.requestId}`);
  next();
});

// 文件上传速度测试
router.post('/upload-speed', async (req, res) => {
  const start = performance.now();
  const { chunkSize, totalSize } = req.body;
  
  try {
    // 模拟文件分片处理
    const chunks = Math.ceil(totalSize / chunkSize);
    const processingTime = chunks * 50; // 模拟处理时间
    
    // 记录到Redis
    redisClient.hset('benchmark:upload', req.requestId, JSON.stringify({
      totalSize,
      chunkSize,
      duration: performance.now() - start
    }));
    
    res.json({
      status: 'success',
      metrics: {
        totalTime: performance.now() - start,
        throughput: totalSize / (processingTime / 1000)
      }
    });
  } catch (err) {
    console.error(`[Upload Speed Error] ${req.requestId}:`, err);
    res.status(500).json({ status: 'error', message: '压力测试失败' });
  }
});

// 并发处理能力测试
router.post('/concurrency', async (req, res) => {
  const { concurrencyLevel, requestsCount } = req.body;
  const testStart = performance.now();
  
  try {
    // 模拟并发请求处理
    const promises = Array.from({ length: requestsCount }, async (_, i) => {
      const start = performance.now();
      await new Promise(resolve => setTimeout(resolve, 50));
      return performance.now() - start;
    });
    
    const results = await Promise.all(promises);
    const avgLatency = results.reduce((a, b) => a + b, 0) / results.length;
    
    // 记录到Redis
    redisClient.hset('benchmark:concurrency', req.requestId, JSON.stringify({
      concurrencyLevel,
      requestsCount,
      avgLatency
    }));
    
    res.json({
      status: 'success',
      metrics: {
        totalTime: performance.now() - testStart,
        requestsPerSecond: requestsCount / ((performance.now() - testStart) / 1000)
      }
    });
  } catch (err) {
    console.error(`[Concurrency Test Error] ${req.requestId}:`, err);
    res.status(500).json({ status: 'error', message: '并发测试失败' });
  }
});

// 数据库查询响应测试
router.post('/db-query', async (req, res) => {
  const { queryType, iterations } = req.body;
  const testStart = performance.now();
  
  try {
    // 执行不同类型的数据库查询
    const queryTimes = [];
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await File.findOne().sort({ createdAt: -1 }).lean();
      queryTimes.push(performance.now() - start);
    }
    
    // 记录到Redis
    redisClient.hset('benchmark:db', req.requestId, JSON.stringify({
      queryType,
      iterations,
      avgResponse: queryTimes.reduce((a, b) => a + b, 0) / queryTimes.length
    }));
    
    res.json({
      status: 'success',
      metrics: {
        totalTime: performance.now() - testStart,
        queryTypes: queryType,
        avgQueryTime: queryTimes.reduce((a, b) => a + b, 0) / queryTimes.length
      }
    });
  } catch (err) {
    console.error(`[DB Test Error] ${req.requestId}:`, err);
    res.status(500).json({ status: 'error', message: '数据库测试失败' });
  }
});

module.exports = router;