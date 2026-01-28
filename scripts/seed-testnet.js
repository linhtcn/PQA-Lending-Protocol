const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Addresses to seed on the testnet.
 *
 * TODO: Replace these example addresses with the real wallet addresses
 * you want to fund (e.g. your different MetaMask accounts).
 */
const ADDRESSES_TO_SEED = [
  "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
  "0xAF6e4423787c75602C1da70380208C0Eb5da7820",
  // "0xYourAddress1...",
  // "0xYourAddress2...",
];

// How many tokens to send to each address (in whole tokens, not wei)
const SEED_AMOUNT = "10000";

async function main() {
  if (ADDRESSES_TO_SEED.length === 0) {
    console.log("No addresses configured in ADDRESSES_TO_SEED. Please add some and retry.");
    return;
  }

  const [deployer] = await hre.ethers.getSigners();
  const network = await hre.ethers.provider.getNetwork();

  console.log("Starting testnet seeding...\n");
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Network: ${hre.network.name} (chainId: ${network.chainId})\n`);

  // Read deployment info (contract addresses) from the frontend file
  const deploymentsPath = path.join(
    __dirname,
    "../frontend/src/contracts/deployments.json"
  );

  if (!fs.existsSync(deploymentsPath)) {
    throw new Error(
      `deployments.json not found at ${deploymentsPath}. Run the deploy script first.`
    );
  }

  const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf-8"));

  if (!deployments.contracts?.USD8 || !deployments.contracts?.WETH) {
    throw new Error(
      "deployments.json does not contain USD8 or WETH addresses. Make sure deploy-testnet.js has been run successfully."
    );
  }

  const usd8Address = deployments.contracts.USD8;
  const wethAddress = deployments.contracts.WETH;

  console.log("Using contract addresses from deployments.json:");
  console.log(`  USD8: ${usd8Address}`);
  console.log(`  WETH: ${wethAddress}\n`);

  const usd8 = await hre.ethers.getContractAt("TestToken", usd8Address);
  const weth = await hre.ethers.getContractAt("TestToken", wethAddress);

  const amount = hre.ethers.parseUnits(SEED_AMOUNT, 18);

  console.log(
    `Seeding ${ADDRESSES_TO_SEED.length} address(es) with ${SEED_AMOUNT} USD8 and ${SEED_AMOUNT} WETH each...\n`
  );

  for (const recipient of ADDRESSES_TO_SEED) {
    console.log(`Seeding ${recipient}...`);

    const usd8Tx = await usd8.transfer(recipient, amount);
    await usd8Tx.wait();
    console.log(`  -> Sent ${SEED_AMOUNT} USD8`);

    const wethTx = await weth.transfer(recipient, amount);
    await wethTx.wait();
    console.log(`  -> Sent ${SEED_AMOUNT} WETH\n`);
  }

  console.log("Seeding complete.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

