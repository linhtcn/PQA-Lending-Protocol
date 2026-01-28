const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting testnet deployment...\n");

  const [deployer, ...rest] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  const network = await hre.ethers.provider.getNetwork();
  const networkName = hre.network.name;
  console.log(`Network: ${networkName} (chainId: ${network.chainId})\n`);

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

  // Optional seeding (will effectively be skipped on real public testnets)
  const testAccounts = rest;
  const accountsToSeed = testAccounts.slice(0, 9);
  if (accountsToSeed.length > 0) {
    const seedAmount = hre.ethers.parseUnits("10000", 18);
    console.log("\nSeeding test accounts with 10,000 tokens each...");
    for (let i = 0; i < accountsToSeed.length; i++) {
      const account = accountsToSeed[i];
      await usd8.transfer(account.address, seedAmount);
      await weth.transfer(account.address, seedAmount);
      console.log(`Seeded account ${i + 1}: ${account.address}`);
    }
  }

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
    network: networkName,
    chainId: Number(network.chainId),
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

  console.log("\n========================================");
  console.log("Testnet Deployment Summary");
  console.log("========================================");
  console.log(`Network: ${networkName} (chainId: ${network.chainId})`);
  console.log("\nContract Addresses:");
  console.log(`  USD8:          ${usd8Address}`);
  console.log(`  WETH:          ${wethAddress}`);
  console.log(`  SimpleLending: ${simpleLendingAddress}`);
  console.log("========================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

