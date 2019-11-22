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
const node_1 = require("@angular-devkit/core/node");
const compiler_cli_1 = require("@angular/compiler-cli");
const child_process_1 = require("child_process");
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const benchmark_1 = require("./benchmark");
const compiler_host_1 = require("./compiler_host");
const entry_resolver_1 = require("./entry_resolver");
const gather_diagnostics_1 = require("./gather_diagnostics");
const lazy_routes_1 = require("./lazy_routes");
const paths_plugin_1 = require("./paths-plugin");
const resource_loader_1 = require("./resource_loader");
const transformers_1 = require("./transformers");
const ast_helpers_1 = require("./transformers/ast_helpers");
const type_checker_1 = require("./type_checker");
const type_checker_messages_1 = require("./type_checker_messages");
const virtual_file_system_decorator_1 = require("./virtual_file_system_decorator");
const webpack_input_host_1 = require("./webpack-input-host");
const treeKill = require('tree-kill');
var PLATFORM;
(function (PLATFORM) {
    PLATFORM[PLATFORM["Browser"] = 0] = "Browser";
    PLATFORM[PLATFORM["Server"] = 1] = "Server";
})(PLATFORM = exports.PLATFORM || (exports.PLATFORM = {}));
class AngularCompilerPlugin {
    constructor(options) {
        // Contains `moduleImportPath#exportName` => `fullModulePath`.
        this._lazyRoutes = {};
        this._transformers = [];
        this._platformTransformers = null;
        this._JitMode = false;
        this._emitSkipped = true;
        this._changedFileExtensions = new Set(['ts', 'tsx', 'html', 'css', 'js', 'json']);
        // Webpack plugin.
        this._firstRun = true;
        this._warnings = [];
        this._errors = [];
        // TypeChecker process.
        this._forkTypeChecker = true;
        this._forkedTypeCheckerInitialized = false;
        this._options = Object.assign({}, options);
        this._setupOptions(this._options);
    }
    get options() { return this._options; }
    get done() { return this._donePromise; }
    get entryModule() {
        if (!this._entryModule) {
            return null;
        }
        const splitted = this._entryModule.split(/(#[a-zA-Z_]([\w]+))$/);
        const path = splitted[0];
        const className = !!splitted[1] ? splitted[1].substring(1) : 'default';
        return { path, className };
    }
    get typeChecker() {
        const tsProgram = this._getTsProgram();
        return tsProgram ? tsProgram.getTypeChecker() : null;
    }
    static isSupported() {
        return compiler_cli_1.VERSION && parseInt(compiler_cli_1.VERSION.major) >= 5;
    }
    _setupOptions(options) {
        benchmark_1.time('AngularCompilerPlugin._setupOptions');
        this._logger = options.logger || node_1.createConsoleLogger();
        // Fill in the missing options.
        if (!options.hasOwnProperty('tsConfigPath')) {
            throw new Error('Must specify "tsConfigPath" in the configuration of @ngtools/webpack.');
        }
        // TS represents paths internally with '/' and expects the tsconfig path to be in this format
        this._tsConfigPath = options.tsConfigPath.replace(/\\/g, '/');
        // Check the base path.
        const maybeBasePath = path.resolve(process.cwd(), this._tsConfigPath);
        let basePath = maybeBasePath;
        if (fs.statSync(maybeBasePath).isFile()) {
            basePath = path.dirname(basePath);
        }
        if (options.basePath !== undefined) {
            basePath = path.resolve(process.cwd(), options.basePath);
        }
        // Parse the tsconfig contents.
        const config = compiler_cli_1.readConfiguration(this._tsConfigPath);
        if (config.errors && config.errors.length) {
            throw new Error(compiler_cli_1.formatDiagnostics(config.errors));
        }
        this._rootNames = config.rootNames;
        this._compilerOptions = Object.assign({}, config.options, options.compilerOptions);
        this._basePath = config.options.basePath || basePath || '';
        // Overwrite outDir so we can find generated files next to their .ts origin in compilerHost.
        this._compilerOptions.outDir = '';
        this._compilerOptions.suppressOutputPathCheck = true;
        // Default plugin sourceMap to compiler options setting.
        if (!options.hasOwnProperty('sourceMap')) {
            options.sourceMap = this._compilerOptions.sourceMap || false;
        }
        // Force the right sourcemap options.
        if (options.sourceMap) {
            this._compilerOptions.sourceMap = true;
            this._compilerOptions.inlineSources = true;
            this._compilerOptions.inlineSourceMap = false;
            this._compilerOptions.mapRoot = undefined;
            // We will set the source to the full path of the file in the loader, so we don't
            // need sourceRoot here.
            this._compilerOptions.sourceRoot = undefined;
        }
        else {
            this._compilerOptions.sourceMap = false;
            this._compilerOptions.sourceRoot = undefined;
            this._compilerOptions.inlineSources = undefined;
            this._compilerOptions.inlineSourceMap = undefined;
            this._compilerOptions.mapRoot = undefined;
            this._compilerOptions.sourceRoot = undefined;
        }
        // We want to allow emitting with errors so that imports can be added
        // to the webpack dependency tree and rebuilds triggered by file edits.
        this._compilerOptions.noEmitOnError = false;
        // Set JIT (no code generation) or AOT mode.
        if (options.skipCodeGeneration !== undefined) {
            this._JitMode = options.skipCodeGeneration;
        }
        // Process i18n options.
        if (options.i18nInFile !== undefined) {
            this._compilerOptions.i18nInFile = options.i18nInFile;
        }
        if (options.i18nInFormat !== undefined) {
            this._compilerOptions.i18nInFormat = options.i18nInFormat;
        }
        if (options.i18nOutFile !== undefined) {
            this._compilerOptions.i18nOutFile = options.i18nOutFile;
        }
        if (options.i18nOutFormat !== undefined) {
            this._compilerOptions.i18nOutFormat = options.i18nOutFormat;
        }
        if (options.locale !== undefined) {
            this._compilerOptions.i18nInLocale = options.locale;
            this._compilerOptions.i18nOutLocale = options.locale;
            this._normalizedLocale = this._validateLocale(options.locale);
        }
        if (options.missingTranslation !== undefined) {
            this._compilerOptions.i18nInMissingTranslations =
                options.missingTranslation;
        }
        // Process forked type checker options.
        if (options.forkTypeChecker !== undefined) {
            this._forkTypeChecker = options.forkTypeChecker;
        }
        // this._forkTypeChecker = false;
        // Add custom platform transformers.
        if (options.platformTransformers !== undefined) {
            this._platformTransformers = options.platformTransformers;
        }
        // Default ContextElementDependency to the one we can import from here.
        // Failing to use the right ContextElementDependency will throw the error below:
        // "No module factory available for dependency type: ContextElementDependency"
        // Hoisting together with peer dependencies can make it so the imported
        // ContextElementDependency does not come from the same Webpack instance that is used
        // in the compilation. In that case, we can pass the right one as an option to the plugin.
        this._contextElementDependencyConstructor = options.contextElementDependencyConstructor
            || require('webpack/lib/dependencies/ContextElementDependency');
        // Use entryModule if available in options, otherwise resolve it from mainPath after program
        // creation.
        if (this._options.entryModule) {
            this._entryModule = this._options.entryModule;
        }
        else if (this._compilerOptions.entryModule) {
            this._entryModule = path.resolve(this._basePath, this._compilerOptions.entryModule); // temporary cast for type issue
        }
        // Set platform.
        this._platform = options.platform || PLATFORM.Browser;
        // Make transformers.
        this._makeTransformers();
        benchmark_1.timeEnd('AngularCompilerPlugin._setupOptions');
    }
    _getTsProgram() {
        if (!this._program) {
            return undefined;
        }
        return this._JitMode ? this._program : this._program.getTsProgram();
    }
    updateChangedFileExtensions(extension) {
        if (extension) {
            this._changedFileExtensions.add(extension);
        }
    }
    _getChangedCompilationFiles() {
        return this._compilerHost.getChangedFilePaths()
            .filter(k => {
            for (const ext of this._changedFileExtensions) {
                if (k.endsWith(ext)) {
                    return true;
                }
            }
            return false;
        });
    }
    async _createOrUpdateProgram() {
        // Get the root files from the ts config.
        // When a new root name (like a lazy route) is added, it won't be available from
        // following imports on the existing files, so we need to get the new list of root files.
        const config = compiler_cli_1.readConfiguration(this._tsConfigPath);
        this._rootNames = config.rootNames;
        // Update the forked type checker with all changed compilation files.
        // This includes templates, that also need to be reloaded on the type checker.
        if (this._forkTypeChecker && this._typeCheckerProcess && !this._firstRun) {
            this._updateForkedTypeChecker(this._rootNames, this._getChangedCompilationFiles());
        }
        // Use an identity function as all our paths are absolute already.
        this._moduleResolutionCache = ts.createModuleResolutionCache(this._basePath, x => x);
        const tsProgram = this._getTsProgram();
        const oldFiles = new Set(tsProgram ?
            tsProgram.getSourceFiles().map(sf => sf.fileName)
            : []);
        if (this._JitMode) {
            // Create the TypeScript program.
            benchmark_1.time('AngularCompilerPlugin._createOrUpdateProgram.ts.createProgram');
            this._program = ts.createProgram(this._rootNames, this._compilerOptions, this._compilerHost, tsProgram);
            benchmark_1.timeEnd('AngularCompilerPlugin._createOrUpdateProgram.ts.createProgram');
            const newFiles = this._program.getSourceFiles().filter(sf => !oldFiles.has(sf.fileName));
            for (const newFile of newFiles) {
                this._compilerHost.invalidate(newFile.fileName);
            }
        }
        else {
            benchmark_1.time('AngularCompilerPlugin._createOrUpdateProgram.ng.createProgram');
            // Create the Angular program.
            this._program = compiler_cli_1.createProgram({
                rootNames: this._rootNames,
                options: this._compilerOptions,
                host: this._compilerHost,
                oldProgram: this._program,
            });
            benchmark_1.timeEnd('AngularCompilerPlugin._createOrUpdateProgram.ng.createProgram');
            benchmark_1.time('AngularCompilerPlugin._createOrUpdateProgram.ng.loadNgStructureAsync');
            await this._program.loadNgStructureAsync();
            benchmark_1.timeEnd('AngularCompilerPlugin._createOrUpdateProgram.ng.loadNgStructureAsync');
            const newFiles = this._program.getTsProgram()
                .getSourceFiles().filter(sf => !oldFiles.has(sf.fileName));
            for (const newFile of newFiles) {
                this._compilerHost.invalidate(newFile.fileName);
            }
        }
        // If there's still no entryModule try to resolve from mainPath.
        if (!this._entryModule && this._mainPath) {
            benchmark_1.time('AngularCompilerPlugin._make.resolveEntryModuleFromMain');
            this._entryModule = entry_resolver_1.resolveEntryModuleFromMain(this._mainPath, this._compilerHost, this._getTsProgram());
            if (!this.entryModule && !this._compilerOptions.enableIvy) {
                this._warnings.push('Lazy routes discovery is not enabled. '
                    + 'Because there is neither an entryModule nor a '
                    + 'statically analyzable bootstrap code in the main file.');
            }
            benchmark_1.timeEnd('AngularCompilerPlugin._make.resolveEntryModuleFromMain');
        }
    }
    _findLazyRoutesInAst(changedFilePaths) {
        benchmark_1.time('AngularCompilerPlugin._findLazyRoutesInAst');
        const result = {};
        for (const filePath of changedFilePaths) {
            const fileLazyRoutes = lazy_routes_1.findLazyRoutes(filePath, this._compilerHost, undefined, this._compilerOptions);
            for (const routeKey of Object.keys(fileLazyRoutes)) {
                const route = fileLazyRoutes[routeKey];
                result[routeKey] = route;
            }
        }
        benchmark_1.timeEnd('AngularCompilerPlugin._findLazyRoutesInAst');
        return result;
    }
    _listLazyRoutesFromProgram() {
        let entryRoute;
        let ngProgram;
        if (this._JitMode) {
            if (!this.entryModule) {
                return {};
            }
            benchmark_1.time('AngularCompilerPlugin._listLazyRoutesFromProgram.createProgram');
            ngProgram = compiler_cli_1.createProgram({
                rootNames: this._rootNames,
                options: Object.assign({}, this._compilerOptions, { genDir: '', collectAllErrors: true }),
                host: this._compilerHost,
            });
            benchmark_1.timeEnd('AngularCompilerPlugin._listLazyRoutesFromProgram.createProgram');
            entryRoute = this.entryModule.path + '#' + this.entryModule.className;
        }
        else {
            ngProgram = this._program;
        }
        benchmark_1.time('AngularCompilerPlugin._listLazyRoutesFromProgram.listLazyRoutes');
        // entryRoute will only be defined in JIT.
        // In AOT all routes within the program are returned.
        const lazyRoutes = ngProgram.listLazyRoutes(entryRoute);
        benchmark_1.timeEnd('AngularCompilerPlugin._listLazyRoutesFromProgram.listLazyRoutes');
        return lazyRoutes.reduce((acc, curr) => {
            const ref = curr.route;
            if (ref in acc && acc[ref] !== curr.referencedModule.filePath) {
                throw new Error(+`Duplicated path in loadChildren detected: "${ref}" is used in 2 loadChildren, `
                    + `but they point to different modules "(${acc[ref]} and `
                    + `"${curr.referencedModule.filePath}"). Webpack cannot distinguish on context and `
                    + 'would fail to load the proper one.');
            }
            acc[ref] = curr.referencedModule.filePath;
            return acc;
        }, {});
    }
    // Process the lazy routes discovered, adding then to _lazyRoutes.
    // TODO: find a way to remove lazy routes that don't exist anymore.
    // This will require a registry of known references to a lazy route, removing it when no
    // module references it anymore.
    _processLazyRoutes(discoveredLazyRoutes) {
        Object.keys(discoveredLazyRoutes)
            .forEach(lazyRouteKey => {
            const [lazyRouteModule, moduleName] = lazyRouteKey.split('#');
            if (!lazyRouteModule) {
                return;
            }
            const lazyRouteTSFile = discoveredLazyRoutes[lazyRouteKey].replace(/\\/g, '/');
            let modulePath, moduleKey;
            if (this._JitMode) {
                modulePath = lazyRouteTSFile;
                moduleKey = `${lazyRouteModule}${moduleName ? '#' + moduleName : ''}`;
            }
            else {
                modulePath = lazyRouteTSFile.replace(/(\.d)?\.tsx?$/, '');
                modulePath += '.ngfactory.js';
                const factoryModuleName = moduleName ? `#${moduleName}NgFactory` : '';
                moduleKey = `${lazyRouteModule}.ngfactory${factoryModuleName}`;
            }
            modulePath = compiler_host_1.workaroundResolve(modulePath);
            if (moduleKey in this._lazyRoutes) {
                if (this._lazyRoutes[moduleKey] !== modulePath) {
                    // Found a duplicate, this is an error.
                    this._warnings.push(new Error(`Duplicated path in loadChildren detected during a rebuild. `
                        + `We will take the latest version detected and override it to save rebuild time. `
                        + `You should perform a full build to validate that your routes don't overlap.`));
                }
            }
            else {
                // Found a new route, add it to the map.
                this._lazyRoutes[moduleKey] = modulePath;
            }
        });
    }
    _createForkedTypeChecker() {
        // Bootstrap type checker is using local CLI.
        const g = typeof global !== 'undefined' ? global : {}; // tslint:disable-line:no-any
        const typeCheckerFile = g['_DevKitIsLocal']
            ? './type_checker_bootstrap.js'
            : './type_checker_worker.js';
        const debugArgRegex = /--inspect(?:-brk|-port)?|--debug(?:-brk|-port)/;
        const execArgv = process.execArgv.filter((arg) => {
            // Remove debug args.
            // Workaround for https://github.com/nodejs/node/issues/9435
            return !debugArgRegex.test(arg);
        });
        // Signal the process to start listening for messages
        // Solves https://github.com/angular/angular-cli/issues/9071
        const forkArgs = [type_checker_1.AUTO_START_ARG];
        const forkOptions = { execArgv };
        this._typeCheckerProcess = child_process_1.fork(path.resolve(__dirname, typeCheckerFile), forkArgs, forkOptions);
        // Handle child messages.
        this._typeCheckerProcess.on('message', message => {
            switch (message.kind) {
                case type_checker_messages_1.MESSAGE_KIND.Log:
                    const logMessage = message;
                    this._logger.log(logMessage.level, `\n${logMessage.message}`);
                    break;
                default:
                    throw new Error(`TypeChecker: Unexpected message received: ${message}.`);
            }
        });
        // Handle child process exit.
        this._typeCheckerProcess.once('exit', (_, signal) => {
            this._typeCheckerProcess = null;
            // If process exited not because of SIGTERM (see _killForkedTypeChecker), than something
            // went wrong and it should fallback to type checking on the main thread.
            if (signal !== 'SIGTERM') {
                this._forkTypeChecker = false;
                const msg = 'AngularCompilerPlugin: Forked Type Checker exited unexpectedly. ' +
                    'Falling back to type checking on main thread.';
                this._warnings.push(msg);
            }
        });
    }
    _killForkedTypeChecker() {
        if (this._typeCheckerProcess && this._typeCheckerProcess.pid) {
            treeKill(this._typeCheckerProcess.pid, 'SIGTERM');
            this._typeCheckerProcess = null;
        }
    }
    _updateForkedTypeChecker(rootNames, changedCompilationFiles) {
        if (this._typeCheckerProcess) {
            if (!this._forkedTypeCheckerInitialized) {
                let hostReplacementPaths = {};
                if (this._options.hostReplacementPaths
                    && typeof this._options.hostReplacementPaths != 'function') {
                    hostReplacementPaths = this._options.hostReplacementPaths;
                }
                this._typeCheckerProcess.send(new type_checker_messages_1.InitMessage(this._compilerOptions, this._basePath, this._JitMode, this._rootNames, hostReplacementPaths));
                this._forkedTypeCheckerInitialized = true;
            }
            this._typeCheckerProcess.send(new type_checker_messages_1.UpdateMessage(rootNames, changedCompilationFiles));
        }
    }
    // Registration hook for webpack plugin.
    // tslint:disable-next-line:no-big-function
    apply(compiler) {
        // cleanup if not watching
        compiler.hooks.thisCompilation.tap('angular-compiler', compilation => {
            compilation.hooks.finishModules.tap('angular-compiler', () => {
                // only present for webpack 4.23.0+, assume true otherwise
                const watchMode = compiler.watchMode === undefined ? true : compiler.watchMode;
                if (!watchMode) {
                    this._program = null;
                    this._transformers = [];
                    this._resourceLoader = undefined;
                }
            });
        });
        // Decorate inputFileSystem to serve contents of CompilerHost.
        // Use decorated inputFileSystem in watchFileSystem.
        compiler.hooks.environment.tap('angular-compiler', () => {
            // The webpack types currently do not include these
            const compilerWithFileSystems = compiler;
            let host = this._options.host || new webpack_input_host_1.WebpackInputHost(compilerWithFileSystems.inputFileSystem);
            let replacements;
            if (this._options.hostReplacementPaths) {
                if (typeof this._options.hostReplacementPaths == 'function') {
                    const replacementResolver = this._options.hostReplacementPaths;
                    replacements = path => core_1.normalize(replacementResolver(core_1.getSystemPath(path)));
                    host = new class extends core_1.virtualFs.ResolverHost {
                        _resolve(path) {
                            return core_1.normalize(replacementResolver(core_1.getSystemPath(path)));
                        }
                    }(host);
                }
                else {
                    replacements = new Map();
                    const aliasHost = new core_1.virtualFs.AliasHost(host);
                    for (const from in this._options.hostReplacementPaths) {
                        const normalizedFrom = core_1.resolve(core_1.normalize(this._basePath), core_1.normalize(from));
                        const normalizedWith = core_1.resolve(core_1.normalize(this._basePath), core_1.normalize(this._options.hostReplacementPaths[from]));
                        aliasHost.aliases.set(normalizedFrom, normalizedWith);
                        replacements.set(normalizedFrom, normalizedWith);
                    }
                    host = aliasHost;
                }
            }
            // Create the webpack compiler host.
            const webpackCompilerHost = new compiler_host_1.WebpackCompilerHost(this._compilerOptions, this._basePath, host, true, this._options.directTemplateLoading);
            // Create and set a new WebpackResourceLoader in AOT
            if (!this._JitMode) {
                this._resourceLoader = new resource_loader_1.WebpackResourceLoader();
                webpackCompilerHost.setResourceLoader(this._resourceLoader);
            }
            // Use the WebpackCompilerHost with a resource loader to create an AngularCompilerHost.
            this._compilerHost = compiler_cli_1.createCompilerHost({
                options: this._compilerOptions,
                tsHost: webpackCompilerHost,
            });
            // Resolve mainPath if provided.
            if (this._options.mainPath) {
                this._mainPath = this._compilerHost.resolve(this._options.mainPath);
            }
            const inputDecorator = new virtual_file_system_decorator_1.VirtualFileSystemDecorator(compilerWithFileSystems.inputFileSystem, this._compilerHost);
            compilerWithFileSystems.inputFileSystem = inputDecorator;
            compilerWithFileSystems.watchFileSystem = new virtual_file_system_decorator_1.VirtualWatchFileSystemDecorator(inputDecorator, replacements);
        });
        // Add lazy modules to the context module for @angular/core
        compiler.hooks.contextModuleFactory.tap('angular-compiler', cmf => {
            const angularCorePackagePath = require.resolve('@angular/core/package.json');
            // APFv6 does not have single FESM anymore. Instead of verifying if we're pointing to
            // FESMs, we resolve the `@angular/core` path and verify that the path for the
            // module starts with it.
            // This may be slower but it will be compatible with both APF5, 6 and potential future
            // versions (until the dynamic import appears outside of core I suppose).
            // We resolve any symbolic links in order to get the real path that would be used in webpack.
            const angularCoreResourceRoot = fs.realpathSync(path.dirname(angularCorePackagePath));
            cmf.hooks.afterResolve.tapPromise('angular-compiler', async (result) => {
                // Alter only existing request from Angular or one of the additional lazy module resources.
                const isLazyModuleResource = (resource) => resource.startsWith(angularCoreResourceRoot) ||
                    (this.options.additionalLazyModuleResources &&
                        this.options.additionalLazyModuleResources.includes(resource));
                if (!result || !this.done || !isLazyModuleResource(result.resource)) {
                    return result;
                }
                return this.done.then(() => {
                    // This folder does not exist, but we need to give webpack a resource.
                    // TODO: check if we can't just leave it as is (angularCoreModuleDir).
                    result.resource = path.join(this._basePath, '$$_lazy_route_resource');
                    // tslint:disable-next-line:no-any
                    result.dependencies.forEach((d) => d.critical = false);
                    // tslint:disable-next-line:no-any
                    result.resolveDependencies = (_fs, options, callback) => {
                        const dependencies = Object.keys(this._lazyRoutes)
                            .map((key) => {
                            const modulePath = this._lazyRoutes[key];
                            if (modulePath !== null) {
                                const name = key.split('#')[0];
                                return new this._contextElementDependencyConstructor(modulePath, name);
                            }
                            else {
                                return null;
                            }
                        })
                            .filter(x => !!x);
                        if (this._options.nameLazyFiles) {
                            options.chunkName = '[request]';
                        }
                        callback(null, dependencies);
                    };
                    return result;
                }, () => undefined);
            });
        });
        // Create and destroy forked type checker on watch mode.
        compiler.hooks.watchRun.tap('angular-compiler', () => {
            if (this._forkTypeChecker && !this._typeCheckerProcess) {
                this._createForkedTypeChecker();
            }
        });
        compiler.hooks.watchClose.tap('angular-compiler', () => this._killForkedTypeChecker());
        // Remake the plugin on each compilation.
        compiler.hooks.make.tapPromise('angular-compiler', compilation => this._donePromise = this._make(compilation));
        compiler.hooks.invalid.tap('angular-compiler', () => this._firstRun = false);
        compiler.hooks.afterEmit.tap('angular-compiler', compilation => {
            // tslint:disable-next-line:no-any
            compilation._ngToolsWebpackPluginInstance = null;
        });
        compiler.hooks.done.tap('angular-compiler', () => {
            this._donePromise = null;
        });
        compiler.hooks.afterResolvers.tap('angular-compiler', compiler => {
            // tslint:disable-next-line:no-any
            compiler.resolverFactory.hooks.resolver
                .for('normal')
                // tslint:disable-next-line:no-any
                .tap('angular-compiler', (resolver) => {
                new paths_plugin_1.TypeScriptPathsPlugin(this._compilerOptions).apply(resolver);
            });
            compiler.hooks.normalModuleFactory.tap('angular-compiler', nmf => {
                // Virtual file system.
                // TODO: consider if it's better to remove this plugin and instead make it wait on the
                // VirtualFileSystemDecorator.
                // Wait for the plugin to be done when requesting `.ts` files directly (entry points), or
                // when the issuer is a `.ts` or `.ngfactory.js` file.
                nmf.hooks.beforeResolve.tapPromise('angular-compiler', async (request) => {
                    if (this.done && request) {
                        const name = request.request;
                        const issuer = request.contextInfo.issuer;
                        if (name.endsWith('.ts') || name.endsWith('.tsx')
                            || (issuer && /\.ts|ngfactory\.js$/.test(issuer))) {
                            try {
                                await this.done;
                            }
                            catch (_a) { }
                        }
                    }
                    return request;
                });
            });
        });
    }
    async _make(compilation) {
        benchmark_1.time('AngularCompilerPlugin._make');
        this._emitSkipped = true;
        // tslint:disable-next-line:no-any
        if (compilation._ngToolsWebpackPluginInstance) {
            throw new Error('An @ngtools/webpack plugin already exist for this compilation.');
        }
        // Set a private variable for this plugin instance.
        // tslint:disable-next-line:no-any
        compilation._ngToolsWebpackPluginInstance = this;
        // Update the resource loader with the new webpack compilation.
        if (this._resourceLoader) {
            this._resourceLoader.update(compilation);
        }
        try {
            await this._update();
            this.pushCompilationErrors(compilation);
        }
        catch (err) {
            compilation.errors.push(err);
            this.pushCompilationErrors(compilation);
        }
        benchmark_1.timeEnd('AngularCompilerPlugin._make');
    }
    pushCompilationErrors(compilation) {
        compilation.errors.push(...this._errors);
        compilation.warnings.push(...this._warnings);
        this._errors = [];
        this._warnings = [];
    }
    _makeTransformers() {
        const isAppPath = (fileName) => !fileName.endsWith('.ngfactory.ts') && !fileName.endsWith('.ngstyle.ts');
        const isMainPath = (fileName) => fileName === (this._mainPath ? compiler_host_1.workaroundResolve(this._mainPath) : this._mainPath);
        const getEntryModule = () => this.entryModule
            ? { path: compiler_host_1.workaroundResolve(this.entryModule.path), className: this.entryModule.className }
            : this.entryModule;
        const getLazyRoutes = () => this._lazyRoutes;
        const getTypeChecker = () => this._getTsProgram().getTypeChecker();
        if (this._JitMode) {
            // Replace resources in JIT.
            this._transformers.push(transformers_1.replaceResources(isAppPath, getTypeChecker));
        }
        else {
            // Remove unneeded angular decorators.
            this._transformers.push(transformers_1.removeDecorators(isAppPath, getTypeChecker));
        }
        if (this._platformTransformers !== null) {
            this._transformers.push(...this._platformTransformers);
        }
        else {
            if (this._platform === PLATFORM.Browser) {
                // If we have a locale, auto import the locale data file.
                // This transform must go before replaceBootstrap because it looks for the entry module
                // import, which will be replaced.
                if (this._normalizedLocale) {
                    this._transformers.push(transformers_1.registerLocaleData(isAppPath, getEntryModule, this._normalizedLocale));
                }
                if (!this._JitMode) {
                    // Replace bootstrap in browser AOT.
                    this._transformers.push(transformers_1.replaceBootstrap(isAppPath, getEntryModule, getTypeChecker, !!this._compilerOptions.enableIvy));
                }
            }
            else if (this._platform === PLATFORM.Server) {
                this._transformers.push(transformers_1.exportLazyModuleMap(isMainPath, getLazyRoutes));
                if (!this._JitMode) {
                    this._transformers.push(transformers_1.exportNgFactory(isMainPath, getEntryModule), transformers_1.replaceServerBootstrap(isMainPath, getEntryModule, getTypeChecker));
                }
            }
        }
    }
    _getChangedTsFiles() {
        return this._getChangedCompilationFiles()
            .filter(k => (k.endsWith('.ts') || k.endsWith('.tsx')) && !k.endsWith('.d.ts'))
            .filter(k => this._compilerHost.fileExists(k));
    }
    async _update() {
        benchmark_1.time('AngularCompilerPlugin._update');
        // We only want to update on TS and template changes, but all kinds of files are on this
        // list, like package.json and .ngsummary.json files.
        const changedFiles = this._getChangedCompilationFiles();
        // If nothing we care about changed and it isn't the first run, don't do anything.
        if (changedFiles.length === 0 && !this._firstRun) {
            return;
        }
        // Make a new program and load the Angular structure.
        await this._createOrUpdateProgram();
        // Try to find lazy routes if we have an entry module.
        // We need to run the `listLazyRoutes` the first time because it also navigates libraries
        // and other things that we might miss using the (faster) findLazyRoutesInAst.
        // Lazy routes modules will be read with compilerHost and added to the changed files.
        let lazyRouteMap = {};
        if (!this._JitMode || this._firstRun) {
            lazyRouteMap = this._listLazyRoutesFromProgram();
        }
        else {
            const changedTsFiles = this._getChangedTsFiles();
            if (changedTsFiles.length > 0) {
                lazyRouteMap = this._findLazyRoutesInAst(changedTsFiles);
            }
        }
        // Find lazy routes
        lazyRouteMap = Object.assign({}, lazyRouteMap, this._options.additionalLazyModules);
        this._processLazyRoutes(lazyRouteMap);
        // Emit files.
        benchmark_1.time('AngularCompilerPlugin._update._emit');
        const { emitResult, diagnostics } = this._emit();
        benchmark_1.timeEnd('AngularCompilerPlugin._update._emit');
        // Report diagnostics.
        const errors = diagnostics
            .filter((diag) => diag.category === ts.DiagnosticCategory.Error);
        const warnings = diagnostics
            .filter((diag) => diag.category === ts.DiagnosticCategory.Warning);
        if (errors.length > 0) {
            const message = compiler_cli_1.formatDiagnostics(errors);
            this._errors.push(new Error(message));
        }
        if (warnings.length > 0) {
            const message = compiler_cli_1.formatDiagnostics(warnings);
            this._warnings.push(message);
        }
        this._emitSkipped = !emitResult || emitResult.emitSkipped;
        // Reset changed files on successful compilation.
        if (!this._emitSkipped && this._errors.length === 0) {
            this._compilerHost.resetChangedFileTracker();
        }
        benchmark_1.timeEnd('AngularCompilerPlugin._update');
    }
    writeI18nOutFile() {
        function _recursiveMkDir(p) {
            if (!fs.existsSync(p)) {
                _recursiveMkDir(path.dirname(p));
                fs.mkdirSync(p);
            }
        }
        // Write the extracted messages to disk.
        if (this._compilerOptions.i18nOutFile) {
            const i18nOutFilePath = path.resolve(this._basePath, this._compilerOptions.i18nOutFile);
            const i18nOutFileContent = this._compilerHost.readFile(i18nOutFilePath);
            if (i18nOutFileContent) {
                _recursiveMkDir(path.dirname(i18nOutFilePath));
                fs.writeFileSync(i18nOutFilePath, i18nOutFileContent);
            }
        }
    }
    getCompiledFile(fileName) {
        const outputFile = fileName.replace(/.tsx?$/, '.js');
        let outputText;
        let sourceMap;
        let errorDependencies = [];
        if (this._emitSkipped) {
            const text = this._compilerHost.readFile(outputFile);
            if (text) {
                // If the compilation didn't emit files this time, try to return the cached files from the
                // last compilation and let the compilation errors show what's wrong.
                outputText = text;
                sourceMap = this._compilerHost.readFile(outputFile + '.map');
            }
            else {
                // There's nothing we can serve. Return an empty string to prevent lenghty webpack errors,
                // add the rebuild warning if it's not there yet.
                // We also need to all changed files as dependencies of this file, so that all of them
                // will be watched and trigger a rebuild next time.
                outputText = '';
                errorDependencies = this._getChangedCompilationFiles()
                    // These paths are used by the loader so we must denormalize them.
                    .map((p) => this._compilerHost.denormalizePath(p));
            }
        }
        else {
            // Check if the TS input file and the JS output file exist.
            if (((fileName.endsWith('.ts') || fileName.endsWith('.tsx'))
                && !this._compilerHost.fileExists(fileName))
                || !this._compilerHost.fileExists(outputFile, false)) {
                let msg = `${fileName} is missing from the TypeScript compilation. `
                    + `Please make sure it is in your tsconfig via the 'files' or 'include' property.`;
                if (/(\\|\/)node_modules(\\|\/)/.test(fileName)) {
                    msg += '\nThe missing file seems to be part of a third party library. '
                        + 'TS files in published libraries are often a sign of a badly packaged library. '
                        + 'Please open an issue in the library repository to alert its author and ask them '
                        + 'to package the library using the Angular Package Format (https://goo.gl/jB3GVv).';
                }
                throw new Error(msg);
            }
            outputText = this._compilerHost.readFile(outputFile) || '';
            sourceMap = this._compilerHost.readFile(outputFile + '.map');
        }
        return { outputText, sourceMap, errorDependencies };
    }
    getDependencies(fileName) {
        const resolvedFileName = this._compilerHost.resolve(fileName);
        const sourceFile = this._compilerHost.getSourceFile(resolvedFileName, ts.ScriptTarget.Latest);
        if (!sourceFile) {
            return [];
        }
        const options = this._compilerOptions;
        const host = this._compilerHost;
        const cache = this._moduleResolutionCache;
        const esImports = ast_helpers_1.collectDeepNodes(sourceFile, ts.SyntaxKind.ImportDeclaration)
            .map(decl => {
            const moduleName = decl.moduleSpecifier.text;
            const resolved = ts.resolveModuleName(moduleName, resolvedFileName, options, host, cache);
            if (resolved.resolvedModule) {
                return resolved.resolvedModule.resolvedFileName;
            }
            else {
                return null;
            }
        })
            .filter(x => x);
        const resourceImports = transformers_1.findResources(sourceFile)
            .map(resourcePath => core_1.resolve(core_1.dirname(resolvedFileName), core_1.normalize(resourcePath)));
        // These paths are meant to be used by the loader so we must denormalize them.
        const uniqueDependencies = new Set([
            ...esImports,
            ...resourceImports,
            ...this.getResourceDependencies(this._compilerHost.denormalizePath(resolvedFileName)),
        ].map((p) => p && this._compilerHost.denormalizePath(p)));
        return [...uniqueDependencies]
            .filter(x => !!x);
    }
    getResourceDependencies(fileName) {
        if (!this._resourceLoader) {
            return [];
        }
        return this._resourceLoader.getResourceDependencies(fileName);
    }
    // This code mostly comes from `performCompilation` in `@angular/compiler-cli`.
    // It skips the program creation because we need to use `loadNgStructureAsync()`,
    // and uses CustomTransformers.
    _emit() {
        benchmark_1.time('AngularCompilerPlugin._emit');
        const program = this._program;
        const allDiagnostics = [];
        const diagMode = (this._firstRun || !this._forkTypeChecker) ?
            gather_diagnostics_1.DiagnosticMode.All : gather_diagnostics_1.DiagnosticMode.Syntactic;
        let emitResult;
        try {
            if (this._JitMode) {
                const tsProgram = program;
                const changedTsFiles = new Set();
                if (this._firstRun) {
                    // Check parameter diagnostics.
                    benchmark_1.time('AngularCompilerPlugin._emit.ts.getOptionsDiagnostics');
                    allDiagnostics.push(...tsProgram.getOptionsDiagnostics());
                    benchmark_1.timeEnd('AngularCompilerPlugin._emit.ts.getOptionsDiagnostics');
                }
                else {
                    // generate a list of changed files for emit
                    // not needed on first run since a full program emit is required
                    for (const changedFile of this._compilerHost.getChangedFilePaths()) {
                        if (!/.(tsx|ts|json|js)$/.test(changedFile)) {
                            continue;
                        }
                        // existing type definitions are not emitted
                        if (changedFile.endsWith('.d.ts')) {
                            continue;
                        }
                        changedTsFiles.add(changedFile);
                    }
                }
                allDiagnostics.push(...gather_diagnostics_1.gatherDiagnostics(tsProgram, this._JitMode, 'AngularCompilerPlugin._emit.ts', diagMode));
                if (!gather_diagnostics_1.hasErrors(allDiagnostics)) {
                    if (this._firstRun || changedTsFiles.size > 20) {
                        emitResult = tsProgram.emit(undefined, undefined, undefined, undefined, { before: this._transformers });
                        allDiagnostics.push(...emitResult.diagnostics);
                    }
                    else {
                        for (const changedFile of changedTsFiles) {
                            const sourceFile = tsProgram.getSourceFile(changedFile);
                            if (!sourceFile) {
                                continue;
                            }
                            const timeLabel = `AngularCompilerPlugin._emit.ts+${sourceFile.fileName}+.emit`;
                            benchmark_1.time(timeLabel);
                            emitResult = tsProgram.emit(sourceFile, undefined, undefined, undefined, { before: this._transformers });
                            allDiagnostics.push(...emitResult.diagnostics);
                            benchmark_1.timeEnd(timeLabel);
                        }
                    }
                }
            }
            else {
                const angularProgram = program;
                // Check Angular structural diagnostics.
                benchmark_1.time('AngularCompilerPlugin._emit.ng.getNgStructuralDiagnostics');
                allDiagnostics.push(...angularProgram.getNgStructuralDiagnostics());
                benchmark_1.timeEnd('AngularCompilerPlugin._emit.ng.getNgStructuralDiagnostics');
                if (this._firstRun) {
                    // Check TypeScript parameter diagnostics.
                    benchmark_1.time('AngularCompilerPlugin._emit.ng.getTsOptionDiagnostics');
                    allDiagnostics.push(...angularProgram.getTsOptionDiagnostics());
                    benchmark_1.timeEnd('AngularCompilerPlugin._emit.ng.getTsOptionDiagnostics');
                    // Check Angular parameter diagnostics.
                    benchmark_1.time('AngularCompilerPlugin._emit.ng.getNgOptionDiagnostics');
                    allDiagnostics.push(...angularProgram.getNgOptionDiagnostics());
                    benchmark_1.timeEnd('AngularCompilerPlugin._emit.ng.getNgOptionDiagnostics');
                }
                allDiagnostics.push(...gather_diagnostics_1.gatherDiagnostics(angularProgram, this._JitMode, 'AngularCompilerPlugin._emit.ng', diagMode));
                if (!gather_diagnostics_1.hasErrors(allDiagnostics)) {
                    benchmark_1.time('AngularCompilerPlugin._emit.ng.emit');
                    const extractI18n = !!this._compilerOptions.i18nOutFile;
                    const emitFlags = extractI18n ? compiler_cli_1.EmitFlags.I18nBundle : compiler_cli_1.EmitFlags.Default;
                    emitResult = angularProgram.emit({
                        emitFlags, customTransformers: {
                            beforeTs: this._transformers,
                        },
                    });
                    allDiagnostics.push(...emitResult.diagnostics);
                    if (extractI18n) {
                        this.writeI18nOutFile();
                    }
                    benchmark_1.timeEnd('AngularCompilerPlugin._emit.ng.emit');
                }
            }
        }
        catch (e) {
            benchmark_1.time('AngularCompilerPlugin._emit.catch');
            // This function is available in the import below, but this way we avoid the dependency.
            // import { isSyntaxError } from '@angular/compiler';
            function isSyntaxError(error) {
                return error['ngSyntaxError']; // tslint:disable-line:no-any
            }
            let errMsg;
            let code;
            if (isSyntaxError(e)) {
                // don't report the stack for syntax errors as they are well known errors.
                errMsg = e.message;
                code = compiler_cli_1.DEFAULT_ERROR_CODE;
            }
            else {
                errMsg = e.stack;
                // It is not a syntax error we might have a program with unknown state, discard it.
                this._program = null;
                code = compiler_cli_1.UNKNOWN_ERROR_CODE;
            }
            allDiagnostics.push({ category: ts.DiagnosticCategory.Error, messageText: errMsg, code, source: compiler_cli_1.SOURCE });
            benchmark_1.timeEnd('AngularCompilerPlugin._emit.catch');
        }
        benchmark_1.timeEnd('AngularCompilerPlugin._emit');
        return { program, emitResult, diagnostics: allDiagnostics };
    }
    _validateLocale(locale) {
        // Get the path of the common module.
        const commonPath = path.dirname(require.resolve('@angular/common/package.json'));
        // Check if the locale file exists
        if (!fs.existsSync(path.resolve(commonPath, 'locales', `${locale}.js`))) {
            // Check for an alternative locale (if the locale id was badly formatted).
            const locales = fs.readdirSync(path.resolve(commonPath, 'locales'))
                .filter(file => file.endsWith('.js'))
                .map(file => file.replace('.js', ''));
            let newLocale;
            const normalizedLocale = locale.toLowerCase().replace(/_/g, '-');
            for (const l of locales) {
                if (l.toLowerCase() === normalizedLocale) {
                    newLocale = l;
                    break;
                }
            }
            if (newLocale) {
                locale = newLocale;
            }
            else {
                // Check for a parent locale
                const parentLocale = normalizedLocale.split('-')[0];
                if (locales.indexOf(parentLocale) !== -1) {
                    locale = parentLocale;
                }
                else {
                    this._warnings.push(`AngularCompilerPlugin: Unable to load the locale data file ` +
                        `"@angular/common/locales/${locale}", ` +
                        `please check that "${locale}" is a valid locale id.
            If needed, you can use "registerLocaleData" manually.`);
                    return null;
                }
            }
        }
        return locale;
    }
}
exports.AngularCompilerPlugin = AngularCompilerPlugin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhcl9jb21waWxlcl9wbHVnaW4uanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL25ndG9vbHMvd2VicGFjay9zcmMvYW5ndWxhcl9jb21waWxlcl9wbHVnaW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7O0dBTUc7QUFDSCwrQ0FROEI7QUFDOUIsb0RBQWdFO0FBQ2hFLHdEQWMrQjtBQUMvQixpREFBZ0U7QUFDaEUseUJBQXlCO0FBQ3pCLDZCQUE2QjtBQUM3QixpQ0FBaUM7QUFFakMsMkNBQTRDO0FBQzVDLG1EQUF5RTtBQUN6RSxxREFBOEQ7QUFDOUQsNkRBQW9GO0FBQ3BGLCtDQUE2RDtBQUM3RCxpREFBdUQ7QUFDdkQsdURBQTBEO0FBQzFELGlEQVN3QjtBQUN4Qiw0REFBOEQ7QUFDOUQsaURBRXdCO0FBQ3hCLG1FQUtpQztBQUNqQyxtRkFHeUM7QUFNekMsNkRBQXdEO0FBRXhELE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztBQThDdEMsSUFBWSxRQUdYO0FBSEQsV0FBWSxRQUFRO0lBQ2xCLDZDQUFPLENBQUE7SUFDUCwyQ0FBTSxDQUFBO0FBQ1IsQ0FBQyxFQUhXLFFBQVEsR0FBUixnQkFBUSxLQUFSLGdCQUFRLFFBR25CO0FBRUQsTUFBYSxxQkFBcUI7SUF1Q2hDLFlBQVksT0FBcUM7UUE3QmpELDhEQUE4RDtRQUN0RCxnQkFBVyxHQUFpQixFQUFFLENBQUM7UUFLL0Isa0JBQWEsR0FBMkMsRUFBRSxDQUFDO1FBQzNELDBCQUFxQixHQUFrRCxJQUFJLENBQUM7UUFFNUUsYUFBUSxHQUFHLEtBQUssQ0FBQztRQUNqQixpQkFBWSxHQUFHLElBQUksQ0FBQztRQUNwQiwyQkFBc0IsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUVyRixrQkFB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Q0FDRjtBQTVtQ0Qsc0RBNG1DQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7XG4gIFBhdGgsXG4gIGRpcm5hbWUsXG4gIGdldFN5c3RlbVBhdGgsXG4gIGxvZ2dpbmcsXG4gIG5vcm1hbGl6ZSxcbiAgcmVzb2x2ZSxcbiAgdmlydHVhbEZzLFxufSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZSc7XG5pbXBvcnQgeyBjcmVhdGVDb25zb2xlTG9nZ2VyIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2NvcmUvbm9kZSc7XG5pbXBvcnQge1xuICBDb21waWxlckhvc3QsXG4gIENvbXBpbGVyT3B0aW9ucyxcbiAgREVGQVVMVF9FUlJPUl9DT0RFLFxuICBEaWFnbm9zdGljLFxuICBFbWl0RmxhZ3MsXG4gIFByb2dyYW0sXG4gIFNPVVJDRSxcbiAgVU5LTk9XTl9FUlJPUl9DT0RFLFxuICBWRVJTSU9OLFxuICBjcmVhdGVDb21waWxlckhvc3QsXG4gIGNyZWF0ZVByb2dyYW0sXG4gIGZvcm1hdERpYWdub3N0aWNzLFxuICByZWFkQ29uZmlndXJhdGlvbixcbn0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXItY2xpJztcbmltcG9ydCB7IENoaWxkUHJvY2VzcywgRm9ya09wdGlvbnMsIGZvcmsgfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcbmltcG9ydCB7IENvbXBpbGVyLCBjb21waWxhdGlvbiB9IGZyb20gJ3dlYnBhY2snO1xuaW1wb3J0IHsgdGltZSwgdGltZUVuZCB9IGZyb20gJy4vYmVuY2htYXJrJztcbmltcG9ydCB7IFdlYnBhY2tDb21waWxlckhvc3QsIHdvcmthcm91bmRSZXNvbHZlIH0gZnJvbSAnLi9jb21waWxlcl9ob3N0JztcbmltcG9ydCB7IHJlc29sdmVFbnRyeU1vZHVsZUZyb21NYWluIH0gZnJvbSAnLi9lbnRyeV9yZXNvbHZlcic7XG5pbXBvcnQgeyBEaWFnbm9zdGljTW9kZSwgZ2F0aGVyRGlhZ25vc3RpY3MsIGhhc0Vycm9ycyB9IGZyb20gJy4vZ2F0aGVyX2RpYWdub3N0aWNzJztcbmltcG9ydCB7IExhenlSb3V0ZU1hcCwgZmluZExhenlSb3V0ZXMgfSBmcm9tICcuL2xhenlfcm91dGVzJztcbmltcG9ydCB7IFR5cGVTY3JpcHRQYXRoc1BsdWdpbiB9IGZyb20gJy4vcGF0aHMtcGx1Z2luJztcbmltcG9ydCB7IFdlYnBhY2tSZXNvdXJjZUxvYWRlciB9IGZyb20gJy4vcmVzb3VyY2VfbG9hZGVyJztcbmltcG9ydCB7XG4gIGV4cG9ydExhenlNb2R1bGVNYXAsXG4gIGV4cG9ydE5nRmFjdG9yeSxcbiAgZmluZFJlc291cmNlcyxcbiAgcmVnaXN0ZXJMb2NhbGVEYXRhLFxuICByZW1vdmVEZWNvcmF0b3JzLFxuICByZXBsYWNlQm9vdHN0cmFwLFxuICByZXBsYWNlUmVzb3VyY2VzLFxuICByZXBsYWNlU2VydmVyQm9vdHN0cmFwLFxufSBmcm9tICcuL3RyYW5zZm9ybWVycyc7XG5pbXBvcnQgeyBjb2xsZWN0RGVlcE5vZGVzIH0gZnJvbSAnLi90cmFuc2Zvcm1lcnMvYXN0X2hlbHBlcnMnO1xuaW1wb3J0IHtcbiAgQVVUT19TVEFSVF9BUkcsXG59IGZyb20gJy4vdHlwZV9jaGVja2VyJztcbmltcG9ydCB7XG4gIEluaXRNZXNzYWdlLFxuICBMb2dNZXNzYWdlLFxuICBNRVNTQUdFX0tJTkQsXG4gIFVwZGF0ZU1lc3NhZ2UsXG59IGZyb20gJy4vdHlwZV9jaGVja2VyX21lc3NhZ2VzJztcbmltcG9ydCB7XG4gIFZpcnR1YWxGaWxlU3lzdGVtRGVjb3JhdG9yLFxuICBWaXJ0dWFsV2F0Y2hGaWxlU3lzdGVtRGVjb3JhdG9yLFxufSBmcm9tICcuL3ZpcnR1YWxfZmlsZV9zeXN0ZW1fZGVjb3JhdG9yJztcbmltcG9ydCB7XG4gIENhbGxiYWNrLFxuICBOb2RlV2F0Y2hGaWxlU3lzdGVtSW50ZXJmYWNlLFxuICBOb3JtYWxNb2R1bGVGYWN0b3J5UmVxdWVzdCxcbn0gZnJvbSAnLi93ZWJwYWNrJztcbmltcG9ydCB7IFdlYnBhY2tJbnB1dEhvc3QgfSBmcm9tICcuL3dlYnBhY2staW5wdXQtaG9zdCc7XG5cbmNvbnN0IHRyZWVLaWxsID0gcmVxdWlyZSgndHJlZS1raWxsJyk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29udGV4dEVsZW1lbnREZXBlbmRlbmN5IHsgfVxuXG5leHBvcnQgaW50ZXJmYWNlIENvbnRleHRFbGVtZW50RGVwZW5kZW5jeUNvbnN0cnVjdG9yIHtcbiAgbmV3KG1vZHVsZVBhdGg6IHN0cmluZywgbmFtZTogc3RyaW5nKTogQ29udGV4dEVsZW1lbnREZXBlbmRlbmN5O1xufVxuXG4vKipcbiAqIE9wdGlvbiBDb25zdGFudHNcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmd1bGFyQ29tcGlsZXJQbHVnaW5PcHRpb25zIHtcbiAgc291cmNlTWFwPzogYm9vbGVhbjtcbiAgdHNDb25maWdQYXRoOiBzdHJpbmc7XG4gIGJhc2VQYXRoPzogc3RyaW5nO1xuICBlbnRyeU1vZHVsZT86IHN0cmluZztcbiAgbWFpblBhdGg/OiBzdHJpbmc7XG4gIHNraXBDb2RlR2VuZXJhdGlvbj86IGJvb2xlYW47XG4gIGhvc3RSZXBsYWNlbWVudFBhdGhzPzogeyBbcGF0aDogc3RyaW5nXTogc3RyaW5nIH0gfCAoKHBhdGg6IHN0cmluZykgPT4gc3RyaW5nKTtcbiAgZm9ya1R5cGVDaGVja2VyPzogYm9vbGVhbjtcbiAgaTE4bkluRmlsZT86IHN0cmluZztcbiAgaTE4bkluRm9ybWF0Pzogc3RyaW5nO1xuICBpMThuT3V0RmlsZT86IHN0cmluZztcbiAgaTE4bk91dEZvcm1hdD86IHN0cmluZztcbiAgbG9jYWxlPzogc3RyaW5nO1xuICBtaXNzaW5nVHJhbnNsYXRpb24/OiBzdHJpbmc7XG4gIHBsYXRmb3JtPzogUExBVEZPUk07XG4gIG5hbWVMYXp5RmlsZXM/OiBib29sZWFuO1xuICBsb2dnZXI/OiBsb2dnaW5nLkxvZ2dlcjtcbiAgZGlyZWN0VGVtcGxhdGVMb2FkaW5nPzogYm9vbGVhbjtcblxuICAvLyBhZGRlZCB0byB0aGUgbGlzdCBvZiBsYXp5IHJvdXRlc1xuICBhZGRpdGlvbmFsTGF6eU1vZHVsZXM/OiB7IFttb2R1bGU6IHN0cmluZ106IHN0cmluZyB9O1xuICBhZGRpdGlvbmFsTGF6eU1vZHVsZVJlc291cmNlcz86IHN0cmluZ1tdO1xuXG4gIC8vIFRoZSBDb250ZXh0RWxlbWVudERlcGVuZGVuY3kgb2YgY29ycmVjdCBXZWJwYWNrIGNvbXBpbGF0aW9uLlxuICAvLyBUaGlzIGlzIG5lZWRlZCB3aGVuIHRoZXJlIGFyZSBtdWx0aXBsZSBXZWJwYWNrIGluc3RhbGxzLlxuICBjb250ZXh0RWxlbWVudERlcGVuZGVuY3lDb25zdHJ1Y3Rvcj86IENvbnRleHRFbGVtZW50RGVwZW5kZW5jeUNvbnN0cnVjdG9yO1xuXG4gIC8vIFVzZSB0c2NvbmZpZyB0byBpbmNsdWRlIHBhdGggZ2xvYnMuXG4gIGNvbXBpbGVyT3B0aW9ucz86IHRzLkNvbXBpbGVyT3B0aW9ucztcblxuICBob3N0PzogdmlydHVhbEZzLkhvc3Q8ZnMuU3RhdHM+O1xuICBwbGF0Zm9ybVRyYW5zZm9ybWVycz86IHRzLlRyYW5zZm9ybWVyRmFjdG9yeTx0cy5Tb3VyY2VGaWxlPltdO1xufVxuXG5leHBvcnQgZW51bSBQTEFURk9STSB7XG4gIEJyb3dzZXIsXG4gIFNlcnZlcixcbn1cblxuZXhwb3J0IGNsYXNzIEFuZ3VsYXJDb21waWxlclBsdWdpbiB7XG4gIHByaXZhdGUgX29wdGlvbnM6IEFuZ3VsYXJDb21waWxlclBsdWdpbk9wdGlvbnM7XG5cbiAgLy8gVFMgY29tcGlsYXRpb24uXG4gIHByaXZhdGUgX2NvbXBpbGVyT3B0aW9uczogQ29tcGlsZXJPcHRpb25zO1xuICBwcml2YXRlIF9yb290TmFtZXM6IHN0cmluZ1tdO1xuICBwcml2YXRlIF9wcm9ncmFtOiAodHMuUHJvZ3JhbSB8IFByb2dyYW0pIHwgbnVsbDtcbiAgcHJpdmF0ZSBfY29tcGlsZXJIb3N0OiBXZWJwYWNrQ29tcGlsZXJIb3N0ICYgQ29tcGlsZXJIb3N0O1xuICBwcml2YXRlIF9tb2R1bGVSZXNvbHV0aW9uQ2FjaGU6IHRzLk1vZHVsZVJlc29sdXRpb25DYWNoZTtcbiAgcHJpdmF0ZSBfcmVzb3VyY2VMb2FkZXI/OiBXZWJwYWNrUmVzb3VyY2VMb2FkZXI7XG4gIC8vIENvbnRhaW5zIGBtb2R1bGVJbXBvcnRQYXRoI2V4cG9ydE5hbWVgID0+IGBmdWxsTW9kdWxlUGF0aGAuXG4gIHByaXZhdGUgX2xhenlSb3V0ZXM6IExhenlSb3V0ZU1hcCA9IHt9O1xuICBwcml2YXRlIF90c0NvbmZpZ1BhdGg6IHN0cmluZztcbiAgcHJpdmF0ZSBfZW50cnlNb2R1bGU6IHN0cmluZyB8IG51bGw7XG4gIHByaXZhdGUgX21haW5QYXRoOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gIHByaXZhdGUgX2Jhc2VQYXRoOiBzdHJpbmc7XG4gIHByaXZhdGUgX3RyYW5zZm9ybWVyczogdHMuVHJhbnNmb3JtZXJGYWN0b3J5PHRzLlNvdXJjZUZpbGU+W10gPSBbXTtcbiAgcHJpdmF0ZSBfcGxhdGZvcm1UcmFuc2Zvcm1lcnM6IHRzLlRyYW5zZm9ybWVyRmFjdG9yeTx0cy5Tb3VyY2VGaWxlPltdIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX3BsYXRmb3JtOiBQTEFURk9STTtcbiAgcHJpdmF0ZSBfSml0TW9kZSA9IGZhbHNlO1xuICBwcml2YXRlIF9lbWl0U2tpcHBlZCA9IHRydWU7XG4gIHByaXZhdGUgX2NoYW5nZWRGaWxlRXh0ZW5zaW9ucyA9IG5ldyBTZXQoWyd0cycsICd0c3gnLCAnaHRtbCcsICdjc3MnLCAnanMnLCAnanNvbiddKTtcblxuICAvLyBXZWJwYWNrIHBsdWdpbi5cbiAgcHJpdmF0ZSBfZmlyc3RSdW4gPSB0cnVlO1xuICBwcml2YXRlIF9kb25lUHJvbWlzZTogUHJvbWlzZTx2b2lkPiB8IG51bGw7XG4gIHByaXZhdGUgX25vcm1hbGl6ZWRMb2NhbGU6IHN0cmluZyB8IG51bGw7XG4gIHByaXZhdGUgX3dhcm5pbmdzOiAoc3RyaW5nIHwgRXJyb3IpW10gPSBbXTtcbiAgcHJpdmF0ZSBfZXJyb3JzOiAoc3RyaW5nIHwgRXJyb3IpW10gPSBbXTtcbiAgcHJpdmF0ZSBfY29udGV4dEVsZW1lbnREZXBlbmRlbmN5Q29uc3RydWN0b3I6IENvbnRleHRFbGVtZW50RGVwZW5kZW5jeUNvbnN0cnVjdG9yO1xuXG4gIC8vIFR5cGVDaGVja2VyIHByb2Nlc3MuXG4gIHByaXZhdGUgX2ZvcmtUeXBlQ2hlY2tlciA9IHRydWU7XG4gIHByaXZhdGUgX3R5cGVDaGVja2VyUHJvY2VzczogQ2hpbGRQcm9jZXNzIHwgbnVsbDtcbiAgcHJpdmF0ZSBfZm9ya2VkVHlwZUNoZWNrZXJJbml0aWFsaXplZCA9IGZhbHNlO1xuXG4gIC8vIExvZ2dpbmcuXG4gIHByaXZhdGUgX2xvZ2dlcjogbG9nZ2luZy5Mb2dnZXI7XG5cbiAgY29uc3RydWN0b3Iob3B0aW9uczogQW5ndWxhckNvbXBpbGVyUGx1Z2luT3B0aW9ucykge1xuICAgIHRoaXMuX29wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBvcHRpb25zKTtcbiAgICB0aGlzLl9zZXR1cE9wdGlvbnModGhpcy5fb3B0aW9ucyk7XG4gIH1cblxuICBnZXQgb3B0aW9ucygpIHsgcmV0dXJuIHRoaXMuX29wdGlvbnM7IH1cbiAgZ2V0IGRvbmUoKSB7IHJldHVybiB0aGlzLl9kb25lUHJvbWlzZTsgfVxuICBnZXQgZW50cnlNb2R1bGUoKSB7XG4gICAgaWYgKCF0aGlzLl9lbnRyeU1vZHVsZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHNwbGl0dGVkID0gdGhpcy5fZW50cnlNb2R1bGUuc3BsaXQoLygjW2EtekEtWl9dKFtcXHddKykpJC8pO1xuICAgIGNvbnN0IHBhdGggPSBzcGxpdHRlZFswXTtcbiAgICBjb25zdCBjbGFzc05hbWUgPSAhIXNwbGl0dGVkWzFdID8gc3BsaXR0ZWRbMV0uc3Vic3RyaW5nKDEpIDogJ2RlZmF1bHQnO1xuXG4gICAgcmV0dXJuIHsgcGF0aCwgY2xhc3NOYW1lIH07XG4gIH1cblxuICBnZXQgdHlwZUNoZWNrZXIoKTogdHMuVHlwZUNoZWNrZXIgfCBudWxsIHtcbiAgICBjb25zdCB0c1Byb2dyYW0gPSB0aGlzLl9nZXRUc1Byb2dyYW0oKTtcblxuICAgIHJldHVybiB0c1Byb2dyYW0gPyB0c1Byb2dyYW0uZ2V0VHlwZUNoZWNrZXIoKSA6IG51bGw7XG4gIH1cblxuICBzdGF0aWMgaXNTdXBwb3J0ZWQoKSB7XG4gICAgcmV0dXJuIFZFUlNJT04gJiYgcGFyc2VJbnQoVkVSU0lPTi5tYWpvcikgPj0gNTtcbiAgfVxuXG4gIHByaXZhdGUgX3NldHVwT3B0aW9ucyhvcHRpb25zOiBBbmd1bGFyQ29tcGlsZXJQbHVnaW5PcHRpb25zKSB7XG4gICAgdGltZSgnQW5ndWxhckNvbXBpbGVyUGx1Z2luLl9zZXR1cE9wdGlvbnMnKTtcbiAgICB0aGlzLl9sb2dnZXIgPSBvcHRpb25zLmxvZ2dlciB8fCBjcmVhdGVDb25zb2xlTG9nZ2VyKCk7XG5cbiAgICAvLyBGaWxsIGluIHRoZSBtaXNzaW5nIG9wdGlvbnMuXG4gICAgaWYgKCFvcHRpb25zLmhhc093blByb3BlcnR5KCd0c0NvbmZpZ1BhdGgnKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNdXN0IHNwZWNpZnkgXCJ0c0NvbmZpZ1BhdGhcIiBpbiB0aGUgY29uZmlndXJhdGlvbiBvZiBAbmd0b29scy93ZWJwYWNrLicpO1xuICAgIH1cbiAgICAvLyBUUyByZXByZXNlbnRzIHBhdGhzIGludGVybmFsbHkgd2l0aCAnLycgYW5kIGV4cGVjdHMgdGhlIHRzY29uZmlnIHBhdGggdG8gYmUgaW4gdGhpcyBmb3JtYXRcbiAgICB0aGlzLl90c0NvbmZpZ1BhdGggPSBvcHRpb25zLnRzQ29uZmlnUGF0aC5yZXBsYWNlKC9cXFxcL2csICcvJyk7XG5cbiAgICAvLyBDaGVjayB0aGUgYmFzZSBwYXRoLlxuICAgIGNvbnN0IG1heWJlQmFzZVBhdGggPSBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwgdGhpcy5fdHNDb25maWdQYXRoKTtcbiAgICBsZXQgYmFzZVBhdGggPSBtYXliZUJhc2VQYXRoO1xuICAgIGlmIChmcy5zdGF0U3luYyhtYXliZUJhc2VQYXRoKS5pc0ZpbGUoKSkge1xuICAgICAgYmFzZVBhdGggPSBwYXRoLmRpcm5hbWUoYmFzZVBhdGgpO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy5iYXNlUGF0aCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBiYXNlUGF0aCA9IHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCBvcHRpb25zLmJhc2VQYXRoKTtcbiAgICB9XG5cbiAgICAvLyBQYXJzZSB0aGUgdHNjb25maWcgY29udGVudHMuXG4gICAgY29uc3QgY29uZmlnID0gcmVhZENvbmZpZ3VyYXRpb24odGhpcy5fdHNDb25maWdQYXRoKTtcbiAgICBpZiAoY29uZmlnLmVycm9ycyAmJiBjb25maWcuZXJyb3JzLmxlbmd0aCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGZvcm1hdERpYWdub3N0aWNzKGNvbmZpZy5lcnJvcnMpKTtcbiAgICB9XG5cbiAgICB0aGlzLl9yb290TmFtZXMgPSBjb25maWcucm9vdE5hbWVzO1xuICAgIHRoaXMuX2NvbXBpbGVyT3B0aW9ucyA9IHsgLi4uY29uZmlnLm9wdGlvbnMsIC4uLm9wdGlvbnMuY29tcGlsZXJPcHRpb25zIH07XG4gICAgdGhpcy5fYmFzZVBhdGggPSBjb25maWcub3B0aW9ucy5iYXNlUGF0aCB8fCBiYXNlUGF0aCB8fCAnJztcblxuICAgIC8vIE92ZXJ3cml0ZSBvdXREaXIgc28gd2UgY2FuIGZpbmQgZ2VuZXJhdGVkIGZpbGVzIG5leHQgdG8gdGhlaXIgLnRzIG9yaWdpbiBpbiBjb21waWxlckhvc3QuXG4gICAgdGhpcy5fY29tcGlsZXJPcHRpb25zLm91dERpciA9ICcnO1xuICAgIHRoaXMuX2NvbXBpbGVyT3B0aW9ucy5zdXBwcmVzc091dHB1dFBhdGhDaGVjayA9IHRydWU7XG5cbiAgICAvLyBEZWZhdWx0IHBsdWdpbiBzb3VyY2VNYXAgdG8gY29tcGlsZXIgb3B0aW9ucyBzZXR0aW5nLlxuICAgIGlmICghb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSgnc291cmNlTWFwJykpIHtcbiAgICAgIG9wdGlvbnMuc291cmNlTWFwID0gdGhpcy5fY29tcGlsZXJPcHRpb25zLnNvdXJjZU1hcCB8fCBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBGb3JjZSB0aGUgcmlnaHQgc291cmNlbWFwIG9wdGlvbnMuXG4gICAgaWYgKG9wdGlvbnMuc291cmNlTWFwKSB7XG4gICAgICB0aGlzLl9jb21waWxlck9wdGlvbnMuc291cmNlTWFwID0gdHJ1ZTtcbiAgICAgIHRoaXMuX2NvbXBpbGVyT3B0aW9ucy5pbmxpbmVTb3VyY2VzID0gdHJ1ZTtcbiAgICAgIHRoaXMuX2NvbXBpbGVyT3B0aW9ucy5pbmxpbmVTb3VyY2VNYXAgPSBmYWxzZTtcbiAgICAgIHRoaXMuX2NvbXBpbGVyT3B0aW9ucy5tYXBSb290ID0gdW5kZWZpbmVkO1xuICAgICAgLy8gV2Ugd2lsbCBzZXQgdGhlIHNvdXJjZSB0byB0aGUgZnVsbCBwYXRoIG9mIHRoZSBmaWxlIGluIHRoZSBsb2FkZXIsIHNvIHdlIGRvbid0XG4gICAgICAvLyBuZWVkIHNvdXJjZVJvb3QgaGVyZS5cbiAgICAgIHRoaXMuX2NvbXBpbGVyT3B0aW9ucy5zb3VyY2VSb290ID0gdW5kZWZpbmVkO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9jb21waWxlck9wdGlvbnMuc291cmNlTWFwID0gZmFsc2U7XG4gICAgICB0aGlzLl9jb21waWxlck9wdGlvbnMuc291cmNlUm9vdCA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuX2NvbXBpbGVyT3B0aW9ucy5pbmxpbmVTb3VyY2VzID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5fY29tcGlsZXJPcHRpb25zLmlubGluZVNvdXJjZU1hcCA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuX2NvbXBpbGVyT3B0aW9ucy5tYXBSb290ID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5fY29tcGlsZXJPcHRpb25zLnNvdXJjZVJvb3QgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgLy8gV2Ugd2FudCB0byBhbGxvdyBlbWl0dGluZyB3aXRoIGVycm9ycyBzbyB0aGF0IGltcG9ydHMgY2FuIGJlIGFkZGVkXG4gICAgLy8gdG8gdGhlIHdlYnBhY2sgZGVwZW5kZW5jeSB0cmVlIGFuZCByZWJ1aWxkcyB0cmlnZ2VyZWQgYnkgZmlsZSBlZGl0cy5cbiAgICB0aGlzLl9jb21waWxlck9wdGlvbnMubm9FbWl0T25FcnJvciA9IGZhbHNlO1xuXG4gICAgLy8gU2V0IEpJVCAobm8gY29kZSBnZW5lcmF0aW9uKSBvciBBT1QgbW9kZS5cbiAgICBpZiAob3B0aW9ucy5za2lwQ29kZUdlbmVyYXRpb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5fSml0TW9kZSA9IG9wdGlvbnMuc2tpcENvZGVHZW5lcmF0aW9uO1xuICAgIH1cblxuICAgIC8vIFByb2Nlc3MgaTE4biBvcHRpb25zLlxuICAgIGlmIChvcHRpb25zLmkxOG5JbkZpbGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5fY29tcGlsZXJPcHRpb25zLmkxOG5JbkZpbGUgPSBvcHRpb25zLmkxOG5JbkZpbGU7XG4gICAgfVxuICAgIGlmIChvcHRpb25zLmkxOG5JbkZvcm1hdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLl9jb21waWxlck9wdGlvbnMuaTE4bkluRm9ybWF0ID0gb3B0aW9ucy5pMThuSW5Gb3JtYXQ7XG4gICAgfVxuICAgIGlmIChvcHRpb25zLmkxOG5PdXRGaWxlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuX2NvbXBpbGVyT3B0aW9ucy5pMThuT3V0RmlsZSA9IG9wdGlvbnMuaTE4bk91dEZpbGU7XG4gICAgfVxuICAgIGlmIChvcHRpb25zLmkxOG5PdXRGb3JtYXQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5fY29tcGlsZXJPcHRpb25zLmkxOG5PdXRGb3JtYXQgPSBvcHRpb25zLmkxOG5PdXRGb3JtYXQ7XG4gICAgfVxuICAgIGlmIChvcHRpb25zLmxvY2FsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLl9jb21waWxlck9wdGlvbnMuaTE4bkluTG9jYWxlID0gb3B0aW9ucy5sb2NhbGU7XG4gICAgICB0aGlzLl9jb21waWxlck9wdGlvbnMuaTE4bk91dExvY2FsZSA9IG9wdGlvbnMubG9jYWxlO1xuICAgICAgdGhpcy5fbm9ybWFsaXplZExvY2FsZSA9IHRoaXMuX3ZhbGlkYXRlTG9jYWxlKG9wdGlvbnMubG9jYWxlKTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMubWlzc2luZ1RyYW5zbGF0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuX2NvbXBpbGVyT3B0aW9ucy5pMThuSW5NaXNzaW5nVHJhbnNsYXRpb25zID1cbiAgICAgICAgb3B0aW9ucy5taXNzaW5nVHJhbnNsYXRpb24gYXMgJ2Vycm9yJyB8ICd3YXJuaW5nJyB8ICdpZ25vcmUnO1xuICAgIH1cblxuICAgIC8vIFByb2Nlc3MgZm9ya2VkIHR5cGUgY2hlY2tlciBvcHRpb25zLlxuICAgIGlmIChvcHRpb25zLmZvcmtUeXBlQ2hlY2tlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLl9mb3JrVHlwZUNoZWNrZXIgPSBvcHRpb25zLmZvcmtUeXBlQ2hlY2tlcjtcbiAgICB9XG4gICAgLy8gdGhpcy5fZm9ya1R5cGVDaGVja2VyID0gZmFsc2U7XG5cbiAgICAvLyBBZGQgY3VzdG9tIHBsYXRmb3JtIHRyYW5zZm9ybWVycy5cbiAgICBpZiAob3B0aW9ucy5wbGF0Zm9ybVRyYW5zZm9ybWVycyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLl9wbGF0Zm9ybVRyYW5zZm9ybWVycyA9IG9wdGlvbnMucGxhdGZvcm1UcmFuc2Zvcm1lcnM7XG4gICAgfVxuXG4gICAgLy8gRGVmYXVsdCBDb250ZXh0RWxlbWVudERlcGVuZGVuY3kgdG8gdGhlIG9uZSB3ZSBjYW4gaW1wb3J0IGZyb20gaGVyZS5cbiAgICAvLyBGYWlsaW5nIHRvIHVzZSB0aGUgcmlnaHQgQ29udGV4dEVsZW1lbnREZXBlbmRlbmN5IHdpbGwgdGhyb3cgdGhlIGVycm9yIGJlbG93OlxuICAgIC8vIFwiTm8gbW9kdWxlIGZhY3RvcnkgYXZhaWxhYmxlIGZvciBkZXBlbmRlbmN5IHR5cGU6IENvbnRleHRFbGVtZW50RGVwZW5kZW5jeVwiXG4gICAgLy8gSG9pc3RpbmcgdG9nZXRoZXIgd2l0aCBwZWVyIGRlcGVuZGVuY2llcyBjYW4gbWFrZSBpdCBzbyB0aGUgaW1wb3J0ZWRcbiAgICAvLyBDb250ZXh0RWxlbWVudERlcGVuZGVuY3kgZG9lcyBub3QgY29tZSBmcm9tIHRoZSBzYW1lIFdlYnBhY2sgaW5zdGFuY2UgdGhhdCBpcyB1c2VkXG4gICAgLy8gaW4gdGhlIGNvbXBpbGF0aW9uLiBJbiB0aGF0IGNhc2UsIHdlIGNhbiBwYXNzIHRoZSByaWdodCBvbmUgYXMgYW4gb3B0aW9uIHRvIHRoZSBwbHVnaW4uXG4gICAgdGhpcy5fY29udGV4dEVsZW1lbnREZXBlbmRlbmN5Q29uc3RydWN0b3IgPSBvcHRpb25zLmNvbnRleHRFbGVtZW50RGVwZW5kZW5jeUNvbnN0cnVjdG9yXG4gICAgICB8fCByZXF1aXJlKCd3ZWJwYWNrL2xpYi9kZXBlbmRlbmNpZXMvQ29udGV4dEVsZW1lbnREZXBlbmRlbmN5Jyk7XG5cbiAgICAvLyBVc2UgZW50cnlNb2R1bGUgaWYgYXZhaWxhYmxlIGluIG9wdGlvbnMsIG90aGVyd2lzZSByZXNvbHZlIGl0IGZyb20gbWFpblBhdGggYWZ0ZXIgcHJvZ3JhbVxuICAgIC8vIGNyZWF0aW9uLlxuICAgIGlmICh0aGlzLl9vcHRpb25zLmVudHJ5TW9kdWxlKSB7XG4gICAgICB0aGlzLl9lbnRyeU1vZHVsZSA9IHRoaXMuX29wdGlvbnMuZW50cnlNb2R1bGU7XG4gICAgfSBlbHNlIGlmICh0aGlzLl9jb21waWxlck9wdGlvbnMuZW50cnlNb2R1bGUpIHtcbiAgICAgIHRoaXMuX2VudHJ5TW9kdWxlID0gcGF0aC5yZXNvbHZlKHRoaXMuX2Jhc2VQYXRoLFxuICAgICAgICB0aGlzLl9jb21waWxlck9wdGlvbnMuZW50cnlNb2R1bGUgYXMgc3RyaW5nKTsgLy8gdGVtcG9yYXJ5IGNhc3QgZm9yIHR5cGUgaXNzdWVcbiAgICB9XG5cbiAgICAvLyBTZXQgcGxhdGZvcm0uXG4gICAgdGhpcy5fcGxhdGZvcm0gPSBvcHRpb25zLnBsYXRmb3JtIHx8IFBMQVRGT1JNLkJyb3dzZXI7XG5cbiAgICAvLyBNYWtlIHRyYW5zZm9ybWVycy5cbiAgICB0aGlzLl9tYWtlVHJhbnNmb3JtZXJzKCk7XG5cbiAgICB0aW1lRW5kKCdBbmd1bGFyQ29tcGlsZXJQbHVnaW4uX3NldHVwT3B0aW9ucycpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0VHNQcm9ncmFtKCkge1xuICAgIGlmICghdGhpcy5fcHJvZ3JhbSkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fSml0TW9kZSA/IHRoaXMuX3Byb2dyYW0gYXMgdHMuUHJvZ3JhbSA6ICh0aGlzLl9wcm9ncmFtIGFzIFByb2dyYW0pLmdldFRzUHJvZ3JhbSgpO1xuICB9XG5cbiAgdXBkYXRlQ2hhbmdlZEZpbGVFeHRlbnNpb25zKGV4dGVuc2lvbjogc3RyaW5nKSB7XG4gICAgaWYgKGV4dGVuc2lvbikge1xuICAgICAgdGhpcy5fY2hhbmdlZEZpbGVFeHRlbnNpb25zLmFkZChleHRlbnNpb24pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2dldENoYW5nZWRDb21waWxhdGlvbkZpbGVzKCkge1xuICAgIHJldHVybiB0aGlzLl9jb21waWxlckhvc3QuZ2V0Q2hhbmdlZEZpbGVQYXRocygpXG4gICAgICAuZmlsdGVyKGsgPT4ge1xuICAgICAgICBmb3IgKGNvbnN0IGV4dCBvZiB0aGlzLl9jaGFuZ2VkRmlsZUV4dGVuc2lvbnMpIHtcbiAgICAgICAgICBpZiAoay5lbmRzV2l0aChleHQpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgX2NyZWF0ZU9yVXBkYXRlUHJvZ3JhbSgpIHtcbiAgICAvLyBHZXQgdGhlIHJvb3QgZmlsZXMgZnJvbSB0aGUgdHMgY29uZmlnLlxuICAgIC8vIFdoZW4gYSBuZXcgcm9vdCBuYW1lIChsaWtlIGEgbGF6eSByb3V0ZSkgaXMgYWRkZWQsIGl0IHdvbid0IGJlIGF2YWlsYWJsZSBmcm9tXG4gICAgLy8gZm9sbG93aW5nIGltcG9ydHMgb24gdGhlIGV4aXN0aW5nIGZpbGVzLCBzbyB3ZSBuZWVkIHRvIGdldCB0aGUgbmV3IGxpc3Qgb2Ygcm9vdCBmaWxlcy5cbiAgICBjb25zdCBjb25maWcgPSByZWFkQ29uZmlndXJhdGlvbih0aGlzLl90c0NvbmZpZ1BhdGgpO1xuICAgIHRoaXMuX3Jvb3ROYW1lcyA9IGNvbmZpZy5yb290TmFtZXM7XG5cbiAgICAvLyBVcGRhdGUgdGhlIGZvcmtlZCB0eXBlIGNoZWNrZXIgd2l0aCBhbGwgY2hhbmdlZCBjb21waWxhdGlvbiBmaWxlcy5cbiAgICAvLyBUaGlzIGluY2x1ZGVzIHRlbXBsYXRlcywgdGhhdCBhbHNvIG5lZWQgdG8gYmUgcmVsb2FkZWQgb24gdGhlIHR5cGUgY2hlY2tlci5cbiAgICBpZiAodGhpcy5fZm9ya1R5cGVDaGVja2VyICYmIHRoaXMuX3R5cGVDaGVja2VyUHJvY2VzcyAmJiAhdGhpcy5fZmlyc3RSdW4pIHtcbiAgICAgIHRoaXMuX3VwZGF0ZUZvcmtlZFR5cGVDaGVja2VyKHRoaXMuX3Jvb3ROYW1lcywgdGhpcy5fZ2V0Q2hhbmdlZENvbXBpbGF0aW9uRmlsZXMoKSk7XG4gICAgfVxuXG4gICAgLy8gVXNlIGFuIGlkZW50aXR5IGZ1bmN0aW9uIGFzIGFsbCBvdXIgcGF0aHMgYXJlIGFic29sdXRlIGFscmVhZHkuXG4gICAgdGhpcy5fbW9kdWxlUmVzb2x1dGlvbkNhY2hlID0gdHMuY3JlYXRlTW9kdWxlUmVzb2x1dGlvbkNhY2hlKHRoaXMuX2Jhc2VQYXRoLCB4ID0+IHgpO1xuXG4gICAgY29uc3QgdHNQcm9ncmFtID0gdGhpcy5fZ2V0VHNQcm9ncmFtKCk7XG4gICAgY29uc3Qgb2xkRmlsZXMgPSBuZXcgU2V0KHRzUHJvZ3JhbSA/XG4gICAgICB0c1Byb2dyYW0uZ2V0U291cmNlRmlsZXMoKS5tYXAoc2YgPT4gc2YuZmlsZU5hbWUpXG4gICAgICA6IFtdLFxuICAgICk7XG5cbiAgICBpZiAodGhpcy5fSml0TW9kZSkge1xuICAgICAgLy8gQ3JlYXRlIHRoZSBUeXBlU2NyaXB0IHByb2dyYW0uXG4gICAgICB0aW1lKCdBbmd1bGFyQ29tcGlsZXJQbHVnaW4uX2NyZWF0ZU9yVXBkYXRlUHJvZ3JhbS50cy5jcmVhdGVQcm9ncmFtJyk7XG4gICAgICB0aGlzLl9wcm9ncmFtID0gdHMuY3JlYXRlUHJvZ3JhbShcbiAgICAgICAgdGhpcy5fcm9vdE5hbWVzLFxuICAgICAgICB0aGlzLl9jb21waWxlck9wdGlvbnMsXG4gICAgICAgIHRoaXMuX2NvbXBpbGVySG9zdCxcbiAgICAgICAgdHNQcm9ncmFtLFxuICAgICAgKTtcbiAgICAgIHRpbWVFbmQoJ0FuZ3VsYXJDb21waWxlclBsdWdpbi5fY3JlYXRlT3JVcGRhdGVQcm9ncmFtLnRzLmNyZWF0ZVByb2dyYW0nKTtcblxuICAgICAgY29uc3QgbmV3RmlsZXMgPSB0aGlzLl9wcm9ncmFtLmdldFNvdXJjZUZpbGVzKCkuZmlsdGVyKHNmID0+ICFvbGRGaWxlcy5oYXMoc2YuZmlsZU5hbWUpKTtcbiAgICAgIGZvciAoY29uc3QgbmV3RmlsZSBvZiBuZXdGaWxlcykge1xuICAgICAgICB0aGlzLl9jb21waWxlckhvc3QuaW52YWxpZGF0ZShuZXdGaWxlLmZpbGVOYW1lKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGltZSgnQW5ndWxhckNvbXBpbGVyUGx1Z2luLl9jcmVhdGVPclVwZGF0ZVByb2dyYW0ubmcuY3JlYXRlUHJvZ3JhbScpO1xuICAgICAgLy8gQ3JlYXRlIHRoZSBBbmd1bGFyIHByb2dyYW0uXG4gICAgICB0aGlzLl9wcm9ncmFtID0gY3JlYXRlUHJvZ3JhbSh7XG4gICAgICAgIHJvb3ROYW1lczogdGhpcy5fcm9vdE5hbWVzLFxuICAgICAgICBvcHRpb25zOiB0aGlzLl9jb21waWxlck9wdGlvbnMsXG4gICAgICAgIGhvc3Q6IHRoaXMuX2NvbXBpbGVySG9zdCxcbiAgICAgICAgb2xkUHJvZ3JhbTogdGhpcy5fcHJvZ3JhbSBhcyBQcm9ncmFtLFxuICAgICAgfSk7XG4gICAgICB0aW1lRW5kKCdBbmd1bGFyQ29tcGlsZXJQbHVnaW4uX2NyZWF0ZU9yVXBkYXRlUHJvZ3JhbS5uZy5jcmVhdGVQcm9ncmFtJyk7XG5cbiAgICAgIHRpbWUoJ0FuZ3VsYXJDb21waWxlclBsdWdpbi5fY3JlYXRlT3JVcGRhdGVQcm9ncmFtLm5nLmxvYWROZ1N0cnVjdHVyZUFzeW5jJyk7XG4gICAgICBhd2FpdCB0aGlzLl9wcm9ncmFtLmxvYWROZ1N0cnVjdHVyZUFzeW5jKCk7XG4gICAgICB0aW1lRW5kKCdBbmd1bGFyQ29tcGlsZXJQbHVnaW4uX2NyZWF0ZU9yVXBkYXRlUHJvZ3JhbS5uZy5sb2FkTmdTdHJ1Y3R1cmVBc3luYycpO1xuXG4gICAgICBjb25zdCBuZXdGaWxlcyA9IHRoaXMuX3Byb2dyYW0uZ2V0VHNQcm9ncmFtKClcbiAgICAgICAgLmdldFNvdXJjZUZpbGVzKCkuZmlsdGVyKHNmID0+ICFvbGRGaWxlcy5oYXMoc2YuZmlsZU5hbWUpKTtcbiAgICAgIGZvciAoY29uc3QgbmV3RmlsZSBvZiBuZXdGaWxlcykge1xuICAgICAgICB0aGlzLl9jb21waWxlckhvc3QuaW52YWxpZGF0ZShuZXdGaWxlLmZpbGVOYW1lKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBJZiB0aGVyZSdzIHN0aWxsIG5vIGVudHJ5TW9kdWxlIHRyeSB0byByZXNvbHZlIGZyb20gbWFpblBhdGguXG4gICAgaWYgKCF0aGlzLl9lbnRyeU1vZHVsZSAmJiB0aGlzLl9tYWluUGF0aCkge1xuICAgICAgdGltZSgnQW5ndWxhckNvbXBpbGVyUGx1Z2luLl9tYWtlLnJlc29sdmVFbnRyeU1vZHVsZUZyb21NYWluJyk7XG4gICAgICB0aGlzLl9lbnRyeU1vZHVsZSA9IHJlc29sdmVFbnRyeU1vZHVsZUZyb21NYWluKFxuICAgICAgICB0aGlzLl9tYWluUGF0aCwgdGhpcy5fY29tcGlsZXJIb3N0LCB0aGlzLl9nZXRUc1Byb2dyYW0oKSBhcyB0cy5Qcm9ncmFtKTtcblxuICAgICAgaWYgKCF0aGlzLmVudHJ5TW9kdWxlICYmICF0aGlzLl9jb21waWxlck9wdGlvbnMuZW5hYmxlSXZ5KSB7XG4gICAgICAgIHRoaXMuX3dhcm5pbmdzLnB1c2goJ0xhenkgcm91dGVzIGRpc2NvdmVyeSBpcyBub3QgZW5hYmxlZC4gJ1xuICAgICAgICAgICsgJ0JlY2F1c2UgdGhlcmUgaXMgbmVpdGhlciBhbiBlbnRyeU1vZHVsZSBub3IgYSAnXG4gICAgICAgICAgKyAnc3RhdGljYWxseSBhbmFseXphYmxlIGJvb3RzdHJhcCBjb2RlIGluIHRoZSBtYWluIGZpbGUuJyxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIHRpbWVFbmQoJ0FuZ3VsYXJDb21waWxlclBsdWdpbi5fbWFrZS5yZXNvbHZlRW50cnlNb2R1bGVGcm9tTWFpbicpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2ZpbmRMYXp5Um91dGVzSW5Bc3QoY2hhbmdlZEZpbGVQYXRoczogc3RyaW5nW10pOiBMYXp5Um91dGVNYXAge1xuICAgIHRpbWUoJ0FuZ3VsYXJDb21waWxlclBsdWdpbi5fZmluZExhenlSb3V0ZXNJbkFzdCcpO1xuICAgIGNvbnN0IHJlc3VsdDogTGF6eVJvdXRlTWFwID0ge307XG4gICAgZm9yIChjb25zdCBmaWxlUGF0aCBvZiBjaGFuZ2VkRmlsZVBhdGhzKSB7XG4gICAgICBjb25zdCBmaWxlTGF6eVJvdXRlcyA9IGZpbmRMYXp5Um91dGVzKGZpbGVQYXRoLCB0aGlzLl9jb21waWxlckhvc3QsIHVuZGVmaW5lZCxcbiAgICAgICAgdGhpcy5fY29tcGlsZXJPcHRpb25zKTtcbiAgICAgIGZvciAoY29uc3Qgcm91dGVLZXkgb2YgT2JqZWN0LmtleXMoZmlsZUxhenlSb3V0ZXMpKSB7XG4gICAgICAgIGNvbnN0IHJvdXRlID0gZmlsZUxhenlSb3V0ZXNbcm91dGVLZXldO1xuICAgICAgICByZXN1bHRbcm91dGVLZXldID0gcm91dGU7XG4gICAgICB9XG4gICAgfVxuICAgIHRpbWVFbmQoJ0FuZ3VsYXJDb21waWxlclBsdWdpbi5fZmluZExhenlSb3V0ZXNJbkFzdCcpO1xuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHByaXZhdGUgX2xpc3RMYXp5Um91dGVzRnJvbVByb2dyYW0oKTogTGF6eVJvdXRlTWFwIHtcbiAgICBsZXQgZW50cnlSb3V0ZTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIGxldCBuZ1Byb2dyYW06IFByb2dyYW07XG5cbiAgICBpZiAodGhpcy5fSml0TW9kZSkge1xuICAgICAgaWYgKCF0aGlzLmVudHJ5TW9kdWxlKSB7XG4gICAgICAgIHJldHVybiB7fTtcbiAgICAgIH1cblxuICAgICAgdGltZSgnQW5ndWxhckNvbXBpbGVyUGx1Z2luLl9saXN0TGF6eVJvdXRlc0Zyb21Qcm9ncmFtLmNyZWF0ZVByb2dyYW0nKTtcbiAgICAgIG5nUHJvZ3JhbSA9IGNyZWF0ZVByb2dyYW0oe1xuICAgICAgICByb290TmFtZXM6IHRoaXMuX3Jvb3ROYW1lcyxcbiAgICAgICAgb3B0aW9uczogeyAuLi50aGlzLl9jb21waWxlck9wdGlvbnMsIGdlbkRpcjogJycsIGNvbGxlY3RBbGxFcnJvcnM6IHRydWUgfSxcbiAgICAgICAgaG9zdDogdGhpcy5fY29tcGlsZXJIb3N0LFxuICAgICAgfSk7XG4gICAgICB0aW1lRW5kKCdBbmd1bGFyQ29tcGlsZXJQbHVnaW4uX2xpc3RMYXp5Um91dGVzRnJvbVByb2dyYW0uY3JlYXRlUHJvZ3JhbScpO1xuXG4gICAgICBlbnRyeVJvdXRlID0gdGhpcy5lbnRyeU1vZHVsZS5wYXRoICsgJyMnICsgdGhpcy5lbnRyeU1vZHVsZS5jbGFzc05hbWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5nUHJvZ3JhbSA9IHRoaXMuX3Byb2dyYW0gYXMgUHJvZ3JhbTtcbiAgICB9XG5cbiAgICB0aW1lKCdBbmd1bGFyQ29tcGlsZXJQbHVnaW4uX2xpc3RMYXp5Um91dGVzRnJvbVByb2dyYW0ubGlzdExhenlSb3V0ZXMnKTtcbiAgICAvLyBlbnRyeVJvdXRlIHdpbGwgb25seSBiZSBkZWZpbmVkIGluIEpJVC5cbiAgICAvLyBJbiBBT1QgYWxsIHJvdXRlcyB3aXRoaW4gdGhlIHByb2dyYW0gYXJlIHJldHVybmVkLlxuICAgIGNvbnN0IGxhenlSb3V0ZXMgPSBuZ1Byb2dyYW0ubGlzdExhenlSb3V0ZXMoZW50cnlSb3V0ZSk7XG4gICAgdGltZUVuZCgnQW5ndWxhckNvbXBpbGVyUGx1Z2luLl9saXN0TGF6eVJvdXRlc0Zyb21Qcm9ncmFtLmxpc3RMYXp5Um91dGVzJyk7XG5cbiAgICByZXR1cm4gbGF6eVJvdXRlcy5yZWR1Y2UoXG4gICAgICAoYWNjLCBjdXJyKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlZiA9IGN1cnIucm91dGU7XG4gICAgICAgIGlmIChyZWYgaW4gYWNjICYmIGFjY1tyZWZdICE9PSBjdXJyLnJlZmVyZW5jZWRNb2R1bGUuZmlsZVBhdGgpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICArIGBEdXBsaWNhdGVkIHBhdGggaW4gbG9hZENoaWxkcmVuIGRldGVjdGVkOiBcIiR7cmVmfVwiIGlzIHVzZWQgaW4gMiBsb2FkQ2hpbGRyZW4sIGBcbiAgICAgICAgICAgICsgYGJ1dCB0aGV5IHBvaW50IHRvIGRpZmZlcmVudCBtb2R1bGVzIFwiKCR7YWNjW3JlZl19IGFuZCBgXG4gICAgICAgICAgICArIGBcIiR7Y3Vyci5yZWZlcmVuY2VkTW9kdWxlLmZpbGVQYXRofVwiKS4gV2VicGFjayBjYW5ub3QgZGlzdGluZ3Vpc2ggb24gY29udGV4dCBhbmQgYFxuICAgICAgICAgICAgKyAnd291bGQgZmFpbCB0byBsb2FkIHRoZSBwcm9wZXIgb25lLicsXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBhY2NbcmVmXSA9IGN1cnIucmVmZXJlbmNlZE1vZHVsZS5maWxlUGF0aDtcblxuICAgICAgICByZXR1cm4gYWNjO1xuICAgICAgfSxcbiAgICAgIHt9IGFzIExhenlSb3V0ZU1hcCxcbiAgICApO1xuICB9XG5cbiAgLy8gUHJvY2VzcyB0aGUgbGF6eSByb3V0ZXMgZGlzY292ZXJlZCwgYWRkaW5nIHRoZW4gdG8gX2xhenlSb3V0ZXMuXG4gIC8vIFRPRE86IGZpbmQgYSB3YXkgdG8gcmVtb3ZlIGxhenkgcm91dGVzIHRoYXQgZG9uJ3QgZXhpc3QgYW55bW9yZS5cbiAgLy8gVGhpcyB3aWxsIHJlcXVpcmUgYSByZWdpc3RyeSBvZiBrbm93biByZWZlcmVuY2VzIHRvIGEgbGF6eSByb3V0ZSwgcmVtb3ZpbmcgaXQgd2hlbiBub1xuICAvLyBtb2R1bGUgcmVmZXJlbmNlcyBpdCBhbnltb3JlLlxuICBwcml2YXRlIF9wcm9jZXNzTGF6eVJvdXRlcyhkaXNjb3ZlcmVkTGF6eVJvdXRlczogTGF6eVJvdXRlTWFwKSB7XG4gICAgT2JqZWN0LmtleXMoZGlzY292ZXJlZExhenlSb3V0ZXMpXG4gICAgICAuZm9yRWFjaChsYXp5Um91dGVLZXkgPT4ge1xuICAgICAgICBjb25zdCBbbGF6eVJvdXRlTW9kdWxlLCBtb2R1bGVOYW1lXSA9IGxhenlSb3V0ZUtleS5zcGxpdCgnIycpO1xuXG4gICAgICAgIGlmICghbGF6eVJvdXRlTW9kdWxlKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbGF6eVJvdXRlVFNGaWxlID0gZGlzY292ZXJlZExhenlSb3V0ZXNbbGF6eVJvdXRlS2V5XS5yZXBsYWNlKC9cXFxcL2csICcvJyk7XG4gICAgICAgIGxldCBtb2R1bGVQYXRoOiBzdHJpbmcsIG1vZHVsZUtleTogc3RyaW5nO1xuXG4gICAgICAgIGlmICh0aGlzLl9KaXRNb2RlKSB7XG4gICAgICAgICAgbW9kdWxlUGF0aCA9IGxhenlSb3V0ZVRTRmlsZTtcbiAgICAgICAgICBtb2R1bGVLZXkgPSBgJHtsYXp5Um91dGVNb2R1bGV9JHttb2R1bGVOYW1lID8gJyMnICsgbW9kdWxlTmFtZSA6ICcnfWA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbW9kdWxlUGF0aCA9IGxhenlSb3V0ZVRTRmlsZS5yZXBsYWNlKC8oXFwuZCk/XFwudHN4PyQvLCAnJyk7XG4gICAgICAgICAgbW9kdWxlUGF0aCArPSAnLm5nZmFjdG9yeS5qcyc7XG4gICAgICAgICAgY29uc3QgZmFjdG9yeU1vZHVsZU5hbWUgPSBtb2R1bGVOYW1lID8gYCMke21vZHVsZU5hbWV9TmdGYWN0b3J5YCA6ICcnO1xuICAgICAgICAgIG1vZHVsZUtleSA9IGAke2xhenlSb3V0ZU1vZHVsZX0ubmdmYWN0b3J5JHtmYWN0b3J5TW9kdWxlTmFtZX1gO1xuICAgICAgICB9XG5cbiAgICAgICAgbW9kdWxlUGF0aCA9IHdvcmthcm91bmRSZXNvbHZlKG1vZHVsZVBhdGgpO1xuXG4gICAgICAgIGlmIChtb2R1bGVLZXkgaW4gdGhpcy5fbGF6eVJvdXRlcykge1xuICAgICAgICAgIGlmICh0aGlzLl9sYXp5Um91dGVzW21vZHVsZUtleV0gIT09IG1vZHVsZVBhdGgpIHtcbiAgICAgICAgICAgIC8vIEZvdW5kIGEgZHVwbGljYXRlLCB0aGlzIGlzIGFuIGVycm9yLlxuICAgICAgICAgICAgdGhpcy5fd2FybmluZ3MucHVzaChcbiAgICAgICAgICAgICAgbmV3IEVycm9yKGBEdXBsaWNhdGVkIHBhdGggaW4gbG9hZENoaWxkcmVuIGRldGVjdGVkIGR1cmluZyBhIHJlYnVpbGQuIGBcbiAgICAgICAgICAgICAgICArIGBXZSB3aWxsIHRha2UgdGhlIGxhdGVzdCB2ZXJzaW9uIGRldGVjdGVkIGFuZCBvdmVycmlkZSBpdCB0byBzYXZlIHJlYnVpbGQgdGltZS4gYFxuICAgICAgICAgICAgICAgICsgYFlvdSBzaG91bGQgcGVyZm9ybSBhIGZ1bGwgYnVpbGQgdG8gdmFsaWRhdGUgdGhhdCB5b3VyIHJvdXRlcyBkb24ndCBvdmVybGFwLmApLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gRm91bmQgYSBuZXcgcm91dGUsIGFkZCBpdCB0byB0aGUgbWFwLlxuICAgICAgICAgIHRoaXMuX2xhenlSb3V0ZXNbbW9kdWxlS2V5XSA9IG1vZHVsZVBhdGg7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlRm9ya2VkVHlwZUNoZWNrZXIoKSB7XG4gICAgLy8gQm9vdHN0cmFwIHR5cGUgY2hlY2tlciBpcyB1c2luZyBsb2NhbCBDTEkuXG4gICAgY29uc3QgZzogYW55ID0gdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwgOiB7fTsgIC8vIHRzbGludDpkaXNhYmxlLWxpbmU6bm8tYW55XG4gICAgY29uc3QgdHlwZUNoZWNrZXJGaWxlOiBzdHJpbmcgPSBnWydfRGV2S2l0SXNMb2NhbCddXG4gICAgICA/ICcuL3R5cGVfY2hlY2tlcl9ib290c3RyYXAuanMnXG4gICAgICA6ICcuL3R5cGVfY2hlY2tlcl93b3JrZXIuanMnO1xuXG4gICAgY29uc3QgZGVidWdBcmdSZWdleCA9IC8tLWluc3BlY3QoPzotYnJrfC1wb3J0KT98LS1kZWJ1Zyg/Oi1icmt8LXBvcnQpLztcblxuICAgIGNvbnN0IGV4ZWNBcmd2ID0gcHJvY2Vzcy5leGVjQXJndi5maWx0ZXIoKGFyZykgPT4ge1xuICAgICAgLy8gUmVtb3ZlIGRlYnVnIGFyZ3MuXG4gICAgICAvLyBXb3JrYXJvdW5kIGZvciBodHRwczovL2dpdGh1Yi5jb20vbm9kZWpzL25vZGUvaXNzdWVzLzk0MzVcbiAgICAgIHJldHVybiAhZGVidWdBcmdSZWdleC50ZXN0KGFyZyk7XG4gICAgfSk7XG4gICAgLy8gU2lnbmFsIHRoZSBwcm9jZXNzIHRvIHN0YXJ0IGxpc3RlbmluZyBmb3IgbWVzc2FnZXNcbiAgICAvLyBTb2x2ZXMgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci1jbGkvaXNzdWVzLzkwNzFcbiAgICBjb25zdCBmb3JrQXJncyA9IFtBVVRPX1NUQVJUX0FSR107XG4gICAgY29uc3QgZm9ya09wdGlvbnM6IEZvcmtPcHRpb25zID0geyBleGVjQXJndiB9O1xuXG4gICAgdGhpcy5fdHlwZUNoZWNrZXJQcm9jZXNzID0gZm9yayhcbiAgICAgIHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIHR5cGVDaGVja2VyRmlsZSksXG4gICAgICBmb3JrQXJncyxcbiAgICAgIGZvcmtPcHRpb25zKTtcblxuICAgIC8vIEhhbmRsZSBjaGlsZCBtZXNzYWdlcy5cbiAgICB0aGlzLl90eXBlQ2hlY2tlclByb2Nlc3Mub24oJ21lc3NhZ2UnLCBtZXNzYWdlID0+IHtcbiAgICAgIHN3aXRjaCAobWVzc2FnZS5raW5kKSB7XG4gICAgICAgIGNhc2UgTUVTU0FHRV9LSU5ELkxvZzpcbiAgICAgICAgICBjb25zdCBsb2dNZXNzYWdlID0gbWVzc2FnZSBhcyBMb2dNZXNzYWdlO1xuICAgICAgICAgIHRoaXMuX2xvZ2dlci5sb2cobG9nTWVzc2FnZS5sZXZlbCwgYFxcbiR7bG9nTWVzc2FnZS5tZXNzYWdlfWApO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVHlwZUNoZWNrZXI6IFVuZXhwZWN0ZWQgbWVzc2FnZSByZWNlaXZlZDogJHttZXNzYWdlfS5gKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIEhhbmRsZSBjaGlsZCBwcm9jZXNzIGV4aXQuXG4gICAgdGhpcy5fdHlwZUNoZWNrZXJQcm9jZXNzLm9uY2UoJ2V4aXQnLCAoXywgc2lnbmFsKSA9PiB7XG4gICAgICB0aGlzLl90eXBlQ2hlY2tlclByb2Nlc3MgPSBudWxsO1xuXG4gICAgICAvLyBJZiBwcm9jZXNzIGV4aXRlZCBub3QgYmVjYXVzZSBvZiBTSUdURVJNIChzZWUgX2tpbGxGb3JrZWRUeXBlQ2hlY2tlciksIHRoYW4gc29tZXRoaW5nXG4gICAgICAvLyB3ZW50IHdyb25nIGFuZCBpdCBzaG91bGQgZmFsbGJhY2sgdG8gdHlwZSBjaGVja2luZyBvbiB0aGUgbWFpbiB0aHJlYWQuXG4gICAgICBpZiAoc2lnbmFsICE9PSAnU0lHVEVSTScpIHtcbiAgICAgICAgdGhpcy5fZm9ya1R5cGVDaGVja2VyID0gZmFsc2U7XG4gICAgICAgIGNvbnN0IG1zZyA9ICdBbmd1bGFyQ29tcGlsZXJQbHVnaW46IEZvcmtlZCBUeXBlIENoZWNrZXIgZXhpdGVkIHVuZXhwZWN0ZWRseS4gJyArXG4gICAgICAgICAgJ0ZhbGxpbmcgYmFjayB0byB0eXBlIGNoZWNraW5nIG9uIG1haW4gdGhyZWFkLic7XG4gICAgICAgIHRoaXMuX3dhcm5pbmdzLnB1c2gobXNnKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2tpbGxGb3JrZWRUeXBlQ2hlY2tlcigpIHtcbiAgICBpZiAodGhpcy5fdHlwZUNoZWNrZXJQcm9jZXNzICYmIHRoaXMuX3R5cGVDaGVja2VyUHJvY2Vzcy5waWQpIHtcbiAgICAgIHRyZWVLaWxsKHRoaXMuX3R5cGVDaGVja2VyUHJvY2Vzcy5waWQsICdTSUdURVJNJyk7XG4gICAgICB0aGlzLl90eXBlQ2hlY2tlclByb2Nlc3MgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZUZvcmtlZFR5cGVDaGVja2VyKHJvb3ROYW1lczogc3RyaW5nW10sIGNoYW5nZWRDb21waWxhdGlvbkZpbGVzOiBzdHJpbmdbXSkge1xuICAgIGlmICh0aGlzLl90eXBlQ2hlY2tlclByb2Nlc3MpIHtcbiAgICAgIGlmICghdGhpcy5fZm9ya2VkVHlwZUNoZWNrZXJJbml0aWFsaXplZCkge1xuICAgICAgICBsZXQgaG9zdFJlcGxhY2VtZW50UGF0aHMgPSB7fTtcbiAgICAgICAgaWYgKHRoaXMuX29wdGlvbnMuaG9zdFJlcGxhY2VtZW50UGF0aHNcbiAgICAgICAgICAmJiB0eXBlb2YgdGhpcy5fb3B0aW9ucy5ob3N0UmVwbGFjZW1lbnRQYXRocyAhPSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgaG9zdFJlcGxhY2VtZW50UGF0aHMgPSB0aGlzLl9vcHRpb25zLmhvc3RSZXBsYWNlbWVudFBhdGhzO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3R5cGVDaGVja2VyUHJvY2Vzcy5zZW5kKG5ldyBJbml0TWVzc2FnZSh0aGlzLl9jb21waWxlck9wdGlvbnMsIHRoaXMuX2Jhc2VQYXRoLFxuICAgICAgICAgIHRoaXMuX0ppdE1vZGUsIHRoaXMuX3Jvb3ROYW1lcywgaG9zdFJlcGxhY2VtZW50UGF0aHMpKTtcbiAgICAgICAgdGhpcy5fZm9ya2VkVHlwZUNoZWNrZXJJbml0aWFsaXplZCA9IHRydWU7XG4gICAgICB9XG4gICAgICB0aGlzLl90eXBlQ2hlY2tlclByb2Nlc3Muc2VuZChuZXcgVXBkYXRlTWVzc2FnZShyb290TmFtZXMsIGNoYW5nZWRDb21waWxhdGlvbkZpbGVzKSk7XG4gICAgfVxuICB9XG5cbiAgLy8gUmVnaXN0cmF0aW9uIGhvb2sgZm9yIHdlYnBhY2sgcGx1Z2luLlxuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYmlnLWZ1bmN0aW9uXG4gIGFwcGx5KGNvbXBpbGVyOiBDb21waWxlciAmIHsgd2F0Y2hNb2RlPzogYm9vbGVhbiB9KSB7XG4gICAgLy8gY2xlYW51cCBpZiBub3Qgd2F0Y2hpbmdcbiAgICBjb21waWxlci5ob29rcy50aGlzQ29tcGlsYXRpb24udGFwKCdhbmd1bGFyLWNvbXBpbGVyJywgY29tcGlsYXRpb24gPT4ge1xuICAgICAgY29tcGlsYXRpb24uaG9va3MuZmluaXNoTW9kdWxlcy50YXAoJ2FuZ3VsYXItY29tcGlsZXInLCAoKSA9PiB7XG4gICAgICAgIC8vIG9ubHkgcHJlc2VudCBmb3Igd2VicGFjayA0LjIzLjArLCBhc3N1bWUgdHJ1ZSBvdGhlcndpc2VcbiAgICAgICAgY29uc3Qgd2F0Y2hNb2RlID0gY29tcGlsZXIud2F0Y2hNb2RlID09PSB1bmRlZmluZWQgPyB0cnVlIDogY29tcGlsZXIud2F0Y2hNb2RlO1xuICAgICAgICBpZiAoIXdhdGNoTW9kZSkge1xuICAgICAgICAgIHRoaXMuX3Byb2dyYW0gPSBudWxsO1xuICAgICAgICAgIHRoaXMuX3RyYW5zZm9ybWVycyA9IFtdO1xuICAgICAgICAgIHRoaXMuX3Jlc291cmNlTG9hZGVyID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIERlY29yYXRlIGlucHV0RmlsZVN5c3RlbSB0byBzZXJ2ZSBjb250ZW50cyBvZiBDb21waWxlckhvc3QuXG4gICAgLy8gVXNlIGRlY29yYXRlZCBpbnB1dEZpbGVTeXN0ZW0gaW4gd2F0Y2hGaWxlU3lzdGVtLlxuICAgIGNvbXBpbGVyLmhvb2tzLmVudmlyb25tZW50LnRhcCgnYW5ndWxhci1jb21waWxlcicsICgpID0+IHtcbiAgICAgIC8vIFRoZSB3ZWJwYWNrIHR5cGVzIGN1cnJlbnRseSBkbyBub3QgaW5jbHVkZSB0aGVzZVxuICAgICAgY29uc3QgY29tcGlsZXJXaXRoRmlsZVN5c3RlbXMgPSBjb21waWxlciBhcyBDb21waWxlciAmIHtcbiAgICAgICAgd2F0Y2hGaWxlU3lzdGVtOiBOb2RlV2F0Y2hGaWxlU3lzdGVtSW50ZXJmYWNlLFxuICAgICAgfTtcblxuICAgICAgbGV0IGhvc3Q6IHZpcnR1YWxGcy5Ib3N0PGZzLlN0YXRzPiA9IHRoaXMuX29wdGlvbnMuaG9zdCB8fCBuZXcgV2VicGFja0lucHV0SG9zdChcbiAgICAgICAgY29tcGlsZXJXaXRoRmlsZVN5c3RlbXMuaW5wdXRGaWxlU3lzdGVtLFxuICAgICAgKTtcblxuICAgICAgbGV0IHJlcGxhY2VtZW50czogTWFwPFBhdGgsIFBhdGg+IHwgKChwYXRoOiBQYXRoKSA9PiBQYXRoKSB8IHVuZGVmaW5lZDtcbiAgICAgIGlmICh0aGlzLl9vcHRpb25zLmhvc3RSZXBsYWNlbWVudFBhdGhzKSB7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5fb3B0aW9ucy5ob3N0UmVwbGFjZW1lbnRQYXRocyA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgY29uc3QgcmVwbGFjZW1lbnRSZXNvbHZlciA9IHRoaXMuX29wdGlvbnMuaG9zdFJlcGxhY2VtZW50UGF0aHM7XG4gICAgICAgICAgcmVwbGFjZW1lbnRzID0gcGF0aCA9PiBub3JtYWxpemUocmVwbGFjZW1lbnRSZXNvbHZlcihnZXRTeXN0ZW1QYXRoKHBhdGgpKSk7XG4gICAgICAgICAgaG9zdCA9IG5ldyBjbGFzcyBleHRlbmRzIHZpcnR1YWxGcy5SZXNvbHZlckhvc3Q8ZnMuU3RhdHM+IHtcbiAgICAgICAgICAgIF9yZXNvbHZlKHBhdGg6IFBhdGgpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIG5vcm1hbGl6ZShyZXBsYWNlbWVudFJlc29sdmVyKGdldFN5c3RlbVBhdGgocGF0aCkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KGhvc3QpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlcGxhY2VtZW50cyA9IG5ldyBNYXAoKTtcbiAgICAgICAgICBjb25zdCBhbGlhc0hvc3QgPSBuZXcgdmlydHVhbEZzLkFsaWFzSG9zdChob3N0KTtcbiAgICAgICAgICBmb3IgKGNvbnN0IGZyb20gaW4gdGhpcy5fb3B0aW9ucy5ob3N0UmVwbGFjZW1lbnRQYXRocykge1xuICAgICAgICAgICAgY29uc3Qgbm9ybWFsaXplZEZyb20gPSByZXNvbHZlKG5vcm1hbGl6ZSh0aGlzLl9iYXNlUGF0aCksIG5vcm1hbGl6ZShmcm9tKSk7XG4gICAgICAgICAgICBjb25zdCBub3JtYWxpemVkV2l0aCA9IHJlc29sdmUoXG4gICAgICAgICAgICAgIG5vcm1hbGl6ZSh0aGlzLl9iYXNlUGF0aCksXG4gICAgICAgICAgICAgIG5vcm1hbGl6ZSh0aGlzLl9vcHRpb25zLmhvc3RSZXBsYWNlbWVudFBhdGhzW2Zyb21dKSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBhbGlhc0hvc3QuYWxpYXNlcy5zZXQobm9ybWFsaXplZEZyb20sIG5vcm1hbGl6ZWRXaXRoKTtcbiAgICAgICAgICAgIHJlcGxhY2VtZW50cy5zZXQobm9ybWFsaXplZEZyb20sIG5vcm1hbGl6ZWRXaXRoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaG9zdCA9IGFsaWFzSG9zdDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBDcmVhdGUgdGhlIHdlYnBhY2sgY29tcGlsZXIgaG9zdC5cbiAgICAgIGNvbnN0IHdlYnBhY2tDb21waWxlckhvc3QgPSBuZXcgV2VicGFja0NvbXBpbGVySG9zdChcbiAgICAgICAgdGhpcy5fY29tcGlsZXJPcHRpb25zLFxuICAgICAgICB0aGlzLl9iYXNlUGF0aCxcbiAgICAgICAgaG9zdCxcbiAgICAgICAgdHJ1ZSxcbiAgICAgICAgdGhpcy5fb3B0aW9ucy5kaXJlY3RUZW1wbGF0ZUxvYWRpbmcsXG4gICAgICApO1xuXG4gICAgICAvLyBDcmVhdGUgYW5kIHNldCBhIG5ldyBXZWJwYWNrUmVzb3VyY2VMb2FkZXIgaW4gQU9UXG4gICAgICBpZiAoIXRoaXMuX0ppdE1vZGUpIHtcbiAgICAgICAgdGhpcy5fcmVzb3VyY2VMb2FkZXIgPSBuZXcgV2VicGFja1Jlc291cmNlTG9hZGVyKCk7XG4gICAgICAgIHdlYnBhY2tDb21waWxlckhvc3Quc2V0UmVzb3VyY2VMb2FkZXIodGhpcy5fcmVzb3VyY2VMb2FkZXIpO1xuICAgICAgfVxuXG4gICAgICAvLyBVc2UgdGhlIFdlYnBhY2tDb21waWxlckhvc3Qgd2l0aCBhIHJlc291cmNlIGxvYWRlciB0byBjcmVhdGUgYW4gQW5ndWxhckNvbXBpbGVySG9zdC5cbiAgICAgIHRoaXMuX2NvbXBpbGVySG9zdCA9IGNyZWF0ZUNvbXBpbGVySG9zdCh7XG4gICAgICAgIG9wdGlvbnM6IHRoaXMuX2NvbXBpbGVyT3B0aW9ucyxcbiAgICAgICAgdHNIb3N0OiB3ZWJwYWNrQ29tcGlsZXJIb3N0LFxuICAgICAgfSkgYXMgQ29tcGlsZXJIb3N0ICYgV2VicGFja0NvbXBpbGVySG9zdDtcblxuICAgICAgLy8gUmVzb2x2ZSBtYWluUGF0aCBpZiBwcm92aWRlZC5cbiAgICAgIGlmICh0aGlzLl9vcHRpb25zLm1haW5QYXRoKSB7XG4gICAgICAgIHRoaXMuX21haW5QYXRoID0gdGhpcy5fY29tcGlsZXJIb3N0LnJlc29sdmUodGhpcy5fb3B0aW9ucy5tYWluUGF0aCk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGlucHV0RGVjb3JhdG9yID0gbmV3IFZpcnR1YWxGaWxlU3lzdGVtRGVjb3JhdG9yKFxuICAgICAgICBjb21waWxlcldpdGhGaWxlU3lzdGVtcy5pbnB1dEZpbGVTeXN0ZW0sXG4gICAgICAgIHRoaXMuX2NvbXBpbGVySG9zdCxcbiAgICAgICk7XG4gICAgICBjb21waWxlcldpdGhGaWxlU3lzdGVtcy5pbnB1dEZpbGVTeXN0ZW0gPSBpbnB1dERlY29yYXRvcjtcbiAgICAgIGNvbXBpbGVyV2l0aEZpbGVTeXN0ZW1zLndhdGNoRmlsZVN5c3RlbSA9IG5ldyBWaXJ0dWFsV2F0Y2hGaWxlU3lzdGVtRGVjb3JhdG9yKFxuICAgICAgICBpbnB1dERlY29yYXRvcixcbiAgICAgICAgcmVwbGFjZW1lbnRzLFxuICAgICAgKTtcbiAgICB9KTtcblxuICAgIC8vIEFkZCBsYXp5IG1vZHVsZXMgdG8gdGhlIGNvbnRleHQgbW9kdWxlIGZvciBAYW5ndWxhci9jb3JlXG4gICAgY29tcGlsZXIuaG9va3MuY29udGV4dE1vZHVsZUZhY3RvcnkudGFwKCdhbmd1bGFyLWNvbXBpbGVyJywgY21mID0+IHtcbiAgICAgIGNvbnN0IGFuZ3VsYXJDb3JlUGFja2FnZVBhdGggPSByZXF1aXJlLnJlc29sdmUoJ0Bhbmd1bGFyL2NvcmUvcGFja2FnZS5qc29uJyk7XG5cbiAgICAgIC8vIEFQRnY2IGRvZXMgbm90IGhhdmUgc2luZ2xlIEZFU00gYW55bW9yZS4gSW5zdGVhZCBvZiB2ZXJpZnlpbmcgaWYgd2UncmUgcG9pbnRpbmcgdG9cbiAgICAgIC8vIEZFU01zLCB3ZSByZXNvbHZlIHRoZSBgQGFuZ3VsYXIvY29yZWAgcGF0aCBhbmQgdmVyaWZ5IHRoYXQgdGhlIHBhdGggZm9yIHRoZVxuICAgICAgLy8gbW9kdWxlIHN0YXJ0cyB3aXRoIGl0LlxuICAgICAgLy8gVGhpcyBtYXkgYmUgc2xvd2VyIGJ1dCBpdCB3aWxsIGJlIGNvbXBhdGlibGUgd2l0aCBib3RoIEFQRjUsIDYgYW5kIHBvdGVudGlhbCBmdXR1cmVcbiAgICAgIC8vIHZlcnNpb25zICh1bnRpbCB0aGUgZHluYW1pYyBpbXBvcnQgYXBwZWFycyBvdXRzaWRlIG9mIGNvcmUgSSBzdXBwb3NlKS5cbiAgICAgIC8vIFdlIHJlc29sdmUgYW55IHN5bWJvbGljIGxpbmtzIGluIG9yZGVyIHRvIGdldCB0aGUgcmVhbCBwYXRoIHRoYXQgd291bGQgYmUgdXNlZCBpbiB3ZWJwYWNrLlxuICAgICAgY29uc3QgYW5ndWxhckNvcmVSZXNvdXJjZVJvb3QgPSBmcy5yZWFscGF0aFN5bmMocGF0aC5kaXJuYW1lKGFuZ3VsYXJDb3JlUGFja2FnZVBhdGgpKTtcblxuICAgICAgY21mLmhvb2tzLmFmdGVyUmVzb2x2ZS50YXBQcm9taXNlKCdhbmd1bGFyLWNvbXBpbGVyJywgYXN5bmMgcmVzdWx0ID0+IHtcbiAgICAgICAgLy8gQWx0ZXIgb25seSBleGlzdGluZyByZXF1ZXN0IGZyb20gQW5ndWxhciBvciBvbmUgb2YgdGhlIGFkZGl0aW9uYWwgbGF6eSBtb2R1bGUgcmVzb3VyY2VzLlxuICAgICAgICBjb25zdCBpc0xhenlNb2R1bGVSZXNvdXJjZSA9IChyZXNvdXJjZTogc3RyaW5nKSA9PlxuICAgICAgICAgIHJlc291cmNlLnN0YXJ0c1dpdGgoYW5ndWxhckNvcmVSZXNvdXJjZVJvb3QpIHx8XG4gICAgICAgICAgKCB0aGlzLm9wdGlvbnMuYWRkaXRpb25hbExhenlNb2R1bGVSZXNvdXJjZXMgJiZcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5hZGRpdGlvbmFsTGF6eU1vZHVsZVJlc291cmNlcy5pbmNsdWRlcyhyZXNvdXJjZSkpO1xuXG4gICAgICAgIGlmICghcmVzdWx0IHx8ICF0aGlzLmRvbmUgfHwgIWlzTGF6eU1vZHVsZVJlc291cmNlKHJlc3VsdC5yZXNvdXJjZSkpIHtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZG9uZS50aGVuKFxuICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgIC8vIFRoaXMgZm9sZGVyIGRvZXMgbm90IGV4aXN0LCBidXQgd2UgbmVlZCB0byBnaXZlIHdlYnBhY2sgYSByZXNvdXJjZS5cbiAgICAgICAgICAgIC8vIFRPRE86IGNoZWNrIGlmIHdlIGNhbid0IGp1c3QgbGVhdmUgaXQgYXMgaXMgKGFuZ3VsYXJDb3JlTW9kdWxlRGlyKS5cbiAgICAgICAgICAgIHJlc3VsdC5yZXNvdXJjZSA9IHBhdGguam9pbih0aGlzLl9iYXNlUGF0aCwgJyQkX2xhenlfcm91dGVfcmVzb3VyY2UnKTtcbiAgICAgICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgICAgICAgICAgIHJlc3VsdC5kZXBlbmRlbmNpZXMuZm9yRWFjaCgoZDogYW55KSA9PiBkLmNyaXRpY2FsID0gZmFsc2UpO1xuICAgICAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuICAgICAgICAgICAgcmVzdWx0LnJlc29sdmVEZXBlbmRlbmNpZXMgPSAoX2ZzOiBhbnksIG9wdGlvbnM6IGFueSwgY2FsbGJhY2s6IENhbGxiYWNrKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGRlcGVuZGVuY2llcyA9IE9iamVjdC5rZXlzKHRoaXMuX2xhenlSb3V0ZXMpXG4gICAgICAgICAgICAgICAgLm1hcCgoa2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBtb2R1bGVQYXRoID0gdGhpcy5fbGF6eVJvdXRlc1trZXldO1xuICAgICAgICAgICAgICAgICAgaWYgKG1vZHVsZVBhdGggIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IGtleS5zcGxpdCgnIycpWzBdO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcy5fY29udGV4dEVsZW1lbnREZXBlbmRlbmN5Q29uc3RydWN0b3IobW9kdWxlUGF0aCwgbmFtZSk7XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5maWx0ZXIoeCA9PiAhIXgpO1xuXG4gICAgICAgICAgICAgIGlmICh0aGlzLl9vcHRpb25zLm5hbWVMYXp5RmlsZXMpIHtcbiAgICAgICAgICAgICAgICBvcHRpb25zLmNodW5rTmFtZSA9ICdbcmVxdWVzdF0nO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgZGVwZW5kZW5jaWVzKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgfSxcbiAgICAgICAgICAoKSA9PiB1bmRlZmluZWQsXG4gICAgICAgICk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIENyZWF0ZSBhbmQgZGVzdHJveSBmb3JrZWQgdHlwZSBjaGVja2VyIG9uIHdhdGNoIG1vZGUuXG4gICAgY29tcGlsZXIuaG9va3Mud2F0Y2hSdW4udGFwKCdhbmd1bGFyLWNvbXBpbGVyJywgKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuX2ZvcmtUeXBlQ2hlY2tlciAmJiAhdGhpcy5fdHlwZUNoZWNrZXJQcm9jZXNzKSB7XG4gICAgICAgIHRoaXMuX2NyZWF0ZUZvcmtlZFR5cGVDaGVja2VyKCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgY29tcGlsZXIuaG9va3Mud2F0Y2hDbG9zZS50YXAoJ2FuZ3VsYXItY29tcGlsZXInLCAoKSA9PiB0aGlzLl9raWxsRm9ya2VkVHlwZUNoZWNrZXIoKSk7XG5cbiAgICAvLyBSZW1ha2UgdGhlIHBsdWdpbiBvbiBlYWNoIGNvbXBpbGF0aW9uLlxuICAgIGNvbXBpbGVyLmhvb2tzLm1ha2UudGFwUHJvbWlzZShcbiAgICAgICdhbmd1bGFyLWNvbXBpbGVyJyxcbiAgICAgIGNvbXBpbGF0aW9uID0+IHRoaXMuX2RvbmVQcm9taXNlID0gdGhpcy5fbWFrZShjb21waWxhdGlvbiksXG4gICAgKTtcbiAgICBjb21waWxlci5ob29rcy5pbnZhbGlkLnRhcCgnYW5ndWxhci1jb21waWxlcicsICgpID0+IHRoaXMuX2ZpcnN0UnVuID0gZmFsc2UpO1xuICAgIGNvbXBpbGVyLmhvb2tzLmFmdGVyRW1pdC50YXAoJ2FuZ3VsYXItY29tcGlsZXInLCBjb21waWxhdGlvbiA9PiB7XG4gICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gICAgICAoY29tcGlsYXRpb24gYXMgYW55KS5fbmdUb29sc1dlYnBhY2tQbHVnaW5JbnN0YW5jZSA9IG51bGw7XG4gICAgfSk7XG4gICAgY29tcGlsZXIuaG9va3MuZG9uZS50YXAoJ2FuZ3VsYXItY29tcGlsZXInLCAoKSA9PiB7XG4gICAgICB0aGlzLl9kb25lUHJvbWlzZSA9IG51bGw7XG4gICAgfSk7XG5cbiAgICBjb21waWxlci5ob29rcy5hZnRlclJlc29sdmVycy50YXAoJ2FuZ3VsYXItY29tcGlsZXInLCBjb21waWxlciA9PiB7XG4gICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gICAgICAoY29tcGlsZXIgYXMgYW55KS5yZXNvbHZlckZhY3RvcnkuaG9va3MucmVzb2x2ZXJcbiAgICAgICAgLmZvcignbm9ybWFsJylcbiAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuICAgICAgICAudGFwKCdhbmd1bGFyLWNvbXBpbGVyJywgKHJlc29sdmVyOiBhbnkpID0+IHtcbiAgICAgICAgICBuZXcgVHlwZVNjcmlwdFBhdGhzUGx1Z2luKHRoaXMuX2NvbXBpbGVyT3B0aW9ucykuYXBwbHkocmVzb2x2ZXIpO1xuICAgICAgICB9KTtcblxuICAgICAgY29tcGlsZXIuaG9va3Mubm9ybWFsTW9kdWxlRmFjdG9yeS50YXAoJ2FuZ3VsYXItY29tcGlsZXInLCBubWYgPT4ge1xuICAgICAgICAvLyBWaXJ0dWFsIGZpbGUgc3lzdGVtLlxuICAgICAgICAvLyBUT0RPOiBjb25zaWRlciBpZiBpdCdzIGJldHRlciB0byByZW1vdmUgdGhpcyBwbHVnaW4gYW5kIGluc3RlYWQgbWFrZSBpdCB3YWl0IG9uIHRoZVxuICAgICAgICAvLyBWaXJ0dWFsRmlsZVN5c3RlbURlY29yYXRvci5cbiAgICAgICAgLy8gV2FpdCBmb3IgdGhlIHBsdWdpbiB0byBiZSBkb25lIHdoZW4gcmVxdWVzdGluZyBgLnRzYCBmaWxlcyBkaXJlY3RseSAoZW50cnkgcG9pbnRzKSwgb3JcbiAgICAgICAgLy8gd2hlbiB0aGUgaXNzdWVyIGlzIGEgYC50c2Agb3IgYC5uZ2ZhY3RvcnkuanNgIGZpbGUuXG4gICAgICAgIG5tZi5ob29rcy5iZWZvcmVSZXNvbHZlLnRhcFByb21pc2UoXG4gICAgICAgICAgJ2FuZ3VsYXItY29tcGlsZXInLFxuICAgICAgICAgIGFzeW5jIChyZXF1ZXN0PzogTm9ybWFsTW9kdWxlRmFjdG9yeVJlcXVlc3QpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLmRvbmUgJiYgcmVxdWVzdCkge1xuICAgICAgICAgICAgICBjb25zdCBuYW1lID0gcmVxdWVzdC5yZXF1ZXN0O1xuICAgICAgICAgICAgICBjb25zdCBpc3N1ZXIgPSByZXF1ZXN0LmNvbnRleHRJbmZvLmlzc3VlcjtcbiAgICAgICAgICAgICAgaWYgKG5hbWUuZW5kc1dpdGgoJy50cycpIHx8IG5hbWUuZW5kc1dpdGgoJy50c3gnKVxuICAgICAgICAgICAgICAgIHx8IChpc3N1ZXIgJiYgL1xcLnRzfG5nZmFjdG9yeVxcLmpzJC8udGVzdChpc3N1ZXIpKSkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmRvbmU7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCB7IH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcmVxdWVzdDtcbiAgICAgICAgICB9LFxuICAgICAgICApO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIF9tYWtlKGNvbXBpbGF0aW9uOiBjb21waWxhdGlvbi5Db21waWxhdGlvbikge1xuICAgIHRpbWUoJ0FuZ3VsYXJDb21waWxlclBsdWdpbi5fbWFrZScpO1xuICAgIHRoaXMuX2VtaXRTa2lwcGVkID0gdHJ1ZTtcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gICAgaWYgKChjb21waWxhdGlvbiBhcyBhbnkpLl9uZ1Rvb2xzV2VicGFja1BsdWdpbkluc3RhbmNlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0FuIEBuZ3Rvb2xzL3dlYnBhY2sgcGx1Z2luIGFscmVhZHkgZXhpc3QgZm9yIHRoaXMgY29tcGlsYXRpb24uJyk7XG4gICAgfVxuXG4gICAgLy8gU2V0IGEgcHJpdmF0ZSB2YXJpYWJsZSBmb3IgdGhpcyBwbHVnaW4gaW5zdGFuY2UuXG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuICAgIChjb21waWxhdGlvbiBhcyBhbnkpLl9uZ1Rvb2xzV2VicGFja1BsdWdpbkluc3RhbmNlID0gdGhpcztcblxuICAgIC8vIFVwZGF0ZSB0aGUgcmVzb3VyY2UgbG9hZGVyIHdpdGggdGhlIG5ldyB3ZWJwYWNrIGNvbXBpbGF0aW9uLlxuICAgIGlmICh0aGlzLl9yZXNvdXJjZUxvYWRlcikge1xuICAgICAgdGhpcy5fcmVzb3VyY2VMb2FkZXIudXBkYXRlKGNvbXBpbGF0aW9uKTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5fdXBkYXRlKCk7XG4gICAgICB0aGlzLnB1c2hDb21waWxhdGlvbkVycm9ycyhjb21waWxhdGlvbik7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb21waWxhdGlvbi5lcnJvcnMucHVzaChlcnIpO1xuICAgICAgdGhpcy5wdXNoQ29tcGlsYXRpb25FcnJvcnMoY29tcGlsYXRpb24pO1xuICAgIH1cblxuICAgIHRpbWVFbmQoJ0FuZ3VsYXJDb21waWxlclBsdWdpbi5fbWFrZScpO1xuICB9XG5cbiAgcHJpdmF0ZSBwdXNoQ29tcGlsYXRpb25FcnJvcnMoY29tcGlsYXRpb246IGNvbXBpbGF0aW9uLkNvbXBpbGF0aW9uKSB7XG4gICAgY29tcGlsYXRpb24uZXJyb3JzLnB1c2goLi4udGhpcy5fZXJyb3JzKTtcbiAgICBjb21waWxhdGlvbi53YXJuaW5ncy5wdXNoKC4uLnRoaXMuX3dhcm5pbmdzKTtcbiAgICB0aGlzLl9lcnJvcnMgPSBbXTtcbiAgICB0aGlzLl93YXJuaW5ncyA9IFtdO1xuICB9XG5cbiAgcHJpdmF0ZSBfbWFrZVRyYW5zZm9ybWVycygpIHtcbiAgICBjb25zdCBpc0FwcFBhdGggPSAoZmlsZU5hbWU6IHN0cmluZykgPT5cbiAgICAgICFmaWxlTmFtZS5lbmRzV2l0aCgnLm5nZmFjdG9yeS50cycpICYmICFmaWxlTmFtZS5lbmRzV2l0aCgnLm5nc3R5bGUudHMnKTtcbiAgICBjb25zdCBpc01haW5QYXRoID0gKGZpbGVOYW1lOiBzdHJpbmcpID0+IGZpbGVOYW1lID09PSAoXG4gICAgICB0aGlzLl9tYWluUGF0aCA/IHdvcmthcm91bmRSZXNvbHZlKHRoaXMuX21haW5QYXRoKSA6IHRoaXMuX21haW5QYXRoXG4gICAgKTtcbiAgICBjb25zdCBnZXRFbnRyeU1vZHVsZSA9ICgpID0+IHRoaXMuZW50cnlNb2R1bGVcbiAgICAgID8geyBwYXRoOiB3b3JrYXJvdW5kUmVzb2x2ZSh0aGlzLmVudHJ5TW9kdWxlLnBhdGgpLCBjbGFzc05hbWU6IHRoaXMuZW50cnlNb2R1bGUuY2xhc3NOYW1lIH1cbiAgICAgIDogdGhpcy5lbnRyeU1vZHVsZTtcbiAgICBjb25zdCBnZXRMYXp5Um91dGVzID0gKCkgPT4gdGhpcy5fbGF6eVJvdXRlcztcbiAgICBjb25zdCBnZXRUeXBlQ2hlY2tlciA9ICgpID0+ICh0aGlzLl9nZXRUc1Byb2dyYW0oKSBhcyB0cy5Qcm9ncmFtKS5nZXRUeXBlQ2hlY2tlcigpO1xuXG4gICAgaWYgKHRoaXMuX0ppdE1vZGUpIHtcbiAgICAgIC8vIFJlcGxhY2UgcmVzb3VyY2VzIGluIEpJVC5cbiAgICAgIHRoaXMuX3RyYW5zZm9ybWVycy5wdXNoKHJlcGxhY2VSZXNvdXJjZXMoaXNBcHBQYXRoLCBnZXRUeXBlQ2hlY2tlcikpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBSZW1vdmUgdW5uZWVkZWQgYW5ndWxhciBkZWNvcmF0b3JzLlxuICAgICAgdGhpcy5fdHJhbnNmb3JtZXJzLnB1c2gocmVtb3ZlRGVjb3JhdG9ycyhpc0FwcFBhdGgsIGdldFR5cGVDaGVja2VyKSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX3BsYXRmb3JtVHJhbnNmb3JtZXJzICE9PSBudWxsKSB7XG4gICAgICB0aGlzLl90cmFuc2Zvcm1lcnMucHVzaCguLi50aGlzLl9wbGF0Zm9ybVRyYW5zZm9ybWVycyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLl9wbGF0Zm9ybSA9PT0gUExBVEZPUk0uQnJvd3Nlcikge1xuICAgICAgICAvLyBJZiB3ZSBoYXZlIGEgbG9jYWxlLCBhdXRvIGltcG9ydCB0aGUgbG9jYWxlIGRhdGEgZmlsZS5cbiAgICAgICAgLy8gVGhpcyB0cmFuc2Zvcm0gbXVzdCBnbyBiZWZvcmUgcmVwbGFjZUJvb3RzdHJhcCBiZWNhdXNlIGl0IGxvb2tzIGZvciB0aGUgZW50cnkgbW9kdWxlXG4gICAgICAgIC8vIGltcG9ydCwgd2hpY2ggd2lsbCBiZSByZXBsYWNlZC5cbiAgICAgICAgaWYgKHRoaXMuX25vcm1hbGl6ZWRMb2NhbGUpIHtcbiAgICAgICAgICB0aGlzLl90cmFuc2Zvcm1lcnMucHVzaChyZWdpc3RlckxvY2FsZURhdGEoaXNBcHBQYXRoLCBnZXRFbnRyeU1vZHVsZSxcbiAgICAgICAgICAgIHRoaXMuX25vcm1hbGl6ZWRMb2NhbGUpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5fSml0TW9kZSkge1xuICAgICAgICAgIC8vIFJlcGxhY2UgYm9vdHN0cmFwIGluIGJyb3dzZXIgQU9ULlxuICAgICAgICAgIHRoaXMuX3RyYW5zZm9ybWVycy5wdXNoKHJlcGxhY2VCb290c3RyYXAoXG4gICAgICAgICAgICBpc0FwcFBhdGgsXG4gICAgICAgICAgICBnZXRFbnRyeU1vZHVsZSxcbiAgICAgICAgICAgIGdldFR5cGVDaGVja2VyLFxuICAgICAgICAgICAgISF0aGlzLl9jb21waWxlck9wdGlvbnMuZW5hYmxlSXZ5LFxuICAgICAgICAgICkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX3BsYXRmb3JtID09PSBQTEFURk9STS5TZXJ2ZXIpIHtcbiAgICAgICAgdGhpcy5fdHJhbnNmb3JtZXJzLnB1c2goZXhwb3J0TGF6eU1vZHVsZU1hcChpc01haW5QYXRoLCBnZXRMYXp5Um91dGVzKSk7XG4gICAgICAgIGlmICghdGhpcy5fSml0TW9kZSkge1xuICAgICAgICAgIHRoaXMuX3RyYW5zZm9ybWVycy5wdXNoKFxuICAgICAgICAgICAgZXhwb3J0TmdGYWN0b3J5KGlzTWFpblBhdGgsIGdldEVudHJ5TW9kdWxlKSxcbiAgICAgICAgICAgIHJlcGxhY2VTZXJ2ZXJCb290c3RyYXAoaXNNYWluUGF0aCwgZ2V0RW50cnlNb2R1bGUsIGdldFR5cGVDaGVja2VyKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9nZXRDaGFuZ2VkVHNGaWxlcygpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0Q2hhbmdlZENvbXBpbGF0aW9uRmlsZXMoKVxuICAgICAgLmZpbHRlcihrID0+IChrLmVuZHNXaXRoKCcudHMnKSB8fCBrLmVuZHNXaXRoKCcudHN4JykpICYmICFrLmVuZHNXaXRoKCcuZC50cycpKVxuICAgICAgLmZpbHRlcihrID0+IHRoaXMuX2NvbXBpbGVySG9zdC5maWxlRXhpc3RzKGspKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgX3VwZGF0ZSgpIHtcbiAgICB0aW1lKCdBbmd1bGFyQ29tcGlsZXJQbHVnaW4uX3VwZGF0ZScpO1xuICAgIC8vIFdlIG9ubHkgd2FudCB0byB1cGRhdGUgb24gVFMgYW5kIHRlbXBsYXRlIGNoYW5nZXMsIGJ1dCBhbGwga2luZHMgb2YgZmlsZXMgYXJlIG9uIHRoaXNcbiAgICAvLyBsaXN0LCBsaWtlIHBhY2thZ2UuanNvbiBhbmQgLm5nc3VtbWFyeS5qc29uIGZpbGVzLlxuICAgIGNvbnN0IGNoYW5nZWRGaWxlcyA9IHRoaXMuX2dldENoYW5nZWRDb21waWxhdGlvbkZpbGVzKCk7XG5cbiAgICAvLyBJZiBub3RoaW5nIHdlIGNhcmUgYWJvdXQgY2hhbmdlZCBhbmQgaXQgaXNuJ3QgdGhlIGZpcnN0IHJ1biwgZG9uJ3QgZG8gYW55dGhpbmcuXG4gICAgaWYgKGNoYW5nZWRGaWxlcy5sZW5ndGggPT09IDAgJiYgIXRoaXMuX2ZpcnN0UnVuKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gTWFrZSBhIG5ldyBwcm9ncmFtIGFuZCBsb2FkIHRoZSBBbmd1bGFyIHN0cnVjdHVyZS5cbiAgICBhd2FpdCB0aGlzLl9jcmVhdGVPclVwZGF0ZVByb2dyYW0oKTtcblxuICAgIC8vIFRyeSB0byBmaW5kIGxhenkgcm91dGVzIGlmIHdlIGhhdmUgYW4gZW50cnkgbW9kdWxlLlxuICAgIC8vIFdlIG5lZWQgdG8gcnVuIHRoZSBgbGlzdExhenlSb3V0ZXNgIHRoZSBmaXJzdCB0aW1lIGJlY2F1c2UgaXQgYWxzbyBuYXZpZ2F0ZXMgbGlicmFyaWVzXG4gICAgLy8gYW5kIG90aGVyIHRoaW5ncyB0aGF0IHdlIG1pZ2h0IG1pc3MgdXNpbmcgdGhlIChmYXN0ZXIpIGZpbmRMYXp5Um91dGVzSW5Bc3QuXG4gICAgLy8gTGF6eSByb3V0ZXMgbW9kdWxlcyB3aWxsIGJlIHJlYWQgd2l0aCBjb21waWxlckhvc3QgYW5kIGFkZGVkIHRvIHRoZSBjaGFuZ2VkIGZpbGVzLlxuICAgIGxldCBsYXp5Um91dGVNYXA6IExhenlSb3V0ZU1hcCA9IHt9O1xuICAgIGlmICghdGhpcy5fSml0TW9kZSB8fCB0aGlzLl9maXJzdFJ1bikge1xuICAgICAgbGF6eVJvdXRlTWFwID0gdGhpcy5fbGlzdExhenlSb3V0ZXNGcm9tUHJvZ3JhbSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBjaGFuZ2VkVHNGaWxlcyA9IHRoaXMuX2dldENoYW5nZWRUc0ZpbGVzKCk7XG4gICAgICBpZiAoY2hhbmdlZFRzRmlsZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBsYXp5Um91dGVNYXAgPSB0aGlzLl9maW5kTGF6eVJvdXRlc0luQXN0KGNoYW5nZWRUc0ZpbGVzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBGaW5kIGxhenkgcm91dGVzXG4gICAgbGF6eVJvdXRlTWFwID0ge1xuICAgICAgLi4ubGF6eVJvdXRlTWFwLFxuICAgICAgLi4udGhpcy5fb3B0aW9ucy5hZGRpdGlvbmFsTGF6eU1vZHVsZXMsXG4gICAgfTtcblxuICAgIHRoaXMuX3Byb2Nlc3NMYXp5Um91dGVzKGxhenlSb3V0ZU1hcCk7XG5cbiAgICAvLyBFbWl0IGZpbGVzLlxuICAgIHRpbWUoJ0FuZ3VsYXJDb21waWxlclBsdWdpbi5fdXBkYXRlLl9lbWl0Jyk7XG4gICAgY29uc3QgeyBlbWl0UmVzdWx0LCBkaWFnbm9zdGljcyB9ID0gdGhpcy5fZW1pdCgpO1xuICAgIHRpbWVFbmQoJ0FuZ3VsYXJDb21waWxlclBsdWdpbi5fdXBkYXRlLl9lbWl0Jyk7XG5cbiAgICAvLyBSZXBvcnQgZGlhZ25vc3RpY3MuXG4gICAgY29uc3QgZXJyb3JzID0gZGlhZ25vc3RpY3NcbiAgICAgIC5maWx0ZXIoKGRpYWcpID0+IGRpYWcuY2F0ZWdvcnkgPT09IHRzLkRpYWdub3N0aWNDYXRlZ29yeS5FcnJvcik7XG4gICAgY29uc3Qgd2FybmluZ3MgPSBkaWFnbm9zdGljc1xuICAgICAgLmZpbHRlcigoZGlhZykgPT4gZGlhZy5jYXRlZ29yeSA9PT0gdHMuRGlhZ25vc3RpY0NhdGVnb3J5Lldhcm5pbmcpO1xuXG4gICAgaWYgKGVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gZm9ybWF0RGlhZ25vc3RpY3MoZXJyb3JzKTtcbiAgICAgIHRoaXMuX2Vycm9ycy5wdXNoKG5ldyBFcnJvcihtZXNzYWdlKSk7XG4gICAgfVxuXG4gICAgaWYgKHdhcm5pbmdzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBmb3JtYXREaWFnbm9zdGljcyh3YXJuaW5ncyk7XG4gICAgICB0aGlzLl93YXJuaW5ncy5wdXNoKG1lc3NhZ2UpO1xuICAgIH1cblxuICAgIHRoaXMuX2VtaXRTa2lwcGVkID0gIWVtaXRSZXN1bHQgfHwgZW1pdFJlc3VsdC5lbWl0U2tpcHBlZDtcblxuICAgIC8vIFJlc2V0IGNoYW5nZWQgZmlsZXMgb24gc3VjY2Vzc2Z1bCBjb21waWxhdGlvbi5cbiAgICBpZiAoIXRoaXMuX2VtaXRTa2lwcGVkICYmIHRoaXMuX2Vycm9ycy5sZW5ndGggPT09IDApIHtcbiAgICAgIHRoaXMuX2NvbXBpbGVySG9zdC5yZXNldENoYW5nZWRGaWxlVHJhY2tlcigpO1xuICAgIH1cbiAgICB0aW1lRW5kKCdBbmd1bGFyQ29tcGlsZXJQbHVnaW4uX3VwZGF0ZScpO1xuICB9XG5cbiAgd3JpdGVJMThuT3V0RmlsZSgpIHtcbiAgICBmdW5jdGlvbiBfcmVjdXJzaXZlTWtEaXIocDogc3RyaW5nKSB7XG4gICAgICBpZiAoIWZzLmV4aXN0c1N5bmMocCkpIHtcbiAgICAgICAgX3JlY3Vyc2l2ZU1rRGlyKHBhdGguZGlybmFtZShwKSk7XG4gICAgICAgIGZzLm1rZGlyU3luYyhwKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBXcml0ZSB0aGUgZXh0cmFjdGVkIG1lc3NhZ2VzIHRvIGRpc2suXG4gICAgaWYgKHRoaXMuX2NvbXBpbGVyT3B0aW9ucy5pMThuT3V0RmlsZSkge1xuICAgICAgY29uc3QgaTE4bk91dEZpbGVQYXRoID0gcGF0aC5yZXNvbHZlKHRoaXMuX2Jhc2VQYXRoLCB0aGlzLl9jb21waWxlck9wdGlvbnMuaTE4bk91dEZpbGUpO1xuICAgICAgY29uc3QgaTE4bk91dEZpbGVDb250ZW50ID0gdGhpcy5fY29tcGlsZXJIb3N0LnJlYWRGaWxlKGkxOG5PdXRGaWxlUGF0aCk7XG4gICAgICBpZiAoaTE4bk91dEZpbGVDb250ZW50KSB7XG4gICAgICAgIF9yZWN1cnNpdmVNa0RpcihwYXRoLmRpcm5hbWUoaTE4bk91dEZpbGVQYXRoKSk7XG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMoaTE4bk91dEZpbGVQYXRoLCBpMThuT3V0RmlsZUNvbnRlbnQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGdldENvbXBpbGVkRmlsZShmaWxlTmFtZTogc3RyaW5nKSB7XG4gICAgY29uc3Qgb3V0cHV0RmlsZSA9IGZpbGVOYW1lLnJlcGxhY2UoLy50c3g/JC8sICcuanMnKTtcbiAgICBsZXQgb3V0cHV0VGV4dDogc3RyaW5nO1xuICAgIGxldCBzb3VyY2VNYXA6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICBsZXQgZXJyb3JEZXBlbmRlbmNpZXM6IHN0cmluZ1tdID0gW107XG5cbiAgICBpZiAodGhpcy5fZW1pdFNraXBwZWQpIHtcbiAgICAgIGNvbnN0IHRleHQgPSB0aGlzLl9jb21waWxlckhvc3QucmVhZEZpbGUob3V0cHV0RmlsZSk7XG4gICAgICBpZiAodGV4dCkge1xuICAgICAgICAvLyBJZiB0aGUgY29tcGlsYXRpb24gZGlkbid0IGVtaXQgZmlsZXMgdGhpcyB0aW1lLCB0cnkgdG8gcmV0dXJuIHRoZSBjYWNoZWQgZmlsZXMgZnJvbSB0aGVcbiAgICAgICAgLy8gbGFzdCBjb21waWxhdGlvbiBhbmQgbGV0IHRoZSBjb21waWxhdGlvbiBlcnJvcnMgc2hvdyB3aGF0J3Mgd3JvbmcuXG4gICAgICAgIG91dHB1dFRleHQgPSB0ZXh0O1xuICAgICAgICBzb3VyY2VNYXAgPSB0aGlzLl9jb21waWxlckhvc3QucmVhZEZpbGUob3V0cHV0RmlsZSArICcubWFwJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBUaGVyZSdzIG5vdGhpbmcgd2UgY2FuIHNlcnZlLiBSZXR1cm4gYW4gZW1wdHkgc3RyaW5nIHRvIHByZXZlbnQgbGVuZ2h0eSB3ZWJwYWNrIGVycm9ycyxcbiAgICAgICAgLy8gYWRkIHRoZSByZWJ1aWxkIHdhcm5pbmcgaWYgaXQncyBub3QgdGhlcmUgeWV0LlxuICAgICAgICAvLyBXZSBhbHNvIG5lZWQgdG8gYWxsIGNoYW5nZWQgZmlsZXMgYXMgZGVwZW5kZW5jaWVzIG9mIHRoaXMgZmlsZSwgc28gdGhhdCBhbGwgb2YgdGhlbVxuICAgICAgICAvLyB3aWxsIGJlIHdhdGNoZWQgYW5kIHRyaWdnZXIgYSByZWJ1aWxkIG5leHQgdGltZS5cbiAgICAgICAgb3V0cHV0VGV4dCA9ICcnO1xuICAgICAgICBlcnJvckRlcGVuZGVuY2llcyA9IHRoaXMuX2dldENoYW5nZWRDb21waWxhdGlvbkZpbGVzKClcbiAgICAgICAgICAvLyBUaGVzZSBwYXRocyBhcmUgdXNlZCBieSB0aGUgbG9hZGVyIHNvIHdlIG11c3QgZGVub3JtYWxpemUgdGhlbS5cbiAgICAgICAgICAubWFwKChwKSA9PiB0aGlzLl9jb21waWxlckhvc3QuZGVub3JtYWxpemVQYXRoKHApKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gQ2hlY2sgaWYgdGhlIFRTIGlucHV0IGZpbGUgYW5kIHRoZSBKUyBvdXRwdXQgZmlsZSBleGlzdC5cbiAgICAgIGlmICgoKGZpbGVOYW1lLmVuZHNXaXRoKCcudHMnKSB8fCBmaWxlTmFtZS5lbmRzV2l0aCgnLnRzeCcpKVxuICAgICAgICAmJiAhdGhpcy5fY29tcGlsZXJIb3N0LmZpbGVFeGlzdHMoZmlsZU5hbWUpKVxuICAgICAgICB8fCAhdGhpcy5fY29tcGlsZXJIb3N0LmZpbGVFeGlzdHMob3V0cHV0RmlsZSwgZmFsc2UpKSB7XG4gICAgICAgIGxldCBtc2cgPSBgJHtmaWxlTmFtZX0gaXMgbWlzc2luZyBmcm9tIHRoZSBUeXBlU2NyaXB0IGNvbXBpbGF0aW9uLiBgXG4gICAgICAgICAgKyBgUGxlYXNlIG1ha2Ugc3VyZSBpdCBpcyBpbiB5b3VyIHRzY29uZmlnIHZpYSB0aGUgJ2ZpbGVzJyBvciAnaW5jbHVkZScgcHJvcGVydHkuYDtcblxuICAgICAgICBpZiAoLyhcXFxcfFxcLylub2RlX21vZHVsZXMoXFxcXHxcXC8pLy50ZXN0KGZpbGVOYW1lKSkge1xuICAgICAgICAgIG1zZyArPSAnXFxuVGhlIG1pc3NpbmcgZmlsZSBzZWVtcyB0byBiZSBwYXJ0IG9mIGEgdGhpcmQgcGFydHkgbGlicmFyeS4gJ1xuICAgICAgICAgICAgKyAnVFMgZmlsZXMgaW4gcHVibGlzaGVkIGxpYnJhcmllcyBhcmUgb2Z0ZW4gYSBzaWduIG9mIGEgYmFkbHkgcGFja2FnZWQgbGlicmFyeS4gJ1xuICAgICAgICAgICAgKyAnUGxlYXNlIG9wZW4gYW4gaXNzdWUgaW4gdGhlIGxpYnJhcnkgcmVwb3NpdG9yeSB0byBhbGVydCBpdHMgYXV0aG9yIGFuZCBhc2sgdGhlbSAnXG4gICAgICAgICAgICArICd0byBwYWNrYWdlIHRoZSBsaWJyYXJ5IHVzaW5nIHRoZSBBbmd1bGFyIFBhY2thZ2UgRm9ybWF0IChodHRwczovL2dvby5nbC9qQjNHVnYpLic7XG4gICAgICAgIH1cblxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IobXNnKTtcbiAgICAgIH1cblxuICAgICAgb3V0cHV0VGV4dCA9IHRoaXMuX2NvbXBpbGVySG9zdC5yZWFkRmlsZShvdXRwdXRGaWxlKSB8fCAnJztcbiAgICAgIHNvdXJjZU1hcCA9IHRoaXMuX2NvbXBpbGVySG9zdC5yZWFkRmlsZShvdXRwdXRGaWxlICsgJy5tYXAnKTtcbiAgICB9XG5cbiAgICByZXR1cm4geyBvdXRwdXRUZXh0LCBzb3VyY2VNYXAsIGVycm9yRGVwZW5kZW5jaWVzIH07XG4gIH1cblxuICBnZXREZXBlbmRlbmNpZXMoZmlsZU5hbWU6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgICBjb25zdCByZXNvbHZlZEZpbGVOYW1lID0gdGhpcy5fY29tcGlsZXJIb3N0LnJlc29sdmUoZmlsZU5hbWUpO1xuICAgIGNvbnN0IHNvdXJjZUZpbGUgPSB0aGlzLl9jb21waWxlckhvc3QuZ2V0U291cmNlRmlsZShyZXNvbHZlZEZpbGVOYW1lLCB0cy5TY3JpcHRUYXJnZXQuTGF0ZXN0KTtcbiAgICBpZiAoIXNvdXJjZUZpbGUpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBjb25zdCBvcHRpb25zID0gdGhpcy5fY29tcGlsZXJPcHRpb25zO1xuICAgIGNvbnN0IGhvc3QgPSB0aGlzLl9jb21waWxlckhvc3Q7XG4gICAgY29uc3QgY2FjaGUgPSB0aGlzLl9tb2R1bGVSZXNvbHV0aW9uQ2FjaGU7XG5cbiAgICBjb25zdCBlc0ltcG9ydHMgPSBjb2xsZWN0RGVlcE5vZGVzPHRzLkltcG9ydERlY2xhcmF0aW9uPihzb3VyY2VGaWxlLFxuICAgICAgdHMuU3ludGF4S2luZC5JbXBvcnREZWNsYXJhdGlvbilcbiAgICAgIC5tYXAoZGVjbCA9PiB7XG4gICAgICAgIGNvbnN0IG1vZHVsZU5hbWUgPSAoZGVjbC5tb2R1bGVTcGVjaWZpZXIgYXMgdHMuU3RyaW5nTGl0ZXJhbCkudGV4dDtcbiAgICAgICAgY29uc3QgcmVzb2x2ZWQgPSB0cy5yZXNvbHZlTW9kdWxlTmFtZShtb2R1bGVOYW1lLCByZXNvbHZlZEZpbGVOYW1lLCBvcHRpb25zLCBob3N0LCBjYWNoZSk7XG5cbiAgICAgICAgaWYgKHJlc29sdmVkLnJlc29sdmVkTW9kdWxlKSB7XG4gICAgICAgICAgcmV0dXJuIHJlc29sdmVkLnJlc29sdmVkTW9kdWxlLnJlc29sdmVkRmlsZU5hbWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAuZmlsdGVyKHggPT4geCk7XG5cbiAgICBjb25zdCByZXNvdXJjZUltcG9ydHMgPSBmaW5kUmVzb3VyY2VzKHNvdXJjZUZpbGUpXG4gICAgICAubWFwKHJlc291cmNlUGF0aCA9PiByZXNvbHZlKGRpcm5hbWUocmVzb2x2ZWRGaWxlTmFtZSksIG5vcm1hbGl6ZShyZXNvdXJjZVBhdGgpKSk7XG5cbiAgICAvLyBUaGVzZSBwYXRocyBhcmUgbWVhbnQgdG8gYmUgdXNlZCBieSB0aGUgbG9hZGVyIHNvIHdlIG11c3QgZGVub3JtYWxpemUgdGhlbS5cbiAgICBjb25zdCB1bmlxdWVEZXBlbmRlbmNpZXMgPSBuZXcgU2V0KFtcbiAgICAgIC4uLmVzSW1wb3J0cyxcbiAgICAgIC4uLnJlc291cmNlSW1wb3J0cyxcbiAgICAgIC4uLnRoaXMuZ2V0UmVzb3VyY2VEZXBlbmRlbmNpZXModGhpcy5fY29tcGlsZXJIb3N0LmRlbm9ybWFsaXplUGF0aChyZXNvbHZlZEZpbGVOYW1lKSksXG4gICAgXS5tYXAoKHApID0+IHAgJiYgdGhpcy5fY29tcGlsZXJIb3N0LmRlbm9ybWFsaXplUGF0aChwKSkpO1xuXG4gICAgcmV0dXJuIFsuLi51bmlxdWVEZXBlbmRlbmNpZXNdXG4gICAgICAuZmlsdGVyKHggPT4gISF4KSBhcyBzdHJpbmdbXTtcbiAgfVxuXG4gIGdldFJlc291cmNlRGVwZW5kZW5jaWVzKGZpbGVOYW1lOiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gICAgaWYgKCF0aGlzLl9yZXNvdXJjZUxvYWRlcikge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9yZXNvdXJjZUxvYWRlci5nZXRSZXNvdXJjZURlcGVuZGVuY2llcyhmaWxlTmFtZSk7XG4gIH1cblxuICAvLyBUaGlzIGNvZGUgbW9zdGx5IGNvbWVzIGZyb20gYHBlcmZvcm1Db21waWxhdGlvbmAgaW4gYEBhbmd1bGFyL2NvbXBpbGVyLWNsaWAuXG4gIC8vIEl0IHNraXBzIHRoZSBwcm9ncmFtIGNyZWF0aW9uIGJlY2F1c2Ugd2UgbmVlZCB0byB1c2UgYGxvYWROZ1N0cnVjdHVyZUFzeW5jKClgLFxuICAvLyBhbmQgdXNlcyBDdXN0b21UcmFuc2Zvcm1lcnMuXG4gIHByaXZhdGUgX2VtaXQoKSB7XG4gICAgdGltZSgnQW5ndWxhckNvbXBpbGVyUGx1Z2luLl9lbWl0Jyk7XG4gICAgY29uc3QgcHJvZ3JhbSA9IHRoaXMuX3Byb2dyYW07XG4gICAgY29uc3QgYWxsRGlhZ25vc3RpY3M6IEFycmF5PHRzLkRpYWdub3N0aWMgfCBEaWFnbm9zdGljPiA9IFtdO1xuICAgIGNvbnN0IGRpYWdNb2RlID0gKHRoaXMuX2ZpcnN0UnVuIHx8ICF0aGlzLl9mb3JrVHlwZUNoZWNrZXIpID9cbiAgICAgIERpYWdub3N0aWNNb2RlLkFsbCA6IERpYWdub3N0aWNNb2RlLlN5bnRhY3RpYztcblxuICAgIGxldCBlbWl0UmVzdWx0OiB0cy5FbWl0UmVzdWx0IHwgdW5kZWZpbmVkO1xuICAgIHRyeSB7XG4gICAgICBpZiAodGhpcy5fSml0TW9kZSkge1xuICAgICAgICBjb25zdCB0c1Byb2dyYW0gPSBwcm9ncmFtIGFzIHRzLlByb2dyYW07XG4gICAgICAgIGNvbnN0IGNoYW5nZWRUc0ZpbGVzID0gbmV3IFNldDxzdHJpbmc+KCk7XG5cbiAgICAgICAgaWYgKHRoaXMuX2ZpcnN0UnVuKSB7XG4gICAgICAgICAgLy8gQ2hlY2sgcGFyYW1ldGVyIGRpYWdub3N0aWNzLlxuICAgICAgICAgIHRpbWUoJ0FuZ3VsYXJDb21waWxlclBsdWdpbi5fZW1pdC50cy5nZXRPcHRpb25zRGlhZ25vc3RpY3MnKTtcbiAgICAgICAgICBhbGxEaWFnbm9zdGljcy5wdXNoKC4uLnRzUHJvZ3JhbS5nZXRPcHRpb25zRGlhZ25vc3RpY3MoKSk7XG4gICAgICAgICAgdGltZUVuZCgnQW5ndWxhckNvbXBpbGVyUGx1Z2luLl9lbWl0LnRzLmdldE9wdGlvbnNEaWFnbm9zdGljcycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIGdlbmVyYXRlIGEgbGlzdCBvZiBjaGFuZ2VkIGZpbGVzIGZvciBlbWl0XG4gICAgICAgICAgLy8gbm90IG5lZWRlZCBvbiBmaXJzdCBydW4gc2luY2UgYSBmdWxsIHByb2dyYW0gZW1pdCBpcyByZXF1aXJlZFxuICAgICAgICAgIGZvciAoY29uc3QgY2hhbmdlZEZpbGUgb2YgdGhpcy5fY29tcGlsZXJIb3N0LmdldENoYW5nZWRGaWxlUGF0aHMoKSkge1xuICAgICAgICAgICAgaWYgKCEvLih0c3h8dHN8anNvbnxqcykkLy50ZXN0KGNoYW5nZWRGaWxlKSkge1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGV4aXN0aW5nIHR5cGUgZGVmaW5pdGlvbnMgYXJlIG5vdCBlbWl0dGVkXG4gICAgICAgICAgICBpZiAoY2hhbmdlZEZpbGUuZW5kc1dpdGgoJy5kLnRzJykpIHtcbiAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjaGFuZ2VkVHNGaWxlcy5hZGQoY2hhbmdlZEZpbGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGFsbERpYWdub3N0aWNzLnB1c2goLi4uZ2F0aGVyRGlhZ25vc3RpY3ModHNQcm9ncmFtLCB0aGlzLl9KaXRNb2RlLFxuICAgICAgICAgICdBbmd1bGFyQ29tcGlsZXJQbHVnaW4uX2VtaXQudHMnLCBkaWFnTW9kZSkpO1xuXG4gICAgICAgIGlmICghaGFzRXJyb3JzKGFsbERpYWdub3N0aWNzKSkge1xuICAgICAgICAgIGlmICh0aGlzLl9maXJzdFJ1biB8fCBjaGFuZ2VkVHNGaWxlcy5zaXplID4gMjApIHtcbiAgICAgICAgICAgIGVtaXRSZXN1bHQgPSB0c1Byb2dyYW0uZW1pdChcbiAgICAgICAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICAgICAgICB1bmRlZmluZWQsXG4gICAgICAgICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICAgICAgICB7IGJlZm9yZTogdGhpcy5fdHJhbnNmb3JtZXJzIH0sXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgYWxsRGlhZ25vc3RpY3MucHVzaCguLi5lbWl0UmVzdWx0LmRpYWdub3N0aWNzKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yIChjb25zdCBjaGFuZ2VkRmlsZSBvZiBjaGFuZ2VkVHNGaWxlcykge1xuICAgICAgICAgICAgICBjb25zdCBzb3VyY2VGaWxlID0gdHNQcm9ncmFtLmdldFNvdXJjZUZpbGUoY2hhbmdlZEZpbGUpO1xuICAgICAgICAgICAgICBpZiAoIXNvdXJjZUZpbGUpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGNvbnN0IHRpbWVMYWJlbCA9IGBBbmd1bGFyQ29tcGlsZXJQbHVnaW4uX2VtaXQudHMrJHtzb3VyY2VGaWxlLmZpbGVOYW1lfSsuZW1pdGA7XG4gICAgICAgICAgICAgIHRpbWUodGltZUxhYmVsKTtcbiAgICAgICAgICAgICAgZW1pdFJlc3VsdCA9IHRzUHJvZ3JhbS5lbWl0KHNvdXJjZUZpbGUsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgeyBiZWZvcmU6IHRoaXMuX3RyYW5zZm9ybWVycyB9LFxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICBhbGxEaWFnbm9zdGljcy5wdXNoKC4uLmVtaXRSZXN1bHQuZGlhZ25vc3RpY3MpO1xuICAgICAgICAgICAgICB0aW1lRW5kKHRpbWVMYWJlbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBhbmd1bGFyUHJvZ3JhbSA9IHByb2dyYW0gYXMgUHJvZ3JhbTtcblxuICAgICAgICAvLyBDaGVjayBBbmd1bGFyIHN0cnVjdHVyYWwgZGlhZ25vc3RpY3MuXG4gICAgICAgIHRpbWUoJ0FuZ3VsYXJDb21waWxlclBsdWdpbi5fZW1pdC5uZy5nZXROZ1N0cnVjdHVyYWxEaWFnbm9zdGljcycpO1xuICAgICAgICBhbGxEaWFnbm9zdGljcy5wdXNoKC4uLmFuZ3VsYXJQcm9ncmFtLmdldE5nU3RydWN0dXJhbERpYWdub3N0aWNzKCkpO1xuICAgICAgICB0aW1lRW5kKCdBbmd1bGFyQ29tcGlsZXJQbHVnaW4uX2VtaXQubmcuZ2V0TmdTdHJ1Y3R1cmFsRGlhZ25vc3RpY3MnKTtcblxuICAgICAgICBpZiAodGhpcy5fZmlyc3RSdW4pIHtcbiAgICAgICAgICAvLyBDaGVjayBUeXBlU2NyaXB0IHBhcmFtZXRlciBkaWFnbm9zdGljcy5cbiAgICAgICAgICB0aW1lKCdBbmd1bGFyQ29tcGlsZXJQbHVnaW4uX2VtaXQubmcuZ2V0VHNPcHRpb25EaWFnbm9zdGljcycpO1xuICAgICAgICAgIGFsbERpYWdub3N0aWNzLnB1c2goLi4uYW5ndWxhclByb2dyYW0uZ2V0VHNPcHRpb25EaWFnbm9zdGljcygpKTtcbiAgICAgICAgICB0aW1lRW5kKCdBbmd1bGFyQ29tcGlsZXJQbHVnaW4uX2VtaXQubmcuZ2V0VHNPcHRpb25EaWFnbm9zdGljcycpO1xuXG4gICAgICAgICAgLy8gQ2hlY2sgQW5ndWxhciBwYXJhbWV0ZXIgZGlhZ25vc3RpY3MuXG4gICAgICAgICAgdGltZSgnQW5ndWxhckNvbXBpbGVyUGx1Z2luLl9lbWl0Lm5nLmdldE5nT3B0aW9uRGlhZ25vc3RpY3MnKTtcbiAgICAgICAgICBhbGxEaWFnbm9zdGljcy5wdXNoKC4uLmFuZ3VsYXJQcm9ncmFtLmdldE5nT3B0aW9uRGlhZ25vc3RpY3MoKSk7XG4gICAgICAgICAgdGltZUVuZCgnQW5ndWxhckNvbXBpbGVyUGx1Z2luLl9lbWl0Lm5nLmdldE5nT3B0aW9uRGlhZ25vc3RpY3MnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFsbERpYWdub3N0aWNzLnB1c2goLi4uZ2F0aGVyRGlhZ25vc3RpY3MoYW5ndWxhclByb2dyYW0sIHRoaXMuX0ppdE1vZGUsXG4gICAgICAgICAgJ0FuZ3VsYXJDb21waWxlclBsdWdpbi5fZW1pdC5uZycsIGRpYWdNb2RlKSk7XG5cbiAgICAgICAgaWYgKCFoYXNFcnJvcnMoYWxsRGlhZ25vc3RpY3MpKSB7XG4gICAgICAgICAgdGltZSgnQW5ndWxhckNvbXBpbGVyUGx1Z2luLl9lbWl0Lm5nLmVtaXQnKTtcbiAgICAgICAgICBjb25zdCBleHRyYWN0STE4biA9ICEhdGhpcy5fY29tcGlsZXJPcHRpb25zLmkxOG5PdXRGaWxlO1xuICAgICAgICAgIGNvbnN0IGVtaXRGbGFncyA9IGV4dHJhY3RJMThuID8gRW1pdEZsYWdzLkkxOG5CdW5kbGUgOiBFbWl0RmxhZ3MuRGVmYXVsdDtcbiAgICAgICAgICBlbWl0UmVzdWx0ID0gYW5ndWxhclByb2dyYW0uZW1pdCh7XG4gICAgICAgICAgICBlbWl0RmxhZ3MsIGN1c3RvbVRyYW5zZm9ybWVyczoge1xuICAgICAgICAgICAgICBiZWZvcmVUczogdGhpcy5fdHJhbnNmb3JtZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBhbGxEaWFnbm9zdGljcy5wdXNoKC4uLmVtaXRSZXN1bHQuZGlhZ25vc3RpY3MpO1xuICAgICAgICAgIGlmIChleHRyYWN0STE4bikge1xuICAgICAgICAgICAgdGhpcy53cml0ZUkxOG5PdXRGaWxlKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRpbWVFbmQoJ0FuZ3VsYXJDb21waWxlclBsdWdpbi5fZW1pdC5uZy5lbWl0Jyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aW1lKCdBbmd1bGFyQ29tcGlsZXJQbHVnaW4uX2VtaXQuY2F0Y2gnKTtcbiAgICAgIC8vIFRoaXMgZnVuY3Rpb24gaXMgYXZhaWxhYmxlIGluIHRoZSBpbXBvcnQgYmVsb3csIGJ1dCB0aGlzIHdheSB3ZSBhdm9pZCB0aGUgZGVwZW5kZW5jeS5cbiAgICAgIC8vIGltcG9ydCB7IGlzU3ludGF4RXJyb3IgfSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG4gICAgICBmdW5jdGlvbiBpc1N5bnRheEVycm9yKGVycm9yOiBFcnJvcik6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gKGVycm9yIGFzIGFueSlbJ25nU3ludGF4RXJyb3InXTsgIC8vIHRzbGludDpkaXNhYmxlLWxpbmU6bm8tYW55XG4gICAgICB9XG5cbiAgICAgIGxldCBlcnJNc2c6IHN0cmluZztcbiAgICAgIGxldCBjb2RlOiBudW1iZXI7XG4gICAgICBpZiAoaXNTeW50YXhFcnJvcihlKSkge1xuICAgICAgICAvLyBkb24ndCByZXBvcnQgdGhlIHN0YWNrIGZvciBzeW50YXggZXJyb3JzIGFzIHRoZXkgYXJlIHdlbGwga25vd24gZXJyb3JzLlxuICAgICAgICBlcnJNc2cgPSBlLm1lc3NhZ2U7XG4gICAgICAgIGNvZGUgPSBERUZBVUxUX0VSUk9SX0NPREU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlcnJNc2cgPSBlLnN0YWNrO1xuICAgICAgICAvLyBJdCBpcyBub3QgYSBzeW50YXggZXJyb3Igd2UgbWlnaHQgaGF2ZSBhIHByb2dyYW0gd2l0aCB1bmtub3duIHN0YXRlLCBkaXNjYXJkIGl0LlxuICAgICAgICB0aGlzLl9wcm9ncmFtID0gbnVsbDtcbiAgICAgICAgY29kZSA9IFVOS05PV05fRVJST1JfQ09ERTtcbiAgICAgIH1cbiAgICAgIGFsbERpYWdub3N0aWNzLnB1c2goXG4gICAgICAgIHsgY2F0ZWdvcnk6IHRzLkRpYWdub3N0aWNDYXRlZ29yeS5FcnJvciwgbWVzc2FnZVRleHQ6IGVyck1zZywgY29kZSwgc291cmNlOiBTT1VSQ0UgfSk7XG4gICAgICB0aW1lRW5kKCdBbmd1bGFyQ29tcGlsZXJQbHVnaW4uX2VtaXQuY2F0Y2gnKTtcbiAgICB9XG4gICAgdGltZUVuZCgnQW5ndWxhckNvbXBpbGVyUGx1Z2luLl9lbWl0Jyk7XG5cbiAgICByZXR1cm4geyBwcm9ncmFtLCBlbWl0UmVzdWx0LCBkaWFnbm9zdGljczogYWxsRGlhZ25vc3RpY3MgfTtcbiAgfVxuXG4gIHByaXZhdGUgX3ZhbGlkYXRlTG9jYWxlKGxvY2FsZTogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgLy8gR2V0IHRoZSBwYXRoIG9mIHRoZSBjb21tb24gbW9kdWxlLlxuICAgIGNvbnN0IGNvbW1vblBhdGggPSBwYXRoLmRpcm5hbWUocmVxdWlyZS5yZXNvbHZlKCdAYW5ndWxhci9jb21tb24vcGFja2FnZS5qc29uJykpO1xuICAgIC8vIENoZWNrIGlmIHRoZSBsb2NhbGUgZmlsZSBleGlzdHNcbiAgICBpZiAoIWZzLmV4aXN0c1N5bmMocGF0aC5yZXNvbHZlKGNvbW1vblBhdGgsICdsb2NhbGVzJywgYCR7bG9jYWxlfS5qc2ApKSkge1xuICAgICAgLy8gQ2hlY2sgZm9yIGFuIGFsdGVybmF0aXZlIGxvY2FsZSAoaWYgdGhlIGxvY2FsZSBpZCB3YXMgYmFkbHkgZm9ybWF0dGVkKS5cbiAgICAgIGNvbnN0IGxvY2FsZXMgPSBmcy5yZWFkZGlyU3luYyhwYXRoLnJlc29sdmUoY29tbW9uUGF0aCwgJ2xvY2FsZXMnKSlcbiAgICAgICAgLmZpbHRlcihmaWxlID0+IGZpbGUuZW5kc1dpdGgoJy5qcycpKVxuICAgICAgICAubWFwKGZpbGUgPT4gZmlsZS5yZXBsYWNlKCcuanMnLCAnJykpO1xuXG4gICAgICBsZXQgbmV3TG9jYWxlO1xuICAgICAgY29uc3Qgbm9ybWFsaXplZExvY2FsZSA9IGxvY2FsZS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL18vZywgJy0nKTtcbiAgICAgIGZvciAoY29uc3QgbCBvZiBsb2NhbGVzKSB7XG4gICAgICAgIGlmIChsLnRvTG93ZXJDYXNlKCkgPT09IG5vcm1hbGl6ZWRMb2NhbGUpIHtcbiAgICAgICAgICBuZXdMb2NhbGUgPSBsO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChuZXdMb2NhbGUpIHtcbiAgICAgICAgbG9jYWxlID0gbmV3TG9jYWxlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQ2hlY2sgZm9yIGEgcGFyZW50IGxvY2FsZVxuICAgICAgICBjb25zdCBwYXJlbnRMb2NhbGUgPSBub3JtYWxpemVkTG9jYWxlLnNwbGl0KCctJylbMF07XG4gICAgICAgIGlmIChsb2NhbGVzLmluZGV4T2YocGFyZW50TG9jYWxlKSAhPT0gLTEpIHtcbiAgICAgICAgICBsb2NhbGUgPSBwYXJlbnRMb2NhbGU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fd2FybmluZ3MucHVzaChgQW5ndWxhckNvbXBpbGVyUGx1Z2luOiBVbmFibGUgdG8gbG9hZCB0aGUgbG9jYWxlIGRhdGEgZmlsZSBgICtcbiAgICAgICAgICAgIGBcIkBhbmd1bGFyL2NvbW1vbi9sb2NhbGVzLyR7bG9jYWxlfVwiLCBgICtcbiAgICAgICAgICAgIGBwbGVhc2UgY2hlY2sgdGhhdCBcIiR7bG9jYWxlfVwiIGlzIGEgdmFsaWQgbG9jYWxlIGlkLlxuICAgICAgICAgICAgSWYgbmVlZGVkLCB5b3UgY2FuIHVzZSBcInJlZ2lzdGVyTG9jYWxlRGF0YVwiIG1hbnVhbGx5LmApO1xuXG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbG9jYWxlO1xuICB9XG59XG4iXX0=