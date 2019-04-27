/*\
title: $:/plugins/tw-bookcase/bookcase-startup.js
type: application/javascript
module-type: startup

A polling service to fetch the list data from the bookcase server. And setup root event listeners.

\*/
(function() {
"use strict";

var DataManager = require('$:/plugins/tw-bookcase/bookcase-data.js');
var StateManager = require('$:/plugins/tw-bookcase/bookcase-state.js');

var POLLING_DELAY = 10000;
var ERROR_TIDDLER = '$:/plugins/tw-bookcase/messages/error';
var CANCELLED_TIDDLER = '$:/plugins/tw-bookcase/messages/cancelled';
var CREATE_SUCCESS_TIDDLER = '$:/plugins/tw-bookcase/messages/create-success';
var IMPORT_SUCCESS_TIDDLER = '$:/plugins/tw-bookcase/messages/import-success';
var DELETE_SUCCESS_TIDDLER = '$:/plugins/tw-bookcase/messages/delete-success';

function pollNextData(callback) {
  DataManager.findAll(function(err, data) {
    try {
      if (err) throw err;
      StateManager.saveData(data);
    } catch(error) {
      console.log(error);
    }
    setTimeout(pollNextData, POLLING_DELAY);
    if (callback) callback();
  });
}

exports.name = 'bookcase-startup';
exports.platforms = ['browser'];
exports.after = ['startup'];
exports.synchronous = false;

exports.startup = function(callback) {
  var alertId = 0;
  function handleErrors(error, data) {
    console.log(error + ': ' + data.message);
    $tw.wiki.addTiddler($tw.utils.extend(data, {
      title: '$:/temp/alerts/bookcase-error-' + (++alertId),
      text: $tw.wiki.getTiddlerText(ERROR_TIDDLER),
      modified: $tw.utils.stringifyDate(new Date()),
      component: 'bookcase',
      tags: '$:/tags/Alert'
    }));
  }
  $tw.rootWidget.addEventListener('bookcase-create-wiki', function(event) {
    if (!event.param) {
      $tw.notifier.display(CANCELLED_TIDDLER);
      return;
    }
    DataManager.createWiki(event.param, function(err, data) {
      if (err) return handleErrors(err, data);
      StateManager.prependData('wikis', data);
      $tw.notifier.display(CREATE_SUCCESS_TIDDLER, { variables: data });
    });
  });
  $tw.rootWidget.addEventListener('bookcase-import-wiki', function(event) {
    if (!event.param) {
      $tw.notifier.display(CANCELLED_TIDDLER);
      return;
    }
    DataManager.importWiki(event.param, function(err, data) {
      if (err) return handleErrors(err, data);
      StateManager.prependData('wikis', data);
      $tw.notifier.display(IMPORT_SUCCESS_TIDDLER, { variables: data });
    });
  });
  $tw.rootWidget.addEventListener('bookcase-delete-wiki', function(event) {
    if (!confirm('Are you sure you wish to delete this wiki?')) return;
    DataManager.deleteWiki(event.param, function(err, data) {
      if (err) return handleErrors(err, data);
      var data = StateManager.removeData('wikis', event.param);
      $tw.notifier.display(DELETE_SUCCESS_TIDDLER, { variables: data });
    });
  });
  pollNextData(callback);
};

})();
