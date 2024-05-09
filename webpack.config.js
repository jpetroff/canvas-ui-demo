/* eslint-disable */
const path = require('path')
const _ = require('underscore')
const webpack = require('webpack')

module.exports = (env, argv) => {
  const isProduction = !!(process.env.NODE_ENV == 'production')

  const sourceDir = './src'
  const outputDir = './dist'

  const config = {
    mode: process.env.NODE_ENV || 'production',
    context: __dirname,

    devtool: isProduction ? undefined : 'source-map',

    entry: { 
      app: path.join(__dirname, sourceDir, 'demo/js', 'index.tsx')
    },

    output: {
      compareBeforeEmit: false,
      path: path.resolve(__dirname, outputDir),
      filename: 'js/[name].js',
      chunkFilename: '[chunkhash].[ext].map',
      sourceMapFilename: '[file].map',
    },

    devServer: {
      static: {
        directory: path.resolve(__dirname, 'dist'),
      },
      port: 3000,
      open: false,
      hot: true,
      compress: false,
      historyApiFallback: true,
      client: {
        overlay: false,
        logging: 'error'
      }
    },

    resolve: {
      roots: [path.join(__dirname, sourceDir)],
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.less', '.html', '.json'],
      alias: {
        '@components': path.resolve(__dirname, 'src/components/'),
        '@pages': path.resolve(__dirname, 'src/demo/pages'),
        '@apps': path.resolve(__dirname, 'src/demo/apps'),
      }
    },
  
    module: {
      rules: [
        /* 
          SVG
        */
        {
          test: /\.svg$/,
          exclude: /(node_modules|favicon)/,
          loader: 'svg-react-loader',
        },

        /* 
          TS
         */
        {
          test: /\.ts(x?)$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                configFile: 'tsconfig.json'
              }
            }
          ]
        },

        /* 
          JSON 
        */
        {
          test: /\.json$/,
          loader: 'file-loader',
          type: 'javascript/auto',
          options: {
            outputPath: '/',
            esModule: false,
            emitFile: true,
            name: '[name].[ext]'
          }
        },

        /* 
          Asset loader
        */
        {
          test: /\.(woff2?|eot|gif|png|jpe?g|webmanifest|xml|svg|ico|mp4)$/,
          loader: 'file-loader',
          exclude: /assets\/svg/,
          options: {
            esModule: false,
            emitFile: true,
            name(resourcePath, resourceQuery) {
              const newPathBreakdown = path.dirname(resourcePath).split(path.sep)
              const prefixPath = _.rest(newPathBreakdown, _.indexOf(newPathBreakdown, path.basename(sourceDir)) + 1).join(path.sep)
              return `${prefixPath}/[name].[ext]`;
            }
          }
        },
  
        /* 
        TAILWIND
         */
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader', 'postcss-loader'],
        },


        /* 
        HTML
        */
        {
          test: /\.html$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                esModule: false,
                name: "[name].[ext]",
              }
            },
            {
              loader: 'extract-loader',
              options: {
                esModule: false,
                publicPath: path.join(__dirname, outputDir)
              }
            },
            {
                loader: "html-loader",
                options: {
                  esModule: false,
                  sources: false,
                  // preprocessor: (content, loaderContext) => {
                  //   // return content.replace(/{{process\.env\.APP_TARGET}}/ig, `${appTarget}`)
                  // },
                }
            }
          ]
        },
        
      ]
    }
  }
  return config;
}