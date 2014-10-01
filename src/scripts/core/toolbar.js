define(['jquery', 'text!templates/core/toolbar.html', 'jquery.bootstrap-growl'], function($, toolbarTemplate) {

  /**
   * Private variables.
   */
  var $toolbar = $(toolbarTemplate)
    , $sections = $toolbar.find('.sx-sections')
    , $body = $('body')
    , $brand = $toolbar.find('.navbar-brand')
    , sections = {}
    , $siteControlsContainer
    , $siteControls
    , $componentControlsContainer
    , $componentControls;

  function preparePage() {
    var possibilities = ['[style*="position:fixed"],[style*="position: fixed"]']
      , searchFor = /\bposition:\s*fixed;/
      , cssProp = 'position'
      , cssValue = 'fixed'
      , styles = document.styleSheets
      , matches = []
      , rules, rule, element, height, i, j, l;

    for (i = 0; i < styles.length; i++) {
      rules = styles[i].cssRules;
      if (!rules) {
        continue;
      }
      l = rules.length;
      for (j = 0; j < l; j++) {
        rule = rules[j];
        if (searchFor.test(rule.cssText)) {
          possibilities.push(rule.selectorText);
        }
      }
    }
    possibilities = possibilities.join(',');
    possibilities = document.querySelectorAll(possibilities);
    l = possibilities.length;

    for (i = 0; i < l; i++) {
      element = possibilities[i];
      if (window.getComputedStyle(element, null).getPropertyValue(cssProp) === cssValue) {
        matches.push(element);
      }
    }

    height = $toolbar.find('nav:first-child').outerHeight();

    // Set default growl position
    $.bootstrapGrowl.default_options.offset.amount = height + 20;
    $.bootstrapGrowl.default_options.allow_dismiss = false;

    // Shift found static elements down so they do not interfere with the toolbar
    matches.forEach(function(element) {
      $(element).css('top', '+=' + height);
    });

    $body.wrapInner('<div id="sx-page"/>').css({marginTop : '+=' + height, position : 'relative'});

    $toolbar.prependTo($body);
  }

  /**
   * The toolbar class.
   *
   * @constructor
   */
  function Toolbar() {
    // Setup the page
    preparePage();

    // Prepare caches.
    this.updateControls();
  }

  Toolbar.prototype = {
    /**
     * Show a section in the toolbar.
     *
     * @param {string} name The name of the section
     *
     * @returns {jQuery|undefined} The section or undefined if none exists.
     */
    activate: function(name) {

      if (!sections[name]) {
        return;
      }

      sections[name].show();

      $brand.hide();
      this.hideSiteControls();
      this.showComponentControls();

      return sections[name];
    },

    hideComponentControls: function() {
      $componentControlsContainer.hide();
    },

    showComponentControls: function() {
      $componentControlsContainer.show();
    },

    hideSiteControls: function() {
      $siteControlsContainer.hide();
    },

    showSiteControls: function() {
      $siteControlsContainer.show();
    },

    /**
     * Get all site controls.
     *
     * @returns {jQuery}
     */
    getSiteControls: function() {
      return $siteControls;
    },

    /**
     * Get a site control.
     *
     * @returns {jQuery}
     */
    getSiteControl: function(control) {
      return $siteControls.filter('[data-control="'+control+'"]');
    },

    /**
     * Get all component controls.
     *
     * @returns {jQuery}
     */
    getComponentControls: function() {
      return $componentControls;
    },

    /**
     * Get a component control.
     *
     * @returns {jQuery}
     */
    getComponentControl: function(control) {
      return $componentControls.filter('[data-control="'+control+'"]');
    },

    /**
     * Hide a section in the toolbar.
     *
     * @param {string} name The name of the section
     *
     * @returns {jQuery} The section
     */
    deactivate: function(name) {
      sections[name].hide();

      $brand.show();
      this.showSiteControls();
      this.hideComponentControls();

      return sections[name];
    },

    /**
     * Check if toolbar has this section registered.
     *
     * @param {string} name
     * @returns {boolean}
     */
    has: function(name) {
      return typeof sections[name] !== 'undefined';
    },

    updateSiteControls : function() {
      $siteControlsContainer = $toolbar.find('.sx-site-controls');
      $siteControls = $siteControlsContainer.find('[data-control]');
    },

    updateComponentControls : function() {
      $componentControlsContainer = $toolbar.find('.sx-component-controls');
      $componentControls = $componentControlsContainer.find('[data-control]');

      return this;
    },

    updateControls : function() {
      this.updateComponentControls();
      this.updateSiteControls();
    },

    /**
     *
     * @param {string} name     The name of the section
     * @param {jQuery} $section The section
     */
    addSection: function(name, $section) {
      sections[name] = $section;

      $section.addClass('sx-section');

      $sections.append($section);

      this.updateControls();
    }
  };

  return new Toolbar();
});
