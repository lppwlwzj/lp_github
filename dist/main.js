(function(graph){
      function require(module){
          function localRequire(relativePath){
             
             return require( graph[module].dependencies[relativePath])
          }
          var exports={};
          (function(require,exports,code){
              eval(code)
          })(localRequire,exports,graph[module].code)
          
          return exports;
      }
      require('./src/index.js') //./src/index
  })({"./src/index.js":{"dependencies":{"./a":"./src/a.js","./b":"./src/b.js"},"code":"\"use strict\";\n\nvar _a = require(\"./a\");\n\nvar _b = _interopRequireDefault(require(\"./b\"));\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { \"default\": obj }; }\n\nconsole.log(\"hhhhh\");\nconsole.log((0, _a.add)(12, 1));"},"./src/a.js":{"dependencies":{},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.minus = exports.add = void 0;\n\nvar add = function add(a, b) {\n  console.log(a + b);\n};\n\nexports.add = add;\n\nvar minus = function minus(a, b) {\n  console.log(a - b);\n};\n\nexports.minus = minus;"},"./src/b.js":{"dependencies":{"./c":"./src/c.js"},"code":"\"use strict\";\n\nvar _c = _interopRequireDefault(require(\"./c\"));\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { \"default\": obj }; }\n\nconsole.log(\"xixixiixbb\");"},"./src/c.js":{"dependencies":{},"code":"\"use strict\";\n\nconsole.log(\"hhhhhhhhh\");"}})