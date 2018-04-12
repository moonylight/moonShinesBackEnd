var ArticleOp = require("../models/articleOp.js");
var fs = require("fs");//操作文件
var multer = require('multer');//接收图片

function getNowFormatDate() {
    var date = new Date();
    var seperator1 = "-";
    var month = date.getMonth() + 1;
    var strDate = date.getDate(); 
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = date.getFullYear() + "" + month;
    return currentdate.toString();
} 
function propell(baseUrl, filename, content) {
	try {
		var url;
		var packageArr = baseUrl.split("/");
		for (var i = 0, len = packageArr.length; i < len; i++) {
			if (i === 0) {
				url = "../moonShines/" + packageArr[i];
			} else {
				url += "/" + packageArr[i];
			}
			if (!fs.existsSync(url)) {
				fs.mkdirSync(url, 0777);
			}			
			if (i === len -1) {				
				fs.writeFile(url + "/" + filename, content);
			}
		}
		return true;
	} catch (ex) {
		return false;
	}
}

var imgPackageName = 'upload/images/' + getNowFormatDate();
var storage = multer.diskStorage({ 
    destination: imgPackageName,
    filename: function (req, file, cb) {
    	var suffix = file.originalname.substr(file.originalname.length - 4, file.originalname.length);
        cb(null,  new Date().getTime() + suffix);
    }
});
var upload = multer({
    storage: storage
});

var categoryMap = {
	"99999": "未分类"
};

var Global = {
	link: ""
};
				
