/**
 * 用户相关服务
 */

const util = require('../utils/util.js');
const api = require('../config/api.js');


/**
 * 调用微信登录
 */
function login(userInfo) {
  let code = null;
  return new Promise(function (resolve, reject) {
    return wxLogin().then((res) => {
      code = res.code;
      //登录远程服务器
      util.request(api.AuthLoginByWeixin, { code: code, userInfo: userInfo }, 'POST').then(res => {
        if (res.errno === 0) {

          //存储用户信息
          wx.setStorageSync('userInfo', res.data.userInfo);
          wx.setStorageSync('token', res.data.token);

          resolve(res);
        } else {
          reject(res);
        }
      }).catch((err) => {
        reject(err);
      });
      
    }).catch((err) => {
      reject(err);
    })
  });
}

/**
 * 调用微信登录
 */
function wxLogin() {
  return new Promise(function (resolve, reject) {
    wx.login({
      success: function (res) {
        if (res.code) {
          //登录远程服务器
          console.log(res)
          resolve(res);
        } else {
          reject(res);
        }
      },
      fail: function (err) {
        reject(err);
      }
    });
  });
}



/**
 * 判断用户是否登录
 */
function checkLogin() {
  return new Promise(function (resolve, reject) {
    if (wx.getStorageSync('userInfo') && wx.getStorageSync('token')) {

      util.checkSession().then(() => {
        resolve(true);
      }).catch(() => {
        reject(false);
      });

    } else {
      reject(false);
    }
  });
}

/**
 * 查询用户信息
 */
function queryUser(id){
  return new Promise(function (resolve, reject) {

   util.request(api.QueryUserInfo, { id: id }).then(function (res) {
      if (res.errno === 0) {
        resolve(res);
      } else {
        reject(res);
      }
    }).catch((err) => {
      reject(err);
    });
  });
}

function queryUserCar(id) {
  return new Promise(function (resolve, reject) {

    util.request(api.QueryUserCarInfo, { userId: id }).then(function (res) {
      if (res.errno === 0) {
        resolve(res);
      } else {
        reject(res);
      }
    }).catch((err) => {
      reject(err);
    });
  });
}


/**
 * 获取本地用户信息
 */
function getLocalUser(t) {
  let userInfo = wx.getStorageSync('userInfo');
  if (userInfo) {
    t.setData({
      userInfo: userInfo
    });
  }else {
    wx.redirectTo({
      url: '/pages/common/auth/login',
    })
  }
}

module.exports = {
  checkLogin,
  queryUser,
  getLocalUser: getLocalUser,
  queryUserCar: queryUserCar,
  login: login,
};











