var common = require('../../services/common.js');
var bmap = require('../../lib/bmap-wx.min.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tipTxt: '', // 提示文字
    isActiveTips: false, // 是否激活提示
    weatherData: '',
    washingCar: '',
    wh: '',
    limitNoArr: ['不限行','4和9','5和0','1和6','2和7','3和8','不限行'],
    imgUrls: [
      'https://e-carpool.oss-cn-beijing.aliyuncs.com/arounds/b1.png'
    ],
    
    nearby: [
      {
        url: 'https://e-carpool.oss-cn-beijing.aliyuncs.com/arounds/jtb_icn_parking@2x.png',
        text: '停车场'
      },
      {
        url: 'https://e-carpool.oss-cn-beijing.aliyuncs.com/arounds/jtb_icn_gas@2x.png',
        text: '加油站'
      },
      {
        url: 'https://e-carpool.oss-cn-beijing.aliyuncs.com/arounds/jtb_icn_repair@2x.png',
        text: '维修点'
      },
      {
        url: 'https://e-carpool.oss-cn-beijing.aliyuncs.com/arounds/jtb_icn_charge@2x.png',
        text: '充电桩'
      },
      {
        url: 'https://e-carpool.oss-cn-beijing.aliyuncs.com/arounds/jtb_icn_station@2x.png',
        text: '交管'
      },
    ],
    indicatorDots: true,
    autoplay: true,
    interval: 2000,
    duration: 1000,
    circular: true,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    ///百度禁用了天气的获取 https://github.com/baidumapapi/wxapp-jsapi
    // 新建百度地图对象 
    // var BMap = new bmap.BMapWX({
    //   ak: 'H5x7b843VtFaLSGqhbwew8P1LI3YoGTO'
    // });
    // // 发起weather请求 
    // BMap.weather({
    //   fail: function (data) {
    //     console.log(data);
    //     wx.showToast({
    //       title: '获取天气信息失败',
    //       duration: 2000
    //     })
    //   },
    //   success: function (data) {
    //     var weatherData = data.originalData.results[0].weather_data[0];
    //     var washingCar = data.originalData.results["0"].index[1];
    //     var date = new Date();
    //     if (date.getHours() >= 18) {
    //       weatherData.img = weatherData.nightPictureUrl;
    //     }
    //     else {
    //       weatherData.img = weatherData.dayPictureUrl;
    //     }
    //     that.setData({
    //       weatherData: weatherData,
    //       washingCar: washingCar
    //     });
    //    }
    // }); 
       
    that.setData({
      wh: that.data.limitNoArr[new Date().getDay()]
    });
    
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
    let userInfo = wx.getStorageSync('userInfo');
    let token = wx.getStorageSync('token');

    // 页面显示
    if (userInfo && token) {
      app.globalData.userInfo = userInfo;
      app.globalData.token = token;
    }
    this.setData({
      userInfo: app.globalData.userInfo,
      inputMobile: false,
    });
  },

  /**
   * 跳转
   */
  navTo: function (e) {
     
    //收集formid
    common.skipAndCollectFormId(this.data.userInfo.id, this.data.userInfo.wxOpenid, e);
  },

  //导航不可用提示
  navDisabledTip: function () {
    var _this = this;
    if (!_this.data.isActiveTips) {
      _this.setData({
        isActiveTips: true,
        tipTxt: '功能暂未开放', // 提示文字
      });
      setTimeout(function () {
        _this.setData({
          isActiveTips: false,
          tipTxt: '', // 提示文字
        });
      }, 2000);
    }
  },
})