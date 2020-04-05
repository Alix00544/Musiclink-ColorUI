const app = getApp();
Page({

  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom,
    navBarOpacity:0,
    navBarFrontColor:"#ffffff",
    hasLogin:false,
    user:{
      nickname:"Alix1997",
      avatar:"https://ossweb-img.qq.com/images/lol/web201310/skin/big99008.jpg",
      upNum:50,
      dynamic:[],
      // 现在还不知道怎么表示作品，暂时这样
      compositionNum:100
    },
    bgImg:"https://s1.ax1x.com/2020/04/05/Gr0HN4.jpg"
  },

  onLoad: function (options) {

  },
  onShow: function () {

  },
  /** 顶部导航栏函数 */
  bindSetting:function(e){
    
  },
  onPageScroll: function (e) {
    var scrollTop = e.scrollTop;
    // 设置顶部栏透明度变化，实现渐出效果
    this.setOpacity(scrollTop,150);
  },
  // 顶部栏opacity变化函数
  setOpacity:function(scrollTop,maxTop){
    var opacity = 0;
    var navBarFrontColor;
    if(scrollTop<=maxTop){
      opacity = scrollTop/maxTop;
      navBarFrontColor = '#ffffff';
    }else{
      opacity = 1;
      navBarFrontColor = '#000000';
    }
    if(navBarFrontColor != this.data.navBarFrontColor){
      // 踩坑，不能单独设置frontColor，需要加上backgroundColor
      wx.setNavigationBarColor({
        frontColor: navBarFrontColor,
        backgroundColor:navBarFrontColor
      })
    }
    this.setData({
      navBarOpacity:opacity,
      navBarFrontColor:navBarFrontColor
    })
  }
})