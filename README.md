## Quick Translator Chrome Extension

Quick Translator 是一个针对英文网页的划词翻译 Chrome 扩展，支持 **普通翻译（谷歌接口）** 和 **AI 增强翻译（DeepSeek）**，并提供页面悬浮按钮和弹窗两种使用方式。  
当前版本已通过 **本地后端服务存储 DeepSeek API Key**，不在前端代码中暴露密钥，更适合实际项目使用。

## 功能特性

- **划词翻译**
  - 在任意网页上选中英文文本，会在右侧出现两个悬浮按钮：
    - **翻译**：通过谷歌翻译接口进行普通翻译
    - **AI**：通过 DeepSeek 模型进行 AI 翻译 / 润色（通过后端代理调用）
  - 翻译结果以浮动气泡的形式展示在选中文本下方，支持多段文本分段显示。

- **弹窗翻译**
  - 点击浏览器工具栏中的扩展图标，打开 `popup.html`：
    - 文本输入框用于手动输入要翻译的内容
    - **普通翻译** 按钮：调用谷歌翻译
    - **AI 翻译 Beta（DeepSeek）** 按钮：调用 DeepSeek 翻译（通过后端代理调用）

## 主要技术点

- **Chrome 扩展前端**
  - 基于 **Chrome Extensions Manifest V3**
  - 使用 `content_scripts` 注入 `content.js`，实现划词检测、悬浮按钮和翻译结果展示
  - 使用 `background service_worker` (`background.js`) 统一处理：
    - 普通翻译：调用谷歌翻译接口
    - AI 翻译：通过本地后端代理调用 DeepSeek 接口
  - 使用 `chrome.runtime.sendMessage` 在 content script / popup 与 background 之间通信

- **本地后端服务（Node.js）**
  - 位于 `server` 目录，使用 `Express + node-fetch` 实现
  - 提供 `/deepseek` 接口，接收前端传来的文本，服务器端再调用 DeepSeek 官方 API
  - DeepSeek API Key 存放在 `server/.env` 环境变量文件中，不进入代码仓库

## 文件结构说明

- `manifest.json`：扩展清单，声明权限、入口文件等
  - `permissions`: `activeTab`, `scripting`, `storage`, `tabs`
  - `host_permissions`: 包含谷歌翻译接口、本地后端 `http://localhost:3000/*` 等
  - `action.default_popup`: `popup.html`
  - `background.service_worker`: `background.js`
  - `content_scripts`: 注入 `content.js` 和 `styles.css`

- `background.js`
  - `translateText(text)`：调用谷歌翻译接口，支持多段文本，并按段落拼接返回
  - `aiTranslateWithDeepSeek(text)`：调用本地后端 `/deepseek`，由后端再请求 DeepSeek
  - `chrome.runtime.onMessage.addListener`：
    - `action: 'translate'` → 普通翻译
    - `action: 'aiTranslate'` → AI 翻译

- `content.js`
  - 监听用户在页面上的文本选中事件
  - 计算选中文本区域位置，显示两个悬浮按钮：
    - 普通翻译按钮：`翻译`
    - AI 翻译按钮：`AI`
  - 点击按钮后，通过 `chrome.runtime.sendMessage` 发送翻译请求
  - 接收翻译结果，在选中文本附近展示浮动翻译气泡

- `popup.html` & `popup.js`
  - 提供扩展弹窗界面
  - 文本输入框 + 普通翻译 / AI 翻译按钮
  - 通过 `chrome.runtime.sendMessage` 向 `background.js` 发送翻译请求

- `styles.css`
  - 定义弹窗样式和页面注入的悬浮按钮、翻译气泡样式
  - `.translation-popup` 使用 `white-space: pre-wrap` 保证多段翻译结果能按换行正确显示

- `server/`
  - `index.js`：Express 后端，暴露 `/deepseek` 接口，转发请求到 DeepSeek
  - `package.json`：后端依赖与启动脚本
  - `.env.example`：环境变量示例文件（不包含真实 Key）

## 安装与本地调试

### 1. 准备 DeepSeek API Key（后端）

1. 在 DeepSeek 官网申请并获取 API Key。
2. 进入项目后端目录：

   ```bash
   cd server
   ```

3. 复制环境变量示例文件，创建实际配置文件：

   ```bash
   cp .env.example .env
   ```

4. 打开 `server/.env`，填入你的真实 Key，例如：

   ```env
   DEEPSEEK_API_KEY=你的真实DeepSeek密钥
   PORT=3000
   ```

5. 安装后端依赖并启动服务：

   ```bash
   cd server
   npm install
   npm run start
   ```

   启动成功后，后端会在 `http://localhost:3000` 监听，并暴露 `/deepseek` 接口。

### 2. 加载 Chrome 扩展

1. 打开 Chrome，访问：`chrome://extensions/`
2. 打开右上角 **开发者模式**
3. 点击左上角 **“加载已解压的扩展程序”**
4. 选择本项目文件夹 `cursor_chromePlugin-main`
5. 安装成功后，你会在浏览器工具栏看到扩展图标「Quick Translator」

在开发过程中：

- 修改前端代码后，在 `chrome://extensions/` 页面点击该扩展卡片上的 **“重新加载 (Reload)”**
- 然后 **刷新网页**，让新的 `content.js` 重新注入，避免 `Extension context invalidated` 错误

## 使用说明

### 划词翻译（推荐）

1. 打开任意英文网页
2. 用鼠标选中一段或多段英文文本
3. 在选中区域右侧会出现两个悬浮按钮：
   - 点击 **“翻译”**：调用普通翻译（谷歌接口）
   - 点击 **“AI”**：调用经后端代理的 DeepSeek AI 翻译
4. 翻译结果会以浮动气泡形式显示在文本下方，多段文本会按段落分开显示

### 弹窗翻译

1. 点击浏览器右上角的「Quick Translator」扩展图标
2. 在弹出的窗口中输入要翻译的文本
3. 点击：
   - **普通翻译**：使用谷歌翻译
   - **AI 翻译 Beta（DeepSeek）**：使用经后端代理的 DeepSeek 模型
4. 结果会显示在弹窗下方

## 常见问题

- **只翻译了首段文本？**
  - 已在 `background.js` 中处理：会把谷歌返回的多个片段按段落拼接（中间空一行），并借助 `white-space: pre-wrap` 正确显示。

- **报错 `Extension context invalidated`？**
  - 通常是因为你在 `chrome://extensions/` 里重新加载了扩展，但当前网页没刷新。
  - 解决：重新加载扩展后，请刷新网页，然后再试划词翻译。

- **CSP 相关报错 / 其他网络错误？**
  - 绝大部分是网页自身的脚本或第三方广告脚本报错，与本扩展无关，可忽略。

- **AI 翻译一直报“内部错误 / 服务器错误”？**
  - 请确认 `server` 后端是否已启动，`server/.env` 中是否正确配置了 `DEEPSEEK_API_KEY`。

## 许可

此项目用于学习和个人使用，你可以在此基础上自由修改和扩展功能（例如增加更多翻译引擎、语言方向、UI 优化等）。 

