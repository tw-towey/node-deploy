function getXMLHttpRequest () {
  return XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
}

function getDefaultSettings () {
  return {
    type: 'POST', // 默认发送方式
    contentType: 'application/json', // 默认返回类型
    accept: 'application/json, text/plain, */*',
    'accept-encoding': 'gzip, deflate, br',
    timeout: 0, // 超时设置
    context: '', // 上下文对象
    async: true, // 是否异步
    cache: false, // 是否缓存
    withCredentials: false, // 是否发送任何认证信息（credentials）如"cookies"和"HTTP authentication schemes"
    crossDomain: true, //设置cross跨域
    data: '', // 参数列表
    dataType: 'json', // 返回数据类型
    onloadstart: null,
    onProgress: null,
    onLoad: null,
    onLoadend: null,
    onTimeout: null,
    onError: null,
    onAbort: null,
    complete: null,
    success: null
  };
}

function getSettings (options) {
  var defaultSettings = getDefaultSettings();
  return Object.assign({}, defaultSettings, options);
}

function beforeSend (xhr, options) {
  //绑定
  if (options.beforeSend) {
    options.beforeSend.call(options.context, xhr, options);
  }
  // 是否发送认证信息
  if (options.withCredentials) {
    xhr.withCredentials = true;
  }
  
  /** @namespace options.contentType */
  if (options.contentType) {
    xhr.setRequestHeader('Content-Type', options.contentType);
  }
  // 配置超时
  /** @namespace options.timeout */
  xhr.timeout = options.timeout;
  xhr.onloadstart = function () {
    if ('function' === typeof options.onloadstart) {
      options.onloadstart.call(options.context, xhr, xhr.status);
    }
  };
  // [upload 由于目前项目采用基于总线的跨域请求，上传状态暂时无法支持]
  // xhr.upload.onloadstart = function(){
  // 	console.info('upload.onloadstart');
  // 	if (typeof options.onUpLoadstart == "function") {
  //      options.onUpLoadstart.call(options.context, xhr, xhr.status);
  //  }
  // };
  // xhr.upload.onprogress = function(){
  // 	console.info('upload.onprogress');
  // 	if (typeof options.onUploadProgress == "function") {
  //      options.onUploadProgress.call(options.context, xhr, xhr.status);
  //  }
  // };
  // xhr.upload.onload = function(){
  // 	console.info('upload.onload');
  // 	if (typeof options.onUploadLoad == "function") {
  //      options.onUploadLoad.call(options.context, xhr, xhr.status);
  //  }
  // };
  // xhr.upload.onloadend = function(){
  // 	console.info('upload.onloadend');
  // 	if (typeof options.onUploadLoadend == "function") {
  //      options.onUploadLoadend.call(options.context, xhr, xhr.status);
  //  }
  // };
  xhr.onprogress = function () {
    if ('function' === typeof options.onProgress) {
      options.onProgress.call(options.context, xhr, xhr.status);
    }
  };
  xhr.ontimeout = function () {
    if ('function' === typeof options.onTimeout) {
      options.onTimeout.call(options.context, xhr, xhr.status);
    }
    complete(xhr, options);
  };
  xhr.onerror = function () {
    if ('function' === typeof options.onerror) {
      options.onError.call(options.context, xhr, xhr.status);
    }
    complete(xhr, options);
  };
  xhr.onabort = function () {
    if ('function' === typeof options.onAbort) {
      options.onAbort.call(options.context, xhr, xhr.status);
    }
    complete(xhr, options);
  };
  xhr.onload = function () {
    if ('function' === typeof options.onLoad) {
      options.onLoad.call(options.context, xhr, xhr.status);
    }
    complete(xhr, options);
  };
  xhr.onloadend = function () {
    if ('function' === typeof options.onLoadend) {
      options.onLoadend.call(options.context, xhr, xhr.status);
    }
  };
}

function post (options) {
  options = getSettings(options);
  try {
    send(options);
  } catch (e) {
    console.info(e.toString());
  }
}

