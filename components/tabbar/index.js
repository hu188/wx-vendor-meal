// components/tabbar/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
   current:{
     type: String,
     value:'homepage'
   },
   
  },

  /**
   * 组件的初始数据
   */
  data: {
    mealType: ''
  },
  lifetimes: {
    ready() {
      // 在组件实例进入页面节点树时执行
      this.setData({
        mealType: getApp().globalData.mealType
      })
    },
 
  },
  /**
   * 组件的方法列表
   */
  methods: {
    handleChange (e) {
      const {key} = e.detail
      if (key ==='repertory') {
        wx.switchTab({
          url: '/pages/mealRepertory/mealRepertory',
        })
      } else if (key ==='mine'){
        wx.switchTab({
          url: '/pages/mycenter/index',
        })
      } 
      else if (key === 'meals') {
        wx.switchTab({
          url: '/pages/meals/index',
        })
      }else if (key === 'homepage'){
        wx.switchTab({
          url: '/pages/goods/index',
        })
      }
      // }else{
      //   wx.scanCode({
      //     success: (res) => {
      //       const { result } = res
      //       if (result.length > 0) {
      //         const str = result.split(':')[2]
      //         if (str === undefined) {
      //           $Toast({
      //             content: '扫码失败',
      //             type: 'error'
      //           });
      //         } else {
      //           if (str.indexOf('//') === -1) {
      //             wx.switchTab({
      //               url: '../goods/index'
      //             })
      //           } else {
      //             const id = str.split('=')[1].replace('//', '')
      //             wx.navigateTo({
      //               url: `../goodsDetail/index?id=${id}`
      //             })
      //           }
      //         }
      //       }
      //     },
      //     fail: (res) => {
      //     }
      //   });
      // }
      
    }
  }
})
