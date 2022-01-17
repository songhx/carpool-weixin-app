// pages/riderscircle/proximity/proximity.js
var bmap = require('../../../lib/bmap-wx.min.js');
var wxMarkerData = [];
Page({
  data: {
    searchKey:"",
    markers: [],
    latitude: '',
    longitude: '',
    placeData: {}
  },
  makertap: function (e) {
    var that = this;
    var id = e.markerId;
    that.showSearchInfo(wxMarkerData, id);
    that.changeMarkerColor(wxMarkerData, id);
  },
  onLoad: function (options) {
    var that = this;
    that.setData({
      searchKey: options.searchKey,
    });
    // 新建百度地图对象 
    var BMap = new bmap.BMapWX({
      ak: 'H5x7b843VtFaLSGqhbwew8P1LI3YoGTO',
      // scale: 5,
    });
    var fail = function (data) {
      console.log(data)
    };
    var success = function (data) {
      wxMarkerData = data.wxMarkerData;
      if (wxMarkerData != null && wxMarkerData != undefined){
        that.setData({
          markers: wxMarkerData
        });
        that.setData({
          latitude: wxMarkerData[0].latitude
        });
        that.setData({
          longitude: wxMarkerData[0].longitude
        });

        that.showSearchInfo(wxMarkerData, 0);
        that.changeMarkerColor(wxMarkerData, 0);
      }
    }
    // 发起POI检索请求 
    BMap.search({
      
      "query": that.data.searchKey,
      fail: fail,
      success: success,
      // 此处需要在相应路径放置图片文件 
      iconPath: '/img/marker_red.png',
      // 此处需要在相应路径放置图片文件 
      iconTapPath: '/img/marker_red.png'
    });
  },
  showSearchInfo: function (data, i) {
    var that = this;
    var tel = "";
    if (data[i].telephone != null && undefined != data[i].telephone){
      tel =  data[i].telephone;
    }
    that.setData({
      placeData: {
        title: data[i].title,
        address: data[i].address,
        telephone: tel,
      }
    });
  },
  changeMarkerColor: function (data, i) {
    var that = this;
    var markers = [];
    for (var j = 0; j < data.length; j++) {
      if (j == i) {
        // 此处需要在相应路径放置图片文件 
        data[j].iconPath = "/img/marker_yellow.png";
      } else {
        // 此处需要在相应路径放置图片文件 
        data[j].iconPath = "/img/marker_red.png";
      }
      markers[j] = (data[j]);
    }
    that.setData({
      markers: markers
    });
  }
})