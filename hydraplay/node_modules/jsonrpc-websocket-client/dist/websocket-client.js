'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OPEN = exports.MESSAGE = exports.CONNECTING = exports.CLOSED = exports.AbortedConnection = exports.ConnectionError = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _eventToPromise = require('event-to-promise');

var _eventToPromise2 = _interopRequireDefault(_eventToPromise);

var _startsWith = require('lodash/startsWith');

var _startsWith2 = _interopRequireDefault(_startsWith);

var _isomorphicWs = require('isomorphic-ws');

var _isomorphicWs2 = _interopRequireDefault(_isomorphicWs);

var _promiseToolbox = require('promise-toolbox');

var _makeError = require('make-error');

var _events = require('events');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// ===================================================================

var delay = function delay(ms) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, ms);
  });
};

// ===================================================================

// This error is used to fail pending requests when the connection is
// closed.

var ConnectionError = exports.ConnectionError = function (_BaseError) {
  _inherits(ConnectionError, _BaseError);

  function ConnectionError() {
    _classCallCheck(this, ConnectionError);

    return _possibleConstructorReturn(this, (ConnectionError.__proto__ || Object.getPrototypeOf(ConnectionError)).apply(this, arguments));
  }

  return ConnectionError;
}(_makeError.BaseError);

var AbortedConnection = exports.AbortedConnection = function (_ConnectionError) {
  _inherits(AbortedConnection, _ConnectionError);

  function AbortedConnection() {
    _classCallCheck(this, AbortedConnection);

    return _possibleConstructorReturn(this, (AbortedConnection.__proto__ || Object.getPrototypeOf(AbortedConnection)).call(this, 'connection aborted'));
  }

  return AbortedConnection;
}(ConnectionError);

// -------------------------------------------------------------------

var CLOSED = exports.CLOSED = 'closed';
var CONNECTING = exports.CONNECTING = 'connecting';
var MESSAGE = exports.MESSAGE = 'message';
var OPEN = exports.OPEN = 'open';

// -------------------------------------------------------------------

var WebSocketClient = function (_EventEmitter) {
  _inherits(WebSocketClient, _EventEmitter);

  function WebSocketClient(url, protocols, opts) {
    _classCallCheck(this, WebSocketClient);

    var _this3 = _possibleConstructorReturn(this, (WebSocketClient.__proto__ || Object.getPrototypeOf(WebSocketClient)).call(this));

    if (opts && !(0, _startsWith2.default)(_this3._url, 'wss')) {
      // `rejectUnauthorized` cannot be used if the connection is not
      // `secure!
      delete opts.rejectUnauthorized;
    }

    _this3._opts = opts;
    _this3._protocols = protocols;
    _this3._url = url;

    _this3._protocol = null;
    _this3._socket = null;
    _this3._status = CLOSED;

    _this3._onClose = _this3._onClose.bind(_this3);
    return _this3;
  }

  _createClass(WebSocketClient, [{
    key: 'close',
    value: function close() {
      var _this4 = this;

      return (0, _promiseToolbox.attempt)(function () {
        var status = _this4._status;
        if (status === CLOSED) {
          return;
        }

        var socket = _this4._socket;
        if (status === CONNECTING) {
          socket.abort = true;
          socket.close();
          return;
        }

        var promise = (0, _eventToPromise2.default)(socket, 'close');
        socket.close();
        return promise;
      });
    }
  }, {
    key: 'open',
    value: function open(backoff) {
      var _this5 = this;

      if (!backoff) {
        return this._open();
      }

      var iterator = backoff[Symbol.iterator]();

      var cancelled = false;
      var cancel = function cancel() {
        cancelled = true;
      };

      var error_ = void 0;
      var attempt = function attempt() {
        if (cancelled) {
          throw error_;
        }

        return _this5._open().catch(function (error) {
          var current = void 0;

          if (error instanceof AbortedConnection || (current = iterator.next()).done) {
            throw error;
          }

          var _current = current,
              value = _current.value;

          _this5.emit('scheduledAttempt', {
            cancel: cancel,
            delay: value
          });

          error_ = error;
          return delay(current.value).then(attempt);
        });
      };

      var promise = attempt();
      promise.cancel = cancel;

      return promise;
    }
  }, {
    key: 'send',
    value: function send(data) {
      this._assertStatus(OPEN);

      this._socket.send(data);
    }
  }, {
    key: '_assertNotStatus',
    value: function _assertNotStatus(notExpected) {
      if (this._status === notExpected) {
        throw new ConnectionError('invalid status ' + this._status);
      }
    }
  }, {
    key: '_assertStatus',
    value: function _assertStatus(expected) {
      if (this._status !== expected) {
        throw new ConnectionError('invalid status ' + this._status + ', expected ' + expected);
      }
    }
  }, {
    key: '_onClose',
    value: function _onClose() {
      var previous = this._status;

      this._socket = null;
      this._status = CLOSED;

      if (previous === OPEN) {
        this.emit(CLOSED);
      }
    }
  }, {
    key: '_open',
    value: function _open() {
      var _this6 = this;

      return (0, _promiseToolbox.attempt)(function () {
        _this6._assertStatus(CLOSED);
        _this6._status = CONNECTING;

        var socket = _this6._socket = new _isomorphicWs2.default(_this6._url, _this6._protocols, _this6._opts);

        return _eventToPromise2.default.multi(socket, ['open'], ['close', 'error']).then(function () {
          socket.addEventListener('close', _this6._onClose);

          socket.addEventListener('error', function (error) {
            _this6.emit('error', error);
          });

          socket.addEventListener('message', function (_ref) {
            var data = _ref.data;

            _this6.emit(MESSAGE, data);
          });

          _this6._status = OPEN;
          _this6.emit(OPEN);
        }, function (args) {
          _this6._onClose();

          if (socket.abort) {
            throw new AbortedConnection();
          }

          throw new ConnectionError(args[0].message);
        });
      });
    }
  }, {
    key: 'protocol',
    get: function get() {
      return this._protocol;
    }
  }, {
    key: 'status',
    get: function get() {
      return this._status;
    }
  }]);

  return WebSocketClient;
}(_events.EventEmitter);

exports.default = WebSocketClient;
//# sourceMappingURL=websocket-client.js.map