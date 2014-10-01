define(['core/sails.io', 'module'], function(io, module) {
  var socketConfig = module.config(),
      host = socketConfig.host || '127.0.0.1:1337';

  // This will connect.
  // Whatever gets returned gets stored, so we end up having just 1 socket connection (rather than 32).
  return io.connect(host);
});
