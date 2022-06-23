//SPDX-License-Identifier: MIT
pragma solidity 0.8.15;
import "./MemoryLayout.sol";
import "./Whitelist.sol";

contract BuyerAccess is MemoryLayout, Whitelist {
    /// @notice Check if the user can buy from a given pool
    /// @param _poolId Unique Identifier of the pool
    modifier isAllowedToBuy(uint8 _poolId) {
        require(canBuy(msg.sender, _poolId), "You are not allowed to buy");
        _;
    }

    /// @notice Check if the user can redeem from a given pool
    /// @param _poolId Unique Identifier of the pool
    modifier isAllowedToRedeem(uint8 _poolId) {
        require(
            canRedeem(msg.sender, _poolId),
            "You are not allowed to redeem"
        );
        _;
    }

    /// @notice Returns if the pool is open
    /// @param _poolId Unique Identifier of the pool
    /// @return bool
    function _isPoolOpen(uint8 _poolId) private view returns (bool) {
        if (pools[_poolId].closed) return false;

        return block.timestamp >= pools[_poolId].startTime;
    }

    /// @notice Get the maximum allocation the user can spend for a given pool.
    /// @param _user user address
    /// @param _poolId Unique pool identifier
    /// @return uint256 allocation
    function getMaximumPaymentTokenAllocation(address _user, uint8 _poolId)
        public
        view
        returns (uint256)
    {
        uint256 paymentTokenAllocation = pools[_poolId].paymentTokenAllocation;

        return whitelist[_poolId][_user] * paymentTokenAllocation;
    }

    /// @notice Determine if the user can buy from a given pool.
    /// @param _user Sender address
    /// @param _poolId Unique pool identifier
    /// @return bool
    function canBuy(address _user, uint8 _poolId) public view returns (bool) {
        // if the user is not on the whitelist
        if (!canAccess(_user, _poolId)) return false;

        // if sale is not open
        if (!_isPoolOpen(_poolId)) return false;

        // if the contract is paused.
        if (pools[_poolId].paused) return false;

        // if you did bought tokens
        if (
            buyers[_poolId][_user].allocation >=
            getMaximumPaymentTokenAllocation(_user, _poolId)
        ) return false;

        // if we can redeem, you cannot buy anymore
        if (pools[_poolId].canRedeem) return false;

        return true;
    }

    /// @notice Determine if the user can redeem from a given pool.
    /// @param _user Sender address
    /// @param _poolId Unique pool identifier
    /// @return bool
    function canRedeem(address _user, uint8 _poolId)
        public
        view
        returns (bool)
    {
        if (!canAccess(_user, _poolId)) return false;
        // if the contract is paused.
        if (pools[_poolId].paused) return false;

        // if we cannot redeem
        if (!pools[_poolId].canRedeem) return false;

        // if you did not buy tokens
        if (buyers[_poolId][_user].tokensBought == 0) return false;

        // if you have redeemed already
        if (buyers[_poolId][_user].redeemed) return false;

        return true;
    }
}
