// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title NexaPayPayment
 * @dev Accepts payments in supported stablecoins (USDT, USDC, etc.) and emits events for off-chain tracking.
 *      Designed for EVM chains (Polygon, BSC, Base, etc.).
 *      Includes a flexible fee collection system with separate testnet/mainnet fee wallets.
 */

interface IERC20 {
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function balanceOf(address owner) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
}

contract NexaPayPayment {
    address public owner;
    address public mainnetFeeWallet;
    address public testnetFeeWallet;
    uint256 public feePercentage; // Fee percentage in basis points (500 = 5%)
    
    mapping(address => bool) public supportedTokens;
    
    event PaymentReceived(
        address indexed payer,
        address indexed merchant,
        address indexed token,
        uint256 amount,
        uint256 feeAmount,
        uint256 chainId,
        string paymentReference
    );
    event TokenSupportUpdated(address token, bool supported);
    event MainnetFeeWalletUpdated(address newFeeWallet);
    event TestnetFeeWalletUpdated(address newFeeWallet);
    event FeePercentageUpdated(uint256 newFeePercentage);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor(
        address[] memory initialTokens, 
        address _mainnetFeeWallet,
        address _testnetFeeWallet,
        uint256 _feePercentage
    ) {
        owner = msg.sender;
        mainnetFeeWallet = _mainnetFeeWallet;
        testnetFeeWallet = _testnetFeeWallet;
        feePercentage = _feePercentage;
        
        for (uint i = 0; i < initialTokens.length; i++) {
            supportedTokens[initialTokens[i]] = true;
            emit TokenSupportUpdated(initialTokens[i], true);
        }
    }

    function setTokenSupport(address token, bool supported) external onlyOwner {
        supportedTokens[token] = supported;
        emit TokenSupportUpdated(token, supported);
    }

    function setMainnetFeeWallet(address _feeWallet) external onlyOwner {
        require(_feeWallet != address(0), "Invalid fee wallet address");
        mainnetFeeWallet = _feeWallet;
        emit MainnetFeeWalletUpdated(_feeWallet);
    }

    function setTestnetFeeWallet(address _feeWallet) external onlyOwner {
        require(_feeWallet != address(0), "Invalid fee wallet address");
        testnetFeeWallet = _feeWallet;
        emit TestnetFeeWalletUpdated(_feeWallet);
    }

    function setFeePercentage(uint256 _feePercentage) external onlyOwner {
        require(_feePercentage <= 1000, "Fee percentage cannot exceed 10%");
        feePercentage = _feePercentage;
        emit FeePercentageUpdated(_feePercentage);
    }

    function getFeeWallet() internal view returns (address) {
        uint256 chainId = block.chainid;
        
        // Sepolia Testnet (Chain ID: 11155111)
        if (chainId == 11155111) {
            return testnetFeeWallet;
        }
        
        // Ethereum Mainnet (Chain ID: 1)
        if (chainId == 1) {
            return mainnetFeeWallet;
        }
        
        // Default to mainnet fee wallet for unknown networks
        return mainnetFeeWallet;
    }

    /**
     * @dev Accept payment from payer to merchant in a supported token with fee collection.
     * @param token ERC20 token address (USDT, USDC, etc.)
     * @param merchant Merchant's address
     * @param amount Payment amount (in token's smallest unit)
     * @param paymentReference Optional payment reference (orderId, invoice, etc.)
     */
    function pay(address token, address merchant, uint256 amount, string calldata paymentReference) external {
        require(supportedTokens[token], "Token not supported");
        require(amount > 0, "Amount must be positive");
        require(merchant != address(0), "Invalid merchant");
        
        // Get current chain ID for event emission
        uint256 chainId = block.chainid;
        
        // Get appropriate fee wallet based on network
        address feeWallet = getFeeWallet();
        require(feeWallet != address(0), "Fee wallet not set for this network");
        
        // Calculate fee amount
        uint256 feeAmount = (amount * feePercentage) / 10000;
        uint256 merchantAmount = amount - feeAmount;
        
        // Check allowances and balances
        require(IERC20(token).allowance(msg.sender, address(this)) >= amount, "Insufficient allowance");
        require(IERC20(token).balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        // Transfer fee to appropriate fee wallet (testnet or mainnet)
        bool feeSuccess = IERC20(token).transferFrom(msg.sender, feeWallet, feeAmount);
        require(feeSuccess, "Fee transfer failed");
        
        // Transfer remaining amount to merchant
        bool merchantSuccess = IERC20(token).transferFrom(msg.sender, merchant, merchantAmount);
        require(merchantSuccess, "Merchant transfer failed");

        emit PaymentReceived(msg.sender, merchant, token, amount, feeAmount, chainId, paymentReference);
    }

    /**
     * @dev Withdraw accumulated fees (only owner can call)
     * @param token ERC20 token address to withdraw
     * @param amount Amount to withdraw
     */
    function withdrawFees(address token, uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be positive");
        require(IERC20(token).balanceOf(address(this)) >= amount, "Insufficient contract balance");
        
        bool success = IERC20(token).transfer(owner, amount);
        require(success, "Fee withdrawal failed");
    }
}
