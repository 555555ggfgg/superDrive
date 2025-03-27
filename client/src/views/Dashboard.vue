<template>
  <div class="dashboard-container">
    <h2>文件存储服务监控仪表盘</h2>
    
    <div class="chart-row">
      <div class="chart-box">
        <div ref="uploadChart" class="chart"></div>
      </div>
      <div class="chart-box">
        <div ref="storageChart" class="chart"></div>
      </div>
    </div>

    <div class="chart-row">
      <div class="chart-box">
        <div ref="throughputChart" class="chart"></div>
      </div>
      <div class="chart-box">
        <div ref="encryptionChart" class="chart"></div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  name: 'Dashboard',
  
  mounted() {
    this.initCharts();
    this.fetchData();
  },

  methods: {
    initCharts() {
      this.uploadChart = echarts.init(this.$refs.uploadChart);
      this.storageChart = echarts.init(this.$refs.storageChart);
      this.throughputChart = echarts.init(this.$refs.throughputChart);
      this.encryptionChart = echarts.init(this.$refs.encryptionChart);

      window.addEventListener('resize', () => {
        this.uploadChart.resize();
        this.storageChart.resize();
        this.throughputChart.resize();
        this.encryptionChart.resize();
      });
    },

    async fetchData() {
      try {
        const response = await this.$axios.get('/admin/metrics');
        this.updateCharts(response.data);
      } catch (error) {
        console.error('获取监控数据失败:', error);
      }
    },

    updateCharts(data) {
      // 上传统计图表
      this.uploadChart.setOption({
        title: { text: '实时上传统计' },
        tooltip: { trigger: 'item' },
        series: [{
          type: 'pie',
          data: [
            { value: data.uploads.active, name: '进行中上传' },
            { value: data.uploads.chunked, name: '分片上传' },
            { value: data.uploads.total, name: '总文件数' }
          ]
        }]
      });

      // 存储使用图表
      this.storageChart.setOption({
        title: { text: '存储使用情况' },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: ['总容量', '已使用'] },
        yAxis: { type: 'value' },
        series: [{
          type: 'bar',
          data: [data.storage.total, data.storage.used],
          itemStyle: { color: '#5470c6' }
        }]
      });

      // 网络吞吐量图表
      this.throughputChart.setOption({
        title: { text: '网络吞吐量' },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'time' },
        yAxis: { type: 'value' },
        series: [{
          type: 'line',
          data: data.throughput,
          smooth: true,
          areaStyle: { color: '#91cc75' }
        }]
      });

      // 加密文件占比
      this.encryptionChart.setOption({
        title: { text: '加密文件占比' },
        tooltip: { trigger: 'item' },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          data: [
            { value: data.storage.encrypted, name: '加密文件' },
            { value: 100 - data.storage.encrypted, name: '未加密文件' }
          ]
        }]
      });
    }
  }
};
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.chart-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.chart-box {
  width: 48%;
  height: 400px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  padding: 15px;
}

.chart {
  width: 100%;
  height: 100%;
}
</style>