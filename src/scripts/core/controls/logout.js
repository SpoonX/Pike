define(['core/modal', 'core/socket', 'core/toolbar', 'core/utilities/cookie'], function(modal, socket, toolbar, cookie) {
  var modals;

  modals = {
    verify_logout  : {
      title   : 'Uitloggen',
      message : 'Weet je zeker dat je wilt uitloggen? Alle niet gepubliceerde aanpassingen zullen verloren gaan.'
    }
  };

  /**
   * Logout method.
   */
  function logout() {
    modal.create(modals.verify_logout, function(result) {
      if (!result) {
        return true; // Still close the modal
      }

      // @todo move this to session module.
      cookie.destroy('sx_jwt');

      window.location.reload(true);
    });
  }

  toolbar.getSiteControl('logout').on('click', logout);
});
