async function settle(promise) {
  try {
    let value = await promise;
    return { result: 'fulfilled', value };
  } catch(reason) {
    return { result: 'rejected', reason };
  }
}

exports.allSettled = async function allSettled(values) {
  return Promise.all(values.map(settle));
};

exports.fromCallback = async function fromCallback(initFn) {
  return new Promise((resolve, reject) => {
    initFn((err, ...args) => {
      if (err) reject(err);
      else resolve(args);
    });
  });
};

exports.slugify = function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9_-+]/g, '-')
    .replace(/-{2,}/g, '-');
};
