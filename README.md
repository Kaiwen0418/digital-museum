# Nokia 经典手机（Three.js）

一个使用 Three.js 制作的 Nokia 经典款手机示例：
- 鼠标拖拽可旋转查看模型（OrbitControls）
- 点击手机键盘按钮输入数字
- 屏幕与左上角 HUD 实时显示输入值

## 本地运行

不需要 Python。只要能提供**静态文件服务**即可，任选一种：

### 方式 1：Node（推荐）

```bash
npx serve . -l 4173
```

### 方式 2：Python（可选）
直接启动静态服务器：

```bash
python3 -m http.server 4173
```

启动后访问：`http://localhost:4173`。
然后访问 `http://localhost:4173`。

## GitHub Pages 部署

仓库已包含 `.github/workflows/deploy.yml`，推送到 `main` 分支后会自动部署到 GitHub Pages。

> 注意：
> 1. 本示例通过 CDN 加载 Three.js，不需要本地安装依赖。
> 2. 页面资源使用相对路径，适配 GitHub Pages 子路径部署。
> 注意：本示例通过 CDN 加载 Three.js，不需要本地安装依赖。
