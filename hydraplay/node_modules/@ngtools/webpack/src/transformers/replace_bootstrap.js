"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const path_1 = require("path");
const ts = require("typescript");
const ast_helpers_1 = require("./ast_helpers");
const insert_import_1 = require("./insert_import");
const interfaces_1 = require("./interfaces");
const make_transform_1 = require("./make_transform");
function replaceBootstrap(shouldTransform, getEntryModule, getTypeChecker, enableIvy) {
    const standardTransform = function (sourceFile) {
        const ops = [];
        const entryModule = getEntryModule();
        if (!shouldTransform(sourceFile.fileName) || !entryModule) {
            return ops;
        }
        // Find all identifiers.
        const entryModuleIdentifiers = ast_helpers_1.collectDeepNodes(sourceFile, ts.SyntaxKind.Identifier)
            .filter(identifier => identifier.text === entryModule.className);
        if (entryModuleIdentifiers.length === 0) {
            return [];
        }
        // Find the bootstrap calls.
        entryModuleIdentifiers.forEach(entryModuleIdentifier => {
            // Figure out if it's a `platformBrowserDynamic().bootstrapModule(AppModule)` call.
            if (!(entryModuleIdentifier.parent
                && entryModuleIdentifier.parent.kind === ts.SyntaxKind.CallExpression)) {
                return;
            }
            const callExpr = entryModuleIdentifier.parent;
            if (callExpr.expression.kind !== ts.SyntaxKind.PropertyAccessExpression) {
                return;
            }
            const propAccessExpr = callExpr.expression;
            if (propAccessExpr.name.text !== 'bootstrapModule'
                || propAccessExpr.expression.kind !== ts.SyntaxKind.CallExpression) {
                return;
            }
            const bootstrapModuleIdentifier = propAccessExpr.name;
            const innerCallExpr = propAccessExpr.expression;
            if (!(innerCallExpr.expression.kind === ts.SyntaxKind.Identifier
                && innerCallExpr.expression.text === 'platformBrowserDynamic')) {
                return;
            }
            const platformBrowserDynamicIdentifier = innerCallExpr.expression;
            const idPlatformBrowser = ts.createUniqueName('__NgCli_bootstrap_');
            const idNgFactory = ts.createUniqueName('__NgCli_bootstrap_');
            // Add the transform operations.
            const relativeEntryModulePath = path_1.relative(path_1.dirname(sourceFile.fileName), entryModule.path);
            let className = entryModule.className;
            let modulePath = `./${relativeEntryModulePath}`.replace(/\\/g, '/');
            let bootstrapIdentifier = 'bootstrapModule';
            if (!enableIvy) {
                className += 'NgFactory';
                modulePath += '.ngfactory';
                bootstrapIdentifier = 'bootstrapModuleFactory';
            }
            ops.push(
            // Replace the entry module import.
            ...insert_import_1.insertStarImport(sourceFile, idNgFactory, modulePath), new interfaces_1.ReplaceNodeOperation(sourceFile, entryModuleIdentifier, ts.createPropertyAccess(idNgFactory, ts.createIdentifier(className))), 
            // Replace the platformBrowserDynamic import.
            ...insert_import_1.insertStarImport(sourceFile, idPlatformBrowser, '@angular/platform-browser'), new interfaces_1.ReplaceNodeOperation(sourceFile, platformBrowserDynamicIdentifier, ts.createPropertyAccess(idPlatformBrowser, 'platformBrowser')), new interfaces_1.ReplaceNodeOperation(sourceFile, bootstrapModuleIdentifier, ts.createIdentifier(bootstrapIdentifier)));
        });
        return ops;
    };
    return make_transform_1.makeTransform(standardTransform, getTypeChecker);
}
exports.replaceBootstrap = replaceBootstrap;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwbGFjZV9ib290c3RyYXAuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL25ndG9vbHMvd2VicGFjay9zcmMvdHJhbnNmb3JtZXJzL3JlcGxhY2VfYm9vdHN0cmFwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7OztHQU1HO0FBQ0gsK0JBQXlDO0FBQ3pDLGlDQUFpQztBQUNqQywrQ0FBaUQ7QUFDakQsbURBQW1EO0FBQ25ELDZDQUEyRjtBQUMzRixxREFBaUQ7QUFHakQsU0FBZ0IsZ0JBQWdCLENBQzlCLGVBQThDLEVBQzlDLGNBQWdFLEVBQ2hFLGNBQW9DLEVBQ3BDLFNBQW1CO0lBR25CLE1BQU0saUJBQWlCLEdBQXNCLFVBQVUsVUFBeUI7UUFDOUUsTUFBTSxHQUFHLEdBQXlCLEVBQUUsQ0FBQztRQUVyQyxNQUFNLFdBQVcsR0FBRyxjQUFjLEVBQUUsQ0FBQztRQUVyQyxJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUN6RCxPQUFPLEdBQUcsQ0FBQztTQUNaO1FBRUQsd0JBQXdCO1FBQ3hCLE1BQU0sc0JBQXNCLEdBQUcsOEJBQWdCLENBQWdCLFVBQVUsRUFDdkUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUM7YUFDeEIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksS0FBSyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFbkUsSUFBSSxzQkFBc0IsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ3ZDLE9BQU8sRUFBRSxDQUFDO1NBQ1g7UUFFRCw0QkFBNEI7UUFDNUIsc0JBQXNCLENBQUMsT0FBTyxDQUFDLHFCQUFxQixDQUFDLEVBQUU7WUFDckQsbUZBQW1GO1lBQ25GLElBQUksQ0FBQyxDQUNILHFCQUFxQixDQUFDLE1BQU07bUJBQ3pCLHFCQUFxQixDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQ3RFLEVBQUU7Z0JBQ0QsT0FBTzthQUNSO1lBRUQsTUFBTSxRQUFRLEdBQUcscUJBQXFCLENBQUMsTUFBMkIsQ0FBQztZQUVuRSxJQUFJLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsd0JBQXdCLEVBQUU7Z0JBQ3ZFLE9BQU87YUFDUjtZQUVELE1BQU0sY0FBYyxHQUFHLFFBQVEsQ0FBQyxVQUF5QyxDQUFDO1lBRTFFLElBQUksY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssaUJBQWlCO21CQUM3QyxjQUFjLENBQUMsVUFBVSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLGNBQWMsRUFBRTtnQkFDcEUsT0FBTzthQUNSO1lBRUQsTUFBTSx5QkFBeUIsR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDO1lBQ3RELE1BQU0sYUFBYSxHQUFHLGNBQWMsQ0FBQyxVQUErQixDQUFDO1lBRXJFLElBQUksQ0FBQyxDQUNILGFBQWEsQ0FBQyxVQUFVLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsVUFBVTttQkFDdEQsYUFBYSxDQUFDLFVBQTRCLENBQUMsSUFBSSxLQUFLLHdCQUF3QixDQUNqRixFQUFFO2dCQUNELE9BQU87YUFDUjtZQUVELE1BQU0sZ0NBQWdDLEdBQUcsYUFBYSxDQUFDLFVBQTJCLENBQUM7WUFFbkYsTUFBTSxpQkFBaUIsR0FBRyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUNwRSxNQUFNLFdBQVcsR0FBRyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUU5RCxnQ0FBZ0M7WUFDaEMsTUFBTSx1QkFBdUIsR0FBRyxlQUFRLENBQUMsY0FBTyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsRUFBRSxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDekYsSUFBSSxTQUFTLEdBQUcsV0FBVyxDQUFDLFNBQVMsQ0FBQztZQUN0QyxJQUFJLFVBQVUsR0FBRyxLQUFLLHVCQUF1QixFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNwRSxJQUFJLG1CQUFtQixHQUFHLGlCQUFpQixDQUFDO1lBRTVDLElBQUksQ0FBQyxTQUFTLEVBQUU7Z0JBQ2QsU0FBUyxJQUFJLFdBQVcsQ0FBQztnQkFDekIsVUFBVSxJQUFJLFlBQVksQ0FBQztnQkFDM0IsbUJBQW1CLEdBQUcsd0JBQXdCLENBQUM7YUFDaEQ7WUFFRCxHQUFHLENBQUMsSUFBSTtZQUNOLG1DQUFtQztZQUNuQyxHQUFHLGdDQUFnQixDQUFDLFVBQVUsRUFBRSxXQUFXLEVBQUUsVUFBVSxDQUFDLEVBQ3hELElBQUksaUNBQW9CLENBQUMsVUFBVSxFQUFFLHFCQUFxQixFQUN4RCxFQUFFLENBQUMsb0JBQW9CLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ3ZFLDZDQUE2QztZQUM3QyxHQUFHLGdDQUFnQixDQUFDLFVBQVUsRUFBRSxpQkFBaUIsRUFBRSwyQkFBMkIsQ0FBQyxFQUMvRSxJQUFJLGlDQUFvQixDQUFDLFVBQVUsRUFBRSxnQ0FBZ0MsRUFDbkUsRUFBRSxDQUFDLG9CQUFvQixDQUFDLGlCQUFpQixFQUFFLGlCQUFpQixDQUFDLENBQUMsRUFDaEUsSUFBSSxpQ0FBb0IsQ0FBQyxVQUFVLEVBQUUseUJBQXlCLEVBQzVELEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQzVDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sR0FBRyxDQUFDO0lBQ2IsQ0FBQyxDQUFDO0lBRUYsT0FBTyw4QkFBYSxDQUFDLGlCQUFpQixFQUFFLGNBQWMsQ0FBQyxDQUFDO0FBQzFELENBQUM7QUE3RkQsNENBNkZDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHsgZGlybmFtZSwgcmVsYXRpdmUgfSBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuaW1wb3J0IHsgY29sbGVjdERlZXBOb2RlcyB9IGZyb20gJy4vYXN0X2hlbHBlcnMnO1xuaW1wb3J0IHsgaW5zZXJ0U3RhckltcG9ydCB9IGZyb20gJy4vaW5zZXJ0X2ltcG9ydCc7XG5pbXBvcnQgeyBSZXBsYWNlTm9kZU9wZXJhdGlvbiwgU3RhbmRhcmRUcmFuc2Zvcm0sIFRyYW5zZm9ybU9wZXJhdGlvbiB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBtYWtlVHJhbnNmb3JtIH0gZnJvbSAnLi9tYWtlX3RyYW5zZm9ybSc7XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHJlcGxhY2VCb290c3RyYXAoXG4gIHNob3VsZFRyYW5zZm9ybTogKGZpbGVOYW1lOiBzdHJpbmcpID0+IGJvb2xlYW4sXG4gIGdldEVudHJ5TW9kdWxlOiAoKSA9PiB7IHBhdGg6IHN0cmluZywgY2xhc3NOYW1lOiBzdHJpbmcgfSB8IG51bGwsXG4gIGdldFR5cGVDaGVja2VyOiAoKSA9PiB0cy5UeXBlQ2hlY2tlcixcbiAgZW5hYmxlSXZ5PzogYm9vbGVhbixcbik6IHRzLlRyYW5zZm9ybWVyRmFjdG9yeTx0cy5Tb3VyY2VGaWxlPiB7XG5cbiAgY29uc3Qgc3RhbmRhcmRUcmFuc2Zvcm06IFN0YW5kYXJkVHJhbnNmb3JtID0gZnVuY3Rpb24gKHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUpIHtcbiAgICBjb25zdCBvcHM6IFRyYW5zZm9ybU9wZXJhdGlvbltdID0gW107XG5cbiAgICBjb25zdCBlbnRyeU1vZHVsZSA9IGdldEVudHJ5TW9kdWxlKCk7XG5cbiAgICBpZiAoIXNob3VsZFRyYW5zZm9ybShzb3VyY2VGaWxlLmZpbGVOYW1lKSB8fCAhZW50cnlNb2R1bGUpIHtcbiAgICAgIHJldHVybiBvcHM7XG4gICAgfVxuXG4gICAgLy8gRmluZCBhbGwgaWRlbnRpZmllcnMuXG4gICAgY29uc3QgZW50cnlNb2R1bGVJZGVudGlmaWVycyA9IGNvbGxlY3REZWVwTm9kZXM8dHMuSWRlbnRpZmllcj4oc291cmNlRmlsZSxcbiAgICAgIHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcilcbiAgICAgIC5maWx0ZXIoaWRlbnRpZmllciA9PiBpZGVudGlmaWVyLnRleHQgPT09IGVudHJ5TW9kdWxlLmNsYXNzTmFtZSk7XG5cbiAgICBpZiAoZW50cnlNb2R1bGVJZGVudGlmaWVycy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICAvLyBGaW5kIHRoZSBib290c3RyYXAgY2FsbHMuXG4gICAgZW50cnlNb2R1bGVJZGVudGlmaWVycy5mb3JFYWNoKGVudHJ5TW9kdWxlSWRlbnRpZmllciA9PiB7XG4gICAgICAvLyBGaWd1cmUgb3V0IGlmIGl0J3MgYSBgcGxhdGZvcm1Ccm93c2VyRHluYW1pYygpLmJvb3RzdHJhcE1vZHVsZShBcHBNb2R1bGUpYCBjYWxsLlxuICAgICAgaWYgKCEoXG4gICAgICAgIGVudHJ5TW9kdWxlSWRlbnRpZmllci5wYXJlbnRcbiAgICAgICAgJiYgZW50cnlNb2R1bGVJZGVudGlmaWVyLnBhcmVudC5raW5kID09PSB0cy5TeW50YXhLaW5kLkNhbGxFeHByZXNzaW9uXG4gICAgICApKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgY2FsbEV4cHIgPSBlbnRyeU1vZHVsZUlkZW50aWZpZXIucGFyZW50IGFzIHRzLkNhbGxFeHByZXNzaW9uO1xuXG4gICAgICBpZiAoY2FsbEV4cHIuZXhwcmVzc2lvbi5raW5kICE9PSB0cy5TeW50YXhLaW5kLlByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHByb3BBY2Nlc3NFeHByID0gY2FsbEV4cHIuZXhwcmVzc2lvbiBhcyB0cy5Qcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb247XG5cbiAgICAgIGlmIChwcm9wQWNjZXNzRXhwci5uYW1lLnRleHQgIT09ICdib290c3RyYXBNb2R1bGUnXG4gICAgICAgIHx8IHByb3BBY2Nlc3NFeHByLmV4cHJlc3Npb24ua2luZCAhPT0gdHMuU3ludGF4S2luZC5DYWxsRXhwcmVzc2lvbikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGJvb3RzdHJhcE1vZHVsZUlkZW50aWZpZXIgPSBwcm9wQWNjZXNzRXhwci5uYW1lO1xuICAgICAgY29uc3QgaW5uZXJDYWxsRXhwciA9IHByb3BBY2Nlc3NFeHByLmV4cHJlc3Npb24gYXMgdHMuQ2FsbEV4cHJlc3Npb247XG5cbiAgICAgIGlmICghKFxuICAgICAgICBpbm5lckNhbGxFeHByLmV4cHJlc3Npb24ua2luZCA9PT0gdHMuU3ludGF4S2luZC5JZGVudGlmaWVyXG4gICAgICAgICYmIChpbm5lckNhbGxFeHByLmV4cHJlc3Npb24gYXMgdHMuSWRlbnRpZmllcikudGV4dCA9PT0gJ3BsYXRmb3JtQnJvd3NlckR5bmFtaWMnXG4gICAgICApKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcGxhdGZvcm1Ccm93c2VyRHluYW1pY0lkZW50aWZpZXIgPSBpbm5lckNhbGxFeHByLmV4cHJlc3Npb24gYXMgdHMuSWRlbnRpZmllcjtcblxuICAgICAgY29uc3QgaWRQbGF0Zm9ybUJyb3dzZXIgPSB0cy5jcmVhdGVVbmlxdWVOYW1lKCdfX05nQ2xpX2Jvb3RzdHJhcF8nKTtcbiAgICAgIGNvbnN0IGlkTmdGYWN0b3J5ID0gdHMuY3JlYXRlVW5pcXVlTmFtZSgnX19OZ0NsaV9ib290c3RyYXBfJyk7XG5cbiAgICAgIC8vIEFkZCB0aGUgdHJhbnNmb3JtIG9wZXJhdGlvbnMuXG4gICAgICBjb25zdCByZWxhdGl2ZUVudHJ5TW9kdWxlUGF0aCA9IHJlbGF0aXZlKGRpcm5hbWUoc291cmNlRmlsZS5maWxlTmFtZSksIGVudHJ5TW9kdWxlLnBhdGgpO1xuICAgICAgbGV0IGNsYXNzTmFtZSA9IGVudHJ5TW9kdWxlLmNsYXNzTmFtZTtcbiAgICAgIGxldCBtb2R1bGVQYXRoID0gYC4vJHtyZWxhdGl2ZUVudHJ5TW9kdWxlUGF0aH1gLnJlcGxhY2UoL1xcXFwvZywgJy8nKTtcbiAgICAgIGxldCBib290c3RyYXBJZGVudGlmaWVyID0gJ2Jvb3RzdHJhcE1vZHVsZSc7XG5cbiAgICAgIGlmICghZW5hYmxlSXZ5KSB7XG4gICAgICAgIGNsYXNzTmFtZSArPSAnTmdGYWN0b3J5JztcbiAgICAgICAgbW9kdWxlUGF0aCArPSAnLm5nZmFjdG9yeSc7XG4gICAgICAgIGJvb3RzdHJhcElkZW50aWZpZXIgPSAnYm9vdHN0cmFwTW9kdWxlRmFjdG9yeSc7XG4gICAgICB9XG5cbiAgICAgIG9wcy5wdXNoKFxuICAgICAgICAvLyBSZXBsYWNlIHRoZSBlbnRyeSBtb2R1bGUgaW1wb3J0LlxuICAgICAgICAuLi5pbnNlcnRTdGFySW1wb3J0KHNvdXJjZUZpbGUsIGlkTmdGYWN0b3J5LCBtb2R1bGVQYXRoKSxcbiAgICAgICAgbmV3IFJlcGxhY2VOb2RlT3BlcmF0aW9uKHNvdXJjZUZpbGUsIGVudHJ5TW9kdWxlSWRlbnRpZmllcixcbiAgICAgICAgICB0cy5jcmVhdGVQcm9wZXJ0eUFjY2VzcyhpZE5nRmFjdG9yeSwgdHMuY3JlYXRlSWRlbnRpZmllcihjbGFzc05hbWUpKSksXG4gICAgICAgIC8vIFJlcGxhY2UgdGhlIHBsYXRmb3JtQnJvd3NlckR5bmFtaWMgaW1wb3J0LlxuICAgICAgICAuLi5pbnNlcnRTdGFySW1wb3J0KHNvdXJjZUZpbGUsIGlkUGxhdGZvcm1Ccm93c2VyLCAnQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3NlcicpLFxuICAgICAgICBuZXcgUmVwbGFjZU5vZGVPcGVyYXRpb24oc291cmNlRmlsZSwgcGxhdGZvcm1Ccm93c2VyRHluYW1pY0lkZW50aWZpZXIsXG4gICAgICAgICAgdHMuY3JlYXRlUHJvcGVydHlBY2Nlc3MoaWRQbGF0Zm9ybUJyb3dzZXIsICdwbGF0Zm9ybUJyb3dzZXInKSksXG4gICAgICAgIG5ldyBSZXBsYWNlTm9kZU9wZXJhdGlvbihzb3VyY2VGaWxlLCBib290c3RyYXBNb2R1bGVJZGVudGlmaWVyLFxuICAgICAgICAgIHRzLmNyZWF0ZUlkZW50aWZpZXIoYm9vdHN0cmFwSWRlbnRpZmllcikpLFxuICAgICAgKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBvcHM7XG4gIH07XG5cbiAgcmV0dXJuIG1ha2VUcmFuc2Zvcm0oc3RhbmRhcmRUcmFuc2Zvcm0sIGdldFR5cGVDaGVja2VyKTtcbn1cbiJdfQ==