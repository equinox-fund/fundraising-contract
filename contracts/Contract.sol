//SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "./MemoryLayout.sol";
import "./Buyer.sol";
import "./Pool.sol";

contract Contract is MemoryLayout, Pool, Buyer {
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
        require(_paymentToken != address(0), "Can not use 0x0");
        require(_withdrawFundsAddress != address(0), "Can not use 0x0");

        paymentToken = _paymentToken;
        projectToken = _projectToken;
        vestingRatioPercentage = _vestingRatioPercentage;
        withdrawFundsAddress = _withdrawFundsAddress;
    }

    /// @notice Get all pools
    /// @return VirtualPool[] Array of Pools
    function getPools() public view returns (VirtualPool[] memory) {
        uint256 nbrOfPools = poolIds.length;
        VirtualPool[] memory pools = new VirtualPool[](nbrOfPools);

        for (uint8 i = 0; i < nbrOfPools; i++) {
            pools[i] = pools[poolIds[i]];
        }

        return pools;
    }

    fallback() external {
        revert("Transaction reverted");
    }
}
