# Nokia 经典手机（React + Tailwind + Three.js）

一个使用现代前端组织方式重构的 Nokia 经典款示例：
- **React**：负责 UI/HUD 状态与组件结构
- **Tailwind CSS**：负责界面样式
- **Three.js**：负责 3D 建模与交互

## 功能

- 鼠标拖拽旋转手机模型（OrbitControls）
- 点击 3D 数字按键输入号码（Raycaster）
- 手机屏幕 Canvas 贴图与 HUD 输入值同步
- 场景左侧包含几何体拼接的 `NOKIA` 文字建模

## 项目结构

- `src/app.js`：React 应用入口与 HUD 组件
- `src/three/nokiaScene.js`：Three.js 场景与建模逻辑（模块化）
- `src/style.css`：基础全屏样式

## 本地运行

不需要本地安装依赖，只需静态文件服务：

```bash
npx serve . -l 4173
```

或：

```bash
python3 -m http.server 4173
```

然后访问 `http://localhost:4173`。

## GitHub Pages 部署

仓库包含 `.github/workflows/deploy.yml`，推送到 `main` 会自动部署到 GitHub Pages。

> 说明：
> - React / Tailwind / Three.js 通过 CDN 加载，便于零构建静态部署。
> - 如需生产级构建（打包优化、类型检查、Tailwind 编译），可下一步切换到 Vite + npm 工作流。
