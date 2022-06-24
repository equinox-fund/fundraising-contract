//SPDX-License-Identifier: MIT
pragma solidity 0.8.9;
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./MemoryLayout.sol";

contract Vault is MemoryLayout, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /**
     * @dev Emitted when the owner withdraw payment tokens from the pool
     */
    event WithdrawnPaymentToken(uint256 totalPaymentToken);

    /**
     * @dev Emitted when the owner withdraw project tokens from the pool
     */
    event WithdrawnProjectToken(uint256 totalProjectToken);

    /// @notice Get all of the project tokens inside of the contract
    function withdrawProjectTokens() external nonReentrant onlyOwner {
        require(projectToken != address(0), "Withdraw not allowed: No tokens");

        uint256 total = IERC20(projectToken).balanceOf(address(this));
        IERC20(projectToken).safeTransfer(owner(), total);

        emit WithdrawnProjectToken(total);
    }

    /// @notice Get all of the payment tokens inside of the contract
    function withdrawPaymentTokens() external nonReentrant onlyOwner {
        uint256 total = IERC20(paymentToken).balanceOf(address(this));

        IERC20(paymentToken).safeTransfer(withdrawFundsAddress, total);

        emit WithdrawnPaymentToken(total);
    }
}
