const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleLending Integration Tests", function () {
  let token;
  let lending;
  let owner;
  let user1;
  let user2;

  const INITIAL_SUPPLY = ethers.parseEther("1000000");
  const SUPPLY_AMOUNT = ethers.parseEther("1000");
  const BORROW_AMOUNT = ethers.parseEther("500"); // 50% of supply, within 75% LTV

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy TestToken
    const TestToken = await ethers.getContractFactory("TestToken");
    token = await TestToken.deploy("Test Token", "TST");
    await token.waitForDeployment();

    // Deploy SimpleLending
    const SimpleLending = await ethers.getContractFactory("SimpleLending");
    lending = await SimpleLending.deploy(await token.getAddress());
    await lending.waitForDeployment();

    // Transfer tokens to users for testing
    await token.transfer(user1.address, ethers.parseEther("10000"));
    await token.transfer(user2.address, ethers.parseEther("10000"));
  });

  describe("Integration Test 1: Full Lending Cycle", function () {
    it("should complete a full supply -> borrow -> repay -> withdraw cycle", async function () {
      const lendingAddress = await lending.getAddress();

      // Step 1: User1 approves and supplies tokens
      await token.connect(user1).approve(lendingAddress, SUPPLY_AMOUNT);
      await lending.connect(user1).supply(SUPPLY_AMOUNT);

      // Verify supply
      let [supplied, borrowed, , healthFactor] = await lending.getUserPosition(user1.address);
      expect(supplied).to.equal(SUPPLY_AMOUNT);
      expect(borrowed).to.equal(0);
      expect(healthFactor).to.equal(ethers.MaxUint256); // Max uint when no borrows

      // Verify pool state
      let poolInfo = await lending.getPoolInfo();
      expect(poolInfo._totalSupply).to.equal(SUPPLY_AMOUNT);
      expect(poolInfo._totalBorrow).to.equal(0);

      // Step 2: User1 borrows against their collateral
      await lending.connect(user1).borrow(BORROW_AMOUNT);

      // Verify borrow
      [supplied, borrowed, , healthFactor] = await lending.getUserPosition(user1.address);
      expect(supplied).to.equal(SUPPLY_AMOUNT);
      expect(borrowed).to.equal(BORROW_AMOUNT);
      expect(healthFactor).to.be.lt(ethers.MaxUint256);

      // Verify user received borrowed tokens
      const user1Balance = await token.balanceOf(user1.address);
      expect(user1Balance).to.equal(
        ethers.parseEther("10000") - SUPPLY_AMOUNT + BORROW_AMOUNT
      );

      // Verify pool state updated
      poolInfo = await lending.getPoolInfo();
      expect(poolInfo._totalBorrow).to.equal(BORROW_AMOUNT);
      expect(poolInfo._utilizationRate).to.equal(50n); // 500/1000 = 50%

      // Step 3: User1 repays the borrow
      await token.connect(user1).approve(lendingAddress, BORROW_AMOUNT);
      await lending.connect(user1).repay(BORROW_AMOUNT);

      // Verify repayment
      [supplied, borrowed, , healthFactor] = await lending.getUserPosition(user1.address);
      expect(supplied).to.equal(SUPPLY_AMOUNT);
      expect(borrowed).to.equal(0);
      expect(healthFactor).to.equal(ethers.MaxUint256);

      // Verify pool state
      poolInfo = await lending.getPoolInfo();
      expect(poolInfo._totalBorrow).to.equal(0);
      expect(poolInfo._utilizationRate).to.equal(0);

      // Step 4: User1 withdraws their supply
      await lending.connect(user1).withdraw(SUPPLY_AMOUNT);

      // Verify withdrawal
      [supplied, borrowed, ,] = await lending.getUserPosition(user1.address);
      expect(supplied).to.equal(0);
      expect(borrowed).to.equal(0);

      // Verify user got their tokens back
      const finalBalance = await token.balanceOf(user1.address);
      expect(finalBalance).to.equal(ethers.parseEther("10000"));

      // Verify pool is empty
      poolInfo = await lending.getPoolInfo();
      expect(poolInfo._totalSupply).to.equal(0);
    });

    it("should emit correct events throughout the lending cycle", async function () {
      const lendingAddress = await lending.getAddress();
      await token.connect(user1).approve(lendingAddress, SUPPLY_AMOUNT);

      // Check Supplied event
      const supplyTx = await lending.connect(user1).supply(SUPPLY_AMOUNT);
      const supplyReceipt = await supplyTx.wait();
      const supplyBlock = await ethers.provider.getBlock(supplyReceipt.blockNumber);
      await expect(supplyTx)
        .to.emit(lending, "Supplied")
        .withArgs(user1.address, SUPPLY_AMOUNT, supplyBlock.timestamp);

      // Check Borrowed event
      const borrowTx = await lending.connect(user1).borrow(BORROW_AMOUNT);
      const borrowReceipt = await borrowTx.wait();
      const borrowBlock = await ethers.provider.getBlock(borrowReceipt.blockNumber);
      await expect(borrowTx)
        .to.emit(lending, "Borrowed")
        .withArgs(user1.address, BORROW_AMOUNT, borrowBlock.timestamp);

      // Check Repaid event
      await token.connect(user1).approve(lendingAddress, BORROW_AMOUNT);
      const repayTx = await lending.connect(user1).repay(BORROW_AMOUNT);
      const repayReceipt = await repayTx.wait();
      const repayBlock = await ethers.provider.getBlock(repayReceipt.blockNumber);
      await expect(repayTx)
        .to.emit(lending, "Repaid")
        .withArgs(user1.address, BORROW_AMOUNT, repayBlock.timestamp);

      // Check Withdrawn event
      const withdrawTx = await lending.connect(user1).withdraw(SUPPLY_AMOUNT);
      const withdrawReceipt = await withdrawTx.wait();
      const withdrawBlock = await ethers.provider.getBlock(withdrawReceipt.blockNumber);
      await expect(withdrawTx)
        .to.emit(lending, "Withdrawn")
        .withArgs(user1.address, SUPPLY_AMOUNT, withdrawBlock.timestamp);
    });
  });

  describe("Integration Test 2: Multi-User Interaction", function () {
    it("should handle multiple users supplying and borrowing correctly", async function () {
      const lendingAddress = await lending.getAddress();
      const user1Supply = ethers.parseEther("2000");
      const user2Supply = ethers.parseEther("3000");
      const user1Borrow = ethers.parseEther("1000"); // 50% of user1's supply
      const user2Borrow = ethers.parseEther("1500"); // 50% of user2's supply

      // User1 supplies
      await token.connect(user1).approve(lendingAddress, user1Supply);
      await lending.connect(user1).supply(user1Supply);

      // User2 supplies
      await token.connect(user2).approve(lendingAddress, user2Supply);
      await lending.connect(user2).supply(user2Supply);

      // Verify total supply
      let poolInfo = await lending.getPoolInfo();
      expect(poolInfo._totalSupply).to.equal(user1Supply + user2Supply);

      // User1 borrows
      await lending.connect(user1).borrow(user1Borrow);

      // User2 borrows
      await lending.connect(user2).borrow(user2Borrow);

      // Verify total borrow and utilization
      poolInfo = await lending.getPoolInfo();
      expect(poolInfo._totalBorrow).to.equal(user1Borrow + user2Borrow);

      // Utilization = (2500 / 5000) * 100 = 50%
      expect(poolInfo._utilizationRate).to.equal(50n);

      // Verify each user's position independently
      const [user1Supplied, user1Borrowed] = await lending.getUserPosition(user1.address);
      expect(user1Supplied).to.equal(user1Supply);
      expect(user1Borrowed).to.equal(user1Borrow);

      const [user2Supplied, user2Borrowed] = await lending.getUserPosition(user2.address);
      expect(user2Supplied).to.equal(user2Supply);
      expect(user2Borrowed).to.equal(user2Borrow);

      // Verify max withdraw calculations
      const user1MaxWithdraw = await lending.calculateMaxWithdraw(user1.address);
      const user2MaxWithdraw = await lending.calculateMaxWithdraw(user2.address);

      // User1: supplied 2000, borrowed 1000. Min required = 1000 * 100 / 75 = 1333.33
      // Max withdraw = 2000 - 1333.33 = 666.66
      expect(user1MaxWithdraw).to.be.closeTo(
        ethers.parseEther("666.666666666666666666"),
        ethers.parseEther("1")
      );

      // User2: supplied 3000, borrowed 1500. Min required = 1500 * 100 / 75 = 2000
      // Max withdraw = 3000 - 2000 = 1000
      expect(user2MaxWithdraw).to.equal(ethers.parseEther("1000"));
    });

    it("should update interest rates based on pool utilization", async function () {
      const lendingAddress = await lending.getAddress();

      // Initial rates (no utilization)
      let poolInfo = await lending.getPoolInfo();
      expect(poolInfo._supplyRate).to.equal(2n); // BASE_RATE
      expect(poolInfo._borrowRate).to.equal(4n); // BASE_RATE + 2

      // User1 supplies
      await token.connect(user1).approve(lendingAddress, SUPPLY_AMOUNT);
      await lending.connect(user1).supply(SUPPLY_AMOUNT);

      // Rates should still be base since no borrows
      poolInfo = await lending.getPoolInfo();
      expect(poolInfo._utilizationRate).to.equal(0);
      expect(poolInfo._supplyRate).to.equal(2n);
      expect(poolInfo._borrowRate).to.equal(4n);

      // User1 borrows 50% of supply
      await lending.connect(user1).borrow(BORROW_AMOUNT);

      // Verify rates increased with 50% utilization
      poolInfo = await lending.getPoolInfo();
      expect(poolInfo._utilizationRate).to.equal(50n);
      // supplyRate = BASE_RATE + (utilization / 10) = 2 + 5 = 7
      expect(poolInfo._supplyRate).to.equal(7n);
      // borrowRate = BASE_RATE + 2 + (utilization / 5) = 2 + 2 + 10 = 14
      expect(poolInfo._borrowRate).to.equal(14n);

      // User2 supplies more, reducing utilization
      await token.connect(user2).approve(lendingAddress, SUPPLY_AMOUNT);
      await lending.connect(user2).supply(SUPPLY_AMOUNT);

      // Utilization = 500 / 2000 = 25%
      poolInfo = await lending.getPoolInfo();
      expect(poolInfo._utilizationRate).to.equal(25n);
      // supplyRate = 2 + (25 / 10) = 2 + 2 = 4
      expect(poolInfo._supplyRate).to.equal(4n);
      // borrowRate = 2 + 2 + (25 / 5) = 4 + 5 = 9
      expect(poolInfo._borrowRate).to.equal(9n);
    });

    it("should prevent unhealthy withdrawals when users have borrows", async function () {
      const lendingAddress = await lending.getAddress();

      // User1 supplies and borrows max allowed (75% LTV)
      await token.connect(user1).approve(lendingAddress, SUPPLY_AMOUNT);
      await lending.connect(user1).supply(SUPPLY_AMOUNT);

      const maxBorrow = await lending.calculateMaxBorrow(user1.address);
      expect(maxBorrow).to.equal(ethers.parseEther("750")); // 75% of 1000

      await lending.connect(user1).borrow(maxBorrow);

      // User1 should not be able to withdraw anything
      const maxWithdraw = await lending.calculateMaxWithdraw(user1.address);
      expect(maxWithdraw).to.equal(0);

      // Attempting to withdraw should fail
      await expect(
        lending.connect(user1).withdraw(ethers.parseEther("1"))
      ).to.be.revertedWith("Withdrawal would make position unhealthy");

      // User1 repays some debt
      const partialRepay = ethers.parseEther("375"); // Half of borrow
      await token.connect(user1).approve(lendingAddress, partialRepay);
      await lending.connect(user1).repay(partialRepay);

      // Now user1 should be able to withdraw some
      const newMaxWithdraw = await lending.calculateMaxWithdraw(user1.address);
      expect(newMaxWithdraw).to.be.gt(0);

      // Withdraw the max allowed amount
      await lending.connect(user1).withdraw(newMaxWithdraw);

      // Verify position is at the edge but healthy
      const [supplied, borrowed] = await lending.getUserPosition(user1.address);
      const effectiveLTV = (borrowed * 100n) / supplied;
      expect(effectiveLTV).to.be.lte(75n);
    });
  });

});
