async function settle(promise) {
  try {
    let value = await promise;
    return { result: 'fulfilled', value };
  } catch(reason) {
    return { result: 'rejected', reason };
  }
}

async function allSettled(values) {
  return Promise.all(values.map(settle));
}

async function fromCallback(initFn) {
  return new Promise((resolve, reject) => {
    initFn((err, ...args) => {
      if (err) reject(err);
      else resolve(args);
    });
  });
}

function arrayRemove(array, element) {
  let index = array.indexOf(element);
  if (index >= 0) array.splice(index, 1);
  return element;
}

function sortBy(key, order = 'ASC') {
  if (order.toUpperCase() === 'ASC') {
    return (a, b) => (a[key] > b[key]) ? 1 : ((b[key] > a[key]) ? -1 : 0);
  } else {
    return (a, b) => (a[key] < b[key]) ? 1 : ((b[key] < a[key]) ? -1 : 0);
  }
}

function deprefixUrl(url, prefix) {
  if (url.indexOf('/') === 0) {
    url = url.substring(1);
  }
  if (url.indexOf(prefix) === 0) {
    url = url.substring(prefix.length);
  }
  if (url.indexOf('/') !== 0) {
    url = `/${url}`;
  }
  return url;
}

function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
    return index == 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/[\s_-]+/g, '');
}

function camelizeProps(object) {
  for (let key of Object.keys(object)) {
    let newKey = camelize(key);
    if (key === newKey) continue;
    object[newKey] = object[key];
    delete object[key];
  }
  return object;
}

function safeRead(obj, selector) {
  if (obj == null) { return null; }
  if (!selector || selector.length === 0) { return obj; }
  if ('string' === typeof selector) { selector = selector.split('.'); }
  return safeRead(obj[selector.shift()], selector);
}

function maybe(value) {
  if (value && value.isMaybe) return value;
  function isEmpty() { return value == null; }
  var obj = {
    prop: function(k) { return isEmpty() ? obj : maybe(safeRead(value, k)); },
    bind: function(f) { return isEmpty() ? obj : maybe(f(value)); },
    value: function (n) { return isEmpty() ? n : value; },
    isEmpty: isEmpty,
    isMaybe: true
  };
  return obj;
}

module.exports = {
  settle,
  allSettled,
  fromCallback,
  arrayRemove,
  deprefixUrl,
  sortBy,
  camelize,
  camelizeProps,
  safeRead,
  maybe
};
