// pages/carpoolRecord/carpoolRecord.js
var timeUtil = require('../../../utils/timeUtils.js');
var orders = require('../../../services/orders.js');
const user = require('../../../services/user.js');
var common = require('../../../services/common.js');
var publisTrip = require('../../../services/publish.js');
var maps = require('../../../utils/maps.js');
const wecache = require('../../../utils/wecache.js');
var app = getApp();
const carpoolTypeList = ["区域拼车", "同城拼车", "城际拼车"];
Page({

  /**
   * 页面的初始数据
   */
  data: {
    publishId: 0,
    isHide: true,
    departureDate: "", //出发日期
    departureTime: "", //时间
    startPoint: "",//具体的出发地点
    startPointLongitude: 0.00,
    startPointLatitude: 0.00,
    destination: "", //终点
    destinationLongitude: 0.00,
    destinationLatitude: 0.00,
    carpoolPublish: {
      passengerNum: 1,
    },
    orderList: [],
    start: 1, // 页码
    totalPage: 0, // 共有页
    limit: 10,//每页条数
    userInfo: {},
    // 拼车单 '状态  0 预约中  1  预约成功  2 拒绝   3 取消  4 失效',
    statusArr: ["待确认", "预约成功", "拒绝", "已取消", "已失效"],
    carpoolTypeList: carpoolTypeList,
    carpoolTypeIndex: 0,
    tabIndex: 0,
  },

  /**
  * 生命周期函数--监听页面加载
  */
  onLoad: function (options) {
    let _this = this;
    let userInfo = wx.getStorageSync('userInfo');
    this.setData({
      userInfo: userInfo,
      publishId: options.id, // 行程id
      dateStartVal: timeUtil.formatRDate(new Date()),///设置出发时间为今天，默认
      dateEndtVal: timeUtil.getDateBeforeAndAfter(new Date(), 31), ///31
    });
    _this.queryTrip(); //查询行程详情
  },

  /**
  * 生命周期函数--监听页面显示
  */
  onShow: function () {
    let _this = this;
  
  },

  /**
  * 切换菜单
  */
  swithchTab: function (e) {
    let _this = this;
    var id = e.currentTarget.dataset.id;
    _this.setData({
      tabIndex: id,
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
* 查询具体行程信息
*/
  queryTrip: function () {
    let _this = this;
    var data = { id: _this.data.publishId };
    publisTrip.queryTrip(data).then(res => {
      if (res.errno === 0) {
        var carpoolPublish = res.data;
        if (null != carpoolPublish) {
          _this.setData({
            carpoolPublish: carpoolPublish,
            carpoolTypeIndex: carpoolPublish.type,
            isHide: !(carpoolPublish.userType == 1),
            departureDate: timeUtil.formatRDate(new Date(carpoolPublish.departureTime.replace(/-/g, '/'))), //出发日期
            departureTime: timeUtil.formatMTime(new Date(carpoolPublish.departureTime.replace(/-/g, '/'))), //时间
            startPoint: carpoolPublish.startPoint,//具体的出发地点
            startPointLongitude: carpoolPublish.startPointLongitude,
            startPointLatitude: carpoolPublish.startPointLatitude,
            destination: carpoolPublish.destination, //终点
            destinationLongitude: carpoolPublish.destinationLongitude,
            destinationLatitude: carpoolPublish.destinationLatitude,
          })
        }
        _this.queryList();
      } else {

      }
    })
  },

  ///更新行程
  updateTrip: function (e) {
    let _this = this;
    //收集formid
    common.collectFormId(_this.data.userInfo.id, _this.data.userInfo.wxOpenid, e.detail.formId);

    e.detail.value.id = _this.data.carpoolPublish.id;
    e.detail.value.departureTimeStr = _this.data.departureDate + " " + _this.data.departureTime + ":00";
    e.detail.value.startPoint = _this.data.startPoint;//具体的出发地点
    e.detail.value.startPointLongitude = _this.data.startPointLongitude;
    e.detail.value.startPointLatitude = _this.data.startPointLatitude;
    e.detail.value.destination = _this.data.destination;//终点
    e.detail.value.destinationLongitude = _this.data.destinationLongitude;
    e.detail.value.destinationLatitude = _this.data.destinationLatitude;
    e.detail.value.passengerNum = _this.data.carpoolPublish.passengerNum;
    e.detail.value.type = _this.data.carpoolTypeIndex; 
    if (_this.volidatePublishForm(e)) {
      var formData = e.detail.value;
      wx.showModal({
        title: '拼车发布提醒',
        content: '您确认修改此条拼车信息吗？',
        success: function (res) {
          if (res.confirm) {
            //更新行程
            publisTrip.updateTrip(formData).then(res => {
              if (res.errno === 0) {
                wx.showModal({
                  title: '系统提示',
                  content: '操作成功',
                  showCancel: false,
                  success: () => {
                    ///刷新数据
                    _this.queryTrip();
                  }
                });
                
              } else {
                wx.showToast({
                  icon:'none',
                  title: '操作失败！',
                })
              }
            }).catch((err) => {
              wx.showToast({
                icon: 'none',
                title: '操作失败！',
              })
            });
          }
        }
      })
    }

  },

  ///取消行程
  cancelCarPoolPublish: function (e) {
    let _this = this;
    var formData = e.detail.value;
    formData.id = _this.data.carpoolPublish.id;
    formData.status = 2;  // 取消
    // formData.operatorId = _this.data.userInfo.id;
    // formData.operatorName = _this.data.userInfo.userName;

    var oldTimes = common.getCarPoolTimes();
    //收集formid
    common.collectFormId(_this.data.userInfo.id, _this.data.userInfo.wxOpenid, e.detail.formId);

    if (formData.cancelReason == "" || formData.cancelReason == null) {
      _this.$wuxToast.show({ type: 'forbidden', text: "取消原因不能为空", });
      return;
    }
    if (formData.cancelReason.length > 60) {
      _this.$wuxToast.show({ type: 'forbidden', text: "取消原因不能大约60个字", });
      return;
    }
    wx.showModal({
      title: '拼车发布提醒',
      content: '您确认取消此条拼车信息吗？',
      success: function (res) {
        if (res.confirm) {
          //取消行程
          publisTrip.cancelCarPoolPublish(formData).then(res => {
            if (res.errno === 0) {
              if (_this.data.carpoolPublish.departureDate == parseInt(timeUtil.formatDateToInt(new Date()))) { // 当前天
                common.setCarPoolTimes(-1); //归还当天拼车次数
              }
              wx.showModal({
                title: '系统提示',
                content: '操作成功',
                showCancel: false,
                success: () => {
                  wx.navigateBack();//返回上一页面
                }
              });
            }
          }).catch((err) => {
            wx.showToast({
              icon: 'none',
              title: '取消行程失败！',
            })
          });
        }
      }
    })

  },
  /**
   * 再次发布
   */
  relPublish: function (e) {
    let _this = this;
    //收集formid
    common.collectFormId(_this.data.userInfo.id, _this.data.userInfo.wxOpenid, e.detail.formId);
    wecache.put("carpool_publishId", _this.data.publishId, 60 * 60);
    wx.switchTab({
      url: '/pages/carpool/releaseTrip/releaseTrip',
    })
  },
  /**
    * 查询预约单信息
    */
  queryList: function () {
    let _this = this;
    var data = {};
    data.start = _this.data.start;
    data.limit = _this.data.limit;
    data.publishId = _this.data.publishId;
    orders.queryOrderList(data).then(res => {
      if (res.errno === 0) {
        var list = res.data.list;
        if (null != list) {
          for (var i = 0; i < list.length; i++) {
            list[i].departureTime = timeUtil.formatTime(new Date(list[i].departureTime.replace(/-/g, '/')));
            list[i].status = _this.data.statusArr[list[i].status];
          }
          _this.setData({
            orderList: list,
            totalPage: res.data.totalPage,
          })
        }

      }
    }).catch((err) => {
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
    var _this = this;
    //收集formid
    common.collectFormId(_this.data.userInfo.id, _this.data.userInfo.wxOpenid, e.detail.formId);
    this.setData({
      "carpoolPublish.passengerNum": (_this.data.carpoolPublish.passengerNum - 1 <= 0) ? 1 : _this.data.carpoolPublish.passengerNum - 1,
    })
  },
  //绑定增加数量
  bindplusNumber: function (e) {
    //console.log("formId --- " + e.detail.formId);
    var _this = this;
    //收集formid
    common.collectFormId(_this.data.userInfo.id, _this.data.userInfo.wxOpenid, e.detail.formId);
    this.setData({
      "carpoolPublish.passengerNum": _this.data.carpoolPublish.passengerNum + 1,
    })
  },

  //导航跳转
  navTo: function (e) {

    //收集formid
    common.skipAndCollectFormId(this.data.userInfo.id, this.data.userInfo.wxOpenid, e);

  },


  //////私有方法区///////

  volidatePublishForm: function (e) {
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
    var commonMessages = {
      startPoint: {
        required: "起点不能为空",
      },
      destination: {
        required: "终点不能为空",
        equals: "终点不能与起点相同",
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
    }, "出发时间必须大于当前时间10分钟")


    if (e.detail.value.userType == 1) { //司机发布
      commonRules.byWays = {
        required: true,
        maxlength: 60,
      };
      commonRules.price = {
        required: true,
        min: 0,
      }
      commonMessages.byWays = {
        required: "途经地不能为空",
        maxlength: "途经地不能超过60个字符",
      }
      commonMessages.price = {
        required: "拼车价格不能为空",
      }

    }

    if (!this.WxValidate.checkForm(e)) {
      const error = this.WxValidate.errorList[0];
      wx.showToast({
        icon: 'none',
        title: error.msg,
      })
      return false;
    }
    return true;
  },

  //跳转首页
  toIndex: function () {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },


})