/*\
title: $:/plugins/tw-bookcase/bookcase-data.js
type: application/javascript
module-type: library

CRUD functions for manage server side data

\*/
(function() {
"use strict";

var Net = require('$:/plugins/tw-bookcase/bookcase-net.js');

function deserializeError(payload) {
  var data;
  try {
    data = JSON.parse(payload);
  } catch(error) {
    return {
      code: 0,
      status: error.name,
      message: error.message,
      payload: payload
    };
  }
  return data.errors[0];
}

function deserializeResource(resource) {
  var attrs = resource.attributes;
  attrs.id = resource.id;
  return attrs;
}

function deserializeData(payload) {
  if (!payload) return;
  var json = JSON.parse(payload);
  if ($tw.utils.isArray(json.data)) {
    var data = {};
    data.meta = json.meta;
    $tw.utils.each(json.data, function(entry) {
      var key = entry.type;
      var attrs = deserializeResource(entry);
      if (!data[key]) { data[key] = []; }
      data[key].push(attrs);
    });
    return data;
  } else {
    return deserializeResource(json.data);
  }
}

function createPayloadFor(type, attributes) {
  return { data: { type: type, attributes: attributes } };
}

function resourceResponseHandler(callback) {
  return function(err, payload) {
    var data;
    if (err) return callback(err, deserializeError(payload));
    try {
      callback(null, deserializeData(payload));
    } catch(error) {
      console.log(error);
      callback(error);
    }
  };
}

function findAll(callback) {
  Net.index(function(err, payload) {
    if (err) return callback(err, deserializeError(payload));
    callback(null, deserializeData(payload));
  });
}

function createWiki(path, callback) {
  var handler = resourceResponseHandler(callback);
  var payload = createPayloadFor('wikis', { path: path });
  Net.create(payload, handler);
}

function importWiki(path, callback) {
  var handler = resourceResponseHandler(callback);
  var payload = createPayloadFor('wikis', { path: path });
  payload.meta = { import: true };
  Net.create(payload, handler);
}

function deleteWiki(slug, callback) {
  var handler = resourceResponseHandler(callback);
  Net.destroy(slug, handler);
}

exports.findAll = findAll;
exports.createWiki = createWiki;
exports.importWiki = importWiki;
exports.deleteWiki = deleteWiki;

})();
