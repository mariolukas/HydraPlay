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
import { equalParamsAndUrlSegments } from '../router_state';
import { equalPath } from '../url_tree';
import { forEach, shallowEqual } from '../utils/collection';
import { nodeChildrenAsMap } from '../utils/tree';
export class CanActivate {
    /**
     * @param {?} path
     */
    constructor(path) {
        this.path = path;
        this.route = this.path[this.path.length - 1];
    }
}
if (false) {
    /** @type {?} */
    CanActivate.prototype.route;
    /** @type {?} */
    CanActivate.prototype.path;
}
export class CanDeactivate {
    /**
     * @param {?} component
     * @param {?} route
     */
    constructor(component, route) {
        this.component = component;
        this.route = route;
    }
}
if (false) {
    /** @type {?} */
    CanDeactivate.prototype.component;
    /** @type {?} */
    CanDeactivate.prototype.route;
}
/**
 * @param {?} future
 * @param {?} curr
 * @param {?} parentContexts
 * @return {?}
 */
export function getAllRouteGuards(future, curr, parentContexts) {
    /** @type {?} */
    const futureRoot = future._root;
    /** @type {?} */
    const currRoot = curr ? curr._root : null;
    return getChildRouteGuards(futureRoot, currRoot, parentContexts, [futureRoot.value]);
}
/**
 * @param {?} p
 * @return {?}
 */
export function getCanActivateChild(p) {
    /** @type {?} */
    const canActivateChild = p.routeConfig ? p.routeConfig.canActivateChild : null;
    if (!canActivateChild || canActivateChild.length === 0)
        return null;
    return { node: p, guards: canActivateChild };
}
/**
 * @param {?} token
 * @param {?} snapshot
 * @param {?} moduleInjector
 * @return {?}
 */
export function getToken(token, snapshot, moduleInjector) {
    /** @type {?} */
    const config = getClosestLoadedConfig(snapshot);
    /** @type {?} */
    const injector = config ? config.module.injector : moduleInjector;
    return injector.get(token);
}
/**
 * @param {?} snapshot
 * @return {?}
 */
function getClosestLoadedConfig(snapshot) {
    if (!snapshot)
        return null;
    for (let s = snapshot.parent; s; s = s.parent) {
        /** @type {?} */
        const route = s.routeConfig;
        if (route && route._loadedConfig)
            return route._loadedConfig;
    }
    return null;
}
/**
 * @param {?} futureNode
 * @param {?} currNode
 * @param {?} contexts
 * @param {?} futurePath
 * @param {?=} checks
 * @return {?}
 */
function getChildRouteGuards(futureNode, currNode, contexts, futurePath, checks = {
    canDeactivateChecks: [],
    canActivateChecks: []
}) {
    /** @type {?} */
    const prevChildren = nodeChildrenAsMap(currNode);
    // Process the children of the future route
    futureNode.children.forEach(c => {
        getRouteGuards(c, prevChildren[c.value.outlet], contexts, futurePath.concat([c.value]), checks);
        delete prevChildren[c.value.outlet];
    });
    // Process any children left from the current route (not active for the future route)
    forEach(prevChildren, (v, k) => deactivateRouteAndItsChildren(v, (/** @type {?} */ (contexts)).getContext(k), checks));
    return checks;
}
/**
 * @param {?} futureNode
 * @param {?} currNode
 * @param {?} parentContexts
 * @param {?} futurePath
 * @param {?=} checks
 * @return {?}
 */
