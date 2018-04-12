var mongodb = require('./db'),
	crypto = require('crypto'),
	settings = require("../settings.js");

function ArticleOp (param) {
}
ArticleOp.prototype.insert = function (tableName, insertData, cb) {
	////添加之前先查询最近的上一条记录，将需要保存的数据存为上一条记录的next
	ArticleOp.prototype.autoSelect(tableName, {
		selectCon: {
			_id: {
				$lt: insertData._id
			},
			isDelete: 0,
			categoryType: insertData.categoryType,
			isVisible: insertData.isVisible
		},
		limit: 1
	}, function (res) {
		////查到了上一条记录
		if (res && res.length) {
			////该记录存为本条数据的prev，存入数据库
			insertData.prevKeyID = res[0]._id;
			insertData.prevTitle = res[0].articleTitle;
			////新增数据作为记录的next，更新数据库
			res[0].nextKeyID = insertData._id;
			res[0].nextTitle = insertData.articleTitle;
			mongodb.updateData(tableName, res[0]);
		}
		mongodb.insertData(tableName, insertData, function (data) {
			if (data.result.ok) {
				typeof cb === "function" && cb(data.result);					
			} else {
				typeof cb === "function" && cb({
					ok: 0,
					errorMsg: "保存文章失败"
				});
			}
		});
	});
	
};
ArticleOp.prototype.update = function (tableName, updateData, cb) {
	mongodb.updateData(tableName, updateData, function (data) {
		if (data) {
			typeof cb === "function" && cb(data);
		}
	});
};
ArticleOp.prototype.remove = function (tableName, removeData, cb) {
	////可见代表已发表，删除后进草稿箱，实际是更新isVisible字段
	if (+removeData.type) {
		removeData.isVisible = 0;
	} else {
		////不可见代表草稿，更新isDelete字段
		removeData.isDelete = 1;
	}
	delete removeData.type;
	delete removeData.v;
	mongodb.updateData(tableName, removeData, cb);
};
ArticleOp.prototype.select = function (tableName, selectCon, field, cb) {
	mongodb.selectData(tableName, selectCon, field, function (data) {
		if (data) {
			typeof cb === "function" && cb(data);
		}
	});
};
ArticleOp.prototype.autoSelect = function (tableName, sql, cb) {
	mongodb.autoSelectData(tableName, sql, function (data) {
		if (data) {
			typeof cb === "function" && cb(data);
		}
	});
};
ArticleOp.prototype.cryptoCompare = function (clearText, replaceText) {
	let cipherText = "",
		md5 = crypto.createHash('md5');
	if (replaceText) {
		clearText = clearText.replace(replaceText, "");
	}
	md5.update(clearText);
	cipherText = md5.digest('hex');
	if (cipherText === settings.SecretPub) {
		return true;
	}
	return false;
};
ArticleOp.prototype.unionQuery = function (baseTable, aggregate, cb) {
	mongodb.unionQuery(baseTable, aggregate, function (data) {
		if (data) {
			typeof cb === "function" && cb(data);
		}
	});
};

module.exports = ArticleOp;