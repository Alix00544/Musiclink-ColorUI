//app.js
App({
  globalData: {
    userInfo: null,
    serveBase:"https://musiclink.caoyu.online/v1"
  },
  onLaunch: function () {
    // 获取系统信息，为custom顶部栏做准备
    wx.getSystemInfo({
      success: e => {
        this.globalData.StatusBar = e.statusBarHeight;
        this.globalData.WinHeight = e.windowHeight;
        this.globalData.ScreenHeight = e.screenHeight;
        this.globalData.ScreenWidth = e.screenWidth;
        //胶囊按钮的布局位置信息
        let capsule = wx.getMenuButtonBoundingClientRect();
        if (capsule) {
          this.globalData.Custom = capsule;
          this.globalData.CustomBar = capsule.bottom + capsule.top - e.statusBarHeight;
        } else {
          this.globalData.CustomBar = e.statusBarHeight + 50;
        }
      }
    })
  }
})