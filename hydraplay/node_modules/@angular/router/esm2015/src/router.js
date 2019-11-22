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
import { NgModuleRef, NgZone, isDevMode, ɵConsole as Console } from '@angular/core';
import { BehaviorSubject, EMPTY, Subject, of } from 'rxjs';
import { catchError, filter, finalize, map, switchMap, tap } from 'rxjs/operators';
import { standardizeConfig, validateConfig } from './config';
import { createRouterState } from './create_router_state';
import { createUrlTree } from './create_url_tree';
import { GuardsCheckEnd, GuardsCheckStart, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, ResolveEnd, ResolveStart, RouteConfigLoadEnd, RouteConfigLoadStart, RoutesRecognized } from './events';
import { activateRoutes } from './operators/activate_routes';
import { applyRedirects } from './operators/apply_redirects';
import { checkGuards } from './operators/check_guards';
import { recognize } from './operators/recognize';
import { resolveData } from './operators/resolve_data';
import { switchTap } from './operators/switch_tap';
import { DefaultRouteReuseStrategy } from './route_reuse_strategy';
import { RouterConfigLoader } from './router_config_loader';
import { createEmptyState } from './router_state';
import { isNavigationCancelingError, navigationCancelingError } from './shared';
import { DefaultUrlHandlingStrategy } from './url_handling_strategy';
import { containsTree, createEmptyUrlTree } from './url_tree';
import { getAllRouteGuards } from './utils/preactivation';
import { isUrlTree } from './utils/type_guards';
/**
 * \@description
 *
 * Options that modify the navigation strategy.
 *
 * \@publicApi
 * @record
 */
export function NavigationExtras() { }
if (false) {
    /**
     * Enables relative navigation from the current ActivatedRoute.
     *
     * Configuration:
     *
     * ```
     * [{
     *   path: 'parent',
     *   component: ParentComponent,
     *   children: [{
     *     path: 'list',
     *     component: ListComponent
     *   },{
     *     path: 'child',
     *     component: ChildComponent
     *   }]
     * }]
     * ```
     *
     * Navigate to list route from child route:
     *
     * ```
     * \@Component({...})
     *  class ChildComponent {
     *    constructor(private router: Router, private route: ActivatedRoute) {}
     *
     *    go() {
     *      this.router.navigate(['../list'], { relativeTo: this.route });
     *    }
     *  }
     * ```
     * @type {?|undefined}
     */
    NavigationExtras.prototype.relativeTo;
    /**
     * Sets query parameters to the URL.
     *
     * ```
     * // Navigate to /results?page=1
     * this.router.navigate(['/results'], { queryParams: { page: 1 } });
     * ```
     * @type {?|undefined}
     */
    NavigationExtras.prototype.queryParams;
    /**
     * Sets the hash fragment for the URL.
     *
     * ```
     * // Navigate to /results#top
     * this.router.navigate(['/results'], { fragment: 'top' });
     * ```
     * @type {?|undefined}
     */
    NavigationExtras.prototype.fragment;
    /**
     * DEPRECATED: Use `queryParamsHandling` instead to preserve
     * query parameters for the next navigation.
     *
     * ```
     * // Preserve query params from /results?page=1 to /view?page=1
     * this.router.navigate(['/view'], { preserveQueryParams: true });
     * ```
     *
     * @deprecated since v4
     * @type {?|undefined}
     */
    NavigationExtras.prototype.preserveQueryParams;
    /**
     * Configuration strategy for how to handle query parameters for the next navigation.
     *
     * ```
     * // from /results?page=1 to /view?page=1&page=2
     * this.router.navigate(['/view'], { queryParams: { page: 2 },  queryParamsHandling: "merge" });
     * ```
     * @type {?|undefined}
     */
    NavigationExtras.prototype.queryParamsHandling;
    /**
     * Preserves the fragment for the next navigation
     *
     * ```
     * // Preserve fragment from /results#top to /view#top
     * this.router.navigate(['/view'], { preserveFragment: true });
     * ```
     * @type {?|undefined}
     */
    NavigationExtras.prototype.preserveFragment;
    /**
     * Navigates without pushing a new state into history.
     *
     * ```
     * // Navigate silently to /view
     * this.router.navigate(['/view'], { skipLocationChange: true });
     * ```
     * @type {?|undefined}
     */
    NavigationExtras.prototype.skipLocationChange;
    /**
     * Navigates while replacing the current state in history.
     *
     * ```
     * // Navigate to /view
     * this.router.navigate(['/view'], { replaceUrl: true });
     * ```
     * @type {?|undefined}
     */
    NavigationExtras.prototype.replaceUrl;
    /**
     * State passed to any navigation. This value will be accessible through the `extras` object
     * returned from `router.getCurrentNavigation()` while a navigation is executing. Once a
     * navigation completes, this value will be written to `history.state` when the `location.go`
     * or `location.replaceState` method is called before activating of this route. Note that
     * `history.state` will not pass an object equality test because the `navigationId` will be
     * added to the state before being written.
     *
     * While `history.state` can accept any type of value, because the router adds the `navigationId`
     * on each navigation, the `state` must always be an object.
     * @type {?|undefined}
     */
    NavigationExtras.prototype.state;
}
/**
 * @param {?} error
 * @return {?}
 */
function defaultErrorHandler(error) {
    throw error;
}
/**
 * @param {?} error
 * @param {?} urlSerializer
 * @param {?} url
 * @return {?}
 */
function defaultMalformedUriErrorHandler(error, urlSerializer, url) {
    return urlSerializer.parse('/');
}
/**
 * \@internal
 * @param {?} snapshot
 * @param {?} runExtras
 * @return {?}
 */
function defaultRouterHook(snapshot, runExtras) {
    return (/** @type {?} */ (of(null)));
}
/**
 * \@description
 *
 * An NgModule that provides navigation and URL manipulation capabilities.
 *
 * @see `Route`.
 * @see [Routing and Navigation Guide](guide/router).
 *
 * \@ngModule RouterModule
 *
 * \@publicApi
 */
