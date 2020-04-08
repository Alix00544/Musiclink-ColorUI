const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {    
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    imgList: [],
    imgMaxNum: 9,
    textareaValue: '',
    textareaMaxNum: 300,
    curSong: {
      name: "温柔2",
      singer: "五月天",
      coverImg: "https://p1.music.126.net/s47PMA_wT4IF5HFKfDxhzg==/109951164836564113.jpg"
    },
    mySongs:[{
      name: "温柔2",
      singer: "五月天",
      coverImg: "https://p1.music.126.net/s47PMA_wT4IF5HFKfDxhzg==/109951164836564113.jpg"
    },{
      name: "温柔2",
      singer: "五月天",
      coverImg: "https://p1.music.126.net/s47PMA_wT4IF5HFKfDxhzg==/109951164836564113.jpg"
    }],
    showChoose: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
  BackPage:function(e){
    if(this.data.imgList.length>0 || this.data.textareaValue.length>0){
      wx.showModal({
        title: '离开动态发布？',
        content: '离开当前页面后，动态内容不会被保存',
        cancelText: '取消',
        confirmText: '确定',
        success: res => {
          if (res.confirm) {
            wx.navigateBack({
              delta: 1
            });
          }
        }
      })
    }else{
      wx.navigateBack({
        delta: 1
      });
    }
  },
  ChooseSong: function (e) {

  },
  // 隐藏底部音频弹出框
  bindHideChoose: function (e) {
    this.setData({
      showChoose: false
    })
  },
  bindShowChoose:function(e){
    this.setData({
      showChoose: true
    })
  },
  bindSend: function (e) {
    if(!this.data.curSong){
      wx.showToast({
        title: '还没选择作品哟~',
        icon: 'none',
        duration: 2000
      })
    }else{
      // TODO 向对象存储上传图片，录音
      // TODO 发布动态
    }
  },
  /** 内容操作 */
  textareaInput(e) {
    if (e.detail.value.length == this.data.textareaMaxNum) {
      wx.showToast({
        title: '文字数量已达到上限~',
        icon: 'none',
        duration: 2000
      })
    }
    this.setData({
      textareaValue: e.detail.value
    })
  },
  /** 图片操作函数 */
  ChooseImage() {
    wx.chooseImage({
      count: this.data.imgMaxNum - this.data.imgList.length, //默认9
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: (res) => {
        if (this.data.imgList.length != 0) {
          this.setData({
            imgList: this.data.imgList.concat(res.tempFilePaths)
          })
        } else {
          this.setData({
            imgList: res.tempFilePaths
          })
        }
      }
    });
  },
  ViewImage(e) {
    wx.previewImage({
      urls: this.data.imgList,
      current: e.currentTarget.dataset.url
    });
  },
  DelImg(e) {
    wx.showModal({
      title: '提示',
      content: '确定要删除这张照片吗？',
      cancelText: '取消',
      confirmText: '确定',
      success: res => {
        if (res.confirm) {
          this.data.imgList.splice(e.currentTarget.dataset.index, 1);
          this.setData({
            imgList: this.data.imgList
          })
        }
      }
    })
  },
})