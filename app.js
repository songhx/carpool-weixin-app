 //全局对象 可以通过 var app = getApp()获取到  设置 ：app.属性= xx
import Wux from 'components/wux'
import WxValidate from 'assets/plugins/WxValidate'
 App({
 
   /**
    * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
    */
   onLaunch: function () {
     //////版本更新处理//////
     if (wx.canIUse('getUpdateManager')) { // 基础库 1.9.90 开始支持，低版本需做兼容处理
       const updateManager = wx.getUpdateManager()

       updateManager.onCheckForUpdate(function (res) {
         // 请求完新版本信息的回调
         console.log(res.hasUpdate)
       })

       updateManager.onUpdateReady(function () {
         wx.showModal({
           title: '更新提示',
           content: '新版本已经准备好,重启应用',
           showCancel: false,//是否显示取消按钮
           success: function (res) {
             if (res.confirm) {
               //清空缓存
               wx.clearStorageSync();
               wx.clearStorage();
               // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
               updateManager.applyUpdate()
             }
           }
         })
       })

       updateManager.onUpdateFailed(function () {
         // 新的版本下载失败
         wx.showModal({
           title: '更新提示',
           content: '新版本下载失败,请手动删除，并重新搜索使用',
           showCancel: false
         })
       })
     } else {
       wx.showModal({
         title: '温馨提示',
         content: '当前微信版本过低，无法使用该应用，请升级到最新微信版本后重试。'
       });
     }
   },
 
   /**
    * 当小程序启动，或从后台进入前台显示，会触发 onShow
    */
   onShow: function (options) {
     
   },
 
   /**
    * 当小程序从前台进入后台，会触发 onHide
    */
   onHide: function () {
     
   },
 
   /**
    * 当小程序发生脚本错误，或者 api 调用失败时，会触发 onError 并带上错误信息
    */
   onError: function (msg) {
     
   },

   Wux: Wux,
   WxValidate: (rules, messages) => new WxValidate(rules, messages), 

   globalData: {
     _appName:"易拼车",
     _wx_cdoe:"shx2cyl",
     maxCarpoolTimes:3, // 每天最多可以最多发布的次数
     userInfo: {
       nickName: 'Hi,游客',
       userName: '点击去登录',
       avatar: 'http://yanxuan.nosdn.127.net/8945ae63d940cc42406c3f67019c5cb6.png'
     },
     token: '',
     _releaseServerURL: 'http://47.94.239.47/release/', //资源服务器地址
   }
 })
 