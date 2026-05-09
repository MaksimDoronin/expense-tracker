export class CategoryNotFoundError extends Error {
  constructor() {
    super('Category not found');
    this.name = 'CategoryNotFoundError';
  }
}

export class CategoryNameTakenError extends Error {
  constructor() {
    super('Category with this name already exists');
    this.name = 'CategoryNameTakenError';
  }
}

export class OwnerNotFoundError extends Error {
  constructor() {
    super('User not found');
    this.name = 'OwnerNotFoundError';
  }
}
