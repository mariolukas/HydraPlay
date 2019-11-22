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
        define("@angular/language-service/src/typescript_host", ["require", "exports", "tslib", "@angular/compiler", "@angular/compiler-cli/src/language_services", "@angular/core", "fs", "path", "typescript", "@angular/language-service/src/language_service", "@angular/language-service/src/reflector_host"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var compiler_1 = require("@angular/compiler");
    var language_services_1 = require("@angular/compiler-cli/src/language_services");
    var core_1 = require("@angular/core");
    var fs = require("fs");
    var path = require("path");
    var ts = require("typescript");
    var language_service_1 = require("@angular/language-service/src/language_service");
    var reflector_host_1 = require("@angular/language-service/src/reflector_host");
    /**
     * Create a `LanguageServiceHost`
     */
    function createLanguageServiceFromTypescript(host, service) {
        var ngHost = new TypeScriptServiceHost(host, service);
        var ngServer = language_service_1.createLanguageService(ngHost);
        ngHost.setSite(ngServer);
        return ngServer;
    }
    exports.createLanguageServiceFromTypescript = createLanguageServiceFromTypescript;
    /**
     * The language service never needs the normalized versions of the metadata. To avoid parsing
     * the content and resolving references, return an empty file. This also allows normalizing
     * template that are syntatically incorrect which is required to provide completions in
     * syntactically incorrect templates.
     */
    var DummyHtmlParser = /** @class */ (function (_super) {
        tslib_1.__extends(DummyHtmlParser, _super);
        function DummyHtmlParser() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        DummyHtmlParser.prototype.parse = function () { return new compiler_1.ParseTreeResult([], []); };
        return DummyHtmlParser;
    }(compiler_1.HtmlParser));
    exports.DummyHtmlParser = DummyHtmlParser;
    /**
     * Avoid loading resources in the language servcie by using a dummy loader.
     */
    var DummyResourceLoader = /** @class */ (function (_super) {
        tslib_1.__extends(DummyResourceLoader, _super);
        function DummyResourceLoader() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        DummyResourceLoader.prototype.get = function (url) { return Promise.resolve(''); };
        return DummyResourceLoader;
    }(compiler_1.ResourceLoader));
    exports.DummyResourceLoader = DummyResourceLoader;
    /**
     * An implementation of a `LanguageServiceHost` for a TypeScript project.
     *
     * The `TypeScriptServiceHost` implements the Angular `LanguageServiceHost` using
     * the TypeScript language services.
     *
     * @publicApi
     */
    var TypeScriptServiceHost = /** @class */ (function () {
        function TypeScriptServiceHost(host, tsService) {
            this.host = host;
            this.tsService = tsService;
            this._staticSymbolCache = new compiler_1.StaticSymbolCache();
            this._typeCache = [];
            this.modulesOutOfDate = true;
            this.fileVersions = new Map();
        }
        TypeScriptServiceHost.prototype.setSite = function (service) { this.service = service; };
        Object.defineProperty(TypeScriptServiceHost.prototype, "resolver", {
            /**
             * Angular LanguageServiceHost implementation
             */
            get: function () {
                var _this = this;
                this.validate();
                var result = this._resolver;
                if (!result) {
                    var moduleResolver = new compiler_1.NgModuleResolver(this.reflector);
                    var directiveResolver = new compiler_1.DirectiveResolver(this.reflector);
                    var pipeResolver = new compiler_1.PipeResolver(this.reflector);
                    var elementSchemaRegistry = new compiler_1.DomElementSchemaRegistry();
                    var resourceLoader = new DummyResourceLoader();
                    var urlResolver = compiler_1.createOfflineCompileUrlResolver();
                    var htmlParser = new DummyHtmlParser();
                    // This tracks the CompileConfig in codegen.ts. Currently these options
                    // are hard-coded.
                    var config = new compiler_1.CompilerConfig({ defaultEncapsulation: core_1.ViewEncapsulation.Emulated, useJit: false });
                    var directiveNormalizer = new compiler_1.DirectiveNormalizer(resourceLoader, urlResolver, htmlParser, config);
                    result = this._resolver = new compiler_1.CompileMetadataResolver(config, htmlParser, moduleResolver, directiveResolver, pipeResolver, new compiler_1.JitSummaryResolver(), elementSchemaRegistry, directiveNormalizer, new core_1.ɵConsole(), this._staticSymbolCache, this.reflector, function (error, type) { return _this.collectError(error, type && type.filePath); });
                }
                return result;
            },
            enumerable: true,
            configurable: true
        });
        TypeScriptServiceHost.prototype.getTemplateReferences = function () {
            this.ensureTemplateMap();
            return this.templateReferences || [];
        };
        TypeScriptServiceHost.prototype.getTemplateAt = function (fileName, position) {
            var sourceFile = this.getSourceFile(fileName);
            if (sourceFile) {
                this.context = sourceFile.fileName;
                var node = this.findNode(sourceFile, position);
                if (node) {
                    return this.getSourceFromNode(fileName, this.host.getScriptVersion(sourceFile.fileName), node);
                }
            }
            else {
                this.ensureTemplateMap();
                // TODO: Cannocalize the file?
                var componentType = this.fileToComponent.get(fileName);
                if (componentType) {
                    return this.getSourceFromType(fileName, this.host.getScriptVersion(fileName), componentType);
                }
            }
            return undefined;
        };
        TypeScriptServiceHost.prototype.getAnalyzedModules = function () {
            this.updateAnalyzedModules();
            return this.ensureAnalyzedModules();
        };
        TypeScriptServiceHost.prototype.ensureAnalyzedModules = function () {
            var analyzedModules = this.analyzedModules;
            if (!analyzedModules) {
                if (this.host.getScriptFileNames().length === 0) {
                    analyzedModules = {
                        files: [],
                        ngModuleByPipeOrDirective: new Map(),
                        ngModules: [],
                    };
                }
                else {
                    var analyzeHost = { isSourceFile: function (filePath) { return true; } };
                    var programFiles = this.program.getSourceFiles().map(function (sf) { return sf.fileName; });
                    analyzedModules =
                        compiler_1.analyzeNgModules(programFiles, analyzeHost, this.staticSymbolResolver, this.resolver);
                }
                this.analyzedModules = analyzedModules;
            }
            return analyzedModules;
        };
        TypeScriptServiceHost.prototype.getTemplates = function (fileName) {
            var _this = this;
            this.ensureTemplateMap();
            var componentType = this.fileToComponent.get(fileName);
            if (componentType) {
                var templateSource = this.getTemplateAt(fileName, 0);
                if (templateSource) {
                    return [templateSource];
                }
            }
            else {
                var version_1 = this.host.getScriptVersion(fileName);
                var result_1 = [];
                // Find each template string in the file
                var visit_1 = function (child) {
                    var templateSource = _this.getSourceFromNode(fileName, version_1, child);
                    if (templateSource) {
                        result_1.push(templateSource);
                    }
                    else {
                        ts.forEachChild(child, visit_1);
                    }
                };
                var sourceFile = this.getSourceFile(fileName);
                if (sourceFile) {
                    this.context = sourceFile.path || sourceFile.fileName;
                    ts.forEachChild(sourceFile, visit_1);
                }
                return result_1.length ? result_1 : undefined;
            }
        };
        TypeScriptServiceHost.prototype.getDeclarations = function (fileName) {
            var _this = this;
            var result = [];
            var sourceFile = this.getSourceFile(fileName);
            if (sourceFile) {
                var visit_2 = function (child) {
                    var declaration = _this.getDeclarationFromNode(sourceFile, child);
                    if (declaration) {
                        result.push(declaration);
                    }
                    else {
                        ts.forEachChild(child, visit_2);
                    }
                };
                ts.forEachChild(sourceFile, visit_2);
            }
            return result;
        };
        TypeScriptServiceHost.prototype.getSourceFile = function (fileName) {
            return this.tsService.getProgram().getSourceFile(fileName);
        };
        TypeScriptServiceHost.prototype.updateAnalyzedModules = function () {
            this.validate();
            if (this.modulesOutOfDate) {
                this.analyzedModules = null;
                this._reflector = null;
                this.templateReferences = null;
                this.fileToComponent = null;
                this.ensureAnalyzedModules();
                this.modulesOutOfDate = false;
            }
        };
        Object.defineProperty(TypeScriptServiceHost.prototype, "program", {
            get: function () { return this.tsService.getProgram(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TypeScriptServiceHost.prototype, "checker", {
            get: function () {
                var checker = this._checker;
                if (!checker) {
                    checker = this._checker = this.program.getTypeChecker();
                }
                return checker;
            },
            enumerable: true,
            configurable: true
        });
        TypeScriptServiceHost.prototype.validate = function () {
            var _this = this;
            var e_1, _a;
            var program = this.program;
            if (this.lastProgram !== program) {
                // Invalidate file that have changed in the static symbol resolver
                var invalidateFile = function (fileName) {
                    return _this._staticSymbolResolver.invalidateFile(fileName);
                };
                this.clearCaches();
                var seen_1 = new Set();
                try {
                    for (var _b = tslib_1.__values(this.program.getSourceFiles()), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var sourceFile = _c.value;
                        var fileName = sourceFile.fileName;
                        seen_1.add(fileName);
                        var version = this.host.getScriptVersion(fileName);
                        var lastVersion = this.fileVersions.get(fileName);
                        if (version != lastVersion) {
                            this.fileVersions.set(fileName, version);
                            if (this._staticSymbolResolver) {
                                invalidateFile(fileName);
                            }
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                // Remove file versions that are no longer in the file and invalidate them.
                var missing = Array.from(this.fileVersions.keys()).filter(function (f) { return !seen_1.has(f); });
                missing.forEach(function (f) { return _this.fileVersions.delete(f); });
                if (this._staticSymbolResolver) {
                    missing.forEach(invalidateFile);
                }
                this.lastProgram = program;
            }
        };
        TypeScriptServiceHost.prototype.clearCaches = function () {
            this._checker = null;
            this._typeCache = [];
            this._resolver = null;
            this.collectedErrors = null;
            this.modulesOutOfDate = true;
        };
        TypeScriptServiceHost.prototype.ensureTemplateMap = function () {
            var e_2, _a, e_3, _b;
            if (!this.fileToComponent || !this.templateReferences) {
                var fileToComponent = new Map();
                var templateReference = [];
                var ngModuleSummary = this.getAnalyzedModules();
                var urlResolver = compiler_1.createOfflineCompileUrlResolver();
                try {
                    for (var _c = tslib_1.__values(ngModuleSummary.ngModules), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var module_1 = _d.value;
                        try {
                            for (var _e = tslib_1.__values(module_1.declaredDirectives), _f = _e.next(); !_f.done; _f = _e.next()) {
                                var directive = _f.value;
                                var metadata = this.resolver.getNonNormalizedDirectiveMetadata(directive.reference).metadata;
                                if (metadata.isComponent && metadata.template && metadata.template.templateUrl) {
                                    var templateName = urlResolver.resolve(this.reflector.componentModuleUrl(directive.reference), metadata.template.templateUrl);
                                    fileToComponent.set(templateName, directive.reference);
                                    templateReference.push(templateName);
                                }
                            }
                        }
                        catch (e_3_1) { e_3 = { error: e_3_1 }; }
                        finally {
                            try {
                                if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                            }
                            finally { if (e_3) throw e_3.error; }
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
                this.fileToComponent = fileToComponent;
                this.templateReferences = templateReference;
            }
        };
        TypeScriptServiceHost.prototype.getSourceFromDeclaration = function (fileName, version, source, span, type, declaration, node, sourceFile) {
            var queryCache = undefined;
            var t = this;
            if (declaration) {
                return {
                    version: version,
                    source: source,
                    span: span,
                    type: type,
                    get members() {
                        return language_services_1.getClassMembersFromDeclaration(t.program, t.checker, sourceFile, declaration);
                    },
                    get query() {
                        if (!queryCache) {
                            var pipes_1 = t.service.getPipesAt(fileName, node.getStart());
                            queryCache = language_services_1.getSymbolQuery(t.program, t.checker, sourceFile, function () { return language_services_1.getPipesTable(sourceFile, t.program, t.checker, pipes_1); });
                        }
                        return queryCache;
                    }
                };
            }
        };
        TypeScriptServiceHost.prototype.getSourceFromNode = function (fileName, version, node) {
            var result = undefined;
            var t = this;
            switch (node.kind) {
                case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
                case ts.SyntaxKind.StringLiteral:
                    var _a = tslib_1.__read(this.getTemplateClassDeclFromNode(node), 2), declaration = _a[0], decorator = _a[1];
                    if (declaration && declaration.name) {
                        var sourceFile = this.getSourceFile(fileName);
                        if (sourceFile) {
                            return this.getSourceFromDeclaration(fileName, version, this.stringOf(node) || '', shrink(spanOf(node)), this.reflector.getStaticSymbol(sourceFile.fileName, declaration.name.text), declaration, node, sourceFile);
                        }
                    }
                    break;
            }
            return result;
        };
        TypeScriptServiceHost.prototype.getSourceFromType = function (fileName, version, type) {
            var result = undefined;
            var declaration = this.getTemplateClassFromStaticSymbol(type);
            if (declaration) {
                var snapshot = this.host.getScriptSnapshot(fileName);
                if (snapshot) {
                    var source = snapshot.getText(0, snapshot.getLength());
                    result = this.getSourceFromDeclaration(fileName, version, source, { start: 0, end: source.length }, type, declaration, declaration, declaration.getSourceFile());
                }
            }
            return result;
        };
        Object.defineProperty(TypeScriptServiceHost.prototype, "reflectorHost", {
            get: function () {
                var _this = this;
                var result = this._reflectorHost;
                if (!result) {
                    if (!this.context) {
                        // Make up a context by finding the first script and using that as the base dir.
                        var scriptFileNames = this.host.getScriptFileNames();
                        if (0 === scriptFileNames.length) {
                            throw new Error('Internal error: no script file names found');
                        }
                        this.context = scriptFileNames[0];
                    }
                    // Use the file context's directory as the base directory.
                    // The host's getCurrentDirectory() is not reliable as it is always "" in
                    // tsserver. We don't need the exact base directory, just one that contains
                    // a source file.
                    var source = this.tsService.getProgram().getSourceFile(this.context);
                    if (!source) {
                        throw new Error('Internal error: no context could be determined');
                    }
                    var tsConfigPath = findTsConfig(source.fileName);
                    var basePath = path.dirname(tsConfigPath || this.context);
                    var options = { basePath: basePath, genDir: basePath };
                    var compilerOptions = this.host.getCompilationSettings();
                    if (compilerOptions && compilerOptions.baseUrl) {
                        options.baseUrl = compilerOptions.baseUrl;
                    }
                    if (compilerOptions && compilerOptions.paths) {
                        options.paths = compilerOptions.paths;
                    }
                    result = this._reflectorHost =
                        new reflector_host_1.ReflectorHost(function () { return _this.tsService.getProgram(); }, this.host, options);
                }
                return result;
            },
            enumerable: true,
            configurable: true
        });
        TypeScriptServiceHost.prototype.collectError = function (error, filePath) {
            if (filePath) {
                var errorMap = this.collectedErrors;
                if (!errorMap || !this.collectedErrors) {
                    errorMap = this.collectedErrors = new Map();
                }
                var errors = errorMap.get(filePath);
                if (!errors) {
                    errors = [];
                    this.collectedErrors.set(filePath, errors);
                }
                errors.push(error);
            }
        };
        Object.defineProperty(TypeScriptServiceHost.prototype, "staticSymbolResolver", {
            get: function () {
                var _this = this;
                var result = this._staticSymbolResolver;
                if (!result) {
                    this._summaryResolver = new compiler_1.AotSummaryResolver({
                        loadSummary: function (filePath) { return null; },
                        isSourceFile: function (sourceFilePath) { return true; },
                        toSummaryFileName: function (sourceFilePath) { return sourceFilePath; },
                        fromSummaryFileName: function (filePath) { return filePath; },
                    }, this._staticSymbolCache);
                    result = this._staticSymbolResolver = new compiler_1.StaticSymbolResolver(this.reflectorHost, this._staticSymbolCache, this._summaryResolver, function (e, filePath) { return _this.collectError(e, filePath); });
                }
                return result;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TypeScriptServiceHost.prototype, "reflector", {
            get: function () {
                var _this = this;
                var result = this._reflector;
                if (!result) {
                    var ssr = this.staticSymbolResolver;
                    result = this._reflector = new compiler_1.StaticReflector(this._summaryResolver, ssr, [], [], function (e, filePath) { return _this.collectError(e, filePath); });
                }
                return result;
            },
            enumerable: true,
            configurable: true
        });
        TypeScriptServiceHost.prototype.getTemplateClassFromStaticSymbol = function (type) {
            var source = this.getSourceFile(type.filePath);
            if (source) {
                var declarationNode = ts.forEachChild(source, function (child) {
                    if (child.kind === ts.SyntaxKind.ClassDeclaration) {
                        var classDeclaration = child;
                        if (classDeclaration.name != null && classDeclaration.name.text === type.name) {
                            return classDeclaration;
                        }
                    }
                });
                return declarationNode;
            }
            return undefined;
        };
        /**
         * Given a template string node, see if it is an Angular template string, and if so return the
         * containing class.
         */
        TypeScriptServiceHost.prototype.getTemplateClassDeclFromNode = function (currentToken) {
            // Verify we are in a 'template' property assignment, in an object literal, which is an call
            // arg, in a decorator
            var parentNode = currentToken.parent; // PropertyAssignment
            if (!parentNode) {
                return TypeScriptServiceHost.missingTemplate;
            }
            if (parentNode.kind !== ts.SyntaxKind.PropertyAssignment) {
                return TypeScriptServiceHost.missingTemplate;
            }
            else {
                // TODO: Is this different for a literal, i.e. a quoted property name like "template"?
                if (parentNode.name.text !== 'template') {
                    return TypeScriptServiceHost.missingTemplate;
                }
            }
            parentNode = parentNode.parent; // ObjectLiteralExpression
            if (!parentNode || parentNode.kind !== ts.SyntaxKind.ObjectLiteralExpression) {
                return TypeScriptServiceHost.missingTemplate;
            }
            parentNode = parentNode.parent; // CallExpression
            if (!parentNode || parentNode.kind !== ts.SyntaxKind.CallExpression) {
                return TypeScriptServiceHost.missingTemplate;
            }
            var callTarget = parentNode.expression;
            var decorator = parentNode.parent; // Decorator
            if (!decorator || decorator.kind !== ts.SyntaxKind.Decorator) {
                return TypeScriptServiceHost.missingTemplate;
            }
            var declaration = decorator.parent; // ClassDeclaration
            if (!declaration || declaration.kind !== ts.SyntaxKind.ClassDeclaration) {
                return TypeScriptServiceHost.missingTemplate;
            }
            return [declaration, callTarget];
        };
        TypeScriptServiceHost.prototype.getCollectedErrors = function (defaultSpan, sourceFile) {
            var errors = (this.collectedErrors && this.collectedErrors.get(sourceFile.fileName));
            return (errors && errors.map(function (e) {
                var line = e.line || (e.position && e.position.line);
                var column = e.column || (e.position && e.position.column);
                var span = spanAt(sourceFile, line, column) || defaultSpan;
                if (compiler_1.isFormattedError(e)) {
                    return errorToDiagnosticWithChain(e, span);
                }
                return { message: e.message, span: span };
            })) ||
                [];
        };
        TypeScriptServiceHost.prototype.getDeclarationFromNode = function (sourceFile, node) {
            var e_4, _a;
            if (node.kind == ts.SyntaxKind.ClassDeclaration && node.decorators &&
                node.name) {
                try {
                    for (var _b = tslib_1.__values(node.decorators), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var decorator = _c.value;
                        if (decorator.expression && decorator.expression.kind == ts.SyntaxKind.CallExpression) {
                            var classDeclaration = node;
                            if (classDeclaration.name) {
                                var call = decorator.expression;
                                var target = call.expression;
                                var type = this.checker.getTypeAtLocation(target);
                                if (type) {
                                    var staticSymbol = this.reflector.getStaticSymbol(sourceFile.fileName, classDeclaration.name.text);
                                    try {
                                        if (this.resolver.isDirective(staticSymbol)) {
                                            var metadata = this.resolver.getNonNormalizedDirectiveMetadata(staticSymbol).metadata;
                                            var declarationSpan = spanOf(target);
                                            return {
                                                type: staticSymbol,
                                                declarationSpan: declarationSpan,
                                                metadata: metadata,
                                                errors: this.getCollectedErrors(declarationSpan, sourceFile)
                                            };
                                        }
                                    }
                                    catch (e) {
                                        if (e.message) {
                                            this.collectError(e, sourceFile.fileName);
                                            var declarationSpan = spanOf(target);
                                            return {
                                                type: staticSymbol,
                                                declarationSpan: declarationSpan,
                                                errors: this.getCollectedErrors(declarationSpan, sourceFile)
                                            };
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
            }
        };
        TypeScriptServiceHost.prototype.stringOf = function (node) {
            switch (node.kind) {
                case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
                    return node.text;
                case ts.SyntaxKind.StringLiteral:
                    return node.text;
            }
        };
        TypeScriptServiceHost.prototype.findNode = function (sourceFile, position) {
            function find(node) {
                if (position >= node.getStart() && position < node.getEnd()) {
                    return ts.forEachChild(node, find) || node;
                }
            }
            return find(sourceFile);
        };
        TypeScriptServiceHost.missingTemplate = [undefined, undefined];
        return TypeScriptServiceHost;
    }());
    exports.TypeScriptServiceHost = TypeScriptServiceHost;
    function findTsConfig(fileName) {
        var dir = path.dirname(fileName);
        while (fs.existsSync(dir)) {
            var candidate = path.join(dir, 'tsconfig.json');
            if (fs.existsSync(candidate))
                return candidate;
            var parentDir = path.dirname(dir);
            if (parentDir === dir)
                break;
            dir = parentDir;
        }
    }
    function spanOf(node) {
        return { start: node.getStart(), end: node.getEnd() };
    }
    function shrink(span, offset) {
        if (offset == null)
            offset = 1;
        return { start: span.start + offset, end: span.end - offset };
    }
    function spanAt(sourceFile, line, column) {
        if (line != null && column != null) {
            var position_1 = ts.getPositionOfLineAndCharacter(sourceFile, line, column);
            var findChild = function findChild(node) {
                if (node.kind > ts.SyntaxKind.LastToken && node.pos <= position_1 && node.end > position_1) {
                    var betterNode = ts.forEachChild(node, findChild);
                    return betterNode || node;
                }
            };
            var node = ts.forEachChild(sourceFile, findChild);
            if (node) {
                return { start: node.getStart(), end: node.getEnd() };
            }
        }
    }
    function chainedMessage(chain, indent) {
        if (indent === void 0) { indent = ''; }
        return indent + chain.message + (chain.next ? chainedMessage(chain.next, indent + '  ') : '');
    }
    var DiagnosticMessageChainImpl = /** @class */ (function () {
        function DiagnosticMessageChainImpl(message, next) {
            this.message = message;
            this.next = next;
        }
        DiagnosticMessageChainImpl.prototype.toString = function () { return chainedMessage(this); };
        return DiagnosticMessageChainImpl;
    }());
    function convertChain(chain) {
        return { message: chain.message, next: chain.next ? convertChain(chain.next) : undefined };
    }
    function errorToDiagnosticWithChain(error, span) {
        return { message: error.chain ? convertChain(error.chain) : error.message, span: span };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXNjcmlwdF9ob3N0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvbGFuZ3VhZ2Utc2VydmljZS9zcmMvdHlwZXNjcmlwdF9ob3N0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILDhDQUEyZjtJQUMzZixpRkFBMkk7SUFDM0ksc0NBQXFFO0lBQ3JFLHVCQUF5QjtJQUN6QiwyQkFBNkI7SUFDN0IsK0JBQWlDO0lBRWpDLG1GQUF5RDtJQUN6RCwrRUFBK0M7SUFJL0M7O09BRUc7SUFDSCxTQUFnQixtQ0FBbUMsQ0FDL0MsSUFBNEIsRUFBRSxPQUEyQjtRQUMzRCxJQUFNLE1BQU0sR0FBRyxJQUFJLHFCQUFxQixDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN4RCxJQUFNLFFBQVEsR0FBRyx3Q0FBcUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMvQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3pCLE9BQU8sUUFBUSxDQUFDO0lBQ2xCLENBQUM7SUFORCxrRkFNQztJQUVEOzs7OztPQUtHO0lBQ0g7UUFBcUMsMkNBQVU7UUFBL0M7O1FBRUEsQ0FBQztRQURDLCtCQUFLLEdBQUwsY0FBMkIsT0FBTyxJQUFJLDBCQUFlLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsRSxzQkFBQztJQUFELENBQUMsQUFGRCxDQUFxQyxxQkFBVSxHQUU5QztJQUZZLDBDQUFlO0lBSTVCOztPQUVHO0lBQ0g7UUFBeUMsK0NBQWM7UUFBdkQ7O1FBRUEsQ0FBQztRQURDLGlDQUFHLEdBQUgsVUFBSSxHQUFXLElBQXFCLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkUsMEJBQUM7SUFBRCxDQUFDLEFBRkQsQ0FBeUMseUJBQWMsR0FFdEQ7SUFGWSxr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SSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2hHLENBQUM7SUFFRDtRQUNFLG9DQUFtQixPQUFlLEVBQVMsSUFBNkI7WUFBckQsWUFBTyxHQUFQLE9BQU8sQ0FBUTtZQUFTLFNBQUksR0FBSixJQUFJLENBQXlCO1FBQUcsQ0FBQztRQUM1RSw2Q0FBUSxHQUFSLGNBQXFCLE9BQU8sY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyRCxpQ0FBQztJQUFELENBQUMsQUFIRCxJQUdDO0lBRUQsU0FBUyxZQUFZLENBQUMsS0FBNEI7UUFDaEQsT0FBTyxFQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUMsQ0FBQztJQUMzRixDQUFDO0lBRUQsU0FBUywwQkFBMEIsQ0FBQyxLQUFxQixFQUFFLElBQVU7UUFDbkUsT0FBTyxFQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLElBQUksTUFBQSxFQUFDLENBQUM7SUFDbEYsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBb3RTdW1tYXJ5UmVzb2x2ZXIsIENvbXBpbGVNZXRhZGF0YVJlc29sdmVyLCBDb21waWxlckNvbmZpZywgREVGQVVMVF9JTlRFUlBPTEFUSU9OX0NPTkZJRywgRGlyZWN0aXZlTm9ybWFsaXplciwgRGlyZWN0aXZlUmVzb2x2ZXIsIERvbUVsZW1lbnRTY2hlbWFSZWdpc3RyeSwgRm9ybWF0dGVkRXJyb3IsIEZvcm1hdHRlZE1lc3NhZ2VDaGFpbiwgSHRtbFBhcnNlciwgSW50ZXJwb2xhdGlvbkNvbmZpZywgSml0U3VtbWFyeVJlc29sdmVyLCBOZ0FuYWx5emVkTW9kdWxlcywgTmdNb2R1bGVSZXNvbHZlciwgUGFyc2VUcmVlUmVzdWx0LCBQaXBlUmVzb2x2ZXIsIFJlc291cmNlTG9hZGVyLCBTdGF0aWNSZWZsZWN0b3IsIFN0YXRpY1N5bWJvbCwgU3RhdGljU3ltYm9sQ2FjaGUsIFN0YXRpY1N5bWJvbFJlc29sdmVyLCBhbmFseXplTmdNb2R1bGVzLCBjcmVhdGVPZmZsaW5lQ29tcGlsZVVybFJlc29sdmVyLCBpc0Zvcm1hdHRlZEVycm9yfSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5pbXBvcnQge0NvbXBpbGVyT3B0aW9ucywgZ2V0Q2xhc3NNZW1iZXJzRnJvbURlY2xhcmF0aW9uLCBnZXRQaXBlc1RhYmxlLCBnZXRTeW1ib2xRdWVyeX0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXItY2xpL3NyYy9sYW5ndWFnZV9zZXJ2aWNlcyc7XG5pbXBvcnQge1ZpZXdFbmNhcHN1bGF0aW9uLCDJtUNvbnNvbGUgYXMgQ29uc29sZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7Y3JlYXRlTGFuZ3VhZ2VTZXJ2aWNlfSBmcm9tICcuL2xhbmd1YWdlX3NlcnZpY2UnO1xuaW1wb3J0IHtSZWZsZWN0b3JIb3N0fSBmcm9tICcuL3JlZmxlY3Rvcl9ob3N0JztcbmltcG9ydCB7RGVjbGFyYXRpb24sIERlY2xhcmF0aW9uRXJyb3IsIERlY2xhcmF0aW9ucywgRGlhZ25vc3RpY01lc3NhZ2VDaGFpbiwgTGFuZ3VhZ2VTZXJ2aWNlLCBMYW5ndWFnZVNlcnZpY2VIb3N0LCBTcGFuLCBTeW1ib2wsIFN5bWJvbFF1ZXJ5LCBUZW1wbGF0ZVNvdXJjZSwgVGVtcGxhdGVTb3VyY2VzfSBmcm9tICcuL3R5cGVzJztcblxuXG4vKipcbiAqIENyZWF0ZSBhIGBMYW5ndWFnZVNlcnZpY2VIb3N0YFxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTGFuZ3VhZ2VTZXJ2aWNlRnJvbVR5cGVzY3JpcHQoXG4gICAgaG9zdDogdHMuTGFuZ3VhZ2VTZXJ2aWNlSG9zdCwgc2VydmljZTogdHMuTGFuZ3VhZ2VTZXJ2aWNlKTogTGFuZ3VhZ2VTZXJ2aWNlIHtcbiAgY29uc3QgbmdIb3N0ID0gbmV3IFR5cGVTY3JpcHRTZXJ2aWNlSG9zdChob3N0LCBzZXJ2aWNlKTtcbiAgY29uc3QgbmdTZXJ2ZXIgPSBjcmVhdGVMYW5ndWFnZVNlcnZpY2UobmdIb3N0KTtcbiAgbmdIb3N0LnNldFNpdGUobmdTZXJ2ZXIpO1xuICByZXR1cm4gbmdTZXJ2ZXI7XG59XG5cbi8qKlxuICogVGhlIGxhbmd1YWdlIHNlcnZpY2UgbmV2ZXIgbmVlZHMgdGhlIG5vcm1hbGl6ZWQgdmVyc2lvbnMgb2YgdGhlIG1ldGFkYXRhLiBUbyBhdm9pZCBwYXJzaW5nXG4gKiB0aGUgY29udGVudCBhbmQgcmVzb2x2aW5nIHJlZmVyZW5jZXMsIHJldHVybiBhbiBlbXB0eSBmaWxlLiBUaGlzIGFsc28gYWxsb3dzIG5vcm1hbGl6aW5nXG4gKiB0ZW1wbGF0ZSB0aGF0IGFyZSBzeW50YXRpY2FsbHkgaW5jb3JyZWN0IHdoaWNoIGlzIHJlcXVpcmVkIHRvIHByb3ZpZGUgY29tcGxldGlvbnMgaW5cbiAqIHN5bnRhY3RpY2FsbHkgaW5jb3JyZWN0IHRlbXBsYXRlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIER1bW15SHRtbFBhcnNlciBleHRlbmRzIEh0bWxQYXJzZXIge1xuICBwYXJzZSgpOiBQYXJzZVRyZWVSZXN1bHQgeyByZXR1cm4gbmV3IFBhcnNlVHJlZVJlc3VsdChbXSwgW10pOyB9XG59XG5cbi8qKlxuICogQXZvaWQgbG9hZGluZyByZXNvdXJjZXMgaW4gdGhlIGxhbmd1YWdlIHNlcnZjaWUgYnkgdXNpbmcgYSBkdW1teSBsb2FkZXIuXG4gKi9cbmV4cG9ydCBjbGFzcyBEdW1teVJlc291cmNlTG9hZGVyIGV4dGVuZHMgUmVzb3VyY2VMb2FkZXIge1xuICBnZXQodXJsOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4geyByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCcnKTsgfVxufVxuXG4vKipcbiAqIEFuIGltcGxlbWVudGF0aW9uIG9mIGEgYExhbmd1YWdlU2VydmljZUhvc3RgIGZvciBhIFR5cGVTY3JpcHQgcHJvamVjdC5cbiAqXG4gKiBUaGUgYFR5cGVTY3JpcHRTZXJ2aWNlSG9zdGAgaW1wbGVtZW50cyB0aGUgQW5ndWxhciBgTGFuZ3VhZ2VTZXJ2aWNlSG9zdGAgdXNpbmdcbiAqIHRoZSBUeXBlU2NyaXB0IGxhbmd1YWdlIHNlcnZpY2VzLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIFR5cGVTY3JpcHRTZXJ2aWNlSG9zdCBpbXBsZW1lbnRzIExhbmd1YWdlU2VydmljZUhvc3Qge1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBfcmVzb2x2ZXIgITogQ29tcGlsZU1ldGFkYXRhUmVzb2x2ZXIgfCBudWxsO1xuICBwcml2YXRlIF9zdGF0aWNTeW1ib2xDYWNoZSA9IG5ldyBTdGF0aWNTeW1ib2xDYWNoZSgpO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBfc3VtbWFyeVJlc29sdmVyICE6IEFvdFN1bW1hcnlSZXNvbHZlcjtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgX3N0YXRpY1N5bWJvbFJlc29sdmVyICE6IFN0YXRpY1N5bWJvbFJlc29sdmVyO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBfcmVmbGVjdG9yICE6IFN0YXRpY1JlZmxlY3RvciB8IG51bGw7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIF9yZWZsZWN0b3JIb3N0ICE6IFJlZmxlY3Rvckhvc3Q7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIF9jaGVja2VyICE6IHRzLlR5cGVDaGVja2VyIHwgbnVsbDtcbiAgcHJpdmF0ZSBfdHlwZUNhY2hlOiBTeW1ib2xbXSA9IFtdO1xuICBwcml2YXRlIGNvbnRleHQ6IHN0cmluZ3x1bmRlZmluZWQ7XG4gIHByaXZhdGUgbGFzdFByb2dyYW06IHRzLlByb2dyYW18dW5kZWZpbmVkO1xuICBwcml2YXRlIG1vZHVsZXNPdXRPZkRhdGU6IGJvb2xlYW4gPSB0cnVlO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBhbmFseXplZE1vZHVsZXMgITogTmdBbmFseXplZE1vZHVsZXMgfCBudWxsO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBzZXJ2aWNlICE6IExhbmd1YWdlU2VydmljZTtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgZmlsZVRvQ29tcG9uZW50ICE6IE1hcDxzdHJpbmcsIFN0YXRpY1N5bWJvbD58IG51bGw7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIHRlbXBsYXRlUmVmZXJlbmNlcyAhOiBzdHJpbmdbXSB8IG51bGw7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIGNvbGxlY3RlZEVycm9ycyAhOiBNYXA8c3RyaW5nLCBhbnlbXT58IG51bGw7XG4gIHByaXZhdGUgZmlsZVZlcnNpb25zID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGhvc3Q6IHRzLkxhbmd1YWdlU2VydmljZUhvc3QsIHByaXZhdGUgdHNTZXJ2aWNlOiB0cy5MYW5ndWFnZVNlcnZpY2UpIHt9XG5cbiAgc2V0U2l0ZShzZXJ2aWNlOiBMYW5ndWFnZVNlcnZpY2UpIHsgdGhpcy5zZXJ2aWNlID0gc2VydmljZTsgfVxuXG4gIC8qKlxuICAgKiBBbmd1bGFyIExhbmd1YWdlU2VydmljZUhvc3QgaW1wbGVtZW50YXRpb25cbiAgICovXG4gIGdldCByZXNvbHZlcigpOiBDb21waWxlTWV0YWRhdGFSZXNvbHZlciB7XG4gICAgdGhpcy52YWxpZGF0ZSgpO1xuICAgIGxldCByZXN1bHQgPSB0aGlzLl9yZXNvbHZlcjtcbiAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgY29uc3QgbW9kdWxlUmVzb2x2ZXIgPSBuZXcgTmdNb2R1bGVSZXNvbHZlcih0aGlzLnJlZmxlY3Rvcik7XG4gICAgICBjb25zdCBkaXJlY3RpdmVSZXNvbHZlciA9IG5ldyBEaXJlY3RpdmVSZXNvbHZlcih0aGlzLnJlZmxlY3Rvcik7XG4gICAgICBjb25zdCBwaXBlUmVzb2x2ZXIgPSBuZXcgUGlwZVJlc29sdmVyKHRoaXMucmVmbGVjdG9yKTtcbiAgICAgIGNvbnN0IGVsZW1lbnRTY2hlbWFSZWdpc3RyeSA9IG5ldyBEb21FbGVtZW50U2NoZW1hUmVnaXN0cnkoKTtcbiAgICAgIGNvbnN0IHJlc291cmNlTG9hZGVyID0gbmV3IER1bW15UmVzb3VyY2VMb2FkZXIoKTtcbiAgICAgIGNvbnN0IHVybFJlc29sdmVyID0gY3JlYXRlT2ZmbGluZUNvbXBpbGVVcmxSZXNvbHZlcigpO1xuICAgICAgY29uc3QgaHRtbFBhcnNlciA9IG5ldyBEdW1teUh0bWxQYXJzZXIoKTtcbiAgICAgIC8vIFRoaXMgdHJhY2tzIHRoZSBDb21waWxlQ29uZmlnIGluIGNvZGVnZW4udHMuIEN1cnJlbnRseSB0aGVzZSBvcHRpb25zXG4gICAgICAvLyBhcmUgaGFyZC1jb2RlZC5cbiAgICAgIGNvbnN0IGNvbmZpZyA9XG4gICAgICAgICAgbmV3IENvbXBpbGVyQ29uZmlnKHtkZWZhdWx0RW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uRW11bGF0ZWQsIHVzZUppdDogZmFsc2V9KTtcbiAgICAgIGNvbnN0IGRpcmVjdGl2ZU5vcm1hbGl6ZXIgPVxuICAgICAgICAgIG5ldyBEaXJlY3RpdmVOb3JtYWxpemVyKHJlc291cmNlTG9hZGVyLCB1cmxSZXNvbHZlciwgaHRtbFBhcnNlciwgY29uZmlnKTtcblxuICAgICAgcmVzdWx0ID0gdGhpcy5fcmVzb2x2ZXIgPSBuZXcgQ29tcGlsZU1ldGFkYXRhUmVzb2x2ZXIoXG4gICAgICAgICAgY29uZmlnLCBodG1sUGFyc2VyLCBtb2R1bGVSZXNvbHZlciwgZGlyZWN0aXZlUmVzb2x2ZXIsIHBpcGVSZXNvbHZlcixcbiAgICAgICAgICBuZXcgSml0U3VtbWFyeVJlc29sdmVyKCksIGVsZW1lbnRTY2hlbWFSZWdpc3RyeSwgZGlyZWN0aXZlTm9ybWFsaXplciwgbmV3IENvbnNvbGUoKSxcbiAgICAgICAgICB0aGlzLl9zdGF0aWNTeW1ib2xDYWNoZSwgdGhpcy5yZWZsZWN0b3IsXG4gICAgICAgICAgKGVycm9yLCB0eXBlKSA9PiB0aGlzLmNvbGxlY3RFcnJvcihlcnJvciwgdHlwZSAmJiB0eXBlLmZpbGVQYXRoKSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBnZXRUZW1wbGF0ZVJlZmVyZW5jZXMoKTogc3RyaW5nW10ge1xuICAgIHRoaXMuZW5zdXJlVGVtcGxhdGVNYXAoKTtcbiAgICByZXR1cm4gdGhpcy50ZW1wbGF0ZVJlZmVyZW5jZXMgfHwgW107XG4gIH1cblxuICBnZXRUZW1wbGF0ZUF0KGZpbGVOYW1lOiBzdHJpbmcsIHBvc2l0aW9uOiBudW1iZXIpOiBUZW1wbGF0ZVNvdXJjZXx1bmRlZmluZWQge1xuICAgIGxldCBzb3VyY2VGaWxlID0gdGhpcy5nZXRTb3VyY2VGaWxlKGZpbGVOYW1lKTtcbiAgICBpZiAoc291cmNlRmlsZSkge1xuICAgICAgdGhpcy5jb250ZXh0ID0gc291cmNlRmlsZS5maWxlTmFtZTtcbiAgICAgIGxldCBub2RlID0gdGhpcy5maW5kTm9kZShzb3VyY2VGaWxlLCBwb3NpdGlvbik7XG4gICAgICBpZiAobm9kZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTb3VyY2VGcm9tTm9kZShcbiAgICAgICAgICAgIGZpbGVOYW1lLCB0aGlzLmhvc3QuZ2V0U2NyaXB0VmVyc2lvbihzb3VyY2VGaWxlLmZpbGVOYW1lKSwgbm9kZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZW5zdXJlVGVtcGxhdGVNYXAoKTtcbiAgICAgIC8vIFRPRE86IENhbm5vY2FsaXplIHRoZSBmaWxlP1xuICAgICAgY29uc3QgY29tcG9uZW50VHlwZSA9IHRoaXMuZmlsZVRvQ29tcG9uZW50ICEuZ2V0KGZpbGVOYW1lKTtcbiAgICAgIGlmIChjb21wb25lbnRUeXBlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFNvdXJjZUZyb21UeXBlKFxuICAgICAgICAgICAgZmlsZU5hbWUsIHRoaXMuaG9zdC5nZXRTY3JpcHRWZXJzaW9uKGZpbGVOYW1lKSwgY29tcG9uZW50VHlwZSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICBnZXRBbmFseXplZE1vZHVsZXMoKTogTmdBbmFseXplZE1vZHVsZXMge1xuICAgIHRoaXMudXBkYXRlQW5hbHl6ZWRNb2R1bGVzKCk7XG4gICAgcmV0dXJuIHRoaXMuZW5zdXJlQW5hbHl6ZWRNb2R1bGVzKCk7XG4gIH1cblxuICBwcml2YXRlIGVuc3VyZUFuYWx5emVkTW9kdWxlcygpOiBOZ0FuYWx5emVkTW9kdWxlcyB7XG4gICAgbGV0IGFuYWx5emVkTW9kdWxlcyA9IHRoaXMuYW5hbHl6ZWRNb2R1bGVzO1xuICAgIGlmICghYW5hbHl6ZWRNb2R1bGVzKSB7XG4gICAgICBpZiAodGhpcy5ob3N0LmdldFNjcmlwdEZpbGVOYW1lcygpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBhbmFseXplZE1vZHVsZXMgPSB7XG4gICAgICAgICAgZmlsZXM6IFtdLFxuICAgICAgICAgIG5nTW9kdWxlQnlQaXBlT3JEaXJlY3RpdmU6IG5ldyBNYXAoKSxcbiAgICAgICAgICBuZ01vZHVsZXM6IFtdLFxuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgYW5hbHl6ZUhvc3QgPSB7aXNTb3VyY2VGaWxlKGZpbGVQYXRoOiBzdHJpbmcpIHsgcmV0dXJuIHRydWU7IH19O1xuICAgICAgICBjb25zdCBwcm9ncmFtRmlsZXMgPSB0aGlzLnByb2dyYW0gIS5nZXRTb3VyY2VGaWxlcygpLm1hcChzZiA9PiBzZi5maWxlTmFtZSk7XG4gICAgICAgIGFuYWx5emVkTW9kdWxlcyA9XG4gICAgICAgICAgICBhbmFseXplTmdNb2R1bGVzKHByb2dyYW1GaWxlcywgYW5hbHl6ZUhvc3QsIHRoaXMuc3RhdGljU3ltYm9sUmVzb2x2ZXIsIHRoaXMucmVzb2x2ZXIpO1xuICAgICAgfVxuICAgICAgdGhpcy5hbmFseXplZE1vZHVsZXMgPSBhbmFseXplZE1vZHVsZXM7XG4gICAgfVxuICAgIHJldHVybiBhbmFseXplZE1vZHVsZXM7XG4gIH1cblxuICBnZXRUZW1wbGF0ZXMoZmlsZU5hbWU6IHN0cmluZyk6IFRlbXBsYXRlU291cmNlcyB7XG4gICAgdGhpcy5lbnN1cmVUZW1wbGF0ZU1hcCgpO1xuICAgIGNvbnN0IGNvbXBvbmVudFR5cGUgPSB0aGlzLmZpbGVUb0NvbXBvbmVudCAhLmdldChmaWxlTmFtZSk7XG4gICAgaWYgKGNvbXBvbmVudFR5cGUpIHtcbiAgICAgIGNvbnN0IHRlbXBsYXRlU291cmNlID0gdGhpcy5nZXRUZW1wbGF0ZUF0KGZpbGVOYW1lLCAwKTtcbiAgICAgIGlmICh0ZW1wbGF0ZVNvdXJjZSkge1xuICAgICAgICByZXR1cm4gW3RlbXBsYXRlU291cmNlXTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHZlcnNpb24gPSB0aGlzLmhvc3QuZ2V0U2NyaXB0VmVyc2lvbihmaWxlTmFtZSk7XG4gICAgICBsZXQgcmVzdWx0OiBUZW1wbGF0ZVNvdXJjZVtdID0gW107XG5cbiAgICAgIC8vIEZpbmQgZWFjaCB0ZW1wbGF0ZSBzdHJpbmcgaW4gdGhlIGZpbGVcbiAgICAgIGxldCB2aXNpdCA9IChjaGlsZDogdHMuTm9kZSkgPT4ge1xuICAgICAgICBsZXQgdGVtcGxhdGVTb3VyY2UgPSB0aGlzLmdldFNvdXJjZUZyb21Ob2RlKGZpbGVOYW1lLCB2ZXJzaW9uLCBjaGlsZCk7XG4gICAgICAgIGlmICh0ZW1wbGF0ZVNvdXJjZSkge1xuICAgICAgICAgIHJlc3VsdC5wdXNoKHRlbXBsYXRlU291cmNlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0cy5mb3JFYWNoQ2hpbGQoY2hpbGQsIHZpc2l0KTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgbGV0IHNvdXJjZUZpbGUgPSB0aGlzLmdldFNvdXJjZUZpbGUoZmlsZU5hbWUpO1xuICAgICAgaWYgKHNvdXJjZUZpbGUpIHtcbiAgICAgICAgdGhpcy5jb250ZXh0ID0gKHNvdXJjZUZpbGUgYXMgYW55KS5wYXRoIHx8IHNvdXJjZUZpbGUuZmlsZU5hbWU7XG4gICAgICAgIHRzLmZvckVhY2hDaGlsZChzb3VyY2VGaWxlLCB2aXNpdCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0Lmxlbmd0aCA/IHJlc3VsdCA6IHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICBnZXREZWNsYXJhdGlvbnMoZmlsZU5hbWU6IHN0cmluZyk6IERlY2xhcmF0aW9ucyB7XG4gICAgY29uc3QgcmVzdWx0OiBEZWNsYXJhdGlvbnMgPSBbXTtcbiAgICBjb25zdCBzb3VyY2VGaWxlID0gdGhpcy5nZXRTb3VyY2VGaWxlKGZpbGVOYW1lKTtcbiAgICBpZiAoc291cmNlRmlsZSkge1xuICAgICAgbGV0IHZpc2l0ID0gKGNoaWxkOiB0cy5Ob2RlKSA9PiB7XG4gICAgICAgIGxldCBkZWNsYXJhdGlvbiA9IHRoaXMuZ2V0RGVjbGFyYXRpb25Gcm9tTm9kZShzb3VyY2VGaWxlLCBjaGlsZCk7XG4gICAgICAgIGlmIChkZWNsYXJhdGlvbikge1xuICAgICAgICAgIHJlc3VsdC5wdXNoKGRlY2xhcmF0aW9uKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0cy5mb3JFYWNoQ2hpbGQoY2hpbGQsIHZpc2l0KTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHRzLmZvckVhY2hDaGlsZChzb3VyY2VGaWxlLCB2aXNpdCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBnZXRTb3VyY2VGaWxlKGZpbGVOYW1lOiBzdHJpbmcpOiB0cy5Tb3VyY2VGaWxlfHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMudHNTZXJ2aWNlLmdldFByb2dyYW0oKSAhLmdldFNvdXJjZUZpbGUoZmlsZU5hbWUpO1xuICB9XG5cbiAgdXBkYXRlQW5hbHl6ZWRNb2R1bGVzKCkge1xuICAgIHRoaXMudmFsaWRhdGUoKTtcbiAgICBpZiAodGhpcy5tb2R1bGVzT3V0T2ZEYXRlKSB7XG4gICAgICB0aGlzLmFuYWx5emVkTW9kdWxlcyA9IG51bGw7XG4gICAgICB0aGlzLl9yZWZsZWN0b3IgPSBudWxsO1xuICAgICAgdGhpcy50ZW1wbGF0ZVJlZmVyZW5jZXMgPSBudWxsO1xuICAgICAgdGhpcy5maWxlVG9Db21wb25lbnQgPSBudWxsO1xuICAgICAgdGhpcy5lbnN1cmVBbmFseXplZE1vZHVsZXMoKTtcbiAgICAgIHRoaXMubW9kdWxlc091dE9mRGF0ZSA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZ2V0IHByb2dyYW0oKSB7IHJldHVybiB0aGlzLnRzU2VydmljZS5nZXRQcm9ncmFtKCk7IH1cblxuICBwcml2YXRlIGdldCBjaGVja2VyKCkge1xuICAgIGxldCBjaGVja2VyID0gdGhpcy5fY2hlY2tlcjtcbiAgICBpZiAoIWNoZWNrZXIpIHtcbiAgICAgIGNoZWNrZXIgPSB0aGlzLl9jaGVja2VyID0gdGhpcy5wcm9ncmFtICEuZ2V0VHlwZUNoZWNrZXIoKTtcbiAgICB9XG4gICAgcmV0dXJuIGNoZWNrZXI7XG4gIH1cblxuICBwcml2YXRlIHZhbGlkYXRlKCkge1xuICAgIGNvbnN0IHByb2dyYW0gPSB0aGlzLnByb2dyYW07XG4gICAgaWYgKHRoaXMubGFzdFByb2dyYW0gIT09IHByb2dyYW0pIHtcbiAgICAgIC8vIEludmFsaWRhdGUgZmlsZSB0aGF0IGhhdmUgY2hhbmdlZCBpbiB0aGUgc3RhdGljIHN5bWJvbCByZXNvbHZlclxuICAgICAgY29uc3QgaW52YWxpZGF0ZUZpbGUgPSAoZmlsZU5hbWU6IHN0cmluZykgPT5cbiAgICAgICAgICB0aGlzLl9zdGF0aWNTeW1ib2xSZXNvbHZlci5pbnZhbGlkYXRlRmlsZShmaWxlTmFtZSk7XG4gICAgICB0aGlzLmNsZWFyQ2FjaGVzKCk7XG4gICAgICBjb25zdCBzZWVuID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgICBmb3IgKGxldCBzb3VyY2VGaWxlIG9mIHRoaXMucHJvZ3JhbSAhLmdldFNvdXJjZUZpbGVzKCkpIHtcbiAgICAgICAgY29uc3QgZmlsZU5hbWUgPSBzb3VyY2VGaWxlLmZpbGVOYW1lO1xuICAgICAgICBzZWVuLmFkZChmaWxlTmFtZSk7XG4gICAgICAgIGNvbnN0IHZlcnNpb24gPSB0aGlzLmhvc3QuZ2V0U2NyaXB0VmVyc2lvbihmaWxlTmFtZSk7XG4gICAgICAgIGNvbnN0IGxhc3RWZXJzaW9uID0gdGhpcy5maWxlVmVyc2lvbnMuZ2V0KGZpbGVOYW1lKTtcbiAgICAgICAgaWYgKHZlcnNpb24gIT0gbGFzdFZlcnNpb24pIHtcbiAgICAgICAgICB0aGlzLmZpbGVWZXJzaW9ucy5zZXQoZmlsZU5hbWUsIHZlcnNpb24pO1xuICAgICAgICAgIGlmICh0aGlzLl9zdGF0aWNTeW1ib2xSZXNvbHZlcikge1xuICAgICAgICAgICAgaW52YWxpZGF0ZUZpbGUoZmlsZU5hbWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBSZW1vdmUgZmlsZSB2ZXJzaW9ucyB0aGF0IGFyZSBubyBsb25nZXIgaW4gdGhlIGZpbGUgYW5kIGludmFsaWRhdGUgdGhlbS5cbiAgICAgIGNvbnN0IG1pc3NpbmcgPSBBcnJheS5mcm9tKHRoaXMuZmlsZVZlcnNpb25zLmtleXMoKSkuZmlsdGVyKGYgPT4gIXNlZW4uaGFzKGYpKTtcbiAgICAgIG1pc3NpbmcuZm9yRWFjaChmID0+IHRoaXMuZmlsZVZlcnNpb25zLmRlbGV0ZShmKSk7XG4gICAgICBpZiAodGhpcy5fc3RhdGljU3ltYm9sUmVzb2x2ZXIpIHtcbiAgICAgICAgbWlzc2luZy5mb3JFYWNoKGludmFsaWRhdGVGaWxlKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5sYXN0UHJvZ3JhbSA9IHByb2dyYW07XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBjbGVhckNhY2hlcygpIHtcbiAgICB0aGlzLl9jaGVja2VyID0gbnVsbDtcbiAgICB0aGlzLl90eXBlQ2FjaGUgPSBbXTtcbiAgICB0aGlzLl9yZXNvbHZlciA9IG51bGw7XG4gICAgdGhpcy5jb2xsZWN0ZWRFcnJvcnMgPSBudWxsO1xuICAgIHRoaXMubW9kdWxlc091dE9mRGF0ZSA9IHRydWU7XG4gIH1cblxuICBwcml2YXRlIGVuc3VyZVRlbXBsYXRlTWFwKCkge1xuICAgIGlmICghdGhpcy5maWxlVG9Db21wb25lbnQgfHwgIXRoaXMudGVtcGxhdGVSZWZlcmVuY2VzKSB7XG4gICAgICBjb25zdCBmaWxlVG9Db21wb25lbnQgPSBuZXcgTWFwPHN0cmluZywgU3RhdGljU3ltYm9sPigpO1xuICAgICAgY29uc3QgdGVtcGxhdGVSZWZlcmVuY2U6IHN0cmluZ1tdID0gW107XG4gICAgICBjb25zdCBuZ01vZHVsZVN1bW1hcnkgPSB0aGlzLmdldEFuYWx5emVkTW9kdWxlcygpO1xuICAgICAgY29uc3QgdXJsUmVzb2x2ZXIgPSBjcmVhdGVPZmZsaW5lQ29tcGlsZVVybFJlc29sdmVyKCk7XG4gICAgICBmb3IgKGNvbnN0IG1vZHVsZSBvZiBuZ01vZHVsZVN1bW1hcnkubmdNb2R1bGVzKSB7XG4gICAgICAgIGZvciAoY29uc3QgZGlyZWN0aXZlIG9mIG1vZHVsZS5kZWNsYXJlZERpcmVjdGl2ZXMpIHtcbiAgICAgICAgICBjb25zdCB7bWV0YWRhdGF9ID0gdGhpcy5yZXNvbHZlci5nZXROb25Ob3JtYWxpemVkRGlyZWN0aXZlTWV0YWRhdGEoZGlyZWN0aXZlLnJlZmVyZW5jZSkgITtcbiAgICAgICAgICBpZiAobWV0YWRhdGEuaXNDb21wb25lbnQgJiYgbWV0YWRhdGEudGVtcGxhdGUgJiYgbWV0YWRhdGEudGVtcGxhdGUudGVtcGxhdGVVcmwpIHtcbiAgICAgICAgICAgIGNvbnN0IHRlbXBsYXRlTmFtZSA9IHVybFJlc29sdmVyLnJlc29sdmUoXG4gICAgICAgICAgICAgICAgdGhpcy5yZWZsZWN0b3IuY29tcG9uZW50TW9kdWxlVXJsKGRpcmVjdGl2ZS5yZWZlcmVuY2UpLFxuICAgICAgICAgICAgICAgIG1ldGFkYXRhLnRlbXBsYXRlLnRlbXBsYXRlVXJsKTtcbiAgICAgICAgICAgIGZpbGVUb0NvbXBvbmVudC5zZXQodGVtcGxhdGVOYW1lLCBkaXJlY3RpdmUucmVmZXJlbmNlKTtcbiAgICAgICAgICAgIHRlbXBsYXRlUmVmZXJlbmNlLnB1c2godGVtcGxhdGVOYW1lKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuZmlsZVRvQ29tcG9uZW50ID0gZmlsZVRvQ29tcG9uZW50O1xuICAgICAgdGhpcy50ZW1wbGF0ZVJlZmVyZW5jZXMgPSB0ZW1wbGF0ZVJlZmVyZW5jZTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGdldFNvdXJjZUZyb21EZWNsYXJhdGlvbihcbiAgICAgIGZpbGVOYW1lOiBzdHJpbmcsIHZlcnNpb246IHN0cmluZywgc291cmNlOiBzdHJpbmcsIHNwYW46IFNwYW4sIHR5cGU6IFN0YXRpY1N5bWJvbCxcbiAgICAgIGRlY2xhcmF0aW9uOiB0cy5DbGFzc0RlY2xhcmF0aW9uLCBub2RlOiB0cy5Ob2RlLCBzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlKTogVGVtcGxhdGVTb3VyY2VcbiAgICAgIHx1bmRlZmluZWQge1xuICAgIGxldCBxdWVyeUNhY2hlOiBTeW1ib2xRdWVyeXx1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgY29uc3QgdCA9IHRoaXM7XG4gICAgaWYgKGRlY2xhcmF0aW9uKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB2ZXJzaW9uLFxuICAgICAgICBzb3VyY2UsXG4gICAgICAgIHNwYW4sXG4gICAgICAgIHR5cGUsXG4gICAgICAgIGdldCBtZW1iZXJzKCkge1xuICAgICAgICAgIHJldHVybiBnZXRDbGFzc01lbWJlcnNGcm9tRGVjbGFyYXRpb24odC5wcm9ncmFtICEsIHQuY2hlY2tlciwgc291cmNlRmlsZSwgZGVjbGFyYXRpb24pO1xuICAgICAgICB9LFxuICAgICAgICBnZXQgcXVlcnkoKSB7XG4gICAgICAgICAgaWYgKCFxdWVyeUNhY2hlKSB7XG4gICAgICAgICAgICBjb25zdCBwaXBlcyA9IHQuc2VydmljZS5nZXRQaXBlc0F0KGZpbGVOYW1lLCBub2RlLmdldFN0YXJ0KCkpO1xuICAgICAgICAgICAgcXVlcnlDYWNoZSA9IGdldFN5bWJvbFF1ZXJ5KFxuICAgICAgICAgICAgICAgIHQucHJvZ3JhbSAhLCB0LmNoZWNrZXIsIHNvdXJjZUZpbGUsXG4gICAgICAgICAgICAgICAgKCkgPT4gZ2V0UGlwZXNUYWJsZShzb3VyY2VGaWxlLCB0LnByb2dyYW0gISwgdC5jaGVja2VyLCBwaXBlcykpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcXVlcnlDYWNoZTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGdldFNvdXJjZUZyb21Ob2RlKGZpbGVOYW1lOiBzdHJpbmcsIHZlcnNpb246IHN0cmluZywgbm9kZTogdHMuTm9kZSk6IFRlbXBsYXRlU291cmNlXG4gICAgICB8dW5kZWZpbmVkIHtcbiAgICBsZXQgcmVzdWx0OiBUZW1wbGF0ZVNvdXJjZXx1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgY29uc3QgdCA9IHRoaXM7XG4gICAgc3dpdGNoIChub2RlLmtpbmQpIHtcbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Ob1N1YnN0aXR1dGlvblRlbXBsYXRlTGl0ZXJhbDpcbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5TdHJpbmdMaXRlcmFsOlxuICAgICAgICBsZXQgW2RlY2xhcmF0aW9uLCBkZWNvcmF0b3JdID0gdGhpcy5nZXRUZW1wbGF0ZUNsYXNzRGVjbEZyb21Ob2RlKG5vZGUpO1xuICAgICAgICBpZiAoZGVjbGFyYXRpb24gJiYgZGVjbGFyYXRpb24ubmFtZSkge1xuICAgICAgICAgIGNvbnN0IHNvdXJjZUZpbGUgPSB0aGlzLmdldFNvdXJjZUZpbGUoZmlsZU5hbWUpO1xuICAgICAgICAgIGlmIChzb3VyY2VGaWxlKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRTb3VyY2VGcm9tRGVjbGFyYXRpb24oXG4gICAgICAgICAgICAgICAgZmlsZU5hbWUsIHZlcnNpb24sIHRoaXMuc3RyaW5nT2Yobm9kZSkgfHwgJycsIHNocmluayhzcGFuT2Yobm9kZSkpLFxuICAgICAgICAgICAgICAgIHRoaXMucmVmbGVjdG9yLmdldFN0YXRpY1N5bWJvbChzb3VyY2VGaWxlLmZpbGVOYW1lLCBkZWNsYXJhdGlvbi5uYW1lLnRleHQpLFxuICAgICAgICAgICAgICAgIGRlY2xhcmF0aW9uLCBub2RlLCBzb3VyY2VGaWxlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBwcml2YXRlIGdldFNvdXJjZUZyb21UeXBlKGZpbGVOYW1lOiBzdHJpbmcsIHZlcnNpb246IHN0cmluZywgdHlwZTogU3RhdGljU3ltYm9sKTogVGVtcGxhdGVTb3VyY2VcbiAgICAgIHx1bmRlZmluZWQge1xuICAgIGxldCByZXN1bHQ6IFRlbXBsYXRlU291cmNlfHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBjb25zdCBkZWNsYXJhdGlvbiA9IHRoaXMuZ2V0VGVtcGxhdGVDbGFzc0Zyb21TdGF0aWNTeW1ib2wodHlwZSk7XG4gICAgaWYgKGRlY2xhcmF0aW9uKSB7XG4gICAgICBjb25zdCBzbmFwc2hvdCA9IHRoaXMuaG9zdC5nZXRTY3JpcHRTbmFwc2hvdChmaWxlTmFtZSk7XG4gICAgICBpZiAoc25hcHNob3QpIHtcbiAgICAgICAgY29uc3Qgc291cmNlID0gc25hcHNob3QuZ2V0VGV4dCgwLCBzbmFwc2hvdC5nZXRMZW5ndGgoKSk7XG4gICAgICAgIHJlc3VsdCA9IHRoaXMuZ2V0U291cmNlRnJvbURlY2xhcmF0aW9uKFxuICAgICAgICAgICAgZmlsZU5hbWUsIHZlcnNpb24sIHNvdXJjZSwge3N0YXJ0OiAwLCBlbmQ6IHNvdXJjZS5sZW5ndGh9LCB0eXBlLCBkZWNsYXJhdGlvbixcbiAgICAgICAgICAgIGRlY2xhcmF0aW9uLCBkZWNsYXJhdGlvbi5nZXRTb3VyY2VGaWxlKCkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgcHJpdmF0ZSBnZXQgcmVmbGVjdG9ySG9zdCgpOiBSZWZsZWN0b3JIb3N0IHtcbiAgICBsZXQgcmVzdWx0ID0gdGhpcy5fcmVmbGVjdG9ySG9zdDtcbiAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgaWYgKCF0aGlzLmNvbnRleHQpIHtcbiAgICAgICAgLy8gTWFrZSB1cCBhIGNvbnRleHQgYnkgZmluZGluZyB0aGUgZmlyc3Qgc2NyaXB0IGFuZCB1c2luZyB0aGF0IGFzIHRoZSBiYXNlIGRpci5cbiAgICAgICAgY29uc3Qgc2NyaXB0RmlsZU5hbWVzID0gdGhpcy5ob3N0LmdldFNjcmlwdEZpbGVOYW1lcygpO1xuICAgICAgICBpZiAoMCA9PT0gc2NyaXB0RmlsZU5hbWVzLmxlbmd0aCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW50ZXJuYWwgZXJyb3I6IG5vIHNjcmlwdCBmaWxlIG5hbWVzIGZvdW5kJyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jb250ZXh0ID0gc2NyaXB0RmlsZU5hbWVzWzBdO1xuICAgICAgfVxuXG4gICAgICAvLyBVc2UgdGhlIGZpbGUgY29udGV4dCdzIGRpcmVjdG9yeSBhcyB0aGUgYmFzZSBkaXJlY3RvcnkuXG4gICAgICAvLyBUaGUgaG9zdCdzIGdldEN1cnJlbnREaXJlY3RvcnkoKSBpcyBub3QgcmVsaWFibGUgYXMgaXQgaXMgYWx3YXlzIFwiXCIgaW5cbiAgICAgIC8vIHRzc2VydmVyLiBXZSBkb24ndCBuZWVkIHRoZSBleGFjdCBiYXNlIGRpcmVjdG9yeSwganVzdCBvbmUgdGhhdCBjb250YWluc1xuICAgICAgLy8gYSBzb3VyY2UgZmlsZS5cbiAgICAgIGNvbnN0IHNvdXJjZSA9IHRoaXMudHNTZXJ2aWNlLmdldFByb2dyYW0oKSAhLmdldFNvdXJjZUZpbGUodGhpcy5jb250ZXh0KTtcbiAgICAgIGlmICghc291cmNlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW50ZXJuYWwgZXJyb3I6IG5vIGNvbnRleHQgY291bGQgYmUgZGV0ZXJtaW5lZCcpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB0c0NvbmZpZ1BhdGggPSBmaW5kVHNDb25maWcoc291cmNlLmZpbGVOYW1lKTtcbiAgICAgIGNvbnN0IGJhc2VQYXRoID0gcGF0aC5kaXJuYW1lKHRzQ29uZmlnUGF0aCB8fCB0aGlzLmNvbnRleHQpO1xuICAgICAgY29uc3Qgb3B0aW9uczogQ29tcGlsZXJPcHRpb25zID0ge2Jhc2VQYXRoLCBnZW5EaXI6IGJhc2VQYXRofTtcbiAgICAgIGNvbnN0IGNvbXBpbGVyT3B0aW9ucyA9IHRoaXMuaG9zdC5nZXRDb21waWxhdGlvblNldHRpbmdzKCk7XG4gICAgICBpZiAoY29tcGlsZXJPcHRpb25zICYmIGNvbXBpbGVyT3B0aW9ucy5iYXNlVXJsKSB7XG4gICAgICAgIG9wdGlvbnMuYmFzZVVybCA9IGNvbXBpbGVyT3B0aW9ucy5iYXNlVXJsO1xuICAgICAgfVxuICAgICAgaWYgKGNvbXBpbGVyT3B0aW9ucyAmJiBjb21waWxlck9wdGlvbnMucGF0aHMpIHtcbiAgICAgICAgb3B0aW9ucy5wYXRocyA9IGNvbXBpbGVyT3B0aW9ucy5wYXRocztcbiAgICAgIH1cbiAgICAgIHJlc3VsdCA9IHRoaXMuX3JlZmxlY3Rvckhvc3QgPVxuICAgICAgICAgIG5ldyBSZWZsZWN0b3JIb3N0KCgpID0+IHRoaXMudHNTZXJ2aWNlLmdldFByb2dyYW0oKSAhLCB0aGlzLmhvc3QsIG9wdGlvbnMpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgcHJpdmF0ZSBjb2xsZWN0RXJyb3IoZXJyb3I6IGFueSwgZmlsZVBhdGg6IHN0cmluZ3xudWxsKSB7XG4gICAgaWYgKGZpbGVQYXRoKSB7XG4gICAgICBsZXQgZXJyb3JNYXAgPSB0aGlzLmNvbGxlY3RlZEVycm9ycztcbiAgICAgIGlmICghZXJyb3JNYXAgfHwgIXRoaXMuY29sbGVjdGVkRXJyb3JzKSB7XG4gICAgICAgIGVycm9yTWFwID0gdGhpcy5jb2xsZWN0ZWRFcnJvcnMgPSBuZXcgTWFwKCk7XG4gICAgICB9XG4gICAgICBsZXQgZXJyb3JzID0gZXJyb3JNYXAuZ2V0KGZpbGVQYXRoKTtcbiAgICAgIGlmICghZXJyb3JzKSB7XG4gICAgICAgIGVycm9ycyA9IFtdO1xuICAgICAgICB0aGlzLmNvbGxlY3RlZEVycm9ycy5zZXQoZmlsZVBhdGgsIGVycm9ycyk7XG4gICAgICB9XG4gICAgICBlcnJvcnMucHVzaChlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBnZXQgc3RhdGljU3ltYm9sUmVzb2x2ZXIoKTogU3RhdGljU3ltYm9sUmVzb2x2ZXIge1xuICAgIGxldCByZXN1bHQgPSB0aGlzLl9zdGF0aWNTeW1ib2xSZXNvbHZlcjtcbiAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgdGhpcy5fc3VtbWFyeVJlc29sdmVyID0gbmV3IEFvdFN1bW1hcnlSZXNvbHZlcihcbiAgICAgICAgICB7XG4gICAgICAgICAgICBsb2FkU3VtbWFyeShmaWxlUGF0aDogc3RyaW5nKSB7IHJldHVybiBudWxsOyB9LFxuICAgICAgICAgICAgaXNTb3VyY2VGaWxlKHNvdXJjZUZpbGVQYXRoOiBzdHJpbmcpIHsgcmV0dXJuIHRydWU7IH0sXG4gICAgICAgICAgICB0b1N1bW1hcnlGaWxlTmFtZShzb3VyY2VGaWxlUGF0aDogc3RyaW5nKSB7IHJldHVybiBzb3VyY2VGaWxlUGF0aDsgfSxcbiAgICAgICAgICAgIGZyb21TdW1tYXJ5RmlsZU5hbWUoZmlsZVBhdGg6IHN0cmluZyk6IHN0cmluZ3tyZXR1cm4gZmlsZVBhdGg7fSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHRoaXMuX3N0YXRpY1N5bWJvbENhY2hlKTtcbiAgICAgIHJlc3VsdCA9IHRoaXMuX3N0YXRpY1N5bWJvbFJlc29sdmVyID0gbmV3IFN0YXRpY1N5bWJvbFJlc29sdmVyKFxuICAgICAgICAgIHRoaXMucmVmbGVjdG9ySG9zdCBhcyBhbnksIHRoaXMuX3N0YXRpY1N5bWJvbENhY2hlLCB0aGlzLl9zdW1tYXJ5UmVzb2x2ZXIsXG4gICAgICAgICAgKGUsIGZpbGVQYXRoKSA9PiB0aGlzLmNvbGxlY3RFcnJvcihlLCBmaWxlUGF0aCAhKSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBwcml2YXRlIGdldCByZWZsZWN0b3IoKTogU3RhdGljUmVmbGVjdG9yIHtcbiAgICBsZXQgcmVzdWx0ID0gdGhpcy5fcmVmbGVjdG9yO1xuICAgIGlmICghcmVzdWx0KSB7XG4gICAgICBjb25zdCBzc3IgPSB0aGlzLnN0YXRpY1N5bWJvbFJlc29sdmVyO1xuICAgICAgcmVzdWx0ID0gdGhpcy5fcmVmbGVjdG9yID0gbmV3IFN0YXRpY1JlZmxlY3RvcihcbiAgICAgICAgICB0aGlzLl9zdW1tYXJ5UmVzb2x2ZXIsIHNzciwgW10sIFtdLCAoZSwgZmlsZVBhdGgpID0+IHRoaXMuY29sbGVjdEVycm9yKGUsIGZpbGVQYXRoICEpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0VGVtcGxhdGVDbGFzc0Zyb21TdGF0aWNTeW1ib2wodHlwZTogU3RhdGljU3ltYm9sKTogdHMuQ2xhc3NEZWNsYXJhdGlvbnx1bmRlZmluZWQge1xuICAgIGNvbnN0IHNvdXJjZSA9IHRoaXMuZ2V0U291cmNlRmlsZSh0eXBlLmZpbGVQYXRoKTtcbiAgICBpZiAoc291cmNlKSB7XG4gICAgICBjb25zdCBkZWNsYXJhdGlvbk5vZGUgPSB0cy5mb3JFYWNoQ2hpbGQoc291cmNlLCBjaGlsZCA9PiB7XG4gICAgICAgIGlmIChjaGlsZC5raW5kID09PSB0cy5TeW50YXhLaW5kLkNsYXNzRGVjbGFyYXRpb24pIHtcbiAgICAgICAgICBjb25zdCBjbGFzc0RlY2xhcmF0aW9uID0gY2hpbGQgYXMgdHMuQ2xhc3NEZWNsYXJhdGlvbjtcbiAgICAgICAgICBpZiAoY2xhc3NEZWNsYXJhdGlvbi5uYW1lICE9IG51bGwgJiYgY2xhc3NEZWNsYXJhdGlvbi5uYW1lLnRleHQgPT09IHR5cGUubmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIGNsYXNzRGVjbGFyYXRpb247XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBkZWNsYXJhdGlvbk5vZGUgYXMgdHMuQ2xhc3NEZWNsYXJhdGlvbjtcbiAgICB9XG5cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgcHJpdmF0ZSBzdGF0aWMgbWlzc2luZ1RlbXBsYXRlOiBbdHMuQ2xhc3NEZWNsYXJhdGlvbiB8IHVuZGVmaW5lZCwgdHMuRXhwcmVzc2lvbnx1bmRlZmluZWRdID1cbiAgICAgIFt1bmRlZmluZWQsIHVuZGVmaW5lZF07XG5cbiAgLyoqXG4gICAqIEdpdmVuIGEgdGVtcGxhdGUgc3RyaW5nIG5vZGUsIHNlZSBpZiBpdCBpcyBhbiBBbmd1bGFyIHRlbXBsYXRlIHN0cmluZywgYW5kIGlmIHNvIHJldHVybiB0aGVcbiAgICogY29udGFpbmluZyBjbGFzcy5cbiAgICovXG4gIHByaXZhdGUgZ2V0VGVtcGxhdGVDbGFzc0RlY2xGcm9tTm9kZShjdXJyZW50VG9rZW46IHRzLk5vZGUpOlxuICAgICAgW3RzLkNsYXNzRGVjbGFyYXRpb24gfCB1bmRlZmluZWQsIHRzLkV4cHJlc3Npb258dW5kZWZpbmVkXSB7XG4gICAgLy8gVmVyaWZ5IHdlIGFyZSBpbiBhICd0ZW1wbGF0ZScgcHJvcGVydHkgYXNzaWdubWVudCwgaW4gYW4gb2JqZWN0IGxpdGVyYWwsIHdoaWNoIGlzIGFuIGNhbGxcbiAgICAvLyBhcmcsIGluIGEgZGVjb3JhdG9yXG4gICAgbGV0IHBhcmVudE5vZGUgPSBjdXJyZW50VG9rZW4ucGFyZW50OyAgLy8gUHJvcGVydHlBc3NpZ25tZW50XG4gICAgaWYgKCFwYXJlbnROb2RlKSB7XG4gICAgICByZXR1cm4gVHlwZVNjcmlwdFNlcnZpY2VIb3N0Lm1pc3NpbmdUZW1wbGF0ZTtcbiAgICB9XG4gICAgaWYgKHBhcmVudE5vZGUua2luZCAhPT0gdHMuU3ludGF4S2luZC5Qcm9wZXJ0eUFzc2lnbm1lbnQpIHtcbiAgICAgIHJldHVybiBUeXBlU2NyaXB0U2VydmljZUhvc3QubWlzc2luZ1RlbXBsYXRlO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUT0RPOiBJcyB0aGlzIGRpZmZlcmVudCBmb3IgYSBsaXRlcmFsLCBpLmUuIGEgcXVvdGVkIHByb3BlcnR5IG5hbWUgbGlrZSBcInRlbXBsYXRlXCI/XG4gICAgICBpZiAoKHBhcmVudE5vZGUgYXMgYW55KS5uYW1lLnRleHQgIT09ICd0ZW1wbGF0ZScpIHtcbiAgICAgICAgcmV0dXJuIFR5cGVTY3JpcHRTZXJ2aWNlSG9zdC5taXNzaW5nVGVtcGxhdGU7XG4gICAgICB9XG4gICAgfVxuICAgIHBhcmVudE5vZGUgPSBwYXJlbnROb2RlLnBhcmVudDsgIC8vIE9iamVjdExpdGVyYWxFeHByZXNzaW9uXG4gICAgaWYgKCFwYXJlbnROb2RlIHx8IHBhcmVudE5vZGUua2luZCAhPT0gdHMuU3ludGF4S2luZC5PYmplY3RMaXRlcmFsRXhwcmVzc2lvbikge1xuICAgICAgcmV0dXJuIFR5cGVTY3JpcHRTZXJ2aWNlSG9zdC5taXNzaW5nVGVtcGxhdGU7XG4gICAgfVxuXG4gICAgcGFyZW50Tm9kZSA9IHBhcmVudE5vZGUucGFyZW50OyAgLy8gQ2FsbEV4cHJlc3Npb25cbiAgICBpZiAoIXBhcmVudE5vZGUgfHwgcGFyZW50Tm9kZS5raW5kICE9PSB0cy5TeW50YXhLaW5kLkNhbGxFeHByZXNzaW9uKSB7XG4gICAgICByZXR1cm4gVHlwZVNjcmlwdFNlcnZpY2VIb3N0Lm1pc3NpbmdUZW1wbGF0ZTtcbiAgICB9XG4gICAgY29uc3QgY2FsbFRhcmdldCA9ICg8dHMuQ2FsbEV4cHJlc3Npb24+cGFyZW50Tm9kZSkuZXhwcmVzc2lvbjtcblxuICAgIGxldCBkZWNvcmF0b3IgPSBwYXJlbnROb2RlLnBhcmVudDsgIC8vIERlY29yYXRvclxuICAgIGlmICghZGVjb3JhdG9yIHx8IGRlY29yYXRvci5raW5kICE9PSB0cy5TeW50YXhLaW5kLkRlY29yYXRvcikge1xuICAgICAgcmV0dXJuIFR5cGVTY3JpcHRTZXJ2aWNlSG9zdC5taXNzaW5nVGVtcGxhdGU7XG4gICAgfVxuXG4gICAgbGV0IGRlY2xhcmF0aW9uID0gPHRzLkNsYXNzRGVjbGFyYXRpb24+ZGVjb3JhdG9yLnBhcmVudDsgIC8vIENsYXNzRGVjbGFyYXRpb25cbiAgICBpZiAoIWRlY2xhcmF0aW9uIHx8IGRlY2xhcmF0aW9uLmtpbmQgIT09IHRzLlN5bnRheEtpbmQuQ2xhc3NEZWNsYXJhdGlvbikge1xuICAgICAgcmV0dXJuIFR5cGVTY3JpcHRTZXJ2aWNlSG9zdC5taXNzaW5nVGVtcGxhdGU7XG4gICAgfVxuICAgIHJldHVybiBbZGVjbGFyYXRpb24sIGNhbGxUYXJnZXRdO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRDb2xsZWN0ZWRFcnJvcnMoZGVmYXVsdFNwYW46IFNwYW4sIHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUpOiBEZWNsYXJhdGlvbkVycm9yW10ge1xuICAgIGNvbnN0IGVycm9ycyA9ICh0aGlzLmNvbGxlY3RlZEVycm9ycyAmJiB0aGlzLmNvbGxlY3RlZEVycm9ycy5nZXQoc291cmNlRmlsZS5maWxlTmFtZSkpO1xuICAgIHJldHVybiAoZXJyb3JzICYmIGVycm9ycy5tYXAoKGU6IGFueSkgPT4ge1xuICAgICAgICAgICAgIGNvbnN0IGxpbmUgPSBlLmxpbmUgfHwgKGUucG9zaXRpb24gJiYgZS5wb3NpdGlvbi5saW5lKTtcbiAgICAgICAgICAgICBjb25zdCBjb2x1bW4gPSBlLmNvbHVtbiB8fCAoZS5wb3NpdGlvbiAmJiBlLnBvc2l0aW9uLmNvbHVtbik7XG4gICAgICAgICAgICAgY29uc3Qgc3BhbiA9IHNwYW5BdChzb3VyY2VGaWxlLCBsaW5lLCBjb2x1bW4pIHx8IGRlZmF1bHRTcGFuO1xuICAgICAgICAgICAgIGlmIChpc0Zvcm1hdHRlZEVycm9yKGUpKSB7XG4gICAgICAgICAgICAgICByZXR1cm4gZXJyb3JUb0RpYWdub3N0aWNXaXRoQ2hhaW4oZSwgc3Bhbik7XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICAgIHJldHVybiB7bWVzc2FnZTogZS5tZXNzYWdlLCBzcGFufTtcbiAgICAgICAgICAgfSkpIHx8XG4gICAgICAgIFtdO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXREZWNsYXJhdGlvbkZyb21Ob2RlKHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUsIG5vZGU6IHRzLk5vZGUpOiBEZWNsYXJhdGlvbnx1bmRlZmluZWQge1xuICAgIGlmIChub2RlLmtpbmQgPT0gdHMuU3ludGF4S2luZC5DbGFzc0RlY2xhcmF0aW9uICYmIG5vZGUuZGVjb3JhdG9ycyAmJlxuICAgICAgICAobm9kZSBhcyB0cy5DbGFzc0RlY2xhcmF0aW9uKS5uYW1lKSB7XG4gICAgICBmb3IgKGNvbnN0IGRlY29yYXRvciBvZiBub2RlLmRlY29yYXRvcnMpIHtcbiAgICAgICAgaWYgKGRlY29yYXRvci5leHByZXNzaW9uICYmIGRlY29yYXRvci5leHByZXNzaW9uLmtpbmQgPT0gdHMuU3ludGF4S2luZC5DYWxsRXhwcmVzc2lvbikge1xuICAgICAgICAgIGNvbnN0IGNsYXNzRGVjbGFyYXRpb24gPSBub2RlIGFzIHRzLkNsYXNzRGVjbGFyYXRpb247XG4gICAgICAgICAgaWYgKGNsYXNzRGVjbGFyYXRpb24ubmFtZSkge1xuICAgICAgICAgICAgY29uc3QgY2FsbCA9IGRlY29yYXRvci5leHByZXNzaW9uIGFzIHRzLkNhbGxFeHByZXNzaW9uO1xuICAgICAgICAgICAgY29uc3QgdGFyZ2V0ID0gY2FsbC5leHByZXNzaW9uO1xuICAgICAgICAgICAgY29uc3QgdHlwZSA9IHRoaXMuY2hlY2tlci5nZXRUeXBlQXRMb2NhdGlvbih0YXJnZXQpO1xuICAgICAgICAgICAgaWYgKHR5cGUpIHtcbiAgICAgICAgICAgICAgY29uc3Qgc3RhdGljU3ltYm9sID1cbiAgICAgICAgICAgICAgICAgIHRoaXMucmVmbGVjdG9yLmdldFN0YXRpY1N5bWJvbChzb3VyY2VGaWxlLmZpbGVOYW1lLCBjbGFzc0RlY2xhcmF0aW9uLm5hbWUudGV4dCk7XG4gICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucmVzb2x2ZXIuaXNEaXJlY3RpdmUoc3RhdGljU3ltYm9sIGFzIGFueSkpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IHttZXRhZGF0YX0gPVxuICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVzb2x2ZXIuZ2V0Tm9uTm9ybWFsaXplZERpcmVjdGl2ZU1ldGFkYXRhKHN0YXRpY1N5bWJvbCBhcyBhbnkpICE7XG4gICAgICAgICAgICAgICAgICBjb25zdCBkZWNsYXJhdGlvblNwYW4gPSBzcGFuT2YodGFyZ2V0KTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IHN0YXRpY1N5bWJvbCxcbiAgICAgICAgICAgICAgICAgICAgZGVjbGFyYXRpb25TcGFuLFxuICAgICAgICAgICAgICAgICAgICBtZXRhZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JzOiB0aGlzLmdldENvbGxlY3RlZEVycm9ycyhkZWNsYXJhdGlvblNwYW4sIHNvdXJjZUZpbGUpXG4gICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGlmIChlLm1lc3NhZ2UpIHtcbiAgICAgICAgICAgICAgICAgIHRoaXMuY29sbGVjdEVycm9yKGUsIHNvdXJjZUZpbGUuZmlsZU5hbWUpO1xuICAgICAgICAgICAgICAgICAgY29uc3QgZGVjbGFyYXRpb25TcGFuID0gc3Bhbk9mKHRhcmdldCk7XG4gICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBzdGF0aWNTeW1ib2wsXG4gICAgICAgICAgICAgICAgICAgIGRlY2xhcmF0aW9uU3BhbixcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JzOiB0aGlzLmdldENvbGxlY3RlZEVycm9ycyhkZWNsYXJhdGlvblNwYW4sIHNvdXJjZUZpbGUpXG4gICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgc3RyaW5nT2Yobm9kZTogdHMuTm9kZSk6IHN0cmluZ3x1bmRlZmluZWQge1xuICAgIHN3aXRjaCAobm9kZS5raW5kKSB7XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuTm9TdWJzdGl0dXRpb25UZW1wbGF0ZUxpdGVyYWw6XG4gICAgICAgIHJldHVybiAoPHRzLkxpdGVyYWxFeHByZXNzaW9uPm5vZGUpLnRleHQ7XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuU3RyaW5nTGl0ZXJhbDpcbiAgICAgICAgcmV0dXJuICg8dHMuU3RyaW5nTGl0ZXJhbD5ub2RlKS50ZXh0O1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZmluZE5vZGUoc291cmNlRmlsZTogdHMuU291cmNlRmlsZSwgcG9zaXRpb246IG51bWJlcik6IHRzLk5vZGV8dW5kZWZpbmVkIHtcbiAgICBmdW5jdGlvbiBmaW5kKG5vZGU6IHRzLk5vZGUpOiB0cy5Ob2RlfHVuZGVmaW5lZCB7XG4gICAgICBpZiAocG9zaXRpb24gPj0gbm9kZS5nZXRTdGFydCgpICYmIHBvc2l0aW9uIDwgbm9kZS5nZXRFbmQoKSkge1xuICAgICAgICByZXR1cm4gdHMuZm9yRWFjaENoaWxkKG5vZGUsIGZpbmQpIHx8IG5vZGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZpbmQoc291cmNlRmlsZSk7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBmaW5kVHNDb25maWcoZmlsZU5hbWU6IHN0cmluZyk6IHN0cmluZ3x1bmRlZmluZWQge1xuICBsZXQgZGlyID0gcGF0aC5kaXJuYW1lKGZpbGVOYW1lKTtcbiAgd2hpbGUgKGZzLmV4aXN0c1N5bmMoZGlyKSkge1xuICAgIGNvbnN0IGNhbmRpZGF0ZSA9IHBhdGguam9pbihkaXIsICd0c2NvbmZpZy5qc29uJyk7XG4gICAgaWYgKGZzLmV4aXN0c1N5bmMoY2FuZGlkYXRlKSkgcmV0dXJuIGNhbmRpZGF0ZTtcbiAgICBjb25zdCBwYXJlbnREaXIgPSBwYXRoLmRpcm5hbWUoZGlyKTtcbiAgICBpZiAocGFyZW50RGlyID09PSBkaXIpIGJyZWFrO1xuICAgIGRpciA9IHBhcmVudERpcjtcbiAgfVxufVxuXG5mdW5jdGlvbiBzcGFuT2Yobm9kZTogdHMuTm9kZSk6IFNwYW4ge1xuICByZXR1cm4ge3N0YXJ0OiBub2RlLmdldFN0YXJ0KCksIGVuZDogbm9kZS5nZXRFbmQoKX07XG59XG5cbmZ1bmN0aW9uIHNocmluayhzcGFuOiBTcGFuLCBvZmZzZXQ/OiBudW1iZXIpIHtcbiAgaWYgKG9mZnNldCA9PSBudWxsKSBvZmZzZXQgPSAxO1xuICByZXR1cm4ge3N0YXJ0OiBzcGFuLnN0YXJ0ICsgb2Zmc2V0LCBlbmQ6IHNwYW4uZW5kIC0gb2Zmc2V0fTtcbn1cblxuZnVuY3Rpb24gc3BhbkF0KHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUsIGxpbmU6IG51bWJlciwgY29sdW1uOiBudW1iZXIpOiBTcGFufHVuZGVmaW5lZCB7XG4gIGlmIChsaW5lICE9IG51bGwgJiYgY29sdW1uICE9IG51bGwpIHtcbiAgICBjb25zdCBwb3NpdGlvbiA9IHRzLmdldFBvc2l0aW9uT2ZMaW5lQW5kQ2hhcmFjdGVyKHNvdXJjZUZpbGUsIGxpbmUsIGNvbHVtbik7XG4gICAgY29uc3QgZmluZENoaWxkID0gZnVuY3Rpb24gZmluZENoaWxkKG5vZGU6IHRzLk5vZGUpOiB0cy5Ob2RlIHwgdW5kZWZpbmVkIHtcbiAgICAgIGlmIChub2RlLmtpbmQgPiB0cy5TeW50YXhLaW5kLkxhc3RUb2tlbiAmJiBub2RlLnBvcyA8PSBwb3NpdGlvbiAmJiBub2RlLmVuZCA+IHBvc2l0aW9uKSB7XG4gICAgICAgIGNvbnN0IGJldHRlck5vZGUgPSB0cy5mb3JFYWNoQ2hpbGQobm9kZSwgZmluZENoaWxkKTtcbiAgICAgICAgcmV0dXJuIGJldHRlck5vZGUgfHwgbm9kZTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3Qgbm9kZSA9IHRzLmZvckVhY2hDaGlsZChzb3VyY2VGaWxlLCBmaW5kQ2hpbGQpO1xuICAgIGlmIChub2RlKSB7XG4gICAgICByZXR1cm4ge3N0YXJ0OiBub2RlLmdldFN0YXJ0KCksIGVuZDogbm9kZS5nZXRFbmQoKX07XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGNoYWluZWRNZXNzYWdlKGNoYWluOiBEaWFnbm9zdGljTWVzc2FnZUNoYWluLCBpbmRlbnQgPSAnJyk6IHN0cmluZyB7XG4gIHJldHVybiBpbmRlbnQgKyBjaGFpbi5tZXNzYWdlICsgKGNoYWluLm5leHQgPyBjaGFpbmVkTWVzc2FnZShjaGFpbi5uZXh0LCBpbmRlbnQgKyAnICAnKSA6ICcnKTtcbn1cblxuY2xhc3MgRGlhZ25vc3RpY01lc3NhZ2VDaGFpbkltcGwgaW1wbGVtZW50cyBEaWFnbm9zdGljTWVzc2FnZUNoYWluIHtcbiAgY29uc3RydWN0b3IocHVibGljIG1lc3NhZ2U6IHN0cmluZywgcHVibGljIG5leHQ/OiBEaWFnbm9zdGljTWVzc2FnZUNoYWluKSB7fVxuICB0b1N0cmluZygpOiBzdHJpbmcgeyByZXR1cm4gY2hhaW5lZE1lc3NhZ2UodGhpcyk7IH1cbn1cblxuZnVuY3Rpb24gY29udmVydENoYWluKGNoYWluOiBGb3JtYXR0ZWRNZXNzYWdlQ2hhaW4pOiBEaWFnbm9zdGljTWVzc2FnZUNoYWluIHtcbiAgcmV0dXJuIHttZXNzYWdlOiBjaGFpbi5tZXNzYWdlLCBuZXh0OiBjaGFpbi5uZXh0ID8gY29udmVydENoYWluKGNoYWluLm5leHQpIDogdW5kZWZpbmVkfTtcbn1cblxuZnVuY3Rpb24gZXJyb3JUb0RpYWdub3N0aWNXaXRoQ2hhaW4oZXJyb3I6IEZvcm1hdHRlZEVycm9yLCBzcGFuOiBTcGFuKTogRGVjbGFyYXRpb25FcnJvciB7XG4gIHJldHVybiB7bWVzc2FnZTogZXJyb3IuY2hhaW4gPyBjb252ZXJ0Q2hhaW4oZXJyb3IuY2hhaW4pIDogZXJyb3IubWVzc2FnZSwgc3Bhbn07XG59XG4iXX0=