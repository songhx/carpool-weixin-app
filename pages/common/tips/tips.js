var app = getApp();
Page({
  data: {
    basePath: app.globalData._base_path, //基础路径
    id : 0,
    rs: "",
    times: 0, // 剩余发布次数
    errno: 0,
    ueserInfo: {},
    tip: null,
  },
  onLoad: function (options) {
    let that = this;
    let userInfo = wx.getStorageSync('userInfo');
    var tip = options.tip;
    var times = options.times;
    console.log("times----------" + options.times);
    if (-1 != times && !isNaN(times)) {
      tip = "今天您还可以发布" + times + "次";
    }
    this.setData({
      userInfo: app.globalData.userInfo,
      rs: options.rs,
      errno: options.errno,
      tip: tip,
    });
  },
  onShow: function () {
    // 页面显示
  },
  

  //查看订单
  toOrder:function(){
    wx.switchTab({
      url: '/pages/user/index/index',
    })
  },

  //跳转首页(知道了)
  toIndex:function(){
     wx.switchTab({
       url: '/pages/index/index',
     })
  }
  

})