import { ethers } from "hardhat";

async function main() {


  const SimpleTokenSwap = await ethers.getContractFactory("SimpleTokenSwap");
  //weth address 0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6
  //exchange proxy 0xf91bb752490473b8342a3e964e855b9f9a2a668e

  const simpleTokenSwap = await SimpleTokenSwap.deploy("0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6", "0xf91bb752490473b8342a3e964e855b9f9a2a668e");

  await simpleTokenSwap.deployed();

  console.log(`SimpleTokenSwap deployed to: ${simpleTokenSwap.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
