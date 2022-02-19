# Arbitrage Between 2 DEXes
``GSRChallenge.sol`` is a contract that can 
* get the max arbitrage between 2 DEX's liquidity pools using ``maxArbitragePossible`` function
* execute arbitrage between 2 DEX's liqudity pools using `executeArb` function

# How to Start
1. Run ``git clone`` on this repo
2. Then ``cd DexChallenge`` directory
3. Run ``npm install`` to install all the dependencies
4. Then follow the steps below to execute the scripts in the scripts folder

# How to execute
## Execute on Rinkeby testnet
You can execute the functions in the smart contract on Rinkeby testnet through the steps below:
1. Configure networks in the ``hardhat.config.js`` file, as below. Set up a ``.env`` file to store ``ALCHEMY_API_KEY`` and ``PRIVATE_KEY``
```
module.exports = {
  defaultNetwork:'hardhat',
  networks: {
    hardhat: {
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
      } 
    },
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
}
```
2. Go to ``arb_testnet.js`` file in the ``scripts`` folder, specify the token pair that you wish to run arbitrage against at line 11-12 of the script. The list of token pairs available to run on Rinkeby testnet (as well as mainnet) can be found in ``Addresses/tokens.json`` file. 
   
3. An instance of the contract has been deployed on Rinkeby testnet at ``0x954554A00eFA4EEcb0760E219c605093077E3002``. Run ``arb_testnet.js`` file in the ``scripts`` folder, as below. This will trigger the execution of ``getMaxArbitragePossible`` function. You can also run ``executeArb`` function if you wish to do so.
```
npx hardhat run scripts/arb_testnet.js --network rinkeby
```
4. Once executed, you should be able to see the following message in terminal if a liquidity pool exists between the token pair on Dex0 and Dex1

```
Arbitrage profit of <ARB> exists between <TOKEN0> and <TOKEN1>. <TOKEN0>/<TOKEN1> price is <PRICE0> on Dex0 and <PRICE1> on Dex1
```

## Execute on Mainnet Fork
1. Follow the step 1 above to configure networks, specifically forking the mainnet, and then go to ``arb.js`` file in the ``scripts`` folder. Specify the token pair that you wish to run arbitrage against at line 11-12 of the script. You can find the list of token pairs available to run on mainnet in ``Addresses/tokens.json`` file.

2. Execute the command below to run the ``arb.js`` script in mainnet fork. The command will create a local instance of the contract and execute ``getMaxArbitragePossible`` function. You can also run ``executeArb`` function if you wish to do so.
```
npx hardhat run scripts/arb.js --network hardhat
```
3. Once executed, you should be able to see the same message as step 4 above.

# Addresses
* ``Addresses/factory.json`` contains UniSwap and SushiSwap factory addresses on Mainnet and Rinkeby testnet
* ``Addresses/router.json`` contains UniSwap and SushiSwap router addresses on Mainnet and Rinkeby testnet
* ``Addresses/tokens.json`` contains token pairs addresses for which liquidity pools exist on UniSwap and SushiSwap Mainnet and Rinkeby testnet

