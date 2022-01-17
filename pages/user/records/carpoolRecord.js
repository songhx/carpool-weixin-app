// pages/carpoolRecord/carpoolRecord.js
var timeUtil = require('../../../utils/timeUtils.js');
var publisTrip = require('../../../services/publish.js');
const user = require('../../../services/user.js');
var common = require('../../../services/common.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    /**
    * 导航
    */
    navs: [
      { id: 1, navName: '我是司机', tip: '我是司机', userType: 1,  isActive: true },
      { id: 2, navName: '我是乘客', tip: '我是乘客', userType: 0,  isActive: false },
    ],
    userType:1,
    publishList: [],
    start: 1, // 页码
    totalPage: 0, // 共有页
    limit: 6,//每页条数
    hideHeader: true, //隐藏顶部提示
    hideBottom: true, //隐藏底部提示
    srollViewHeight: 0, //滚动分页区域高度
    refreshTime: '', // 刷新的时间 
    loadMoreData: '加载更多……',
    userInfo: {},
    statusArr: ["发布中","完成","取消" ,"过期","确认中"]
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;
    let userInfo = wx.getStorageSync('userInfo');
    this.setData({
      userInfo: userInfo,
    });
  },

  /**
     * 生命周期函数--监听页面显示
     */
  onShow: function () {
    let _this = this;
    _this.queryPublishList();
  },

  //切换服务tab
  switchTab: function (e) {
    var _this = this;
    //收集formid
    common.collectFormId(_this.data.userInfo.id, _this.data.userInfo.wxOpenid, e.detail.formId);
    var id = e.detail.value.id;
    var tmpArr = _this.data.navs;
    for (var i = 0; i < tmpArr.length; i++) {
      if (tmpArr[i].id == id) {
        tmpArr[i].isActive = true;
      } else {
        tmpArr[i].isActive = false;
      }
    }
    _this.setData({
      userType: e.detail.value.userType,
      navs: tmpArr,
    });

    _this.clickTab();

  },

  //点击tab切换
  clickTab: function () {
    var _this = this;
    setTimeout(function () {
      _this.setData({
        start: 1,
        refreshTime: new Date().toLocaleTimeString(),
        hideHeader: false
      })
      _this.queryPublishList();
    }, 300);
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
      _this.queryPublishList();
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
      _this.queryPublishList();
    }, 300);
  },

  /**
    * 查询行程信息
    */
  queryPublishList: function () {
    let _this = this;
    var data = {};
    data.start = _this.data.start;
    data.limit = _this.data.limit;
    data.publishUserId = _this.data.userInfo.id;
    data.userType = _this.data.userType;
    publisTrip.queryHistorys(data).then(res => {
      if (res.errno === 0) {
        var list = res.data.list;
        if (null != list) {
          for (var i = 0; i < list.length; i++) {
            list[i].departureTime = timeUtil.formatTime(new Date(list[i].departureTime));
            list[i].status = _this.data.statusArr[list[i].status];
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

        }

      }
    }).catch((err) => {
      wx.showToast({
        icon: 'none',
        title: '数据加载失败',
      })
    });;
  },
 

  //导航跳转
  navTo: function (e) {
    //收集formid
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

  //跳转首页
  toIndex: function () {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },

})