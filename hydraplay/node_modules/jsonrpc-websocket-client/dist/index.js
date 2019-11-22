'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OPEN = exports.CONNECTING = exports.CLOSED = exports.AbortedConnection = exports.ConnectionError = exports.createBackoff = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _jsonRpcPeer = require('json-rpc-peer');

var _jsonRpcPeer2 = _interopRequireDefault(_jsonRpcPeer);

var _iterableBackoff = require('iterable-backoff');

var _parseUrl = require('./parse-url');

var _parseUrl2 = _interopRequireDefault(_parseUrl);

var _websocketClient = require('./websocket-client');

var _websocketClient2 = _interopRequireDefault(_websocketClient);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// ===================================================================

var createBackoff = exports.createBackoff = function createBackoff() {
  var tries = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 10;
  return (0, _iterableBackoff.fibonacci)().addNoise().toMs().take(tries);
};

exports.ConnectionError = _websocketClient.ConnectionError;
exports.AbortedConnection = _websocketClient.AbortedConnection;
exports.CLOSED = _websocketClient.CLOSED;
exports.CONNECTING = _websocketClient.CONNECTING;
exports.OPEN = _websocketClient.OPEN;

// -------------------------------------------------------------------

var JsonRpcWebSocketClient = function (_WebSocketClient) {
  _inherits(JsonRpcWebSocketClient, _WebSocketClient);

  function JsonRpcWebSocketClient(opts) {
    _classCallCheck(this, JsonRpcWebSocketClient);

    {
      var url = void 0,
          protocols = void 0;
      if (!opts) {
        opts = {};
      } else if (typeof opts === 'string') {
        url = opts;
        opts = {};
      } else {
        var _opts = opts;
        url = _opts.url;
        var _opts$protocols = _opts.protocols;
        protocols = _opts$protocols === undefined ? '' : _opts$protocols;
        opts = _objectWithoutProperties(_opts, ['url', 'protocols']);
      }

      var _this = _possibleConstructorReturn(this, (JsonRpcWebSocketClient.__proto__ || Object.getPrototypeOf(JsonRpcWebSocketClient)).call(this, (0, _parseUrl2.default)(url), protocols, opts));
    }

    var peer = _this._peer = new _jsonRpcPeer2.default(function (message) {
      // This peer is only a client and does not support requests.
      if (message.type !== 'notification') {
        throw new _jsonRpcPeer.MethodNotFound();
      }

      _this.emit('notification', message);
    }).on('data', function (message) {
      _this.send(message);
    });

    _this.on(_websocketClient.CLOSED, function () {
      peer.failPendingRequests(new _websocketClient.ConnectionError('connection has been closed'));
    });

    _this.on(_websocketClient.MESSAGE, function (message) {
      peer.write(message);
    });
    return _this;
  }

  // TODO: call() because RPC or request() because JSON-RPC?


  _createClass(JsonRpcWebSocketClient, [{
    key: 'call',
    value: function call(method, params) {
      return this._peer.request(method, params);
    }
  }, {
    key: 'notify',
    value: function notify(method, params) {
      return this._peer.notify(method, params);
    }
  }]);

  return JsonRpcWebSocketClient;
}(_websocketClient2.default);

exports.default = JsonRpcWebSocketClient;
//# sourceMappingURL=index.js.map