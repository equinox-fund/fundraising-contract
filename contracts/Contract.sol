//SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "./Pool.sol";
import "./MemoryLayout.sol";

contract Contract is MemoryLayout, Pool {
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
        uint256 _vestingRatioPercentage
    ) {
        require(
            _paymentToken != address(0) && _withdrawFundsAddress != address(0),
            "Can not use 0x0"
        );

        paymentToken = _paymentToken;
        projectToken = _projectToken;
        vestingRatioPercentage = _vestingRatioPercentage;
        withdrawFundsAddress = _withdrawFundsAddress;
    }

    fallback() external {
        revert("Transaction reverted");
    }
}
