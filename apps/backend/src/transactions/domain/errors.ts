export class TransactionNotFoundError extends Error {
  constructor() {
    super('Transaction not found');
    this.name = 'TransactionNotFoundError';
  }
}

export class CategoryNotFoundForTransactionError extends Error {
  constructor() {
    super('Category not found or does not belong to user');
    this.name = 'CategoryNotFoundForTransactionError';
  }
}

export class OwnerNotFoundError extends Error {
  constructor() {
    super('User not found');
    this.name = 'OwnerNotFoundError';
  }
}
