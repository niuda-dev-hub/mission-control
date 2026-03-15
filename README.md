<h1 align="center">Autensa</h1>

<p align="center">
  <em>Formerly known as Mission Control</em><br>
  <a href="https://autensa.com">autensa.com</a>
</p>

<p align="center">
  <strong>AI 智能体编排看板</strong><br>
  创建任务 · AI 规划 · 分配智能体 · 实时查看执行
</p>

<p align="center">
  <img src="https://img.shields.io/github/stars/crshdn/mission-control?style=flat-square" alt="GitHub Stars" />
  <img src="https://img.shields.io/github/issues/crshdn/mission-control?style=flat-square" alt="GitHub Issues" />
  <img src="https://img.shields.io/github/license/crshdn/mission-control?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square" alt="PRs Welcome" />
  <img src="https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/SQLite-3-003B57?style=flat-square&logo=sqlite&logoColor=white" alt="SQLite" />
</p>

<p align="center">
  <a href="README.en.md"><strong>English</strong></a>
</p>

<p align="center">
  <a href="https://missioncontrol.ghray.com"><strong>🎮 在线演示</strong></a> •
  <a href="#-快速开始">快速开始</a> •
  <a href="#-docker">Docker</a> •
  <a href="#-功能">功能</a> •
  <a href="#-工作原理">工作原理</a> •
  <a href="#-配置">配置</a> •
  <a href="#-贡献者">贡献者</a>
</p>

<p align="center">

https://github.com/user-attachments/assets/76af060c-fdb1-40cb-b575-46c7a807845d

</p>

---

## 🆕 v1.5.3 更新内容

- **阶段切换时清理智能体状态** — 任务在管线阶段切换或完成时，上一位智能体会被重置为 `standby`，避免长时间显示 `working`。
- **派发死锁修复**（v1.5.2）— 检测并重试卡住的派发；失败的派发会回退到 `assigned` 并记录错误。

### 之前版本
- v1.5.1：智能体目录同步、按任务动态路由、严格阶段治理、失败升级、实时徽章。

完整记录见 [CHANGELOG](CHANGELOG.md)。

### Releases
- GitHub Releases: https://github.com/crshdn/mission-control/releases
- 当前目标版本：`v1.5.3`

---

## ✨ 功能

🎯 **任务管理** — 看板拖拽，7 个状态列

🧠 **AI 规划** — 交互式问答，明确需求后再开工

🤖 **智能体系统** — 自动创建角色、分配任务、实时追踪

🔗 **网关智能体发现** — 一键从 OpenClaw Gateway 导入已有智能体

