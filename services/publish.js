/**
 * 拼车发布相关
 * @author bjsonghong
 */


const util = require('../utils/util.js');
const api = require('../config/api.js');
const timeUtil = require('../utils/timeUtils.js');
/**
 * 查询拼车信息
 */
function queryPublishInfos(data){
  console.log("data.userType----" + data.userType);
  return new Promise(function (resolve, reject) {
    //发布行程
    util.request(api.QueryCarPoolPublishList, data, 'POST').then(res => {
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
 * 查询单条行程信息
 */
function queryTrip(data){
  return new Promise(function (resolve, reject) {
    //发布行程
    util.request(api.QueryTrip, data, 'POST').then(res => {
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
 * 查询拼车历史
 */
function queryHistorys(data) {
  return new Promise(function (resolve, reject) {
    util.request(api.QueryHistorys, data, 'POST').then(res => {
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
 * 发布拼车信息
 */
function publish(data){
  console.log("data.userType----" + data.userType );
  //发布行程
  return new Promise(function (resolve, reject) {
      //发布行程
    util.request(api.CarPoolPublish, data, 'POST').then(res => {
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
 * 更新拼车信息
 */
function updateTrip(data) {
  console.log("data.userType----" + data.userType);
  //发布行程
  return new Promise(function (resolve, reject) {
    //发布行程
    util.request(api.UpdateTrip, data, 'POST').then(res => {
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
 * 取消行程
 */
function cancelCarPoolPublish(data){
  return new Promise(function (resolve, reject) {
    //发布行程
    util.request(api.CancelCarPoolPublish, data, 'POST').then(res => {
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
 * 检查行程是否过期
 */
function checkTripExpire(departureTime){
  var expire = false;
  if (timeUtil.getDiffMillis(new Date(departureTime), new Date()) < 0) {
    expire = true;
  }
  return expire;
}


module.exports = {
  publish: publish,
  queryPublishInfos: queryPublishInfos,
  queryHistorys: queryHistorys,
  cancelCarPoolPublish: cancelCarPoolPublish,
  queryTrip: queryTrip,
  updateTrip: updateTrip,
  checkTripExpire: checkTripExpire,
}