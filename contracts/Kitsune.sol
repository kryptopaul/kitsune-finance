// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// A partial ERC20 interface.
interface IERC20 {
    function balanceOf(address owner) external view returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

    function transfer(address to, uint256 amount) external returns (bool);

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
}

// A partial WETH interface.
interface IWETH is IERC20 {
    function deposit() external payable;
}

contract Kitsune {
    // The WETH contract.
    IWETH public immutable WETH;
    // Creator of this contract.
    address public owner;
    // 0x ExchangeProxy address.
    // See https://docs.0x.org/developer-resources/contract-addresses
    address public exchangeProxy;

    struct Order {
        IERC20 sellToken;
        address spender;
        bytes swapCallData;
        uint256 sellAmount;
    }

    constructor(IWETH _weth, address _exchangeProxy) {
        WETH = _weth;
        exchangeProxy = _exchangeProxy;
        owner = msg.sender;
    }

    function tokensToETH(Order[] calldata orders) public {
        uint256 boughtAmount = address(this).balance;

        for (uint256 i = 0; i < orders.length; i++) {
            Order memory order = orders[i];
            // Transfer the tokens being sold into this contract.
            require(
                order.sellToken.transferFrom(
                    msg.sender,
                    address(this),
                    order.sellAmount
                )
            );
            // Approve the tokens being sold to be used by 0x ExchangeProxy.
            require(order.sellToken.approve(order.spender, type(uint256).max));

            // Execute the swap.
            (bool success, ) = exchangeProxy.call(order.swapCallData);

            // Check if the swap succeeded.
            require(success, "SWAP_CALL_FAILED");
        }

        boughtAmount = address(this).balance - boughtAmount;

        payable(msg.sender).transfer(boughtAmount);
    }

    function tokensToETHCustomRecipient(
        Order[] calldata orders,
        address payable recipient
    ) public payable {
        uint256 boughtAmount = address(this).balance;

        for (uint256 i = 0; i < orders.length; i++) {
            Order memory order = orders[i];
            // Transfer the tokens being sold into this contract.
            require(
                order.sellToken.transferFrom(
                    msg.sender,
                    address(this),
                    order.sellAmount
                )
            );
            // Approve the tokens being sold to be used by 0x ExchangeProxy.
            require(order.sellToken.approve(order.spender, type(uint256).max));
            // Execute the swap.
            (bool success, ) = exchangeProxy.call(order.swapCallData);
            // Check if the swap succeeded.
            require(success, "SWAP_CALL_FAILED");
        }

        boughtAmount = address(this).balance - boughtAmount;
        recipient.transfer(boughtAmount);
    }

    function tokensToToken(
        Order[] calldata orders,
        IERC20 buyToken
    ) public payable {
        uint256 boughtAmount = buyToken.balanceOf(address(this));

        for (uint256 i = 0; i < orders.length; i++) {
            Order memory order = orders[i];
            // Transfer the tokens being sold into this contract.
            require(
                order.sellToken.transferFrom(
                    msg.sender,
                    address(this),
                    order.sellAmount
                )
            );
            // Approve the tokens being sold to be used by 0x ExchangeProxy.
            require(order.sellToken.approve(order.spender, type(uint256).max));
            // Execute the swap.
            (bool success, ) = exchangeProxy.call(order.swapCallData);
            // Check if the swap succeeded.
            require(success, "SWAP_CALL_FAILED");
        }

        boughtAmount = buyToken.balanceOf(address(this)) - boughtAmount;
        require(buyToken.transfer(msg.sender, boughtAmount));
    }

    function tokensToTokenCustomRecipient(
        Order[] calldata orders,
        IERC20 buyToken,
        address recipient
    ) public payable {
        uint256 boughtAmount = buyToken.balanceOf(address(this));

        for (uint256 i = 0; i < orders.length; i++) {
            Order memory order = orders[i];
            // Transfer the tokens being sold into this contract.
            require(
                order.sellToken.transferFrom(
                    msg.sender,
                    address(this),
                    order.sellAmount
                )
            );
            // Approve the tokens being sold to be used by 0x ExchangeProxy.
            require(order.sellToken.approve(order.spender, type(uint256).max));
            // Execute the swap.
            (bool success, ) = exchangeProxy.call(order.swapCallData);
            // Check if the swap succeeded.
            require(success, "SWAP_CALL_FAILED");
        }

        boughtAmount = buyToken.balanceOf(address(this)) - boughtAmount;
        require(buyToken.transfer(recipient, boughtAmount));
    }

    receive() external payable {}
}
