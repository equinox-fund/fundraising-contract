//SPDX-License-Identifier: MIT
pragma solidity 0.8.15;
import "@openzeppelin/contracts/access/Ownable.sol";

struct VirtualPool {
    // pool ID
    uint8 poolId;
    // start time
    uint64 startTime;
    // Numbers of participants
    uint32 participants;
    // is the pool is redeemable, meaning tokens are releasable
    bool canRedeem;
    // Is the pool is paused
    bool paused;
    // is the pool is closed
    bool closed;
    // the amount of the allocation in payment token, this amount is considered as a base amount.
    uint256 paymentTokenAllocation;
    // Numbers of tokens available
    uint256 totalProjectToken;
    // number of 'Payment Token' to raise.
    uint256 totalPaymentTokenToRaise;
    // number of 'Payment Token' raised.
    uint256 totalPaymentTokenRaised;
    // Numbers of tokens sold
    uint256 totalProjectTokenSold;
    // Numbers of tokens unsold
    uint256 totalProjectTokenUnsold;
}

struct VirtualPoolPrice {
    //define the token price in paymentToken
    uint256 projectTokenPrice;
    // define how many tokens you will receive for the project token price.
    uint256 projectTokenForPrice;
}

struct VirtualBuyer {
    // pool ID
    uint8 poolId;
    // is tokens has been redeem?
    bool redeemed;
    // max allocation for the pool
    uint256 maxAllocation;
    // current funded allocation
    uint256 allocation;
    uint256 tokensBought;
    uint256 tokensRedeemable;
}

contract MemoryLayout is Ownable {
    /**
     * @notice define the project token used for the fundraising
     */
    address public projectToken;

    /**
     * @notice define the token used to fund, usually a stablecoin.
     */
    address public paymentToken;

    /**
     * @notice In case of vesting, this ratio percentage is used to calculate the amount of tokens the user can redeem.
     */
    uint256 public vestingRatioPercentage;

    /**
     * @notice Addresse where funds are sent after withdraw
     */
    address public withdrawFundsAddress;

    /**
     * @notice Pools mapping
     */
    mapping(uint8 => VirtualPool) public pools;
    mapping(uint8 => VirtualPoolPrice) public poolPrices;

    /**
     * @notice Array containing all pool ids.
     */

    uint8[] public poolIds;

    /**
     * @notice Buyers (poolId > address > VirtualBuyer data)
     */
    mapping(uint256 => mapping(address => VirtualBuyer)) public buyers;
}
