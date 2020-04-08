const app = getApp();
const fileSystemManager = wx.getFileSystemManager();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    ScreenHeight: app.globalData.ScreenHeight,
    ScreenWidth:app.globalData.ScreenWidth,
    TabCur:0,
    selectList:[],
    song: {
      "artist": "邓紫棋",
      "title": "光年之外",
      "lyrics_url": "https://test-1301509754.file.myqcloud.com/光年之外/lyrics.txt",
      "id": 1,
      "album": "光年之外",
      "cover_url": "https://test-1301509754.file.myqcloud.com/光年之外/cover.jpg",
      "offvocal_url": "https://test-1301509754.file.myqcloud.com/光年之外/offvocal.mp3",
      "track_url": "https://test-1301509754.file.myqcloud.com/光年之外/source.mp3"
    },
    lyrics: [{ time: 0, lyrics: "歌曲名 光年之外(电影《太空旅客》主题曲) 歌手名 G.E.M.邓紫棋" }, { time: 1000, lyrics: "作词：G.E.M.邓紫棋" }, { time: 2000, lyrics: "作曲：G.E.M.邓紫棋" }, { time: 12880, lyrics: "感受停在我发端的指尖" }, { time: 16970, lyrics: "如何瞬间冻结时间" }, { time: 23750, lyrics: "记住望着我坚定的双眼" }, { time: 27790, lyrics: "也许已经没有明天" }, { time: 34330, lyrics: "面对浩瀚的星海" }, { time: 36920, lyrics: "我们微小得像尘埃" }, { time: 39470, lyrics: "漂浮在一片无奈" }
      , { time: 45210, lyrics: "缘分让我们相遇乱世以外" }
      , { time: 50640, lyrics: "命运却要我们危难中相爱" }
      , { time: 56030, lyrics: "也许未来遥远在光年之外" }
      , { time: 61520, lyrics: "我愿守候未知里为你等待" }
      , { time: 65460, lyrics: "我没想到为了你我能疯狂到" }
      , { time: 71050, lyrics: "山崩海啸没有你根本不想逃" }
      , { time: 76490, lyrics: "我的大脑为了你已经疯狂到" }
      , { time: 81920, lyrics: "脉搏心跳没有你根本不重要" }
      , { time: 89460, lyrics: "一双围在我胸口的臂弯" }
      , { time: 93250, lyrics: "足够抵挡天旋地转" }
      , { time: 100080, lyrics: "一种执迷不放手的倔强" }
      , { time: 104120, lyrics: "足以点燃所有希望" }
      , { time: 110660, lyrics: "宇宙磅礡而冷漠" }
      , { time: 113250, lyrics: "我们的爱微小却闪烁" }
      , { time: 115750, lyrics: "颠簸却如此忘我" }
      , { time: 121580, lyrics: "缘分让我们相遇乱世以外" }
      , { time: 126970, lyrics: "命运却要我们危难中相爱" }
      , { time: 132460, lyrics: "也许未来遥远在光年之外" }
      , { time: 137950, lyrics: "我愿守候未知里为你等待" }
      , { time: 141890, lyrics: "我没想到为了你我能疯狂到" }
      , { time: 147370, lyrics: "山崩海啸没有你根本不想逃" }
      , { time: 152810, lyrics: "我的大脑为了你已经疯狂到" }
      , { time: 158750, lyrics: "脉搏心跳没有你根本不重要" }
      , { time: 164340, lyrics: "也许航道以外是醒不来的梦" }
      , { time: 176910, lyrics: "乱世以外是纯粹的相拥" }
      , { time: 185640, lyrics: "我没想到为了你我能疯狂到" }
      , { time: 191080, lyrics: "山崩海啸没有你根本不想逃" }
      , { time: 196460, lyrics: "我的大脑为了你已经疯狂到" }
      , { time: 201950, lyrics: "脉搏心跳没有你根本不重要" }
      , { time: 208500, lyrics: "相遇乱世以外危难中相爱" }
      , { time: 219080, lyrics: "相遇乱世以外危难中相爱" }
      , { time: 229300, lyrics: "我没想到" }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // this.getLyrics();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  bindSing:function(e){
    var tabCur = this.data.TabCur;
    if(tabCur == 1 && this.data.selectList.length ==0){
      wx.showToast({
        title: '还未选择歌段,无法进入合唱',
        icon:'none',
        duration:2000
      })
    }else{
      var selectList = this.data.selectList.join(',');
      wx.navigateTo({
        url: `../sing/sing?mode=${tabCur}${tabCur==1?'&selectList='+selectList:''}`,
      })
    }
  },
  getLyrics: function (e) {
    var that = this;
    wx.downloadFile({
      url: this.data.song.lyrics_url,
      success(res) {
        if (res.statusCode === 200) {
          // res.tempFilePath;
          fileSystemManager.readFile({
            filePath: res.tempFilePath,
            encoding: "utf-8",
            success(res) {
              that.setLyrics(res.data);
            }
          })
        }
      }
    })
  },
  setLyrics: function (data) {
    var reg = /\[(\d\d):(\d\d.\d\d)\]([\S ]+)/g;
    var lyrics = [];
    var temp;
    while (temp = reg.exec(data)) {
      lyrics.push({
        time: temp[1] * 60 * 1000 + temp[2] * 1000,
        lyrics: temp[3]
      })
    }
    this.setData({
      lyrics: lyrics
    })
    console.log(lyrics)
  },
  tabSelect(e) {
    this.setData({
      TabCur: e.currentTarget.dataset.id
    })
  },
  swiperChange: function (e) {
    this.setData({
      TabCur: e.detail.current,
    })
  },
  bindCheckboxChange: function (e) {
    this.setData({
      selectList:e.detail.value
    })
  },
  BackPage:function(e){
    wx.navigateBack({
      delta: 1
    });
  }
})