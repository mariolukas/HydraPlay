"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// tslint:disable
// TODO: cleanup this file, it's copied as is from Angular CLI.
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const core_1 = require("@angular-devkit/core");
const webpack_1 = require("webpack");
exports.ngAppResolve = (resolvePath) => {
    return path.resolve(process.cwd(), resolvePath);
};
function getOutputHashFormat(option, length = 20) {
    /* tslint:disable:max-line-length */
    const hashFormats = {
        none: { chunk: '', extract: '', file: '', script: '' },
        media: { chunk: '', extract: '', file: `.[hash:${length}]`, script: '' },
        bundles: { chunk: `.[chunkhash:${length}]`, extract: `.[contenthash:${length}]`, file: '', script: `.[hash:${length}]` },
        all: { chunk: `.[chunkhash:${length}]`, extract: `.[contenthash:${length}]`, file: `.[hash:${length}]`, script: `.[hash:${length}]` },
    };
    /* tslint:enable:max-line-length */
    return hashFormats[option] || hashFormats['none'];
}
exports.getOutputHashFormat = getOutputHashFormat;
function normalizeExtraEntryPoints(extraEntryPoints, defaultBundleName) {
    return extraEntryPoints.map(entry => {
        let normalizedEntry;
        if (typeof entry === 'string') {
            normalizedEntry = { input: entry, lazy: false, bundleName: defaultBundleName };
        }
        else {
            let bundleName;
            if (entry.bundleName) {
                bundleName = entry.bundleName;
            }
            else if (entry.lazy) {
                // Lazy entry points use the file name as bundle name.
                bundleName = core_1.basename(core_1.normalize(entry.input.replace(/\.(js|css|scss|sass|less|styl)$/i, '')));
            }
            else {
                bundleName = defaultBundleName;
            }
            normalizedEntry = Object.assign({}, entry, { bundleName });
        }
        return normalizedEntry;
    });
}
exports.normalizeExtraEntryPoints = normalizeExtraEntryPoints;
function getSourceMapDevTool(scriptsSourceMap, stylesSourceMap, hiddenSourceMap = false, inlineSourceMap = false) {
    const include = [];
    if (scriptsSourceMap) {
        include.push(/js$/);
    }
    if (stylesSourceMap) {
        include.push(/css$/);
    }
    return new webpack_1.SourceMapDevToolPlugin({
        filename: inlineSourceMap ? undefined : '[file].map',
        include,
        append: hiddenSourceMap ? false : undefined,
    });
}
exports.getSourceMapDevTool = getSourceMapDevTool;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2FuZ3VsYXJfZGV2a2l0L2J1aWxkX2FuZ3VsYXIvc3JjL2FuZ3VsYXItY2xpLWZpbGVzL21vZGVscy93ZWJwYWNrLWNvbmZpZ3MvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRztBQUNILGlCQUFpQjtBQUNqQiwrREFBK0Q7O0FBRS9ELDZCQUE2QjtBQUM3QiwrQ0FBMkQ7QUFFM0QscUNBQWlEO0FBRXBDLFFBQUEsWUFBWSxHQUFHLENBQUMsV0FBbUIsRUFBVSxFQUFFO0lBQzFELE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFDbEQsQ0FBQyxDQUFDO0FBU0YsU0FBZ0IsbUJBQW1CLENBQUMsTUFBYyxFQUFFLE1BQU0sR0FBRyxFQUFFO0lBQzdELG9DQUFvQztJQUNwQyxNQUFNLFdBQVcsR0FBcUM7UUFDcEQsSUFBSSxFQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBd0IsT0FBTyxFQUFFLEVBQUUsRUFBMEIsSUFBSSxFQUFFLEVBQUUsRUFBbUIsTUFBTSxFQUFFLEVBQUUsRUFBRTtRQUN4SCxLQUFLLEVBQUksRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUF3QixPQUFPLEVBQUUsRUFBRSxFQUEwQixJQUFJLEVBQUUsVUFBVSxNQUFNLEdBQUcsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFHO1FBQ3pILE9BQU8sRUFBRSxFQUFFLEtBQUssRUFBRSxlQUFlLE1BQU0sR0FBRyxFQUFFLE9BQU8sRUFBRSxpQkFBaUIsTUFBTSxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBbUIsTUFBTSxFQUFFLFVBQVUsTUFBTSxHQUFHLEVBQUc7UUFDMUksR0FBRyxFQUFNLEVBQUUsS0FBSyxFQUFFLGVBQWUsTUFBTSxHQUFHLEVBQUUsT0FBTyxFQUFFLGlCQUFpQixNQUFNLEdBQUcsRUFBRSxJQUFJLEVBQUUsVUFBVSxNQUFNLEdBQUcsRUFBRSxNQUFNLEVBQUUsVUFBVSxNQUFNLEdBQUcsRUFBRztLQUMzSSxDQUFDO0lBQ0YsbUNBQW1DO0lBQ25DLE9BQU8sV0FBVyxDQUFDLE1BQU0sQ0FBQyxJQUFJLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNwRCxDQUFDO0FBVkQsa0RBVUM7QUFJRCxTQUFnQix5QkFBeUIsQ0FDdkMsZ0JBQW1DLEVBQ25DLGlCQUF5QjtJQUV6QixPQUFPLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUNsQyxJQUFJLGVBQWUsQ0FBQztRQUVwQixJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTtZQUM3QixlQUFlLEdBQUcsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLGlCQUFpQixFQUFFLENBQUM7U0FDaEY7YUFBTTtZQUNMLElBQUksVUFBVSxDQUFDO1lBRWYsSUFBSSxLQUFLLENBQUMsVUFBVSxFQUFFO2dCQUNwQixVQUFVLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQzthQUMvQjtpQkFBTSxJQUFJLEtBQUssQ0FBQyxJQUFJLEVBQUU7Z0JBQ3JCLHNEQUFzRDtnQkFDdEQsVUFBVSxHQUFHLGVBQVEsQ0FDbkIsZ0JBQVMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxrQ0FBa0MsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUN2RSxDQUFDO2FBQ0g7aUJBQU07Z0JBQ0wsVUFBVSxHQUFHLGlCQUFpQixDQUFDO2FBQ2hDO1lBRUQsZUFBZSxxQkFBTyxLQUFLLElBQUUsVUFBVSxHQUFDLENBQUM7U0FDMUM7UUFFRCxPQUFPLGVBQWUsQ0FBQztJQUN6QixDQUFDLENBQUMsQ0FBQTtBQUNKLENBQUM7QUE1QkQsOERBNEJDO0FBRUQsU0FBZ0IsbUJBQW1CLENBQ2pDLGdCQUF5QixFQUN6QixlQUF3QixFQUN4QixlQUFlLEdBQUcsS0FBSyxFQUN2QixlQUFlLEdBQUcsS0FBSztJQUV2QixNQUFNLE9BQU8sR0FBRyxFQUFFLENBQUM7SUFDbkIsSUFBSSxnQkFBZ0IsRUFBRTtRQUNwQixPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ3JCO0lBRUQsSUFBSSxlQUFlLEVBQUU7UUFDbkIsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUN0QjtJQUVELE9BQU8sSUFBSSxnQ0FBc0IsQ0FBQztRQUNoQyxRQUFRLEVBQUUsZUFBZSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFlBQVk7UUFDcEQsT0FBTztRQUNQLE1BQU0sRUFBRSxlQUFlLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsU0FBUztLQUM1QyxDQUFDLENBQUM7QUFDTCxDQUFDO0FBcEJELGtEQW9CQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbi8vIHRzbGludDpkaXNhYmxlXG4vLyBUT0RPOiBjbGVhbnVwIHRoaXMgZmlsZSwgaXQncyBjb3BpZWQgYXMgaXMgZnJvbSBBbmd1bGFyIENMSS5cblxuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IGJhc2VuYW1lLCBub3JtYWxpemUgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZSc7XG5pbXBvcnQgeyBFeHRyYUVudHJ5UG9pbnQsIEV4dHJhRW50cnlQb2ludE9iamVjdCB9IGZyb20gJy4uLy4uLy4uL2Jyb3dzZXIvc2NoZW1hJztcbmltcG9ydCB7IFNvdXJjZU1hcERldlRvb2xQbHVnaW4gfSBmcm9tICd3ZWJwYWNrJztcblxuZXhwb3J0IGNvbnN0IG5nQXBwUmVzb2x2ZSA9IChyZXNvbHZlUGF0aDogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgcmV0dXJuIHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCByZXNvbHZlUGF0aCk7XG59O1xuXG5leHBvcnQgaW50ZXJmYWNlIEhhc2hGb3JtYXQge1xuICBjaHVuazogc3RyaW5nO1xuICBleHRyYWN0OiBzdHJpbmc7XG4gIGZpbGU6IHN0cmluZztcbiAgc2NyaXB0OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRPdXRwdXRIYXNoRm9ybWF0KG9wdGlvbjogc3RyaW5nLCBsZW5ndGggPSAyMCk6IEhhc2hGb3JtYXQge1xuICAvKiB0c2xpbnQ6ZGlzYWJsZTptYXgtbGluZS1sZW5ndGggKi9cbiAgY29uc3QgaGFzaEZvcm1hdHM6IHsgW29wdGlvbjogc3RyaW5nXTogSGFzaEZvcm1hdCB9ID0ge1xuICAgIG5vbmU6ICAgIHsgY2h1bms6ICcnLCAgICAgICAgICAgICAgICAgICAgICAgZXh0cmFjdDogJycsICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGU6ICcnICAgICAgICAgICAgICAgICAsIHNjcmlwdDogJycgfSxcbiAgICBtZWRpYTogICB7IGNodW5rOiAnJywgICAgICAgICAgICAgICAgICAgICAgIGV4dHJhY3Q6ICcnLCAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlOiBgLltoYXNoOiR7bGVuZ3RofV1gLCBzY3JpcHQ6ICcnICB9LFxuICAgIGJ1bmRsZXM6IHsgY2h1bms6IGAuW2NodW5raGFzaDoke2xlbmd0aH1dYCwgZXh0cmFjdDogYC5bY29udGVudGhhc2g6JHtsZW5ndGh9XWAsIGZpbGU6ICcnICAgICAgICAgICAgICAgICAsIHNjcmlwdDogYC5baGFzaDoke2xlbmd0aH1dYCAgfSxcbiAgICBhbGw6ICAgICB7IGNodW5rOiBgLltjaHVua2hhc2g6JHtsZW5ndGh9XWAsIGV4dHJhY3Q6IGAuW2NvbnRlbnRoYXNoOiR7bGVuZ3RofV1gLCBmaWxlOiBgLltoYXNoOiR7bGVuZ3RofV1gLCBzY3JpcHQ6IGAuW2hhc2g6JHtsZW5ndGh9XWAgIH0sXG4gIH07XG4gIC8qIHRzbGludDplbmFibGU6bWF4LWxpbmUtbGVuZ3RoICovXG4gIHJldHVybiBoYXNoRm9ybWF0c1tvcHRpb25dIHx8IGhhc2hGb3JtYXRzWydub25lJ107XG59XG5cbmV4cG9ydCB0eXBlIE5vcm1hbGl6ZWRFbnRyeVBvaW50ID0gRXh0cmFFbnRyeVBvaW50T2JqZWN0ICYgeyBidW5kbGVOYW1lOiBzdHJpbmcgfTtcblxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZUV4dHJhRW50cnlQb2ludHMoXG4gIGV4dHJhRW50cnlQb2ludHM6IEV4dHJhRW50cnlQb2ludFtdLFxuICBkZWZhdWx0QnVuZGxlTmFtZTogc3RyaW5nXG4pOiBOb3JtYWxpemVkRW50cnlQb2ludFtdIHtcbiAgcmV0dXJuIGV4dHJhRW50cnlQb2ludHMubWFwKGVudHJ5ID0+IHtcbiAgICBsZXQgbm9ybWFsaXplZEVudHJ5O1xuXG4gICAgaWYgKHR5cGVvZiBlbnRyeSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIG5vcm1hbGl6ZWRFbnRyeSA9IHsgaW5wdXQ6IGVudHJ5LCBsYXp5OiBmYWxzZSwgYnVuZGxlTmFtZTogZGVmYXVsdEJ1bmRsZU5hbWUgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IGJ1bmRsZU5hbWU7XG5cbiAgICAgIGlmIChlbnRyeS5idW5kbGVOYW1lKSB7XG4gICAgICAgIGJ1bmRsZU5hbWUgPSBlbnRyeS5idW5kbGVOYW1lO1xuICAgICAgfSBlbHNlIGlmIChlbnRyeS5sYXp5KSB7XG4gICAgICAgIC8vIExhenkgZW50cnkgcG9pbnRzIHVzZSB0aGUgZmlsZSBuYW1lIGFzIGJ1bmRsZSBuYW1lLlxuICAgICAgICBidW5kbGVOYW1lID0gYmFzZW5hbWUoXG4gICAgICAgICAgbm9ybWFsaXplKGVudHJ5LmlucHV0LnJlcGxhY2UoL1xcLihqc3xjc3N8c2Nzc3xzYXNzfGxlc3N8c3R5bCkkL2ksICcnKSksXG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBidW5kbGVOYW1lID0gZGVmYXVsdEJ1bmRsZU5hbWU7XG4gICAgICB9XG5cbiAgICAgIG5vcm1hbGl6ZWRFbnRyeSA9IHsuLi5lbnRyeSwgYnVuZGxlTmFtZX07XG4gICAgfVxuXG4gICAgcmV0dXJuIG5vcm1hbGl6ZWRFbnRyeTtcbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFNvdXJjZU1hcERldlRvb2woXG4gIHNjcmlwdHNTb3VyY2VNYXA6IGJvb2xlYW4sXG4gIHN0eWxlc1NvdXJjZU1hcDogYm9vbGVhbixcbiAgaGlkZGVuU291cmNlTWFwID0gZmFsc2UsXG4gIGlubGluZVNvdXJjZU1hcCA9IGZhbHNlLFxuKTogU291cmNlTWFwRGV2VG9vbFBsdWdpbiB7XG4gIGNvbnN0IGluY2x1ZGUgPSBbXTtcbiAgaWYgKHNjcmlwdHNTb3VyY2VNYXApIHtcbiAgICBpbmNsdWRlLnB1c2goL2pzJC8pO1xuICB9XG5cbiAgaWYgKHN0eWxlc1NvdXJjZU1hcCkge1xuICAgIGluY2x1ZGUucHVzaCgvY3NzJC8pO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBTb3VyY2VNYXBEZXZUb29sUGx1Z2luKHtcbiAgICBmaWxlbmFtZTogaW5saW5lU291cmNlTWFwID8gdW5kZWZpbmVkIDogJ1tmaWxlXS5tYXAnLFxuICAgIGluY2x1ZGUsXG4gICAgYXBwZW5kOiBoaWRkZW5Tb3VyY2VNYXAgPyBmYWxzZSA6IHVuZGVmaW5lZCxcbiAgfSk7XG59XG4iXX0=