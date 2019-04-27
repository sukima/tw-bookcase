/*\
title: $:/plugins/tw-bookcase/bookcase.js
type: applicatin/javascript
module-type: widget

A $list widget but specific for providing Bookcase data (from a JSON data tiddler)

\*/
(function(){
"use strict";

var ListWidget = require('$:/core/modules/widgets/list.js').list;
var ListItemWidget = require('$:/core/modules/widgets/list.js').listitem;

function tiddlerFriendlyValue(value, name) {
  if (Boolean(value) === value) {
    return value ? name : '';
  }
  return value;
}

var Bookcase = function(parseTreeNode, options) {
  this.initialise(parseTreeNode, options);
}

Bookcase.prototype = new ListWidget();

Bookcase.prototype.getTiddlerList = function() {
  var dataTiddler = this.getAttribute('tiddler');
  var data = dataTiddler && this.wiki.getTiddlerData(dataTiddler);
  return data || [];
}

Bookcase.prototype.makeItemTemplate = function(data) {
  return {
    type: 'bookcaseitem',
    itemData: data,
    children: this.parseTreeNode.children
  };
};

exports.bookcase = Bookcase;

var BookcaseItem = function(parseTreeNode, options) {
  this.initialise(parseTreeNode, options);
}

BookcaseItem.prototype = new ListItemWidget();

BookcaseItem.prototype.execute = function() {
  let _this = this;
  let data = this.parseTreeNode.itemData;
  $tw.utils.each(data, function(value, key) {
    _this.setVariable(key, tiddlerFriendlyValue(value, key));
  });
  this.makeChildWidgets();
};

exports.bookcaseitem = BookcaseItem;

})();
