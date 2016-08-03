require.config({
  baseUrl: '.',
  paths: {
      'global': '../../src/global',
      'xdk-loader': '../../src/xdk-loader',
      'q': '../../node_modules/q/q'
  }
});
define(function (require) {
  require('global');
  xdk.load('client:module1');
  //xdk.run('client:module1');
});