export class Router {
    /**
     * Creates the router service.
     * @param {?} rootComponentType
     * @param {?} urlSerializer
     * @param {?} rootContexts
     * @param {?} location
     * @param {?} injector
     * @param {?} loader
     * @param {?} compiler
     * @param {?} config
     */
    // TODO: vsavkin make internal after the final is out.
    constructor(rootComponentType, urlSerializer, rootContexts, location, injector, loader, compiler, config) {
        this.rootComponentType = rootComponentType;
        this.urlSerializer = urlSerializer;
        this.rootContexts = rootContexts;
        this.location = location;
        this.config = config;
        this.lastSuccessfulNavigation = null;
        this.currentNavigation = null;
        this.navigationId = 0;
        this.isNgZoneEnabled = false;
        /**
         * An event stream for routing events in this NgModule.
         */
        this.events = new Subject();
        /**
         * A handler for navigation errors in this NgModule.
         */
        this.errorHandler = defaultErrorHandler;
        /**
         * Malformed uri error handler is invoked when `Router.parseUrl(url)` throws an
         * error due to containing an invalid character. The most common case would be a `%` sign
         * that's not encoded and is not part of a percent encoded sequence.
         */
        this.malformedUriErrorHandler = defaultMalformedUriErrorHandler;
        /**
         * True if at least one navigation event has occurred,
         * false otherwise.
         */
        this.navigated = false;
        this.lastSuccessfulId = -1;
        /**
         * Hooks that enable you to pause navigation,
         * either before or after the preactivation phase.
         * Used by `RouterModule`.
         *
         * \@internal
         */
        this.hooks = {
            beforePreactivation: defaultRouterHook,
            afterPreactivation: defaultRouterHook
        };
        /**
         * Extracts and merges URLs. Used for AngularJS to Angular migrations.
         */
        this.urlHandlingStrategy = new DefaultUrlHandlingStrategy();
        /**
         * The strategy for re-using routes.
         */
        this.routeReuseStrategy = new DefaultRouteReuseStrategy();
        /**
         * How to handle a navigation request to the current URL. One of:
         * - `'ignore'` :  The router ignores the request.
         * - `'reload'` : The router reloads the URL. Use to implement a "refresh" feature.
         */
        this.onSameUrlNavigation = 'ignore';
        /**
         * How to merge parameters, data, and resolved data from parent to child
         * routes. One of:
         *
         * - `'emptyOnly'` : Inherit parent parameters, data, and resolved data
         * for path-less or component-less routes.
         * - `'always'` : Inherit parent parameters, data, and resolved data
         * for all child routes.
         */
        this.paramsInheritanceStrategy = 'emptyOnly';
        /**
         * Defines when the router updates the browser URL. The default behavior is to update after
         * successful navigation. However, some applications may prefer a mode where the URL gets
         * updated at the beginning of navigation. The most common use case would be updating the
         * URL early so if navigation fails, you can show an error message with the URL that failed.
         * Available options are:
         *
         * - `'deferred'`, the default, updates the browser URL after navigation has finished.
         * - `'eager'`, updates browser URL at the beginning of navigation.
         */
        this.urlUpdateStrategy = 'deferred';
        /**
         * See {\@link RouterModule} for more information.
         */
        this.relativeLinkResolution = 'legacy';
        /** @type {?} */
        const onLoadStart = (r) => this.triggerEvent(new RouteConfigLoadStart(r));
        /** @type {?} */
        const onLoadEnd = (r) => this.triggerEvent(new RouteConfigLoadEnd(r));
        this.ngModule = injector.get(NgModuleRef);
        this.console = injector.get(Console);
        /** @type {?} */
        const ngZone = injector.get(NgZone);
        this.isNgZoneEnabled = ngZone instanceof NgZone;
        this.resetConfig(config);
        this.currentUrlTree = createEmptyUrlTree();
        this.rawUrlTree = this.currentUrlTree;
        this.browserUrlTree = this.currentUrlTree;
        this.configLoader = new RouterConfigLoader(loader, compiler, onLoadStart, onLoadEnd);
        this.routerState = createEmptyState(this.currentUrlTree, this.rootComponentType);
        this.transitions = new BehaviorSubject({
            id: 0,
            currentUrlTree: this.currentUrlTree,
            currentRawUrl: this.currentUrlTree,
            extractedUrl: this.urlHandlingStrategy.extract(this.currentUrlTree),
            urlAfterRedirects: this.urlHandlingStrategy.extract(this.currentUrlTree),
            rawUrl: this.currentUrlTree,
            extras: {},
            resolve: null,
            reject: null,
            promise: Promise.resolve(true),
            source: 'imperative',
            restoredState: null,
            currentSnapshot: this.routerState.snapshot,
            targetSnapshot: null,
            currentRouterState: this.routerState,
            targetRouterState: null,
            guards: { canActivateChecks: [], canDeactivateChecks: [] },
            guardsResult: null,
        });
        this.navigations = this.setupNavigations(this.transitions);
        this.processNavigations();
    }
    /**
     * @private
     * @param {?} transitions
     * @return {?}
     */
    setupNavigations(transitions) {
        /** @type {?} */
        const eventsSubject = ((/** @type {?} */ (this.events)));
        return (/** @type {?} */ ((/** @type {?} */ (transitions.pipe(filter(t => t.id !== 0), 
        // Extract URL
        map(t => ((/** @type {?} */ (Object.assign({}, t, { extractedUrl: this.urlHandlingStrategy.extract(t.rawUrl) }))))), 
        // Store the Navigation object
        tap(t => {
            this.currentNavigation = {
                id: t.id,
                initialUrl: t.currentRawUrl,
                extractedUrl: t.extractedUrl,
                trigger: t.source,
                extras: t.extras,
                previousNavigation: this.lastSuccessfulNavigation ? Object.assign({}, this.lastSuccessfulNavigation, { previousNavigation: null }) :
                    null
            };
        }), 
        // Using switchMap so we cancel executing navigations when a new one comes in
        switchMap(t => {
            /** @type {?} */
            let completed = false;
            /** @type {?} */
            let errored = false;
            return of(t).pipe(switchMap(t => {
                /** @type {?} */
                const urlTransition = !this.navigated || t.extractedUrl.toString() !== this.browserUrlTree.toString();
                /** @type {?} */
                const processCurrentUrl = (this.onSameUrlNavigation === 'reload' ? true : urlTransition) &&
                    this.urlHandlingStrategy.shouldProcessUrl(t.rawUrl);
                if (processCurrentUrl) {
                    return of(t).pipe(
                    // Fire NavigationStart event
                    switchMap(t => {
                        /** @type {?} */
                        const transition = this.transitions.getValue();
                        eventsSubject.next(new NavigationStart(t.id, this.serializeUrl(t.extractedUrl), t.source, t.restoredState));
                        if (transition !== this.transitions.getValue()) {
                            return EMPTY;
                        }
                        return [t];
                    }), 
                    // This delay is required to match old behavior that forced navigation to
                    // always be async
                    switchMap(t => Promise.resolve(t)), 
                    // ApplyRedirects
                    applyRedirects(this.ngModule.injector, this.configLoader, this.urlSerializer, this.config), 
                    // Update the currentNavigation
                    tap(t => {
                        this.currentNavigation = Object.assign({}, (/** @type {?} */ (this.currentNavigation)), { finalUrl: t.urlAfterRedirects });
                    }), 
                    // Recognize
                    recognize(this.rootComponentType, this.config, (url) => this.serializeUrl(url), this.paramsInheritanceStrategy, this.relativeLinkResolution), 
                    // Update URL if in `eager` update mode
                    tap(t => {
                        if (this.urlUpdateStrategy === 'eager') {
                            if (!t.extras.skipLocationChange) {
                                this.setBrowserUrl(t.urlAfterRedirects, !!t.extras.replaceUrl, t.id);
                            }
                            this.browserUrlTree = t.urlAfterRedirects;
                        }
                    }), 
                    // Fire RoutesRecognized
                    tap(t => {
                        /** @type {?} */
                        const routesRecognized = new RoutesRecognized(t.id, this.serializeUrl(t.extractedUrl), this.serializeUrl(t.urlAfterRedirects), (/** @type {?} */ (t.targetSnapshot)));
                        eventsSubject.next(routesRecognized);
                    }));
                }
                else {
                    /** @type {?} */
                    const processPreviousUrl = urlTransition && this.rawUrlTree &&
                        this.urlHandlingStrategy.shouldProcessUrl(this.rawUrlTree);
                    /* When the current URL shouldn't be processed, but the previous one was, we
                     * handle this "error condition" by navigating to the previously successful URL,
                     * but leaving the URL intact.*/
                    if (processPreviousUrl) {
                        const { id, extractedUrl, source, restoredState, extras } = t;
                        /** @type {?} */
                        const navStart = new NavigationStart(id, this.serializeUrl(extractedUrl), source, restoredState);
                        eventsSubject.next(navStart);
                        /** @type {?} */
                        const targetSnapshot = createEmptyState(extractedUrl, this.rootComponentType).snapshot;
                        return of(Object.assign({}, t, { targetSnapshot, urlAfterRedirects: extractedUrl, extras: Object.assign({}, extras, { skipLocationChange: false, replaceUrl: false }) }));
                    }
                    else {
                        /* When neither the current or previous URL can be processed, do nothing other
                         * than update router's internal reference to the current "settled" URL. This
                         * way the next navigation will be coming from the current URL in the browser.
                         */
                        this.rawUrlTree = t.rawUrl;
                        t.resolve(null);
                        return EMPTY;
                    }
                }
            }), 
            // Before Preactivation
            switchTap(t => {
                const { targetSnapshot, id: navigationId, extractedUrl: appliedUrlTree, rawUrl: rawUrlTree, extras: { skipLocationChange, replaceUrl } } = t;
                return this.hooks.beforePreactivation((/** @type {?} */ (targetSnapshot)), {
                    navigationId,
                    appliedUrlTree,
                    rawUrlTree,
                    skipLocationChange: !!skipLocationChange,
                    replaceUrl: !!replaceUrl,
                });
            }), 
            // --- GUARDS ---
            tap(t => {
                /** @type {?} */
                const guardsStart = new GuardsCheckStart(t.id, this.serializeUrl(t.extractedUrl), this.serializeUrl(t.urlAfterRedirects), (/** @type {?} */ (t.targetSnapshot)));
                this.triggerEvent(guardsStart);
            }), map(t => (Object.assign({}, t, { guards: getAllRouteGuards((/** @type {?} */ (t.targetSnapshot)), t.currentSnapshot, this.rootContexts) }))), checkGuards(this.ngModule.injector, (evt) => this.triggerEvent(evt)), tap(t => {
                if (isUrlTree(t.guardsResult)) {
                    /** @type {?} */
                    const error = navigationCancelingError(`Redirecting to "${this.serializeUrl(t.guardsResult)}"`);
                    error.url = t.guardsResult;
                    throw error;
                }
            }), tap(t => {
                /** @type {?} */
                const guardsEnd = new GuardsCheckEnd(t.id, this.serializeUrl(t.extractedUrl), this.serializeUrl(t.urlAfterRedirects), (/** @type {?} */ (t.targetSnapshot)), !!t.guardsResult);
                this.triggerEvent(guardsEnd);
            }), filter(t => {
                if (!t.guardsResult) {
                    this.resetUrlToCurrentUrlTree();
                    /** @type {?} */
                    const navCancel = new NavigationCancel(t.id, this.serializeUrl(t.extractedUrl), '');
                    eventsSubject.next(navCancel);
                    t.resolve(false);
                    return false;
                }
                return true;
            }), 
            // --- RESOLVE ---
            switchTap(t => {
                if (t.guards.canActivateChecks.length) {
                    return of(t).pipe(tap(t => {
                        /** @type {?} */
                        const resolveStart = new ResolveStart(t.id, this.serializeUrl(t.extractedUrl), this.serializeUrl(t.urlAfterRedirects), (/** @type {?} */ (t.targetSnapshot)));
                        this.triggerEvent(resolveStart);
                    }), resolveData(this.paramsInheritanceStrategy, this.ngModule.injector), //
                    tap(t => {
                        /** @type {?} */
                        const resolveEnd = new ResolveEnd(t.id, this.serializeUrl(t.extractedUrl), this.serializeUrl(t.urlAfterRedirects), (/** @type {?} */ (t.targetSnapshot)));
                        this.triggerEvent(resolveEnd);
                    }));
                }
                return undefined;
            }), 
            // --- AFTER PREACTIVATION ---
            switchTap((t) => {
                const { targetSnapshot, id: navigationId, extractedUrl: appliedUrlTree, rawUrl: rawUrlTree, extras: { skipLocationChange, replaceUrl } } = t;
                return this.hooks.afterPreactivation((/** @type {?} */ (targetSnapshot)), {
                    navigationId,
                    appliedUrlTree,
                    rawUrlTree,
                    skipLocationChange: !!skipLocationChange,
                    replaceUrl: !!replaceUrl,
                });
            }), map((t) => {
                /** @type {?} */
                const targetRouterState = createRouterState(this.routeReuseStrategy, (/** @type {?} */ (t.targetSnapshot)), t.currentRouterState);
                return (Object.assign({}, t, { targetRouterState }));
            }), 
            /* Once here, we are about to activate syncronously. The assumption is this will
               succeed, and user code may read from the Router service. Therefore before
               activation, we need to update router properties storing the current URL and the
               RouterState, as well as updated the browser URL. All this should happen *before*
               activating. */
            tap((t) => {
                this.currentUrlTree = t.urlAfterRedirects;
                this.rawUrlTree = this.urlHandlingStrategy.merge(this.currentUrlTree, t.rawUrl);
                ((/** @type {?} */ (this))).routerState = (/** @type {?} */ (t.targetRouterState));
                if (this.urlUpdateStrategy === 'deferred') {
                    if (!t.extras.skipLocationChange) {
                        this.setBrowserUrl(this.rawUrlTree, !!t.extras.replaceUrl, t.id, t.extras.state);
                    }
                    this.browserUrlTree = t.urlAfterRedirects;
                }
            }), activateRoutes(this.rootContexts, this.routeReuseStrategy, (evt) => this.triggerEvent(evt)), tap({ /**
                 * @return {?}
                 */
                next() { completed = true; }, /**
                 * @return {?}
                 */
                complete() { completed = true; } }), finalize(() => {
                /* When the navigation stream finishes either through error or success, we set the
                 * `completed` or `errored` flag. However, there are some situations where we could
                 * get here without either of those being set. For instance, a redirect during
                 * NavigationStart. Therefore, this is a catch-all to make sure the NavigationCancel
                 * event is fired when a navigation gets cancelled but not caught by other means. */
                if (!completed && !errored) {
                    // Must reset to current URL tree here to ensure history.state is set. On a fresh
                    // page load, if a new navigation comes in before a successful navigation
                    // completes, there will be nothing in history.state.navigationId. This can cause
                    // sync problems with AngularJS sync code which looks for a value here in order
                    // to determine whether or not to handle a given popstate event or to leave it
                    // to the Angualr router.
                    this.resetUrlToCurrentUrlTree();
                    /** @type {?} */
                    const navCancel = new NavigationCancel(t.id, this.serializeUrl(t.extractedUrl), `Navigation ID ${t.id} is not equal to the current navigation id ${this.navigationId}`);
                    eventsSubject.next(navCancel);
                    t.resolve(false);
                }
                // currentNavigation should always be reset to null here. If navigation was
                // successful, lastSuccessfulTransition will have already been set. Therefore we
                // can safely set currentNavigation to null here.
                this.currentNavigation = null;
            }), catchError((e) => {
                errored = true;
                /* This error type is issued during Redirect, and is handled as a cancellation
                 * rather than an error. */
                if (isNavigationCancelingError(e)) {
                    /** @type {?} */
                    const redirecting = isUrlTree(e.url);
                    if (!redirecting) {
                        // Set property only if we're not redirecting. If we landed on a page and
                        // redirect to `/` route, the new navigation is going to see the `/` isn't
                        // a change from the default currentUrlTree and won't navigate. This is
                        // only applicable with initial navigation, so setting `navigated` only when
                        // not redirecting resolves this scenario.
                        this.navigated = true;
                        this.resetStateAndUrl(t.currentRouterState, t.currentUrlTree, t.rawUrl);
                    }
                    /** @type {?} */
                    const navCancel = new NavigationCancel(t.id, this.serializeUrl(t.extractedUrl), e.message);
                    eventsSubject.next(navCancel);
                    t.resolve(false);
                    if (redirecting) {
                        this.navigateByUrl(e.url);
                    }
                    /* All other errors should reset to the router's internal URL reference to the
                     * pre-error state. */
                }
                else {
                    this.resetStateAndUrl(t.currentRouterState, t.currentUrlTree, t.rawUrl);
                    /** @type {?} */
                    const navError = new NavigationError(t.id, this.serializeUrl(t.extractedUrl), e);
                    eventsSubject.next(navError);
                    try {
                        t.resolve(this.errorHandler(e));
                    }
                    catch (ee) {
                        t.reject(ee);
                    }
                }
                return EMPTY;
            }));
            // TODO(jasonaden): remove cast once g3 is on updated TypeScript
        }))))));
    }
    /**
     * \@internal
     * TODO: this should be removed once the constructor of the router made internal
     * @param {?} rootComponentType
     * @return {?}
     */
    resetRootComponentType(rootComponentType) {
        this.rootComponentType = rootComponentType;
        // TODO: vsavkin router 4.0 should make the root component set to null
        // this will simplify the lifecycle of the router.
        this.routerState.root.component = this.rootComponentType;
    }
    /**
     * @private
     * @return {?}
     */
    getTransition() { return this.transitions.value; }
    /**
     * @private
     * @param {?} t
     * @return {?}
     */
    setTransition(t) {
        this.transitions.next(Object.assign({}, this.getTransition(), t));
    }
    /**
     * Sets up the location change listener and performs the initial navigation.
     * @return {?}
     */
    initialNavigation() {
        this.setUpLocationChangeListener();
        if (this.navigationId === 0) {
            this.navigateByUrl(this.location.path(true), { replaceUrl: true });
        }
    }
    /**
     * Sets up the location change listener.
     * @return {?}
     */
    setUpLocationChangeListener() {
        // Don't need to use Zone.wrap any more, because zone.js
        // already patch onPopState, so location change callback will
        // run into ngZone
        if (!this.locationSubscription) {
            this.locationSubscription = (/** @type {?} */ (this.location.subscribe((change) => {
                /** @type {?} */
                let rawUrlTree = this.parseUrl(change['url']);
                /** @type {?} */
                const source = change['type'] === 'popstate' ? 'popstate' : 'hashchange';
                // Navigations coming from Angular router have a navigationId state property. When this
                // exists, restore the state.
                /** @type {?} */
                const state = change.state && change.state.navigationId ? change.state : null;
                setTimeout(() => { this.scheduleNavigation(rawUrlTree, source, state, { replaceUrl: true }); }, 0);
            })));
        }
    }
    /**
     * The current URL.
     * @return {?}
     */
    get url() { return this.serializeUrl(this.currentUrlTree); }
    /**
     * The current Navigation object if one exists
     * @return {?}
     */
    getCurrentNavigation() { return this.currentNavigation; }
    /**
     * \@internal
     * @param {?} event
     * @return {?}
     */
    triggerEvent(event) { ((/** @type {?} */ (this.events))).next(event); }
    /**
     * Resets the configuration used for navigation and generating links.
     *
     * \@usageNotes
     *
     * ```
     * router.resetConfig([
     *  { path: 'team/:id', component: TeamCmp, children: [
     *    { path: 'simple', component: SimpleCmp },
     *    { path: 'user/:name', component: UserCmp }
     *  ]}
     * ]);
     * ```
     * @param {?} config The route array for the new configuration.
     *
     * @return {?}
     */
    resetConfig(config) {
        validateConfig(config);
        this.config = config.map(standardizeConfig);
        this.navigated = false;
        this.lastSuccessfulId = -1;
    }
    /**
     * \@docsNotRequired
     * @return {?}
     */
    ngOnDestroy() { this.dispose(); }
    /**
     * Disposes of the router.
     * @return {?}
     */
    dispose() {
        if (this.locationSubscription) {
            this.locationSubscription.unsubscribe();
            this.locationSubscription = (/** @type {?} */ (null));
        }
    }
    /**
     * Applies an array of commands to the current URL tree and creates a new URL tree.
     *
     * When given an activate route, applies the given commands starting from the route.
     * When not given a route, applies the given command starting from the root.
     *
     * \@usageNotes
     *
     * ```
     * // create /team/33/user/11
     * router.createUrlTree(['/team', 33, 'user', 11]);
     *
     * // create /team/33;expand=true/user/11
     * router.createUrlTree(['/team', 33, {expand: true}, 'user', 11]);
     *
     * // you can collapse static segments like this (this works only with the first passed-in value):
     * router.createUrlTree(['/team/33/user', userId]);
     *
     * // If the first segment can contain slashes, and you do not want the router to split it, you
     * // can do the following:
     *
     * router.createUrlTree([{segmentPath: '/one/two'}]);
     *
     * // create /team/33/(user/11//right:chat)
     * router.createUrlTree(['/team', 33, {outlets: {primary: 'user/11', right: 'chat'}}]);
     *
     * // remove the right secondary node
     * router.createUrlTree(['/team', 33, {outlets: {primary: 'user/11', right: null}}]);
     *
     * // assuming the current url is `/team/33/user/11` and the route points to `user/11`
     *
     * // navigate to /team/33/user/11/details
     * router.createUrlTree(['details'], {relativeTo: route});
     *
     * // navigate to /team/33/user/22
     * router.createUrlTree(['../22'], {relativeTo: route});
     *
     * // navigate to /team/44/user/22
     * router.createUrlTree(['../../team/44/user/22'], {relativeTo: route});
     * ```
     * @param {?} commands An array of commands to apply.
     * @param {?=} navigationExtras
     * @return {?} The new URL tree.
     *
     */
    createUrlTree(commands, navigationExtras = {}) {
        const { relativeTo, queryParams, fragment, preserveQueryParams, queryParamsHandling, preserveFragment } = navigationExtras;
        if (isDevMode() && preserveQueryParams && (/** @type {?} */ (console)) && (/** @type {?} */ (console.warn))) {
            console.warn('preserveQueryParams is deprecated, use queryParamsHandling instead.');
        }
        /** @type {?} */
        const a = relativeTo || this.routerState.root;
        /** @type {?} */
        const f = preserveFragment ? this.currentUrlTree.fragment : fragment;
        /** @type {?} */
        let q = null;
        if (queryParamsHandling) {
            switch (queryParamsHandling) {
                case 'merge':
                    q = Object.assign({}, this.currentUrlTree.queryParams, queryParams);
                    break;
                case 'preserve':
                    q = this.currentUrlTree.queryParams;
                    break;
                default:
                    q = queryParams || null;
            }
        }
        else {
            q = preserveQueryParams ? this.currentUrlTree.queryParams : queryParams || null;
        }
        if (q !== null) {
            q = this.removeEmptyProps(q);
        }
        return createUrlTree(a, this.currentUrlTree, commands, (/** @type {?} */ (q)), (/** @type {?} */ (f)));
    }
    /**
     * Navigate based on the provided URL, which must be absolute.
     *
     * \@usageNotes
     *
     * ### Example
     *
     * ```
     * router.navigateByUrl("/team/33/user/11");
     *
     * // Navigate without updating the URL
     * router.navigateByUrl("/team/33/user/11", { skipLocationChange: true });
     * ```
     *
     * @param {?} url An absolute URL. The function does not apply any delta to the current URL.
     * @param {?=} extras An object containing properties that modify the navigation strategy.
     * The function ignores any properties in the `NavigationExtras` that would change the
     * provided URL.
     *
     * @return {?} A Promise that resolves to 'true' when navigation succeeds,
     * to 'false' when navigation fails, or is rejected on error.
     *
     */
    navigateByUrl(url, extras = { skipLocationChange: false }) {
        if (isDevMode() && this.isNgZoneEnabled && !NgZone.isInAngularZone()) {
            this.console.warn(`Navigation triggered outside Angular zone, did you forget to call 'ngZone.run()'?`);
        }
        /** @type {?} */
        const urlTree = isUrlTree(url) ? url : this.parseUrl(url);
        /** @type {?} */
        const mergedTree = this.urlHandlingStrategy.merge(urlTree, this.rawUrlTree);
        return this.scheduleNavigation(mergedTree, 'imperative', null, extras);
    }
    /**
     * Navigate based on the provided array of commands and a starting point.
     * If no starting route is provided, the navigation is absolute.
     *
     * Returns a promise that:
     * - resolves to 'true' when navigation succeeds,
     * - resolves to 'false' when navigation fails,
     * - is rejected when an error happens.
     *
     * \@usageNotes
     *
     * ### Example
     *
     * ```
     * router.navigate(['team', 33, 'user', 11], {relativeTo: route});
     *
     * // Navigate without updating the URL
     * router.navigate(['team', 33, 'user', 11], {relativeTo: route, skipLocationChange: true});
     * ```
     *
     * The first parameter of `navigate()` is a delta to be applied to the current URL
     * or the one provided in the `relativeTo` property of the second parameter (the
     * `NavigationExtras`).
     *
     * In order to affect this browser's `history.state` entry, the `state`
     * parameter can be passed. This must be an object because the router
     * will add the `navigationId` property to this object before creating
     * the new history item.
     * @param {?} commands
     * @param {?=} extras
     * @return {?}
     */
    navigate(commands, extras = { skipLocationChange: false }) {
        validateCommands(commands);
        return this.navigateByUrl(this.createUrlTree(commands, extras), extras);
    }
    /**
     * Serializes a `UrlTree` into a string
     * @param {?} url
     * @return {?}
     */
    serializeUrl(url) { return this.urlSerializer.serialize(url); }
    /**
     * Parses a string into a `UrlTree`
     * @param {?} url
     * @return {?}
     */
    parseUrl(url) {
        /** @type {?} */
        let urlTree;
        try {
            urlTree = this.urlSerializer.parse(url);
        }
        catch (e) {
            urlTree = this.malformedUriErrorHandler(e, this.urlSerializer, url);
        }
        return urlTree;
    }
    /**
     * Returns whether the url is activated
     * @param {?} url
     * @param {?} exact
     * @return {?}
     */
    isActive(url, exact) {
        if (isUrlTree(url)) {
            return containsTree(this.currentUrlTree, url, exact);
        }
        /** @type {?} */
        const urlTree = this.parseUrl(url);
        return containsTree(this.currentUrlTree, urlTree, exact);
    }
    /**
     * @private
     * @param {?} params
     * @return {?}
     */
    removeEmptyProps(params) {
        return Object.keys(params).reduce((result, key) => {
            /** @type {?} */
            const value = params[key];
            if (value !== null && value !== undefined) {
                result[key] = value;
            }
            return result;
        }, {});
    }
    /**
     * @private
     * @return {?}
     */
    processNavigations() {
        this.navigations.subscribe(t => {
            this.navigated = true;
            this.lastSuccessfulId = t.id;
            ((/** @type {?} */ (this.events)))
                .next(new NavigationEnd(t.id, this.serializeUrl(t.extractedUrl), this.serializeUrl(this.currentUrlTree)));
            this.lastSuccessfulNavigation = this.currentNavigation;
            this.currentNavigation = null;
            t.resolve(true);
        }, e => { this.console.warn(`Unhandled Navigation Error: `); });
    }
    /**
     * @private
     * @param {?} rawUrl
     * @param {?} source
     * @param {?} restoredState
     * @param {?} extras
     * @return {?}
     */
    scheduleNavigation(rawUrl, source, restoredState, extras) {
        /** @type {?} */
        const lastNavigation = this.getTransition();
        // If the user triggers a navigation imperatively (e.g., by using navigateByUrl),
        // and that navigation results in 'replaceState' that leads to the same URL,
        // we should skip those.
        if (lastNavigation && source !== 'imperative' && lastNavigation.source === 'imperative' &&
            lastNavigation.rawUrl.toString() === rawUrl.toString()) {
            return Promise.resolve(true); // return value is not used
        }
        // Because of a bug in IE and Edge, the location class fires two events (popstate and
        // hashchange) every single time. The second one should be ignored. Otherwise, the URL will
        // flicker. Handles the case when a popstate was emitted first.
        if (lastNavigation && source == 'hashchange' && lastNavigation.source === 'popstate' &&
            lastNavigation.rawUrl.toString() === rawUrl.toString()) {
            return Promise.resolve(true); // return value is not used
        }
        // Because of a bug in IE and Edge, the location class fires two events (popstate and
        // hashchange) every single time. The second one should be ignored. Otherwise, the URL will
        // flicker. Handles the case when a hashchange was emitted first.
        if (lastNavigation && source == 'popstate' && lastNavigation.source === 'hashchange' &&
            lastNavigation.rawUrl.toString() === rawUrl.toString()) {
            return Promise.resolve(true); // return value is not used
        }
        /** @type {?} */
        let resolve = null;
        /** @type {?} */
        let reject = null;
        /** @type {?} */
        const promise = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        });
        /** @type {?} */
        const id = ++this.navigationId;
        this.setTransition({
            id,
            source,
            restoredState,
            currentUrlTree: this.currentUrlTree,
            currentRawUrl: this.rawUrlTree, rawUrl, extras, resolve, reject, promise,
            currentSnapshot: this.routerState.snapshot,
            currentRouterState: this.routerState
        });
        // Make sure that the error is propagated even though `processNavigations` catch
        // handler does not rethrow
        return promise.catch((e) => { return Promise.reject(e); });
    }
    /**
     * @private
     * @param {?} url
     * @param {?} replaceUrl
     * @param {?} id
     * @param {?=} state
     * @return {?}
     */
    setBrowserUrl(url, replaceUrl, id, state) {
        /** @type {?} */
        const path = this.urlSerializer.serialize(url);
        state = state || {};
        if (this.location.isCurrentPathEqualTo(path) || replaceUrl) {
            // TODO(jasonaden): Remove first `navigationId` and rely on `ng` namespace.
            this.location.replaceState(path, '', Object.assign({}, state, { navigationId: id }));
        }
        else {
            this.location.go(path, '', Object.assign({}, state, { navigationId: id }));
        }
    }
    /**
     * @private
     * @param {?} storedState
     * @param {?} storedUrl
     * @param {?} rawUrl
     * @return {?}
     */
    resetStateAndUrl(storedState, storedUrl, rawUrl) {
        ((/** @type {?} */ (this))).routerState = storedState;
        this.currentUrlTree = storedUrl;
        this.rawUrlTree = this.urlHandlingStrategy.merge(this.currentUrlTree, rawUrl);
        this.resetUrlToCurrentUrlTree();
    }
    /**
     * @private
     * @return {?}
     */
    resetUrlToCurrentUrlTree() {
        this.location.replaceState(this.urlSerializer.serialize(this.rawUrlTree), '', { navigationId: this.lastSuccessfulId });
    }
}
if (false) {
    /**
     * @type {?}
     * @private
     */
    Router.prototype.currentUrlTree;
    /**
     * @type {?}
     * @private
     */
    Router.prototype.rawUrlTree;
    /**
     * @type {?}
     * @private
     */
    Router.prototype.browserUrlTree;
    /**
     * @type {?}
     * @private
     */
    Router.prototype.transitions;
    /**
     * @type {?}
     * @private
     */
    Router.prototype.navigations;
    /**
     * @type {?}
     * @private
     */
    Router.prototype.lastSuccessfulNavigation;
    /**
     * @type {?}
     * @private
     */
    Router.prototype.currentNavigation;
    /**
     * @type {?}
     * @private
     */
    Router.prototype.locationSubscription;
    /**
     * @type {?}
     * @private
     */
    Router.prototype.navigationId;
    /**
     * @type {?}
     * @private
     */
    Router.prototype.configLoader;
    /**
     * @type {?}
     * @private
     */
    Router.prototype.ngModule;
    /**
     * @type {?}
     * @private
     */
    Router.prototype.console;
    /**
     * @type {?}
     * @private
     */
    Router.prototype.isNgZoneEnabled;
    /**
     * An event stream for routing events in this NgModule.
     * @type {?}
     */
    Router.prototype.events;
    /**
     * The current state of routing in this NgModule.
     * @type {?}
     */
    Router.prototype.routerState;
    /**
     * A handler for navigation errors in this NgModule.
     * @type {?}
     */
    Router.prototype.errorHandler;
    /**
     * Malformed uri error handler is invoked when `Router.parseUrl(url)` throws an
     * error due to containing an invalid character. The most common case would be a `%` sign
     * that's not encoded and is not part of a percent encoded sequence.
     * @type {?}
     */
    Router.prototype.malformedUriErrorHandler;
    /**
     * True if at least one navigation event has occurred,
     * false otherwise.
     * @type {?}
     */
    Router.prototype.navigated;
    /**
     * @type {?}
     * @private
     */
    Router.prototype.lastSuccessfulId;
    /**
     * Hooks that enable you to pause navigation,
     * either before or after the preactivation phase.
     * Used by `RouterModule`.
     *
     * \@internal
     * @type {?}
     */
    Router.prototype.hooks;
    /**
     * Extracts and merges URLs. Used for AngularJS to Angular migrations.
     * @type {?}
     */
    Router.prototype.urlHandlingStrategy;
    /**
     * The strategy for re-using routes.
     * @type {?}
     */
    Router.prototype.routeReuseStrategy;
    /**
     * How to handle a navigation request to the current URL. One of:
     * - `'ignore'` :  The router ignores the request.
     * - `'reload'` : The router reloads the URL. Use to implement a "refresh" feature.
     * @type {?}
     */
    Router.prototype.onSameUrlNavigation;
    /**
     * How to merge parameters, data, and resolved data from parent to child
     * routes. One of:
     *
     * - `'emptyOnly'` : Inherit parent parameters, data, and resolved data
     * for path-less or component-less routes.
     * - `'always'` : Inherit parent parameters, data, and resolved data
     * for all child routes.
     * @type {?}
     */
    Router.prototype.paramsInheritanceStrategy;
    /**
     * Defines when the router updates the browser URL. The default behavior is to update after
     * successful navigation. However, some applications may prefer a mode where the URL gets
     * updated at the beginning of navigation. The most common use case would be updating the
     * URL early so if navigation fails, you can show an error message with the URL that failed.
     * Available options are:
     *
     * - `'deferred'`, the default, updates the browser URL after navigation has finished.
     * - `'eager'`, updates browser URL at the beginning of navigation.
     * @type {?}
     */
    Router.prototype.urlUpdateStrategy;
    /**
     * See {\@link RouterModule} for more information.
     * @type {?}
     */
    Router.prototype.relativeLinkResolution;
    /**
     * @type {?}
     * @private
     */
    Router.prototype.rootComponentType;
    /**
     * @type {?}
     * @private
     */
    Router.prototype.urlSerializer;
    /**
     * @type {?}
     * @private
     */
    Router.prototype.rootContexts;
    /**
     * @type {?}
     * @private
     */
    Router.prototype.location;
    /** @type {?} */
    Router.prototype.config;
}
/**
 * @param {?} commands
 * @return {?}
 */
