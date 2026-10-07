<template>
  <el-footer class="app-footer">
    <div class="inner">
      <div>
        <strong>中俄能源装备术语库</strong>
        <p>面向"一带一路"中俄能源装备贸易的行业术语库及教学资源建设系统。</p>
      </div>
      <div class="links">
        <router-link to="/terminology">术语库管理</router-link>
        <router-link to="/resources">教学资源</router-link>
        <router-link to="/translate">翻译服务</router-link>
      </div>
      <p class="copy">© {{ new Date().getFullYear() }} 中俄能源装备术语库系统</p>
    </div>
  </el-footer>
</template>

<style scoped>
.app-footer {
  background: #f1f5f4;
  border-top: 1px solid #e5e7eb;
  color: #6b7280;
  font-size: 13px;
  height: auto;
  padding: 24px 0;
}
.inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: space-between;
  align-items: center;
}
.links {
  display: flex;
  gap: 16px;
}
.copy {
  width: 100%;
  text-align: center;
  margin: 8px 0 0;
  color: #9ca3af;
}
</style>
