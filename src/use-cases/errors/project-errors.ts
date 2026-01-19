export class ProjectNameAlreadyExistsError extends Error {
  constructor() {
    super('A project with this name already exists in your company');
  }
}
export class InvalidDateRangeError extends Error {
  constructor() {
    super('Start date must be before end date');
  }
}

export class InvalidColorFormatError extends Error {
  constructor() {
    super('Color must be in hex format (#RRGGBB)');
  }
}
