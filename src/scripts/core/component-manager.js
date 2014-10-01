define([], function() {

  var componentRegistry = {}
    , $activeComponent = null
    , bindComponent;

  return {
    /**
     * Register a brand new component.
     *
     * @param {{name: string, activate: function, deactivate: function}} component
     */
    registerComponent : function(component) {
      componentRegistry[component.name] = component;
    },

    /**
     * Get the currently active component.
     *
     * @returns {jQuery}
     */
    getActiveComponent : function() {
      return $activeComponent;
    },

    /**
     * Returns if there is an active component
     *
     * @returns {boolean}
     */
    hasActiveComponent : function() {
      return !!$activeComponent;
    },

    /**
     * Deactivate a component.
     *
     * @param {string} name       The name of the component
     * @param {jQuery} $component The component $element
     *
     * @returns {boolean|jQuery}
     */
    deactivate : function(name, $component) {
      if (arguments.length === 0) {
        $component = $activeComponent;
        name = $component ? $component.data('sxComponent') : null;
      }

      if (null === $component) {
        return false;
      }

      $component.trigger('deactivate.pre');

      componentRegistry[name].deactivate($component);

      if ($component[0] === $activeComponent[0]) {
        $activeComponent = null;
      }

      $component.trigger('deactivate.post');

      return $component;
    },

    setBindComponent: function(bind) {
      bindComponent = bind;
    },

    attachComponent: function($component) {
      if (bindComponent) {
        bindComponent($component);
      }
    },

    /**
     * Activate a component
     *
     * @param {string} name       The name of the component
     * @param {jQuery} $component The component $element
     *
     * @returns {boolean|jQuery}
     */
    activate : function(name, $component) {
      if (null !== $activeComponent) {
        return false;
      }

      $component.trigger('activate.pre');

      componentRegistry[name].activate($component);

      $activeComponent = $component;

      $component.trigger('activate.post');

      return $component;
    },

    create : function(name, $scaffold, done) {
      var self = this;

      componentRegistry[name].create($scaffold, function($composed) {
        done($composed);
      });
    },

    /**
     * List all registered components.
     *
     * @returns {Array}
     */
    list : function() {
      return Object.getOwnPropertyNames(componentRegistry);
    },

    getRegisteredComponents : function() {
      return componentRegistry;
    }
  };
});
