;define(function (require, exports, module) {
	var $ = document.querySelector.bind(document);
	var mainModule = {
		append(parent, text) {
			if (typeof text === 'string') {
	            var temp = document.createElement('div');
	            temp.innerHTML = text;
	            // 防止元素太多 进行提速
	            var frag = document.createDocumentFragment();
	            while (temp.firstChild) {
	                frag.appendChild(temp.firstChild);
	            }
	            parent.appendChild(frag);
	        }
	        else {
	            parent.appendChild(text);
	        }
		},
		layerMsg(opt, cb) {
			var params = {
				width: opt.width || 100,
				height: opt.height || 50,
				area: Array.isArray(opt.area) ? opt.area : opt.area ? [opt.area, "auto"] : ["auto", "auto"],  
				content: opt.content || "",
				time: opt.time || 2
			};
			var html = "<div class='layer_msg_content' style='background-color: rgba(0, 0, 0, 0.5); height: " + params.height + "px; width: " + params.width + "px; text-align: center; line-height: " + params.height + "px; border-radius: 5px; margin: " + params.area[0] + " " + params.area[1] + "; position: fixed; top: 50%; left: 50%;'>" + params.content + "</div>";
			mainModule.append($("body"), html);
			setTimeout(function () {
				$(".layer_msg_content").style.display = "none";
				cb();
			}, params.time * 1000);
		}
	};

	module.exports = {
		layerMsg: mainModule.layerMsg
	}
});