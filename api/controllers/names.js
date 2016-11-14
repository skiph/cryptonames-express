'use strict';

var util = require('util');

module.exports = {
  getNames: getNames
};

var namesMap = {
  "participants": [ "Alice", "Bob", "Carol", "Dan" ],
  "bad-actors":   [ "Eve", "Mallet", "Sybil" ],
  "3rd-parties":  [ "Faythe", "Trent" ],
  "g-men":        [ "grace" ],
  "":             []
};

/*
  Functions in a127 controllers used for operations should take two parameters:

  Param 1: a handle to the request object
  Param 2: a handle to the response object
 */
function getNames(req, res) {
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  var tag = req.swagger.params.tag.value || "";
  var names = namesMap[tag] || []

  res.json({
    "names": names,
    "tag":   tag
  });
}
