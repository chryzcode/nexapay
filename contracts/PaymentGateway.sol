// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PaymentGateway
 * @dev Accepts ERC20 payments for merchants, emits Payment events
 */
contract PaymentGateway is Ownable {
    event Payment(
        address indexed sender,
        address indexed token,
        uint256 amount,
        address indexed merchant,
        string reference,
        uint256 chainId
    );

    mapping(address => bool) public supportedTokens;

    /**
     * @dev Owner can add a supported token
     */
    function addSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = true;
    }

    /**
     * @dev Owner can remove a supported token
     */
    function removeSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = false;
    }

    /**
     * @dev Pay `amount` of `token` to `merchant` with a `reference`
     */
    function pay(
        address token,
        address merchant,
        uint256 amount,
        string calldata reference
    ) external {
        require(supportedTokens[token], "Token not supported");
        require(
            IERC20(token).transferFrom(msg.sender, merchant, amount),
            "Transfer failed"
        );
        emit Payment(msg.sender, token, amount, merchant, reference, block.chainid);
    }
}
