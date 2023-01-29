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
  "function allowance(address owner, address spender) external view returns (uint256)",
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
  }
];

const gas = [];

  //anonymous async function
  (async () => {
    try{
    // deploy kitsune
    const Kitsunecontract = await ethers.getContractFactory("Kitsune");
    const kitsunecontract = await Kitsunecontract.deploy("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "0xdef1c0ded9bec7f1a1670819833240f027b25eff");
    await kitsunecontract.deployed();
    console.log("Kitsune deployed to:", kitsunecontract.address);

    // //deploy token holder
    // const KitsuneFeeHolder = await ethers.getContractFactory("KitsuneFeeHolder")
    // const kitsunefeeholder = await KitsuneFeeHolder.deploy()
    // await kitsunecontract.deployed()
    // console.log("KitsuneFeeHolder deployed to: " + kitsunefeeholder.address)

    // Quote parameters
    const tetherAddress = "0xdac17f958d2ee523a2206206994597c13d831ec7"; // USDT
    const shibaAddress = "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE" // SHIBA
    const apeAddress = "0x4d224452801aced8b2f0aebe155379bb5d594381" // APE

    const wethAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"; // WETH

    const daiAddress = "0x6b175474e89094c44da98b954eedeac495271d0f" // DAI
    const maticAddress = "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0" // MATIC
    const uniAddress = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984" // UNI


    const sellAmountDai = ethers.utils.parseEther("10000");
    const sellAmountMatic = ethers.utils.parseEther("25000")
    const sellAmountUni = ethers.utils.parseEther("500")

    const takerAddress = "0xC131701Ea649AFc0BfCc085dc13304Dc0153dc2e"; // An account with sufficient balance on mainnet https://etherscan.io/address/0xeaeedd62a7463f71f34d47431ed273ce6d9be0d0
    for (let i = 0; i < 5; i++) {
    // Requests for the array
    // &feeRecipient=${kitsunefeeholder.address}&buyTokenPercentageFee=0.001
    const sellDaiforWeth = await axios.get(
      `https://api.0x.org/swap/v1/quote?buyToken=${wethAddress}&sellAmount=${sellAmountDai}&sellToken=${daiAddress}`
    );
    // Check for error from 0x API
    if (sellDaiforWeth.status !== 200) {
      const body = await sellDaiforWeth.text();
      throw new Error(body);
    }

    const daiforwethQuote:any = await sellDaiforWeth.data
    // console.log("Orders for DAI -> WETH")
    // console.log(daiforwethQuote.orders)

    const sellMaticforWeth = await axios.get(
        `https://api.0x.org/swap/v1/quote?buyToken=${wethAddress}&sellAmount=${sellAmountMatic}&sellToken=${maticAddress}`
        );
    // Check for error from 0x API
    if (sellMaticforWeth.status !== 200) {
        const body = await sellMaticforWeth.text();
        throw new Error(body);
    }
    
    const maticforwethQuote:any = await sellMaticforWeth.data
    // console.log("Orders for MATIC -> WETH")
    // console.log(maticforwethQuote.orders)

    const sellUniforWeth = await axios.get(
        `https://api.0x.org/swap/v1/quote?buyToken=${wethAddress}&sellAmount=${sellAmountUni}&sellToken=${uniAddress}`
        );

    // Check for error from 0x API
    if (sellUniforWeth.status !== 200) {
        const body = await sellUniforWeth.text();
        throw new Error(body);
    }

    const uniforwethQuote:any = await sellUniforWeth.data
    // console.log("Orders for UNI -> WETH")
    // console.log(uniforwethQuote.orders)

    // const sellUSDTforWeth = await axios.get(
    //   `https://api.0x.org/swap/v1/quote?buyToken=${wethAddress}&sellAmount=${sellAmountUSDT}&sellToken=${tetherAddress}`
    // );
    // // Check for error from 0x API
    // if (sellUSDTforWeth.status !== 200) {
    //   const body = await sellUSDTforWeth.text();
    //   throw new Error(body);
    // }

    // const usdtforwethQuote:any = await sellUSDTforWeth.data

    console.log("You will get at least " +  ethers.utils.formatEther(daiforwethQuote.buyAmount)+ " WETH for " + ethers.utils.formatEther(sellAmountDai) + " DAI")
    console.log("You will get at least " +  ethers.utils.formatEther(maticforwethQuote.buyAmount)+ " WETH for " + ethers.utils.formatEther(sellAmountMatic) + " MATIC")
    console.log("You will get at least " +  ethers.utils.formatEther(uniforwethQuote.buyAmount)+ " WETH for " + ethers.utils.formatEther(sellAmountUni) + " UNI")
    // console.log("You will get at least " +  ethers.utils.formatEther(sellUSDTforWeth.data.buyAmount)+ " WETH for " + ethers.utils.formatEther(sellAmount) + " USDT")


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
    const matic = new ethers.Contract(maticAddress, MINIMAL_ERC20_ABI, signer);
    const uni = new ethers.Contract(uniAddress, MINIMAL_ERC20_ABI, signer);
    

    // Get pre-swap balances for comparison
    const etherBalanceBefore = await signer.getBalance();
    const wethBalanceBefore = await weth.balanceOf(takerAddress);
    const shibaBalanceBefore = await shiba.balanceOf(takerAddress);
    const daiBalanceBefore = await dai.balanceOf(takerAddress);
    const tetherBalanceBefore = await tether.balanceOf(takerAddress);
    const maticBalanceBefore = await matic.balanceOf(takerAddress);
    const uniBalanceBefore = await uni.balanceOf(takerAddress);

    console.log(chalk.blue.bold("Balances before swap:"));
    console.log("ETH:", ethers.utils.formatEther(etherBalanceBefore));
    console.log("WETH: ", ethers.utils.formatEther(wethBalanceBefore));
    console.log("DAI: ", ethers.utils.formatEther(daiBalanceBefore));
    console.log("Matic: ", ethers.utils.formatEther(maticBalanceBefore));
    console.log("UNI: ", ethers.utils.formatEther(uniBalanceBefore));


    // Approve the Kitsune contract to spend the taker's DAI (unlimited)
    await dai.approve(kitsunecontract.address, ethers.constants.MaxUint256);
    console.log(chalk.yellow("Approved Kitsune to spend DAI"));
    await matic.approve(kitsunecontract.address, ethers.constants.MaxUint256);
    console.log(chalk.yellow("Approved Kitsune to spend MATIC"));
    await uni.approve(kitsunecontract.address, ethers.constants.MaxUint256);
    console.log(chalk.yellow("Approved Kitsune to spend UNI"));

    // // Approve the Kitsune contract to spend the taker's USDT (unlimited)
    // await tether.approve(kitsunecontract.address, 0);
    // await tether.approve(kitsunecontract.address, ethers.constants.MaxUint256);
    // console.log(chalk.yellow("Approved Kitsune to spend USDT"));

    // check what the approval is and log it
    // const daiAllowance = await dai.allowance(takerAddress, kitsunecontract.address);
    // console.log("DAI allowance: ", ethers.utils.formatEther(daiAllowance));

    // const tetherAllowance = await tether.allowance(takerAddress, kitsunecontract.address);
    // console.log("USDT allowance: ", ethers.utils.formatUnits(tetherAllowance, 6));


//     Send the transaction
//     const swapTx = await kitsune.fillQuote(  
//       daiforwethQuote.sellTokenAddress, 
//       daiforwethQuote.buyTokenAddress, 
//       daiforwethQuote.allowanceTarget, 
//       daiforwethQuote.to, 
//       daiforwethQuote.data,
//       sellAmount.toBigInt()
//   );

// console.log("I will pass the following sell amount for dai: " + sellAmount.toBigInt())
// console.log("I will pass the following sell amount for usdt: " + sellAmountUSDT.toBigInt())
// console.log("Debug mode:")
// console.log("DAI order")
// console.log(daiforwethQuote.sellTokenAddress)
// console.log(daiforwethQuote.buyTokenAddress)
// console.log(daiforwethQuote.allowanceTarget)
// console.log(daiforwethQuote.to)
// console.log(daiforwethQuote.data)
// console.log(sellAmount.toBigInt())
// console.log("USDT order")
// console.log(usdtforwethQuote.sellTokenAddress)
// console.log(usdtforwethQuote.buyTokenAddress)
// console.log(usdtforwethQuote.allowanceTarget)
// console.log(usdtforwethQuote.to)
// console.log(usdtforwethQuote.data)
// console.log(sellAmountUSDT.toBigInt())




    const swapTx = await kitsune.fillOrders(
        [
            [
                daiforwethQuote.sellTokenAddress, 
                daiforwethQuote.allowanceTarget, 
                daiforwethQuote.data,
                sellAmountDai.toBigInt()
            ],
            [
                maticforwethQuote.sellTokenAddress,
                maticforwethQuote.allowanceTarget,
                maticforwethQuote.data,
                sellAmountMatic.toBigInt()
            ],
            [
                uniforwethQuote.sellTokenAddress,
                uniforwethQuote.allowanceTarget,
                uniforwethQuote.data,
                sellAmountUni.toBigInt()
            ]
        ]

    )
    // Wait for transaction to confirm
    const txReceipt = await swapTx.wait();

    // Verify that the transaction was successful
    expect(txReceipt.status).to.equal(1, "successful swap transaction");

    console.log(chalk.green("Swap transaction successful!"));
    console.log(chalk.yellow("Gas used: ", txReceipt.gasUsed));
    gas.push(parseInt(txReceipt.gasUsed.toString()))
    // Get post-swap balances
    const etherBalanceAfter = await signer.getBalance();
    const shibaBalanceAfter = await shiba.balanceOf(takerAddress);
    const wethBalanceAfter = await weth.balanceOf(takerAddress);
    const daiBalanceAfter = await dai.balanceOf(takerAddress);
    const tetherBalanceAfter = await tether.balanceOf(takerAddress);
    const maticBalanceAfter = await matic.balanceOf(takerAddress);
    const uniBalanceAfter = await uni.balanceOf(takerAddress);

    console.log(chalk.blue.bold("Balances after swap:"));
    console.log("ETH:", ethers.utils.formatEther(etherBalanceAfter));
    console.log("WETH:", ethers.utils.formatEther(wethBalanceAfter));
    console.log("DAI:", ethers.utils.formatEther(daiBalanceAfter));
    console.log("Matic:", ethers.utils.formatEther(maticBalanceAfter));
    console.log("UNI:", ethers.utils.formatEther(uniBalanceAfter));
    
    // const daiFees = dai.balanceOf(kitsunecontract.address)
    // const maticFees = matic.balanceOf(kitsunecontract.address)
    // const uniFees = uni.balanceOf(kitsunecontract.address)
    // const wethFees = await weth.balanceOf(kitsunefeeholder.address)

    console.log(chalk.blue.bold("Fees collected by contract:"));
    // console.log("DAI: " + daiFees)
    // console.log("MATIC: " + maticFees)
    // console.log("UNI: " + uniFees)
    // console.log(ethers.utils.formatEther(wethFees))
    }


    console.log(chalk.blue.bold("Gas used array: ", gas));
    const averageGas = gas.reduce((a, b) => a + b, 0) / gas.length;
    console.log(chalk.blue.bold("Average gas used: ", averageGas));
  } catch (err) {
    console.log(err);
  }
})();