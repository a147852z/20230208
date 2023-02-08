// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SimpleToken is ERC20 {
  uint256 public initialSupply = 10000000000000000000000;
  
  constructor() public ERC20("Hello","H") {
  	_mint(msg.sender,initialSupply);
  }
}

