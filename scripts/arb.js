require('dotenv').config()
const GSRChallenge2PoolArbitrage = require('../artifacts/contracts/GSRChallenge.sol/GSRChallenge2PoolArbitrage.json');
const tokenContract = require('../artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json');
const router = require('../Addresses/router.json');
const factory = require('../Addresses/factory.json');
const tokens = require('../Addresses/tokens.json');
const web3 = require('web3');

let contractABI = GSRChallenge2PoolArbitrage.abi;
let contractByteCode = GSRChallenge2PoolArbitrage.bytecode;

// Mainnet WETH-LINK-DAI arb opportunity at block 14243327
let token0 = tokens.mainnet.WETH;
let token1 = tokens.mainnet.LINK;
let token2 = tokens.mainnet.DAI;

let factory0 = factory.mainnet.Uniswap;
let factory1 = factory.mainnet.Sushiswap;
let factory2 = factory.avax_main.elk;
let router0 = router.mainnet.Uniswap;
let router1 = router.mainnet.Sushiswap;
let router3 = router.avax_main.elk;
let router4 = router.avax_main.pangolin;
//get impersonated accounts;
const Alice_WETHe = '0xc5ed2333f8a2c351fca35e5ebadb2a82f5d254c3'; // for Avalanche WETH token
const Cynthia_WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'; // ETH Mainnet 
// 0.01 ETH
let amount0 = web3.utils.toBN('10000000000000000').toString();
let arb;

// function to execute maxArbitragePossible function and display a log in terminal
async function getMaxArbitragePossible(token0, token1, router0, router1, amount0) {
    const contractFactory = await ethers.getContractFactory("GSRChallenge2PoolArbitrage");
    const contract = await contractFactory.deploy();
    const [signer] = await ethers.getSigners(); 
    const tokenContract0 = new ethers.Contract(token0, tokenContract.abi, signer);
    const tokenContract1 = new ethers.Contract(token1, tokenContract.abi, signer);
    let tokenSymbol0 = await tokenContract0.symbol();
    let tokenSymbol1 = await tokenContract1.symbol();

    try {
        let result = await contract.maxArbitragePossible(token0, token1, router0, router1, amount0);
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

async function getMaxArbitrage3Tokens(token0, token1, token2, router, amount0) {
    const contractFactory = await ethers.getContractFactory("GSRChallenge2PoolArbitrage");
    const contract = await contractFactory.deploy();
    const [signer] = await ethers.getSigners(); 
    const tokenContract0 = new ethers.Contract(token0, tokenContract.abi, signer);
    const tokenContract1 = new ethers.Contract(token1, tokenContract.abi, signer);
    const tokenContract2 = new ethers.Contract(token2, tokenContract.abi, signer);
    let tokenSymbol0 = await tokenContract0.symbol();
    let tokenSymbol1 = await tokenContract1.symbol();
    let tokenSymbol2 = await tokenContract2.symbol();

    try{
        let result = await contract.maxArbitrage3Tokens(token0, token1, token2, router, amount0);
        // let blockNumber = web3.eth.get_block_number();
        if(result[0]>0) {
            console.log(`Arbitrage profit of ${Number(result[0])/1e18} ${tokenSymbol0} exists between ${tokenSymbol0}, ${tokenSymbol1} and ${tokenSymbol2}. Remaining token0 balance of ${Number(result[1])/1e18} after arbitrage.`);
        } else {
            console.log("no arb opportunity");
        }
    } catch (error) {
        console.log(error);
    }
}

// function that execute maxArbitragePossible function, deposit token0 and execute arbitrage, return token balance in the contract and profit
// note that profit could be negative even with positive arbitrage opportunity due to slippage
async function executeArb(token0, token1, router0, router1, signerAdd, amount) {
    await hre.network.provider.request({
      method:"hardhat_impersonateAccount",
      params: [signerAdd],
    });
    const signer = await ethers.getSigner(signerAdd);
    
    const contractFactory = new ethers.ContractFactory(contractABI,contractByteCode, signer);
    const contract = await contractFactory.deploy();

    const tokenContract0 = new ethers.Contract(token0, tokenContract.abi, signer);
    let tokenSymbol0 = await tokenContract0.symbol();

    await getMaxArbitragePossible(token0, token1, router0, router1, amount);
    
    let token0BalBefore;
    let token0BalAfter;
    let profit;
    try {
        await tokenContract0.connect(signer).approve(contract.address, amount, {gasLimit: 30000000});
        tx = await contract.connect(signer)._depositToken(token0, amount, {gasLimit: 30000000});
        await tx.wait(1);
        token0BalBefore = await contract.getTokenBalance(token0);
        console.log(`Initial ${tokenSymbol0} balance of ${Number(token0BalBefore)/1e18} before arb.` )
        result = await contract.connect(signer).executeArb(token0, token1, router0, router1, amount, {gasLimit: 30000000});
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
// getMaxArbitragePossible(token0, token1, router0, router1, amount0);

/* calculate arb between 3 tokens within 1 Dex */
getMaxArbitrage3Tokens(token0, token1, token2, router0, amount0);

/* execute arb between 2 Dexes' liquidity pools */
// executeArb(token0, token1, router0, router1, Alice_WAVAX, amount0);
