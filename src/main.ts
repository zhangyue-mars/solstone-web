import { createApp } from 'vue'
import App from './App.vue'
import { setupI18n } from './locales'
import { setupAssets, setupScrollbarStyle } from './plugins'
import { setupStore } from './store'
import { setupRouter } from './router'
import 'virtual:svg-icons-register'; // 引入虚拟的 svg 图标模块
import IconSvg from '@/components/common/IconSvg/index.vue';

// ✅ 新增引入
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'   // v4 用 reset.css（v3 用 style.css）

async function bootstrap() {
  const app = createApp(App)

  // 全局注册 SvgIcon 组件
  app.component('IconSvg', IconSvg);

  setupAssets()
  setupScrollbarStyle()
  setupStore(app)
  setupI18n(app)
  
  app.use(Antd)

  await setupRouter(app)

  app.mount('#app')
}

bootstrap()
