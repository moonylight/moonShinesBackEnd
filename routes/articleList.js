var ArticleOp = require("../models/articleOp.js");
var routerArticleList = function (app) {
	// app.get("/article/:keyID", function (req, res, next) {
	// 	res.render("article", {
	// 		title: "个人主页"
	// 	});
	// });

	////草稿箱首页跳转
	app.get("/draft", function (req, res, next) {
		var articleOp = new ArticleOp();
		articleOp.select("articleDetailTB", {
			isVisible: 0
		}, {
			categoryType: 0,
			content: 0
		}, function (data) {
			data.forEach(function (item) {
				item.modifyTimeCopy = item.modifyTime;
				item.modifyTime = item.modifyTime.split(" ")[0];
			});
			data.sort(function (a, b) {
				return new Date(a.modifyTimeCopy) < new Date(b.modifyTimeCopy);
			});
			res.render("articleList", {
				title: "草稿",
				navDesc: "已保存至草稿箱",
				articleList: data
			});
		});		
	});

	////未分类首页跳转
	app.get("/uncatelogued", function (req, res, next) {
		var articleOp = new ArticleOp();
		articleOp.select("articleDetailTB", {
			isVisible: 1,
			categoryType: "99999"
		}, {
			categoryType: 0,
			content: 0
		}, function (data) {
			data.forEach(function (item) {
				item.modifyTimeCopy = item.modifyTime;
				item.modifyTime = item.modifyTime.split(" ")[0];
			});
			data.sort(function (a, b) {
				return new Date(a.modifyTimeCopy) < new Date(b.modifyTimeCopy);
			});
			res.render("articleList", {
				title: "未分类文章",
				navDesc: "已发布未分类文章",
				articleList: data
			});
		});		
	});

	app.post("/delete", function (req, res, next) {
		var param = req.body;
		var articleOp = new ArticleOp();
		// 删除之前先进行密码保护，以免被恶意删除

		if (!articleOp.cryptoCompare(param.passWord, "delete")) {
			//进行密码比对之后删除明文密码
			delete param.passWord;
			articleOp.remove("articleDetailTB", param, function (data) {
				res.json(data);
			});
		} else {
			res.json({
				ok: 0,
				errorMsg: "验证密码输入错误"
			});
		}
	});
};
module.exports = routerArticleList;