//SPDX-License-Identifier: MIT
pragma solidity 0.8.15;
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./Whitelist.sol";

contract Pool is MemoryLayout, Whitelist {
    using SafeERC20 for IERC20;

    /**
     * @dev Emitted when a pool is added.
     */
    event PoolInitialized(uint8 poolId);

    /**
     * @dev Emitted when the pool is paused
     */
    event PoolPaused(uint8 poolId);

    /**
     * @dev Emitted when the pause is lifted
     */
    event PoolUnpaused(uint8 poolId);

    /**
     * @dev Emitted when the pool is closed
     */
    event PoolClosed(uint256 unsold, uint256 sold, uint8 poolId);

    /**
     * @dev Emitted when tokens within the pool are releasable
     */
    event PoolRedeemAllowed(uint256 poolId);

    /**
     * @dev Emitted when the owner collects the remaing unsold tokens
     */
    event WithdrawnPoolUnsoldProjectToken(uint256 unsold, uint8 poolId);

    /// @notice Modifier When Sale Not Paused
    /// @param _poolId Unique Identifier of the pool
    modifier whenPoolNotPaused(uint8 _poolId) {
        require(!pools[_poolId].paused, "Pool paused");
        _;
    }

    /// @notice Modifier When Sale Paused
    /// @param _poolId Unique Identifier of the pool
    modifier whenPoolPaused(uint8 _poolId) {
        require(pools[_poolId].paused, "Pool not paused");
        _;
    }

    /// @notice Modifier When Pool is Closed
    /// @param _poolId Unique Identifier of the pool
    modifier whenPoolIsClosed(uint8 _poolId) {
        require(pools[_poolId].closed, "Pool has to be closed");
        _;
    }

    /// @notice Initialze a Pool
    /// @param _poolId Unique Identifier of the pool
    /// @param _startTime Start time of the pool (unix seconds)
    /// @param _paymentTokenAllocation  the base amount of the allocation in payment token
    /// @param _totalProjectToken  The total project token in the pool
    /// @param _projectTokenPrice  The project token price
    /// @param _projectTokenForPrice  The number of tokens expected for token price.
    function initializePool(
        uint8 _poolId,
        uint64 _startTime,
        uint256 _paymentTokenAllocation,
        uint256 _totalProjectToken,
        uint256 _projectTokenPrice,
        uint256 _projectTokenForPrice
    ) external onlyOwner {
        require(pools[_poolId].startTime == 0, "Pool already initialized");
        uint256 totalTokensVested = (_totalProjectToken * _projectTokenPrice) /
            _projectTokenForPrice;
        uint256 totalPaymentTokenToRaise = (totalTokensVested * 100) /
            vestingRatioPercentage;

        // Add pool.
        pools[_poolId] = VirtualPool({
            poolId: _poolId,
            startTime: _startTime,
            participants: 0,
            canRedeem: false,
            paused: false,
            closed: false,
            paymentTokenAllocation: _paymentTokenAllocation,
            totalProjectToken: _totalProjectToken,
            totalPaymentTokenToRaise: totalPaymentTokenToRaise,
            totalPaymentTokenRaised: 0,
            totalProjectTokenSold: 0,
            totalProjectTokenUnsold: _totalProjectToken
        });

        // to avoid stack to deep error, i created another struct to store prices related to the pool
        poolPrices[_poolId] = VirtualPoolPrice({
            projectTokenPrice: _projectTokenPrice,
            projectTokenForPrice: _projectTokenForPrice
        });

        poolIds.push(_poolId);
        emit PoolInitialized(_poolId);
    }

    /// @notice Pause a pool
    /// @param _poolId Unique Identifier of the pool
    function pausePool(uint8 _poolId)
        external
        onlyOwner
        whenPoolNotPaused(_poolId)
    {
        pools[_poolId].paused = true;

        emit PoolPaused(_poolId);
    }

    /// @notice Unause a pool
    /// @param _poolId Unique Identifier of the pool
    function unPausePool(uint8 _poolId)
        external
        onlyOwner
        whenPoolPaused(_poolId)
    {
        pools[_poolId].paused = false;

        emit PoolUnpaused(_poolId);
    }

    /// @notice Close pool. This action is irreversible
    /// @dev We set the numbers of tokens in the pool equals to the number of tokens sold.
    /// @param _poolId Unique Identifier of the pool
    function closePool(uint8 _poolId) external onlyOwner {
        pools[_poolId].closed = true;
        // the total tokens in the pool is now equals to the total tokens sold.
        pools[_poolId].totalProjectToken = pools[_poolId].totalProjectTokenSold;

        emit PoolClosed(
            pools[_poolId].totalProjectTokenUnsold,
            pools[_poolId].totalProjectTokenSold,
            _poolId
        );
    }

    /// @notice Allow redeem
    /// @dev only if pool is closed and we have project token address
    /// @param _poolId Unique Identifier of the pool
    function allowPoolRedeem(uint8 _poolId)
        external
        onlyOwner
        whenPoolIsClosed(_poolId)
    {
        require(projectToken != address(0), "No Project Token address");

        pools[_poolId].canRedeem = true;

        emit PoolRedeemAllowed(_poolId);
    }

    /// @notice Withdraw tokens for a given pool
    /// @dev only if pool is closed and we have project token address
    /// @param _poolId Unique Identifier of the pool
    function withdrawPoolUnsoldProjectToken(uint8 _poolId)
        external
        onlyOwner
        whenPoolIsClosed(_poolId)
    {
        require(projectToken != address(0), "No Project Token address");

        uint256 unsold = pools[_poolId].totalProjectTokenUnsold;
        // transfer to the ownert
        IERC20(projectToken).safeTransfer(owner(), unsold);

        emit WithdrawnPoolUnsoldProjectToken(unsold, _poolId);
    }
}
