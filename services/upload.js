/**
 * 文件上传，图片上传
 */
const util = require('../utils/util.js');
const api = require('../config/api.js');

//选择图片
function chooseImage(t, tag) {
  var _this = t;

  wx.chooseImage({
    count: 1,
    sourceType: ['album', 'camera'],
    success: function (res) {

      var tempFilePaths = res.tempFilePaths, imgLen = tempFilePaths.length;
      _this.setData({
        uploading0: (tag == 0),
        uploading: (tag == 1),
        imgLen: _this.data.imgLen + imgLen
      });
      tempFilePaths.forEach(function (e) {
        uploadImg(t, e, tag);
      });
    }
  });
}
//上传图片
function uploadImg(t, path, tag) {
  var _this = t;
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
      if (data.data) {
        if (tag == 1) {
          _this.setData({
            imgs: _this.data.imgs.concat(data.data),
          });
        } else {
          _this.setData({
            icons: _this.data.icons.concat(data.data),
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
        title: res.info,
      })
    },
    complete: function () {
      wx.hideNavigationBarLoading();
    }
  });
}


function deleteArryByIndex(t, arr, index, tag) {
  let that = t;
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
}

module.exports = {
  //移除图片
  removePhoto: function (t,e) {
    var _this = t;
    var tag = e.currentTarget.dataset.tag;
    var index = e.currentTarget.dataset.index;
    if (tag == 0) {
      deleteArryByIndex(t,_this.data.icons, index, tag);
    } else {
      deleteArryByIndex(t,_this.data.imgs, index, tag);
    }
  },


  //选择图片
  choosePhoto: function (t,e) {
    var _this = t;
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
                chooseImage(t,tag);
              }
            }
          });
        } else if (networkType == 'wifi') {
          chooseImage(t,tag);
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

  //预览图片
  previewPhoto: function (t,e) {
    var _this = t;
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

}