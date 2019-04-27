const path = require('path');
const makeSlug = require('slug');

const BASE_OFFSET = 1;

class SlugFinder {
  constructor(knownSlugs) {
    this.knownSlugs = knownSlugs || [];
  }

  uniqueSlugForPath(dirPath) {
    let offset = BASE_OFFSET;
    let slug = makeSlug(path.basename(dirPath));
    let possibleSlug = slug;
    while (this.knownSlugs.includes(possibleSlug)) {
      possibleSlug = `${slug}-${offset}`;
    }
    return possibleSlug;
  }
}

module.exports = SlugFinder;
