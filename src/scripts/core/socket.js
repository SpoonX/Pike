define(['core/sails.io', 'core/config'], function(io, config) {
  var host = config.endpoint || '127.0.0.1:1337';

  // This will connect.
  // Whatever gets returned gets stored, so we end up having just 1 socket connection (rather than 32).
  return io.connect(host);
});
