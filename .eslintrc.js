const IS_PROD = process.env.NODE_ENV === 'production'
module.exports = {
    root: true,
    globals: {
    },
    env: {
        es6: true,
        commonjs: true,
        node: true,
        mocha: true,
    },
    extends: [
        'eslint:recommended',
    ],
    plugins: [
    ],
    parserOptions: {
        ecmaVersion: new Date().getFullYear() - 1,
        sourceType: 'module',
        ecmaFeatures: {
            modules: true,
        },
    },
    parser: '@typescript-eslint/parser',
    rules: {
        indent: [2, 4, { SwitchCase: 1 }], // 强制使用一致的缩进// case 子句将相对于 switch 语句缩进 4 个空格，即一个tab
        'linebreak-style': [2, 'unix'], // 强制使用一致的换行风格
        quotes: [2, 'single'], // 强制使用一致的反勾号、双引号或单引号double
        'quote-props': [2, 'as-needed', { keywords: false, numbers: true }], // 当没有严格要求时，禁止对象字面量属性名称使用引号
        semi: [2, 'never'], // 要求或禁止使用分号代替 ASI
        'prefer-arrow-callback': [2], // 要求回调函数使用箭头函数
        'no-shadow': 2, // 禁止变量声明与外层作用域的变量同名
        'no-unused-vars': 0, // 禁止出现未使用过的变量
        'no-console': 0, // 禁止console
        'object-shorthand': 2, // 要求或禁止对象字面量中方法和属性使用简写语法
        'prefer-template': 2, // 建议使用模板字面量而非字符串连接 (prefer-template)
        'no-empty': 0, // 禁止有空代码块
        'comma-spacing': [2, { before: false, after: true }], // 强制在逗号周围使用空格
        'brace-style': 2, // 大括号风格要求
        'block-spacing': [2, 'always'], // 禁止或强制在代码块中开括号前和闭括号后有空格
        'key-spacing': [2, { beforeColon: false, afterColon: true }], // 强制在对象字面量的键和值之间使用一致的空格
        'keyword-spacing': [2, { before: true, after: true }], // 强制关键字周围空格的一致性
        'arrow-spacing': [2, { before: true, after: true }], // 要求箭头函数的箭头之前或之后有空格
        'no-var': 2, // 要求使用 let 或 const 而不是 var
        'prefer-const': IS_PROD ? 2 : 0, // 建议使用const
        eqeqeq: 2, // 要求使用要求使用 === 和 !==
        'space-infix-ops': 2, // 要求操作符周围有空格
        'template-curly-spacing': [2, 'never'], // 强制模板字符串中空格的使用
        'comma-dangle': [2, 'always-multiline'], // 要求或禁止使用拖尾逗号
        'space-before-function-paren': 0, // 要求或禁止函数圆括号之前有一个空格
        'no-trailing-spaces': 0, // 禁用行尾空格
        'padded-blocks': 0, // 要求或禁止块内填充
        'dot-notation': 0, // 强制尽可能地使用点号
        'no-multi-spaces': [2, { ignoreEOLComments: true }], // 禁止出现多个空格
        'no-return-await': 2, // 禁用不必要的 return await
        'no-new-wrappers': 2, // 禁止原始包装实例
        'no-multiple-empty-lines': [2, { max: 2 }], // 不允许多个空行
        curly: [2, 'all'], // 要求遵循大括号约定
        'no-eval': [2], // 禁用 eval()
        'no-extend-native': [2, { exceptions: [] }], // 禁止扩展原生对象
        'no-redeclare': [2, { builtinGlobals: true }], // 禁止重新声明变量
        'no-return-assign': [2], // 禁止在返回语句中赋值
        'no-useless-return': IS_PROD ? 2 : 0, // 禁止多余的 return 语句
        'no-use-before-define': [0], // 禁止在变量定义之前使用它们
        'no-new-require': 2, // 禁止调用 require 时使用 new 操作符
        'no-path-concat': 2, // 禁止对 __dirname 和 __filename 进行字符串连接
        'no-mixed-requires': 2, // 禁止混合常规变量声明和 require 调用
        'no-buffer-constructor': 2, // 禁用 Buffer() 构造函数
        'func-style': [2, 'declaration', { allowArrowFunctions: true }], // 强制 function 声明或表达式的一致性
        'new-cap': 0, // 要求构造函数首字母大写
        'no-unneeded-ternary': [2], // 禁止可以在有更简单的可替代的表达式时使用三元操作符
        'operator-assignment': [2], // 要求或禁止尽可能地简化赋值操作
        'no-duplicate-imports': [2], // 禁止模块重复导入
        'no-useless-constructor': [2], // 禁用不必要的构造函数
        'spaced-comment': [2, 'always'], // 要求或禁止在注释前有空白
        "sort-imports": [0, {// import 排序
            "ignoreCase": false,
            "ignoreDeclarationSort": false,
            "ignoreMemberSort": false,
            "memberSyntaxSortOrder": ["none", "all", "single", "multiple"]
        }],
        'tno-prototype-builtins': [0],
    },
}
