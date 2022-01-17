
const util = require('../../../utils/util.js');
const api = require('../../../config/api.js');
const user = require('../../../services/user.js');
var common = require('../../../services/common.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    appName: app.globalData._appName,
    title: '',
    content: '',
    imgs: [],
    imgLen: 0,
    upload: true,
    uploading: false,
    qiniu: '',
    showError: false
  },
  /*********************************页面事件监听开始*****************************/
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _this = this;
    let userInfo = wx.getStorageSync('userInfo');
    this.setData({
      userInfo: userInfo,
    });
  },

 
  /*********************************页面事件监听结束*****************************/

  /*********************************页面逻辑方法开始*****************************/
  
  ////////////////////////////////客户反馈处理反馈
 
  //移除图片
  removePhoto: function (e) {
    var _this = this;
    var tag = e.currentTarget.dataset.tag;
    var index = e.currentTarget.dataset.index;
    if (tag == 0) {
      _this.deleteArryByIndex(_this.data.icons, index, tag);
    } else {
      _this.deleteArryByIndex(_this.data.imgs, index, tag);
    }
  },

  deleteArryByIndex: function (arr, index, tag) {
    let that = this;
    wx.showModal({
      title: '提示',
      content: '确定要删除此图片吗？',
      success: function (res) {
        if (res.confirm) {
          console.log('点击确定了');
          arr.splice(index, 1);
        } else if (res.cancel) {
          console.log('点击取消了');
          return false;
        }
        if (tag == 0) {
          that.setData({
            icons: arr
          })
        } else {
          that.setData({
            imgs: arr
          })
        }

      }
    })
  },
  //选择图片
  choosePhoto: function (e) {
    var _this = this;
    var tag = e.currentTarget.dataset.tag;
    //检查网络状态
    wx.getNetworkType({
      success: function (res) {
        // 返回网络类型, 有效值：
        var networkType = res.networkType;
        if (networkType == '2g' || networkType == '3g' || networkType == '4g') {
          wx.showModal({
            title: '提示',
            content: '上传图片需要消耗流量，是否继续？',
            confirmText: '继续',
            success: function (res) {
              if (res.confirm) {
                _this.chooseImage(tag);
              }
            }
          });
        } else if (networkType == 'wifi') {
          _this.chooseImage(tag);
        } else {
          wx.showModal({
            title: '系统提示',
            content: '未连接网络或无法识别的网络，请保证网络畅通上传，谢谢！',
            showCancel: false,//是否显示取消按钮
            success: function (res) {
            }
          });
        }
      }
    })

  },
  //选择图片
  chooseImage: function (tag) {
    var _this = this;

    wx.chooseImage({
      count: 1,
      sourceType: ['album'],
      success: function (res) {

        var tempFilePaths = res.tempFilePaths, imgLen = tempFilePaths.length;
        _this.setData({
          uploading0: (tag == 0),
          uploading: (tag == 1),
          imgLen: _this.data.imgLen + imgLen
        });
        tempFilePaths.forEach(function (e) {
          _this.uploadImg(e, tag);
        });
      }
    });
  },
  //上传图片
  uploadImg: function (path, tag) {
    var _this = this;
    if (app.g_status) {
      wx.showModal({
        title: '系统提示',
        content: '上传失败！',
        showCancel: false,//是否显示取消按钮
        success: function (res) {
        }
      });
      return;
    }
    wx.showNavigationBarLoading();
    // 上传图片
    wx.uploadFile({
      url: api.UplodUrl, // 上传文件路径
      header: {
        'Content-Type': 'multipart/form-data'
      },
      filePath: path,
      name: 'file',
      success: function (res) {
        var data = JSON.parse(res.data);
        if (data.errno === 0) {
          if (tag == 1) {
            _this.setData({
              imgs: _this.data.imgs.concat(data.data.url),
            });
          } else {
            _this.setData({
              icons: _this.data.icons.concat(data.data.url),
            });
          }
        }
        _this.setData({
          uploading0: false,
          uploading: false
        });
      },
      fail: function (res) {
        wx.showToast({
          icon: "none",
          title: res.errmsg,
        })
      },
      complete: function () {
        wx.hideNavigationBarLoading();
      }
    });
  },
  //预览图片
  previewPhoto: function (e) {
    var _this = this;
    //预览图片
    if (_this.data.uploading) {
      app.showErrorModal('正在上传图片', '预览失败');
      return false;
    }
    wx.previewImage({
      current: _this.data.imgs[e.target.dataset.index],
      urls: _this.data.imgs
    });
  },

   //提交反馈建议
   submit: function (e) {
     var _this = this, 
       title = e.detail.value.title, content = e.detail.value.content, imgs = '';
    
     if ( !title) {
       wx.showToast({
         icon: 'none',
         title: '请输入反馈标题',
       })
       return false;
     }
     if (!content) {
       wx.showToast({
         icon:'none',
         title: '请输入反馈内容',
       })
       return false;
     }
    
     wx.showModal({
       title: '提示',
       content: '是否确认提交反馈？',
       success: function (res) {
         if (res.confirm) {
           wx.request({
             url: api.SubFeedback,
             data: {
               platformId: 1,// '业务平台id'
               wxUserId: _this.data.userInfo.id,
               wxNickName: _this.data.userInfo.nickName,
               openId: _this.data.userInfo.wxOpenid, //用户标示
               imgUrls: (_this.data.imgLen > 0) ? _this.data.imgs.join(",") : "",
               'type': 1, // 反馈
               title: title,
               content:content 
             },
             method: 'POST',
             success: function (res) {
               if (res.data.errno === 0) {
                 wx.showToast({
                   title: '反馈成功!',
                 })
                 _this.setData({
                   title: '',
                   content: '',
                   imgs: [],
                   imgLen: 0,
                 });
               } else {
                 wx.showToast({
                   icon:'none',
                   title: '反馈失败!',
                 })
               }
             },
             fail: function (res) {
               wx.showToast({
                 icon: 'none',
                 title: '反馈失败!',
               })
             },
             complete: function () {
             }
           });
         }
       }
     });
   }


  /*********************************页面逻辑方法结束*****************************/
})