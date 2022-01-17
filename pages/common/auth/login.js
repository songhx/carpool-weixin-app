// pages/common/auth/login.js
var app = getApp();
var user = require('../../../services/user.js');
var common = require('../../../services/common.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //判断小程序的API，回调，参数，组件等是否在当前版本可用。
    canIUse: wx.canIUse('button.open-type.getUserInfo')
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

  login: function(e) {
    var _this = this;
    if (e.detail.userInfo) {//用户按了允许授权按钮
      user.login(e.detail.userInfo).then(function(res) {
        if (res.errno === 0) {
          //授权成功后，跳转进入小程序首页
          wx.switchTab({
            url: '/pages/index/index'
          })
        }
      });
    } else {//用户按了拒绝按钮
      wx.showModal({
        title: '警告',
        content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
        showCancel: false,
        confirmText: '返回授权',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击了“返回授权”')
          }
        }
      })
    }
  
  }

  
})