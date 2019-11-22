"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const path = require("path");
const getInnerRequest = require('enhanced-resolve/lib/getInnerRequest');
class TypeScriptPathsPlugin {
    constructor(_options) {
        this._options = _options;
    }
    // tslint:disable-next-line:no-any
    apply(resolver) {
        if (!this._options.paths || Object.keys(this._options.paths).length === 0) {
            return;
        }
        const target = resolver.ensureHook('resolve');
        const resolveAsync = (request, requestContext) => {
            return new Promise((resolve, reject) => {
                resolver.doResolve(target, request, '', requestContext, (error, result) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(result);
                    }
                });
            });
        };
        resolver.getHook('described-resolve').tapPromise('TypeScriptPathsPlugin', async (request, resolveContext) => {
            if (!request || request.typescriptPathMapped) {
                return;
            }
            const originalRequest = getInnerRequest(resolver, request);
            if (!originalRequest) {
                return;
            }
            // Only work on Javascript/TypeScript issuers.
            if (!request.context.issuer || !request.context.issuer.match(/\.[jt]sx?$/)) {
                return;
            }
            // Relative or absolute requests are not mapped
            if (originalRequest.startsWith('.') || originalRequest.startsWith('/')) {
                return;
            }
            // Ignore all webpack special requests
            if (originalRequest.startsWith('!!')) {
                return;
            }
            const replacements = findReplacements(originalRequest, this._options.paths || {});
            for (const potential of replacements) {
                const potentialRequest = Object.assign({}, request, { request: path.resolve(this._options.baseUrl || '', potential), typescriptPathMapped: true });
                const result = await resolveAsync(potentialRequest, resolveContext);
                if (result) {
                    return result;
                }
            }
        });
    }
}
exports.TypeScriptPathsPlugin = TypeScriptPathsPlugin;
function findReplacements(originalRequest, paths) {
    // check if any path mapping rules are relevant
    const pathMapOptions = [];
    for (const pattern in paths) {
        // get potentials and remove duplicates; JS Set maintains insertion order
        const potentials = Array.from(new Set(paths[pattern]));
        if (potentials.length === 0) {
            // no potential replacements so skip
            continue;
        }
        // can only contain zero or one
        const starIndex = pattern.indexOf('*');
        if (starIndex === -1) {
            if (pattern === originalRequest) {
                pathMapOptions.push({
                    starIndex,
                    partial: '',
                    potentials,
                });
            }
        }
        else if (starIndex === 0 && pattern.length === 1) {
            if (potentials.length === 1 && potentials[0] === '*') {
                // identity mapping -> noop
                continue;
            }
            pathMapOptions.push({
                starIndex,
                partial: originalRequest,
                potentials,
            });
        }
        else if (starIndex === pattern.length - 1) {
            if (originalRequest.startsWith(pattern.slice(0, -1))) {
                pathMapOptions.push({
                    starIndex,
                    partial: originalRequest.slice(pattern.length - 1),
                    potentials,
                });
            }
        }
        else {
            const [prefix, suffix] = pattern.split('*');
            if (originalRequest.startsWith(prefix) && originalRequest.endsWith(suffix)) {
                pathMapOptions.push({
                    starIndex,
                    partial: originalRequest.slice(prefix.length).slice(0, -suffix.length),
                    potentials,
                });
            }
        }
    }
    if (pathMapOptions.length === 0) {
        return [];
    }
    // exact matches take priority then largest prefix match
    pathMapOptions.sort((a, b) => {
        if (a.starIndex === -1) {
            return -1;
        }
        else if (b.starIndex === -1) {
            return 1;
        }
        else {
            return b.starIndex - a.starIndex;
        }
    });
    const replacements = [];
    pathMapOptions.forEach(option => {
        for (const potential of option.potentials) {
            let replacement;
            const starIndex = potential.indexOf('*');
            if (starIndex === -1) {
                replacement = potential;
            }
            else if (starIndex === potential.length - 1) {
                replacement = potential.slice(0, -1) + option.partial;
            }
            else {
                const [prefix, suffix] = potential.split('*');
                replacement = prefix + option.partial + suffix;
            }
            replacements.push(replacement);
        }
    });
    return replacements;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF0aHMtcGx1Z2luLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9uZ3Rvb2xzL3dlYnBhY2svc3JjL3BhdGhzLXBsdWdpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7R0FNRztBQUNILDZCQUE2QjtBQUk3QixNQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsc0NBQXNDLENBQUMsQ0FBQztBQU14RSxNQUFhLHFCQUFxQjtJQUNoQyxZQUFvQixRQUFzQztRQUF0QyxhQUFRLEdBQVIsUUFBUSxDQUE4QjtJQUFJLENBQUM7SUFFL0Qsa0NBQWtDO0lBQ2xDLEtBQUssQ0FBQyxRQUFhO1FBQ2pCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUN6RSxPQUFPO1NBQ1I7UUFFRCxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzlDLE1BQU0sWUFBWSxHQUFHLENBQUMsT0FBbUMsRUFBRSxjQUFrQixFQUFFLEVBQUU7WUFDL0UsT0FBTyxJQUFJLE9BQU8sQ0FBeUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7Z0JBQzdFLFFBQVEsQ0FBQyxTQUFTLENBQ2hCLE1BQU0sRUFDTixPQUFPLEVBQ1AsRUFBRSxFQUNGLGNBQWMsRUFDZCxDQUFDLEtBQW1CLEVBQUUsTUFBOEMsRUFBRSxFQUFFO29CQUN0RSxJQUFJLEtBQUssRUFBRTt3QkFDVCxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7cUJBQ2Y7eUJBQU07d0JBQ0wsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO3FCQUNqQjtnQkFDSCxDQUFDLENBQ0YsQ0FBQztZQUNKLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDO1FBRUYsUUFBUSxDQUFDLE9B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O2FBQU07WUFDTCxPQUFPLENBQUMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQztTQUNsQztJQUNILENBQUMsQ0FBQyxDQUFDO0lBRUgsTUFBTSxZQUFZLEdBQWEsRUFBRSxDQUFDO0lBQ2xDLGNBQWMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7UUFDOUIsS0FBSyxNQUFNLFNBQVMsSUFBSSxNQUFNLENBQUMsVUFBVSxFQUFFO1lBQ3pDLElBQUksV0FBVyxDQUFDO1lBQ2hCLE1BQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDekMsSUFBSSxTQUFTLEtBQUssQ0FBQyxDQUFDLEVBQUU7Z0JBQ3BCLFdBQVcsR0FBRyxTQUFTLENBQUM7YUFDekI7aUJBQU0sSUFBSSxTQUFTLEtBQUssU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQzdDLFdBQVcsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7YUFDdkQ7aUJBQU07Z0JBQ0wsTUFBTSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUM5QyxXQUFXLEdBQUcsTUFBTSxHQUFHLE1BQU0sQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO2FBQ2hEO1lBRUQsWUFBWSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztTQUNoQztJQUNILENBQUMsQ0FBQyxDQUFDO0lBRUgsT0FBTyxZQUFZLENBQUM7QUFDdEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBDb21waWxlck9wdGlvbnMsIE1hcExpa2UgfSBmcm9tICd0eXBlc2NyaXB0JztcbmltcG9ydCB7IE5vcm1hbE1vZHVsZUZhY3RvcnlSZXF1ZXN0IH0gZnJvbSAnLi93ZWJwYWNrJztcblxuY29uc3QgZ2V0SW5uZXJSZXF1ZXN0ID0gcmVxdWlyZSgnZW5oYW5jZWQtcmVzb2x2ZS9saWIvZ2V0SW5uZXJSZXF1ZXN0Jyk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgVHlwZVNjcmlwdFBhdGhzUGx1Z2luT3B0aW9ucyBleHRlbmRzIFBpY2s8Q29tcGlsZXJPcHRpb25zLCAncGF0aHMnIHwgJ2Jhc2VVcmwnPiB7XG5cbn1cblxuZXhwb3J0IGNsYXNzIFR5cGVTY3JpcHRQYXRoc1BsdWdpbiB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX29wdGlvbnM6IFR5cGVTY3JpcHRQYXRoc1BsdWdpbk9wdGlvbnMpIHsgfVxuXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgYXBwbHkocmVzb2x2ZXI6IGFueSkge1xuICAgIGlmICghdGhpcy5fb3B0aW9ucy5wYXRocyB8fCBPYmplY3Qua2V5cyh0aGlzLl9vcHRpb25zLnBhdGhzKS5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB0YXJnZXQgPSByZXNvbHZlci5lbnN1cmVIb29rKCdyZXNvbHZlJyk7XG4gICAgY29uc3QgcmVzb2x2ZUFzeW5jID0gKHJlcXVlc3Q6IE5vcm1hbE1vZHVsZUZhY3RvcnlSZXF1ZXN0LCByZXF1ZXN0Q29udGV4dDoge30pID0+IHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxOb3JtYWxNb2R1bGVGYWN0b3J5UmVxdWVzdCB8IHVuZGVmaW5lZD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICByZXNvbHZlci5kb1Jlc29sdmUoXG4gICAgICAgICAgdGFyZ2V0LFxuICAgICAgICAgIHJlcXVlc3QsXG4gICAgICAgICAgJycsXG4gICAgICAgICAgcmVxdWVzdENvbnRleHQsXG4gICAgICAgICAgKGVycm9yOiBFcnJvciB8IG51bGwsIHJlc3VsdDogTm9ybWFsTW9kdWxlRmFjdG9yeVJlcXVlc3QgfCB1bmRlZmluZWQpID0+IHtcbiAgICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgcmVzb2x2ZXIuZ2V0SG9vaygnZGVzY3JpYmVkLXJlc29sdmUnKS50YXBQcm9taXNlKFxuICAgICAgJ1R5cGVTY3JpcHRQYXRoc1BsdWdpbicsXG4gICAgICBhc3luYyAocmVxdWVzdDogTm9ybWFsTW9kdWxlRmFjdG9yeVJlcXVlc3QsIHJlc29sdmVDb250ZXh0OiB7fSkgPT4ge1xuICAgICAgICBpZiAoIXJlcXVlc3QgfHwgcmVxdWVzdC50eXBlc2NyaXB0UGF0aE1hcHBlZCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG9yaWdpbmFsUmVxdWVzdCA9IGdldElubmVyUmVxdWVzdChyZXNvbHZlciwgcmVxdWVzdCk7XG4gICAgICAgIGlmICghb3JpZ2luYWxSZXF1ZXN0KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gT25seSB3b3JrIG9uIEphdmFzY3JpcHQvVHlwZVNjcmlwdCBpc3N1ZXJzLlxuICAgICAgICBpZiAoIXJlcXVlc3QuY29udGV4dC5pc3N1ZXIgfHwgIXJlcXVlc3QuY29udGV4dC5pc3N1ZXIubWF0Y2goL1xcLltqdF1zeD8kLykpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZWxhdGl2ZSBvciBhYnNvbHV0ZSByZXF1ZXN0cyBhcmUgbm90IG1hcHBlZFxuICAgICAgICBpZiAob3JpZ2luYWxSZXF1ZXN0LnN0YXJ0c1dpdGgoJy4nKSB8fCBvcmlnaW5hbFJlcXVlc3Quc3RhcnRzV2l0aCgnLycpKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWdub3JlIGFsbCB3ZWJwYWNrIHNwZWNpYWwgcmVxdWVzdHNcbiAgICAgICAgaWYgKG9yaWdpbmFsUmVxdWVzdC5zdGFydHNXaXRoKCchIScpKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcmVwbGFjZW1lbnRzID0gZmluZFJlcGxhY2VtZW50cyhvcmlnaW5hbFJlcXVlc3QsIHRoaXMuX29wdGlvbnMucGF0aHMgfHwge30pO1xuICAgICAgICBmb3IgKGNvbnN0IHBvdGVudGlhbCBvZiByZXBsYWNlbWVudHMpIHtcbiAgICAgICAgICBjb25zdCBwb3RlbnRpYWxSZXF1ZXN0ID0ge1xuICAgICAgICAgICAgLi4ucmVxdWVzdCxcbiAgICAgICAgICAgIHJlcXVlc3Q6IHBhdGgucmVzb2x2ZSh0aGlzLl9vcHRpb25zLmJhc2VVcmwgfHwgJycsIHBvdGVudGlhbCksXG4gICAgICAgICAgICB0eXBlc2NyaXB0UGF0aE1hcHBlZDogdHJ1ZSxcbiAgICAgICAgICB9O1xuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJlc29sdmVBc3luYyhwb3RlbnRpYWxSZXF1ZXN0LCByZXNvbHZlQ29udGV4dCk7XG5cbiAgICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSxcbiAgICApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGZpbmRSZXBsYWNlbWVudHMoXG4gIG9yaWdpbmFsUmVxdWVzdDogc3RyaW5nLFxuICBwYXRoczogTWFwTGlrZTxzdHJpbmdbXT4sXG4pOiBJdGVyYWJsZTxzdHJpbmc+IHtcbiAgLy8gY2hlY2sgaWYgYW55IHBhdGggbWFwcGluZyBydWxlcyBhcmUgcmVsZXZhbnRcbiAgY29uc3QgcGF0aE1hcE9wdGlvbnMgPSBbXTtcbiAgZm9yIChjb25zdCBwYXR0ZXJuIGluIHBhdGhzKSB7XG4gICAgLy8gZ2V0IHBvdGVudGlhbHMgYW5kIHJlbW92ZSBkdXBsaWNhdGVzOyBKUyBTZXQgbWFpbnRhaW5zIGluc2VydGlvbiBvcmRlclxuICAgIGNvbnN0IHBvdGVudGlhbHMgPSBBcnJheS5mcm9tKG5ldyBTZXQocGF0aHNbcGF0dGVybl0pKTtcbiAgICBpZiAocG90ZW50aWFscy5sZW5ndGggPT09IDApIHtcbiAgICAgIC8vIG5vIHBvdGVudGlhbCByZXBsYWNlbWVudHMgc28gc2tpcFxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gY2FuIG9ubHkgY29udGFpbiB6ZXJvIG9yIG9uZVxuICAgIGNvbnN0IHN0YXJJbmRleCA9IHBhdHRlcm4uaW5kZXhPZignKicpO1xuICAgIGlmIChzdGFySW5kZXggPT09IC0xKSB7XG4gICAgICBpZiAocGF0dGVybiA9PT0gb3JpZ2luYWxSZXF1ZXN0KSB7XG4gICAgICAgIHBhdGhNYXBPcHRpb25zLnB1c2goe1xuICAgICAgICAgIHN0YXJJbmRleCxcbiAgICAgICAgICBwYXJ0aWFsOiAnJyxcbiAgICAgICAgICBwb3RlbnRpYWxzLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHN0YXJJbmRleCA9PT0gMCAmJiBwYXR0ZXJuLmxlbmd0aCA9PT0gMSkge1xuICAgICAgaWYgKHBvdGVudGlhbHMubGVuZ3RoID09PSAxICYmIHBvdGVudGlhbHNbMF0gPT09ICcqJykge1xuICAgICAgICAvLyBpZGVudGl0eSBtYXBwaW5nIC0+IG5vb3BcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBwYXRoTWFwT3B0aW9ucy5wdXNoKHtcbiAgICAgICAgc3RhckluZGV4LFxuICAgICAgICBwYXJ0aWFsOiBvcmlnaW5hbFJlcXVlc3QsXG4gICAgICAgIHBvdGVudGlhbHMsXG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHN0YXJJbmRleCA9PT0gcGF0dGVybi5sZW5ndGggLSAxKSB7XG4gICAgICBpZiAob3JpZ2luYWxSZXF1ZXN0LnN0YXJ0c1dpdGgocGF0dGVybi5zbGljZSgwLCAtMSkpKSB7XG4gICAgICAgIHBhdGhNYXBPcHRpb25zLnB1c2goe1xuICAgICAgICAgIHN0YXJJbmRleCxcbiAgICAgICAgICBwYXJ0aWFsOiBvcmlnaW5hbFJlcXVlc3Quc2xpY2UocGF0dGVybi5sZW5ndGggLSAxKSxcbiAgICAgICAgICBwb3RlbnRpYWxzLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgW3ByZWZpeCwgc3VmZml4XSA9IHBhdHRlcm4uc3BsaXQoJyonKTtcbiAgICAgIGlmIChvcmlnaW5hbFJlcXVlc3Quc3RhcnRzV2l0aChwcmVmaXgpICYmIG9yaWdpbmFsUmVxdWVzdC5lbmRzV2l0aChzdWZmaXgpKSB7XG4gICAgICAgIHBhdGhNYXBPcHRpb25zLnB1c2goe1xuICAgICAgICAgIHN0YXJJbmRleCxcbiAgICAgICAgICBwYXJ0aWFsOiBvcmlnaW5hbFJlcXVlc3Quc2xpY2UocHJlZml4Lmxlbmd0aCkuc2xpY2UoMCwgLXN1ZmZpeC5sZW5ndGgpLFxuICAgICAgICAgIHBvdGVudGlhbHMsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmIChwYXRoTWFwT3B0aW9ucy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICAvLyBleGFjdCBtYXRjaGVzIHRha2UgcHJpb3JpdHkgdGhlbiBsYXJnZXN0IHByZWZpeCBtYXRjaFxuICBwYXRoTWFwT3B0aW9ucy5zb3J0KChhLCBiKSA9PiB7XG4gICAgaWYgKGEuc3RhckluZGV4ID09PSAtMSkge1xuICAgICAgcmV0dXJuIC0xO1xuICAgIH0gZWxzZSBpZiAoYi5zdGFySW5kZXggPT09IC0xKSB7XG4gICAgICByZXR1cm4gMTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGIuc3RhckluZGV4IC0gYS5zdGFySW5kZXg7XG4gICAgfVxuICB9KTtcblxuICBjb25zdCByZXBsYWNlbWVudHM6IHN0cmluZ1tdID0gW107XG4gIHBhdGhNYXBPcHRpb25zLmZvckVhY2gob3B0aW9uID0+IHtcbiAgICBmb3IgKGNvbnN0IHBvdGVudGlhbCBvZiBvcHRpb24ucG90ZW50aWFscykge1xuICAgICAgbGV0IHJlcGxhY2VtZW50O1xuICAgICAgY29uc3Qgc3RhckluZGV4ID0gcG90ZW50aWFsLmluZGV4T2YoJyonKTtcbiAgICAgIGlmIChzdGFySW5kZXggPT09IC0xKSB7XG4gICAgICAgIHJlcGxhY2VtZW50ID0gcG90ZW50aWFsO1xuICAgICAgfSBlbHNlIGlmIChzdGFySW5kZXggPT09IHBvdGVudGlhbC5sZW5ndGggLSAxKSB7XG4gICAgICAgIHJlcGxhY2VtZW50ID0gcG90ZW50aWFsLnNsaWNlKDAsIC0xKSArIG9wdGlvbi5wYXJ0aWFsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgW3ByZWZpeCwgc3VmZml4XSA9IHBvdGVudGlhbC5zcGxpdCgnKicpO1xuICAgICAgICByZXBsYWNlbWVudCA9IHByZWZpeCArIG9wdGlvbi5wYXJ0aWFsICsgc3VmZml4O1xuICAgICAgfVxuXG4gICAgICByZXBsYWNlbWVudHMucHVzaChyZXBsYWNlbWVudCk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gcmVwbGFjZW1lbnRzO1xufVxuIl19