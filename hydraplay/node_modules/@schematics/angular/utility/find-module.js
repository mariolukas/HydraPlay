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
const MODULE_EXT = '.module.ts';
const ROUTING_MODULE_EXT = '-routing.module.ts';
/**
 * Find the module referred by a set of options passed to the schematics.
 */
function findModuleFromOptions(host, options) {
    if (options.hasOwnProperty('skipImport') && options.skipImport) {
        return undefined;
    }
    const moduleExt = options.moduleExt || MODULE_EXT;
    const routingModuleExt = options.routingModuleExt || ROUTING_MODULE_EXT;
    if (!options.module) {
        const pathToCheck = (options.path || '') + '/' + options.name;
        return core_1.normalize(findModule(host, pathToCheck, moduleExt, routingModuleExt));
    }
    else {
        const modulePath = core_1.normalize(`/${options.path}/${options.module}`);
        const componentPath = core_1.normalize(`/${options.path}/${options.name}`);
        const moduleBaseName = core_1.normalize(modulePath).split('/').pop();
        const candidateSet = new Set([
            core_1.normalize(options.path || '/'),
        ]);
        for (let dir = modulePath; dir != core_1.NormalizedRoot; dir = core_1.dirname(dir)) {
            candidateSet.add(dir);
        }
        for (let dir = componentPath; dir != core_1.NormalizedRoot; dir = core_1.dirname(dir)) {
            candidateSet.add(dir);
        }
        const candidatesDirs = [...candidateSet].sort((a, b) => b.length - a.length);
        for (const c of candidatesDirs) {
            const candidateFiles = [
                '',
                `${moduleBaseName}.ts`,
                `${moduleBaseName}${moduleExt}`,
            ].map(x => core_1.join(c, x));
            for (const sc of candidateFiles) {
                if (host.exists(sc)) {
                    return core_1.normalize(sc);
                }
            }
        }
        throw new Error(`Specified module '${options.module}' does not exist.\n`
            + `Looked in the following directories:\n    ${candidatesDirs.join('\n    ')}`);
    }
}
exports.findModuleFromOptions = findModuleFromOptions;
/**
 * Function to find the "closest" module to a generated file's path.
 */
function findModule(host, generateDir, moduleExt = MODULE_EXT, routingModuleExt = ROUTING_MODULE_EXT) {
    let dir = host.getDir('/' + generateDir);
    let foundRoutingModule = false;
    while (dir) {
        const allMatches = dir.subfiles.filter(p => p.endsWith(moduleExt));
        const filteredMatches = allMatches.filter(p => !p.endsWith(routingModuleExt));
        foundRoutingModule = foundRoutingModule || allMatches.length !== filteredMatches.length;
        if (filteredMatches.length == 1) {
            return core_1.join(dir.path, filteredMatches[0]);
        }
        else if (filteredMatches.length > 1) {
            throw new Error('More than one module matches. Use skip-import option to skip importing '
                + 'the component into the closest module.');
        }
        dir = dir.parent;
    }
    const errorMsg = foundRoutingModule ? 'Could not find a non Routing NgModule.'
        + `\nModules with suffix '${routingModuleExt}' are strictly reserved for routing.`
        + '\nUse the skip-import option to skip importing in NgModule.'
        : 'Could not find an NgModule. Use the skip-import option to skip importing in NgModule.';
    throw new Error(errorMsg);
}
exports.findModule = findModule;
/**
 * Build a relative path from one file path to another file path.
 */
