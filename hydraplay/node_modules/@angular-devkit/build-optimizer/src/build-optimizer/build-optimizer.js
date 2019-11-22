"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const fs_1 = require("fs");
const transform_javascript_1 = require("../helpers/transform-javascript");
const class_fold_1 = require("../transforms/class-fold");
const import_tslib_1 = require("../transforms/import-tslib");
const prefix_classes_1 = require("../transforms/prefix-classes");
const prefix_functions_1 = require("../transforms/prefix-functions");
const scrub_file_1 = require("../transforms/scrub-file");
const wrap_enums_1 = require("../transforms/wrap-enums");
// Angular packages are known to have no side effects.
const whitelistedAngularModules = [
    /[\\/]node_modules[\\/]@angular[\\/]animations[\\/]/,
    /[\\/]node_modules[\\/]@angular[\\/]common[\\/]/,
    /[\\/]node_modules[\\/]@angular[\\/]compiler[\\/]/,
    /[\\/]node_modules[\\/]@angular[\\/]core[\\/]/,
    /[\\/]node_modules[\\/]@angular[\\/]forms[\\/]/,
    /[\\/]node_modules[\\/]@angular[\\/]http[\\/]/,
    /[\\/]node_modules[\\/]@angular[\\/]platform-browser-dynamic[\\/]/,
    /[\\/]node_modules[\\/]@angular[\\/]platform-browser[\\/]/,
    /[\\/]node_modules[\\/]@angular[\\/]platform-webworker-dynamic[\\/]/,
    /[\\/]node_modules[\\/]@angular[\\/]platform-webworker[\\/]/,
    /[\\/]node_modules[\\/]@angular[\\/]router[\\/]/,
    /[\\/]node_modules[\\/]@angular[\\/]upgrade[\\/]/,
    /[\\/]node_modules[\\/]@angular[\\/]material[\\/]/,
    /[\\/]node_modules[\\/]@angular[\\/]cdk[\\/]/,
];
// Factories created by AOT are known to have no side effects.
// In Angular 2/4 the file path for factories can be `.ts`, but in Angular 5 it is `.js`.
const ngFactories = [
    /\.ngfactory\.[jt]s/,
    /\.ngstyle\.[jt]s/,
];
// Known locations for the source files of @angular/core.
const coreFilesRegex = [
    /[\\/]node_modules[\\/]@angular[\\/]core[\\/]esm5[\\/]/,
    /[\\/]node_modules[\\/]@angular[\\/]core[\\/]fesm5[\\/]/,
    /[\\/]node_modules[\\/]@angular[\\/]core[\\/]esm2015[\\/]/,
    /[\\/]node_modules[\\/]@angular[\\/]core[\\/]fesm2015[\\/]/,
];
function isKnownCoreFile(filePath) {
    return coreFilesRegex.some(re => re.test(filePath));
}
function isKnownSideEffectFree(filePath) {
    return ngFactories.some((re) => re.test(filePath)) ||
        whitelistedAngularModules.some((re) => re.test(filePath));
}
function buildOptimizer(options) {
    const { inputFilePath, isAngularCoreFile } = options;
    let { originalFilePath, content } = options;
    if (!originalFilePath && inputFilePath) {
        originalFilePath = inputFilePath;
    }
    if (!inputFilePath && content === undefined) {
        throw new Error('Either filePath or content must be specified in options.');
    }
    if (content === undefined) {
        content = fs_1.readFileSync(inputFilePath, 'UTF-8');
    }
    if (!content) {
        return {
            content: null,
            sourceMap: null,
            emitSkipped: true,
        };
    }
    let selectedGetScrubFileTransformer = scrub_file_1.getScrubFileTransformer;
    if (isAngularCoreFile === true ||
        (isAngularCoreFile === undefined && originalFilePath && isKnownCoreFile(originalFilePath))) {
        selectedGetScrubFileTransformer = scrub_file_1.getScrubFileTransformerForCore;
    }
    const isWebpackBundle = content.indexOf('__webpack_require__') !== -1;
    // Determine which transforms to apply.
    const getTransforms = [];
    let typeCheck = false;
    if (options.isSideEffectFree || originalFilePath && isKnownSideEffectFree(originalFilePath)) {
        getTransforms.push(
        // getPrefixFunctionsTransformer is rather dangerous, apply only to known pure es5 modules.
        // It will mark both `require()` calls and `console.log(stuff)` as pure.
        // We only apply it to whitelisted modules, since we know they are safe.
        // getPrefixFunctionsTransformer needs to be before getFoldFileTransformer.
        prefix_functions_1.getPrefixFunctionsTransformer, selectedGetScrubFileTransformer, class_fold_1.getFoldFileTransformer);
        typeCheck = true;
    }
    else if (scrub_file_1.testScrubFile(content)) {
        // Always test as these require the type checker
        getTransforms.push(selectedGetScrubFileTransformer, class_fold_1.getFoldFileTransformer);
        typeCheck = true;
    }
    // tests are not needed for fast path
    // usage will be expanded once transformers are verified safe
    const ignoreTest = !options.emitSourceMap && !typeCheck;
    if (prefix_classes_1.testPrefixClasses(content)) {
        getTransforms.unshift(prefix_classes_1.getPrefixClassesTransformer);
    }
    // This transform introduces import/require() calls, but this won't work properly on libraries
    // built with Webpack. These libraries use __webpack_require__() calls instead, which will break
    // with a new import that wasn't part of it's original module list.
    // We ignore this transform for such libraries.
    if (!isWebpackBundle && (ignoreTest || import_tslib_1.testImportTslib(content))) {
        getTransforms.unshift(import_tslib_1.getImportTslibTransformer);
    }
    getTransforms.unshift(wrap_enums_1.getWrapEnumsTransformer);
    const transformJavascriptOpts = {
        content: content,
        inputFilePath: options.inputFilePath,
        outputFilePath: options.outputFilePath,
        emitSourceMap: options.emitSourceMap,
        strict: options.strict,
        getTransforms,
        typeCheck,
    };
    return transform_javascript_1.transformJavascript(transformJavascriptOpts);
}
exports.buildOptimizer = buildOptimizer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGQtb3B0aW1pemVyLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9hbmd1bGFyX2RldmtpdC9idWlsZF9vcHRpbWl6ZXIvc3JjL2J1aWxkLW9wdGltaXplci9idWlsZC1vcHRpbWl6ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7O0dBTUc7QUFDSCwyQkFBa0M7QUFDbEMsMEVBSXlDO0FBQ3pDLHlEQUFrRTtBQUNsRSw2REFBd0Y7QUFDeEYsaUVBQThGO0FBQzlGLHFFQUErRTtBQUMvRSx5REFJa0M7QUFDbEMseURBQW1FO0FBR25FLHNEQUFzRDtBQUN0RCxNQUFNLHlCQUF5QixHQUFHO0lBQ2hDLG9EQUFvRDtJQUNwRCxnREFBZ0Q7SUFDaEQsa0RBQWtEO0lBQ2xELDhDQUE4QztJQUM5QywrQ0FBK0M7SUFDL0MsOENBQThDO0lBQzlDLGtFQUFrRTtJQUNsRSwwREFBMEQ7SUFDMUQsb0VBQW9FO0lBQ3BFLDREQUE0RDtJQUM1RCxnREFBZ0Q7SUFDaEQsaURBQWlEO0lBQ2pELGtEQUFrRDtJQUNsRCw2Q0FBNkM7Q0FDOUMsQ0FBQztBQUVGLDhEQUE4RDtBQUM5RCx5RkFBeUY7QUFDekYsTUFBTSxXQUFXLEdBQUc7SUFDbEIsb0JBQW9CO0lBQ3BCLGtCQUFrQjtDQUNuQixDQUFDO0FBRUYseURBQXlEO0FBQ3pELE1BQU0sY0FBYyxHQUFHO0lBQ3JCLHVEQUF1RDtJQUN2RCx3REFBd0Q7SUFDeEQsMERBQTBEO0lBQzFELDJEQUEyRDtDQUM1RCxDQUFDO0FBRUYsU0FBUyxlQUFlLENBQUMsUUFBZ0I7SUFDdkMsT0FBTyxjQUFjLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0FBQ3RELENBQUM7QUFFRCxTQUFTLHFCQUFxQixDQUFDLFFBQWdCO0lBQzdDLE9BQU8sV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUs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QUFhO1FBQ3BDLGNBQWMsRUFBRSxPQUFPLENBQUMsY0FBYztRQUN0QyxhQUFhLEVBQUUsT0FBTyxDQUFDLGFBQWE7UUFDcEMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNO1FBQ3RCLGFBQWE7UUFDYixTQUFTO0tBQ1YsQ0FBQztJQUVGLE9BQU8sMENBQW1CLENBQUMsdUJBQXVCLENBQUMsQ0FBQztBQUN0RCxDQUFDO0FBekZELHdDQXlGQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7IHJlYWRGaWxlU3luYyB9IGZyb20gJ2ZzJztcbmltcG9ydCB7XG4gIFRyYW5zZm9ybUphdmFzY3JpcHRPcHRpb25zLFxuICBUcmFuc2Zvcm1KYXZhc2NyaXB0T3V0cHV0LFxuICB0cmFuc2Zvcm1KYXZhc2NyaXB0LFxufSBmcm9tICcuLi9oZWxwZXJzL3RyYW5zZm9ybS1qYXZhc2NyaXB0JztcbmltcG9ydCB7IGdldEZvbGRGaWxlVHJhbnNmb3JtZXIgfSBmcm9tICcuLi90cmFuc2Zvcm1zL2NsYXNzLWZvbGQnO1xuaW1wb3J0IHsgZ2V0SW1wb3J0VHNsaWJUcmFuc2Zvcm1lciwgdGVzdEltcG9ydFRzbGliIH0gZnJvbSAnLi4vdHJhbnNmb3Jtcy9pbXBvcnQtdHNsaWInO1xuaW1wb3J0IHsgZ2V0UHJlZml4Q2xhc3Nlc1RyYW5zZm9ybWVyLCB0ZXN0UHJlZml4Q2xhc3NlcyB9IGZyb20gJy4uL3RyYW5zZm9ybXMvcHJlZml4LWNsYXNzZXMnO1xuaW1wb3J0IHsgZ2V0UHJlZml4RnVuY3Rpb25zVHJhbnNmb3JtZXIgfSBmcm9tICcuLi90cmFuc2Zvcm1zL3ByZWZpeC1mdW5jdGlvbnMnO1xuaW1wb3J0IHtcbiAgZ2V0U2NydWJGaWxlVHJhbnNmb3JtZXIsXG4gIGdldFNjcnViRmlsZVRyYW5zZm9ybWVyRm9yQ29yZSxcbiAgdGVzdFNjcnViRmlsZSxcbn0gZnJvbSAnLi4vdHJhbnNmb3Jtcy9zY3J1Yi1maWxlJztcbmltcG9ydCB7IGdldFdyYXBFbnVtc1RyYW5zZm9ybWVyIH0gZnJvbSAnLi4vdHJhbnNmb3Jtcy93cmFwLWVudW1zJztcblxuXG4vLyBBbmd1bGFyIHBhY2thZ2VzIGFyZSBrbm93biB0byBoYXZlIG5vIHNpZGUgZWZmZWN0cy5cbmNvbnN0IHdoaXRlbGlzdGVkQW5ndWxhck1vZHVsZXMgPSBbXG4gIC9bXFxcXC9dbm9kZV9tb2R1bGVzW1xcXFwvXUBhbmd1bGFyW1xcXFwvXWFuaW1hdGlvbnNbXFxcXC9dLyxcbiAgL1tcXFxcL11ub2RlX21vZHVsZXNbXFxcXC9dQGFuZ3VsYXJbXFxcXC9dY29tbW9uW1xcXFwvXS8sXG4gIC9bXFxcXC9dbm9kZV9tb2R1bGVzW1xcXFwvXUBhbmd1bGFyW1xcXFwvXWNvbXBpbGVyW1xcXFwvXS8sXG4gIC9bXFxcXC9dbm9kZV9tb2R1bGVzW1xcXFwvXUBhbmd1bGFyW1xcXFwvXWNvcmVbXFxcXC9dLyxcbiAgL1tcXFxcL11ub2RlX21vZHVsZXNbXFxcXC9dQGFuZ3VsYXJbXFxcXC9dZm9ybXNbXFxcXC9dLyxcbiAgL1tcXFxcL11ub2RlX21vZHVsZXNbXFxcXC9dQGFuZ3VsYXJbXFxcXC9daHR0cFtcXFxcL10vLFxuICAvW1xcXFwvXW5vZGVfbW9kdWxlc1tcXFxcL11AYW5ndWxhcltcXFxcL11wbGF0Zm9ybS1icm93c2VyLWR5bmFtaWNbXFxcXC9dLyxcbiAgL1tcXFxcL11ub2RlX21vZHVsZXNbXFxcXC9dQGFuZ3VsYXJbXFxcXC9dcGxhdGZvcm0tYnJvd3NlcltcXFxcL10vLFxuICAvW1xcXFwvXW5vZGVfbW9kdWxlc1tcXFxcL11AYW5ndWxhcltcXFxcL11wbGF0Zm9ybS13ZWJ3b3JrZXItZHluYW1pY1tcXFxcL10vLFxuICAvW1xcXFwvXW5vZGVfbW9kdWxlc1tcXFxcL11AYW5ndWxhcltcXFxcL11wbGF0Zm9ybS13ZWJ3b3JrZXJbXFxcXC9dLyxcbiAgL1tcXFxcL11ub2RlX21vZHVsZXNbXFxcXC9dQGFuZ3VsYXJbXFxcXC9dcm91dGVyW1xcXFwvXS8sXG4gIC9bXFxcXC9dbm9kZV9tb2R1bGVzW1xcXFwvXUBhbmd1bGFyW1xcXFwvXXVwZ3JhZGVbXFxcXC9dLyxcbiAgL1tcXFxcL11ub2RlX21vZHVsZXNbXFxcXC9dQGFuZ3VsYXJbXFxcXC9dbWF0ZXJpYWxbXFxcXC9dLyxcbiAgL1tcXFxcL11ub2RlX21vZHVsZXNbXFxcXC9dQGFuZ3VsYXJbXFxcXC9dY2RrW1xcXFwvXS8sXG5dO1xuXG4vLyBGYWN0b3JpZXMgY3JlYXRlZCBieSBBT1QgYXJlIGtub3duIHRvIGhhdmUgbm8gc2lkZSBlZmZlY3RzLlxuLy8gSW4gQW5ndWxhciAyLzQgdGhlIGZpbGUgcGF0aCBmb3IgZmFjdG9yaWVzIGNhbiBiZSBgLnRzYCwgYnV0IGluIEFuZ3VsYXIgNSBpdCBpcyBgLmpzYC5cbmNvbnN0IG5nRmFjdG9yaWVzID0gW1xuICAvXFwubmdmYWN0b3J5XFwuW2p0XXMvLFxuICAvXFwubmdzdHlsZVxcLltqdF1zLyxcbl07XG5cbi8vIEtub3duIGxvY2F0aW9ucyBmb3IgdGhlIHNvdXJjZSBmaWxlcyBvZiBAYW5ndWxhci9jb3JlLlxuY29uc3QgY29yZUZpbGVzUmVnZXggPSBbXG4gIC9bXFxcXC9dbm9kZV9tb2R1bGVzW1xcXFwvXUBhbmd1bGFyW1xcXFwvXWNvcmVbXFxcXC9dZXNtNVtcXFxcL10vLFxuICAvW1xcXFwvXW5vZGVfbW9kdWxlc1tcXFxcL11AYW5ndWxhcltcXFxcL11jb3JlW1xcXFwvXWZlc201W1xcXFwvXS8sXG4gIC9bXFxcXC9dbm9kZV9tb2R1bGVzW1xcXFwvXUBhbmd1bGFyW1xcXFwvXWNvcmVbXFxcXC9dZXNtMjAxNVtcXFxcL10vLFxuICAvW1xcXFwvXW5vZGVfbW9kdWxlc1tcXFxcL11AYW5ndWxhcltcXFxcL11jb3JlW1xcXFwvXWZlc20yMDE1W1xcXFwvXS8sXG5dO1xuXG5mdW5jdGlvbiBpc0tub3duQ29yZUZpbGUoZmlsZVBhdGg6IHN0cmluZykge1xuICByZXR1cm4gY29yZUZpbGVzUmVnZXguc29tZShyZSA9PiByZS50ZXN0KGZpbGVQYXRoKSk7XG59XG5cbmZ1bmN0aW9uIGlzS25vd25TaWRlRWZmZWN0RnJlZShmaWxlUGF0aDogc3RyaW5nKSB7XG4gIHJldHVybiBuZ0ZhY3Rvcmllcy5zb21lKChyZSkgPT4gcmUudGVzdChmaWxlUGF0aCkpIHx8XG4gICAgd2hpdGVsaXN0ZWRBbmd1bGFyTW9kdWxlcy5zb21lKChyZSkgPT4gcmUudGVzdChmaWxlUGF0aCkpO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEJ1aWxkT3B0aW1pemVyT3B0aW9ucyB7XG4gIGNvbnRlbnQ/OiBzdHJpbmc7XG4gIG9yaWdpbmFsRmlsZVBhdGg/OiBzdHJpbmc7XG4gIGlucHV0RmlsZVBhdGg/OiBzdHJpbmc7XG4gIG91dHB1dEZpbGVQYXRoPzogc3RyaW5nO1xuICBlbWl0U291cmNlTWFwPzogYm9vbGVhbjtcbiAgc3RyaWN0PzogYm9vbGVhbjtcbiAgaXNTaWRlRWZmZWN0RnJlZT86IGJvb2xlYW47XG4gIGlzQW5ndWxhckNvcmVGaWxlPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkT3B0aW1pemVyKG9wdGlvbnM6IEJ1aWxkT3B0aW1pemVyT3B0aW9ucyk6IFRyYW5zZm9ybUphdmFzY3JpcHRPdXRwdXQge1xuXG4gIGNvbnN0IHsgaW5wdXRGaWxlUGF0aCwgaXNBbmd1bGFyQ29yZUZpbGUgfSA9IG9wdGlvbnM7XG4gIGxldCB7IG9yaWdpbmFsRmlsZVBhdGgsIGNvbnRlbnQgfSA9IG9wdGlvbnM7XG5cbiAgaWYgKCFvcmlnaW5hbEZpbGVQYXRoICYmIGlucHV0RmlsZVBhdGgpIHtcbiAgICBvcmlnaW5hbEZpbGVQYXRoID0gaW5wdXRGaWxlUGF0aDtcbiAgfVxuXG4gIGlmICghaW5wdXRGaWxlUGF0aCAmJiBjb250ZW50ID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0VpdGhlciBmaWxlUGF0aCBvciBjb250ZW50IG11c3QgYmUgc3BlY2lmaWVkIGluIG9wdGlvbnMuJyk7XG4gIH1cblxuICBpZiAoY29udGVudCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgY29udGVudCA9IHJlYWRGaWxlU3luYyhpbnB1dEZpbGVQYXRoIGFzIHN0cmluZywgJ1VURi04Jyk7XG4gIH1cblxuICBpZiAoIWNvbnRlbnQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29udGVudDogbnVsbCxcbiAgICAgIHNvdXJjZU1hcDogbnVsbCxcbiAgICAgIGVtaXRTa2lwcGVkOiB0cnVlLFxuICAgIH07XG4gIH1cblxuICBsZXQgc2VsZWN0ZWRHZXRTY3J1YkZpbGVUcmFuc2Zvcm1lciA9IGdldFNjcnViRmlsZVRyYW5zZm9ybWVyO1xuXG4gIGlmIChcbiAgICBpc0FuZ3VsYXJDb3JlRmlsZSA9PT0gdHJ1ZSB8fFxuICAgIChpc0FuZ3VsYXJDb3JlRmlsZSA9PT0gdW5kZWZpbmVkICYmIG9yaWdpbmFsRmlsZVBhdGggJiYgaXNLbm93bkNvcmVGaWxlKG9yaWdpbmFsRmlsZVBhdGgpKVxuICApIHtcbiAgICBzZWxlY3RlZEdldFNjcnViRmlsZVRyYW5zZm9ybWVyID0gZ2V0U2NydWJGaWxlVHJhbnNmb3JtZXJGb3JDb3JlO1xuICB9XG5cbiAgY29uc3QgaXNXZWJwYWNrQnVuZGxlID0gY29udGVudC5pbmRleE9mKCdfX3dlYnBhY2tfcmVxdWlyZV9fJykgIT09IC0xO1xuXG4gIC8vIERldGVybWluZSB3aGljaCB0cmFuc2Zvcm1zIHRvIGFwcGx5LlxuICBjb25zdCBnZXRUcmFuc2Zvcm1zID0gW107XG5cbiAgbGV0IHR5cGVDaGVjayA9IGZhbHNlO1xuICBpZiAob3B0aW9ucy5pc1NpZGVFZmZlY3RGcmVlIHx8IG9yaWdpbmFsRmlsZVBhdGggJiYgaXNLbm93blNpZGVFZmZlY3RGcmVlKG9yaWdpbmFsRmlsZVBhdGgpKSB7XG4gICAgZ2V0VHJhbnNmb3Jtcy5wdXNoKFxuICAgICAgLy8gZ2V0UHJlZml4RnVuY3Rpb25zVHJhbnNmb3JtZXIgaXMgcmF0aGVyIGRhbmdlcm91cywgYXBwbHkgb25seSB0byBrbm93biBwdXJlIGVzNSBtb2R1bGVzLlxuICAgICAgLy8gSXQgd2lsbCBtYXJrIGJvdGggYHJlcXVpcmUoKWAgY2FsbHMgYW5kIGBjb25zb2xlLmxvZyhzdHVmZilgIGFzIHB1cmUuXG4gICAgICAvLyBXZSBvbmx5IGFwcGx5IGl0IHRvIHdoaXRlbGlzdGVkIG1vZHVsZXMsIHNpbmNlIHdlIGtub3cgdGhleSBhcmUgc2FmZS5cbiAgICAgIC8vIGdldFByZWZpeEZ1bmN0aW9uc1RyYW5zZm9ybWVyIG5lZWRzIHRvIGJlIGJlZm9yZSBnZXRGb2xkRmlsZVRyYW5zZm9ybWVyLlxuICAgICAgZ2V0UHJlZml4RnVuY3Rpb25zVHJhbnNmb3JtZXIsXG4gICAgICBzZWxlY3RlZEdldFNjcnViRmlsZVRyYW5zZm9ybWVyLFxuICAgICAgZ2V0Rm9sZEZpbGVUcmFuc2Zvcm1lcixcbiAgICApO1xuICAgIHR5cGVDaGVjayA9IHRydWU7XG4gIH0gZWxzZSBpZiAodGVzdFNjcnViRmlsZShjb250ZW50KSkge1xuICAgIC8vIEFsd2F5cyB0ZXN0IGFzIHRoZXNlIHJlcXVpcmUgdGhlIHR5cGUgY2hlY2tlclxuICAgIGdldFRyYW5zZm9ybXMucHVzaChcbiAgICAgIHNlbGVjdGVkR2V0U2NydWJGaWxlVHJhbnNmb3JtZXIsXG4gICAgICBnZXRGb2xkRmlsZVRyYW5zZm9ybWVyLFxuICAgICk7XG4gICAgdHlwZUNoZWNrID0gdHJ1ZTtcbiAgfVxuXG4gIC8vIHRlc3RzIGFyZSBub3QgbmVlZGVkIGZvciBmYXN0IHBhdGhcbiAgLy8gdXNhZ2Ugd2lsbCBiZSBleHBhbmRlZCBvbmNlIHRyYW5zZm9ybWVycyBhcmUgdmVyaWZpZWQgc2FmZVxuICBjb25zdCBpZ25vcmVUZXN0ID0gIW9wdGlvbnMuZW1pdFNvdXJjZU1hcCAmJiAhdHlwZUNoZWNrO1xuXG4gIGlmICh0ZXN0UHJlZml4Q2xhc3Nlcyhjb250ZW50KSkge1xuICAgIGdldFRyYW5zZm9ybXMudW5zaGlmdChnZXRQcmVmaXhDbGFzc2VzVHJhbnNmb3JtZXIpO1xuICB9XG5cbiAgLy8gVGhpcyB0cmFuc2Zvcm0gaW50cm9kdWNlcyBpbXBvcnQvcmVxdWlyZSgpIGNhbGxzLCBidXQgdGhpcyB3b24ndCB3b3JrIHByb3Blcmx5IG9uIGxpYnJhcmllc1xuICAvLyBidWlsdCB3aXRoIFdlYnBhY2suIFRoZXNlIGxpYnJhcmllcyB1c2UgX193ZWJwYWNrX3JlcXVpcmVfXygpIGNhbGxzIGluc3RlYWQsIHdoaWNoIHdpbGwgYnJlYWtcbiAgLy8gd2l0aCBhIG5ldyBpbXBvcnQgdGhhdCB3YXNuJ3QgcGFydCBvZiBpdCdzIG9yaWdpbmFsIG1vZHVsZSBsaXN0LlxuICAvLyBXZSBpZ25vcmUgdGhpcyB0cmFuc2Zvcm0gZm9yIHN1Y2ggbGlicmFyaWVzLlxuICBpZiAoIWlzV2VicGFja0J1bmRsZSAmJiAoaWdub3JlVGVzdCB8fCB0ZXN0SW1wb3J0VHNsaWIoY29udGVudCkpKSB7XG4gICAgZ2V0VHJhbnNmb3Jtcy51bnNoaWZ0KGdldEltcG9ydFRzbGliVHJhbnNmb3JtZXIpO1xuICB9XG5cbiAgZ2V0VHJhbnNmb3Jtcy51bnNoaWZ0KGdldFdyYXBFbnVtc1RyYW5zZm9ybWVyKTtcblxuICBjb25zdCB0cmFuc2Zvcm1KYXZhc2NyaXB0T3B0czogVHJhbnNmb3JtSmF2YXNjcmlwdE9wdGlvbnMgPSB7XG4gICAgY29udGVudDogY29udGVudCxcbiAgICBpbnB1dEZpbGVQYXRoOiBvcHRpb25zLmlucHV0RmlsZVBhdGgsXG4gICAgb3V0cHV0RmlsZVBhdGg6IG9wdGlvbnMub3V0cHV0RmlsZVBhdGgsXG4gICAgZW1pdFNvdXJjZU1hcDogb3B0aW9ucy5lbWl0U291cmNlTWFwLFxuICAgIHN0cmljdDogb3B0aW9ucy5zdHJpY3QsXG4gICAgZ2V0VHJhbnNmb3JtcyxcbiAgICB0eXBlQ2hlY2ssXG4gIH07XG5cbiAgcmV0dXJuIHRyYW5zZm9ybUphdmFzY3JpcHQodHJhbnNmb3JtSmF2YXNjcmlwdE9wdHMpO1xufVxuIl19