define([], function () {

return {
  name: 'module2',
  init: [
    ['client:module1'],
    function (m1) {
    }
  ]
}
});

