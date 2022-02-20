require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require('dotenv').config()

module.exports = {
  defaultNetwork:'hardhat',
  networks: {
    hardhat: {
        // chainId: 43114,
        // gasPrice: 225000000000,
        forking: {
            // url: "https://api.avax.network/ext/bc/C/rpc",
            // enabled: true,
            // blockNumber: 8927780
            url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
            accounts: [process.env.PRIVATE_KEY],
            gas: 30000000,
            blockNumber: 14243327
        },
    },
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY],
      gas: 30000000
      //blockNumber:10201359
    },
    bsctestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      accounts: [process.env.PRIVATE_KEY]
    },
    bsc: {
      url: "https://bsc-dataseed.binance.org/",
      chainId: 56,
      gasPrice: 20000000000,
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  solidity: "0.8.7",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};