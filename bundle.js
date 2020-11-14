const options = require('./webpack.config.js')

const Webpack =  require('./lib/webpack.js')

new Webpack(options).run()