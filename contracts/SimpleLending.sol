// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

contract SimpleLending {
    IERC20 public token;

    // Market state
    uint256 public totalSupply;
    uint256 public totalBorrow;
    uint256 public utilizationRate;
    uint256 public supplyRate;
    uint256 public borrowRate;

    // User positions
    struct UserPosition {
        uint256 supplied;
        uint256 borrowed;
        uint256 collateralValue;
        uint256 healthFactor;
    }

    mapping(address => UserPosition) public positions;
    mapping(address => uint256) public userSupply;
    mapping(address => uint256) public userBorrow;

    // Constants
    uint256 public constant LTV_RATIO = 75; // 75%
    uint256 public constant LIQUIDATION_THRESHOLD = 80; // 80%
    uint256 public constant BASE_RATE = 2; // 2% base
    uint256 public constant UTILIZATION_MULTIPLIER = 20; // Additional rate based on utilization

    event Supplied(address indexed user, uint256 amount, uint256 timestamp);
    event Withdrawn(address indexed user, uint256 amount, uint256 timestamp);
    event Borrowed(address indexed user, uint256 amount, uint256 timestamp);
    event Repaid(address indexed user, uint256 amount, uint256 timestamp);

    constructor(address _token) {
        token = IERC20(_token);
        supplyRate = BASE_RATE;
        borrowRate = BASE_RATE + 2; // Borrow rate is higher
    }

    // Supply tokens to the protocol
    function supply(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        userSupply[msg.sender] += amount;
        totalSupply += amount;
        updateRates();
        updateUserPosition(msg.sender);
        emit Supplied(msg.sender, amount, block.timestamp);
    }

    // Withdraw supplied tokens
    function withdraw(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(userSupply[msg.sender] >= amount, "Insufficient supply");
        // Check health factor after withdrawal
        uint256 newSupply = userSupply[msg.sender] - amount;
        uint256 borrow = userBorrow[msg.sender];
        uint256 maxBorrow = (newSupply * LTV_RATIO) / 100;
        require(borrow <= maxBorrow, "Withdrawal would make position unhealthy");
        userSupply[msg.sender] = newSupply;
        totalSupply -= amount;
        require(token.transfer(msg.sender, amount), "Transfer failed");
        updateRates();
        updateUserPosition(msg.sender);
        emit Withdrawn(msg.sender, amount, block.timestamp);
    }

    // Borrow tokens
    function borrow(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(token.balanceOf(address(this)) >= amount, "Insufficient liquidity");
        // Check borrowing capacity
        uint256 maxBorrow = (userSupply[msg.sender] * LTV_RATIO) / 100;
        require(userBorrow[msg.sender] + amount <= maxBorrow, "Exceeds borrowing limit");
        userBorrow[msg.sender] += amount;
        totalBorrow += amount;
        require(token.transfer(msg.sender, amount), "Transfer failed");
        updateRates();
        updateUserPosition(msg.sender);
        emit Borrowed(msg.sender, amount, block.timestamp);
    }

    // Repay borrowed tokens
    function repay(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(userBorrow[msg.sender] >= amount, "Amount exceeds borrow");
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        userBorrow[msg.sender] -= amount;
        totalBorrow -= amount;
        updateRates();
        updateUserPosition(msg.sender);
        emit Repaid(msg.sender, amount, block.timestamp);
    }

    // Update interest rates based on utilization
    function updateRates() internal {
        if (totalSupply == 0) {
            utilizationRate = 0;
            supplyRate = BASE_RATE;
            borrowRate = BASE_RATE + 2;
        } else {
            utilizationRate = (totalBorrow * 100) / totalSupply;
            supplyRate = BASE_RATE + (utilizationRate / 10);
            borrowRate = BASE_RATE + 2 + (utilizationRate / 5);
        }
    }

    // Update user's position and health factor
    function updateUserPosition(address user) internal {
        uint256 supplied = userSupply[user];
        uint256 borrowed = userBorrow[user];
        uint256 collateralValue = supplied;
        uint256 healthFactor;

        if (borrowed == 0) {
            healthFactor = type(uint256).max; // Infinite health
        } else {
            uint256 maxBorrowable = (supplied * LTV_RATIO) / 100;
            healthFactor = (maxBorrowable * 100) / borrowed;
        }

        positions[user] = UserPosition({
            supplied: supplied,
            borrowed: borrowed,
            collateralValue: collateralValue,
            healthFactor: healthFactor
        });
    }

    // View functions
    function getUserPosition(address user) external view returns (
        uint256 supplied,
        uint256 borrowed,
        uint256 collateralValue,
        uint256 healthFactor
    ) {
        UserPosition memory position = positions[user];
        return (
            position.supplied,
            position.borrowed,
            position.collateralValue,
            position.healthFactor
        );
    }

    function getPoolInfo() external view returns (
        uint256 _totalSupply,
        uint256 _totalBorrow,
        uint256 _utilizationRate,
        uint256 _supplyRate,
        uint256 _borrowRate
    ) {
        return (
            totalSupply,
            totalBorrow,
            utilizationRate,
            supplyRate,
            borrowRate
        );
    }

    function calculateMaxWithdraw(address user) external view returns (uint256) {
        uint256 supplied = userSupply[user];
        uint256 borrowed = userBorrow[user];
        if (borrowed == 0) return supplied;
        // Calculate maximum withdrawable amount while keeping health factor > 100%
        uint256 minRequiredSupply = (borrowed * 100) / LTV_RATIO;
        if (supplied <= minRequiredSupply) return 0;
        return supplied - minRequiredSupply;
    }

    function calculateMaxBorrow(address user) external view returns (uint256) {
        uint256 supplied = userSupply[user];
        uint256 borrowed = userBorrow[user];
        uint256 maxBorrowable = (supplied * LTV_RATIO) / 100;
        if (borrowed >= maxBorrowable) return 0;
        return maxBorrowable - borrowed;
    }
}
