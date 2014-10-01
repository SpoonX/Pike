/**
 * Small module of helper methods.
 */
define(['bootbox'], function(bootbox) {

  bootbox.setDefaults({
    locale : 'nl'
  });

  return {
    /**
     * @param options
     * @param type
     * @param callback
     * @returns {*}
     */
    create : function(options, type, callback) {
      if (typeof callback === 'undefined') {
        callback = type;
        type = 'confirm';
      }

      options.className = 'sx-ns';
      options.callback = callback;

      return bootbox[type](options);
    },

    hideAll: function() {
      bootbox.hideAll();
    },

    showAll: function() {
      $(".bootbox").modal('show');
    }
  };
});
