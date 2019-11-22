/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Compiler, Inject, InjectionToken, Optional, PACKAGE_ROOT_URL, TRANSLATIONS, isDevMode, ɵConsole as Console, ViewEncapsulation, Injector, TRANSLATIONS_FORMAT, MissingTranslationStrategy, } from '@angular/core';
import { StaticSymbolCache, JitCompiler, ProviderMeta, I18NHtmlParser, ViewCompiler, CompileMetadataResolver, UrlResolver, TemplateParser, NgModuleCompiler, JitSummaryResolver, SummaryResolver, StyleCompiler, PipeResolver, ElementSchemaRegistry, DomElementSchemaRegistry, ResourceLoader, NgModuleResolver, HtmlParser, CompileReflector, CompilerConfig, DirectiveNormalizer, DirectiveResolver, Lexer, Parser } from '@angular/compiler';
import { JitReflector } from './compiler_reflector';
/** @type {?} */
export const ERROR_COLLECTOR_TOKEN = new InjectionToken('ErrorCollector');
/**
 * A default provider for {\@link PACKAGE_ROOT_URL} that maps to '/'.
 * @type {?}
 */
export const DEFAULT_PACKAGE_URL_PROVIDER = {
    provide: PACKAGE_ROOT_URL,
    useValue: '/'
};
/** @type {?} */
const _NO_RESOURCE_LOADER = {
    /**
     * @param {?} url
     * @return {?}
     */
    get(url) {
        throw new Error(`No ResourceLoader implementation has been provided. Can't read the url "${url}"`);
    }
};
/** @type {?} */
const baseHtmlParser = new InjectionToken('HtmlParser');
export class CompilerImpl {
    /**
     * @param {?} injector
     * @param {?} _metadataResolver
     * @param {?} templateParser
     * @param {?} styleCompiler
     * @param {?} viewCompiler
     * @param {?} ngModuleCompiler
     * @param {?} summaryResolver
     * @param {?} compileReflector
     * @param {?} compilerConfig
     * @param {?} console
     */
    constructor(injector, _metadataResolver, templateParser, styleCompiler, viewCompiler, ngModuleCompiler, summaryResolver, compileReflector, compilerConfig, console) {
        this._metadataResolver = _metadataResolver;
        this._delegate = new JitCompiler(_metadataResolver, templateParser, styleCompiler, viewCompiler, ngModuleCompiler, summaryResolver, compileReflector, compilerConfig, console, this.getExtraNgModuleProviders.bind(this));
        this.injector = injector;
    }
    /**
     * @private
     * @return {?}
     */
    getExtraNgModuleProviders() {
        return [this._metadataResolver.getProviderMetadata(new ProviderMeta(Compiler, { useValue: this }))];
    }
    /**
     * @template T
     * @param {?} moduleType
     * @return {?}
     */
    compileModuleSync(moduleType) {
        return (/** @type {?} */ (this._delegate.compileModuleSync(moduleType)));
    }
    /**
     * @template T
     * @param {?} moduleType
     * @return {?}
     */
    compileModuleAsync(moduleType) {
        return (/** @type {?} */ (this._delegate.compileModuleAsync(moduleType)));
    }
    /**
     * @template T
     * @param {?} moduleType
     * @return {?}
     */
    compileModuleAndAllComponentsSync(moduleType) {
        /** @type {?} */
        const result = this._delegate.compileModuleAndAllComponentsSync(moduleType);
        return {
            ngModuleFactory: (/** @type {?} */ (result.ngModuleFactory)),
            componentFactories: (/** @type {?} */ (result.componentFactories)),
        };
    }
    /**
     * @template T
     * @param {?} moduleType
     * @return {?}
     */
    compileModuleAndAllComponentsAsync(moduleType) {
        return this._delegate.compileModuleAndAllComponentsAsync(moduleType)
            .then((result) => ({
            ngModuleFactory: (/** @type {?} */ (result.ngModuleFactory)),
            componentFactories: (/** @type {?} */ (result.componentFactories)),
        }));
    }
    /**
     * @param {?} summaries
     * @return {?}
     */
    loadAotSummaries(summaries) { this._delegate.loadAotSummaries(summaries); }
    /**
     * @param {?} ref
     * @return {?}
     */
    hasAotSummary(ref) { return this._delegate.hasAotSummary(ref); }
    /**
     * @template T
     * @param {?} component
     * @return {?}
     */
    getComponentFactory(component) {
        return (/** @type {?} */ (this._delegate.getComponentFactory(component)));
    }
    /**
     * @return {?}
     */
    clearCache() { this._delegate.clearCache(); }
    /**
     * @param {?} type
     * @return {?}
     */
    clearCacheFor(type) { this._delegate.clearCacheFor(type); }
    /**
     * @param {?} moduleType
     * @return {?}
     */
    getModuleId(moduleType) {
        /** @type {?} */
        const meta = this._metadataResolver.getNgModuleMetadata(moduleType);
        return meta && meta.id || undefined;
    }
}
if (false) {
    /**
     * @type {?}
     * @private
     */
    CompilerImpl.prototype._delegate;
    /** @type {?} */
    CompilerImpl.prototype.injector;
    /**
     * @type {?}
     * @private
     */
    CompilerImpl.prototype._metadataResolver;
}
/**
 * A set of providers that provide `JitCompiler` and its dependencies to use for
 * template compilation.
 * @type {?}
 */
