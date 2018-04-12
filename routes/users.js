// var express = require('express');
// var router = express.Router();

// /* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

// module.exports = router;
var routerUser = function (app) {
	app.get("/user", function (req, res, next) {
		res.send('respond with a resource');
	});
	app.get("/aaa", function (req, res, next) {
		res.send('respond with a resource  aaa');
	});
};
module.exports = routerUser;