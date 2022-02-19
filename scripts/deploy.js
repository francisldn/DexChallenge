const GSRChallenge2PoolArbitrage = require('../artifacts/contracts/GSRChallenge.sol/GSRChallenge2PoolArbitrage.json');
const { ethers } = require('hardhat');

const contractABI = GSRChallenge2PoolArbitrage.abi;

async function deploy() {
  const [deployer] = await ethers.getSigners();
  const chainId = await deployer.getChainId();

  const Arbitrage = await ethers.getContractFactory("GSRChallenge2PoolArbitrage");
  const arbitrage = await Arbitrage.deploy();
  await arbitrage.deployed();
  let chainNetwork;
  if(chainId === 1) {
    chainNetwork = 'mainnet'
  } else if (chainId === 4) {
    chainNetwork = 'rinkeby'
  } else if (chainId === 31337) {
    chainNetwork = 'local'
  }
  console.log(`Successfully deployed to ${chainNetwork} network with address ${arbitrage.address}`); 
}

deploy()

