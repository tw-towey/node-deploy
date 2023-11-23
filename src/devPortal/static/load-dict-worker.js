importScripts('./ajax-worker.js', './indexed-dbx-worker.js', './dictionary-worker.js');

this.addEventListener('message', function (e) {
    var data = e.data;
    switch (data.command) {
      case 'start':
        dictionary.init(data, this);
        break;
      case 'delectCache':
        dictionary.delectCache(data.key);
        break;
      case 'getCache':
        dictionary.getCache(this, data.data);
        break;
      case 'setCache':
        dictionary.setCache({
          code: data.data.code,
          data: data.data.data
        });
        break;
      case 'clearCache':
        dictionary.clearCache();
        break;
      default:
        break;
    }
  },
  false
);
this.postMessage({command: 'ready'});
function bundingDataWorker (preLoad, data) {
  this.postMessage({
    command: 'bunding-data',
    context: preLoad,
    data: data
  });
}

function loadDataError (loader, data) {
  this.postMessage({
    command: 'load-data-error',
    context: loader,
    data: data
  });
}

function preLoadingDone () {
  this.postMessage({
    command: 'pre-loading-done'
  });
}

function lazyLoadingDone () {
  this.postMessage({
    command: 'lazy-loading-done'
  });
}

function loadingAllDone () {
  this.postMessage({
    command: 'loading-all-done'
  });
}

function loadingDoneWorker (type) {
  switch (type) {
    case 'pre-loading':
      preLoadingDone();
      break;
    case 'lazy-loading':
      lazyLoadingDone();
    default:
      loadingAllDone();
      break;
  }
}
