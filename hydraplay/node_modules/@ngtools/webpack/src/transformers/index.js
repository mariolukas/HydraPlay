"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
__export(require("./interfaces"));
__export(require("./ast_helpers"));
__export(require("./make_transform"));
__export(require("./insert_import"));
__export(require("./elide_imports"));
__export(require("./replace_bootstrap"));
__export(require("./replace_server_bootstrap"));
__export(require("./export_ngfactory"));
__export(require("./export_lazy_module_map"));
__export(require("./register_locale_data"));
__export(require("./replace_resources"));
__export(require("./remove_decorators"));
__export(require("./find_resources"));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL25ndG9vbHMvd2VicGFjay9zcmMvdHJhbnNmb3JtZXJzL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7Ozs7OztHQU1HO0FBQ0gsa0NBQTZCO0FBQzdCLG1DQUE4QjtBQUM5QixzQ0FBaUM7QUFDakMscUNBQWdDO0FBQ2hDLHFDQUFnQztBQUNoQyx5Q0FBb0M7QUFDcEMsZ0RBQTJDO0FBQzNDLHdDQUFtQztBQUNuQyw4Q0FBeUM7QUFDekMsNENBQXVDO0FBQ3ZDLHlDQUFvQztBQUNwQyx5Q0FBb0M7QUFDcEMsc0NBQWlDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuZXhwb3J0ICogZnJvbSAnLi9pbnRlcmZhY2VzJztcbmV4cG9ydCAqIGZyb20gJy4vYXN0X2hlbHBlcnMnO1xuZXhwb3J0ICogZnJvbSAnLi9tYWtlX3RyYW5zZm9ybSc7XG5leHBvcnQgKiBmcm9tICcuL2luc2VydF9pbXBvcnQnO1xuZXhwb3J0ICogZnJvbSAnLi9lbGlkZV9pbXBvcnRzJztcbmV4cG9ydCAqIGZyb20gJy4vcmVwbGFjZV9ib290c3RyYXAnO1xuZXhwb3J0ICogZnJvbSAnLi9yZXBsYWNlX3NlcnZlcl9ib290c3RyYXAnO1xuZXhwb3J0ICogZnJvbSAnLi9leHBvcnRfbmdmYWN0b3J5JztcbmV4cG9ydCAqIGZyb20gJy4vZXhwb3J0X2xhenlfbW9kdWxlX21hcCc7XG5leHBvcnQgKiBmcm9tICcuL3JlZ2lzdGVyX2xvY2FsZV9kYXRhJztcbmV4cG9ydCAqIGZyb20gJy4vcmVwbGFjZV9yZXNvdXJjZXMnO1xuZXhwb3J0ICogZnJvbSAnLi9yZW1vdmVfZGVjb3JhdG9ycyc7XG5leHBvcnQgKiBmcm9tICcuL2ZpbmRfcmVzb3VyY2VzJztcbiJdfQ==