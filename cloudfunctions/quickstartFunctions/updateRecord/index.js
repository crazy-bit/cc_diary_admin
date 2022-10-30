const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();

// 修改数据库信息云函数入口函数
exports.main = async (event, context) => {
  try {
    // 遍历修改数据库信息
    console.log("update data:", event.bill_list)
    await db.collection('diary').where({
    year: event.year.toString()
    })
    .update({
        data: {
            bills: event.bill_list
        },
    });
    return {
      success: true,
      data: event.data
    };
  } catch (e) {
    return {
      success: false,
      errMsg: e
    };
  }
};
