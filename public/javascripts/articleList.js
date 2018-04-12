;define(function (require) {
	let util = require("./common/util"),
		layer = require("./common/skinLayer");
	let module = {
		deleteRec(keyID, type) {
			let pwd = window.prompt("请输入验证密码", "");
			if (!pwd) {
				alert("请输入验证密码");
				return false;
			}
			util.ajax({
	    		type: "post",
	    		url: "/delete",
	    		data: {
	    			_id: keyID,
	    			type: type,
	    			passWord: pwd
	    		},
	    		success(data) {
	    			data = JSON.parse(data);
	    			if (data.ok) {
	    				layer.layerMsg({
	    					content: "删除成功"
	    				}, function () {
	    					location.reload();
	    				});
	    			}
	    		},
	    		error(data) {
	    			alert(data);
	    		}
	    	});
		}
	};
	window.deleteRec = module.deleteRec;
});