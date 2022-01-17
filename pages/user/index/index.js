var user = require('../../../services/user.js');
var common = require('../../../services/common.js');
const util = require('../../../utils/util.js');
const api = require('../../../config/api.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    carpoolTimes:0,
    seatingTimes:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;
    user.getLocalUser(this); //加载本地用户 
    _this.queryUserStatCarpool();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  
  /**
   * 拼车统计
   */
  queryUserStatCarpool:function() {
    let _this = this;
    util.request(api.QueryUserStatCarpool, { publishUserId: _this.data.userInfo.id}).then(function (res) {
      if (res.errno === 0) {
        _this.setData({
          carpoolTimes: res.data.carpoolTimes,
          seatingTimes: res.data.seatingTimes,
        });
      }else {
        wx.showToast({
          icon: 'none',
          title: res.errmsg,
        })
      }
    });
  },

  //导航跳转
  navTo: function (e) {
    //收集formid
    common.skipAndCollectFormId(this.data.userInfo.id, this.data.userInfo.wxOpenid, e);
  },

})