"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const schematics_1 = require("@angular-devkit/schematics");
const tasks_1 = require("@angular-devkit/schematics/tasks");
function applyLintFix(path = '/') {
    return (tree, context) => {
        // Find the closest tslint.json or tslint.yaml
        let dir = tree.getDir(path.substr(0, path.lastIndexOf('/')));
        do {
            if (dir.subfiles.some(f => f === 'tslint.json' || f === 'tslint.yaml')) {
                break;
            }
            dir = dir.parent;
        } while (dir !== null);
        if (dir === null) {
            throw new schematics_1.SchematicsException('Asked to run lint fixes, but could not find a tslint.json or tslint.yaml config file.');
        }
        // Only include files that have been touched.
        const files = tree.actions.reduce((acc, action) => {
            const path = action.path.substr(1); // Remove the starting '/'.
            if (path.endsWith('.ts') && dir && action.path.startsWith(dir.path)) {
                acc.add(path);
            }
            return acc;
        }, new Set());
        context.addTask(new tasks_1.TslintFixTask({
            ignoreErrors: true,
            tsConfigPath: 'tsconfig.json',
            files: [...files],
        }));
    };
}
exports.applyLintFix = applyLintFix;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGludC1maXguanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL3NjaGVtYXRpY3MvYW5ndWxhci91dGlsaXR5L2xpbnQtZml4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7OztHQU1HO0FBQ0gsMkRBTW9DO0FBQ3BDLDREQUFpRTtBQUVqRSxTQUFnQixZQUFZLENBQUMsSUFBSSxHQUFHLEdBQUc7SUFDckMsT0FBTyxDQUFDLElBQVUsRUFBRSxPQUF5QixFQUFFLEVBQUU7UUFDL0MsOENBQThDO1FBQzlDLElBQUksR0FBRyxHQUFvQixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTlFLEdBQUc7WUFDRCxJQUFLLEdBQUcsQ0FBQyxRQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxhQUFhLElBQUksQ0FBQyxLQUFLLGFBQWEsQ0FBQyxFQUFFO2dCQUNwRixNQUFNO2FBQ1A7WUFFRCxHQUFHLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQztTQUNsQixRQUFRLEdBQUcsS0FBSyxJQUFJLEVBQUU7UUFFdkIsSUFBSSxHQUFHLEtBQUssSUFBSSxFQUFFO1lBQ2hCLE1BQU0sSUFBSSxnQ0FBbUIsQ0FDM0IsdUZBQXVGLENBQUMsQ0FBQztTQUM1RjtRQUVELDZDQUE2QztRQUM3QyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQWdCLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDN0QsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBRSwyQkFBMkI7WUFDaEUsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ25FLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDZjtZQUVELE9BQU8sR0FBRyxDQUFDO1FBQ2IsQ0FBQyxFQUFFLElBQUksR0FBRyxFQUFVLENBQUMsQ0FBQztRQUV0QixPQUFPLENBQUMsT0FBTyxDQUFDLElBQUkscUJBQWEsQ0FBQztZQUNoQyxZQUFZLEVBQUUsSUFBSTtZQUNsQixZQUFZLEVBQUUsZUFBZTtZQUM3QixLQUFLLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQztTQUNsQixDQUFDLENBQUMsQ0FBQztJQUNOLENBQUMsQ0FBQztBQUNKLENBQUM7QUFsQ0Qsb0NBa0NDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtcbiAgRGlyRW50cnksXG4gIFJ1bGUsXG4gIFNjaGVtYXRpY0NvbnRleHQsXG4gIFNjaGVtYXRpY3NFeGNlcHRpb24sXG4gIFRyZWUsXG59IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzJztcbmltcG9ydCB7IFRzbGludEZpeFRhc2sgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcy90YXNrcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBhcHBseUxpbnRGaXgocGF0aCA9ICcvJyk6IFJ1bGUge1xuICByZXR1cm4gKHRyZWU6IFRyZWUsIGNvbnRleHQ6IFNjaGVtYXRpY0NvbnRleHQpID0+IHtcbiAgICAvLyBGaW5kIHRoZSBjbG9zZXN0IHRzbGludC5qc29uIG9yIHRzbGludC55YW1sXG4gICAgbGV0IGRpcjogRGlyRW50cnkgfCBudWxsID0gdHJlZS5nZXREaXIocGF0aC5zdWJzdHIoMCwgcGF0aC5sYXN0SW5kZXhPZignLycpKSk7XG5cbiAgICBkbyB7XG4gICAgICBpZiAoKGRpci5zdWJmaWxlcyBhcyBzdHJpbmdbXSkuc29tZShmID0+IGYgPT09ICd0c2xpbnQuanNvbicgfHwgZiA9PT0gJ3RzbGludC55YW1sJykpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGRpciA9IGRpci5wYXJlbnQ7XG4gICAgfSB3aGlsZSAoZGlyICE9PSBudWxsKTtcblxuICAgIGlmIChkaXIgPT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKFxuICAgICAgICAnQXNrZWQgdG8gcnVuIGxpbnQgZml4ZXMsIGJ1dCBjb3VsZCBub3QgZmluZCBhIHRzbGludC5qc29uIG9yIHRzbGludC55YW1sIGNvbmZpZyBmaWxlLicpO1xuICAgIH1cblxuICAgIC8vIE9ubHkgaW5jbHVkZSBmaWxlcyB0aGF0IGhhdmUgYmVlbiB0b3VjaGVkLlxuICAgIGNvbnN0IGZpbGVzID0gdHJlZS5hY3Rpb25zLnJlZHVjZSgoYWNjOiBTZXQ8c3RyaW5nPiwgYWN0aW9uKSA9PiB7XG4gICAgICBjb25zdCBwYXRoID0gYWN0aW9uLnBhdGguc3Vic3RyKDEpOyAgLy8gUmVtb3ZlIHRoZSBzdGFydGluZyAnLycuXG4gICAgICBpZiAocGF0aC5lbmRzV2l0aCgnLnRzJykgJiYgZGlyICYmIGFjdGlvbi5wYXRoLnN0YXJ0c1dpdGgoZGlyLnBhdGgpKSB7XG4gICAgICAgIGFjYy5hZGQocGF0aCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBhY2M7XG4gICAgfSwgbmV3IFNldDxzdHJpbmc+KCkpO1xuXG4gICAgY29udGV4dC5hZGRUYXNrKG5ldyBUc2xpbnRGaXhUYXNrKHtcbiAgICAgIGlnbm9yZUVycm9yczogdHJ1ZSxcbiAgICAgIHRzQ29uZmlnUGF0aDogJ3RzY29uZmlnLmpzb24nLFxuICAgICAgZmlsZXM6IFsuLi5maWxlc10sXG4gICAgfSkpO1xuICB9O1xufVxuIl19