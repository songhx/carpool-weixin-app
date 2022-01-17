/**
 * 支付相关服务
 */

const util = require('../utils/util.js');
const api = require('../config/api.js');

/**
 * 判断用户是否登录
 */
function payOrder(orderId) {
  return new Promise(function (resolve, reject) {
    util.request(api.PayPrepayId, {
      orderId: orderId
    }).then((res) => {
  
      if (res.errno === 0) {
        if (res.data.balancePay || res.data.couponPay ){ ///账户余额支付
           resolve(res);
        } else if (res.data.wxpay){ //微信支付
          const payParam = res.data.wxpayObj;
          wx.requestPayment({
            'timeStamp': payParam.timeStamp,
            'nonceStr': payParam.nonceStr,
            'package': payParam.package,
            'signType': payParam.signType,
            'paySign': payParam.paySign,
            'success': function (res) {
              resolve(res);
            },
            'fail': function (res) {
              reject(res);
            },
            'complete': function (res) {
              reject(res);
            }
          });
        }else{ //支付失败
          reject(res);
        }
      } else { //支付失败
        reject(res);
      }
    });
  });
}


module.exports = {
  payOrder,
};











