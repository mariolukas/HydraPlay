/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/language-service/src/ts_plugin", ["require", "exports", "tslib", "typescript", "@angular/language-service/src/language_service", "@angular/language-service/src/typescript_host"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var language_service_1 = require("@angular/language-service/src/language_service");
    var typescript_host_1 = require("@angular/language-service/src/typescript_host");
    var projectHostMap = new WeakMap();
    function getExternalFiles(project) {
        var host = projectHostMap.get(project);
        if (host) {
            return host.getTemplateReferences();
        }
    }
    exports.getExternalFiles = getExternalFiles;
    function create(info /* ts.server.PluginCreateInfo */) {
        // Create the proxy
        var proxy = Object.create(null);
        var oldLS = info.languageService;
        function tryCall(fileName, callback) {
            if (fileName && !oldLS.getProgram().getSourceFile(fileName)) {
                return undefined;
            }
            try {
                return callback();
            }
            catch (_a) {
                return undefined;
            }
        }
        function tryFilenameCall(m) {
            return function (fileName) { return tryCall(fileName, function () { return (m.call(ls, fileName)); }); };
        }
        function tryFilenameOneCall(m) {
            return function (fileName, p) { return tryCall(fileName, function () { return (m.call(ls, fileName, p)); }); };
        }
        function tryFilenameTwoCall(m) {
            return function (fileName, p1, p2) { return tryCall(fileName, function () { return (m.call(ls, fileName, p1, p2)); }); };
        }
        function tryFilenameThreeCall(m) {
            return function (fileName, p1, p2, p3) { return tryCall(fileName, function () { return (m.call(ls, fileName, p1, p2, p3)); }); };
        }
        function tryFilenameFourCall(m) {
            return function (fileName, p1, p2, p3, p4) {
                return tryCall(fileName, function () { return (m.call(ls, fileName, p1, p2, p3, p4)); });
            };
        }
        function tryFilenameFiveCall(m) {
            return function (fileName, p1, p2, p3, p4, p5) {
                return tryCall(fileName, function () { return (m.call(ls, fileName, p1, p2, p3, p4, p5)); });
            };
        }
        function typescriptOnly(ls) {
            var languageService = {
                cleanupSemanticCache: function () { return ls.cleanupSemanticCache(); },
                getSyntacticDiagnostics: tryFilenameCall(ls.getSyntacticDiagnostics),
                getSemanticDiagnostics: tryFilenameCall(ls.getSemanticDiagnostics),
                getCompilerOptionsDiagnostics: function () { return ls.getCompilerOptionsDiagnostics(); },
                getSyntacticClassifications: tryFilenameOneCall(ls.getSemanticClassifications),
                getSemanticClassifications: tryFilenameOneCall(ls.getSemanticClassifications),
                getEncodedSyntacticClassifications: tryFilenameOneCall(ls.getEncodedSyntacticClassifications),
                getEncodedSemanticClassifications: tryFilenameOneCall(ls.getEncodedSemanticClassifications),
                getCompletionsAtPosition: tryFilenameTwoCall(ls.getCompletionsAtPosition),
                getCompletionEntryDetails: tryFilenameFiveCall(ls.getCompletionEntryDetails),
                getCompletionEntrySymbol: tryFilenameThreeCall(ls.getCompletionEntrySymbol),
                getJsxClosingTagAtPosition: tryFilenameOneCall(ls.getJsxClosingTagAtPosition),
                getQuickInfoAtPosition: tryFilenameOneCall(ls.getQuickInfoAtPosition),
                getNameOrDottedNameSpan: tryFilenameTwoCall(ls.getNameOrDottedNameSpan),
                getBreakpointStatementAtPosition: tryFilenameOneCall(ls.getBreakpointStatementAtPosition),
                getSignatureHelpItems: tryFilenameTwoCall(ls.getSignatureHelpItems),
                getRenameInfo: tryFilenameOneCall(ls.getRenameInfo),
                findRenameLocations: tryFilenameThreeCall(ls.findRenameLocations),
                getDefinitionAtPosition: tryFilenameOneCall(ls.getDefinitionAtPosition),
                getTypeDefinitionAtPosition: tryFilenameOneCall(ls.getTypeDefinitionAtPosition),
                getImplementationAtPosition: tryFilenameOneCall(ls.getImplementationAtPosition),
                getReferencesAtPosition: tryFilenameOneCall(ls.getReferencesAtPosition),
                findReferences: tryFilenameOneCall(ls.findReferences),
                getDocumentHighlights: tryFilenameTwoCall(ls.getDocumentHighlights),
                /** @deprecated */
                getOccurrencesAtPosition: tryFilenameOneCall(ls.getOccurrencesAtPosition),
                getNavigateToItems: function (searchValue, maxResultCount, fileName, excludeDtsFiles) { return tryCall(fileName, function () { return ls.getNavigateToItems(searchValue, maxResultCount, fileName, excludeDtsFiles); }); },
                getNavigationBarItems: tryFilenameCall(ls.getNavigationBarItems),
                getNavigationTree: tryFilenameCall(ls.getNavigationTree),
                getOutliningSpans: tryFilenameCall(ls.getOutliningSpans),
                getTodoComments: tryFilenameOneCall(ls.getTodoComments),
                getBraceMatchingAtPosition: tryFilenameOneCall(ls.getBraceMatchingAtPosition),
                getIndentationAtPosition: tryFilenameTwoCall(ls.getIndentationAtPosition),
                getFormattingEditsForRange: tryFilenameThreeCall(ls.getFormattingEditsForRange),
                getFormattingEditsForDocument: tryFilenameOneCall(ls.getFormattingEditsForDocument),
                getFormattingEditsAfterKeystroke: tryFilenameThreeCall(ls.getFormattingEditsAfterKeystroke),
                getDocCommentTemplateAtPosition: tryFilenameOneCall(ls.getDocCommentTemplateAtPosition),
                isValidBraceCompletionAtPosition: tryFilenameTwoCall(ls.isValidBraceCompletionAtPosition),
                getSpanOfEnclosingComment: tryFilenameTwoCall(ls.getSpanOfEnclosingComment),
                getCodeFixesAtPosition: tryFilenameFiveCall(ls.getCodeFixesAtPosition),
                applyCodeActionCommand: (function (action) { return tryCall(undefined, function () { return ls.applyCodeActionCommand(action); }); }),
                getEmitOutput: tryFilenameCall(ls.getEmitOutput),
                getProgram: function () { return ls.getProgram(); },
                dispose: function () { return ls.dispose(); },
                getApplicableRefactors: tryFilenameTwoCall(ls.getApplicableRefactors),
                getEditsForRefactor: tryFilenameFiveCall(ls.getEditsForRefactor),
                getDefinitionAndBoundSpan: tryFilenameOneCall(ls.getDefinitionAndBoundSpan),
                getCombinedCodeFix: function (scope, fixId, formatOptions, preferences) {
                    return tryCall(undefined, function () { return ls.getCombinedCodeFix(scope, fixId, formatOptions, preferences); });
                },
                // TODO(kyliau): dummy implementation to compile with ts 2.8, create real one
                getSuggestionDiagnostics: function (fileName) { return []; },
                // TODO(kyliau): dummy implementation to compile with ts 2.8, create real one
                organizeImports: function (scope, formatOptions) { return []; },
                // TODO: dummy implementation to compile with ts 2.9, create a real one
                getEditsForFileRename: function (oldFilePath, newFilePath, formatOptions, preferences) { return []; }
            };
            return languageService;
        }
        oldLS = typescriptOnly(oldLS);
        var _loop_1 = function (k) {
            proxy[k] = function () { return oldLS[k].apply(oldLS, arguments); };
        };
        for (var k in oldLS) {
            _loop_1(k);
        }
        function completionToEntry(c) {
            return {
                // TODO: remove any and fix type error.
                kind: c.kind,
                name: c.name,
                sortText: c.sort,
                kindModifiers: ''
            };
        }
        function diagnosticChainToDiagnosticChain(chain) {
            return {
                messageText: chain.message,
                category: ts.DiagnosticCategory.Error,
                code: 0,
                next: chain.next ? diagnosticChainToDiagnosticChain(chain.next) : undefined
            };
        }
        function diagnosticMessageToDiagnosticMessageText(message) {
            if (typeof message === 'string') {
                return message;
            }
            return diagnosticChainToDiagnosticChain(message);
        }
        function diagnosticToDiagnostic(d, file) {
            var result = {
                file: file,
                start: d.span.start,
                length: d.span.end - d.span.start,
                messageText: diagnosticMessageToDiagnosticMessageText(d.message),
                category: ts.DiagnosticCategory.Error,
                code: 0,
                source: 'ng'
            };
            return result;
        }
        function tryOperation(attempting, callback) {
            try {
                return callback();
            }
            catch (e) {
                info.project.projectService.logger.info("Failed to " + attempting + ": " + e.toString());
                info.project.projectService.logger.info("Stack trace: " + e.stack);
                return null;
            }
        }
        var serviceHost = new typescript_host_1.TypeScriptServiceHost(info.languageServiceHost, info.languageService);
        var ls = language_service_1.createLanguageService(serviceHost);
        serviceHost.setSite(ls);
        projectHostMap.set(info.project, serviceHost);
        proxy.getCompletionsAtPosition = function (fileName, position, options) {
            var base = oldLS.getCompletionsAtPosition(fileName, position, options) || {
                isGlobalCompletion: false,
                isMemberCompletion: false,
                isNewIdentifierLocation: false,
                entries: []
            };
            tryOperation('get completions', function () {
                var e_1, _a;
                var results = ls.getCompletionsAt(fileName, position);
                if (results && results.length) {
                    if (base === undefined) {
                        base = {
                            isGlobalCompletion: false,
                            isMemberCompletion: false,
                            isNewIdentifierLocation: false,
                            entries: []
                        };
                    }
                    try {
                        for (var results_1 = tslib_1.__values(results), results_1_1 = results_1.next(); !results_1_1.done; results_1_1 = results_1.next()) {
                            var entry = results_1_1.value;
                            base.entries.push(completionToEntry(entry));
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (results_1_1 && !results_1_1.done && (_a = results_1.return)) _a.call(results_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                }
            });
            return base;
        };
        proxy.getQuickInfoAtPosition = function (fileName, position) {
            var base = oldLS.getQuickInfoAtPosition(fileName, position);
            // TODO(vicb): the tags property has been removed in TS 2.2
            tryOperation('get quick info', function () {
                var e_2, _a;
                var ours = ls.getHoverAt(fileName, position);
                if (ours) {
                    var displayParts = [];
                    try {
                        for (var _b = tslib_1.__values(ours.text), _c = _b.next(); !_c.done; _c = _b.next()) {
                            var part = _c.value;
                            displayParts.push({ kind: part.language || 'angular', text: part.text });
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                    var tags = base && base.tags;
                    base = {
                        displayParts: displayParts,
                        documentation: [],
                        kind: 'angular',
                        kindModifiers: 'what does this do?',
                        textSpan: { start: ours.span.start, length: ours.span.end - ours.span.start },
                    };
                    if (tags) {
                        base.tags = tags;
                    }
                }
            });
            return base;
        };
        proxy.getSemanticDiagnostics = function (fileName) {
            var result = oldLS.getSemanticDiagnostics(fileName);
            var base = result || [];
            tryOperation('get diagnostics', function () {
                info.project.projectService.logger.info("Computing Angular semantic diagnostics...");
                var ours = ls.getDiagnostics(fileName);
                if (ours && ours.length) {
                    var file_1 = oldLS.getProgram().getSourceFile(fileName);
                    if (file_1) {
                        base.push.apply(base, ours.map(function (d) { return diagnosticToDiagnostic(d, file_1); }));
                    }
                }
            });
            return base;
        };
        proxy.getDefinitionAtPosition = function (fileName, position) {
            var base = oldLS.getDefinitionAtPosition(fileName, position);
            if (base && base.length) {
                return base;
            }
            return tryOperation('get definition', function () {
                var e_3, _a;
                var ours = ls.getDefinitionAt(fileName, position);
                var combined;
                if (ours && ours.length) {
                    combined = base && base.concat([]) || [];
                    try {
                        for (var ours_1 = tslib_1.__values(ours), ours_1_1 = ours_1.next(); !ours_1_1.done; ours_1_1 = ours_1.next()) {
                            var loc = ours_1_1.value;
                            combined.push({
                                fileName: loc.fileName,
                                textSpan: { start: loc.span.start, length: loc.span.end - loc.span.start },
                                name: '',
                                // TODO: remove any and fix type error.
                                kind: 'definition',
                                containerName: loc.fileName,
                                containerKind: 'file',
                            });
                        }
                    }
                    catch (e_3_1) { e_3 = { error: e_3_1 }; }
                    finally {
                        try {
                            if (ours_1_1 && !ours_1_1.done && (_a = ours_1.return)) _a.call(ours_1);
                        }
                        finally { if (e_3) throw e_3.error; }
                    }
                }
                else {
                    combined = base;
                }
                return combined;
            }) || [];
        };
        return proxy;
    }
    exports.create = create;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHNfcGx1Z2luLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvbGFuZ3VhZ2Utc2VydmljZS9zcmMvdHNfcGx1Z2luLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILCtCQUFpQztJQUVqQyxtRkFBeUQ7SUFFekQsaUZBQXdEO0lBRXhELElBQU0sY0FBYyxHQUFHLElBQUksT0FBTyxFQUE4QixDQUFDO0lBRWpFLFNBQWdCLGdCQUFnQixDQUFDLE9BQVk7UUFDM0MsSUFBTSxJQUFJLEdBQUcsY0FBYyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN6QyxJQUFJLElBQUksRUFBRTtZQUNSLE9BQU8sSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7U0FDckM7SUFDSCxDQUFDO0lBTEQsNENBS0M7SUFFRCxTQUFnQixNQUFNLENBQUMsSUFBUyxDQUFDLGdDQUFnQztRQUMvRCxtQkFBbUI7UUFDbkIsSUFBTSxLQUFLLEdBQXVCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEQsSUFBSSxLQUFLLEdBQXVCLElBQUksQ0FBQyxlQUFlLENBQUM7UUFFckQsU0FBUyxPQUFPLENBQUksUUFBNEIsRUFBRSxRQUFpQjtZQUNqRSxJQUFJLFFBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQzdELE9BQU8sU0FBUyxDQUFDO2FBQ2xCO1lBQ0QsSUFBSTtnQkFDRixPQUFPLFFBQVEsRUFBRSxDQUFDO2FBQ25CO1lBQUMsV0FBTTtnQkFDTixPQUFPLFNBQVMsQ0FBQzthQUNsQjtRQUNILENBQUM7UUFFRCxTQUFTLGVBQWUsQ0FBSSxDQUEwQjtZQUNwRCxPQUFPLFVBQUEsUUFBUSxJQUFJLE9BQUEsT0FBTyxDQUFDLFFBQVEsRUFBRSxjQUFNLE9BQUcsQ0FBQyxD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a0IsSUFBQSxTQUFBLGlCQUFBLElBQUksQ0FBQSwwQkFBQSw0Q0FBRTs0QkFBbkIsSUFBTSxHQUFHLGlCQUFBOzRCQUNaLFFBQVEsQ0FBQyxJQUFJLENBQUM7Z0NBQ1osUUFBUSxFQUFFLEdBQUcsQ0FBQyxRQUFRO2dDQUN0QixRQUFRLEVBQUUsRUFBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFDO2dDQUN4RSxJQUFJLEVBQUUsRUFBRTtnQ0FDUix1Q0FBdUM7Z0NBQ3ZDLElBQUksRUFBRSxZQUFtQjtnQ0FDekIsYUFBYSxFQUFFLEdBQUcsQ0FBQyxRQUFRO2dDQUMzQixhQUFhLEVBQUUsTUFBYTs2QkFDN0IsQ0FBQyxDQUFDO3lCQUNKOzs7Ozs7Ozs7aUJBQ0Y7cUJBQU07b0JBQ0wsUUFBUSxHQUFHLElBQUksQ0FBQztpQkFDakI7Z0JBQ0QsT0FBTyxRQUFRLENBQUM7WUFDbEIsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2xCLENBQUMsQ0FBQztRQUVGLE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQTdSRCx3QkE2UkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge2NyZWF0ZUxhbmd1YWdlU2VydmljZX0gZnJvbSAnLi9sYW5ndWFnZV9zZXJ2aWNlJztcbmltcG9ydCB7Q29tcGxldGlvbiwgRGlhZ25vc3RpYywgRGlhZ25vc3RpY01lc3NhZ2VDaGFpbiwgTGFuZ3VhZ2VTZXJ2aWNlLCBMYW5ndWFnZVNlcnZpY2VIb3N0fSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7VHlwZVNjcmlwdFNlcnZpY2VIb3N0fSBmcm9tICcuL3R5cGVzY3JpcHRfaG9zdCc7XG5cbmNvbnN0IHByb2plY3RIb3N0TWFwID0gbmV3IFdlYWtNYXA8YW55LCBUeXBlU2NyaXB0U2VydmljZUhvc3Q+KCk7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRFeHRlcm5hbEZpbGVzKHByb2plY3Q6IGFueSk6IHN0cmluZ1tdfHVuZGVmaW5lZCB7XG4gIGNvbnN0IGhvc3QgPSBwcm9qZWN0SG9zdE1hcC5nZXQocHJvamVjdCk7XG4gIGlmIChob3N0KSB7XG4gICAgcmV0dXJuIGhvc3QuZ2V0VGVtcGxhdGVSZWZlcmVuY2VzKCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZShpbmZvOiBhbnkgLyogdHMuc2VydmVyLlBsdWdpbkNyZWF0ZUluZm8gKi8pOiB0cy5MYW5ndWFnZVNlcnZpY2Uge1xuICAvLyBDcmVhdGUgdGhlIHByb3h5XG4gIGNvbnN0IHByb3h5OiB0cy5MYW5ndWFnZVNlcnZpY2UgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICBsZXQgb2xkTFM6IHRzLkxhbmd1YWdlU2VydmljZSA9IGluZm8ubGFuZ3VhZ2VTZXJ2aWNlO1xuXG4gIGZ1bmN0aW9uIHRyeUNhbGw8VD4oZmlsZU5hbWU6IHN0cmluZyB8IHVuZGVmaW5lZCwgY2FsbGJhY2s6ICgpID0+IFQpOiBUfHVuZGVmaW5lZCB7XG4gICAgaWYgKGZpbGVOYW1lICYmICFvbGRMUy5nZXRQcm9ncmFtKCkgIS5nZXRTb3VyY2VGaWxlKGZpbGVOYW1lKSkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBjYWxsYmFjaygpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB0cnlGaWxlbmFtZUNhbGw8VD4obTogKGZpbGVOYW1lOiBzdHJpbmcpID0+IFQpOiAoZmlsZU5hbWU6IHN0cmluZykgPT4gVCB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIGZpbGVOYW1lID0+IHRyeUNhbGwoZmlsZU5hbWUsICgpID0+IDxUPihtLmNhbGwobHMsIGZpbGVOYW1lKSkpO1xuICB9XG5cbiAgZnVuY3Rpb24gdHJ5RmlsZW5hbWVPbmVDYWxsPFQsIFA+KG06IChmaWxlTmFtZTogc3RyaW5nLCBwOiBQKSA9PiBUKTogKGZpbGVuYW1lOiBzdHJpbmcsIHA6IFApID0+XG4gICAgICBUIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gKGZpbGVOYW1lLCBwKSA9PiB0cnlDYWxsKGZpbGVOYW1lLCAoKSA9PiA8VD4obS5jYWxsKGxzLCBmaWxlTmFtZSwgcCkpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRyeUZpbGVuYW1lVHdvQ2FsbDxULCBQMSwgUDI+KG06IChmaWxlTmFtZTogc3RyaW5nLCBwMTogUDEsIHAyOiBQMikgPT4gVCk6IChcbiAgICAgIGZpbGVuYW1lOiBzdHJpbmcsIHAxOiBQMSwgcDI6IFAyKSA9PiBUIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gKGZpbGVOYW1lLCBwMSwgcDIpID0+IHRyeUNhbGwoZmlsZU5hbWUsICgpID0+IDxUPihtLmNhbGwobHMsIGZpbGVOYW1lLCBwMSwgcDIpKSk7XG4gIH1cblxuICBmdW5jdGlvbiB0cnlGaWxlbmFtZVRocmVlQ2FsbDxULCBQMSwgUDIsIFAzPihtOiAoZmlsZU5hbWU6IHN0cmluZywgcDE6IFAxLCBwMjogUDIsIHAzOiBQMykgPT4gVCk6XG4gICAgICAoZmlsZW5hbWU6IHN0cmluZywgcDE6IFAxLCBwMjogUDIsIHAzOiBQMykgPT4gVCB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIChmaWxlTmFtZSwgcDEsIHAyLCBwMykgPT4gdHJ5Q2FsbChmaWxlTmFtZSwgKCkgPT4gPFQ+KG0uY2FsbChscywgZmlsZU5hbWUsIHAxLCBwMiwgcDMpKSk7XG4gIH1cblxuICBmdW5jdGlvbiB0cnlGaWxlbmFtZUZvdXJDYWxsPFQsIFAxLCBQMiwgUDMsIFA0PihcbiAgICAgIG06IChmaWxlTmFtZTogc3RyaW5nLCBwMTogUDEsIHAyOiBQMiwgcDM6IFAzLCBwNDogUDQpID0+XG4gICAgICAgICAgVCk6IChmaWxlTmFtZTogc3RyaW5nLCBwMTogUDEsIHAyOiBQMiwgcDM6IFAzLCBwNDogUDQpID0+IFQgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiAoZmlsZU5hbWUsIHAxLCBwMiwgcDMsIHA0KSA9PlxuICAgICAgICAgICAgICAgdHJ5Q2FsbChmaWxlTmFtZSwgKCkgPT4gPFQ+KG0uY2FsbChscywgZmlsZU5hbWUsIHAxLCBwMiwgcDMsIHA0KSkpO1xuICB9XG5cbiAgZnVuY3Rpb24gdHJ5RmlsZW5hbWVGaXZlQ2FsbDxULCBQMSwgUDIsIFAzLCBQNCwgUDU+KFxuICAgICAgbTogKGZpbGVOYW1lOiBzdHJpbmcsIHAxOiBQMSwgcDI6IFAyLCBwMzogUDMsIHA0OiBQNCwgcDU6IFA1KSA9PlxuICAgICAgICAgIFQpOiAoZmlsZU5hbWU6IHN0cmluZywgcDE6IFAxLCBwMjogUDIsIHAzOiBQMywgcDQ6IFA0LCBwNTogUDUpID0+IFQgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiAoZmlsZU5hbWUsIHAxLCBwMiwgcDMsIHA0LCBwNSkgPT5cbiAgICAgICAgICAgICAgIHRyeUNhbGwoZmlsZU5hbWUsICgpID0+IDxUPihtLmNhbGwobHMsIGZpbGVOYW1lLCBwMSwgcDIsIHAzLCBwNCwgcDUpKSk7XG4gIH1cblxuICBmdW5jdGlvbiB0eXBlc2NyaXB0T25seShsczogdHMuTGFuZ3VhZ2VTZXJ2aWNlKTogdHMuTGFuZ3VhZ2VTZXJ2aWNlIHtcbiAgICBjb25zdCBsYW5ndWFnZVNlcnZpY2U6IHRzLkxhbmd1YWdlU2VydmljZSA9IHtcbiAgICAgIGNsZWFudXBTZW1hbnRpY0NhY2hlOiAoKSA9PiBscy5jbGVhbnVwU2VtYW50aWNDYWNoZSgpLFxuICAgICAgZ2V0U3ludGFjdGljRGlhZ25vc3RpY3M6IHRyeUZpbGVuYW1lQ2FsbChscy5nZXRTeW50YWN0aWNEaWFnbm9zdGljcyksXG4gICAgICBnZXRTZW1hbnRpY0RpYWdub3N0aWNzOiB0cnlGaWxlbmFtZUNhbGwobHMuZ2V0U2VtYW50aWNEaWFnbm9zdGljcyksXG4gICAgICBnZXRDb21waWxlck9wdGlvbnNEaWFnbm9zdGljczogKCkgPT4gbHMuZ2V0Q29tcGlsZXJPcHRpb25zRGlhZ25vc3RpY3MoKSxcbiAgICAgIGdldFN5bnRhY3RpY0NsYXNzaWZpY2F0aW9uczogdHJ5RmlsZW5hbWVPbmVDYWxsKGxzLmdldFNlbWFudGljQ2xhc3NpZmljYXRpb25zKSxcbiAgICAgIGdldFNlbWFudGljQ2xhc3NpZmljYXRpb25zOiB0cnlGaWxlbmFtZU9uZUNhbGwobHMuZ2V0U2VtYW50aWNDbGFzc2lmaWNhdGlvbnMpLFxuICAgICAgZ2V0RW5jb2RlZFN5bnRhY3RpY0NsYXNzaWZpY2F0aW9uczogdHJ5RmlsZW5hbWVPbmVDYWxsKGxzLmdldEVuY29kZWRTeW50YWN0aWNDbGFzc2lmaWNhdGlvbnMpLFxuICAgICAgZ2V0RW5jb2RlZFNlbWFudGljQ2xhc3NpZmljYXRpb25zOiB0cnlGaWxlbmFtZU9uZUNhbGwobHMuZ2V0RW5jb2RlZFNlbWFudGljQ2xhc3NpZmljYXRpb25zKSxcbiAgICAgIGdldENvbXBsZXRpb25zQXRQb3NpdGlvbjogdHJ5RmlsZW5hbWVUd29DYWxsKGxzLmdldENvbXBsZXRpb25zQXRQb3NpdGlvbiksXG4gICAgICBnZXRDb21wbGV0aW9uRW50cnlEZXRhaWxzOiB0cnlGaWxlbmFtZUZpdmVDYWxsKGxzLmdldENvbXBsZXRpb25FbnRyeURldGFpbHMpLFxuICAgICAgZ2V0Q29tcGxldGlvbkVudHJ5U3ltYm9sOiB0cnlGaWxlbmFtZVRocmVlQ2FsbChscy5nZXRDb21wbGV0aW9uRW50cnlTeW1ib2wpLFxuICAgICAgZ2V0SnN4Q2xvc2luZ1RhZ0F0UG9zaXRpb246IHRyeUZpbGVuYW1lT25lQ2FsbChscy5nZXRKc3hDbG9zaW5nVGFnQXRQb3NpdGlvbiksXG4gICAgICBnZXRRdWlja0luZm9BdFBvc2l0aW9uOiB0cnlGaWxlbmFtZU9uZUNhbGwobHMuZ2V0UXVpY2tJbmZvQXRQb3NpdGlvbiksXG4gICAgICBnZXROYW1lT3JEb3R0ZWROYW1lU3BhbjogdHJ5RmlsZW5hbWVUd29DYWxsKGxzLmdldE5hbWVPckRvdHRlZE5hbWVTcGFuKSxcbiAgICAgIGdldEJyZWFrcG9pbnRTdGF0ZW1lbnRBdFBvc2l0aW9uOiB0cnlGaWxlbmFtZU9uZUNhbGwobHMuZ2V0QnJlYWtwb2ludFN0YXRlbWVudEF0UG9zaXRpb24pLFxuICAgICAgZ2V0U2lnbmF0dXJlSGVscEl0ZW1zOiB0cnlGaWxlbmFtZVR3b0NhbGwobHMuZ2V0U2lnbmF0dXJlSGVscEl0ZW1zKSxcbiAgICAgIGdldFJlbmFtZUluZm86IHRyeUZpbGVuYW1lT25lQ2FsbChscy5nZXRSZW5hbWVJbmZvKSxcbiAgICAgIGZpbmRSZW5hbWVMb2NhdGlvbnM6IHRyeUZpbGVuYW1lVGhyZWVDYWxsKGxzLmZpbmRSZW5hbWVMb2NhdGlvbnMpLFxuICAgICAgZ2V0RGVmaW5pdGlvbkF0UG9zaXRpb246IHRyeUZpbGVuYW1lT25lQ2FsbChscy5nZXREZWZpbml0aW9uQXRQb3NpdGlvbiksXG4gICAgICBnZXRUeXBlRGVmaW5pdGlvbkF0UG9zaXRpb246IHRyeUZpbGVuYW1lT25lQ2FsbChscy5nZXRUeXBlRGVmaW5pdGlvbkF0UG9zaXRpb24pLFxuICAgICAgZ2V0SW1wbGVtZW50YXRpb25BdFBvc2l0aW9uOiB0cnlGaWxlbmFtZU9uZUNhbGwobHMuZ2V0SW1wbGVtZW50YXRpb25BdFBvc2l0aW9uKSxcbiAgICAgIGdldFJlZmVyZW5jZXNBdFBvc2l0aW9uOiB0cnlGaWxlbmFtZU9uZUNhbGwobHMuZ2V0UmVmZXJlbmNlc0F0UG9zaXRpb24pLFxuICAgICAgZmluZFJlZmVyZW5jZXM6IHRyeUZpbGVuYW1lT25lQ2FsbChscy5maW5kUmVmZXJlbmNlcyksXG4gICAgICBnZXREb2N1bWVudEhpZ2hsaWdodHM6IHRyeUZpbGVuYW1lVHdvQ2FsbChscy5nZXREb2N1bWVudEhpZ2hsaWdodHMpLFxuICAgICAgLyoqIEBkZXByZWNhdGVkICovXG4gICAgICBnZXRPY2N1cnJlbmNlc0F0UG9zaXRpb246IHRyeUZpbGVuYW1lT25lQ2FsbChscy5nZXRPY2N1cnJlbmNlc0F0UG9zaXRpb24pLFxuICAgICAgZ2V0TmF2aWdhdGVUb0l0ZW1zOlxuICAgICAgICAgIChzZWFyY2hWYWx1ZSwgbWF4UmVzdWx0Q291bnQsIGZpbGVOYW1lLCBleGNsdWRlRHRzRmlsZXMpID0+IHRyeUNhbGwoXG4gICAgICAgICAgICAgIGZpbGVOYW1lLFxuICAgICAgICAgICAgICAoKSA9PiBscy5nZXROYXZpZ2F0ZVRvSXRlbXMoc2VhcmNoVmFsdWUsIG1heFJlc3VsdENvdW50LCBmaWxlTmFtZSwgZXhjbHVkZUR0c0ZpbGVzKSksXG4gICAgICBnZXROYXZpZ2F0aW9uQmFySXRlbXM6IHRyeUZpbGVuYW1lQ2FsbChscy5nZXROYXZpZ2F0aW9uQmFySXRlbXMpLFxuICAgICAgZ2V0TmF2aWdhdGlvblRyZWU6IHRyeUZpbGVuYW1lQ2FsbChscy5nZXROYXZpZ2F0aW9uVHJlZSksXG4gICAgICBnZXRPdXRsaW5pbmdTcGFuczogdHJ5RmlsZW5hbWVDYWxsKGxzLmdldE91dGxpbmluZ1NwYW5zKSxcbiAgICAgIGdldFRvZG9Db21tZW50czogdHJ5RmlsZW5hbWVPbmVDYWxsKGxzLmdldFRvZG9Db21tZW50cyksXG4gICAgICBnZXRCcmFjZU1hdGNoaW5nQXRQb3NpdGlvbjogdHJ5RmlsZW5hbWVPbmVDYWxsKGxzLmdldEJyYWNlTWF0Y2hpbmdBdFBvc2l0aW9uKSxcbiAgICAgIGdldEluZGVudGF0aW9uQXRQb3NpdGlvbjogdHJ5RmlsZW5hbWVUd29DYWxsKGxzLmdldEluZGVudGF0aW9uQXRQb3NpdGlvbiksXG4gICAgICBnZXRGb3JtYXR0aW5nRWRpdHNGb3JSYW5nZTogdHJ5RmlsZW5hbWVUaHJlZUNhbGwobHMuZ2V0Rm9ybWF0dGluZ0VkaXRzRm9yUmFuZ2UpLFxuICAgICAgZ2V0Rm9ybWF0dGluZ0VkaXRzRm9yRG9jdW1lbnQ6IHRyeUZpbGVuYW1lT25lQ2FsbChscy5nZXRGb3JtYXR0aW5nRWRpdHNGb3JEb2N1bWVudCksXG4gICAgICBnZXRGb3JtYXR0aW5nRWRpdHNBZnRlcktleXN0cm9rZTogdHJ5RmlsZW5hbWVUaHJlZUNhbGwobHMuZ2V0Rm9ybWF0dGluZ0VkaXRzQWZ0ZXJLZXlzdHJva2UpLFxuICAgICAgZ2V0RG9jQ29tbWVudFRlbXBsYXRlQXRQb3NpdGlvbjogdHJ5RmlsZW5hbWVPbmVDYWxsKGxzLmdldERvY0NvbW1lbnRUZW1wbGF0ZUF0UG9zaXRpb24pLFxuICAgICAgaXNWYWxpZEJyYWNlQ29tcGxldGlvbkF0UG9zaXRpb246IHRyeUZpbGVuYW1lVHdvQ2FsbChscy5pc1ZhbGlkQnJhY2VDb21wbGV0aW9uQXRQb3NpdGlvbiksXG4gICAgICBnZXRTcGFuT2ZFbmNsb3NpbmdDb21tZW50OiB0cnlGaWxlbmFtZVR3b0NhbGwobHMuZ2V0U3Bhbk9mRW5jbG9zaW5nQ29tbWVudCksXG4gICAgICBnZXRDb2RlRml4ZXNBdFBvc2l0aW9uOiB0cnlGaWxlbmFtZUZpdmVDYWxsKGxzLmdldENvZGVGaXhlc0F0UG9zaXRpb24pLFxuICAgICAgYXBwbHlDb2RlQWN0aW9uQ29tbWFuZDpcbiAgICAgICAgICA8YW55PigoYWN0aW9uOiBhbnkpID0+IHRyeUNhbGwodW5kZWZpbmVkLCAoKSA9PiBscy5hcHBseUNvZGVBY3Rpb25Db21tYW5kKGFjdGlvbikpKSxcbiAgICAgIGdldEVtaXRPdXRwdXQ6IHRyeUZpbGVuYW1lQ2FsbChscy5nZXRFbWl0T3V0cHV0KSxcbiAgICAgIGdldFByb2dyYW06ICgpID0+IGxzLmdldFByb2dyYW0oKSxcbiAgICAgIGRpc3Bvc2U6ICgpID0+IGxzLmRpc3Bvc2UoKSxcbiAgICAgIGdldEFwcGxpY2FibGVSZWZhY3RvcnM6IHRyeUZpbGVuYW1lVHdvQ2FsbChscy5nZXRBcHBsaWNhYmxlUmVmYWN0b3JzKSxcbiAgICAgIGdldEVkaXRzRm9yUmVmYWN0b3I6IHRyeUZpbGVuYW1lRml2ZUNhbGwobHMuZ2V0RWRpdHNGb3JSZWZhY3RvciksXG4gICAgICBnZXREZWZpbml0aW9uQW5kQm91bmRTcGFuOiB0cnlGaWxlbmFtZU9uZUNhbGwobHMuZ2V0RGVmaW5pdGlvbkFuZEJvdW5kU3BhbiksXG4gICAgICBnZXRDb21iaW5lZENvZGVGaXg6XG4gICAgICAgICAgKHNjb3BlOiB0cy5Db21iaW5lZENvZGVGaXhTY29wZSwgZml4SWQ6IHt9LCBmb3JtYXRPcHRpb25zOiB0cy5Gb3JtYXRDb2RlU2V0dGluZ3MsXG4gICAgICAgICAgIHByZWZlcmVuY2VzOiB0cy5Vc2VyUHJlZmVyZW5jZXMpID0+XG4gICAgICAgICAgICAgIHRyeUNhbGwoXG4gICAgICAgICAgICAgICAgICB1bmRlZmluZWQsICgpID0+IGxzLmdldENvbWJpbmVkQ29kZUZpeChzY29wZSwgZml4SWQsIGZvcm1hdE9wdGlvbnMsIHByZWZlcmVuY2VzKSksXG4gICAgICAvLyBUT0RPKGt5bGlhdSk6IGR1bW15IGltcGxlbWVudGF0aW9uIHRvIGNvbXBpbGUgd2l0aCB0cyAyLjgsIGNyZWF0ZSByZWFsIG9uZVxuICAgICAgZ2V0U3VnZ2VzdGlvbkRpYWdub3N0aWNzOiAoZmlsZU5hbWU6IHN0cmluZykgPT4gW10sXG4gICAgICAvLyBUT0RPKGt5bGlhdSk6IGR1bW15IGltcGxlbWVudGF0aW9uIHRvIGNvbXBpbGUgd2l0aCB0cyAyLjgsIGNyZWF0ZSByZWFsIG9uZVxuICAgICAgb3JnYW5pemVJbXBvcnRzOiAoc2NvcGU6IHRzLkNvbWJpbmVkQ29kZUZpeFNjb3BlLCBmb3JtYXRPcHRpb25zOiB0cy5Gb3JtYXRDb2RlU2V0dGluZ3MpID0+IFtdLFxuICAgICAgLy8gVE9ETzogZHVtbXkgaW1wbGVtZW50YXRpb24gdG8gY29tcGlsZSB3aXRoIHRzIDIuOSwgY3JlYXRlIGEgcmVhbCBvbmVcbiAgICAgIGdldEVkaXRzRm9yRmlsZVJlbmFtZTpcbiAgICAgICAgICAob2xkRmlsZVBhdGg6IHN0cmluZywgbmV3RmlsZVBhdGg6IHN0cmluZywgZm9ybWF0T3B0aW9uczogdHMuRm9ybWF0Q29kZVNldHRpbmdzLFxuICAgICAgICAgICBwcmVmZXJlbmNlczogdHMuVXNlclByZWZlcmVuY2VzIHwgdW5kZWZpbmVkKSA9PiBbXVxuICAgIH0gYXMgdHMuTGFuZ3VhZ2VTZXJ2aWNlO1xuICAgIHJldHVybiBsYW5ndWFnZVNlcnZpY2U7XG4gIH1cblxuICBvbGRMUyA9IHR5cGVzY3JpcHRPbmx5KG9sZExTKTtcblxuICBmb3IgKGNvbnN0IGsgaW4gb2xkTFMpIHtcbiAgICAoPGFueT5wcm94eSlba10gPSBmdW5jdGlvbigpIHsgcmV0dXJuIChvbGRMUyBhcyBhbnkpW2tdLmFwcGx5KG9sZExTLCBhcmd1bWVudHMpOyB9O1xuICB9XG5cbiAgZnVuY3Rpb24gY29tcGxldGlvblRvRW50cnkoYzogQ29tcGxldGlvbik6IHRzLkNvbXBsZXRpb25FbnRyeSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC8vIFRPRE86IHJlbW92ZSBhbnkgYW5kIGZpeCB0eXBlIGVycm9yLlxuICAgICAga2luZDogYy5raW5kIGFzIGFueSxcbiAgICAgIG5hbWU6IGMubmFtZSxcbiAgICAgIHNvcnRUZXh0OiBjLnNvcnQsXG4gICAgICBraW5kTW9kaWZpZXJzOiAnJ1xuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBkaWFnbm9zdGljQ2hhaW5Ub0RpYWdub3N0aWNDaGFpbihjaGFpbjogRGlhZ25vc3RpY01lc3NhZ2VDaGFpbik6XG4gICAgICB0cy5EaWFnbm9zdGljTWVzc2FnZUNoYWluIHtcbiAgICByZXR1cm4ge1xuICAgICAgbWVzc2FnZVRleHQ6IGNoYWluLm1lc3NhZ2UsXG4gICAgICBjYXRlZ29yeTogdHMuRGlhZ25vc3RpY0NhdGVnb3J5LkVycm9yLFxuICAgICAgY29kZTogMCxcbiAgICAgIG5leHQ6IGNoYWluLm5leHQgPyBkaWFnbm9zdGljQ2hhaW5Ub0RpYWdub3N0aWNDaGFpbihjaGFpbi5uZXh0KSA6IHVuZGVmaW5lZFxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBkaWFnbm9zdGljTWVzc2FnZVRvRGlhZ25vc3RpY01lc3NhZ2VUZXh0KG1lc3NhZ2U6IHN0cmluZyB8IERpYWdub3N0aWNNZXNzYWdlQ2hhaW4pOlxuICAgICAgc3RyaW5nfHRzLkRpYWdub3N0aWNNZXNzYWdlQ2hhaW4ge1xuICAgIGlmICh0eXBlb2YgbWVzc2FnZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiBtZXNzYWdlO1xuICAgIH1cbiAgICByZXR1cm4gZGlhZ25vc3RpY0NoYWluVG9EaWFnbm9zdGljQ2hhaW4obWVzc2FnZSk7XG4gIH1cblxuICBmdW5jdGlvbiBkaWFnbm9zdGljVG9EaWFnbm9zdGljKGQ6IERpYWdub3N0aWMsIGZpbGU6IHRzLlNvdXJjZUZpbGUpOiB0cy5EaWFnbm9zdGljIHtcbiAgICBjb25zdCByZXN1bHQgPSB7XG4gICAgICBmaWxlLFxuICAgICAgc3RhcnQ6IGQuc3Bhbi5zdGFydCxcbiAgICAgIGxlbmd0aDogZC5zcGFuLmVuZCAtIGQuc3Bhbi5zdGFydCxcbiAgICAgIG1lc3NhZ2VUZXh0OiBkaWFnbm9zdGljTWVzc2FnZVRvRGlhZ25vc3RpY01lc3NhZ2VUZXh0KGQubWVzc2FnZSksXG4gICAgICBjYXRlZ29yeTogdHMuRGlhZ25vc3RpY0NhdGVnb3J5LkVycm9yLFxuICAgICAgY29kZTogMCxcbiAgICAgIHNvdXJjZTogJ25nJ1xuICAgIH07XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRyeU9wZXJhdGlvbjxUPihhdHRlbXB0aW5nOiBzdHJpbmcsIGNhbGxiYWNrOiAoKSA9PiBUKTogVHxudWxsIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaW5mby5wcm9qZWN0LnByb2plY3RTZXJ2aWNlLmxvZ2dlci5pbmZvKGBGYWlsZWQgdG8gJHthdHRlbXB0aW5nfTogJHtlLnRvU3RyaW5nKCl9YCk7XG4gICAgICBpbmZvLnByb2plY3QucHJvamVjdFNlcnZpY2UubG9nZ2VyLmluZm8oYFN0YWNrIHRyYWNlOiAke2Uuc3RhY2t9YCk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICBjb25zdCBzZXJ2aWNlSG9zdCA9IG5ldyBUeXBlU2NyaXB0U2VydmljZUhvc3QoaW5mby5sYW5ndWFnZVNlcnZpY2VIb3N0LCBpbmZvLmxhbmd1YWdlU2VydmljZSk7XG4gIGNvbnN0IGxzID0gY3JlYXRlTGFuZ3VhZ2VTZXJ2aWNlKHNlcnZpY2VIb3N0IGFzIGFueSk7XG4gIHNlcnZpY2VIb3N0LnNldFNpdGUobHMpO1xuICBwcm9qZWN0SG9zdE1hcC5zZXQoaW5mby5wcm9qZWN0LCBzZXJ2aWNlSG9zdCk7XG5cbiAgcHJveHkuZ2V0Q29tcGxldGlvbnNBdFBvc2l0aW9uID0gZnVuY3Rpb24oXG4gICAgICBmaWxlTmFtZTogc3RyaW5nLCBwb3NpdGlvbjogbnVtYmVyLCBvcHRpb25zOiB0cy5HZXRDb21wbGV0aW9uc0F0UG9zaXRpb25PcHRpb25zfHVuZGVmaW5lZCkge1xuICAgIGxldCBiYXNlID0gb2xkTFMuZ2V0Q29tcGxldGlvbnNBdFBvc2l0aW9uKGZpbGVOYW1lLCBwb3NpdGlvbiwgb3B0aW9ucykgfHwge1xuICAgICAgaXNHbG9iYWxDb21wbGV0aW9uOiBmYWxzZSxcbiAgICAgIGlzTWVtYmVyQ29tcGxldGlvbjogZmFsc2UsXG4gICAgICBpc05ld0lkZW50aWZpZXJMb2NhdGlvbjogZmFsc2UsXG4gICAgICBlbnRyaWVzOiBbXVxuICAgIH07XG4gICAgdHJ5T3BlcmF0aW9uKCdnZXQgY29tcGxldGlvbnMnLCAoKSA9PiB7XG4gICAgICBjb25zdCByZXN1bHRzID0gbHMuZ2V0Q29tcGxldGlvbnNBdChmaWxlTmFtZSwgcG9zaXRpb24pO1xuICAgICAgaWYgKHJlc3VsdHMgJiYgcmVzdWx0cy5sZW5ndGgpIHtcbiAgICAgICAgaWYgKGJhc2UgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGJhc2UgPSB7XG4gICAgICAgICAgICBpc0dsb2JhbENvbXBsZXRpb246IGZhbHNlLFxuICAgICAgICAgICAgaXNNZW1iZXJDb21wbGV0aW9uOiBmYWxzZSxcbiAgICAgICAgICAgIGlzTmV3SWRlbnRpZmllckxvY2F0aW9uOiBmYWxzZSxcbiAgICAgICAgICAgIGVudHJpZXM6IFtdXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIHJlc3VsdHMpIHtcbiAgICAgICAgICBiYXNlLmVudHJpZXMucHVzaChjb21wbGV0aW9uVG9FbnRyeShlbnRyeSkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGJhc2U7XG4gIH07XG5cbiAgcHJveHkuZ2V0UXVpY2tJbmZvQXRQb3NpdGlvbiA9IGZ1bmN0aW9uKGZpbGVOYW1lOiBzdHJpbmcsIHBvc2l0aW9uOiBudW1iZXIpOiB0cy5RdWlja0luZm8gfFxuICAgICAgdW5kZWZpbmVkIHtcbiAgICAgICAgbGV0IGJhc2UgPSBvbGRMUy5nZXRRdWlja0luZm9BdFBvc2l0aW9uKGZpbGVOYW1lLCBwb3NpdGlvbik7XG4gICAgICAgIC8vIFRPRE8odmljYik6IHRoZSB0YWdzIHByb3BlcnR5IGhhcyBiZWVuIHJlbW92ZWQgaW4gVFMgMi4yXG4gICAgICAgIHRyeU9wZXJhdGlvbignZ2V0IHF1aWNrIGluZm8nLCAoKSA9PiB7XG4gICAgICAgICAgY29uc3Qgb3VycyA9IGxzLmdldEhvdmVyQXQoZmlsZU5hbWUsIHBvc2l0aW9uKTtcbiAgICAgICAgICBpZiAob3Vycykge1xuICAgICAgICAgICAgY29uc3QgZGlzcGxheVBhcnRzOiB0cy5TeW1ib2xEaXNwbGF5UGFydFtdID0gW107XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHBhcnQgb2Ygb3Vycy50ZXh0KSB7XG4gICAgICAgICAgICAgIGRpc3BsYXlQYXJ0cy5wdXNoKHtraW5kOiBwYXJ0Lmxhbmd1YWdlIHx8ICdhbmd1bGFyJywgdGV4dDogcGFydC50ZXh0fSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB0YWdzID0gYmFzZSAmJiAoPGFueT5iYXNlKS50YWdzO1xuICAgICAgICAgICAgYmFzZSA9IDxhbnk+e1xuICAgICAgICAgICAgICBkaXNwbGF5UGFydHMsXG4gICAgICAgICAgICAgIGRvY3VtZW50YXRpb246IFtdLFxuICAgICAgICAgICAgICBraW5kOiAnYW5ndWxhcicsXG4gICAgICAgICAgICAgIGtpbmRNb2RpZmllcnM6ICd3aGF0IGRvZXMgdGhpcyBkbz8nLFxuICAgICAgICAgICAgICB0ZXh0U3Bhbjoge3N0YXJ0OiBvdXJzLnNwYW4uc3RhcnQsIGxlbmd0aDogb3Vycy5zcGFuLmVuZCAtIG91cnMuc3Bhbi5zdGFydH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKHRhZ3MpIHtcbiAgICAgICAgICAgICAgKDxhbnk+YmFzZSkudGFncyA9IHRhZ3M7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gYmFzZTtcbiAgICAgIH07XG5cbiAgcHJveHkuZ2V0U2VtYW50aWNEaWFnbm9zdGljcyA9IGZ1bmN0aW9uKGZpbGVOYW1lOiBzdHJpbmcpIHtcbiAgICBsZXQgcmVzdWx0ID0gb2xkTFMuZ2V0U2VtYW50aWNEaWFnbm9zdGljcyhmaWxlTmFtZSk7XG4gICAgY29uc3QgYmFzZSA9IHJlc3VsdCB8fCBbXTtcbiAgICB0cnlPcGVyYXRpb24oJ2dldCBkaWFnbm9zdGljcycsICgpID0+IHtcbiAgICAgIGluZm8ucHJvamVjdC5wcm9qZWN0U2VydmljZS5sb2dnZXIuaW5mbyhgQ29tcHV0aW5nIEFuZ3VsYXIgc2VtYW50aWMgZGlhZ25vc3RpY3MuLi5gKTtcbiAgICAgIGNvbnN0IG91cnMgPSBscy5nZXREaWFnbm9zdGljcyhmaWxlTmFtZSk7XG4gICAgICBpZiAob3VycyAmJiBvdXJzLmxlbmd0aCkge1xuICAgICAgICBjb25zdCBmaWxlID0gb2xkTFMuZ2V0UHJvZ3JhbSgpICEuZ2V0U291cmNlRmlsZShmaWxlTmFtZSk7XG4gICAgICAgIGlmIChmaWxlKSB7XG4gICAgICAgICAgYmFzZS5wdXNoLmFwcGx5KGJhc2UsIG91cnMubWFwKGQgPT4gZGlhZ25vc3RpY1RvRGlhZ25vc3RpYyhkLCBmaWxlKSkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gYmFzZTtcbiAgfTtcblxuICBwcm94eS5nZXREZWZpbml0aW9uQXRQb3NpdGlvbiA9IGZ1bmN0aW9uKFxuICAgICAgZmlsZU5hbWU6IHN0cmluZywgcG9zaXRpb246IG51bWJlcik6IFJlYWRvbmx5QXJyYXk8dHMuRGVmaW5pdGlvbkluZm8+IHtcbiAgICBsZXQgYmFzZSA9IG9sZExTLmdldERlZmluaXRpb25BdFBvc2l0aW9uKGZpbGVOYW1lLCBwb3NpdGlvbik7XG4gICAgaWYgKGJhc2UgJiYgYmFzZS5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBiYXNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnlPcGVyYXRpb24oJ2dldCBkZWZpbml0aW9uJywgKCkgPT4ge1xuICAgICAgICAgICAgIGNvbnN0IG91cnMgPSBscy5nZXREZWZpbml0aW9uQXQoZmlsZU5hbWUsIHBvc2l0aW9uKTtcbiAgICAgICAgICAgICBsZXQgY29tYmluZWQ7XG5cbiAgICAgICAgICAgICBpZiAob3VycyAmJiBvdXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgY29tYmluZWQgPSBiYXNlICYmIGJhc2UuY29uY2F0KFtdKSB8fCBbXTtcbiAgICAgICAgICAgICAgIGZvciAoY29uc3QgbG9jIG9mIG91cnMpIHtcbiAgICAgICAgICAgICAgICAgY29tYmluZWQucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgZmlsZU5hbWU6IGxvYy5maWxlTmFtZSxcbiAgICAgICAgICAgICAgICAgICB0ZXh0U3Bhbjoge3N0YXJ0OiBsb2Muc3Bhbi5zdGFydCwgbGVuZ3RoOiBsb2Muc3Bhbi5lbmQgLSBsb2Muc3Bhbi5zdGFydH0sXG4gICAgICAgICAgICAgICAgICAgbmFtZTogJycsXG4gICAgICAgICAgICAgICAgICAgLy8gVE9ETzogcmVtb3ZlIGFueSBhbmQgZml4IHR5cGUgZXJyb3IuXG4gICAgICAgICAgICAgICAgICAga2luZDogJ2RlZmluaXRpb24nIGFzIGFueSxcbiAgICAgICAgICAgICAgICAgICBjb250YWluZXJOYW1lOiBsb2MuZmlsZU5hbWUsXG4gICAgICAgICAgICAgICAgICAgY29udGFpbmVyS2luZDogJ2ZpbGUnIGFzIGFueSxcbiAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgIGNvbWJpbmVkID0gYmFzZTtcbiAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgcmV0dXJuIGNvbWJpbmVkO1xuICAgICAgICAgICB9KSB8fCBbXTtcbiAgfTtcblxuICByZXR1cm4gcHJveHk7XG59XG4iXX0=