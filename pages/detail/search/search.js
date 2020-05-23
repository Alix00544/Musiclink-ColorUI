const app = getApp();
const util = require('../../../utils/util');
const cloudCallBase = app.globalData.cloudCallBase;
Page({
    data: {
        searchValue: "",
        hotSearch: ["告白气球", "周杰伦", "邓紫棋", "陈奕迅"],
        showSearch: false,
        searchResult: {
            artists: [],
            song: []
        }
    },
    onLoad: function(options) {
        var searchHistory = wx.getStorageSync('searchHistory');
        if (!searchHistory) {
            searchHistory = [];
            wx.setStorageSync('searchHistory', searchHistory);
        }
        var searchValue = options.searchValue;
        if (searchValue) {
            this.getSearch(searchValue);
            searchHistory.push(searchValue);
            searchHistory = [...new Set(searchHistory)];
        }
        this.setData({
            searchValue: searchValue || "",
            searchHistory: searchHistory
        })
    },
    onShow: function() {
        var searchHistory = wx.getStorageSync('searchHistory');
        this.setData({
            searchHistory: searchHistory
        })
    },
    onUnload: function() {
        // 更新缓存
        wx.setStorageSync('searchHistory', this.data.searchHistory)
    },
    getSearch: function(searchValue) {
        if (searchValue == '') {
            this.setData({
                showSearch: false
            })
            return;
        }
        this.setData({
            showSearch: true
        })
        var that = this;
        util.requestFromServer('search', { target: searchValue }, 'POST').then((res) => {
            console.log(res);
            var artists = [];
            var song = [];
            res.data.data.artists.forEach(v => {
                artists.push({
                    name: v.artist,
                    avatar: `${cloudCallBase}/pictures/artists/${v.artist}.jpg`
                })
            })
            res.data.data.titles.forEach(v => {
                song.push({
                    name: v.title,
                    coverImg: `${cloudCallBase}/songs/${v.title}/cover.jpg`
                })
            })
            that.setData({
                searchResult: {
                    artists: artists,
                    song: song
                }
            })
        }).catch(err => {
            console.log('搜索失败', err);
        })
    },
    debounceSearch: util.debounce(function(searchValue) {
        this.getSearch(searchValue)
    }, 1000),
    
    // 搜索栏基本操作函数
    bindSearch: function(e) {
        var searchValue = this.data.searchValue;
        var searchHistory = this.data.searchHistory;
        if (searchValue) {
            searchHistory.push(searchValue);
            searchHistory = [...new Set(searchHistory)];
            this.setData({
                searchHistory: searchHistory
            })
        }
        this.getSearch(searchValue);
        console.log("正在搜索：" + searchValue);
    },
    bindSearchInput: function(e) {
        this.setData({
            searchValue: e.detail.value,
            showSearch: false
        })
        this.debounceSearch(e.detail.value);
    },
    bindSearchChancel: function(e) {
        this.setData({
            searchValue: "",
            searchResult: [],
            showSearch: false
        })
    },
    bindDeleteHistory: function(e) {
        this.setData({
            searchHistory: []
        })
    },
    bindSearchFromTag: function(e) {
        this.setData({
            searchValue: e.currentTarget.dataset.searchValue
        })
        this.bindSearch();
    },
    bindNavToSong: function(e) {
        wx.navigateTo({
            url: '../song/song?song=' + e.currentTarget.dataset.song,
        })
    },
    bindNavToSinger: function(e) {
        wx.navigateTo({
            url: '../singer/singer?singer=' + e.currentTarget.dataset.singer,
        })
    }
})