function buildRelativePath(from, to) {
    from = core_1.normalize(from);
    to = core_1.normalize(to);
    // Convert to arrays.
    const fromParts = from.split('/');
    const toParts = to.split('/');
    // Remove file names (preserving destination)
    fromParts.pop();
    const toFileName = toParts.pop();
    const relativePath = core_1.relative(core_1.normalize(fromParts.join('/')), core_1.normalize(toParts.join('/')));
    let pathPrefix = '';
    // Set the path prefix for same dir or child dir, parent dir starts with `..`
    if (!relativePath) {
        pathPrefix = '.';
    }
    else if (!relativePath.startsWith('.')) {
        pathPrefix = `./`;
    }
    if (pathPrefix && !pathPrefix.endsWith('/')) {
        pathPrefix += '/';
    }
    return pathPrefix + (relativePath ? relativePath + '/' : '') + toFileName;
}
exports.buildRelativePath = buildRelativePath;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmluZC1tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL3NjaGVtYXRpY3MvYW5ndWxhci91dGlsaXR5L2ZpbmQtbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7OztHQU1HO0FBQ0gsK0NBTzhCO0FBYzlCLE1BQU0sVUFBVSxHQUFHLFlBQVksQ0FBQztBQUNoQyxNQUFNLGtCQUFrQixHQUFHLG9CQUFvQixDQUFDO0FBRWhEOztHQUVHO0FBQ0gsU0FBZ0IscUJBQXFCLENBQUMsSUFBVSxFQUFFLE9BQXNCO0lBQ3RFLElBQUksT0FBTyxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsSUFBSSxPQUFPLENBQUMsVUFBVSxFQUFFO1FBQzlELE9BQU8sU0FBUyxDQUFDO0tBQ2xCO0lBRUQsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsSUFBSSxVQUFVLENBQUM7SUFDbEQsTUFBTSxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLElBQUksa0JBQWtCLENBQUM7SUFFeEUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUU7UUFDbkIsTUFBTSxXQUFXLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxHQUFHLEdBQUcsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDO1FBRTlELE9BQU8sZ0JBQVMsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO0tBQzlFO1NBQU07UUFDTCxNQUFNLFVBQVUsR0FBRyxnQkFBUyxDQUFDLElBQUksT0FBTyxDQUFDLElBQUksSUFBSSxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUNuRSxNQUFNLGFBQWEsR0FBRyxnQkFBUyxDQUFDLElBQUksT0FBTyxDQUFDLElBQUksSUFBSSxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNwRSxNQUFNLGNBQWMs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QUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFDM0MsVUFBVSxJQUFJLEdBQUcsQ0FBQztLQUNuQjtJQUVELE9BQU8sVUFBVSxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxZQUFZLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxVQUFVLENBQUM7QUFDNUUsQ0FBQztBQTFCRCw4Q0EwQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge1xuICBOb3JtYWxpemVkUm9vdCxcbiAgUGF0aCxcbiAgZGlybmFtZSxcbiAgam9pbixcbiAgbm9ybWFsaXplLFxuICByZWxhdGl2ZSxcbn0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2NvcmUnO1xuaW1wb3J0IHsgRGlyRW50cnksIFRyZWUgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcyc7XG5cblxuZXhwb3J0IGludGVyZmFjZSBNb2R1bGVPcHRpb25zIHtcbiAgbW9kdWxlPzogc3RyaW5nO1xuICBuYW1lOiBzdHJpbmc7XG4gIGZsYXQ/OiBib29sZWFuO1xuICBwYXRoPzogc3RyaW5nO1xuICBza2lwSW1wb3J0PzogYm9vbGVhbjtcbiAgbW9kdWxlRXh0Pzogc3RyaW5nO1xuICByb3V0aW5nTW9kdWxlRXh0Pzogc3RyaW5nO1xufVxuXG5jb25zdCBNT0RVTEVfRVhUID0gJy5tb2R1bGUudHMnO1xuY29uc3QgUk9VVElOR19NT0RVTEVfRVhUID0gJy1yb3V0aW5nLm1vZHVsZS50cyc7XG5cbi8qKlxuICogRmluZCB0aGUgbW9kdWxlIHJlZmVycmVkIGJ5IGEgc2V0IG9mIG9wdGlvbnMgcGFzc2VkIHRvIHRoZSBzY2hlbWF0aWNzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZmluZE1vZHVsZUZyb21PcHRpb25zKGhvc3Q6IFRyZWUsIG9wdGlvbnM6IE1vZHVsZU9wdGlvbnMpOiBQYXRoIHwgdW5kZWZpbmVkIHtcbiAgaWYgKG9wdGlvbnMuaGFzT3duUHJvcGVydHkoJ3NraXBJbXBvcnQnKSAmJiBvcHRpb25zLnNraXBJbXBvcnQpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgY29uc3QgbW9kdWxlRXh0ID0gb3B0aW9ucy5tb2R1bGVFeHQgfHwgTU9EVUxFX0VYVDtcbiAgY29uc3Qgcm91dGluZ01vZHVsZUV4dCA9IG9wdGlvbnMucm91dGluZ01vZHVsZUV4dCB8fCBST1VUSU5HX01PRFVMRV9FWFQ7XG5cbiAgaWYgKCFvcHRpb25zLm1vZHVsZSkge1xuICAgIGNvbnN0IHBhdGhUb0NoZWNrID0gKG9wdGlvbnMucGF0aCB8fCAnJykgKyAnLycgKyBvcHRpb25zLm5hbWU7XG5cbiAgICByZXR1cm4gbm9ybWFsaXplKGZpbmRNb2R1bGUoaG9zdCwgcGF0aFRvQ2hlY2ssIG1vZHVsZUV4dCwgcm91dGluZ01vZHVsZUV4dCkpO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IG1vZHVsZVBhdGggPSBub3JtYWxpemUoYC8ke29wdGlvbnMucGF0aH0vJHtvcHRpb25zLm1vZHVsZX1gKTtcbiAgICBjb25zdCBjb21wb25lbnRQYXRoID0gbm9ybWFsaXplKGAvJHtvcHRpb25zLnBhdGh9LyR7b3B0aW9ucy5uYW1lfWApO1xuICAgIGNvbnN0IG1vZHVsZUJhc2VOYW1lID0gbm9ybWFsaXplKG1vZHVsZVBhdGgpLnNwbGl0KCcvJykucG9wKCk7XG5cbiAgICBjb25zdCBjYW5kaWRhdGVTZXQgPSBuZXcgU2V0PFBhdGg+KFtcbiAgICAgIG5vcm1hbGl6ZShvcHRpb25zLnBhdGggfHwgJy8nKSxcbiAgICBdKTtcblxuICAgIGZvciAobGV0IGRpciA9IG1vZHVsZVBhdGg7IGRpciAhPSBOb3JtYWxpemVkUm9vdDsgZGlyID0gZGlybmFtZShkaXIpKSB7XG4gICAgICBjYW5kaWRhdGVTZXQuYWRkKGRpcik7XG4gICAgfVxuICAgIGZvciAobGV0IGRpciA9IGNvbXBvbmVudFBhdGg7IGRpciAhPSBOb3JtYWxpemVkUm9vdDsgZGlyID0gZGlybmFtZShkaXIpKSB7XG4gICAgICBjYW5kaWRhdGVTZXQuYWRkKGRpcik7XG4gICAgfVxuXG4gICAgY29uc3QgY2FuZGlkYXRlc0RpcnMgPSBbLi4uY2FuZGlkYXRlU2V0XS5zb3J0KChhLCBiKSA9PiBiLmxlbmd0aCAtIGEubGVuZ3RoKTtcbiAgICBmb3IgKGNvbnN0IGMgb2YgY2FuZGlkYXRlc0RpcnMpIHtcbiAgICAgIGNvbnN0IGNhbmRpZGF0ZUZpbGVzID0gW1xuICAgICAgICAnJyxcbiAgICAgICAgYCR7bW9kdWxlQmFzZU5hbWV9LnRzYCxcbiAgICAgICAgYCR7bW9kdWxlQmFzZU5hbWV9JHttb2R1bGVFeHR9YCxcbiAgICAgIF0ubWFwKHggPT4gam9pbihjLCB4KSk7XG5cbiAgICAgIGZvciAoY29uc3Qgc2Mgb2YgY2FuZGlkYXRlRmlsZXMpIHtcbiAgICAgICAgaWYgKGhvc3QuZXhpc3RzKHNjKSkge1xuICAgICAgICAgIHJldHVybiBub3JtYWxpemUoc2MpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYFNwZWNpZmllZCBtb2R1bGUgJyR7b3B0aW9ucy5tb2R1bGV9JyBkb2VzIG5vdCBleGlzdC5cXG5gXG4gICAgICAgICsgYExvb2tlZCBpbiB0aGUgZm9sbG93aW5nIGRpcmVjdG9yaWVzOlxcbiAgICAke2NhbmRpZGF0ZXNEaXJzLmpvaW4oJ1xcbiAgICAnKX1gLFxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byBmaW5kIHRoZSBcImNsb3Nlc3RcIiBtb2R1bGUgdG8gYSBnZW5lcmF0ZWQgZmlsZSdzIHBhdGguXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaW5kTW9kdWxlKGhvc3Q6IFRyZWUsIGdlbmVyYXRlRGlyOiBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVFeHQgPSBNT0RVTEVfRVhULCByb3V0aW5nTW9kdWxlRXh0ID0gUk9VVElOR19NT0RVTEVfRVhUKTogUGF0aCB7XG5cbiAgbGV0IGRpcjogRGlyRW50cnkgfCBudWxsID0gaG9zdC5nZXREaXIoJy8nICsgZ2VuZXJhdGVEaXIpO1xuICBsZXQgZm91bmRSb3V0aW5nTW9kdWxlID0gZmFsc2U7XG5cbiAgd2hpbGUgKGRpcikge1xuICAgIGNvbnN0IGFsbE1hdGNoZXMgPSBkaXIuc3ViZmlsZXMuZmlsdGVyKHAgPT4gcC5lbmRzV2l0aChtb2R1bGVFeHQpKTtcbiAgICBjb25zdCBmaWx0ZXJlZE1hdGNoZXMgPSBhbGxNYXRjaGVzLmZpbHRlcihwID0+ICFwLmVuZHNXaXRoKHJvdXRpbmdNb2R1bGVFeHQpKTtcblxuICAgIGZvdW5kUm91dGluZ01vZHVsZSA9IGZvdW5kUm91dGluZ01vZHVsZSB8fCBhbGxNYXRjaGVzLmxlbmd0aCAhPT0gZmlsdGVyZWRNYXRjaGVzLmxlbmd0aDtcblxuICAgIGlmIChmaWx0ZXJlZE1hdGNoZXMubGVuZ3RoID09IDEpIHtcbiAgICAgIHJldHVybiBqb2luKGRpci5wYXRoLCBmaWx0ZXJlZE1hdGNoZXNbMF0pO1xuICAgIH0gZWxzZSBpZiAoZmlsdGVyZWRNYXRjaGVzLmxlbmd0aCA+IDEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTW9yZSB0aGFuIG9uZSBtb2R1bGUgbWF0Y2hlcy4gVXNlIHNraXAtaW1wb3J0IG9wdGlvbiB0byBza2lwIGltcG9ydGluZyAnXG4gICAgICAgICsgJ3RoZSBjb21wb25lbnQgaW50byB0aGUgY2xvc2VzdCBtb2R1bGUuJyk7XG4gICAgfVxuXG4gICAgZGlyID0gZGlyLnBhcmVudDtcbiAgfVxuXG4gIGNvbnN0IGVycm9yTXNnID0gZm91bmRSb3V0aW5nTW9kdWxlID8gJ0NvdWxkIG5vdCBmaW5kIGEgbm9uIFJvdXRpbmcgTmdNb2R1bGUuJ1xuICAgICsgYFxcbk1vZHVsZXMgd2l0aCBzdWZmaXggJyR7cm91dGluZ01vZHVsZUV4dH0nIGFyZSBzdHJpY3RseSByZXNlcnZlZCBmb3Igcm91dGluZy5gXG4gICAgKyAnXFxuVXNlIHRoZSBza2lwLWltcG9ydCBvcHRpb24gdG8gc2tpcCBpbXBvcnRpbmcgaW4gTmdNb2R1bGUuJ1xuICAgIDogJ0NvdWxkIG5vdCBmaW5kIGFuIE5nTW9kdWxlLiBVc2UgdGhlIHNraXAtaW1wb3J0IG9wdGlvbiB0byBza2lwIGltcG9ydGluZyBpbiBOZ01vZHVsZS4nO1xuXG4gIHRocm93IG5ldyBFcnJvcihlcnJvck1zZyk7XG59XG5cbi8qKlxuICogQnVpbGQgYSByZWxhdGl2ZSBwYXRoIGZyb20gb25lIGZpbGUgcGF0aCB0byBhbm90aGVyIGZpbGUgcGF0aC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkUmVsYXRpdmVQYXRoKGZyb206IHN0cmluZywgdG86IHN0cmluZyk6IHN0cmluZyB7XG4gIGZyb20gPSBub3JtYWxpemUoZnJvbSk7XG4gIHRvID0gbm9ybWFsaXplKHRvKTtcblxuICAvLyBDb252ZXJ0IHRvIGFycmF5cy5cbiAgY29uc3QgZnJvbVBhcnRzID0gZnJvbS5zcGxpdCgnLycpO1xuICBjb25zdCB0b1BhcnRzID0gdG8uc3BsaXQoJy8nKTtcblxuICAvLyBSZW1vdmUgZmlsZSBuYW1lcyAocHJlc2VydmluZyBkZXN0aW5hdGlvbilcbiAgZnJvbVBhcnRzLnBvcCgpO1xuICBjb25zdCB0b0ZpbGVOYW1lID0gdG9QYXJ0cy5wb3AoKTtcblxuICBjb25zdCByZWxhdGl2ZVBhdGggPSByZWxhdGl2ZShub3JtYWxpemUoZnJvbVBhcnRzLmpvaW4oJy8nKSksIG5vcm1hbGl6ZSh0b1BhcnRzLmpvaW4oJy8nKSkpO1xuICBsZXQgcGF0aFByZWZpeCA9ICcnO1xuXG4gIC8vIFNldCB0aGUgcGF0aCBwcmVmaXggZm9yIHNhbWUgZGlyIG9yIGNoaWxkIGRpciwgcGFyZW50IGRpciBzdGFydHMgd2l0aCBgLi5gXG4gIGlmICghcmVsYXRpdmVQYXRoKSB7XG4gICAgcGF0aFByZWZpeCA9ICcuJztcbiAgfSBlbHNlIGlmICghcmVsYXRpdmVQYXRoLnN0YXJ0c1dpdGgoJy4nKSkge1xuICAgIHBhdGhQcmVmaXggPSBgLi9gO1xuICB9XG4gIGlmIChwYXRoUHJlZml4ICYmICFwYXRoUHJlZml4LmVuZHNXaXRoKCcvJykpIHtcbiAgICBwYXRoUHJlZml4ICs9ICcvJztcbiAgfVxuXG4gIHJldHVybiBwYXRoUHJlZml4ICsgKHJlbGF0aXZlUGF0aCA/IHJlbGF0aXZlUGF0aCArICcvJyA6ICcnKSArIHRvRmlsZU5hbWU7XG59XG4iXX0=