const app = getApp();
const util = require('../../../utils/util');
// var offvocalAudio = wx.createInnerAudioContext();
// var sourceAudio = wx.createInnerAudioContext();
var offvocalAudio;
var sourceAudio;
const recorderManager = wx.getRecorderManager();
const SoloMode = 0; // 独唱
const ChorusMode = 1; // 合唱

Page({
    data: {
        CustomBar: app.globalData.CustomBar,
        ScreenHeight: app.globalData.ScreenHeight,
        rpxTopx: app.globalData.ScreenWidth / 750,
        showWait: false, // 歌词倒计时是否显示
        curLyrics: 0, // 当前应该唱的句子
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
        isEnd: false, // 标记是否为播放完成时触发上传和页面跳转
        loadModal: false,
        participatesInsertId: null, // 为了重唱更新数据
        singlistInsertId: null // 为了跳转试听界面后，跳转发布作品使用
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        console.log('onLoad', options);
        console.log(app.globalData)

        var selectList = [],
            selectObj = {},
            lyrics = wx.getStorageSync('lyrics'),
            savedSourceFilePath = wx.getStorageSync('savedSourceFilePath'),
            savedOffvocalFilePath = wx.getStorageSync('savedOffvocalFilePath');
        if (options.mode == ChorusMode) {
            selectList = options.selectList.split(',');
            for (var key in selectList) {
                selectObj[selectList[key]] = true;
            }
        }
        this.setData({
            mode: options.mode, // mode-0表示独唱，mode-1表示合唱
            song: options.song,
            songId: options.songId,
            selectList: selectList,
            selectObj: selectObj,
            lyrics: lyrics,
            savedSourceFilePath: savedSourceFilePath,
            savedOffvocalFilePath: savedOffvocalFilePath,
            userAvatar:app.globalData.userInfo.avatarUrl
        })
        offvocalAudio = wx.createInnerAudioContext();
        sourceAudio = wx.createInnerAudioContext();
    },

    onShow: function() {
        console.log('onShow')
        this.initRecorderManager();
        this.playAudio();
    },
    onHide: function() {
        offvocalAudio.stop();
        sourceAudio.stop();
        recorderManager.stop();
        // this.offListener();
    },
    onUnload: function() {
        offvocalAudio.stop();
        sourceAudio.stop();
        recorderManager.stop();
        this.offListener();
        console.log('onUnload')
    },
    init: function() {
        this.setData({
            showWait: false,
            curLyrics: 0,
            curShowLyrics: 0,
            isRecord: false,
            isOffvocal: true,
            isScroll: false,
            curTime: 0,
            allTime: 0,
            curShowTime: '00:00',
            allShowTime: '00:00',
            seekList: [],
            isSeek: false,
            isEnd: false,
            loadModal: false,
            recordePath: null
        })
    },
    offListener: function() {
        offvocalAudio.offCanplay();
        offvocalAudio.offEnded();
        offvocalAudio.offTimeUpdate();
        offvocalAudio.offWaiting();
        sourceAudio.offEnded();
    },
    initRecorderManager: function() {
        recorderManager.onStop((res) => {
            util.myPause()
            console.log('recorder stop', util.getCurTime(), res)
            const { tempFilePath } = res;
            this.setData({
                    recordePath: tempFilePath,
                    recordeDuration: res.duration
                })
                // 音频自动播放结束
            if (this.data.isEnd) {
                this.navToFinished();
            }
        })
        recorderManager.onStart(() => {
            util.myRest();
            util.myStart();
            console.log('recorder start', util.getCurTime())
        })
        recorderManager.onPause(() => {
            util.myPause()
            console.log('recorder pause', util.getCurTime())
        })
        recorderManager.onResume(() => {
                util.myResume()
                console.log('recorder resume', util.getCurTime())
            })
            // 监听录音因为受到系统占用而被中断开始事件。以下场景会触发此事件：微信语音聊天、微信视频聊天。此事件触发后，录音会被暂停。pause 事件在此事件后触发
        recorderManager.onInterruptionBegin(() => {
                console.log("录音因为受到系统占用而被中断");
                wx.showToast({
                    title: '系统消息导致录音暂停，稍后会自动开始',
                })
                recorderManager.pause();
                offvocalAudio.pause();
                sourceAudio.pause();
                this.setData({
                    isRecord: false
                })
            })
            // 系统中断结束
        recorderManager.onInterruptionEnd(() => {
            console.log("录音中断结束");
            recorderManager.resume();
            offvocalAudio.play();
            sourceAudio.play();
            this.setData({
                isRecord: true
            })
        })
        recorderManager.onError((res) => {
            console.log("录音错误", res.errMsg)
        })
    },
    playAudio: function() {
        this.init();
        var that = this;
        offvocalAudio.src = this.data.savedOffvocalFilePath;
        sourceAudio.src = this.data.savedSourceFilePath;
        offvocalAudio.volume = 1;
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
            // offvocalAudio.onWaiting(() => {
            //     console.log('onWaiting')
            //     that.setData({
            //         waitFlag: true // 标明是onWaiting触发的暂停
            //     })
            // })

        // // 音频准备就绪的回调
        // offvocalAudio.onCanplay(() => {
        //     console.log('onCanplay');
        //     if (that.data.waitFlag) { // 如果是onWaiting触发的暂停，就立即播放
        //         offvocalAudio.play() // play()方法看上去能重新触发onTimeUpdate()回调
        //         that.setData({
        //             waitFlag: false // 取消相应的flag标志位
        //         })
        //     }
        // })
        offvocalAudio.onEnded(() => {
            sourceAudio.stop();
            recorderManager.stop();
            that.setData({
                isRecord: false,
                showWait: false,
                isEnd: true
            })
        })

        sourceAudio.onEnded(() => {
            offvocalAudio.stop();
            recorderManager.stop();
            that.setData({
                isRecord: false,
                showWait: false,
                isEnd: true
            })
        })

        setTimeout(function() {
            offvocalAudio.play();
            sourceAudio.play();
            recorderManager.start({
                format: 'mp3'
            });
            that.setData({
                isRecord: true
            })
        }, 3000);

        this.setData({
            showWait: true
        })
    },
    // 滑动取词
    bindScroll: function(e) {
        // 每句歌词40px
        if (this.data.isScroll) {
            var curShowLyrics = Math.ceil((e.detail.scrollTop + 5) / 40) - 1;
            // console.log('bindScroll', e.detail.scrollTop, curShowLyrics)
            if (curShowLyrics != this.data.curShowLyrics) {
                this.setData({
                    curShowLyrics: curShowLyrics <= 0 ? 0 : curShowLyrics,
                })
            }
        }
    },
    bindtouchstart: function(e) {
        this.setData({
            isScroll: true,
            showWait: false
        })
    },
    touchEnd: function(e) {
        // 滑动取词结束，seek设置3秒前置
        console.log('touchEnd');
        var curShowLyrics = this.data.curShowLyrics;
        var seekMsTime = this.data.lyrics[curShowLyrics].time;

        seekMsTime = seekMsTime - 3000 > 0 ? seekMsTime - 3000 : 0;
        offvocalAudio.seek(seekMsTime / 1000);
        sourceAudio.seek(seekMsTime / 1000);

        this.data.seekList.push(`${util.getCurTime()}-${seekMsTime}`);

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
    bindChangeVocal: function(e) {
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
    bindChangeRecord: function(e) {
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
    bindRestart: function(e) {
        var that = this;
        // stop之后，重唱，原唱可能会play失败
        sourceAudio.pause();
        offvocalAudio.pause();
        sourceAudio.seek(0);
        offvocalAudio.seek(0);

        recorderManager.stop();
        // 先置为false，再置为true,点点点动画就能播放....不然有可能失效
        this.init();
        this.setData({
            showWait: true
        })
        setTimeout(function() {
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
    bindFinish: function(e) {
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
                    // 不要直接调用navToFinished,因为此时录音onStop可能还未触发，录音地址为空，上传失败
                    // that.navToFinished();
                    // 设置isEnd标志符，触发onStop时，会执行navToFinished(),此时录音地址已经存在
                    that.setData({
                        isEnd: true
                    })
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
    },
    navToFinished: function() {
        var openid = wx.getStorageSync('openid');
        var that = this;
        var participatesInsertId = that.data.participatesInsertId;

        // offvocalAudio.destroy();
        // sourceAudio.destroy();
        offvocalAudio.seek(0);
        sourceAudio.seek(0);
        offvocalAudio.pause();
        sourceAudio.pause();
        offvocalAudio.volume = 1;
        sourceAudio.volume = 0;


        that.setData({
            loadModal: true
        })
        if (participatesInsertId) {
            // 删除原来上传的录音
            var cos = util.getCos();
            cos.deleteMultipleObject({
                Bucket: 'test-1301509754',
                Region: 'ap-guangzhou',
                Objects: [{
                    Key: `records/segments/${that.data.participatesCreateTime}-${that.data.participatesInsertId}.mp3`
                }]
            }, function(err, data) {
                console.log('用户删除了录音', err || data);
                that.updateParticipates(participatesInsertId);
            });
        } else {
            util.requestFromServer('singlist', { user_id: openid, song_id: that.data.songId, is_shared: that.data.mode }, 'POST').then((res) => {
                console.log(res);
                var singlistInsertId = res.data.data.insert_id;
                that.setData({
                    singlistInsertId: singlistInsertId
                })
                that.postParticipates(singlistInsertId)
            }).catch((err) => {
                console.log('录音上传失败', err);
            })
        }
    },
    updateParticipates: function(participatesInsertId) {
        var that = this;
        util.requestFromServer('participates', {
            id: participatesInsertId,
            clips: that.data.selectList.join(','),
            time_pairs: that.data.seekList.length > 0 ? that.data.seekList.join(',') : '0-0'
        }, 'PUT').then(res => {
            if (res.data.status == 200) {
                console.log('更新participates 成功', res);
                that.uploadFile(participatesInsertId, res.data.data.create_time);
                that.setData({
                    participatesCreateTime: res.data.data.create_time
                })
            }
        }).catch(err => {
            console.log('更新participates数据失败', err);
        })
    },
    postParticipates: function(singlistInsertId) {
        console.log("发起作品 insert_id", singlistInsertId);
        var openid = wx.getStorageSync('openid');
        var that = this;
        util.requestFromServer('participates', {
            list_id: singlistInsertId,
            user_id: openid,
            clips: that.data.selectList.join(','),
            time_pairs: that.data.seekList.length > 0 ? that.data.seekList.join(',') : '0-0'
        }, 'POST').then((res) => {
            console.log("participates", res)
            that.uploadFile(res.data.data.insert_id, res.data.data.create_time);
            that.setData({
                participatesInsertId: res.data.data.insert_id,
                participatesCreateTime: res.data.data.create_time
            })
        }).catch((err) => {
            console.log('participates', err);
        })
    },
    uploadFile: function(participatesInsertId, participatesCreateTime) {
        var that = this;
        var cos = util.getCos();
        console.log('uploadFile', that.data.singlistInsertId);
        cos.postObject({
            Bucket: 'test-1301509754',
            Region: 'ap-guangzhou',
            Key: `records/segments/${participatesCreateTime}-${participatesInsertId}.mp3`, //指定服务器中的存储路径和文件名
            FilePath: that.data.recordePath, //小程序本地文件的路径
            onProgress: function(info) {
                console.log(info.percent * 100);
                if (info.percent && info.percent == 1) {
                    that.setData({
                        loadModal: false
                    })
                    wx.showModal({
                        title: '上传文件',
                        content: '上传成功',
                        showCancel: false
                    })
                    wx.navigateTo({
                        url: `../finished/finished?recordePath=${that.data.recordePath}&mode=${that.data.mode}&duration=${that.data.recordeDuration}&song=${that.data.song}&insert_id=${that.data.singlistInsertId}`
                    })
                    console.log(`records/segments/${participatesCreateTime}-${participatesInsertId}.mp3`)
                }
            }
        })
    },
    BackPage: function() {
        offvocalAudio.pause();
        sourceAudio.pause();
        recorderManager.pause();
        wx.showModal({
            title: '确定离开该页面？',
            content: '离开后当前演唱进度不会被保存',
            success(res) {
                if (res.confirm) {
                    offvocalAudio.stop();
                    sourceAudio.stop();
                    recorderManager.stop();
                    wx.switchTab({
                        url: '../../tabbar/sing/sing',
                    })
                } else if (res.cancel) {
                    offvocalAudio.play();
                    sourceAudio.play();
                    recorderManager.resume();
                }
            }
        })
    }
})