define([
  'jquery',
  'component/text/main'
], function ($) {
  var $components = $('.sx-component');

  var components = {

    updateComponents: function () {
      $components = $('.sx-component');
    },

    addComponent: function ($component) {
      $components.add($component);
    },

    getComponents: function () {
      return $components;
    },

    toggleEditable: function (editable) {
      $components.toggleClass('sx-editable', editable);
      $components.data('editable', editable);
    },

    setEditable: function () {
      this.toggleEditable(true);
    },

    setNotEditable: function () {
      this.toggleEditable(false);
    }
  };

  components.setEditable();

  return components;
});
