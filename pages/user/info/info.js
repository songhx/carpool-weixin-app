var user = require('../../../services/user.js');
var common = require('../../../services/common.js');
const util = require('../../../utils/util.js');
const api = require('../../../config/api.js');
var upload = require('../../../services/upload.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    sex: 0,
    imgs: [],
    icons: [],
    imgLen: 0,
    upload: true,
    uploading0: false,
    uploading: false,
    qiniu: '',
    showError: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    user.getLocalUser(this); //加载本地用户 
    this.queryUserInfo();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  /**
   * 查询用户信息
   */
  queryUserInfo: function () {
    let that = this;
    user.queryUser(that.data.userInfo.id).then(res => {
      var userInfo = res.data.userInfo;
      if (userInfo) {
        var imgs = [];
        var icons = [];
        if (userInfo.idCardBack != null) { imgs.push(userInfo.idCardBack); }
        if (userInfo.idCardFace != null) { icons.push(userInfo.idCardFace); }
        that.setData({
          userInfo: userInfo,
          sex: userInfo.sex != null ? userInfo.sex : 0,
          imgs: imgs,
          icons: icons,
        });
      }
    }).catch((err) => {
      wx.showToast({
        icon:"none",
        title: "数据加载失败",
      })
    });
  },

  ///性别选择
  listenerChangeSex: function (e) {
    let that = this;
    that.setData({
      sex: e.currentTarget.dataset.sex,
    });
  },
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

  //提交编辑
  submit: function (e) {
    let _this = this;
    e.detail.value.id = _this.data.userInfo.id; //用户主键id
    e.detail.value.sex = _this.data.sex; //性别
    if (!_this.validate(e)) {
      return;
    }
    var idCardFace = "";
    if (_this.data.icons.length > 0) {
      idCardFace = _this.data.icons[0]; 
    }else{
      wx.showToast({
        icon: "none",
        title: "身份证正面不能为空",
      })
      return;
    }
    e.detail.value.idCardFace = idCardFace;

    if (_this.data.imgs.length <= 0) {
      wx.showToast({
        icon: "none",
        title: "身份证背面不能为空",
      })
      return;
    } else {
      e.detail.value.idCardBack = _this.data.imgs[0];
    }
    var formData = e.detail.value;
    console.log("formData-------------" + JSON.stringify(formData));
    util.request(api.SaveUserInfo, formData, "POST").then(function (res) {
      if (res.errno === 0) {
        var userInfo = _this.data.userInfo;
        userInfo.isRealName = 1;
        wx.setStorageSync('userInfo', userInfo);
        wx.showToast({
          title: "操作成功!",
        })
        wx.navigateBack({
          delta: 1
        })
      } else {
        wx.showToast({
          icon: 'none',
          title: res.errmsg,
        })
      }
    });

  },

  //参数校验
  validate: function (e) {
    var rules = {
      userName: {
        required: true,
        maxlength: 100,
      },
      mobile: {
        required: true,
        tel:true,
      },
    }
    var messages = {
      userName: {
        required: "用户姓名不能为空",
        maxlength: "用户姓名不能大于100字",
      },
      mobile: {
        required: "手机号不能为空",
      },
    }
    this.WxValidate = app.WxValidate(rules, messages);
    if (!this.WxValidate.checkForm(e)) {
      const error = this.WxValidate.errorList[0];
      wx.showToast({
        icon: "none",
        title: error.msg,
      })
      return false;
    }
    return true;
  },


 
})