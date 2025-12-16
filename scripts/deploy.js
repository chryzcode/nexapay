"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
            for (var k in ownKeys(mod)) {
                if (k !== "default") __createBinding(result, mod, k);
            }
        }
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const { ethers } = require("hardhat");

async function main() {
    console.log("Deploying NexaPayPayment contract...");
    
    // Get current network first
    const network = await ethers.provider.getNetwork();
    const chainId = network.chainId;
    const isMainnet = chainId === 1 || chainId === 137 || chainId === 56 || chainId === 43114;
    const isTestnet = chainId === 11155111 || chainId === 80001 || chainId === 97 || chainId === 43113;
    
    console.log(`🌐 Deploying to: ${network.name} (Chain ID: ${chainId})`);
    
    // Get environment variables
    const mainnetFeeWallet = process.env.MAINNET_FEE_WALLET_ADDRESS;
    const testnetFeeWallet = process.env.TESTNET_FEE_WALLET_ADDRESS;
    const feePercentage = process.env.FEE_PERCENTAGE || "500"; // Default to 5%
    
    // Get token addresses based on network type
    let initialTokens = [];
    
    if (isMainnet) {
        // For mainnet networks, use only mainnet tokens
        const mainnetTokens = process.env.MAINNET_TOKEN_ADDRESSES ? 
            process.env.MAINNET_TOKEN_ADDRESSES.split(',') : [];
        
        if (mainnetTokens.length === 0) {
            console.log("⚠️  No mainnet token addresses provided in .env");
            console.log("   Using default tokens for this network");
            if (chainId === 1) {
                // Ethereum mainnet
                initialTokens.push(
                    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
                    "0xdAC17F958D2ee523a2206206994597C13D831ec7"  // USDT
                );
            } else if (chainId === 137) {
                // Polygon mainnet
                initialTokens.push(
                    "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // USDC
                    "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"  // USDT
                );
            } else if (chainId === 56) {
                // BSC mainnet
                initialTokens.push(
                    "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", // USDC
                    "0x55d398326f99059fF775485246999027B3197955"  // USDT
                );
            } else if (chainId === 43114) {
                // Avalanche mainnet
                initialTokens.push(
                    "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", // USDC
                    "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7"  // USDT
                );
            }
        } else {
            initialTokens = mainnetTokens;
        }
    } else if (isTestnet) {
        // For testnet networks, use only testnet tokens
        const testnetTokens = process.env.TESTNET_TOKEN_ADDRESSES ? 
            process.env.TESTNET_TOKEN_ADDRESSES.split(',') : [];
        
        if (testnetTokens.length === 0) {
            console.log("⚠️  No testnet token addresses provided in .env");
            console.log("   Using default Sepolia testnet tokens");
            if (chainId === 11155111) {
                // Sepolia
                initialTokens.push(
                    "0x7169d38820dfd117c3fa1f22a697dc8d4277c485", // USDT Sepolia
                    "0x1c7d4b196cb0c7b01d3e18fbfd9a0fd5963e1f05"  // USDC Sepolia
                );
            }
        } else {
            initialTokens = testnetTokens;
        }
    } else {
        console.log("⚠️  Unknown network, using default Sepolia tokens");
        initialTokens.push(
            "0x7169d38820dfd117c3fa1f22a697dc8d4277c485", // USDT Sepolia
            "0x1c7d4b196cb0c7b01d3e18fbfd9a0fd5963e1f05"  // USDC Sepolia
        );
    }
    
    // Validate environment variables
    if (!mainnetFeeWallet) {
        throw new Error("MAINNET_FEE_WALLET_ADDRESS environment variable is required");
    }
    if (!testnetFeeWallet) {
        throw new Error("TESTNET_FEE_WALLET_ADDRESS environment variable is required");
    }
    if (initialTokens.length === 0) {
        console.log("⚠️  Warning: No token addresses provided in environment variables");
        console.log("   Add MAINNET_TOKEN_ADDRESSES and/or TESTNET_TOKEN_ADDRESSES to your .env file");
        console.log("   Example: MAINNET_TOKEN_ADDRESSES=0x123...,0x456...");
        console.log("   Example: TESTNET_TOKEN_ADDRESSES=0x789...,0xabc...");
    }
    
    console.log("Fee Configuration:");
    console.log(`- Mainnet Fee Wallet: ${mainnetFeeWallet}`);
    console.log(`- Testnet Fee Wallet: ${testnetFeeWallet}`);
    console.log(`- Fee Percentage: ${feePercentage} basis points (${Number(feePercentage) / 100}%)`);
    console.log(`- Supported Tokens: ${initialTokens.length} tokens configured`);
    initialTokens.forEach((token, index) => {
        console.log(`  ${index + 1}. ${token}`);
    });
    
    // Get the contract factory
    const NexaPayPayment = await ethers.getContractFactory("NexaPayPayment");
    
    // Deploy the contract
    const nexapayPayment = await NexaPayPayment.deploy(
        initialTokens,
        mainnetFeeWallet,
        testnetFeeWallet,
        feePercentage
    );
    
    // Wait for deployment (compatible with different ethers versions)
    await nexapayPayment.deployed ? nexapayPayment.deployed() : nexapayPayment.waitForDeployment();
    
    // Get contract address (compatible with different ethers versions)
    const contractAddress = nexapayPayment.address || await nexapayPayment.getAddress();
    
    console.log("\n✅ NexaPayPayment deployed successfully!");
    console.log("Contract Address:", contractAddress);
    console.log("Network:", network.name);
    console.log("Chain ID:", chainId);
    
    // Verify deployment
    console.log("\n📋 Deployment Details:");
    console.log("===================");
    console.log(`Contract Address: ${contractAddress}`);
    console.log(`Mainnet Fee Wallet: ${mainnetFeeWallet}`);
    console.log(`Testnet Fee Wallet: ${testnetFeeWallet}`);
    console.log(`Fee Percentage: ${feePercentage} basis points (${Number(feePercentage) / 100}%)`);
    console.log(`Network: ${network.name} (Chain ID: ${chainId})`);
    console.log(`Supported Tokens: ${initialTokens.length}`);
    
    // Save deployment details to file with network-specific name
    const deploymentInfo = {
        contractAddress: contractAddress,
        mainnetFeeWallet: mainnetFeeWallet,
        testnetFeeWallet: testnetFeeWallet,
        feePercentage: Number(feePercentage),
        chainId: chainId,
        networkName: network.name,
        deployedAt: new Date().toISOString(),
        supportedTokens: initialTokens
    };

    const fs = require("fs");
    const networkName = network.name.toLowerCase().replace(/\s+/g, '-');
    const deploymentFile = `deployments/${networkName}-deployment-info.json`;
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log(`\n📄 Deployment info saved to ${deploymentFile}`);

    console.log("\n📋 Fee Collection Configuration:");
    console.log("================================");
    console.log("✅ Mainnet Fee Wallet:", mainnetFeeWallet);
    console.log("✅ Testnet Fee Wallet:", testnetFeeWallet);
    console.log("✅ Fee Percentage:", `${Number(feePercentage) / 100}%`);
    console.log("✅ Network Detection: Automatic via block.chainid");
    
    if (isMainnet) {
        console.log("\n⚠️  MAINNET DEPLOYMENT COMPLETE!");
        console.log("=================================");
        console.log("📝 Next Steps:");
        if (chainId === 1) {
            console.log(`1. Update your .env file with: NEXT_PUBLIC_NEXAPAY_CONTRACT_MAINNET=${contractAddress}`);
        } else if (chainId === 137) {
            console.log(`1. Update your .env file with: NEXT_PUBLIC_NEXAPAY_CONTRACT_POLYGON=${contractAddress}`);
        } else if (chainId === 56) {
            console.log(`1. Update your .env file with: NEXT_PUBLIC_NEXAPAY_CONTRACT_BSC=${contractAddress}`);
        } else if (chainId === 43114) {
            console.log(`1. Update your .env file with: NEXT_PUBLIC_NEXAPAY_CONTRACT_AVALANCHE=${contractAddress}`);
        }
        console.log("2. Verify the contract on block explorer");
        console.log("3. Test with small amounts first");
        console.log("4. Monitor fee collection");
        console.log("\n💰 IMPORTANT: This is a MAINNET deployment using REAL funds!");
    }
    
    console.log("\n🔧 Post-Deployment Options:");
    console.log("===========================");
    console.log("1. Change mainnet fee wallet: setMainnetFeeWallet(address)");
    console.log("2. Change testnet fee wallet: setTestnetFeeWallet(address)");
    console.log("3. Change fee percentage: setFeePercentage(uint256)");
    console.log("4. Add/remove supported tokens: setTokenSupport(address, bool)");
    
    console.log("\n💡 Fees are automatically sent to the appropriate wallet based on network!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);
});
