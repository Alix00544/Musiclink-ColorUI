const app = getApp();
const util = require('../../../utils/util');
const cloudCallBase = app.globalData.cloudCallBase;
Page({

    data: {
        cloudCallBase: app.globalData.cloudCallBase
    },
    onLoad: function(options) {
        this.getSong(options.song);
    },
    getSong: function(title) {
        util.requestFromServer('songs', { title: title }, 'GET').then((res) => {
            console.log(res);
            this.setData({
                songId: res.data.data[0].id,
                song: title,
                coverImg: `${cloudCallBase}/songs/${title}/cover.jpg`,
                source: `${cloudCallBase}/songs/${title}/source.mp3`,
                singer: res.data.data[0].artist
            })
            return util.requestFromServer('singlist', { song_id: res.data.data[0].id }, 'GET')
        }).then((res) => {
            console.log(res);
            this.setData({
                userList: res.data.data
            })
        }).catch((err) => {
            console.log(err);
        })
    },
    bindNavSingMode: function(e) {
        if (wx.getStorageSync('openid')) {
            wx.navigateTo({
                url: `../singMode/singMode?song=${this.data.song}&mode=${e.currentTarget.dataset.mode}`,
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
                            url: '../../tabbar/mine/mine',
                        })
                    }
                }
            });
        }

    }
})