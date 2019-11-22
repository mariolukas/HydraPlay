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
import { EmptyOutletComponent } from './components/empty_outlet';
import { PRIMARY_OUTLET } from './shared';
/**
 * A configuration object that defines a single route.
 * A set of routes are collected in a `Routes` array to define a `Router` configuration.
 * The router attempts to match segments of a given URL against each route,
 * using the configuration options defined in this object.
 *
 * Supports static, parameterized, redirect, and wildcard routes, as well as
 * custom route data and resolve methods.
 *
 * For detailed usage information, see the [Routing Guide](guide/router).
 *
 * \@usageNotes
 *
 * ### Simple Configuration
 *
 * The following route specifies that when navigating to, for example,
 * `/team/11/user/bob`, the router creates the 'Team' component
 * with the 'User' child component in it.
 *
 * ```
 * [{
 *   path: 'team/:id',
 *  component: Team,
 *   children: [{
 *     path: 'user/:name',
 *     component: User
 *   }]
 * }]
 * ```
 *
 * ### Multiple Outlets
 *
 * The following route creates sibling components with multiple outlets.
 * When navigating to `/team/11(aux:chat/jim)`, the router creates the 'Team' component next to
 * the 'Chat' component. The 'Chat' component is placed into the 'aux' outlet.
 *
 * ```
 * [{
 *   path: 'team/:id',
 *   component: Team
 * }, {
 *   path: 'chat/:user',
 *   component: Chat
 *   outlet: 'aux'
 * }]
 * ```
 *
 * ### Wild Cards
 *
 * The following route uses wild-card notation to specify a component
 * that is always instantiated regardless of where you navigate to.
 *
 * ```
 * [{
 *   path: '**',
 *   component: WildcardComponent
 * }]
 * ```
 *
 * ### Redirects
 *
 * The following route uses the `redirectTo` property to ignore a segment of
 * a given URL when looking for a child path.
 *
 * When navigating to '/team/11/legacy/user/jim', the router changes the URL segment
 * '/team/11/legacy/user/jim' to '/team/11/user/jim', and then instantiates
 * the Team component with the User child component in it.
 *
 * ```
 * [{
 *   path: 'team/:id',
 *   component: Team,
 *   children: [{
 *     path: 'legacy/user/:name',
 *     redirectTo: 'user/:name'
 *   }, {
 *     path: 'user/:name',
 *     component: User
 *   }]
 * }]
 * ```
 *
 * The redirect path can be relative, as shown in this example, or absolute.
 * If we change the `redirectTo` value in the example to the absolute URL segment '/user/:name',
 * the result URL is also absolute, '/user/jim'.
 * ### Empty Path
 *
 * Empty-path route configurations can be used to instantiate components that do not 'consume'
 * any URL segments.
 *
 * In the following configuration, when navigating to
 * `/team/11`, the router instantiates the 'AllUsers' component.
 *
 * ```
 * [{
 *   path: 'team/:id',
 *   component: Team,
 *   children: [{
 *     path: '',
 *     component: AllUsers
 *   }, {
 *     path: 'user/:name',
 *     component: User
 *   }]
 * }]
 * ```
 *
 * Empty-path routes can have children. In the following example, when navigating
 * to `/team/11/user/jim`, the router instantiates the wrapper component with
 * the user component in it.
 *
 * Note that an empty path route inherits its parent's parameters and data.
 *
 * ```
 * [{
 *   path: 'team/:id',
 *   component: Team,
 *   children: [{
 *     path: '',
 *     component: WrapperCmp,
 *     children: [{
 *       path: 'user/:name',
 *       component: User
 *     }]
 *   }]
 * }]
 * ```
 *
 * ### Matching Strategy
 *
 * The default path-match strategy is 'prefix', which means that the router
 * checks URL elements from the left to see if the URL matches a specified path.
 * For example, '/team/11/user' matches 'team/:id'.
 *
 * ```
 * [{
 *   path: '',
 *   pathMatch: 'prefix', //default
 *   redirectTo: 'main'
 * }, {
 *   path: 'main',
 *   component: Main
 * }]
 * ```
 *
 * You can specify the path-match strategy 'full' to make sure that the path
 * covers the whole unconsumed URL. It is important to do this when redirecting
 * empty-path routes. Otherwise, because an empty path is a prefix of any URL,
 * the router would apply the redirect even when navigating to the redirect destination,
 * creating an endless loop.
 *
 * In the following example, supplying the 'full' `patchMatch` strategy ensures
 * that the router applies the redirect if and only if navigating to '/'.
 *
 * ```
 * [{
 *   path: '',
 *   pathMatch: 'full',
 *   redirectTo: 'main'
 * }, {
 *   path: 'main',
 *   component: Main
 * }]
 * ```
 *
 * ### Componentless Routes
 *
 * You can share parameters between sibling components.
 * For example, suppose that two sibling components should go next to each other,
 * and both of them require an ID parameter. You can accomplish this using a route
 * that does not specify a component at the top level.
 *
 * In the following example, 'ChildCmp' and 'AuxCmp' are siblings.
 * When navigating to 'parent/10/(a//aux:b)', the route instantiates
 * the main child and aux child components next to each other.
 * For this to work, the application component must have the primary and aux outlets defined.
 *
 * ```
 * [{
 *    path: 'parent/:id',
 *    children: [
 *      { path: 'a', component: MainChild },
 *      { path: 'b', component: AuxChild, outlet: 'aux' }
 *    ]
 * }]
 * ```
 *
 * The router merges the parameters, data, and resolve of the componentless
 * parent into the parameters, data, and resolve of the children.
 *
 * This is especially useful when child components are defined
 * with an empty path string, as in the following example.
 * With this configuration, navigating to '/parent/10' creates
 * the main child and aux components.
 *
 * ```
 * [{
 *    path: 'parent/:id',
 *    children: [
 *      { path: '', component: MainChild },
 *      { path: '', component: AuxChild, outlet: 'aux' }
 *    ]
 * }]
 * ```
 *
 * ### Lazy Loading
 *
 * Lazy loading speeds up application load time by splitting the application
 * into multiple bundles and loading them on demand.
 * To use lazy loading, provide the `loadChildren` property  instead of the `children` property.
 *
 * Given the following example route, the router uses the registered
 * `NgModuleFactoryLoader` to fetch an NgModule associated with 'team'.
 * It then extracts the set of routes defined in that NgModule,
 * and transparently adds those routes to the main configuration.
 *
 * ```
 * [{
 *   path: 'team/:id',
 *   component: Team,
 *   loadChildren: 'team'
 * }]
 * ```
 *
 * \@publicApi
 * @record
 */
export function Route() { }
if (false) {
    /**
     * The path to match against, a URL string that uses router matching notation.
     * Can include wild-card characters (*).   [where is that defined?]
     * Default is "/" (the root path).
     * @type {?|undefined}
     */
    Route.prototype.path;
    /**
     * The path-matching strategy, one of 'prefix' or 'full'.
     * Default is 'prefix'.
     *
     * By default, the router checks URL elements from the left to see if the URL
     * matches a given  path, and stops when there is a match. For example,
     * '/team/11/user' matches 'team/:id'.
     * The path-match strategy 'full' matches against the entire URL.
     * It is important to do this when redirecting empty-path routes.
     * Otherwise, because an empty path is a prefix of any URL,
     * the router would apply the redirect even when navigating
     * to the redirect destination, creating an endless loop.
     *
     * @type {?|undefined}
     */
    Route.prototype.pathMatch;
    /**
     * A URL-matching function to use as a custom strategy for path matching.
     * If present, supersedes `path` and `pathMatch`.
     * @type {?|undefined}
     */
    Route.prototype.matcher;
    /**
     * The component to instantiate when the path matches.
     * Can be empty if child routes specify components.
     * @type {?|undefined}
     */
    Route.prototype.component;
    /**
     * A URL to which to redirect when a the path matches.
     * Absolute if the URL begins with a slash (/), otherwise relative to the path URL.
     * When not present, router does not redirect.
     * @type {?|undefined}
     */
    Route.prototype.redirectTo;
    /**
     * Name of a `RouterOutlet` object where the component can be placed
     * when the path matches.
     * @type {?|undefined}
     */
    Route.prototype.outlet;
    /**
     * An array of dependency-injection tokens used to look up `CanActivate()`
     * handlers, in order to determine if the current user is allowed to
     * activate the component. By default, any user can activate.
     * @type {?|undefined}
     */
    Route.prototype.canActivate;
    /**
     * An array of DI tokens used to look up `CanActivateChild()` handlers,
     * in order to determine if the current user is allowed to activate
     * a child of the component. By default, any user can activate a child.
     * @type {?|undefined}
     */
    Route.prototype.canActivateChild;
    /**
     * An array of DI tokens used to look up `CanDeactivate()`
     * handlers, in order to determine if the current user is allowed to
     * deactivate the component. By default, any user can deactivate.
     *
     * @type {?|undefined}
     */
    Route.prototype.canDeactivate;
    /**
     * An array of DI tokens used to look up `CanLoad()`
     * handlers, in order to determine if the current user is allowed to
     * load the component. By default, any user can load.
     * @type {?|undefined}
     */
    Route.prototype.canLoad;
    /**
     * Additional developer-defined data provided to the component via
     * `ActivatedRoute`. By default, no additional data is passed.
     * @type {?|undefined}
     */
    Route.prototype.data;
    /**
     * A map of DI tokens used to look up data resolvers. See `Resolve`.
     * @type {?|undefined}
     */
    Route.prototype.resolve;
    /**
     * An array of child `Route` objects that specifies a nested route
     * configuration.
     * @type {?|undefined}
     */
    Route.prototype.children;
    /**
     * A `LoadChildren` object specifying lazy-loaded child routes.
     * @type {?|undefined}
     */
    Route.prototype.loadChildren;
    /**
     * Defines when guards and resolvers will be run. One of
     * - `paramsOrQueryParamsChange` : Run when query parameters change.
     * - `always` : Run on every execution.
     * By default, guards and resolvers run only when the matrix
     * parameters of the route change.
     * @type {?|undefined}
     */
    Route.prototype.runGuardsAndResolvers;
    /**
     * Filled for routes with `loadChildren` once the module has been loaded
     * \@internal
     * @type {?|undefined}
     */
    Route.prototype._loadedConfig;
}
export class LoadedRouterConfig {
    /**
     * @param {?} routes
     * @param {?} module
     */
    constructor(routes, module) {
        this.routes = routes;
        this.module = module;
    }
}
if (false) {
    /** @type {?} */
    LoadedRouterConfig.prototype.routes;
    /** @type {?} */
    LoadedRouterConfig.prototype.module;
}
/**
 * @param {?} config
 * @param {?=} parentPath
 * @return {?}
 */
