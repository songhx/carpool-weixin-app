var NewApiRootUrl = 'http://127.0.0.1:8080/api/';
//var NewApiRootUrl = 'https://api.info2.cn/api/';
module.exports = {
    CarpoolBanner: NewApiRootUrl + 'index/banner', //首页轮播图数据接口
    QueryNavs: NewApiRootUrl + 'nav/list', //首页导航数据接口
    AuthLoginByWeixin: NewApiRootUrl + 'auth/carpoolLogin', //微信登录

    CarPoolPublish: NewApiRootUrl + 'car/publish/publish', //发布拼车信息
    QueryCarPoolPublishList: NewApiRootUrl + 'car/publish/list', //获取发布信息
    QueryTrip: NewApiRootUrl + 'car/publish/queryTrip', //获取具体行程信息
    QueryHistorys: NewApiRootUrl + "car/publish/history", //拼车发布历史
    CancelCarPoolPublish: NewApiRootUrl + 'car/publish/cancel', //发布拼车信息
    UpdateTrip: NewApiRootUrl + 'car/publish/updateTrip', //更新拼车信息
    QueryLatest: NewApiRootUrl + 'car/publish/latest', //最近拼车信息

    SubOrder: NewApiRootUrl + 'car/order/order', //预定或抢单
    QueryOrderList: NewApiRootUrl + 'car/order/list', //预约单集合
    ConfirmOrRefuse: NewApiRootUrl + 'car/order/confirmOrRefuse', //拒绝或确定预约单
    CancelOrder: NewApiRootUrl + 'car/order/cancel', //取消预约单
    QueryOrder: NewApiRootUrl + 'car/order/queryOrder',//查询单条预约单
    QueryUserOrder: NewApiRootUrl + 'car/order/queryUserOrder',

    QueryUserStatCarpool: NewApiRootUrl + 'car/user/stat', //查询用户拼车统计
    QueryUserInfo: NewApiRootUrl + 'car/user/queryUser', //查询用户信息
    QueryUserCarInfo: NewApiRootUrl + 'car/user/carInfo', //查询用户车辆信息
    SaveUserInfo: NewApiRootUrl + 'car/user/completUser', //保存用户信息
    SaveUserCar: NewApiRootUrl + 'car/user/completUserCar', //保存用户车辆信息

    CollectFormId: NewApiRootUrl + 'templateMessage/collect',  //收集formid
    RegionList: NewApiRootUrl + 'region/list',  //获取区域列表
    SubFeedback: NewApiRootUrl + 'feedback/feedback',  //用户反馈
    queryFeedBack: NewApiRootUrl + 'feedback/queryFeedback',  //查询反馈
    UplodUrl: NewApiRootUrl + 'oss/upload',//上传路径
  
    //about notice
    queryNoticeList: NewApiRootUrl + 'notice/list',//查询公告

    //about article
    queryArticleList: NewApiRootUrl + "article/list",
    QueryArticleDetail: NewApiRootUrl + "article/detail",
    UpdateView: NewApiRootUrl + "article/view",

    //about info 
    queryInfoList: NewApiRootUrl + "info/list",
    queryInfo: NewApiRootUrl + "info/item",
    publishInfo: NewApiRootUrl + "info/publish",
    agreeInfo: NewApiRootUrl + "info/agree",
    dissInfo: NewApiRootUrl + "info/diss",
    repostInfo: NewApiRootUrl + "info/repost",

    //about comment
    queryCommentList: NewApiRootUrl + "comment/list",
    comment: NewApiRootUrl + "comment/comment",
    agreeComment: NewApiRootUrl + "comment/agree",

};