// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title NexaPayPayment
 * @dev Accepts payments in supported stablecoins (USDT, USDC, etc.) and emits events for off-chain tracking.
 *      Designed for EVM chains (Polygon, BSC, Base, etc.).
 */

interface IERC20 {
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function balanceOf(address owner) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
}

contract NexaPayPayment {
    address public owner;
    mapping(address => bool) public supportedTokens;
    event PaymentReceived(
        address indexed payer,
        address indexed merchant,
        address indexed token,
        uint256 amount,
        string paymentReference
    );
    event TokenSupportUpdated(address token, bool supported);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor(address[] memory initialTokens) {
        owner = msg.sender;
        for (uint i = 0; i < initialTokens.length; i++) {
            supportedTokens[initialTokens[i]] = true;
            emit TokenSupportUpdated(initialTokens[i], true);
        }
    }

    function setTokenSupport(address token, bool supported) external onlyOwner {
        supportedTokens[token] = supported;
        emit TokenSupportUpdated(token, supported);
    }

    /**
     * @dev Accept payment from payer to merchant in a supported token.
     * @param token ERC20 token address (USDT, USDC, etc.)
     * @param merchant Merchant's address
     * @param amount Payment amount (in token's smallest unit)
     * @param paymentReference Optional payment reference (orderId, invoice, etc.)
     */
    function pay(address token, address merchant, uint256 amount, string calldata paymentReference) external {
        require(supportedTokens[token], "Token not supported");
        require(amount > 0, "Amount must be positive");
        require(merchant != address(0), "Invalid merchant");
        require(IERC20(token).allowance(msg.sender, address(this)) >= amount, "Insufficient allowance");
        require(IERC20(token).balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        bool success = IERC20(token).transferFrom(msg.sender, merchant, amount);
        require(success, "Transfer failed");

        emit PaymentReceived(msg.sender, merchant, token, amount, paymentReference);
    }
}
