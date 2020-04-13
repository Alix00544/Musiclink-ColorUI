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

        this.setData({
            dynamicId: options.dynamicId
        })
    },
    onShow: function() {
        var curDynamic;
        var dynamicId = this.data.dynamicId;
        var dynamicListObj = wx.getStorageSync('dynamicListObj');
        if (dynamicListObj && dynamicListObj[dynamicId]) {
            curDynamic = dynamicListObj[dynamicId];
        } else {
            // 考虑到用户通过分享进入该页面，所以storage中可能没有该数据
            curDynamic = this.getDynamicById(dynamicId);
            this.getCommentsById(dynamicId);
        }
    },
    getDynamicById: function(dynamicId) {
        var that = this;
        util.requestFromServer('dynamic', { id: dynamicId }, 'GET').then(res => {
            if (res.data.data) {
                console.log('dynamic', res);
                var value = res.data.data[0];
                var curDynamic = {
                        dynamicId: value.id,
                        senderAvatar: value.portrait_url,
                        senderNickName: value.name,
                        creatTime: value.create_time,
                        sendTime: util.getShowTime(value.create_time),
                        content: value.content,
                        images: [],
                        upNum: value.thumbs,
                        commentsNum: value.comments,
                        comments: [],
                        paticipators: value.paticipators,
                        userId: value.user_id,
                        song: {
                            id: value.list_id,
                            cover: `${cloudCallBase}/songs/${value.title}/cover.jpg`,
                            source: `${cloudCallBase}/records/segments/${value.list_id}.mp3`,
                            name: value.title,
                            score: value.scores,
                            needChorus: value.is_private,
                            listenNum: value.listens
                        }
                    }
                    // 添加图片信息
                for (let i = 0; i < value.pictures; i++) {
                    curDynamic.images.push(`${cloudCallBase}/pictures/dynamic/${value.id}/${i}.jpg`);
                }
                that.setData({
                    curDynamic: curDynamic
                })
            }
        }).catch(err => {
            console.log('获取动态失败', err);
        })
    },
    getCommentsById: function(dynamicId) {

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