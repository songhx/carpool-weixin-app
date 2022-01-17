/**
 * 预约处理
 */

const util = require('../utils/util.js');
const api = require('../config/api.js');

/**
 * 查询拼车预约单集合
 */
function queryOrderList(data) {
  return new Promise(function (resolve, reject) {
    util.request(api.QueryOrderList, data, 'POST').then(res => {
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
 * 确认或拒绝
 */
function confirmOrRefuse(data) {
  return new Promise(function (resolve, reject) {
    util.request(api.ConfirmOrRefuse, data, 'POST').then(res => {
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
 * 取消预约
 */
function cancelOrder(data) {
  return new Promise(function (resolve, reject) {
    util.request(api.CancelOrder, data, 'POST').then(res => {
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
 * 查询单条预约单
 */
function queryOrder(data){
  return new Promise(function (resolve, reject) {
    util.request(api.QueryOrder, data, 'POST').then(res => {
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
 * 查询单条预约单
 */
function queryUserOrder(data) {
  return new Promise(function (resolve, reject) {
    util.request(api.QueryUserOrder, data, 'POST').then(res => {
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

module.exports = {
  queryOrderList: queryOrderList,
  confirmOrRefuse: confirmOrRefuse,
  cancelOrder: cancelOrder,
  queryOrder: queryOrder,
  queryUserOrder: queryUserOrder,
}