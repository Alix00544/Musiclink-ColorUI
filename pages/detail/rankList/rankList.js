const app = getApp();
Page({
  data: {
    TabCur: 0,
    scrollLeft: 0,
    CustomBar: app.globalData.CustomBar,
    WinHeight:app.globalData.WinHeight,
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
      },{
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
      },{
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
  bindSing:function(e){
    console.log(e.currentTarget.dataset.song);
    // TODO:跳转至唱歌界面
  }
})