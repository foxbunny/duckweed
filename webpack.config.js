/**
 * (c) 2017 Hajime Yamasaki Vukelic
 * All rights reserved.
 */

const path = require("path");

const UglifyPlugin = require("uglifyjs-webpack-plugin");
const webpack = require("webpack");

module.exports = function (env) {
  const min = env && env.minify === "yes";

  return {
    devtool: "source-map",
    entry: "./src/index.ts",
    module: {
      rules: [
        {
          test: /.tsx?$/,
          use: [
            {
              loader: "ts-loader",
              options: {
                compilerOptions: {
                  declaration: false,
                },
              },
            },
            "tslint-loader",
          ],
        },
      ],
    },
    output: {
      filename: min ? "duckweed.min.js" : "duckweed.js",
      libraryTarget: "umd",
      library: "duckweed",
      path: path.resolve(__dirname, "dist"),
    },
    plugins: min ? [new UglifyPlugin({sourceMap: true})] : [],
    resolve: {
      extensions: [".ts", ".tsx", ".js"],
    },
  };
}
