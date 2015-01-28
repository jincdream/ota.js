var module = {};
module.mods = {};
module.w = {};
module.config = function(config){
  var base = config.baseUrl || './'
  this._alies = {}
  for(var n in config.alies){
    var alies = this._alies[n] = {}
    alies.src = base + config.alies[n]
    alies.callback = []
  }
}
module.define = function(name, fn) {
  var _module = this;
  var base = _module.mods['base']
  var requireOnce = function(name){
    return _module.mods[name].exports
  }
  if (!_module.mods[name]) {
    var o = _module.mods[name] = {};
    var e = _module.mods[name].exports = {};
  }else{
    var o = _module.mods[name]
    var e = _module.mods[name].exports
  }
  fn.apply(base ? base.exports : _module.w, [requireOnce,o, e]);
  _module.mods[name].loaded = !0
};
module.define('base', function(require,module, exports) {
  var _getClsE = function(searchClass, node, tag) {
    var classElements = [];
    var end = [];
    var ln = node.length;
    var j = 0;
    if (!ln) {
      var n = node || document;
      var t = tag || '*';
      var els = n.getElementsByTagName(t);
      var elsLen = els.length;
      var pattern = new RegExp("(^|\\s)" + searchClass + "(\\s|$)");
      var i = elsLen;
      while (--i >= 0) {
        pattern.test(els[i].className) ? classElements.push(els[i]) :
          void(0);
      }
      return classElements.reverse();
    } else {
      while (ln--) {
        end = end.concat(_getClsE(searchClass, node[j++], tag));
      }
      return end;
    }
  };
  var _sizzle = function(str,node) {
    var ids = str.split(/\s/);
    var regA = /#/;
    var regB = /\./;
    var ln = ids.length;
    var node = node || document;
    var i = 0;

    var select = function(n) {
      var ary = n.split(/\#|\./);
      var tag = !1;
      if (ary.length > 1) {
        tag = ary[0];
        name = ary[1];
      } else if (ary[0]) {
        name = ary[0];
      } else {
        name = n;
      }
      if (regA.test(n)) {
        node = document.getElementById(name);
      } else if (regB.test(n)) {
        node = _getClsE(name, node, tag);
      } else {
        node = node.getElementsByTagName(name);
      }
    }
    while (ln--) {
      select(ids[i++]);
    }
    return node;
  };
  var checkCss3 = (function(){
    var div = document.createElement('div')
    var style = div.style
    var regTrs = /^[webkit]*[Tt]ransition$/
    var n
    var trf = !0
    var css3 = {}
    for(n in style){
      // if(/^[webkit|ms]*[Tt]ransform$/.test(n)){
      //   trf = !0
      // }
      if(trf && regTrs.test(n)){
        trf = !1
        css3.trf = !0
      }
      if(!!~n.indexOf('transform')){
        css3.transform = 'transform'
        css3.b = ''
      }else if(!!~n.indexOf('webkitTransform')){
        css3.transform = 'webkitTransition'
        css3.b ='webkitT'
      }else if(!!~n.indexOf('msTransform')){
        css3.transform = 'msTransform'
        css3.b = 'msT'
      }
        // case !!(~n.indexOf('msTransform')):
    }
    return css3
  }())
  var loadEvent = checkCss3.trf ? 'onload' : 'onreadystatechange'
  // >ie9( server )will trigger second onreadystatechange event:
  // And script.readyState is loading || loaded
  var loadEnd = checkCss3.trf ? 0 : 1
  var _loadedScript = []
  var Core = {
    _merge: function(first, second) {
      var len = +second.length,
        j = 0,
        i = 0
      for (; j < len; j++) {
        first[i++] = second[j]
      }
      first.length = i
      return first
    },
    makeArray: function(elms) {
      this._merge(this, elms)
      return this;
    },
    splice: [].splice,
    global: module.w,
    each: (function() {
      var f = [].forEach
      if (!f) {
        return function(ary, cb) {
          var elm = this.elm
          if (!cb && elm) {
            cb = ary
            ary = elm
          }
          var ln = ary.length;
          var i = 0;
          while (ln--) {
            cb(ary[i], i++);
          }
        }
      } else {
        return function(ary, cb) {
          var elm = this.elm
          if (!cb && elm) {
            cb = ary
            ary = elm
          }
          f.call(ary, cb)
        }
      }
    })(),
    fastEach: function(ary, cb) {
      var elm = this.elm
      if (!cb && elm) {
        cb = ary
        ary = elm
      }
      var ln = ary.length
      while (ln--) {
        cb(ary[ln], ln)
      }
    },
    browser: (function(ua) {
      return {
        chrome: /chrome/.test(ua),
        safari: /safari/.test(ua),
        webkit: /applewebkit/.test(ua),
        ie6: !window.XMLHttpRequest,
        ltIe10: checkCss3.trf,
        ltIe9: checkCss3.transform
      };
    })(window.navigator.userAgent.toLowerCase()),
    extend: function(target, source) {
      for (var p in source) {
        if (source.hasOwnProperty(p)) {
          target[p] = source[p];
        }
      }
      return target;
    },
    toAry: function(elms, splice) {
      var newAry = [];
      elms = elms || this.elm
      Core.each(elms, function(el, i) {
        newAry[i] = el;
      });
      if (splice) newAry.splice(splice[0], splice[1]);
      return newAry;
    },
    checkTransform :!1 ,
    addStyle: function(cssTxt, id) {
      var styleElm = document.createElement('style')
      id = id || 'css-id-' + (+new Date)
      styleElm.id = id
      try{
        styleElm.innerHTML = cssTxt
      }catch(e){
        // <ie9
        styleElm.type = "text/css"
        styleElm.styleSheet.cssText = cssTxt
      }
      DomHandle.j('head')[0].appendChild(styleElm)
      return id
    },
    loadScript: function(src,next){
      if(!!~Core.indexOf(_loadedScript,src))return next && next(!1)
      var _script = document.createElement('script')
      var _loadEnd = loadEnd
      _loadedScript.push(src)
      _script.setAttribute('src',src)
      _script.id = 'js-id-' + (+new Date)
      document.body.appendChild(_script)
      _script[loadEvent] = function(){
        // console.log(_script.readyState)
        !(_loadEnd--) && next && next(src)
      }
      return _script.id
    },
    load: function(obj){
      Core.fastEach(obj,function(src,i){
        Core.loadScript(src)
      })
    },
    /*
     * jq:{
     *  dep: 'name',
     *  src: src,
     *  child:
     * }
     * */
    loader: function(scripts){
      // var first
      // var _name = ''
      // for(_name in scripts){
      //   var obj = scripts[_name]
      //   if(obj.dep){
      //     obj
      //   }
      // }
    },
    isAry: function(obj) {
      var toS = {}.toString
      return toS.call(obj) === "[object Array]"
    },
    indexOf: (function() {
      if ([].indexOf) {
        return function(ary, x) {
          return [].indexOf.call(ary, x)
        }
      } else {
        return function(ary, x) {
          var n = -1
          Core.fastEach(ary, function(v, i) {
            if (v === x){
              n = i
              return
            }
          })
          return n
        }
      }
    })()
  };
  var DomHandle = {
    j: (function() {
      var $;
      var _$ = document.querySelector;
      var _$s = document.querySelectorAll;
      if (_$) {
        _sizzle = null
        return function(el, splice) {
          var elm;
          if (/#/.test(el) && !/\s/.test(el)) $ = _$;
          else $ = _$s;
          elm = $.call(document, el);
          if ($ === _$s) return Core.toAry(elm, splice);
          return elm;
        };
      } else {
        return _sizzle;
      }
    })(),
    _checkArg: function(arg, name) {
      if (!name) {
        [].unshift.call(arg, this.elm)
      }
      return arg
    },
    _classHandle: function(elm, className, fn) {
      var ary = []
      var arg = this._checkArg([elm, className], className)
      elm = arg[0]
      className = arg[1]
      var reg = new RegExp(className);
      Core.isAry(elm) ? ary = elm : ary = [elm]
      Core.fastEach(ary, function(el, i) {
        var classes = el.className.split(' ')
        fn(reg, el, classes, className)
        el.className = classes.join(' ');
      })
    },
    addClass: function(elm, className) {
      this._classHandle(elm, className, function(reg, el, classes,className) {
        if (!reg.test(el.className)) {
          classes.push(className)
        }
      })
    },
    removeClass: function(elm, className) {
      this._classHandle(elm, className, function(reg, el, classes,className) {
        var index = Core.indexOf(classes, className)
        if (!index || !~index) return;
        classes.splice(index, 1)
      })
    },
    on: (function() {
      //cant support array
      if (document.addEventListener) {
        return function(elm, type, fn) {
          var arg = this._checkArg(arguments, fn)
          elm = arg[0]
          type = arg[1],
            fn = arg[2]
          elm.addEventListener(type, fn, false);
        };
      } else {
        return function(elm, type, fn) {
          var arg = this._checkArg(arguments, fn)
          elm = arg[0]
          type = arg[1],
            fn = arg[2]
          elm.attachEvent('on' + type, fn);
        };
      }
    })(),
    off: function(elm, type, fn) {
      var arg = this._checkArg(arguments, fn)
      elm = arg[0]
      type = arg[1],
        fn = arg[2]
      if (document.detachEvent) {
        elm.detachEvent('on' + type, fn);
      } else {
        elm.removeEventListener(type, fn, false);
      }
    },
    css3TransitionSupport : (function(){
      var div = document.createElement('div');
      var style = div.style;
      var webkit = !1;
      var ok = !1;
      var no = !0;
      var rz = '';
      for(var name in style){
        if(/^transition$/.test(name)){
          ok = !0;
          break;
        }else if(/^webkitTransition$/.test(name)){
          webkit = !0;
          break;
        }else{
          no = !1;
        }
      }
      rz = webkit ? 'webkit' : (ok ? ok : no);
      return rz;
    })()
  }

  var Nijc = module.exports = function(elmStr) {
    var obj
    if (elmStr instanceof Nijc) return elmStr;
    if (!(this instanceof Nijc)) {
      obj = new Nijc.prototype.init(elmStr)
    } else {
      obj = this
    }
    return obj
  }
  Core.extend(Nijc, Core)
  Core.extend(Nijc, DomHandle)
  Nijc.prototype = {
    constructor: Nijc,
    verson: 0.9,
    name: 'Nijc',
    length: 0
  }
  Core.extend(Nijc.prototype, Core)
  Core.extend(Nijc.prototype, DomHandle)
  Nijc.prototype.init = function(elmStr) {
    var elm = this.j(elmStr)
    if(!elm)return this
    var self = this
    if(elm.nodeType) elm = [elm]
    if(!Core.isAry(elm))elm = Core.toAry(elm)
    this.elm = elm
    this.length = elm.length
    this.makeArray(elm)
    return this
  }
  Nijc.prototype.init.prototype = Nijc.prototype
});


module.require = function(names, cb) {
  var self = this
  var mods = self.mods;
  var fn = [];
  var base = mods.base.exports;
  var len = names.length
  var src = ''
  base.each(names, function(name, i) {
    if(mods[name] && mods[name].loaded){
      fn[i] = mods[name].exports
      if(--len === 0)cb.apply(base, fn)
    }else{
      src = self._alies[name].src
      base.loadScript(src,function(src){
        fn[i] = mods[name].exports
        if(--len === 0)cb.apply(base, fn)
      })
    }
  });
};


module.define('ieBug', function(require,module, exports) {
  var each = this.fastEach;
  exports.png = function(els) {
    each(els, function(el, i) {
      var cStyle = els[i].currentStyle;
      var w = el.clientWidth;
      var h = el.clientHeight;
      var bg = cStyle.backgroundImage.replace(/url\(|\)/g, '');
      el.style.filter +='progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled=true, sizingMethod=scale, src=' + bg + ')';
      el.style.background = "url('fkie.jpg')";
      el.style.width = w + 'px';
      el.style.height = h + 'px';
    });
  }
});
module.define('animate',function(require,module,exports){
  var sto = window.setTimeout;

  function unit(val) {
    var aotu = val === 'auto';
    var u = aotu ? 'px' : '';
    var v = aotu ? 0 : (val + '').replace(/(\d+)(.*)/, function(a, v, _u) {
      u = _u;
      return v;
    });
    return [v, u];
  }
  var animate = module.exports = function(elm, name, value, time) {
    var style = null;
    var oVal = '';
    if (name !== 'scrollTop') {
      var syl = window.getComputedStyle ? getComputedStyle(elm) : elm.currentStyle;
      oVal = syl[name];
      style = elm.style;
    } else {
      style = elm;
      oVal = elm[name];
    }
    var _unit = unit(oVal);
    var start = +_unit[0];
    var u = _unit[1];
    var end = value;
    var css = name;
    var val = end - start;
    var fps = 21;
    var speed = val / time * fps;
    var timer = 0;
    var direction = val > 0 ? !0 : !1;

    function move() {
      start += speed;
      style[name] = start + u;
    }

    function moveA() {
      if (start < end - 10) {
        move();
        sto(moveA, fps);
      } else {
        clear();
      }
    }

    function moveB() {
      if (start > end - 10) {
        move();
        sto(moveB, fps);
      } else {
        clear();
      }
    }

    function clear() {
      style[name] = end + u;
      clearTimeout(timer);
    }
    if (direction) {
      sto(moveA, fps);
    } else {
      sto(moveB, fps);
    }
  }
})
