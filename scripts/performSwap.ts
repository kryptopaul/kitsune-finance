import { expect } from "chai";
import { ethers, network } from "hardhat";
// node-fetch version 2 needs to be added to your project
const axios = require('axios');
const chalk = require('chalk');
const log = console.log;

const ONE_ETHER_BASE_UNITS = "1000000000000000000"; // 1 ETH
const MINIMAL_ERC20_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transfer(address recipient, uint256 amount) external returns (bool)",
];
const KITSUNE_ABI = [
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
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "contract IERC20",
        "name": "sellToken",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "contract IERC20",
        "name": "buyToken",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "boughtAmount",
        "type": "uint256"
      }
    ],
    "name": "BoughtTokens",
    "type": "event"
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
    "name": "depositETH",
    "outputs": [],
    "stateMutability": "payable",
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
            "internalType": "address payable",
            "name": "swapTarget",
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
        "internalType": "struct Kitsune.OrderToWETH[]",
        "name": "orders",
        "type": "tuple[]"
      }
    ],
    "name": "fillOrders",
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
            "internalType": "address payable",
            "name": "swapTarget",
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
        "internalType": "struct Kitsune.OrderToWETH",
        "name": "order",
        "type": "tuple"
      }
    ],
    "name": "fillQuoteForTargetWETH",
    "outputs": [],
    "stateMutability": "nonpayable",
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
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "withdrawETH",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "contract IERC20",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "withdrawToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
];


  //anonymous async function
  (async () => {
    try{
    // deploy kitsune
    const Kitsunecontract = await ethers.getContractFactory("Kitsune");
    const kitsunecontract = await Kitsunecontract.deploy("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "0xdef1c0ded9bec7f1a1670819833240f027b25eff");
    await kitsunecontract.deployed();
    console.log("Kitsune deployed to:", kitsunecontract.address);

    // Quote parameters
    const tetherAddress = "0xdac17f958d2ee523a2206206994597c13d831ec7"; // USDT
    const shibaAddress = "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE" // SHIBA
    const apeAddress = "0x4d224452801aced8b2f0aebe155379bb5d594381" // APE

    const wethAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"; // WETH

    const daiAddress = "0x6b175474e89094c44da98b954eedeac495271d0f" // DAI
    

    const sellAmount = ethers.utils.parseEther("1000");
    const takerAddress = "0xC131701Ea649AFc0BfCc085dc13304Dc0153dc2e"; // An account with sufficient balance on mainnet

    // Requests for the array
    const sellDaiforWeth = await axios.get(
      `https://api.0x.org/swap/v1/quote?buyToken=${wethAddress}&sellAmount=${sellAmount}&sellToken=${daiAddress}`
    );
    // Check for error from 0x API
    if (sellDaiforWeth.status !== 200) {
      const body = await sellDaiforWeth.text();
      throw new Error(body);
    }

    const daiforwethQuote:any = await sellDaiforWeth.data

    const sellUSDTforWeth = await axios.get(
      `https://api.0x.org/swap/v1/quote?buyToken=${wethAddress}&sellAmount=${sellAmount}&sellToken=${tetherAddress}`
    );
    // Check for error from 0x API
    if (sellUSDTforWeth.status !== 200) {
      const body = await sellUSDTforWeth.text();
      throw new Error(body);
    }

    const usdtforwethQuote:any = await sellUSDTforWeth.data

    console.log("You will get at least " +  ethers.utils.formatEther(daiforwethQuote.buyAmount)+ " WETH for " + ethers.utils.formatEther(sellAmount) + " DAI")
    console.log("You will get at least " +  ethers.utils.formatEther(sellUSDTforWeth.data.buyAmount)+ " WETH for " + ethers.utils.formatEther(sellAmount) + " USDT")


    // Impersonate the taker account so that we can submit the quote transaction
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [takerAddress]
    });


    // Get a signer for the account we are impersonating
    const signer = await ethers.getSigner(takerAddress);

    const kitsune = new ethers.Contract(kitsunecontract.address, KITSUNE_ABI, signer);
    const weth = new ethers.Contract(wethAddress, MINIMAL_ERC20_ABI, signer);
    
    const tether = new ethers.Contract(tetherAddress, MINIMAL_ERC20_ABI, signer);
    const shiba = new ethers.Contract(shibaAddress, MINIMAL_ERC20_ABI, signer);
    const dai = new ethers.Contract(daiAddress, MINIMAL_ERC20_ABI, signer);
    

    // Get pre-swap balances for comparison
    const etherBalanceBefore = await signer.getBalance();
    const wethBalanceBefore = await weth.balanceOf(takerAddress);
    const shibaBalanceBefore = await shiba.balanceOf(takerAddress);
    const daiBalanceBefore = await dai.balanceOf(takerAddress);
    const tetherBalanceBefore = await tether.balanceOf(takerAddress);

    console.log(chalk.blue.bold("Balances before swap:"));
    console.log("ETH:", ethers.utils.formatEther(etherBalanceBefore));
    console.log("WETH: ", ethers.utils.formatEther(wethBalanceBefore));
    console.log("DAI: ", ethers.utils.formatEther(daiBalanceBefore));
    console.log("USDT: ", ethers.utils.formatUnits(tetherBalanceBefore, 6));

    // Approve the Kitsune contract to spend the taker's DAI (unlimited)
    await dai.approve(kitsunecontract.address, ethers.constants.MaxUint256);
    console.log(chalk.yellow("Approved Kitsune to spend DAI"));



    // Send the transaction
    const swapTx = await kitsune.fillQuoteForTargetWETH(  
      daiforwethQuote.sellTokenAddress, 
      daiforwethQuote.buyTokenAddress, 
      daiforwethQuote.allowanceTarget, 
      daiforwethQuote.to, 
      daiforwethQuote.data,
      sellAmount.toBigInt()
  );



    // Wait for transaction to confirm
    const txReceipt = await swapTx.wait();

    // Verify that the transaction was successful
    expect(txReceipt.status).to.equal(1, "successful swap transaction");

    console.log(chalk.green("Swap transaction successful!"));

    // Get post-swap balances
    const etherBalanceAfter = await signer.getBalance();
    const shibaBalanceAfter = await shiba.balanceOf(takerAddress);
    const wethBalanceAfter = await weth.balanceOf(takerAddress);
    const daiBalanceAfter = await dai.balanceOf(takerAddress);
    const tetherBalanceAfter = await tether.balanceOf(takerAddress);

    console.log(chalk.blue.bold("Balances after swap:"));
    console.log("ETH:", ethers.utils.formatEther(etherBalanceAfter));
    console.log("WETH:", ethers.utils.formatEther(wethBalanceAfter));
    console.log("DAI:", ethers.utils.formatEther(daiBalanceAfter));
    console.log("USDT: ", ethers.utils.formatUnits(tetherBalanceBefore, 6));

  } catch (err) {
    console.log(err);
  }
})();