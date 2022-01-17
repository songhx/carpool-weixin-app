/**
 * @desc
 *    系统用户授权工具类
 * @author bjsonghongxu
 */

//情况分析：
// 1）用户直接同意授权。
// 2）用户拒绝授权，进入引导弹窗，用户继续拒绝授权。
// 3）用户拒绝授权，进入引导弹窗，用户点击授权，进入授权设置页，用户点击授权。

function authLocation() {
  return new Promise(function (resolve, reject) {
    wx.getSetting({
      // 获取配置信息成功
      success(res) {
        if (!res.authSetting['scope.userLocation']) {//如果没有授权
          wx.authorize({
            scope: 'scope.userLocation',
            success: res => {//第一种情况：用户同意授权
              resolve(true);
            }, fail: res => {//用户点击了取消授权，引导其去授权
              wx.showModal({
                title: '提示',
                content: '定位需要您的微信授权才能使用哦~ 错过授权页面的处理方法：删除小程序->重新搜索进入->点击授权按钮',
                cancelText: "不授权",
                confirmText: "授权",
                confirmColor: "#a08250",
                success: function (res) {
                  if (res.confirm) {
                    // 这个 API 是基础库 1.1.0 才有的，所以需要做兼容处理：
                    if (wx.openSetting) {
                      wx.openSetting({
                        success: function (res) {
                          //第三种情况：用户拒绝授权，进入引导弹窗，用户点击授权，进入授权设置页，用户点击授权。
                          resolve(true);
                        }
                      })
                    } else {
                      wx.showModal({
                        title: '授权提示',
                        content: '定位需要您的微信授权才能使用哦~ 错过授权页面的处理方法：删除小程序->重新搜索进入->点击授权按钮'
                      })
                      reject(false);
                    }
                  } else if (res.cancel) {//第二种情况：用户拒绝授权，进入引导弹窗，用户继续拒绝授权。
                    wx.showModal({
                      title: '提示',
                      content: '定位失败，错过授权页面的处理方法：删除小程序->重新搜索进入->点击授权按钮',
                      showCancel: false,
                      confirmColor: "#c00",
                      success: function (res) {
                        if (res.confirm) {
                          console.log('用户点击确定')
                        }
                      }
                    })
                    reject(false);
                  }
                }
              })
            }
          })
        } else {
          resolve(true);
        }
      },
    })
  });
 
}




module.exports = {
  authLocation,
}