Page({
  data: {
    searchValue:""
  },
  onLoad: function (options) {

  },
  // 搜索栏操作函数
  bindSearch:function(e){
    wx.navigateTo({
      url:"../detail/search/search?searchValue="+this.data.searchValue
    })
    this.setData({
      searchValue:""
    })
  },
  bindSearchInput:function(e){
    this.setData({
      searchValue:e.detail.value
    })
  },
  bindSearchChancel:function(e){
    this.setData({
      searchValue:""
    })
  }
})