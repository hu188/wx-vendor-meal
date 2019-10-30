const app = getApp();
import util from '../../utils/util';
import { http } from '../../utils/http';
Page({
  data: {
    isVip: '',
    nickName: '点击登录',
    isLoad: false,
    avatarUrl: '../images/user.jpg'
  },
  toUserInfo: function () {
    wx.navigateTo({
      url: '../userinfo/userinfo'
    })
  },
  onShow: function () {
    
    let that = this;
    that.setData({
      isVip: app.globalData.isVip
    })
    wx.hideTabBar()
    wx.getUserInfo({
      success: function (res) {
        that.setData({
          nickName: res.userInfo.nickName,
          avatarUrl: res.userInfo.avatarUrl
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
  call(){
    wx.makePhoneCall({
      phoneNumber: '4000009443' 
    })
  },
});
