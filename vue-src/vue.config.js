// vue.config.js
module.exports = {
    devServer: {
        proxy: {
            '/': {
                ws: false,
                target: 'http://localhost:3000/',
                changeOrigin: true,
            },
        },
    },
}