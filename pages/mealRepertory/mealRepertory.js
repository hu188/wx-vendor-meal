const app = getApp();
const { $Message } = require('../../components/base/index');
import { encode } from '../../utils/encode';
import {
  http
} from '../../utils/http';
const {
  $Toast
} = require('../../components/base/index');
let screenWidth = 375
Page({
  data: {
    checkedItem: 0,
    totalNum: 0,
    goodsArr: [],
    scrollId: 'item_-1',
    disabled:false,
    pickUpCount:0
  },

  onShow: function () {
    wx.getSystemInfo({
      success: function (res) {
        screenWidth = res.windowWidth
      }
    })
     this.queryMeal()
    this.queryPickUpCount()
    },
    //查询套餐
    queryMeal(){
      let that = this
      const data = {
        userId: app.globalData.userId
      }
      const params = {
        sign: encode({
          userId: app.globalData.userId
        }, app.globalData.sessionId),
        sessionId: app.globalData.sessionId,
        params: {
          userId: app.globalData.userId
        }
      }
      http('qsq/service/external/order/queryMealInfo', params,1, 1).then(res => {
        for(var i =0;i<res.length;i++){
          let goodId = res[i].goodId;
          let params = goodId.split(";");
          let id = params[1].split("-")[0];
          res[i].pictureId = id
        }
        that.setData({
          goodsArr: res,
          totalNum: res.length,
          // checkedItem: res.length > 0 ? 0 : -1,
          scrollId: 'item_start'
        })
      })

    },
    //查询今日取货次数
  queryPickUpCount(){
    let that = this
    const params = {
      sign: encode({
        userId: app.globalData.userId
      }, app.globalData.sessionId),
      sessionId: app.globalData.sessionId,
      params: {
        userId: app.globalData.userId
      }
    }
    http('qsq/service/external/order/queryPickUpTimes', params, 1,1).then(res => {

      that.setData({
        pickUpCount:res
      })
    })

  },
    //点击项
    clickItemOpt: function (event) {
      let index = event.currentTarget.dataset.index;
      this.setData({
        checkedItem: index
      })
    },


    toBindScroll: function () {
      let that = this;
      let query = this.createSelectorQuery();
      query.selectAll('.core-scroll-item').boundingClientRect(rects => {
        for (let i = 0; i < rects.length; i++) {
          let c_screenWidth = screenWidth / 2
          if (rects[i].right > c_screenWidth
            && c_screenWidth > rects[i].left) {
            that.setData({
              checkedItem: i
            })
            break
          }
        }
      }).exec();
    },

    //取货
    toSendGoods: function () {
      let that = this
      //每天只能取货两次
      if(that.data.pickUpCount>=2){
        $Message({
          content: '今天取货次数已达上限',
          type: 'error'
        });
      }else{
        that.setData({
          disabled: true
        })
        var timeOut = setTimeout(function () {
          that.setData({
            disabled: false
          })
        }, 10000)

        let checkedItem = this.data.checkedItem;
        let goodsArr = this.data.goodsArr;
        let pick_up_id = goodsArr[checkedItem].id;
        let g_id = goodsArr[checkedItem].pictureId
        //查询设备状态（在线、离线、设备忙）
        const params = {
          sign: encode({
            sign: app.globalData.sign,
            appid: app.globalData.id
          }, app.globalData.sessionId),
          sessionId: app.globalData.sessionId,
          params: {
            sign: app.globalData.sign,
            appid: app.globalData.id
          }
        }
        http('qsq/service/external/device/queryStatus',params,1,1).then(res => {

          //无返回设备状态正常
          if (res == '') {
            let list = app.globalData.allGoodList;
            if (list == '') {
              $Message({
                content: '请先扫描设备上的二维码',
                type: 'error'
              });
            } else {
              const item = list.find(({ picture }) => g_id === picture);
              if (item && item.num > 0) {
                console.log(item)
                const params = {
                  sign: encode({
                    deviceId: app.globalData.deviceId,
                    userId: app.globalData.userId,
                    goodId: item.goodId,
                    goodName: item.commodityName,
                    money: 0,
                    payType: 11,
                    num: 1,
                    nickname: app.globalData.nickname,
                    isVip: app.globalData.isVip,
                    isFirstBuy: app.globalData.isFirstBuy
                  }, app.globalData.sessionId),
                  sessionId: app.globalData.sessionId,
                  params: {
                    deviceId: app.globalData.deviceId,
                    userId: app.globalData.userId,
                    goodId: item.goodId,
                    goodName: item.commodityName,
                    money: 0,
                    payType: 11,
                    num: 1,
                    nickname: app.globalData.nickname,
                    isVip: app.globalData.isVip,
                    isFirstBuy: app.globalData.isFirstBuy
                  }
                }
                http('qsq/service/external/order/saveOrderInfo', JSON.stringify(params), 1, 1).then(res => {
                  const data = {
                    deviceId: app.globalData.deviceId,
                    userId: app.globalData.userId,
                    orderNo: res.orderNo
                  }
                  http('qtg/service/external/chat/saveHandleMealData', data, 1).then(res => {
                    if (res == "success") {
                      $Message({
                        content: '取货成功',
                        type: 'success'
                      });
                      that.onShow();
                    }
                  })
                })

                //发送报文
               
              } else {
                $Message({
                  content: '当前设备没有此商品，请到附近其他设备取货',
                  type: 'warning'
                });
              }
            }
            //显示设备错误状态信息（离线、设备忙）
          } else {
            $Message({
              content: res,
              type: 'error'
            });
          }
        })
      }
     

    },


})