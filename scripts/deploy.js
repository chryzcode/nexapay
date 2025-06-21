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
    
    // Get environment variables
    const mainnetFeeWallet = process.env.MAINNET_FEE_WALLET_ADDRESS;
    const testnetFeeWallet = process.env.TESTNET_FEE_WALLET_ADDRESS;
    const feePercentage = process.env.FEE_PERCENTAGE || "500"; // Default to 5%
    
    // Get token addresses from environment variables (Sepolia and Ethereum Mainnet only)
    const mainnetTokens = process.env.MAINNET_TOKEN_ADDRESSES ? 
        process.env.MAINNET_TOKEN_ADDRESSES.split(',') : [];
    const testnetTokens = process.env.TESTNET_TOKEN_ADDRESSES ? 
        process.env.TESTNET_TOKEN_ADDRESSES.split(',') : [];
    
    // Combine all token addresses
    const initialTokens = [...mainnetTokens, ...testnetTokens];
    
    // If no tokens provided, use default Sepolia testnet tokens
    if (initialTokens.length === 0) {
        console.log("⚠️  No token addresses provided in environment variables");
        console.log("   Using default Sepolia testnet tokens");
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
    
    if (mainnetTokens.length > 0) {
        console.log(`  Mainnet tokens: ${mainnetTokens.length}`);
    }
    if (testnetTokens.length > 0) {
        console.log(`  Testnet tokens: ${testnetTokens.length}`);
    }
    
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
    
    console.log("NexaPayPayment deployed to:", contractAddress);
    console.log("Contract deployed successfully!");
    console.log("Network:", (await ethers.provider.getNetwork()).name);
    console.log("Chain ID:", (await ethers.provider.getNetwork()).chainId);
    
    // Verify deployment
    console.log("\nDeployment Details:");
    console.log("===================");
    console.log(`Contract Address: ${contractAddress}`);
    console.log(`Mainnet Fee Wallet: ${mainnetFeeWallet}`);
    console.log(`Testnet Fee Wallet: ${testnetFeeWallet}`);
    console.log(`Fee Percentage: ${feePercentage} basis points`);
    
    // Get current network info
    const network = await ethers.provider.getNetwork();
    console.log(`Deployed on Network: ${network.name} (Chain ID: ${network.chainId})`);
    
    // Save deployment details to file
    const deploymentInfo = {
        contractAddress: contractAddress,
        mainnetFeeWallet: mainnetFeeWallet,
        testnetFeeWallet: testnetFeeWallet,
        feePercentage: Number(feePercentage),
        chainId: network.chainId,
        networkName: network.name,
        deployedAt: new Date().toISOString()
    };

    const fs = require("fs");
    fs.writeFileSync("deployments/deployment-info.json", JSON.stringify(deploymentInfo, null, 2));
    console.log("Deployment info saved to deployments/deployment-info.json");

    console.log("\n📋 Fee Collection Configuration:");
    console.log("================================");
    console.log("✅ Mainnet Fee Wallet:", mainnetFeeWallet);
    console.log("✅ Testnet Fee Wallet:", testnetFeeWallet);
    console.log("✅ Fee Percentage:", `${Number(feePercentage) / 100}%`);
    console.log("✅ Network Detection: Automatic via block.chainid");
    
    console.log("\n🔧 Post-Deployment Options:");
    console.log("===========================");
    console.log("1. Change mainnet fee wallet: setMainnetFeeWallet(address)");
    console.log("2. Change testnet fee wallet: setTestnetFeeWallet(address)");
    console.log("3. Change fee percentage: setFeePercentage(uint256)");
    console.log("4. Add/remove supported tokens: setTokenSupport(address, bool)");
    
    console.log("\n🌐 Supported Networks:");
    console.log("=====================");
    console.log("Mainnet: Ethereum, Polygon, BSC, Avalanche, Base");
    console.log("Testnet: Sepolia, Mumbai, BSC Testnet, Fuji");
    console.log("\n💡 Fees are automatically sent to the appropriate wallet based on network!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);
});
