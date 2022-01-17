/**时间工具类 */

//格式化化日期
function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

//格式化时间到分 HH:mm
function formatMTime(date) {

  var hour = date.getHours()
  var minute = date.getMinutes()

  return  [hour, minute].map(formatNumber).join(':')
}



//格式化化日期
function formatDate(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  return year + '年' + month + '月' + day + '日';
}

function formatRDate(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  return year + '-' + month + '-' + day ;
}

function formatDateToInt(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  return year + '' + ((month < 10) ? '0' : '') + month + '' + ((day < 10) ? '0' : '')  +day;
}

function formatIntToDate(date) {
  return date.substring(0, 4) + "-" + date.substring(4, 6) + "-" + date.substring(6, 8) ;
}

function getDateBeforeAndAfter(dd,AddDayCount) {
  dd.setDate(dd.getDate() + AddDayCount);//获取AddDayCount天后的日期 
  var y = dd.getFullYear();
  var m = dd.getMonth() + 1;//获取当前月份的日期 
  var d = dd.getDate();
  return y + "-" + m + "-" + d;
}

//格式化时间到分 HH:mm
function getMinuteBeforeAndAfter(date, minute) {
  date.setMinutes(date.getMinutes() + minute);
  var hour = date.getHours()
  var minute = date.getMinutes()
  return [hour, minute].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/**
	 * 求两个日期间相差的毫秒数
	 * 
	 * @param {}
	 *            date1 时间1
	 * @param {}
	 *            date2 时间2
	 * @return 两个时间相差的毫秒数
	 */
function getDiffMillis(date1, date2) {
  return date1.getTime() - date2.getTime();
}

/**
 * 求两个日期间相差的秒数
 * 
 * @param {}
 *            date1 时间1
 * @param {}
 *            date2 时间2
 * @return 两个时间相差的秒数
 */
function getDiffSeconds(date1, date2) {
  return Math.floor(this.getDiffMillis(date1, date2) / 1000);
}

/**
 * 求两个日期间相差的分钟数目
 * 
 * @param {}
 *            date1 时间1
 * @param {}
 *            date2 时间2
 * @return 两个时间相差的分钟数
 */
function getDiffMinutes (date1, date2) {
  return Math.floor(this.getDiffSeconds(date1, date2) / 60);
}

//动态更新时间
function getDateDiff(dateTimeStamp) {
  var minute = 1000 * 60;
  var hour = minute * 60;
  var day = hour * 24;
  var halfamonth = day * 15;
  var month = day * 30;
  var year = day * 365;
  var now = new Date().getTime();
  var diffValue = now - dateTimeStamp;
  if (diffValue < 0) {
    //非法操作
    return '数据出错';
  }
  var result = '';
  var yearC = diffValue / year;
  var monthC = diffValue / month;
  var weekC = diffValue / (7 * day);
  var dayC = diffValue / day;
  var hourC = diffValue / hour;
  var minC = diffValue / minute;
  if (yearC >= 1) {
    result = parseInt(yearC) + '年以前';
  } else if (monthC >= 1) {
    result = parseInt(monthC) + '个月前';
  } else if (weekC >= 1) {
    result = parseInt(weekC) + '星期前';
  } else if (dayC >= 1) {
    result = parseInt(dayC) + '天前';
  } else if (hourC >= 1) {
    result = parseInt(hourC) + '小时前';
  } else if (minC >= 5) {
    result = parseInt(minC) + '分钟前';
  } else {
    result = '刚刚发表';
  }
  return result;
}

module.exports = {
  formatTime: formatTime,
  formatMTime: formatMTime,
  formatDate: formatDate,
  formatRDate: formatRDate,
  formatDateToInt: formatDateToInt,
  formatIntToDate: formatIntToDate,
  getDateBeforeAndAfter: getDateBeforeAndAfter,
  getMinuteBeforeAndAfter: getMinuteBeforeAndAfter,
  getDiffMillis: getDiffMillis,
  getDiffSeconds: getDiffSeconds,
  getDiffMinutes: getDiffMinutes,
  getDateDiff: getDateDiff
}