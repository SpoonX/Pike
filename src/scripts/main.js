/**
 * @todo Create subdomain
 * @todo create functional login
 * @todo redirect to site (1 website = redirect)
 *
 */
require(['./require-config'], function () {
  require(['core/sx-edit', 'core/socket'], function(sxEdit, socket) {
    socket.on('connect', function () {
      sxEdit.gameOn();
    });
  });
});
