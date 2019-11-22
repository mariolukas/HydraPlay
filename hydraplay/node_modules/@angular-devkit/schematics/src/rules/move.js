"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const core_1 = require("@angular-devkit/core");
const base_1 = require("./base");
function move(from, to) {
    if (to === undefined) {
        to = from;
        from = '/';
    }
    const fromPath = core_1.normalize('/' + from);
    const toPath = core_1.normalize('/' + to);
    if (fromPath === toPath) {
        return base_1.noop;
    }
    return tree => {
        if (tree.exists(fromPath)) {
            // fromPath is a file
            tree.rename(fromPath, toPath);
        }
        else {
            // fromPath is a directory
            tree.getDir(fromPath).visit(path => {
                tree.rename(path, core_1.join(toPath, path.substr(fromPath.length)));
            });
        }
        return tree;
    };
}
exports.move = move;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW92ZS5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsicGFja2FnZXMvYW5ndWxhcl9kZXZraXQvc2NoZW1hdGljcy9zcmMvcnVsZXMvbW92ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7R0FNRztBQUNILCtDQUF1RDtBQUV2RCxpQ0FBOEI7QUFHOUIsU0FBZ0IsSUFBSSxDQUFDLElBQVksRUFBRSxFQUFXO0lBQzVDLElBQUksRUFBRSxLQUFLLFNBQVMsRUFBRTtRQUNwQixFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ1YsSUFBSSxHQUFHLEdBQUcsQ0FBQztLQUNaO0lBRUQsTUFBTSxRQUFRLEdBQUcsZ0JBQVMsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDdkMsTUFBTSxNQUFNLEdBQUcsZ0JBQVMsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFFbkMsSUFBSSxRQUFRLEtBQUssTUFBTSxFQUFFO1FBQ3ZCLE9BQU8sV0FBSSxDQUFDO0tBQ2I7SUFFRCxPQUFPLElBQUksQ0FBQyxFQUFFO1FBQ1osSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQ3pCLHFCQUFxQjtZQUNyQixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztTQUMvQjthQUFNO1lBQ0wsMEJBQTBCO1lBQzFCLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUNqQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxXQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoRSxDQUFDLENBQUMsQ0FBQztTQUNKO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDLENBQUM7QUFDSixDQUFDO0FBMUJELG9CQTBCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7IGpvaW4sIG5vcm1hbGl6ZSB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9jb3JlJztcbmltcG9ydCB7IFJ1bGUgfSBmcm9tICcuLi9lbmdpbmUvaW50ZXJmYWNlJztcbmltcG9ydCB7IG5vb3AgfSBmcm9tICcuL2Jhc2UnO1xuXG5cbmV4cG9ydCBmdW5jdGlvbiBtb3ZlKGZyb206IHN0cmluZywgdG8/OiBzdHJpbmcpOiBSdWxlIHtcbiAgaWYgKHRvID09PSB1bmRlZmluZWQpIHtcbiAgICB0byA9IGZyb207XG4gICAgZnJvbSA9ICcvJztcbiAgfVxuXG4gIGNvbnN0IGZyb21QYXRoID0gbm9ybWFsaXplKCcvJyArIGZyb20pO1xuICBjb25zdCB0b1BhdGggPSBub3JtYWxpemUoJy8nICsgdG8pO1xuXG4gIGlmIChmcm9tUGF0aCA9PT0gdG9QYXRoKSB7XG4gICAgcmV0dXJuIG5vb3A7XG4gIH1cblxuICByZXR1cm4gdHJlZSA9PiB7XG4gICAgaWYgKHRyZWUuZXhpc3RzKGZyb21QYXRoKSkge1xuICAgICAgLy8gZnJvbVBhdGggaXMgYSBmaWxlXG4gICAgICB0cmVlLnJlbmFtZShmcm9tUGF0aCwgdG9QYXRoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gZnJvbVBhdGggaXMgYSBkaXJlY3RvcnlcbiAgICAgIHRyZWUuZ2V0RGlyKGZyb21QYXRoKS52aXNpdChwYXRoID0+IHtcbiAgICAgICAgdHJlZS5yZW5hbWUocGF0aCwgam9pbih0b1BhdGgsIHBhdGguc3Vic3RyKGZyb21QYXRoLmxlbmd0aCkpKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB0cmVlO1xuICB9O1xufVxuIl19