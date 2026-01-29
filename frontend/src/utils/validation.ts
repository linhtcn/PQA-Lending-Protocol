import { parseUnits } from 'viem';
import { TOKEN_DECIMALS } from '../constants';

export function isValidAmount(value: string): boolean {
  if (!value || value.trim() === '') return false;

  // Check for valid number format
  const regex = /^\d*\.?\d*$/;
  if (!regex.test(value)) return false;

  // Check if it's a valid positive number
  const num = parseFloat(value);
  return !isNaN(num) && num > 0 && isFinite(num);
}

export function exceedsMax(amount: bigint, max: bigint): boolean {
  return amount > max;
}

export function safeParseUnits(
  value: string,
  decimals: number = TOKEN_DECIMALS
): bigint | null {
  try {
    if (!isValidAmount(value)) return null;
    return parseUnits(value, decimals);
  } catch {
    return null;
  }
}

export function validateSupply(
  amount: bigint,
  balance: bigint,
  allowance: bigint
): { valid: boolean; error: string | null } {
  if (amount <= 0n) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }
  if (amount > balance) {
    return { valid: false, error: 'Insufficient balance' };
  }
  if (amount > allowance) {
    return { valid: false, error: 'Insufficient allowance. Please approve first.' };
  }
  return { valid: true, error: null };
}

export function validateWithdraw(
  amount: bigint,
  maxWithdraw: bigint
): { valid: boolean; error: string | null } {
  if (amount <= 0n) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }
  if (amount > maxWithdraw) {
    return { valid: false, error: 'Amount exceeds maximum withdrawable' };
  }
  return { valid: true, error: null };
}

export function validateBorrow(
  amount: bigint,
  maxBorrow: bigint,
  poolLiquidity: bigint
): { valid: boolean; error: string | null } {
  if (amount <= 0n) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }
  if (amount > maxBorrow) {
    return { valid: false, error: 'Amount exceeds borrowing limit' };
  }
  if (amount > poolLiquidity) {
    return { valid: false, error: 'Insufficient pool liquidity' };
  }
  return { valid: true, error: null };
}

export function validateRepay(
  amount: bigint,
  borrowed: bigint,
  balance: bigint,
  allowance: bigint
): { valid: boolean; error: string | null } {
  if (amount <= 0n) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }
  if (amount > borrowed) {
    return { valid: false, error: 'Amount exceeds borrowed amount' };
  }
  if (amount > balance) {
    return { valid: false, error: 'Insufficient balance' };
  }
  if (amount > allowance) {
    return { valid: false, error: 'Insufficient allowance. Please approve first.' };
  }
  return { valid: true, error: null };
}
