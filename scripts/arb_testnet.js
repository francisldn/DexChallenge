require('dotenv').config()
const GSRChallenge2PoolArbitrage = require('../artifacts/contracts/GSRChallenge.sol/GSRChallenge2PoolArbitrage.json');
const tokenContract = require('../artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json');
const router = require('../Addresses/router.json');
const factory = require('../Addresses/factory.json');
const tokens = require('../Addresses/tokens.json');
const web3 = require('web3');

const contractAdd = '0x350b4a1c43d42ccc8e5EE1552682D466Bc560840'
let contractABI = GSRChallenge2PoolArbitrage.abi;
let token0 = tokens.rinkeby.WETH;
let token1 = tokens.rinkeby.LINK;
let factory0 = factory.rinkeby.Uniswap;
let factory1 = factory.rinkeby.Sushiswap;
let router0 = router.rinkeby.Uniswap;
let router1 = router.rinkeby.Sushiswap;
// 0.1 ETH
let amount0 = web3.utils.toBN('100000000000000000').toString();
let arb;

// function to execute maxArbitragePossible function and display a log in terminal
async function getMaxArbitragePossible(token0, token1, router0, router1, amount0) {
    const [signer] = await ethers.getSigners(); 
    const contract = new ethers.Contract(contractAdd, contractABI, signer);
    const tokenContract0 = new ethers.Contract(token0, tokenContract.abi, signer);
    const tokenContract1 = new ethers.Contract(token1, tokenContract.abi, signer);
    let tokenSymbol0 = await tokenContract0.symbol();
    let tokenSymbol1 = await tokenContract1.symbol();

    try {
        let result = await contract.connect(signer).maxArbitragePossible(token0, token1, router0, router1, amount0);
        arb = (Number(result[2])/1e18).toFixed(4);
        if(arb > 0) {
            console.log(`Arbitrage profit of ${arb} exists between ${tokenSymbol0} and ${tokenSymbol1}. ${tokenSymbol0}/${tokenSymbol1} price is ${(Number(result[0])/1e18).toFixed(4)} on Dex0 and ${(Number(result[1])/1e18).toFixed(4)} on Dex1`);
        } else {
            console.log("no arbitrage opportunity");
        }
    } catch (error) {
        console.log(error);
    }
}

// function that execute maxArbitragePossible function, deposit token0 and execute arbitrage, return token balance in the contract and profit
// note that profit could be negative even with positive arbitrage opportunity due to slippage
async function executeArb(token0, token1, router0, router1, amount) {
    const [signer] = await ethers.getSigners(); 
    const contract = new ethers.Contract(contractAdd, contractABI, signer);
    const tokenContract0 = new ethers.Contract(token0, tokenContract.abi, signer);
    let tokenSymbol0 = await tokenContract0.symbol();

    await getMaxArbitragePossible(token0, token1, router0, router1, amount);
    
    let token0BalBefore;
    let token0BalAfter;
    let profit;
    try {
        await tokenContract0.connect(signer).approve(contract.address, amount);
        tx = await contract.connect(signer)._depositToken(token0, amount);
        await tx.wait(1);
        token0BalBefore = await contract.getTokenBalance(token0);
        console.log(`Initial ${tokenSymbol0} balance of ${Number(token0BalBefore)/1e18} before arb.` )
        result = await contract.connect(signer).executeArb(token0, token1, router0, router1, amount,{gasLimit: 300000000});
        await result.wait(1);
    } catch (error) {
        console.log(error)
    }
    token0BalAfter = await contract.getTokenBalance(token0);
    await contract.connect(signer).withdrawToken(token0,signer.address);
    profit = (Number(token0BalAfter) - Number(token0BalBefore))/1e18; 
    console.log(`You have a ${tokenSymbol0} balance of ${(Number(token0BalAfter)/1e18).toFixed(4)} after executing arb.` )
    console.log(`You have made ${profit.toFixed(4)} in profit.`)
}

/* calculate arb between 2 Dexes' liquidity pools */
getMaxArbitragePossible(token0, token1, router0, router1, amount0);
/* execute arb between 2 Dexes' liquidity pools */
// executeArb(token0, token1, router0, router1, amount0);
