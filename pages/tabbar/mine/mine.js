const app = getApp();
const util = require('../../../utils/util');
const cloudCallBase = app.globalData.cloudCallBase;
Page({

    data: {
        // 系统数据
        StatusBar: app.globalData.StatusBar,
        CustomBar: app.globalData.CustomBar,
        WinHeight: app.globalData.WinHeight,
        ScreenWidth: app.globalData.ScreenWidth,
        // 用户登录
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        hasUserInfo: false,
        // 顶部栏渐变
        navBarOpacity: 0,
        navBarFrontColor: "#ffffff",
        // 用户栏背景图片
        bgImg: "https://s1.ax1x.com/2020/04/05/Gr0HN4.jpg",
        // 选择栏数据
        TabCur: 0,
        scrollViewScorll: false,
        selectList: ['动态', '作品', '合唱'],
        upNums: 0,
        mySongs: [],
        dynamicList: [],
        scrollViewEnableHeight: 180 + app.globalData.StatusBar - app.globalData.CustomBar
    },

    onLoad: function(options) {
        var that = this;
        // 选择栏定位
        // wx.createSelectorQuery().select('#selectView').boundingClientRect(function(rect) {
        //     that.setData({
        //         userInfo: app.globalData.userInfo,
        //         hasUserInfo: Boolean(app.globalData.userInfo),
        //         scrollViewEnableHeight: rect.top - that.data.CustomBar
        //     })
        // }).exec();
        if (wx.getStorageSync('openid')) {
            that.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: Boolean(app.globalData.userInfo)
            })
        }


    },
    onShow: function() {
        var openid = wx.getStorageSync('openid');
        if (openid) {
            this.getDynamic(openid);
            this.getMySongs(openid);
        }
    },
    onPageScroll: function(e) {
        // 实现吸顶效果
        var scrollTop = e.scrollTop;
        var scrollViewScorll = this.data.scrollViewScorll;
        if (e.scrollTop < this.data.scrollViewEnableHeight - 1) {
            // 减1是因为，定位值有偏差，但不大
            if (scrollViewScorll) {
                this.setData({
                    scrollViewScorll: false
                })
            }
        } else {
            if (!scrollViewScorll) {
                this.setData({
                    scrollViewScorll: true
                })
            }
        }
        // 实现顶部栏渐变效果，设置透明度变化
        this.setOpacity(scrollTop, this.data.scrollViewEnableHeight - 10);
    },
    bindDeleteDynamic: function(e) {
        var dynamicId = e.currentTarget.dataset.dynamicId;
        var that = this;
        wx.showModal({
            title: '提示',
            content: '确认删除该动态么？',
            success(res) {
                if (res.confirm) {
                    util.requestFromServer(`dynamic?id=${dynamicId}`, {}, 'DELETE').then(res => {
                        console.log('用户删除了动态', res);
                        if (res.data.status == 200) {
                            var list = that.data.dynamicList;
                            var images;
                            for (let i = 0; i < list.length; i++) {
                                if (list[i].dynamicId == dynamicId) {
                                    images = list[i].images;
                                    list.splice(i, 1);
                                    break;
                                }
                            }
                            that.setData({
                                    dynamicList: list
                                })
                                // TODO 将对象存储中的图片删除
                            var imgObj = [];
                            var len = images.length;
                            if (len > 0) {
                                for (let i = 0; i < len; i++) {
                                    imgObj.push({
                                        Key: images[i].split('' + cloudCallBase + '/')[1]
                                    })
                                }
                                console.log(imgObj);
                                var cos = util.getCos();
                                cos.deleteMultipleObject({
                                    Bucket: 'test-1301509754',
                                    Region: 'ap-guangzhou',
                                    Objects: imgObj
                                }, function(err, data) {
                                    console.log('用户删除了图片', err || data);
                                    // 应该对返回参数进行检查
                                    // 参照下面图片的信息
                                    // status = 200证明删除成功
                                });
                            }
                        }
                    })
                } else if (res.cancel) {
                    console.log('用户点击了取消')
                }
            }
        })
    },
    /** 获取动态信息 */
    getDynamic(openid) {
        var that = this;
        var dynamicList = [];
        var upNums = 0;
        util.requestFromServer('dynamic', { user_id: openid }, 'GET').then(res => {
            if (res.data.data) {
                console.log('dynamic', res);
                res.data.data.forEach(v => {
                    var data = {
                        dynamicId: v.id,
                        senderAvatar: app.globalData.userInfo.avatarUrl,
                        senderNickName: app.globalData.userInfo.nickName,
                        creatTime: v.create_time,
                        sendTime: util.getShowTime(v.create_time),
                        content: v.content,
                        images: [],
                        upNum: v.thumbs,
                        commentsNum: v.comments,
                        comments: [],
                        paticipators: v.paticipators,
                        song: {
                            id: v.list_id,
                            cover: `${cloudCallBase}/songs/${v.title}/cover.jpg`,
                            source: `${cloudCallBase}/records/segments/${v.list_id}.mp3`,
                            name: v.title,
                            score: v.scores,
                            needChorus: v.is_private,
                            listenNum: v.listens
                        }
                    }
                    upNums += v.thumbs;
                    // 添加图片信息
                    for (let i = 0; i < v.pictures; i++) {
                        data.images.push(`${cloudCallBase}/pictures/dynamic/${v.id}/${i}.jpg`);
                    }
                    dynamicList.push(data);
                })
            }
        }).then(res => {
            that.setData({
                dynamicList: dynamicList,
                upNums: upNums
            })
        }).catch(err => {
            console.log('获取用户动态失败', err)
        })
    },
    getMySongs: function(openid) {
        var that = this;
        var openid = wx.getStorageSync('openid');
        util.requestFromServer('singlist', { user_id: openid }, 'GET').then((res) => {
            console.log(res.data)
            var mySongs = [];
            res.data.data.forEach(v => {
                mySongs.push({
                    insertId: v.id,
                    song: v.title,
                    singer: v.name,
                    coverImg: `${cloudCallBase}/songs/${v.title}/cover.jpg`,
                    source: `${cloudCallBase}/records/segments/${v.id}.mp3`,
                    scores: v.scores
                })
            })
            that.setData({
                mySongs: mySongs
            })
        }).catch((err) => {
            console.log('获取用户作品数据错误', err);
        })
    },
    /** 用户登录 */
    doLogin: function(e) {
        var that = this;
        if (e.detail.errMsg == "getUserInfo:ok") {
            // getUserInfo 
            console.log(e);
            var userInfo = e.detail.userInfo;
            // 更新数据
            app.globalData.userInfo = userInfo;
            this.setData({
                    hasUserInfo: true,
                    userInfo: userInfo
                })
                // 用户登录，从微信服务器获取临时凭证code
            wx.login({
                success(res) {
                    console.log(res);
                    if (res.code) {
                        // 用户登录，向服务器传递临时凭证code，以便服务器获取openid
                        util.requestFromServer('login', { code: res.code }, 'POST').then(res => {
                            console.log('login success');
                            console.log(res);
                            var data = {
                                openid: res.data.data[0].openid,
                                name: userInfo.nickName,
                                gender: userInfo.gender,
                                portrait_url: userInfo.avatarUrl,
                                area: userInfo.city
                            };
                            // console.log(data);
                            var openid = res.data.data[0].openid;
                            wx.setStorageSync('openid', openid);

                            // 用户注册，根据获得的userinfo向服务器更新数据
                            util.requestFromServer('register', data, 'POST').then(res => {
                                console.log('register success');
                                that.getDynamic(openid);
                                that.getMySongs(openid);
                                console.log(res);
                            }).catch(err => {
                                console.log('register error', err);
                            })
                        }).catch(err => {
                            console.log('login error');
                        })
                    } else {
                        console.log('登录失败！' + res.errMsg)
                    }
                }
            })
        }
    },
    /** 动态，作品，合唱切换 */
    tabSelect(e) {
        this.setData({
            TabCur: e.currentTarget.dataset.id
        })
    },
    swiperChange: function(e) {
        // 滑动切换页面
        this.setData({
            TabCur: e.detail.current,
        })
    },
    /** 顶部导航栏函数 */
    bindSetting: function(e) {
        wx.navigateTo({
            url: '../../detail/settings/settings',
        })
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
    }
})