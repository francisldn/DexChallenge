require('dotenv').config()
const GSRChallenge2PoolArbitrage = require('../artifacts/contracts/GSRChallenge.sol/GSRChallenge2PoolArbitrage.json');
const tokenContract = require('../artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json');
const router = require('../Addresses/router.json');
const factory = require('../Addresses/factory.json');
const tokens = require('../Addresses/tokens.json');
const web3 = require('web3');

let contractABI = GSRChallenge2PoolArbitrage.abi;
let contractByteCode = GSRChallenge2PoolArbitrage.bytecode;
let token0 = tokens.mainnet.WETH;
let token1 = tokens.mainnet.POOL;
let factory0 = factory.mainnet.Uniswap;
let factory1 = factory.mainnet.Sushiswap;
let router0 = router.mainnet.Uniswap;
let router1 = router.mainnet.Sushiswap;
//get an impersonated accounts;
const Bob_BAT = '0xd265a63806064885acb25e99ccbb76a3e7c96f4f'; //for BAT
const Alice_DAI = '0x6B175474E89094C44Da98b954EedeAC495271d0F'; // for DAI token
const Cynthia_WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
// 1 ETH
let amount0 = web3.utils.toBN('1000000000000000000').toString();
let arb;

async function getMaxArbitragePossible(token0, token1, router0, router1) {
    const contractFactory = await ethers.getContractFactory("GSRChallenge2PoolArbitrage");
    const contract = await contractFactory.deploy();
    const [signer] = await ethers.getSigners(); 
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
        await tokenContract0.connect(signer).approve(contract.address, amount);
        await contract.connect(signer)._depositToken(token0, amount)
        token0BalBefore = await contract.getTokenBalance(token0);
        console.log(`Initial ${tokenSymbol0} balance of ${Number(token0BalBefore)/1e18} before arb.` )
        result = await contract.connect(signer).executeArb(token0, token1, router0, router1, amount);
        await result.wait(1);
        
        token0BalAfter = await contract.getTokenBalance(token0);
        profit = Number(token0BalAfter)/1e18 - Number(token0BalBefore)/1e18; 

        console.log(`You have a ${tokenSymbol0} balance of ${(Number(token0BalAfter)/1e18).toFixed(4)} after executing arb.` )
        console.log(`You have made ${profit.toFixed(4)} in profit.`)

    } catch (error) {
        console.log(error);
    }
        
}

getMaxArbitragePossible(token0, token1, router0, router1);
// executeArb(token0, token1, router0, router1, Cynthia_WETH, amount0);
