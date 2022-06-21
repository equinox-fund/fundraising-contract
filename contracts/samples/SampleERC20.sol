// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SampleERC20 is ERC20 {
    uint8 public newDecimals;

    constructor(uint8 _decimals) ERC20("SampleERC20", "ERC") {
        newDecimals = _decimals;
    }

    function mintToWallet(address _address, uint256 _amount)
        public
        payable
        returns (bool)
    {
        _mint(_address, _amount);
        return true;
    }

    function decimals() public view virtual override returns (uint8) {
        return newDecimals;
    }
}
