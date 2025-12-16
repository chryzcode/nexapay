"use strict";
require('dotenv').config();
const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Deploying NexaPayPayment contract to Ethereum Mainnet...");
    
    // Get environment variables
    const mainnetFeeWallet = process.env.MAINNET_FEE_WALLET_ADDRESS;
    const testnetFeeWallet = process.env.TESTNET_FEE_WALLET_ADDRESS;
    const feePercentage = process.env.FEE_PERCENTAGE || "500"; // Default to 5%
    
    // Get mainnet token addresses from environment variables
    const mainnetTokens = process.env.MAINNET_TOKEN_ADDRESSES ? 
        process.env.MAINNET_TOKEN_ADDRESSES.split(',') : [];
    
    // If no mainnet tokens provided, use default Ethereum mainnet tokens
    if (mainnetTokens.length === 0) {
        console.log("⚠️  No mainnet token addresses provided in environment variables");
        console.log("   Using default Ethereum mainnet tokens");
        mainnetTokens.push(
            "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC Ethereum Mainnet
            "0xdAC17F958D2ee523a2206206994597C13D831ec7"  // USDT Ethereum Mainnet
        );
    }
    
    // Validate environment variables
    if (!mainnetFeeWallet) {
        throw new Error("MAINNET_FEE_WALLET_ADDRESS environment variable is required");
    }
    if (!testnetFeeWallet) {
        throw new Error("TESTNET_FEE_WALLET_ADDRESS environment variable is required");
    }
    
    console.log("📋 Mainnet Deployment Configuration:");
    console.log(`- Mainnet Fee Wallet: ${mainnetFeeWallet}`);
    console.log(`- Testnet Fee Wallet: ${testnetFeeWallet}`);
    console.log(`- Fee Percentage: ${feePercentage} basis points (${Number(feePercentage) / 100}%)`);
    console.log(`- Supported Mainnet Tokens: ${mainnetTokens.length} tokens`);
    mainnetTokens.forEach((token, index) => {
        console.log(`  ${index + 1}. ${token}`);
    });
    
    // Get the contract factory
    const NexaPayPayment = await ethers.getContractFactory("NexaPayPayment");
    
    // Deploy the contract to mainnet
    console.log("\n🔨 Deploying contract to Ethereum Mainnet...");
    const nexapayPayment = await NexaPayPayment.deploy(
        mainnetTokens,
        mainnetFeeWallet,
        testnetFeeWallet,
        feePercentage
    );
    
    // Wait for deployment
    await nexapayPayment.deployed ? nexapayPayment.deployed() : nexapayPayment.waitForDeployment();
    
    // Get contract address
    const contractAddress = nexapayPayment.address || await nexapayPayment.getAddress();
    
    console.log("✅ NexaPayPayment deployed to Ethereum Mainnet!");
    console.log("Contract Address:", contractAddress);
    
    // Get current network info
    const network = await ethers.provider.getNetwork();
    console.log("Network:", network.name);
    console.log("Chain ID:", network.chainId);
    
    // Save mainnet deployment details
    const deploymentInfo = {
        contractAddress: contractAddress,
        mainnetFeeWallet: mainnetFeeWallet,
        testnetFeeWallet: testnetFeeWallet,
        feePercentage: Number(feePercentage),
        chainId: network.chainId,
        networkName: network.name,
        deployedAt: new Date().toISOString(),
        deploymentType: "mainnet"
    };

    const fs = require("fs");
    fs.writeFileSync("deployments/mainnet-deployment-info.json", JSON.stringify(deploymentInfo, null, 2));
    console.log("📄 Mainnet deployment info saved to deployments/mainnet-deployment-info.json");

    console.log("\n🎉 Mainnet Deployment Complete!");
    console.log("=================================");
    console.log("📝 Next Steps:");
    console.log("1. Update your .env file with the mainnet contract address:");
    console.log(`   NEXT_PUBLIC_NEXAPAY_CONTRACT=${contractAddress}`);
    console.log("2. Verify the contract on Etherscan");
    console.log("3. Test mainnet transactions");
    
    console.log("\n⚠️  IMPORTANT: Make sure you have sufficient ETH for gas fees!");
    console.log("   Mainnet deployment requires real ETH for transaction fees.");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    }); 