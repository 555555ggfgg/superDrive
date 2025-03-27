const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { File } = require('../models/fileModel');
const EncryptionService = require('../services/encryptionService');
const RedisPool = require('../services/redisPool');

// 分片存储配置
// 存储策略配置
const chunkStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(__dirname, '../../media/temp_chunks');
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const chunkHash = crypto.createHash('sha256').update(file.originalname + Date.now()).digest('hex');
    cb(null, `${chunkHash}-${req.body.chunkNumber}`);
  }
});

const finalStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const finalDir = path.join(__dirname, '../../media/files');
    cb(null, finalDir);
  },
  filename: (req, file, cb) => {
    const fileHash = crypto.createHash('sha256').update(file.originalname + Date.now()).digest('hex');
    cb(null, `${fileHash}${path.extname(file.originalname)}`);
  }
});

// 上传策略选择中间件
const uploadStrategySelector = (req, res, next) => {
  req.uploadStrategy = req.headers['x-upload-type'] === 'chunk' ? 'chunk' : 'standard';
  next();
};

// MD5校验中间件
const validateContentMD5 = (req, res, next) => {
  if (req.headers['content-md5']) {
    const contentHash = crypto.createHash('md5').update(JSON.stringify(req.body)).digest('base64');
    if (contentHash !== req.headers['content-md5']) {
      return res.status(412).json({
        code: 'PreconditionFailed',
        message: 'Content-MD5 header verification failed',
        requestId: req.headers['x-request-id'],
        strategyRecommendation: 'retry_with_md5_validation'
      });
    }
  }
  next();
};

const chunkUpload = multer({ storage: chunkStorage });
const standardUpload = multer({ storage: finalStorage });

// 分块上传接口
// 普通文件上传接口
router.post('/upload/files', 
  uploadStrategySelector,
  validateContentMD5,
  standardUpload.single('file'), 
  async (req, res) => {
    const requestId = req.headers['x-request-id'] || crypto.randomUUID();
    res.set({
      'X-Request-ID': requestId,
      'X-Upload-Strategy': 'standard'
    });

    try {
      const { fileHash } = req.body;
      const existingFile = await File.findOne({ fileHash });

      if (existingFile) {
        return res.status(409).json({
          code: 'Conflict',
          message: 'File already exists',
          requestId: requestId,
          target: `/files/${fileHash}`,
          strategyRecommendation: 'use_chunk_upload_for_large_files'
        });
      }

      const newFile = new File({
        ...req.body,
        filePath: req.file.path,
        standardUpload: true
      });

      await newFile.save();
      res.status(201).json({
        code: 'Created',
        message: 'File uploaded successfully',
        requestId: requestId,
        fileId: newFile._id
      });

    } catch (error) {
      console.error('标准上传错误:', error);
      res.status(500).json({
        code: 'InternalServerError',
        message: 'File upload failed',
        requestId: requestId,
        details: error.message,
        strategyRecommendation: 'retry_with_chunk_upload'
      });
    }
  }
);

// 分块上传接口
router.put('/upload/files/:fileId/chunks', 
  uploadStrategySelector,
  validateContentMD5,
  (req, res, next) => {
    const encryptionKey = EncryptionService.generateKey();
    req.encryptionMeta = {
      keyHash: EncryptionService.createKeyHash(encryptionKey.key),
      iv: encryptionKey.iv,
      algorithm: encryptionKey.algorithm
    };
    next();
  },
  chunkUpload.single('chunk'), 
  async (req, res) => {
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  res.set('X-Request-ID', requestId);
  try {
    const { fileHash, totalChunks, chunkNumber, expireAt } = req.body;
    
    // 秒传验证
    const redisExists = await RedisPool.checkFileExists(fileHash);
    if (redisExists) {
      return res.status(409)
        .set('Location', `/files/${fileHash}`)
        .json({ 
          code: 'Conflict',
          message: 'File exists in redis cache',
          requestId: requestId,
          target: `/files/${fileHash}`
        });
    }

    const existingFile = await File.findOne({ fileHash });
    if (existingFile) {
      return res.status(409)
  .set('Location', `/files/${fileHash}`)
  .json({ 
    code: 'Conflict',
    message: 'File already exists',
    requestId: requestId,
    target: `/files/${fileHash}`
  });
    }

    // 记录分片信息
    await File.updateOne(
      { fileHash, expireAt },
      {
        $push: {
          chunkInfo: {
            chunkNumber,
            chunkPath: req.file.path,
            keyHash: req.encryptionMeta.keyHash,
            iv: req.encryptionMeta.iv,
            algorithm: req.encryptionMeta.algorithm,
            uploaded: true
          }
        }
      },
      { upsert: true }
    );

    await RedisPool.storeChunkMetadata(fileHash, {
      chunkNumber: chunkNumber,
      chunkPath: req.file.path,
      keyHash: req.encryptionMeta.keyHash,
      iv: req.encryptionMeta.iv,
      algorithm: req.encryptionMeta.algorithm
    });

    res.status(201)
  .set('Location', `/files/${fileHash}/chunks/${chunkNumber}`)
  .json({
    code: 'Created',
    message: 'Chunk uploaded successfully',
    chunkNumber: chunkNumber,
    totalChunks: totalChunks,
    requestId: requestId
  });

  } catch (error) {
    console.error('上传错误:', error);
    res.status(500)
  .json({ 
    code: 'InternalServerError',
    message: 'File upload failed',
    requestId: requestId,
    details: error.message 
  });
  }
});
router.delete('/:fileHash/chunks/:chunkNumber', async (req, res) => {
  const { fileHash, chunkNumber } = req.params;
  const requestId = req.headers['x-request-id'];
  if (!fileHash || !chunkNumber) {
    return res.status(400)
     .json({
        code: 'BadRequest',
        message: 'Missing required parameters',
        requestId: requestId
      });
  }

  try {
    const chunkPath = await RedisPool.getChunkPath(fileHash, chunkNumber);

    if (!chunkPath) {
      return res.status(404)
      .json({
        code: 'NotFound',
        message: 'Chunk not found',
        requestId: requestId
      });
    }
  }
  catch (error) {
    console.error('获取Chunk路径错误:', error);
    return res.status(500)
     .json({
        code: 'InternalServerError',
        message: 'Error fetching chunk path',
        requestId: requestId,
        details: error.message
      }); 
  }
  fs.unlink(chunkPath, (err) => {
    if (err) {
      console.error('删除错误:', err);
      return res.status(500)
      .json({
        code: 'InternalServerError',
        message: 'Chunk deletion failed',
        requestId: requestId,
        details: err.message
      });
    }

    res.status(204)
    .json({
      code: 'NoContent',
      message: 'Chunk deleted successfully',
      requestId: requestId
    });
  })
});
module.exports = router;