//获取应用实例
const app = getApp();
import common from '../../utils/common';
import { http } from '../../utils/http';
import { encode } from '../../utils/encode';
const lg = app.loadUtil();
const {
  $Toast
} = require('../../components/base/index');
Page({
  ...common,
  data: {
    hidden:false,
    userInfo: null,
    hasUserInfo: true,
    userNick: '',
    types: [],
    deviceId:"",
    classify:'',
    s: '', //序号
    list: [],
    glist:[],
    //selectType: -1,
    selectType: "第一层",
    goodsType:[],//
    goodRoads: ["第一层", "第二层", "第三层", "第四层", "第五层", "第六层", "第七层", "第八层", "第九层", "第十层"],
    count: 0,
    total: 0,
    selectGoods: [],
    discount: '',
    auth: false,
    isVip:0,
    isFirstBuy:0,
    sign:'',
    num:'',//货存
    tp:'',//0单货单，1多货道,
    mealUseNum:0,//套餐剩余使用数量
    showCart:false,
  },
  onLoad(options) {
    wx.hideTabBar()
    /*
   type为1正式版，type为2本地测试 
   tp为1多货道，tp为0单货道
   meal为1套餐是购买次数，为0套餐是固定的商品
 */
    //BmcKLAeVhAeVhAc BmcKLBoLBoLBpBq AbVeVgVfAfVHAfVgdhViAcchVh
    var url = 'https://www.tianrenyun.com/qsq/paomian/?sign=BbfIIBHJBdj&type=2&appid=13&tp=1&meal=1'
   //var url = 'https://www.tianrenyun.com/qsq/paomian/?sign=&type=1&appid=12&tp=&meal=1'

    if (options.q) {
      url = decodeURIComponent(options.q);
    }
    this.decodeUrl(url);
    lg.authLoad(this);
  },

  //二维码扫描
  click: function (e) {
    wx.scanCode({
      success: (res) => {
        app.globalData.url = res.result
        var url=''
        this.decodeUrl(app.globalData.url)
        this.queryDevice(this.data.sign)
      }
    })
  },
  //解析二维码
  decodeUrl(url){
    if (url) {
      url = url

    }
    var urlList = url.split("?")
    var params = urlList[1].split("&")
    var si = params[0].split("=")
    var type = params[1].split("=")
    var id = params[2].split("=")
    var tp = params[3].split("=")
    var mealType = params[4].split("=")
    app.globalData.urlType = type[1];
    app.globalData.id = id[1];
    app.globalData.sign = si[1];
    app.globalData.tp = tp[1];
    app.globalData.mealType=mealType[1];
    this.setData({
      auth: app.globalData.auth,
      sign: si[1],
      tp: tp[1]
    });
  },
  //根据设备名查找设备
  queryDevice(sign){
    if (sign) {
      const params = {
        sign: encode({
          sign: sign
        }, app.globalData.sessionId),
        sessionId: app.globalData.sessionId,
        params: {
          sign: sign
        }
      }
      http('qsq/service/external/device/query', JSON.stringify(params), 1, 1).then(res => {
        this.setData({
          classify: res[0].classify,
          deviceId: res[0].deviceId
        })
        app.globalData.deviceName = res[0].deviceName
        app.globalData.deviceId = res[0].deviceId
        app.globalData.classify = res[0].classify
        this.queryGoods(this.data.deviceId, this.data.selectType)
      })
    }
  },
  //根据设备id查找商品
  queryGoods(deviceId, selectType){
    var xuhao=[];
    const params = {
      sign: encode({
        deviceId: deviceId
      }, app.globalData.sessionId),
      sessionId: app.globalData.sessionId,
      params: {
        deviceId: deviceId
      }
    }
    http('qsq/service/external/goods/queryGoods',params,1, 1).then(res => {  
      //EE类型设备
      if (this.data.classify.indexOf("EE")!=-1){
      for(var i=0;i<res.length;i++){
        var goods=res[i].baseData;
        res[i].commodityName = JSON.parse(goods)[0].v;//商品名称
        if (JSON.parse(goods)[2]) {//商品价格
            res[i].retailPrice = JSON.parse(goods)[2].v;
            res[i].costPrice = JSON.parse(goods)[2].v
        }
        if (JSON.parse(goods)[6]){//图片序号
          res[i].picture = JSON.parse(goods)[6].v;
        }
        if (JSON.parse(goods)[5]) {//设备状态 停用/启用
          res[i].status = JSON.parse(goods)[5].v;
        }
        res[i].goodId=i+1;//货道
      }
      this.setData({
        list: res,
      })
      } else { //FF类型设备
        var goodsRoadColumn = res[0].goodsRoadColumn;
        var goods = res[0].goodsRoad1;
     
        var goodsRoadColumns="["+goodsRoadColumn+"]";
     
        var goodsRoadColumnsJson = JSON.parse(goodsRoadColumns)

        for (var i = 0; i < goodsRoadColumnsJson.length;i++){
          this.data[goodsRoadColumnsJson[i].value] = goodsRoadColumnsJson[i].columnName;
        }
        var arr =[]; 
        var goodsJson = JSON.parse(goods);
        for (var i = 0; i < goodsJson.length;i++){
          arr.push(goodsJson[i]);
          arr[i].commodityName = goodsJson[i][this.data.t];//t:名称
          arr[i].picture = goodsJson[i][this.data.j];//j:图片
          arr[i].num = goodsJson[i][this.data.n];//n:数量
          arr[i].valid=goodsJson[i][this.data.i];//是否有效 非0有效 
 
          arr[i].retailPrice = goodsJson[i][this.data.p];//原价
          arr[i].costPrice = goodsJson[i].costPrice ? goodsJson[i].costPrice : goodsJson[i][this.data.p]//会员价
          if (!goodsJson[i][this.data.j]!=null){
            var d = Math.floor(Math.random() * 10000)
            arr[i].id = d;
          }
          // 改
          if(goodsJson[i][this.data.s] < 100 || goodsJson[i][this.data.s] >=1100){
              this.setData({
                s:'',
              })
          }
         
          if (goodsJson[i][this.data.s]) {
            xuhao.push(goodsJson[i][this.data.s])
            var numb = goodsJson[i][this.data.s]//s:序号
            arr[i].type = numb;
            if (numb && numb>100 && numb<200){
              arr[i].typeName = "第一层";
            } else if (numb && numb > 200 && numb < 300){
              arr[i].typeName = "第二层";
            } else if (numb && numb > 300 && numb < 400){
              arr[i].typeName = "第三层";
            } else if (numb && numb > 400 && numb < 500){
              arr[i].typeName = "第四层";
            } else if (numb && numb > 500 && numb < 600){
              arr[i].typeName = "第五层";
            } else if (numb && numb > 600 && numb < 700){
              arr[i].typeName = "第六层";
            } else if (numb && numb > 700 && numb < 800) {
              arr[i].typeName = "第七层";
            } else if (numb && numb > 800 && numb < 900) {
              arr[i].typeName = "第八层";
            } else if (numb && numb > 900 && numb < 1000) {
              arr[i].typeName = "第九层";
            }else{
              arr[i].typeName = "第十层";
            }
          }
         
          arr[i].goodId=i+1;
        }
        app.globalData.allGoodList = arr
        //存在序号，分层显示
        if(this.data.s){
          var end=""
         if(xuhao.sort()[0].length>3){
           end=10
         }else{
           end = xuhao.sort()[xuhao.length - 1].substr(0, 1);
         }
          this.setData({
            goodsType: this.data.goodRoads.slice(0, end)
          })
          const aaa = arr.filter(item => item.typeName === this.data.selectType);
          let selectGoods = this.data.selectGoods//购物车商品

          for (var k = 0; k < selectGoods.length;k++){
            aaa.find((item) => {
              if (item.goodId == selectGoods[k].goodId) {
                item.count = selectGoods[k].count
              }
            })
          }
        
          // const hcList = wx.getStorageSync('list' + this.data.selectType);
          // if (hcList.length > 0) {
          //   this.setData({
          //     list: hcList
          //   })
          // }else{
            this.setData({
              list: aaa,
              s: this.data.s,
            })
          // }
        //不存在序号，一层显示
        }else{
          this.setData({
            list: arr
          })
        }
    
      }
    })
  },
  //切换分层
  typeHand(e) {
    const { id } = e.currentTarget.dataset
    this.queryGoods(this.data.deviceId,this.data.selectType);
    this.setData({
      selectType:id
    })
  },
  //去结算
  submitHandler() {
    if (getApp().globalData.hasUserInfo) {
    const { count } = this.data
    if (count>0) {
      getApp().globalData.goodsList = this.data.selectGoods
      wx.navigateTo({
        url: '../submitOrder/index'
      });
    } else {
      $Toast({
        content: '请选择商品！',
        type: 'error'
      });
    }
    }else{
      wx.showModal({
        title: '温馨提示',
        content: '购买商品需要先登录，您确定去登陆吗？',
        success(res) {
          if (res.confirm) {
            wx.switchTab({
              url: '/pages/mycenter/index'
            })
          }
        }
      })
    }
  },
  noChangeNumber(){
      $Toast({
        content: '只能选择一个商品！',
        type: 'error'
      });
  },
  noGoods() {
    $Toast({
      content: '货存不足！请选择其他商品！',
      type: 'error'
    });
  },
  fault() {
    $Toast({
      content: '货到故障！请选择其他商品！',
      type: 'error'
    });
  },
  
  changeNumber({ detail, target}) {
    const { item } = target.dataset
    let { list, count, total, discount,glist} = this.data
    const { value, type } = detail //数量 按钮类型
      const { index } = target.dataset //商品下标
      let goods = list[index]
      if (type === 'plus') {
        count++
      } else {
        count--
      }

      goods['count'] = value
      goods['coupons'] = item
    const s = glist.filter(item => item.goodId != goods.goodId);
      s.push(goods);
      this.setData({
        glist: s
      });
      const { coupons } = goods
      if (coupons && coupons.id) {
        const { couponType } = coupons
        
        if (couponType * 1 === 5) {
          goods['discount'] = (goods.count * goods.retailPrice - goods.count * goods.retailPrice * coupons.discount * 0.01).toFixed(2)
        } else if (couponType * 1 === 6) {
          goods['discount'] = coupons.discount
        } else if (couponType * 1 === 7) {
          goods['discount'] = (goods.retailPrice - coupons.discount).toFixed(2)
        }
      } else {
        goods['discount'] = '0.00'
      }
      list[index] = goods
      const selectGoods = s.filter(item => item.count && item.count > 0)
    getApp().globalData.goodsList = selectGoods
  
     let totalPrice = selectGoods.reduce((total, cur) => {
       if (cur.count * cur.retailPrice - cur.discount>0){
       
         if (app.globalData.isVip == 1 && app.globalData.isFirstBuy==1){
           return cur.count * cur.costPrice - cur.discount + total
         }
         return cur.count * cur.retailPrice - cur.discount + total
       }else{
         return 0.01+total
       }
        
      }, 0)
    
      let num = selectGoods.reduce((total, cur) => {
        return cur.count + total
      }, 0)
      let disc = selectGoods.reduce((prev, cur) => {
        return cur.discount * 1 + prev
      }, 0)

      this.setData({
        list,
        count: num,
        total: totalPrice,
        discount: disc,
        selectGoods: selectGoods
      })
      
      // wx.setStorage({
      //   key: 'list' + this.data.selectType, // 缓存数据的key
      //   data: list // 要缓存的数据
      // });
     
  },

  addNumber: function ({ detail, target }) {
    const { index } = target.dataset //商品下标
    const { value, type } = detail //数量 按钮类型
    let { list, count, total,selectGoods } = this.data
    if (type === 'plus') {
      count++ 
    } else {
      if (count > 0) {
        count-- 
      }
    }
    let curGood = selectGoods[index];
    curGood.count = value
    let totalPrice = selectGoods.reduce((total, cur) => {
      if (cur.count * cur.retailPrice - cur.discount > 0) {
        if (app.globalData.isVip == 1 && app.globalData.isFirstBuy == 1) {
          return cur.count * cur.costPrice - cur.discount + total
        }
        return cur.count * cur.retailPrice - cur.discount + total
      } else {
        return 0.01 + total
      }

    }, 0)
    let num = selectGoods.reduce((total, cur) => {
      return cur.count + total
    }, 0)
    list.find((item) => {
      if (item.goodId == selectGoods[index].goodId) {
        item.count = selectGoods[index].count
        console.log(item)
      }
    })
    selectGoods = selectGoods.filter(item => item.count && item.count > 0)
    getApp().globalData.goodsList = selectGoods
    if (count == 0) {
      this.setData({
        showCart: false
      })
    }
    this.setData({
      selectGoods: selectGoods,
      total: totalPrice,
      count: num,
      list: list
    });
    // wx.setStorage({
    //   key: 'list' + this.data.selectType, // 缓存数据的key
    //   data: list // 要缓存的数据
    // });
  },
  clearCartList(){
    let { list, selectGoods } = this.data
    list.find((item) => {
        item.count = 0
    })
    this.setData({
      selectGoods: [],
      glist:[],
      showCart: false,
      total: 0,
      count: 0,
      list: list
    });
    app.globalData.goodsList = []
  },
  //查询套餐剩余使用次数
  queryMealUseNum() {
    var that = this;
    const params = {
      sign: encode({
        userId: app.globalData.userId
      }, app.globalData.sessionId),
      sessionId: app.globalData.sessionId,
      params: {
        userId: app.globalData.userId
      }
    }
    http('qsq/service/external/goods/queryMealUseNum', params, 1, 1).then(res => {
      that.setData({
        mealUseNum: res
      })
    })
  },
  //显示购物车
  showCartList: function () {
    if (this.data.selectGoods.length != 0) {
      this.setData({
        showCart: !this.data.showCart,
      });
    }

  },
  onShow (){
    if (app.globalData.userId){
      this.queryMealUseNum();
      const params = {
        sign: encode({
          userId: app.globalData.userId
        }, app.globalData.sessionId),
        sessionId: app.globalData.sessionId,
        params: {
          userId: app.globalData.userId
        }
      }
      http('qsq/service/external/recharge/queryBalance', params,1,1).then(res => {
        var buyDate = new Date(res.firstbuy)
        var now = new Date()
        if (buyDate.toLocaleDateString() != now.toLocaleDateString()) {
          app.globalData.isFirstBuy = 1
        }else{
          app.globalData.isFirstBuy = 0
        }
        this.setData({
          isVip: app.globalData.isVip,
          isFirstBuy: app.globalData.isFirstBuy,
        })
        let { goodsList } = app.globalData
        let { list } = this.data
        if (goodsList.length === 0) {
          list.map(item => {
            item.count = 0
            return item
          })
          this.setData({
            total: 0,
            discount: 0,
            count: 0,
            list: list,
            selectGoods:[],
            glist:[]
          })
          if (this.data.deviceId) {
            this.queryGoods(this.data.deviceId, this.data.selectType)
          }
        }else{
            let totalPrice = this.data.selectGoods.reduce((total, cur) => {
              if (cur.count * cur.retailPrice - cur.discount > 0) {
                if (app.globalData.isVip == 1 && app.globalData.isFirstBuy == 1) {
                  return cur.count * cur.costPrice - cur.discount + total
                }
                return cur.count * cur.retailPrice - cur.discount + total
              } else {
                return 0.01 + total
              }
            }, 0)
            this.setData({
              total: totalPrice,
            })
          }
        
      })
     
    } 
   
    
  }
})