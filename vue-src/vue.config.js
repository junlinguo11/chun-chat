const path = require("path");

module.exports = {
    outputDir: path.resolve(__dirname, '../public'),
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