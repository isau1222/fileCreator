module.exports = {

  jsonOk: function error(req, res, data, details, opts) {
    // "Default" the opts
    opts = Object.assign({
      status: 200,
      message: 'OK',
    }, opts);

    // Form payload
    var payload = {
      message: opts.message,
    };

    if (data !== undefined) payload.data = data;
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

  jsonError: function (req, res, message, data, details, opts) {
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
      message = opts.defaultMessage; // @NOTE: confidential
    }
    else {
      if (!message) message = opts.defaultMessage;
      error = new Error(message);
    }

    // Override the inferred error with explicit one, if it's present
    if (details !== undefined && details.$error !== undefined) {
      error = details.$error;
    }

    // Log error
    opts.log(error);

    // Form payload
    var payload = {
      message: message,
    };

    if (data !== undefined) payload.data = data;
    if (details !== undefined) {
      if (details.signals !== undefined) payload.signals = details.signals;
      if (sails.config.environment !== 'production' || sails.config.keepResponseErrors === true) {
        if (details.$context !== undefined) payload.$context = details.$context;
        payload.$error = error; // @FIXME: serialize?
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
