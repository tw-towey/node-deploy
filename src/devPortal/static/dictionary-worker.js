var dictionary = {
  config: {},
  versions: [],
  preLoads: [],
  lazyLoads: [],
  currentLoads: [], // 当前正在加载列表
  worker: null,
  vue: null,
  db: null,
  init (data, workerInstance, vue) {
    var that = this;
    this.worker = workerInstance;
    this.vue = vue;
    Object.assign(this.config, data);
    dictionary.getDictConfig(data, function (res) {
      if (res.opFlag) {
        Object.assign(that.config, res.serviceResult);
        bundingDataWorker({name: 'config'}, that.config);
        that.db = new IndexedDBX(that.config);
        that.db.initDatabase(
          function () {
            that.initVersions(that.config, function (versions) {
              that.versions = versions;
              that.loadPreLoads(); // 加载预加载数据
            });
          },
          function (err) {
            console.log('===initDatabase err===', err);
          },
          that
        );
      }
    });
  },
  initVersions (config, callback) {
    this.db.get('versions',
      {},
      function (versions) {
        if (typeof callback === 'function') {
          callback(versions);
        }
      },
      function (err) {
        console.log('获取版本失败', err);
      },
      this
    );
  },
  /**
   * 加载预加载数据
   */
  loadPreLoads () {
    this.loadDictionarys(this.config.preLoads, 'pre-loading');
  },
  /**
   * 加载懒加载数据
   */
  loadLazyLoads () {
    this.loadDictionarys(this.config.lazyLoads, 'lazy-loading');
  },
  loadDictionarys (loads, type) {
    this.currentLoads = [];
    for (var item in  loads) {
      var loader = loads[item];
      this.currentLoads.push(loader.name);
      this.loadDictionary(loader, type);
    }
  },
  loadDictionary (loader, type) {
    if (this.isCurrentVersion(loader)) {
      this.db.get(loader.tableName,
        {},
        function (result) {
          if (result && result.length > 0) {
            this.dataCompleted(loader, type, result);
          } else {
            this.updateDictData(loader, type, true);
          }
        },
        function (err) {
          console.log('===[worker]:loadDictionarys error===', loader, err);
        },
        this
      );
    } else {
      this.updateDictData(loader, type, true);
    }
  },
  /**
   * 获取字典配置
   */
  getDictConfig (data, callBack) {
    ajax({
      type: 'GET',
      url: data.basePath + data.url,
      data: {
        t: new Date().getTime()
      },
      success: function (e) {
        var result = JSON.parse(e);
        if (typeof callBack === 'function') {
          callBack.call(this, result);
        }
      },
      error: function (err) {
        // woker 自动抛出异常，无需处理
        throw err
        //loadDataError({name: 'dictConfig'}, err);
      },
      context: this
    });
  },
  /**
   * 加载数据
   * @param preLoad
   */
  loadDictData: function (preLoad, callBack, context) {
    context = context || this;
    var source = preLoad.source;
    var service = Object.assign({}, source.service);
    var basePath = this.config.basePath;
    if (service && service.module === 'cdn') {
      service.url = /^http[s]?:\/\//.test(service.url) ? service.url : basePath + service.url;
      service.method = 'GET';
    }
    ajax({
      type: service.method,
      url: service.url,
      data: {
        v: preLoad.version
      },
      success: function (res) {
        if (typeof callBack === 'function') {
          callBack.call(this, JSON.parse(res));
        }
      },
      error: function (err) {
        console.log('loadDictData error', err);
        loadDataError(preLoad, err.toString());
      },
      context: context
    });
  },

  /**
   * 更新缓存数据
   * @param preLoad
   */
  updateDictData (loader, type, isNewVersion = false) {
    var that = this;
    this.loadDictData(loader, function (res) {
      that.dataCompleted(loader, type, res.serviceResult);
      that.saveOrUpdateData(loader, res.serviceResult, isNewVersion);
    });
  },
  /**
   * 保存数据或更新数据到
   * @param options
   * @param data
   */
  saveOrUpdateData (currentLoad, data, isNewVersion) {
    if (isNewVersion) {
      this.db.clear(currentLoad.tableName,
        function () {
          this.db.addOrUpdate(currentLoad.tableName, data,
            function () {
              // 更新版本
              this.db.addOrUpdate('versions',
                {name: currentLoad.tableName, version: currentLoad.version},
                function () {
                },
                function (err) {
                  console.log('更新版本失败', err);
                },
                this
              );
            },
            function (err) {
              console.log('===更新数据失败===', err);
            },
            this
          );
        },
        function (err) {
          console.log('===清除数据失败===', err);
        },
        this
      );
    }
  },
  /**
   * 获取已保存数据的版本
   * @param tableName
   * @return {{}}
   */
  getSavedVersion (tableName) {
    var matchedVersions = this.db.matchedData(this.versions, 'name', tableName);
    return matchedVersions.length > 0 ? matchedVersions[0] : {};
  },
  /**
   * 检查是否为当前版本
   * @param preLoad
   * @return {boolean}
   */
  isCurrentVersion (preLoad) {
    var version = this.getSavedVersion(preLoad.tableName);
    if (preLoad.version === version.version) {
      return true;
    }
    return false;
  },
  /**
   * 当前加载完成
   * @param loader
   */
  currentLoadDone (loader) {
    for (var i in this.currentLoads) {
      if (this.currentLoads[i] === loader.name) {
        this.currentLoads.splice(i, 1);
        return;
      }
    }
  },
  /**
   * 当前加载队列是否加载完成
   * @return {boolean}
   */
  isCurrentLoadsAllDone () {
    return this.currentLoads.length > 0 ? false : true;
  },

  /**
   * 加载数据完成，绑定数据，判断是否加载完成
   * @param loader
   * @param type
   * @param data
   */
  dataCompleted (loader, type, data) {
    var that = this;
    bundingDataWorker(loader, data);
    this.currentLoadDone(loader);
    if (this.isCurrentLoadsAllDone()) {
      loadingDoneWorker(type);
      if (type === 'pre-loading') {
        that.loadLazyLoads();
      }
    }
  },
  getCache(_self, {code, sn}) {
    // iframe打开子项目的时候，CFG.isCommonDataPreLoadingInitialized会直接被置成true，这样不会走initWebWorker()的时序
    // 所以判断下webworker线程里有没有indexDB实例
    let key = code;
    if(this.db) {
      this.db.getBykeyPath('caches', key,
        function (res) {
          _self.postMessage({command: 'load-cache', data: {
            sn,
            data: res && res.data ? res.data : null
          }});
        },
        function () {
          _self.postMessage({command: 'load-cache', data: {
              sn,
              data: null
            }});
        },
        this
      );
    } else {
      console.log('在iframe内，indexDB未准备好...');
      _self.postMessage({command: 'load-cache', data: {
          sn,
          data: null
        }});
    }
  },
  /**
   * 设置缓存
   * @param cache
   */
  setCache(cache) {
    // 同getCache说明
    if (this.db) {
      this.db.setTableRow('caches', cache,
        function () {
        },
        function () {
          console.error('设置缓存失败')
        },
        this
      );
    }
  },
  /**
   * 删除缓存
   * @param storeName 表名
   */
  delectCache(key) {
    // 同getCache说明
    if (this.db) {
      this.db.delectTableRow('caches', key,
        function () {
          console.log('删除缓存成功')
        },
        function () {
          console.error('删除缓存失败')
        },
        this
      );
    }
  },
  /**
   * 清除缓存
   * @param storeName 表名
   */
  clearCache() {
    // 同getCache说明
    if (this.db) {
      this.db.clear('caches',
        function () {
        },
        function () {
          console.error('设置缓存失败')
        },
        this
      );
    }
  }
};
