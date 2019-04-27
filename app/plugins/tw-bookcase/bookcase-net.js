/*\
title: $:/plugins/tw-bookcase/bookcase-net.js
type: application/javascript
module-type: library

Functions to handle the communication between client and server

\*/
(function() {
"use strict";

var URL_CONFIG_TIDDLER = '$:/config/bookcase/url';

function getUrl() {
  return $tw.wiki.getTiddlerText(URL_CONFIG_TIDDLER) || '/bookcase';
}

function httpRequest(options) {
  var xhr, callback = options.callback;
  if (options.data) {
    options.headers = options.headers || {};
    $tw.utils.extend(options.headers, {
      'accept': 'application/json',
      'Content-type': 'application/json'
    });
  }
  options.callback = function(err, data) {
    if (err) return callback(err, xhr.responseText);
    callback(null, data);
  };
  xhr = $tw.utils.httpRequest(options);
}

function index(callback) {
  httpRequest({ url: getUrl(), callback: callback });
}

function create(payload, callback) {
  httpRequest({
    url: getUrl(),
    type: 'POST',
    data: JSON.stringify(payload),
    callback: callback
  });
}

function destroy(slug, callback) {
  httpRequest({
    url: getUrl() + '/' + slug,
    type: 'DELETE',
    callback: callback
  });
}

exports.index = index;
exports.create = create;
exports.destroy = destroy;

})();
