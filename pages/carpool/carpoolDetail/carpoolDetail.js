var amap = require('../../../lib/amap-wx.js'); // 高德地图
var amapKey = "341f556d52f65f1e29c8a48ca1315bd1"; //高德地图key
const util = require('../../../utils/util.js');
const maps = require('../../../utils/maps.js');
const api = require('../../../config/api.js');
var timeUtil = require('../../../utils/timeUtils.js');
const user = require('../../../services/user.js');
var common = require('../../../services/common.js');
var publisTrip = require('../../../services/publish.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    id: 0, // 行程id
    isHide: true,
    departureDate: "", //出发日期
    departureTime: "", //时间
    startPoint: "",//具体的出发地点
    startPointLongitude: 0.00,
    startPointLatitude: 0.00,
    destination: "", //终点
    destinationLongitude: 0.00,
    destinationLatitude: 0.00,
    carpoolPublish: {},
    passengerNum: 1,
    markers:[],
    distance: '',
    cost: '',
    polyline: [],
    showModal1: false,
    modalTitle: "",
    carpoolGroupCode: app.globalData._wx_cdoe,
    showModal: false,
    showMap:true,
  },

  /**
    * 生命周期函数--监听页面加载
    */
  onLoad: function (options) {
    let _this = this;
    _this.setData({
      id: options.id,
    })
    user.getLocalUser(this); //加载本地用户
    wx.showLoading({
      title: '加载中',
    })
    _this.queryTrip(); // 加载具体的行程信息
    console.log(_this.data.passengerNum);

  },

  /**
 * 生命周期函数--监听页面显示
 */
  onShow: function () {
    let _this = this;
    var date = new Date();
    this.setData({
      departureDate: timeUtil.formatRDate(date),
      departureTime: timeUtil.formatMTime(date),
    })
    user.getLocalUser(this); //加载本地用户
    _this.loadUserInfo(); // 加载用户信息
  },

  //分享
  onShareAppMessage: function () {
    let _this = this;
    return {
      title: app.globalData._appName,
      desc: app.globalData._appName + '让出行更方便，让生活更美好!',
      path: '/pages/carpool/carpoolDetail/carpoolDetail?id=' + this.data.id
    }
  },
  

  toggleMaps: function() {
    let _this = this;
    _this.setData({
      showMap: !_this.data.showMap,
    })
  },

  //打开modal
  openOrder() {
    let _this = this;
    this.setData({
      showModal: true,
      showMap:false,
    })
  },
  closeModal: function () {
    this.setData({
      showModal: false,
      showMap: true,
    })
  },
  modalConfirm: function (e) {
    let _this = this;
    console.log("modalConfirm-----" + e);
    this.setData({
      showModal: false,
      showMap: true,
    })
    _this.subOrder(e);
  },


  /**
   * 提交
   */
  subOrder: function (e) {
    let _this = this;
    
    //收集formid
    //common.collectFormId(_this.data.userInfo.id, _this.data.userInfo.wxOpenid, e.detail.formId);

    ///如果不是司机，抢单需先完善车辆信息
    if (_this.data.carpoolPublish.userType == 0 && _this.data.userInfo.isCarowner == 0) {
      wx.navigateTo({
        url: '/pages/user/userInfo/userInfo',
      })
      return;
    }
    ///行程信息检查
    if (publisTrip.checkTripExpire(_this.data.carpoolPublish.departureTime.replace(/-/g, '/'))) {
      wx.showModal({
        title: '警告',
        showCancel: false,
        content: '很抱歉此行程已过期',
        success: function (res) {
          if (res.confirm) {
            wx.switchTab({
              url: '/pages/index/index',
            })
          }
        }
      })

      return false;
    }
    var passengerNum = _this.data.passengerNum;
    if (_this.data.carpoolPublish.userType == 0) {
      passengerNum = _this.data.carpoolPublish.passengerNum;
    }
    var data = {
      userType : _this.data.carpoolPublish.userType,
      publishId: _this.data.carpoolPublish.id,
      orderUserId: _this.data.userInfo.id,
      orderUserName: _this.data.userInfo.nickName,
      mobile: _this.data.userInfo.mobile,
      departureTimeStr: _this.data.departureDate + " " + _this.data.departureTime + ":00",
      startPoint: _this.data.startPoint,//具体的出发地点
      startPointLongitude: _this.data.startPointLongitude,
      startPointLatitude: _this.data.startPointLatitude,
      destination: _this.data.destination,//终点
      destinationLongitude: _this.data.destinationLongitude,
      destinationLatitude: _this.data.destinationLatitude,
      passengerNum: passengerNum,
    };
    // e.detail.value.userType = _this.data.carpoolPublish.userType;
    // e.detail.value.publishId = _this.data.carpoolPublish.id;
    // e.detail.value.orderUserId = _this.data.userInfo.id;
    // e.detail.value.orderUserName = _this.data.userInfo.nickName;
    // e.detail.value.mobile = _this.data.userInfo.mobile;
    // e.detail.value.departureTimeStr = _this.data.departureDate + " " + _this.data.departureTime + ":00";
    // e.detail.value.startPoint = _this.data.startPoint;//具体的出发地点
    // e.detail.value.startPointLongitude = _this.data.startPointLongitude;
    // e.detail.value.startPointLatitude = _this.data.startPointLatitude;
    // e.detail.value.destination = _this.data.destination;//终点
    // e.detail.value.destinationLongitude = _this.data.destinationLongitude;
    // e.detail.value.destinationLatitude = _this.data.destinationLatitude;
    // e.detail.value.passengerNum = _this.data.passengerNum;
    // if (_this.volidateForm(e)) {
     
    // }
    util.request(api.SubOrder, data, "POST").then(res => {
      if (res.errno === 0) {
        wx.redirectTo({
          url: '/pages/common/tips/tips?errno=0&rs=恭喜您预约成功请耐心等待预约确认&times=-1&tip=您也可以拨打电话（' + _this.data.carpoolPublish.mobile + "）提醒对方确认",
        })
      } else {
        wx.showToast({
          icon: 'none',
          title: '预约失败',
        })
      }
    })

  },

  

  /**
  * 收缩
  */
  toggle: function () {
    let _this = this;
    var carpoolPublish = _this.data.carpoolPublish;
    if (carpoolPublish) {
      carpoolPublish.isFold = (!carpoolPublish.isFold);
      _this.setData({
        carpoolPublish: carpoolPublish,
      })
    }

  },

  /**
   * 查询具体行程信息
   */
  queryTrip: function () {
    let _this = this;
    var data = { id: _this.data.id };
    publisTrip.queryTrip(data).then(res => {
      wx.hideLoading(); //隐藏加载动画
      if (res.errno === 0) {
        var carpoolPublish = res.data;
        if (null != carpoolPublish) {
          if (carpoolPublish.passengerNum == 0) { // 已预定，跳转上一页
            wx.navigateBack();//跳转上一页
          }
          carpoolPublish.byWaysOmit = common.formatStr(carpoolPublish.byWays, 18);
          carpoolPublish.isFold = (carpoolPublish.byWays.length > 18);
          _this.setData({
            carpoolPublish: carpoolPublish,
            isHide: !(carpoolPublish.userType == 1),
            // departureDate: timeUtil.formatRDate(new Date(carpoolPublish.departureTime)), //出发日期
            departureTime: timeUtil.formatMTime(new Date(carpoolPublish.departureTime.replace(/-/g, '/'))), //时间
            startPoint: carpoolPublish.startPoint,//具体的出发地点
            startPointLongitude: carpoolPublish.startPointLongitude,
            startPointLatitude: carpoolPublish.startPointLatitude,
            destination: carpoolPublish.destination, //终点
            destinationLongitude: carpoolPublish.destinationLongitude,
            destinationLatitude: carpoolPublish.destinationLatitude,
          })

          var markers = maps.createMarkers(carpoolPublish.startPointLatitude, 
                                          carpoolPublish.startPointLongitude,
                                          carpoolPublish.destinationLatitude, 
                                          carpoolPublish.destinationLongitude);
          maps.calRoute(carpoolPublish.startPointLatitude,
           carpoolPublish.startPointLongitude, 
           carpoolPublish.destinationLatitude, 
           carpoolPublish.destinationLongitude).then(route => {
             _this.setData({
               markers: markers,
               distance: route.distance,
               cost: route.cost,
               polyline: route.polyline,
             });
           });
        

        }

      } else {

      }
    })
  },

  ///加载用户信息
  loadUserInfo: function () {
    let that = this;
    user.queryUser(that.data.userInfo.id).then(res => {
      var userInfo = res.data.userInfo;
      if (userInfo != null) {
        that.setData({
          userInfo: userInfo,
        });
      }
    }).catch((err) => {
      console.log(err)
    });
  },
  //绑定日期
  bindDateChange: function (e) {
    this.setData({ departureDate: e.detail.value })
  },
  //绑定时间
  bindTimeChange: function (e) {
    this.setData({ departureTime: e.detail.value })
  },
  //获取起点位置
  getStartLocation: function () {
    maps.getLocation().then(res => {
      this.setData({
        startPoint: res.name,//具体的出发地点
        startPointLongitude: res.longitude,
        startPointLatitude: res.latitude,
      })
    });

  },
  //获取终点位置
  getEndLocation: function () {
    maps.getLocation().then(res => {
      this.setData({
        destination: res.name,//具体的出发地点
        destinationLongitude: res.longitude,
        destinationLatitude: res.latitude,
      })
    });
  },

  //绑定减少数量
  bindSubNumber: function (e) {
    //console.log("formId --- " + e.detail.formId);
    var _this = this;
    //收集formid
    common.collectFormId(_this.data.userInfo.id, _this.data.userInfo.wxOpenid, e.detail.formId);
    this.setData({
      passengerNum: (_this.data.passengerNum - 1 <= 0) ? 1 : _this.data.passengerNum - 1,
    })
  },
  //绑定增加数量
  bindplusNumber: function (e) {
    //console.log("formId --- " + e.detail.formId);
    var _this = this;
    //收集formid
    common.collectFormId(_this.data.userInfo.id, _this.data.userInfo.wxOpenid, e.detail.formId);
    this.setData({
      passengerNum: _this.data.passengerNum + 1,
    })
  },



  //////私有方法区///////

  volidateForm: function (e) {
    let _this = this;
    var commonRules = {
      startPoint: {
        required: true,
      },
      destination: {
        required: true,
        equals: e.detail.value.startPoint,
      },
      departureTimeStr: {
        valDepartureTime: _this.data.carpoolPublish.departureTime,
      },
    }
    var commonMessages = {
      startPoint: {
        required: "起点不能为空",
      },
      destination: {
        required: "终点不能为空",
        equals: "终点不能与起点相同",
      },
      departureTimeStr: {
        valDepartureTime: "出发时间必须晚于出发时间（" + timeUtil.formatTime(new Date(_this.data.carpoolPublish.departureTime.replace(/-/g, '/'))) + "）",
      },
    }
    this.WxValidate = app.WxValidate(commonRules, commonMessages);

    /**
     * 自定义验证方法
     */
    this.WxValidate.addMethod("valDepartureTime", function (departureTime, publishDepartureTime) {
      var dd = new Date();
      if (timeUtil.getDiffMinutes(new Date(publishDepartureTime.replace(/-/g, '/')), new Date(departureTime.replace(/-/g, '/'))) > 0) {
        return true;
      }
    }, "")



    if (!this.WxValidate.checkForm(e)) {
      const error = this.WxValidate.errorList[0];
      wx.showToast({
        icon: none,
        title: error.msg,
      })
      return false;
    }
    return true;
  },

  copyWxCode() {
    let that = this;
    var showMap = that.data.showMap;
    that.setData({
      showMap: false,
    });
    //复制到剪切板
    wx.setClipboardData({
      data: that.data.carpoolGroupCode,
      success() {
        wx.hideToast();
        that.setData({
          modalTitle: "您已复制管理员微信",
          showModal1: true,
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