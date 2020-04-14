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
        swiperList: [],
        scrollViewEnableHeight: app.globalData.ScreenWidth - app.globalData.CustomBar,
        curComments: [],
        placeholder: '唱的真好，夸夸TA~',
        inputFocus: false,
        inputValue: "",
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var openid = wx.getStorageSync('openid');
        this.setData({
            dynamicId: options.dynamicId,
            openid: openid,
            toUid: openid
        })
    },
    onShow: function() {
        var curDynamic, swiperList;
        var dynamicId = this.data.dynamicId;
        var dynamicListObj = wx.getStorageSync('dynamicListObj');
        if (dynamicListObj && dynamicListObj[dynamicId]) {
            curDynamic = dynamicListObj[dynamicId];
            curDynamic.sendTime = util.getShowTime(curDynamic.creatTime);
            if (curDynamic.images.length > 0) {
                swiperList = curDynamic.images;
            } else {
                swiperList = [curDynamic.song.cover]
            }
            this.setData({
                swiperList: swiperList,
                curDynamic: curDynamic
            })
        } else {
            // 考虑到用户通过分享进入该页面，所以storage中可能没有该数据
            this.getDynamicById(dynamicId);
        }
        // 动态的更新频率可能比较高...
        this.getCommentsById(dynamicId);
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
                            needChorus: value.is_shared,
                            listenNum: value.listens
                        }
                    }
                    // 添加图片信息
                for (let i = 0; i < value.pictures; i++) {
                    curDynamic.images.push(`${cloudCallBase}/pictures/dynamic/${value.id}/${value.create_time}-${i}.jpg`);
                }
                that.setData({
                    curDynamic: curDynamic,
                    swiperList: curDynamic.images.length > 0 ? curDynamic.images : [curDynamic.song.cover]
                })
            }
        }).catch(err => {
            console.log('获取动态失败', err);
        })
    },
    getCommentsById: function(dynamicId) {
        var that = this;
        util.requestFromServer('comment', { dynamic_id: dynamicId, limit: 500 }, 'GET').then(res => {
            console.log('获取最新的评论', res);
            if (res.data.data.length > 0) {
                var curComments = res.data.data;
                curComments.forEach(v => {
                    v.showReply_time = util.getShowTime(v.reply_time);
                })
                that.setData({
                    curComments: curComments
                })
            } else {
                that.setData({
                    curComments: []
                })
            }
        }).catch(err => {
            console.log('获取动态评论失败', err);
        })
    },
    bindToSend: function(e) {
        this.setData({
            inputFocus: true,
            toUid: e.currentTarget.dataset.toUid,
            placeholder: '回复 ' + e.currentTarget.dataset.toName + '：'
        })
    },
    bindSendComment: function(e) {
        if (this.data.openid) {
            if (this.data.inputValue.length > 0) {
                this.sendComment(this.data.toUid, this.data.inputValue);
            } else {
                wx.showToast({
                    title: '连音符:还未输入内容',
                    icon: 'none',
                    duration: 1500
                });
            }
        } else {
            wx.showModal({
                title: '提示',
                content: '还未登录，无法回复评论，请至"我的"页面登录',
                showCancel: true,
                cancelText: '取消',
                confirmText: '去登录',
                success: (result) => {
                    if (result.confirm) {
                        wx.navigateTo({
                            url: '../../tabbar/mine/mine',
                        });
                    }
                }
            });
        }
    },
    sendComment: function(toUid, content) {
        var that = this;
        util.requestFromServer('comment', {
            user_id: that.data.openid,
            to_uid: toUid,
            content: content,
            dynamic_id: that.data.dynamicId
        }, 'POSt').then(res => {
            console.log('发送评论成功', res);
            that.setData({
                inputFocus: false,
                toUid: that.data.openid,
                placeholder: "唱的真好，夸夸TA~",
                inputValue: ''
            })
            that.getCommentsById(that.data.dynamicId);
        }).catch(err => {
            console.log('发布评论失败', err);
        })
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
    bindCommentInput: function(e) {
        this.setData({
            inputValue: e.detail.value
        })
    },
    bindCommentChancel: function(e) {
        this.setData({
            inputValue: ""
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