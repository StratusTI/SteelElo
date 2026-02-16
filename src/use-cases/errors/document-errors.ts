export class DocumentNotFoundError extends Error {
  constructor() {
    super('Document not found');
  }
}

export class DocumentNotOwnedError extends Error {
  constructor() {
    super('You do not have permission to modify this document');
  }
}

export class DocumentForbiddenError extends Error {
  constructor() {
    super('You do not have permission to access this document');
  }
}

export class InvalidDocumentStatusError extends Error {
  constructor() {
    super('Invalid document status');
  }
}

export class DocumentAlreadyArchivedError extends Error {
  constructor() {
    super('Document is already archived');
  }
}

export class DocumentCircularReferenceError extends Error {
  constructor() {
    super('Cannot set parent: circular reference detected');
  }
}
