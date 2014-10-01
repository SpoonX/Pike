define([
  'jquery',
  'core/component-manager',
  'core/toolbar',
  'components',
  'tooltip',
  'button',
  'jquery.bootstrap-growl',
  'controls'
], function($, componentManager, toolbar, components) {

  var $components = components.getComponents();

  /**
   * Activate a component.
   */
  function activateComponent() {

    if (componentManager.hasActiveComponent()) {
      return;
    }

    var $component = $(this);

    if (!$component.data('editable')) {
      return;
    }

    if (!$component.data('sxComponent')) {
      $component.data('sxComponent', 'text');
    }

    componentManager.activate($component.data('sxComponent'), $component);
    toolbar.activate($component.data('sxComponent'));
  }

  /**
   * Call this method when done editing.
   */
  function doneEditing() {
    var $component = componentManager.getActiveComponent();

    if (!$component) {
      return;
    }

    toolbar.deactivate($component.data('sxComponent'));
    componentManager.deactivate($component.data('sxComponent'), $component);
  }

   function bindComponent($component) {
     components.updateComponents();
     components.toggleEditable(true);
     $component.on('dblclick', activateComponent);
   }

  // Expose these methods.
  return {
    gameOn : function() {
      $('<link rel="stylesheet" type="text/css" media="screen" />').attr('href', '//cdn.picnicx.com/styles/main.css').appendTo('head');

      toolbar.getComponentControl('done').on('click', doneEditing);

      componentManager.setBindComponent(bindComponent);

      $components.on('dblclick', activateComponent);

      $('.sx-tooltip').tooltip();
      $('.sx-button').button();
    }
  };
});
