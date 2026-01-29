const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting deployment to BSC Testnet...\n");

  // Verify we're on BSC testnet
  const network = await hre.ethers.provider.getNetwork();
  if (network.chainId !== 97n) {
    throw new Error(`Expected BSC Testnet (chainId 97), but got chainId ${network.chainId}`);
  }

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  // Check deployer balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", hre.ethers.formatEther(balance), "BNB\n");

  if (balance === 0n) {
    throw new Error("Deployer has no BNB. Get testnet BNB from https://testnet.bnbchain.org/faucet-smart");
  }

  // Deploy USD8 token
  console.log("Deploying USD8 token...");
  const TestToken = await hre.ethers.getContractFactory("TestToken");
  const usd8 = await TestToken.deploy("USD8 Stablecoin", "USD8");
  await usd8.waitForDeployment();
  const usd8Address = await usd8.getAddress();
  console.log("USD8 deployed to:", usd8Address);

  // Deploy WETH token
  console.log("\nDeploying WETH token...");
  const weth = await TestToken.deploy("Wrapped Ether", "WETH");
  await weth.waitForDeployment();
  const wethAddress = await weth.getAddress();
  console.log("WETH deployed to:", wethAddress);

  // Deploy SimpleLending with USD8 as the lending token
  console.log("\nDeploying SimpleLending contract...");
  const SimpleLending = await hre.ethers.getContractFactory("SimpleLending");
  const simpleLending = await SimpleLending.deploy(usd8Address);
  await simpleLending.waitForDeployment();
  const simpleLendingAddress = await simpleLending.getAddress();
  console.log("SimpleLending deployed to:", simpleLendingAddress);

  // Export ABIs
  console.log("\nExporting ABIs...");
  const abiDir = path.join(__dirname, "../frontend/src/abis");

  if (!fs.existsSync(abiDir)) {
    fs.mkdirSync(abiDir, { recursive: true });
  }

  const testTokenArtifact = await hre.artifacts.readArtifact("TestToken");
  const simpleLendingArtifact = await hre.artifacts.readArtifact("SimpleLending");

  fs.writeFileSync(
    path.join(abiDir, "TestToken.json"),
    JSON.stringify(testTokenArtifact.abi, null, 2)
  );
  fs.writeFileSync(
    path.join(abiDir, "SimpleLending.json"),
    JSON.stringify(simpleLendingArtifact.abi, null, 2)
  );
  console.log("ABIs exported to frontend/src/abis/");

  // Export deployment addresses
  console.log("\nExporting deployment addresses...");
  const contractsDir = path.join(__dirname, "../frontend/src/contracts");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  const deployments = {
    network: "bscTestnet",
    chainId: 97,
    contracts: {
      USD8: usd8Address,
      WETH: wethAddress,
      SimpleLending: simpleLendingAddress,
    },
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(contractsDir, "deployments.json"),
    JSON.stringify(deployments, null, 2)
  );
  console.log("Deployment addresses exported to frontend/src/contracts/deployments.json");

  // Summary
  console.log("\n========================================");
  console.log("Deployment Summary - BSC Testnet");
  console.log("========================================");
  console.log("Network: BSC Testnet (chainId: 97)");
  console.log("\nContract Addresses:");
  console.log(`  USD8:          ${usd8Address}`);
  console.log(`  WETH:          ${wethAddress}`);
  console.log(`  SimpleLending: ${simpleLendingAddress}`);
  console.log("\nBSCScan Links:");
  console.log(`  USD8:          https://testnet.bscscan.com/address/${usd8Address}`);
  console.log(`  WETH:          https://testnet.bscscan.com/address/${wethAddress}`);
  console.log(`  SimpleLending: https://testnet.bscscan.com/address/${simpleLendingAddress}`);
  console.log("\nVerify contracts with:");
  console.log(`  npx hardhat verify --network bscTestnet ${usd8Address} "USD8 Stablecoin" "USD8"`);
  console.log(`  npx hardhat verify --network bscTestnet ${wethAddress} "Wrapped Ether" "WETH"`);
  console.log(`  npx hardhat verify --network bscTestnet ${simpleLendingAddress} ${usd8Address}`);
  console.log("========================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
