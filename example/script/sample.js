function _typeof(obj) {"@babel/helpers - typeof";if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {_typeof = function _typeof(obj) {return typeof obj;};} else {_typeof = function _typeof(obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};}return _typeof(obj);}function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {try {var info = gen[key](arg);var value = info.value;} catch (error) {reject(error);return;}if (info.done) {resolve(value);} else {Promise.resolve(value).then(_next, _throw);}}function _asyncToGenerator(fn) {return function () {var self = this,args = arguments;return new Promise(function (resolve, reject) {var gen = fn.apply(self, args);function _next(value) {asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);}function _throw(err) {asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);}_next(undefined);});};}function _createForOfIteratorHelper(o, allowArrayLike) {var it;if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {if (it) o = it;var i = 0;var F = function F() {};return { s: F, n: function n() {if (i >= o.length) return { done: true };return { done: false, value: o[i++] };}, e: function e(_e2) {throw _e2;}, f: F };}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}var normalCompletion = true,didErr = false,err;return { s: function s() {it = o[Symbol.iterator]();}, n: function n() {var step = it.next();normalCompletion = step.done;return step;}, e: function e(_e3) {didErr = true;err = _e3;}, f: function f() {try {if (!normalCompletion && it["return"] != null) it["return"]();} finally {if (didErr) throw err;}} };}function _slicedToArray(arr, i) {return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();}function _nonIterableRest() {throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}function _unsupportedIterableToArray(o, minLen) {if (!o) return;if (typeof o === "string") return _arrayLikeToArray(o, minLen);var n = Object.prototype.toString.call(o).slice(8, -1);if (n === "Object" && o.constructor) n = o.constructor.name;if (n === "Map" || n === "Set") return Array.from(o);if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);}function _arrayLikeToArray(arr, len) {if (len == null || len > arr.length) len = arr.length;for (var i = 0, arr2 = new Array(len); i < len; i++) {arr2[i] = arr[i];}return arr2;}function _iterableToArrayLimit(arr, i) {if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;var _arr = [];var _n = true;var _d = false;var _e = undefined;try {for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i["return"] != null) _i["return"]();} finally {if (_d) throw _e;}}return _arr;}function _arrayWithHoles(arr) {if (Array.isArray(arr)) return arr;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function");}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });if (superClass) _setPrototypeOf(subClass, superClass);}function _setPrototypeOf(o, p) {_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {o.__proto__ = p;return o;};return _setPrototypeOf(o, p);}function _createSuper(Derived) {var hasNativeReflectConstruct = _isNativeReflectConstruct();return function _createSuperInternal() {var Super = _getPrototypeOf(Derived),result;if (hasNativeReflectConstruct) {var NewTarget = _getPrototypeOf(this).constructor;result = Reflect.construct(Super, arguments, NewTarget);} else {result = Super.apply(this, arguments);}return _possibleConstructorReturn(this, result);};}function _possibleConstructorReturn(self, call) {if (call && (_typeof(call) === "object" || typeof call === "function")) {return call;}return _assertThisInitialized(self);}function _assertThisInitialized(self) {if (self === void 0) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return self;}function _isNativeReflectConstruct() {if (typeof Reflect === "undefined" || !Reflect.construct) return false;if (Reflect.construct.sham) return false;if (typeof Proxy === "function") return true;try {Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));return true;} catch (e) {return false;}}function _getPrototypeOf(o) {_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {return o.__proto__ || Object.getPrototypeOf(o);};return _getPrototypeOf(o);}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;}"use transpile";


!function () {var
  Parent = function () {
    function Parent(name) {_classCallCheck(this, Parent);
      this.name = name;
    }_createClass(Parent, [{ key: "method", value: function method()

      {
        console.log(this.name + ' is parent');
      } }]);return Parent;}();var


  Child = function (_Parent) {_inherits(Child, _Parent);var _super = _createSuper(Child);
    function Child(name) {_classCallCheck(this, Child);return _super.call(this,
      '[Child] ' + name);
    }_createClass(Child, [{ key: "method", value: function method()

      {
        console.log(this.name + ' is child');
      } }]);return Child;}(Parent);


  var parent = new Parent('hoge');
  var child = new Child('fuga');

  parent.method();
  child.method();
}();




!function () {
  var f = function f() {var v = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'arrow default';return v;};
  console.log(f());
  console.log(f('hoge'));
}();




!function () {var _hoge;
  var a = 'a';
  var b = "".concat(a, " and b");
  var hoge = (_hoge = {}, _defineProperty(_hoge, a, 'A'), _defineProperty(_hoge, "b", b), _hoge);
  console.log(hoge);
}();




!function () {
  var entries = [
  ['key1', 'value1'],
  ['key2', 'value2']];

  for (var _i = 0, _entries = entries; _i < _entries.length; _i++) {var _entries$_i = _slicedToArray(_entries[_i], 2),key = _entries$_i[0],value = _entries$_i[1];
    console.log(key, value);
  }
}();




!function () {var _marked = regeneratorRuntime.mark(
  generator);function generator() {var _len,args,_key,_i2,_args,arg,_args2 = arguments;return regeneratorRuntime.wrap(function generator$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:for (_len = _args2.length, args = new Array(_len), _key = 0; _key < _len; _key++) {args[_key] = _args2[_key];}_i2 = 0, _args =
            args;case 2:if (!(_i2 < _args.length)) {_context.next = 9;break;}arg = _args[_i2];_context.next = 6;
            return arg * 2;case 6:_i2++;_context.next = 2;break;case 9:case "end":return _context.stop();}}}, _marked);}var _iterator = _createForOfIteratorHelper(



  generator(1, 2, 3)),_step;try {for (_iterator.s(); !(_step = _iterator.n()).done;) {var arg2 = _step.value;
      console.log(arg2);
    }} catch (err) {_iterator.e(err);} finally {_iterator.f();}
}();




!_asyncToGenerator(regeneratorRuntime.mark(function _callee() {var response, text;return regeneratorRuntime.wrap(function _callee$(_context2) {while (1) {switch (_context2.prev = _context2.next) {case 0:_context2.next = 2;return (
            fetch('./'));case 2:response = _context2.sent;_context2.next = 5;return (
            response.text());case 5:text = _context2.sent;
          console.log(text.length);case 7:case "end":return _context2.stop();}}}, _callee);}))();



undefinedFunction(1, 2, 3);
//# sourceMappingURL=/map/script/sample.js.map