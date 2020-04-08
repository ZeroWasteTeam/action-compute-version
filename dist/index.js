module.exports =
/******/ (function(modules, runtime) { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	__webpack_require__.ab = __dirname + "/";
/******/
/******/ 	// the startup function
/******/ 	function startup() {
/******/ 		// Load entry module and return exports
/******/ 		return __webpack_require__(104);
/******/ 	};
/******/
/******/ 	// run startup
/******/ 	return startup();
/******/ })
/************************************************************************/
/******/ ({

/***/ 104:
/***/ (function(__unusedmodule, __unusedexports, __webpack_require__) {


const fs = __webpack_require__(435)

console.log("Hello from action");


try {
  const data = fs.readFileSync('version.txt', 'utf8')
  console.log(data)
} catch (err) {
  console.error(err)
}

/***/ }),

/***/ 327:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

/**
 * @fileoverview Extend node util module
 * @author douzi <liaowei08@gmail.com> 
 */
var util = __webpack_require__(669);
var toString = Object.prototype.toString;
var isWindows = process.platform === 'win32';

function isObject(value) {
  return toString.call(value) === '[object Object]';
}

// And type check method: isFunction, isString, isNumber, isDate, isRegExp, isObject
['Function', 'String', 'Number', 'Date', 'RegExp'].forEach(function(item) {
  exports['is' + item]  = function(value) {
    return toString.call(value) === '[object ' + item + ']';
  };
});

/**
 * @description
 * Deep extend
 * @example
 * extend({ key: { k1: 'v1'} }, { key: { k2: 'v2' }, none: { k: 'v' } });
 * extend({ arr: [] }, { arr: [ {}, {} ] });
 */
function extend(target, source) {
  var value;

  for (var key in source) {
    value = source[key];

    if (Array.isArray(value)) {
      if (!Array.isArray(target[key])) {
        target[key] = [];
      }

      extend(target[key], value);
    } else if (isObject(value)) {
      if (!isObject(target[key])) {
        target[key]  = {};
      }

      extend(target[key], value);
    } else {
      target[key] = value;
    }
  }

  return target;
}

extend(exports, util);

// fixed util.isObject 
exports.isObject = isObject;

exports.extend = function() {
  var args = Array.prototype.slice.call(arguments, 0);
  var target = args.shift();

  args.forEach(function(item) {
    extend(target, item);
  });

  return target;
};

exports.isArray = Array.isArray;

exports.isUndefined = function(value) {
  return typeof value == 'undefined';
};

exports.noop = function() {};

exports.unique = function(array) {
  var result = [];

  array.forEach(function(item) {
    if (result.indexOf(item) == -1) {
      result.push(item);
    }
  });

  return result;
};

exports.escape = function(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

exports.unescape = function(value) {
  return String(value)
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
};

exports.hrtime = function(time) {
  if (time) {
    var spend = process.hrtime(time);
    
    spend = (spend[0] + spend[1] / 1e9) * 1000 + 'ms';

    return spend;
  } else {
    return process.hrtime();
  }
};

/**
 * @description
 * Return a copy of the object with list keys
 * @example
 * util.pick({ key: 'value' }, 'key', 'key1');
 * util.pick(obj, function(value, key, object) { });
 */
exports.pick = function(obj, iteratee) {
  var result = {};

  if (exports.isFunction(iteratee)) {
    for (var key in obj) {
      var value = obj[key];
      if (iteratee(value, key, obj)) {
        result[key] = value;
      }
    }
  } else {
    var keys = Array.prototype.slice.call(arguments, 1);

    keys.forEach(function(key) {
      if (key in obj) {
        result[key] = obj[key];
      }
    });
  }

  return result;
};

exports.path = {};

if (isWindows) {
  // Regex to split a windows path into three parts: [*, device, slash,
  // tail] windows-only
  var splitDeviceRe =
      /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/;

  exports.path.isAbsolute = function(filepath) {
    var result = splitDeviceRe.exec(filepath),
        device = result[1] || '',
        isUnc = !!device && device.charAt(1) !== ':';
    // UNC paths are always absolute
    return !!result[2] || isUnc;
  };

  // Normalize \\ paths to / paths.
  exports.path.unixifyPath = function(filepath) {
    return filepath.replace(/\\/g, '/');
  };

} else {
  exports.path.isAbsolute = function(filepath) {
    return filepath.charAt(0) === '/';
  };

  exports.path.unixifyPath = function(filepath) {
    return filepath;
  };
}

/***/ }),

/***/ 435:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

/**
 * @fileoverview Strengthen the ability of file system
 * @author wliao <wliao@Ctrip.com> 
 */
var fs = __webpack_require__(747);
var util = __webpack_require__(327);
var path = __webpack_require__(622);
var fileMatch = __webpack_require__(900);

function checkCbAndOpts(options, callback) {
  if (util.isFunction(options)) {
    return {
      options: null,
      callback: options
    };
  } else if (util.isObject(options)) {
    return {
      options: options,
      callback: callback
    };
  } else {
    return {
      options: null,
      callback: util.noop
    };
  }
}

function getExists(filepath) {
  var exists = fs.existsSync(filepath);

  if (exists) {
    return filepath;
  } else {
    return getExists(path.dirname(filepath));
  }
}

util.extend(exports, fs);

/**
 * @description
 * Assign node origin methods to fs
 */
exports.fs = fs;

exports.fileMatch = fileMatch;

/**
 * @description
 * Create dir, if dir exist, it will only invoke callback.
 *
 * @example
 * ```js
 *   fs.mkdir('1/2/3/4/5', 511);
 *   fs.mkdir('path/2/3', function() {});
 * ```
 */
exports.mkdir = function(filepath, mode, callback) {
  var root = getExists(filepath);
  var children  = path.relative(root, filepath);

  if (util.isFunction(mode)) {
    callback = mode;
    mode = null;
  }

  if (!util.isFunction(callback)) {
    callback = util.noop;
  }

  mode = mode || 511;

  if (!children) return callback();

  children = children.split(path.sep);

  function create(filepath) {
    if (create.count === children.length) {
      return callback();
    }

    filepath = path.join(filepath, children[create.count]);

    fs.mkdir(filepath, mode, function(err) {
      create.count++;
      create(filepath);
    });
  }

  create.count = 0;
  create(root);
};

/**
 * @description
 * Same as mkdir, but it is synchronous
 */
exports.mkdirSync = function(filepath, mode) {
  var root = getExists(filepath);
  var children  = path.relative(root, filepath);

  if (!children) return;

  children = children.split(path.sep);

  children.forEach(function(item) {
    root = path.join(root, item);
    fs.mkdirSync(root, mode);
  });
};

/**
 * @description 
 * Create file, if path don't exists, it will not throw error.
 * And will mkdir for path, it is asynchronous
 * 
 * @example
 * ```js
 *   fs.writeFile('path/filename.txt', 'something')
 *   fs.writeFile('path/filename.txt', 'something', {})
 * ```
 */
exports.writeFile = function(filename, data, options, callback) {
  var result = checkCbAndOpts(options, callback);
  var dirname = path.dirname(filename);
  options = result.options;
  callback = result.callback;

  // Create dir first
  exports.mkdir(dirname, function() {
    fs.writeFile(filename, data, options, callback);
  });
};

/**
 * @description
 * Same as writeFile, but it is synchronous
 */
exports.writeFileSync = function(filename, data, options) {
  var dirname = path.dirname(filename);

  exports.mkdirSync(dirname);
  fs.writeFileSync(filename, data, options);
};

/**
 * @description
 * Asynchronously copy a file
 * @example
 * file.copyFile('demo.txt', 'demo.dest.txt', { done: function(err) { }})
 */
exports.copyFile = function(srcpath, destpath, options) {
  options = util.extend({
    encoding: 'utf8',
    done: util.noop
  }, options || {});

  if (!options.process) {
    options.encoding = null;
  }

  fs.readFile(srcpath, {
    encoding: options.encoding
  }, function(err, contents) {
    if (err) return options.done(err);

    if (options.process) {
      contents = options.process(contents);
    }

    exports.writeFile(destpath, contents, options, options.done);
  });
};

/**
 * @description
 * Copy file to dest, if no process options, it will only copy file to dest
 * @example
 * file.copyFileSync('demo.txt', 'demo.dest.txt' { process: function(contents) { }});
 * file.copyFileSync('demo.png', 'dest.png');
 */
exports.copyFileSync = function(srcpath, destpath, options) {
  options = util.extend({
    encoding: 'utf8' 
  }, options || {});
  var contents;

  if (options.process) {
    contents = fs.readFileSync(srcpath, options);
    contents = options.process(contents, srcpath, options.relative);

    if (util.isObject(contents) && contents.filepath) {
      destpath = contents.filepath;
      contents = contents.contents;
    }

    exports.writeFileSync(destpath, contents, options);    
  } else {
    contents = fs.readFileSync(srcpath);
    exports.writeFileSync(destpath, contents);
  }
};

/**
 * @description
 * Recurse into a directory, executing callback for each file and folder
 * if the filename is undefiend, the callback is for folder, otherwise for file.
 * and it is asynchronous
 * @example
 * file.recurse('path', function(filepath, filename) { });
 * file.recurse('path', ['*.js', 'path/**\/*.html'], function(filepath, relative, filename) { });
 */
exports.recurse = function(dirpath, filter, callback) {
  if (util.isFunction(filter)) {
    callback = filter;
    filter = null;
  }
  var filterCb = fileMatch(filter);
  var rootpath = dirpath;

  function recurse(dirpath) {
    fs.readdir(dirpath, function(err, files) {
      if (err) return callback(err);

      files.forEach(function(filename) {
        var filepath = path.join(dirpath, filename);

        fs.stat(filepath, function(err, stats) {
            var relative = path.relative(rootpath, filepath);
            var flag = filterCb(relative);

            if (stats.isDirectory()) {
              recurse(filepath);
              if (flag) callback(filepath, relative);
            } else {
              if (flag) callback(filepath, relative, filename);
            }
          });
        });
    });
  }

  recurse(dirpath);
};

/**
 * @description
 * Same as recurse, but it is synchronous
 * @example
 * file.recurseSync('path', function(filepath, filename) {});
 * file.recurseSync('path', ['*.js', 'path/**\/*.html'], function(filepath, relative, filename) {});
 */
exports.recurseSync = function(dirpath, filter, callback) {
  if (util.isFunction(filter)) {
    callback = filter;
    filter = null;
  }
  var filterCb = fileMatch(filter);
  var rootpath = dirpath;

  function recurse(dirpath) {
    fs.readdirSync(dirpath).forEach(function(filename) {
      var filepath = path.join(dirpath, filename);
      var stats = fs.statSync(filepath);
      var relative = path.relative(rootpath, filepath);
      var flag = filterCb(relative);

      if (stats.isDirectory()) {
        recurse(filepath);
        if (flag) callback(filepath, relative);
      } else {
        if (flag) callback(filepath, relative, filename);
      }
    });
  }

  recurse(dirpath);
};

/**
 * @description
 * Remove folder and files in folder, but it's synchronous
 * @example
 * file.rmdirSync('path');
 */
exports.rmdirSync = function(dirpath) {
  exports.recurseSync(dirpath, function(filepath, relative, filename) {
    // it is file, otherwise it's folder
    if (filename) {
      fs.unlinkSync(filepath);
    } else {
      fs.rmdirSync(filepath);
    }
  });

  fs.rmdirSync(dirpath);
};

/**
 * @description
 * Copy dirpath to destpath, pass process callback for each file hanlder
 * if you want to change the dest filepath, process callback return { contents: '', filepath: ''}
 * otherwise only change contents
 * @example
 * file.copySync('path', 'dest');
 * file.copySync('src', 'dest/src');
 * file.copySync('path', 'dest', { process: function(contents, filepath) {} });
 * file.copySync('path', 'dest', { process: function(contents, filepath) {} }, noProcess: ['']);
 */
exports.copySync = function(dirpath, destpath, options) {
  options = util.extend({
    encoding: 'utf8',
    filter: null,
    noProcess: ''
  }, options || {});
  var noProcessCb = fileMatch(options.noProcess);

  // Make sure dest root
  exports.mkdirSync(destpath);
  exports.recurseSync(dirpath, options.filter, function(filepath, relative, filename) {
    if (!filename) return;
    var newpath = path.join(destpath, relative);
    var opts = {
      relative: relative
    };

    if (options.process && !noProcessCb(relative)) {
      opts.encoding = options.encoding;
      opts.process = options.process;
    }

    exports.copyFileSync(filepath, newpath, opts);
  });
};

/***/ }),

