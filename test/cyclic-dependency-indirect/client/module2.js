define([], function () {

return {
  name: 'module2',
  init: [
    ['client:module3'],
    function (m1) {
    }
  ]
}
});

