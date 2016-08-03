define(function () {

  return {
    name: 'module1',

    init: [
      ['client:module2:soft', 'client:module3', 'client:module4'],
      function init(m2, m3, m4) {
        return {
          api1: function () {
            return "some string";
          }
        };
      }
    ]
  };

});
