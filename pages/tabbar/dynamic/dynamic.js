
const app = getApp();
Page({
  data: {
    StatusBar: app.globalData.StatusBar,  //状态栏高度
    CustomBar: app.globalData.CustomBar,  //NavBar整体高度
    WinHeight: app.globalData.WinHeight,  //可使用窗口高度
    currentTab: 0,
    // 动态内容
    playingSongId:-1,
    // 是否展示底部弹出评论栏
    showComments:false,
    // 当前动态的评论
    curentComments:[],
    hotDynamicList:[{
      dynamicId:111,
      senderAvatar:"https://ossweb-img.qq.com/images/lol/web201310/skin/big10006.jpg",
      senderNickName:"凯尔",
      sendTime:"2019年12月3日",
      content:"折磨生出苦难，苦难又会加剧折磨，凡间这无穷的循环，将有我来终结！",
      images:["https://ossweb-img.qq.com/images/lol/web201310/skin/big10006.jpg","https://ossweb-img.qq.com/images/lol/web201310/skin/big10006.jpg","https://ossweb-img.qq.com/images/lol/web201310/skin/big10006.jpg"],
      song:{
        id:123,
        cover:"https://ossweb-img.qq.com/images/lol/web201310/skin/big10006.jpg",
        url:"",
        name:"此时此刻随机分SD卡就123",
        score:"SSS",
        needChorus:false,
        listenNum:120
      },
      upNum:20,
      commentsNum:2,
      comments:[
        {
          nickName:"路人甲",
          avatar:"",
          content:"我回复了莫甘娜的评论",
          time:"12:11",
          reply:{
            nickname:"莫甘娜",
            content:"你好啊，随便评论看看"
          }
        },
        {
          nickName:"莫甘娜",
          avatar:"",
          content:"你好啊，随便评论看看",
          time:"12:00"
        }
      ]
    },{
      dynamicId:222,
      senderAvatar:"https://ossweb-img.qq.com/images/lol/web201310/skin/big10006.jpg",
      senderNickName:"凯尔2",
      sendTime:"2019年12月4日",
      content:"22折磨生出苦难，苦难又会加剧折磨，凡间这无穷的循环，将有我来终结！",
      images:[],
      song:{
        id:1234,
        cover:"https://ossweb-img.qq.com/images/lol/web201310/skin/big10006.jpg",
        url:"",
        name:"歌曲1234",
        score:"A",
        needChorus:true,
        listenNum:500
      },
      upNum:0,
      commentsNum:0,
      comments:[]
    }]
  },

  onLoad: function (options) {

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  /** 自定义顶部栏函数 */
  //点击上部文字切换页面
  swichNav: function (e) {
    var that = this;
    var current = e.target.dataset.current;
    if (this.data.currentTab === current) {
      return false;
    } else {
      that.setData({
        currentTab: current,
      })
    }
  },
  // 滑动切换页面
  swiperChange: function (e) {
    this.setData({
      currentTab: e.detail.current,
    })
  },
  //跳转到搜索页面
  navToSearch:function(e){
    wx.navigateTo({
      url:"../detail/search/search"
    })
  },
  /** 动态中的函数 */
  // 点击动态，跳转到具体页面
  bindNavDynamicDetail:function(e){
    // dynamicId
    console.log('bindNavDynamicDetail:'+e.currentTarget.dataset.dynamicId);
    console.log(e);
    var dynamicId = e.currentTarget.dataset.dynamicId;
    wx.navigateTo({
      url:"../detail/dynamicDetail/dynamicDetail?dynamicId="+dynamicId
    })
  },
  // 播放/暂停音乐
  catchPlayAudio:function(e){
    // songId
    console.log('catchPlayAudio:'+e.currentTarget.dataset.songId);
    console.log(e);
    var playingSongId = this.data.playingSongId;
    var curSongId = e.currentTarget.dataset.songId;
    this.setData({
      playingSongId:playingSongId==curSongId?-1:curSongId
    })
  },
  // 合唱:跳转至歌曲合唱页面
  catchChorus:function(e){
    // songId
    console.log('catchChorus:'+e.currentTarget.dataset.songId);
    console.log(e);
  },
  // 分享
  catchShare:function(e){
    // songId
    console.log('catchShare:'+e.currentTarget.dataset.songId);
    console.log(e);
  },
  // 点赞
  catchUp:function(e){
    // dynamicId
    console.log('catchUp:'+e.currentTarget.dataset.dynamicId);
    console.log(e);
  },
  // 点击评论按钮
  catchComments:function(e){
    // dynamicId
    // TODO:根据动态ID获取当前评论
    this.setData({
      showComments:true,
      curentComments:[e.currentTarget.dataset.dynamicId]
    })
  },
  // 隐藏底部评论弹出框
  bindHideComments:function(e){
    this.setData({
      showComments:false
    })
  }
})