function validateCommands(commands) {
    for (let i = 0; i < commands.length; i++) {
        /** @type {?} */
        const cmd = commands[i];
        if (cmd == null) {
            throw new Error(`The requested path contains ${cmd} segment at index ${i}`);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvcm91dGVyL3NyYy9yb3V0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFTQSxPQUFPLEVBQTRDLFdBQVcsRUFBRSxNQUFNLEVBQVEsU0FBUyxFQUFFLFFBQVEsSUFBSSxPQUFPLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDbkksT0FBTyxFQUFDLGVBQWUsRUFBRSxLQUFLLEVBQWMsT0FBTyxFQUF1QixFQUFFLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDM0YsT0FBTyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFakYsT0FBTyxFQUFxQyxpQkFBaUIsRUFBRSxjQUFjLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDL0YsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDeEQsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ2hELE9BQU8sRUFBUSxjQUFjLEVBQUUsZ0JBQWdCLEVBQUUsZ0JBQWdCLEVBQUUsYUFBYSxFQUFFLGVBQWUsRUFBRSxlQUFlLEVBQXFCLFVBQVUsRUFBRSxZQUFZLEVBQUUsa0JBQWtCLEVBQUUsb0JBQW9CLEVBQUUsZ0JBQWdCLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDN08sT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLDZCQUE2QixDQUFDO0FBQzNELE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSw2QkFBNkIsQ0FBQztBQUMzRCxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFDckQsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ2hELE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztB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d0JBQXFCOzs7Ozs7QUFtdEI5RSxTQUFTLGdCQUFnQixDQUFDLFFBQWtCO0lBQzFDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFOztjQUNsQyxHQUFHLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUN2QixJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUU7WUFDZixNQUFNLElBQUksS0FBSyxDQUFDLCtCQUErQixHQUFHLHFCQUFxQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQzdFO0tBQ0Y7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0xvY2F0aW9ufSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtDb21waWxlciwgSW5qZWN0b3IsIE5nTW9kdWxlRmFjdG9yeUxvYWRlciwgTmdNb2R1bGVSZWYsIE5nWm9uZSwgVHlwZSwgaXNEZXZNb2RlLCDJtUNvbnNvbGUgYXMgQ29uc29sZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0JlaGF2aW9yU3ViamVjdCwgRU1QVFksIE9ic2VydmFibGUsIFN1YmplY3QsIFN1YnNjcmlwdGlvbiwgZGVmZXIsIG9mIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQge2NhdGNoRXJyb3IsIGZpbHRlciwgZmluYWxpemUsIG1hcCwgc3dpdGNoTWFwLCB0YXB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHtRdWVyeVBhcmFtc0hhbmRsaW5nLCBSb3V0ZSwgUm91dGVzLCBzdGFuZGFyZGl6ZUNvbmZpZywgdmFsaWRhdGVDb25maWd9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7Y3JlYXRlUm91dGVyU3RhdGV9IGZyb20gJy4vY3JlYXRlX3JvdXRlcl9zdGF0ZSc7XG5pbXBvcnQge2NyZWF0ZVVybFRyZWV9IGZyb20gJy4vY3JlYXRlX3VybF90cmVlJztcbmltcG9ydCB7RXZlbnQsIEd1YXJkc0NoZWNrRW5kLCBHdWFyZHNDaGVja1N0YXJ0LCBOYXZpZ2F0aW9uQ2FuY2VsLCBOYXZpZ2F0aW9uRW5kLCBOYXZpZ2F0aW9uRXJyb3IsIE5hdmlnYXRpb25TdGFydCwgTmF2aWdhdGlvblRyaWdnZXIsIFJlc29sdmVFbmQsIFJlc29sdmVTdGFydCwgUm91dGVDb25maWdMb2FkRW5kLCBSb3V0ZUNvbmZpZ0xvYWRTdGFydCwgUm91dGVzUmVjb2duaXplZH0gZnJvbSAnLi9ldmVudHMnO1xuaW1wb3J0IHthY3RpdmF0ZVJvdXRlc30gZnJvbSAnLi9vcGVyYXRvcnMvYWN0aXZhdGVfcm91dGVzJztcbmltcG9ydCB7YXBwbHlSZWRpcmVjdHN9IGZyb20gJy4vb3BlcmF0b3JzL2FwcGx5X3JlZGlyZWN0cyc7XG5pbXBvcnQge2NoZWNrR3VhcmRzfSBmcm9tICcuL29wZXJhdG9ycy9jaGVja19ndWFyZHMnO1xuaW1wb3J0IHtyZWNvZ25pemV9IGZyb20gJy4vb3BlcmF0b3JzL3JlY29nbml6ZSc7XG5pbXBvcnQge3Jlc29sdmVEYXRhfSBmcm9tICcuL29wZXJhdG9ycy9yZXNvbHZlX2RhdGEnO1xuaW1wb3J0IHtzd2l0Y2hUYXB9IGZyb20gJy4vb3BlcmF0b3JzL3N3aXRjaF90YXAnO1xuaW1wb3J0IHtEZWZhdWx0Um91dGVSZXVzZVN0cmF0ZWd5LCBSb3V0ZVJldXNlU3RyYXRlZ3l9IGZyb20gJy4vcm91dGVfcmV1c2Vfc3RyYXRlZ3knO1xuaW1wb3J0IHtSb3V0ZXJDb25maWdMb2FkZXJ9IGZyb20gJy4vcm91dGVyX2NvbmZpZ19sb2FkZXInO1xuaW1wb3J0IHtDaGlsZHJlbk91dGxldENvbnRleHRzfSBmcm9tICcuL3JvdXRlcl9vdXRsZXRfY29udGV4dCc7XG5pbXBvcnQge0FjdGl2YXRlZFJvdXRlLCBSb3V0ZXJTdGF0ZSwgUm91dGVyU3RhdGVTbmFwc2hvdCwgY3JlYXRlRW1wdHlTdGF0ZX0gZnJvbSAnLi9yb3V0ZXJfc3RhdGUnO1xuaW1wb3J0IHtQYXJhbXMsIGlzTmF2aWdhdGlvbkNhbmNlbGluZ0Vycm9yLCBuYXZpZ2F0aW9uQ2FuY2VsaW5nRXJyb3J9IGZyb20gJy4vc2hhcmVkJztcbmltcG9ydCB7RGVmYXVsdFVybEhhbmRsaW5nU3RyYXRlZ3ksIFVybEhhbmRsaW5nU3RyYXRlZ3l9IGZyb20gJy4vdXJsX2hhbmRsaW5nX3N0cmF0ZWd5JztcbmltcG9ydCB7VXJsU2VyaWFsaXplciwgVXJsVHJlZSwgY29udGFpbnNUcmVlLCBjcmVhdGVFbXB0eVVybFRyZWV9IGZyb20gJy4vdXJsX3RyZWUnO1xuaW1wb3J0IHtDaGVja3MsIGdldEFsbFJvdXRlR3VhcmRzfSBmcm9tICcuL3V0aWxzL3ByZWFjdGl2YXRpb24nO1xuaW1wb3J0IHtpc1VybFRyZWV9IGZyb20gJy4vdXRpbHMvdHlwZV9ndWFyZHMnO1xuXG5cblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBPcHRpb25zIHRoYXQgbW9kaWZ5IHRoZSBuYXZpZ2F0aW9uIHN0cmF0ZWd5LlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBOYXZpZ2F0aW9uRXh0cmFzIHtcbiAgLyoqXG4gICAqIEVuYWJsZXMgcmVsYXRpdmUgbmF2aWdhdGlvbiBmcm9tIHRoZSBjdXJyZW50IEFjdGl2YXRlZFJvdXRlLlxuICAgKlxuICAgKiBDb25maWd1cmF0aW9uOlxuICAgKlxuICAgKiBgYGBcbiAgICogW3tcbiAgKiAgIHBhdGg6ICdwYXJlbnQnLFxuICAqICAgY29tcG9uZW50OiBQYXJlbnRDb21wb25lbnQsXG4gICogICBjaGlsZHJlbjogW3tcbiAgKiAgICAgcGF0aDogJ2xpc3QnLFxuICAqICAgICBjb21wb25lbnQ6IExpc3RDb21wb25lbnRcbiAgKiAgIH0se1xuICAqICAgICBwYXRoOiAnY2hpbGQnLFxuICAqICAgICBjb21wb25lbnQ6IENoaWxkQ29tcG9uZW50XG4gICogICB9XVxuICAqIH1dXG4gICAqIGBgYFxuICAgKlxuICAgKiBOYXZpZ2F0ZSB0byBsaXN0IHJvdXRlIGZyb20gY2hpbGQgcm91dGU6XG4gICAqXG4gICAqIGBgYFxuICAgKiAgQENvbXBvbmVudCh7Li4ufSlcbiAgICogIGNsYXNzIENoaWxkQ29tcG9uZW50IHtcbiAgKiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJvdXRlcjogUm91dGVyLCBwcml2YXRlIHJvdXRlOiBBY3RpdmF0ZWRSb3V0ZSkge31cbiAgKlxuICAqICAgIGdvKCkge1xuICAqICAgICAgdGhpcy5yb3V0ZXIubmF2aWdhdGUoWycuLi9saXN0J10sIHsgcmVsYXRpdmVUbzogdGhpcy5yb3V0ZSB9KTtcbiAgKiAgICB9XG4gICogIH1cbiAgICogYGBgXG4gICAqL1xuICByZWxhdGl2ZVRvPzogQWN0aXZhdGVkUm91dGV8bnVsbDtcblxuICAvKipcbiAgICogU2V0cyBxdWVyeSBwYXJhbWV0ZXJzIHRvIHRoZSBVUkwuXG4gICAqXG4gICAqIGBgYFxuICAgKiAvLyBOYXZpZ2F0ZSB0byAvcmVzdWx0cz9wYWdlPTFcbiAgICogdGhpcy5yb3V0ZXIubmF2aWdhdGUoWycvcmVzdWx0cyddLCB7IHF1ZXJ5UGFyYW1zOiB7IHBhZ2U6IDEgfSB9KTtcbiAgICogYGBgXG4gICAqL1xuICBxdWVyeVBhcmFtcz86IFBhcmFtc3xudWxsO1xuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBoYXNoIGZyYWdtZW50IGZvciB0aGUgVVJMLlxuICAgKlxuICAgKiBgYGBcbiAgICogLy8gTmF2aWdhdGUgdG8gL3Jlc3VsdHMjdG9wXG4gICAqIHRoaXMucm91dGVyLm5hdmlnYXRlKFsnL3Jlc3VsdHMnXSwgeyBmcmFnbWVudDogJ3RvcCcgfSk7XG4gICAqIGBgYFxuICAgKi9cbiAgZnJhZ21lbnQ/OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIERFUFJFQ0FURUQ6IFVzZSBgcXVlcnlQYXJhbXNIYW5kbGluZ2AgaW5zdGVhZCB0byBwcmVzZXJ2ZVxuICAgKiBxdWVyeSBwYXJhbWV0ZXJzIGZvciB0aGUgbmV4dCBuYXZpZ2F0aW9uLlxuICAgKlxuICAgKiBgYGBcbiAgICogLy8gUHJlc2VydmUgcXVlcnkgcGFyYW1zIGZyb20gL3Jlc3VsdHM/cGFnZT0xIHRvIC92aWV3P3BhZ2U9MVxuICAgKiB0aGlzLnJvdXRlci5uYXZpZ2F0ZShbJy92aWV3J10sIHsgcHJlc2VydmVRdWVyeVBhcmFtczogdHJ1ZSB9KTtcbiAgICogYGBgXG4gICAqXG4gICAqIEBkZXByZWNhdGVkIHNpbmNlIHY0XG4gICAqL1xuICBwcmVzZXJ2ZVF1ZXJ5UGFyYW1zPzogYm9vbGVhbjtcblxuICAvKipcbiAgICogQ29uZmlndXJhdGlvbiBzdHJhdGVneSBmb3IgaG93IHRvIGhhbmRsZSBxdWVyeSBwYXJhbWV0ZXJzIGZvciB0aGUgbmV4dCBuYXZpZ2F0aW9uLlxuICAgKlxuICAgKiBgYGBcbiAgICogLy8gZnJvbSAvcmVzdWx0cz9wYWdlPTEgdG8gL3ZpZXc/cGFnZT0xJnBhZ2U9MlxuICAgKiB0aGlzLnJvdXRlci5uYXZpZ2F0ZShbJy92aWV3J10sIHsgcXVlcnlQYXJhbXM6IHsgcGFnZTogMiB9LCAgcXVlcnlQYXJhbXNIYW5kbGluZzogXCJtZXJnZVwiIH0pO1xuICAgKiBgYGBcbiAgICovXG4gIHF1ZXJ5UGFyYW1zSGFuZGxpbmc/OiBRdWVyeVBhcmFtc0hhbmRsaW5nfG51bGw7XG4gIC8qKlxuICAgKiBQcmVzZXJ2ZXMgdGhlIGZyYWdtZW50IGZvciB0aGUgbmV4dCBuYXZpZ2F0aW9uXG4gICAqXG4gICAqIGBgYFxuICAgKiAvLyBQcmVzZXJ2ZSBmcmFnbWVudCBmcm9tIC9yZXN1bHRzI3RvcCB0byAvdmlldyN0b3BcbiAgICogdGhpcy5yb3V0ZXIubmF2aWdhdGUoWycvdmlldyddLCB7IHByZXNlcnZlRnJhZ21lbnQ6IHRydWUgfSk7XG4gICAqIGBgYFxuICAgKi9cbiAgcHJlc2VydmVGcmFnbWVudD86IGJvb2xlYW47XG4gIC8qKlxuICAgKiBOYXZpZ2F0ZXMgd2l0aG91dCBwdXNoaW5nIGEgbmV3IHN0YXRlIGludG8gaGlzdG9yeS5cbiAgICpcbiAgICogYGBgXG4gICAqIC8vIE5hdmlnYXRlIHNpbGVudGx5IHRvIC92aWV3XG4gICAqIHRoaXMucm91dGVyLm5hdmlnYXRlKFsnL3ZpZXcnXSwgeyBza2lwTG9jYXRpb25DaGFuZ2U6IHRydWUgfSk7XG4gICAqIGBgYFxuICAgKi9cbiAgc2tpcExvY2F0aW9uQ2hhbmdlPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIE5hdmlnYXRlcyB3aGlsZSByZXBsYWNpbmcgdGhlIGN1cnJlbnQgc3RhdGUgaW4gaGlzdG9yeS5cbiAgICpcbiAgICogYGBgXG4gICAqIC8vIE5hdmlnYXRlIHRvIC92aWV3XG4gICAqIHRoaXMucm91dGVyLm5hdmlnYXRlKFsnL3ZpZXcnXSwgeyByZXBsYWNlVXJsOiB0cnVlIH0pO1xuICAgKiBgYGBcbiAgICovXG4gIHJlcGxhY2VVcmw/OiBib29sZWFuO1xuICAvKipcbiAgICogU3RhdGUgcGFzc2VkIHRvIGFueSBuYXZpZ2F0aW9uLiBUaGlzIHZhbHVlIHdpbGwgYmUgYWNjZXNzaWJsZSB0aHJvdWdoIHRoZSBgZXh0cmFzYCBvYmplY3RcbiAgICogcmV0dXJuZWQgZnJvbSBgcm91dGVyLmdldEN1cnJlbnROYXZpZ2F0aW9uKClgIHdoaWxlIGEgbmF2aWdhdGlvbiBpcyBleGVjdXRpbmcuIE9uY2UgYVxuICAgKiBuYXZpZ2F0aW9uIGNvbXBsZXRlcywgdGhpcyB2YWx1ZSB3aWxsIGJlIHdyaXR0ZW4gdG8gYGhpc3Rvcnkuc3RhdGVgIHdoZW4gdGhlIGBsb2NhdGlvbi5nb2BcbiAgICogb3IgYGxvY2F0aW9uLnJlcGxhY2VTdGF0ZWAgbWV0aG9kIGlzIGNhbGxlZCBiZWZvcmUgYWN0aXZhdGluZyBvZiB0aGlzIHJvdXRlLiBOb3RlIHRoYXRcbiAgICogYGhpc3Rvcnkuc3RhdGVgIHdpbGwgbm90IHBhc3MgYW4gb2JqZWN0IGVxdWFsaXR5IHRlc3QgYmVjYXVzZSB0aGUgYG5hdmlnYXRpb25JZGAgd2lsbCBiZVxuICAgKiBhZGRlZCB0byB0aGUgc3RhdGUgYmVmb3JlIGJlaW5nIHdyaXR0ZW4uXG4gICAqXG4gICAqIFdoaWxlIGBoaXN0b3J5LnN0YXRlYCBjYW4gYWNjZXB0IGFueSB0eXBlIG9mIHZhbHVlLCBiZWNhdXNlIHRoZSByb3V0ZXIgYWRkcyB0aGUgYG5hdmlnYXRpb25JZGBcbiAgICogb24gZWFjaCBuYXZpZ2F0aW9uLCB0aGUgYHN0YXRlYCBtdXN0IGFsd2F5cyBiZSBhbiBvYmplY3QuXG4gICAqL1xuICBzdGF0ZT86IHtbazogc3RyaW5nXTogYW55fTtcbn1cblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBFcnJvciBoYW5kbGVyIHRoYXQgaXMgaW52b2tlZCB3aGVuIGEgbmF2aWdhdGlvbiBlcnJvcnMuXG4gKlxuICogSWYgdGhlIGhhbmRsZXIgcmV0dXJucyBhIHZhbHVlLCB0aGUgbmF2aWdhdGlvbiBwcm9taXNlIHdpbGwgYmUgcmVzb2x2ZWQgd2l0aCB0aGlzIHZhbHVlLlxuICogSWYgdGhlIGhhbmRsZXIgdGhyb3dzIGFuIGV4Y2VwdGlvbiwgdGhlIG5hdmlnYXRpb24gcHJvbWlzZSB3aWxsIGJlIHJlamVjdGVkIHdpdGhcbiAqIHRoZSBleGNlcHRpb24uXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgdHlwZSBFcnJvckhhbmRsZXIgPSAoZXJyb3I6IGFueSkgPT4gYW55O1xuXG5mdW5jdGlvbiBkZWZhdWx0RXJyb3JIYW5kbGVyKGVycm9yOiBhbnkpOiBhbnkge1xuICB0aHJvdyBlcnJvcjtcbn1cblxuZnVuY3Rpb24gZGVmYXVsdE1hbGZvcm1lZFVyaUVycm9ySGFuZGxlcihcbiAgICBlcnJvcjogVVJJRXJyb3IsIHVybFNlcmlhbGl6ZXI6IFVybFNlcmlhbGl6ZXIsIHVybDogc3RyaW5nKTogVXJsVHJlZSB7XG4gIHJldHVybiB1cmxTZXJpYWxpemVyLnBhcnNlKCcvJyk7XG59XG5cbmV4cG9ydCB0eXBlIFJlc3RvcmVkU3RhdGUgPSB7XG4gIFtrOiBzdHJpbmddOiBhbnk7IG5hdmlnYXRpb25JZDogbnVtYmVyO1xufTtcblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBJbmZvcm1hdGlvbiBhYm91dCBhbnkgZ2l2ZW4gbmF2aWdhdGlvbi4gVGhpcyBpbmZvcm1hdGlvbiBjYW4gYmUgZ290dGVuIGZyb20gdGhlIHJvdXRlciBhdFxuICogYW55IHRpbWUgdXNpbmcgdGhlIGByb3V0ZXIuZ2V0Q3VycmVudE5hdmlnYXRpb24oKWAgbWV0aG9kLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IHR5cGUgTmF2aWdhdGlvbiA9IHtcbiAgLyoqXG4gICAqIFRoZSBJRCBvZiB0aGUgY3VycmVudCBuYXZpZ2F0aW9uLlxuICAgKi9cbiAgaWQ6IG51bWJlcjtcbiAgLyoqXG4gICAqIFRhcmdldCBVUkwgcGFzc2VkIGludG8gdGhlIHtAbGluayBSb3V0ZXIjbmF2aWdhdGVCeVVybH0gY2FsbCBiZWZvcmUgbmF2aWdhdGlvbi4gVGhpcyBpc1xuICAgKiB0aGUgdmFsdWUgYmVmb3JlIHRoZSByb3V0ZXIgaGFzIHBhcnNlZCBvciBhcHBsaWVkIHJlZGlyZWN0cyB0byBpdC5cbiAgICovXG4gIGluaXRpYWxVcmw6IHN0cmluZyB8IFVybFRyZWU7XG4gIC8qKlxuICAgKiBUaGUgaW5pdGlhbCB0YXJnZXQgVVJMIGFmdGVyIGJlaW5nIHBhcnNlZCB3aXRoIHtAbGluayBVcmxTZXJpYWxpemVyLmV4dHJhY3QoKX0uXG4gICAqL1xuICBleHRyYWN0ZWRVcmw6IFVybFRyZWU7XG4gIC8qKlxuICAgKiBFeHRyYWN0ZWQgVVJMIGFmdGVyIHJlZGlyZWN0cyBoYXZlIGJlZW4gYXBwbGllZC4gVGhpcyBVUkwgbWF5IG5vdCBiZSBhdmFpbGFibGUgaW1tZWRpYXRlbHksXG4gICAqIHRoZXJlZm9yZSB0aGlzIHByb3BlcnR5IGNhbiBiZSBgdW5kZWZpbmVkYC4gSXQgaXMgZ3VhcmFudGVlZCB0byBiZSBzZXQgYWZ0ZXIgdGhlXG4gICAqIHtAbGluayBSb3V0ZXNSZWNvZ25pemVkfSBldmVudCBmaXJlcy5cbiAgICovXG4gIGZpbmFsVXJsPzogVXJsVHJlZTtcbiAgLyoqXG4gICAqIElkZW50aWZpZXMgdGhlIHRyaWdnZXIgb2YgdGhlIG5hdmlnYXRpb24uXG4gICAqXG4gICAqICogJ2ltcGVyYXRpdmUnLS10cmlnZ2VyZWQgYnkgYHJvdXRlci5uYXZpZ2F0ZUJ5VXJsYCBvciBgcm91dGVyLm5hdmlnYXRlYC5cbiAgICogKiAncG9wc3RhdGUnLS10cmlnZ2VyZWQgYnkgYSBwb3BzdGF0ZSBldmVudFxuICAgKiAqICdoYXNoY2hhbmdlJy0tdHJpZ2dlcmVkIGJ5IGEgaGFzaGNoYW5nZSBldmVudFxuICAgKi9cbiAgdHJpZ2dlcjogJ2ltcGVyYXRpdmUnIHwgJ3BvcHN0YXRlJyB8ICdoYXNoY2hhbmdlJztcbiAgLyoqXG4gICAqIFRoZSBOYXZpZ2F0aW9uRXh0cmFzIHVzZWQgaW4gdGhpcyBuYXZpZ2F0aW9uLiBTZWUge0BsaW5rIE5hdmlnYXRpb25FeHRyYXN9IGZvciBtb3JlIGluZm8uXG4gICAqL1xuICBleHRyYXM6IE5hdmlnYXRpb25FeHRyYXM7XG4gIC8qKlxuICAgKiBQcmV2aW91c2x5IHN1Y2Nlc3NmdWwgTmF2aWdhdGlvbiBvYmplY3QuIE9ubHkgYSBzaW5nbGUgcHJldmlvdXMgTmF2aWdhdGlvbiBpcyBhdmFpbGFibGUsXG4gICAqIHRoZXJlZm9yZSB0aGlzIHByZXZpb3VzIE5hdmlnYXRpb24gd2lsbCBhbHdheXMgaGF2ZSBhIGBudWxsYCB2YWx1ZSBmb3IgYHByZXZpb3VzTmF2aWdhdGlvbmAuXG4gICAqL1xuICBwcmV2aW91c05hdmlnYXRpb246IE5hdmlnYXRpb24gfCBudWxsO1xufTtcblxuZXhwb3J0IHR5cGUgTmF2aWdhdGlvblRyYW5zaXRpb24gPSB7XG4gIGlkOiBudW1iZXIsXG4gIGN1cnJlbnRVcmxUcmVlOiBVcmxUcmVlLFxuICBjdXJyZW50UmF3VXJsOiBVcmxUcmVlLFxuICBleHRyYWN0ZWRVcmw6IFVybFRyZWUsXG4gIHVybEFmdGVyUmVkaXJlY3RzOiBVcmxUcmVlLFxuICByYXdVcmw6IFVybFRyZWUsXG4gIGV4dHJhczogTmF2aWdhdGlvbkV4dHJhcyxcbiAgcmVzb2x2ZTogYW55LFxuICByZWplY3Q6IGFueSxcbiAgcHJvbWlzZTogUHJvbWlzZTxib29sZWFuPixcbiAgc291cmNlOiBOYXZpZ2F0aW9uVHJpZ2dlcixcbiAgcmVzdG9yZWRTdGF0ZTogUmVzdG9yZWRTdGF0ZSB8IG51bGwsXG4gIGN1cnJlbnRTbmFwc2hvdDogUm91dGVyU3RhdGVTbmFwc2hvdCxcbiAgdGFyZ2V0U25hcHNob3Q6IFJvdXRlclN0YXRlU25hcHNob3QgfCBudWxsLFxuICBjdXJyZW50Um91dGVyU3RhdGU6IFJvdXRlclN0YXRlLFxuICB0YXJnZXRSb3V0ZXJTdGF0ZTogUm91dGVyU3RhdGUgfCBudWxsLFxuICBndWFyZHM6IENoZWNrcyxcbiAgZ3VhcmRzUmVzdWx0OiBib29sZWFuIHwgVXJsVHJlZSB8IG51bGwsXG59O1xuXG4vKipcbiAqIEBpbnRlcm5hbFxuICovXG5leHBvcnQgdHlwZSBSb3V0ZXJIb29rID0gKHNuYXBzaG90OiBSb3V0ZXJTdGF0ZVNuYXBzaG90LCBydW5FeHRyYXM6IHtcbiAgYXBwbGllZFVybFRyZWU6IFVybFRyZWUsXG4gIHJhd1VybFRyZWU6IFVybFRyZWUsXG4gIHNraXBMb2NhdGlvbkNoYW5nZTogYm9vbGVhbixcbiAgcmVwbGFjZVVybDogYm9vbGVhbixcbiAgbmF2aWdhdGlvbklkOiBudW1iZXJcbn0pID0+IE9ic2VydmFibGU8dm9pZD47XG5cbi8qKlxuICogQGludGVybmFsXG4gKi9cbmZ1bmN0aW9uIGRlZmF1bHRSb3V0ZXJIb29rKHNuYXBzaG90OiBSb3V0ZXJTdGF0ZVNuYXBzaG90LCBydW5FeHRyYXM6IHtcbiAgYXBwbGllZFVybFRyZWU6IFVybFRyZWUsXG4gIHJhd1VybFRyZWU6IFVybFRyZWUsXG4gIHNraXBMb2NhdGlvbkNoYW5nZTogYm9vbGVhbixcbiAgcmVwbGFjZVVybDogYm9vbGVhbixcbiAgbmF2aWdhdGlvbklkOiBudW1iZXJcbn0pOiBPYnNlcnZhYmxlPHZvaWQ+IHtcbiAgcmV0dXJuIG9mIChudWxsKSBhcyBhbnk7XG59XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogQW4gTmdNb2R1bGUgdGhhdCBwcm92aWRlcyBuYXZpZ2F0aW9uIGFuZCBVUkwgbWFuaXB1bGF0aW9uIGNhcGFiaWxpdGllcy5cbiAqXG4gKiBAc2VlIGBSb3V0ZWAuXG4gKiBAc2VlIFtSb3V0aW5nIGFuZCBOYXZpZ2F0aW9uIEd1aWRlXShndWlkZS9yb3V0ZXIpLlxuICpcbiAqIEBuZ01vZHVsZSBSb3V0ZXJNb2R1bGVcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBSb3V0ZXIge1xuICBwcml2YXRlIGN1cnJlbnRVcmxUcmVlOiBVcmxUcmVlO1xuICBwcml2YXRlIHJhd1VybFRyZWU6IFVybFRyZWU7XG4gIHByaXZhdGUgYnJvd3NlclVybFRyZWU6IFVybFRyZWU7XG4gIHByaXZhdGUgcmVhZG9ubHkgdHJhbnNpdGlvbnM6IEJlaGF2aW9yU3ViamVjdDxOYXZpZ2F0aW9uVHJhbnNpdGlvbj47XG4gIHByaXZhdGUgbmF2aWdhdGlvbnM6IE9ic2VydmFibGU8TmF2aWdhdGlvblRyYW5zaXRpb24+O1xuICBwcml2YXRlIGxhc3RTdWNjZXNzZnVsTmF2aWdhdGlvbjogTmF2aWdhdGlvbnxudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBjdXJyZW50TmF2aWdhdGlvbjogTmF2aWdhdGlvbnxudWxsID0gbnVsbDtcblxuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBsb2NhdGlvblN1YnNjcmlwdGlvbiAhOiBTdWJzY3JpcHRpb247XG4gIHByaXZhdGUgbmF2aWdhdGlvbklkOiBudW1iZXIgPSAwO1xuICBwcml2YXRlIGNvbmZpZ0xvYWRlcjogUm91dGVyQ29uZmlnTG9hZGVyO1xuICBwcml2YXRlIG5nTW9kdWxlOiBOZ01vZHVsZVJlZjxhbnk+O1xuICBwcml2YXRlIGNvbnNvbGU6IENvbnNvbGU7XG4gIHByaXZhdGUgaXNOZ1pvbmVFbmFibGVkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIEFuIGV2ZW50IHN0cmVhbSBmb3Igcm91dGluZyBldmVudHMgaW4gdGhpcyBOZ01vZHVsZS5cbiAgICovXG4gIHB1YmxpYyByZWFkb25seSBldmVudHM6IE9ic2VydmFibGU8RXZlbnQ+ID0gbmV3IFN1YmplY3Q8RXZlbnQ+KCk7XG4gIC8qKlxuICAgKiBUaGUgY3VycmVudCBzdGF0ZSBvZiByb3V0aW5nIGluIHRoaXMgTmdNb2R1bGUuXG4gICAqL1xuICBwdWJsaWMgcmVhZG9ubHkgcm91dGVyU3RhdGU6IFJvdXRlclN0YXRlO1xuXG4gIC8qKlxuICAgKiBBIGhhbmRsZXIgZm9yIG5hdmlnYXRpb24gZXJyb3JzIGluIHRoaXMgTmdNb2R1bGUuXG4gICAqL1xuICBlcnJvckhhbmRsZXI6IEVycm9ySGFuZGxlciA9IGRlZmF1bHRFcnJvckhhbmRsZXI7XG5cbiAgLyoqXG4gICAqIE1hbGZvcm1lZCB1cmkgZXJyb3IgaGFuZGxlciBpcyBpbnZva2VkIHdoZW4gYFJvdXRlci5wYXJzZVVybCh1cmwpYCB0aHJvd3MgYW5cbiAgICogZXJyb3IgZHVlIHRvIGNvbnRhaW5pbmcgYW4gaW52YWxpZCBjaGFyYWN0ZXIuIFRoZSBtb3N0IGNvbW1vbiBjYXNlIHdvdWxkIGJlIGEgYCVgIHNpZ25cbiAgICogdGhhdCdzIG5vdCBlbmNvZGVkIGFuZCBpcyBub3QgcGFydCBvZiBhIHBlcmNlbnQgZW5jb2RlZCBzZXF1ZW5jZS5cbiAgICovXG4gIG1hbGZvcm1lZFVyaUVycm9ySGFuZGxlcjpcbiAgICAgIChlcnJvcjogVVJJRXJyb3IsIHVybFNlcmlhbGl6ZXI6IFVybFNlcmlhbGl6ZXIsXG4gICAgICAgdXJsOiBzdHJpbmcpID0+IFVybFRyZWUgPSBkZWZhdWx0TWFsZm9ybWVkVXJpRXJyb3JIYW5kbGVyO1xuXG4gIC8qKlxuICAgKiBUcnVlIGlmIGF0IGxlYXN0IG9uZSBuYXZpZ2F0aW9uIGV2ZW50IGhhcyBvY2N1cnJlZCxcbiAgICogZmFsc2Ugb3RoZXJ3aXNlLlxuICAgKi9cbiAgbmF2aWdhdGVkOiBib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgbGFzdFN1Y2Nlc3NmdWxJZDogbnVtYmVyID0gLTE7XG5cbiAgLyoqXG4gICAqIEhvb2tzIHRoYXQgZW5hYmxlIHlvdSB0byBwYXVzZSBuYXZpZ2F0aW9uLFxuICAgKiBlaXRoZXIgYmVmb3JlIG9yIGFmdGVyIHRoZSBwcmVhY3RpdmF0aW9uIHBoYXNlLlxuICAgKiBVc2VkIGJ5IGBSb3V0ZXJNb2R1bGVgLlxuICAgKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIGhvb2tzOiB7YmVmb3JlUHJlYWN0aXZhdGlvbjogUm91dGVySG9vaywgYWZ0ZXJQcmVhY3RpdmF0aW9uOiBSb3V0ZXJIb29rfSA9IHtcbiAgICBiZWZvcmVQcmVhY3RpdmF0aW9uOiBkZWZhdWx0Um91dGVySG9vayxcbiAgICBhZnRlclByZWFjdGl2YXRpb246IGRlZmF1bHRSb3V0ZXJIb29rXG4gIH07XG5cbiAgLyoqXG4gICAqIEV4dHJhY3RzIGFuZCBtZXJnZXMgVVJMcy4gVXNlZCBmb3IgQW5ndWxhckpTIHRvIEFuZ3VsYXIgbWlncmF0aW9ucy5cbiAgICovXG4gIHVybEhhbmRsaW5nU3RyYXRlZ3k6IFVybEhhbmRsaW5nU3RyYXRlZ3kgPSBuZXcgRGVmYXVsdFVybEhhbmRsaW5nU3RyYXRlZ3koKTtcblxuICAvKipcbiAgICogVGhlIHN0cmF0ZWd5IGZvciByZS11c2luZyByb3V0ZXMuXG4gICAqL1xuICByb3V0ZVJldXNlU3RyYXRlZ3k6IFJvdXRlUmV1c2VTdHJhdGVneSA9IG5ldyBEZWZhdWx0Um91dGVSZXVzZVN0cmF0ZWd5KCk7XG5cbiAgLyoqXG4gICAqIEhvdyB0byBoYW5kbGUgYSBuYXZpZ2F0aW9uIHJlcXVlc3QgdG8gdGhlIGN1cnJlbnQgVVJMLiBPbmUgb2Y6XG4gICAqIC0gYCdpZ25vcmUnYCA6ICBUaGUgcm91dGVyIGlnbm9yZXMgdGhlIHJlcXVlc3QuXG4gICAqIC0gYCdyZWxvYWQnYCA6IFRoZSByb3V0ZXIgcmVsb2FkcyB0aGUgVVJMLiBVc2UgdG8gaW1wbGVtZW50IGEgXCJyZWZyZXNoXCIgZmVhdHVyZS5cbiAgICovXG4gIG9uU2FtZVVybE5hdmlnYXRpb246ICdyZWxvYWQnfCdpZ25vcmUnID0gJ2lnbm9yZSc7XG5cbiAgLyoqXG4gICAqIEhvdyB0byBtZXJnZSBwYXJhbWV0ZXJzLCBkYXRhLCBhbmQgcmVzb2x2ZWQgZGF0YSBmcm9tIHBhcmVudCB0byBjaGlsZFxuICAgKiByb3V0ZXMuIE9uZSBvZjpcbiAgICpcbiAgICogLSBgJ2VtcHR5T25seSdgIDogSW5oZXJpdCBwYXJlbnQgcGFyYW1ldGVycywgZGF0YSwgYW5kIHJlc29sdmVkIGRhdGFcbiAgICogZm9yIHBhdGgtbGVzcyBvciBjb21wb25lbnQtbGVzcyByb3V0ZXMuXG4gICAqIC0gYCdhbHdheXMnYCA6IEluaGVyaXQgcGFyZW50IHBhcmFtZXRlcnMsIGRhdGEsIGFuZCByZXNvbHZlZCBkYXRhXG4gICAqIGZvciBhbGwgY2hpbGQgcm91dGVzLlxuICAgKi9cbiAgcGFyYW1zSW5oZXJpdGFuY2VTdHJhdGVneTogJ2VtcHR5T25seSd8J2Fsd2F5cycgPSAnZW1wdHlPbmx5JztcblxuICAvKipcbiAgICogRGVmaW5lcyB3aGVuIHRoZSByb3V0ZXIgdXBkYXRlcyB0aGUgYnJvd3NlciBVUkwuIFRoZSBkZWZhdWx0IGJlaGF2aW9yIGlzIHRvIHVwZGF0ZSBhZnRlclxuICAgKiBzdWNjZXNzZnVsIG5hdmlnYXRpb24uIEhvd2V2ZXIsIHNvbWUgYXBwbGljYXRpb25zIG1heSBwcmVmZXIgYSBtb2RlIHdoZXJlIHRoZSBVUkwgZ2V0c1xuICAgKiB1cGRhdGVkIGF0IHRoZSBiZWdpbm5pbmcgb2YgbmF2aWdhdGlvbi4gVGhlIG1vc3QgY29tbW9uIHVzZSBjYXNlIHdvdWxkIGJlIHVwZGF0aW5nIHRoZVxuICAgKiBVUkwgZWFybHkgc28gaWYgbmF2aWdhdGlvbiBmYWlscywgeW91IGNhbiBzaG93IGFuIGVycm9yIG1lc3NhZ2Ugd2l0aCB0aGUgVVJMIHRoYXQgZmFpbGVkLlxuICAgKiBBdmFpbGFibGUgb3B0aW9ucyBhcmU6XG4gICAqXG4gICAqIC0gYCdkZWZlcnJlZCdgLCB0aGUgZGVmYXVsdCwgdXBkYXRlcyB0aGUgYnJvd3NlciBVUkwgYWZ0ZXIgbmF2aWdhdGlvbiBoYXMgZmluaXNoZWQuXG4gICAqIC0gYCdlYWdlcidgLCB1cGRhdGVzIGJyb3dzZXIgVVJMIGF0IHRoZSBiZWdpbm5pbmcgb2YgbmF2aWdhdGlvbi5cbiAgICovXG4gIHVybFVwZGF0ZVN0cmF0ZWd5OiAnZGVmZXJyZWQnfCdlYWdlcicgPSAnZGVmZXJyZWQnO1xuXG4gIC8qKlxuICAgKiBTZWUge0BsaW5rIFJvdXRlck1vZHVsZX0gZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gICAqL1xuICByZWxhdGl2ZUxpbmtSZXNvbHV0aW9uOiAnbGVnYWN5J3wnY29ycmVjdGVkJyA9ICdsZWdhY3knO1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIHRoZSByb3V0ZXIgc2VydmljZS5cbiAgICovXG4gIC8vIFRPRE86IHZzYXZraW4gbWFrZSBpbnRlcm5hbCBhZnRlciB0aGUgZmluYWwgaXMgb3V0LlxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgcm9vdENvbXBvbmVudFR5cGU6IFR5cGU8YW55PnxudWxsLCBwcml2YXRlIHVybFNlcmlhbGl6ZXI6IFVybFNlcmlhbGl6ZXIsXG4gICAgICBwcml2YXRlIHJvb3RDb250ZXh0czogQ2hpbGRyZW5PdXRsZXRDb250ZXh0cywgcHJpdmF0ZSBsb2NhdGlvbjogTG9jYXRpb24sIGluamVjdG9yOiBJbmplY3RvcixcbiAgICAgIGxvYWRlcjogTmdNb2R1bGVGYWN0b3J5TG9hZGVyLCBjb21waWxlcjogQ29tcGlsZXIsIHB1YmxpYyBjb25maWc6IFJvdXRlcykge1xuICAgIGNvbnN0IG9uTG9hZFN0YXJ0ID0gKHI6IFJvdXRlKSA9PiB0aGlzLnRyaWdnZXJFdmVudChuZXcgUm91dGVDb25maWdMb2FkU3RhcnQocikpO1xuICAgIGNvbnN0IG9uTG9hZEVuZCA9IChyOiBSb3V0ZSkgPT4gdGhpcy50cmlnZ2VyRXZlbnQobmV3IFJvdXRlQ29uZmlnTG9hZEVuZChyKSk7XG5cbiAgICB0aGlzLm5nTW9kdWxlID0gaW5qZWN0b3IuZ2V0KE5nTW9kdWxlUmVmKTtcbiAgICB0aGlzLmNvbnNvbGUgPSBpbmplY3Rvci5nZXQoQ29uc29sZSk7XG4gICAgY29uc3Qgbmdab25lID0gaW5qZWN0b3IuZ2V0KE5nWm9uZSk7XG4gICAgdGhpcy5pc05nWm9uZUVuYWJsZWQgPSBuZ1pvbmUgaW5zdGFuY2VvZiBOZ1pvbmU7XG5cbiAgICB0aGlzLnJlc2V0Q29uZmlnKGNvbmZpZyk7XG4gICAgdGhpcy5jdXJyZW50VXJsVHJlZSA9IGNyZWF0ZUVtcHR5VXJsVHJlZSgpO1xuICAgIHRoaXMucmF3VXJsVHJlZSA9IHRoaXMuY3VycmVudFVybFRyZWU7XG4gICAgdGhpcy5icm93c2VyVXJsVHJlZSA9IHRoaXMuY3VycmVudFVybFRyZWU7XG5cbiAgICB0aGlzLmNvbmZpZ0xvYWRlciA9IG5ldyBSb3V0ZXJDb25maWdMb2FkZXIobG9hZGVyLCBjb21waWxlciwgb25Mb2FkU3RhcnQsIG9uTG9hZEVuZCk7XG4gICAgdGhpcy5yb3V0ZXJTdGF0ZSA9IGNyZWF0ZUVtcHR5U3RhdGUodGhpcy5jdXJyZW50VXJsVHJlZSwgdGhpcy5yb290Q29tcG9uZW50VHlwZSk7XG5cbiAgICB0aGlzLnRyYW5zaXRpb25zID0gbmV3IEJlaGF2aW9yU3ViamVjdDxOYXZpZ2F0aW9uVHJhbnNpdGlvbj4oe1xuICAgICAgaWQ6IDAsXG4gICAgICBjdXJyZW50VXJsVHJlZTogdGhpcy5jdXJyZW50VXJsVHJlZSxcbiAgICAgIGN1cnJlbnRSYXdVcmw6IHRoaXMuY3VycmVudFVybFRyZWUsXG4gICAgICBleHRyYWN0ZWRVcmw6IHRoaXMudXJsSGFuZGxpbmdTdHJhdGVneS5leHRyYWN0KHRoaXMuY3VycmVudFVybFRyZWUpLFxuICAgICAgdXJsQWZ0ZXJSZWRpcmVjdHM6IHRoaXMudXJsSGFuZGxpbmdTdHJhdGVneS5leHRyYWN0KHRoaXMuY3VycmVudFVybFRyZWUpLFxuICAgICAgcmF3VXJsOiB0aGlzLmN1cnJlbnRVcmxUcmVlLFxuICAgICAgZXh0cmFzOiB7fSxcbiAgICAgIHJlc29sdmU6IG51bGwsXG4gICAgICByZWplY3Q6IG51bGwsXG4gICAgICBwcm9taXNlOiBQcm9taXNlLnJlc29sdmUodHJ1ZSksXG4gICAgICBzb3VyY2U6ICdpbXBlcmF0aXZlJyxcbiAgICAgIHJlc3RvcmVkU3RhdGU6IG51bGwsXG4gICAgICBjdXJyZW50U25hcHNob3Q6IHRoaXMucm91dGVyU3RhdGUuc25hcHNob3QsXG4gICAgICB0YXJnZXRTbmFwc2hvdDogbnVsbCxcbiAgICAgIGN1cnJlbnRSb3V0ZXJTdGF0ZTogdGhpcy5yb3V0ZXJTdGF0ZSxcbiAgICAgIHRhcmdldFJvdXRlclN0YXRlOiBudWxsLFxuICAgICAgZ3VhcmRzOiB7Y2FuQWN0aXZhdGVDaGVja3M6IFtdLCBjYW5EZWFjdGl2YXRlQ2hlY2tzOiBbXX0sXG4gICAgICBndWFyZHNSZXN1bHQ6IG51bGwsXG4gICAgfSk7XG4gICAgdGhpcy5uYXZpZ2F0aW9ucyA9IHRoaXMuc2V0dXBOYXZpZ2F0aW9ucyh0aGlzLnRyYW5zaXRpb25zKTtcblxuICAgIHRoaXMucHJvY2Vzc05hdmlnYXRpb25zKCk7XG4gIH1cblxuICBwcml2YXRlIHNldHVwTmF2aWdhdGlvbnModHJhbnNpdGlvbnM6IE9ic2VydmFibGU8TmF2aWdhdGlvblRyYW5zaXRpb24+KTpcbiAgICAgIE9ic2VydmFibGU8TmF2aWdhdGlvblRyYW5zaXRpb24+IHtcbiAgICBjb25zdCBldmVudHNTdWJqZWN0ID0gKHRoaXMuZXZlbnRzIGFzIFN1YmplY3Q8RXZlbnQ+KTtcbiAgICByZXR1cm4gdHJhbnNpdGlvbnMucGlwZShcbiAgICAgICAgZmlsdGVyKHQgPT4gdC5pZCAhPT0gMCksXG5cbiAgICAgICAgLy8gRXh0cmFjdCBVUkxcbiAgICAgICAgbWFwKHQgPT4gKHtcbiAgICAgICAgICAgICAgLi4udCwgZXh0cmFjdGVkVXJsOiB0aGlzLnVybEhhbmRsaW5nU3RyYXRlZ3kuZXh0cmFjdCh0LnJhd1VybClcbiAgICAgICAgICAgIH0gYXMgTmF2aWdhdGlvblRyYW5zaXRpb24pKSxcblxuICAgICAgICAvLyBTdG9yZSB0aGUgTmF2aWdhdGlvbiBvYmplY3RcbiAgICAgICAgdGFwKHQgPT4ge1xuICAgICAgICAgIHRoaXMuY3VycmVudE5hdmlnYXRpb24gPSB7XG4gICAgICAgICAgICBpZDogdC5pZCxcbiAgICAgICAgICAgIGluaXRpYWxVcmw6IHQuY3VycmVudFJhd1VybCxcbiAgICAgICAgICAgIGV4dHJhY3RlZFVybDogdC5leHRyYWN0ZWRVcmwsXG4gICAgICAgICAgICB0cmlnZ2VyOiB0LnNvdXJjZSxcbiAgICAgICAgICAgIGV4dHJhczogdC5leHRyYXMsXG4gICAgICAgICAgICBwcmV2aW91c05hdmlnYXRpb246IHRoaXMubGFzdFN1Y2Nlc3NmdWxOYXZpZ2F0aW9uID9cbiAgICAgICAgICAgICAgICB7Li4udGhpcy5sYXN0U3VjY2Vzc2Z1bE5hdmlnYXRpb24sIHByZXZpb3VzTmF2aWdhdGlvbjogbnVsbH0gOlxuICAgICAgICAgICAgICAgIG51bGxcbiAgICAgICAgICB9O1xuICAgICAgICB9KSxcblxuICAgICAgICAvLyBVc2luZyBzd2l0Y2hNYXAgc28gd2UgY2FuY2VsIGV4ZWN1dGluZyBuYXZpZ2F0aW9ucyB3aGVuIGEgbmV3IG9uZSBjb21lcyBpblxuICAgICAgICBzd2l0Y2hNYXAodCA9PiB7XG4gICAgICAgICAgbGV0IGNvbXBsZXRlZCA9IGZhbHNlO1xuICAgICAgICAgIGxldCBlcnJvcmVkID0gZmFsc2U7XG4gICAgICAgICAgcmV0dXJuIG9mICh0KS5waXBlKFxuICAgICAgICAgICAgICBzd2l0Y2hNYXAodCA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgdXJsVHJhbnNpdGlvbiA9XG4gICAgICAgICAgICAgICAgICAgICF0aGlzLm5hdmlnYXRlZCB8fCB0LmV4dHJhY3RlZFVybC50b1N0cmluZygpICE9PSB0aGlzLmJyb3dzZXJVcmxUcmVlLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgcHJvY2Vzc0N1cnJlbnRVcmwgPVxuICAgICAgICAgICAgICAgICAgICAodGhpcy5vblNhbWVVcmxOYXZpZ2F0aW9uID09PSAncmVsb2FkJyA/IHRydWUgOiB1cmxUcmFuc2l0aW9uKSAmJlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnVybEhhbmRsaW5nU3RyYXRlZ3kuc2hvdWxkUHJvY2Vzc1VybCh0LnJhd1VybCk7XG5cbiAgICAgICAgICAgICAgICBpZiAocHJvY2Vzc0N1cnJlbnRVcmwpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBvZiAodCkucGlwZShcbiAgICAgICAgICAgICAgICAgICAgICAvLyBGaXJlIE5hdmlnYXRpb25TdGFydCBldmVudFxuICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaE1hcCh0ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRyYW5zaXRpb24gPSB0aGlzLnRyYW5zaXRpb25zLmdldFZhbHVlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudHNTdWJqZWN0Lm5leHQobmV3IE5hdmlnYXRpb25TdGFydChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0LmlkLCB0aGlzLnNlcmlhbGl6ZVVybCh0LmV4dHJhY3RlZFVybCksIHQuc291cmNlLCB0LnJlc3RvcmVkU3RhdGUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0cmFuc2l0aW9uICE9PSB0aGlzLnRyYW5zaXRpb25zLmdldFZhbHVlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEVNUFRZO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFt0XTtcbiAgICAgICAgICAgICAgICAgICAgICB9KSxcblxuICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgZGVsYXkgaXMgcmVxdWlyZWQgdG8gbWF0Y2ggb2xkIGJlaGF2aW9yIHRoYXQgZm9yY2VkIG5hdmlnYXRpb24gdG9cbiAgICAgICAgICAgICAgICAgICAgICAvLyBhbHdheXMgYmUgYXN5bmNcbiAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2hNYXAodCA9PiBQcm9taXNlLnJlc29sdmUodCkpLFxuXG4gICAgICAgICAgICAgICAgICAgICAgLy8gQXBwbHlSZWRpcmVjdHNcbiAgICAgICAgICAgICAgICAgICAgICBhcHBseVJlZGlyZWN0cyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5uZ01vZHVsZS5pbmplY3RvciwgdGhpcy5jb25maWdMb2FkZXIsIHRoaXMudXJsU2VyaWFsaXplcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcpLFxuXG4gICAgICAgICAgICAgICAgICAgICAgLy8gVXBkYXRlIHRoZSBjdXJyZW50TmF2aWdhdGlvblxuICAgICAgICAgICAgICAgICAgICAgIHRhcCh0ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudE5hdmlnYXRpb24gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIC4uLnRoaXMuY3VycmVudE5hdmlnYXRpb24gISxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZmluYWxVcmw6IHQudXJsQWZ0ZXJSZWRpcmVjdHNcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgfSksXG5cbiAgICAgICAgICAgICAgICAgICAgICAvLyBSZWNvZ25pemVcbiAgICAgICAgICAgICAgICAgICAgICByZWNvZ25pemUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucm9vdENvbXBvbmVudFR5cGUsIHRoaXMuY29uZmlnLCAodXJsKSA9PiB0aGlzLnNlcmlhbGl6ZVVybCh1cmwpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmFtc0luaGVyaXRhbmNlU3RyYXRlZ3ksIHRoaXMucmVsYXRpdmVMaW5rUmVzb2x1dGlvbiksXG5cbiAgICAgICAgICAgICAgICAgICAgICAvLyBVcGRhdGUgVVJMIGlmIGluIGBlYWdlcmAgdXBkYXRlIG1vZGVcbiAgICAgICAgICAgICAgICAgICAgICB0YXAodCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy51cmxVcGRhdGVTdHJhdGVneSA9PT0gJ2VhZ2VyJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXQuZXh0cmFzLnNraXBMb2NhdGlvbkNoYW5nZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0QnJvd3NlclVybCh0LnVybEFmdGVyUmVkaXJlY3RzLCAhIXQuZXh0cmFzLnJlcGxhY2VVcmwsIHQuaWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYnJvd3NlclVybFRyZWUgPSB0LnVybEFmdGVyUmVkaXJlY3RzO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIH0pLFxuXG4gICAgICAgICAgICAgICAgICAgICAgLy8gRmlyZSBSb3V0ZXNSZWNvZ25pemVkXG4gICAgICAgICAgICAgICAgICAgICAgdGFwKHQgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgcm91dGVzUmVjb2duaXplZCA9IG5ldyBSb3V0ZXNSZWNvZ25pemVkKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHQuaWQsIHRoaXMuc2VyaWFsaXplVXJsKHQuZXh0cmFjdGVkVXJsKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlcmlhbGl6ZVVybCh0LnVybEFmdGVyUmVkaXJlY3RzKSwgdC50YXJnZXRTbmFwc2hvdCAhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50c1N1YmplY3QubmV4dChyb3V0ZXNSZWNvZ25pemVkKTtcbiAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IHByb2Nlc3NQcmV2aW91c1VybCA9IHVybFRyYW5zaXRpb24gJiYgdGhpcy5yYXdVcmxUcmVlICYmXG4gICAgICAgICAgICAgICAgICAgICAgdGhpcy51cmxIYW5kbGluZ1N0cmF0ZWd5LnNob3VsZFByb2Nlc3NVcmwodGhpcy5yYXdVcmxUcmVlKTtcbiAgICAgICAgICAgICAgICAgIC8qIFdoZW4gdGhlIGN1cnJlbnQgVVJMIHNob3VsZG4ndCBiZSBwcm9jZXNzZWQsIGJ1dCB0aGUgcHJldmlvdXMgb25lIHdhcywgd2VcbiAgICAgICAgICAgICAgICAgICAqIGhhbmRsZSB0aGlzIFwiZXJyb3IgY29uZGl0aW9uXCIgYnkgbmF2aWdhdGluZyB0byB0aGUgcHJldmlvdXNseSBzdWNjZXNzZnVsIFVSTCxcbiAgICAgICAgICAgICAgICAgICAqIGJ1dCBsZWF2aW5nIHRoZSBVUkwgaW50YWN0LiovXG4gICAgICAgICAgICAgICAgICBpZiAocHJvY2Vzc1ByZXZpb3VzVXJsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHtpZCwgZXh0cmFjdGVkVXJsLCBzb3VyY2UsIHJlc3RvcmVkU3RhdGUsIGV4dHJhc30gPSB0O1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBuYXZTdGFydCA9IG5ldyBOYXZpZ2F0aW9uU3RhcnQoXG4gICAgICAgICAgICAgICAgICAgICAgICBpZCwgdGhpcy5zZXJpYWxpemVVcmwoZXh0cmFjdGVkVXJsKSwgc291cmNlLCByZXN0b3JlZFN0YXRlKTtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRzU3ViamVjdC5uZXh0KG5hdlN0YXJ0KTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdGFyZ2V0U25hcHNob3QgPVxuICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlRW1wdHlTdGF0ZShleHRyYWN0ZWRVcmwsIHRoaXMucm9vdENvbXBvbmVudFR5cGUpLnNuYXBzaG90O1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBvZiAoe1xuICAgICAgICAgICAgICAgICAgICAgIC4uLnQsXG4gICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0U25hcHNob3QsXG4gICAgICAgICAgICAgICAgICAgICAgdXJsQWZ0ZXJSZWRpcmVjdHM6IGV4dHJhY3RlZFVybCxcbiAgICAgICAgICAgICAgICAgICAgICBleHRyYXM6IHsuLi5leHRyYXMsIHNraXBMb2NhdGlvbkNoYW5nZTogZmFsc2UsIHJlcGxhY2VVcmw6IGZhbHNlfSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvKiBXaGVuIG5laXRoZXIgdGhlIGN1cnJlbnQgb3IgcHJldmlvdXMgVVJMIGNhbiBiZSBwcm9jZXNzZWQsIGRvIG5vdGhpbmcgb3RoZXJcbiAgICAgICAgICAgICAgICAgICAgICogdGhhbiB1cGRhdGUgcm91dGVyJ3MgaW50ZXJuYWwgcmVmZXJlbmNlIHRvIHRoZSBjdXJyZW50IFwic2V0dGxlZFwiIFVSTC4gVGhpc1xuICAgICAgICAgICAgICAgICAgICAgKiB3YXkgdGhlIG5leHQgbmF2aWdhdGlvbiB3aWxsIGJlIGNvbWluZyBmcm9tIHRoZSBjdXJyZW50IFVSTCBpbiB0aGUgYnJvd3Nlci5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmF3VXJsVHJlZSA9IHQucmF3VXJsO1xuICAgICAgICAgICAgICAgICAgICB0LnJlc29sdmUobnVsbCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBFTVBUWTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pLFxuXG4gICAgICAgICAgICAgIC8vIEJlZm9yZSBQcmVhY3RpdmF0aW9uXG4gICAgICAgICAgICAgIHN3aXRjaFRhcCh0ID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB7XG4gICAgICAgICAgICAgICAgICB0YXJnZXRTbmFwc2hvdCxcbiAgICAgICAgICAgICAgICAgIGlkOiBuYXZpZ2F0aW9uSWQsXG4gICAgICAgICAgICAgICAgICBleHRyYWN0ZWRVcmw6IGFwcGxpZWRVcmxUcmVlLFxuICAgICAgICAgICAgICAgICAgcmF3VXJsOiByYXdVcmxUcmVlLFxuICAgICAgICAgICAgICAgICAgZXh0cmFzOiB7c2tpcExvY2F0aW9uQ2hhbmdlLCByZXBsYWNlVXJsfVxuICAgICAgICAgICAgICAgIH0gPSB0O1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmhvb2tzLmJlZm9yZVByZWFjdGl2YXRpb24odGFyZ2V0U25hcHNob3QgISwge1xuICAgICAgICAgICAgICAgICAgbmF2aWdhdGlvbklkLFxuICAgICAgICAgICAgICAgICAgYXBwbGllZFVybFRyZWUsXG4gICAgICAgICAgICAgICAgICByYXdVcmxUcmVlLFxuICAgICAgICAgICAgICAgICAgc2tpcExvY2F0aW9uQ2hhbmdlOiAhIXNraXBMb2NhdGlvbkNoYW5nZSxcbiAgICAgICAgICAgICAgICAgIHJlcGxhY2VVcmw6ICEhcmVwbGFjZVVybCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfSksXG5cbiAgICAgICAgICAgICAgLy8gLS0tIEdVQVJEUyAtLS1cbiAgICAgICAgICAgICAgdGFwKHQgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGd1YXJkc1N0YXJ0ID0gbmV3IEd1YXJkc0NoZWNrU3RhcnQoXG4gICAgICAgICAgICAgICAgICAgIHQuaWQsIHRoaXMuc2VyaWFsaXplVXJsKHQuZXh0cmFjdGVkVXJsKSwgdGhpcy5zZXJpYWxpemVVcmwodC51cmxBZnRlclJlZGlyZWN0cyksXG4gICAgICAgICAgICAgICAgICAgIHQudGFyZ2V0U25hcHNob3QgISk7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyRXZlbnQoZ3VhcmRzU3RhcnQpO1xuICAgICAgICAgICAgICB9KSxcblxuICAgICAgICAgICAgICBtYXAodCA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAuLi50LFxuICAgICAgICAgICAgICAgICAgICBndWFyZHM6XG4gICAgICAgICAgICAgICAgICAgICAgICBnZXRBbGxSb3V0ZUd1YXJkcyh0LnRhcmdldFNuYXBzaG90ICEsIHQuY3VycmVudFNuYXBzaG90LCB0aGlzLnJvb3RDb250ZXh0cylcbiAgICAgICAgICAgICAgICAgIH0pKSxcblxuICAgICAgICAgICAgICBjaGVja0d1YXJkcyh0aGlzLm5nTW9kdWxlLmluamVjdG9yLCAoZXZ0OiBFdmVudCkgPT4gdGhpcy50cmlnZ2VyRXZlbnQoZXZ0KSksXG4gICAgICAgICAgICAgIHRhcCh0ID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoaXNVcmxUcmVlKHQuZ3VhcmRzUmVzdWx0KSkge1xuICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3I6IEVycm9yJnt1cmw/OiBVcmxUcmVlfSA9IG5hdmlnYXRpb25DYW5jZWxpbmdFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICBgUmVkaXJlY3RpbmcgdG8gXCIke3RoaXMuc2VyaWFsaXplVXJsKHQuZ3VhcmRzUmVzdWx0KX1cImApO1xuICAgICAgICAgICAgICAgICAgZXJyb3IudXJsID0gdC5ndWFyZHNSZXN1bHQ7XG4gICAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pLFxuXG4gICAgICAgICAgICAgIHRhcCh0ID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBndWFyZHNFbmQgPSBuZXcgR3VhcmRzQ2hlY2tFbmQoXG4gICAgICAgICAgICAgICAgICAgIHQuaWQsIHRoaXMuc2VyaWFsaXplVXJsKHQuZXh0cmFjdGVkVXJsKSwgdGhpcy5zZXJpYWxpemVVcmwodC51cmxBZnRlclJlZGlyZWN0cyksXG4gICAgICAgICAgICAgICAgICAgIHQudGFyZ2V0U25hcHNob3QgISwgISF0Lmd1YXJkc1Jlc3VsdCk7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyRXZlbnQoZ3VhcmRzRW5kKTtcbiAgICAgICAgICAgICAgfSksXG5cbiAgICAgICAgICAgICAgZmlsdGVyKHQgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghdC5ndWFyZHNSZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgIHRoaXMucmVzZXRVcmxUb0N1cnJlbnRVcmxUcmVlKCk7XG4gICAgICAgICAgICAgICAgICBjb25zdCBuYXZDYW5jZWwgPVxuICAgICAgICAgICAgICAgICAgICAgIG5ldyBOYXZpZ2F0aW9uQ2FuY2VsKHQuaWQsIHRoaXMuc2VyaWFsaXplVXJsKHQuZXh0cmFjdGVkVXJsKSwgJycpO1xuICAgICAgICAgICAgICAgICAgZXZlbnRzU3ViamVjdC5uZXh0KG5hdkNhbmNlbCk7XG4gICAgICAgICAgICAgICAgICB0LnJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgfSksXG5cbiAgICAgICAgICAgICAgLy8gLS0tIFJFU09MVkUgLS0tXG4gICAgICAgICAgICAgIHN3aXRjaFRhcCh0ID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodC5ndWFyZHMuY2FuQWN0aXZhdGVDaGVja3MubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gb2YgKHQpLnBpcGUoXG4gICAgICAgICAgICAgICAgICAgICAgdGFwKHQgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzb2x2ZVN0YXJ0ID0gbmV3IFJlc29sdmVTdGFydChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0LmlkLCB0aGlzLnNlcmlhbGl6ZVVybCh0LmV4dHJhY3RlZFVybCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXJpYWxpemVVcmwodC51cmxBZnRlclJlZGlyZWN0cyksIHQudGFyZ2V0U25hcHNob3QgISk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJFdmVudChyZXNvbHZlU3RhcnQpO1xuICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmVEYXRhKFxuICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmFtc0luaGVyaXRhbmNlU3RyYXRlZ3ksXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubmdNb2R1bGUuaW5qZWN0b3IpLCAgLy9cbiAgICAgICAgICAgICAgICAgICAgICB0YXAodCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZXNvbHZlRW5kID0gbmV3IFJlc29sdmVFbmQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdC5pZCwgdGhpcy5zZXJpYWxpemVVcmwodC5leHRyYWN0ZWRVcmwpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2VyaWFsaXplVXJsKHQudXJsQWZ0ZXJSZWRpcmVjdHMpLCB0LnRhcmdldFNuYXBzaG90ICEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyRXZlbnQocmVzb2x2ZUVuZCk7XG4gICAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICB9KSxcblxuICAgICAgICAgICAgICAvLyAtLS0gQUZURVIgUFJFQUNUSVZBVElPTiAtLS1cbiAgICAgICAgICAgICAgc3dpdGNoVGFwKCh0OiBOYXZpZ2F0aW9uVHJhbnNpdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHtcbiAgICAgICAgICAgICAgICAgIHRhcmdldFNuYXBzaG90LFxuICAgICAgICAgICAgICAgICAgaWQ6IG5hdmlnYXRpb25JZCxcbiAgICAgICAgICAgICAgICAgIGV4dHJhY3RlZFVybDogYXBwbGllZFVybFRyZWUsXG4gICAgICAgICAgICAgICAgICByYXdVcmw6IHJhd1VybFRyZWUsXG4gICAgICAgICAgICAgICAgICBleHRyYXM6IHtza2lwTG9jYXRpb25DaGFuZ2UsIHJlcGxhY2VVcmx9XG4gICAgICAgICAgICAgICAgfSA9IHQ7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaG9va3MuYWZ0ZXJQcmVhY3RpdmF0aW9uKHRhcmdldFNuYXBzaG90ICEsIHtcbiAgICAgICAgICAgICAgICAgIG5hdmlnYXRpb25JZCxcbiAgICAgICAgICAgICAgICAgIGFwcGxpZWRVcmxUcmVlLFxuICAgICAgICAgICAgICAgICAgcmF3VXJsVHJlZSxcbiAgICAgICAgICAgICAgICAgIHNraXBMb2NhdGlvbkNoYW5nZTogISFza2lwTG9jYXRpb25DaGFuZ2UsXG4gICAgICAgICAgICAgICAgICByZXBsYWNlVXJsOiAhIXJlcGxhY2VVcmwsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH0pLFxuXG4gICAgICAgICAgICAgIG1hcCgodDogTmF2aWdhdGlvblRyYW5zaXRpb24pID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB0YXJnZXRSb3V0ZXJTdGF0ZSA9IGNyZWF0ZVJvdXRlclN0YXRlKFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJvdXRlUmV1c2VTdHJhdGVneSwgdC50YXJnZXRTbmFwc2hvdCAhLCB0LmN1cnJlbnRSb3V0ZXJTdGF0ZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuICh7Li4udCwgdGFyZ2V0Um91dGVyU3RhdGV9KTtcbiAgICAgICAgICAgICAgfSksXG5cbiAgICAgICAgICAgICAgLyogT25jZSBoZXJlLCB3ZSBhcmUgYWJvdXQgdG8gYWN0aXZhdGUgc3luY3Jvbm91c2x5LiBUaGUgYXNzdW1wdGlvbiBpcyB0aGlzIHdpbGxcbiAgICAgICAgICAgICAgICAgc3VjY2VlZCwgYW5kIHVzZXIgY29kZSBtYXkgcmVhZCBmcm9tIHRoZSBSb3V0ZXIgc2VydmljZS4gVGhlcmVmb3JlIGJlZm9yZVxuICAgICAgICAgICAgICAgICBhY3RpdmF0aW9uLCB3ZSBuZWVkIHRvIHVwZGF0ZSByb3V0ZXIgcHJvcGVydGllcyBzdG9yaW5nIHRoZSBjdXJyZW50IFVSTCBhbmQgdGhlXG4gICAgICAgICAgICAgICAgIFJvdXRlclN0YXRlLCBhcyB3ZWxsIGFzIHVwZGF0ZWQgdGhlIGJyb3dzZXIgVVJMLiBBbGwgdGhpcyBzaG91bGQgaGFwcGVuICpiZWZvcmUqXG4gICAgICAgICAgICAgICAgIGFjdGl2YXRpbmcuICovXG4gICAgICAgICAgICAgIHRhcCgodDogTmF2aWdhdGlvblRyYW5zaXRpb24pID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRVcmxUcmVlID0gdC51cmxBZnRlclJlZGlyZWN0cztcbiAgICAgICAgICAgICAgICB0aGlzLnJhd1VybFRyZWUgPSB0aGlzLnVybEhhbmRsaW5nU3RyYXRlZ3kubWVyZ2UodGhpcy5jdXJyZW50VXJsVHJlZSwgdC5yYXdVcmwpO1xuXG4gICAgICAgICAgICAgICAgKHRoaXMgYXN7cm91dGVyU3RhdGU6IFJvdXRlclN0YXRlfSkucm91dGVyU3RhdGUgPSB0LnRhcmdldFJvdXRlclN0YXRlICE7XG5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy51cmxVcGRhdGVTdHJhdGVneSA9PT0gJ2RlZmVycmVkJykge1xuICAgICAgICAgICAgICAgICAgaWYgKCF0LmV4dHJhcy5za2lwTG9jYXRpb25DaGFuZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRCcm93c2VyVXJsKFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yYXdVcmxUcmVlLCAhIXQuZXh0cmFzLnJlcGxhY2VVcmwsIHQuaWQsIHQuZXh0cmFzLnN0YXRlKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIHRoaXMuYnJvd3NlclVybFRyZWUgPSB0LnVybEFmdGVyUmVkaXJlY3RzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSksXG5cbiAgICAgICAgICAgICAgYWN0aXZhdGVSb3V0ZXMoXG4gICAgICAgICAgICAgICAgICB0aGlzLnJvb3RDb250ZXh0cywgdGhpcy5yb3V0ZVJldXNlU3RyYXRlZ3ksXG4gICAgICAgICAgICAgICAgICAoZXZ0OiBFdmVudCkgPT4gdGhpcy50cmlnZ2VyRXZlbnQoZXZ0KSksXG5cbiAgICAgICAgICAgICAgdGFwKHtuZXh0KCkgeyBjb21wbGV0ZWQgPSB0cnVlOyB9LCBjb21wbGV0ZSgpIHsgY29tcGxldGVkID0gdHJ1ZTsgfX0pLFxuICAgICAgICAgICAgICBmaW5hbGl6ZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgLyogV2hlbiB0aGUgbmF2aWdhdGlvbiBzdHJlYW0gZmluaXNoZXMgZWl0aGVyIHRocm91Z2ggZXJyb3Igb3Igc3VjY2Vzcywgd2Ugc2V0IHRoZVxuICAgICAgICAgICAgICAgICAqIGBjb21wbGV0ZWRgIG9yIGBlcnJvcmVkYCBmbGFnLiBIb3dldmVyLCB0aGVyZSBhcmUgc29tZSBzaXR1YXRpb25zIHdoZXJlIHdlIGNvdWxkXG4gICAgICAgICAgICAgICAgICogZ2V0IGhlcmUgd2l0aG91dCBlaXRoZXIgb2YgdGhvc2UgYmVpbmcgc2V0LiBGb3IgaW5zdGFuY2UsIGEgcmVkaXJlY3QgZHVyaW5nXG4gICAgICAgICAgICAgICAgICogTmF2aWdhdGlvblN0YXJ0LiBUaGVyZWZvcmUsIHRoaXMgaXMgYSBjYXRjaC1hbGwgdG8gbWFrZSBzdXJlIHRoZSBOYXZpZ2F0aW9uQ2FuY2VsXG4gICAgICAgICAgICAgICAgICogZXZlbnQgaXMgZmlyZWQgd2hlbiBhIG5hdmlnYXRpb24gZ2V0cyBjYW5jZWxsZWQgYnV0IG5vdCBjYXVnaHQgYnkgb3RoZXIgbWVhbnMuICovXG4gICAgICAgICAgICAgICAgaWYgKCFjb21wbGV0ZWQgJiYgIWVycm9yZWQpIHtcbiAgICAgICAgICAgICAgICAgIC8vIE11c3QgcmVzZXQgdG8gY3VycmVudCBVUkwgdHJlZSBoZXJlIHRvIGVuc3VyZSBoaXN0b3J5LnN0YXRlIGlzIHNldC4gT24gYSBmcmVzaFxuICAgICAgICAgICAgICAgICAgLy8gcGFnZSBsb2FkLCBpZiBhIG5ldyBuYXZpZ2F0aW9uIGNvbWVzIGluIGJlZm9yZSBhIHN1Y2Nlc3NmdWwgbmF2aWdhdGlvblxuICAgICAgICAgICAgICAgICAgLy8gY29tcGxldGVzLCB0aGVyZSB3aWxsIGJlIG5vdGhpbmcgaW4gaGlzdG9yeS5zdGF0ZS5uYXZpZ2F0aW9uSWQuIFRoaXMgY2FuIGNhdXNlXG4gICAgICAgICAgICAgICAgICAvLyBzeW5jIHByb2JsZW1zIHdpdGggQW5ndWxhckpTIHN5bmMgY29kZSB3aGljaCBsb29rcyBmb3IgYSB2YWx1ZSBoZXJlIGluIG9yZGVyXG4gICAgICAgICAgICAgICAgICAvLyB0byBkZXRlcm1pbmUgd2hldGhlciBvciBub3QgdG8gaGFuZGxlIGEgZ2l2ZW4gcG9wc3RhdGUgZXZlbnQgb3IgdG8gbGVhdmUgaXRcbiAgICAgICAgICAgICAgICAgIC8vIHRvIHRoZSBBbmd1YWxyIHJvdXRlci5cbiAgICAgICAgICAgICAgICAgIHRoaXMucmVzZXRVcmxUb0N1cnJlbnRVcmxUcmVlKCk7XG4gICAgICAgICAgICAgICAgICBjb25zdCBuYXZDYW5jZWwgPSBuZXcgTmF2aWdhdGlvbkNhbmNlbChcbiAgICAgICAgICAgICAgICAgICAgICB0LmlkLCB0aGlzLnNlcmlhbGl6ZVVybCh0LmV4dHJhY3RlZFVybCksXG4gICAgICAgICAgICAgICAgICAgICAgYE5hdmlnYXRpb24gSUQgJHt0LmlkfSBpcyBub3QgZXF1YWwgdG8gdGhlIGN1cnJlbnQgbmF2aWdhdGlvbiBpZCAke3RoaXMubmF2aWdhdGlvbklkfWApO1xuICAgICAgICAgICAgICAgICAgZXZlbnRzU3ViamVjdC5uZXh0KG5hdkNhbmNlbCk7XG4gICAgICAgICAgICAgICAgICB0LnJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBjdXJyZW50TmF2aWdhdGlvbiBzaG91bGQgYWx3YXlzIGJlIHJlc2V0IHRvIG51bGwgaGVyZS4gSWYgbmF2aWdhdGlvbiB3YXNcbiAgICAgICAgICAgICAgICAvLyBzdWNjZXNzZnVsLCBsYXN0U3VjY2Vzc2Z1bFRyYW5zaXRpb24gd2lsbCBoYXZlIGFscmVhZHkgYmVlbiBzZXQuIFRoZXJlZm9yZSB3ZVxuICAgICAgICAgICAgICAgIC8vIGNhbiBzYWZlbHkgc2V0IGN1cnJlbnROYXZpZ2F0aW9uIHRvIG51bGwgaGVyZS5cbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnROYXZpZ2F0aW9uID0gbnVsbDtcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgIGNhdGNoRXJyb3IoKGUpID0+IHtcbiAgICAgICAgICAgICAgICBlcnJvcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAvKiBUaGlzIGVycm9yIHR5cGUgaXMgaXNzdWVkIGR1cmluZyBSZWRpcmVjdCwgYW5kIGlzIGhhbmRsZWQgYXMgYSBjYW5jZWxsYXRpb25cbiAgICAgICAgICAgICAgICAgKiByYXRoZXIgdGhhbiBhbiBlcnJvci4gKi9cbiAgICAgICAgICAgICAgICBpZiAoaXNOYXZpZ2F0aW9uQ2FuY2VsaW5nRXJyb3IoZSkpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IHJlZGlyZWN0aW5nID0gaXNVcmxUcmVlKGUudXJsKTtcbiAgICAgICAgICAgICAgICAgIGlmICghcmVkaXJlY3RpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU2V0IHByb3BlcnR5IG9ubHkgaWYgd2UncmUgbm90IHJlZGlyZWN0aW5nLiBJZiB3ZSBsYW5kZWQgb24gYSBwYWdlIGFuZFxuICAgICAgICAgICAgICAgICAgICAvLyByZWRpcmVjdCB0byBgL2Agcm91dGUsIHRoZSBuZXcgbmF2aWdhdGlvbiBpcyBnb2luZyB0byBzZWUgdGhlIGAvYCBpc24ndFxuICAgICAgICAgICAgICAgICAgICAvLyBhIGNoYW5nZSBmcm9tIHRoZSBkZWZhdWx0IGN1cnJlbnRVcmxUcmVlIGFuZCB3b24ndCBuYXZpZ2F0ZS4gVGhpcyBpc1xuICAgICAgICAgICAgICAgICAgICAvLyBvbmx5IGFwcGxpY2FibGUgd2l0aCBpbml0aWFsIG5hdmlnYXRpb24sIHNvIHNldHRpbmcgYG5hdmlnYXRlZGAgb25seSB3aGVuXG4gICAgICAgICAgICAgICAgICAgIC8vIG5vdCByZWRpcmVjdGluZyByZXNvbHZlcyB0aGlzIHNjZW5hcmlvLlxuICAgICAgICAgICAgICAgICAgICB0aGlzLm5hdmlnYXRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVzZXRTdGF0ZUFuZFVybCh0LmN1cnJlbnRSb3V0ZXJTdGF0ZSwgdC5jdXJyZW50VXJsVHJlZSwgdC5yYXdVcmwpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgY29uc3QgbmF2Q2FuY2VsID1cbiAgICAgICAgICAgICAgICAgICAgICBuZXcgTmF2aWdhdGlvbkNhbmNlbCh0LmlkLCB0aGlzLnNlcmlhbGl6ZVVybCh0LmV4dHJhY3RlZFVybCksIGUubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICBldmVudHNTdWJqZWN0Lm5leHQobmF2Q2FuY2VsKTtcbiAgICAgICAgICAgICAgICAgIHQucmVzb2x2ZShmYWxzZSk7XG5cbiAgICAgICAgICAgICAgICAgIGlmIChyZWRpcmVjdGluZykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm5hdmlnYXRlQnlVcmwoZS51cmwpO1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAvKiBBbGwgb3RoZXIgZXJyb3JzIHNob3VsZCByZXNldCB0byB0aGUgcm91dGVyJ3MgaW50ZXJuYWwgVVJMIHJlZmVyZW5jZSB0byB0aGVcbiAgICAgICAgICAgICAgICAgICAqIHByZS1lcnJvciBzdGF0ZS4gKi9cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgdGhpcy5yZXNldFN0YXRlQW5kVXJsKHQuY3VycmVudFJvdXRlclN0YXRlLCB0LmN1cnJlbnRVcmxUcmVlLCB0LnJhd1VybCk7XG4gICAgICAgICAgICAgICAgICBjb25zdCBuYXZFcnJvciA9IG5ldyBOYXZpZ2F0aW9uRXJyb3IodC5pZCwgdGhpcy5zZXJpYWxpemVVcmwodC5leHRyYWN0ZWRVcmwpLCBlKTtcbiAgICAgICAgICAgICAgICAgIGV2ZW50c1N1YmplY3QubmV4dChuYXZFcnJvcik7XG4gICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICB0LnJlc29sdmUodGhpcy5lcnJvckhhbmRsZXIoZSkpO1xuICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdC5yZWplY3QoZWUpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gRU1QVFk7XG4gICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAvLyBUT0RPKGphc29uYWRlbik6IHJlbW92ZSBjYXN0IG9uY2UgZzMgaXMgb24gdXBkYXRlZCBUeXBlU2NyaXB0XG4gICAgICAgIH0pKSBhcyBhbnkgYXMgT2JzZXJ2YWJsZTxOYXZpZ2F0aW9uVHJhbnNpdGlvbj47XG4gIH1cblxuICAvKipcbiAgICogQGludGVybmFsXG4gICAqIFRPRE86IHRoaXMgc2hvdWxkIGJlIHJlbW92ZWQgb25jZSB0aGUgY29uc3RydWN0b3Igb2YgdGhlIHJvdXRlciBtYWRlIGludGVybmFsXG4gICAqL1xuICByZXNldFJvb3RDb21wb25lbnRUeXBlKHJvb3RDb21wb25lbnRUeXBlOiBUeXBlPGFueT4pOiB2b2lkIHtcbiAgICB0aGlzLnJvb3RDb21wb25lbnRUeXBlID0gcm9vdENvbXBvbmVudFR5cGU7XG4gICAgLy8gVE9ETzogdnNhdmtpbiByb3V0ZXIgNC4wIHNob3VsZCBtYWtlIHRoZSByb290IGNvbXBvbmVudCBzZXQgdG8gbnVsbFxuICAgIC8vIHRoaXMgd2lsbCBzaW1wbGlmeSB0aGUgbGlmZWN5Y2xlIG9mIHRoZSByb3V0ZXIuXG4gICAgdGhpcy5yb3V0ZXJTdGF0ZS5yb290LmNvbXBvbmVudCA9IHRoaXMucm9vdENvbXBvbmVudFR5cGU7XG4gIH1cblxuICBwcml2YXRlIGdldFRyYW5zaXRpb24oKTogTmF2aWdhdGlvblRyYW5zaXRpb24geyByZXR1cm4gdGhpcy50cmFuc2l0aW9ucy52YWx1ZTsgfVxuXG4gIHByaXZhdGUgc2V0VHJhbnNpdGlvbih0OiBQYXJ0aWFsPE5hdmlnYXRpb25UcmFuc2l0aW9uPik6IHZvaWQge1xuICAgIHRoaXMudHJhbnNpdGlvbnMubmV4dCh7Li4udGhpcy5nZXRUcmFuc2l0aW9uKCksIC4uLnR9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHVwIHRoZSBsb2NhdGlvbiBjaGFuZ2UgbGlzdGVuZXIgYW5kIHBlcmZvcm1zIHRoZSBpbml0aWFsIG5hdmlnYXRpb24uXG4gICAqL1xuICBpbml0aWFsTmF2aWdhdGlvbigpOiB2b2lkIHtcbiAgICB0aGlzLnNldFVwTG9jYXRpb25DaGFuZ2VMaXN0ZW5lcigpO1xuICAgIGlmICh0aGlzLm5hdmlnYXRpb25JZCA9PT0gMCkge1xuICAgICAgdGhpcy5uYXZpZ2F0ZUJ5VXJsKHRoaXMubG9jYXRpb24ucGF0aCh0cnVlKSwge3JlcGxhY2VVcmw6IHRydWV9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB1cCB0aGUgbG9jYXRpb24gY2hhbmdlIGxpc3RlbmVyLlxuICAgKi9cbiAgc2V0VXBMb2NhdGlvbkNoYW5nZUxpc3RlbmVyKCk6IHZvaWQge1xuICAgIC8vIERvbid0IG5lZWQgdG8gdXNlIFpvbmUud3JhcCBhbnkgbW9yZSwgYmVjYXVzZSB6b25lLmpzXG4gICAgLy8gYWxyZWFkeSBwYXRjaCBvblBvcFN0YXRlLCBzbyBsb2NhdGlvbiBjaGFuZ2UgY2FsbGJhY2sgd2lsbFxuICAgIC8vIHJ1biBpbnRvIG5nWm9uZVxuICAgIGlmICghdGhpcy5sb2NhdGlvblN1YnNjcmlwdGlvbikge1xuICAgICAgdGhpcy5sb2NhdGlvblN1YnNjcmlwdGlvbiA9IDxhbnk+dGhpcy5sb2NhdGlvbi5zdWJzY3JpYmUoKGNoYW5nZTogYW55KSA9PiB7XG4gICAgICAgIGxldCByYXdVcmxUcmVlID0gdGhpcy5wYXJzZVVybChjaGFuZ2VbJ3VybCddKTtcbiAgICAgICAgY29uc3Qgc291cmNlOiBOYXZpZ2F0aW9uVHJpZ2dlciA9IGNoYW5nZVsndHlwZSddID09PSAncG9wc3RhdGUnID8gJ3BvcHN0YXRlJyA6ICdoYXNoY2hhbmdlJztcbiAgICAgICAgLy8gTmF2aWdhdGlvbnMgY29taW5nIGZyb20gQW5ndWxhciByb3V0ZXIgaGF2ZSBhIG5hdmlnYXRpb25JZCBzdGF0ZSBwcm9wZXJ0eS4gV2hlbiB0aGlzXG4gICAgICAgIC8vIGV4aXN0cywgcmVzdG9yZSB0aGUgc3RhdGUuXG4gICAgICAgIGNvbnN0IHN0YXRlID0gY2hhbmdlLnN0YXRlICYmIGNoYW5nZS5zdGF0ZS5uYXZpZ2F0aW9uSWQgPyBjaGFuZ2Uuc3RhdGUgOiBudWxsO1xuICAgICAgICBzZXRUaW1lb3V0KFxuICAgICAgICAgICAgKCkgPT4geyB0aGlzLnNjaGVkdWxlTmF2aWdhdGlvbihyYXdVcmxUcmVlLCBzb3VyY2UsIHN0YXRlLCB7cmVwbGFjZVVybDogdHJ1ZX0pOyB9LCAwKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBUaGUgY3VycmVudCBVUkwuICovXG4gIGdldCB1cmwoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuc2VyaWFsaXplVXJsKHRoaXMuY3VycmVudFVybFRyZWUpOyB9XG5cbiAgLyoqIFRoZSBjdXJyZW50IE5hdmlnYXRpb24gb2JqZWN0IGlmIG9uZSBleGlzdHMgKi9cbiAgZ2V0Q3VycmVudE5hdmlnYXRpb24oKTogTmF2aWdhdGlvbnxudWxsIHsgcmV0dXJuIHRoaXMuY3VycmVudE5hdmlnYXRpb247IH1cblxuICAvKiogQGludGVybmFsICovXG4gIHRyaWdnZXJFdmVudChldmVudDogRXZlbnQpOiB2b2lkIHsgKHRoaXMuZXZlbnRzIGFzIFN1YmplY3Q8RXZlbnQ+KS5uZXh0KGV2ZW50KTsgfVxuXG4gIC8qKlxuICAgKiBSZXNldHMgdGhlIGNvbmZpZ3VyYXRpb24gdXNlZCBmb3IgbmF2aWdhdGlvbiBhbmQgZ2VuZXJhdGluZyBsaW5rcy5cbiAgICpcbiAgICogQHBhcmFtIGNvbmZpZyBUaGUgcm91dGUgYXJyYXkgZm9yIHRoZSBuZXcgY29uZmlndXJhdGlvbi5cbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICpcbiAgICogYGBgXG4gICAqIHJvdXRlci5yZXNldENvbmZpZyhbXG4gICAqICB7IHBhdGg6ICd0ZWFtLzppZCcsIGNvbXBvbmVudDogVGVhbUNtcCwgY2hpbGRyZW46IFtcbiAgICogICAgeyBwYXRoOiAnc2ltcGxlJywgY29tcG9uZW50OiBTaW1wbGVDbXAgfSxcbiAgICogICAgeyBwYXRoOiAndXNlci86bmFtZScsIGNvbXBvbmVudDogVXNlckNtcCB9XG4gICAqICBdfVxuICAgKiBdKTtcbiAgICogYGBgXG4gICAqL1xuICByZXNldENvbmZpZyhjb25maWc6IFJvdXRlcyk6IHZvaWQge1xuICAgIHZhbGlkYXRlQ29uZmlnKGNvbmZpZyk7XG4gICAgdGhpcy5jb25maWcgPSBjb25maWcubWFwKHN0YW5kYXJkaXplQ29uZmlnKTtcbiAgICB0aGlzLm5hdmlnYXRlZCA9IGZhbHNlO1xuICAgIHRoaXMubGFzdFN1Y2Nlc3NmdWxJZCA9IC0xO1xuICB9XG5cbiAgLyoqIEBkb2NzTm90UmVxdWlyZWQgKi9cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7IHRoaXMuZGlzcG9zZSgpOyB9XG5cbiAgLyoqIERpc3Bvc2VzIG9mIHRoZSByb3V0ZXIuICovXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMubG9jYXRpb25TdWJzY3JpcHRpb24pIHtcbiAgICAgIHRoaXMubG9jYXRpb25TdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICAgIHRoaXMubG9jYXRpb25TdWJzY3JpcHRpb24gPSBudWxsICE7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFwcGxpZXMgYW4gYXJyYXkgb2YgY29tbWFuZHMgdG8gdGhlIGN1cnJlbnQgVVJMIHRyZWUgYW5kIGNyZWF0ZXMgYSBuZXcgVVJMIHRyZWUuXG4gICAqXG4gICAqIFdoZW4gZ2l2ZW4gYW4gYWN0aXZhdGUgcm91dGUsIGFwcGxpZXMgdGhlIGdpdmVuIGNvbW1hbmRzIHN0YXJ0aW5nIGZyb20gdGhlIHJvdXRlLlxuICAgKiBXaGVuIG5vdCBnaXZlbiBhIHJvdXRlLCBhcHBsaWVzIHRoZSBnaXZlbiBjb21tYW5kIHN0YXJ0aW5nIGZyb20gdGhlIHJvb3QuXG4gICAqXG4gICAqIEBwYXJhbSBjb21tYW5kcyBBbiBhcnJheSBvZiBjb21tYW5kcyB0byBhcHBseS5cbiAgICogQHBhcmFtIG5hdmlnYXRpb25FeHRyYXNcbiAgICogQHJldHVybnMgVGhlIG5ldyBVUkwgdHJlZS5cbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICpcbiAgICogYGBgXG4gICAqIC8vIGNyZWF0ZSAvdGVhbS8zMy91c2VyLzExXG4gICAqIHJvdXRlci5jcmVhdGVVcmxUcmVlKFsnL3RlYW0nLCAzMywgJ3VzZXInLCAxMV0pO1xuICAgKlxuICAgKiAvLyBjcmVhdGUgL3RlYW0vMzM7ZXhwYW5kPXRydWUvdXNlci8xMVxuICAgKiByb3V0ZXIuY3JlYXRlVXJsVHJlZShbJy90ZWFtJywgMzMsIHtleHBhbmQ6IHRydWV9LCAndXNlcicsIDExXSk7XG4gICAqXG4gICAqIC8vIHlvdSBjYW4gY29sbGFwc2Ugc3RhdGljIHNlZ21lbnRzIGxpa2UgdGhpcyAodGhpcyB3b3JrcyBvbmx5IHdpdGggdGhlIGZpcnN0IHBhc3NlZC1pbiB2YWx1ZSk6XG4gICAqIHJvdXRlci5jcmVhdGVVcmxUcmVlKFsnL3RlYW0vMzMvdXNlcicsIHVzZXJJZF0pO1xuICAgKlxuICAgKiAvLyBJZiB0aGUgZmlyc3Qgc2VnbWVudCBjYW4gY29udGFpbiBzbGFzaGVzLCBhbmQgeW91IGRvIG5vdCB3YW50IHRoZSByb3V0ZXIgdG8gc3BsaXQgaXQsIHlvdVxuICAgKiAvLyBjYW4gZG8gdGhlIGZvbGxvd2luZzpcbiAgICpcbiAgICogcm91dGVyLmNyZWF0ZVVybFRyZWUoW3tzZWdtZW50UGF0aDogJy9vbmUvdHdvJ31dKTtcbiAgICpcbiAgICogLy8gY3JlYXRlIC90ZWFtLzMzLyh1c2VyLzExLy9yaWdodDpjaGF0KVxuICAgKiByb3V0ZXIuY3JlYXRlVXJsVHJlZShbJy90ZWFtJywgMzMsIHtvdXRsZXRzOiB7cHJpbWFyeTogJ3VzZXIvMTEnLCByaWdodDogJ2NoYXQnfX1dKTtcbiAgICpcbiAgICogLy8gcmVtb3ZlIHRoZSByaWdodCBzZWNvbmRhcnkgbm9kZVxuICAgKiByb3V0ZXIuY3JlYXRlVXJsVHJlZShbJy90ZWFtJywgMzMsIHtvdXRsZXRzOiB7cHJpbWFyeTogJ3VzZXIvMTEnLCByaWdodDogbnVsbH19XSk7XG4gICAqXG4gICAqIC8vIGFzc3VtaW5nIHRoZSBjdXJyZW50IHVybCBpcyBgL3RlYW0vMzMvdXNlci8xMWAgYW5kIHRoZSByb3V0ZSBwb2ludHMgdG8gYHVzZXIvMTFgXG4gICAqXG4gICAqIC8vIG5hdmlnYXRlIHRvIC90ZWFtLzMzL3VzZXIvMTEvZGV0YWlsc1xuICAgKiByb3V0ZXIuY3JlYXRlVXJsVHJlZShbJ2RldGFpbHMnXSwge3JlbGF0aXZlVG86IHJvdXRlfSk7XG4gICAqXG4gICAqIC8vIG5hdmlnYXRlIHRvIC90ZWFtLzMzL3VzZXIvMjJcbiAgICogcm91dGVyLmNyZWF0ZVVybFRyZWUoWycuLi8yMiddLCB7cmVsYXRpdmVUbzogcm91dGV9KTtcbiAgICpcbiAgICogLy8gbmF2aWdhdGUgdG8gL3RlYW0vNDQvdXNlci8yMlxuICAgKiByb3V0ZXIuY3JlYXRlVXJsVHJlZShbJy4uLy4uL3RlYW0vNDQvdXNlci8yMiddLCB7cmVsYXRpdmVUbzogcm91dGV9KTtcbiAgICogYGBgXG4gICAqL1xuICBjcmVhdGVVcmxUcmVlKGNvbW1hbmRzOiBhbnlbXSwgbmF2aWdhdGlvbkV4dHJhczogTmF2aWdhdGlvbkV4dHJhcyA9IHt9KTogVXJsVHJlZSB7XG4gICAgY29uc3Qge3JlbGF0aXZlVG8sICAgICAgICAgIHF1ZXJ5UGFyYW1zLCAgICAgICAgIGZyYWdtZW50LFxuICAgICAgICAgICBwcmVzZXJ2ZVF1ZXJ5UGFyYW1zLCBxdWVyeVBhcmFtc0hhbmRsaW5nLCBwcmVzZXJ2ZUZyYWdtZW50fSA9IG5hdmlnYXRpb25FeHRyYXM7XG4gICAgaWYgKGlzRGV2TW9kZSgpICYmIHByZXNlcnZlUXVlcnlQYXJhbXMgJiYgPGFueT5jb25zb2xlICYmIDxhbnk+Y29uc29sZS53YXJuKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ3ByZXNlcnZlUXVlcnlQYXJhbXMgaXMgZGVwcmVjYXRlZCwgdXNlIHF1ZXJ5UGFyYW1zSGFuZGxpbmcgaW5zdGVhZC4nKTtcbiAgICB9XG4gICAgY29uc3QgYSA9IHJlbGF0aXZlVG8gfHwgdGhpcy5yb3V0ZXJTdGF0ZS5yb290O1xuICAgIGNvbnN0IGYgPSBwcmVzZXJ2ZUZyYWdtZW50ID8gdGhpcy5jdXJyZW50VXJsVHJlZS5mcmFnbWVudCA6IGZyYWdtZW50O1xuICAgIGxldCBxOiBQYXJhbXN8bnVsbCA9IG51bGw7XG4gICAgaWYgKHF1ZXJ5UGFyYW1zSGFuZGxpbmcpIHtcbiAgICAgIHN3aXRjaCAocXVlcnlQYXJhbXNIYW5kbGluZykge1xuICAgICAgICBjYXNlICdtZXJnZSc6XG4gICAgICAgICAgcSA9IHsuLi50aGlzLmN1cnJlbnRVcmxUcmVlLnF1ZXJ5UGFyYW1zLCAuLi5xdWVyeVBhcmFtc307XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3ByZXNlcnZlJzpcbiAgICAgICAgICBxID0gdGhpcy5jdXJyZW50VXJsVHJlZS5xdWVyeVBhcmFtcztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBxID0gcXVlcnlQYXJhbXMgfHwgbnVsbDtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcSA9IHByZXNlcnZlUXVlcnlQYXJhbXMgPyB0aGlzLmN1cnJlbnRVcmxUcmVlLnF1ZXJ5UGFyYW1zIDogcXVlcnlQYXJhbXMgfHwgbnVsbDtcbiAgICB9XG4gICAgaWYgKHEgIT09IG51bGwpIHtcbiAgICAgIHEgPSB0aGlzLnJlbW92ZUVtcHR5UHJvcHMocSk7XG4gICAgfVxuICAgIHJldHVybiBjcmVhdGVVcmxUcmVlKGEsIHRoaXMuY3VycmVudFVybFRyZWUsIGNvbW1hbmRzLCBxICEsIGYgISk7XG4gIH1cblxuICAvKipcbiAgICogTmF2aWdhdGUgYmFzZWQgb24gdGhlIHByb3ZpZGVkIFVSTCwgd2hpY2ggbXVzdCBiZSBhYnNvbHV0ZS5cbiAgICpcbiAgICogQHBhcmFtIHVybCBBbiBhYnNvbHV0ZSBVUkwuIFRoZSBmdW5jdGlvbiBkb2VzIG5vdCBhcHBseSBhbnkgZGVsdGEgdG8gdGhlIGN1cnJlbnQgVVJMLlxuICAgKiBAcGFyYW0gZXh0cmFzIEFuIG9iamVjdCBjb250YWluaW5nIHByb3BlcnRpZXMgdGhhdCBtb2RpZnkgdGhlIG5hdmlnYXRpb24gc3RyYXRlZ3kuXG4gICAqIFRoZSBmdW5jdGlvbiBpZ25vcmVzIGFueSBwcm9wZXJ0aWVzIGluIHRoZSBgTmF2aWdhdGlvbkV4dHJhc2AgdGhhdCB3b3VsZCBjaGFuZ2UgdGhlXG4gICAqIHByb3ZpZGVkIFVSTC5cbiAgICpcbiAgICogQHJldHVybnMgQSBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gJ3RydWUnIHdoZW4gbmF2aWdhdGlvbiBzdWNjZWVkcyxcbiAgICogdG8gJ2ZhbHNlJyB3aGVuIG5hdmlnYXRpb24gZmFpbHMsIG9yIGlzIHJlamVjdGVkIG9uIGVycm9yLlxuICAgKlxuICAgKiBAdXNhZ2VOb3Rlc1xuICAgKlxuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiBgYGBcbiAgICogcm91dGVyLm5hdmlnYXRlQnlVcmwoXCIvdGVhbS8zMy91c2VyLzExXCIpO1xuICAgKlxuICAgKiAvLyBOYXZpZ2F0ZSB3aXRob3V0IHVwZGF0aW5nIHRoZSBVUkxcbiAgICogcm91dGVyLm5hdmlnYXRlQnlVcmwoXCIvdGVhbS8zMy91c2VyLzExXCIsIHsgc2tpcExvY2F0aW9uQ2hhbmdlOiB0cnVlIH0pO1xuICAgKiBgYGBcbiAgICpcbiAgICovXG4gIG5hdmlnYXRlQnlVcmwodXJsOiBzdHJpbmd8VXJsVHJlZSwgZXh0cmFzOiBOYXZpZ2F0aW9uRXh0cmFzID0ge3NraXBMb2NhdGlvbkNoYW5nZTogZmFsc2V9KTpcbiAgICAgIFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGlmIChpc0Rldk1vZGUoKSAmJiB0aGlzLmlzTmdab25lRW5hYmxlZCAmJiAhTmdab25lLmlzSW5Bbmd1bGFyWm9uZSgpKSB7XG4gICAgICB0aGlzLmNvbnNvbGUud2FybihcbiAgICAgICAgICBgTmF2aWdhdGlvbiB0cmlnZ2VyZWQgb3V0c2lkZSBBbmd1bGFyIHpvbmUsIGRpZCB5b3UgZm9yZ2V0IHRvIGNhbGwgJ25nWm9uZS5ydW4oKSc/YCk7XG4gICAgfVxuXG4gICAgY29uc3QgdXJsVHJlZSA9IGlzVXJsVHJlZSh1cmwpID8gdXJsIDogdGhpcy5wYXJzZVVybCh1cmwpO1xuICAgIGNvbnN0IG1lcmdlZFRyZWUgPSB0aGlzLnVybEhhbmRsaW5nU3RyYXRlZ3kubWVyZ2UodXJsVHJlZSwgdGhpcy5yYXdVcmxUcmVlKTtcblxuICAgIHJldHVybiB0aGlzLnNjaGVkdWxlTmF2aWdhdGlvbihtZXJnZWRUcmVlLCAnaW1wZXJhdGl2ZScsIG51bGwsIGV4dHJhcyk7XG4gIH1cblxuICAvKipcbiAgICogTmF2aWdhdGUgYmFzZWQgb24gdGhlIHByb3ZpZGVkIGFycmF5IG9mIGNvbW1hbmRzIGFuZCBhIHN0YXJ0aW5nIHBvaW50LlxuICAgKiBJZiBubyBzdGFydGluZyByb3V0ZSBpcyBwcm92aWRlZCwgdGhlIG5hdmlnYXRpb24gaXMgYWJzb2x1dGUuXG4gICAqXG4gICAqIFJldHVybnMgYSBwcm9taXNlIHRoYXQ6XG4gICAqIC0gcmVzb2x2ZXMgdG8gJ3RydWUnIHdoZW4gbmF2aWdhdGlvbiBzdWNjZWVkcyxcbiAgICogLSByZXNvbHZlcyB0byAnZmFsc2UnIHdoZW4gbmF2aWdhdGlvbiBmYWlscyxcbiAgICogLSBpcyByZWplY3RlZCB3aGVuIGFuIGVycm9yIGhhcHBlbnMuXG4gICAqXG4gICAqIEB1c2FnZU5vdGVzXG4gICAqXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIGBgYFxuICAgKiByb3V0ZXIubmF2aWdhdGUoWyd0ZWFtJywgMzMsICd1c2VyJywgMTFdLCB7cmVsYXRpdmVUbzogcm91dGV9KTtcbiAgICpcbiAgICogLy8gTmF2aWdhdGUgd2l0aG91dCB1cGRhdGluZyB0aGUgVVJMXG4gICAqIHJvdXRlci5uYXZpZ2F0ZShbJ3RlYW0nLCAzMywgJ3VzZXInLCAxMV0sIHtyZWxhdGl2ZVRvOiByb3V0ZSwgc2tpcExvY2F0aW9uQ2hhbmdlOiB0cnVlfSk7XG4gICAqIGBgYFxuICAgKlxuICAgKiBUaGUgZmlyc3QgcGFyYW1ldGVyIG9mIGBuYXZpZ2F0ZSgpYCBpcyBhIGRlbHRhIHRvIGJlIGFwcGxpZWQgdG8gdGhlIGN1cnJlbnQgVVJMXG4gICAqIG9yIHRoZSBvbmUgcHJvdmlkZWQgaW4gdGhlIGByZWxhdGl2ZVRvYCBwcm9wZXJ0eSBvZiB0aGUgc2Vjb25kIHBhcmFtZXRlciAodGhlXG4gICAqIGBOYXZpZ2F0aW9uRXh0cmFzYCkuXG4gICAqXG4gICAqIEluIG9yZGVyIHRvIGFmZmVjdCB0aGlzIGJyb3dzZXIncyBgaGlzdG9yeS5zdGF0ZWAgZW50cnksIHRoZSBgc3RhdGVgXG4gICAqIHBhcmFtZXRlciBjYW4gYmUgcGFzc2VkLiBUaGlzIG11c3QgYmUgYW4gb2JqZWN0IGJlY2F1c2UgdGhlIHJvdXRlclxuICAgKiB3aWxsIGFkZCB0aGUgYG5hdmlnYXRpb25JZGAgcHJvcGVydHkgdG8gdGhpcyBvYmplY3QgYmVmb3JlIGNyZWF0aW5nXG4gICAqIHRoZSBuZXcgaGlzdG9yeSBpdGVtLlxuICAgKi9cbiAgbmF2aWdhdGUoY29tbWFuZHM6IGFueVtdLCBleHRyYXM6IE5hdmlnYXRpb25FeHRyYXMgPSB7c2tpcExvY2F0aW9uQ2hhbmdlOiBmYWxzZX0pOlxuICAgICAgUHJvbWlzZTxib29sZWFuPiB7XG4gICAgdmFsaWRhdGVDb21tYW5kcyhjb21tYW5kcyk7XG4gICAgcmV0dXJuIHRoaXMubmF2aWdhdGVCeVVybCh0aGlzLmNyZWF0ZVVybFRyZWUoY29tbWFuZHMsIGV4dHJhcyksIGV4dHJhcyk7XG4gIH1cblxuICAvKiogU2VyaWFsaXplcyBhIGBVcmxUcmVlYCBpbnRvIGEgc3RyaW5nICovXG4gIHNlcmlhbGl6ZVVybCh1cmw6IFVybFRyZWUpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy51cmxTZXJpYWxpemVyLnNlcmlhbGl6ZSh1cmwpOyB9XG5cbiAgLyoqIFBhcnNlcyBhIHN0cmluZyBpbnRvIGEgYFVybFRyZWVgICovXG4gIHBhcnNlVXJsKHVybDogc3RyaW5nKTogVXJsVHJlZSB7XG4gICAgbGV0IHVybFRyZWU6IFVybFRyZWU7XG4gICAgdHJ5IHtcbiAgICAgIHVybFRyZWUgPSB0aGlzLnVybFNlcmlhbGl6ZXIucGFyc2UodXJsKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB1cmxUcmVlID0gdGhpcy5tYWxmb3JtZWRVcmlFcnJvckhhbmRsZXIoZSwgdGhpcy51cmxTZXJpYWxpemVyLCB1cmwpO1xuICAgIH1cbiAgICByZXR1cm4gdXJsVHJlZTtcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHdoZXRoZXIgdGhlIHVybCBpcyBhY3RpdmF0ZWQgKi9cbiAgaXNBY3RpdmUodXJsOiBzdHJpbmd8VXJsVHJlZSwgZXhhY3Q6IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgICBpZiAoaXNVcmxUcmVlKHVybCkpIHtcbiAgICAgIHJldHVybiBjb250YWluc1RyZWUodGhpcy5jdXJyZW50VXJsVHJlZSwgdXJsLCBleGFjdCk7XG4gICAgfVxuXG4gICAgY29uc3QgdXJsVHJlZSA9IHRoaXMucGFyc2VVcmwodXJsKTtcbiAgICByZXR1cm4gY29udGFpbnNUcmVlKHRoaXMuY3VycmVudFVybFRyZWUsIHVybFRyZWUsIGV4YWN0KTtcbiAgfVxuXG4gIHByaXZhdGUgcmVtb3ZlRW1wdHlQcm9wcyhwYXJhbXM6IFBhcmFtcyk6IFBhcmFtcyB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHBhcmFtcykucmVkdWNlKChyZXN1bHQ6IFBhcmFtcywga2V5OiBzdHJpbmcpID0+IHtcbiAgICAgIGNvbnN0IHZhbHVlOiBhbnkgPSBwYXJhbXNba2V5XTtcbiAgICAgIGlmICh2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJlc3VsdFtrZXldID0gdmFsdWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sIHt9KTtcbiAgfVxuXG4gIHByaXZhdGUgcHJvY2Vzc05hdmlnYXRpb25zKCk6IHZvaWQge1xuICAgIHRoaXMubmF2aWdhdGlvbnMuc3Vic2NyaWJlKFxuICAgICAgICB0ID0+IHtcbiAgICAgICAgICB0aGlzLm5hdmlnYXRlZCA9IHRydWU7XG4gICAgICAgICAgdGhpcy5sYXN0U3VjY2Vzc2Z1bElkID0gdC5pZDtcbiAgICAgICAgICAodGhpcy5ldmVudHMgYXMgU3ViamVjdDxFdmVudD4pXG4gICAgICAgICAgICAgIC5uZXh0KG5ldyBOYXZpZ2F0aW9uRW5kKFxuICAgICAgICAgICAgICAgICAgdC5pZCwgdGhpcy5zZXJpYWxpemVVcmwodC5leHRyYWN0ZWRVcmwpLCB0aGlzLnNlcmlhbGl6ZVVybCh0aGlzLmN1cnJlbnRVcmxUcmVlKSkpO1xuICAgICAgICAgIHRoaXMubGFzdFN1Y2Nlc3NmdWxOYXZpZ2F0aW9uID0gdGhpcy5jdXJyZW50TmF2aWdhdGlvbjtcbiAgICAgICAgICB0aGlzLmN1cnJlbnROYXZpZ2F0aW9uID0gbnVsbDtcbiAgICAgICAgICB0LnJlc29sdmUodHJ1ZSk7XG4gICAgICAgIH0sXG4gICAgICAgIGUgPT4geyB0aGlzLmNvbnNvbGUud2FybihgVW5oYW5kbGVkIE5hdmlnYXRpb24gRXJyb3I6IGApOyB9KTtcbiAgfVxuXG4gIHByaXZhdGUgc2NoZWR1bGVOYXZpZ2F0aW9uKFxuICAgICAgcmF3VXJsOiBVcmxUcmVlLCBzb3VyY2U6IE5hdmlnYXRpb25UcmlnZ2VyLCByZXN0b3JlZFN0YXRlOiBSZXN0b3JlZFN0YXRlfG51bGwsXG4gICAgICBleHRyYXM6IE5hdmlnYXRpb25FeHRyYXMpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBsYXN0TmF2aWdhdGlvbiA9IHRoaXMuZ2V0VHJhbnNpdGlvbigpO1xuICAgIC8vIElmIHRoZSB1c2VyIHRyaWdnZXJzIGEgbmF2aWdhdGlvbiBpbXBlcmF0aXZlbHkgKGUuZy4sIGJ5IHVzaW5nIG5hdmlnYXRlQnlVcmwpLFxuICAgIC8vIGFuZCB0aGF0IG5hdmlnYXRpb24gcmVzdWx0cyBpbiAncmVwbGFjZVN0YXRlJyB0aGF0IGxlYWRzIHRvIHRoZSBzYW1lIFVSTCxcbiAgICAvLyB3ZSBzaG91bGQgc2tpcCB0aG9zZS5cbiAgICBpZiAobGFzdE5hdmlnYXRpb24gJiYgc291cmNlICE9PSAnaW1wZXJhdGl2ZScgJiYgbGFzdE5hdmlnYXRpb24uc291cmNlID09PSAnaW1wZXJhdGl2ZScgJiZcbiAgICAgICAgbGFzdE5hdmlnYXRpb24ucmF3VXJsLnRvU3RyaW5nKCkgPT09IHJhd1VybC50b1N0cmluZygpKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRydWUpOyAgLy8gcmV0dXJuIHZhbHVlIGlzIG5vdCB1c2VkXG4gICAgfVxuXG4gICAgLy8gQmVjYXVzZSBvZiBhIGJ1ZyBpbiBJRSBhbmQgRWRnZSwgdGhlIGxvY2F0aW9uIGNsYXNzIGZpcmVzIHR3byBldmVudHMgKHBvcHN0YXRlIGFuZFxuICAgIC8vIGhhc2hjaGFuZ2UpIGV2ZXJ5IHNpbmdsZSB0aW1lLiBUaGUgc2Vjb25kIG9uZSBzaG91bGQgYmUgaWdub3JlZC4gT3RoZXJ3aXNlLCB0aGUgVVJMIHdpbGxcbiAgICAvLyBmbGlja2VyLiBIYW5kbGVzIHRoZSBjYXNlIHdoZW4gYSBwb3BzdGF0ZSB3YXMgZW1pdHRlZCBmaXJzdC5cbiAgICBpZiAobGFzdE5hdmlnYXRpb24gJiYgc291cmNlID09ICdoYXNoY2hhbmdlJyAmJiBsYXN0TmF2aWdhdGlvbi5zb3VyY2UgPT09ICdwb3BzdGF0ZScgJiZcbiAgICAgICAgbGFzdE5hdmlnYXRpb24ucmF3VXJsLnRvU3RyaW5nKCkgPT09IHJhd1VybC50b1N0cmluZygpKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRydWUpOyAgLy8gcmV0dXJuIHZhbHVlIGlzIG5vdCB1c2VkXG4gICAgfVxuICAgIC8vIEJlY2F1c2Ugb2YgYSBidWcgaW4gSUUgYW5kIEVkZ2UsIHRoZSBsb2NhdGlvbiBjbGFzcyBmaXJlcyB0d28gZXZlbnRzIChwb3BzdGF0ZSBhbmRcbiAgICAvLyBoYXNoY2hhbmdlKSBldmVyeSBzaW5nbGUgdGltZS4gVGhlIHNlY29uZCBvbmUgc2hvdWxkIGJlIGlnbm9yZWQuIE90aGVyd2lzZSwgdGhlIFVSTCB3aWxsXG4gICAgLy8gZmxpY2tlci4gSGFuZGxlcyB0aGUgY2FzZSB3aGVuIGEgaGFzaGNoYW5nZSB3YXMgZW1pdHRlZCBmaXJzdC5cbiAgICBpZiAobGFzdE5hdmlnYXRpb24gJiYgc291cmNlID09ICdwb3BzdGF0ZScgJiYgbGFzdE5hdmlnYXRpb24uc291cmNlID09PSAnaGFzaGNoYW5nZScgJiZcbiAgICAgICAgbGFzdE5hdmlnYXRpb24ucmF3VXJsLnRvU3RyaW5nKCkgPT09IHJhd1VybC50b1N0cmluZygpKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRydWUpOyAgLy8gcmV0dXJuIHZhbHVlIGlzIG5vdCB1c2VkXG4gICAgfVxuXG4gICAgbGV0IHJlc29sdmU6IGFueSA9IG51bGw7XG4gICAgbGV0IHJlamVjdDogYW55ID0gbnVsbDtcblxuICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZTxib29sZWFuPigocmVzLCByZWopID0+IHtcbiAgICAgIHJlc29sdmUgPSByZXM7XG4gICAgICByZWplY3QgPSByZWo7XG4gICAgfSk7XG5cbiAgICBjb25zdCBpZCA9ICsrdGhpcy5uYXZpZ2F0aW9uSWQ7XG4gICAgdGhpcy5zZXRUcmFuc2l0aW9uKHtcbiAgICAgIGlkLFxuICAgICAgc291cmNlLFxuICAgICAgcmVzdG9yZWRTdGF0ZSxcbiAgICAgIGN1cnJlbnRVcmxUcmVlOiB0aGlzLmN1cnJlbnRVcmxUcmVlLFxuICAgICAgY3VycmVudFJhd1VybDogdGhpcy5yYXdVcmxUcmVlLCByYXdVcmwsIGV4dHJhcywgcmVzb2x2ZSwgcmVqZWN0LCBwcm9taXNlLFxuICAgICAgY3VycmVudFNuYXBzaG90OiB0aGlzLnJvdXRlclN0YXRlLnNuYXBzaG90LFxuICAgICAgY3VycmVudFJvdXRlclN0YXRlOiB0aGlzLnJvdXRlclN0YXRlXG4gICAgfSk7XG5cbiAgICAvLyBNYWtlIHN1cmUgdGhhdCB0aGUgZXJyb3IgaXMgcHJvcGFnYXRlZCBldmVuIHRob3VnaCBgcHJvY2Vzc05hdmlnYXRpb25zYCBjYXRjaFxuICAgIC8vIGhhbmRsZXIgZG9lcyBub3QgcmV0aHJvd1xuICAgIHJldHVybiBwcm9taXNlLmNhdGNoKChlOiBhbnkpID0+IHsgcmV0dXJuIFByb21pc2UucmVqZWN0KGUpOyB9KTtcbiAgfVxuXG4gIHByaXZhdGUgc2V0QnJvd3NlclVybChcbiAgICAgIHVybDogVXJsVHJlZSwgcmVwbGFjZVVybDogYm9vbGVhbiwgaWQ6IG51bWJlciwgc3RhdGU/OiB7W2tleTogc3RyaW5nXTogYW55fSkge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLnVybFNlcmlhbGl6ZXIuc2VyaWFsaXplKHVybCk7XG4gICAgc3RhdGUgPSBzdGF0ZSB8fCB7fTtcbiAgICBpZiAodGhpcy5sb2NhdGlvbi5pc0N1cnJlbnRQYXRoRXF1YWxUbyhwYXRoKSB8fCByZXBsYWNlVXJsKSB7XG4gICAgICAvLyBUT0RPKGphc29uYWRlbik6IFJlbW92ZSBmaXJzdCBgbmF2aWdhdGlvbklkYCBhbmQgcmVseSBvbiBgbmdgIG5hbWVzcGFjZS5cbiAgICAgIHRoaXMubG9jYXRpb24ucmVwbGFjZVN0YXRlKHBhdGgsICcnLCB7Li4uc3RhdGUsIG5hdmlnYXRpb25JZDogaWR9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5sb2NhdGlvbi5nbyhwYXRoLCAnJywgey4uLnN0YXRlLCBuYXZpZ2F0aW9uSWQ6IGlkfSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSByZXNldFN0YXRlQW5kVXJsKHN0b3JlZFN0YXRlOiBSb3V0ZXJTdGF0ZSwgc3RvcmVkVXJsOiBVcmxUcmVlLCByYXdVcmw6IFVybFRyZWUpOiB2b2lkIHtcbiAgICAodGhpcyBhc3tyb3V0ZXJTdGF0ZTogUm91dGVyU3RhdGV9KS5yb3V0ZXJTdGF0ZSA9IHN0b3JlZFN0YXRlO1xuICAgIHRoaXMuY3VycmVudFVybFRyZWUgPSBzdG9yZWRVcmw7XG4gICAgdGhpcy5yYXdVcmxUcmVlID0gdGhpcy51cmxIYW5kbGluZ1N0cmF0ZWd5Lm1lcmdlKHRoaXMuY3VycmVudFVybFRyZWUsIHJhd1VybCk7XG4gICAgdGhpcy5yZXNldFVybFRvQ3VycmVudFVybFRyZWUoKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVzZXRVcmxUb0N1cnJlbnRVcmxUcmVlKCk6IHZvaWQge1xuICAgIHRoaXMubG9jYXRpb24ucmVwbGFjZVN0YXRlKFxuICAgICAgICB0aGlzLnVybFNlcmlhbGl6ZXIuc2VyaWFsaXplKHRoaXMucmF3VXJsVHJlZSksICcnLCB7bmF2aWdhdGlvbklkOiB0aGlzLmxhc3RTdWNjZXNzZnVsSWR9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZUNvbW1hbmRzKGNvbW1hbmRzOiBzdHJpbmdbXSk6IHZvaWQge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbW1hbmRzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgY21kID0gY29tbWFuZHNbaV07XG4gICAgaWYgKGNtZCA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZSByZXF1ZXN0ZWQgcGF0aCBjb250YWlucyAke2NtZH0gc2VnbWVudCBhdCBpbmRleCAke2l9YCk7XG4gICAgfVxuICB9XG59XG4iXX0=