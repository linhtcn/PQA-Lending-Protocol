const hre = require("hardhat");

async function main() {
  const USD8_ADDRESS = "0x535701e6f5893a9C633b651c3DCC8a06aF21f3f7";
  const WETH_ADDRESS = "0x166cE1F495b7aBD8d13e8898aCF0860d5AE03599";
  const SIMPLE_LENDING_ADDRESS = "0x786bB05b14b972836f48E682c86070Da3E8639d7";

  console.log("Verifying contracts on BSC Testnet...\n");

  console.log("Verifying USD8...");
  try {
    await hre.run("verify:verify", {
      address: USD8_ADDRESS,
      constructorArguments: ["USD8 Stablecoin", "USD8"],
    });
    console.log("USD8 verified!");
  } catch (e) {
    console.log("USD8 verification failed:", e.message);
  }

  console.log("\nVerifying WETH...");
  try {
    await hre.run("verify:verify", {
      address: WETH_ADDRESS,
      constructorArguments: ["Wrapped Ether", "WETH"],
    });
    console.log("WETH verified!");
  } catch (e) {
    console.log("WETH verification failed:", e.message);
  }

  console.log("\nVerifying SimpleLending...");
  try {
    await hre.run("verify:verify", {
      address: SIMPLE_LENDING_ADDRESS,
      constructorArguments: [USD8_ADDRESS],
    });
    console.log("SimpleLending verified!");
  } catch (e) {
    console.log("SimpleLending verification failed:", e.message);
  }

  console.log("\n========================================");
  console.log("Verification complete!");
  console.log("========================================");
  console.log("\nBSCScan Links:");
  console.log(`  USD8:          https://testnet.bscscan.com/address/${USD8_ADDRESS}#code`);
  console.log(`  WETH:          https://testnet.bscscan.com/address/${WETH_ADDRESS}#code`);
  console.log(`  SimpleLending: https://testnet.bscscan.com/address/${SIMPLE_LENDING_ADDRESS}#code`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
