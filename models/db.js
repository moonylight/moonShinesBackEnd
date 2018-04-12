var settings = require('../settings'),
	MongoClient = require('mongodb').MongoClient;
var DB_CONN_STR = "mongodb://" + settings.host + ":" + settings.port + "/" + settings.db;
var DBOperation = {
	insertData(tableName, insertData, cb) {
		MongoClient.connect(DB_CONN_STR, function (err, db) {
			if (err) {
				console.log(err);
				return false;
			}
			let collection = db.collection(tableName);
			collection.insert(insertData, function (err, data) {
				if (err) {
					console.log(err);
					return false;
				}
				typeof cb === "function" && cb(data);
			});
		});
	},
	updateData(tableName, updateData, cb) {
		MongoClient.connect(DB_CONN_STR, function (err, db) {
			if (err) {
				console.log(err);
				return false;
			}
			let collection = db.collection(tableName),
				_id = new Date(+updateData._id).getTime(),
				incData = updateData.inc,
				$updateData = {};
			delete updateData._id;
			delete updateData.inc;
						
			if (JSON.stringify(updateData) !== "{}") {
				$updateData["$set"] = updateData;
			}
			if (incData) {
				$updateData["$inc"] = incData;
			}

			collection.update({
				_id: _id
			}, $updateData, function (data) {
				if (data && data.name === "MongoError") {
					console.log(data);
				} else {
					typeof cb === "function" && cb({
						ok: 1
					});
				}
			});
		});
	},
	selectData(tableName, selectCon, field, cb) {
		MongoClient.connect(DB_CONN_STR, function (err, db) {
			if (err) {
				console.log(err);
				return false;
			}
			let collection = db.collection(tableName);
			field.passWord = 0;
			selectCon.isDelete = 0;
			collection.find(selectCon, field).toArray(function (err, data) {
				if (err) {
					console.log(err);
					return false;
				}
				typeof cb === "function" && cb(data);
			});
		});
	},
	autoSelectData(tableName, sql, cb) {
		MongoClient.connect(DB_CONN_STR, function (err, db) {
			if (err) {
				console.log(err);
				return false;
			}
			if (sql.selectCon._id && (typeof sql.selectCon._id === "string" || typeof sql.selectCon._id === "number")) {
				sql.selectCon._id = new Date(+sql.selectCon._id).getTime();
			}

			let collection = db.collection(tableName);
			collection.find(sql.selectCon || {}, sql.field || {}).limit(sql.limit || 50).sort(sql.sort || {_id: -1}).toArray(function (err, data) {
				if (err) {
					console.log(err);
					return false;
				}
				typeof cb === "function" && cb(data);
			});
		});
	},
	unionQuery(baseTable, aggregate, cb) {
		MongoClient.connect(DB_CONN_STR, function (err, db) {
			if (err) {
				console.log(err);
				return false;
			}
			let collection = db.collection(baseTable);
			collection.aggregate(aggregate, function (err, data) {
				if (err) {
					console.log(err);
					return false;
				}
				typeof cb === "function" && cb(data);
			});
		});
	}
};
module.exports = DBOperation;