export class QuickLinkAlreadyExistsError extends Error {
  constructor() {
    super('Quick link with this URL already exists for this user');
  }
}

export class QuickLinkNotFoundError extends Error {
  constructor() {
    super('Quick link not found');
  }
}

export class QuickLinkNotOwnedError extends Error {
  constructor() {
    super('You do not have permission to modify this quick link');
  }
}

export class InvalidUrlError extends Error {
  constructor() {
    super('Invalid URL format');
  }
}
