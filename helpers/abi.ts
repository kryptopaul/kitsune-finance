const abi = [
    {
      "inputs": [
        {
          "internalType": "contract IWETH",
          "name": "_weth",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_exchangeProxy",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "WETH",
      "outputs": [
        {
          "internalType": "contract IWETH",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "exchangeProxy",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "contract IERC20",
              "name": "sellToken",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "spender",
              "type": "address"
            },
            {
              "internalType": "bytes",
              "name": "swapCallData",
              "type": "bytes"
            },
            {
              "internalType": "uint256",
              "name": "sellAmount",
              "type": "uint256"
            }
          ],
          "internalType": "struct Kitsune.Order[]",
          "name": "orders",
          "type": "tuple[]"
        }
      ],
      "name": "tokensToETH",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "contract IERC20",
              "name": "sellToken",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "spender",
              "type": "address"
            },
            {
              "internalType": "bytes",
              "name": "swapCallData",
              "type": "bytes"
            },
            {
              "internalType": "uint256",
              "name": "sellAmount",
              "type": "uint256"
            }
          ],
          "internalType": "struct Kitsune.Order[]",
          "name": "orders",
          "type": "tuple[]"
        },
        {
          "internalType": "address payable",
          "name": "recipient",
          "type": "address"
        }
      ],
      "name": "tokensToETHCustomRecipient",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "contract IERC20",
              "name": "sellToken",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "spender",
              "type": "address"
            },
            {
              "internalType": "bytes",
              "name": "swapCallData",
              "type": "bytes"
            },
            {
              "internalType": "uint256",
              "name": "sellAmount",
              "type": "uint256"
            }
          ],
          "internalType": "struct Kitsune.Order[]",
          "name": "orders",
          "type": "tuple[]"
        },
        {
          "internalType": "contract IERC20",
          "name": "buyToken",
          "type": "address"
        }
      ],
      "name": "tokensToToken",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "contract IERC20",
              "name": "sellToken",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "spender",
              "type": "address"
            },
            {
              "internalType": "bytes",
              "name": "swapCallData",
              "type": "bytes"
            },
            {
              "internalType": "uint256",
              "name": "sellAmount",
              "type": "uint256"
            }
          ],
          "internalType": "struct Kitsune.Order[]",
          "name": "orders",
          "type": "tuple[]"
        },
        {
          "internalType": "contract IERC20",
          "name": "buyToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        }
      ],
      "name": "tokensToTokenCustomRecipient",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    }
  ];

export default abi;