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
class MissingAssetSourceRootException extends core_1.BaseException {
    constructor(path) {
        super(`The ${path} asset path must start with the project source root.`);
    }
}
exports.MissingAssetSourceRootException = MissingAssetSourceRootException;
function normalizeAssetPatterns(assetPatterns, host, root, projectRoot, maybeSourceRoot) {
    // When sourceRoot is not available, we default to ${projectRoot}/src.
    const sourceRoot = maybeSourceRoot || core_1.join(projectRoot, 'src');
    const resolvedSourceRoot = core_1.resolve(root, sourceRoot);
    if (assetPatterns.length === 0) {
        return [];
    }
    return assetPatterns
        .map(assetPattern => {
        // Normalize string asset patterns to objects.
        if (typeof assetPattern === 'string') {
            const assetPath = core_1.normalize(assetPattern);
            const resolvedAssetPath = core_1.resolve(root, assetPath);
            // Check if the string asset is within sourceRoot.
            if (!resolvedAssetPath.startsWith(resolvedSourceRoot)) {
                throw new MissingAssetSourceRootException(assetPattern);
            }
            let glob, input, output;
            let isDirectory = false;
            try {
                isDirectory = host.isDirectory(resolvedAssetPath);
            }
            catch (_a) {
                isDirectory = true;
            }
            if (isDirectory) {
                // Folders get a recursive star glob.
                glob = '**/*';
                // Input directory is their original path.
                input = assetPath;
            }
            else {
                // Files are their own glob.
                glob = core_1.basename(assetPath);
                // Input directory is their original dirname.
                input = core_1.dirname(assetPath);
            }
            // Output directory for both is the relative path from source root to input.
            output = core_1.relative(resolvedSourceRoot, core_1.resolve(root, input));
            // Return the asset pattern in object format.
            return { glob, input, output };
        }
        else {
            // It's already an AssetPatternObject, no need to convert.
            return assetPattern;
        }
    });
}
exports.normalizeAssetPatterns = normalizeAssetPatterns;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9ybWFsaXplLWFzc2V0LXBhdHRlcm5zLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9hbmd1bGFyX2RldmtpdC9idWlsZF9hbmd1bGFyL3NyYy91dGlscy9ub3JtYWxpemUtYXNzZXQtcGF0dGVybnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7O0dBTUc7QUFDSCwrQ0FVOEI7QUFJOUIsTUFBYSwrQkFBZ0MsU0FBUSxvQkFBYTtJQUNoRSxZQUFZLElBQVk7UUFDdEIsS0FBSyxDQUFDLE9BQU8sSUFBSSxzREFBc0QsQ0FBQyxDQUFDO0lBQzNFLENBQUM7Q0FDRjtBQUpELDBFQUlDO0FBRUQsU0FBZ0Isc0JBQXNCLENBQ3BDLGFBQTZCLEVBQzdCLElBQWdDLEVBQ2hDLElBQVUsRUFDVixXQUFpQixFQUNqQixlQUFpQztJQUVqQyxzRUFBc0U7SUFDdEUsTUFBTSxVQUFVLEdBQUcsZUFBZSxJQUFJLFdBQUksQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDL0QsTUFBTSxrQkFBa0IsR0FBRyxjQUFPLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBRXJELElBQUksYUFBYSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7UUFDOUIsT0FBTyxFQUFFLENBQUM7S0FDWDtJQUVELE9BQU8sYUFBYTtTQUNqQixHQUFHLENBQUMsWUFBWSxDQUFDLEVBQUU7UUFDbEIsOENBQThDO1FBQzlDLElBQUksT0FBTyxZQUFZLEtBQUssUUFBUSxFQUFFO1lBQ3BDLE1BQU0sU0FBUyxHQUFHLGdCQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDMUMsTUFBTSxpQkFBaUIsR0FBRyxjQUFPLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBRW5ELGtEQUFrRDtZQUNsRCxJQUFJLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLGtCQUFrQixDQUFDLEVBQUU7Z0JBQ3JELE1BQU0sSUFBSSwrQkFBK0IsQ0FBQyxZQUFZLENBQUMsQ0FBQzthQUN6RDtZQUVELElBQUksSUFBWSxFQUFFLEtBQVcsRUFBRSxNQUFZLENBQUM7WUFDNUMsSUFBSSxXQUFXLEdBQUcsS0FBSyxDQUFDO1lBRXhCLElBQUk7Z0JBQ0YsV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUMsQ0FBQzthQUNuRDtZQUFDLFdBQU07Z0JBQ04sV0FBVyxHQUFHLElBQUksQ0FBQzthQUNwQjtZQUVELElBQUksV0FBVyxFQUFFO2dCQUNmLHFDQUFxQztnQkFDckMsSUFBSSxHQUFHLE1BQU0sQ0FBQztnQkFDZCwwQ0FBMEM7Z0JBQzFDLEtBQUssR0FBRyxTQUFTLENBQUM7YUFDbkI7aUJBQU07Z0JBQ0wsNEJBQTRCO2dCQUM1QixJQUFJLEdBQUcsZUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUMzQiw2Q0FBNkM7Z0JBQzdDLEtBQUssR0FBRyxjQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDNUI7WUFFRCw0RUFBNEU7WUFDNUUsTUFBTSxHQUFHLGVBQVEsQ0FBQyxrQkFBa0IsRUFBRSxjQUFPLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFFNUQsNkNBQTZDO1lBQzdDLE9BQU8sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDO1NBQ2hDO2FBQU07WUFDTCwwREFBMEQ7WUFDMUQsT0FBTyxZQUFZLENBQUM7U0FDckI7SUFDSCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUExREQsd0RBMERDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtcbiAgQmFzZUV4Y2VwdGlvbixcbiAgUGF0aCxcbiAgYmFzZW5hbWUsXG4gIGRpcm5hbWUsXG4gIGpvaW4sXG4gIG5vcm1hbGl6ZSxcbiAgcmVsYXRpdmUsXG4gIHJlc29sdmUsXG4gIHZpcnR1YWxGcyxcbn0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2NvcmUnO1xuaW1wb3J0IHsgQXNzZXRQYXR0ZXJuLCBBc3NldFBhdHRlcm5PYmplY3QgfSBmcm9tICcuLi9icm93c2VyL3NjaGVtYSc7XG5cblxuZXhwb3J0IGNsYXNzIE1pc3NpbmdBc3NldFNvdXJjZVJvb3RFeGNlcHRpb24gZXh0ZW5kcyBCYXNlRXhjZXB0aW9uIHtcbiAgY29uc3RydWN0b3IocGF0aDogU3RyaW5nKSB7XG4gICAgc3VwZXIoYFRoZSAke3BhdGh9IGFzc2V0IHBhdGggbXVzdCBzdGFydCB3aXRoIHRoZSBwcm9qZWN0IHNvdXJjZSByb290LmApO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVBc3NldFBhdHRlcm5zKFxuICBhc3NldFBhdHRlcm5zOiBBc3NldFBhdHRlcm5bXSxcbiAgaG9zdDogdmlydHVhbEZzLlN5bmNEZWxlZ2F0ZUhvc3QsXG4gIHJvb3Q6IFBhdGgsXG4gIHByb2plY3RSb290OiBQYXRoLFxuICBtYXliZVNvdXJjZVJvb3Q6IFBhdGggfCB1bmRlZmluZWQsXG4pOiBBc3NldFBhdHRlcm5PYmplY3RbXSB7XG4gIC8vIFdoZW4gc291cmNlUm9vdCBpcyBub3QgYXZhaWxhYmxlLCB3ZSBkZWZhdWx0IHRvICR7cHJvamVjdFJvb3R9L3NyYy5cbiAgY29uc3Qgc291cmNlUm9vdCA9IG1heWJlU291cmNlUm9vdCB8fCBqb2luKHByb2plY3RSb290LCAnc3JjJyk7XG4gIGNvbnN0IHJlc29sdmVkU291cmNlUm9vdCA9IHJlc29sdmUocm9vdCwgc291cmNlUm9vdCk7XG5cbiAgaWYgKGFzc2V0UGF0dGVybnMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgcmV0dXJuIGFzc2V0UGF0dGVybnNcbiAgICAubWFwKGFzc2V0UGF0dGVybiA9PiB7XG4gICAgICAvLyBOb3JtYWxpemUgc3RyaW5nIGFzc2V0IHBhdHRlcm5zIHRvIG9iamVjdHMuXG4gICAgICBpZiAodHlwZW9mIGFzc2V0UGF0dGVybiA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgY29uc3QgYXNzZXRQYXRoID0gbm9ybWFsaXplKGFzc2V0UGF0dGVybik7XG4gICAgICAgIGNvbnN0IHJlc29sdmVkQXNzZXRQYXRoID0gcmVzb2x2ZShyb290LCBhc3NldFBhdGgpO1xuXG4gICAgICAgIC8vIENoZWNrIGlmIHRoZSBzdHJpbmcgYXNzZXQgaXMgd2l0aGluIHNvdXJjZVJvb3QuXG4gICAgICAgIGlmICghcmVzb2x2ZWRBc3NldFBhdGguc3RhcnRzV2l0aChyZXNvbHZlZFNvdXJjZVJvb3QpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IE1pc3NpbmdBc3NldFNvdXJjZVJvb3RFeGNlcHRpb24oYXNzZXRQYXR0ZXJuKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBnbG9iOiBzdHJpbmcsIGlucHV0OiBQYXRoLCBvdXRwdXQ6IFBhdGg7XG4gICAgICAgIGxldCBpc0RpcmVjdG9yeSA9IGZhbHNlO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaXNEaXJlY3RvcnkgPSBob3N0LmlzRGlyZWN0b3J5KHJlc29sdmVkQXNzZXRQYXRoKTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgaXNEaXJlY3RvcnkgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlzRGlyZWN0b3J5KSB7XG4gICAgICAgICAgLy8gRm9sZGVycyBnZXQgYSByZWN1cnNpdmUgc3RhciBnbG9iLlxuICAgICAgICAgIGdsb2IgPSAnKiovKic7XG4gICAgICAgICAgLy8gSW5wdXQgZGlyZWN0b3J5IGlzIHRoZWlyIG9yaWdpbmFsIHBhdGguXG4gICAgICAgICAgaW5wdXQgPSBhc3NldFBhdGg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gRmlsZXMgYXJlIHRoZWlyIG93biBnbG9iLlxuICAgICAgICAgIGdsb2IgPSBiYXNlbmFtZShhc3NldFBhdGgpO1xuICAgICAgICAgIC8vIElucHV0IGRpcmVjdG9yeSBpcyB0aGVpciBvcmlnaW5hbCBkaXJuYW1lLlxuICAgICAgICAgIGlucHV0ID0gZGlybmFtZShhc3NldFBhdGgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gT3V0cHV0IGRpcmVjdG9yeSBmb3IgYm90aCBpcyB0aGUgcmVsYXRpdmUgcGF0aCBmcm9tIHNvdXJjZSByb290IHRvIGlucHV0LlxuICAgICAgICBvdXRwdXQgPSByZWxhdGl2ZShyZXNvbHZlZFNvdXJjZVJvb3QsIHJlc29sdmUocm9vdCwgaW5wdXQpKTtcblxuICAgICAgICAvLyBSZXR1cm4gdGhlIGFzc2V0IHBhdHRlcm4gaW4gb2JqZWN0IGZvcm1hdC5cbiAgICAgICAgcmV0dXJuIHsgZ2xvYiwgaW5wdXQsIG91dHB1dCB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gSXQncyBhbHJlYWR5IGFuIEFzc2V0UGF0dGVybk9iamVjdCwgbm8gbmVlZCB0byBjb252ZXJ0LlxuICAgICAgICByZXR1cm4gYXNzZXRQYXR0ZXJuO1xuICAgICAgfVxuICAgIH0pO1xufVxuIl19