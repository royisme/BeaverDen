const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    preload: './preload.ts'
  },
  output: {
    path: path.join(__dirname, './build'),
    filename: '[name].js'
  },
  target: 'electron-preload',
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader'
        }
      }
    ]
  }
};