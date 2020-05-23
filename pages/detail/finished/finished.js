const recorderAudio = wx.createInnerAudioContext()
const util = require("../../../utils/util")

Page({

    /**
     * 页面的初始数据
     */
    data: {
        isPlay: true,
        curShowTime: '00:00',
        curTime: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        console.log(options)
        this.setData({
            recordePath: options.recordePath,
            mode: options.mode,
            duration: parseInt(options.duration / 1000),
            song: options.song,
            insertId: options.insert_id
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function(options) {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function(options) {

        recorderAudio.src = this.data.recordePath;
        recorderAudio.onTimeUpdate(() => {
                console.log(11)
                this.setData({
                    curShowTime: util.getFormatMinTime(recorderAudio.currentTime),
                    curTime: recorderAudio.currentTime
                })
            })
        seek之后会执行onWaiting
        recorderAudio.onWaiting(() => {
            console.log('onWaiting')
            this.setData({
                waitFlag: true // 标明是onWaiting触发的暂停
            })
        })

        // 音频准备就绪的回调
        recorderAudio.onCanplay(() => {
            console.log('onCanplay');
            if (this.data.waitFlag) { // 如果是onWaiting触发的暂停，就立即播放
                recorderAudio.play() // play()方法看上去能重新触发onTimeUpdate()回调
                this.setData({
                    waitFlag: false // 取消相应的flag标志位
                })
            }
        })
        recorderAudio.play();
    },
    onHide: function() {
        recorderAudio.stop();
    },
    onUnload: function() {
        recorderAudio.stop();
    },
    bindPlayChange: function() {
        if (this.data.isPlay) {
            recorderAudio.pause()
        } else {
            recorderAudio.play()
        }
        this.setData({
            isPlay: !this.data.isPlay
        })
    },
    bindChange: function(e) {
        recorderAudio.seek(e.detail.value)
        recorderAudio.play()
        this.setData({
            isPlay: true
        })
    },
    bindSendDynamic: function() {
        wx.navigateTo({
            url: `../sendDynamic/sendDynamic?insertId=${this.data.insertId}&song=${this.data.song}`,
        })
        console.log(`../sendDynamic/sendDynamic?insertId=${this.data.insertId}&song=${this.data.song}`);
    },
    bindSingAgain: function() {
        recorderAudio.stop();
        wx.navigateBack({
            delta: 1
        });
    }
})