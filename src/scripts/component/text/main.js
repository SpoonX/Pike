define([
  'core/component-manager',
  'core/toolbar',
  'text!templates/component/text/section.html',
  './sink'
], function (componentManager, toolbar, sectionTemplate, KitchenSink) {

  var name = 'text'
    , $section = $(sectionTemplate)
    , sink = new KitchenSink($section);

  toolbar.addSection(name, $section);

  componentManager.registerComponent({
    name       : name,
    description: 'Voeg een tekst-blok toe en pas deze aan naar wens.',
    icon       : {
      font : 'file-text-o',
      color: '#9292DB'
    },

    // Not being used for now.
    create : function($scaffold, done) {
      $scaffold.append($('<p />').text('Bewerken..'));

      done($scaffold);
    },

    activate   : function ($component) {
      if (sink.enable($component)) {
        $component.addClass('active');

        $component.on('deactivate.post', function () {
          $component.removeClass('active');
        });
      }
    },

    deactivate: function ($component) {
      sink.disable($component);

      return $component;
    }
  });
});
