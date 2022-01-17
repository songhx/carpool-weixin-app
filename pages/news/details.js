const util = require('../../utils/util.js');
const api = require('../../config/api.js');
const user = require('../../services/user.js');
var WxParse = require('../../lib/wxParse/wxParse.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id : 0, //文章ID
    article:{
      previewImg: '/images/enshrine/1.png', //默认预览图 
    }, // 文章具体内容
    userInfo: {}, // 用户信息
  },
  /*********************************页面事件监听开始*****************************/
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _this = this;
    //初始化数据
    _this.setData({
      id: options.id,
    })
    user.getLocalUser(this); //加载本地用户

    //加载文章内容
    _this.queryDetails();

    //查看数加一
    _this.view();
  },

 
  

  /*********************************页面事件监听结束*****************************/


  /*********************************页面逻辑方法开始*****************************/

    /**
     * 增加查看数
     */
    view: function() {
      let _this = this;
      var data = {
        id: _this.data.id,
      };
      util.request(api.UpdateView, data, "POST").then(function (res) {
        if (res.errno === 0) {
          console.log("数量加一成功");
        }
      });
    },

   /**
    * 加载详情页信息
    */
  queryDetails: function (){
    let _this = this;
    var data = {
      id: _this.data.id,
    };
    util.request(api.QueryArticleDetail, data).then(function (res) {
      if (res.errno === 0) {
        //初始化标题
        wx.setNavigationBarTitle({
          title: res.data.title
        });
        _this.setData({
          article: res.data,
        });
        WxParse.wxParse('detailContent', 'html', res.data.content, _this);
      }
    });
  },

  


  /*********************************页面逻辑方法结束*****************************/
})