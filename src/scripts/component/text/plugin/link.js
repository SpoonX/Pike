define([
  'jquery',
  'core/media',
  'text!templates/component/text/link-modal.html',
  'text!templates/component/text/anchor-popover.html',
  'popover'
], function ($, media, linkModalTemplate, anchorPopoverTemplate) {
  var $activeNode = null,
      $linkModal = $(linkModalTemplate),
      $anchorPopover = $(anchorPopoverTemplate),
      $linkedUrl = $linkModal.find('.linked-url'),
      $resultTargets = $linkModal.find('[data-result]'),
      $modal,
      $workingElement;

  /**
   * Get the node of the selection start
   */
  function getSelectionStartNode () {
    var node, selection;
    if (window.getSelection) { // FF3.6, Safari4, Chrome5 (DOM Standards)
      selection = getSelection();
      node = selection.anchorNode;
    }

    if (!node && document.selection) { // IE
      selection = document.selection;
      var range = selection.getRangeAt ? selection.getRangeAt(0) : selection.createRange();
      node = range.commonAncestorContainer ? range.commonAncestorContainer :
             range.parentElement ? range.parentElement() : range.item(0);
    }

    if (node) {
      return (node.nodeName == "#text" ? node.parentNode : node);
    }

    return false;
  }

  return {
    deactivate: function ($anchor) {
      $anchor = $anchor || $activeNode;

      if ($modal) {
        $modal.data('modal', null);
      }

      $anchor.contents().unwrap();
    },

    initialize: function () {
      var selection = window.getSelection(), range, clonedRange, span, $anchorWrapper;

      if (selection.rangeCount) {
        $anchorWrapper = $(document.createElement('a'));
        range = selection.getRangeAt(0);
        clonedRange = range.cloneRange();
        span = document.createElement('span');

        span.appendChild(range.cloneContents());

        if (span.innerHTML === '') {
          return false;
        }

        clonedRange.surroundContents($anchorWrapper[0]);
        selection.removeAllRanges();
        selection.addRange(clonedRange);

        return $anchorWrapper;
      }

      return false;
    },

    activate: function ($element) {
      var isNew = false,
          self = this;

      $workingElement = $element || $activeNode;

      if (!$workingElement) {
        $workingElement = this.initialize();
        isNew = true;

        if (!$workingElement) {
          return;
        }
      }

      // Set input url val to href of anchor
      $linkedUrl.val($workingElement.attr('href'));

      if ($modal) {
        $modal.modal('show');

        return;
      }

      $modal = $linkModal.modal();

      $modal.find('.linked-url').focus();

      $modal.on('shown.bs.modal', function () {
        $modal.find('.linked-url').focus();
      });

      $linkModal.find('.open-media-modal').on('click', function () {
        media.selectFile(function (chosenFile) {
          if (!chosenFile) {
            return;
          }

          var location = window.location;

          $linkedUrl.val(location.protocol + '//' + location.host + chosenFile.url);
        });
      });

      function modalDismiss (result) {
        if (!result && isNew) {
          self.deactivate($workingElement);
        }

        if (!result) {
          return;
        }

        $workingElement.attr('href', $linkedUrl.val());

        if (isNew) {
          self.initAnchorPopover($workingElement);
        }

        $modal.off('hide.bs.modal'); // @todo test this
        $modal.modal('hide');
      }

      $modal.on('hide.bs.modal', function () {
        modalDismiss(false);
      });

      // Modal on hide, is always result false.
      // Modal on success, is always true.
      $resultTargets.on('click', function () {
        modalDismiss($(this).data('result'));
      });
    },

    initAnchorPopover: function ($anchor) {
      var $content = $anchorPopover.clone(),
          $edit = $content.filter('[data-action="edit"]'),
          $unlink = $content.filter('[data-action="unlink"]'),
          self = this,
          onClickEdit,
          onClickUnlink;

      $anchor.popover({
        placement: 'top',
        content  : $content,
        html     : true,
        container: 'body',
        trigger  : 'manual'
      });

      $anchor.data('bs.popover').tip().addClass('sx-ns');

      onClickEdit = function () {
        self.activate($anchor);
        $anchor.data('popover-visible', false).popover('hide');
      };

      onClickUnlink = function () {
        $anchor.data('popover-visible', false).popover('hide');
        self.deactivate($anchor);
      };

      $edit.on('click', onClickEdit);
      $unlink.on('click', onClickUnlink);
      $anchor.one('before.destroy', function () {
        $edit.off('click', onClickEdit);
        $edit.off('click', onClickUnlink);
      });
    },

    teardown: function ($canvas) {
      var $anchors = $canvas.find('a');

      $anchors.trigger('before.destroy');
      $anchors.data('popover-visible', false).popover('destroy');
    },

    prepare: function ($canvas) {
      var self = this;

      $canvas.find('a').each(function () {
        self.initAnchorPopover($(this));
      });
    },

    isActive: function () {

      // Get the node we're currently on.
      var $node = $(getSelectionStartNode());

      // If the current node is an anchor tag ...
      if ($node.is('a')) {

        if (!$node.data('bs.popover')) {
          // Not prepared yet, so probably just initialised. Skipping.
          return;
        }

        // First check if we already have an active node stored.
        if ($activeNode && $activeNode[0] !== $node[0]) {

          // And if so, remove it from sight.
          $activeNode.popover('hide');
          $activeNode.data('popover-visible', false);
        }

        // If the current node doesn't have an activated popover...
        if (!$node.data('popover-visible')) {

          // Activate it.
          $node.popover('show');
          $node.data('popover-visible', true);

          // And set it to be the active node, as a point of reference.
          $activeNode = $node;
        }

        // Now return true, because yes, the node is active.
        return true;
      }

      // If there's an active node...
      if (null !== $activeNode) {

        // Some other element was selected. Disable the active node's popover.
        $activeNode.data('popover-visible', false);
        $activeNode.popover('hide');

        // And remove the reference to the node.
        $activeNode = null;
      }

      return false;
    }
  };
});
