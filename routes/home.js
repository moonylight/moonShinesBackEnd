
var mongodb = require("../models/db.js");

var dataO = {
	getData: function (table, sql, cb) {
		mongodb.autoSelectData(table, sql, function (data) {
			typeof cb === "function" && cb(data);
		});
	},
	renderPage: function (res, sticky) {
		dataO.getData("articleDetailTB", {
			selectCon: {
				_id: {
					$lt: new Date().getTime()
				},
				isDelete: 0,
				isVisible: 1
			},
			limit: 10
		}, function (data) {
			if (!sticky && data && data.length) {
				sticky = data[0];
			} else {
				sticky = {};
			}
			res.render("home", {
				title: "个人主页",
				sticky: {
					_id: sticky._id,
					articleTitle: sticky.articleTitle,
					firstParagraph: sticky.firstParagraph,
					modifyTime: sticky.modifyTime,
					msgNum: sticky.msgNum,
					categoryTypeName: sticky.categoryTypeName
				},
				articleShortList: data.splice(0,1)
			});
		});
	}
}
var routerHome = function (app) {
	app.get("/home", function (req, res, next) {
		dataO.getData("articleDetailTB", {
			selectCon: {
				_id: {
					$lt: new Date().getTime()
				},
				isDelete: 0,
				isVisible: 1,
				isSticky: 1
			},
			limit: 1
		}, function (data) {
			if (!data || !data.length) {
				dataO.renderPage(res);
			} else {
				dataO.renderPage(res, data[0]);
			}
		});		
	});
};
module.exports = routerHome;