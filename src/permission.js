/*
 * @Author: tuWei
 * @Date: 2023-05-09 10:27:15
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-05-09 11:32:34
 */
import axios from './axios.js';
import config from './config.js';
const { getPermissionUrlList, insertPermissionUrl } = config.commonUrl;



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

async function getPermissionList(){
  // 必填
  let permsId = '18665c0aa65940ecb209ae81ee790984';
  //必填
  const urls = {
    queryLegalPersonOrgList: { module: 'pso', url: '/common/queryLegalPersonOrgList', method: 'POST', comment: '销方单位列表' },
  }
  let args = {
    demand:{
      rowCount: 100,
      current: 1,
      permsId,
    },
    sid: "",
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
    interType: 1,
    isEffective: 0,
    permsId,
    projectName: item.module,
    remark: item.comment,
    url: item.url,
  }
  let a = await sendApi(insertPermissionUrl, args);
  console.log( a.serviceResult.data, 'url:', item.url );
}