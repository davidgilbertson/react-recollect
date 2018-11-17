module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          // Proxy was introduced in these browser versions
          chrome: '58',
          edge: '12',
          firefox: '18',
          safari: '10',
          ios: '10',
        },
      },
    ],
    '@babel/preset-react',
  ],
  comments: false,
  minified: true,
};
