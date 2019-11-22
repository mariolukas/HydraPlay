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
const schematics_1 = require("@angular-devkit/schematics");
const lint_fix_1 = require("../utility/lint-fix");
const parse_name_1 = require("../utility/parse-name");
const project_1 = require("../utility/project");
function default_1(options) {
    return (host) => {
        if (!options.project) {
            throw new schematics_1.SchematicsException('Option (project) is required.');
        }
        const project = project_1.getProject(host, options.project);
        if (options.path === undefined) {
            options.path = project_1.buildDefaultPath(project);
        }
        if (options.implements === undefined) {
            options.implements = [];
        }
        let implementations = '';
        let implementationImports = '';
        if (options.implements.length > 0) {
            implementations = options.implements.join(', ');
            implementationImports = `${implementations}, `;
            // As long as we aren't in IE... ;)
            if (options.implements.includes('CanLoad')) {
                implementationImports = `${implementationImports}Route, UrlSegment, `;
            }
        }
        const parsedPath = parse_name_1.parseName(options.path, options.name);
        options.name = parsedPath.name;
        options.path = parsedPath.path;
        // todo remove these when we remove the deprecations
        options.skipTests = options.skipTests || !options.spec;
        const templateSource = schematics_1.apply(schematics_1.url('./files'), [
            options.skipTests ? schematics_1.filter(path => !path.endsWith('.spec.ts.template')) : schematics_1.noop(),
            schematics_1.applyTemplates(Object.assign({ implementations,
                implementationImports }, core_1.strings, options)),
            schematics_1.move(parsedPath.path + (options.flat ? '' : '/' + core_1.strings.dasherize(options.name))),
        ]);
        return schematics_1.chain([
            schematics_1.mergeWith(templateSource),
            options.lintFix ? lint_fix_1.applyLintFix(options.path) : schematics_1.noop(),
        ]);
    };
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL3NjaGVtYXRpY3MvYW5ndWxhci9ndWFyZC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7RUFNRTtBQUNGLCtDQUErQztBQUMvQywyREFZb0M7QUFDcEMsa0RBQW1EO0FBQ25ELHNEQUFrRDtBQUNsRCxnREFBa0U7QUFJbEUsbUJBQXlCLE9BQXFCO0lBQzVDLE9BQU8sQ0FBQyxJQUFVLEVBQUUsRUFBRTtRQUNwQixJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRTtZQUNwQixNQUFNLElBQUksZ0NBQW1CLENBQUMsK0JBQStCLENBQUMsQ0FBQztTQUNoRTtRQUNELE1BQU0sT0FBTyxHQUFHLG9CQUFVLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVsRCxJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFO1lBQzlCLE9BQU8sQ0FBQyxJQUFJLEdBQUcsMEJBQWdCLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDMUM7UUFDRCxJQUFJLE9BQU8sQ0FBQyxVQUFVLEtBQUssU0FBUyxFQUFFO1lBQ3BDLE9BQU8sQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO1NBQ3pCO1FBRUQsSUFBSSxlQUFlLEdBQUcsRUFBRSxDQUFDO1FBQ3pCLElBQUkscUJBQXFCLEdBQUcsRUFBRSxDQUFDO1FBQy9CLElBQUksT0FBTyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ2pDLGVBQWUsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNoRCxxQkFBcUIsR0FBRyxHQUFHLGVBQWUsSUFBSSxDQUFDO1lBQy9DLG1DQUFtQztZQUNuQyxJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFO2dCQUMxQyxxQkFBcUIsR0FBRyxHQUFHLHFCQUFxQixxQkFBcUIsQ0FBQzthQUN2RTtTQUNGO1FBRUQsTUFBTSxVQUFVLEdBQUcsc0JBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN6RCxPQUFPLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUM7UUFDL0IsT0FBTyxDQUFDLElBQUksR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDO1FBRS9CLG9EQUFvRDtRQUNwRCxPQUFPLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO1FBRXZELE1BQU0sY0FBYyxHQUFHLGtCQUFLLENBQUMsZ0JBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUMzQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxtQkFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsaUJBQUksRUFBRTtZQUNoRiwyQkFBYyxpQkFDWixlQUFlO2dCQUNmLHFCQUFxQixJQUNsQixjQUFPLEVBQ1AsT0FBTyxFQUNWO1lBQ0YsaUJBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsY0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztTQUNwRixDQUFDLENBQUM7UUFFSCxPQUFPLGtCQUFLLENBQUM7WUFDWCxzQkFBUyxDQUFDLGNBQWMsQ0FBQztZQUN6QixPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyx1QkFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsaUJBQUksRUFBRTtTQUN0RCxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUM7QUFDSixDQUFDO0FBaERELDRCQWdEQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuKiBAbGljZW5zZVxuKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbipcbiogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuKi9cbmltcG9ydCB7IHN0cmluZ3MgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZSc7XG5pbXBvcnQge1xuICBSdWxlLFxuICBTY2hlbWF0aWNzRXhjZXB0aW9uLFxuICBUcmVlLFxuICBhcHBseSxcbiAgYXBwbHlUZW1wbGF0ZXMsXG4gIGNoYWluLFxuICBmaWx0ZXIsXG4gIG1lcmdlV2l0aCxcbiAgbW92ZSxcbiAgbm9vcCxcbiAgdXJsLFxufSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcyc7XG5pbXBvcnQgeyBhcHBseUxpbnRGaXggfSBmcm9tICcuLi91dGlsaXR5L2xpbnQtZml4JztcbmltcG9ydCB7IHBhcnNlTmFtZSB9IGZyb20gJy4uL3V0aWxpdHkvcGFyc2UtbmFtZSc7XG5pbXBvcnQgeyBidWlsZERlZmF1bHRQYXRoLCBnZXRQcm9qZWN0IH0gZnJvbSAnLi4vdXRpbGl0eS9wcm9qZWN0JztcbmltcG9ydCB7IFNjaGVtYSBhcyBHdWFyZE9wdGlvbnMgfSBmcm9tICcuL3NjaGVtYSc7XG5cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKG9wdGlvbnM6IEd1YXJkT3B0aW9ucyk6IFJ1bGUge1xuICByZXR1cm4gKGhvc3Q6IFRyZWUpID0+IHtcbiAgICBpZiAoIW9wdGlvbnMucHJvamVjdCkge1xuICAgICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oJ09wdGlvbiAocHJvamVjdCkgaXMgcmVxdWlyZWQuJyk7XG4gICAgfVxuICAgIGNvbnN0IHByb2plY3QgPSBnZXRQcm9qZWN0KGhvc3QsIG9wdGlvbnMucHJvamVjdCk7XG5cbiAgICBpZiAob3B0aW9ucy5wYXRoID09PSB1bmRlZmluZWQpIHtcbiAgICAgIG9wdGlvbnMucGF0aCA9IGJ1aWxkRGVmYXVsdFBhdGgocHJvamVjdCk7XG4gICAgfVxuICAgIGlmIChvcHRpb25zLmltcGxlbWVudHMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgb3B0aW9ucy5pbXBsZW1lbnRzID0gW107XG4gICAgfVxuXG4gICAgbGV0IGltcGxlbWVudGF0aW9ucyA9ICcnO1xuICAgIGxldCBpbXBsZW1lbnRhdGlvbkltcG9ydHMgPSAnJztcbiAgICBpZiAob3B0aW9ucy5pbXBsZW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgIGltcGxlbWVudGF0aW9ucyA9IG9wdGlvbnMuaW1wbGVtZW50cy5qb2luKCcsICcpO1xuICAgICAgaW1wbGVtZW50YXRpb25JbXBvcnRzID0gYCR7aW1wbGVtZW50YXRpb25zfSwgYDtcbiAgICAgIC8vIEFzIGxvbmcgYXMgd2UgYXJlbid0IGluIElFLi4uIDspXG4gICAgICBpZiAob3B0aW9ucy5pbXBsZW1lbnRzLmluY2x1ZGVzKCdDYW5Mb2FkJykpIHtcbiAgICAgICAgaW1wbGVtZW50YXRpb25JbXBvcnRzID0gYCR7aW1wbGVtZW50YXRpb25JbXBvcnRzfVJvdXRlLCBVcmxTZWdtZW50LCBgO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHBhcnNlZFBhdGggPSBwYXJzZU5hbWUob3B0aW9ucy5wYXRoLCBvcHRpb25zLm5hbWUpO1xuICAgIG9wdGlvbnMubmFtZSA9IHBhcnNlZFBhdGgubmFtZTtcbiAgICBvcHRpb25zLnBhdGggPSBwYXJzZWRQYXRoLnBhdGg7XG5cbiAgICAvLyB0b2RvIHJlbW92ZSB0aGVzZSB3aGVuIHdlIHJlbW92ZSB0aGUgZGVwcmVjYXRpb25zXG4gICAgb3B0aW9ucy5za2lwVGVzdHMgPSBvcHRpb25zLnNraXBUZXN0cyB8fCAhb3B0aW9ucy5zcGVjO1xuXG4gICAgY29uc3QgdGVtcGxhdGVTb3VyY2UgPSBhcHBseSh1cmwoJy4vZmlsZXMnKSwgW1xuICAgICAgb3B0aW9ucy5za2lwVGVzdHMgPyBmaWx0ZXIocGF0aCA9PiAhcGF0aC5lbmRzV2l0aCgnLnNwZWMudHMudGVtcGxhdGUnKSkgOiBub29wKCksXG4gICAgICBhcHBseVRlbXBsYXRlcyh7XG4gICAgICAgIGltcGxlbWVudGF0aW9ucyxcbiAgICAgICAgaW1wbGVtZW50YXRpb25JbXBvcnRzLFxuICAgICAgICAuLi5zdHJpbmdzLFxuICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgfSksXG4gICAgICBtb3ZlKHBhcnNlZFBhdGgucGF0aCArIChvcHRpb25zLmZsYXQgPyAnJyA6ICcvJyArIHN0cmluZ3MuZGFzaGVyaXplKG9wdGlvbnMubmFtZSkpKSxcbiAgICBdKTtcblxuICAgIHJldHVybiBjaGFpbihbXG4gICAgICBtZXJnZVdpdGgodGVtcGxhdGVTb3VyY2UpLFxuICAgICAgb3B0aW9ucy5saW50Rml4ID8gYXBwbHlMaW50Rml4KG9wdGlvbnMucGF0aCkgOiBub29wKCksXG4gICAgXSk7XG4gIH07XG59XG4iXX0=