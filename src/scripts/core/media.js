define([
  'jquery',
  'core/socket',
  'core/config',
  './utilities/cookie',
  'text!templates/core/media/modal.html',
  'text!templates/core/media/item.html',
  'jquery.bootstrap-growl',
  'modal'
], function ($, socket, config, cookie, mediaTemplate, mediaItemTemplate) {
  var $mediaTemplate = $(mediaTemplate),
      $chosenFile,
      $modal,
      typeMap;

  typeMap = {
    'application/pdf': 'pdf',
    'image/png'      : 'image',
    'image/jpeg'     : 'image',
    'image/gif'      : 'image'
  };

  function renderPreview(file) {
    var $rendered;

    switch (file.mime_type) {
      case 'application/pdf':
        $rendered = $('<span class="fa fa-file-pdf-o"></span>');

        break;

      case 'image/png'  :
      case 'image/jpeg' :
      case 'image/gif'  :
        $rendered = $('<img />').attr('src', '/media/' + file.filename).addClass('img-circle');

        break;
      default:
        $rendered = $('<span class="fa fa-question-circle"></span>');

    }

    return $rendered;
  }

  // image/png, image/jpeg, image/gif

  function uploadFile(file, callback) {
    var formData = new FormData();

    formData.append('media', file, file.name);

    var xhr = new XMLHttpRequest();

    xhr.open('POST', config.endpoint + '/media/upload?token=' + cookie.read('sx_jwt'), true);

    xhr.onload = function () {
      var response;

      try {
        response = JSON.parse(xhr.responseText)
      } catch (error) {
        response = {error: 'json_error'};
      }

      console.log(response);

      callback(response);
    };

    xhr.send(formData);
  }

  function formatDate(string) {
    var date = new Date(string)
      , formatted = '';

    //Day
    formatted += datePadding(date.getDay() + 1) + '-';

    // Month
    formatted += datePadding(date.getMonth() + 1) + '-';

    // Year
    formatted += date.getFullYear() + ' om ';

    // Hours
    formatted += datePadding(date.getHours()) + ':';

    // Minutes
    formatted += datePadding(date.getMinutes());

    return formatted;
  }

  function datePadding(dateValue) {
    return ('0' + dateValue).substr(-2);
  }

  function populateMediaItems(callback) {

    // @todo cache this
    socket.get('/media', function (response) {
      if (response.error) {

        // Report errors.
        return callback();
      }

      response.forEach(function (mediaEntry) {
        var $preview = renderPreview(mediaEntry)
          , $item = $(mediaItemTemplate);

        mediaEntry.url = '/media/' + encodeURIComponent(mediaEntry.filename);

        $item.find('.preview').html($preview);
        $item.find('.filename').text(mediaEntry.filename);
        $item.find('.created-date').text(formatDate(mediaEntry.createdAt));
        $item.data('meta', mediaEntry);

        $mediaTemplate.find('.file-list').append($item);
      });

      return callback();
    });
  }

  return {
    selectFile: function (callback) {
      var uponDecision = callback;

      if ($modal) {
        return $modal.modal('show');
      }

      populateMediaItems(function() {
        var $uploadButton
          , $items;

        // Create the modal.
        $modal = $mediaTemplate.modal();

        $mediaTemplate.find('[data-result]').on('click', function() {

          var result = $(this).data('result');
          
          if (result && $chosenFile) {
            uponDecision($chosenFile.data('meta'));
          } else {
            uponDecision(null);
          }

          if ($chosenFile) {
            $chosenFile.removeClass('info');
            $chosenFile = null;
          }

          $modal.modal('hide');
        });

        $uploadButton = $modal.find('.upload-button .upload');
        $items = $mediaTemplate.find('.file-list tr');

        // Hook for upload
        $uploadButton.on('change', function (event) {
          var file = this.files[0];

          // Cancel
          if (!file) {
            return;
          }

          if (file.size > 10485760) {
            return $.bootstrapGrowl('Het gekozen bestand is te groot (max 10MB).', { type: 'danger' });
          }

          uploadFile(file, function (response) {
            if (response.error) {
              var message;

              switch (response.error) {
                case 'duplicate_file':
                  message = 'Er is al een bestand met deze naam.';
                  break;

                case 'file_too_large':
                  message = 'Het gekozen bestand is te groot (max 10MB).';
                  break;

                default:
                  message = 'Er is een onbekende fout opgetreden.';
              }

              return $.bootstrapGrowl(message, { type: 'danger' });
            }

            $.bootstrapGrowl('Het bestand is succesvol toegevoegd.', { type: 'success' });
          });
        });

        $items.on('click', function () {
          var $clickedTile = $(this);

          if ($chosenFile) {
            $chosenFile.removeClass('info');
          }

          if ($chosenFile && $clickedTile[0] === $chosenFile[0]) {
            $chosenFile = null;

            return;
          }

          $chosenFile = $clickedTile;
          $chosenFile.addClass('info');
        });
      });
    }
  };
});