export function validateConfig(config, parentPath = '') {
    // forEach doesn't iterate undefined values
    for (let i = 0; i < config.length; i++) {
        /** @type {?} */
        const route = config[i];
        /** @type {?} */
        const fullPath = getFullPath(parentPath, route);
        validateNode(route, fullPath);
    }
}
/**
 * @param {?} route
 * @param {?} fullPath
 * @return {?}
 */
function validateNode(route, fullPath) {
    if (!route) {
        throw new Error(`
      Invalid configuration of route '${fullPath}': Encountered undefined route.
      The reason might be an extra comma.

      Example:
      const routes: Routes = [
        { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
        { path: 'dashboard',  component: DashboardComponent },, << two commas
        { path: 'detail/:id', component: HeroDetailComponent }
      ];
    `);
    }
    if (Array.isArray(route)) {
        throw new Error(`Invalid configuration of route '${fullPath}': Array cannot be specified`);
    }
    if (!route.component && !route.children && !route.loadChildren &&
        (route.outlet && route.outlet !== PRIMARY_OUTLET)) {
        throw new Error(`Invalid configuration of route '${fullPath}': a componentless route without children or loadChildren cannot have a named outlet set`);
    }
    if (route.redirectTo && route.children) {
        throw new Error(`Invalid configuration of route '${fullPath}': redirectTo and children cannot be used together`);
    }
    if (route.redirectTo && route.loadChildren) {
        throw new Error(`Invalid configuration of route '${fullPath}': redirectTo and loadChildren cannot be used together`);
    }
    if (route.children && route.loadChildren) {
        throw new Error(`Invalid configuration of route '${fullPath}': children and loadChildren cannot be used together`);
    }
    if (route.redirectTo && route.component) {
        throw new Error(`Invalid configuration of route '${fullPath}': redirectTo and component cannot be used together`);
    }
    if (route.path && route.matcher) {
        throw new Error(`Invalid configuration of route '${fullPath}': path and matcher cannot be used together`);
    }
    if (route.redirectTo === void 0 && !route.component && !route.children && !route.loadChildren) {
        throw new Error(`Invalid configuration of route '${fullPath}'. One of the following must be provided: component, redirectTo, children or loadChildren`);
    }
    if (route.path === void 0 && route.matcher === void 0) {
        throw new Error(`Invalid configuration of route '${fullPath}': routes must have either a path or a matcher specified`);
    }
    if (typeof route.path === 'string' && route.path.charAt(0) === '/') {
        throw new Error(`Invalid configuration of route '${fullPath}': path cannot start with a slash`);
    }
    if (route.path === '' && route.redirectTo !== void 0 && route.pathMatch === void 0) {
        /** @type {?} */
        const exp = `The default value of 'pathMatch' is 'prefix', but often the intent is to use 'full'.`;
        throw new Error(`Invalid configuration of route '{path: "${fullPath}", redirectTo: "${route.redirectTo}"}': please provide 'pathMatch'. ${exp}`);
    }
    if (route.pathMatch !== void 0 && route.pathMatch !== 'full' && route.pathMatch !== 'prefix') {
        throw new Error(`Invalid configuration of route '${fullPath}': pathMatch can only be set to 'prefix' or 'full'`);
    }
    if (route.children) {
        validateConfig(route.children, fullPath);
    }
}
/**
 * @param {?} parentPath
 * @param {?} currentRoute
 * @return {?}
 */
function getFullPath(parentPath, currentRoute) {
    if (!currentRoute) {
        return parentPath;
    }
    if (!parentPath && !currentRoute.path) {
        return '';
    }
    else if (parentPath && !currentRoute.path) {
        return `${parentPath}/`;
    }
    else if (!parentPath && currentRoute.path) {
        return currentRoute.path;
    }
    else {
        return `${parentPath}/${currentRoute.path}`;
    }
}
/**
 * Makes a copy of the config and adds any default required properties.
 * @param {?} r
 * @return {?}
 */
