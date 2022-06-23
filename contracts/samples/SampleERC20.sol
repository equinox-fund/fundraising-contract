// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
//import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Context.sol";

contract SampleERC20 is Context, AccessControl, ERC20 {
    uint8 public newDecimals;
    //using SafeERC20 for IERC20;

    bytes32 public constant WITHDRAWER_ROLE = keccak256("WITHDRAWER_ROLE");

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

    // just sample funciton use SafeERC20
    function withdraw(
        IERC20 token,
        address recipient,
        uint256 amount
    ) external {
        require(hasRole(WITHDRAWER_ROLE, _msgSender()), "wrong role");
        require(token.transfer(recipient, amount), "transaction failed");
    }
}
