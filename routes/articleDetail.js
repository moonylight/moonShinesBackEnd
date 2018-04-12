var ArticleOp = require("../models/articleOp.js"),
	mongodb = require('../models/db'),
	fs = require("fs");//操作文件

var routerArticleDetail = function (app) {
	app.get("/articleDetail/:keyID", function (req, res, next) {
		var keyID = req.params.keyID;
		var articleOp = new ArticleOp();
		articleOp.update("articleDetailTB", {
			inc: {
				"visitedTime": 1
			},
			_id: +keyID
		});
		articleOp.unionQuery("articleDetailTB", [{
			$lookup: {
				from: "articleCommentTB",
				localField: "_id",
				foreignField: "articleID",
				as: "commentList"
			}
		}, {
			$match: {
				_id: +keyID
			}
		}], function (data) {
			data = data[0];
			data.modifyTimeCopy = data.modifyTime;
			data.modifyTime = data.modifyTime.split(" ")[0];
			data.commentList.sort(function (a, b) {
				return new Date(b.commentTime).getTime() - new Date(a.commentTime).getTime();
			});
			data.commentList.map(function (item) {
				item.comment = item.comment.replace(/<br\/>/g, "").replace(/<br>/g, "");
			});
			try {
				data.content = fs.readFileSync(data.contentLink, "utf-8");
			} catch (ex) {
				data.content = "<p style='width:  120px;text-align: center; margin: 0 auto; padding: 100px;'>抱歉，看不了啦</p>";
			}

			res.render("articleDetail", {
				title: data.articleTitle,
				articleDetail: data
			});
		});		
	});
	app.post("/comment", function (req, res, next) {
		var param = req.body;
		param.articleID = +param.articleID;
		param.comment = param.comment.replace(/\n/g,"<br/>").replace(/\s/g,"&nbsp;");
		param.isDelete = 0;
		param._id = new Date().getTime();
		////保存评论
		mongodb.insertData("articleCommentTB", param, function (data) {
			////更新文章的评论数
			mongodb.updateData("articleDetailTB", {
				inc: {
					"msgNum": 1
				},
				_id: +param.articleID
			}, function () {
				res.json(data);
			});
		});
		
	});
	app.post("/deleteComment", function (req, res, next) {
        var param = req.body;
        mongodb.updateData("messages", {
            isDelete: 1,
            _id: param.id
        }, function (data) {
            res.json(data);
        });
    });
};
module.exports = routerArticleDetail;