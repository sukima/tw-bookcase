class BadDataError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BadDataError';
    this.code = 'EBADDATA';
  }
}

class DirectoryNotEmptyError extends Error {
  constructor(wikiPath) {
    super(`Directory '${wikiPath}' not empty`);
    this.name = 'DirectoryNotEmptyError';
    this.code = 'EEXIST';
  }
}

class InvalidWikiError extends Error {
  constructor(wikiPath) {
    super(`Invalid TiddlyWiki folder '${wikiPath}'`);
    this.name = 'InvalidWikiError';
    this.code = 'ENOTWIKI';
  }
}

class MissingInstanceError extends Error {
  constructor(wikiPath) {
    super(`Instance '${wikiPath}' does not exist`);
    this.name = 'MissingInstanceError';
    this.code = 'ENOENT';
  }
}

class UniqueInstanceError extends Error {
  constructor(wikiPath) {
    super(`Instance '${wikiPath}' already exists`);
    this.name = 'UniqueInstanceError';
    this.code = 'ENOTUNIQUE';
  }
}

exports.BadDataError = BadDataError;
exports.DirectoryNotEmptyError = DirectoryNotEmptyError;
exports.InvalidWikiError = InvalidWikiError;
exports.MissingInstanceError = MissingInstanceError;
exports.UniqueInstanceError = UniqueInstanceError;
