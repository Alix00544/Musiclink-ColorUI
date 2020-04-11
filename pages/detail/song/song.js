const app = getApp();
const util = require('../../../utils/util');
const cloudCallBase = app.globalData.cloudCallBase;
Page({

  data: {
    cloudCallBase:app.globalData.cloudCallBase
  },
  onLoad: function (options) {
    this.getSong(options.song);
  },
  getSong:function(title){
    util.requestFromServer('songs',{title:title},'GET').then((res)=>{
      console.log(res);
      this.setData({
        songId:res.data.data[0].id,
        song:title,
        coverImg:`${cloudCallBase}/songs/${title}/cover.jpg`,
        source:`${cloudCallBase}/songs/${title}/source.mp3`,
        singer:res.data.data[0].artist
      })
      return util.requestFromServer('singlist',{song_id:res.data.data[0].id},'GET')
    }).then((res)=>{
      console.log(res);
      this.setData({
        userList:res.data.data
      })
    }).catch((err)=>{
      console.log(err);
    })
  },
  bindNavSingMode:function(e){
    wx.navigateTo({
      url: `../singMode/singMode?song=${this.data.song}&mode=${e.currentTarget.dataset.mode}`,
    })
  }
})