/***/ 622:
/***/ (function(module) {

module.exports = require("path");

/***/ }),

/***/ 669:
/***/ (function(module) {

module.exports = require("util");

/***/ }),

/***/ 747:
/***/ (function(module) {

module.exports = require("fs");

/***/ }),

/***/ 900:
/***/ (function(module, __unusedexports, __webpack_require__) {

var util = __webpack_require__(327);
/**
 * @description
 * @example
 * `**\/*` match all files
 * `*.js`  only match current dir files
 * '**\/*.js' match all js files
 * 'path/*.js' match js files in path
 * '!*.js' exclude js files 
 */
function fileMatch(filter, ignore) {
  if (filter === null) {
    return function() {
      return true;
    };
  } else if (filter === '' || (util.isArray(filter) && !filter.length)) {
    return function() {
      return false;
    };
  }

  if (util.isString(filter)) {
    filter = [filter];
  }

  var match = [];
  var negate = [];
  var isIgnore = ignore ? 'i' : '';

  filter.forEach(function(item) {
    var isNegate = item.indexOf('!') === 0;
    item = item
      .replace(/^!/, '')
      .replace(/\*(?![\/*])/, '[^/]*?')
      .replace('**\/', '([^/]+\/)*')
      .replace(/\{([^\}]+)\}/g, function($1, $2) {
        var collection = $2.split(',');
        var length = collection.length;
        var result = '(?:';

        collection.forEach(function(item, index) {
          result += '(' + item.trim() + ')';

          if (index + 1 !== length) {
            result += '|';
          }
        });

        result += ')';

        return result;
      })
      .replace(/([\/\.])/g, '\\$1');

    item = '(^' + item + '$)';

    if (isNegate) {
      negate.push(item);
    } else {
      match.push(item);
    }
  });

  match = match.length ?  new RegExp(match.join('|'), isIgnore) : null;
  negate = negate.length ? new RegExp(negate.join('|'), isIgnore) : null;

  return function(filepath) {
    // Normalize \\ paths to / paths.
    filepath = util.path.unixifyPath(filepath);

    if (negate && negate.test(filepath)) {
      return false;
    }

    if (match && match.test(filepath)) {
      return true;
    }

    return false;
  };
}

module.exports = fileMatch;

/***/ })

/******/ });