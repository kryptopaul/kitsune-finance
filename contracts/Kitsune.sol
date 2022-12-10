// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "hardhat/console.sol";

// A partial ERC20 interface.
interface IERC20 {
    function balanceOf(address owner) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

// A partial WETH interfaec.
interface IWETH is IERC20 {
    function deposit() external payable;
}


contract Kitsune {

    event BoughtTokens(IERC20 sellToken, IERC20 buyToken, uint256 boughtAmount);

    // The WETH contract.
    IWETH public immutable WETH;
    // Creator of this contract.
    address public owner;
    // 0x ExchangeProxy address.
    // See https://docs.0x.org/developer-resources/contract-addresses
    address public exchangeProxy;

    struct OrderToWETH {
        IERC20 sellToken;
        address spender;
        address payable swapTarget;
        bytes swapCallData;
        uint256 sellAmount;
    }

    constructor(IWETH _weth, address _exchangeProxy) {
        WETH = _weth;
        exchangeProxy = _exchangeProxy;
        owner = msg.sender;
    }



    // Payable fallback to allow this contract to receive protocol fee refunds.
    receive() external payable {}

    // Transfer tokens held by this contrat to the sender/owner.
    function withdrawToken(IERC20 token, uint256 amount)
        external
    {
        require(token.transfer(msg.sender, amount));
    }

    // Transfer ETH held by this contrat to the sender/owner.
    function withdrawETH(uint256 amount)
        external
    {
        payable(msg.sender).transfer(amount);
    }

    // Transfer ETH into this contract and wrap it into WETH.
    function depositETH()
        external
        payable
    {
        WETH.deposit{value: msg.value}();
    }

    // Swaps ERC20->ERC20 tokens held by this contract using a 0x-API quote.
    function fillQuoteForTargetWETH(
        OrderToWETH memory order
    )
        public
    {
        
        // Transfer the tokens being sold into this contract.
        require(order.sellToken.transferFrom(msg.sender, address(this), order.sellAmount));

        // Check if swapTarget is ExchangeProxy.
        require(order.swapTarget == exchangeProxy, "Target not ExchangeProxy");

        // Check the balance of WETH before the swap.
        uint256 boughtAmount = WETH.balanceOf(address(this));

        // Approve the tokens being sold to be used by 0x ExchangeProxy.
        require(order.sellToken.approve(order.spender, type(uint256).max));

        // Execute the swap.
        (bool success,) = order.swapTarget.call(order.swapCallData);

        // Check if the swap succeeded.
        require(success, 'SWAP_CALL_FAILED');
  
        // Check the balance of WETH after the swap.
        boughtAmount = WETH.balanceOf(address(this)) - boughtAmount;
        emit BoughtTokens(order.sellToken, WETH, boughtAmount);

        // Transfer the WETH to the trader.
        require(WETH.transfer(msg.sender, boughtAmount));

    }

    function useInLoopFillQuoteForTargetWETH(
        OrderToWETH memory order
    )
        internal
    {
        
        // Transfer the tokens being sold into this contract.
        require(order.sellToken.transferFrom(msg.sender, address(this), order.sellAmount));

        // Check if swapTarget is ExchangeProxy.
        require(order.swapTarget == exchangeProxy, "Target not ExchangeProxy");

        // Check the balance of WETH before the swap.
        uint256 boughtAmount = WETH.balanceOf(address(this));

        // Approve the tokens being sold to be used by 0x ExchangeProxy.
        require(order.sellToken.approve(order.spender, type(uint256).max));

        // Execute the swap.
        (bool success,) = order.swapTarget.call(order.swapCallData);

        // Check if the swap succeeded.
        require(success, 'SWAP_CALL_FAILED');
  
        // Check the balance of WETH after the swap.
        boughtAmount = WETH.balanceOf(address(this)) - boughtAmount;
        emit BoughtTokens(order.sellToken, WETH, boughtAmount);

        // Transfer the WETH to the trader.
        require(WETH.transfer(msg.sender, boughtAmount));

    }

    
    function fillOrders (
        OrderToWETH[] calldata orders
    ) 
        public 
        payable 
    {
        uint256 boughtAmount = WETH.balanceOf(address(this));

        for (uint256 i = 0; i < orders.length; i++) {
            console.log("filling order %s", i);
            useInLoopFillQuoteForTargetWETH(
                orders[i]
            );
        }

        boughtAmount = WETH.balanceOf(address(this)) - boughtAmount;
        require(WETH.transfer(msg.sender, boughtAmount));
    }

}