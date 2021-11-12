require("@nomiclabs/hardhat-waffle");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.7.5",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
    },
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/4210ba8eb536423e8ae5d774c5064fa1",
      accounts: ["112e24e0c6d61c6f030d3dcd22acbe0b5573d25803a03a773200de22d6a9520d"],
      allowUnlimitedContractSize: true,
      gas: 2100000,
      gasPrice: 8000000000
    }
  }
};
