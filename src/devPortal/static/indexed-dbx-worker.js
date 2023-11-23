function IndexedDBX (settings) {
  this.settings = settings;
  this.indexedDB = indexedDB || webkitIndexedDB || mozIndexedDB || msIndexedDB;
}

/**
 * 初始化数据库
 */
IndexedDBX.prototype.initDatabase = function (success, error, context) {
  context = context || this;
  var that = this;
  if (this.indexedDB) {
    this.openDatabase(
      function (database) {
        if (typeof success === 'function') {
          success.call(context, database);
        }
      },
      function (database) {
        that.initStore(database,
          function () {
            if (typeof success === 'function') {
              success.call(context, database);
            }
          },
          function (err) {
            if (typeof error === 'function') {
              error.call(context, err);
            }
          },
          this
        );
      },
      function (err) {
        if (typeof error === 'function') {
          error.call(context, err);
        }
      },
      this);
  } else {
    console.log('==您的浏览器不支持本地数据库==');
  }
};
/**
 * 初始化数据库表
 * @param db
 * @param success
 * @param error
 */
IndexedDBX.prototype.initStore = function (database, success, error, context = this) {
  var tables = this.settings.dataBase.tables || [];
  try {
    for (var table of tables) {
      // 如果没有创建表,则创建表
      if (!database.objectStoreNames.contains(table.name)) {
        var store = database.createObjectStore(table.name, {keyPath: table.keyPath});
        // 创建索引
        for (var storeIndex of table.indexs) {
          store.createIndex(storeIndex.key + '-index', storeIndex.key, storeIndex.option || null);
        }
      }
    }
    if (typeof success === 'function') {
      success.call(context, database);
    }
  } catch (err) {
    if (typeof error === 'function') {
      error.call(context || this, err);
    }
  }
};

/**
 *
 * @param settings
 * @param success
 * @param error
 * @param context
 */
IndexedDBX.prototype.openDatabase = function (success, error, context = this) {
  //var context = context || this;
  var that = this;
  if (this.indexedDB) {
    try {
      var request = this.indexedDB.open(this.settings.dataBase.dbName, this.settings.dataBase.version);
      request.onsuccess = function (event) {
        if (typeof success === 'function') {
          success.call(context, event.target.result);
        }
      };
      request.onupgradeneeded = function (event) {
        var database = event.target.result;
        that.initStore(database,
          function () {
            //if (typeof success === 'function') {
            //  success.call(context, database);
            //}
          },
          function (err) {
            if (typeof error === 'function') {
              error.call(context, err);
            }
          },
          this
        );
      };
      request.onerror = function (event) {
        if (error && typeof error === 'function') {
          error.call(context, event);
        }
      };
    } catch (e) {
      if (typeof error === 'function') {
        error.call(context, e);
      }
    }
  } else {
    if (typeof error === 'function') {
      error.call(context, '您的浏览器不支持本地数据库');
    }
  }
};

/**
 * 创建事物,获取数据
 * @param storeName
 * @param mode
 * @return {IDBObjectStore}
 */
IndexedDBX.prototype.getStore = function (dataBase, storeName, mode) {
  var tx = dataBase.transaction(storeName, mode);
  return tx.objectStore(storeName);
};

/**
 * 新增,修改数据
 * @param storeName
 * @param data
 * @param success
 * @param error
 */
IndexedDBX.prototype.addOrUpdate = function (storeName, data, success, error, context = this) {
  //context = context || this;
  try {
    this.openDatabase(
      function (database) {
        var store = this.getStore(database, storeName, 'readwrite');
        if (Array.isArray(data)) {
          for (var item of data) {
            store.put(item);
          }
        } else if (data) {
          store.put(data);
        }
        if (typeof success === 'function') {
          success.call(context, store);
        }
      },
      function () {
        //console.log('addOrUpdate openDatabase err');
      },
      this
    );
  } catch (e) {
    if (typeof error === 'function') {
      error.call(context, e);
    }
  }
};

/**
 * 查询数据
 * @param storeName
 * @param condition, string:keyPath|object: 条件检索|function: 函数过滤
 * @param success
 * @param error
 */
IndexedDBX.prototype.get = function (storeName, params, success, error, context = this) {
  //params:keyPath condition, success, error, context = this
  this.openDatabase(
    function (database) {
      var store = this.getStore(database, storeName, 'readonly');
      var request;
      if (params.keyPath) {
        this.getBykeyPath(storeName, params.keyPath, success, error, context = this);
      } else {
        request = store.getAll();
        request.onsuccess = function (event) {
          var result = event.target.result;
          if (result && result.length > 0 && typeof params.condition === 'object') {
            if (typeof params.condition === 'function') {
              result = Array.prototype.filter.call(result, params.condition);
            } else {
              for (var key in params.condition) {
                result = this.matchedData(result, key, params.condition[key]);
              }
            }
          }
          if (typeof success === 'function') {
            success.call(context, result);
          }
        };
        request.onerror = function (evt) {
          if (typeof error === 'function') {
            error.call(context, evt);
          }
        };
      }
    },
    this
  );
};

