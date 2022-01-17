// pages/sindex/index.js

const util = require('../../utils/util.js');
const api = require('../../config/api.js');
const user = require('../../services/user.js');
var common = require('../../services/common.js');
var timeUtil = require('../../utils/timeUtils.js');
var app = getApp();
Page({
  data: {
    userInfo: {},
    tipTxt: '', // 提示文字
    isActiveTips: false, // 是否激活提示
    index: 0,
    banner: [
      {
        id: 1,
        image_url: "/static/images/deafalut_banner.png",
      }
    ],
    navs:null,
    notice:null,
    articleList:[], //文章列表
    tabIndex:0,
    carpoolPublish: null, //最近发布拼车
    carpoolSubscribe:null, //最近预约
    statusArr: ["发布中", "完成", "取消", "过期", "确认中"]
  },

  onLoad: function (options) {
    let _this = this;
    user.getLocalUser(this); //加载本地用户
  },
 
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let _this = this;
    _this.queryNavs();
    _this.queryNotice();
    _this.queryBanner(); //加载轮播图
    // this.queryLatest();
    _this.queryArticleList();
    _this.declareFun();//免责声明
  },

  ///免责声明
  declareFun:function(){
    let userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      wx.redirectTo({
        url: '/pages/common/auth/login',
      })
      return;
    }
    wx.getStorage({
      key: 'declare_key',
      success: function(res) {
        if (res.data == undefined || res.data == null){
          wx.redirectTo({
            url: '/pages/common/declare/declare',
          })
        }
      },
      fail:function(){
        wx.redirectTo({
          url: '/pages/common/declare/declare',
        })
      }
    })
  },

  //分享
  onShareAppMessage: function () {
    return {
      title: app.globalData._appName,
      desc: app.globalData._appName + '让出行更方便，让生活更美好!',
      path: '/pages/index/index'
    }
  },

  /**
  * 导航
  */
  queryNavs: function () {
    let _this = this;
    var data = {
      start: 1,
      limit: 4,
    };
    util.request(api.QueryNavs, data, "GET").then(function (res) {
      if (res.errno === 0) {
        _this.setData({
          navs: res.data.list,
        });
      }
    });
  },

  /**
   * 切换拼车记录tab
   */
  swithchTab:function(e) {
    let _this = this;
    var index = e.currentTarget.dataset.index;
    _this.setData({
      tabIndex: index
    });
  },

  /**
 * 再次发布
 */
  relPublish: function (e) {
    let _this = this;
    //收集formid
    //common.collectFormId(_this.data.userInfo.id, _this.data.userInfo.wxOpenid, e.detail.formId);
    wecache.put("carpool_publishId", _this.data.publishId, 60 * 60);
    wx.switchTab({
      url: '/pages/carpool/releaseTrip/releaseTrip',
    })
  },

  /**
  * 最近拼车信息
  */
  queryLatest: function () {
    let _this = this;
    var data = {
      publishUserId: _this.data.userInfo.id,
    };
    util.request(api.QueryLatest, data,"POST").then(function (res) {
      if (res.errno === 0) {
        _this.setData({
          carpoolPublish: res.data.carpoolPublish, //最近发布拼车
          carpoolSubscribe: res.data.carpoolSubscribe, //最近预约
        });
      }
    });
  },

  /**
   * 查询公告
   */
  queryNotice:function() {
    let that = this;
    var data = {
      start:1,
      limit:1,
    };
    util.request(api.queryNoticeList, data).then(function (res) {
      if (res.errno === 0) {
        if(res.data.list) {
          that.setData({
            notice: res.data.list[0]
          });
        }
      }
    });
  },

  /**
   * 查询首页录播图
   */
  queryBanner:function(){
    let that = this;
    util.request(api.CarpoolBanner).then(function (res) {
      if (res.errno === 0) {
        that.setData({
          banner: res.data.banner
        });
      }
    });
  },

  /**
   * 查询文章
   */
  queryArticleList: function () {
    let that = this;
    var data = {
      start: 1,
      limit: 3,
    };
    util.request(api.queryArticleList, data).then(function (res) {
      if (res.errno === 0) {
        if (res.data.list) {
          that.setData({
            articleList: res.data.list
          });
        }
      }
    });
  },


  //导航跳转
  navTo: function (e) {
    let _this = this;

    var formData = e.detail.value;
    if (formData.open == 0){
      common.skipAndCollectFormId(_this.data.userInfo.id, _this.data.userInfo.wxOpenid, e);
    }else{
      //收集formid
      common.collectFormId(_this.data.userInfo.id, _this.data.userInfo.wxOpenid, e.detail.formId);
      _this.navDisabledTip();
    }
      
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
