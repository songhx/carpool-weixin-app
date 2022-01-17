/**
 * 地图工具类
 * @author bjsonghongxu 
 */
var amap = require('../lib/amap-wx.js'); // 高德地图
var amapKey = "341f556d52f65f1e29c8a48ca1315bd1"; //高德地图key
/***
 * 获取位置信息
 *  1.获取用户开放地理位置信息
 *  2.获取具体的地址信息
 */
function getLocation(){
  return new Promise(function (resolve, reject) {
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success: () => {
              // 用户已经同意小程序使用获取地理位置，后续调用 wx.chooseLocation 接口不会弹窗询问
              wx.chooseLocation({
                success: (res) => {
                  var latitude = res.latitude
                  var longitude = res.longitude
                  var addr = res.name;
                  wx.showToast({ title: res.name });
                  wx.showToast({ title: res.address });
                  //console.log(addr)
                }
              })
            }
          })
        } else {
          wx.chooseLocation({
            success: (res) => {
              resolve(res);
            }
          })
        }
      },
      fail: (res) => {
        wx.showToast({
          title: res,
        })
      }
    })
  });
}

/**
 * 获取高德地图地理位置信息
 */
function getAMapLocation() {
  return new Promise(function (resolve, reject) {
    var myAmapFun = new amap.AMapWX({ key: amapKey });
    myAmapFun.getPoiAround({
      // iconPathSelected: '选中 marker 图标的相对路径', //如：..­/..­/img/marker_checked.png
      // iconPath: '未选中 marker 图标的相对路径', //如：..­/..­/img/marker.png
      success: function (data) {
        resolve(data.markers[0]);
      },
      fail: function (info) {
        wx.showModal({ title: info.errMsg })
      }
    })
  });
}

/**
 * 格式化距离
 */
function formatDistance(distance,dot){
  var isBig = false;
  if (distance >= 1000) {
    distance /= 1000;
    isBig = true;
  }
  return distance.toFixed(2) + (isBig ? "km" : "m");
}

function createMarkers(_s_latitude, _s_longitude, _e_latitude, _e_longitude) {
  var markers = [];
  var m1 = {
    iconPath: "/img/mapicon_navi_s.png",
    id: 0,
    width: 23,
    height: 33
  };
  m1.latitude = _s_latitude;
  m1.longitude = _s_longitude;

  var m2 = {
    iconPath: "/img/mapicon_navi_e.png",
    id: 0,
    width: 23,
    height: 33
  };
  m2.latitude = _e_latitude;
  m2.longitude = _e_longitude;
  markers.push(m1);
  markers.push(m2);
  return markers;
}

function calRoute(_s_latitude, _s_longitude, _e_latitude, _e_longitude) {
  return new Promise(function (resolve, reject) {
    
    var myAmapFun = new amap.AMapWX({ key: amapKey });
    myAmapFun.getDrivingRoute({
      origin: _s_longitude + ',' + _s_latitude,
      destination: _e_longitude + ',' + _e_latitude,
      success: function (data) {
        var route = {};
        var points = [];
        if (data.paths && data.paths[0] && data.paths[0].steps) {
          var steps = data.paths[0].steps;
          for (var i = 0; i < steps.length; i++) {
            var poLen = steps[i].polyline.split(';');
            for (var j = 0; j < poLen.length; j++) {
              points.push({
                longitude: parseFloat(poLen[j].split(',')[0]),
                latitude: parseFloat(poLen[j].split(',')[1])
              })
            }
          }
        }

        route.polyline = [{
          points: points,
          color: "#0091ff",
          width: 6
        }]

        if (data.paths[0] && data.paths[0].distance) {
          route.distance = data.paths[0].distance + '米'
        }
        if (data.taxi_cost) {
          route.cost = '打车约' + parseInt(data.taxi_cost) + '元'
        }
        resolve(route);
      },
      fail: function (info) {
        wx.showModal({ title: info.errMsg })
      }
    })
  });
 
}

module.exports = {
  getLocation,
  getAMapLocation,
  formatDistance,
  createMarkers: createMarkers,
  calRoute: calRoute,
}