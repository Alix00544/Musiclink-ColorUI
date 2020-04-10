const app = getApp();
const fileSystemManager = wx.getFileSystemManager();
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
    loading: true,  // 进度条加载
    progress: 0,
    downloadError: 0, // 文件下载失败，0表示无错误，1表示offvocal失败，2表示source失败
    song: {
      "artist": "周杰伦",
      "title": "演员",
      "lyrics_url": "https://test-1301509754.file.myqcloud.com/songs/告白气球/lyrics.txt",
      "id": 1,
      "album": "光年之外",
      "cover_url": "https://test-1301509754.file.myqcloud.com/songs/告白气球/cover.jpg",
      "offvocal_url": "https://test-1301509754.file.myqcloud.com/songs/告白气球/offvocal.mp3",
      "track_url": "https://test-1301509754.file.myqcloud.com/songs/告白气球/source.mp3"
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getLyrics();
    var that = this;
    wx.getSavedFileList({
      success(res) {
        console.log(res);
        var fileList = res.fileList;
        if (fileList.length > 0) {
          wx.removeSavedFile({
            filePath: fileList[0].filePath,
            complete(res) {
              console.log(res);
              wx.getSavedFileList({
                success(res) {
                  console.log(res);
                  var fileList = res.fileList;
                  if (fileList.length > 0) {
                    wx.removeSavedFile({
                      filePath: fileList[0].filePath,
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
            }
          })
        } else {
          that.getSong();
        }
      }
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
  getSong: function (songid) {
    var that = this;
    var downloadTask = wx.downloadFile({
      url: 'https://test-1301509754.file.myqcloud.com/songs/告白气球/offvocal.mp3',
      success(res) {
        console.log(res);
        if (res.statusCode == 200) {
          console.log("offvocal下载完成")
          that.getSource();
          wx.saveFile({
            tempFilePath: res.tempFilePath,
            success(res) {
              console.log(res)
              that.setData({
                savedOffvocalFilePath: res.savedFilePath
              })
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
      url: 'https://test-1301509754.file.myqcloud.com/songs/告白气球/source.mp3',
      success(res) {
        console.log(res)
        if (res.statusCode == 200) {
          console.log("source下载完成")
          wx.saveFile({
            tempFilePath: res.tempFilePath,
            success(res) {
              console.log(res)
              that.setData({
                savedSourceFilePath: res.savedFilePath
              })
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
  bindSing: function (e) {
    var tabCur = this.data.TabCur;
    if (this.data.downloadError == 1) {
      this.getSong();
    } else if (this.data.downloadError == 2) {
      this.getSource();
    } else if (tabCur == 1 && this.data.selectList.length == 0) {
      wx.showToast({
        title: '还未选择歌段,无法进入合唱',
        icon: 'none',
        duration: 2000
      })
    } else {
      var selectList = this.data.selectList.join(',');
      wx.navigateTo({
        url: `../sing/sing?mode=${tabCur}&savedSourceFilePath=${this.data.savedSourceFilePath}&savedOffvocalFilePath=${this.data.savedOffvocalFilePath}&${tabCur == 1 ? '&selectList=' + selectList : ''}`,
      })
    }
    this.setData({
      downloadFile: 0
    })
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