export const COMPILER_PROVIDERS = (/** @type {?} */ ([
    { provide: CompileReflector, useValue: new JitReflector() },
    { provide: ResourceLoader, useValue: _NO_RESOURCE_LOADER },
    { provide: JitSummaryResolver, deps: [] },
    { provide: SummaryResolver, useExisting: JitSummaryResolver },
    { provide: Console, deps: [] },
    { provide: Lexer, deps: [] },
    { provide: Parser, deps: [Lexer] },
    {
        provide: baseHtmlParser,
        useClass: HtmlParser,
        deps: [],
    },
    {
        provide: I18NHtmlParser,
        useFactory: (parser, translations, format, config, console) => {
            translations = translations || '';
            /** @type {?} */
            const missingTranslation = translations ? (/** @type {?} */ (config.missingTranslation)) : MissingTranslationStrategy.Ignore;
            return new I18NHtmlParser(parser, translations, format, missingTranslation, console);
        },
        deps: [
            baseHtmlParser,
            [new Optional(), new Inject(TRANSLATIONS)],
            [new Optional(), new Inject(TRANSLATIONS_FORMAT)],
            [CompilerConfig],
            [Console],
        ]
    },
    {
        provide: HtmlParser,
        useExisting: I18NHtmlParser,
    },
    {
        provide: TemplateParser, deps: [CompilerConfig, CompileReflector,
            Parser, ElementSchemaRegistry,
            I18NHtmlParser, Console]
    },
    { provide: DirectiveNormalizer, deps: [ResourceLoader, UrlResolver, HtmlParser, CompilerConfig] },
    { provide: CompileMetadataResolver, deps: [CompilerConfig, HtmlParser, NgModuleResolver,
            DirectiveResolver, PipeResolver,
            SummaryResolver,
            ElementSchemaRegistry,
            DirectiveNormalizer, Console,
            [Optional, StaticSymbolCache],
            CompileReflector,
            [Optional, ERROR_COLLECTOR_TOKEN]] },
    DEFAULT_PACKAGE_URL_PROVIDER,
    { provide: StyleCompiler, deps: [UrlResolver] },
    { provide: ViewCompiler, deps: [CompileReflector] },
    { provide: NgModuleCompiler, deps: [CompileReflector] },
    { provide: CompilerConfig, useValue: new CompilerConfig() },
    { provide: Compiler, useClass: CompilerImpl, deps: [Injector, CompileMetadataResolver,
            TemplateParser, StyleCompiler,
            ViewCompiler, NgModuleCompiler,
            SummaryResolver, CompileReflector, CompilerConfig,
            Console] },
    { provide: DomElementSchemaRegistry, deps: [] },
    { provide: ElementSchemaRegistry, useExisting: DomElementSchemaRegistry },
    { provide: UrlResolver, deps: [PACKAGE_ROOT_URL] },
    { provide: DirectiveResolver, deps: [CompileReflector] },
    { provide: PipeResolver, deps: [CompileReflector] },
    { provide: NgModuleResolver, deps: [CompileReflector] },
]));
/**
 * \@publicApi
 */
export class JitCompilerFactory {
    /* @internal */
    /**
     * @param {?} defaultOptions
     */
    constructor(defaultOptions) {
        /** @type {?} */
        const compilerOptions = {
            useJit: true,
            defaultEncapsulation: ViewEncapsulation.Emulated,
            missingTranslation: MissingTranslationStrategy.Warning,
        };
        this._defaultOptions = [compilerOptions, ...defaultOptions];
    }
    /**
     * @param {?=} options
     * @return {?}
     */
    createCompiler(options = []) {
        /** @type {?} */
        const opts = _mergeOptions(this._defaultOptions.concat(options));
        /** @type {?} */
        const injector = Injector.create([
            COMPILER_PROVIDERS, {
                provide: CompilerConfig,
                useFactory: () => {
                    return new CompilerConfig({
                        // let explicit values from the compiler options overwrite options
                        // from the app providers
                        useJit: opts.useJit,
                        jitDevMode: isDevMode(),
                        // let explicit values from the compiler options overwrite options
                        // from the app providers
                        defaultEncapsulation: opts.defaultEncapsulation,
                        missingTranslation: opts.missingTranslation,
                        preserveWhitespaces: opts.preserveWhitespaces,
                    });
                },
                deps: []
            },
            (/** @type {?} */ (opts.providers))
        ]);
        return injector.get(Compiler);
    }
}
if (false) {
    /**
     * @type {?}
     * @private
     */
    JitCompilerFactory.prototype._defaultOptions;
}
/**
 * @param {?} optionsArr
 * @return {?}
 */
function _mergeOptions(optionsArr) {
    return {
        useJit: _lastDefined(optionsArr.map(options => options.useJit)),
        defaultEncapsulation: _lastDefined(optionsArr.map(options => options.defaultEncapsulation)),
        providers: _mergeArrays(optionsArr.map(options => (/** @type {?} */ (options.providers)))),
        missingTranslation: _lastDefined(optionsArr.map(options => options.missingTranslation)),
        preserveWhitespaces: _lastDefined(optionsArr.map(options => options.preserveWhitespaces)),
    };
}
/**
 * @template T
 * @param {?} args
 * @return {?}
 */
