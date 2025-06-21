# NexaPay - Cross-Chain Payment Platform

A decentralized payment platform that enables seamless cross-chain transactions using Stargate bridges, with automatic fee collection for testnet and mainnet networks.

## Features

- 🌐 **Cross-Chain Payments**: Send payments across multiple EVM chains using Stargate bridges
- 💰 **Automatic Fee Collection**: 5% fee automatically deducted and sent to appropriate wallet based on network
- 🔄 **Network Detection**: Automatic detection of testnet vs mainnet for fee routing
- 🛡️ **Secure**: Smart contract-based payments with proper validation
- 📱 **Modern UI**: Beautiful, responsive interface built with Next.js and Tailwind CSS
- 🔐 **Authentication**: JWT-based authentication system
- 📊 **Analytics**: Real-time transaction tracking and analytics

## Fee Collection System

The platform automatically collects a 5% fee on all transactions, with intelligent routing:

- **Testnet Transactions**: Fees sent to `TESTNET_FEE_WALLET_ADDRESS`
- **Mainnet Transactions**: Fees sent to `MAINNET_FEE_WALLET_ADDRESS`

### Supported Networks

**Mainnet Networks:**
- Ethereum (Chain ID: 1)
- Polygon (Chain ID: 137)
- BSC (Chain ID: 56)
- Avalanche (Chain ID: 43114)
- Base (Chain ID: 8453)

**Testnet Networks:**
- Sepolia (Chain ID: 11155111)
- Mumbai/Polygon Testnet (Chain ID: 80001)
- BSC Testnet (Chain ID: 97)
- Fuji/Avalanche Testnet (Chain ID: 43113)

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd nexapay
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Run the setup script to configure fee collection:

```bash
node scripts/setup-env.js
```

This will prompt you for:
- `MAINNET_FEE_WALLET_ADDRESS`: Your mainnet fee collection wallet
- `TESTNET_FEE_WALLET_ADDRESS`: Your testnet fee collection wallet
- `FEE_PERCENTAGE`: Fee percentage in basis points (default: 500 = 5%)

### 4. Deploy Smart Contract

```bash
# Deploy to testnet (recommended first)
npx hardhat run scripts/deploy.js --network sepolia

# Deploy to mainnet
npx hardhat run scripts/deploy.js --network polygon
```

### 5. Update Frontend Configuration

After deployment, update your `.env` file with the deployed contract address:

```env
NEXT_PUBLIC_NEXAPAY_CONTRACT=0xYourDeployedContractAddress
```

### 6. Start Development Server

```bash
npm run dev
```

## Environment Variables

Create a `.env` file with the following variables:

```env
# Fee Collection Configuration
MAINNET_FEE_WALLET_ADDRESS=0xYourMainnetFeeWalletAddress
TESTNET_FEE_WALLET_ADDRESS=0xYourTestnetFeeWalletAddress
FEE_PERCENTAGE=500

# Contract Configuration
NEXT_PUBLIC_NEXAPAY_CONTRACT=0xYourDeployedContractAddress

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/nexapay

# JWT Configuration
JWT_SECRET=your-jwt-secret-key-here

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Environment
NODE_ENV=development
```

## Smart Contract

### NexaPayPayment.sol

The main smart contract that handles payments and fee collection:

- **Automatic Network Detection**: Uses `block.chainid` to determine testnet vs mainnet
- **Fee Routing**: Automatically sends fees to the appropriate wallet based on network
- **Token Support**: Configurable list of supported ERC20 tokens
- **Owner Functions**: Ability to update fee wallets, percentages, and supported tokens

### Key Functions

- `pay()`: Process payment with automatic fee deduction
- `setMainnetFeeWallet()`: Update mainnet fee wallet (owner only)
- `setTestnetFeeWallet()`: Update testnet fee wallet (owner only)
- `setFeePercentage()`: Update fee percentage (owner only)
- `setTokenSupport()`: Add/remove supported tokens (owner only)

## Fee Collection Examples

### Testnet Transaction
```javascript
// On Sepolia testnet
// Payment: 100 USDC
// Fee: 5 USDC (5%)
// Merchant receives: 95 USDC
// Fee sent to: TESTNET_FEE_WALLET_ADDRESS
```

### Mainnet Transaction
```javascript
// On Polygon mainnet
// Payment: 1000 USDT
// Fee: 50 USDT (5%)
// Merchant receives: 950 USDT
// Fee sent to: MAINNET_FEE_WALLET_ADDRESS
```

## Development

### Scripts

```bash
# Setup environment variables
node scripts/setup-env.js

# Deploy contract
npm run deploy

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Start development server
npm run dev
```

### Testing

1. **Testnet Testing**: Always test on testnet first
2. **Fee Verification**: Verify fees are sent to correct wallets
3. **Cross-Chain Testing**: Test payments across different networks
4. **Token Support**: Test with different ERC20 tokens

## Security Considerations

- ✅ Fee wallets are set during deployment and can be updated by owner
- ✅ Fee percentage is capped at 10% (1000 basis points)
- ✅ Owner-only functions for critical updates
- ✅ Automatic network detection prevents fee routing errors
- ✅ Proper input validation and error handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on testnet
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the smart contract code

---

**Note**: Always test on testnet before deploying to mainnet. The fee collection system is designed to be secure and efficient, automatically routing fees to the appropriate wallets based on the network.
