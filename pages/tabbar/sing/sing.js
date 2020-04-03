Page({
  data: {
    // 搜索栏搜索值
    searchValue: "",
    // 轮播图列表
    swiperList: [{
      songid: 111,
      url: 'https://s2.ax1x.com/2020/03/06/3LVAIg.jpg'
    }, {
      songid: 222,
      url: 'https://s2.ax1x.com/2020/03/06/3LVkdS.jpg',
    }, {
      songid: 333,
      url: 'https://s2.ax1x.com/2020/03/06/3LVFZ8.jpg'
    }],
    // 图标列表
    iconList: [{
      "name": "发布",
      "urlname": "sendDynamic"
    }, {
      "name": "独唱",
      "urlname": "solo"
    }, {
      "name": "合唱",
      "urlname": "chorus"
    }, {
      "name": "排行榜",
      "urlname": "rankList"
    }]
  },
  onLoad: function (options) {

  },
  // 轮播图跳转
  bindSwiperNav:function(e){
    console.log(e.currentTarget.dataset.songId);
    // TODO:跳转至具体歌曲页面
  },
  // 图标栏
  bindIconNav: function (e) {
    var pageName = e.currentTarget.dataset.curIcon;
    wx.navigateTo({
      url: `../detail/${pageName}/${pageName}`
    })
  },
  // 搜索栏操作函数
  bindSearch: function (e) {
    wx.navigateTo({
      url: "../detail/search/search?searchValue=" + this.data.searchValue
    })
    this.setData({
      searchValue: ""
    })
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
  }
})