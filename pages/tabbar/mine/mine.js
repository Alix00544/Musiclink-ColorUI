const app = getApp();
const util = require('../../../utils/util');
Page({

  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    WinHeight: app.globalData.WinHeight,
    ScreenWidth: app.globalData.ScreenWidth,
    navBarOpacity: 0,
    navBarFrontColor: "#ffffff",
    hasLogin: false,
    user: {
      nickname: "Alix1997",
      avatar: "https://ossweb-img.qq.com/images/lol/web201310/skin/big99008.jpg",
      upNum: 50,
      dynamic: [],
      // 现在还不知道怎么表示作品，暂时这样
      compositionNum: 100
    },
    bgImg: "https://s1.ax1x.com/2020/04/05/Gr0HN4.jpg",
    TabCur: 0,
    scrollViewScorll: false
  },

  onLoad: function (options) {
    var that = this;

    wx.createSelectorQuery().select('#selectView').boundingClientRect(function(rect){
      that.setData({
        scrollViewEnableHeight:rect.top - that.data.CustomBar
      })
    }).exec();
  },
  onShow: function () {

  },
  doLogin:function(e){
    // getUserInfo 
    console.log(e);
    var userInfo = e.detail.userInfo;
    // 用户登录，从微信服务器获取临时凭证code
    wx.login({
      success (res) {
        console.log(res);
        if (res.code) {
          // 用户登录，向服务器传递临时凭证code，以便服务器获取openid
          util.requestFromServer('login',{code:res.code},'POST').then(res=>{
            console.log('login success');
            console.log(res);
            var data={
              openid:'oCHaq5VTb6qOnVYXMI_DFxtXzG2Q',
              name:userInfo.nickName,
              gender:userInfo.gender,
              portrait_url:userInfo.avatarUrl,
              area:userInfo.city
            };
            // 用户注册，根据获得的userinfo向服务器更新数据
            util.requestFromServer('register',data,'POST').then(res=>{
              console.log('register success');
              console.log(res);
            }).catch(err=>{
              console.log('register error');
            })
          }).catch(err=>{
            console.log('login error');
          })
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    })
  },
  /** 动态，作品，合唱切换 */
  tabSelect(e) {
    this.setData({
      TabCur: e.currentTarget.dataset.id
    })
  },
  // 滑动切换页面
  swiperChange: function (e) {
    this.setData({
      TabCur: e.detail.current,
    })
  },



  /** 顶部导航栏函数 */
  bindSetting: function (e) {

  },
  onPageScroll: function (e) {
    // 实现吸顶效果
    var scrollTop = e.scrollTop;
    if (e.scrollTop < this.data.scrollViewEnableHeight - 1) {
      this.setData({
        scrollViewScorll: false
      })
    } else {
      this.setData({
        scrollViewScorll: true
      })
    }
    // 设置顶部栏透明度变化，实现渐出效果
    this.setOpacity(scrollTop, 150);
  },
  // 顶部栏opacity变化函数
  setOpacity: function (scrollTop, maxTop) {
    var opacity = 0;
    var navBarFrontColor;
    if (scrollTop <= maxTop) {
      opacity = scrollTop / maxTop;
      navBarFrontColor = '#ffffff';
    } else {
      opacity = 1;
      navBarFrontColor = '#000000';
    }
    if (navBarFrontColor != this.data.navBarFrontColor) {
      // 踩坑，不能单独设置frontColor，需要加上backgroundColor
      wx.setNavigationBarColor({
        frontColor: navBarFrontColor,
        backgroundColor: navBarFrontColor
      })
    }
    this.setData({
      navBarOpacity: opacity,
      navBarFrontColor: navBarFrontColor
    })
  }
})