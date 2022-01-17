/**
 * 数据校验工具
 * 
 * @type
 * @author :bjsonghongxu
 */
var ValidateUtils = {

	/**
	 * 检测字符串是否为合法的Email地址
	 * 
	 * @param {}
	 *            str 待检测字符串
	 * @return 字符串是否为合法的Email地址
	 */
  validEmailAddress: function (str) {
    var exp = new RegExp("^\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*$");
    return exp.test(str);
  },

	/**
	 * 检测字符串是否为合法的（中国居民）身份证号
	 * 
	 * @param {}
	 *            str 待检测字符串
	 * @return 字符串是否为合法的身份证号
	 */
  validIdNumber: function (str) {
    var provinceCodes = [];
    var string = new String(str);
    // 一代居民身份证
    if (string.length == 15) {
      // 目前，仅校验位数
      var exp = new RegExp("^[0-9]{15}$");
      if (!exp.test(str)) {
        return false;
      } else {
        return true;
      }
    }
		/*
		 * 二代居民身份证校验规则：
		 * 1，∑(a[i]*W[i]) mod 11 ( i = 0, 3, ..., 16 ) (1)
		 * 2，加权因子分别为 Wi: 7 9 10 5 8 4 2 1 6 3 7 9 10 5 8 4 2
		 * 3，将前17位号码分别乘以各自的加权因子,再求和除以11,再取余数。
		 * 4，用余数对应下方的校验码
		 * 5，Y余数 : 0 1 2 3 4 5 6 7 8 9 10
		 * 6，校验码: 1 0 X 9 8 7 6 5 4 3 2
		 */
    else if (string.length == 18) {
      string = string.toUpperCase();
      // 校验位数
      var exp = new RegExp("^[0-9]{17}[0-9X]$");
      if (!exp.test(str)) {
        return false;
      }
      var codes = string.split("");
      if (codes[17] == "X") {
        codes[17] == 10;
      }
      // 加权因子
      var w = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2, 1];
      // 校验码
      var y = [1, 0, 10, 9, 8, 7, 6, 5, 4, 3, 2];
      // 求前17位加权和
      var sum = 0;
      for (var i = 0; i < 17; i++) {
        sum += codes[i] * w[i];
      }
      // 判断校验位是否正确
      if (y[sum % 11] == codes[17]) {
        return true;
      } else {
        return false;
      }
    }
    // 其他位数则直接认为非法
    else {
      return false;
    }
  },

	/**
	 * 检测字符串是否为合法的中国（大陆）手机号码
	 * 
	 * @param {} 
	 *            str 待检测字符串
	 * @return 字符串是否为合法的手机号码
	 */
  validCellPhoneNumber: function (str) {
    // 校验规则：数字1开头，位数为11位
    var exp = new RegExp("^0?(13|15|18|14)[0-9]{9}$");
    return exp.test(str);
  },

	/**
	 * 检测字符串是否为电话号码的函数(包括验证国内区号,国际区号,分机号)
	 * 
	 * @param {} 
	 *            str 待检测字符串
	 * @return 字符串是否为合法的电话号码的函数(包括验证国内区号,国际区号,分机号)
	 */
  validTel: function (str) {
    var exp = new RegExp("^[0-9\-()（）]{7,18}$");
    return exp.test(str);
  },

	/**
	 * 检测字符串是否为邮编
	 * 
	 * @param {} 
	 *            str 待检测字符串
	 * @return 字符串是否为合法的手机号码
	 */
  validZipCode: function (str) {
    var exp = new RegExp("^\\d{6}$");
    return exp.test(str);
  },

	/**
	 * 得到字符串的字节数，认为非ascii字符均为两个字节
	 * 
	 * @param {}
	 *            str 待检测字符串
	 * @return 字符串字节数
	 */
  getByteCount: function (str) {
    var count = 0;
    for (var i = 0; i < str.length; i++) {
      var escapeStr = escape(str.charAt(i));
      if (escapeStr.substring(0, 2) == "%u" && escapeStr.length == 6) {// 汉字
        count = count + 2;
      } else {
        count += 1;
      }
    }
    return count;
  },
  defaultIllegalStr: "'~`#$&^'",
	/**
	 * 判断字符串是否合法
	 * @param str
	 * @param illegalStr
	 * @returns {Boolean}
	 */
  isStrIllegal: function (str, illegalStr) {
    if (!illegalStr) {
      illegalStr = ValidateUtils.defaultIllegalStr;
    }
    for (var i = 0; i < illegalStr.length; i++) {
      if (str.indexOf(illegalStr.charAt(i)) != -1) {
        return false;
      }
    }
    return true;
  },
  validStrLength: function (str, len) {
    return ValidateUtils.getByteCount(str) <= len;
  }

}

module.exports = {
  validate:ValidateUtils,
}