/**
 * 查询数据
 * @param storeName
 * @param condition, string:keyPath|object: 条件检索|function: 函数过滤
 * @param success
 * @param error
 */
IndexedDBX.prototype.getBykeyPath = function (storeName, keyPath, success, error, context = this) {
  this.openDatabase(
    function (database) {
      var store = this.getStore(database, storeName, 'readonly');
      var request = store.get(keyPath);
      request.onsuccess = function (event) {
        var result = event.target.result;
        if (typeof success === 'function') {
          // 20230511提示：当前keyPath没有值的话，result会返回undefined，需要在使用的时候判断一下再取值
          success.call(context, result);
        }
      };
      request.onerror = function (evt) {
        if (typeof error === 'function') {
          error.call(context, evt);
        }
      };
    },
    this
  );
};

/**
 * 清空表
 */
IndexedDBX.prototype.clear = function (storeName, success, error, context = this) {
  this.openDatabase(
    function (database) {
      var store = this.getStore(database, storeName, 'readwrite');
      var result = store.clear();
      result.onsuccess = function (event) {
        if (typeof success === 'function') {
          success.call(context, event.target.result);
        }
      };
      result.onerror = function (event) {
        if (typeof error === 'function') {
          error.call(context, event.target.result);
        }
      };
    },
    this
  );

};
/**
 * 根据关键字匹配
 * @param arr 支持一维数组和树形数据
 * @param prop 匹配的字段
 * @param keyword 搜索的关键字，使用通配符规则区分左匹配，右匹配和全匹配规则，通配符为星号（*）
 * @param isExact 是否精确匹配，默认true, left,right
 * @return {Array, treeDataArray}
 */
IndexedDBX.prototype.matchedData = function (arr, prop, keyword, isExact = true) {
  var matched = [];
  if (!arr || arr.length <= 0) {
    return matched;
  }
  var regExp;
  // 如果搜索关键字含有匹配符，左右位置匹配全模糊，开始位置左模糊，结束位置右模糊，
  if (/^\*|\*$/.test(keyword)) {
    isExact = /^\*.*\*$/.test(keyword) ? false : /^\*/.test(keyword) ? 'left' : 'right';
    keyword = keyword.replace(/^\*|\*$/g, ''); // 清除左右*号
  }
  if (isExact === 'left') {
    regExp = new RegExp(keyword + '$', 'i');
  } else if (isExact === 'right') {
    regExp = new RegExp('^' + keyword, 'i');
  } else {
    regExp = isExact ? new RegExp('^' + keyword + '$') : new RegExp(keyword, 'i');
  }
  arr.forEach(function (item) {
    if (regExp.test(item[prop])) {
      // 匹配本级菜单
      matched.push(item);
    } else if (item.children && item.children.length > 0) {
      // 不匹配本级菜单，检查是否匹配子菜单
      var matchedChildren = this.matchedData(item.children, prop, keyword, isExact);
      if (matchedChildren.length > 0) {
        item.children = matchedChildren;
        matched.push(item);
      }
    }
  });
  return matched;
};

/**
 * 插入数据
 * @param storeName 表名
 * @param data
 * @param success
 * @param error
 * @param context
 */
IndexedDBX.prototype.setTableRow = function (storeName, data, success, error, context) {
  this.openDatabase(
    function (database) {
      var store = this.getStore(database, storeName, 'readwrite');
      try {
        if (Array.isArray(data)) {
          for (var item of data) {
            store.put(item);
          }
        } else if (data) {
          store.put(data);
        }
        if (typeof success === 'function') {
          success.call(context, store);
        }
      } catch (e) {
        console.log(e)
      }
    },
    function () {
    },
    this
  );
};

/**
 * 删除数据
 * @param storeName 表名
 * @param data
 * @param success
 * @param error
 * @param context
 */
IndexedDBX.prototype.delectTableRow = function (storeName, key, success, error, context) {
  this.openDatabase(
    function (database) {
      var store = this.getStore(database, storeName, 'readwrite');
      try {
        store.delete(key);
        if (typeof success === 'function') {
          success.call(context, store);
        }
      } catch (e) {
        console.log(e)
      }
    },
    function () {
    },
    this
  );
};