function getRouteGuards(futureNode, currNode, parentContexts, futurePath, checks = {
    canDeactivateChecks: [],
    canActivateChecks: []
}) {
    /** @type {?} */
    const future = futureNode.value;
    /** @type {?} */
    const curr = currNode ? currNode.value : null;
    /** @type {?} */
    const context = parentContexts ? parentContexts.getContext(futureNode.value.outlet) : null;
    // reusing the node
    if (curr && future.routeConfig === curr.routeConfig) {
        /** @type {?} */
        const shouldRun = shouldRunGuardsAndResolvers(curr, future, (/** @type {?} */ (future.routeConfig)).runGuardsAndResolvers);
        if (shouldRun) {
            checks.canActivateChecks.push(new CanActivate(futurePath));
        }
        else {
            // we need to set the data
            future.data = curr.data;
            future._resolvedData = curr._resolvedData;
        }
        // If we have a component, we need to go through an outlet.
        if (future.component) {
            getChildRouteGuards(futureNode, currNode, context ? context.children : null, futurePath, checks);
            // if we have a componentless route, we recurse but keep the same outlet map.
        }
        else {
            getChildRouteGuards(futureNode, currNode, parentContexts, futurePath, checks);
        }
        if (shouldRun) {
            /** @type {?} */
            const component = context && context.outlet && context.outlet.component || null;
            checks.canDeactivateChecks.push(new CanDeactivate(component, curr));
        }
    }
    else {
        if (curr) {
            deactivateRouteAndItsChildren(currNode, context, checks);
        }
        checks.canActivateChecks.push(new CanActivate(futurePath));
        // If we have a component, we need to go through an outlet.
        if (future.component) {
            getChildRouteGuards(futureNode, null, context ? context.children : null, futurePath, checks);
            // if we have a componentless route, we recurse but keep the same outlet map.
        }
        else {
            getChildRouteGuards(futureNode, null, parentContexts, futurePath, checks);
        }
    }
    return checks;
}
/**
 * @param {?} curr
 * @param {?} future
 * @param {?} mode
 * @return {?}
 */
function shouldRunGuardsAndResolvers(curr, future, mode) {
    if (typeof mode === 'function') {
        return mode(curr, future);
    }
    switch (mode) {
        case 'pathParamsChange':
            return !equalPath(curr.url, future.url);
        case 'pathParamsOrQueryParamsChange':
            return !equalPath(curr.url, future.url) ||
                !shallowEqual(curr.queryParams, future.queryParams);
        case 'always':
            return true;
        case 'paramsOrQueryParamsChange':
            return !equalParamsAndUrlSegments(curr, future) ||
                !shallowEqual(curr.queryParams, future.queryParams);
        case 'paramsChange':
        default:
            return !equalParamsAndUrlSegments(curr, future);
    }
}
/**
 * @param {?} route
 * @param {?} context
 * @param {?} checks
 * @return {?}
 */
