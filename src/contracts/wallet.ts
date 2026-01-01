/**
 * Wallet Transaction Status - Frontend contract
 */
export enum ApiTransactionStatus {
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  FAILED = 'Failed',
}

/**
 * Wallet Transaction Status - DB enum
 */
export enum DbTransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

/**
 * Wallet Transaction Type - Frontend contract
 */
export enum ApiTransactionType {
  DEPOSIT = 'Deposit',
  RELEASE = 'Release',
  SUBSCRIPTION = 'Subscription',
  WITHDRAWAL = 'Withdrawal',
  TRANSFER = 'Transfer',
}

/**
 * Wallet Transaction Type - DB enum
 */
export enum DbTransactionType {
  DEPOSIT = 'DEPOSIT',
  RELEASE = 'RELEASE',
  SUBSCRIPTION = 'SUBSCRIPTION',
  WITHDRAWAL = 'WITHDRAWAL',
  TRANSFER = 'TRANSFER',
}

