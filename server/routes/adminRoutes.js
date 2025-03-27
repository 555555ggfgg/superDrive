const express = require('express');
const router = express.Router();
const { File } = require('../models/fileModel');
const RedisPool = require('../services/redisPool');

// 实时上传统计
router.get('/metrics', async (req, res) => {
 const requestId = req.headers['x-request-id'];

  try {
    const [totalFiles, activeUploads, storageUsage] = await Promise.all([
      File.countDocuments(),
      RedisPool.getActiveUploads(),
      File.calculateStorageUsage()
    ]);

    res.json({
      uploads: {
        total: totalFiles,
        active: activeUploads,
        chunked: await File.countDocuments({ chunkUpload: true })
      },
      storage: {
        total: storageUsage.total,
        used: storageUsage.used,
        encrypted: await File.calculateEncryptedPercentage()
      },
      throughput: await RedisPool.getNetworkThroughput()
    });

  } catch (error) {

    res.status(500).json({
      code: 'InternalServerError',
      message: 'Failed to fetch metrics',
      requestId: requestId,

    });
  }
});

module.exports = router;