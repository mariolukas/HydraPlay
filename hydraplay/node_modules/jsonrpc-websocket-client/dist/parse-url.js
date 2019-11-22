'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _url = require('url');

// ===================================================================

var PROTOCOL_RE = /^(?:(?:http|ws)(s)?:\/\/)?(.+)$/;

exports.default = function (url) {
  // Resolve the URL against the current URL if any.
  if (typeof window !== 'undefined') {
    var base = String(window.location);
    url = url ? (0, _url.resolve)(base, url) : base;
  } else if (!url) {
    throw new Error('cannot get current URL');
  }

  // Prepends the protocol if missing and replace HTTP by WS if
  // necessary.

  var _PROTOCOL_RE$exec = PROTOCOL_RE.exec(url),
      _PROTOCOL_RE$exec2 = _slicedToArray(_PROTOCOL_RE$exec, 3),
      isSecure = _PROTOCOL_RE$exec2[1],
      rest = _PROTOCOL_RE$exec2[2];

  return ['ws', isSecure || '', '://', rest].join('');
};
//# sourceMappingURL=parse-url.js.map