require('dotenv').config()
const GSRChallenge2PoolArbitrage = require('../artifacts/contracts/GSRChallenge.sol/GSRChallenge2PoolArbitrage.json');
const tokenContract = require('../artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json');
const router = require('../Addresses/router.json');
const factory = require('../Addresses/factory.json');
const tokens = require('../Addresses/tokens.json');
const web3 = require('web3');

const contractAdd = '0x0dc1A995798CC0Dc738812DC5d6A54A25386EFe9'
let contractABI = GSRChallenge2PoolArbitrage.abi;
let token0 = tokens.rinkeby.WETH;
let token1 = tokens.rinkeby.ZRX;
let factory0 = factory.rinkeby.Uniswap;
let factory1 = factory.rinkeby.Sushiswap;
let router0 = router.rinkeby.Uniswap;
let router1 = router.rinkeby.Sushiswap;
// 0.1 ETH
let amount0 = web3.utils.toBN('100000000000000000').toString();
let arb;

async function getMaxArbitragePossible(token0, token1, router0, router1) {
    const [signer] = await ethers.getSigners(); 
    const contract = new ethers.Contract(contractAdd, contractABI, signer);
    const tokenContract0 = new ethers.Contract(token0, tokenContract.abi, signer);
    const tokenContract1 = new ethers.Contract(token1, tokenContract.abi, signer);
    let tokenSymbol0 = await tokenContract0.symbol();
    let tokenSymbol1 = await tokenContract1.symbol();

    try {
        let result = await contract.connect(signer).maxArbitragePossible(token0, token1, router0, router1);
        arb = Math.abs(result[0] - result[1])/1e18;
        if(arb > 0) {
            console.log(`Arbitrage profit of ${arb.toFixed(4)} exists between ${tokenSymbol0} and ${tokenSymbol1}. ${tokenSymbol0}/${tokenSymbol1} price is ${(Number(result[0])/1e18).toFixed(4)} on Dex0 and ${(Number(result[1])/1e18).toFixed(4)} on Dex1`);
        } else {
            console.log("no arbitrage opportunity");
        }
    } catch (error) {
        console.log(error);
    }
}

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
        let tx = await tokenContract0.connect(signer).approve(contract.address, amount);
        tx.wait(1);
        tx = await contract.connect(signer)._depositToken(token0, amount);
        tx.wait(1);
        token0BalBefore = await contract.getTokenBalance(token0);
        console.log(`Initial ${tokenSymbol0} balance of ${Number(token0BalBefore)/1e18} before arb.` )
        result = await contract.connect(signer).executeArb(token0, token1, router0, router1, amount);
        await result.wait(2);
        
        token0BalAfter = await contract.getTokenBalance(token0);
        await contract.connect(signer).withdrawToken(token0,signer.address);
        profit = Number(token0BalAfter)/1e18 - Number(token0BalBefore)/1e18; 

        console.log(`You have a ${tokenSymbol0} balance of ${(Number(token0BalAfter)/1e18).toFixed(4)} after executing arb.` )
        console.log(`You have made ${profit.toFixed(4)} in profit.`)

    } catch (error) {
        console.log(error);
    }
        
}

// getMaxArbitragePossible(token0, token1, router0, router1);
executeArb(token0, token1, router0, router1, amount0);
