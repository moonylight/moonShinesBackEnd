;define(function (require) {
	let E = window.wangEditor;
    let editor = new E('#editor');
    // editor.customConfig.uploadImgShowBase64 = true;
    editor.customConfig.uploadImgServer = "/uploadImg";
    editor.customConfig.showLinkImg = false;
    editor.customConfig.uploadFileName = 'wangEditorImg';
    editor.customConfig.debug = true;
    editor.create();

	var util = require("./common/util");
	var $ = document.querySelector.bind(document),
        categoryMap = {
            "99999": "/uncatelogued"
        };
    var mainModule = {
        collectParams() {
            return {
                articleTitle: $("[name='articleTitle']").value,
                articleTag: $("[name='articleTag']").value,
                passWord: $("[name='protected']").value,
                content: editor.txt.html(),
                firstParagraph: $("div[contenteditable='true'] p") ? $("div[contenteditable='true'] p").outerHTML : ("<p>" + $("div[contenteditable='true']").children[0].textContent + "</p>"),
                categoryType: "99999",
                _id: $("#hid_id").value,
                modifyTime: moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
            };
        },
        eventListner() {
            $("#btn-save").onclick = function () {
                let param = mainModule.collectParams();
                if (!param.articleTitle) {
                    alert("请输入文章标题");
                    return;
                } 
                if (!param.content) {
                    alert("请输入文章内容");
                    return;
                }
                // if (!param.passWord) {
                //  alert("请输入密码");
                //  return;
                // }
                util.ajax({
                    type: "post",
                    url: "/draft/0",
                    data: param,
                    success: function (data) {
                        data = JSON.parse(data);
                        if (data.ok) {
                            location.href = ((location.host.indexOf("localhost") > -1) ? "http://" : "") + location.host + "/draft";
                            return false;
                        } else {
                            alert(data.errorMsg || data.result);
                        }           
                    },
                    error: function (data) {
                        alert(data);
                    }
                });
            };
            $("#btn-publish").onclick = function () {
                let param = mainModule.collectParams();
                if (!param.articleTitle) {
                    alert("请输入文章标题");
                    return;
                } 
                if (!param.content) {
                    alert("请输入文章内容");
                    return;
                }
                // if (!param.passWord) {
                //  alert("请输入密码");
                //  return;
                // }
                util.ajax({
                    type: "post",
                    url: "/publish/0",
                    data: param,
                    success: function (data) {
                        data = JSON.parse(data);
                        if (data.ok) {
                            location.href = ((location.host.indexOf("localhost") > -1) ? "http://" : "") + location.host + categoryMap[param.categoryType];
                            return false;
                        } else {
                            alert(data.errorMsg || data.result);
                        }           
                    },
                    error: function (data) {
                        alert(data);
                    }
                });
            };
        },
        init() {
            // editor.txt.html($("#hidContent").value);
            mainModule.eventListner();
        }
    };    

    mainModule.init();
});