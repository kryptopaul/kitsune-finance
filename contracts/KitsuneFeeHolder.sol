// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

interface IERC20 {
    function balanceOf(address owner) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}


// ADD ONLYOWNER LATER
contract KitsuneFeeHolder {
    function withdrawTokens(address _address) public {
        uint balance = IERC20(_address).balanceOf(address(this));
        IERC20(_address).transfer(msg.sender, balance);
    }
}