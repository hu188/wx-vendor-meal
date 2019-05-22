const app = getApp();
import util from '../../utils/util';
import { http } from '../../utils/http';
Page({
  data: {
    userInfo: {},
    isVip:''
  },
  onLoad: function () {
    
    this.setData({
      isVip: app.globalData.isVip
    })
    wx.hideTabBar()
    wx.getUserInfo({
      success: res =>{
        const { userInfo} = res
        this.setData({
          userInfo
        })
      }
    })
  },
  toGoodOrder(){
    wx.navigateTo({
      url: '../order/index',
    })

  },
  toPickUpOrder() {
    wx.navigateTo({
      url: '../order/pickUpRecord/index',
    })

  },
  toMealOrder(){
    wx.navigateTo({
      url: '../order/mealOrder/index',
    })
  },
  onShow: function () {
    
  }
});
