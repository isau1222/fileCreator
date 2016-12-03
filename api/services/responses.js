var serializeError = require('serialize-error');

module.exports = {

  jsonOk: function error(req, res, result, details, opts) {
    // "Default" the opts
    opts = Object.assign({
      status: 200,
      message: 'OK',
    }, opts);

    // Form payload
    var payload = {
      message: opts.message,
    };

    if (result !== undefined) payload.result = result;
    if (details !== undefined) {
      if (details.signals !== undefined) payload.signals = details.signals;
      if (sails.config.environment !== 'production' || sails.config.keepResponseErrors === true) {
        if (details.$context !== undefined) payload.$context = details.$context;
      }
    }

    // Send response
    res.status(opts.status);
    res.jsonx(payload);
  },

  jsonError: function (req, res, message, result, details, opts) {
    // "Default" the opts
    opts = Object.assign({
      status: 500,
      message: 'Server Error',
      log: logError,
    }, opts);

    // Infer proper error and message
    var error;
    if (message instanceof Error) {
      error = message;
      message = opts.message; // @NOTE: confidential
    }
    else {
      if (!message) message = opts.message;
      error = new Error(message);
    }

    // Add inferred error if no explicit one was given
    if (details === undefined) details = {};
    if (details.$error === undefined) {
      details.$error = error;
    }

    // Log error
    opts.log(error);

    // Form payload
    var payload = {
      message: message,
    };

    if (result !== undefined) payload.result = result;
    if (details !== undefined) {
      if (details.signals !== undefined) payload.signals = details.signals;
      if (sails.config.environment !== 'production' || sails.config.keepResponseErrors === true) {
        if (details.$context !== undefined) payload.$context = details.$context;
        if (details.$error !== undefined) payload.$error = serializeError(details.$error);
      }
    }

    // Send response
    res.status(opts.status);
    res.jsonx(payload);
  },

};

function logError(err) {
  sails.log.error(err); // @FIXME: proper
}
