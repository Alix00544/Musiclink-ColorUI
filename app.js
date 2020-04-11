//app.js
App({
  globalData: {
    userInfo: null,
    serveBase:"https://musiclink.caoyu.online/v1",
    cloudCallBase:'https://test-1301509754.file.myqcloud.com',
    cloudUploadBase:'https://test-1301509754.cos.ap-guangzhou.myqcloud.com'
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

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              // console.log(res)
              this.globalData.userInfo = res.userInfo
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
                // console.log(userInfoReadyCallback)
              }
            }
          })
        }
      }
    })
  }
})