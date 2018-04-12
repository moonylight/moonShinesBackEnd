;define(function (require) {
	var $ = document.querySelector.bind(document);
	let util = require("./common/util"),
		layer = require("./common/skinLayer");
	let mainModule = {
		makeMessage() {
			let param = {
				message: $("textarea[name='comment']").value,
				author: $("[name='author']").value,
				authorLink: $("[name='authorLink']").value,
				commentTime: moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
			};
			if (param.message === "") {
				alert("请输入您想说的话");
				return false;
			}
			if (param.author === "") {
				alert("请输入您的大名");
				return false;
			}
			util.ajax({
                type: "post",
                url: "/leaveMessge",
                data: param,
                success: function (data) {
                    data = JSON.parse(data);   
                    if (data.result.ok) {
                    	if (!location.hash) {
                    		location.href += "#commont";                    		
                    	} 
                    	location.reload();
                    }       
                },
                error: function (data) {
                    alert(JSON.stringify(data));
                }
            });
		},
		deleteMessage(id) {
			util.ajax({
                type: "post",
                url: "/deleteMessage",
                data: {
					id: id
				},
                success: function (data) {
                    data = JSON.parse(data);   
                    location.reload();    
                },
                error: function (data) {
                    alert(JSON.stringify(data));
                }
            });
		}
	};

	window.makeMessage = mainModule.makeMessage;
	window.deleteMessage = mainModule.deleteMessage;
});