/*
 * @Author: tuWei
 * @Date: 2023-05-09 10:27:15
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-05-14 16:34:57
 */
import axios from './axios.js';
import config from './config.js';
const { getPermissionUrlList, insertPermissionUrl } = config.commonUrl;

async function getPermissionList(){
  // 必填
  let permsId = 'f403d10aa1a34397974893107f87f40c';
  //必填
  const urls = {
    queryPharmacistPracticeLicenseResult: { module: 'ocr', url: '/api/ocr/v1/task/queryPharmacistPracticeLicenseResult', method: 'POST', expire: 0, comment: '药师执业资格证' },
  }
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