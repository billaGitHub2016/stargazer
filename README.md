# Stargazer - EVE Frontier Stargate Toll Manager

English | [简体中文](README.zh-CN.md)

Stargazer is a smart toll management DApp built for the [EVE Frontier](https://evefrontier.com/) universe. It allows ordinary players to quickly create their own stargate toll rules, bind them to their in-game stargates, and monetize their territory through an elegant, sci-fi themed web interface.

## 🚀 Features

- **Factory Contract Architecture:** Built on Sui Move, allowing any player to seamlessly generate an independent toll rule configuration and vault.
- **True Ownership:** Only the rule creator (wallet owner) can modify the transit fee or withdraw the accumulated SUI from the vault.
- **Dedicated Payment Portals:** Each rule generates a unique DApp URL (`/gate/:ruleId`). Other players jumping through the gate will use this portal to view fees and process payments.
- **Cinematic UI/UX:** A premium, immersive dark theme inspired by the EVE Frontier aesthetic, featuring Framer Motion animations and Radix UI components.
- **Seamless Web3 Integration:** Deeply integrated with `@evefrontier/dapp-kit` and `@mysten/dapp-kit-react` for seamless wallet authentication and on-chain transaction execution.

## 📁 Project Structure

This repository is structured as a full-stack Web3 application containing both the smart contracts and the frontend DApp.

```text
builder-scaffold/
├── dapps/                              # Frontend React DApp (Vite)
│   ├── src/
│   │   ├── components/                 # Reusable UI components (e.g., Layout)
│   │   ├── config/                     # Configuration files (e.g., Smart Contract Package ID)
│   │   ├── hooks/                      # Custom React Hooks (e.g., useTollRules for fetching on-chain data)
│   │   ├── pages/                      # Page components (Landing, Dashboard, GatePayment)
│   │   ├── App.tsx                     # Main React Router setup
│   │   └── main.css                    # Global Tailwind CSS and Theme variables
│   ├── tailwind.config.js              # Tailwind configuration (Custom EVE colors & fonts)
│   └── package.json                    # Frontend dependencies
│
└── move-contracts/smart_gate_extension/# Sui Move Smart Contracts
    ├── sources/
    │   ├── stargazer.move              # Core factory contract for Stargazer Toll Rules
    │   └── ...                         # Other game extension contracts
    └── Move.toml                       # Move package manifest
```

## 🛠️ Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer)
- [pnpm](https://pnpm.io/) or npm
- [Sui CLI](https://docs.sui.io/guides/developer/getting-started/sui-install) (for contract deployment)

### 1. Smart Contract Deployment (Optional)

If you wish to deploy your own version of the Stargazer contract to the Sui network:

```bash
cd move-contracts/smart_gate_extension

# Ensure your Sui CLI is set to testnet/mainnet and has gas
sui client publish --with-unpublished-dependencies --gas-budget 200000000
```

*Note: After deployment, copy the newly generated `Package ID` and update `dapps/src/config/constants.ts`.*

### 2. Frontend Local Development

Install dependencies and start the Vite development server:

```bash
cd dapps

# Install dependencies
npm install

# Start the local development server
npm run dev
```

The application will be running at `http://localhost:5173`.

### 3. Production Build

To build the frontend for production deployment (e.g., to Vercel):

```bash
cd dapps
npm run build
```

## 🔗 Live Preview

The latest version of this project is deployed on Vercel:
👉 **[Stargazer DApp](https://traebuilder-scaffoldorr1.vercel.app/)**

## 📚 References
- [EVE Frontier Official Site](https://evefrontier.com/en)
- [EVE Bootcamp GitHub](https://github.com/hoh-zone/eve-bootcamp/tree/main/src/zh)
- [Sui Move Documentation](https://docs.sui.io/)
