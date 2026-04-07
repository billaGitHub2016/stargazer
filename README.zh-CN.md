# Stargazer - EVE Frontier 星门收费管理系统

[English](README.md) | 简体中文

Stargazer 是一款为 [EVE Frontier](https://evefrontier.com/) 宇宙打造的星门收费智能管理 DApp。它允许普通玩家通过极简、科幻风的网页界面，快速创建属于自己的星门收费规则，将其绑定到游戏中的星门上，从而实现领地变现。

## 🚀 核心功能

- **工厂合约架构：** 基于 Sui Move 智能合约开发，允许任何玩家无缝生成独立的收费规则配置与专属金库。
- **绝对所有权：** 只有规则的创建者（连接的钱包所有者）有权修改通行费用或从金库中提取累积的 SUI 代币。
- **独立的支付门户：** 每个规则都会生成一个专属的 DApp URL (`/gate/:ruleId`)。其他玩家在通过星门跳跃时将通过此门户查看费用并完成支付。
- **电影级 UI/UX：** 采用 EVE Frontier 官方视觉风格，提供沉浸式的暗黑主题、Framer Motion 动画交互以及 Radix UI 组件。
- **无缝 Web3 整合：** 深度集成 `@evefrontier/dapp-kit` 和 `@mysten/dapp-kit-react`，实现顺畅的钱包授权与链上交易。

## 📁 项目结构

本项目是一个全栈 Web3 应用，包含智能合约层与前端 DApp 层。

```text
builder-scaffold/
├── dapps/                              # 前端 React DApp (基于 Vite)
│   ├── src/
│   │   ├── components/                 # 可复用 UI 组件 (如全局布局 Layout)
│   │   ├── config/                     # 配置文件 (如智能合约 Package ID)
│   │   ├── hooks/                      # 自定义 React Hooks (如获取链上数据的 useTollRules)
│   │   ├── pages/                      # 页面级组件 (落地页、控制面板、支付页)
│   │   ├── App.tsx                     # 核心路由配置
│   │   └── main.css                    # Tailwind CSS 全局样式与主题变量
│   ├── tailwind.config.js              # Tailwind 配置 (自定义 EVE 颜色与字体)
│   └── package.json                    # 前端依赖配置
│
└── move-contracts/stargazer/           # Sui Move 智能合约
    ├── sources/
    │   ├── stargazer.move              # Stargazer 收费规则核心工厂合约
    │   └── ...                         # 游戏内的其他拓展合约
    └── Move.toml                       # Move 包清单文件
```

## 🛠️ 开发环境运行步骤

### 环境要求

- [Node.js](https://nodejs.org/) (v18 或更高版本)
- [pnpm](https://pnpm.io/) 或 npm
- [Sui CLI](https://docs.sui.io/guides/developer/getting-started/sui-install) (用于部署智能合约)

### 1. 部署智能合约（可选）

如果你希望将 Stargazer 合约部署到 Sui 测试网或主网：

```bash
cd move-contracts/stargazer

# 确保你的 Sui CLI 已经配置好网络并拥有足够的 Gas
sui client publish --with-unpublished-dependencies --gas-budget 200000000
```

*注意：部署完成后，请复制终端输出的 `Package ID`，并更新到 `dapps/src/config/constants.ts` 文件中。*

### 2. 启动前端本地开发

安装前端依赖并启动 Vite 本地服务器：

```bash
cd dapps

# 安装依赖
npm install

# 启动本地开发服务器
npm run dev
```

启动后，在浏览器中访问 `http://localhost:5173` 即可预览应用。

### 3. 构建生产版本

如需打包前端项目以便部署（如部署到 Vercel）：

```bash
cd dapps
npm run build
```

## �️ 路径规划

在未来的更新中，我们将扩展项目功能，支持更多复杂的游戏机制与组件控制：

- **高级星门逻辑模板：** 添加更加复杂的星门通过控制逻辑模板，例如：白名单/黑名单系统、基于时间的通行权限、代币门槛控制等。
- **炮塔控制功能：** 引入自动化防御炮塔的智能合约和前端管理界面，允许玩家配置攻击规则与运行模式。
- **仓库管理功能：** 增加对游戏内仓库等 Assembly 的控制功能，实现物资的安全存储、库存管理及自动化交易物流体系。

## �🔗 在线预览

本项目的最新版本已自动部署至 Vercel，点击下方链接即可体验：
👉 **[Stargazer DApp](https://stargazer-eve.vercel.app/)**

## 📚 参考资料
- [EVE Frontier 官方网站](https://evefrontier.com/en)
- [EVE Bootcamp GitHub 教程](https://github.com/hoh-zone/eve-bootcamp/tree/main/src/zh)
- [Sui Move 官方文档](https://docs.sui.io/)
