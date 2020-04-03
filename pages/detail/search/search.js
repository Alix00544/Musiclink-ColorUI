Page({
  data: {
    searchValue: ""
  },
  onLoad: function (options) {
    var searchHistory = wx.getStorageSync('searchHistory');
    if (!searchHistory) {
      searchHistory = [];
      wx.setStorageSync('searchHistory', searchHistory);
    }
    var searchValue = options.searchValue;
    if (searchValue) {
      searchHistory.push(searchValue);
      searchHistory = [...new Set(searchHistory)];
    }
    this.setData({
      searchValue: searchValue || "",
      searchHistory: searchHistory
    })
  },
  onShow: function () {
    var searchHistory = wx.getStorageSync('searchHistory');
    this.setData({
      searchHistory: searchHistory
    })
  },
  onUnload: function () {
    // 更新缓存
    wx.setStorageSync('searchHistory', this.data.searchHistory)
  },

  // 搜索栏基本操作函数
  bindSearch: function (e) {
    var searchValue = this.data.searchValue;
    var searchHistory = this.data.searchHistory;
    if (searchValue) {
      searchHistory.push(searchValue);
      searchHistory = [...new Set(searchHistory)];
      this.setData({
        searchHistory: searchHistory
      })
    }
    // TODO:执行搜索操作
    console.log("正在搜索：" + searchValue);
  },
  bindSearchInput: function (e) {
    this.setData({
      searchValue: e.detail.value
    })
  },
  bindSearchChancel: function (e) {
    this.setData({
      searchValue: ""
    })
  },
  bindDeleteHistory:function(e){
    this.setData({
      searchHistory:[]
    })
  },
  bindSearchFromHistory:function(e){
    this.setData({
      searchValue:e.currentTarget.dataset.searchValue
    })
    this.bindSearch();
  }
})