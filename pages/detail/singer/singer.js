const app = getApp();
Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    hidden: true,
    searchValue:""
    // list:[{
    //   id:'hot',
    //   singers:[{
    //     avatar:"",
    //     name:""
    //   }]
    // }]
  },
  onLoad() {
    let list = [];
    for (let i = 0; i < 26; i++) {
      list[i] = {
        id:String.fromCharCode(65 + i),
        singers:[{
          avatar:"http://www.haopic.me/wp-content/uploads/2015/11/20151124071533443.jpg",
          name:String.fromCharCode(65 + i) +'周杰伦'
        },{
          avatar:"http://aliyunimg.9ku.com/9kuimg/geshou/20160520/99bd2f6f26691900.jpg",
          name:String.fromCharCode(65 + i) +'张靓颖'
        }]
      }
    }
    list.unshift({
      id:'hot',
        singers:[{
          avatar:"http://www.haopic.me/wp-content/uploads/2015/11/20151124071533443.jpg",
          name:'周杰伦'
        },{
          avatar:"http://aliyunimg.9ku.com/9kuimg/geshou/20160520/99bd2f6f26691900.jpg",
          name:'张靓颖'
        },{
          avatar:"http://www.jf258.com/uploads/2015-05-15/164722147.jpg",
          name:"林俊杰"
        },{
          avatar:"https://imgcache.qq.com/fm/photo/singer/rmid_singer_240/X/k/001Fwzit1QslXk.jpg",
          name:"薛之谦"
        }]
    });
    this.setData({
      list: list,
      listCur: list[0].id
    })
  },
  onReady() {
    let that = this;
    wx.createSelectorQuery().select('.indexBar-box').boundingClientRect(function (res) {
      that.setData({
        boxTop: res.top
      })
    }).exec();
    wx.createSelectorQuery().select('.indexes').boundingClientRect(function (res) {
      that.setData({
        barTop: res.top
      })
    }).exec()
  },
  //获取文字信息
  getCur(e) {
    this.setData({
      hidden: false,
      listCur: this.data.list[e.target.id].id,
    })
  },

  setCur(e) {
    this.setData({
      hidden: true,
      listCur: this.data.listCur
    })
  },
  //滑动选择Item
  tMove(e) {
    let y = e.touches[0].clientY,
      offsettop = this.data.boxTop,
      that = this;
    //判断选择区域,只有在选择区才会生效
    if (y > offsettop) {
      let num = parseInt((y - offsettop) / 20);
      if(that.data.list[num].id !=that.data.listCur){
        wx.vibrateShort();
        that.setData({
          listCur: that.data.list[num].id
        })
      }
    };
  },

  //触发全部开始选择
  tStart() {
    this.setData({
      hidden: false
    })
  },

  //触发结束选择
  tEnd() {
    this.setData({
      hidden: true,
      listCurID: this.data.listCur
    })
  },
  indexSelect(e) {
    let that = this;
    let barHeight = this.data.barHeight;
    let list = this.data.list;
    let scrollY = Math.ceil(list.length * e.detail.y / barHeight);
    for (let i = 0; i < list.length; i++) {
      if (scrollY < i + 1) {
        that.setData({
          listCur: list[i].id,
          movableY: i * 20
        })
        return false
      }
    }
  },
    /** 搜索栏操作函数 */
    bindSearch: function (e) {
      wx.navigateTo({
        url: "../search/search?searchValue=" + this.data.searchValue
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
});