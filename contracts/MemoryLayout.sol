//SPDX-License-Identifier: MIT
pragma solidity 0.8.15;
import "@openzeppelin/contracts/access/Ownable.sol";

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
    uint8 public vestingRatioPercentage;

    /**
     * @notice Addresse where funds are sent after withdraw
     */
    address public withdrawFundsAddress;
}
