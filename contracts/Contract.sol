//SPDX-License-Identifier: MIT
pragma solidity 0.8.15;
import "./MemoryLayout.sol";

contract Contract is MemoryLayout {
    /// @notice Initialize fundraising contract
    /// @dev projectToken address can be zero because we can raise funds without any tokens for redemption.
    /// @param _paymentToken ERC20 token address used for funding, usually a stable token
    /// @param _projectToken ERC20 address used for tokens that you are funding for
    /// @param _vestingRatioPercentage  In case of vesting, this ratio percentage is used to calculate the amount of tokens the user can redeem.
    /// @param _withdrawFundsAddress withdraw address to receive funds after fundraising
    constructor(
        address _paymentToken,
        address _projectToken,
        address _withdrawFundsAddress,
        uint8 _vestingRatioPercentage
    ) {
        require(_withdrawFundsAddress != address(0), "Cannot set address 0x0");
        require(_paymentToken != address(0), "Cannot set address 0x0");

        paymentToken = _paymentToken;
        projectToken = _projectToken;
        vestingRatioPercentage = _vestingRatioPercentage;
        withdrawFundsAddress = _withdrawFundsAddress;
    }

    /// @notice Set project token address
    /// @dev Use this only if the decimals is the same as the initial initialize
    function setProjectTokenAddress(address _projectToken) external onlyOwner {
        require(_projectToken != address(0), "Cannot set address 0x0");
        projectToken = _projectToken;
    }

    /// @notice Set payment token address
    /// @dev Use this only if the decimals is the same as the initial initialize
    function setPaymentTokenAddress(address _paymentToken) external onlyOwner {
        require(_paymentToken != address(0), "Cannot set address 0x0");
        paymentToken = _paymentToken;
    }

    fallback() external {
        revert("Transaction reverted");
    }
}
