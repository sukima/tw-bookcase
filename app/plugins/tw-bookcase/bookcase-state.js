/*\
title: $:/plugins/tw-bookcase/bookcase-state.js
type: application/javascript
module-type: library

Internal bookcase state management

\*/
(function() {
"use strict";

function getStoreTiddler(store) {
  return '$:/state/bookcase-' + store;
}

function getStoreData(store) {
  return $tw.wiki.getTiddlerData(getStoreTiddler(store));
}

function setStoreData(store, tiddlerData) {
  $tw.wiki.setTiddlerData(getStoreTiddler(store), tiddlerData);
}

function saveData(data) {
  $tw.utils.each(data, function(tiddlerData, store) {
    setStoreData(store, tiddlerData);
  });
}

function prependData(store, entry) {
  var tiddlerData = getStoreData(store) || [];
  tiddlerData.unshift(entry);
  setStoreData(store, tiddlerData);
}

function removeData(store, id) {
  var tiddlerData = getStoreData(store) || [];
  var index = tiddlerData
    .map(function(data) { return data.id; })
    .indexOf(id);
  if (index < 0) return;
  var entry = tiddlerData.splice(index, 1)[0];
  setStoreData(store, tiddlerData);
  return entry;
}

exports.saveData = saveData;
exports.prependData = prependData;
exports.removeData = removeData;

})();
