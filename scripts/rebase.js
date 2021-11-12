const { ethers } = require("hardhat");

const STAKING_CONTRACT = '0x650590f75394A64dA36E55bBB85B2A146E60afDd'

async function main() {
	const deployer = await ethers.getSigner();

	const Staking = await ethers.getContractFactory('FlatStaking');
	const staking = await Staking.attach(STAKING_CONTRACT);

	await staking.rebase();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });