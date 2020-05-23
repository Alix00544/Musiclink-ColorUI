const app = getApp();
const util = require('../../../utils/util')
const cloudCallBase = app.globalData.cloudCallBase;
Page({
    data: {
        StatusBar: app.globalData.StatusBar, //状态栏高度
        CustomBar: app.globalData.CustomBar, //NavBar整体高度
        WinHeight: app.globalData.WinHeight, //可使用窗口高度
        currentTab: 0,
        // 动态内容
        playingSongId: -1,
        // 是否展示底部弹出评论栏
        showComments: false,
        // 当前动态的评论
        curentComments: [],
        hotDynamicList: [],
        // 评论
        curComments: [],
        placeholder: '唱的真好，夸夸TA~',
        inputFocus: false,
        inputValue: "",
        curDynamic: [],
        // 动态刷新标志
        trigger: false
    },

    onLoad: function(options) {
        this.getDynamic();
        this.setData({
            openid: wx.getStorageSync('openid'),
            toUid: wx.getStorageSync('openid')
        })
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        this.getDynamic();
    },
    onPullDownRefresh: function() {
        // 触发下拉刷新时执行
        console.log("触发下拉刷新");
        this.getDynamic();
        wx.stopPullDownRefresh()
    },
    bindrefresherpulling: function() {
        this.setData({
            trigger: true
        })
    },
    bindrefresherrefresh: function() {
        console.log("bindrefresher触发下拉刷新");
        this.getDynamic();
        var that = this;
        setTimeout(function() {
            that.setData({
                trigger: false
            })
        }, 1000)
    },
    bindrefresherrestore: function() {
        console.log("bindrefresherrestore,结束");
    },
    /** 自定义顶部栏函数 */
    //点击上部文字切换页面
    swichNav: function(e) {
        var that = this;
        var current = e.target.dataset.current;
        if (this.data.currentTab === current) {
            return false;
        } else {
            that.setData({
                currentTab: current,
            })
        }
    },
    // 滑动切换页面
    swiperChange: function(e) {
        this.setData({
            currentTab: e.detail.current,
        })
    },
    // 跳转到搜索页面
    navToSearch: function(e) {
        wx.navigateTo({
            url: "../../detail/search/search"
        })
    },
    /** 动态中的函数 */
    // 点击动态，跳转到具体页面
    bindNavDynamicDetail: function(e) {
        // dynamicId
        console.log('bindNavDynamicDetail:' + e.currentTarget.dataset.dynamicId);
        console.log(e);
        var dynamicId = e.currentTarget.dataset.dynamicId;
        wx.navigateTo({
            url: "../../detail/dynamicDetail/dynamicDetail?dynamicId=" + dynamicId
        })
    },
    // 播放/暂停音乐
    catchPlayAudio: function(e) {
        // songId
        console.log('catchPlayAudio:' + e.currentTarget.dataset.songId);
        console.log(e);
        var playingSongId = this.data.playingSongId;
        var curSongId = e.currentTarget.dataset.songId;
        this.setData({
            playingSongId: playingSongId == curSongId ? -1 : curSongId
        })
    },
    // 合唱:跳转至歌曲合唱页面
    catchChorus: function(e) {
        // songId
        console.log('catchChorus:' + e.currentTarget.dataset.songId);
        console.log(e);
    },
    // 分享
    catchShare: function(e) {
        // songId
        console.log('catchShare:' + e.currentTarget.dataset.songId);
        console.log(e);
    },
    onShareAppMessage: function(res) {
        console.log("onShareAppMessage", res.target.dataset.idx);
        var idx = res.target.dataset.idx;
        var dynamic = this.data.hotDynamicList[idx];
        var img = dynamic.song.cover;
        if (dynamic.images.length > 0) {
            img = dynamic.images[0]
        }
        var titleString = `快来欣赏${dynamic.senderNickName}演唱的《${dynamic.song.name}》！`;
        return {
            title: titleString,
            path: "/pages/detail/dynamicDetail/dynamicDetail?dynamicId=" + dynamic.dynamicId,
            imageUrl: img
        }
    },


    // 点赞
    catchUp: function(e) {
        // TODO:点赞还未完成
        // dynamicId
        console.log('catchUp:' + e.currentTarget.dataset.dynamicId);
        console.log(e);
    },
    // 点击评论按钮
    catchComments: function(e) {
        this.getCommentsById(e.currentTarget.dataset.dynamicId);
        this.setData({
            showComments: true,
            curDynamicId: e.currentTarget.dataset.dynamicId
        })
    },
    // 隐藏底部评论弹出框
    bindHideComments: function(e) {
        this.setData({
            showComments: false
        })
    },
    /** 获取动态信息 */
    getDynamic() {
        var that = this;
        var dynamicListObj = {};
        util.requestFromServer('dynamic', { limit: this.data.hotDynamicList.length + 10 }, 'GET').then(res => {
            if (res.data.data) {
                console.log('dynamic', res);
                res.data.data.forEach(v => {
                    var data = {
                            dynamicId: v.id,
                            senderAvatar: v.portrait_url,
                            senderNickName: v.name,
                            creatTime: v.create_time,
                            sendTime: util.getShowTime(v.create_time),
                            content: v.content,
                            images: [],
                            upNum: v.thumbs,
                            commentsNum: v.comments,
                            comments: [],
                            paticipators: v.paticipators,
                            userId: v.user_id,
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
                        // 添加图片信息
                    for (let i = 0; i < v.pictures; i++) {
                        data.images.push(`${cloudCallBase}/pictures/dynamic/${v.id}/${v.create_time}-${i}.jpg`);
                    }
                    dynamicListObj[v.id] = data;
                })
            }
        }).then(res => {
            // 根据时间排序,最新的放在上面,对象根据键值对排序
            // 对象排序后，微信wx:for 会根据 对象索引升序排序..... 也就是说dynamicList 用对象渲染,会按照动态id排序.
            // 所以不能使用对象存储
            // var sortedData = {};
            // var keysSorted = Object.keys(dynamicList).sort((a,b)=>{
            //     return dynamicList[b].creatTime - dynamicList[a].creatTime;
            // })
            // for(let i=0;i<keysSorted.length;i++){
            //     sortedData[keysSorted[i]]=dynamicList[keysSorted[i]];
            // }

            // 按时间排序
            var dynamicList = Object.values(dynamicListObj).sort((a, b) => {
                return b.creatTime - a.creatTime;
            })

            that.setData({
                    hotDynamicList: dynamicList
                })
                // 对象给动态展示页面用
            wx.setStorageSync('dynamicListObj', dynamicListObj);
            console.log("动态数据已更新,共" + dynamicList.length + "条。");

        }).catch(err => {
            console.log('获取用户动态失败', err)
        })
    },
    // 评论相关函数
    getCommentsById: function(dynamicId) {
        var that = this;
        util.requestFromServer('comment', { dynamic_id: dynamicId, limit: 500 }, 'GET').then(res => {
            console.log('获取最新的评论', res);
            if (res.data.data.length > 0) {
                var curComments = res.data.data;
                curComments.forEach(v => {
                    v.showReply_time = util.getShowTime(v.reply_time);
                })
                var dynamicList = that.data.hotDynamicList;
                for (let i = 0; i < dynamicList.length; i++) {
                    if (dynamicList[i].dynamicId == dynamicId) {
                        dynamicList[i].commentsNum = curComments.length;
                    }
                }
                that.setData({
                    curComments: curComments,
                    hotDynamicList: dynamicList
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
                            url: '../mine/mine',
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
            dynamic_id: that.data.curDynamicId
        }, 'POSt').then(res => {
            console.log('发送评论成功', res);
            that.setData({
                inputFocus: false,
                toUid: that.data.openid,
                placeholder: "唱的真好，夸夸TA~",
                inputValue: ''
            })
            that.getCommentsById(that.data.curDynamicId);
        }).catch(err => {
            console.log('发布评论失败', err);
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
    }
})