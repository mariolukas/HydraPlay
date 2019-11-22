"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @fileoverview This adapts the buildOptimizer to run over each file as it is
 * processed by Rollup. We must do this since buildOptimizer expects to see the
 * ESModules in the input sources, and therefore cannot run on the rollup output
 */
const path = require("path");
const build_optimizer_1 = require("./build-optimizer");
const DEBUG = false;
function optimizer(options) {
    // Normalize paths for comparison.
    if (options.sideEffectFreeModules) {
        options.sideEffectFreeModules = options.sideEffectFreeModules.map(p => p.replace(/\\/g, '/'));
    }
    return {
        name: 'build-optimizer',
        transform: (content, id) => {
            const normalizedId = id.replace(/\\/g, '/');
            const isSideEffectFree = options.sideEffectFreeModules &&
                options.sideEffectFreeModules.some(m => normalizedId.indexOf(m) >= 0);
            const isAngularCoreFile = options.angularCoreModules &&
                options.angularCoreModules.some(m => normalizedId.indexOf(m) >= 0);
            const { content: code, sourceMap: map } = build_optimizer_1.buildOptimizer({
                content, inputFilePath: id, emitSourceMap: true, isSideEffectFree, isAngularCoreFile,
            });
            if (!code) {
                if (DEBUG) {
                    console.error('no transforms produced by buildOptimizer for '
                        + path.relative(process.cwd(), id));
                }
                return null;
            }
            if (!map) {
                throw new Error('no sourcemap produced by buildOptimizer');
            }
            return { code, map };
        },
    };
}
exports.default = optimizer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9sbHVwLXBsdWdpbi5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsicGFja2FnZXMvYW5ndWxhcl9kZXZraXQvYnVpbGRfb3B0aW1pemVyL3NyYy9idWlsZC1vcHRpbWl6ZXIvcm9sbHVwLXBsdWdpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOztBQUVIOzs7O0dBSUc7QUFFSCw2QkFBNkI7QUFFN0IsdURBQW1EO0FBRW5ELE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQztBQU9wQixTQUF3QixTQUFTLENBQUMsT0FBZ0I7SUFDaEQsa0NBQWtDO0lBQ2xDLElBQUksT0FBTyxDQUFDLHFCQUFxQixFQUFFO1FBQ2pDLE9BQU8sQ0FBQyxxQkFBcUIsR0FBRyxPQUFPLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztLQUMvRjtJQUVELE9BQU87UUFDTCxJQUFJLEVBQUUsaUJBQWlCO1FBQ3ZCLFNBQVMsRUFBRSxDQUFDLE9BQWUsRUFBRSxFQUFVLEVBQTBDLEVBQUU7WUFDakYsTUFBTSxZQUFZLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDNUMsTUFBTSxnQkFBZ0IsR0FBRyxPQUFPLENBQUMscUJBQXFCO2dCQUNwRCxPQUFPLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUN4RSxNQUFNLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxrQkFBa0I7Z0JBQ2xELE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3JFLE1BQU0sRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsR0FBRyxnQ0FBYyxDQUFDO2dCQUN2RCxPQUFPLEVBQUUsYUFBYSxFQUFFLEVBQUUsRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixFQUFFLGlCQUFpQjthQUNyRixDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNULElBQUksS0FBSyxFQUFFO29CQUNULE9BQU8sQ0FBQyxLQUFLLENBQUMsK0NBQStDOzBCQUN4RCxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO2lCQUN4QztnQkFFRCxPQUFPLElBQUksQ0FBQzthQUNiO1lBQ0QsSUFBSSxDQUFDLEdBQUcsRUFBRTtnQkFDUixNQUFNLElBQUksS0FBSyxDQUFDLHlDQUF5QyxDQUFDLENBQUM7YUFDNUQ7WUFFRCxPQUFPLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ3ZCLENBQUM7S0FDRixDQUFDO0FBQ0osQ0FBQztBQWhDRCw0QkFnQ0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8qKlxuICogQGZpbGVvdmVydmlldyBUaGlzIGFkYXB0cyB0aGUgYnVpbGRPcHRpbWl6ZXIgdG8gcnVuIG92ZXIgZWFjaCBmaWxlIGFzIGl0IGlzXG4gKiBwcm9jZXNzZWQgYnkgUm9sbHVwLiBXZSBtdXN0IGRvIHRoaXMgc2luY2UgYnVpbGRPcHRpbWl6ZXIgZXhwZWN0cyB0byBzZWUgdGhlXG4gKiBFU01vZHVsZXMgaW4gdGhlIGlucHV0IHNvdXJjZXMsIGFuZCB0aGVyZWZvcmUgY2Fubm90IHJ1biBvbiB0aGUgcm9sbHVwIG91dHB1dFxuICovXG5cbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBSYXdTb3VyY2VNYXAgfSBmcm9tICdzb3VyY2UtbWFwJztcbmltcG9ydCB7IGJ1aWxkT3B0aW1pemVyIH0gZnJvbSAnLi9idWlsZC1vcHRpbWl6ZXInO1xuXG5jb25zdCBERUJVRyA9IGZhbHNlO1xuXG5leHBvcnQgaW50ZXJmYWNlIE9wdGlvbnMge1xuICBzaWRlRWZmZWN0RnJlZU1vZHVsZXM/OiBzdHJpbmdbXTtcbiAgYW5ndWxhckNvcmVNb2R1bGVzPzogc3RyaW5nW107XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG9wdGltaXplcihvcHRpb25zOiBPcHRpb25zKSB7XG4gIC8vIE5vcm1hbGl6ZSBwYXRocyBmb3IgY29tcGFyaXNvbi5cbiAgaWYgKG9wdGlvbnMuc2lkZUVmZmVjdEZyZWVNb2R1bGVzKSB7XG4gICAgb3B0aW9ucy5zaWRlRWZmZWN0RnJlZU1vZHVsZXMgPSBvcHRpb25zLnNpZGVFZmZlY3RGcmVlTW9kdWxlcy5tYXAocCA9PiBwLnJlcGxhY2UoL1xcXFwvZywgJy8nKSk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIG5hbWU6ICdidWlsZC1vcHRpbWl6ZXInLFxuICAgIHRyYW5zZm9ybTogKGNvbnRlbnQ6IHN0cmluZywgaWQ6IHN0cmluZyk6IHtjb2RlOiBzdHJpbmcsIG1hcDogUmF3U291cmNlTWFwfXxudWxsID0+IHtcbiAgICAgIGNvbnN0IG5vcm1hbGl6ZWRJZCA9IGlkLnJlcGxhY2UoL1xcXFwvZywgJy8nKTtcbiAgICAgIGNvbnN0IGlzU2lkZUVmZmVjdEZyZWUgPSBvcHRpb25zLnNpZGVFZmZlY3RGcmVlTW9kdWxlcyAmJlxuICAgICAgICBvcHRpb25zLnNpZGVFZmZlY3RGcmVlTW9kdWxlcy5zb21lKG0gPT4gbm9ybWFsaXplZElkLmluZGV4T2YobSkgPj0gMCk7XG4gICAgICBjb25zdCBpc0FuZ3VsYXJDb3JlRmlsZSA9IG9wdGlvbnMuYW5ndWxhckNvcmVNb2R1bGVzICYmXG4gICAgICAgIG9wdGlvbnMuYW5ndWxhckNvcmVNb2R1bGVzLnNvbWUobSA9PiBub3JtYWxpemVkSWQuaW5kZXhPZihtKSA+PSAwKTtcbiAgICAgIGNvbnN0IHsgY29udGVudDogY29kZSwgc291cmNlTWFwOiBtYXAgfSA9IGJ1aWxkT3B0aW1pemVyKHtcbiAgICAgICAgY29udGVudCwgaW5wdXRGaWxlUGF0aDogaWQsIGVtaXRTb3VyY2VNYXA6IHRydWUsIGlzU2lkZUVmZmVjdEZyZWUsIGlzQW5ndWxhckNvcmVGaWxlLFxuICAgICAgfSk7XG4gICAgICBpZiAoIWNvZGUpIHtcbiAgICAgICAgaWYgKERFQlVHKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignbm8gdHJhbnNmb3JtcyBwcm9kdWNlZCBieSBidWlsZE9wdGltaXplciBmb3IgJ1xuICAgICAgICAgICAgICsgcGF0aC5yZWxhdGl2ZShwcm9jZXNzLmN3ZCgpLCBpZCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICBpZiAoIW1hcCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ25vIHNvdXJjZW1hcCBwcm9kdWNlZCBieSBidWlsZE9wdGltaXplcicpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4geyBjb2RlLCBtYXAgfTtcbiAgICB9LFxuICB9O1xufVxuIl19