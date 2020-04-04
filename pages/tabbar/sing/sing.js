const app = getApp();
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
    ranklist: [{
      rankname: "热门榜",
      songlist: [{
        name: "温柔1",
        singer: "五月天",
        coverImg: "https://p1.music.126.net/s47PMA_wT4IF5HFKfDxhzg==/109951164836564113.jpg"
      }, {
        name: "温柔2",
        singer: "五月天",
        coverImg: "https://p1.music.126.net/s47PMA_wT4IF5HFKfDxhzg==/109951164836564113.jpg"
      }, {
        name: "温柔3",
        singer: "五月天",
        coverImg: "https://p1.music.126.net/s47PMA_wT4IF5HFKfDxhzg==/109951164836564113.jpg"
      }, {
        name: "温柔4",
        singer: "五月天",
        coverImg: "https://p1.music.126.net/s47PMA_wT4IF5HFKfDxhzg==/109951164836564113.jpg"
      }, {
        name: "温柔5",
        singer: "五月天",
        coverImg: "https://p1.music.126.net/s47PMA_wT4IF5HFKfDxhzg==/109951164836564113.jpg"
      }, {
        name: "温柔6",
        singer: "五月天",
        coverImg: "https://p1.music.126.net/s47PMA_wT4IF5HFKfDxhzg==/109951164836564113.jpg"
      }, {
        name: "温柔7",
        singer: "五月天",
        coverImg: "https://p1.music.126.net/s47PMA_wT4IF5HFKfDxhzg==/109951164836564113.jpg"
      }, {
        name: "温柔8",
        singer: "五月天",
        coverImg: "https://p1.music.126.net/s47PMA_wT4IF5HFKfDxhzg==/109951164836564113.jpg"
      }, {
        name: "温柔9",
        singer: "五月天",
        coverImg: "https://p1.music.126.net/s47PMA_wT4IF5HFKfDxhzg==/109951164836564113.jpg"
      }, {
        name: "温柔10",
        singer: "五月天",
        coverImg: "https://p1.music.126.net/s47PMA_wT4IF5HFKfDxhzg==/109951164836564113.jpg"
      }]
    }, {
      rankname: "外语榜",
      songlist: [{
        name: "温柔11",
        singer: "五月天",
        coverImg: "https://p1.music.126.net/s47PMA_wT4IF5HFKfDxhzg==/109951164836564113.jpg"
      }, {
        name: "温柔22",
        singer: "五月天",
        coverImg: "https://p1.music.126.net/s47PMA_wT4IF5HFKfDxhzg==/109951164836564113.jpg"
      }, {
        name: "温柔33",
        singer: "五月天",
        coverImg: "https://p1.music.126.net/s47PMA_wT4IF5HFKfDxhzg==/109951164836564113.jpg"
      }]
    }, {
      rankname: "抖音榜",
      songlist: [{
        name: "温柔111",
        singer: "五月天",
        coverImg: "https://p1.music.126.net/s47PMA_wT4IF5HFKfDxhzg==/109951164836564113.jpg"
      }, {
        name: "温柔222",
        singer: "五月天",
        coverImg: "https://p1.music.126.net/s47PMA_wT4IF5HFKfDxhzg==/109951164836564113.jpg"
      }, {
        name: "温柔333",
        singer: "五月天",
        coverImg: "https://p1.music.126.net/s47PMA_wT4IF5HFKfDxhzg==/109951164836564113.jpg"
      }]
    }]
  },
  onLoad: function (options) {

  },
  /** 排行榜切换 */
  tabSelect(e) {
    this.setData({
      TabCur: e.currentTarget.dataset.id,
      scrollLeft: (e.currentTarget.dataset.id - 1) * 60
    })
  },
  // 滑动切换页面
  swiperChange: function (e) {
    this.setData({
      TabCur: e.detail.current,
    })
  },
  bindSing: function (e) {
    console.log(e.currentTarget.dataset.song);
    // TODO:跳转至唱歌界面
  },
  bindscroll: function (e) {
    // 巧妙实现吸顶效果,棒棒哒
    // 当scroll-view向上滑时才可能会形成吸顶
    if (e.detail.deltaY < 0 && e.detail.scrollTop < 50) {
      wx.pageScrollTo({
        scrollTop: this.data.WinHeight,
        duration: 40
      })
    }
    if (e.detail.deltaY > 0 && e.detail.scrollTop < 30) {
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 40
      })
    }
  },
  /** 图标栏 */
  bindIconNav: function (e) {
    var pageName = e.currentTarget.dataset.curIcon;
    wx.navigateTo({
      url: `../detail/${pageName}/${pageName}`
    })
  },
  /** 轮播图跳转 */
  bindSwiperNav: function (e) {
    console.log(e.currentTarget.dataset.songId);
    // TODO:跳转至具体歌曲页面
  },
  /** 搜索栏操作函数 */
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