var routerArticle = function (app) {
	

	app.get("/publishPage", function (req, res, next) {
		res.render("publish", {
			title: "说点什么呢",
			curArticle: {}
		});
	});

	app.get("/publishPage/:keyID", function (req, res, next) {
		var articleOp = new ArticleOp();
		articleOp.autoSelect("articleDetailTB", {
			selectCon: {
				_id: req.params.keyID
			},
			limit: 1
		}, function (data) {
			try {
				data[0].content = fs.readFileSync(data[0].contentLink, "utf-8");
				////去除标题
				var slicePara = data[0].content.slice(0, data[0].content.indexOf("</h2>") + 5);
				data[0].content = data[0].content.replace(slicePara, "");
				Global.link = data[0].contentLink;
			} catch (ex) {
				data[0].content = "";
			}

			res.render("publish", {
				title: "修改看看",
				curArticle: data[0]
			});
		});		
	});

	////草稿新增或修改
	app.post("/draft/:keyID", function (req, res, next) {
		var param = req.body;
		var articleOp = new ArticleOp();
		// 保存草稿之前（新增或修改）先进行密码保护，重新关联上一篇和下一篇
		if (!articleOp.cryptoCompare(param.passWord)) {
			//进行密码比对之后删除明文密码
			delete param.passWord;

			param.isVisible = 0;	
			param.isDelete = 0;
			param.categoryTypeName = categoryMap[param.categoryType];
			////给内容加上标题保存
			param.content = "<h2>" + param.articleTitle + "</h2>" + param.content;
			////清除首段文字的所有空格
			param.firstParagraph = param.firstParagraph.replace(new RegExp("&nbsp;","gm"), "");
			// 修改
			if (param._id && Global.link) {
				param.inc = {
					"visitedTime": 1
				};
				try {
					fs.writeFile(Global.link, param.content, function(err) {
						if(err) throw err;	
					    delete param.content;

						articleOp.update("articleDetailTB", param, function (data) {
							res.json(data);
						});
					});
				} catch(ex) {
					res.json({
						ok: 0,
						errorMsg: "修改失败"
					});
				}
			} else {
				try {
					//新增，先保存为html，数据库存链接
					var baseUrl = "upload",
						filename = new Date().getTime() + ".html";
					if (!fs.existsSync(baseUrl)) {
			            fs.mkdirSync(baseUrl, 0777);
					}
					baseUrl += "/html";
					if (!fs.existsSync(baseUrl)) {
			            fs.mkdirSync(baseUrl, 0777);
					}
					baseUrl += "/" + getNowFormatDate();
					if (!fs.existsSync(baseUrl)) {
			            fs.mkdirSync(baseUrl, 0777);
					}
		            fs.writeFile(baseUrl + "/" + filename, param.content, function(err){
						if(err) throw err;
						var content = param.content;	
					    delete param.content;

					    param.contentLink = baseUrl + "/" + filename;
						param._id = new Date().getTime();				
						param.msgNum = 0;
						param.visitedTime = 1;	
						articleOp.insert("articleDetailTB", param, function (data) {
							////推送到前端
							var result = propell(baseUrl, filename, content);
							if (result) {								
								res.json(data);
							} else {
								res.json({
									ok: 0,
									errorMsg: "前端推送失败"
								});
							}
						});    
					});
				} catch(ex) {
					res.json({
						ok: 0,
						errorMsg: "新增失败"
					});
				}
			}
		} else {
			res.json({
				ok: 0,
				errorMsg: "验证密码输入错误"
			});
		}		
	});

	// ////发布文章新增或修改
	app.post("/publish/:keyID", function (req, res, next) {
		var param = req.body;
		var articleOp = new ArticleOp();
		// 保存草稿之前（新增或修改）先进行密码保护，重新关联上一篇和下一篇
		if (!articleOp.cryptoCompare(param.passWord)) {
			//进行密码比对之后删除明文密码
			delete param.passWord;
			param.isVisible = 1;	
			param.isDelete = 0;	
			param.categoryTypeName = categoryMap[param.categoryType];
			
			////给内容加上标题保存
			param.content = "<h2>" + param.articleTitle + "</h2>" + param.content;
			////清除首段文字的所有空格
			param.firstParagraph = param.firstParagraph.replace(new RegExp("&nbsp;","gm"), "");
			
			// 修改
			if (param._id && Global.link) {
				param.inc = {
					"visitedTime": 1
				};
				try {
					fs.writeFile(Global.link, param.content, function(err) {
						if(err) throw err;	
					    delete param.content;
						
						articleOp.update("articleDetailTB", param, function (data) {
							res.json(data);
						});
					});
				} catch(ex) {
					res.json({
						ok: 0,
						errorMsg: "修改失败"
					});
				}
			} else {
				try {
					//新增，先保存为html，数据库存链接
					var baseUrl = "upload",
						filename = new Date().getTime() + ".html";
					if (!fs.existsSync(baseUrl)) {
			            fs.mkdirSync(baseUrl, 0777);
					}
					baseUrl += "/html";
					if (!fs.existsSync(baseUrl)) {
			            fs.mkdirSync(baseUrl, 0777);
					}
					baseUrl += "/" + getNowFormatDate();
					if (!fs.existsSync(baseUrl)) {
			            fs.mkdirSync(baseUrl, 0777);
					}
		            fs.writeFile(baseUrl + "/" + filename, param.content, function(err){
						if(err) throw err;	
						var content = param.content;
					    delete param.content;

						//新增
					    param.contentLink =baseUrl + "/" + filename;						
						param._id = new Date().getTime();
						param.msgNum = 0;
						param.visitedTime = 1;	
						articleOp.insert("articleDetailTB", param, function (data) {
							////推送到前端
							var result = propell(baseUrl, filename, content);
							if (result) {								
								res.json(data);
							} else {
								res.json({
									ok: 0,
									errorMsg: "前端推送失败"
								});
							}
						});    
					});
				} catch(ex) {
					res.json({
						ok: 0,
						errorMsg: "新增失败"
					});
				}
			}

		} else {
			res.json({
				ok: 0,
				errorMsg: "验证密码输入错误"
			});
		}		
	});

	app.post("/uploadImg", upload.single('wangEditorImg'), function (req, res, next) {
		var path = ".." + req.file.path.replace("upload\\images", "").replace(/\\/g, "/"),
			cpath = req.file.path.replace(/\\/g, "/");
		var lastIndex = req.file.path.lastIndexOf("\\");
		fs.readFile(cpath, function (error, originBuffer) {
			if (error) {
				console.log(error);
			}
			propell(cpath.slice(0, lastIndex), cpath.slice(lastIndex + 1), originBuffer);
		});		
		res.json({
			errno: 0,
			data: [path]
		});		
	});
};
module.exports = routerArticle;