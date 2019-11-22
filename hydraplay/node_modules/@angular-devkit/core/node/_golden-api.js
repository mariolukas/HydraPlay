"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
// Start experimental namespace
// Start jobs namespace
__export(require("./experimental/job-registry"));
// End jobs namespace
// End experimental namespace
__export(require("./fs"));
__export(require("./cli-logger"));
__export(require("./host"));
var resolve_1 = require("./resolve");
exports.ModuleNotFoundException = resolve_1.ModuleNotFoundException;
exports.resolve = resolve_1.resolve;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX2dvbGRlbi1hcGkuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2FuZ3VsYXJfZGV2a2l0L2NvcmUvbm9kZS9fZ29sZGVuLWFwaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7OztBQUVILCtCQUErQjtBQUMvQix1QkFBdUI7QUFDdkIsaURBQTRDO0FBQzVDLHFCQUFxQjtBQUNyQiw2QkFBNkI7QUFFN0IsMEJBQXFCO0FBQ3JCLGtDQUE2QjtBQUM3Qiw0QkFBdUI7QUFDdkIscUNBQTZFO0FBQXBFLDRDQUFBLHVCQUF1QixDQUFBO0FBQWtCLDRCQUFBLE9BQU8sQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLy8gU3RhcnQgZXhwZXJpbWVudGFsIG5hbWVzcGFjZVxuLy8gU3RhcnQgam9icyBuYW1lc3BhY2VcbmV4cG9ydCAqIGZyb20gJy4vZXhwZXJpbWVudGFsL2pvYi1yZWdpc3RyeSc7XG4vLyBFbmQgam9icyBuYW1lc3BhY2Vcbi8vIEVuZCBleHBlcmltZW50YWwgbmFtZXNwYWNlXG5cbmV4cG9ydCAqIGZyb20gJy4vZnMnO1xuZXhwb3J0ICogZnJvbSAnLi9jbGktbG9nZ2VyJztcbmV4cG9ydCAqIGZyb20gJy4vaG9zdCc7XG5leHBvcnQgeyBNb2R1bGVOb3RGb3VuZEV4Y2VwdGlvbiwgUmVzb2x2ZU9wdGlvbnMsIHJlc29sdmUgfSBmcm9tICcuL3Jlc29sdmUnO1xuIl19