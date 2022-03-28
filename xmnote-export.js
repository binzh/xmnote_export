var text = '';
var resultArray = [];
var Ajax = {
    get: function (url, fn) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, false);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200 || xhr.status == 304) {
                fn.call(this, xhr.responseText);
            }
        };
        xhr.send();
    }
}

function sortRule(a, b) {
    return a.date.getTime() - b.date.getTime();
}

function nextPage(syncTag) {
    var url = 'https://i.mi.com/note/full/page/?ts=' + (new Date()).getTime() + '&limit=200';
    if (syncTag) {
        url += '&syncTag=' + syncTag;
    }
    Ajax.get(url, function (r) {
        var result = JSON.parse(r);
        for (var i in result.data.entries) {
            let obj = result.data.entries[i];
            let detailUrl = 'https://i.mi.com/note/note/' + obj.id + '/?ts=' + (new Date()).getTime();
            Ajax.get(detailUrl, function (dtl) {
                var detailInfo = JSON.parse(dtl).data.entry;
                var date = new Date();
                date.setTime(obj.createDate);

                var resultObj = {};
                try {
                    resultObj.title = JSON.parse(detailInfo.extraInfo).title;
                    resultObj.title = resultObj.title == null || resultObj.title.toString() == "" ? '无标题' : resultObj.title;
                } catch (err) {
                }

                resultObj.id = obj.id
                console.log(resultObj.title + ':' + resultObj.id)
                resultObj.date = date;
                resultObj.content = detailInfo.content;
                resultObj.folderId = detailInfo.folderId;
                resultObj.colorId = detailInfo.colorId;

                if (detailInfo.setting) {
                    if (detailInfo.setting.data) {
                        var pics = detailInfo.setting.data;
                        for (let pic of pics) {
                            let picURL = 'https://i.mi.com/file/full?type=note_img&fileid=' + pic.fileId
                            try {
                                reqToBase64(picURL, pic.fileId + '.png')
                            } catch (error) {
                                console.error(error);
                            }
                        }
                    }
                }
                resultArray.push(resultObj);
            });
        }

        if (result.data.entries.length) {
            nextPage(result.data.syncTag);
        } else {
            text += "<html><head><style>.card{margin-top:10px;}p{display: inline;}</style></head><body>";
            resultArray.sort(sortRule);

            for (let j in resultArray) {
                let resObj = resultArray[j];
                text += '<div class="card" id="xmnote">';
                // text += '<div>' + resObj.id + '</div>';
                // text += "<br/>";
                text += '<div><p style="font-size: 48px;">' + resObj.title + '</p></div>';
                text += "<div>" + dateFormat(resObj.date) + "</div>";

                text += '<div>' + resObj.content + '</div>';
                text = text.replace(/\<bullet \/\>(.*)\n/gi, '<li>$1</li>');
                text = text.replace('<right>', '<div style="text-align: right;">');
                text = text.replace('</right>', '</div>');
                text = text.replace('<size>', '<p style="font-size: 24px;">');
                text = text.replace('</size>', '</p>');
                text = text.replace('<mid-size>', '<p style="font-size: 19px;">');
                text = text.replace('</mid-size>', '</p>');
                text = text.replace('<background color=', '<p style="background-color: ');
                text = text.replace('</background>', '</p>');
                text = text.replace('<0/></>', '');
                text = text.replace(/☺ (\d{1,}\.\S{22})/gi, "<img src='$1.png' />");
                text = text.replace(/[\n\r]/g, "<br/>");

                text += "</div>";
                // text += "<br/><br/><br/><br/><br/>";

            }
            text += "</body></html>";
            // document.write(text);
            console.log("请从下面开始复制")
            console.log(text)
            console.log("复制到上面为止的内容")
            console.log("执行完毕。"+new Date().toLocaleTimeString())


        }
    });
}


function dateFormat(date) {
    return date.getFullYear() + "-" + (date.getMonth() + 1).toString().padStart(2, "0") + "-" + date.getDate().toString().padStart(2, "0") + " " + date.getHours().toString().padStart(2, "0") + ":" + date.getMinutes().toString().padStart(2, "0") + ":" + date.getSeconds().toString().padStart(2, "0")
}


function reqToBase64(imgUrl, filename) {
    console.log("imgUrl:\n" + imgUrl);
    console.log("filename:\n" + filename);
    var img = new Image();
    img.src = imgUrl;
    sleep(2000)
    img.setAttribute('crossOrigin', 'anonymous');
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    var dataURL = canvas.toDataURL("image/png");
    // console.log("dataurl");
    //  console.log("dataURL\n"+dataURL=='');
    dataURLtoFile(dataURL, filename)
}


function dataURLtoFile(dataurl, filename) {
    // console.log("dataURL\n"+dataurl.toString().substring(0,20));
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1], bstr = atob(arr[1]), n = bstr.length,
        u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    file = new File([u8arr], filename, {type: mime});
    linka = document.createElement('a')
    linka.href = window.URL.createObjectURL(file);
    linka.download = filename
    linka.click();
    return linka.href;
}

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['exports'], factory)
    } else if (typeof exports === 'object') {
        factory(exports)
        if (typeof module === 'object' && module !== null) {
            module.exports = exports = exports.sleep
        }
    } else {
        factory(window)
    }
}(this, function (exports) {
    exports.sleep = function sleep(ms) {
        var start = new Date().getTime()
        while (new Date().getTime() < start + ms) ;
    }
}));


nextPage();
