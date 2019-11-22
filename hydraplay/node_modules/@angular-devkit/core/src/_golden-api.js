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
__export(require("./exception/exception"));
// Start experimental namespace
__export(require("./workspace/index"));
// End experimental namespace
// Start json namespace
__export(require("./json/interface"));
__export(require("./json/parser"));
__export(require("./json/schema/pointer"));
__export(require("./json/schema/registry"));
__export(require("./json/schema/visitor"));
__export(require("./json/schema/utility"));
__export(require("./json/schema/transforms"));
// End json namespace
// Start logging namespace
__export(require("./logger/indent"));
__export(require("./logger/level"));
__export(require("./logger/logger"));
__export(require("./logger/null-logger"));
__export(require("./logger/transform-logger"));
// End logging namespace
// Start terminal namespace
__export(require("./terminal/text"));
__export(require("./terminal/colors"));
// End terminal namespace
// Start utils namespace
__export(require("./utils/literals"));
__export(require("./utils/strings"));
__export(require("./utils/array"));
__export(require("./utils/object"));
__export(require("./utils/template"));
__export(require("./utils/partially-ordered-set"));
__export(require("./utils/priority-queue"));
__export(require("./utils/lang"));
// End utils namespace
// Start virtualFs namespace
__export(require("./virtual-fs/path"));
__export(require("./virtual-fs/host/index"));
// End virtualFs namespace
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX2dvbGRlbi1hcGkuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2FuZ3VsYXJfZGV2a2l0L2NvcmUvc3JjL19nb2xkZW4tYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7Ozs7O0FBRUgsMkNBQXNDO0FBRXJDLCtCQUErQjtBQUNoQyx1Q0FBa0M7QUFDbEMsNkJBQTZCO0FBRTdCLHVCQUF1QjtBQUN2QixzQ0FBaUM7QUFDakMsbUNBQThCO0FBRTlCLDJDQUFzQztBQUN0Qyw0Q0FBdUM7QUFDdkMsMkNBQXNDO0FBQ3RDLDJDQUFzQztBQUN0Qyw4Q0FBeUM7QUFDekMscUJBQXFCO0FBRXJCLDBCQUEwQjtBQUMxQixxQ0FBZ0M7QUFDaEMsb0NBQStCO0FBQy9CLHFDQUFnQztBQUNoQywwQ0FBcUM7QUFDckMsK0NBQTBDO0FBQzFDLHdCQUF3QjtBQUV4QiwyQkFBMkI7QUFDM0IscUNBQWdDO0FBQ2hDLHVDQUFrQztBQUNsQyx5QkFBeUI7QUFFekIsd0JBQXdCO0FBQ3hCLHNDQUFpQztBQUNqQyxxQ0FBZ0M7QUFDaEMsbUNBQThCO0FBQzlCLG9DQUErQjtBQUMvQixzQ0FBaUM7QUFDakMsbURBQThDO0FBQzlDLDRDQUF1QztBQUN2QyxrQ0FBNkI7QUFDN0Isc0JBQXNCO0FBRXRCLDRCQUE0QjtBQUM1Qix1Q0FBa0M7QUFDbEMsNkNBQXdDO0FBQ3hDLDBCQUEwQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuZXhwb3J0ICogZnJvbSAnLi9leGNlcHRpb24vZXhjZXB0aW9uJztcblxuIC8vIFN0YXJ0IGV4cGVyaW1lbnRhbCBuYW1lc3BhY2VcbmV4cG9ydCAqIGZyb20gJy4vd29ya3NwYWNlL2luZGV4Jztcbi8vIEVuZCBleHBlcmltZW50YWwgbmFtZXNwYWNlXG5cbi8vIFN0YXJ0IGpzb24gbmFtZXNwYWNlXG5leHBvcnQgKiBmcm9tICcuL2pzb24vaW50ZXJmYWNlJztcbmV4cG9ydCAqIGZyb20gJy4vanNvbi9wYXJzZXInO1xuZXhwb3J0ICogZnJvbSAnLi9qc29uL3NjaGVtYS9pbnRlcmZhY2UnO1xuZXhwb3J0ICogZnJvbSAnLi9qc29uL3NjaGVtYS9wb2ludGVyJztcbmV4cG9ydCAqIGZyb20gJy4vanNvbi9zY2hlbWEvcmVnaXN0cnknO1xuZXhwb3J0ICogZnJvbSAnLi9qc29uL3NjaGVtYS92aXNpdG9yJztcbmV4cG9ydCAqIGZyb20gJy4vanNvbi9zY2hlbWEvdXRpbGl0eSc7XG5leHBvcnQgKiBmcm9tICcuL2pzb24vc2NoZW1hL3RyYW5zZm9ybXMnO1xuLy8gRW5kIGpzb24gbmFtZXNwYWNlXG5cbi8vIFN0YXJ0IGxvZ2dpbmcgbmFtZXNwYWNlXG5leHBvcnQgKiBmcm9tICcuL2xvZ2dlci9pbmRlbnQnO1xuZXhwb3J0ICogZnJvbSAnLi9sb2dnZXIvbGV2ZWwnO1xuZXhwb3J0ICogZnJvbSAnLi9sb2dnZXIvbG9nZ2VyJztcbmV4cG9ydCAqIGZyb20gJy4vbG9nZ2VyL251bGwtbG9nZ2VyJztcbmV4cG9ydCAqIGZyb20gJy4vbG9nZ2VyL3RyYW5zZm9ybS1sb2dnZXInO1xuLy8gRW5kIGxvZ2dpbmcgbmFtZXNwYWNlXG5cbi8vIFN0YXJ0IHRlcm1pbmFsIG5hbWVzcGFjZVxuZXhwb3J0ICogZnJvbSAnLi90ZXJtaW5hbC90ZXh0JztcbmV4cG9ydCAqIGZyb20gJy4vdGVybWluYWwvY29sb3JzJztcbi8vIEVuZCB0ZXJtaW5hbCBuYW1lc3BhY2VcblxuLy8gU3RhcnQgdXRpbHMgbmFtZXNwYWNlXG5leHBvcnQgKiBmcm9tICcuL3V0aWxzL2xpdGVyYWxzJztcbmV4cG9ydCAqIGZyb20gJy4vdXRpbHMvc3RyaW5ncyc7XG5leHBvcnQgKiBmcm9tICcuL3V0aWxzL2FycmF5JztcbmV4cG9ydCAqIGZyb20gJy4vdXRpbHMvb2JqZWN0JztcbmV4cG9ydCAqIGZyb20gJy4vdXRpbHMvdGVtcGxhdGUnO1xuZXhwb3J0ICogZnJvbSAnLi91dGlscy9wYXJ0aWFsbHktb3JkZXJlZC1zZXQnO1xuZXhwb3J0ICogZnJvbSAnLi91dGlscy9wcmlvcml0eS1xdWV1ZSc7XG5leHBvcnQgKiBmcm9tICcuL3V0aWxzL2xhbmcnO1xuLy8gRW5kIHV0aWxzIG5hbWVzcGFjZVxuXG4vLyBTdGFydCB2aXJ0dWFsRnMgbmFtZXNwYWNlXG5leHBvcnQgKiBmcm9tICcuL3ZpcnR1YWwtZnMvcGF0aCc7XG5leHBvcnQgKiBmcm9tICcuL3ZpcnR1YWwtZnMvaG9zdC9pbmRleCc7XG4vLyBFbmQgdmlydHVhbEZzIG5hbWVzcGFjZVxuIl19