const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting deployment...\n");

  const [deployer, ...testAccounts] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  // Deploy USD8 token
  console.log("\nDeploying USD8 token...");
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

  // Seed test accounts with 10,000 tokens each
  const seedAmount = hre.ethers.parseUnits("10000", 18);
  console.log("\nSeeding test accounts with 10,000 tokens each...");

  // Get Hardhat's default test accounts (first 10)
  const accountsToSeed = testAccounts.slice(0, 9); // accounts 1-9 (deployer is 0)

  for (let i = 0; i < accountsToSeed.length; i++) {
    const account = accountsToSeed[i];
    // Transfer USD8
    await usd8.transfer(account.address, seedAmount);
    // Transfer WETH
    await weth.transfer(account.address, seedAmount);
    console.log(`Seeded account ${i + 1}: ${account.address}`);
  }

  // Also keep some tokens for deployer for testing
  console.log(`Deployer retains remaining tokens`);

  // Export ABIs
  console.log("\nExporting ABIs...");
  const abiDir = path.join(__dirname, "../frontend/src/abis");

  // Ensure directory exists
  if (!fs.existsSync(abiDir)) {
    fs.mkdirSync(abiDir, { recursive: true });
  }

  // Get contract artifacts
  const testTokenArtifact = await hre.artifacts.readArtifact("TestToken");
  const simpleLendingArtifact = await hre.artifacts.readArtifact("SimpleLending");

  // Write ABIs
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
    network: "localhost",
    chainId: 31337,
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
  console.log("Deployment Summary");
  console.log("========================================");
  console.log("Network: localhost (chainId: 31337)");
  console.log("\nContract Addresses:");
  console.log(`  USD8:          ${usd8Address}`);
  console.log(`  WETH:          ${wethAddress}`);
  console.log(`  SimpleLending: ${simpleLendingAddress}`);
  console.log("\nTest Accounts Seeded: 9 accounts with 10,000 USD8 and 10,000 WETH each");
  console.log("\nHardhat Default Test Account Private Keys:");
  console.log("  Account #0: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
  console.log("  Account #1: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d");
  console.log("  Account #2: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a");
  console.log("========================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