🔌 **OpenClaw 集成** — 通过 WebSocket 与 [OpenClaw Gateway](https://github.com/openclaw/openclaw) 编排智能体

🐳 **Docker 就绪** — 生产级 Dockerfile + docker-compose

🔒 **安全优先** — Bearer token 鉴权、HMAC Webhook、Zod 校验、路径保护、安全头

🛡️ **隐私优先** — 默认无埋点、无集中式数据收集

📡 **实时动态** — 事件流展示智能体行为与系统状态

🌐 **多机部署** — 看板与智能体可在不同机器上运行（支持 Tailscale）

---

## 🛡️ 隐私

Mission Control 是开源自托管项目，不包含广告追踪或第三方分析脚本。
默认情况下，你的任务/项目数据仅保留在自己的部署环境中（SQLite + workspace）。
若连接外部服务（如 AI 提供商或远程网关），只有你明确发送的数据会离开本地，并受其各自政策约束。

---

## 🏗 架构

```
┌──────────────────────────────────────────────────────────────┐
│                       YOUR MACHINE                           │
│                                                              │
│  ┌─────────────────┐          ┌──────────────────────────┐  │
│  │ Mission Control  │◄────────►│    OpenClaw Gateway      │  │
│  │   (Next.js)      │   WS     │  (AI Agent Runtime)      │  │
│  │   Port 4000      │          │  Port 18789              │  │
│  └────────┬─────────┘          └───────────┬──────────────┘  │
│           │                                │                  │
│           ▼                                ▼                  │
│  ┌─────────────────┐          ┌──────────────────────────┐  │
│  │     SQLite       │          │     AI Provider          │  │
│  │    Database      │          │  (Anthropic / OpenAI)    │  │
│  └─────────────────┘          └──────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

**Mission Control** = 交互看板（本项目）
**OpenClaw Gateway** = 智能体运行时（[独立项目](https://github.com/openclaw/openclaw)）

---

## 🚀 快速开始

### 前置条件

- **Node.js** v18+（[下载](https://nodejs.org/)）
- **OpenClaw Gateway** — `npm install -g openclaw`
- **AI API Key** — Anthropic（推荐）、OpenAI、Google，或通过 OpenRouter

### 安装

```bash
# 克隆
git clone https://github.com/crshdn/mission-control.git
cd mission-control

# 安装依赖
npm install

# 初始化配置
cp .env.example .env.local
```

编辑 `.env.local`：

```env
OPENCLAW_GATEWAY_URL=ws://127.0.0.1:18789
OPENCLAW_GATEWAY_TOKEN=your-token-here
```

> **Token 获取方式：** 查看 `~/.openclaw/openclaw.json` 中 `gateway.token`

### 运行

```bash
# 启动 OpenClaw（另一个终端）
openclaw gateway start

# 启动 Mission Control
npm run dev
```

浏览器打开 **http://localhost:4000** 即可。

### 生产环境

```bash
npm run build
npx next start -p 4000
```

---

## 🐳 Docker

可以直接使用已构建好的 Docker Hub 镜像（`niuda123/mission-control`）。

### 前置条件

- Docker Desktop（或 Docker Engine + Compose 插件）
- OpenClaw Gateway 运行在本机或远程

### 1) 配置环境

创建 `.env`：

```bash
cp .env.example .env
```

至少设置：

```env
OPENCLAW_GATEWAY_URL=ws://host.docker.internal:18789
OPENCLAW_GATEWAY_TOKEN=your-token-here
```

说明：
- 如果 OpenClaw 在宿主机，使用 `host.docker.internal`。
- 如果在其他机器，请改成可访问的 `ws://` / `wss://` 地址。

### 2) 启动（拉取镜像）

```bash
docker compose up -d
```

访问 **http://localhost:4000**。

### 3) 常用命令

```bash
# 查看日志
docker compose logs -f mission-control

# 停止容器
docker compose down

# 停止并删除数据卷（会清空 SQLite / workspace 数据）
docker compose down -v
```

### 数据持久化

Compose 使用命名卷：
- `mission-control-data` 保存 SQLite（`/app/data`）
- `mission-control-workspace` 保存 workspace 文件（`/app/workspace`）

---

## 🎯 工作原理

```
 CREATE          PLAN            ASSIGN          EXECUTE         DELIVER
┌────────┐    ┌────────┐    ┌────────────┐    ┌──────────┐    ┌────────┐
│  New   │───►│  AI    │───►│   Agent    │───►│  Agent   │───►│  Done  │
│  Task  │    │  Q&A   │    │  Created   │    │  Works   │    │  ✓     │
└────────┘    └────────┘    └────────────┘    └──────────┘    └────────┘
```

1. **创建任务** — 输入标题与描述
2. **AI 规划** — AI 提问以明确需求
3. **智能体分配** — 根据回答自动创建并分配
4. **执行** — 智能体完成工作（写代码、浏览网页、生成交付物等）
5. **交付** — 结果出现在 Mission Control

### 任务流转

```
PLANNING → INBOX → ASSIGNED → IN PROGRESS → TESTING → REVIEW → DONE
```

你可以拖拽状态列，或交由系统自动推进。

---

## ⚙️ 配置

### 环境变量

| 变量 | 必填 | 默认值 | 说明 |
|:---------|:--------:|:--------|:------------|
| `OPENCLAW_GATEWAY_URL` | ✅ | `ws://127.0.0.1:18789` | OpenClaw Gateway WebSocket 地址 |
| `OPENCLAW_GATEWAY_TOKEN` | ✅ | — | OpenClaw 鉴权 Token |
| `MC_API_TOKEN` | — | — | API 鉴权 Token（开启鉴权中间件） |
| `WEBHOOK_SECRET` | — | — | Webhook HMAC 密钥 |
| `DATABASE_PATH` | — | `./mission-control.db` | SQLite 数据库位置 |
| `WORKSPACE_BASE_PATH` | — | `~/Documents/Shared` | workspace 基础目录 |
| `PROJECTS_PATH` | — | `~/Documents/Shared/projects` | 项目目录 |

### 安全（生产环境）

生成安全 Token：

```bash
# API 鉴权 Token
openssl rand -hex 32

# Webhook 签名 Secret
openssl rand -hex 32
```

写入 `.env.local`：

```env
MC_API_TOKEN=your-64-char-hex-token
WEBHOOK_SECRET=your-64-char-hex-token
```

当 `MC_API_TOKEN` 设置后：
- 外部 API 访问需要 `Authorization: Bearer <token>`
- 浏览器 UI 仍可正常访问（同源请求放行）
- SSE 流支持 query param 传 token

生产部署详见 [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md)。

---

## 🌐 多机部署

让 Mission Control 与 OpenClaw 在不同机器上运行：

```env
OPENCLAW_GATEWAY_URL=ws://YOUR_SERVER_IP:18789
OPENCLAW_GATEWAY_TOKEN=your-shared-token
```

### 使用 Tailscale（推荐）

```env
OPENCLAW_GATEWAY_URL=wss://your-machine.tailnet-name.ts.net
OPENCLAW_GATEWAY_TOKEN=your-shared-token
```

---

## 🗄 数据库

SQLite 数据库默认位于 `./mission-control.db`：

```bash
# 重置（全新开始）
rm mission-control.db

# 查看表结构
sqlite3 mission-control.db ".tables"
```

---

## 📁 项目结构

```
mission-control/
├── src/
│   ├── app/                    # Next.js 页面与 API 路由
│   │   ├── api/
│   │   │   ├── tasks/          # 任务 CRUD + 规划 + 派发
│   │   │   ├── agents/         # 智能体管理
│   │   │   ├── openclaw/       # Gateway 代理
│   │   │   └── webhooks/       # 完成回调
│   │   ├── settings/           # 设置页
│   │   └── workspace/[slug]/   # 工作区看板
│   ├── components/             # React 组件
│   │   ├── MissionQueue.tsx    # 任务看板
│   │   ├── PlanningTab.tsx     # AI 规划界面
│   │   ├── AgentsSidebar.tsx   # 智能体侧栏
│   │   ├── LiveFeed.tsx        # 实时事件
│   │   └── TaskModal.tsx       # 任务创建/编辑
│   └── lib/
│       ├── db/                 # SQLite + 迁移
│       ├── openclaw/           # Gateway 客户端
│       ├── validation.ts       # Zod 校验
│       └── types.ts            # TypeScript 类型
├── scripts/                    # 脚本
├── middleware.ts               # 鉴权中间件
├── .env.example                # 环境变量模板
└── CHANGELOG.md                # 版本历史
```

---

## 🔧 常见问题

### 无法连接 OpenClaw Gateway

1. 确认 OpenClaw 已启动：`openclaw gateway status`
2. 检查 `.env.local` 中的 URL 和 Token
3. 确认防火墙未阻挡 18789 端口

### 规划问题不出现

1. 查看 OpenClaw 日志：`openclaw gateway logs`
2. 确认 AI API Key 有效
3. 刷新页面并重新打开任务

### 端口 4000 被占用

```bash
lsof -i :4000
kill -9 <PID>
```

### 代理环境下回调失败（502）

若处于代理环境（企业 VPN / Hiddify 等），代理可能拦截 `localhost` 回调。解决方法：

```bash
# Linux / macOS
export NO_PROXY=localhost,127.0.0.1

# Windows (cmd)
set NO_PROXY=localhost,127.0.0.1

# Docker
docker run -e NO_PROXY=localhost,127.0.0.1 ...
```

详见 [Issue #30](https://github.com/crshdn/mission-control/issues/30)。

---

## 🌿 分支说明

- **main 分支**：通过 `sync-upstream.yml` 自动与上游仓库 `upstream/main` 进行 **fast-forward 同步**，用于保持与上游一致，不建议直接提交。
- **master 分支**：本仓库的日常开发分支（当前工作使用）。
- **feature 分支**：建议在功能开发时使用，例如 `feature/xxx`，完成后合并到 `master`。

> 说明：如果你在自己的 fork 中工作，建议遵循此策略以避免与上游同步流程冲突。

---

## 🤝 贡献

1. Fork 仓库
2. 创建功能分支：`git checkout -b feature/amazing-feature`
3. 提交变更：`git commit -m 'feat: add amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 提交 Pull Request

---

## 👏 贡献者

Mission Control 由社区共同打造，感谢所有贡献者！

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/superlowburn">
        <img src="https://github.com/superlowburn.png?size=80" width="80" height="80" style="border-radius:50%" alt="Steve" /><br />
        <sub><b>Steve</b></sub>
      </a><br />
      <sub>Device Identity</sub>
    </td>
    <td align="center">
      <a href="https://github.com/rchristman89">
        <img src="https://github.com/rchristman89.png?size=80" width="80" height="80" style="border-radius:50%" alt="Ryan Christman" /><br />
        <sub><b>Ryan Christman</b></sub>
      </a><br />
      <sub>Port Configuration</sub>
    </td>
    <td align="center">
      <a href="https://github.com/nicozefrench">
        <img src="https://github.com/nicozefrench.png?size=80" width="80" height="80" style="border-radius:50%" alt="nicozefrench" /><br />
        <sub><b>nicozefrench</b></sub>
      </a><br />
      <sub>ARIA Hooks</sub>
    </td>
    <td align="center">
      <a href="https://github.com/misterdas">
        <img src="https://github.com/misterdas.png?size=80" width="80" height="80" style="border-radius:50%" alt="GOPAL" /><br />
        <sub><b>GOPAL</b></sub>
      </a><br />
      <sub>Node v25 Support</sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="https://github.com/joralemarti">
        <img src="https://github.com/joralemarti.png?size=80" width="80" height="80" style="border-radius:50%" alt="Jorge Martinez" /><br />
        <sub><b>Jorge Martinez</b></sub>
      </a><br />
      <sub>Orchestration</sub>
    </td>
    <td align="center">
      <a href="https://github.com/niks918">
        <img src="https://github.com/niks918.png?size=80" width="80" height="80" style="border-radius:50%" alt="Nik" /><br />
        <sub><b>Nik</b></sub>
      </a><br />
      <sub>Planning & Dispatch</sub>
    </td>
    <td align="center">
      <a href="https://github.com/gmb9000">
        <img src="https://github.com/gmb9000.png?size=80" width="80" height="80" style="border-radius:50%" alt="Michael G" /><br />
        <sub><b>Michael G</b></sub>
      </a><br />
      <sub>Usage Dashboard</sub>
    </td>
    <td align="center">
      <a href="https://github.com/Z8Medina">
        <img src="https://github.com/Z8Medina.png?size=80" width="80" height="80" style="border-radius:50%" alt="Z8Medina" /><br />
        <sub><b>Z8Medina</b></sub>
      </a><br />
      <sub>Metabase Integration</sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="https://github.com/markphelps">
        <img src="https://github.com/markphelps.png?size=80" width="80" height="80" style="border-radius:50%" alt="Mark Phelps" /><br />
        <sub><b>Mark Phelps</b></sub>
      </a><br />
      <sub>Gateway Agent Discovery 💡</sub>
    </td>
    <td align="center">
      <a href="https://github.com/muneale">
        <img src="https://github.com/muneale.png?size=80" width="80" height="80" style="border-radius:50%" alt="Alessio" /><br />
        <sub><b>Alessio</b></sub>
      </a><br />
      <sub>Docker Support</sub>
    </td>
    <td align="center">
      <a href="https://github.com/JamesTsetsekas">
        <img src="https://github.com/JamesTsetsekas.png?size=80" width="80" height="80" style="border-radius:50%" alt="James Tsetsekas" /><br />
        <sub><b>James Tsetsekas</b></sub>
      </a><br />
      <sub>Planning Flow Fixes</sub>
    </td>
    <td align="center">
      <a href="https://github.com/nice-and-precise">
        <img src="https://github.com/nice-and-precise.png?size=80" width="80" height="80" style="border-radius:50%" alt="nice-and-precise" /><br />
        <sub><b>nice-and-precise</b></sub>
      </a><br />
      <sub>Agent Protocol Docs</sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="https://github.com/JamesCao2048">
        <img src="https://github.com/JamesCao2048.png?size=80" width="80" height="80" style="border-radius:50%" alt="JamesCao2048" /><br />
        <sub><b>JamesCao2048</b></sub>
      </a><br />
      <sub>Task Creation Fix</sub>
    </td>
    <td align="center">
      <a href="https://github.com/davetha">
        <img src="https://github.com/davetha.png?size=80" width="80" height="80" style="border-radius:50%" alt="davetha" /><br />
        <sub><b>davetha</b></sub>
      </a><br />
      <sub>Force-Dynamic & Model Discovery</sub>
    </td>
    <td align="center">
      <a href="https://github.com/pkgaiassistant-droid">
        <img src="https://github.com/pkgaiassistant-droid.png?size=80" width="80" height="80" style="border-radius:50%" alt="pkgaiassistant-droid" /><br />
        <sub><b>pkgaiassistant-droid</b></sub>
      </a><br />
      <sub>Activity Dashboard & Mobile UX</sub>
    </td>
    <td align="center">
      <a href="https://github.com/Coder-maxer">
        <img src="https://github.com/Coder-maxer.png?size=80" width="80" height="80" style="border-radius:50%" alt="Coder-maxer" /><br />
        <sub><b>Coder-maxer</b></sub>
      </a><br />
      <sub>Static Route Fix</sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="https://github.com/grunya-openclaw">
        <img src="https://github.com/grunya-openclaw.png?size=80" width="80" height="80" style="border-radius:50%" alt="grunya-openclaw" /><br />
        <sub><b>grunya-openclaw</b></sub>
      </a><br />
      <sub>Dispatch & Proxy Bug Reports</sub>
    </td>
    <td align="center">
      <a href="https://github.com/ilakskill">
        <img src="https://github.com/ilakskill.png?size=80" width="80" height="80" style="border-radius:50%" alt="ilakskill" /><br />
        <sub><b>ilakskill</b></sub>
      </a><br />
      <sub>Dispatch Recovery Design</sub>
    </td>
    <td align="center">
      <a href="https://github.com/plutusaisystem-cmyk">
        <img src="https://github.com/plutusaisystem-cmyk.png?size=80" width="80" height="80" style="border-radius:50%" alt="plutusaisystem-cmyk" /><br />
        <sub><b>plutusaisystem-cmyk</b></sub>
      </a><br />
      <sub>Agent Daemon & Fleet View</sub>
    </td>
    <td align="center">
      <a href="https://github.com/nithis4th">
        <img src="https://github.com/nithis4th.png?size=80" width="80" height="80" style="border-radius:50%" alt="nithis4th" /><br />
        <sub><b>nithis4th</b></sub>
      </a><br />
      <sub>2nd Brain Knowledge Base</sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="https://github.com/davidpellerin">
        <img src="https://github.com/davidpellerin.png?size=80" width="80" height="80" style="border-radius:50%" alt="davidpellerin" /><br />
        <sub><b>davidpellerin</b></sub>
      </a><br />
      <sub>Dynamic Agent Config</sub>
    </td>
    <td align="center">
      <a href="https://github.com/tmchow">
        <img src="https://github.com/tmchow.png?size=80" width="80" height="80" style="border-radius:50%" alt="tmchow" /><br />
        <sub><b>tmchow</b></sub>
      </a><br />
      <sub>Agent Import Improvements</sub>
    </td>
    <td align="center">
      <a href="https://github.com/xiaomiusa87">
        <img src="https://github.com/xiaomiusa87.png?size=80" width="80" height="80" style="border-radius:50%" alt="xiaomiusa87" /><br />
        <sub><b>xiaomiusa87</b></sub>
      </a><br />
      <sub>Session Key Bug Report</sub>
    </td>
    <td align="center">
      <a href="https://github.com/lutherbot-ai">
        <img src="https://github.com/lutherbot-ai.png?size=80" width="80" height="80" style="border-radius:50%" alt="lutherbot-ai" /><br />
        <sub><b>lutherbot-ai</b></sub>
      </a><br />
      <sub>Security Audit</sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="https://github.com/YitingOU">
        <img src="https://github.com/YitingOU.png?size=80" width="80" height="80" style="border-radius:50%" alt="YITING OU" /><br />
        <sub><b>YITING OU</b></sub>
      </a><br />
      <sub>Cascade Delete Fix</sub>
    </td>
    <td align="center">
      <a href="https://github.com/brandonros">
        <img src="https://github.com/brandonros.png?size=80" width="80" height="80" style="border-radius:50%" alt="Brandon Ros" /><br />
        <sub><b>Brandon Ros</b></sub>
      </a><br />
      <sub>Docker CI Workflow</sub>
    </td>
    <td align="center">
      <a href="https://github.com/nano-lgtm">
        <img src="https://github.com/nano-lgtm.png?size=80" width="80" height="80" style="border-radius:50%" alt="nano-lgtm" /><br />
        <sub><b>nano-lgtm</b></sub>
      </a><br />
      <sub>Kanban UX Improvements</sub>
    </td>
    <td align="center">
      <a href="https://github.com/cammybot1313-collab">
        <img src="https://github.com/cammybot1313-collab.png?size=80" width="80" height="80" style="border-radius:50%" alt="cammybot1313-collab" /><br />
        <sub><b>cammybot1313-collab</b></sub>
      </a><br />
      <sub>Docs Typo Fix</sub>
    </td>
  </tr>
</table>

---

## ⭐ Star History

<a href="https://www.star-history.com/#crshdn/mission-control&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=crshdn/mission-control&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=crshdn/mission-control&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=crshdn/mission-control&type=Date" width="600" />
  </picture>
</a>

---

## 📜 许可证

MIT License — 详见 [LICENSE](LICENSE)。

---

## 🙏 致谢

[![OpenClaw](https://img.shields.io/badge/OpenClaw-Gateway-blue?style=for-the-badge)](https://github.com/open-claw/open-claw-gateway)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Anthropic](https://img.shields.io/badge/Anthropic-Claude-orange?style=for-the-badge)](https://www.anthropic.com/)

---

## ☕ 支持

如果 Mission Control 对你有帮助，欢迎请作者喝杯咖啡 ☕

<a href="https://buymeacoffee.com/crshdn" target="_blank">
  <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="50" />
</a>

---

<p align="center">
  <strong>祝编排顺利！</strong> 🚀
</p>
