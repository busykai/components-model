define(['xdk-loader'], function (loader) {

  /* hack to get a ref to a global object */
  var Fn = Function,
      global = (new Fn("return this"))();

  if (!global.xdk) {
    global.xdk = {};
  }

  global.xdk.load = loader.load;

});
