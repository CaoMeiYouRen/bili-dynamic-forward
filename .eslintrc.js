const IS_PROD = process.env.NODE_ENV === 'production'
module.exports = {
    root: true,
    globals: {
    },
    extends: [
        'cmyr'
    ],
    plugins: [
    ],
    rules: {
        'no-console': 0, // 禁止console
        'no-sync': 0,
        'no-empty': 0,
        'no-unused-vars': 0
    },
}
