/*
 * @Author: tuWei
 * @Date: 2023-05-09 10:27:15
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-05-17 14:58:59
 */
import axios from './axios.js';
import config from './config.js';
const { getPermissionUrlList, insertPermissionUrl } = config.commonUrl;

async function getPermissionList(){
  // 必填
  let permsId = '8ed6e512a7ff4566a618017d7a1be472';
  //必填
  const urls = {
     //物化视图信息查看
    mviewList: { module: 'quickmview', url: '/mview/info/list', method: 'POST', comment: '物化视图列表查询接口' },
    mvListResultTableColumns: { module: 'quickmview', url: '/mview/info/listResultTableColumns', method: 'POST', comment: '结果表输出字段信息列表' },
    mvResultTableDefInfo: { module: 'quickmview', url: '/mview/info/resultTableDefInfo', method: 'POST', comment: '结果表详情' },
    mvSourceRefModelDetails: { module: 'quickmview', url: '/mview/info/sourceRefModelDetails', method: 'POST', comment: '源表关联模型详情' },
    // 物化视图更新版本信息查看
    unDetailInfo: { module: 'quickmview', url: '/mview/info/uversion/detailInfo', method: 'POST', comment: '查询物化视图更新版本详情' },
    unSmsdoLogin: { module: 'quickmview', url: '/mview/info/uversion/list', method: 'POST', comment: '更新版本号列表' },
    unSendloginSms: { module: 'quickmview', url: '/mview/info/uversion/watermarkInfo', method: 'POST', comment: '展示更新版本号水位信息' },
    // 物化视图模型管理
    mdCreateMView: { module: 'quickmview', url: '/mview/admin/modelDef/createMView', method: 'POST', comment: '物化视图新增接口' },
    mdRebuildResultTableCreateSql: { module: 'quickmview', url: '/mview/admin/modelDef/rebuildResultTableCreateSql', method: 'POST', comment: '生成结果表的建表SQL' },
    mdUpdateMView: { module: 'quickmview', url: '/mview/admin/modelDef/updateMView', method: 'POST', comment: '更新物化视图' },
    mdUpdateResultTableColumns: { module: 'quickmview', url: '/mview/admin/modelDef/updateResultTableColumns', method: 'POST', comment: '更新物化视图结果表输出字段信息' },
    mdUpdateResultTableCreateSql: { module: 'quickmview', url: '/mview/admin/modelDef/updateResultTableCreateSql', method: 'POST', comment: '更新结果表的建表SQL' },
    mdUpdateResultTableDefs: { module: 'quickmview', url: '/mview/admin/modelDef/updateResultTableDefs', method: 'POST', comment: '更新物化视图结果表信息' },
    mdUpdateResultTableIndices: { module: 'quickmview', url: '/mview/admin/modelDef/updateResultTableIndices', method: 'POST', comment: '更新物化视图结果表索引信息' },
    mdUpdateSourceRefModelKeys: { module: 'quickmview', url: '/mview/admin/modelDef/updateSourceRefModelKeys', method: 'POST', comment: '更新物化视图源表关联信息' },
    // 物化视图源表信息查看
    mvSourceTableList: { module: 'quickmview', url: '/mview/sourceTable/list', method: 'POST', comment: '物化视图列表查询接口' },
    mvSourceDataBases: { module: 'quickmview', url: '/mview/sourceTable/sourceDataBases', method: 'POST', comment: '展示源数据库实例列表' },
    mvSourceDBInstances: { module: 'quickmview', url: '/mview/sourceTable/sourceDBInstances', method: 'POST', comment: '展示源数据库实例列表' },
    mvSourceDbs: { module: 'quickmview', url: '/mview/sourceTable/sourceDbs', method: 'POST', comment: '展示源数据实例-库列表' },
    mvTableAllColumns: { module: 'quickmview', url: '/mview/sourceTable/tableAllColumns', method: 'POST', comment: '展示源表所有字段信息' },
    mvTableDetailInfo: { module: 'quickmview', url: '/mview/sourceTable/tableDetailInfo', method: 'POST', comment: '展示源表详情信息' },
    // 物化视图状态流程管理
    mvDeactivateMView: { module: 'quickmview', url: '/mview/admin/control/deactivateMView', method: 'POST', comment: '物化视图状态流程管理' },
    mvDeleteMView: { module: 'quickmview', url: '/mview/admin/control/deleteMView', method: 'POST', comment: '物化视图状态流程管理' },
    mvEnableMView: { module: 'quickmview', url: '/mview/admin/control/enableMView', method: 'POST', comment: '物化视图状态流程管理' }
  };
  let args = {
    demand:{
      rowCount: 100,
      current: 1,
      permsId,
    },
    sid: 'WEB' + uuid(32, 16),
    terminalId:"",
    timestamp: new Date().getTime(),
    ip:"0.0.0.0"
  }
  let lists = await sendApi(getPermissionUrlList, args);
  console.log(lists);
  let existData =  lists.serviceResult.data;
  for (const iterator in urls) {
    let item = urls[iterator];
    let one = existData.find(v=>v.url === item.url)
    if(!one){
      savePermiss(permsId, item);
    }
  }
}
getPermissionList();
async function savePermiss(permsId, item){
  let args = {
    demand: {
      interType: 1,
      isEffective: 0,
      permsId,
      projectName: item.module,
      remark: item.comment,
      url: item.url,
    },
    sid: 'WEB' + uuid(32, 16),
  }
  let a = await sendApi(insertPermissionUrl, args);
  console.log( '添加成功', a.serviceResult.data, 'url:', item.url );
}


//api请求
function sendApi(url, args, headers){
  return new Promise((resolve, reject) => {
    axios.post(url, args, headers || null).then((res)=>{
      resolve(res.data);
    }).catch((err) => {
      reject(err);
    })
  })
}

function uuid (len = 32, radix = 64) {
  let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
  let uuid = [], i;
  radix = radix || chars.length;
  if (len) {
    // Compact form
    for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
  } else {
    // rfc4122, version 4 form
    let r;
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';// rfc4122 requires these characters
    uuid[14] = '4';
    for (i = 0; i < 36; i++) {
      // Fill in random data.At i===19 set the high bits of clock sequence as. | per rfc4122, sec. 4.1.5
      if (!uuid[i]) {
        r = 0 | Math.random() * 16;
        uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r];
      }
    }
  }
  return uuid.join('');
}