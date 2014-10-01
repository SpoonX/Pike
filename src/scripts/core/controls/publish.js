define([
  'jquery',
  'core/component-manager',
  'core/toolbar',
  'core/socket',
  'core/modal',
  'components',
  'jquery.bootstrap-growl'
], function($, componentManager, toolbar, socket, modal, components) {

  /**
   * @todo Support multiple content areas in publish.
   */
  var $contentAreas = $('.sx-content-area')
    , modals;

  modals = {
    verify_publish : {
      title   : 'Pagina publiceren',
      message : 'Weet je zeker dat je de pagina wilt publiceren? De momenteel gepubliceerde pagina zal overschreven worden.'
    }
  };

  function makeContentObject() {
    var contentObject = {};

    $contentAreas.toArray().forEach(function (element) {
      var $element = $(element);

      contentObject[$element.data('sxArea')] = $element
        .html()
        .replace(/^\s*|\s+$/g, '')
        .replace(/\scontenteditable=".*?"/, '');
    });

    return contentObject;
  }

  /**
   * Call this method when publish was clicked.
   */
  function publish() {
    var $control = $(this);

    $control.prop('disabled', true);

    modal.create(modals.verify_publish, function(result) {
      if (!result) {
        return $control.prop('disabled', false);
      }

      // Remove editable state for publish
      components.setNotEditable();

      return socket.put('/website/publish', {
        body : makeContentObject(),
        page : window.location.pathname
      }, function(data) {
        if (data.error) {
          $.bootstrapGrowl('Er is een fout opgetreden!', { type : 'danger' });
        } else {
          $.bootstrapGrowl('De pagina is gepubliceerd!', {type: 'success'});
        }

        console.log(data);

        // Set back editable state after publish
        components.setEditable();
        $control.prop('disabled', false);
      });
    });
  }

  toolbar.getSiteControl('publish').on('click', publish);
});
