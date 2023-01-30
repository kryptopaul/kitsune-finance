import { ethers } from "hardhat";
const chalk = require('chalk');

async function deploy(weth: string, exchangeProxy: string) {

    const Kitsunecontract = await ethers.getContractFactory("Kitsune");
    const kitsunecontract = await Kitsunecontract.deploy(weth, exchangeProxy);
    await kitsunecontract.deployed();
    console.log("✨ Kitsune deployed to:", kitsunecontract.address);
    return kitsunecontract.address;

}


export default deploy;