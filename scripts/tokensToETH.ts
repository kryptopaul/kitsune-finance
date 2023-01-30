import { expect } from "chai";
import { ethers, network } from "hardhat";
const axios = require('axios');
const chalk = require('chalk');
const log = console.log;
import deploy from "./deploy";
import addresses from "../helpers/mainnet";
import MINIMAL_ERC20_ABI from "../helpers/ERC20ABI";
import logo from "../helpers/logo";

// This demo will swap a few tokens to ETH on a mainnet fork.
// Make sure you've started a mainnet fork with `npx hardhat node --fork <rpc url>`.

// Specify the tokens and the amounts to swap to ETH. You can also leave the object as it is with default values.
// The default values are 10 COMP, 125 UNI, 1500 MATIC.

const orders: Order[] = [
    {
        name: addresses.comp.name,
        address: addresses.comp.address,
        amount: "125"
    },
    {
        name: addresses.uni.name,
        address: addresses.uni.address,
        amount: "500"
    },
    {
        name: addresses.matic.name,
        address: addresses.matic.address,
        amount: "2000"
    }
];

// An account with sufficient balance on mainnet https://etherscan.io/address/0xeaeedd62a7463f71f34d47431ed273ce6d9be0d0
// Leave it as it is, unless you'd like to simulate transactions from another account.

const takerAddress = "0xC131701Ea649AFc0BfCc085dc13304Dc0153dc2e";

const tries = 1;


(async () => {

    console.log(chalk.hex('#d17f3d').bold("🦊 Welcome to Kitsune Finance! 🦊"));
    // Impersonate the account we are going to use to simulate transactions.
    await network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [takerAddress]
    });

    // Get a signer for the account we are impersonating
    const signer = await ethers.getSigner(takerAddress);

    // Deploy the Kitsune contract.
    const kitsuneAddress = await deploy(addresses.weth.address, addresses.exchangeProxy);

    // Get the Kitsune contract instance.
    const kitsune = await ethers.getContractAt("Kitsune", kitsuneAddress, signer);


    for (let i = 0; i < tries; i++) {


        // Get quotes from the 0x API.
        const orders0x = [];


        for (let i = 0; i < orders.length; i++) {
            const order: Order = orders[i];
            const quote = await axios.get(`https://api.0x.org/swap/v1/quote?buyToken=ETH&sellToken=${order.address}&sellAmount=${ethers.utils.parseUnits(order.amount, 18).toString()}`);
            orders0x.push({
                sellToken: quote.data.sellTokenAddress,
                spender: quote.data.allowanceTarget,
                swapCallData: quote.data.data,
                sellAmount: quote.data.sellAmount
            });
        }

        // console.log(orders0x)
        // Check current ETH and token balances.
        const balancesBefore = [];
        const ethBalanceBefore = await signer.getBalance();
        balancesBefore.push({ token: "ETH", balance: ethers.utils.formatEther(ethBalanceBefore) });

        for (let i = 0; i < orders.length; i++) {
            const order: Order = orders[i];
            const token = new ethers.Contract(order.address, MINIMAL_ERC20_ABI, signer);
            const tokenBalanceBefore = await token.balanceOf(takerAddress);
            balancesBefore.push({ token: order.name, balance: ethers.utils.formatUnits(tokenBalanceBefore, 18) });
        }



        console.log(chalk.blue("💰 Balances before:"));
        console.table(balancesBefore);

        // Aprove the tokens to be swapped. Now it's up to the order amount but I think about changing it to the max uint256.
        for (let i = 0; i < orders.length; i++) {
            const order: Order = orders[i];
            const token = new ethers.Contract(order.address, MINIMAL_ERC20_ABI, signer);
            const tx = await token.approve(kitsuneAddress, ethers.constants.MaxUint256);
            await tx.wait();
            console.log(chalk.yellow(`🔘 Approved ${order.name} to be swapped.`));
        }


        // Swap tokens to ETH.
        const tx = await kitsune.tokensToETH(orders0x);
        await tx.wait();
        console.log(chalk.green.underline("💱 Tokens swapped to ETH."));



        // Check current ETH and token balances.
        const balancesAfter = [];
        const ethBalanceAfter = await signer.getBalance();
        balancesAfter.push({ token: "ETH", balance: ethers.utils.formatEther(ethBalanceAfter) });

        for (let i = 0; i < orders.length; i++) {
            const order: Order = orders[i];
            const token = new ethers.Contract(order.address, MINIMAL_ERC20_ABI, signer);
            const tokenBalanceAfter = await token.balanceOf(takerAddress);
            balancesAfter.push({ token: order.name, balance: ethers.utils.formatUnits(tokenBalanceAfter, 18) });
        }
        
        console.log(chalk.blue("💰 Balances after:"));
        console.table(balancesAfter);
    }


})();