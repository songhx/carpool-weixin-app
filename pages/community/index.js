//index.js
var e = getApp();
const util = require('../../utils/util.js');
const config = require('../../config/api.js');
const user = require('../../services/user.js');
//播放的视频或者音频的ID
var playingID = -1;
var types = ["", "10", "29", "31","41"];
var page = 1;//页码
var allMaxtime = 0;//全部 最大时间
var videoMaxtime = 0;//视频 最大时间
var pictureMaxtime = 0;//图片 最大时间
var textMaxtime = 0;//段子 最大时间
var voiceMaxtime = 0;//声音 最大时间

//1->全部;41->视频;10->图片;29->段子;31->声音;
var DATATYPE = {
    ALLDATATYPE : "",
    VIDEODATATYPE : "41",
    PICTUREDATATYPE : "10",
    TEXTDATATYPE : "29",
    VOICEDATATYPE : "31"
};

Page({
  //页面的初始化数据
  data:{
    userInfo: {},
    dataList:[],
    topTabItems:["全部","车途图片","车途心语"],
    currentTopItem: "0",
    swiperHeight:"0",
    start:1,
    totalPage:1,
    waysPanelHide:true,
    publishPanelHide: true,
    content: '',
    imgs: [],
    imgLen: 0,
    upload: true,
    uploading: false,
    showError: false,
    itype:29,
    videoUrl:'',
    voiceUrl:'',
    width: 340,
    height: 340,
    curr_id: '',
  },
  //页面初始化 options为页面跳转所带来的参数
  //生命周期函数，监听页面加载
  onLoad:function(options){
    user.getLocalUser(this); //加载本地用户
    //this.refreshNewData();
    
  },
 
  //生命周期函数-监听页面初次渲染完毕
  onReady:function(){
    var that = this;
     wx.getSystemInfo({
       success: function(res) {
         that.setData({
            swiperHeight: (res.windowHeight-37)
         });
       }
     })
     this.refreshNewData();
  },
  //切换顶部标签
  switchTab:function(e){
    this.setData({
      currentTopItem:e.currentTarget.dataset.idx,
      dataList:[],
      curr_id: '',
    });
    //如果需要加载数据
    if (this.needLoadNewDataAfterSwiper()) {
      this.refreshNewData();
    }
  },

  //刷新数据
  refreshNewData:function(){
    //加载提示框
   // util.showLoading();

    var that = this;
    ///重置数据
    that.setData({
      start: 1,
      dataList:[],
    });
    that.queryList();
  },

  bindscrollData:function(){
    //暂停上一条视频的播放
    if (this.videoContext) {
      this.videoContext.pause();
    }
    this.setData(
      {
        curr_id: '',
      }
    );
  },
  bindscrolltoupperData:function(){
    this.refreshNewData();
  },
  //加载更多操作
  loadMoreData: function () {
    console.log("加载更多");
    //加载提示框
    //util.showLoading();

    var that = this;
    var start = that.data.start + 1;
    if (start > that.data.totalPage){
     // util.hideToast();
      return;
    }
    that.setData({
      start: start,
     
    });
    that.queryList();
  },

  ///查询数据
  queryList: function () {
    let that = this;
    console.log("this.data.currentTopItem ---" + this.data.currentTopItem);
    var data = {
      limit: 5,
      start: that.data.start,
      type: types[this.data.currentTopItem],
    };

    util.request(config.queryInfoList, data, 'POST').then(res => {
      if (res.errno === 0) {
        that.setMoreDataWithRes(res, that);
        that.setData({
          totalPage: res.data.total,
        });
        setTimeout(function () {
          util.hideToast();
          wx.stopPullDownRefresh();
        }, 800);
      }
    }).catch((err) => {
      console.log("queryInfoList -- error -- " + err);
    })
  },

  //获取最大时间
  getMaxtime: function () {
    switch (types[this.data.currentTopItem]) {
      //全部
      case DATATYPE.ALLDATATYPE:
        return allMaxtime;
      //视频
      case DATATYPE.VIDEODATATYPE:
        return videoMaxtime;
      //图片
      case DATATYPE.PICTUREDATATYPE:
        return pictureMaxtime;

      //段子
      case DATATYPE.TEXTDATATYPE:
        return textMaxtime;

      //声音
      case DATATYPE.VOICEDATATYPE:
        return voiceMaxtime;
      default:
        return 0;
    }
  },
  //设置加载更多的数据
  setMoreDataWithRes(res, target) {
    if (null != res.data && null != res.data.list){
      for (var i = 0; i < res.data.list.length; i++  ){
        if (null != res.data.list[i].imgUrl && res.data.list[i].imgUrl != ""){
          res.data.list[i].imageList = res.data.list[i].imgUrl.split(",");
        }
        if (res.data.list[i].content != null && res.data.list[i].content.length > 20){
          res.data.list[i].content = res.data.list[i].content.substring(0,20);
        }
      }
    }
    allMaxtime = 1529572982;
    target.setData({
      dataList: target.data.dataList.concat(res.data.list)
    });
    
  },
  //监听用户下拉动作
  onPullDownRefresh:function(){
    this.setData({
      curr_id: '',
    });
    this.refreshNewData();
  },

  //滚动后需不要加载数据
  needLoadNewDataAfterSwiper:function(){
    return this.data.dataList.length > 0 ? false : true;
  },
  //设置新数据
  setNewDataWithRes:function(res,target){
    allMaxtime = 1529572982;
    target.setData({
      dataList: res.data.list
    });
  },


  //视频播放开始播放
  videoPlay:function(obj){
   
    let _this = this;
    _this.setData({
      curr_id: obj.currentTarget.dataset.id,
    });
    //暂停音频的播放
    if(this.audioContext) {
      this.audioContext.pause();
    }
    //暂停上一条视频的播放
    if(this.videoContext){
      console.log(this.videoContext);
      this.videoContext.pause();
    }
    this.videoContext = wx.createVideoContext("myVideo");
    this.videoContext.play();
  },

  //视频结束播放
  videoEndPlay:function(obj){
    this.videoContext.seek(0); 
  },
  
  //音频播放
  //音频开始播放
  audioplay:function(obj){
    
    //播放的不是同一条音频就暂停之前的音频播放
    //结束视频的播放
    if (this.videoContext) {
      this.videoContext.pause();
    }
    playingID = obj.currentTarget.id;
    this.audioContext = wx.createAudioContext(obj.currentTarget.id);
  },
  //音频结束播放
  audioEndPlay:function(obj){
    this.audioContext.seek(0);
  },
  //点击赞按钮
  zanEvent:function(e){
    let that = this;
    var id = e.currentTarget.dataset.id
    var data = {
      id: id,
    };
    util.request(config.agreeInfo, data, 'POST').then(res => {
      if (res.errno === 0) {
       var data =  that.getNowDatas();
       for (var i = 0; i < data.length; i++){
         if(data[i].id == id){
           data[i].agreeNum = data[i].agreeNum+1;
         }
       }
       that.setNowDatas(data);
      }
    }).catch((err) => {
      console.log("zanEvent -- error -- " + err);
    })
  },
  //踩按钮
  dissEvent: function (e) {
    let that = this;
    var id = e.currentTarget.dataset.id;
    console.log("-----dissEvent----id----" + id);
    var data = {
      id: id,
    };
    util.request(config.dissInfo, data, 'POST').then(res => {
      if (res.errno === 0) {
        var data = that.getNowDatas();
        for (var i = 0; i < data.length; i++) {
          if (data[i].id == id) {
            data[i].dissNum = data[i].dissNum + 1;
          }
        }
        that.setNowDatas(data);
      }
    }).catch((err) => {
      console.log("dissEvent -- error -- " + err);
    })
  },

  //转发按钮
  repostEvent: function (e) {
    let _this = this;
    var data = {
      id: e.currentTarget.dataset.id,
      name: _this.data.userInfo.nickName,
      avatar: _this.data.userInfo.avatar,
    };
    util.request(config.repostInfo, data, 'POST').then(res => {
      if (res.errno === 0) {
        _this.refreshNewData();
      }
    }).catch((err) => {
      console.log("repostEvent -- error -- " + err);
    })
  },

  //设置加载更多的数据
  getNowDatas() {
    let _this = this;
    var data = _this.data.dataList;
    return data;
  },

  setNowDatas(data) {
    let _this = this;
    _this.setData({
      dataList: data
    });
  },

  showWays: function () {
    console.log("showWays----------");
    //暂停上一条视频的播放
    if (this.videoContext) {
      console.log(this.videoContext);
      this.videoContext.pause();
    }
    this.setData({
      waysPanelHide: false,
      curr_id: '',
    });
  },
  hideWays: function () {
    this.setData({
      waysPanelHide: true
    });
  },
  ///选择发表方式
  choice:function(e){
    this.setData({
      publishPanelHide: false,
      waysPanelHide: true,
      itype: e.currentTarget.dataset.type,
    });
  },
  ///发表
  publish:function(){
    let _this = this;
   
    var data = {
      name: _this.data.userInfo.nickName,
      avatar: _this.data.userInfo.avatar,
      type: _this.data.itype,
      content: _this.data.content,
      imgUrl: (_this.data.imgs.length > 0) ? _this.data.imgs.join(",") : "",
      videoUrl: _this.data.videoUrl,
      width:340,
      height:340,
      voiceUrl: _this.data.voiceUrl,
      author:"易拼车",
      bimgUrl:"",
    };
    util.request(config.publishInfo, data, 'POST').then(res => {
      if (res.errno === 0) {
        this.setData({
          publishPanelHide: true,
          content: '',
          imgs: [],
          imgLen: 0,
          upload: true,
          uploading: false,
          showError: false,
          videoUrl: "",
          voiceUrl: "",
          currentTopItem: "0",
        });
        wx.showToast({
          title: "发布成功!",
        })
        _this.refreshNewData();
      }else{
        wx.showToast({
          icon:'none',
          title: res.errmsg,
        })
      }
    }).catch((err) => {
      console.log("repostEvent -- error -- " + err);
    })
  },
  ///取消发布
  cancelPublish:function(){
    let _this = this;
    wx.showModal({
      title: '提示',
      content: '您确定放弃此次编辑？',
      success: function (res) {
        if (res.confirm) {
          _this.setData({
            publishPanelHide: true,
            content: '',
            imgs: [],
            imgLen: 0,
            upload: true,
            uploading: false,
            showError: false,
            videoUrl: "",
            voiceUrl: "",
          });
        } 
      }
    })
  },
  //监听内容
  listenerContent: function (e) {
    this.setData({
      'content': e.detail.value
    });
  },
  //选择图片
  choose: function () {
    var _this = this;
    //检查网络状态
    wx.getNetworkType({
      success: function (res) {
        // 返回网络类型, 有效值：
        var networkType = res.networkType;
        if (networkType == '2g' || networkType == '3g' || networkType == '4g') {
          wx.showModal({
            title: '提示',
            content: '上传图片需要消耗流量，是否继续？',
            confirmText: '继续',
            success: function (res) {
              if (res.confirm) {
                if(_this.data.itype == 10){
                  _this.chooseImage();
                } else if (_this.data.itype == 41){
                  _this.chooseVideo();
                } else if (_this.data.itype == 31){
                  _this.chooseVoice();
                }
            
              }
            }
          });
        } else if (networkType == 'wifi') {
          if (_this.data.itype == 10) {
            _this.chooseImage();
          } else if (_this.data.itype == 41) {
            _this.chooseVideo();
          } else if (_this.data.itype == 31) {
            _this.chooseVoice();
          }
        } else {
          wx.showModal({
            title: '系统提示',
            showCancel:false,
            content: '未连接网络或无法识别的网络，请保证网络畅通上传，谢谢！',
            success: function (res) {
            }
          })
          
        }
      }
    })

  },
  ////选择视频
  chooseVideo:function(){
    var _this = this;
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      compressed: true,
      maxDuration: 60,
      success: function (res) { 
        ///上传视频
        _this.setData({
          uploading: true,
          width: res.width,
          height: res.height,
          uploading: false,
          //videoUrl:"http://wvideo.spriteapp.cn/video/2018/0620/1ed3c49a74a011e89ce9842b2b4c75ab_wpd.mp4",
        });
        console.log("视频临时目录---" + res.tempFilePath);

        _this.upload(res.tempFilePath);
      },
      fail: function (res) { 
        console.log(res);
      },
      complete: function (res) { },
    })
  },
  ///录制声音
  chooseVoice:function(){
    console.log("录音");
    var that = this;
    const recorderManager = wx.getRecorderManager()
    const options = {
      duration: 6000,
      sampleRate: 44100,
      numberOfChannels: 1,
      encodeBitRate: 192000,
      format: 'mp3',
    }
    //调取小程序新版授权页面
    wx.authorize({
      scope: 'scope.record',
      success() {
        console.log("录音授权成功");
        //第一次成功授权后 状态切换为2
        that.setData({
          status: 2,
        })
        // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
        // wx.startRecord();
        recorderManager.start(options);//使用新版录音接口，可以获取录音文件
      },
      fail() {
        console.log("第一次录音授权失败");
        wx.showModal({
          title: '提示',
          content: '您未授权录音，功能将无法使用',
          showCancel: true,
          confirmText: "授权",
          confirmColor: "#52a2d8",
          success: function (res) {
            if (res.confirm) {
              //确认则打开设置页面（重点）
              wx.openSetting({
                success: (res) => {
                  console.log(res.authSetting);
                  if (!res.authSetting['scope.record']) {
                    //未设置录音授权
                    console.log("未设置录音授权");
                    wx.showModal({
                      title: '提示',
                      content: '您未授权录音，功能将无法使用',
                      showCancel: false,
                      success: function (res) {

                      },
                    })
                  } else {
                    //第二次才成功授权
                    console.log("设置录音授权成功");
                    that.setData({
                      status: 2,
                    })
                    recorderManager.start(options);
                  }
                },
                fail: function () {
                  console.log("授权设置录音失败");
                }
              })
            } else if (res.cancel) {
              console.log("cancel");
            }
          },
          fail: function () {
            console.log("openfail");
          }
        })
      }
    })

    recorderManager.onStop((res) => {
      console.log('recorder stop', res.tempFilePath)
      that.upload(res.tempFilePath);
    })
  },
  //选择图片
  chooseImage: function () {
    var _this = this;
    wx.chooseImage({
      count: 1,
      sourceType: ['album'],
      success: function (res) {
        var tempFilePaths = res.tempFilePaths, imgLen = tempFilePaths.length;
        _this.setData({
          uploading: true,
          imgLen: _this.data.imgLen + imgLen
        });
        tempFilePaths.forEach(function (e) {
          _this.upload(e);
        });
      }
    });
  },
  //上传图片
  upload: function (path) {
    var _this = this;
    if (e.g_status) {
      wx.showModal({
        title: '系统提示',
        showCancel: false,
        content: '上传失败！',
        success: function (res) {
        }
      })
      return;
    }
    wx.showNavigationBarLoading();
    // 上传图片
    wx.uploadFile({
      url: config.UplodUrl, // 上传文件路径
      header: {
        'Content-Type': 'multipart/form-data'
      },
      filePath: path,
      name: 'file',
      success: function (res) {
        console.log("上传成功");
        var data = JSON.parse(res.data);
        if (data.errno === 0 ) {
          if (_this.data.itype == 10) {
            _this.setData({
              imgs: _this.data.imgs.concat(data.data.url),
            });
          } else if (_this.data.data.itype == 41) {
            _this.setData({
              videoUrl: data.data.url,
            });
          } else if (_this.data.itype == 31) {
            _this.setData({
              voiceUrl: data.data.url,
            });
          }
          
        }

        if (_this.data.itype == 10 && _this.data.imgs.length === _this.data.imgLen) {
          _this.setData({
            uploading: false
          });
        }
        if (_this.data.itype != 10){
          _this.setData({
            uploading: false
          });
        }
      },
      fail: function (res) {
        if (_this.data.itype == 10){
          _this.setData({
            imgLen: _this.data.imgLen - 1
          });
        }
      },
      complete: function () {
        wx.hideNavigationBarLoading();
      }
    });
  },
  //预览图片
  previewPhoto: function (e) {
    var _this = this;
    //预览图片
    if (_this.data.uploading) {
      wx.showModal({
        title: '系统提示',
        showCancel: false,
        content: '预览失败！',
        success: function (res) {
        }
      })
      return false;
    }
    wx.previewImage({
      current: _this.data.imgs[e.target.dataset.index],
      urls: _this.data.imgs
    });
  },

  preImg: function (e) {
    var src = e.currentTarget.dataset.src;//获取data-src
    var imgList = e.currentTarget.dataset.list;//获取data-list
    //图片预览
    wx.previewImage({
      current: src, // 当前显示图片的http链接
      urls: imgList // 需要预览的图片http链接列表
    })
  },

  toDetail:function(e){
    wx.navigateTo({
      url: e.currentTarget.dataset.url,
    })
  }

})