function deactivateRouteAndItsChildren(route, context, checks) {
    /** @type {?} */
    const children = nodeChildrenAsMap(route);
    /** @type {?} */
    const r = route.value;
    forEach(children, (node, childName) => {
        if (!r.component) {
            deactivateRouteAndItsChildren(node, context, checks);
        }
        else if (context) {
            deactivateRouteAndItsChildren(node, context.children.getContext(childName), checks);
        }
        else {
            deactivateRouteAndItsChildren(node, null, checks);
        }
    });
    if (!r.component) {
        checks.canDeactivateChecks.push(new CanDeactivate(null, r));
    }
    else if (context && context.outlet && context.outlet.isActivated) {
        checks.canDeactivateChecks.push(new CanDeactivate(context.outlet.component, r));
    }
    else {
        checks.canDeactivateChecks.push(new CanDeactivate(null, r));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlYWN0aXZhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3JvdXRlci9zcmMvdXRpbHMvcHJlYWN0aXZhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVlBLE9BQU8sRUFBOEMseUJBQXlCLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUN2RyxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQ3RDLE9BQU8sRUFBQyxPQUFPLEVBQUUsWUFBWSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDMUQsT0FBTyxFQUFXLGlCQUFpQixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRTFELE1BQU0sT0FBTyxXQUFXOzs7O0lBRXRCLFlBQW1CLElBQThCO1FBQTlCLFNBQUksR0FBSixJQUFJLENBQTBCO1FBQy9DLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztJQUMvQyxDQUFDO0NBQ0Y7OztJQUpDLDRCQUF1Qzs7SUFDM0IsMkJBQXFDOztBQUtuRCxNQUFNLE9BQU8sYUFBYTs7Ozs7SUFDeEIsWUFBbUIsU0FBc0IsRUFBUyxLQUE2QjtRQUE1RCxjQUFTLEdBQVQsU0FBUyxDQUFhO1FBQVMsVUFBSyxHQUFMLEtBQUssQ0FBd0I7SUFBRyxDQUFDO0NBQ3BGOzs7SUFEYSxrQ0FBNkI7O0lBQUUsOEJBQW9DOzs7Ozs7OztBQVFqRixNQUFNLFVBQVUsaUJBQWlCLENBQzdCLE1BQTJCLEVBQUUsSUFBeUIsRUFDdEQsY0FBc0M7O1VBQ2xDLFVBQVUsR0FBRyxNQUFNLENBQUMsS0FBSzs7VUFDekIsUUFBUSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSTtJQUV6QyxPQUFPLG1CQUFtQixDQUFDLFVBQVUs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TyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUU7UUFDbEUsTUFBTSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxJQUFJLGFBQWEsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2pGO1NBQU07UUFDTCxNQUFNLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksYUFBYSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzdEO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3Rvcn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7TG9hZGVkUm91dGVyQ29uZmlnLCBSdW5HdWFyZHNBbmRSZXNvbHZlcnN9IGZyb20gJy4uL2NvbmZpZyc7XG5pbXBvcnQge0NoaWxkcmVuT3V0bGV0Q29udGV4dHMsIE91dGxldENvbnRleHR9IGZyb20gJy4uL3JvdXRlcl9vdXRsZXRfY29udGV4dCc7XG5pbXBvcnQge0FjdGl2YXRlZFJvdXRlU25hcHNob3QsIFJvdXRlclN0YXRlU25hcHNob3QsIGVxdWFsUGFyYW1zQW5kVXJsU2VnbWVudHN9IGZyb20gJy4uL3JvdXRlcl9zdGF0ZSc7XG5pbXBvcnQge2VxdWFsUGF0aH0gZnJvbSAnLi4vdXJsX3RyZWUnO1xuaW1wb3J0IHtmb3JFYWNoLCBzaGFsbG93RXF1YWx9IGZyb20gJy4uL3V0aWxzL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtUcmVlTm9kZSwgbm9kZUNoaWxkcmVuQXNNYXB9IGZyb20gJy4uL3V0aWxzL3RyZWUnO1xuXG5leHBvcnQgY2xhc3MgQ2FuQWN0aXZhdGUge1xuICByZWFkb25seSByb3V0ZTogQWN0aXZhdGVkUm91dGVTbmFwc2hvdDtcbiAgY29uc3RydWN0b3IocHVibGljIHBhdGg6IEFjdGl2YXRlZFJvdXRlU25hcHNob3RbXSkge1xuICAgIHRoaXMucm91dGUgPSB0aGlzLnBhdGhbdGhpcy5wYXRoLmxlbmd0aCAtIDFdO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDYW5EZWFjdGl2YXRlIHtcbiAgY29uc3RydWN0b3IocHVibGljIGNvbXBvbmVudDogT2JqZWN0fG51bGwsIHB1YmxpYyByb3V0ZTogQWN0aXZhdGVkUm91dGVTbmFwc2hvdCkge31cbn1cblxuZXhwb3J0IGRlY2xhcmUgdHlwZSBDaGVja3MgPSB7XG4gIGNhbkRlYWN0aXZhdGVDaGVja3M6IENhbkRlYWN0aXZhdGVbXSxcbiAgY2FuQWN0aXZhdGVDaGVja3M6IENhbkFjdGl2YXRlW10sXG59O1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QWxsUm91dGVHdWFyZHMoXG4gICAgZnV0dXJlOiBSb3V0ZXJTdGF0ZVNuYXBzaG90LCBjdXJyOiBSb3V0ZXJTdGF0ZVNuYXBzaG90LFxuICAgIHBhcmVudENvbnRleHRzOiBDaGlsZHJlbk91dGxldENvbnRleHRzKSB7XG4gIGNvbnN0IGZ1dHVyZVJvb3QgPSBmdXR1cmUuX3Jvb3Q7XG4gIGNvbnN0IGN1cnJSb290ID0gY3VyciA/IGN1cnIuX3Jvb3QgOiBudWxsO1xuXG4gIHJldHVybiBnZXRDaGlsZFJvdXRlR3VhcmRzKGZ1dHVyZVJvb3QsIGN1cnJSb290LCBwYXJlbnRDb250ZXh0cywgW2Z1dHVyZVJvb3QudmFsdWVdKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldENhbkFjdGl2YXRlQ2hpbGQocDogQWN0aXZhdGVkUm91dGVTbmFwc2hvdCk6XG4gICAge25vZGU6IEFjdGl2YXRlZFJvdXRlU25hcHNob3QsIGd1YXJkczogYW55W119fG51bGwge1xuICBjb25zdCBjYW5BY3RpdmF0ZUNoaWxkID0gcC5yb3V0ZUNvbmZpZyA/IHAucm91dGVDb25maWcuY2FuQWN0aXZhdGVDaGlsZCA6IG51bGw7XG4gIGlmICghY2FuQWN0aXZhdGVDaGlsZCB8fCBjYW5BY3RpdmF0ZUNoaWxkLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XG4gIHJldHVybiB7bm9kZTogcCwgZ3VhcmRzOiBjYW5BY3RpdmF0ZUNoaWxkfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFRva2VuKFxuICAgIHRva2VuOiBhbnksIHNuYXBzaG90OiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90LCBtb2R1bGVJbmplY3RvcjogSW5qZWN0b3IpOiBhbnkge1xuICBjb25zdCBjb25maWcgPSBnZXRDbG9zZXN0TG9hZGVkQ29uZmlnKHNuYXBzaG90KTtcbiAgY29uc3QgaW5qZWN0b3IgPSBjb25maWcgPyBjb25maWcubW9kdWxlLmluamVjdG9yIDogbW9kdWxlSW5qZWN0b3I7XG4gIHJldHVybiBpbmplY3Rvci5nZXQodG9rZW4pO1xufVxuXG5mdW5jdGlvbiBnZXRDbG9zZXN0TG9hZGVkQ29uZmlnKHNuYXBzaG90OiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90KTogTG9hZGVkUm91dGVyQ29uZmlnfG51bGwge1xuICBpZiAoIXNuYXBzaG90KSByZXR1cm4gbnVsbDtcblxuICBmb3IgKGxldCBzID0gc25hcHNob3QucGFyZW50OyBzOyBzID0gcy5wYXJlbnQpIHtcbiAgICBjb25zdCByb3V0ZSA9IHMucm91dGVDb25maWc7XG4gICAgaWYgKHJvdXRlICYmIHJvdXRlLl9sb2FkZWRDb25maWcpIHJldHVybiByb3V0ZS5fbG9hZGVkQ29uZmlnO1xuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIGdldENoaWxkUm91dGVHdWFyZHMoXG4gICAgZnV0dXJlTm9kZTogVHJlZU5vZGU8QWN0aXZhdGVkUm91dGVTbmFwc2hvdD4sIGN1cnJOb2RlOiBUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90PnwgbnVsbCxcbiAgICBjb250ZXh0czogQ2hpbGRyZW5PdXRsZXRDb250ZXh0cyB8IG51bGwsIGZ1dHVyZVBhdGg6IEFjdGl2YXRlZFJvdXRlU25hcHNob3RbXSxcbiAgICBjaGVja3M6IENoZWNrcyA9IHtcbiAgICAgIGNhbkRlYWN0aXZhdGVDaGVja3M6IFtdLFxuICAgICAgY2FuQWN0aXZhdGVDaGVja3M6IFtdXG4gICAgfSk6IENoZWNrcyB7XG4gIGNvbnN0IHByZXZDaGlsZHJlbiA9IG5vZGVDaGlsZHJlbkFzTWFwKGN1cnJOb2RlKTtcblxuICAvLyBQcm9jZXNzIHRoZSBjaGlsZHJlbiBvZiB0aGUgZnV0dXJlIHJvdXRlXG4gIGZ1dHVyZU5vZGUuY2hpbGRyZW4uZm9yRWFjaChjID0+IHtcbiAgICBnZXRSb3V0ZUd1YXJkcyhjLCBwcmV2Q2hpbGRyZW5bYy52YWx1ZS5vdXRsZXRdLCBjb250ZXh0cywgZnV0dXJlUGF0aC5jb25jYXQoW2MudmFsdWVdKSwgY2hlY2tzKTtcbiAgICBkZWxldGUgcHJldkNoaWxkcmVuW2MudmFsdWUub3V0bGV0XTtcbiAgfSk7XG5cbiAgLy8gUHJvY2VzcyBhbnkgY2hpbGRyZW4gbGVmdCBmcm9tIHRoZSBjdXJyZW50IHJvdXRlIChub3QgYWN0aXZlIGZvciB0aGUgZnV0dXJlIHJvdXRlKVxuICBmb3JFYWNoKFxuICAgICAgcHJldkNoaWxkcmVuLCAodjogVHJlZU5vZGU8QWN0aXZhdGVkUm91dGVTbmFwc2hvdD4sIGs6IHN0cmluZykgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGRlYWN0aXZhdGVSb3V0ZUFuZEl0c0NoaWxkcmVuKHYsIGNvbnRleHRzICEuZ2V0Q29udGV4dChrKSwgY2hlY2tzKSk7XG5cbiAgcmV0dXJuIGNoZWNrcztcbn1cblxuZnVuY3Rpb24gZ2V0Um91dGVHdWFyZHMoXG4gICAgZnV0dXJlTm9kZTogVHJlZU5vZGU8QWN0aXZhdGVkUm91dGVTbmFwc2hvdD4sIGN1cnJOb2RlOiBUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90PixcbiAgICBwYXJlbnRDb250ZXh0czogQ2hpbGRyZW5PdXRsZXRDb250ZXh0cyB8IG51bGwsIGZ1dHVyZVBhdGg6IEFjdGl2YXRlZFJvdXRlU25hcHNob3RbXSxcbiAgICBjaGVja3M6IENoZWNrcyA9IHtcbiAgICAgIGNhbkRlYWN0aXZhdGVDaGVja3M6IFtdLFxuICAgICAgY2FuQWN0aXZhdGVDaGVja3M6IFtdXG4gICAgfSk6IENoZWNrcyB7XG4gIGNvbnN0IGZ1dHVyZSA9IGZ1dHVyZU5vZGUudmFsdWU7XG4gIGNvbnN0IGN1cnIgPSBjdXJyTm9kZSA/IGN1cnJOb2RlLnZhbHVlIDogbnVsbDtcbiAgY29uc3QgY29udGV4dCA9IHBhcmVudENvbnRleHRzID8gcGFyZW50Q29udGV4dHMuZ2V0Q29udGV4dChmdXR1cmVOb2RlLnZhbHVlLm91dGxldCkgOiBudWxsO1xuXG4gIC8vIHJldXNpbmcgdGhlIG5vZGVcbiAgaWYgKGN1cnIgJiYgZnV0dXJlLnJvdXRlQ29uZmlnID09PSBjdXJyLnJvdXRlQ29uZmlnKSB7XG4gICAgY29uc3Qgc2hvdWxkUnVuID1cbiAgICAgICAgc2hvdWxkUnVuR3VhcmRzQW5kUmVzb2x2ZXJzKGN1cnIsIGZ1dHVyZSwgZnV0dXJlLnJvdXRlQ29uZmlnICEucnVuR3VhcmRzQW5kUmVzb2x2ZXJzKTtcbiAgICBpZiAoc2hvdWxkUnVuKSB7XG4gICAgICBjaGVja3MuY2FuQWN0aXZhdGVDaGVja3MucHVzaChuZXcgQ2FuQWN0aXZhdGUoZnV0dXJlUGF0aCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyB3ZSBuZWVkIHRvIHNldCB0aGUgZGF0YVxuICAgICAgZnV0dXJlLmRhdGEgPSBjdXJyLmRhdGE7XG4gICAgICBmdXR1cmUuX3Jlc29sdmVkRGF0YSA9IGN1cnIuX3Jlc29sdmVkRGF0YTtcbiAgICB9XG5cbiAgICAvLyBJZiB3ZSBoYXZlIGEgY29tcG9uZW50LCB3ZSBuZWVkIHRvIGdvIHRocm91Z2ggYW4gb3V0bGV0LlxuICAgIGlmIChmdXR1cmUuY29tcG9uZW50KSB7XG4gICAgICBnZXRDaGlsZFJvdXRlR3VhcmRzKFxuICAgICAgICAgIGZ1dHVyZU5vZGUsIGN1cnJOb2RlLCBjb250ZXh0ID8gY29udGV4dC5jaGlsZHJlbiA6IG51bGwsIGZ1dHVyZVBhdGgsIGNoZWNrcyk7XG5cbiAgICAgIC8vIGlmIHdlIGhhdmUgYSBjb21wb25lbnRsZXNzIHJvdXRlLCB3ZSByZWN1cnNlIGJ1dCBrZWVwIHRoZSBzYW1lIG91dGxldCBtYXAuXG4gICAgfSBlbHNlIHtcbiAgICAgIGdldENoaWxkUm91dGVHdWFyZHMoZnV0dXJlTm9kZSwgY3Vyck5vZGUsIHBhcmVudENvbnRleHRzLCBmdXR1cmVQYXRoLCBjaGVja3MpO1xuICAgIH1cblxuICAgIGlmIChzaG91bGRSdW4pIHtcbiAgICAgIGNvbnN0IGNvbXBvbmVudCA9IGNvbnRleHQgJiYgY29udGV4dC5vdXRsZXQgJiYgY29udGV4dC5vdXRsZXQuY29tcG9uZW50IHx8IG51bGw7XG4gICAgICBjaGVja3MuY2FuRGVhY3RpdmF0ZUNoZWNrcy5wdXNoKG5ldyBDYW5EZWFjdGl2YXRlKGNvbXBvbmVudCwgY3VycikpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoY3Vycikge1xuICAgICAgZGVhY3RpdmF0ZVJvdXRlQW5kSXRzQ2hpbGRyZW4oY3Vyck5vZGUsIGNvbnRleHQsIGNoZWNrcyk7XG4gICAgfVxuXG4gICAgY2hlY2tzLmNhbkFjdGl2YXRlQ2hlY2tzLnB1c2gobmV3IENhbkFjdGl2YXRlKGZ1dHVyZVBhdGgpKTtcbiAgICAvLyBJZiB3ZSBoYXZlIGEgY29tcG9uZW50LCB3ZSBuZWVkIHRvIGdvIHRocm91Z2ggYW4gb3V0bGV0LlxuICAgIGlmIChmdXR1cmUuY29tcG9uZW50KSB7XG4gICAgICBnZXRDaGlsZFJvdXRlR3VhcmRzKGZ1dHVyZU5vZGUsIG51bGwsIGNvbnRleHQgPyBjb250ZXh0LmNoaWxkcmVuIDogbnVsbCwgZnV0dXJlUGF0aCwgY2hlY2tzKTtcblxuICAgICAgLy8gaWYgd2UgaGF2ZSBhIGNvbXBvbmVudGxlc3Mgcm91dGUsIHdlIHJlY3Vyc2UgYnV0IGtlZXAgdGhlIHNhbWUgb3V0bGV0IG1hcC5cbiAgICB9IGVsc2Uge1xuICAgICAgZ2V0Q2hpbGRSb3V0ZUd1YXJkcyhmdXR1cmVOb2RlLCBudWxsLCBwYXJlbnRDb250ZXh0cywgZnV0dXJlUGF0aCwgY2hlY2tzKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gY2hlY2tzO1xufVxuXG5mdW5jdGlvbiBzaG91bGRSdW5HdWFyZHNBbmRSZXNvbHZlcnMoXG4gICAgY3VycjogQWN0aXZhdGVkUm91dGVTbmFwc2hvdCwgZnV0dXJlOiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90LFxuICAgIG1vZGU6IFJ1bkd1YXJkc0FuZFJlc29sdmVycyB8IHVuZGVmaW5lZCk6IGJvb2xlYW4ge1xuICBpZiAodHlwZW9mIG1vZGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gbW9kZShjdXJyLCBmdXR1cmUpO1xuICB9XG4gIHN3aXRjaCAobW9kZSkge1xuICAgIGNhc2UgJ3BhdGhQYXJhbXNDaGFuZ2UnOlxuICAgICAgcmV0dXJuICFlcXVhbFBhdGgoY3Vyci51cmwsIGZ1dHVyZS51cmwpO1xuXG4gICAgY2FzZSAncGF0aFBhcmFtc09yUXVlcnlQYXJhbXNDaGFuZ2UnOlxuICAgICAgcmV0dXJuICFlcXVhbFBhdGgoY3Vyci51cmwsIGZ1dHVyZS51cmwpIHx8XG4gICAgICAgICAgIXNoYWxsb3dFcXVhbChjdXJyLnF1ZXJ5UGFyYW1zLCBmdXR1cmUucXVlcnlQYXJhbXMpO1xuXG4gICAgY2FzZSAnYWx3YXlzJzpcbiAgICAgIHJldHVybiB0cnVlO1xuXG4gICAgY2FzZSAncGFyYW1zT3JRdWVyeVBhcmFtc0NoYW5nZSc6XG4gICAgICByZXR1cm4gIWVxdWFsUGFyYW1zQW5kVXJsU2VnbWVudHMoY3VyciwgZnV0dXJlKSB8fFxuICAgICAgICAgICFzaGFsbG93RXF1YWwoY3Vyci5xdWVyeVBhcmFtcywgZnV0dXJlLnF1ZXJ5UGFyYW1zKTtcblxuICAgIGNhc2UgJ3BhcmFtc0NoYW5nZSc6XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiAhZXF1YWxQYXJhbXNBbmRVcmxTZWdtZW50cyhjdXJyLCBmdXR1cmUpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGRlYWN0aXZhdGVSb3V0ZUFuZEl0c0NoaWxkcmVuKFxuICAgIHJvdXRlOiBUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90PiwgY29udGV4dDogT3V0bGV0Q29udGV4dCB8IG51bGwsIGNoZWNrczogQ2hlY2tzKTogdm9pZCB7XG4gIGNvbnN0IGNoaWxkcmVuID0gbm9kZUNoaWxkcmVuQXNNYXAocm91dGUpO1xuICBjb25zdCByID0gcm91dGUudmFsdWU7XG5cbiAgZm9yRWFjaChjaGlsZHJlbiwgKG5vZGU6IFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlU25hcHNob3Q+LCBjaGlsZE5hbWU6IHN0cmluZykgPT4ge1xuICAgIGlmICghci5jb21wb25lbnQpIHtcbiAgICAgIGRlYWN0aXZhdGVSb3V0ZUFuZEl0c0NoaWxkcmVuKG5vZGUsIGNvbnRleHQsIGNoZWNrcyk7XG4gICAgfSBlbHNlIGlmIChjb250ZXh0KSB7XG4gICAgICBkZWFjdGl2YXRlUm91dGVBbmRJdHNDaGlsZHJlbihub2RlLCBjb250ZXh0LmNoaWxkcmVuLmdldENvbnRleHQoY2hpbGROYW1lKSwgY2hlY2tzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVhY3RpdmF0ZVJvdXRlQW5kSXRzQ2hpbGRyZW4obm9kZSwgbnVsbCwgY2hlY2tzKTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmICghci5jb21wb25lbnQpIHtcbiAgICBjaGVja3MuY2FuRGVhY3RpdmF0ZUNoZWNrcy5wdXNoKG5ldyBDYW5EZWFjdGl2YXRlKG51bGwsIHIpKTtcbiAgfSBlbHNlIGlmIChjb250ZXh0ICYmIGNvbnRleHQub3V0bGV0ICYmIGNvbnRleHQub3V0bGV0LmlzQWN0aXZhdGVkKSB7XG4gICAgY2hlY2tzLmNhbkRlYWN0aXZhdGVDaGVja3MucHVzaChuZXcgQ2FuRGVhY3RpdmF0ZShjb250ZXh0Lm91dGxldC5jb21wb25lbnQsIHIpKTtcbiAgfSBlbHNlIHtcbiAgICBjaGVja3MuY2FuRGVhY3RpdmF0ZUNoZWNrcy5wdXNoKG5ldyBDYW5EZWFjdGl2YXRlKG51bGwsIHIpKTtcbiAgfVxufVxuIl19