# 太阳石矿山大模型 Solstone-Web

[English](./README_EN.md) | 简体中文

一个基于 Vue 3 的现代化 AI 聊天应用前端，支持 ChatGPT、Midjourney 等多种 AI 功能。

## ✨ 功能特性

- 🤖 **ChatGPT 对话** - 支持多轮对话，智能回复
- 🎨 **Midjourney 绘图** - AI 图像生成和编辑
- 🎵 **语音功能** - 语音识别和文字转语音
- 📱 **响应式设计** - 支持桌面端和移动端
- 🌍 **国际化** - 多语言支持
- 🎨 **主题切换** - 明暗主题切换

## 🛠️ 技术栈

- **框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **UI 组件**: Naive UI + Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router
- **样式**: TailwindCSS + Less
- **图标**: Iconify
- **PWA**: Vite PWA Plugin

## 📋 环境要求

- **Node.js**: >= 16.0.0
- **npm**: >= 8.0.0 (或使用 pnpm/yarn)

## 🚀 快速开始

### 下载项目

```bash
git clone https://gitee.com/ageerle/ruoyi-web
cd ruoyi-web
```

### 安装依赖

```bash
npm install
```

### 运行项目

```bash
npm run dev
```

项目将在 `http://localhost:1002` 启动

### 打包构建

```bash
npm run build
```

## 📦 可用脚本

```bash
# 开发环境启动
npm run dev

# 生产环境构建
npm run build

# 预览构建结果
npm run preview

# 类型检查
npm run type-check

# 代码检查
npm run lint

# 自动修复代码格式
npm run lint:fix

# 文档开发
npm run docs:dev

# 文档构建
npm run docs:build
```

## 🔧 配置说明

项目使用环境变量进行配置，请根据需要创建 `.env` 文件：

```env
# API 基础地址
VITE_APP_API_BASE_URL=your_api_url

# 是否启用 PWA
VITE_GLOB_APP_PWA=true
```

## 📁 项目结构

```
ruoyi-web/
├── public/                 # 静态资源
├── src/
│   ├── api/               # API 接口
│   ├── assets/            # 资源文件
│   ├── components/        # 公共组件
│   ├── hooks/             # 组合式函数
│   ├── locales/           # 国际化
│   ├── router/            # 路由配置
│   ├── store/             # 状态管理
│   ├── styles/            # 样式文件
│   ├── utils/             # 工具函数
│   ├── views/             # 页面组件
│   └── main.ts            # 入口文件
├── docs/                  # 文档和截图
└── package.json
```

## 🤝 代码提交

代码上传到gitlab步骤。

```
git status
git add .
git commit -m "修复 LogoSvg 显示错误，使用 img 标签"
git push origin main
```

## 📄 提交类型

| 类型               | 描述                                           |
| ------------------ | ---------------------------------------------- |
| **feat**     | 新功能（feature）                              |
| **fix**      | 修复 bug                                       |
| **docs**     | 文档更新                                       |
| **style**    | 代码格式修改（空格、缩进、分号等，不影响功能） |
| **refactor** | 代码重构（既不是新功能也不是 bug 修复）        |
| **perf**     | 性能优化                                       |
| **test**     | 测试相关（新增、修改、删除测试）               |
| **chore**    | 构建过程或辅助工具变动（如更新依赖、脚本修改） |
| **revert**   | 回滚某个提交                                   |

## 👨‍💻 作者

- **煤炭科学研究总院有限公司-矿山人工智能研究院**
