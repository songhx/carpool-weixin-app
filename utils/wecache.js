var postfix = '_deadtime';

function put(k, v, t) {
  // console.log(k);
  wx.setStorageSync(k, v)
  var seconds = parseInt(t);
  if (seconds > 0) {
    var timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000 + seconds;
    // console.log(timestamp);
    wx.setStorageSync(k + postfix, timestamp + "")
  } else {
    wx.removeStorageSync(k + postfix)
  }
}

function get(k, def) {
  var deadtime = parseInt(wx.getStorageSync(k + postfix))
  if (deadtime) {
    if (parseInt(deadtime) < Date.parse(new Date()) / 1000) {
      if (def) { return def; } else { return; }
    }
  }
  var res = wx.getStorageSync(k);
  if (res) {
    return res;
  } else {
    return def;
  }
}

function remove(k) {
  wx.removeStorageSync(k);
  wx.removeStorageSync(k + postfix);
}

function clear() {
  wx.clearStorageSync();
}

module.exports = {
  put: put,
  get: get,
  remove: remove,
  clear: clear,
}