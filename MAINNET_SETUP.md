# 🚀 Mainnet Deployment Guide

## ⚠️ **CRITICAL: Mainnet Transactions Currently Won't Work**

Your contract is currently **only deployed on Sepolia testnet**. Mainnet transactions will fail because:

1. **Contract doesn't exist on mainnet** - Only deployed on Sepolia (Chain ID: 11155111)
2. **Missing environment variable** - `NEXT_PUBLIC_NEXAPAY_CONTRACT` not set
3. **Frontend will try to use Sepolia contract on mainnet** - This will cause transaction failures

## 🔧 **Solution: Deploy to Ethereum Mainnet**

### **Step 1: Prepare Environment Variables**

Create or update your `.env` file with mainnet configuration:

```bash
# Existing variables (keep these)
MAINNET_FEE_WALLET_ADDRESS=0xac05DF16f4942ac9F8Be7AC929c04Db43B29961d
TESTNET_FEE_WALLET_ADDRESS=0x301f2068130A357c91995D40B8807Ca818A01300
FEE_PERCENTAGE=500
ALCHEMY_KEY=your_alchemy_key
DEPLOYER_PK=your_private_key

# Add mainnet token addresses (optional - will use defaults if not provided)
MAINNET_TOKEN_ADDRESSES=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48,0xdAC17F958D2ee523a2206206994597C13D831ec7

# This will be set after mainnet deployment
NEXT_PUBLIC_NEXAPAY_CONTRACT=0xYourMainnetContractAddress
```

### **Step 2: Deploy to Ethereum Mainnet**

```bash
# Deploy to Ethereum mainnet
npx hardhat run scripts/deploy-mainnet.js --network mainnet
```

**⚠️ IMPORTANT:** 
- You need **real ETH** for gas fees
- Make sure your deployer wallet has sufficient ETH
- Mainnet deployment costs real money

### **Step 3: Update Environment Variable**

After successful deployment, update your `.env` file:

```bash
NEXT_PUBLIC_NEXAPAY_CONTRACT=0xYourDeployedMainnetContractAddress
```

### **Step 4: Verify Contract (Optional but Recommended)**

```bash
# Verify on Etherscan
npx hardhat verify --network mainnet 0xYourContractAddress "token1,token2" "mainnetFeeWallet" "testnetFeeWallet" "500"
```

## 🌐 **Multi-Network Support**

Your platform supports multiple networks:

### **Currently Supported:**
- ✅ **Sepolia Testnet** (Chain ID: 11155111) - **DEPLOYED**
- ❌ **Ethereum Mainnet** (Chain ID: 1) - **NEEDS DEPLOYMENT**
- ❌ **Polygon Mainnet** (Chain ID: 137) - **NEEDS DEPLOYMENT**
- ❌ **BSC Mainnet** (Chain ID: 56) - **NEEDS DEPLOYMENT**
- ❌ **Avalanche Mainnet** (Chain ID: 43114) - **NEEDS DEPLOYMENT**

### **Frontend Configuration:**
The frontend (`PaymentForm.tsx`) already supports all these networks with:
- ✅ Network detection
- ✅ Token addresses for each network
- ✅ Cross-chain payments via Stargate
- ✅ Fee routing based on network

## 🔍 **Current Deployment Status**

```json
{
  "contractAddress": "0xE34805ccce8BA2431Af8E7A5D868788CaCb0E501",
  "chainId": 11155111,
  "networkName": "sepolia",
  "deployedAt": "2025-06-21T20:43:48.711Z"
}
```

**This contract only exists on Sepolia testnet!**

## 🧪 **Testing Strategy**

### **Before Mainnet Deployment:**
1. Test thoroughly on Sepolia
2. Verify fee collection works
3. Test cross-chain payments
4. Ensure all features work

### **After Mainnet Deployment:**
1. Test with small amounts first
2. Verify fee routing to mainnet wallet
3. Test cross-chain payments on mainnet
4. Monitor transactions and fees

## 💰 **Fee Collection on Mainnet**

Once deployed to mainnet:
- **Mainnet transactions** → Fees go to `MAINNET_FEE_WALLET_ADDRESS`
- **Testnet transactions** → Fees go to `TESTNET_FEE_WALLET_ADDRESS`
- **Automatic detection** via `block.chainid`

## 🚨 **Security Considerations**

1. **Private Key Security** - Never commit private keys to git
2. **Fee Wallet Security** - Ensure fee wallets are secure
3. **Contract Verification** - Verify contract on Etherscan
4. **Testing** - Test thoroughly before mainnet use

## 📞 **Need Help?**

If you encounter issues:
1. Check gas fees and ETH balance
2. Verify environment variables
3. Check network configuration
4. Review deployment logs

---

**Remember: Mainnet deployment requires real ETH and costs real money. Test thoroughly on Sepolia first!** 