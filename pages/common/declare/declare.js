var common = require('../../../services/common.js');
const user = require('../../../services/user.js');
var app = getApp();
Page({
  data: {
    appName: app.globalData._appName,
    userInfo: {}
  },
  onLoad: function (options) {
    let that = this;
    let userInfo = wx.getStorageSync('userInfo');
    this.setData({
      userInfo: userInfo,
    });
  },
  
  formSubmit: function (e) {
    let _this = this;
    //收集formid
    common.collectFormId(_this.data.userInfo.id, _this.data.userInfo.wxOpenid, e.detail.formId);
    ///标记已同意声明
    wx.setStorage({
      key: 'declare_key',
      data: 'declared',
    })
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
 
})