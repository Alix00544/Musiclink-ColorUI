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
    isRecord: false, // 录音状态，控制呼吸灯
    isOffvocal: true, // 是否为伴奏，默认为伴奏，false为原唱
    isScroll: false, // 判断是否再滚动
    curTime: 0, // 当前音频播放时长
    allTime: 0, // 音频总体时长
    curShowTime: '00:00', // 当前展示时间
    allShowTime: '00:00', // 歌曲整体展示时间
    seekList: [], // 用户歌词跳转操作记录
    isSeek: false,
    firstIn: true,
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
    var lyrics = wx.getStorageSync('lyrics');
    if (options.mode == 1) {
      selectList = options.selectList.split(',');
      for (var key in selectList) {
        selectObj[selectList[key]] = true;
      }
    }
    this.setData({
      mode: options.mode,
      selectList: selectList,
      selectObj: selectObj,
      lyrics: lyrics,
      savedSourceFilePath: options.savedSourceFilePath,
      savedOffvocalFilePath: options.savedOffvocalFilePath
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
    this.playAudio();
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
  playAudio: function () {
    var allShowTime;
    var that = this;

    offvocalAudio.src = this.data.savedOffvocalFilePath;
    sourceAudio.src = this.data.savedSourceFilePath;
    sourceAudio.volume = 0;

    offvocalAudio.onTimeUpdate((res) => {
      var curMsTime = offvocalAudio.currentTime * 1000;
      var lyrics = that.data.lyrics;
      var curLyrics = lyrics.length - 1; // 下面循环中没有结果，就是最后一句
      if (that.data.allShowTime == '00:00') {
        that.setData({
          allShowTime: util.getFormatMinTime(offvocalAudio.duration)
        })
      }

      if (this.data.isScroll) {
        that.setData({
          curTime: curMsTime / 1000,
          curShowTime: util.getFormatMinTime(offvocalAudio.currentTime)
        })
      } else {
        for (let i = 1; i < lyrics.length; i++) {
          if (curMsTime <= lyrics[i].time) {
            curLyrics = i - 1;
            break;
          }
        }
        if (that.data.isSeek) {
          curLyrics = curLyrics == 0 ? 0 : curLyrics + 1;
        }
        that.setData({
          curTime: curMsTime / 1000,
          curShowTime: util.getFormatMinTime(offvocalAudio.currentTime),
          curLyrics: curLyrics,
          curShowLyrics: curLyrics
        })
      }
      console.log('onTimeUpdate');
    })
    // seek之后会执行onWaiting
    offvocalAudio.onWaiting(() => {
      console.log('onWaiting')
      that.setData({
        waitFlag: true // 标明是onWaiting触发的暂停
      })
    })

    // 音频准备就绪的回调
    offvocalAudio.onCanplay(() => {
      console.log('onCanplay');
      if (that.data.waitFlag) { // 如果是onWaiting触发的暂停，就立即播放
        offvocalAudio.play() // play()方法看上去能重新触发onTimeUpdate()回调
        that.setData({
          waitFlag: false // 取消相应的flag标志位
        })
      }
    })

    setTimeout(this.bindChangeRecord, 3000);
    this.setData({
      showWait: true
    })
  },
  // 滑动取词
  bindScroll: function (e) {
    // 每句歌词80rpx
    console.log('bindScroll', e.detail.scrollTop)
    var curShowLyrics = Math.ceil((e.detail.scrollTop + 10 * this.data.rpxTopx) / (80 * this.data.rpxTopx)) - 1;
    this.setData({
      curShowLyrics: curShowLyrics <= 0 ? 0 : curShowLyrics,
      // showWait: false,
      // isScroll: true
    })
    // this.setCurLyrics(curShowLyrics);
  },
  // 防抖设置，delay时间内多次触发，只执行最后一次
  setCurLyrics: util.debounce(function (curShowLyrics) {
    // TODO记录时间节点,修改播放音频位置
    // console.log(11111);
    // var seekTime = this.data.lyrics[curShowLyrics].time/1000;
    // offvocalAudio.seek(seekTime);
    // sourceAudio.seek(seekTime);
    // var seekList = this.data.seekList;
    // console.log('seekList',seekList.push(seekTime))
    // this.setData({
    // curLyrics: curShowLyrics,
    // isScroll: false,
    // seekList:seekList
    // })
  }, 200),
  touchEnd: function (e) {
    console.log('touchEnd');
    var curShowLyrics = this.data.curShowLyrics;
    var seekTime = this.data.lyrics[curShowLyrics].time / 1000;
    // offvocalAudio.pause();
    // sourceAudio.pause();
    offvocalAudio.seek(seekTime - 3 > 0 ? seekTime - 3 : 0);
    sourceAudio.seek(seekTime - 3 > 0 ? seekTime - 3 : 0);
    // offvocalAudio.play();
    // sourceAudio.play();
    this.data.seekList.push(seekTime - 3 > 0 ? seekTime - 3 : 0);

    // offvocalAudio.seek(seekTime);
    // sourceAudio.seek(seekTime);
    // this.data.seekList.push(seekTime);

    console.log('seekList', this.data.seekList)
    this.setData({
      curLyrics: curShowLyrics,
      seekList: this.data.seekList,
      showWait: true,
      isScroll: false,
      isSeek: true
    })
    setTimeout(() => {
      this.setData({
        isSeek: false
      })
    }, 3000);
  },
  bindtouchstart: function (e) {
    this.setData({
      isScroll: true,
      showWait: false
    })
    console.log('bindtouchstart')
  },
  // 切换原唱、伴奏
  bindChangeVocal: function (e) {
    if (this.data.isOffvocal) {
      offvocalAudio.volume = 0;
      sourceAudio.volume = 1;
    } else {
      offvocalAudio.volume = 1;
      sourceAudio.volume = 0;
    }
    this.setData({
      isOffvocal: !this.data.isOffvocal
    })
  },
  // 暂停/开始按钮
  bindChangeRecord: function (e) {
    console.log('bindChangeRecord')
    if (this.data.isRecord) {
      offvocalAudio.pause();
      sourceAudio.pause();
    } else {
      offvocalAudio.play();
      sourceAudio.play();
      console.log('bindChangeRecord play')
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
