//SPDX-License-Identifier: MIT
pragma solidity 0.8.9;
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./MemoryLayout.sol";
import "./BuyerAccess.sol";

struct BuyerProfile {
    // pool ID
    uint8 poolId;
    // is tokens has been redeem?
    bool redeemed;
    bool canAccess;
    bool canBuy;
    bool canRedeem;
    // max allocation for the pool
    uint256 maxAllocation;
    // current funded allocation
    uint256 allocation;
    uint256 tokensBought;
    uint256 tokensRedeemable;
}

contract Buyer is MemoryLayout, BuyerAccess {
    using SafeERC20 for IERC20;
    /**
     * @dev Emitted when a user bought tokens.
     */
    event Bought(
        address indexed user,
        uint8 poolId,
        uint256 allocation,
        uint256 tokensBought,
        uint256 tokensRedeemable
    );

    /**
     * @dev Emitted when a user redeem his tokens
     */
    event Redeemed(
        address indexed user,
        uint8 poolId,
        uint256 tokensRedeemable
    );

    /// @notice is the user allow to transfer paymentToken?
    /// @dev In order to do an ERC20 Transfer, the contract has to get the allowance.
    /// @param _allocation Allocation
    modifier isAllowedToTransferPaymentToken(uint256 _allocation) {
        require(_allocation > 0, "Incorrect Allocation");
        require(_isSufficientBalance(_allocation), "Insufficient balance");
        require(
            IERC20(paymentToken).allowance(msg.sender, address(this)) >=
                _allocation,
            "You must approve transfer"
        );
        _;
    }

    /// @notice Check if the user can still purchase tokens with allocation
    /// @param _poolId Unique pool identifier
    /// @param _allocation Allocation
    function _isAllocationAllow(uint8 _poolId, uint256 _allocation)
        private
        view
        returns (bool)
    {
        uint256 buyerAllocation = buyers[_poolId][msg.sender].allocation +
            _allocation;
        uint256 maxAllocation = getMaximumPaymentTokenAllocation(
            msg.sender,
            _poolId
        );

        return buyerAllocation <= maxAllocation;
    }

    /// @notice Check if the user has enough paymentToken balance
    /// @param _allocation Allocation
    function _isSufficientBalance(uint256 _allocation)
        private
        view
        returns (bool)
    {
        uint256 balance = IERC20(paymentToken).balanceOf(msg.sender);
        return balance >= _allocation;
    }

    /// @notice Check if there is tokens available with the amount of tokens the user is purchasing
    /// @param _poolId Unique pool identifier
    /// @param _tokensBought Tokens the user bought
    function _isTokensAvailable(uint8 _poolId, uint256 _tokensBought)
        private
        view
        returns (bool)
    {
        uint256 totalProjectTokenSold = pools[_poolId].totalProjectTokenSold +
            _tokensBought;

        return totalProjectTokenSold <= pools[_poolId].totalProjectToken;
    }

    /// @notice Before buy (before paymentToken transfer)
    /// @param _poolId Unique pool identifier
    /// @param _allocation Allocation for pool
    /// @param _tokensBought Number of tokens bought (100%)
    /// @param _tokensRedeemable Number of tokens for initial release (according to vesting)
    function _beforeBuy(
        uint8 _poolId,
        uint256 _allocation,
        uint256 _tokensBought,
        uint256 _tokensRedeemable
    ) private {
        // add +1 to participants if he buy for the first time
        if (buyers[_poolId][msg.sender].allocation == 0) {
            pools[_poolId].participants += 1;
        }

        buyers[_poolId][msg.sender].poolId = _poolId;
        buyers[_poolId][msg.sender].allocation =
            buyers[_poolId][msg.sender].allocation +
            _allocation;
        buyers[_poolId][msg.sender].tokensBought =
            buyers[_poolId][msg.sender].tokensBought +
            _tokensBought;
        buyers[_poolId][msg.sender].tokensRedeemable =
            buyers[_poolId][msg.sender].tokensRedeemable +
            _tokensRedeemable;

        // increase total raise
        pools[_poolId].totalPaymentTokenRaised =
            pools[_poolId].totalPaymentTokenRaised +
            _allocation;

        // increase total tokens sold
        pools[_poolId].totalProjectTokenSold =
            pools[_poolId].totalProjectTokenSold +
            _tokensBought;

        // reduce total tokens unsold
        pools[_poolId].totalProjectTokenUnsold =
            pools[_poolId].totalProjectToken -
            pools[_poolId].totalProjectTokenSold;
    }

    /// @notice Buy tokens for a given pool
    /// @param _allocation allocation amount in projectToken
    /// @param _poolId Unique pool identifier
    function buy(uint256 _allocation, uint8 _poolId)
        external
        isAllowedToBuy(_poolId)
        isAllowedToTransferPaymentToken(_allocation)
    {
        require(
            _isAllocationAllow(_poolId, _allocation),
            "Max allocation excedeed"
        );

        uint256 tokensBought = (_allocation *
            poolPrices[_poolId].projectTokenForPrice) /
            poolPrices[_poolId].projectTokenPrice;
        uint256 tokensRedeemable = (tokensBought * vestingRatioPercentage) /
            100;

        require(_isTokensAvailable(_poolId, tokensBought), "Pool soldout");

        _beforeBuy(_poolId, _allocation, tokensBought, tokensRedeemable);

        // transfer
        IERC20(paymentToken).safeTransferFrom(
            msg.sender,
            address(this),
            _allocation
        );

        emit Bought(
            msg.sender,
            _poolId,
            _allocation,
            tokensBought,
            tokensRedeemable
        );
    }

    /// @notice Redeem tokens for a given pool
    /// @param _poolId Unique pool identifier
    function redeem(uint8 _poolId) external isAllowedToRedeem(_poolId) {
        uint256 tokensRedeemable = buyers[_poolId][msg.sender].tokensRedeemable;
        //reset
        buyers[_poolId][msg.sender].redeemed = true;
        buyers[_poolId][msg.sender].tokensRedeemable = 0;

        // check balance
        uint256 balance = IERC20(projectToken).balanceOf(address(this));
        require(balance >= tokensRedeemable, "Insufficient tokens");

        // transfer
        IERC20(projectToken).safeTransfer(msg.sender, tokensRedeemable);

        emit Redeemed(msg.sender, _poolId, tokensRedeemable);
    }

    /// @notice Get the buyer profile. This will return all fundings made for a given buyer.
    /// @dev this function is used for an external purpose.
    /// The frontend can request the contract only once and get an array of informations for all pools available.
    /// @param _user Buyer's address
    function getBuyerProfile(address _user)
        external
        view
        returns (BuyerProfile[] memory)
    {
        uint256 nbrOfPools = poolIds.length;
        BuyerProfile[] memory buyerProfile = new BuyerProfile[](nbrOfPools);

        for (uint8 i = 0; i < nbrOfPools; i++) {
            uint256 maxAllocation = getMaximumPaymentTokenAllocation(
                _user,
                poolIds[i]
            );

            buyerProfile[i] = BuyerProfile({
                poolId: poolIds[i],
                redeemed: buyers[poolIds[i]][_user].redeemed,
                canAccess: canAccess(_user, poolIds[i]),
                canBuy: canBuy(_user, poolIds[i]),
                canRedeem: canRedeem(_user, poolIds[i]),
                maxAllocation: maxAllocation,
                allocation: buyers[poolIds[i]][_user].allocation,
                tokensBought: buyers[poolIds[i]][_user].tokensBought,
                tokensRedeemable: buyers[poolIds[i]][_user].tokensRedeemable
            });
        }

        return buyerProfile;
    }
}
