var user = require('../../../services/user.js');
var common = require('../../../services/common.js');
const util = require('../../../utils/util.js');
const api = require('../../../config/api.js');
var upload = require('../../../services/upload.js');
var app = getApp();
const colorList = ["黑", "银", "灰", "白（米/香槟）", "红", "金", "蓝", "棕", "紫", "绿", "粉", "黄",];
const seatList = [5,7];
const wordList = ["A","B","C","D","E",
                  "F", "G", "H", "I", "J",
                  "K", "L", "M", "N", "O",
                  "P", "Q", "R", "S", "T",
                  "U", "V", "W", "X", "Y","Z"];
const provinces = ["京", "津", "冀", "沪", "晋", "内蒙古", 
                  "辽", "吉", "黑", "苏", "浙", "渝", "皖", "闽", "赣", "鲁", 
                  "豫", "鄂", "湘", "粤", "琼", "川", "贵", "云", "陕", "甘", "青", "桂",]; 
const carTypeList = ["轿车","SUV","出租车"];
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    carpoolCar:{},
    imgs: [],
    icons: [],
    imgLen: 0,
    upload: true,
    uploading0: false,
    uploading: false,
    qiniu: '',
    showError: false,
    colorList: colorList,
    colorIndex:0,
    seatList: seatList,
    seatIndex:0,
    lisencePrefixList:[],
    lisencePrefixIndex:0,
    carTypeList: carTypeList,
    carTypeIndex:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.createLisencePrefixList();
    user.getLocalUser(this); //加载本地用户 
    this.queryUserCarInfo();
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
  queryUserCarInfo: function () {
    let _this = this;
    user.queryUserCar(_this.data.userInfo.id).then(res => {
      var carpoolCar = res.data.carpoolCar;
      if (carpoolCar) {
        var imgs = [];
        var icons = [];
        if (carpoolCar.drivingLicense != null) { imgs.push(carpoolCar.drivingLicense);}
        if (carpoolCar.driverLicense != null) { icons.push(carpoolCar.driverLicense); }
        _this.setData({
          carpoolCar: carpoolCar,
          colorIndex: util.getArrIndex(_this.data.colorList, carpoolCar.color),
          seatIndex: util.getArrIndex(_this.data.seatList, carpoolCar.seatNums),
          lisencePrefixIndex: util.getArrIndex(_this.data.lisencePrefixList, carpoolCar.plateNumberPrefix),
          carTypeIndex: util.getArrIndex(_this.data.carTypeList, carpoolCar.carType),
          imgs: imgs,
          icons: icons,
        });
      }
    }).catch((err) => {
      wx.showToast({
        icon: "none",
        title: "数据加载失败",
      })
      console.log(err)
    });
  },
  
  /**
   * 生成车牌号前缀
   */
  createLisencePrefixList:function() {
     let  _this = this;
     var lisencePrefixList = [];
     provinces.forEach(p => {
       wordList.forEach(w =>{
         lisencePrefixList.push(p + w);
       })
     });
     _this.setData({
       lisencePrefixList: lisencePrefixList,
     });
  },

  /**
   * 监听颜色变化
   */
  lisentCarTypeChanges: function (e) {
    let _this = this;
    _this.setData({
      carTypeIndex: e.detail.value,
    });
  },

  
  /**
   * 监听颜色变化
   */
  lisentColorChanges:function(e){
    let _this = this;
    _this.setData({
      colorIndex: e.detail.value,
    });
  },

  /**
 * 监听颜色变化
 */
  lisentSeatChanges: function (e) {
    let _this = this;
    _this.setData({
      seatIndex: e.detail.value,
    });
  },

  /**
 * 监听车牌前缀变化
 */
  lisentLisencePrefixChanges: function (e) {
    let _this = this;
    _this.setData({
      lisencePrefixIndex: e.detail.value,
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
    e.detail.value.id = _this.data.carpoolCar.id != undefined ? _this.data.carpoolCar.id : null; //车辆信息ID
    e.detail.value.userId = _this.data.userInfo.id; //用户ID
    e.detail.value.color = _this.data.colorList[_this.data.colorIndex] ; //车辆颜色
    e.detail.value.seatNums = _this.data.seatList[_this.data.seatIndex]; //车辆坐量
    e.detail.value.carType = _this.data.carTypeList[_this.data.carTypeIndex]; //车辆类型
    e.detail.value.plateNumberPrefix = _this.data.lisencePrefixList[_this.data.lisencePrefixIndex]; //车辆车牌前缀
    if (!_this.validate(e)) {
      return;
    }
    var driverLicense = "";
    if (_this.data.icons.length > 0) {
      driverLicense = _this.data.icons[0];
    } else {
      wx.showToast({
        icon: "none",
        title: "驾驶证主页不能为空",
      })
      return;
    }
    e.detail.value.driverLicense = driverLicense;

    if (_this.data.imgs.length <= 0) {
      wx.showToast({
        icon: "none",
        title: "行驶证主页不能为空",
      })
      return;
    } else {
      e.detail.value.drivingLicense = _this.data.imgs[0];
    }
    var formData = e.detail.value;
    console.log("formData-------------" + JSON.stringify(formData));
    util.request(api.SaveUserCar, formData, "POST").then(function (res) {
      if (res.errno === 0) {
        var userInfo = _this.data.userInfo;
        userInfo.isAuth = 1;
        wx.setStorageSync('userInfo', userInfo);
        wx.showToast({
          title: "认证成功!",
        })
        wx.navigateBack({
          delta: 1
        })
      } else {
        wx.showToast({
          icon: "none",
          title: res.errmsg,
        })
      }
    });

  },

  //参数校验
  validate: function (e) {
    var rules = {
      carBrand: {
        required: true,
        maxlength: 30,
      },
      plateNumber: {
        required: true,
        maxlength: 6,
      },
    }
    var messages = {
      carBrand: {
        required: "品牌车系不能为空",
        maxlength: "品牌车系不能大于30字",
      },
      plateNumber: {
        required: "车牌号码不能为空",
        maxlength: "车牌号码不能大于6字",
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