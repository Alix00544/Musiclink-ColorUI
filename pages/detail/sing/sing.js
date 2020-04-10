const app = getApp();
const util = require('../../../utils/util');
const offvocalAudio = wx.createInnerAudioContext();
const sourceAudio = wx.createInnerAudioContext();
const recorderManager = wx.getRecorderManager();

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
      mode: options.mode,   // mode-0表示独唱，mode-1表示合唱
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
    var that = this;

    offvocalAudio.src = this.data.savedOffvocalFilePath;
    sourceAudio.src = this.data.savedSourceFilePath;
    sourceAudio.volume = 0;

    offvocalAudio.onTimeUpdate((res) => {
      var curMsTime = offvocalAudio.currentTime * 1000;
      var lyrics = that.data.lyrics;
      var curLyrics = 0;
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
          if (curMsTime < lyrics[0].time) {
            curLyrics = 0;
            break;
          } else if (curMsTime >= lyrics[lyrics.length - 1].time) {
            curLyrics = lyrics.length - 1;
            break;
          } else if (lyrics[i - 1].time <= curMsTime && curMsTime < lyrics[i].time) {
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
    offvocalAudio.onEnded(() => {
      sourceAudio.stop();
      recorderManager.stop();
      that.setData({
        isRecord: false,
        showWait: false
      })
      // 跳转到试听界面 + 取消一系列监听事件
    })

    sourceAudio.onEnded(() => {
      offvocalAudio.stop();
      recorderManager.stop();
      that.setData({
        isRecord: false,
        showWait: false
      })
      // 跳转到试听界面+ 取消一系列监听事件
    })

    // offvocalAudio.onSeeked(()=>{
    //   offvocalAudio.play()
    // })

    setTimeout(function () {
      offvocalAudio.play();
      sourceAudio.play();
      recorderManager.start({
        format: 'mp3'
      });
      recorderManager.onStop((res) => {
        console.log('recorder stop', res)
        const { tempFilePath } = res
        that.setData({
          recorderPath: tempFilePath
        })
      })
      that.setData({
        isRecord: true
      })
    }, 3000);

    this.setData({
      showWait: true
    })
  },
  // 滑动取词
  bindScroll: function (e) {
    // 每句歌词80rpx
    // var curShowLyrics = Math.ceil((e.detail.scrollTop + 10 * this.data.rpxTopx) / (80 * this.data.rpxTopx)) - 1;
    if (this.data.isScroll) {
      // var curShowLyrics = Math.ceil((e.detail.scrollTop + 10 * this.data.rpxTopx) / (80 * this.data.rpxTopx)) - 1;
      var curShowLyrics = Math.ceil((e.detail.scrollTop + 5) / 40) - 1;
      console.log('bindScroll', e.detail.scrollTop, curShowLyrics)
      if (curShowLyrics != this.data.curShowLyrics) {
        this.setData({
          curShowLyrics: curShowLyrics <= 0 ? 0 : curShowLyrics,
        })
      }
    }
  },
  bindtouchstart: function (e) {
    this.setData({
      isScroll: true,
      showWait: false
    })
  },
  touchEnd: function (e) {
    // clearTimeout(seekTimer);
    // 滑动取词结束，设置3秒延迟
    console.log('touchEnd');
    var curShowLyrics = this.data.curShowLyrics;
    var seekTime = this.data.lyrics[curShowLyrics].time / 1000;
    // offvocalAudio.pause();
    // sourceAudio.pause();
    seekTime = seekTime - 3 > 0 ? seekTime - 3 : 0;
    offvocalAudio.seek(seekTime);
    sourceAudio.seek(seekTime);
    // offvocalAudio.play();
    // sourceAudio.play();
    this.data.seekList.push({ 
      seekTime: seekTime, 
      recorderTime: recorderManager.duration 
    });

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
    if (this.data.isRecord) {
      offvocalAudio.pause();
      sourceAudio.pause();
      recorderManager.pause();
    } else {
      offvocalAudio.play();
      sourceAudio.play();
      recorderManager.resume();
    }
    this.setData({
      isRecord: !this.data.isRecord,
      showWait: false
    })
  },
  // 重唱按钮
  bindRestart: function (e) {
    var that = this;
    sourceAudio.pause();
    offvocalAudio.pause();
    sourceAudio.seek(0);
    offvocalAudio.seek(0);

    // stop之后，重唱，原唱可能会play失败
    // sourceAudio.stop();
    // offvocalAudio.stop();
    recorderManager.stop();
    // 先置为false，再置为true,点点点动画就能播放....不然有可能失效
    this.setData({
      showWait: false
    })
    this.setData({
      curShowTime: "00:00",
      curTime: 0,
      curLyrics: 0,
      curShowLyrics: 0,
      showWait: true,
      isRecord: false,
      isOffvocal: true,
      isScroll: false,
      seekList: [],
      isSeek: false,
      recorderPath: null
    })
    setTimeout(function () {
      sourceAudio.play();
      offvocalAudio.play();
      sourceAudio.volume = 0;
      offvocalAudio.volume = 1;
      // TODO 开始录音
      recorderManager.start({
        format: 'mp3'
      });
      that.setData({
        isRecord: true
      })
    }, 3000);
  },
  // 完成按钮
  bindFinish: function (e) {
    var that = this;
    sourceAudio.pause();
    offvocalAudio.pause();
    recorderManager.pause();
    this.setData({
      isRecord: false
    })
    wx.showModal({
      content: '是否完成录制？',
      cancelText: '继续演唱',
      confirmText: '确认结束',
      success(res) {
        if (res.confirm) {
          sourceAudio.stop();
          offvocalAudio.stop();
          recorderManager.stop();
          // 跳转试听页面
          var textAudio = wx.createInnerAudioContext()
          textAudio.src = that.data.recorderPath;
          textAudio.play();

        } else if (res.cancel) {
          sourceAudio.play();
          offvocalAudio.play();
          recorderManager.resume();
          that.setData({
            isRecord: true
          })
        }
      }
    })
  }
})