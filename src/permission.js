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
  let permsId = 'e5b6a5b95c2148b8a7b3461514162735';
  //必填
  const urls = {
    importTemplateList: { module: 'ies', url: '/config/importTemplate/pageList', method: 'POST', comment: '查询导入模版分页信息'},
      importTemplateDetail: { module: 'ies', url: '/config/importTemplate/detail', method: 'POST', comment: '查询导入模版分页信息'},
      importSaveOrUpdate: { module: 'ies', url: '/config/importTemplate/saveOrUpdate', method: 'POST', comment: '保存/修改导入模版信息'},
      datasourceList: { module: 'ies', url: '/config/datasource/selectList', method: 'POST', comment: '下拉数据源列表'},
      tableSelectList: { module: 'ies', url: '/config/table/selectList', method: 'POST', comment: '表信息下拉列表'},
      columnSelectList: { module: 'ies', url: '/config/table/column/selectList', method: 'POST', comment: '表字段信息列表'},
      importMappingType: { module: 'ies', url: '/common/enum/importMappingType/selectList', method: 'POST', comment: '导入映射配置类型'},
      dateValidTypeEnum: { module: 'ies', url: '/common/enum/dateValidType/selectList', method: 'POST', comment: '日期校验类型'},
      validTypeEnum: { module: 'ies', url: '/common/enum/validType/selectList', method: 'POST', comment: '校验类型'},
      dateFormatList: { module: 'ies', url: '/common/enum/dateFormat/selectList', method: 'POST', comment: '日期格式化类型'},
      

      transferType: { module: 'ies', url: '/common/enum/transferType/selectList', method: 'POST', comment: '转换类型'},
      dateTransferType: { module: 'ies', url: '/common/enum/dateTransferType/selectList', method: 'POST', comment: '日期转换类型'},

      // interfaceTypeList: { module: 'ies', url: '/common/enum/interfaceType/selectList', method: 'POST', comment: '接口类型'},
      interfaceList: { module: 'ies', url: '/config/interface/selectList', method: 'POST', comment: '接口信息下拉列表'},
      interfaceDetail: { module: 'ies', url: '/config/interface/detail', method: 'POST', comment: '接口详细信息'},

      excelPageList: { module: 'ies', url: '/config/excel/pageList', method: 'POST', comment: 'EXCEL模版分页列表'},
      excelSaveOrUpdate: { module: 'ies', url: '/config/excel/saveOrUpdate', method: 'POST', comment: '保存/修改EXCEL模版'},
      excelDetail: { module: 'ies', url: '/config/excel/detail', method: 'POST', comment: 'EXCEL模版详情'},
      excelSelectList: { module: 'ies', url: '/config/excel/selectList', method: 'POST', comment: 'EXCEL模版下拉列表'},

      
      
      
      exportTemplateDetail: { module: 'ies', url: '/config/exportTemplate/detail', method: 'POST', comment: '导出模版详情信息'},
      exportTemplateList: { module: 'ies', url: '/config/exportTemplate/pageList', method: 'POST', comment: '查询导出模版分页信息'},
      exportSaveOrUpdate: { module: 'ies', url: '/config/exportTemplate/saveOrUpdate', method: 'POST', comment: '保存/修改导出模版信息'},
      
      importPageList: { module: 'ies', url: '/core/import/pageList', method: 'POST', comment: '导入记录分页查询'},
      exportPageList: { module: 'ies', url: '/core/export/pageList', method: 'POST', comment: '导出记录分页查询'}
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