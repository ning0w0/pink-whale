# Pink Whale 🐳

**DeepSeek Harness 的粉色鲸鱼主题桌面套壳**

给 DeepSeek Harness Web（`http://127.0.0.1:3080`）套上一个可爱的粉色鲸鱼外壳：
无边框窗口 + 自绘标题栏 + 全页面粉色主题注入。

> 图标取自 DeepSeek 官方鲸鱼 logo 改色，主题配色为粉色系（珊瑚粉 `#FF8FA3` / 深粉 `#E86A8A` / 浅粉 `#FFE9F0`）。

---

## ✨ 功能特性

- 🪟 **无边框圆角窗口**：自绘粉色标题栏 + SVG 按钮（刷新 / 最小化 / 最大化 / 关闭）
- 🐳 **粉色鲸鱼图标**：窗口图标与桌面快捷方式同款
- 🎀 **全页面主题注入**：CSS 注入把 DSH 界面整体粉化（背景、侧边栏、按钮、输入框、滚动条）
- 📥 **iframe 嵌入**：窗口主体直接加载 DeepSeek Harness 真实网页
- 😿 **未运行引导页**：DSH 未启动时显示粉色引导页 + 重试按钮
- 🔒 **单实例模式**：重复启动不会开多个窗口
- 🔍 **内置诊断**：标题栏 🌟 按钮可抓取 DSH 页面结构，方便维护主题

## 📸 截图

**新会话（欢迎页）**

![新会话](docs/screenshots/新会话.png)

**对话页面**

![对话](docs/screenshots/对话.png)

---

## 🧰 环境要求

在开始之前，请确认你的电脑已安装：

| 依赖 | 版本要求 | 检查命令 |
|---|---|---|
| **Node.js** | 22 及以上 | `node -v` |
| **npm** | 随 Node.js 附带 | `npm -v` |

> 如果 `node -v` 提示"不是内部或外部命令"，请先到 [nodejs.org](https://nodejs.org) 下载安装 LTS 版本。

## 🚀 快速开始（新手向）

### 第 1 步：获取项目代码

```bash
git clone https://github.com/ning0w0/pink-whale.git
cd pink-whale
```

> 不会用 git？也可以直接到仓库页面点 **Code → Download ZIP**，解压后进入 `pink-whale` 文件夹，在文件夹地址栏输入 `cmd` 回车打开终端。

### 第 2 步：安装依赖

```bash
npm install
```

> 这一步会下载 Electron 运行时（约 200MB），需要几分钟，请耐心等待。
> 如果下载慢，可以先用国内镜像：
> ```bash
> npm install --registry=https://registry.npmmirror.com
> ```

### 第 3 步：启动 DeepSeek Harness（前提）

在另一个终端里启动 DSH：

```bash
pnpm dsh web
```

> DSH 启动后访问 `http://127.0.0.1:3080` 应能看到网页。

### 第 4 步：启动 Pink Whale

```bash
npm start
```

窗口打开后会自动加载 DeepSeek Harness。如果 DSH 还没启动，会显示粉色引导页，启动 DSH 后点 **重试** 即可。

---

## ❓ 常见问题

| 问题 | 解决方法 |
|---|---|
| 窗口显示"DeepSeek Harness 还没起床" | 确认已运行 `pnpm dsh web`，然后点"重试" |
| `npm install` 很慢或失败 | 换用镜像源：`npm install --registry=https://registry.npmmirror.com` |
| 双击启动没反应 | 确认 `node_modules` 已安装（重新执行 `npm install`）|
| 想改主题颜色 | 编辑 `theme.css`，改 `#FF8FA3` / `#E86A8A` 等色值后重启 |

## 📁 项目结构

```
pink-whale/
├── main.js            # Electron 主进程（窗口、端口检测、主题注入、单实例、IPC）
├── preload.js         # 预加载脚本（窗口控制 / DSH 检测 / 诊断 API）
├── index.html         # 壳界面（自绘标题栏 + 引导页 + DSH iframe）
├── theme.css          # 🎀 粉色主题（注入到 DSH 页面）
├── diag.js            # 诊断脚本（抓取 DSH 页面结构与元素样式）
├── pink_whale.svg     # 粉色鲸鱼图标源文件
├── pink_whale.ico     # 粉色鲸鱼图标（多尺寸）
├── docs/screenshots/  # 界面截图
└── package.json
```

## 🔧 技术说明

- **无边框窗口**：`BrowserWindow({ frame: false })`，标题栏由页面自绘，外层圆角交给系统
- **主题注入**：主进程通过 `webContents.executeJavaScript` 向 DSH 的 iframe 注入 `<style id="__whale_theme__">`（内容来自 `theme.css`），页面加载时自动注入
- **端口检测**：主进程用 `net.connect` 探测 3080 端口，通过 IPC 通知渲染进程切换引导页 / iframe
- **单实例**：`app.requestSingleInstanceLock()` 防止多开
- **诊断**：`diag.js` 收集页面标签 / 类名 / 颜色 / 渐变等信息，输出到主进程日志（点 🌟 触发）

## 📜 版本历史

| 版本 | 说明 |
|---|---|
| `4913c68` | README 路径与 API 标识符全面清理 |
| `2c7866e` | 全面去除 Hello Kitty（文件 / 目录 / 变量 / 文档统一为 pink whale）|
| `7f679a1` | 添加 README（功能 / 截图 / 结构 / 使用说明）|
| `f5b63f2` | 标题栏去掉自身圆角，填满窗口顶部两角 |
| `3bf9f93` | 统一更名 hello kitten → pink whale |
| `7bb1ab6` | 粉色鲸鱼图标 + 快捷方式更名 + 冗余清理 |
| `e589a4a` | Hello Kitten MVP（初始版本）|

## 🍬 致谢

- 图标灵感来自 DeepSeek 官方鲸鱼 logo
- 主题配色参考粉色系风格

## 📄 许可证

MIT License