function _lastDefined(args) {
    for (let i = args.length - 1; i >= 0; i--) {
        if (args[i] !== undefined) {
            return args[i];
        }
    }
    return undefined;
}
/**
 * @param {?} parts
 * @return {?}
 */
function _mergeArrays(parts) {
    /** @type {?} */
    const result = [];
    parts.forEach((part) => part && result.push(...part));
    return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZXJfZmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3BsYXRmb3JtLWJyb3dzZXItZHluYW1pYy9zcmMvY29tcGlsZXJfZmFjdG9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBQyxRQUFRLEVBQW9GLE1BQU0sRUFBRSxjQUFjLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixFQUErQixZQUFZLEVBQVEsU0FBUyxFQUFnQixRQUFRLElBQUksT0FBTyxFQUFFLGlCQUFpQixFQUFFLFFBQVEsRUFBbUIsbUJBQW1CLEVBQUUsMEJBQTBCLEdBQUUsTUFBTSxlQUFlLENBQUM7QUFFNVcsT0FBTyxFQUFDLGlCQUFpQixFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQXFCLGNBQWMsRUFBZSxZQUFZLEVBQUUsdUJBQXVCLEVBQUUsV0FBVyxFQUFFLGNBQWMsRUFBRSxnQkFBZ0IsRUFBRSxrQkFBa0IsRUFBRSxlQUFlLEVBQUUsYUFBYSxFQUFFLFlBQVksRUFBRSxxQkFBcUIsRUFBRSx3QkFBd0IsRUFBRSxjQUFjLEVBQUUsZ0JBQWdCLEVBQUUsVUFBVSxFQUFFLGdCQUFnQixFQUFFLGNBQWMsRUFBRSxtQkFBbUIsRUFBRSxpQkFBaUIsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFFL2MsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLHNCQUFzQixDQUFDOztBQUVsRCxNQUFNLE9BQU8scUJBQXFCLEdBQUcsSUFBSSxjQUFjLENBQUMsZ0JBQWdCLENBQUM7Ozs7O0FBS3pFLE1BQU0sT0FBTyw0QkFBNEIsR0FBRztJQUMxQyxPQUFPLEVBQUUsZ0JBQWdCO0lBQ3pCLFFBQVEsRUFBRSxHQUFHO0NBQ2Q7O01BRUssbUJBQW1CLEdBQW1COzs7OztJQUMxQyxHQUFHLENBQUMsR0FBVztRQUNYLE1BQU0sSUFBSSxLQUFLLENBQ1gsMkVB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QyxPQUFPLENBQUMsRUFBRSxDQUFDLG1CQUFBLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZFLGtCQUFrQixFQUFFLFlBQVksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDdkYsbUJBQW1CLEVBQUUsWUFBWSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQztLQUMxRixDQUFDO0FBQ0osQ0FBQzs7Ozs7O0FBRUQsU0FBUyxZQUFZLENBQUksSUFBUztJQUNoQyxLQUFLLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDekMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssU0FBUyxFQUFFO1lBQ3pCLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2hCO0tBQ0Y7SUFDRCxPQUFPLFNBQVMsQ0FBQztBQUNuQixDQUFDOzs7OztBQUVELFNBQVMsWUFBWSxDQUFDLEtBQWM7O1VBQzVCLE1BQU0sR0FBVSxFQUFFO0lBQ3hCLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUN0RCxPQUFPLE1BQU0sQ0FBQztBQUNoQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbXBpbGVyLCBDb21waWxlckZhY3RvcnksIENvbXBvbmVudEZhY3RvcnksIENvbXBpbGVyT3B0aW9ucywgTW9kdWxlV2l0aENvbXBvbmVudEZhY3RvcmllcywgSW5qZWN0LCBJbmplY3Rpb25Ub2tlbiwgT3B0aW9uYWwsIFBBQ0tBR0VfUk9PVF9VUkwsIFBsYXRmb3JtUmVmLCBTdGF0aWNQcm92aWRlciwgVFJBTlNMQVRJT05TLCBUeXBlLCBpc0Rldk1vZGUsIHBsYXRmb3JtQ29yZSwgybVDb25zb2xlIGFzIENvbnNvbGUsIFZpZXdFbmNhcHN1bGF0aW9uLCBJbmplY3RvciwgTmdNb2R1bGVGYWN0b3J5LCBUUkFOU0xBVElPTlNfRk9STUFULCBNaXNzaW5nVHJhbnNsYXRpb25TdHJhdGVneSx9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge1N0YXRpY1N5bWJvbENhY2hlLCBKaXRDb21waWxlciwgUHJvdmlkZXJNZXRhLCBFeHRlcm5hbFJlZmVyZW5jZSwgSTE4Tkh0bWxQYXJzZXIsIElkZW50aWZpZXJzLCBWaWV3Q29tcGlsZXIsIENvbXBpbGVNZXRhZGF0YVJlc29sdmVyLCBVcmxSZXNvbHZlciwgVGVtcGxhdGVQYXJzZXIsIE5nTW9kdWxlQ29tcGlsZXIsIEppdFN1bW1hcnlSZXNvbHZlciwgU3VtbWFyeVJlc29sdmVyLCBTdHlsZUNvbXBpbGVyLCBQaXBlUmVzb2x2ZXIsIEVsZW1lbnRTY2hlbWFSZWdpc3RyeSwgRG9tRWxlbWVudFNjaGVtYVJlZ2lzdHJ5LCBSZXNvdXJjZUxvYWRlciwgTmdNb2R1bGVSZXNvbHZlciwgSHRtbFBhcnNlciwgQ29tcGlsZVJlZmxlY3RvciwgQ29tcGlsZXJDb25maWcsIERpcmVjdGl2ZU5vcm1hbGl6ZXIsIERpcmVjdGl2ZVJlc29sdmVyLCBMZXhlciwgUGFyc2VyfSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5cbmltcG9ydCB7Sml0UmVmbGVjdG9yfSBmcm9tICcuL2NvbXBpbGVyX3JlZmxlY3Rvcic7XG5cbmV4cG9ydCBjb25zdCBFUlJPUl9DT0xMRUNUT1JfVE9LRU4gPSBuZXcgSW5qZWN0aW9uVG9rZW4oJ0Vycm9yQ29sbGVjdG9yJyk7XG5cbi8qKlxuICogQSBkZWZhdWx0IHByb3ZpZGVyIGZvciB7QGxpbmsgUEFDS0FHRV9ST09UX1VSTH0gdGhhdCBtYXBzIHRvICcvJy5cbiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfUEFDS0FHRV9VUkxfUFJPVklERVIgPSB7XG4gIHByb3ZpZGU6IFBBQ0tBR0VfUk9PVF9VUkwsXG4gIHVzZVZhbHVlOiAnLydcbn07XG5cbmNvbnN0IF9OT19SRVNPVVJDRV9MT0FERVI6IFJlc291cmNlTG9hZGVyID0ge1xuICBnZXQodXJsOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz57XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYE5vIFJlc291cmNlTG9hZGVyIGltcGxlbWVudGF0aW9uIGhhcyBiZWVuIHByb3ZpZGVkLiBDYW4ndCByZWFkIHRoZSB1cmwgXCIke3VybH1cImApO31cbn07XG5cbmNvbnN0IGJhc2VIdG1sUGFyc2VyID0gbmV3IEluamVjdGlvblRva2VuKCdIdG1sUGFyc2VyJyk7XG5cbmV4cG9ydCBjbGFzcyBDb21waWxlckltcGwgaW1wbGVtZW50cyBDb21waWxlciB7XG4gIHByaXZhdGUgX2RlbGVnYXRlOiBKaXRDb21waWxlcjtcbiAgcHVibGljIHJlYWRvbmx5IGluamVjdG9yOiBJbmplY3RvcjtcbiAgY29uc3RydWN0b3IoXG4gICAgICBpbmplY3RvcjogSW5qZWN0b3IsIHByaXZhdGUgX21ldGFkYXRhUmVzb2x2ZXI6IENvbXBpbGVNZXRhZGF0YVJlc29sdmVyLFxuICAgICAgdGVtcGxhdGVQYXJzZXI6IFRlbXBsYXRlUGFyc2VyLCBzdHlsZUNvbXBpbGVyOiBTdHlsZUNvbXBpbGVyLCB2aWV3Q29tcGlsZXI6IFZpZXdDb21waWxlcixcbiAgICAgIG5nTW9kdWxlQ29tcGlsZXI6IE5nTW9kdWxlQ29tcGlsZXIsIHN1bW1hcnlSZXNvbHZlcjogU3VtbWFyeVJlc29sdmVyPFR5cGU8YW55Pj4sXG4gICAgICBjb21waWxlUmVmbGVjdG9yOiBDb21waWxlUmVmbGVjdG9yLCBjb21waWxlckNvbmZpZzogQ29tcGlsZXJDb25maWcsIGNvbnNvbGU6IENvbnNvbGUpIHtcbiAgICB0aGlzLl9kZWxlZ2F0ZSA9IG5ldyBKaXRDb21waWxlcihcbiAgICAgICAgX21ldGFkYXRhUmVzb2x2ZXIsIHRlbXBsYXRlUGFyc2VyLCBzdHlsZUNvbXBpbGVyLCB2aWV3Q29tcGlsZXIsIG5nTW9kdWxlQ29tcGlsZXIsXG4gICAgICAgIHN1bW1hcnlSZXNvbHZlciwgY29tcGlsZVJlZmxlY3RvciwgY29tcGlsZXJDb25maWcsIGNvbnNvbGUsXG4gICAgICAgIHRoaXMuZ2V0RXh0cmFOZ01vZHVsZVByb3ZpZGVycy5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLmluamVjdG9yID0gaW5qZWN0b3I7XG4gIH1cblxuICBwcml2YXRlIGdldEV4dHJhTmdNb2R1bGVQcm92aWRlcnMoKSB7XG4gICAgcmV0dXJuIFt0aGlzLl9tZXRhZGF0YVJlc29sdmVyLmdldFByb3ZpZGVyTWV0YWRhdGEoXG4gICAgICAgIG5ldyBQcm92aWRlck1ldGEoQ29tcGlsZXIsIHt1c2VWYWx1ZTogdGhpc30pKV07XG4gIH1cblxuICBjb21waWxlTW9kdWxlU3luYzxUPihtb2R1bGVUeXBlOiBUeXBlPFQ+KTogTmdNb2R1bGVGYWN0b3J5PFQ+IHtcbiAgICByZXR1cm4gdGhpcy5fZGVsZWdhdGUuY29tcGlsZU1vZHVsZVN5bmMobW9kdWxlVHlwZSkgYXMgTmdNb2R1bGVGYWN0b3J5PFQ+O1xuICB9XG4gIGNvbXBpbGVNb2R1bGVBc3luYzxUPihtb2R1bGVUeXBlOiBUeXBlPFQ+KTogUHJvbWlzZTxOZ01vZHVsZUZhY3Rvcnk8VD4+IHtcbiAgICByZXR1cm4gdGhpcy5fZGVsZWdhdGUuY29tcGlsZU1vZHVsZUFzeW5jKG1vZHVsZVR5cGUpIGFzIFByb21pc2U8TmdNb2R1bGVGYWN0b3J5PFQ+PjtcbiAgfVxuICBjb21waWxlTW9kdWxlQW5kQWxsQ29tcG9uZW50c1N5bmM8VD4obW9kdWxlVHlwZTogVHlwZTxUPik6IE1vZHVsZVdpdGhDb21wb25lbnRGYWN0b3JpZXM8VD4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuX2RlbGVnYXRlLmNvbXBpbGVNb2R1bGVBbmRBbGxDb21wb25lbnRzU3luYyhtb2R1bGVUeXBlKTtcbiAgICByZXR1cm4ge1xuICAgICAgbmdNb2R1bGVGYWN0b3J5OiByZXN1bHQubmdNb2R1bGVGYWN0b3J5IGFzIE5nTW9kdWxlRmFjdG9yeTxUPixcbiAgICAgIGNvbXBvbmVudEZhY3RvcmllczogcmVzdWx0LmNvbXBvbmVudEZhY3RvcmllcyBhcyBDb21wb25lbnRGYWN0b3J5PGFueT5bXSxcbiAgICB9O1xuICB9XG4gIGNvbXBpbGVNb2R1bGVBbmRBbGxDb21wb25lbnRzQXN5bmM8VD4obW9kdWxlVHlwZTogVHlwZTxUPik6XG4gICAgICBQcm9taXNlPE1vZHVsZVdpdGhDb21wb25lbnRGYWN0b3JpZXM8VD4+IHtcbiAgICByZXR1cm4gdGhpcy5fZGVsZWdhdGUuY29tcGlsZU1vZHVsZUFuZEFsbENvbXBvbmVudHNBc3luYyhtb2R1bGVUeXBlKVxuICAgICAgICAudGhlbigocmVzdWx0KSA9PiAoe1xuICAgICAgICAgICAgICAgIG5nTW9kdWxlRmFjdG9yeTogcmVzdWx0Lm5nTW9kdWxlRmFjdG9yeSBhcyBOZ01vZHVsZUZhY3Rvcnk8VD4sXG4gICAgICAgICAgICAgICAgY29tcG9uZW50RmFjdG9yaWVzOiByZXN1bHQuY29tcG9uZW50RmFjdG9yaWVzIGFzIENvbXBvbmVudEZhY3Rvcnk8YW55PltdLFxuICAgICAgICAgICAgICB9KSk7XG4gIH1cbiAgbG9hZEFvdFN1bW1hcmllcyhzdW1tYXJpZXM6ICgpID0+IGFueVtdKSB7IHRoaXMuX2RlbGVnYXRlLmxvYWRBb3RTdW1tYXJpZXMoc3VtbWFyaWVzKTsgfVxuICBoYXNBb3RTdW1tYXJ5KHJlZjogVHlwZTxhbnk+KTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9kZWxlZ2F0ZS5oYXNBb3RTdW1tYXJ5KHJlZik7IH1cbiAgZ2V0Q29tcG9uZW50RmFjdG9yeTxUPihjb21wb25lbnQ6IFR5cGU8VD4pOiBDb21wb25lbnRGYWN0b3J5PFQ+IHtcbiAgICByZXR1cm4gdGhpcy5fZGVsZWdhdGUuZ2V0Q29tcG9uZW50RmFjdG9yeShjb21wb25lbnQpIGFzIENvbXBvbmVudEZhY3Rvcnk8VD47XG4gIH1cbiAgY2xlYXJDYWNoZSgpOiB2b2lkIHsgdGhpcy5fZGVsZWdhdGUuY2xlYXJDYWNoZSgpOyB9XG4gIGNsZWFyQ2FjaGVGb3IodHlwZTogVHlwZTxhbnk+KSB7IHRoaXMuX2RlbGVnYXRlLmNsZWFyQ2FjaGVGb3IodHlwZSk7IH1cbiAgZ2V0TW9kdWxlSWQobW9kdWxlVHlwZTogVHlwZTxhbnk+KTogc3RyaW5nfHVuZGVmaW5lZCB7XG4gICAgY29uc3QgbWV0YSA9IHRoaXMuX21ldGFkYXRhUmVzb2x2ZXIuZ2V0TmdNb2R1bGVNZXRhZGF0YShtb2R1bGVUeXBlKTtcbiAgICByZXR1cm4gbWV0YSAmJiBtZXRhLmlkIHx8IHVuZGVmaW5lZDtcbiAgfVxufVxuXG4vKipcbiAqIEEgc2V0IG9mIHByb3ZpZGVycyB0aGF0IHByb3ZpZGUgYEppdENvbXBpbGVyYCBhbmQgaXRzIGRlcGVuZGVuY2llcyB0byB1c2UgZm9yXG4gKiB0ZW1wbGF0ZSBjb21waWxhdGlvbi5cbiAqL1xuZXhwb3J0IGNvbnN0IENPTVBJTEVSX1BST1ZJREVSUyA9IDxTdGF0aWNQcm92aWRlcltdPltcbiAge3Byb3ZpZGU6IENvbXBpbGVSZWZsZWN0b3IsIHVzZVZhbHVlOiBuZXcgSml0UmVmbGVjdG9yKCl9LFxuICB7cHJvdmlkZTogUmVzb3VyY2VMb2FkZXIsIHVzZVZhbHVlOiBfTk9fUkVTT1VSQ0VfTE9BREVSfSxcbiAge3Byb3ZpZGU6IEppdFN1bW1hcnlSZXNvbHZlciwgZGVwczogW119LFxuICB7cHJvdmlkZTogU3VtbWFyeVJlc29sdmVyLCB1c2VFeGlzdGluZzogSml0U3VtbWFyeVJlc29sdmVyfSxcbiAge3Byb3ZpZGU6IENvbnNvbGUsIGRlcHM6IFtdfSxcbiAge3Byb3ZpZGU6IExleGVyLCBkZXBzOiBbXX0sXG4gIHtwcm92aWRlOiBQYXJzZXIsIGRlcHM6IFtMZXhlcl19LFxuICB7XG4gICAgcHJvdmlkZTogYmFzZUh0bWxQYXJzZXIsXG4gICAgdXNlQ2xhc3M6IEh0bWxQYXJzZXIsXG4gICAgZGVwczogW10sXG4gIH0sXG4gIHtcbiAgICBwcm92aWRlOiBJMThOSHRtbFBhcnNlcixcbiAgICB1c2VGYWN0b3J5OiAocGFyc2VyOiBIdG1sUGFyc2VyLCB0cmFuc2xhdGlvbnM6IHN0cmluZyB8IG51bGwsIGZvcm1hdDogc3RyaW5nLFxuICAgICAgICAgICAgICAgICBjb25maWc6IENvbXBpbGVyQ29uZmlnLCBjb25zb2xlOiBDb25zb2xlKSA9PiB7XG4gICAgICB0cmFuc2xhdGlvbnMgPSB0cmFuc2xhdGlvbnMgfHwgJyc7XG4gICAgICBjb25zdCBtaXNzaW5nVHJhbnNsYXRpb24gPVxuICAgICAgICAgIHRyYW5zbGF0aW9ucyA/IGNvbmZpZy5taXNzaW5nVHJhbnNsYXRpb24gISA6IE1pc3NpbmdUcmFuc2xhdGlvblN0cmF0ZWd5Lklnbm9yZTtcbiAgICAgIHJldHVybiBuZXcgSTE4Tkh0bWxQYXJzZXIocGFyc2VyLCB0cmFuc2xhdGlvbnMsIGZvcm1hdCwgbWlzc2luZ1RyYW5zbGF0aW9uLCBjb25zb2xlKTtcbiAgICB9LFxuICAgIGRlcHM6IFtcbiAgICAgIGJhc2VIdG1sUGFyc2VyLFxuICAgICAgW25ldyBPcHRpb25hbCgpLCBuZXcgSW5qZWN0KFRSQU5TTEFUSU9OUyldLFxuICAgICAgW25ldyBPcHRpb25hbCgpLCBuZXcgSW5qZWN0KFRSQU5TTEFUSU9OU19GT1JNQVQpXSxcbiAgICAgIFtDb21waWxlckNvbmZpZ10sXG4gICAgICBbQ29uc29sZV0sXG4gICAgXVxuICB9LFxuICB7XG4gICAgcHJvdmlkZTogSHRtbFBhcnNlcixcbiAgICB1c2VFeGlzdGluZzogSTE4Tkh0bWxQYXJzZXIsXG4gIH0sXG4gIHtcbiAgICBwcm92aWRlOiBUZW1wbGF0ZVBhcnNlciwgZGVwczogW0NvbXBpbGVyQ29uZmlnLCBDb21waWxlUmVmbGVjdG9yLFxuICAgIFBhcnNlciwgRWxlbWVudFNjaGVtYVJlZ2lzdHJ5LFxuICAgIEkxOE5IdG1sUGFyc2VyLCBDb25zb2xlXVxuICB9LFxuICB7IHByb3ZpZGU6IERpcmVjdGl2ZU5vcm1hbGl6ZXIsIGRlcHM6IFtSZXNvdXJjZUxvYWRlciwgVXJsUmVzb2x2ZXIsIEh0bWxQYXJzZXIsIENvbXBpbGVyQ29uZmlnXX0sXG4gIHsgcHJvdmlkZTogQ29tcGlsZU1ldGFkYXRhUmVzb2x2ZXIsIGRlcHM6IFtDb21waWxlckNvbmZpZywgSHRtbFBhcnNlciwgTmdNb2R1bGVSZXNvbHZlcixcbiAgICAgICAgICAgICAgICAgICAgICBEaXJlY3RpdmVSZXNvbHZlciwgUGlwZVJlc29sdmVyLFxuICAgICAgICAgICAgICAgICAgICAgIFN1bW1hcnlSZXNvbHZlcixcbiAgICAgICAgICAgICAgICAgICAgICBFbGVtZW50U2NoZW1hUmVnaXN0cnksXG4gICAgICAgICAgICAgICAgICAgICAgRGlyZWN0aXZlTm9ybWFsaXplciwgQ29uc29sZSxcbiAgICAgICAgICAgICAgICAgICAgICBbT3B0aW9uYWwsIFN0YXRpY1N5bWJvbENhY2hlXSxcbiAgICAgICAgICAgICAgICAgICAgICBDb21waWxlUmVmbGVjdG9yLFxuICAgICAgICAgICAgICAgICAgICAgIFtPcHRpb25hbCwgRVJST1JfQ09MTEVDVE9SX1RPS0VOXV19LFxuICBERUZBVUxUX1BBQ0tBR0VfVVJMX1BST1ZJREVSLFxuICB7IHByb3ZpZGU6IFN0eWxlQ29tcGlsZXIsIGRlcHM6IFtVcmxSZXNvbHZlcl19LFxuICB7IHByb3ZpZGU6IFZpZXdDb21waWxlciwgZGVwczogW0NvbXBpbGVSZWZsZWN0b3JdfSxcbiAgeyBwcm92aWRlOiBOZ01vZHVsZUNvbXBpbGVyLCBkZXBzOiBbQ29tcGlsZVJlZmxlY3Rvcl0gfSxcbiAgeyBwcm92aWRlOiBDb21waWxlckNvbmZpZywgdXNlVmFsdWU6IG5ldyBDb21waWxlckNvbmZpZygpfSxcbiAgeyBwcm92aWRlOiBDb21waWxlciwgdXNlQ2xhc3M6IENvbXBpbGVySW1wbCwgZGVwczogW0luamVjdG9yLCBDb21waWxlTWV0YWRhdGFSZXNvbHZlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVGVtcGxhdGVQYXJzZXIsIFN0eWxlQ29tcGlsZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFZpZXdDb21waWxlciwgTmdNb2R1bGVDb21waWxlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3VtbWFyeVJlc29sdmVyLCBDb21waWxlUmVmbGVjdG9yLCBDb21waWxlckNvbmZpZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ29uc29sZV19LFxuICB7IHByb3ZpZGU6IERvbUVsZW1lbnRTY2hlbWFSZWdpc3RyeSwgZGVwczogW119LFxuICB7IHByb3ZpZGU6IEVsZW1lbnRTY2hlbWFSZWdpc3RyeSwgdXNlRXhpc3Rpbmc6IERvbUVsZW1lbnRTY2hlbWFSZWdpc3RyeX0sXG4gIHsgcHJvdmlkZTogVXJsUmVzb2x2ZXIsIGRlcHM6IFtQQUNLQUdFX1JPT1RfVVJMXX0sXG4gIHsgcHJvdmlkZTogRGlyZWN0aXZlUmVzb2x2ZXIsIGRlcHM6IFtDb21waWxlUmVmbGVjdG9yXX0sXG4gIHsgcHJvdmlkZTogUGlwZVJlc29sdmVyLCBkZXBzOiBbQ29tcGlsZVJlZmxlY3Rvcl19LFxuICB7IHByb3ZpZGU6IE5nTW9kdWxlUmVzb2x2ZXIsIGRlcHM6IFtDb21waWxlUmVmbGVjdG9yXX0sXG5dO1xuXG4vKipcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIEppdENvbXBpbGVyRmFjdG9yeSBpbXBsZW1lbnRzIENvbXBpbGVyRmFjdG9yeSB7XG4gIHByaXZhdGUgX2RlZmF1bHRPcHRpb25zOiBDb21waWxlck9wdGlvbnNbXTtcblxuICAvKiBAaW50ZXJuYWwgKi9cbiAgY29uc3RydWN0b3IoZGVmYXVsdE9wdGlvbnM6IENvbXBpbGVyT3B0aW9uc1tdKSB7XG4gICAgY29uc3QgY29tcGlsZXJPcHRpb25zOiBDb21waWxlck9wdGlvbnMgPSB7XG4gICAgICB1c2VKaXQ6IHRydWUsXG4gICAgICBkZWZhdWx0RW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uRW11bGF0ZWQsXG4gICAgICBtaXNzaW5nVHJhbnNsYXRpb246IE1pc3NpbmdUcmFuc2xhdGlvblN0cmF0ZWd5Lldhcm5pbmcsXG4gICAgfTtcblxuICAgIHRoaXMuX2RlZmF1bHRPcHRpb25zID0gW2NvbXBpbGVyT3B0aW9ucywgLi4uZGVmYXVsdE9wdGlvbnNdO1xuICB9XG4gIGNyZWF0ZUNvbXBpbGVyKG9wdGlvbnM6IENvbXBpbGVyT3B0aW9uc1tdID0gW10pOiBDb21waWxlciB7XG4gICAgY29uc3Qgb3B0cyA9IF9tZXJnZU9wdGlvbnModGhpcy5fZGVmYXVsdE9wdGlvbnMuY29uY2F0KG9wdGlvbnMpKTtcbiAgICBjb25zdCBpbmplY3RvciA9IEluamVjdG9yLmNyZWF0ZShbXG4gICAgICBDT01QSUxFUl9QUk9WSURFUlMsIHtcbiAgICAgICAgcHJvdmlkZTogQ29tcGlsZXJDb25maWcsXG4gICAgICAgIHVzZUZhY3Rvcnk6ICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gbmV3IENvbXBpbGVyQ29uZmlnKHtcbiAgICAgICAgICAgIC8vIGxldCBleHBsaWNpdCB2YWx1ZXMgZnJvbSB0aGUgY29tcGlsZXIgb3B0aW9ucyBvdmVyd3JpdGUgb3B0aW9uc1xuICAgICAgICAgICAgLy8gZnJvbSB0aGUgYXBwIHByb3ZpZGVyc1xuICAgICAgICAgICAgdXNlSml0OiBvcHRzLnVzZUppdCxcbiAgICAgICAgICAgIGppdERldk1vZGU6IGlzRGV2TW9kZSgpLFxuICAgICAgICAgICAgLy8gbGV0IGV4cGxpY2l0IHZhbHVlcyBmcm9tIHRoZSBjb21waWxlciBvcHRpb25zIG92ZXJ3cml0ZSBvcHRpb25zXG4gICAgICAgICAgICAvLyBmcm9tIHRoZSBhcHAgcHJvdmlkZXJzXG4gICAgICAgICAgICBkZWZhdWx0RW5jYXBzdWxhdGlvbjogb3B0cy5kZWZhdWx0RW5jYXBzdWxhdGlvbixcbiAgICAgICAgICAgIG1pc3NpbmdUcmFuc2xhdGlvbjogb3B0cy5taXNzaW5nVHJhbnNsYXRpb24sXG4gICAgICAgICAgICBwcmVzZXJ2ZVdoaXRlc3BhY2VzOiBvcHRzLnByZXNlcnZlV2hpdGVzcGFjZXMsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGRlcHM6IFtdXG4gICAgICB9LFxuICAgICAgb3B0cy5wcm92aWRlcnMgIVxuICAgIF0pO1xuICAgIHJldHVybiBpbmplY3Rvci5nZXQoQ29tcGlsZXIpO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9tZXJnZU9wdGlvbnMob3B0aW9uc0FycjogQ29tcGlsZXJPcHRpb25zW10pOiBDb21waWxlck9wdGlvbnMge1xuICByZXR1cm4ge1xuICAgIHVzZUppdDogX2xhc3REZWZpbmVkKG9wdGlvbnNBcnIubWFwKG9wdGlvbnMgPT4gb3B0aW9ucy51c2VKaXQpKSxcbiAgICBkZWZhdWx0RW5jYXBzdWxhdGlvbjogX2xhc3REZWZpbmVkKG9wdGlvbnNBcnIubWFwKG9wdGlvbnMgPT4gb3B0aW9ucy5kZWZhdWx0RW5jYXBzdWxhdGlvbikpLFxuICAgIHByb3ZpZGVyczogX21lcmdlQXJyYXlzKG9wdGlvbnNBcnIubWFwKG9wdGlvbnMgPT4gb3B0aW9ucy5wcm92aWRlcnMgISkpLFxuICAgIG1pc3NpbmdUcmFuc2xhdGlvbjogX2xhc3REZWZpbmVkKG9wdGlvbnNBcnIubWFwKG9wdGlvbnMgPT4gb3B0aW9ucy5taXNzaW5nVHJhbnNsYXRpb24pKSxcbiAgICBwcmVzZXJ2ZVdoaXRlc3BhY2VzOiBfbGFzdERlZmluZWQob3B0aW9uc0Fyci5tYXAob3B0aW9ucyA9PiBvcHRpb25zLnByZXNlcnZlV2hpdGVzcGFjZXMpKSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gX2xhc3REZWZpbmVkPFQ+KGFyZ3M6IFRbXSk6IFR8dW5kZWZpbmVkIHtcbiAgZm9yIChsZXQgaSA9IGFyZ3MubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBpZiAoYXJnc1tpXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gYXJnc1tpXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gX21lcmdlQXJyYXlzKHBhcnRzOiBhbnlbXVtdKTogYW55W10ge1xuICBjb25zdCByZXN1bHQ6IGFueVtdID0gW107XG4gIHBhcnRzLmZvckVhY2goKHBhcnQpID0+IHBhcnQgJiYgcmVzdWx0LnB1c2goLi4ucGFydCkpO1xuICByZXR1cm4gcmVzdWx0O1xufVxuIl19