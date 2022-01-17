// pages/findPerson/findPerson.js
var timeUtil = require('../../../utils/timeUtils.js');
var maps = require('../../../utils/maps.js');
var publisTrip = require('../../../services/publish.js');
var common = require('../../../services/common.js');
const user = require('../../../services/user.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

    userType: 0,
    departureDate: "", //出发日期
    departureTime: "", //时间
    startPoint: "",//具体的出发地点
    startPointLongitude: 0.00,
    startPointLatitude: 0.00,
    destination: "", //终点
    destinationLongitude: 0.00,
    destinationLatitude: 0.00,
    custLongitude: 0.00,
    custLatitude: 0.00,
    publishList: [],
    start: 1, // 页码
    totalPage: 0, // 共有页
    limit: 3,//每页条数
    hideHeader: true, //隐藏顶部提示
    hideBottom: true, //隐藏底部提示
    srollViewHeight: 0, //滚动分页区域高度
    refreshTime: '', // 刷新的时间 
    loadMoreData: '加载更多……',
    tabIndex:0,
    showModal: false,
    modalTitle: "",
    carpoolGroupCode: app.globalData._wx_cdoe,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.$wuxLoading = app.Wux().$wuxLoading //加载
    let _this = this;

    let userInfo = wx.getStorageSync('userInfo');
    let token = wx.getStorageSync('token');

    // 页面显示
    if (userInfo && token) {
      app.globalData.userInfo = userInfo;
      app.globalData.token = token;
    } else {
      _this.login();
    }

    this.setData({
      userInfo: app.globalData.userInfo,
    });

    _this.setData({
      departureDate: timeUtil.formatRDate(new Date()),///设置出发时间为今天，默认
      departureTime: timeUtil.formatMTime(new Date()),
      dateStartVal: timeUtil.formatRDate(new Date()),///设置出发时间为今天，默认
      dateEndtVal: timeUtil.getDateBeforeAndAfter(new Date(),31), ///31
      userType: options.type,
      refreshTime: new Date().toLocaleTimeString(),
    })
    //初始化标题
    wx.setNavigationBarTitle({
      title: options.type == 0 ? "我是司机" : "我是乘客",
    });
    _this.loadPublishByUserLocaion(); // 加载用户当前位置信息初始化列表
    _this.refreshTimer(); //刷新timer
    //开启刷新
    if (this.interval) clearInterval(this.interval);;
    this.interval = setInterval(function () {
      _this.refreshTimer();
    }, 10000);//10秒刷新
  },

  /**
 * 生命周期函数--监听页面显示
 */
  onShow: function () {
   
  },

  //分享
  onShareAppMessage: function () {
    let _this = this;
    return {
      title: app.globalData._appName,
      desc: app.globalData._appName + '让出行更方便，让生活更美好!',
      path: '/pages/carpool/carpoolList/carpoolList?type=' + this.data.userType
    }
  },

  onUnload: function () {

    // 检查当前设置
    wx.getSetting({
      success(res) {
        if (res.authSetting["scope.userInfo"] && res.authSetting['scope.userLocation']) {
          wx.switchTab({
            url: '/pages/index/index',
          })
        }
      }
    })
  },
  /**
   * 切换菜单
   */
  swithchTab: function (e) {
    let _this = this;
    var id = e.currentTarget.dataset.id;
    _this.setData({
      tabIndex: id,
      publishList: [],
      start: 1, // 页码
      totalPage: 0, // 共有页
      limit: 3,//每页条数
      hideHeader: true, //隐藏顶部提示
      hideBottom: true, //隐藏底部提示
      startPoint: "",//具体的出发地点
      startPointLongitude: 0.00,
      startPointLatitude: 0.00,
      destination: "", //终点
      destinationLongitude: 0.00,
      destinationLatitude: 0.00,
    });
    _this.loadPublishByUserLocaion();
  },
  // 上拉加载更多
  loadMore: function () {
    let _this = this;
    // 当前页是最后一页
    if (_this.data.start == _this.data.totalPage) {
      _this.setData({ loadMoreData: '已加载全部内容' })
      return;
    }
    setTimeout(function () {
      //console.log('上拉加载更多');
      _this.setData({
        start: _this.data.start + 1,
        hideBottom: false
      })
      _this.loadPublishByUserLocaion();
    }, 300);
  },

  // 下拉刷新
  refresh: function (e) {
    let _this = this;
    setTimeout(function () {
      //console.log('下拉刷新');
      _this.setData({
        start: 1,
        refreshTime: new Date().toLocaleTimeString(),
        hideHeader: false
      })
      _this.loadPublishByUserLocaion();
    }, 300);
  },



  loadPublishByUserLocaion: function () {
    let _this = this;
    wx.getLocation({
      success: function (res) {
        _this.setData({
          custLongitude: res.longitude,
          custLatitude: res.latitude,
        });
        _this.$wuxLoading.show({ text: '数据加载中', })
        _this.queryPublishList(); // 加载行程信息
      },
      fail: function (err) {
        var pages = getCurrentPages()    //获取加载的页面
        var currentPage = pages[pages.length - 1]    //获取当前页面的对象
        var url = currentPage.route   //当前页面url
        wx.redirectTo({
          url: "/pages/common/auth/auth?backTo=" + url + "&type=" + _this.data.userType + "&flag=2"
        });
      }
    })
  },
  /**
   * 刷新时间
   */
  refreshTimer: function () {
    var _this = this;
    if (_this.data.publishList.length > 0) {
      for (var i = 0; i < _this.data.publishList.length; i++) {
        _this.data.publishList[i].timer = timeUtil.getDateDiff(new Date(_this.data.publishList[i].updateTime).getTime());
      }
      _this.setData({
        publishList: _this.data.publishList,
      });
    }
  },

  /**
   * 跳转详情页
   */
  toDetail:function(e) {
    let _this = this;
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/carpool/carpoolDetail/carpoolDetail?id=' + id,
    })
  },

  /**
   * 收缩
   */
  toggle: function (e) {
    let _this = this;
    var id = e.currentTarget.dataset.id;
    var list = _this.data.publishList;
    if(list) {
      list.forEach(p => {
        if(p.id === id) {
          p.isFold = (!p.isFold);
        }
      });
      _this.setData({
        publishList: list,
      })
    }

  },

  /**
   * 查询行程信息
   */
  queryPublishList: function () {
    let _this = this;
    var data = {};
    data.userType = _this.data.userType; //车找人
    data.start = _this.data.start;
    data.limit = _this.data.limit;
    data.departureTimeStr = _this.data.departureDate + " " + _this.data.departureTime + ":00";
    data.custLongitude = _this.data.custLongitude;
    data.custLatitude = _this.data.custLatitude;
    data.startPoint = _this.data.startPoint;//具体的出发地点
    data.startPointLongitude = _this.data.startPointLongitude;
    data.startPointLatitude = _this.data.startPointLatitude;
    data.destination = _this.data.destination;//终点
    data.destinationLongitude = _this.data.destinationLongitude;
    data.destinationLatitude = _this.data.destinationLatitude;
    data.type = _this.data.tabIndex;
    publisTrip.queryPublishInfos(data).then(res => {
      _this.$wuxLoading.hide(); //隐藏加载动画
      if (res.errno === 0) {
        var list = res.data.list;
        if (null != list) {
          for (var i = 0; i < list.length; i++) {
            list[i].departureTime = timeUtil.formatTime(new Date(list[i].departureTime.replace(/-/g, '/')));
            list[i].distance = maps.formatDistance(list[i].distance, 2);
            list[i].byWaysOmit = common.formatStr(list[i].byWays, 20);
            list[i].isFold = (list[i].byWays.length > 20);
            list[i].startPoint = common.formatStr(list[i].startPoint, 18);
            list[i].destination = common.formatStr(list[i].destination, 18);
          }
          // console.log("start--------------" + _this.data.start);
          if (_this.data.start == 1) { // 下拉刷新
            _this.setData({
              publishList: list,
              hideHeader: true,
              totalPage: res.data.totalPage,
            })
          } else { // 加载更多
            //console.log('加载更多');
            var tempArray = _this.data.publishList;
            tempArray = tempArray.concat(list);
            _this.setData({
              totalPage: res.data.totalPage,
              publishList: tempArray,
              hideBottom: true
            })
          }

          _this.refreshTimer();
        }

      }
    }).catch((err) => {
      console.log(err)
    });;
  },
  //获取起点位置
  getStartLocation: function () {
    let _this = this;
    maps.getLocation().then(res => {
      _this.setData({
        startPoint: res.name,//具体的出发地点
        startPointLongitude: res.longitude,
        startPointLatitude: res.latitude,
      })
    });
    //_this.refresh(); // 加载行程信息
  },
  //获取终点位置
  getEndLocation: function () {
    let _this = this;
    maps.getLocation().then(res => {
      _this.setData({
        destination: res.name,//具体的出发地点
        destinationLongitude: res.longitude,
        destinationLatitude: res.latitude,
      })
    });
   // _this.refresh(); // 加载行程信息
  },

  /**
  * 置换行程
  */
  switchLocation: function () {
    let _this = this;
    var startPoint = _this.data.startPoint;
    var startPointLongitude = _this.data.startPointLongitude;
    var startPointLatitude = _this.data.startPointLatitude;
    _this.setData({
      startPoint: _this.data.destination,//具体的出发地点
      startPointLongitude: _this.data.destinationLongitude,
      startPointLatitude: _this.data.destinationLatitude,
      destination: startPoint,//具体的出发地点
      destinationLongitude: startPointLongitude,
      destinationLatitude: startPointLatitude,
    })
  },

  bindDateChange: function (e) {
    this.setData({ departureDate: e.detail.value })
    //this.refresh(); // 加载行程信息
  },

  /**
   * 跳转预定页面
   */
  goSubscribe: function (e) {
    common.skipAndCollectFormId(this.data.userInfo.id, this.data.userInfo.wxOpenid, e);
  },


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.refresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.loadMore();
  },

  copyWxCode() {
    let that = this;
    //复制到剪切板
    wx.setClipboardData({
      data: that.data.carpoolGroupCode,
      success() {
        wx.hideToast();
        that.setData({
          modalTitle: "您已复制管理员微信",
          showModal: true
        });
      }
    })
  },

  closeFloat() {
    this.setData({
      modalTitle: "",
      showModal: false
    });
  },

  callPhone:function(e) {
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