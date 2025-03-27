const Redis = require('ioredis');

class RedisPool {
  constructor() {
    this.pool = new Redis({
      host: '127.0.0.1',
      port: 6379,
      password: '',
      db: 0,
      maxRetriesPerRequest: 3,
      enableReadyCheck: false,
      reconnectOnError: (err) => {
        const targetError = 'READONLY';
        return err.message.includes(targetError);
      }
    });

    this.pool.on('error', (err) => {
      console.error('Redis连接错误:', err);
    });
  }

  async storeChunkMetadata(fileHash, chunkData) {
    const pipeline = this.pool.pipeline();
    pipeline.hset(`file:${fileHash}`, 'status', 'uploading');
    pipeline.hset(`file:${fileHash}:chunks`, chunkData.chunkNumber, JSON.stringify({
      path: chunkData.chunkPath,
      keyHash: chunkData.keyHash,
      iv: chunkData.iv,
      algorithm: chunkData.algorithm,
      uploadedAt: Date.now()
    }));
    pipeline.expire(`file:${fileHash}`, 86400);
    return pipeline.exec();
  }

  async checkFileExists(fileHash) {
    return this.pool.exists(`file:${fileHash}`);
  }

  async getChunkContext(fileHash) {
    return this.pool.hgetall(`file:${fileHash}:chunks`);
  }
}

module.exports = new RedisPool();