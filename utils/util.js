var app = getApp();
/*servelet 是你的请求服务器接受的类型 如Getsongs
**method 是你的请求方式，分为GET/POST,默认GET
**data 是你要请求的数据
**注意到post.js查看实际怎么调用
*/
const requestFromServer = (servelet, data,method = "GET") => {

  return new Promise((Resolve, Reject) => {
    wx.request({
      url: app.globalData.serveBase + "/" + servelet,
      data: data,
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: method,
      dataType: "json",
      success: function (res) {
        //console.log("request success");
        Resolve(res);
      },
      fail: function (errMsg) {
        //console.log("request failed");
        Reject(errMsg);
      }
    });
  });
}

//这里是请求格式的模板
// util.requestFromServer(servelet, data).then((res) => {
//   that.processRequestData(res.data, settedKey, categoryTitle);
// }).catch((err) => {
//   console.log("请求失败");
// })

module.exports = {
  requestFromServer: requestFromServer
}