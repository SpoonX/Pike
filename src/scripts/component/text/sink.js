define([
  'jquery',
  './plugin/link',
  'text!templates/component/text/anchor-popover.html',
  'jquery.hotkeys',
  'dropdown',
  'popover'
], function($, link, anchorPopoverTemplate) {

  var $anchorPopover = $(anchorPopoverTemplate);

  /**
   * The textElement kitchenSink.
   *
   * @param {jQuery|string|HTMLElement} $sink
   * @param {{}}                        [options]
   * @constructor
   *
   */
  function KitchenSink($sink, options) {

    var self = this;

    options = options || {};

    this.$sink = $sink;
    this.$activeCanvas = null;
    this.options = $.extend({
      hotKeys                   : {
        'ctrl+b meta+b'              : 'bold',
        'ctrl+i meta+i'              : 'italic',
        'ctrl+u meta+u'              : 'underline',
        'ctrl+shift+s meta+shift+s'  : 'strikethrough',
        'ctrl+z meta+z'              : 'undo',
        'ctrl+y meta+y meta+shift+z' : 'redo',
        'ctrl+l meta+l'              : 'justifyleft',
        'ctrl+r meta+r'              : 'justifyright',
        'ctrl+e meta+e'              : 'justifycenter',
        'ctrl+j meta+j'              : 'justifyfull',
        'shift+tab'                  : 'outdent',
        'tab'                        : 'indent'
      },
      sinkCommandsSelector      : 'a[data-command],button[data-command],input[type=button][data-command]',
      sinkCommandMethodSelector : 'a[data-method],button[data-method],input[type=button][data-method]',
      activeCommandClass        : 'btn-info'
    }, options);

    this.$commandControls = $sink.find(this.options.sinkCommandsSelector);
    this.$commandMethods = $sink.find(this.options.sinkCommandMethodSelector);

    // Font size, font family
    this.$sink.find('.dropdown-toggle').dropdown();

    this.updateSink = function(checkElement) {
      if (typeof checkElement === 'undefined') {
        checkElement = true;
      }

      if (!checkElement) {
        self.$commandControls.removeClass(self.options.activeCommandClass);
        return;
      }

      if (!self.activeFocus()) {
        return;
      }

      self.$commandControls.each(function() {
        var $element = $(this);

        $element.toggleClass(self.options.activeCommandClass, document.queryCommandState($element.data('command')));
      });

      self.$commandMethods.each(function() {

        var $commandElement = $(this)
          , commandMethod = $commandElement.data('method')
          , commandObject = self.commandMethods[commandMethod];


        if (commandMethod.search(/\./) > -1) {
          return;
        }

        $commandElement.toggleClass(self.options.activeCommandClass, commandObject.isActive());
      });


      Object.getOwnPropertyNames(self.commandMethods).forEach(function(commandMethod) {

        if (commandMethod.search(/\./)) {
          return;
        }

        var commandObject = self.commandMethods[commandMethod];

        commandObject.isActive();
      });
    };

    this.initialize();
  }

  /**
   * Public methods for KitchenSink
   */
  KitchenSink.prototype = {
    /**
     * Update sink method.
     */
    updateSink : null,

    // @todo Make this dynamic.
    commandMethods : {
      link : link
    },

    /**
     * Enable editing on a canvas.
     *
     * @param {jQuery|string|HTMLElement} $canvas
     * @param {boolean}                   [skipFocus]
     */
    enable : function($canvas, skipFocus) {

      if (!$canvas instanceof jQuery) {
        $canvas = $($canvas);
      }

      if (this.$activeCanvas && $canvas[0] === this.$activeCanvas[0]) {
        return null;
      }

      this.disable();

      this.$activeCanvas = $canvas.attr('contenteditable', true);

      $canvas.on('keyup mouseup', this.updateSink);

      this.setupAnchorPopover($canvas.find('a'));

      if (!skipFocus) {
        $canvas.focus();
      }

      this.updateSink();

      return true;
    },

    /**
     * Disable editing on a canvas.
     * @param {jQuery|string|HTMLElement} [$canvas]
     * @returns {boolean}
     */
    disable : function($canvas) {
      if (!this.active()) {
        return false;
      }

      if ($canvas && !$canvas instanceof jQuery) {
        $canvas = $($canvas);
      }

      if ($canvas && $canvas[0] !== this.$activeCanvas[0]) {
        return false;
      }

      this.$activeCanvas.off('keyup mouseup', this.updateSink);
      this.$activeCanvas.attr('contenteditable', false);

      var $anchors = this.$activeCanvas.find('a');

      $anchors.trigger('before.destroy');
      console.log('set to false 0');
      $anchors.data('popover-visible', false).popover('destroy');

      this.$activeCanvas = null;

      this.updateSink(false);

      return true;
    },

    setupAnchorPopover : function($anchor) {

      var self = this, onClickEdit, onClickUnlink;

      $anchor.each(function() {
        var $anchorElement = $(this)
          , $content = $anchorPopover.clone()
          , $edit = $content.filter('[data-action="edit"]')
          , $unlink = $content.filter('[data-action="unlink"]');

        $anchorElement.popover({
          placement : 'top',
          content   : $content,
          html      : true,
          container : 'body',
          trigger   : 'manual'
        });

        $anchorElement.data('bs.popover').tip().addClass('sx-ns');

        onClickEdit = function() {
          self.commandMethods.link.activate($anchorElement, self);
          console.log('set to false 1');
          $anchorElement.data('popover-visible', false).popover('hide');
        };

        onClickUnlink = function() {
          console.log('set to false 2');
          $anchorElement.data('popover-visible', false).popover('hide');
          self.commandMethods.link.deactivate($anchorElement);
        };

        $edit.on('click', onClickEdit);
        $unlink.on('click', onClickUnlink);
        $anchorElement.one('before.destroy', function() {
          $edit.off('click', onClickEdit);
          $edit.off('click', onClickUnlink);
        });
      });
    },

    /**
     * Returns if there is an active canvas.
     *
     * @returns {boolean}
     */
    active : function() {
      return null !== this.$activeCanvas;
    },

    activeFocus : function() {
      return this.active() && this.$activeCanvas[0] === document.activeElement;
    },

    /**
     * Initialize the sink.
     */
    initialize : function() {
      if (this.isInitialized()) {
        return;
      }

      this.bindCommands();
      this.bindHotkeys();
      this.bindCommandMethods();
      this.$sink.data('initialized', true);
    },

    /**
     * Destroy the sink!
     */
    destroy : function() {
      this.disable();
      this.$sink.trigger('destroy');
      this.$sink.data('initialized', false);
    },

    /**
     * Returns if the $sink has been initialized.
     *
     * @returns {boolean}
     */
    isInitialized : function() {
      return this.$sink.data('initialized');
    },

    /**
     * Execute a command on the $activeCanvas
     *
     * @param {string} rawCommand
     */
    executeCommand : function(rawCommand) {
      var commandParts, command, commandArguments, $node;

      commandParts = rawCommand.split(' ');
      command = commandParts.shift();
      commandArguments = commandParts.join(' ');

      document.execCommand(command, false, commandArguments);

      // @todo verify if this holds up. If any other component uses the style attribute this'll fail.
      if ('indent' === command) {
        this.$activeCanvas.find('blockquote').removeAttr('style');
      }

      this.updateSink();
    },

    bindCommandMethods : function() {
      var self = this, onClick;

      onClick = function(event) {
        event.preventDefault();

        var method = $(this).data('method');

        self.commandMethods[method].activate(null, self);

        self.updateSink();
      };

      this.$commandMethods.on('click', onClick);
      this.$sink.one('destroy', function() {
        self.$commandMethods.off('click', onClick);
      });
    },

    /**
     * Bind the commands in the $sink to execute when clicked.
     */
    bindCommands : function() {
      if (this.isInitialized()) {
        return;
      }

      var self, onClick;

      self = this;

      /**
       * Handle click on a command.
       */
      onClick = function(event) {

        event.preventDefault();

        var $control = $(this);

        self.executeCommand($control.data('command'));
      };

      this.$commandControls.on('click', onClick);
      this.$sink.one('destroy', function() {
        self.$commandControls.off('click', onClick);
      });
    },

    /**
     * Bind hotkeys for the commands.
     */
    bindHotkeys : function() {
      if (this.isInitialized()) {
        return;
      }

      var hotkeys, onKeyDown, onKeyUp, self, $document;

      self = this;
      hotkeys = this.options.hotKeys;
      $document = $(document);

      /**
       * onKeyDown listener for hotkeys.
       *
       * @param {Event} event
       */
      onKeyDown = function(event) {
        if (!self.activeFocus()) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        self.executeCommand(hotkeys[event.data]);
      };

      /**
       * onKeyUp listener for hotkeys.
       *
       * @param {Event} event
       */
      onKeyUp = function(event) {
        if (!self.activeFocus()) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
      };

      // Register event listeners for keys
      Object.getOwnPropertyNames(hotkeys).forEach(function(hotkey) {
        $document.on('keydown', null, hotkey, onKeyDown);
        $document.on('keyup', null, hotkey, onKeyUp);
      });

      // Allow calling destroy once to remove all listeners.
      this.$sink.one('destroy', function() {
        $document.off('keydown', onKeyDown);
        $document.off('keyup', onKeyUp);
      });
    }
  };

  return KitchenSink;
});
