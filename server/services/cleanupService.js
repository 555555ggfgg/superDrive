const cron = require('node-schedule');
const fs = require('fs-extra');
const path = require('path');
const { File } = require('../models/fileModel');

const cleanupJob = cron.scheduleJob('0 3 * * *', async () => {
  try {
    const expiredFiles = await File.find({ 
      expireAt: { $lte: new Date() } 
    });

    for (const file of expiredFiles) {
      // 删除物理文件
      const fileDir = path.join(__dirname, '../../media', file.fileHash);
      await fs.remove(fileDir);

      // 删除数据库记录
      await File.deleteOne({ _id: file._id });
      console.log(`已删除过期文件：${file.fileName}`);
    }
  } catch (error) {
    console.error('文件清理失败：', error);
  }
});


module.exports = {
  start: () => cleanupJob
};