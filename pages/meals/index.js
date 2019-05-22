// pages/meals/index.js
const app = getApp();
import { http } from '../../utils/http';
import { encode } from '../../utils/encode';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mealsList: [],//套餐（固定商品）
    mealsCountList:[],
    mealType:'',
    mealUseNum:0,//套餐剩余使用次数
    tp:'',//单货道还是多货道
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  /**
   * 获取套餐（固定商品）
   */
  queryGoodsMeals(){
    let that = this
    const { type, id } = app.globalData;
    const params = {
      sign: encode({
        type: type.type,
        levelTypeId: type.level,
        appid: id
      }, app.globalData.sessionId),
      sessionId: app.globalData.sessionId,
      params: {
        type: type.type,
        levelTypeId: type.level,
        appid: id
      }
    }
    http('qsq/service/external/goods/queryGoodsMeals', params,1,1).then(res=>{

      that.setData({
        mealsList:res
      })
    })
  },
  
  toMealInfo: function (event) {
    let index = event.currentTarget.dataset.id;
    let chooseMeal = this.data.mealsList[index]
    const { id, mealPrice, mealName } = chooseMeal
    wx.navigateTo({
      url: '../mealinfo/mealinfo?id=' + id + '&mealName=' + mealName + '&mealPrice=' + mealPrice
    })
  },

  //查询套餐（次数）
  queryMeals() {
    let that = this
    const { type, id, mealType} = app.globalData;
    const params = {
      sign: encode({
        type: type.type,
        levelTypeId: type.level,
        rechargeType: mealType,
      }, app.globalData.sessionId),
      sessionId: app.globalData.sessionId,
      params: {
        type: type.type,
        levelTypeId: type.level,
        rechargeType: mealType,
      }
    }
    http('qsq/service/external/goods/queryMeals', params, 1, 1).then(res => {
      that.setData({
        mealsCountList: res
      })
    })
  },
  toBuy:function(e){
    let index = e.currentTarget.dataset.index;
    let chooseMeal = this.data.mealsCountList[index]
    const { id, money, rechargeName, rechargeCount, extendMsg } = chooseMeal
    wx.navigateTo({
      url: '../mealinfo/mealinfoTwo/mealinfoTwo?rechargeName=' + rechargeName + '&money=' + money + '&rechargeCount=' + rechargeCount + '&id=' + id + '&extendMsg=' + extendMsg
    })
  },
  //查询套餐剩余使用次数
  queryMealUseNum(){
    var that = this;
    const params = {
      sign: encode({
        userId: app.globalData.userId
      }, app.globalData.sessionId),
      sessionId: app.globalData.sessionId,
      params: {
        userId:app.globalData.userId
      }
    }
    http('qsq/service/external/goods/queryMealUseNum', params, 1, 1).then(res => {
      that.setData({
        mealUseNum: res
      })
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      mealType:app.globalData.mealType
    })
    if (this.data.mealType==0){
      this.queryGoodsMeals()
    } else if (this.data.mealType == 1 ){
      this.queryMealUseNum()
      this.queryMeals()
    }
    
  },



 
})