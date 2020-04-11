const app = getApp();
const fileSystemManager = wx.getFileSystemManager();
const cloudCallBase = app.globalData.cloudCallBase;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    CustomBar: app.globalData.CustomBar,
    ScreenHeight: app.globalData.ScreenHeight,
    ScreenWidth: app.globalData.ScreenWidth,
    TabCur: 0,
    selectList: [],
    progress: 0,
    downloadError: 0, // 文件下载失败，0表示无错误，1表示offvocal失败，2表示source失败
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var lyrics_url = `${cloudCallBase}/songs/${options.song}/lyrics.txt`;
    if (wx.getStorageSync('curDownloadSong') == options.song) {
      this.setData({
        progress: 100,
        downloadError: 0,
        lyrics:wx.getStorageSync('lyrics')
      })
    } else {
      this.getLyrics(lyrics_url);
      this.clearSavedFileList();
    }
    this.setData({
      song: options.song,
      lyrics_url: lyrics_url,
      source: `${cloudCallBase}/songs/${options.song}/source.mp3`,
      offvocal: `${cloudCallBase}/songs/${options.song}/offvocal.mp3`
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.checkAuthRecord();
  },
  // 清除内存，之后下载歌曲
  clearSavedFileList: function () {
    var that = this;
    wx.getSavedFileList({
      success(res) {
        console.log(res);
        var fileList = res.fileList;
        // 如果缓存中有内容，则删除
        if (fileList.length > 0) {
          wx.removeSavedFile({
            filePath: fileList[0].filePath,
            complete(res) {
              console.log(res);
              // 如果缓存有第二首歌，则删除
              if (fileList.length > 1) {
                wx.removeSavedFile({
                  filePath: fileList[1].filePath,
                  complete(res) {
                    console.log(res);
                    that.getSong();
                  }
                })
              } else {
                that.getSong();
              }
            }
          })
        } else {
          that.getSong();
        }
      }
    })
  },
  getSong: function () {
    var that = this;
    var downloadTask = wx.downloadFile({
      url: that.data.offvocal,
      success(res) {
        console.log(res);
        if (res.statusCode == 200) {
          console.log("offvocal下载完成")
          that.getSource();
          wx.saveFile({
            tempFilePath: res.tempFilePath,
            success(res) {
              console.log(res)
              wx.setStorageSync('savedOffvocalFilePath', res.savedFilePath);
            },
            fail(err) {
              console.log('savedOffvocalFilePath', err)
            }
          })
        } else {
          // 下载失败,请确认网络状况后点击重新下载
          wx.showToast({
            title: '歌曲下载失败，请检查网络后，点击重新下载',
            icon: 'none',
            duration: 2000
          })
          that.setData({
            downloadError: 1
          })
        }
      }
    })
    downloadTask.onProgressUpdate((res) => {
      this.setData({
        progress: Math.floor(res.progress / 2)
      })
    })
  },
  getSource: function (songid) {
    var that = this;
    var downloadTask = wx.downloadFile({
      url: that.data.source,
      success(res) {
        console.log(res)
        if (res.statusCode == 200) {
          console.log("source下载完成")
          wx.saveFile({
            tempFilePath: res.tempFilePath,
            success(res) {
              console.log(res)
              wx.setStorageSync('savedSourceFilePath', res.savedFilePath);
              if(that.data.downloadError == 0){
                wx.setStorageSync('curDownloadSong', that.data.song);
              }
            },
            fail(err) {
              console.log('savedSourceFilePath', err)
            }
          })
        } else {
          // 下载失败,请确认网络状况后点击重新下载
          wx.showToast({
            title: '歌曲下载失败，请检查网络后，点击重新下载',
            icon: 'none',
            duration: 2000
          })
          that.setData({
            downloadError: 2
          })
        }
      }
    })
    downloadTask.onProgressUpdate((res) => {
      this.setData({
        progress: 50 + Math.floor(res.progress / 2)
      })
    })
  },
  bindReDownload: function () {
    if (this.data.downloadError == 1) {
      this.getSong();
    } else if (this.data.downloadError == 2) {
      this.getSource();
    }
    // 重置状态
    this.setData({
      downloadFile: 0
    })
  },
  bindSing: function (e) {
    var tabCur = this.data.TabCur;
    var that = this;
    if (tabCur == 1 && this.data.selectList.length == 0) {
      wx.showToast({
        title: '还未选择歌段,无法进入合唱',
        icon: 'none',
        duration: 2000
      })
    } else if (this.data.authRecord) {
      this.navToSing();
    } else {
      wx.authorize({
        scope: 'scope.record',
        success(res) {
          that.navToSing();
        },
        fail() {
          wx.showToast({
            title: '未授权无法进行唱歌,请到我的-设置-授权,对录音进行授权',
            icon: 'none',
            duration: 4000
          })
        }
      })
    }
  },
  navToSing: function () {
    wx.setStorageSync('curDownloadSong', this.data.song);
    var selectList = this.data.selectList.join(',');
    var tabCur = this.data.TabCur;
    wx.navigateTo({
      url: `../sing/sing?mode=${tabCur}&song=${this.data.song}${tabCur == 1 ? '&selectList=' + selectList : ''}`,
    })
  },
  checkAuthRecord: function () {
    var that = this;
    wx.getSetting({
      success(res) {
        console.log(res);
        that.setData({
          authRecord: res.authSetting['scope.record'] || false
        })
      }
    })
  },
  getLyrics: function (lyrics_url) {
    var that = this;
    wx.downloadFile({
      url: lyrics_url,
      success(res) {
        console.log(res);
        if (res.statusCode === 200) {
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
  // 解析歌词
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
    wx.setStorageSync('lyrics', lyrics);
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
    // 生成obj对象是为了能够使字体变色
    var arr = e.detail.value;
    var list = {};
    for (var key in arr) {
      list[arr[key]] = true;
    }
    this.setData({
      selectList: e.detail.value,
      selectObj: list
    })
  },
  BackPage: function (e) {
    wx.navigateBack({
      delta: 1
    });
  }
})