// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SampleERC20 is ERC20, Ownable {
    uint8 public newDecimals;

    constructor(uint8 _decimals) ERC20("SampleERC20", "ERC") {
        newDecimals = _decimals;
    }

    function mintToWallet(address _address, uint256 _amount)
        external
        onlyOwner
    {
        _mint(_address, _amount);
    }

    function decimals() public view virtual override returns (uint8) {
        return newDecimals;
    }
}
