# Nokia 经典手机（React + Tailwind + Three.js）

已切换为标准 **npm + Vite** 工作流。

## 技术栈

- React 18
- Vite 5
- Tailwind CSS 3（PostCSS）
- Three.js

## 项目结构

- `src/main.js`：Vite 入口
- `src/App.js`：React HUD 与状态管理
- `src/three/nokiaScene.js`：Three.js 场景与建模逻辑
- `src/style.css`：Tailwind 入口与基础样式

## 开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
npm run preview
```

## GitHub Pages

保留 `.github/workflows/deploy.yml` 自动部署流程；Vite `base: './'` 已适配 GitHub Pages 子路径部署。
