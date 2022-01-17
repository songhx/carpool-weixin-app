var e = getApp();
const util = require('../../utils/util.js');
const config = require('../../config/api.js');
const user = require('../../services/user.js');

Page({
  data:{
    userInfo: {},
    infoId:0,
    item:{},
    dataList: [],
    start: 1,
    totalPage: 1,
    content: '', // 评论内容
  },
  onLoad:function(options){
    this.setData({
      infoId: options.id,
    });
    user.getLocalUser(this); //加载本地用户
    //页面初始化 options为页面跳转所带来的参数
    this.queryItem();
    this.refreshNewData();

  },

  ///查询数据
  queryItem: function () {
    let that = this;
    var data = {
      id: that.data.infoId,
    };
    util.request(config.queryInfo, data, 'POST').then(res => {
      if (res.errno === 0) {
        res.data.isDetail = 0;
        if (null != res.data.imgUrl && res.data.imgUrl != "") {
          res.data.imageList = res.data.imgUrl.split(",");
        }
      
        that.setData({
          item: res.data,
        });
   
      }
    }).catch((err) => {
      console.log("queryInfo -- error -- " + err);
    })
  },

  ///查询数据
  queryList: function () {
    let that = this;
    var data = {
      limit: 20,
      start: that.data.start,
      infoId: that.data.infoId,
    };
    util.request(config.queryCommentList, data, 'POST').then(res => {
      if (res.errno === 0) {
        that.setData({
          totalPage: res.data.total,
          dataList: that.data.dataList.concat(res.data.list),
        });
        setTimeout(function () {
          util.hideToast();
          wx.stopPullDownRefresh();
        }, 800);
      }
    }).catch((err) => {
      console.log("queryInfoList -- error -- " + err);
    })
  },

  //刷新数据
  refreshNewData:function(){
    //加载提示框
    util.showLoading();
    var that = this;
    that.setData({
      start: 1,
      dataList: [],
    });
    that.queryList();
  },
  refreshData:function(){
    console.log("刷新数据");
    this.refreshNewData();
  },
  //加载更多操作
  onReachBottom:function(){
    console.log("加载更多");
    //加载提示框
    util.showLoading();
    var that = this;
    var start = that.data.start + 1;
    if (that.data.start + 1 > that.data.totalPage) {
      util.hideToast();
      return;
    }
    that.setData({
      start: start,
    });
    that.queryList();
      
    },

  //点击赞按钮
  zanEvent: function (e) {
    let that = this;
    var id = e.currentTarget.dataset.id
    var data = {
      id: id,
    };
    util.request(config.agreeComment, data, 'POST').then(res => {
      if (res.errno === 0) {
        var data = that.data.dataList;
        for (var i = 0; i < data.length; i++) {
          if (data[i].id == id) {
            data[i].agreeNum = data[i].agreeNum + 1;
          }
        }
        that.setData({
          dataList: data,
        });
      }
    }).catch((err) => {
      console.log("zanEvent -- error -- " + err);
    })
  },

  //监听内容
  listenerContent: function (e) {
    this.setData({
      'content': e.detail.value
    });
  },

  /**
   * 评论或回复
   */

  comment: function (e) {
    var _this = this;
    if (_this.data.content == '' || _this.data.content == null) {
      return;
    }
    let that = this;
    var data = {
      infoId: that.data.infoId,
      name: _this.data.userInfo.nickName,
      avatar: _this.data.userInfo.avatar,
      content: _this.data.content,
    };
    util.request(config.comment, data, 'POST').then(res => {
      this.setData({
        'content': ""
      });
      if (res.errno === 0) {

        _this.refreshNewData();
      }
    }).catch((err) => {
      console.log("comment -- error -- " + err);
    })
  },

  preImg:function(e){
    var src = e.currentTarget.dataset.src;//获取data-src
    var imgList = e.currentTarget.dataset.list;//获取data-list
    //图片预览
    wx.previewImage({
      current: src, // 当前显示图片的http链接
      urls: imgList // 需要预览的图片http链接列表
    })
  },

})