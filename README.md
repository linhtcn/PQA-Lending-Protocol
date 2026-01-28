# DeFi Lending Protocol Dashboard

A complete React/TypeScript frontend for a DeFi lending protocol with Hardhat smart contracts and ethers.js v6 Web3 integration.

## Features

- Wallet connection with MetaMask
- Network switching to Hardhat local network
- Token balances display (USD8 and WETH)
- Token approval flow
- Lending protocol dashboard:
  - Pool information (total supply, total borrow, utilization rate)
  - Current supply and borrow rates
  - User's supplied and borrowed amounts
  - Health factor with color-coded status
  - Maximum withdrawable and borrowable amounts
- Transaction functions: Supply, Withdraw, Borrow, Repay
- Real-time updates via contract event listeners
- Transaction status tracking

## Project Structure

```
pqa-test/
├── contracts/
│   ├── TestToken.sol         # ERC20-like token contract
│   └── SimpleLending.sol     # Lending protocol contract
├── test/
│   └── SimpleLending.integration.test.js   # Contract integration tests
├── scripts/
│   └── deploy.js             # Deployment script
├── frontend/
│   ├── src/
│   │   ├── abis/             # Contract ABIs (generated)
│   │   ├── contracts/        # Contract addresses (generated)
│   │   ├── components/       # React components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── types/            # TypeScript interfaces
│   │   ├── utils/            # Helper functions
│   │   ├── constants/        # Configuration values
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── hardhat.config.js
├── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js v18+
- MetaMask browser extension

### 1. Install Root Dependencies

```bash
npm install
```

### 2. Compile Smart Contracts

```bash
npx hardhat compile
```

### 3. Start Local Hardhat Node

In a terminal, start the local blockchain:

```bash
npx hardhat node
```

Keep this terminal running.

### 4. Deploy Contracts

In a new terminal, deploy the contracts:

```bash
npm run deploy
```

This will:
- Deploy USD8 and WETH test tokens
- Deploy SimpleLending contract
- Seed test accounts with 10,000 tokens each
- Export ABIs to `frontend/src/abis/`
- Export contract addresses to `frontend/src/contracts/deployments.json`

### 5. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 6. Start Frontend

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### 7. Configure MetaMask

1. Import a test account using one of the private keys below
2. Add the Hardhat network:
   - Network Name: Hardhat Local
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
   - Currency Symbol: ETH

## Running Tests

Contract integration tests run against Hardhat’s built-in network. You do **not** need to start `npx hardhat node` or deploy contracts first.

From the **project root**:

```bash
npm test
```

Or:

```bash
npx hardhat test
```

This runs all tests in the `test/` folder (e.g. `test/SimpleLending.integration.test.js`), which cover contract interactions such as supply, borrow, repay, pool state, and user positions.

To run a specific test file:

```bash
npx hardhat test test/SimpleLending.integration.test.js
```

To see gas usage and other details:

```bash
npx hardhat test --verbose
```

## Test Account Private Keys

Hardhat default accounts (each has 10,000 ETH and 10,000 USD8/WETH after deployment):

| Account | Private Key |
|---------|-------------|
| #0 (Deployer) | `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` |
| #1 | `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d` |
| #2 | `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a` |

## Contract Addresses

After deployment, contract addresses are saved to `frontend/src/contracts/deployments.json`.

Typical addresses (may vary):
- USD8: 0x5FbDB2315678afecb367f032d93F642f64180aa3
- WETH: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
- SimpleLending: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0

## Technical Decisions

### ethers.js v6
- Using `BrowserProvider` instead of deprecated `Web3Provider`
- All token amounts are `bigint` (not `BigNumber`)
- Using `parseUnits`/`formatUnits` for conversions

### State Management
- React hooks only (no Redux/Context needed for this scope)
- Each hook handles its own data fetching and event listening
- Memoized contract instances for performance

### Number Handling
- All token amounts use `bigint` for precision
- User input parsed with `parseUnits`
- BigInts compared directly

### Health Factor
- 75% LTV ratio (can borrow up to 75% of collateral)
- Health factor = (max borrowable / borrowed) * 100
- Color coding:
  - Red (< 100%): Liquidation risk
  - Amber (100-150%): Caution
  - Green (> 150%): Safe
  - Infinite: No borrows

### Error Handling
- User-friendly error messages for common scenarios
- Transaction rejection handling
- Network error handling
- Validation before transactions

## Usage Flow

1. **Connect Wallet**: Click "Connect Wallet" and approve in MetaMask
2. **Switch Network**: If not on Hardhat network, click "Switch Network"
3. **View Balances**: See your USD8 and WETH token balances
4. **Supply Tokens**:
   - Click "Approve USD8" first (one-time)
   - Enter amount and click "Supply"
5. **Borrow**: Supply first, then borrow up to 75% of supplied amount
6. **Withdraw**: Withdraw supplied tokens (limited by health factor)
7. **Repay**: Repay borrowed tokens (requires approval if allowance exhausted)

## Assumptions

1. Single lending token (USD8) for simplicity
2. No interest accrual over time (rates are static displays)
3. No liquidation mechanism implemented
4. Collateral and lending token are the same (USD8)
5. Local Hardhat network for testing (chainId 31337)

## License

MIT
