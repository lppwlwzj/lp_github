//执行node bundle.js

const fs = require("fs");
//@babel/parser，这是babel7 的⼯具，来帮助我们分析内部的语法，包括es6，返回⼀个ast抽象语法
// 树
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const path = require("path");
//编译 ：把代码处理成浏览器可运⾏的代码，需要借助@babel/core，和 @babel/preset-env，把ast语法树转
const { transformFromAst } = require("@babel/core");

module.exports = class Webpack {
  constructor(params) {
    const { entry, output } = params;
    this.output = output;
    this.entry = entry;
    //
    this.modules = [];
  }
  run() {
    const info = this.parse(this.entry);
    // console.log("Webpack -> run -> info", info)
    //入口的依赖
    this.modules.push(info);
    //入口依赖的依赖 开始扁平化
    for (let i = 0; i < this.modules.length; i++) {
      const item = this.modules[i];
      const { dependencies } = item;
      if (dependencies) {
        for (let j in dependencies) {
          this.modules.push(this.parse(dependencies[j])); //依赖扁平化
        }
      }
    }


    // console.log("Webpack -> run ->  this.modules", this.modules);
    /** 
     *     Webpack -> run ->  this.modules [
            {
              entryFile: './src/index.js',
              dependencies: { './a': './src/a.js', './b': './src/b.js' },
              code: '"use strict";\n' +
                '\n' +
                'var _a = _interopRequireDefault(require("./a"));\n' +
                '\n' +
                'var _b = _interopRequireDefault(require("./b"));\n' +
                '\n' +
                'function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }\n' +
                '\n' +
                'console.log("hhhhh");\n' +
                'console.log(_a["default"].add(12, 1));'
            },
            {
              entryFile: './src/a.js',
              dependencies: {},
              code: '"use strict";\n' +
                '\n' +
                'Object.defineProperty(exports, "__esModule", {\n' +
                '  value: true\n' +
                '});\n' +
                'exports.minus = exports.add = void 0;\n' +
                '\n' +
                'var add = function add(a, b) {\n' +
                '  console.log(a + b);\n' +
                '};\n' +
                '\n' +
                'exports.add = add;\n' +
                '\n' +
                'var minus = function minus(a, b) {\n' +
                '  console.log(a - b);\n' +
                '};\n' +
                '\n' +
                'exports.minus = minus;'
            },
            {
              entryFile: './src/b.js',
              dependencies: { './c': './src/c.js' },
              code: '"use strict";\n' +
                '\n' +
                'var _c = _interopRequireDefault(require("./c"));\n' +
                '\n' +
                'function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }\n' +
                '\n' +
                'console.log("xixixiixbb");'
            },
            { entryFile: './src/c.js', dependencies: {}, code: '"use strict";' }
          ]
    */

   const obj = {} 
   this.modules.forEach( item => {
     obj[item.entryFile] = {
       dependencies: item.dependencies,
       code: item.code
     }
   })
   console.log(obj)
   this.file(obj)
  }
  parse(entryFile) {
    console.log("Webpack -> parse -> entryFile", entryFile)
    //分析入口模块内容
    //读取到入口文件中的编码内容     content 为./src/index.js的编码内容
    const content = fs.readFileSync(entryFile, "utf-8");
    // console.log(content);
    //分析入口文件有哪些依赖 自己依赖路径
    //把内容通过parse抽象成语法树便于分析 提取
    const ast = parser.parse(content, {
      sourceType: "module", //es module语法
    });
    //  console.log(ast)
    //每一行代码都会有一个node节点解析
    //如果是import 语法 就是可以获取到 value 然后借助@babel/traverse处理 得到value
    // console.log(ast.program.body);
    // return
    //依赖模块的缓存数组
    const dependencies = {};
    traverse(ast, {
      //提取类型为ast.program.body打印出来的导入 ImportDeclaration 提取ImportDeclaration中的node
      ImportDeclaration({ node }) {
        //得到模块路径 这个路径不是最终 要./expo.js => ./src/expo.js
        // console.log(node.source.value);
        // console.log(path.dirname(entryFile));
        const sourceValue = node.source.value + '.js';
        const newPathName =
          "./" + path.join(path.dirname(entryFile), sourceValue);
        //当前文件所有依赖的模块
        dependencies[node.source.value] = newPathName.replace("\\", "/");
      },
    });
  
    //  处理内容  转换ast
    // 把代码处理成浏览器可运⾏的代码，需要借助@babel/core，和 @babel/preset-env，把ast语法树转换成合适的代码
    //返回一段可执行的代码 但是现在不能直接在浏览器执行
    const { code } = transformFromAst(ast, null, {
      presets: ["@babel/preset-env"],
    });
    // console.log(code);
    /**
           * "use strict";
      //浏览器不认识require
      var _a = _interopRequireDefault(require("./a"));

      function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

      console.log("hhhhh");
      console.log(_a["default"].add(12, 1));
          */
    return {
      entryFile,
      dependencies,
      code,
    };
  }
  //执行代码 自执行函数 实现require 
  file(code){
    // 生成bundle.js => ./dist/main.js
    const filePath = path.join(this.output.path,this.output.filename )
    //手动创建dist 目录
    const newCode = JSON.stringify(code)
    const bundle = `(function(graph){
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
      require('${this.entry}') //./src/index
  })(${newCode})`;
  // 执行node bundle.js 会在dist目录下生成main.js,里面的代码内容为newCode  也就上面的obj内容
    fs.writeFileSync(filePath,bundle,"utf-8")
  }
};
