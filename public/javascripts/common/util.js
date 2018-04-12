;define(function (require, exports, module) {
	var formatParams = function (data) {
        var arr = [];
        for (var name in data) {
            arr.push(encodeURIComponent(name) + "=" + encodeURIComponent(data[name]));
        }
        arr.push(("v=" + Math.random()).replace(".",""));
        return arr.join("&");
    };
	var util = {
		ajax(obj) {
			var XHR=null;
			if (window.XMLHttpRequest) {  
			    // 非IE内核  
			    XHR = new XMLHttpRequest();  
			} else if (window.ActiveXObject) {  
			    // IE内核,这里早期IE的版本写法不同,具体可以查询下  
			    XHR = new ActiveXObject("Microsoft.XMLHTTP");  
			} else {  
			    XHR = null;  
			}  
			obj = obj || {};
			obj.type = (obj.type || "GET").toUpperCase();
	    	obj.dataType = obj.dataType || "json";
	    	var params = formatParams(obj.data);
			if (XHR) {
				
				XHR.onreadystatechange = function () {
					if (XHR.readyState === 4) {
						if (XHR.status === 200) {
							typeof obj.success === "function" && obj.success(XHR.responseText, XHR.responseXML);
						} else {
							typeof obj.error === "function" && obj.error(XHR);
						}		

						XHR = null;				
					}
				};

				if (obj.type === "GET") {
					XHR.open("GET", obj.url + "?" + params, true);
					XHR.send(null);
				} else {
					XHR.open("POST", obj.url, true);
					XHR.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
					XHR.send(params);
				}				
			}
		},
		queryString(name) {
			name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
			var regexS = "[\\?&]" + name + "=([^&#]*)";
			var regex = new RegExp(regexS);
			var results = regex.exec(decodeURIComponent(window.location.search));
			if (results == null) {
				return "";
			}
			else {
				try{
					return decodeURIComponent(results[1].replace(/\+/g, " "));
				}catch(e){
					return results[1].replace(/\+/g, " ");
				}
			}
		}
	};

	module.exports = util;
});
