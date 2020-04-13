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
        hotDynamicList: []
    },

    onLoad: function(options) {
        this.getDynamic();
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

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
    // 点赞
    catchUp: function(e) {
        // dynamicId
        console.log('catchUp:' + e.currentTarget.dataset.dynamicId);
        console.log(e);
    },
    // 点击评论按钮
    catchComments: function(e) {
        // dynamicId
        // TODO:根据动态ID获取当前评论
        this.setData({
            showComments: true,
            curentComments: [e.currentTarget.dataset.dynamicId]
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
                        data.images.push(`${cloudCallBase}/pictures/dynamic/${v.id}/${i}.jpg`);
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
            var dynamicList = Object.values(dynamicListObj).sort((a, b) => {
                return b.creatTime - a.creatTime;
            })

            that.setData({
                    hotDynamicList: dynamicList
                })
                // 对象给动态展示页面用
            wx.setStorageSync('dynamicListObj', dynamicList);
        }).catch(err => {
            console.log('获取用户动态失败', err)
        })
    },
})