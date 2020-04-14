const app = getApp();
const cloudCallBase = app.globalData.cloudCallBase;
const util = require('../../../utils/util')
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
        insertId: null,
        curSong: null,
        mySongs: [],
        showChoose: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        console.log(options);
        if (options.insertId && options.song) {
            this.setData({
                insertId: options.insertId,
                curSong: {
                    insertId: options.insertId,
                    song: options.song,
                    coverImg: `${cloudCallBase}/songs/${options.song}/cover.jpg`,
                    source: `${cloudCallBase}/records/segments/${options.insertId}.mp3`,
                    singer: '暂无'
                }
            })
        }
    },

    onShow: function() {
        this.getMySongs();
    },
    getMySongs: function() {
        var that = this;
        var openid = wx.getStorageSync('openid');
        util.requestFromServer('singlist', { user_id: openid }, 'GET').then((res) => {
            console.log(res.data)
            var mySongs = [];
            res.data.data.forEach(v => {
                mySongs.push({
                    insertId: v.id,
                    song: v.title,
                    singer: v.name,
                    coverImg: `${cloudCallBase}/songs/${v.title}/cover.jpg`,
                    source: `${cloudCallBase}/records/segments/${v.id}.mp3`,
                })
            })
            that.setData({
                mySongs: mySongs
            })
        }).catch((err) => {
            console.log('获取用户作品数据错误', err);
        })
    },
    BackPage: function(e) {
        if (this.data.imgList.length > 0 || this.data.textareaValue.length > 0) {
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
        } else {
            wx.navigateBack({
                delta: 1
            });
        }
    },
    bindChange: function(e) {
        var insertId = e.currentTarget.dataset.insertId;
        if (insertId != this.data.insertId) {
            var mySongs = this.data.mySongs;
            for (let i = 0; i < mySongs.length; i++) {
                if (mySongs[i].insertId == insertId) {
                    this.setData({
                        curSong: mySongs[i],
                        insertId: mySongs[i].insertId
                    })
                    break;
                }
            }
        }
        this.bindHideChoose()
    },
    // 隐藏底部音频弹出框
    bindHideChoose: function(e) {
        this.setData({
            showChoose: false
        })
    },
    bindShowChoose: function(e) {
        this.setData({
            showChoose: true
        })
    },
    bindSend: function(e) {
        if (!this.data.curSong) {
            wx.showToast({
                title: '还没选择作品哟~',
                icon: 'none',
                duration: 2000
            })
        } else {
            var cos = util.getCos();
            var that = this;

            util.requestFromServer('dynamic', {
                user_id: wx.getStorageSync('openid'),
                list_id: that.data.insertId,
                content: that.data.textareaValue || '我唱了一首歌,快来听听吧。',
                pictures: that.data.imgList.length,
                is_private: 0
            }, "POST").then((res) => {
                console.log(res);
                var dynamicId = res.data.data.insert_id;
                var createTime = res.data.data.create_time;
                var len = this.data.imgList.length;
                // 向对象存储上传图片
                if (len > 0) {
                    for (let i = 0; i < len; i++) {
                        (function(i) {
                            console.log(i)
                            cos.postObject({
                                Bucket: 'test-1301509754',
                                Region: 'ap-guangzhou',
                                Key: `pictures/dynamic/${dynamicId}/${createTime}-${i}.jpg`, //指定服务器中的存储路径和文件名
                                FilePath: that.data.imgList[i], //小程序本地文件的路径
                                onProgress: function(info) {
                                    if (info.percent && info.percent == 1) {
                                        console.log('上传图片：', `pictures/dynamic/${dynamicId}/${createTime}-${i}.jpg`);
                                        if (i == len - 1) {
                                            wx.switchTab({
                                                url: '../../tabbar/mine/mine',
                                            })
                                        }
                                    }
                                }
                            })
                        })(i)
                    }
                } else {
                    wx.switchTab({
                        url: '../../tabbar/mine/mine',
                    })
                }
            }).catch((err) => {
                console.log('获取发布动态失败', err)
            })
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