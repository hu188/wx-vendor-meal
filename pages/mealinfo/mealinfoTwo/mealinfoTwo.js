const app = getApp();
import {
  http
} from '../../../utils/http';
const {
  $Toast
} = require('../../../components/base/index');
import { encode } from '../../../utils/encode';
Page({

  data: {
    mealId:'',
    mealName:'',
    mealPrice:'',
    rechargeCount:'',
    extendMsg:'',
    balance: '', //余额
    payWay: 0, //支付方式 0：微信支付 1：余额支付
  },

  onLoad: function(options) {
    this.setData({
      mealId: options.id,
      mealName: options.rechargeName,
      mealPrice: options.money,
      rechargeCount: options.rechargeCount,
      extendMsg: options.extendMsg
    })
  },

  onShow: function() {
    //  查询余额
    this.queryBalance()
  },
  //切换支付方式
  bindPaymentChange: function(e) {
    this.setData({
      payWay: e.detail.value
    })
  },
  //查询余额
  queryBalance() {
    const params = {
      sign: encode({
        userId: app.globalData.userId
      }, app.globalData.sessionId),
      sessionId: app.globalData.sessionId,
      params: {
        userId: app.globalData.userId
      }
    }
    http('qsq/service/external/recharge/queryBalance',params,1, 1).then(res => {
      const {
        chargeMoney
      } = res
      this.setData({
        balance: chargeMoney / 100
      })
      app.globalData.balance = chargeMoney / 100
    })
  },
  //购买套餐，创建预支付订单
  toBuyMeal() {
    const {
      mealName,
      mealPrice,
      payWay,
      rechargeCount,
      mealId
    } = this.data
    const {
      deviceId,
      userId,
      nickname,
      type,
      id
    } = app.globalData
    if(deviceId==""){
      var requestParams = {
        sign: encode({
          appid: id,
          userId: userId,
          goodName: mealName,
          mealGoodName: mealName,
          mealGoodId: mealId,
          money: mealPrice,
          payType: payWay == 0 ? 7 : 8,
          num: 1,
          nickname: nickname,
          type: type.type,
          levelTypeId: type.level,
          times: rechargeCount
        }, app.globalData.sessionId),
        sessionId: app.globalData.sessionId,
        params: {
          appid: id,
          userId: userId,
          goodName: mealName,
          mealGoodName: mealName,
          mealGoodId: mealId,
          money: mealPrice,
          payType: payWay == 0 ? 7 : 8,
          num: 1,
          nickname: nickname,
          type: type.type,
          levelTypeId: type.level,
          times: rechargeCount
        }
      }
    }else{
      var requestParams = {
        sign: encode({
          appid: id,
          deviceId: deviceId,
          userId: userId,
          goodName: mealName,
          mealGoodName: mealName,
          mealGoodId: mealId,
          money: mealPrice,
          payType: payWay == 0 ? 7 : 8,
          num: 1,
          nickname: nickname,
          type: type.type,
          levelTypeId: type.level,
          times: rechargeCount
        }, app.globalData.sessionId),
        sessionId: app.globalData.sessionId,
        params: {
          appid: id,
          deviceId: deviceId,
          userId: userId,
          goodName: mealName,
          mealGoodName: mealName,
          mealGoodId: mealId,
          money: mealPrice,
          payType: payWay == 0 ? 7 : 8,
          num: 1,
          nickname: nickname,
          type: type.type,
          levelTypeId: type.level,
          times: rechargeCount
        }
      }

    }
    
    http('qsq/service/external/order/saveMealOrderInfo', requestParams, 1,1).then(res => {
      var orderNo = res.orderNo
      this.pay(orderNo)
    })
  },
  //支付
  pay(orderNo) {
   
    const {
      payWay,
      balance,
      mealPrice
    } = this.data
    if (payWay == 1) { //余额支付
      if (mealPrice <= balance) { //余额大于支付金额
       
        const params = {
          sign: encode({
            orderNo: orderNo,
            userId: app.globalData.userId
          }, app.globalData.sessionId),
          sessionId: app.globalData.sessionId,
          params: {
            orderNo: orderNo,
            userId: app.globalData.userId
          }
        }
        //余额支付
        http('qsq/service/external/pay/saveBalancePayMeal', params, 1,1).then(res => {
          const {
            id
          } = res
          if (id) {
            $Toast({
              content: '支付成功',
              type: 'success'
            });
            //查询余额
            this.queryBalance();
            wx.navigateBack({
              delta: 1
            })

          } else {
            $Toast({
              content: '支付失败',
              type: 'error'
            });
          }
        })
      } else { //余额小于支付金额
        $Toast({
          content: '余额不足',
          type: 'error'
        });
      }
    } else {
      const params = {
        sign: encode({
          userId: app.globalData.userId,
          orderNo,
          type: 1,
          tp: 0,
          appid: app.globalData.id,
          payNotifyUrl: "1",//套餐支付
          notifyUrl: 'NOTIFYURL_2',
        }, app.globalData.sessionId),
        sessionId: app.globalData.sessionId,
        params: {
          userId: app.globalData.userId,
          orderNo,
          type: 1,
          tp: 0,
          appid: app.globalData.id,
          payNotifyUrl: "1",//套餐支付
          notifyUrl: 'NOTIFYURL_2',
        }
      }

      //微信支付
      http('qsq/service/external/pay/getWeChatPayInfo', params, 1,1).then(res => {
        wx.requestPayment({
          timeStamp: res.timeStamp + '',
          nonceStr: res.nonceStr,
          package: 'prepay_id=' + res.prepay_id,
          signType: 'MD5',
          paySign: res.paySign,
          complete: res => {
            const {
              errMsg
            } = res
            if (errMsg === 'requestPayment:fail cancel') {
              $Toast({
                content: '支付失败',
                type: 'error'
              });
            } else {
              $Toast({
                content: '支付成功',
                type: 'success'
              });
              wx.navigateBack({
                delta: 1
              })
            }
          }
        });

      })
    }
  },

})