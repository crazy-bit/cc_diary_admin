const { envList } = require('../../envList.js');
var app = getApp()

Page({
    mixins: [require('../../mixin/common')],
    data: {
        bill_list: [],
        bill_list_origin: [],
        claimed_quota: 0,
        cur_quota: 0,
        left_quota: 0,
        next_year_quota: 0,
        envList,
        selectedEnv: envList[0]
    },

    LoadFromDataBase() {
        wx.cloud.callFunction({
          name: 'quickstartFunctions',
          config: {
            env: this.data.selectedEnv.envId
          },
          data: {
            type: 'selectRecord',
            year: app.globalData.year,
          }
        }).then((resp) => {
            // 解析bills
            var total_spend = 0;
            var new_bills = [];
            var bills = resp.result.data[0].bills;
            for (var i = 0; i < bills.length; i++) {
                var d = new Date(bills[i].date);
                var name = d.getMonth()+1 + "-" + d.getDate() + " | " + bills[i].spend + "元 | " + bills[i].purpose;
                new_bills.push({'name':name, 'claimed':bills[i].claimed, 'value':i});
                total_spend += bills[i].spend;
            }
            this.setData({bill_list_origin:bills});
            this.setData({bill_list:new_bills});

            // 解析额度
            var quota = resp.result.data[0].quota;
            this.setData({cur_quota:quota.cur_year * 10000});
            this.setData({next_year_quota:quota.expect_next_year * 10000});
            this.setData({left_quota:quota.cur_year * 10000 - total_spend});
        }).catch((e) => {
          console.log(e);
        });
    },

    UpdateToDataBase() {
        console.log("update to database:", this.data.bill_list_origin)
        wx.cloud.callFunction({
          name: 'quickstartFunctions',
          config: {
            env: this.data.selectedEnv.envId
          },
          data: {
            type: 'updateRecord',
            bill_list: this.data.bill_list_origin,
            year: app.globalData.year,
          }
        }).then((resp) => {
          wx.showToast({
            title:"提交成功",
            icon:'success',
            duration:1500
          })
        }).catch((e) => {
          console.log(e);
          wx.showToast({
            title:"系统异常",
            icon:'error',
            duration:2000
          })
        });
    },
	
	

    // 初次加载
    onLoad: function() {
        this.LoadFromDataBase()
    },

    onPullDownRefresh: function() {
        console.log("on reload page")
        this.LoadFromDataBase()
    },

    OnSubmit(e) {
        for (var i = 0; i < this.data.bill_list.length; i++) {
            this.data.bill_list_origin[i].claimed = this.data.bill_list[i].claimed
        }
        this.UpdateToDataBase(this.data)
    },

    checkboxgroupChange: function(e) {
        var claimed = 0
        // 先全部置0
        for (var i  = 0; i < this.data.bill_list.length; i++) {
            this.data.bill_list[i].claimed = false
        }
        // 再按选择进行置位
        claimed = 0
        for (var i  = 0; i < e.detail.value.length; i++) {
            var index = e.detail.value[i]
            this.data.bill_list[index].claimed = true
            claimed += this.data.bill_list_origin[index].spend;
        }
        this.setData({claimed_quota:claimed});
    }

  });
  