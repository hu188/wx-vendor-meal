// pages/order/pickUpRecord/index.js
const app = getApp();
import { http } from '../../../utils/http';
import { encode } from '../../../utils/encode';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pickUpRecordList: [],
    c_page:1,//当前页
    pageCount:1,
    end:false,//判断是否到底
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.queryPickUpRecord()
  },



  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
 
  },
  queryPickUpRecord(){
    let that = this;
  
    const params = {
      sign: encode({
        userId: app.globalData.userId,
        page: that.data.c_page,
        pageSize: 20
      }, app.globalData.sessionId),
      sessionId: app.globalData.sessionId,
      params: {
        userId: app.globalData.userId,
        page: that.data.c_page,
        pageSize:20
      }
    }
    //获取取货记录
    http('qsq/service/external/order/queryPickUpRecord', params, 1,1).then(res => {
      if (res) {
        let queryPickUpRecord = res.queryPickUpRecord;
        for (var i = 0; i < queryPickUpRecord.length; i++) {
          queryPickUpRecord[i].time = that.formatDateTime(queryPickUpRecord[i].createTime)
        }
        var arr1 = that.data.pickUpRecordList; //从data获取当前pickUpRecordList数组
        var arr2 = res.queryPickUpRecord; //从此次请求返回的数据中获取新数组
        arr1 = arr1.concat(arr2); //合并数组
        //pickUpRecordList = pickUpRecordList.concat(res.queryPickUpRecord)
        that.setData({
          pickUpRecordList: arr1,
          pageCount: res.pageCount
        })
      }
      
    })
  },
  //格式化时间
  formatDateTime: function (inputTime) {
    var date = new Date(inputTime);
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? ('0' + m) : m;
    var d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    var h = date.getHours();
    h = h < 10 ? ('0' + h) : h;
    var minute = date.getMinutes();
    var second = date.getSeconds();
    minute = minute < 10 ? ('0' + minute) : minute;
    second = second < 10 ? ('0' + second) : second;
    return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
  },
  /**
     * 页面上拉触底事件的处理函数
     */
  onReachBottom: function () {
    console.log("上拉了")
    var that = this;
  
    // 页数+1
    let page = that.data.c_page + 1;
    this.setData({
      c_page: page 
    })
    if (that.data.c_page == that.data.pageCount || that.data.pageCount == 1) {
      that.setData({
        end: true
      })
    }
    if (that.data.c_page <=that.data.pageCount ) {
      that.queryPickUpRecord()
    }
   

  }
})