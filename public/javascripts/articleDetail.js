;define(function (require) {
	var $ = document.querySelector.bind(document);
	let util = require("./common/util"),
		layer = require("./common/skinLayer");
	let mainModule = {
		makeComment(_id) {
			let param = {
				comment: $("textarea[name='comment']").value,
				author: $("[name='author']").value,
				authorLink: $("[name='authorLink']").value,
				articleID: _id,
				commentTime: moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
			};
			if (param.comment === "") {
				alert("请输入您想说的话");
				return false;
			}
			if (param.author === "") {
				alert("请输入您的大名");
				return false;
			}
			util.ajax({
                type: "post",
                url: "/comment",
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
		quoteReply(className, author) {
			$("[name='comment']").value = "<blockquote>\n<pre>引用" + author + "的发言：</pre>\n" + $("." + className).innerHTML + "\n</blockquote>\n\n";
			$("[name='comment']").focus();
		},
		deleteComment(id) {
			util.ajax({
                type: "post",
                url: "/deleteComment",
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

	window.makeComment = mainModule.makeComment;
	window.quoteReply = mainModule.quoteReply;
});