export function standardizeConfig(r) {
    /** @type {?} */
    const children = r.children && r.children.map(standardizeConfig);
    /** @type {?} */
    const c = children ? Object.assign({}, r, { children }) : Object.assign({}, r);
    if (!c.component && (children || c.loadChildren) && (c.outlet && c.outlet !== PRIMARY_OUTLET)) {
        c.component = EmptyOutletComponent;
    }
    return c;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvcm91dGVyL3NyYy9jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFXQSxPQUFPLEVBQUMsb0JBQW9CLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUUvRCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sVUFBVSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUE2VnhDLDJCQW1HQzs7Ozs7Ozs7SUE3RkMscUJBQWM7Ozs7Ozs7Ozs7Ozs7Ozs7SUFlZCwwQkFBbUI7Ozs7OztJQUtuQix3QkFBcUI7Ozs7OztJQUtyQiwwQkFBc0I7Ozs7Ozs7SUFNdEIsMkJBQW9COzs7Ozs7SUFLcEIsdUJBQWdCOzs7Ozs7O0lBTWhCLDRCQUFvQjs7Ozs7OztJQU1wQixpQ0FBeUI7Ozs7Ozs7O0lBT3pCLDhCQUFzQjs7Ozs7OztJQU10Qix3QkFBZ0I7Ozs7OztJQUtoQixxQkFBWTs7Ozs7SUFJWix3QkFBc0I7Ozs7OztJQUt0Qix5QkFBa0I7Ozs7O0lBSWxCLDZCQUE0Qjs7Ozs7Ozs7O0lBUTVCLHNDQUE4Qzs7Ozs7O0lBSzlDLDhCQUFtQzs7QUFHckMsTUFBTSxPQUFPLGtCQUFrQjs7Ozs7SUFDN0IsWUFBbUIsTUFBZSxFQUFTLE1BQXdCO1FBQWhELFdBQU0sR0FBTixNQUFNLENBQVM7UUFBUyxXQUFNLEdBQU4sTUFBTSxDQUFrQjtJQUFHLENBQUM7Q0FDeEU7OztJ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RCxNQUFNLFVBQVUsaUJBQWlCLENBQUMsQ0FBUTs7VUFDbEMsUUFBUSxHQUFHLENBQUMsQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUM7O1VBQzFELENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxtQkFBSyxDQUFDLElBQUUsUUFBUSxJQUFFLENBQUMsbUJBQUssQ0FBQyxDQUFDO0lBQzlDLElBQUksQ0FBQyxDQUFDLENBQUMsU0FBUyxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLE1BQU0sS0FBSyxjQUFjLENBQUMsRUFBRTtRQUM3RixDQUFDLENBQUMsU0FBUyxHQUFHLG9CQUFvQixDQUFDO0tBQ3BDO0lBQ0QsT0FBTyxDQUFDLENBQUM7QUFDWCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge05nTW9kdWxlRmFjdG9yeSwgTmdNb2R1bGVSZWYsIFR5cGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPYnNlcnZhYmxlfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHtFbXB0eU91dGxldENvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL2VtcHR5X291dGxldCc7XG5pbXBvcnQge0FjdGl2YXRlZFJvdXRlU25hcHNob3R9IGZyb20gJy4vcm91dGVyX3N0YXRlJztcbmltcG9ydCB7UFJJTUFSWV9PVVRMRVR9IGZyb20gJy4vc2hhcmVkJztcbmltcG9ydCB7VXJsU2VnbWVudCwgVXJsU2VnbWVudEdyb3VwfSBmcm9tICcuL3VybF90cmVlJztcblxuXG4vKipcbiAqIFJlcHJlc2VudHMgYSByb3V0ZSBjb25maWd1cmF0aW9uIGZvciB0aGUgUm91dGVyIHNlcnZpY2UuXG4gKiBBbiBhcnJheSBvZiBgUm91dGVgIG9iamVjdHMsIHVzZWQgaW4gYFJvdXRlci5jb25maWdgIGFuZCBmb3IgbmVzdGVkIHJvdXRlIGNvbmZpZ3VyYXRpb25zXG4gKiBpbiBgUm91dGUuY2hpbGRyZW5gLlxuICpcbiAqIEBzZWUgYFJvdXRlYFxuICogQHNlZSBgUm91dGVyYFxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgdHlwZSBSb3V0ZXMgPSBSb3V0ZVtdO1xuXG4vKipcbiAqIFJlcHJlc2VudHMgdGhlIHJlc3VsdCBvZiBtYXRjaGluZyBVUkxzIHdpdGggYSBjdXN0b20gbWF0Y2hpbmcgZnVuY3Rpb24uXG4gKlxuICogKiBgY29uc3VtZWRgIGlzIGFuIGFycmF5IG9mIHRoZSBjb25zdW1lZCBVUkwgc2VnbWVudHMuXG4gKiAqIGBwb3NQYXJhbXNgIGlzIGEgbWFwIG9mIHBvc2l0aW9uYWwgcGFyYW1ldGVycy5cbiAqXG4gKiBAc2VlIGBVcmxNYXRjaGVyKClgXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCB0eXBlIFVybE1hdGNoUmVzdWx0ID0ge1xuICBjb25zdW1lZDogVXJsU2VnbWVudFtdOyBwb3NQYXJhbXM/OiB7W25hbWU6IHN0cmluZ106IFVybFNlZ21lbnR9O1xufTtcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIGZvciBtYXRjaGluZyBhIHJvdXRlIGFnYWluc3QgVVJMcy4gSW1wbGVtZW50IGEgY3VzdG9tIFVSTCBtYXRjaGVyXG4gKiBmb3IgYFJvdXRlLm1hdGNoZXJgIHdoZW4gYSBjb21iaW5hdGlvbiBvZiBgcGF0aGAgYW5kIGBwYXRoTWF0Y2hgXG4gKiBpcyBub3QgZXhwcmVzc2l2ZSBlbm91Z2guXG4gKlxuICogQHBhcmFtIHNlZ21lbnRzIEFuIGFycmF5IG9mIFVSTCBzZWdtZW50cy5cbiAqIEBwYXJhbSBncm91cCBBIHNlZ21lbnQgZ3JvdXAuXG4gKiBAcGFyYW0gcm91dGUgVGhlIHJvdXRlIHRvIG1hdGNoIGFnYWluc3QuXG4gKiBAcmV0dXJucyBUaGUgbWF0Y2gtcmVzdWx0LFxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogVGhlIGZvbGxvd2luZyBtYXRjaGVyIG1hdGNoZXMgSFRNTCBmaWxlcy5cbiAqXG4gKiBgYGBcbiAqIGV4cG9ydCBmdW5jdGlvbiBodG1sRmlsZXModXJsOiBVcmxTZWdtZW50W10pIHtcbiAqICAgcmV0dXJuIHVybC5sZW5ndGggPT09IDEgJiYgdXJsWzBdLnBhdGguZW5kc1dpdGgoJy5odG1sJykgPyAoe2NvbnN1bWVkOiB1cmx9KSA6IG51bGw7XG4gKiB9XG4gKlxuICogZXhwb3J0IGNvbnN0IHJvdXRlcyA9IFt7IG1hdGNoZXI6IGh0bWxGaWxlcywgY29tcG9uZW50OiBBbnlDb21wb25lbnQgfV07XG4gKiBgYGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCB0eXBlIFVybE1hdGNoZXIgPSAoc2VnbWVudHM6IFVybFNlZ21lbnRbXSwgZ3JvdXA6IFVybFNlZ21lbnRHcm91cCwgcm91dGU6IFJvdXRlKSA9PlxuICAgIFVybE1hdGNoUmVzdWx0O1xuXG4vKipcbiAqXG4gKiBSZXByZXNlbnRzIHN0YXRpYyBkYXRhIGFzc29jaWF0ZWQgd2l0aCBhIHBhcnRpY3VsYXIgcm91dGUuXG4gKlxuICogQHNlZSBgUm91dGUjZGF0YWBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCB0eXBlIERhdGEgPSB7XG4gIFtuYW1lOiBzdHJpbmddOiBhbnlcbn07XG5cbi8qKlxuICpcbiAqIFJlcHJlc2VudHMgdGhlIHJlc29sdmVkIGRhdGEgYXNzb2NpYXRlZCB3aXRoIGEgcGFydGljdWxhciByb3V0ZS5cbiAqXG4gKiBAc2VlIGBSb3V0ZSNyZXNvbHZlYC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCB0eXBlIFJlc29sdmVEYXRhID0ge1xuICBbbmFtZTogc3RyaW5nXTogYW55XG59O1xuXG4vKipcbiAqXG4gKiBBIGZ1bmN0aW9uIHRoYXQgaXMgY2FsbGVkIHRvIHJlc29sdmUgYSBjb2xsZWN0aW9uIG9mIGxhenktbG9hZGVkIHJvdXRlcy5cbiAqXG4gKiBAc2VlIGBSb3V0ZSNsb2FkQ2hpbGRyZW5gLlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgdHlwZSBMb2FkQ2hpbGRyZW5DYWxsYmFjayA9ICgpID0+XG4gICAgVHlwZTxhbnk+fCBOZ01vZHVsZUZhY3Rvcnk8YW55PnwgUHJvbWlzZTxUeXBlPGFueT4+fCBPYnNlcnZhYmxlPFR5cGU8YW55Pj47XG5cbi8qKlxuICpcbiAqIEEgc3RyaW5nIG9mIHRoZSBmb3JtIGBwYXRoL3RvL2ZpbGUjZXhwb3J0TmFtZWAgdGhhdCBhY3RzIGFzIGEgVVJMIGZvciBhIHNldCBvZiByb3V0ZXMgdG8gbG9hZCxcbiAqIG9yIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHN1Y2ggYSBzZXQuXG4gKlxuICogQHNlZSBgUm91dGUjbG9hZENoaWxkcmVuYC5cbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IHR5cGUgTG9hZENoaWxkcmVuID0gc3RyaW5nIHwgTG9hZENoaWxkcmVuQ2FsbGJhY2s7XG5cbi8qKlxuICpcbiAqIEhvdyB0byBoYW5kbGUgcXVlcnkgcGFyYW1ldGVycyBpbiBhIHJvdXRlciBsaW5rLlxuICogT25lIG9mOlxuICogLSBgbWVyZ2VgIDogTWVyZ2UgbmV3IHdpdGggY3VycmVudCBwYXJhbWV0ZXJzLlxuICogLSBgcHJlc2VydmVgIDogUHJlc2VydmUgY3VycmVudCBwYXJhbWV0ZXJzLlxuICpcbiAqIEBzZWUgYFJvdXRlckxpbmsjcXVlcnlQYXJhbXNIYW5kbGluZ2AuXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCB0eXBlIFF1ZXJ5UGFyYW1zSGFuZGxpbmcgPSAnbWVyZ2UnIHwgJ3ByZXNlcnZlJyB8ICcnO1xuXG4vKipcbiAqXG4gKiBBIHBvbGljeSBmb3Igd2hlbiB0byBydW4gZ3VhcmRzIGFuZCByZXNvbHZlcnMgb24gYSByb3V0ZS5cbiAqXG4gKiBAc2VlIGBSb3V0ZSNydW5HdWFyZHNBbmRSZXNvbHZlcnNgXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCB0eXBlIFJ1bkd1YXJkc0FuZFJlc29sdmVycyA9ICdwYXRoUGFyYW1zQ2hhbmdlJyB8ICdwYXRoUGFyYW1zT3JRdWVyeVBhcmFtc0NoYW5nZScgfFxuICAgICdwYXJhbXNDaGFuZ2UnIHwgJ3BhcmFtc09yUXVlcnlQYXJhbXNDaGFuZ2UnIHwgJ2Fsd2F5cycgfFxuICAgICgoZnJvbTogQWN0aXZhdGVkUm91dGVTbmFwc2hvdCwgdG86IEFjdGl2YXRlZFJvdXRlU25hcHNob3QpID0+IGJvb2xlYW4pO1xuXG4vKipcbiAqIEEgY29uZmlndXJhdGlvbiBvYmplY3QgdGhhdCBkZWZpbmVzIGEgc2luZ2xlIHJvdXRlLlxuICogQSBzZXQgb2Ygcm91dGVzIGFyZSBjb2xsZWN0ZWQgaW4gYSBgUm91dGVzYCBhcnJheSB0byBkZWZpbmUgYSBgUm91dGVyYCBjb25maWd1cmF0aW9uLlxuICogVGhlIHJvdXRlciBhdHRlbXB0cyB0byBtYXRjaCBzZWdtZW50cyBvZiBhIGdpdmVuIFVSTCBhZ2FpbnN0IGVhY2ggcm91dGUsXG4gKiB1c2luZyB0aGUgY29uZmlndXJhdGlvbiBvcHRpb25zIGRlZmluZWQgaW4gdGhpcyBvYmplY3QuXG4gKlxuICogU3VwcG9ydHMgc3RhdGljLCBwYXJhbWV0ZXJpemVkLCByZWRpcmVjdCwgYW5kIHdpbGRjYXJkIHJvdXRlcywgYXMgd2VsbCBhc1xuICogY3VzdG9tIHJvdXRlIGRhdGEgYW5kIHJlc29sdmUgbWV0aG9kcy5cbiAqXG4gKiBGb3IgZGV0YWlsZWQgdXNhZ2UgaW5mb3JtYXRpb24sIHNlZSB0aGUgW1JvdXRpbmcgR3VpZGVdKGd1aWRlL3JvdXRlcikuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiAjIyMgU2ltcGxlIENvbmZpZ3VyYXRpb25cbiAqXG4gKiBUaGUgZm9sbG93aW5nIHJvdXRlIHNwZWNpZmllcyB0aGF0IHdoZW4gbmF2aWdhdGluZyB0bywgZm9yIGV4YW1wbGUsXG4gKiBgL3RlYW0vMTEvdXNlci9ib2JgLCB0aGUgcm91dGVyIGNyZWF0ZXMgdGhlICdUZWFtJyBjb21wb25lbnRcbiAqIHdpdGggdGhlICdVc2VyJyBjaGlsZCBjb21wb25lbnQgaW4gaXQuXG4gKlxuICogYGBgXG4gKiBbe1xuICogICBwYXRoOiAndGVhbS86aWQnLFxuICAqICBjb21wb25lbnQ6IFRlYW0sXG4gKiAgIGNoaWxkcmVuOiBbe1xuICogICAgIHBhdGg6ICd1c2VyLzpuYW1lJyxcbiAqICAgICBjb21wb25lbnQ6IFVzZXJcbiAqICAgfV1cbiAqIH1dXG4gKiBgYGBcbiAqXG4gKiAjIyMgTXVsdGlwbGUgT3V0bGV0c1xuICpcbiAqIFRoZSBmb2xsb3dpbmcgcm91dGUgY3JlYXRlcyBzaWJsaW5nIGNvbXBvbmVudHMgd2l0aCBtdWx0aXBsZSBvdXRsZXRzLlxuICogV2hlbiBuYXZpZ2F0aW5nIHRvIGAvdGVhbS8xMShhdXg6Y2hhdC9qaW0pYCwgdGhlIHJvdXRlciBjcmVhdGVzIHRoZSAnVGVhbScgY29tcG9uZW50IG5leHQgdG9cbiAqIHRoZSAnQ2hhdCcgY29tcG9uZW50LiBUaGUgJ0NoYXQnIGNvbXBvbmVudCBpcyBwbGFjZWQgaW50byB0aGUgJ2F1eCcgb3V0bGV0LlxuICpcbiAqIGBgYFxuICogW3tcbiAqICAgcGF0aDogJ3RlYW0vOmlkJyxcbiAqICAgY29tcG9uZW50OiBUZWFtXG4gKiB9LCB7XG4gKiAgIHBhdGg6ICdjaGF0Lzp1c2VyJyxcbiAqICAgY29tcG9uZW50OiBDaGF0XG4gKiAgIG91dGxldDogJ2F1eCdcbiAqIH1dXG4gKiBgYGBcbiAqXG4gKiAjIyMgV2lsZCBDYXJkc1xuICpcbiAqIFRoZSBmb2xsb3dpbmcgcm91dGUgdXNlcyB3aWxkLWNhcmQgbm90YXRpb24gdG8gc3BlY2lmeSBhIGNvbXBvbmVudFxuICogdGhhdCBpcyBhbHdheXMgaW5zdGFudGlhdGVkIHJlZ2FyZGxlc3Mgb2Ygd2hlcmUgeW91IG5hdmlnYXRlIHRvLlxuICpcbiAqIGBgYFxuICogW3tcbiAqICAgcGF0aDogJyoqJyxcbiAqICAgY29tcG9uZW50OiBXaWxkY2FyZENvbXBvbmVudFxuICogfV1cbiAqIGBgYFxuICpcbiAqICMjIyBSZWRpcmVjdHNcbiAqXG4gKiBUaGUgZm9sbG93aW5nIHJvdXRlIHVzZXMgdGhlIGByZWRpcmVjdFRvYCBwcm9wZXJ0eSB0byBpZ25vcmUgYSBzZWdtZW50IG9mXG4gKiBhIGdpdmVuIFVSTCB3aGVuIGxvb2tpbmcgZm9yIGEgY2hpbGQgcGF0aC5cbiAqXG4gKiBXaGVuIG5hdmlnYXRpbmcgdG8gJy90ZWFtLzExL2xlZ2FjeS91c2VyL2ppbScsIHRoZSByb3V0ZXIgY2hhbmdlcyB0aGUgVVJMIHNlZ21lbnRcbiAqICcvdGVhbS8xMS9sZWdhY3kvdXNlci9qaW0nIHRvICcvdGVhbS8xMS91c2VyL2ppbScsIGFuZCB0aGVuIGluc3RhbnRpYXRlc1xuICogdGhlIFRlYW0gY29tcG9uZW50IHdpdGggdGhlIFVzZXIgY2hpbGQgY29tcG9uZW50IGluIGl0LlxuICpcbiAqIGBgYFxuICogW3tcbiAqICAgcGF0aDogJ3RlYW0vOmlkJyxcbiAqICAgY29tcG9uZW50OiBUZWFtLFxuICogICBjaGlsZHJlbjogW3tcbiAqICAgICBwYXRoOiAnbGVnYWN5L3VzZXIvOm5hbWUnLFxuICogICAgIHJlZGlyZWN0VG86ICd1c2VyLzpuYW1lJ1xuICogICB9LCB7XG4gKiAgICAgcGF0aDogJ3VzZXIvOm5hbWUnLFxuICogICAgIGNvbXBvbmVudDogVXNlclxuICogICB9XVxuICogfV1cbiAqIGBgYFxuICpcbiAqIFRoZSByZWRpcmVjdCBwYXRoIGNhbiBiZSByZWxhdGl2ZSwgYXMgc2hvd24gaW4gdGhpcyBleGFtcGxlLCBvciBhYnNvbHV0ZS5cbiAqIElmIHdlIGNoYW5nZSB0aGUgYHJlZGlyZWN0VG9gIHZhbHVlIGluIHRoZSBleGFtcGxlIHRvIHRoZSBhYnNvbHV0ZSBVUkwgc2VnbWVudCAnL3VzZXIvOm5hbWUnLFxuICogdGhlIHJlc3VsdCBVUkwgaXMgYWxzbyBhYnNvbHV0ZSwgJy91c2VyL2ppbScuXG5cbiAqICMjIyBFbXB0eSBQYXRoXG4gKlxuICogRW1wdHktcGF0aCByb3V0ZSBjb25maWd1cmF0aW9ucyBjYW4gYmUgdXNlZCB0byBpbnN0YW50aWF0ZSBjb21wb25lbnRzIHRoYXQgZG8gbm90ICdjb25zdW1lJ1xuICogYW55IFVSTCBzZWdtZW50cy5cbiAqXG4gKiBJbiB0aGUgZm9sbG93aW5nIGNvbmZpZ3VyYXRpb24sIHdoZW4gbmF2aWdhdGluZyB0b1xuICogYC90ZWFtLzExYCwgdGhlIHJvdXRlciBpbnN0YW50aWF0ZXMgdGhlICdBbGxVc2VycycgY29tcG9uZW50LlxuICpcbiAqIGBgYFxuICogW3tcbiAqICAgcGF0aDogJ3RlYW0vOmlkJyxcbiAqICAgY29tcG9uZW50OiBUZWFtLFxuICogICBjaGlsZHJlbjogW3tcbiAqICAgICBwYXRoOiAnJyxcbiAqICAgICBjb21wb25lbnQ6IEFsbFVzZXJzXG4gKiAgIH0sIHtcbiAqICAgICBwYXRoOiAndXNlci86bmFtZScsXG4gKiAgICAgY29tcG9uZW50OiBVc2VyXG4gKiAgIH1dXG4gKiB9XVxuICogYGBgXG4gKlxuICogRW1wdHktcGF0aCByb3V0ZXMgY2FuIGhhdmUgY2hpbGRyZW4uIEluIHRoZSBmb2xsb3dpbmcgZXhhbXBsZSwgd2hlbiBuYXZpZ2F0aW5nXG4gKiB0byBgL3RlYW0vMTEvdXNlci9qaW1gLCB0aGUgcm91dGVyIGluc3RhbnRpYXRlcyB0aGUgd3JhcHBlciBjb21wb25lbnQgd2l0aFxuICogdGhlIHVzZXIgY29tcG9uZW50IGluIGl0LlxuICpcbiAqIE5vdGUgdGhhdCBhbiBlbXB0eSBwYXRoIHJvdXRlIGluaGVyaXRzIGl0cyBwYXJlbnQncyBwYXJhbWV0ZXJzIGFuZCBkYXRhLlxuICpcbiAqIGBgYFxuICogW3tcbiAqICAgcGF0aDogJ3RlYW0vOmlkJyxcbiAqICAgY29tcG9uZW50OiBUZWFtLFxuICogICBjaGlsZHJlbjogW3tcbiAqICAgICBwYXRoOiAnJyxcbiAqICAgICBjb21wb25lbnQ6IFdyYXBwZXJDbXAsXG4gKiAgICAgY2hpbGRyZW46IFt7XG4gKiAgICAgICBwYXRoOiAndXNlci86bmFtZScsXG4gKiAgICAgICBjb21wb25lbnQ6IFVzZXJcbiAqICAgICB9XVxuICogICB9XVxuICogfV1cbiAqIGBgYFxuICpcbiAqICMjIyBNYXRjaGluZyBTdHJhdGVneVxuICpcbiAqIFRoZSBkZWZhdWx0IHBhdGgtbWF0Y2ggc3RyYXRlZ3kgaXMgJ3ByZWZpeCcsIHdoaWNoIG1lYW5zIHRoYXQgdGhlIHJvdXRlclxuICogY2hlY2tzIFVSTCBlbGVtZW50cyBmcm9tIHRoZSBsZWZ0IHRvIHNlZSBpZiB0aGUgVVJMIG1hdGNoZXMgYSBzcGVjaWZpZWQgcGF0aC5cbiAqIEZvciBleGFtcGxlLCAnL3RlYW0vMTEvdXNlcicgbWF0Y2hlcyAndGVhbS86aWQnLlxuICpcbiAqIGBgYFxuICogW3tcbiAqICAgcGF0aDogJycsXG4gKiAgIHBhdGhNYXRjaDogJ3ByZWZpeCcsIC8vZGVmYXVsdFxuICogICByZWRpcmVjdFRvOiAnbWFpbidcbiAqIH0sIHtcbiAqICAgcGF0aDogJ21haW4nLFxuICogICBjb21wb25lbnQ6IE1haW5cbiAqIH1dXG4gKiBgYGBcbiAqXG4gKiBZb3UgY2FuIHNwZWNpZnkgdGhlIHBhdGgtbWF0Y2ggc3RyYXRlZ3kgJ2Z1bGwnIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSBwYXRoXG4gKiBjb3ZlcnMgdGhlIHdob2xlIHVuY29uc3VtZWQgVVJMLiBJdCBpcyBpbXBvcnRhbnQgdG8gZG8gdGhpcyB3aGVuIHJlZGlyZWN0aW5nXG4gKiBlbXB0eS1wYXRoIHJvdXRlcy4gT3RoZXJ3aXNlLCBiZWNhdXNlIGFuIGVtcHR5IHBhdGggaXMgYSBwcmVmaXggb2YgYW55IFVSTCxcbiAqIHRoZSByb3V0ZXIgd291bGQgYXBwbHkgdGhlIHJlZGlyZWN0IGV2ZW4gd2hlbiBuYXZpZ2F0aW5nIHRvIHRoZSByZWRpcmVjdCBkZXN0aW5hdGlvbixcbiAqIGNyZWF0aW5nIGFuIGVuZGxlc3MgbG9vcC5cbiAqXG4gKiBJbiB0aGUgZm9sbG93aW5nIGV4YW1wbGUsIHN1cHBseWluZyB0aGUgJ2Z1bGwnIGBwYXRjaE1hdGNoYCBzdHJhdGVneSBlbnN1cmVzXG4gKiB0aGF0IHRoZSByb3V0ZXIgYXBwbGllcyB0aGUgcmVkaXJlY3QgaWYgYW5kIG9ubHkgaWYgbmF2aWdhdGluZyB0byAnLycuXG4gKlxuICogYGBgXG4gKiBbe1xuICogICBwYXRoOiAnJyxcbiAqICAgcGF0aE1hdGNoOiAnZnVsbCcsXG4gKiAgIHJlZGlyZWN0VG86ICdtYWluJ1xuICogfSwge1xuICogICBwYXRoOiAnbWFpbicsXG4gKiAgIGNvbXBvbmVudDogTWFpblxuICogfV1cbiAqIGBgYFxuICpcbiAqICMjIyBDb21wb25lbnRsZXNzIFJvdXRlc1xuICpcbiAqIFlvdSBjYW4gc2hhcmUgcGFyYW1ldGVycyBiZXR3ZWVuIHNpYmxpbmcgY29tcG9uZW50cy5cbiAqIEZvciBleGFtcGxlLCBzdXBwb3NlIHRoYXQgdHdvIHNpYmxpbmcgY29tcG9uZW50cyBzaG91bGQgZ28gbmV4dCB0byBlYWNoIG90aGVyLFxuICogYW5kIGJvdGggb2YgdGhlbSByZXF1aXJlIGFuIElEIHBhcmFtZXRlci4gWW91IGNhbiBhY2NvbXBsaXNoIHRoaXMgdXNpbmcgYSByb3V0ZVxuICogdGhhdCBkb2VzIG5vdCBzcGVjaWZ5IGEgY29tcG9uZW50IGF0IHRoZSB0b3AgbGV2ZWwuXG4gKlxuICogSW4gdGhlIGZvbGxvd2luZyBleGFtcGxlLCAnQ2hpbGRDbXAnIGFuZCAnQXV4Q21wJyBhcmUgc2libGluZ3MuXG4gKiBXaGVuIG5hdmlnYXRpbmcgdG8gJ3BhcmVudC8xMC8oYS8vYXV4OmIpJywgdGhlIHJvdXRlIGluc3RhbnRpYXRlc1xuICogdGhlIG1haW4gY2hpbGQgYW5kIGF1eCBjaGlsZCBjb21wb25lbnRzIG5leHQgdG8gZWFjaCBvdGhlci5cbiAqIEZvciB0aGlzIHRvIHdvcmssIHRoZSBhcHBsaWNhdGlvbiBjb21wb25lbnQgbXVzdCBoYXZlIHRoZSBwcmltYXJ5IGFuZCBhdXggb3V0bGV0cyBkZWZpbmVkLlxuICpcbiAqIGBgYFxuICogW3tcbiAqICAgIHBhdGg6ICdwYXJlbnQvOmlkJyxcbiAqICAgIGNoaWxkcmVuOiBbXG4gKiAgICAgIHsgcGF0aDogJ2EnLCBjb21wb25lbnQ6IE1haW5DaGlsZCB9LFxuICogICAgICB7IHBhdGg6ICdiJywgY29tcG9uZW50OiBBdXhDaGlsZCwgb3V0bGV0OiAnYXV4JyB9XG4gKiAgICBdXG4gKiB9XVxuICogYGBgXG4gKlxuICogVGhlIHJvdXRlciBtZXJnZXMgdGhlIHBhcmFtZXRlcnMsIGRhdGEsIGFuZCByZXNvbHZlIG9mIHRoZSBjb21wb25lbnRsZXNzXG4gKiBwYXJlbnQgaW50byB0aGUgcGFyYW1ldGVycywgZGF0YSwgYW5kIHJlc29sdmUgb2YgdGhlIGNoaWxkcmVuLlxuICpcbiAqIFRoaXMgaXMgZXNwZWNpYWxseSB1c2VmdWwgd2hlbiBjaGlsZCBjb21wb25lbnRzIGFyZSBkZWZpbmVkXG4gKiB3aXRoIGFuIGVtcHR5IHBhdGggc3RyaW5nLCBhcyBpbiB0aGUgZm9sbG93aW5nIGV4YW1wbGUuXG4gKiBXaXRoIHRoaXMgY29uZmlndXJhdGlvbiwgbmF2aWdhdGluZyB0byAnL3BhcmVudC8xMCcgY3JlYXRlc1xuICogdGhlIG1haW4gY2hpbGQgYW5kIGF1eCBjb21wb25lbnRzLlxuICpcbiAqIGBgYFxuICogW3tcbiAqICAgIHBhdGg6ICdwYXJlbnQvOmlkJyxcbiAqICAgIGNoaWxkcmVuOiBbXG4gKiAgICAgIHsgcGF0aDogJycsIGNvbXBvbmVudDogTWFpbkNoaWxkIH0sXG4gKiAgICAgIHsgcGF0aDogJycsIGNvbXBvbmVudDogQXV4Q2hpbGQsIG91dGxldDogJ2F1eCcgfVxuICogICAgXVxuICogfV1cbiAqIGBgYFxuICpcbiAqICMjIyBMYXp5IExvYWRpbmdcbiAqXG4gKiBMYXp5IGxvYWRpbmcgc3BlZWRzIHVwIGFwcGxpY2F0aW9uIGxvYWQgdGltZSBieSBzcGxpdHRpbmcgdGhlIGFwcGxpY2F0aW9uXG4gKiBpbnRvIG11bHRpcGxlIGJ1bmRsZXMgYW5kIGxvYWRpbmcgdGhlbSBvbiBkZW1hbmQuXG4gKiBUbyB1c2UgbGF6eSBsb2FkaW5nLCBwcm92aWRlIHRoZSBgbG9hZENoaWxkcmVuYCBwcm9wZXJ0eSAgaW5zdGVhZCBvZiB0aGUgYGNoaWxkcmVuYCBwcm9wZXJ0eS5cbiAqXG4gKiBHaXZlbiB0aGUgZm9sbG93aW5nIGV4YW1wbGUgcm91dGUsIHRoZSByb3V0ZXIgdXNlcyB0aGUgcmVnaXN0ZXJlZFxuICogYE5nTW9kdWxlRmFjdG9yeUxvYWRlcmAgdG8gZmV0Y2ggYW4gTmdNb2R1bGUgYXNzb2NpYXRlZCB3aXRoICd0ZWFtJy5cbiAqIEl0IHRoZW4gZXh0cmFjdHMgdGhlIHNldCBvZiByb3V0ZXMgZGVmaW5lZCBpbiB0aGF0IE5nTW9kdWxlLFxuICogYW5kIHRyYW5zcGFyZW50bHkgYWRkcyB0aG9zZSByb3V0ZXMgdG8gdGhlIG1haW4gY29uZmlndXJhdGlvbi5cbiAqXG4gKiBgYGBcbiAqIFt7XG4gKiAgIHBhdGg6ICd0ZWFtLzppZCcsXG4gKiAgIGNvbXBvbmVudDogVGVhbSxcbiAqICAgbG9hZENoaWxkcmVuOiAndGVhbSdcbiAqIH1dXG4gKiBgYGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUm91dGUge1xuICAvKipcbiAgICogVGhlIHBhdGggdG8gbWF0Y2ggYWdhaW5zdCwgYSBVUkwgc3RyaW5nIHRoYXQgdXNlcyByb3V0ZXIgbWF0Y2hpbmcgbm90YXRpb24uXG4gICAqIENhbiBpbmNsdWRlIHdpbGQtY2FyZCBjaGFyYWN0ZXJzICgqKS4gICBbd2hlcmUgaXMgdGhhdCBkZWZpbmVkP11cbiAgICogRGVmYXVsdCBpcyBcIi9cIiAodGhlIHJvb3QgcGF0aCkuXG4gICAqL1xuICBwYXRoPzogc3RyaW5nO1xuICAvKipcbiAgICogVGhlIHBhdGgtbWF0Y2hpbmcgc3RyYXRlZ3ksIG9uZSBvZiAncHJlZml4JyBvciAnZnVsbCcuXG4gICAqIERlZmF1bHQgaXMgJ3ByZWZpeCcuXG4gICAqXG4gICAqIEJ5IGRlZmF1bHQsIHRoZSByb3V0ZXIgY2hlY2tzIFVSTCBlbGVtZW50cyBmcm9tIHRoZSBsZWZ0IHRvIHNlZSBpZiB0aGUgVVJMXG4gICAqIG1hdGNoZXMgYSBnaXZlbiAgcGF0aCwgYW5kIHN0b3BzIHdoZW4gdGhlcmUgaXMgYSBtYXRjaC4gRm9yIGV4YW1wbGUsXG4gICAqICcvdGVhbS8xMS91c2VyJyBtYXRjaGVzICd0ZWFtLzppZCcuXG4gICAqIFRoZSBwYXRoLW1hdGNoIHN0cmF0ZWd5ICdmdWxsJyBtYXRjaGVzIGFnYWluc3QgdGhlIGVudGlyZSBVUkwuXG4gICAqIEl0IGlzIGltcG9ydGFudCB0byBkbyB0aGlzIHdoZW4gcmVkaXJlY3RpbmcgZW1wdHktcGF0aCByb3V0ZXMuXG4gICAqIE90aGVyd2lzZSwgYmVjYXVzZSBhbiBlbXB0eSBwYXRoIGlzIGEgcHJlZml4IG9mIGFueSBVUkwsXG4gICAqIHRoZSByb3V0ZXIgd291bGQgYXBwbHkgdGhlIHJlZGlyZWN0IGV2ZW4gd2hlbiBuYXZpZ2F0aW5nXG4gICAqIHRvIHRoZSByZWRpcmVjdCBkZXN0aW5hdGlvbiwgY3JlYXRpbmcgYW4gZW5kbGVzcyBsb29wLlxuICAgKlxuICAgKi9cbiAgcGF0aE1hdGNoPzogc3RyaW5nO1xuICAvKipcbiAgICogQSBVUkwtbWF0Y2hpbmcgZnVuY3Rpb24gdG8gdXNlIGFzIGEgY3VzdG9tIHN0cmF0ZWd5IGZvciBwYXRoIG1hdGNoaW5nLlxuICAgKiBJZiBwcmVzZW50LCBzdXBlcnNlZGVzIGBwYXRoYCBhbmQgYHBhdGhNYXRjaGAuXG4gICAqL1xuICBtYXRjaGVyPzogVXJsTWF0Y2hlcjtcbiAgLyoqXG4gICAqIFRoZSBjb21wb25lbnQgdG8gaW5zdGFudGlhdGUgd2hlbiB0aGUgcGF0aCBtYXRjaGVzLlxuICAgKiBDYW4gYmUgZW1wdHkgaWYgY2hpbGQgcm91dGVzIHNwZWNpZnkgY29tcG9uZW50cy5cbiAgICovXG4gIGNvbXBvbmVudD86IFR5cGU8YW55PjtcbiAgLyoqXG4gICAqIEEgVVJMIHRvIHdoaWNoIHRvIHJlZGlyZWN0IHdoZW4gYSB0aGUgcGF0aCBtYXRjaGVzLlxuICAgKiBBYnNvbHV0ZSBpZiB0aGUgVVJMIGJlZ2lucyB3aXRoIGEgc2xhc2ggKC8pLCBvdGhlcndpc2UgcmVsYXRpdmUgdG8gdGhlIHBhdGggVVJMLlxuICAgKiBXaGVuIG5vdCBwcmVzZW50LCByb3V0ZXIgZG9lcyBub3QgcmVkaXJlY3QuXG4gICAqL1xuICByZWRpcmVjdFRvPzogc3RyaW5nO1xuICAvKipcbiAgICogTmFtZSBvZiBhIGBSb3V0ZXJPdXRsZXRgIG9iamVjdCB3aGVyZSB0aGUgY29tcG9uZW50IGNhbiBiZSBwbGFjZWRcbiAgICogd2hlbiB0aGUgcGF0aCBtYXRjaGVzLlxuICAgKi9cbiAgb3V0bGV0Pzogc3RyaW5nO1xuICAvKipcbiAgICogQW4gYXJyYXkgb2YgZGVwZW5kZW5jeS1pbmplY3Rpb24gdG9rZW5zIHVzZWQgdG8gbG9vayB1cCBgQ2FuQWN0aXZhdGUoKWBcbiAgICogaGFuZGxlcnMsIGluIG9yZGVyIHRvIGRldGVybWluZSBpZiB0aGUgY3VycmVudCB1c2VyIGlzIGFsbG93ZWQgdG9cbiAgICogYWN0aXZhdGUgdGhlIGNvbXBvbmVudC4gQnkgZGVmYXVsdCwgYW55IHVzZXIgY2FuIGFjdGl2YXRlLlxuICAgKi9cbiAgY2FuQWN0aXZhdGU/OiBhbnlbXTtcbiAgLyoqXG4gICAqIEFuIGFycmF5IG9mIERJIHRva2VucyB1c2VkIHRvIGxvb2sgdXAgYENhbkFjdGl2YXRlQ2hpbGQoKWAgaGFuZGxlcnMsXG4gICAqIGluIG9yZGVyIHRvIGRldGVybWluZSBpZiB0aGUgY3VycmVudCB1c2VyIGlzIGFsbG93ZWQgdG8gYWN0aXZhdGVcbiAgICogYSBjaGlsZCBvZiB0aGUgY29tcG9uZW50LiBCeSBkZWZhdWx0LCBhbnkgdXNlciBjYW4gYWN0aXZhdGUgYSBjaGlsZC5cbiAgICovXG4gIGNhbkFjdGl2YXRlQ2hpbGQ/OiBhbnlbXTtcbiAgLyoqXG4gICAqIEFuIGFycmF5IG9mIERJIHRva2VucyB1c2VkIHRvIGxvb2sgdXAgYENhbkRlYWN0aXZhdGUoKWBcbiAgICogaGFuZGxlcnMsIGluIG9yZGVyIHRvIGRldGVybWluZSBpZiB0aGUgY3VycmVudCB1c2VyIGlzIGFsbG93ZWQgdG9cbiAgICogZGVhY3RpdmF0ZSB0aGUgY29tcG9uZW50LiBCeSBkZWZhdWx0LCBhbnkgdXNlciBjYW4gZGVhY3RpdmF0ZS5cbiAgICpcbiAgICovXG4gIGNhbkRlYWN0aXZhdGU/OiBhbnlbXTtcbiAgLyoqXG4gICAqIEFuIGFycmF5IG9mIERJIHRva2VucyB1c2VkIHRvIGxvb2sgdXAgYENhbkxvYWQoKWBcbiAgICogaGFuZGxlcnMsIGluIG9yZGVyIHRvIGRldGVybWluZSBpZiB0aGUgY3VycmVudCB1c2VyIGlzIGFsbG93ZWQgdG9cbiAgICogbG9hZCB0aGUgY29tcG9uZW50LiBCeSBkZWZhdWx0LCBhbnkgdXNlciBjYW4gbG9hZC5cbiAgICovXG4gIGNhbkxvYWQ/OiBhbnlbXTtcbiAgLyoqXG4gICAqIEFkZGl0aW9uYWwgZGV2ZWxvcGVyLWRlZmluZWQgZGF0YSBwcm92aWRlZCB0byB0aGUgY29tcG9uZW50IHZpYVxuICAgKiBgQWN0aXZhdGVkUm91dGVgLiBCeSBkZWZhdWx0LCBubyBhZGRpdGlvbmFsIGRhdGEgaXMgcGFzc2VkLlxuICAgKi9cbiAgZGF0YT86IERhdGE7XG4gIC8qKlxuICAgKiBBIG1hcCBvZiBESSB0b2tlbnMgdXNlZCB0byBsb29rIHVwIGRhdGEgcmVzb2x2ZXJzLiBTZWUgYFJlc29sdmVgLlxuICAgKi9cbiAgcmVzb2x2ZT86IFJlc29sdmVEYXRhO1xuICAvKipcbiAgICogQW4gYXJyYXkgb2YgY2hpbGQgYFJvdXRlYCBvYmplY3RzIHRoYXQgc3BlY2lmaWVzIGEgbmVzdGVkIHJvdXRlXG4gICAqIGNvbmZpZ3VyYXRpb24uXG4gICAqL1xuICBjaGlsZHJlbj86IFJvdXRlcztcbiAgLyoqXG4gICAqIEEgYExvYWRDaGlsZHJlbmAgb2JqZWN0IHNwZWNpZnlpbmcgbGF6eS1sb2FkZWQgY2hpbGQgcm91dGVzLlxuICAgKi9cbiAgbG9hZENoaWxkcmVuPzogTG9hZENoaWxkcmVuO1xuICAvKipcbiAgICogRGVmaW5lcyB3aGVuIGd1YXJkcyBhbmQgcmVzb2x2ZXJzIHdpbGwgYmUgcnVuLiBPbmUgb2ZcbiAgICogLSBgcGFyYW1zT3JRdWVyeVBhcmFtc0NoYW5nZWAgOiBSdW4gd2hlbiBxdWVyeSBwYXJhbWV0ZXJzIGNoYW5nZS5cbiAgICogLSBgYWx3YXlzYCA6IFJ1biBvbiBldmVyeSBleGVjdXRpb24uXG4gICAqIEJ5IGRlZmF1bHQsIGd1YXJkcyBhbmQgcmVzb2x2ZXJzIHJ1biBvbmx5IHdoZW4gdGhlIG1hdHJpeFxuICAgKiBwYXJhbWV0ZXJzIG9mIHRoZSByb3V0ZSBjaGFuZ2UuXG4gICAqL1xuICBydW5HdWFyZHNBbmRSZXNvbHZlcnM/OiBSdW5HdWFyZHNBbmRSZXNvbHZlcnM7XG4gIC8qKlxuICAgKiBGaWxsZWQgZm9yIHJvdXRlcyB3aXRoIGBsb2FkQ2hpbGRyZW5gIG9uY2UgdGhlIG1vZHVsZSBoYXMgYmVlbiBsb2FkZWRcbiAgICogQGludGVybmFsXG4gICAqL1xuICBfbG9hZGVkQ29uZmlnPzogTG9hZGVkUm91dGVyQ29uZmlnO1xufVxuXG5leHBvcnQgY2xhc3MgTG9hZGVkUm91dGVyQ29uZmlnIHtcbiAgY29uc3RydWN0b3IocHVibGljIHJvdXRlczogUm91dGVbXSwgcHVibGljIG1vZHVsZTogTmdNb2R1bGVSZWY8YW55Pikge31cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlQ29uZmlnKGNvbmZpZzogUm91dGVzLCBwYXJlbnRQYXRoOiBzdHJpbmcgPSAnJyk6IHZvaWQge1xuICAvLyBmb3JFYWNoIGRvZXNuJ3QgaXRlcmF0ZSB1bmRlZmluZWQgdmFsdWVzXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY29uZmlnLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3Qgcm91dGU6IFJvdXRlID0gY29uZmlnW2ldO1xuICAgIGNvbnN0IGZ1bGxQYXRoOiBzdHJpbmcgPSBnZXRGdWxsUGF0aChwYXJlbnRQYXRoLCByb3V0ZSk7XG4gICAgdmFsaWRhdGVOb2RlKHJvdXRlLCBmdWxsUGF0aCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVOb2RlKHJvdXRlOiBSb3V0ZSwgZnVsbFBhdGg6IHN0cmluZyk6IHZvaWQge1xuICBpZiAoIXJvdXRlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBcbiAgICAgIEludmFsaWQgY29uZmlndXJhdGlvbiBvZiByb3V0ZSAnJHtmdWxsUGF0aH0nOiBFbmNvdW50ZXJlZCB1bmRlZmluZWQgcm91dGUuXG4gICAgICBUaGUgcmVhc29uIG1pZ2h0IGJlIGFuIGV4dHJhIGNvbW1hLlxuXG4gICAgICBFeGFtcGxlOlxuICAgICAgY29uc3Qgcm91dGVzOiBSb3V0ZXMgPSBbXG4gICAgICAgIHsgcGF0aDogJycsIHJlZGlyZWN0VG86ICcvZGFzaGJvYXJkJywgcGF0aE1hdGNoOiAnZnVsbCcgfSxcbiAgICAgICAgeyBwYXRoOiAnZGFzaGJvYXJkJywgIGNvbXBvbmVudDogRGFzaGJvYXJkQ29tcG9uZW50IH0sLCA8PCB0d28gY29tbWFzXG4gICAgICAgIHsgcGF0aDogJ2RldGFpbC86aWQnLCBjb21wb25lbnQ6IEhlcm9EZXRhaWxDb21wb25lbnQgfVxuICAgICAgXTtcbiAgICBgKTtcbiAgfVxuICBpZiAoQXJyYXkuaXNBcnJheShyb3V0ZSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgY29uZmlndXJhdGlvbiBvZiByb3V0ZSAnJHtmdWxsUGF0aH0nOiBBcnJheSBjYW5ub3QgYmUgc3BlY2lmaWVkYCk7XG4gIH1cbiAgaWYgKCFyb3V0ZS5jb21wb25lbnQgJiYgIXJvdXRlLmNoaWxkcmVuICYmICFyb3V0ZS5sb2FkQ2hpbGRyZW4gJiZcbiAgICAgIChyb3V0ZS5vdXRsZXQgJiYgcm91dGUub3V0bGV0ICE9PSBQUklNQVJZX09VVExFVCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBJbnZhbGlkIGNvbmZpZ3VyYXRpb24gb2Ygcm91dGUgJyR7ZnVsbFBhdGh9JzogYSBjb21wb25lbnRsZXNzIHJvdXRlIHdpdGhvdXQgY2hpbGRyZW4gb3IgbG9hZENoaWxkcmVuIGNhbm5vdCBoYXZlIGEgbmFtZWQgb3V0bGV0IHNldGApO1xuICB9XG4gIGlmIChyb3V0ZS5yZWRpcmVjdFRvICYmIHJvdXRlLmNoaWxkcmVuKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgSW52YWxpZCBjb25maWd1cmF0aW9uIG9mIHJvdXRlICcke2Z1bGxQYXRofSc6IHJlZGlyZWN0VG8gYW5kIGNoaWxkcmVuIGNhbm5vdCBiZSB1c2VkIHRvZ2V0aGVyYCk7XG4gIH1cbiAgaWYgKHJvdXRlLnJlZGlyZWN0VG8gJiYgcm91dGUubG9hZENoaWxkcmVuKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgSW52YWxpZCBjb25maWd1cmF0aW9uIG9mIHJvdXRlICcke2Z1bGxQYXRofSc6IHJlZGlyZWN0VG8gYW5kIGxvYWRDaGlsZHJlbiBjYW5ub3QgYmUgdXNlZCB0b2dldGhlcmApO1xuICB9XG4gIGlmIChyb3V0ZS5jaGlsZHJlbiAmJiByb3V0ZS5sb2FkQ2hpbGRyZW4pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBJbnZhbGlkIGNvbmZpZ3VyYXRpb24gb2Ygcm91dGUgJyR7ZnVsbFBhdGh9JzogY2hpbGRyZW4gYW5kIGxvYWRDaGlsZHJlbiBjYW5ub3QgYmUgdXNlZCB0b2dldGhlcmApO1xuICB9XG4gIGlmIChyb3V0ZS5yZWRpcmVjdFRvICYmIHJvdXRlLmNvbXBvbmVudCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYEludmFsaWQgY29uZmlndXJhdGlvbiBvZiByb3V0ZSAnJHtmdWxsUGF0aH0nOiByZWRpcmVjdFRvIGFuZCBjb21wb25lbnQgY2Fubm90IGJlIHVzZWQgdG9nZXRoZXJgKTtcbiAgfVxuICBpZiAocm91dGUucGF0aCAmJiByb3V0ZS5tYXRjaGVyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgSW52YWxpZCBjb25maWd1cmF0aW9uIG9mIHJvdXRlICcke2Z1bGxQYXRofSc6IHBhdGggYW5kIG1hdGNoZXIgY2Fubm90IGJlIHVzZWQgdG9nZXRoZXJgKTtcbiAgfVxuICBpZiAocm91dGUucmVkaXJlY3RUbyA9PT0gdm9pZCAwICYmICFyb3V0ZS5jb21wb25lbnQgJiYgIXJvdXRlLmNoaWxkcmVuICYmICFyb3V0ZS5sb2FkQ2hpbGRyZW4pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBJbnZhbGlkIGNvbmZpZ3VyYXRpb24gb2Ygcm91dGUgJyR7ZnVsbFBhdGh9Jy4gT25lIG9mIHRoZSBmb2xsb3dpbmcgbXVzdCBiZSBwcm92aWRlZDogY29tcG9uZW50LCByZWRpcmVjdFRvLCBjaGlsZHJlbiBvciBsb2FkQ2hpbGRyZW5gKTtcbiAgfVxuICBpZiAocm91dGUucGF0aCA9PT0gdm9pZCAwICYmIHJvdXRlLm1hdGNoZXIgPT09IHZvaWQgMCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYEludmFsaWQgY29uZmlndXJhdGlvbiBvZiByb3V0ZSAnJHtmdWxsUGF0aH0nOiByb3V0ZXMgbXVzdCBoYXZlIGVpdGhlciBhIHBhdGggb3IgYSBtYXRjaGVyIHNwZWNpZmllZGApO1xuICB9XG4gIGlmICh0eXBlb2Ygcm91dGUucGF0aCA9PT0gJ3N0cmluZycgJiYgcm91dGUucGF0aC5jaGFyQXQoMCkgPT09ICcvJykge1xuICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBjb25maWd1cmF0aW9uIG9mIHJvdXRlICcke2Z1bGxQYXRofSc6IHBhdGggY2Fubm90IHN0YXJ0IHdpdGggYSBzbGFzaGApO1xuICB9XG4gIGlmIChyb3V0ZS5wYXRoID09PSAnJyAmJiByb3V0ZS5yZWRpcmVjdFRvICE9PSB2b2lkIDAgJiYgcm91dGUucGF0aE1hdGNoID09PSB2b2lkIDApIHtcbiAgICBjb25zdCBleHAgPVxuICAgICAgICBgVGhlIGRlZmF1bHQgdmFsdWUgb2YgJ3BhdGhNYXRjaCcgaXMgJ3ByZWZpeCcsIGJ1dCBvZnRlbiB0aGUgaW50ZW50IGlzIHRvIHVzZSAnZnVsbCcuYDtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBJbnZhbGlkIGNvbmZpZ3VyYXRpb24gb2Ygcm91dGUgJ3twYXRoOiBcIiR7ZnVsbFBhdGh9XCIsIHJlZGlyZWN0VG86IFwiJHtyb3V0ZS5yZWRpcmVjdFRvfVwifSc6IHBsZWFzZSBwcm92aWRlICdwYXRoTWF0Y2gnLiAke2V4cH1gKTtcbiAgfVxuICBpZiAocm91dGUucGF0aE1hdGNoICE9PSB2b2lkIDAgJiYgcm91dGUucGF0aE1hdGNoICE9PSAnZnVsbCcgJiYgcm91dGUucGF0aE1hdGNoICE9PSAncHJlZml4Jykge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYEludmFsaWQgY29uZmlndXJhdGlvbiBvZiByb3V0ZSAnJHtmdWxsUGF0aH0nOiBwYXRoTWF0Y2ggY2FuIG9ubHkgYmUgc2V0IHRvICdwcmVmaXgnIG9yICdmdWxsJ2ApO1xuICB9XG4gIGlmIChyb3V0ZS5jaGlsZHJlbikge1xuICAgIHZhbGlkYXRlQ29uZmlnKHJvdXRlLmNoaWxkcmVuLCBmdWxsUGF0aCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0RnVsbFBhdGgocGFyZW50UGF0aDogc3RyaW5nLCBjdXJyZW50Um91dGU6IFJvdXRlKTogc3RyaW5nIHtcbiAgaWYgKCFjdXJyZW50Um91dGUpIHtcbiAgICByZXR1cm4gcGFyZW50UGF0aDtcbiAgfVxuICBpZiAoIXBhcmVudFBhdGggJiYgIWN1cnJlbnRSb3V0ZS5wYXRoKSB7XG4gICAgcmV0dXJuICcnO1xuICB9IGVsc2UgaWYgKHBhcmVudFBhdGggJiYgIWN1cnJlbnRSb3V0ZS5wYXRoKSB7XG4gICAgcmV0dXJuIGAke3BhcmVudFBhdGh9L2A7XG4gIH0gZWxzZSBpZiAoIXBhcmVudFBhdGggJiYgY3VycmVudFJvdXRlLnBhdGgpIHtcbiAgICByZXR1cm4gY3VycmVudFJvdXRlLnBhdGg7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGAke3BhcmVudFBhdGh9LyR7Y3VycmVudFJvdXRlLnBhdGh9YDtcbiAgfVxufVxuXG4vKipcbiAqIE1ha2VzIGEgY29weSBvZiB0aGUgY29uZmlnIGFuZCBhZGRzIGFueSBkZWZhdWx0IHJlcXVpcmVkIHByb3BlcnRpZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdGFuZGFyZGl6ZUNvbmZpZyhyOiBSb3V0ZSk6IFJvdXRlIHtcbiAgY29uc3QgY2hpbGRyZW4gPSByLmNoaWxkcmVuICYmIHIuY2hpbGRyZW4ubWFwKHN0YW5kYXJkaXplQ29uZmlnKTtcbiAgY29uc3QgYyA9IGNoaWxkcmVuID8gey4uLnIsIGNoaWxkcmVufSA6IHsuLi5yfTtcbiAgaWYgKCFjLmNvbXBvbmVudCAmJiAoY2hpbGRyZW4gfHwgYy5sb2FkQ2hpbGRyZW4pICYmIChjLm91dGxldCAmJiBjLm91dGxldCAhPT0gUFJJTUFSWV9PVVRMRVQpKSB7XG4gICAgYy5jb21wb25lbnQgPSBFbXB0eU91dGxldENvbXBvbmVudDtcbiAgfVxuICByZXR1cm4gYztcbn1cbiJdfQ==