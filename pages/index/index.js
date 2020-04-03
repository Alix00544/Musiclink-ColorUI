// index页面主要用于自定义tabbar
// 初始页面指向于sing页面
Page({
  data: {
    PageCur: 'sing'
  },
  NavChange(e) {
    this.setData({
      PageCur: e.currentTarget.dataset.cur
    })
  }
})