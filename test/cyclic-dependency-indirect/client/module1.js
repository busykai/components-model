define(function () {

return {

name: 'module1',

init: [ ['client:module2:soft'],
function init(m2) {
  return {
    api1: function () {
      return "some string";
    }
  };
}]

}
});
