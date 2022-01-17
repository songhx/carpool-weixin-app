/**
 * 通用服务
 * @author bjsonghong
 */


const util = require('../utils/util.js');
const wecache = require('../utils/wecache.js');
const api = require('../config/api.js');

var carpoolTimes_key = "carpoolTimes_key";
/**
 * 收集formId
 */
function collectFormId(userId, openId, formId) {
  console.log("userId --- " + userId + " openId======" + openId + " ----------- formId " + formId);
  return new Promise(function (resolve, reject) {
    util.request(api.CollectFormId, {
      userId: userId,
      wxOpenid: openId,
      formId: formId
    }, 'POST').then(res => {
      if (res.errno === 0) {
        resolve(res);
      } else {
        reject(res);
      }
    }).catch((err) => {
      reject(err);
    })
  });
}

/**
 * 获取缓存中的拼车次数
 */
function getCarPoolTimes(){
  return wecache.get(carpoolTimes_key,0);
}

/**
 * 获取缓存中的拼车次数
 */
function setCarPoolTimes(p) {
  var val = wecache.get(carpoolTimes_key, 0);
  val = val + (p); // 加或者减
  if(val < 0) val = 0;
  wecache.put(carpoolTimes_key,val,60*60*24);//一天有效期
}

//跳转并收藏formid
function skipAndCollectFormId(userId, wxOpenid, e) {
  console.log("formId --- " + e.detail.formId);
  let _this = this;
  //收集formid
  collectFormId(userId, wxOpenid, e.detail.formId);
  if (e.detail.value.isTab == 1){
    wx.switchTab({
      url: e.detail.value.skip,
    })
  }else{
    wx.navigateTo({
      url: e.detail.value.skip,
      success: function (res) {
      },
      fail: function (e) {
        console.log("error--", e);
      }
    })
  }
  
}

/**
 * 格式化字符串
 */
function formatStr(str, len) {
  if (str == null || str == undefined || str == "") return "";
  return (str.length > len) ? str.substring(0, len) + "..." : str;
}

module.exports = {
  collectFormId: collectFormId,
  skipAndCollectFormId: skipAndCollectFormId,
  getCarPoolTimes: getCarPoolTimes,
  setCarPoolTimes: setCarPoolTimes,
  formatStr: formatStr,
}