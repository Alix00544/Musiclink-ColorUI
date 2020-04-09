const app = getApp();
const util = require('../../../utils/util');
const offvocalAudio = wx.createInnerAudioContext();
const sourceAudio = wx.createInnerAudioContext();
Page({
  data: {
    CustomBar: app.globalData.CustomBar,
    ScreenHeight: app.globalData.ScreenHeight,
    rpxTopx: app.globalData.ScreenWidth / 750,
    showWait: false, // 歌词倒计时是否显示
    curLyrics: 0,  // 当前应该唱的句子
    curShowLyrics: 0, // 当前展示的标红句子，该值在用户取词时会与curLyric不同
    isScroll: false, //控制取词线是否出现
    isRecord: false, // 录音状态，控制呼吸灯
    isOffvocal: true, // 是否为伴奏，默认为伴奏，false为原唱
    curTime: 0, // 当前音频时长
    allTime: 0, // 音频总体时长
    curShowTime: '00:00', // 当前展示时间
    allShowTime: '03:35', // 歌曲整体展示时间
    seekList:[], // 用户歌词跳转操作记录
    song: {
      "artist": "周杰伦",
      "title": "告白气球",
      "lyrics_url": "https://test-1301509754.file.myqcloud.com/songs/光年之外/lyrics.txt",
      "id": 1,
      "album": "告白气球",
      "cover_url": "https://test-1301509754.file.myqcloud.com/songs/光年之外/cover.jpg",
      "offvocal_url": "https://test-1301509754.file.myqcloud.com/songs/光年之外/offvocal.mp3",
      "track_url": "https://test-1301509754.file.myqcloud.com/songs/光年之外/source.mp3"
    },
    savedOffvocalFilePath: 'http://store/wx67a1ce408798b249.o6zAJs3f5ytXxdRDaKuFawUmpnXg.D26NfDiHGr1ycead5c3843a238ccd0359d36e70b1925.mp3',
    savedSourceFilePath: 'http://store/wx67a1ce408798b249.o6zAJs3f5ytXxdRDaKuFawUmpnXg.uXvnvQPpaK8S972e69e1162edd26b6c131612937125f.mp3'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    var selectList = [];
    var selectObj = {};
    var allShowTime = '00:00';
    var lyrics = wx.getStorageSync('lyrics');
    if (options.mode == 1) {
      selectList = options.selectList.split(',');
      for (var key in selectList) {
        selectObj[selectList[key]] = true;
      }
    }
    // var offvocalAudio = wx.createInnerAudioContext();
    offvocalAudio.src = options.savedOffvocalFilePath;
    allShowTime = util.getFormatMinTime(offvocalAudio.duration);
    // var sourceAudio = wx.createInnerAudioContext();
    sourceAudio.src = options.savedSourceFilePath;
    sourceAudio.volume = 0;

    offvocalAudio.onPlay((res)=>{
      console.log(res);
      // this.setData({
      //   curTime:
      // })
    })

    this.setData({
      mode: options.mode,
      selectList: selectList,
      selectObj: selectObj,
      lyrics: lyrics,
      allShowTime:allShowTime,
      // offvocalAudio:offvocalAudio,
      // sourceAudio:sourceAudio
      // savedSourceFilePath:options.savedSourceFilePath,
      // savedOffvocalFilePath:options.savedOffvocalFilePath
    })
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

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },
  // 滑动取词
  bindScroll: function (e) {
    // 每句歌词80rpx
    // console.log(e.detail.scrollTop)
    var curShowLyrics = Math.ceil((e.detail.scrollTop + 10 * this.data.rpxTopx) / (80 * this.data.rpxTopx)) - 1;
    this.setData({
      curShowLyrics: curShowLyrics <= 0 ? 0 : curShowLyrics,
      isScroll: true
    })
    this.setCurLyrics(curShowLyrics);
  },
  // 防抖设置，delay时间内多次触发，只执行最后一次
  setCurLyrics: util.debounce(function (curShowLyrics) {
    // TODO记录时间节点,修改播放音频位置
    var seekTime = this.data.lyrics[curShowLyrics].time/1000;
    offvocalAudio.seek(seekTime);
    sourceAudio.seek(seekTime);
    var seekList = this.data.seekList;
    console.log(seekList.push(seekTime))
    this.setData({
      curLyrics: curShowLyrics,
      isScroll: false,
      seekList:seekList
    })
  }, 1000),
  // 切换原唱、伴奏
  bindChangeVocal: function (e) {
    if(this.data.isOffvocal){
      offvocalAudio.volume = 0;
      sourceAudio.volume = 1;
    }else{
      offvocalAudio.volume = 1;
      sourceAudio.volume = 0;
    }
    this.setData({
      isOffvocal: !this.data.isOffvocal
    })
  },
  // 暂停/开始按钮
  bindChangeRecord: function (e) {
    if(this.data.isRecord){
      offvocalAudio.pause();
      sourceAudio.pause();
    }else{
      offvocalAudio.play();
      sourceAudio.play();
    }
    this.setData({
      isRecord: !this.data.isRecord
    })
  },
  // 重唱按钮
  bindRestart: function (e) {

  },
  // 完成按钮
  bindFinish: function (e) {

  }
})
