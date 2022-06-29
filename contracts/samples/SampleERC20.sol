// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SampleERC20 is ERC20, Ownable {
    constructor() ERC20("SampleERC20", "ERC") {}

    function mintToWallet(address _address, uint256 _amount)
        external
        onlyOwner
    {
        _mint(_address, _amount);
    }
}
