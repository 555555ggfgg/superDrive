require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const fileRoutes = require('./routes/fileRoutes');

const app = express();

// 中间件配置
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// 数据库连接
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('成功连接到MongoDB'))
.catch(err => console.error('数据库连接失败:', err));

// 路由注册
app.use('/api/files', fileRoutes);
app.use('/api/benchmark', require('./routes/benchmarkRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
  console.log('存储目录结构初始化完成');
});