const app = getApp();
const util = require("../../../utils/util");
const backgroundAudioManager = app.globalData.backgroundAudioManager;

Page({
    data: {
        // 搜索栏搜索值
        searchValue: "",
        // 轮播图列表
        swiperList: [{
            song: '成都',
            url: 'https://s2.ax1x.com/2020/03/06/3LVAIg.jpg'
        }, {
            song: '平凡之路',
            url: 'https://s2.ax1x.com/2020/03/06/3LVkdS.jpg',
        }, {
            song: '刚好遇见你',
            url: 'https://s2.ax1x.com/2020/03/06/3LVFZ8.jpg'
        }],
        // 图标列表
        iconList: [{
            name: "发布",
            urlname: "sendDynamic"
        }, {
            name: "歌手",
            urlname: "singer"
        }, {
            name: "合唱",
            urlname: "chorus"
        }, {
            name: "排行榜",
            urlname: "rankList"
        }, {
            name: "独唱",
            urlname: "solo"
        }],
        // 排行榜
        TabCur: 0,
        scrollLeft: 0,
        CustomBar: app.globalData.CustomBar,
        WinHeight: app.globalData.WinHeight,
        ScreenWidth: app.globalData.ScreenWidth,
        scrollViewScorll: false,
        // 当前正在播放的歌曲
        playingSongName: null,
        bgPlay: false
    },
    onLoad: function(options) {
        var that = this;
        wx.createSelectorQuery().select('#selectView').boundingClientRect(function(rect) {
            that.setData({
                scrollViewEnableHeight: rect.top - that.data.CustomBar - 100 * that.data.ScreenWidth / 750
            })
        }).exec();
        backgroundAudioManager.onStop(() => {
            console.log("sing backgroundAudioManager stop");
            this.setData({
                playingSongName: -1
            });
            this.globalData.curPlayAudio = -1;
        });
    },
    onShow: function() {
        this.getRankList();
        this.setData({
            playingSongName: app.globalData.curPlayAudio
        })
    },
    getRankList: function() {
        util.requestFromServer('list', {}, 'GET').then((res) => {
            console.log(res);
            this.setData({
                ranklist: util.parsingRanklist(res)
            })
        }).catch((err) => {
            console.log('获取榜单内容失败', err);
        })
    },
    /** 排行榜切换 */
    tabSelect(e) {
        this.setData({
            TabCur: e.currentTarget.dataset.id,
            scrollLeft: (e.currentTarget.dataset.id - 1) * 60
        })
    },
    // 滑动切换页面
    swiperChange: function(e) {
        this.setData({
            TabCur: e.detail.current,
            scrollLeft: (e.detail.current - 1) * 60
        })
    },
    bindSing: function(e) {
        if (wx.getStorageSync('openid')) {
            console.log(e.currentTarget.dataset.song);
            wx.navigateTo({
                url: '../../detail/singMode/singMode?song=' + e.currentTarget.dataset.song,
            })
        } else {
            wx.showModal({
                title: '提示',
                content: '未登录无法进入唱歌页面',
                showCancel: true,
                cancelText: '取消',
                confirmText: '去登录',
                success: (result) => {
                    if (result.confirm) {
                        wx.switchTab({
                            url: '../mine/mine',
                        })
                    }
                }
            });
        }
    },
    bindNavSong: function(e) {
        wx.navigateTo({
            url: '../../detail/song/song?song=' + e.currentTarget.dataset.song,
        })
    },
    catchPlayAudio: function(e) {
        console.log('catchPlayAudio:' + e.currentTarget.dataset.songName);
        var playingSongName = this.data.playingSongName;
        var curSongName = e.currentTarget.dataset.songName;
        var bgPlay;
        if (playingSongName == curSongName) {
            if (backgroundAudioManager.paused) {
                backgroundAudioManager.play();
                bgPlay = true;
            } else {
                backgroundAudioManager.pause();
                bgPlay = false;
            }
        } else {
            // 播放新歌 或 切歌
            backgroundAudioManager.title = curSongName;
            // 设置了 src 之后会自动播放
            backgroundAudioManager.src = `https://test-1301509754.file.myqcloud.com/songs/${curSongName}/source.mp3`;
            bgPlay = true;
        }
        this.setData({
            playingSongName: curSongName,
            bgPlay: bgPlay
        });
        app.globalData.curPlayAudio = curSongName;
    },
    // 原来实现的吸顶方法，废弃，太卡顿了
    // bindscroll: function (e) {
    //   // 巧妙实现吸顶效果,棒棒哒
    //   // 当scroll-view向上滑时才可能会形成吸顶
    //   console.log(e)
    //   if (e.detail.deltaY < 0) {
    //     wx.pageScrollTo({
    //       scrollTop: this.data.WinHeight,
    //       duration: 30
    //     })
    //   }
    //   if (e.detail.deltaY > 0 && e.detail.scrollTop < 10) {
    //     wx.pageScrollTo({
    //       scrollTop: 0,
    //       duration: 30
    //     })
    //   }
    // },
    onPageScroll: function(e) {
        var scrollViewScorll = this.data.scrollViewScorll;
        if (e.scrollTop < this.data.scrollViewEnableHeight - 5) {
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
    },
    /** 图标栏 */
    bindIconNav: function(e) {
        // TODO 合唱、独唱页面做区分
        var pageName = e.currentTarget.dataset.curIcon;
        wx.navigateTo({
            url: `../../detail/${pageName}/${pageName}`
        })
    },
    /** 轮播图跳转 */
    bindSwiperNav: function(e) {
        console.log(e.currentTarget.dataset.song);
        this.bindNavSong(e)
    },
    /** 搜索栏操作函数 */
    bindSearch: function(e) {
        wx.navigateTo({
            url: "../../detail/search/search?searchValue=" + this.data.searchValue
        })
        this.setData({
            searchValue: ""
        })
    },
    bindSearchInput: function(e) {
        this.setData({
            searchValue: e.detail.value
        })
    },
    bindSearchChancel: function(e) {
        this.setData({
            searchValue: ""
        })
    }
})