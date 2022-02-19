const { expect } = require("chai");
const { ethers, network } = require("hardhat");
const GSRChallenge2PoolArbitrage = require('../artifacts/contracts/GSRChallenge.sol/GSRChallenge2PoolArbitrage.json');
const tokenContract = require('../artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json');
const router = require('../Addresses/router.json');
const factory = require('../Addresses/factory.json');
const tokens = require('../Addresses/tokens.json');

let token0 = tokens.mainnet.WETH;
let token1 = tokens.mainnet.DAI;
let factory0 = factory.mainnet.Uniswap;
let factory1 = factory.mainnet.Sushiswap;
let router0 = router.mainnet.Uniswap;
let router1 = router.mainnet.Sushiswap;

describe("Fork Mainnet", function () {
  it("getPrice2 function should produce a price for token pair", async function () {
    // const impersonatedAddress = '0x514910771AF9Ca656af840dff83E8264EcF986CA'; //for Chainlink token
    // await hre.network.provider.request({
    //   method:"hardhat_impersonateAccount",
    //   params: [impersonatedAddress],
    // });
    // const impersonatedSigner = await ethers.getSigner(impersonatedAddress);

    const contractFactory = await ethers.getContractFactory("GSRChallenge2PoolArbitrage");
    const contract = await contractFactory.deploy();

    const result = await contract._getPrice2(token0,token1, router0);
    console.log(ethers.utils.formatEther(result));
    expect(Number(ethers.utils.formatEther(result))).to.be.above(0);
  });

  it("maxArbitragePossible function should produce 0 or more", async function () {
    // const impersonatedAddress = '0x514910771AF9Ca656af840dff83E8264EcF986CA'; //for Chainlink token
    // await hre.network.provider.request({
    //   method:"hardhat_impersonateAccount",
    //   params: [impersonatedAddress],
    // });
    // const impersonatedSigner = await ethers.getSigner(impersonatedAddress);

    const contractFactory = await ethers.getContractFactory("GSRChallenge2PoolArbitrage");
    const contract = await contractFactory.deploy();
    const [price0, price1] = await contract.maxArbitragePossible(token0,token1, router0, router1);
    console.log(Number(price0)/1e18, Number(price1)/1e18, Math.abs(Number(price0) - Number(price1)) );
    expect(Math.abs(price0 - price1)).to.be.at.least(0);

  });

});
