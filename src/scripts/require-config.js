requirejs.config({
  config : {
    'core/socket' : {
      host: 'api.picnicx.com'
    }
  },
  paths: {
    'core'                  : './core',
    'components'            : './component/main',
    'controls'              : './core/controls/main',
    'templates'             : '../templates',
    'io'                    : './core/socket.io',
    'jquery'                : '../vendor/jquery/dist/jquery',
    'jquery.hotkeys'        : '../vendor/jquery.hotkeys/jquery.hotkeys',
    'require'               : '../vendor/requirejs-jquery/parts/require',
    'text'                  : '../vendor/requirejs-text/text',
    'bootbox'               : '../vendor/bootbox/bootbox',
    'jquery.bootstrap-growl': '../vendor/bootstrap-growl/jquery.bootstrap-growl',
    'sortable'              : '../vendor/html.sortable/dist/html.sortable',
    'button'                : '../vendor/bootstrap/js/button',
    'dropdown'              : '../vendor/bootstrap/js/dropdown',
    'alert'                 : '../vendor/bootstrap/js/alert',
    'modal'                 : '../vendor/bootstrap/js/modal',
    'popover'               : '../vendor/bootstrap/js/popover',
    'tooltip'               : '../vendor/bootstrap/js/tooltip'
  },
  shim : {
    'jquery.hotkeys'        : ['jquery'],
    'alert'                 : ['jquery'],
    'sortable'              : ['jquery'],
    'modal'                 : ['jquery'],
    'tooltip'               : ['jquery'],
    'button'                : ['jquery'],
    'popover'               : ['jquery', 'tooltip'],
    'bootbox'               : ['jquery', 'modal'],
    'jquery.bootstrap-growl': ['jquery', 'alert'],
    'dropdown'              : ['jquery'],
    'core/sails.io'         : ['io']
  }
});
