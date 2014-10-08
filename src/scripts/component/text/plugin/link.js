define([
  'jquery',
  'core/media',
  'text!templates/component/text/link-modal.html'
], function ($, media, linkModalTemplate) {
  var $activeNode = null
    , $linkModal = $(linkModalTemplate)
    , $linkedUrl = $linkModal.find('.linked-url')
    , $resultTargets = $linkModal.find('[data-result]')
    , $modal
    , $workingElement;

  /**
   * Get the node of the selection start
   */
  function getSelectionStartNode() {
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
    deactivate : function ($anchor) {
      $anchor = $anchor || $activeNode;

      if ($modal) {
        $model.data('modal', null);
      }

      $anchor.contents().unwrap();
    },

    initialize : function () {
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

    activate   : function ($element) {
      var isNew = false
        , self = this;

      $workingElement = $element || $activeNode;

      if (!$workingElement) {
        $workingElement = this.initialize();
        isNew = true;

        if (!$workingElement) {
          return;
        }
      }

      $linkedUrl.val($workingElement.attr('href'));

      if ($modal) {
        $modal.modal('show');

        return;
      }

      $modal = $linkModal.modal();

      $linkModal.find('.choose-media').on('click', function() {
        media.selectFile(function(chosenFile) {
          if (!chosenFile) {
            return;
          }

          var location = window.location;

          $linkedUrl.val(location.protocol + '//' + location.host + chosenFile.url);
        });
      });

      $resultTargets.on('click', function() {

        var result = $(this).data('result');

        if (!result && isNew) {
          self.deactivate($workingElement);
        }

        if (result) {
          $workingElement.attr('href', $linkedUrl.val());

          if (isNew) {
            console.log('Called.', $workingElement);
          }

          $modal.modal('hide');
        }
      });
    },

    // @todo Follow up: Trail ends in modal destruction. Probably not (un)setting popover visibility or something similar.
    isActive   : function () {
      var $node = $(getSelectionStartNode());

      console.log('----');

      console.log('a');

      if ($node.is('a')) {
        console.log('b');
        if ($activeNode && $activeNode[0] !== $node[0]) {
          console.log('c');
          $activeNode.popover('hide');
          $activeNode.data('popover-visible', false);
        }
        console.log('d');
        if (!$node.data('popover-visible')) {
          console.log('e');
          $node.popover('show');
          $node.data('popover-visible', true);

          $activeNode = $node;
        }
        console.log('f');
        return true;
      }
      console.log('g');
      if (null !== $activeNode) {
        console.log('h');
        $activeNode.data('popover-visible', false);
        $activeNode.popover('hide');

        $activeNode = null;
      }
      console.log('i');

      return false;
    }
  };
});
