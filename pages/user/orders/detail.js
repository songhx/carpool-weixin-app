// pages/subscribe/subscribe.js
var timeUtil = require('../../../utils/timeUtils.js');
const user = require('../../../services/user.js');
var common = require('../../../services/common.js');
var orders = require('../../../services/orders.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    publishId: null,
    userInfo: {},
    id: 0, // 行程id
    orderInfo: {},
    // 拼车单 '状态  0 预约中  1  预约成功  2 拒绝   3 取消  4 失效',
    statusArr: ["待确认", "预约成功", "拒绝", "已取消", "已失效"],
    formType: 0,
    refuseReason: "",
    carpoolGroupCode: app.globalData._wx_cdoe,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;
    let userInfo = wx.getStorageSync('userInfo');
    _this.setData({
      id: options.id,
      userInfo:userInfo,
      publishId: options.publishId == undefined ? null : options.publishId,
      formType: options.formType,
    })
    _this.queryUserOrder(); // 加载用户订单信息

  },

  /**
 * 生命周期函数--监听页面显示
 */
  onShow: function () {
    let _this = this;
    let userInfo = wx.getStorageSync('userInfo');
    _this.setData({
      userInfo: userInfo,
    })
  },

  
  /**
   * 查询用户订单
   */
  queryUserOrder: function () {
    let _this = this;
    var data = { id: _this.data.id };
    orders.queryUserOrder(data).then(res => {
      if (res.errno === 0) {
        var orderInfo = res.data;
        if (null != orderInfo) {
          orderInfo.departureTime = timeUtil.formatTime(new Date(orderInfo.departureTime.replace(/-/g, '/')));
          orderInfo.statusStr = _this.data.statusArr[orderInfo.status];
          _this.setData({
            orderInfo: orderInfo,
          })
        }

      } else {
        wx.showToast({
          icon: 'none',
          title: "数据加载失败",
        })
      }
    })
  },

  /**
   * 确定
   */
  confirmOrder: function (e) {
    let _this = this;
    //收集formid
    common.collectFormId(_this.data.userInfo.id, _this.data.userInfo.wxOpenid, e.detail.formId);
    _this.confirmOrRefuseOrder(1);
  },

  /**
   * 拒绝
   */
  refuseOrder: function (e) {
    let _this = this;
    _this.setData({
      refuseReason: e.detail.value.refuseReason,
    });
    //收集formid
    common.collectFormId(_this.data.userInfo.id, _this.data.userInfo.wxOpenid, e.detail.formId);
    if (_this.data.refuseReason == "" || _this.data.refuseReason == null) {
      wx.showToast({
        icon: 'none',
        title: "拒绝原因不能为空!",
      })
      return;
    }
    if (_this.data.refuseReason.length > 60) {
      wx.showToast({
        icon: 'none',
        title: "拒绝原因不能大约60个字!",
      })
      return;
    }
    wx.showModal({
      title: '拼车预约提醒',
      content: '您拒绝拒接此条拼车预约吗？',
      success: function (res) {
        if (res.confirm) {
          _this.confirmOrRefuseOrder(2);
        }
      }
    })

  },
  /**
   * 提交
   */
  confirmOrRefuseOrder: function (status) {
    let _this = this;
    var formData = {};
    formData.id = _this.data.orderInfo.id;
    formData.userType = _this.data.orderInfo.userType;
    formData.publishId = _this.data.orderInfo.id;
    formData.status = status;
    orders.confirmOrRefuse(formData).then(res => {
      if (res.errno === 0) {
       
        wx.showModal({
          title: '系统提示',
          content: '操作成功',
          showCancel: false,
          success: () => {
            _this.back();
          }
        });

      } else {
        wx.showToast({
          icon: 'none',
          title: "操作失败!",
        })
      }
    })
  },

  cancelOrder: function (e) {
    let _this = this;
    //收集formid
    common.collectFormId(_this.data.userInfo.id, _this.data.userInfo.wxOpenid, e.detail.formId);
    if (e.detail.value.cancelReason == "" || e.detail.value.cancelReason == null) {
      wx.showToast({
        icon: 'none',
        title: "取消原因不能为空!",
      })
      return;
    }
    if (e.detail.value.cancelReason.length > 60) {
      wx.showToast({
        icon: 'none',
        title: "取消原因不能大约60个字!",
      })
      return;
    }
    wx.showModal({
      title: '拼车预约提醒',
      content: '您确认取消此条拼车预约吗？',
      success: function (res) {
        if (res.confirm) {
          var formData = {};
          formData.id = _this.data.orderInfo.id;
          formData.userType = _this.data.orderInfo.userType;
          formData.publishId = _this.data.orderInfo.id;
          formData.status = 3;
          formData.cancelReason = e.detail.value.cancelReason;
          orders.cancelOrder(formData).then(res => {
            if (res.errno === 0) {
              wx.showModal({
                title: '系统提示',
                content: '操作成功',
                showCancel: false,
                success: () => {
                  _this.back();
                }
              });

            } else {
              wx.showToast({
                icon: 'none',
                title: "操作失败!",
              })
            }
          })
        }
      }
    })

  },
  //回退上一页
  back: function () {
    let _this = this;
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];  //上一个页面
    //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    prevPage.setData({
      mydata: { publishId: _this.data.publishId, }
    })
    wx.navigateBack();//返回上一页面
  },

  copyWxCode() {
    let that = this;
    //复制到剪切板
    wx.setClipboardData({
      data: that.data.carpoolGroupCode,
      success() {
        wx.hideToast();
        that.setData({
          modalTitle: "您已复制拼车管理员微信",
          showModal1: true
        });
      }
    })
  },

  closeFloat() {
    this.setData({
      modalTitle: "",
      showModal1: false
    });
  },

  callPhone: function (e) {
    var mobile = e.currentTarget.dataset.mobile;
    if (mobile) {
      wx.makePhoneCall({
        phoneNumber: mobile,
      })
    }
  },

  //跳转首页
  toIndex: function () {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },

})