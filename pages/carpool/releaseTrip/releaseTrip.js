// pages/releaseTrip/releaseTrip.js
const util = require('../../../utils/util.js');
var user = require('../../../services/user.js');
var timeUtil = require('../../../utils/timeUtils.js');
var maps = require('../../../utils/maps.js');
var publisTrip = require('../../../services/publish.js');
var common = require('../../../services/common.js');
const wecache = require('../../../utils/wecache.js');
var app = getApp();
const carpoolTypeList = ["区域出行","同城出行","城际出行"];
Page({

  /**
   * 页面的初始数据
   */
  data: {
    publishId: 0,
    userInfo: {},
    carpoolCar: {},
    departureDate:"", //出发日期
    departureTime:"", //时间
    startPoint: "",//具体的出发地点
    startPointLongitude:0.00,
    startPointLatitude:0.00,
    destination:"", //终点
    destinationLongitude:0.00,
    destinationLatitude:0.00,
    isDriver:false,
    passengerOrSeatLabel:"乘客数",
    passengerNum:1,
    dateStartVal:'', //可选择的开始日期
    dateEndtVal: '',//可选择的结束日期
    price:0.00,
    byWays:"",
    bake:"",
    carpoolTypeList: carpoolTypeList,
    carpoolTypeIndex:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;
    user.getLocalUser(this); //加载本地用户
   
    
  },

  /**
 * 生命周期函数--监听页面显示
 */
  onShow: function () {
    let _this = this;
    _this.loadUserInfo(); // 加载用户信息
    ///发布次数控制
    var oldTimes = common.getCarPoolTimes();
    if (app.globalData.maxCarpoolTimes - oldTimes < 0) {
      wx.showModal({
        title: '系统提示',
        content: '很抱歉，今天您的发布机会已用完',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            wx.switchTab({
              url: '/pages/index/index',
            })
          }
        }
      })
      return;
    }
    ///设置拼车时间及范围控制
    var date = new Date();
    this.setData({
      departureDate: timeUtil.formatRDate(date),
      departureTime: timeUtil.getMinuteBeforeAndAfter(date,15), //延后15分钟
      dateStartVal: timeUtil.formatRDate(date),
      dateEndtVal: timeUtil.getDateBeforeAndAfter(date, 31),
    })
    
    var publishId = wecache.get("carpool_publishId",0);
    ///重新发布参数设置
    if (publishId != 0) {
      _this.setData({
        publishId: publishId,
      })
      _this.rePublish();
    }
  },

  ///加载用户信息
  loadUserInfo: function () {
    let that = this;
    user.queryUser(that.data.userInfo.id).then(res => {
      var userInfo = res.data.userInfo;
      if (userInfo != null) {
        if (userInfo.isRealName == 0) { //用户未认证，跳转用户认证
          ///去完善用户信息
          wx.navigateTo({
            url: '/pages/user/info/info',
          })
        } else {
          that.setData({
            userInfo: userInfo,
          });
        }
      }
    }).catch((err) => {
      console.log(err)
    });
  },

  /**
 * 监听拼成类型变化
 */
  lisentCarpoolTypeChanges: function (e) {
    let _this = this;
    _this.setData({
      carpoolTypeIndex: e.detail.value,
    });
  },

  /**
   * 再次发布
   */
  rePublish: function () {
    wecache.remove("carpool_publishId");
    let  _this = this;
    if (_this.data.publishId != 0){
      publisTrip.queryTrip({ id: _this.data.publishId}).then(res => {
        if (res.errno === 0) {
          var carpoolPublish = res.data;
           ///初始化数据
           _this.setData({
             isDriver: (carpoolPublish.userType == 1),
             carpoolTypeIndex: carpoolPublish.type,
             startPoint: carpoolPublish.startPoint,//具体的出发地点
             startPointLongitude: carpoolPublish.startPointLongitude,
             startPointLatitude: carpoolPublish.startPointLatitude,
             destination: carpoolPublish.destination, //终点
             destinationLongitude: carpoolPublish.destinationLongitude,
             destinationLatitude: carpoolPublish.destinationLatitude,
             price: carpoolPublish.price,
             byWays: carpoolPublish.byWays,
             bake: carpoolPublish.bake,
           })
        }
      }).catch((err) => {
        console.log(err)
      });
    }
  },

  //发布操作
  publishTripSub: function (e) {

    let _this = this;
    //收集formid
    common.collectFormId(_this.data.userInfo.id, _this.data.userInfo.wxOpenid, e.detail.formId);

    var oldTimes = common.getCarPoolTimes();
    console.log("oldTimes----------" + oldTimes);
    if (app.globalData.maxCarpoolTimes - oldTimes < 0){return;} //如果达到今天发布上限，提交无效
    var formData = e.detail.value;
    e.detail.value.userType = _this.data.isDriver ? 1 : 0;
    e.detail.value.publishUserId = _this.data.userInfo.id;
    e.detail.value.departureTimeStr = _this.data.departureDate + " " + _this.data.departureTime + ":00";
    e.detail.value.startPoint = _this.data.startPoint;//具体的出发地点
    e.detail.value.startPointLongitude = _this.data.startPointLongitude;
    e.detail.value.startPointLatitude = _this.data.startPointLatitude;
    e.detail.value.destination = _this.data.destination;//终点
    e.detail.value.destinationLongitude = _this.data.destinationLongitude;
    e.detail.value.destinationLatitude = _this.data.destinationLatitude;
    e.detail.value.passengerNum = _this.data.passengerNum;
    e.detail.value.type = _this.data.carpoolTypeIndex; 
    if (_this.volidatePublishForm(e)){
      wx.showModal({
        title: '发布提醒',
        content: '您确认发布此条信息吗？',
        success: function (res) {
          if (res.confirm) {
            //发布行程
            publisTrip.publish(e.detail.value).then(res => {
              if (res.errno === 0) {
                common.setCarPoolTimes(1); //记录发布拼车次数
                if (oldTimes == 0) oldTimes = 1;
                var times = app.globalData.maxCarpoolTimes - oldTimes;
                console.log("times----------" + times);
                wx.redirectTo({
                  url: '/pages/common/tips/tips?errno=0&rs=恭喜您发布信息成功&times=' + (times < 0 ? 0 : times) +"&tip=1",
                })
              }
            }).catch((err) => {
              console.log(err)
            });
          }
        }
      })
    }
  },

 
  //绑定减少数量
  bindSubNumber: function (e) {
    //console.log("formId --- " + e.detail.formId);
    var _this = this;
    //收集formid
    common.collectFormId(_this.data.userInfo.id, _this.data.userInfo.wxOpenid, e.detail.formId);
    this.setData({
      passengerNum: (_this.data.passengerNum - 1 <= 0) ? 1 : _this.data.passengerNum - 1, //最小值为1
    })
    
  },
  //绑定增加数量
  bindplusNumber: function (e) {
    //console.log("formId --- " + e.detail.formId);
    var _this = this;
    //收集formid
    common.collectFormId(_this.data.userInfo.id, _this.data.userInfo.wxOpenid, e.detail.formId);
    this.setData({
      passengerNum:  _this.data.passengerNum + 1,
    })
  },
  ///选择用户类型
  chooseUserType:function(){
    let _this = this;
    var isDriver = !this.data.isDriver;
    _this.setData({
      isDriver: isDriver,
      passengerOrSeatLabel: isDriver ? "座位数" : "乘客数",
    })
    ///如果不是司机，需先完善车辆信息
    if ( isDriver && _this.data.userInfo.isAuth == 0) {
      wx.showModal({
        title: '系统提示',
        content: '您的车主身份还未认证，请先完善信息',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/user/info/carInfo',
            })
          }
        }
      })
      return;
    }
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
  getStartLocation: function(){
    maps.getLocation().then(res => {
      this.setData({ 
        startPoint: res.name,//具体的出发地点
        startPointLongitude: res.longitude,
        startPointLatitude: res.latitude,
      })
    });
   
  },
  //获取终点位置
  getEndLocation:function(){
    maps.getLocation().then(res => {
      this.setData({
        destination: res.name,//具体的出发地点
        destinationLongitude: res.longitude,
        destinationLatitude: res.latitude,
      })
    });
  },
  //////私有方法区///////

  volidatePublishForm: function(e){
    var commonRules = {
      startPoint: {
        required: true,
      },
      destination: {
        required: true,
        equals: e.detail.value.startPoint,
      },
      departureTimeStr: {
        valDepartureTime: true,
      },
      bake: {
        maxlength: 30,
      },
    } 
    var commonMessages ={
      startPoint: {
        required: "起点不能为空",
      },
      destination: {
        required: "终点不能为空",
        equals:"终点不能与起点相同",
      },
      departureTimeStr: {
        valDepartureTime: "出发时间必须大于当前时间10分钟",
      },
      bake: {
        maxlength: "备注不能大于30个字",
      },
    }
    this.WxValidate = app.WxValidate(commonRules, commonMessages);
   
    /**
     * 自定义验证方法
     */
    this.WxValidate.addMethod("valDepartureTime", function (departureTimeStr) {
      var dd = new Date();
      if (timeUtil.getDiffMinutes(dd, new Date(departureTimeStr.replace(/-/g, '/'))) < 10) {
        return true;
      }
     },"出发时间必须大于当前时间10分钟")


    if (e.detail.value.userType == 1) { //司机发布
      commonRules.byWays= {
        required: true,
          maxlength: 60,
        };
      commonRules.price= {
        required: true,
          min:0,
      }
      commonMessages.byWays = {
        required: "途经地不能为空",
          maxlength: "途经地不能超过60个字符",
        }
      commonMessages.price = {
        required: "价格不能为空",
        }
     
    }
   
    if (!this.WxValidate.checkForm(e)) {
      const error = this.WxValidate.errorList[0];
      wx.showToast({
        icon:'none',
        title: error.msg,
      })
      return false;
    }


  

    return true;
  }

})



