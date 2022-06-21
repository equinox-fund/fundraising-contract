//SPDX-License-Identifier: MIT
pragma solidity 0.8.15;
import "./MemoryLayout.sol";

contract Whitelist is MemoryLayout {
    /// @notice Whitelist a bunch of address into a "Virtual Pool"
    /// @dev if the address is already whitelisted, we top-up numbers of tickets.
    /// @param _addrs Array of addresses
    /// @param _tickets Number of tickets associated (1 ticket = 1 paymentTokenAllocation for the given pool)
    /// @param _poolId Pool identifier
    function whitelistAddresses(
        address[] memory _addrs,
        uint8 _tickets,
        uint8 _poolId
    ) external onlyOwner {
        for (uint256 i = 0; i < _addrs.length; i++) {
            if (whitelist[_poolId][_addrs[i]] > 0) {
                whitelist[_poolId][_addrs[i]] += _tickets;
            } else {
                whitelist[_poolId][_addrs[i]] = _tickets;
            }
        }
    }

    /// @notice Determine if the user can access a pool regarding if he owns "tickets"
    /// @param _user user address
    /// @param _poolId Unique pool identifier
    /// @return bool
    function canAccess(address _user, uint8 _poolId)
        public
        view
        returns (bool)
    {
        return whitelist[_poolId][_user] > 0;
    }
}
