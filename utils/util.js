var app = getApp();
var dataParsing = require('dataParsing');
/*
 *拓展Date方法。得到格式化的日期形式
 *date.format('yyyy-MM-dd')，date.format('yyyy/MM/dd'),date.format('yyyy.MM.dd')
 *date.format('dd.MM.yy'), date.format('yyyy.dd.MM'), date.format('yyyy-MM-dd HH:mm')
 *使用方法 如下：
 *   var date = new Date();
 *   var todayFormat = date.format('yyyy-MM-dd'); //结果为2015-2-3
 *Parameters:
 *format - {string} 目标格式 类似('yyyy-MM-dd')
 *Returns - {string} 格式化后的日期 2015-2-3
 *
 */
(function initTimeFormat() {
  Date.prototype.format = function (format) {
    var o = {
      "M+": this.getMonth() + 1, //month
      "d+": this.getDate(), //day
      "h+": this.getHours(), //hour
      "m+": this.getMinutes(), //minute
      "s+": this.getSeconds(), //second
      "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
      "S": this.getMilliseconds() //millisecond
    }
    if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
      (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o) if (new RegExp("(" + k + ")").test(format))
      format = format.replace(RegExp.$1,
        RegExp.$1.length == 1 ? o[k] :
          ("00" + o[k]).substr(("" + o[k]).length));
    return format;
  };
})()


function getShowTime(recordTime) {
  if (recordTime) {
    recordTime = new Date(parseFloat(recordTime) * 1000);
    var minute = 1000 * 60,
      hour = minute * 60,
      day = hour * 24,
      now = new Date(),
      diff = now - recordTime;
    var result = '';
    if (diff < 0)
      return result;

    var weekR = diff / (7 * day);
    var dayC = diff / day;
    var hourC = diff / hour;
    var minC = diff / minute;
    if (weekR > 1) {
      return recordTime.format('yyyy-MM-dd');
    } else if (dayC == 1 || (hourC < 24 && recordTime.getDate() != now.getDate())) {
      return '昨天' + recordTime.format("hh:mm");
    } else if (dayC > 1) {
      return recordTime.format('MM-dd');
    } else if (hourC >= 1) {
      return "大约" + parseInt(hourC) + '小时前';
    } else if (minC >= 1) {
      return "大约" + parseInt(minC) + '分钟前';
    } else {
      return '刚刚';
    }
  }
}



/*servelet 是你的请求服务器接受的类型 如Getsongs
**method 是你的请求方式，分为GET/POST,默认GET
**data 是你要请求的数据
*/
//这里是请求格式的模板
// util.requestFromServer(servelet, data).then((res) => {
//   that.processRequestData(res.data, settedKey, categoryTitle);
// }).catch((err) => {
//   console.log("请求失败");
// })
const requestFromServer = (servelet, data, method = "GET") => {

  return new Promise((Resolve, Reject) => {
    wx.request({
      url: app.globalData.serveBase + "/" + servelet,
      data: data,
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: method,
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

// 防抖 在delay时间周期内，若有多次事件触发，只执行最后一次事件；
function debounce(handle, delay) {
  var timer = null;
  return function (e) {
    var _self = this;
    clearTimeout(timer);
    timer = setTimeout(function () {
      handle.call(_self, e);
    }, delay);
  }
}

// 将秒转换为分钟 例如156s ->02:36
function getFormatMinTime(second = 0) {
  if (second < 0) { return -1 }
  var min = Math.floor(second / 60).toString();
  var sec = Math.floor(second - min * 60).toString();
  min = min.length == 1 ? '0' + min : min;
  sec = sec.length == 1 ? '0' + sec : sec;
  return `${min}:${sec}`;
}


// 计时器
var mypauseTime = 0,
  mystartTime,
  mypauseStart,
  isStart = false,
  isPause = false;

function myStart() {
  if (!isStart) {
    myRest();
    mystartTime = new Date().getTime();
    isStart = true;
  }
}

function myPause() {
  if (!isPause && isStart) {
    mypauseStart = new Date().getTime();
    isPause = true;
  }
}

function myResume() {
  if (isPause) {
    isPause = false;
    mypauseTime += new Date().getTime() - mypauseStart;
  }
}

function myRest() {
  mypauseTime = 0;
  isStart = false;
  isPause = false;
}

function getCurTime() {
  if (!isStart) return 0;
  if (isPause && isStart) return mypauseStart - mystartTime - mypauseTime;
  return new Date().getTime() - mystartTime - mypauseTime;
}

const COS = require('cos-wx-sdk-v5');
function getCos() {
  var cos = new COS({
    getAuthorization: function (options, callback) {
      // 异步获取临时密钥
      //这里可以进行本地缓存来优化来，避免短时间内重复请求获取凭证
      var cosData = wx.getStorageSync('cosData');
      if( cosData &&  new Date().getTime() - cosData.StartTime  < cosData.ExpiredTime - cosData.StartTime){
        callback(cosData);
      }else{
        wx.request({
          url: 'https://musiclink.caoyu.online/v1/tempkey',
          dataType: 'json',
          success: function (result) {
            var data = result.data.data;
            var credentials = data && data.credentials;
            if (!data || !credentials) return console.error('credentials invalid');
            cosData = {
              TmpSecretId: credentials.TmpSecretId,
              TmpSecretKey: credentials.TmpSecretKey,
              XCosSecurityToken: credentials.Token,
              // 建议返回服务器时间作为签名的开始时间，避免用户浏览器本地时间偏差过大导致签名错误
              StartTime: data.start_time, // 时间戳，单位秒，如：1580000000
              ExpiredTime: data.expired_time, // 时间戳，单位秒，如：1580000900
            };
            wx.setStorageSync('cosData', cosData);
            callback(cosData);
          }
        });
      }
    }
  });
  return cos;
}

module.exports = {
  requestFromServer: requestFromServer,
  getShowTime: getShowTime,
  debounce: debounce,
  getFormatMinTime:getFormatMinTime,
  myStart:myStart,
  myPause:myPause,
  myResume:myResume,
  myRest:myRest,
  getCurTime:getCurTime,
  parsingRanklist:dataParsing.parsingRanklist,
  getCos:getCos
}