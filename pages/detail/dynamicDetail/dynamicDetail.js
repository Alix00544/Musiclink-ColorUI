const app = getApp();
const util = require('../../../utils/util');
const cloudCallBase = app.globalData.cloudCallBase;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        StatusBar: app.globalData.StatusBar,
        CustomBar: app.globalData.CustomBar,
        WinHeight: app.globalData.WinHeight,
        ScreenWidth: app.globalData.ScreenWidth,
        Custom: app.globalData.Custom,
        navBarOpacity: 0,
        navBarFrontColor: "#ffffff",
        bgImg: "https://s1.ax1x.com/2020/04/05/Gr0HN4.jpg",
        swiperList: ["https://s1.ax1x.com/2020/04/05/Gr0HN4.jpg", "https://s1.ax1x.com/2020/04/05/Gr0HN4.jpg", "https://s1.ax1x.com/2020/04/05/Gr0HN4.jpg"],
        scrollViewEnableHeight: app.globalData.ScreenWidth - app.globalData.CustomBar
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

    },
    onPageScroll: function(e) {
        // 实现吸顶效果
        var scrollTop = e.scrollTop;
        // 实现顶部栏渐变效果，设置透明度变化
        this.setOpacity(scrollTop, this.data.scrollViewEnableHeight - 10);
    },
    // 顶部栏opacity变化函数
    setOpacity: function(scrollTop, maxTop) {
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
        if (this.data.navBarOpacity != opacity) {
            this.setData({
                navBarOpacity: opacity,
                navBarFrontColor: navBarFrontColor
            })
        }
    },
    BackPage: function() {
        wx.navigateBack({
            delta: 1
        });
    },
    toHome: function() {
        wx.reLaunch({
            url: '/pages/tabbar/sing/sing',
        })
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    }
})