export class StickyNotFoundError extends Error {
  constructor() {
    super('Sticky not found');
  }
}

export class StickyNotOwnedError extends Error {
  constructor() {
    super('You do not have permission to modify this sticky');
  }
}

export class InvalidStickyColorError extends Error {
  constructor() {
    super('Invalid sticky color');
  }
}

export class EmptyStickyContentError extends Error {
  constructor() {
    super('Sticky content cannot be empty');
  }
}
