const util = require('../../utils/util.js');
const api = require('../../config/api.js');
const user = require('../../services/user.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    articleList: [], //文章列表
    start: 1, // 页码
    totalPage: 0, // 共有页
    limit: 5,//每页条数
    hideHeader: true, //隐藏顶部提示
    hideBottom: true, //隐藏底部提示
    srollViewHeight: 0, //滚动分页区域高度
    refreshTime: '', // 刷新的时间 
    loadMoreData: '加载更多……',
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
    _this.queryArticleList();
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
      _this.queryArticleList();
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
      _this.queryArticleList();
    }, 300);
  },

  /**
    * 查询文章类表
    */
  queryArticleList: function () {
    let _this = this;
    var data = {
      start: _this.data.start,
      limit: _this.data.limit,
    };
    util.request(api.queryArticleList, data).then(res => {
      if (res.errno === 0) {
        var list = res.data.list;
        if (null != list) {
          if (_this.data.start == 1) { // 下拉刷新
            _this.setData({
              articleList: list,
              hideHeader: true,
              totalPage: res.data.totalPage,
            })
          } else { // 加载更多
            //console.log('加载更多');
            var tempArray = _this.data.articleList;
            tempArray = tempArray.concat(list);
            _this.setData({
              totalPage: res.data.totalPage,
              articleList: tempArray,
              hideBottom: true
            })
          }

        }
      }
    }).catch((err) => {
      wx.showToast({
        icon: 'none',
        title: "数据加载失败",
      })
    });;
  },

 

  
})