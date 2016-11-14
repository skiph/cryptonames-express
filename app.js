'use strict';

// load config params

var config = require('./config');

// load required modules

var SwaggerExpress = require('swagger-express-mw');
var app = require('express')();
module.exports = app; // for testing
var fs = require('fs');
var jwt    = require('jsonwebtoken');

// establish secret

var secret;
try {
  var secret = Buffer.from(fs.readFileSync(config.secret, 'utf-8'), "base64");
} catch(err) {
  secret = "";
  console.log("no secret found");
}

console.log("  validToken = " + jwt.sign({ exp: Math.floor(Date.now() / 1000) + 10 * 366 * 24 * 3600 }, secret));
//console.log("invalidToken = " + jwt.sign({ exp: Math.floor(Date.now() / 1000) + 10 * 366 * 24 * 3600 }, secret + "?"));
//console.log("expiredToken = " + jwt.sign({ exp: Math.floor(Date.now() / 1000) -300 }, secret));

// set security operation

var check_key;
var limit = 0;
var limitMod = 3;

if (config.attest) {
  console.log("token checking enabled");
  check_key = function(req, authOrSecDef, scopesOrApiKey, cb) {
    var auth = req.get('auth');
    var decoded;
    var key;

    if (typeof auth !== "undefined") {
      console.log("auth: " + auth);

      decoded = jwt.decode(auth, { complete: true });

      // for demo purposes, override key if specified in payload

      if (typeof decoded.payload.key === "undefined") {
        key = secret;
      } else {
        console.log("key override: " + decoded.payload.key);
        key = Buffer.from(decoded.payload.key, 'base64');
      }

      try {
        decoded = jwt.verify(auth, key);
      } catch(err) {
        console.log("token failed");
        return cb(new Error('access denied (jwt)'));
      }

      // check additional stuff such as IP address

      console.log("token verified");
      return cb(null);
    } else {
      console.log("auth:  <none>");

      limit++;
      if (limit >= limitMod) {
        limit = 0;
        return cb(null);
      }
      return cb(new Error('access denied (jwt)'));
    }
  }
} else {
  console.log("token checking disabled");
  check_key = function(req, authOrSecDef, scopesOrApiKey, cb) {
    return cb(null);
  }
}

// start swagger express

var cfg = {
  appRoot: __dirname, // required config
  swaggerSecurityHandlers: {
    key: check_key
  }
};

SwaggerExpress.create(cfg, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  swaggerExpress.register(app);

  var port = process.env.PORT || 8080;
  app.listen(port);

  if (swaggerExpress.runner.swagger.paths['/hello']) {
    console.log('try this:\ncurl http://127.0.0.1:' + port + '/hello?name=Scott');
  }
});

// end of file
