# Arbitrage Between Tokens, Pools and DEXes
``GSRChallenge.sol`` is a contract that can 
* get the max arbitrage between **2 DEX's liquidity pools** (2 tokens) using ``maxArbitragePossible`` function
* get the max arbitrage among **3 tokens from 3 liquidity pools** within the same Dex using ``maxArbitrage3Tokens`` function
* **execute arbitrage** between 2 DEX's liqudity pools using `executeArb` function

# How to Start
1. Run ``git clone`` on this repo
2. Then ``cd DexChallenge`` directory
3. Run ``npm install`` to install all the dependencies
4. Then follow the steps below to execute the scripts in the scripts folder

# Interact with Contract on Mainnet Fork and Testnet
## Execute on Mainnet Fork
1. Configure networks in the ``hardhat.config.js`` file, as below. Set up a ``.env`` file to store ``ALCHEMY_API_KEY`` and ``PRIVATE_KEY``. An sample .env file is provided.
```
module.exports = {
  defaultNetwork:'hardhat',
  networks: {
    hardhat: {
        forking: {
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
    },
}
```
2. After configuring the mainnet fork setting, go to ``arb.js`` file in the ``scripts`` folder. Specify the token pair that you wish to run arbitrage against at line 11-12 of the script. You can find the list of token pairs available to run on mainnet in the ``Addresses/tokens.json`` file.

Note: There was an arb opportunity found among WETH-LINK-DAI tokens at block 14243327 on the mainnet - hence the blockNumber is set to the block.

3. Execute the command below to run the ``arb.js`` script in mainnet fork. The command will create a local instance of the contract and execute ``getMaxArbitrage3Tokens`` or ``getMaxArbitragePossible`` functions. You can also run ``executeArb`` function if you wish to take advantage of the arb between 2 Dexes' liqudity pools.
```
npx hardhat run scripts/arb.js --network hardhat
```
4. If you execute ``getMaxArbitragePossible``, you should be able to see the following message in terminal if a liquidity pool exists between the token pair on Dex0 and Dex1

```
Arbitrage profit of <ARB> exists between <TOKEN0> and <TOKEN1>. <TOKEN0>/<TOKEN1> price is <PRICE0> on Dex0 and <PRICE1> on Dex1
```
If you execute ``getMaxArbitrage3Tokens``, you will see the folllowing message is there is arbitrage opportunity. Otherwise it will show "no arb opportunity".
```
Arbitrage profit of <ARB_PROFIT> <TOKEN0> exists between <TOKEN0>, <TOKEN1> and <TOKEN2>. Remaining token0 balance of <TOKEN0_REMAINING_BALANCE> after arbitrage.
```

Note that if a liquidity pool does not exist between a token pair (ie. pair address = address(0)), then the functions ``getMaxArbitrage3Tokens`` and ``getMaxArbitragePossible`` will revert.

5. If you run ``executeArb``, the function will execute the arb between 2 Dexes' liquidity pools. It will first calculate the price differential and then it will proceed to execute the arbitrage if the price differential is greater than 1%. It will then compare the output of token0 before and after the arbitrage, and revert with "not_profitable" if it is not profitable due to price slippage.

## Execute on Rinkeby testnet
You can execute the functions in the smart contract on Rinkeby testnet through the steps below:
1. Follow step 1 above to configure the Rinkeby testnet.
2. Go to ``arb_testnet.js`` file in the ``scripts`` folder, specify the token pair that you wish to run arbitrage against at line 11-12 of the script. The list of token pairs available to run on Rinkeby testnet (as well as mainnet) can be found in ``Addresses/tokens.json`` file. 
3. An instance of the contract has been deployed on Rinkeby testnet at [``0x7F2fc6DE2F4Aee559005c0e5430ab1C6681E74e4``](https://rinkeby.etherscan.io/address/0x7F2fc6DE2F4Aee559005c0e5430ab1C6681E74e4). Run ``arb_testnet.js`` file in the ``scripts`` folder, as below. This will trigger the execution of ``getMaxArbitragePossible`` function. You can also run ``executeArb`` function if you wish to do so.
```
npx hardhat run scripts/arb_testnet.js --network rinkeby
```
Note: There was an [arb opportunity](https://rinkeby.etherscan.io/tx/0xbaab47951c0d1c28fdd80b0f5dba1cf0c57d303173d87a5f67474d2f68a6ee1e) found and executed on Rinkeby testnet on block 10201359 between WETH-LINK tokens 

# Addresses
* ``Addresses/factory.json`` contains UniSwap and SushiSwap factory addresses on Mainnet and Rinkeby testnet
* ``Addresses/router.json`` contains UniSwap and SushiSwap router addresses on Mainnet and Rinkeby testnet
* ``Addresses/tokens.json`` contains token pairs addresses for which liquidity pools exist on UniSwap and SushiSwap Mainnet and Rinkeby testnet

For mainnet forking purpose, an impersonated account has been used to run ``executeArb``, such as 
* Cynthia_WETH: ``0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2`` for WETH token