function get (options) {
  options.type = 'GET';
  options = getSettings(options);
  try {
    send(options);
  } catch (e) {
    console.info(e.toString());
  }
}

function complete (xhr, options) {
  console.log('complete', xhr, options);
}

function ajax (options) {
  var method = options.type.toUpperCase();
  switch (method) {
    case 'POST':
      post(options);
      break;
    case 'GET':
      get(options);
      break;
    default:
      options.type = 'POST';
      post(options);
      break;
  }
}

function send (options) {
  var xhr = getXMLHttpRequest();
  var data = options.data;
  if (typeof data === 'object') {
    data = encodeURIComponent(JSON.stringify(data));
  }
  try {
    var method = options.type.toUpperCase();
    switch (method) {
      case 'POST':
        xhr.open('post', options.url, options.async);
        beforeSend(xhr, options);
        xhr.send(data);
        break;
      case 'GET':
        var url = makeUrl(options.url, options.data);
        xhr.open('get', url, options.async);
        // 如果是 GET/HEAD请求，send()方法一般不传参或传 null。不过即使你真传入了参数，参数也最终被忽略，xhr.send(data)中的data会被置为 null
        beforeSend(xhr, options);
        xhr.send(null);
        break;
      default:
        beforeSend(xhr, options);
        xhr.send(null);
        break;
    }
  } catch (e) {
    console.info(e.toString());
  }
}

/**
 * 判断是否为Json格式字符串
 */
function isJsonString (str) {
  try {
    JSON.parse(str);
    return typeof str === 'string' && /^{.*}$|^\[.*]$/.test(str);
  } catch (e) {
    return false;
  }
}

function object2search (params) {
  var arr = [];
  var value;
  var keys = Object.keys(params);
  keys.forEach(k => {
    value = params[k];
    if (value) {
      arr.push(`${k}=${typeof value === 'object' ? JSON.stringify(value) : value}`);
    }
  });
  return arr.join('&');
}

function search2object (search) {
  var obj = {};
  var arr = search.split('&');
  var tempArr;
  if (isEmpty(search)) {
    return obj;
  }
  if (/^[?]/.test(search)) {
    search = search.replace('?', '');
  }
  if (!search) {
    return {};
  }
  arr.forEach(item => {
    tempArr = item.split('=');
    obj[tempArr[0]] = isJsonString(tempArr[1]) ? JSON.parse(tempArr[1]) : tempArr[1] || '';
  });
  return obj;
}

function makeUrl (url, obj) {
  var params = {};
  var arr = url.split('?');
  if (arr.length > 1) {
    params = search2object(arr[1]);
  }
  if (obj && typeof obj === 'string') {
    obj = search2object(obj.replace(/^[?&]|[&]$/g, ''));
  }
  // 合并参数
  Object.assign(params, obj);
  return !isEmptyObject(params) ? `${arr[0]}?${object2search(params)}` : arr[0];
}
function isEmptyObject (obj) {
  if (obj === null) {
    return true;
  }
  return Object.keys(obj).length <= 0;
}

/**
 * 判断是否为空
 */
function isEmpty (obj) {
  var ss;
  if (typeof obj === 'string') {
    ss = obj;
    return ss.length > 0 ? false : true;
  } else if (typeof obj === 'object') {
    return isEmptyObject(obj);
  } else if (typeof obj === 'undefined') {
    return true;
  } else if (typeof obj === 'boolean' || typeof obj === 'number') {
    return false;
  } else {
    return obj || false;
  }
}

function complete (xhr, options) {
  if ('function' === typeof options.complete) {
    options.complete.call(options.context, xhr, xhr.status);
  }
  if ((200 <= xhr.status && 300 > xhr.status) || xhr.status === 304) {
    options.success.call(options.context, xhr.responseText, xhr.responseXML, xhr);
  } else {
    options.error.call(options.context, xhr, xhr.status, xhr.error);
  }
}
