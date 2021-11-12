// This script deploys the whole flatland ecosystem except for the LP tokens and their bonds

const { ethers } = require("hardhat");

async function main() {
	const deployer = await ethers.getSigner();
	console.log('Deploying contracts with account: ' + deployer.address);

	// Mock DAO
	const MockDAO = deployer.address;

	const initialIndex = '7675210820';

	// Rinkeby chain id
	const chainId = 4;

	// Large number for approval for DAI
    const largeApproval = '100000000000000000000000000000000';

	// Initial mint for DAI (10,000,000)
    const initialMint = '10000000000000000000000000';

    // Ethereum 0 address, used when toggling changes in treasury
    const zeroAddress = '0x0000000000000000000000000000000000000000';

    // First block epoch occurs
    const firstEpochTime = '1636557795';

    // How many seconds in each epoch (8hrs)
    const epochLength = '28800';

    // What epoch will be first epoch
    const firstEpochNumber = '338';

    // DAI bond BCV
    const daiBondBCV = '369';

    // Min bond price
    const minBondPrice = '50000';

    // Max bond payout
    const maxBondPayout = '50'

    // DAO fee for bond
    const bondFee = '10000';

    // Initial reward rate for epoch
    const initialRewardRate = '3000';

    // Max debt bond can take on
    const maxBondDebt = '1000000000000000';

    // Bond vesting length in blocks. 33110 ~ 5 days
    const bondVestingLength = '33110';

    // Initial Bond debt
    const intialBondDebt = '0'

    console.log('Deploying flat contract');
	// Deploy FLAT
	const Flat = await ethers.getContractFactory('FLAT');
	const flat = await Flat.deploy()

	console.log('Deploying DAI contract');
	// Deploy DAI
	const DAI = await ethers.getContractFactory('DAI');
	const dai = await DAI.deploy(chainId)

	console.log('Deploy 10,000,000 mock DAI');
	await dai.mint(deployer.address, initialMint);

	console.log('Deploying treasury contract');
	const Treasury = await ethers.getContractFactory('FlatTreasury');
	const treasury = await Treasury.deploy(flat.address, dai.address, 0);

	console.log("Set treasury as FLAT vault");
	await flat.setVault(treasury.address);

	console.log('Deploying bond calculator contract');
	const FlatBondingCalculator = await ethers.getContractFactory('FlatBondingCalculator');
	const flatBondingCalculator = await FlatBondingCalculator.deploy(flat.address);

	console.log('Deploying distributor contract');
	const Distributor = await ethers.getContractFactory('Distributor');
	const distributor = await Distributor.deploy(treasury.address, flat.address, epochLength, firstEpochTime);

	console.log('Deploying sFLAT contract');
	const SFLAT = await ethers.getContractFactory('sFLAT')
	const sFLAT = await SFLAT.deploy()

	console.log('Deploying staking contract');
	const Staking = await ethers.getContractFactory('FlatStaking');
	const staking = await Staking.deploy(flat.address, sFLAT.address, epochLength, firstEpochNumber, firstEpochTime);

	console.log('Deploying staking helper contract');
	const StakingHelper = await ethers.getContractFactory('StakingHelper');
	const stakingHelper = await StakingHelper.deploy(staking.address, flat.address);

	console.log('Deploying staking warmup contract');
	const StakingWarmup = await ethers.getContractFactory('StakingWarmup');
	const stakingWarmup = await StakingWarmup.deploy(staking.address, sFLAT.address);

	console.log('Deploying dai bond contract');
	const DAIBond = await ethers.getContractFactory('FlatBondDepository');
	const daiBond = await DAIBond.deploy(flat.address, dai.address, treasury.address, MockDAO, zeroAddress);

	console.log('Queue DAI bond reserve depositor');
	await treasury.queue('0', daiBond.address);
	await treasury.toggle('0', daiBond.address, zeroAddress);

	console.log('Set DAI bond terms');
	await daiBond.initializeBondTerms(daiBondBCV, minBondPrice, maxBondPayout, bondFee, maxBondDebt, intialBondDebt, bondVestingLength);

	console.log('Set staking for DAI bond');
	await daiBond.setStaking(staking.address, true);

	console.log('Init sFlat and set its index');
	await sFLAT.initialize(staking.address);
	await sFLAT.setIndex(initialIndex);

	console.log('Set distributor contract and warmup contract');
	await staking.setContract('0', distributor.address);
	await staking.setContract('1', stakingWarmup.address);

	console.log('Add staking contract as distributor recipient');
	await distributor.addRecipient(staking.address, initialRewardRate);

	console.log('queue and toggle reward manager');
    await treasury.queue('8', distributor.address);
    console.log("now toggle")
    await treasury.toggle('8', distributor.address, zeroAddress);

    console.log('queue and toggle deployer reserve depositor');
    await treasury.queue('0', deployer.address);
    await treasury.toggle('0', deployer.address, zeroAddress);

    console.log('queue and toggle liquidity depositor');
    await treasury.queue('4', deployer.address, );
    await treasury.toggle('4', deployer.address, zeroAddress);

    console.log('approve treasury to spend DAI');
    await dai.approve(treasury.address, largeApproval);

    console.log('Approve DAI bond to spend deployers DAI');
    await dai.approve(daiBond.address, largeApproval);

    console.log('Approve staking and staking helper contact to spend deployers FLAT');
    await flat.approve(staking.address, largeApproval);
    await flat.approve(stakingHelper.address, largeApproval);

    console.log('Deposit 9,000,000 DAI to treasury, 600,000 FLAT gets minted to deployer and 8,400,000 are in treasury as excesss reserves');
    await treasury.deposit('9000000000000000000000000', dai.address, '8400000000000000');

    console.log('Stake FLAT through helper');
    await stakingHelper.stake('100000000000');

    console.log('Bond 1,000 FLAT');
    await daiBond.deposit('1000000000000000000000', '60000', deployer.address );

    console.log( "FLAT: " + flat.address );
    console.log( "DAI: " + dai.address );
    console.log( "Treasury: " + treasury.address );
    console.log( "Calc: " + flatBondingCalculator.address );
    console.log( "Staking: " + staking.address );
    console.log( "sFLAT: " + sFLAT.address );
    console.log( "Distributor " + distributor.address);
    console.log( "Staking Wawrmup " + stakingWarmup.address);
    console.log( "Staking Helper " + stakingHelper.address);
    console.log("DAI Bond: " + daiBond.address);
    console.log("DAO: " + deployer.address)

}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})