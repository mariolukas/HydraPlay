/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { InjectionToken } from '../di/injection_token';
import { inject } from '../di/injector_compatibility';
import { ComponentFactory as viewEngine_ComponentFactory, ComponentRef as viewEngine_ComponentRef } from '../linker/component_factory';
import { ComponentFactoryResolver as viewEngine_ComponentFactoryResolver } from '../linker/component_factory_resolver';
import { ElementRef as viewEngine_ElementRef } from '../linker/element_ref';
import { RendererFactory2 } from '../render/api';
import { Sanitizer } from '../sanitization/security';
import { VERSION } from '../version';
import { assertComponentType, assertDefined } from './assert';
import { LifecycleHooksFeature, createRootComponent, createRootComponentView, createRootContext } from './component';
import { getComponentDef } from './definition';
import { NodeInjector } from './di';
import { addToViewTree, createLView, createNodeAtIndex, createTView, createViewNode, elementCreate, locateHostElement, refreshDescendantViews } from './instructions';
import { domRendererFactory3, isProceduralRenderer } from './interfaces/renderer';
import { HEADER_OFFSET, TVIEW } from './interfaces/view';
import { enterView, leaveView } from './state';
import { defaultScheduler, getTNode } from './util';
import { createElementRef } from './view_engine_compatibility';
import { RootViewRef } from './view_ref';
var ComponentFactoryResolver = /** @class */ (function (_super) {
    tslib_1.__extends(ComponentFactoryResolver, _super);
    /**
     * @param ngModule The NgModuleRef to which all resolved factories are bound.
     */
    function ComponentFactoryResolver(ngModule) {
        var _this = _super.call(this) || this;
        _this.ngModule = ngModule;
        return _this;
    }
    ComponentFactoryResolver.prototype.resolveComponentFactory = function (component) {
        ngDevMode && assertComponentType(component);
        var componentDef = getComponentDef(component);
        return new ComponentFactory(componentDef, this.ngModule);
    };
    return ComponentFactoryResolver;
}(viewEngine_ComponentFactoryResolver));
export { ComponentFactoryResolver };
function toRefArray(map) {
    var array = [];
    for (var nonMinified in map) {
        if (map.hasOwnProperty(nonMinified)) {
            var minified = map[nonMinified];
            array.push({ propName: minified, templateName: nonMinified });
        }
    }
    return array;
}
/**
 * Default {@link RootContext} for all components rendered with {@link renderComponent}.
 */
export var ROOT_CONTEXT = new InjectionToken('ROOT_CONTEXT_TOKEN', { providedIn: 'root', factory: function () { return createRootContext(inject(SCHEDULER)); } });
/**
 * A change detection scheduler token for {@link RootContext}. This token is the default value used
 * for the default `RootContext` found in the {@link ROOT_CONTEXT} token.
 */
export var SCHEDULER = new InjectionToken('SCHEDULER_TOKEN', {
    providedIn: 'root',
    factory: function () { return defaultScheduler; },
});
var NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR = {};
function createChainedInjector(rootViewInjector, moduleInjector) {
    return {
        get: function (token, notFoundValue) {
            var value = rootViewInjector.get(token, NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR);
            if (value !== NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR ||
                notFoundValue === NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR) {
                // Return the value from the root element injector when
                // - it provides it
                //   (value !== NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR)
                // - the module injector should not be checked
                //   (notFoundValue === NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR)
                return value;
            }
            return moduleInjector.get(token, notFoundValue);
        }
    };
}
/**
 * Render3 implementation of {@link viewEngine_ComponentFactory}.
 */
var ComponentFactory = /** @class */ (function (_super) {
    tslib_1.__extends(ComponentFactory, _super);
    /**
     * @param componentDef The component definition.
     * @param ngModule The NgModuleRef to which the factory is bound.
     */
    function ComponentFactory(componentDef, ngModule) {
        var _this = _super.call(this) || this;
        _this.componentDef = componentDef;
        _this.ngModule = ngModule;
        _this.componentType = componentDef.type;
        _this.selector = componentDef.selectors[0][0];
        _this.ngContentSelectors = [];
        return _this;
    }
    Object.defineProperty(ComponentFactory.prototype, "inputs", {
        get: function () {
            return toRefArray(this.componentDef.inputs);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ComponentFactory.prototype, "outputs", {
        get: function () {
            return toRefArray(this.componentDef.outputs);
        },
        enumerable: true,
        configurable: true
    });
    ComponentFactory.prototype.create = function (injector, projectableNodes, rootSelectorOrNode, ngModule) {
        var isInternalRootView = rootSelectorOrNode === undefined;
        ngModule = ngModule || this.ngModule;
        var rootViewInjector = ngModule ? createChainedInjector(injector, ngModule.injector) : injector;
        var rendererFactory = rootViewInjector.get(RendererFactory2, domRendererFactory3);
        var sanitizer = rootViewInjector.get(Sanitizer, null);
        var hostRNode = isInternalRootView ?
            elementCreate(this.selector, rendererFactory.createRenderer(null, this.componentDef)) :
            locateHostElement(rendererFactory, rootSelectorOrNode);
        var rootFlags = this.componentDef.onPush ? 8 /* Dirty */ | 128 /* IsRoot */ :
            4 /* CheckAlways */ | 128 /* IsRoot */;
        var rootContext = !isInternalRootView ? rootViewInjector.get(ROOT_CONTEXT) : createRootContext();
        var renderer = rendererFactory.createRenderer(hostRNode, this.componentDef);
        if (rootSelectorOrNode && hostRNode) {
            ngDevMode && ngDevMode.rendererSetAttribute++;
            isProceduralRenderer(renderer) ?
                renderer.setAttribute(hostRNode, 'ng-version', VERSION.full) :
                hostRNode.setAttribute('ng-version', VERSION.full);
        }
        // Create the root view. Uses empty TView and ContentTemplate.
        var rootLView = createLView(null, createTView(-1, null, 1, 0, null, null, null), rootContext, rootFlags, rendererFactory, renderer, sanitizer, rootViewInjector);
        // rootView is the parent when bootstrapping
        var oldLView = enterView(rootLView, null);
        var component;
        var tElementNode;
        try {
            if (rendererFactory.begin)
                rendererFactory.begin();
            var componentView = createRootComponentView(hostRNode, this.componentDef, rootLView, rendererFactory, renderer);
            tElementNode = getTNode(0, rootLView);
            // Transform the arrays of native nodes into a structure that can be consumed by the
            // projection instruction. This is needed to support the reprojection of these nodes.
            if (projectableNodes) {
                var index = 0;
                var tView = rootLView[TVIEW];
                var projection = tElementNode.projection = [];
                for (var i = 0; i < projectableNodes.length; i++) {
                    var nodeList = projectableNodes[i];
                    var firstTNode = null;
                    var previousTNode = null;
                    for (var j = 0; j < nodeList.length; j++) {
                        if (tView.firstTemplatePass) {
                            // For dynamically created components such as ComponentRef, we create a new TView for
                            // each insert. This is not ideal since we should be sharing the TViews.
                            // Also the logic here should be shared with `component.ts`'s `renderComponent`
                            // method.
                            tView.expandoStartIndex++;
                            tView.blueprint.splice(++index + HEADER_OFFSET, 0, null);
                            tView.data.splice(index + HEADER_OFFSET, 0, null);
                            rootLView.splice(index + HEADER_OFFSET, 0, null);
                        }
                        var tNode = createNodeAtIndex(index, 3 /* Element */, nodeList[j], null, null);
                        previousTNode ? (previousTNode.next = tNode) : (firstTNode = tNode);
                        previousTNode = tNode;
                    }
                    projection.push(firstTNode);
                }
            }
            // TODO: should LifecycleHooksFeature and other host features be generated by the compiler and
            // executed here?
            // Angular 5 reference: https://stackblitz.com/edit/lifecycle-hooks-vcref
            component = createRootComponent(componentView, this.componentDef, rootLView, rootContext, [LifecycleHooksFeature]);
            addToViewTree(rootLView, HEADER_OFFSET, componentView);
            refreshDescendantViews(rootLView);
        }
        finally {
            leaveView(oldLView);
            if (rendererFactory.end)
                rendererFactory.end();
        }
        var componentRef = new ComponentRef(this.componentType, component, createElementRef(viewEngine_ElementRef, tElementNode, rootLView), rootLView, tElementNode);
        if (isInternalRootView) {
            // The host element of the internal root view is attached to the component's host view node
            componentRef.hostView._tViewNode.child = tElementNode;
        }
        return componentRef;
    };
    return ComponentFactory;
}(viewEngine_ComponentFactory));
export { ComponentFactory };
var componentFactoryResolver = new ComponentFactoryResolver();
/**
 * Creates a ComponentFactoryResolver and stores it on the injector. Or, if the
 * ComponentFactoryResolver
 * already exists, retrieves the existing ComponentFactoryResolver.
 *
 * @returns The ComponentFactoryResolver instance to use
 */
export function injectComponentFactoryResolver() {
    return componentFactoryResolver;
}
/**
 * Represents an instance of a Component created via a {@link ComponentFactory}.
 *
 * `ComponentRef` provides access to the Component Instance as well other objects related to this
 * Component Instance and allows you to destroy the Component Instance via the {@link #destroy}
 * method.
 *
 */
var ComponentRef = /** @class */ (function (_super) {
    tslib_1.__extends(ComponentRef, _super);
    function ComponentRef(componentType, instance, location, _rootLView, _tNode) {
        var _this = _super.call(this) || this;
        _this.location = location;
        _this._rootLView = _rootLView;
        _this._tNode = _tNode;
        _this.destroyCbs = [];
        _this.instance = instance;
        _this.hostView = _this.changeDetectorRef = new RootViewRef(_rootLView);
        _this.hostView._tViewNode = createViewNode(-1, _rootLView);
        _this.componentType = componentType;
        return _this;
    }
    Object.defineProperty(ComponentRef.prototype, "injector", {
        get: function () { return new NodeInjector(this._tNode, this._rootLView); },
        enumerable: true,
        configurable: true
    });
    ComponentRef.prototype.destroy = function () {
        ngDevMode && assertDefined(this.destroyCbs, 'NgModule already destroyed');
        this.destroyCbs.forEach(function (fn) { return fn(); });
        this.destroyCbs = null;
        this.hostView.destroy();
    };
    ComponentRef.prototype.onDestroy = function (callback) {
        ngDevMode && assertDefined(this.destroyCbs, 'NgModule already destroyed');
        this.destroyCbs.push(callback);
    };
    return ComponentRef;
}(viewEngine_ComponentRef));
export { ComponentRef };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50X3JlZi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3JlbmRlcjMvY29tcG9uZW50X3JlZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBR0gsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBRXJELE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSw4QkFBOEIsQ0FBQztBQUNwRCxPQUFPLEVBQUMsZ0JBQWdCLElBQUksMkJBQTJCLEVBQUUsWUFBWSxJQUFJLHVCQUF1QixFQUFDLE1BQU0sNkJBQTZCLENBQUM7QUFDckksT0FBTyxFQUFDLHdCQUF3QixJQUFJLG1DQUFtQyxFQUFDLE1BQU0sc0NBQXNDLENBQUM7QUFDckgsT0FBTyxFQUFDLFVBQVUsSUFBSSxxQkFBcUIsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBRTFFLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUMvQyxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFFbkQsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLFlBQVksQ0FBQztBQUNuQyxPQUFPLEVBQUMsbUJBQW1CLEVBQUUsYUFBYSxFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQzVELE9BQU8sRUFBQyxxQkFBcUIsRUFBRSxtQkFBbUIsRUFBRSx1QkFBdUIsRUFBRSxpQkFBaUIsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUNuSCxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQzdDLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDbEMsT0FBTyxFQUFDLGFBQWEsRUFBRSxXQUFXLEVBQUUsaUJBQWlCLEVBQUUsV0FBVyxFQUFFLGNBQWMsRUFBRSxhQUFhLEVBQUUsaUJBQWlCLEVBQUUsc0JBQXNCLEVBQUMs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QixPQUFPLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFFbkYsOEJBQU8sR0FBUDtRQUNFLFNBQVMsSUFBSSxhQUFhLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSw0QkFBNEIsQ0FBQyxDQUFDO1FBQzFFLElBQUksQ0FBQyxVQUFZLENBQUMsT0FBTyxDQUFDLFVBQUEsRUFBRSxJQUFJLE9BQUEsRUFBRSxFQUFFLEVBQUosQ0FBSSxDQUFDLENBQUM7UUFDdEMsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7UUFDdkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUMxQixDQUFDO0lBQ0QsZ0NBQVMsR0FBVCxVQUFVLFFBQW9CO1FBQzVCLFNBQVMsSUFBSSxhQUFhLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSw0QkFBNEIsQ0FBQyxDQUFDO1FBQzFFLElBQUksQ0FBQyxVQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFDSCxtQkFBQztBQUFELENBQUMsQUE5QkQsQ0FBcUMsdUJBQXVCLEdBOEIzRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtDaGFuZ2VEZXRlY3RvclJlZiBhcyBWaWV3RW5naW5lX0NoYW5nZURldGVjdG9yUmVmfSBmcm9tICcuLi9jaGFuZ2VfZGV0ZWN0aW9uL2NoYW5nZV9kZXRlY3Rvcl9yZWYnO1xuaW1wb3J0IHtJbmplY3Rpb25Ub2tlbn0gZnJvbSAnLi4vZGkvaW5qZWN0aW9uX3Rva2VuJztcbmltcG9ydCB7SW5qZWN0b3J9IGZyb20gJy4uL2RpL2luamVjdG9yJztcbmltcG9ydCB7aW5qZWN0fSBmcm9tICcuLi9kaS9pbmplY3Rvcl9jb21wYXRpYmlsaXR5JztcbmltcG9ydCB7Q29tcG9uZW50RmFjdG9yeSBhcyB2aWV3RW5naW5lX0NvbXBvbmVudEZhY3RvcnksIENvbXBvbmVudFJlZiBhcyB2aWV3RW5naW5lX0NvbXBvbmVudFJlZn0gZnJvbSAnLi4vbGlua2VyL2NvbXBvbmVudF9mYWN0b3J5JztcbmltcG9ydCB7Q29tcG9uZW50RmFjdG9yeVJlc29sdmVyIGFzIHZpZXdFbmdpbmVfQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyfSBmcm9tICcuLi9saW5rZXIvY29tcG9uZW50X2ZhY3RvcnlfcmVzb2x2ZXInO1xuaW1wb3J0IHtFbGVtZW50UmVmIGFzIHZpZXdFbmdpbmVfRWxlbWVudFJlZn0gZnJvbSAnLi4vbGlua2VyL2VsZW1lbnRfcmVmJztcbmltcG9ydCB7TmdNb2R1bGVSZWYgYXMgdmlld0VuZ2luZV9OZ01vZHVsZVJlZn0gZnJvbSAnLi4vbGlua2VyL25nX21vZHVsZV9mYWN0b3J5JztcbmltcG9ydCB7UmVuZGVyZXJGYWN0b3J5Mn0gZnJvbSAnLi4vcmVuZGVyL2FwaSc7XG5pbXBvcnQge1Nhbml0aXplcn0gZnJvbSAnLi4vc2FuaXRpemF0aW9uL3NlY3VyaXR5JztcbmltcG9ydCB7VHlwZX0gZnJvbSAnLi4vdHlwZSc7XG5pbXBvcnQge1ZFUlNJT059IGZyb20gJy4uL3ZlcnNpb24nO1xuaW1wb3J0IHthc3NlcnRDb21wb25lbnRUeXBlLCBhc3NlcnREZWZpbmVkfSBmcm9tICcuL2Fzc2VydCc7XG5pbXBvcnQge0xpZmVjeWNsZUhvb2tzRmVhdHVyZSwgY3JlYXRlUm9vdENvbXBvbmVudCwgY3JlYXRlUm9vdENvbXBvbmVudFZpZXcsIGNyZWF0ZVJvb3RDb250ZXh0fSBmcm9tICcuL2NvbXBvbmVudCc7XG5pbXBvcnQge2dldENvbXBvbmVudERlZn0gZnJvbSAnLi9kZWZpbml0aW9uJztcbmltcG9ydCB7Tm9kZUluamVjdG9yfSBmcm9tICcuL2RpJztcbmltcG9ydCB7YWRkVG9WaWV3VHJlZSwgY3JlYXRlTFZpZXcsIGNyZWF0ZU5vZGVBdEluZGV4LCBjcmVhdGVUVmlldywgY3JlYXRlVmlld05vZGUsIGVsZW1lbnRDcmVhdGUsIGxvY2F0ZUhvc3RFbGVtZW50LCByZWZyZXNoRGVzY2VuZGFudFZpZXdzfSBmcm9tICcuL2luc3RydWN0aW9ucyc7XG5pbXBvcnQge0NvbXBvbmVudERlZiwgUmVuZGVyRmxhZ3N9IGZyb20gJy4vaW50ZXJmYWNlcy9kZWZpbml0aW9uJztcbmltcG9ydCB7VENvbnRhaW5lck5vZGUsIFRFbGVtZW50Q29udGFpbmVyTm9kZSwgVEVsZW1lbnROb2RlLCBUTm9kZSwgVE5vZGVUeXBlfSBmcm9tICcuL2ludGVyZmFjZXMvbm9kZSc7XG5pbXBvcnQge1JFbGVtZW50LCBSZW5kZXJlckZhY3RvcnkzLCBkb21SZW5kZXJlckZhY3RvcnkzLCBpc1Byb2NlZHVyYWxSZW5kZXJlcn0gZnJvbSAnLi9pbnRlcmZhY2VzL3JlbmRlcmVyJztcbmltcG9ydCB7SEVBREVSX09GRlNFVCwgTFZpZXcsIExWaWV3RmxhZ3MsIFJvb3RDb250ZXh0LCBUVklFV30gZnJvbSAnLi9pbnRlcmZhY2VzL3ZpZXcnO1xuaW1wb3J0IHtlbnRlclZpZXcsIGxlYXZlVmlld30gZnJvbSAnLi9zdGF0ZSc7XG5pbXBvcnQge2RlZmF1bHRTY2hlZHVsZXIsIGdldFROb2RlfSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IHtjcmVhdGVFbGVtZW50UmVmfSBmcm9tICcuL3ZpZXdfZW5naW5lX2NvbXBhdGliaWxpdHknO1xuaW1wb3J0IHtSb290Vmlld1JlZiwgVmlld1JlZn0gZnJvbSAnLi92aWV3X3JlZic7XG5cbmV4cG9ydCBjbGFzcyBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIgZXh0ZW5kcyB2aWV3RW5naW5lX0NvbXBvbmVudEZhY3RvcnlSZXNvbHZlciB7XG4gIC8qKlxuICAgKiBAcGFyYW0gbmdNb2R1bGUgVGhlIE5nTW9kdWxlUmVmIHRvIHdoaWNoIGFsbCByZXNvbHZlZCBmYWN0b3JpZXMgYXJlIGJvdW5kLlxuICAgKi9cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBuZ01vZHVsZT86IHZpZXdFbmdpbmVfTmdNb2R1bGVSZWY8YW55PikgeyBzdXBlcigpOyB9XG5cbiAgcmVzb2x2ZUNvbXBvbmVudEZhY3Rvcnk8VD4oY29tcG9uZW50OiBUeXBlPFQ+KTogdmlld0VuZ2luZV9Db21wb25lbnRGYWN0b3J5PFQ+IHtcbiAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0Q29tcG9uZW50VHlwZShjb21wb25lbnQpO1xuICAgIGNvbnN0IGNvbXBvbmVudERlZiA9IGdldENvbXBvbmVudERlZihjb21wb25lbnQpICE7XG4gICAgcmV0dXJuIG5ldyBDb21wb25lbnRGYWN0b3J5KGNvbXBvbmVudERlZiwgdGhpcy5uZ01vZHVsZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gdG9SZWZBcnJheShtYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9KToge3Byb3BOYW1lOiBzdHJpbmc7IHRlbXBsYXRlTmFtZTogc3RyaW5nO31bXSB7XG4gIGNvbnN0IGFycmF5OiB7cHJvcE5hbWU6IHN0cmluZzsgdGVtcGxhdGVOYW1lOiBzdHJpbmc7fVtdID0gW107XG4gIGZvciAobGV0IG5vbk1pbmlmaWVkIGluIG1hcCkge1xuICAgIGlmIChtYXAuaGFzT3duUHJvcGVydHkobm9uTWluaWZpZWQpKSB7XG4gICAgICBjb25zdCBtaW5pZmllZCA9IG1hcFtub25NaW5pZmllZF07XG4gICAgICBhcnJheS5wdXNoKHtwcm9wTmFtZTogbWluaWZpZWQsIHRlbXBsYXRlTmFtZTogbm9uTWluaWZpZWR9KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGFycmF5O1xufVxuXG4vKipcbiAqIERlZmF1bHQge0BsaW5rIFJvb3RDb250ZXh0fSBmb3IgYWxsIGNvbXBvbmVudHMgcmVuZGVyZWQgd2l0aCB7QGxpbmsgcmVuZGVyQ29tcG9uZW50fS5cbiAqL1xuZXhwb3J0IGNvbnN0IFJPT1RfQ09OVEVYVCA9IG5ldyBJbmplY3Rpb25Ub2tlbjxSb290Q29udGV4dD4oXG4gICAgJ1JPT1RfQ09OVEVYVF9UT0tFTicsXG4gICAge3Byb3ZpZGVkSW46ICdyb290JywgZmFjdG9yeTogKCkgPT4gY3JlYXRlUm9vdENvbnRleHQoaW5qZWN0KFNDSEVEVUxFUikpfSk7XG5cbi8qKlxuICogQSBjaGFuZ2UgZGV0ZWN0aW9uIHNjaGVkdWxlciB0b2tlbiBmb3Ige0BsaW5rIFJvb3RDb250ZXh0fS4gVGhpcyB0b2tlbiBpcyB0aGUgZGVmYXVsdCB2YWx1ZSB1c2VkXG4gKiBmb3IgdGhlIGRlZmF1bHQgYFJvb3RDb250ZXh0YCBmb3VuZCBpbiB0aGUge0BsaW5rIFJPT1RfQ09OVEVYVH0gdG9rZW4uXG4gKi9cbmV4cG9ydCBjb25zdCBTQ0hFRFVMRVIgPSBuZXcgSW5qZWN0aW9uVG9rZW48KChmbjogKCkgPT4gdm9pZCkgPT4gdm9pZCk+KCdTQ0hFRFVMRVJfVE9LRU4nLCB7XG4gIHByb3ZpZGVkSW46ICdyb290JyxcbiAgZmFjdG9yeTogKCkgPT4gZGVmYXVsdFNjaGVkdWxlcixcbn0pO1xuXG5jb25zdCBOT1RfRk9VTkRfQ0hFQ0tfT05MWV9FTEVNRU5UX0lOSkVDVE9SID0ge307XG5cbmZ1bmN0aW9uIGNyZWF0ZUNoYWluZWRJbmplY3Rvcihyb290Vmlld0luamVjdG9yOiBJbmplY3RvciwgbW9kdWxlSW5qZWN0b3I6IEluamVjdG9yKTogSW5qZWN0b3Ige1xuICByZXR1cm4ge1xuICAgIGdldDogPFQ+KHRva2VuOiBUeXBlPFQ+fCBJbmplY3Rpb25Ub2tlbjxUPiwgbm90Rm91bmRWYWx1ZT86IFQpOiBUID0+IHtcbiAgICAgIGNvbnN0IHZhbHVlID0gcm9vdFZpZXdJbmplY3Rvci5nZXQodG9rZW4sIE5PVF9GT1VORF9DSEVDS19PTkxZX0VMRU1FTlRfSU5KRUNUT1IpO1xuXG4gICAgICBpZiAodmFsdWUgIT09IE5PVF9GT1VORF9DSEVDS19PTkxZX0VMRU1FTlRfSU5KRUNUT1IgfHxcbiAgICAgICAgICBub3RGb3VuZFZhbHVlID09PSBOT1RfRk9VTkRfQ0hFQ0tfT05MWV9FTEVNRU5UX0lOSkVDVE9SKSB7XG4gICAgICAgIC8vIFJldHVybiB0aGUgdmFsdWUgZnJvbSB0aGUgcm9vdCBlbGVtZW50IGluamVjdG9yIHdoZW5cbiAgICAgICAgLy8gLSBpdCBwcm92aWRlcyBpdFxuICAgICAgICAvLyAgICh2YWx1ZSAhPT0gTk9UX0ZPVU5EX0NIRUNLX09OTFlfRUxFTUVOVF9JTkpFQ1RPUilcbiAgICAgICAgLy8gLSB0aGUgbW9kdWxlIGluamVjdG9yIHNob3VsZCBub3QgYmUgY2hlY2tlZFxuICAgICAgICAvLyAgIChub3RGb3VuZFZhbHVlID09PSBOT1RfRk9VTkRfQ0hFQ0tfT05MWV9FTEVNRU5UX0lOSkVDVE9SKVxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBtb2R1bGVJbmplY3Rvci5nZXQodG9rZW4sIG5vdEZvdW5kVmFsdWUpO1xuICAgIH1cbiAgfTtcbn1cblxuLyoqXG4gKiBSZW5kZXIzIGltcGxlbWVudGF0aW9uIG9mIHtAbGluayB2aWV3RW5naW5lX0NvbXBvbmVudEZhY3Rvcnl9LlxuICovXG5leHBvcnQgY2xhc3MgQ29tcG9uZW50RmFjdG9yeTxUPiBleHRlbmRzIHZpZXdFbmdpbmVfQ29tcG9uZW50RmFjdG9yeTxUPiB7XG4gIHNlbGVjdG9yOiBzdHJpbmc7XG4gIGNvbXBvbmVudFR5cGU6IFR5cGU8YW55PjtcbiAgbmdDb250ZW50U2VsZWN0b3JzOiBzdHJpbmdbXTtcblxuICBnZXQgaW5wdXRzKCk6IHtwcm9wTmFtZTogc3RyaW5nOyB0ZW1wbGF0ZU5hbWU6IHN0cmluZzt9W10ge1xuICAgIHJldHVybiB0b1JlZkFycmF5KHRoaXMuY29tcG9uZW50RGVmLmlucHV0cyk7XG4gIH1cblxuICBnZXQgb3V0cHV0cygpOiB7cHJvcE5hbWU6IHN0cmluZzsgdGVtcGxhdGVOYW1lOiBzdHJpbmc7fVtdIHtcbiAgICByZXR1cm4gdG9SZWZBcnJheSh0aGlzLmNvbXBvbmVudERlZi5vdXRwdXRzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0gY29tcG9uZW50RGVmIFRoZSBjb21wb25lbnQgZGVmaW5pdGlvbi5cbiAgICogQHBhcmFtIG5nTW9kdWxlIFRoZSBOZ01vZHVsZVJlZiB0byB3aGljaCB0aGUgZmFjdG9yeSBpcyBib3VuZC5cbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBjb21wb25lbnREZWY6IENvbXBvbmVudERlZjxhbnk+LCBwcml2YXRlIG5nTW9kdWxlPzogdmlld0VuZ2luZV9OZ01vZHVsZVJlZjxhbnk+KSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmNvbXBvbmVudFR5cGUgPSBjb21wb25lbnREZWYudHlwZTtcbiAgICB0aGlzLnNlbGVjdG9yID0gY29tcG9uZW50RGVmLnNlbGVjdG9yc1swXVswXSBhcyBzdHJpbmc7XG4gICAgdGhpcy5uZ0NvbnRlbnRTZWxlY3RvcnMgPSBbXTtcbiAgfVxuXG4gIGNyZWF0ZShcbiAgICAgIGluamVjdG9yOiBJbmplY3RvciwgcHJvamVjdGFibGVOb2Rlcz86IGFueVtdW118dW5kZWZpbmVkLCByb290U2VsZWN0b3JPck5vZGU/OiBhbnksXG4gICAgICBuZ01vZHVsZT86IHZpZXdFbmdpbmVfTmdNb2R1bGVSZWY8YW55Pnx1bmRlZmluZWQpOiB2aWV3RW5naW5lX0NvbXBvbmVudFJlZjxUPiB7XG4gICAgY29uc3QgaXNJbnRlcm5hbFJvb3RWaWV3ID0gcm9vdFNlbGVjdG9yT3JOb2RlID09PSB1bmRlZmluZWQ7XG4gICAgbmdNb2R1bGUgPSBuZ01vZHVsZSB8fCB0aGlzLm5nTW9kdWxlO1xuXG4gICAgY29uc3Qgcm9vdFZpZXdJbmplY3RvciA9XG4gICAgICAgIG5nTW9kdWxlID8gY3JlYXRlQ2hhaW5lZEluamVjdG9yKGluamVjdG9yLCBuZ01vZHVsZS5pbmplY3RvcikgOiBpbmplY3RvcjtcblxuICAgIGNvbnN0IHJlbmRlcmVyRmFjdG9yeSA9XG4gICAgICAgIHJvb3RWaWV3SW5qZWN0b3IuZ2V0KFJlbmRlcmVyRmFjdG9yeTIsIGRvbVJlbmRlcmVyRmFjdG9yeTMpIGFzIFJlbmRlcmVyRmFjdG9yeTM7XG4gICAgY29uc3Qgc2FuaXRpemVyID0gcm9vdFZpZXdJbmplY3Rvci5nZXQoU2FuaXRpemVyLCBudWxsKTtcblxuICAgIGNvbnN0IGhvc3RSTm9kZSA9IGlzSW50ZXJuYWxSb290VmlldyA/XG4gICAgICAgIGVsZW1lbnRDcmVhdGUodGhpcy5zZWxlY3RvciwgcmVuZGVyZXJGYWN0b3J5LmNyZWF0ZVJlbmRlcmVyKG51bGwsIHRoaXMuY29tcG9uZW50RGVmKSkgOlxuICAgICAgICBsb2NhdGVIb3N0RWxlbWVudChyZW5kZXJlckZhY3RvcnksIHJvb3RTZWxlY3Rvck9yTm9kZSk7XG5cbiAgICBjb25zdCByb290RmxhZ3MgPSB0aGlzLmNvbXBvbmVudERlZi5vblB1c2ggPyBMVmlld0ZsYWdzLkRpcnR5IHwgTFZpZXdGbGFncy5Jc1Jvb3QgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIExWaWV3RmxhZ3MuQ2hlY2tBbHdheXMgfCBMVmlld0ZsYWdzLklzUm9vdDtcbiAgICBjb25zdCByb290Q29udGV4dDogUm9vdENvbnRleHQgPVxuICAgICAgICAhaXNJbnRlcm5hbFJvb3RWaWV3ID8gcm9vdFZpZXdJbmplY3Rvci5nZXQoUk9PVF9DT05URVhUKSA6IGNyZWF0ZVJvb3RDb250ZXh0KCk7XG5cbiAgICBjb25zdCByZW5kZXJlciA9IHJlbmRlcmVyRmFjdG9yeS5jcmVhdGVSZW5kZXJlcihob3N0Uk5vZGUsIHRoaXMuY29tcG9uZW50RGVmKTtcblxuICAgIGlmIChyb290U2VsZWN0b3JPck5vZGUgJiYgaG9zdFJOb2RlKSB7XG4gICAgICBuZ0Rldk1vZGUgJiYgbmdEZXZNb2RlLnJlbmRlcmVyU2V0QXR0cmlidXRlKys7XG4gICAgICBpc1Byb2NlZHVyYWxSZW5kZXJlcihyZW5kZXJlcikgP1xuICAgICAgICAgIHJlbmRlcmVyLnNldEF0dHJpYnV0ZShob3N0Uk5vZGUsICduZy12ZXJzaW9uJywgVkVSU0lPTi5mdWxsKSA6XG4gICAgICAgICAgaG9zdFJOb2RlLnNldEF0dHJpYnV0ZSgnbmctdmVyc2lvbicsIFZFUlNJT04uZnVsbCk7XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIHRoZSByb290IHZpZXcuIFVzZXMgZW1wdHkgVFZpZXcgYW5kIENvbnRlbnRUZW1wbGF0ZS5cbiAgICBjb25zdCByb290TFZpZXcgPSBjcmVhdGVMVmlldyhcbiAgICAgICAgbnVsbCwgY3JlYXRlVFZpZXcoLTEsIG51bGwsIDEsIDAsIG51bGwsIG51bGwsIG51bGwpLCByb290Q29udGV4dCwgcm9vdEZsYWdzLFxuICAgICAgICByZW5kZXJlckZhY3RvcnksIHJlbmRlcmVyLCBzYW5pdGl6ZXIsIHJvb3RWaWV3SW5qZWN0b3IpO1xuXG4gICAgLy8gcm9vdFZpZXcgaXMgdGhlIHBhcmVudCB3aGVuIGJvb3RzdHJhcHBpbmdcbiAgICBjb25zdCBvbGRMVmlldyA9IGVudGVyVmlldyhyb290TFZpZXcsIG51bGwpO1xuXG4gICAgbGV0IGNvbXBvbmVudDogVDtcbiAgICBsZXQgdEVsZW1lbnROb2RlOiBURWxlbWVudE5vZGU7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChyZW5kZXJlckZhY3RvcnkuYmVnaW4pIHJlbmRlcmVyRmFjdG9yeS5iZWdpbigpO1xuXG4gICAgICBjb25zdCBjb21wb25lbnRWaWV3ID0gY3JlYXRlUm9vdENvbXBvbmVudFZpZXcoXG4gICAgICAgICAgaG9zdFJOb2RlLCB0aGlzLmNvbXBvbmVudERlZiwgcm9vdExWaWV3LCByZW5kZXJlckZhY3RvcnksIHJlbmRlcmVyKTtcblxuICAgICAgdEVsZW1lbnROb2RlID0gZ2V0VE5vZGUoMCwgcm9vdExWaWV3KSBhcyBURWxlbWVudE5vZGU7XG5cbiAgICAgIC8vIFRyYW5zZm9ybSB0aGUgYXJyYXlzIG9mIG5hdGl2ZSBub2RlcyBpbnRvIGEgc3RydWN0dXJlIHRoYXQgY2FuIGJlIGNvbnN1bWVkIGJ5IHRoZVxuICAgICAgLy8gcHJvamVjdGlvbiBpbnN0cnVjdGlvbi4gVGhpcyBpcyBuZWVkZWQgdG8gc3VwcG9ydCB0aGUgcmVwcm9qZWN0aW9uIG9mIHRoZXNlIG5vZGVzLlxuICAgICAgaWYgKHByb2plY3RhYmxlTm9kZXMpIHtcbiAgICAgICAgbGV0IGluZGV4ID0gMDtcbiAgICAgICAgY29uc3QgdFZpZXcgPSByb290TFZpZXdbVFZJRVddO1xuICAgICAgICBjb25zdCBwcm9qZWN0aW9uOiBUTm9kZVtdID0gdEVsZW1lbnROb2RlLnByb2plY3Rpb24gPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcm9qZWN0YWJsZU5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgY29uc3Qgbm9kZUxpc3QgPSBwcm9qZWN0YWJsZU5vZGVzW2ldO1xuICAgICAgICAgIGxldCBmaXJzdFROb2RlOiBUTm9kZXxudWxsID0gbnVsbDtcbiAgICAgICAgICBsZXQgcHJldmlvdXNUTm9kZTogVE5vZGV8bnVsbCA9IG51bGw7XG4gICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBub2RlTGlzdC5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgaWYgKHRWaWV3LmZpcnN0VGVtcGxhdGVQYXNzKSB7XG4gICAgICAgICAgICAgIC8vIEZvciBkeW5hbWljYWxseSBjcmVhdGVkIGNvbXBvbmVudHMgc3VjaCBhcyBDb21wb25lbnRSZWYsIHdlIGNyZWF0ZSBhIG5ldyBUVmlldyBmb3JcbiAgICAgICAgICAgICAgLy8gZWFjaCBpbnNlcnQuIFRoaXMgaXMgbm90IGlkZWFsIHNpbmNlIHdlIHNob3VsZCBiZSBzaGFyaW5nIHRoZSBUVmlld3MuXG4gICAgICAgICAgICAgIC8vIEFsc28gdGhlIGxvZ2ljIGhlcmUgc2hvdWxkIGJlIHNoYXJlZCB3aXRoIGBjb21wb25lbnQudHNgJ3MgYHJlbmRlckNvbXBvbmVudGBcbiAgICAgICAgICAgICAgLy8gbWV0aG9kLlxuICAgICAgICAgICAgICB0Vmlldy5leHBhbmRvU3RhcnRJbmRleCsrO1xuICAgICAgICAgICAgICB0Vmlldy5ibHVlcHJpbnQuc3BsaWNlKCsraW5kZXggKyBIRUFERVJfT0ZGU0VULCAwLCBudWxsKTtcbiAgICAgICAgICAgICAgdFZpZXcuZGF0YS5zcGxpY2UoaW5kZXggKyBIRUFERVJfT0ZGU0VULCAwLCBudWxsKTtcbiAgICAgICAgICAgICAgcm9vdExWaWV3LnNwbGljZShpbmRleCArIEhFQURFUl9PRkZTRVQsIDAsIG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgdE5vZGUgPVxuICAgICAgICAgICAgICAgIGNyZWF0ZU5vZGVBdEluZGV4KGluZGV4LCBUTm9kZVR5cGUuRWxlbWVudCwgbm9kZUxpc3Rbal0gYXMgUkVsZW1lbnQsIG51bGwsIG51bGwpO1xuICAgICAgICAgICAgcHJldmlvdXNUTm9kZSA/IChwcmV2aW91c1ROb2RlLm5leHQgPSB0Tm9kZSkgOiAoZmlyc3RUTm9kZSA9IHROb2RlKTtcbiAgICAgICAgICAgIHByZXZpb3VzVE5vZGUgPSB0Tm9kZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcHJvamVjdGlvbi5wdXNoKGZpcnN0VE5vZGUgISk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gVE9ETzogc2hvdWxkIExpZmVjeWNsZUhvb2tzRmVhdHVyZSBhbmQgb3RoZXIgaG9zdCBmZWF0dXJlcyBiZSBnZW5lcmF0ZWQgYnkgdGhlIGNvbXBpbGVyIGFuZFxuICAgICAgLy8gZXhlY3V0ZWQgaGVyZT9cbiAgICAgIC8vIEFuZ3VsYXIgNSByZWZlcmVuY2U6IGh0dHBzOi8vc3RhY2tibGl0ei5jb20vZWRpdC9saWZlY3ljbGUtaG9va3MtdmNyZWZcbiAgICAgIGNvbXBvbmVudCA9IGNyZWF0ZVJvb3RDb21wb25lbnQoXG4gICAgICAgICAgY29tcG9uZW50VmlldywgdGhpcy5jb21wb25lbnREZWYsIHJvb3RMVmlldywgcm9vdENvbnRleHQsIFtMaWZlY3ljbGVIb29rc0ZlYXR1cmVdKTtcblxuICAgICAgYWRkVG9WaWV3VHJlZShyb290TFZpZXcsIEhFQURFUl9PRkZTRVQsIGNvbXBvbmVudFZpZXcpO1xuICAgICAgcmVmcmVzaERlc2NlbmRhbnRWaWV3cyhyb290TFZpZXcpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBsZWF2ZVZpZXcob2xkTFZpZXcpO1xuICAgICAgaWYgKHJlbmRlcmVyRmFjdG9yeS5lbmQpIHJlbmRlcmVyRmFjdG9yeS5lbmQoKTtcbiAgICB9XG5cbiAgICBjb25zdCBjb21wb25lbnRSZWYgPSBuZXcgQ29tcG9uZW50UmVmKFxuICAgICAgICB0aGlzLmNvbXBvbmVudFR5cGUsIGNvbXBvbmVudCxcbiAgICAgICAgY3JlYXRlRWxlbWVudFJlZih2aWV3RW5naW5lX0VsZW1lbnRSZWYsIHRFbGVtZW50Tm9kZSwgcm9vdExWaWV3KSwgcm9vdExWaWV3LCB0RWxlbWVudE5vZGUpO1xuXG4gICAgaWYgKGlzSW50ZXJuYWxSb290Vmlldykge1xuICAgICAgLy8gVGhlIGhvc3QgZWxlbWVudCBvZiB0aGUgaW50ZXJuYWwgcm9vdCB2aWV3IGlzIGF0dGFjaGVkIHRvIHRoZSBjb21wb25lbnQncyBob3N0IHZpZXcgbm9kZVxuICAgICAgY29tcG9uZW50UmVmLmhvc3RWaWV3Ll90Vmlld05vZGUgIS5jaGlsZCA9IHRFbGVtZW50Tm9kZTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbXBvbmVudFJlZjtcbiAgfVxufVxuXG5jb25zdCBjb21wb25lbnRGYWN0b3J5UmVzb2x2ZXI6IENvbXBvbmVudEZhY3RvcnlSZXNvbHZlciA9IG5ldyBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIoKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyIGFuZCBzdG9yZXMgaXQgb24gdGhlIGluamVjdG9yLiBPciwgaWYgdGhlXG4gKiBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXJcbiAqIGFscmVhZHkgZXhpc3RzLCByZXRyaWV2ZXMgdGhlIGV4aXN0aW5nIENvbXBvbmVudEZhY3RvcnlSZXNvbHZlci5cbiAqXG4gKiBAcmV0dXJucyBUaGUgQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyIGluc3RhbmNlIHRvIHVzZVxuICovXG5leHBvcnQgZnVuY3Rpb24gaW5qZWN0Q29tcG9uZW50RmFjdG9yeVJlc29sdmVyKCk6IHZpZXdFbmdpbmVfQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyIHtcbiAgcmV0dXJuIGNvbXBvbmVudEZhY3RvcnlSZXNvbHZlcjtcbn1cblxuLyoqXG4gKiBSZXByZXNlbnRzIGFuIGluc3RhbmNlIG9mIGEgQ29tcG9uZW50IGNyZWF0ZWQgdmlhIGEge0BsaW5rIENvbXBvbmVudEZhY3Rvcnl9LlxuICpcbiAqIGBDb21wb25lbnRSZWZgIHByb3ZpZGVzIGFjY2VzcyB0byB0aGUgQ29tcG9uZW50IEluc3RhbmNlIGFzIHdlbGwgb3RoZXIgb2JqZWN0cyByZWxhdGVkIHRvIHRoaXNcbiAqIENvbXBvbmVudCBJbnN0YW5jZSBhbmQgYWxsb3dzIHlvdSB0byBkZXN0cm95IHRoZSBDb21wb25lbnQgSW5zdGFuY2UgdmlhIHRoZSB7QGxpbmsgI2Rlc3Ryb3l9XG4gKiBtZXRob2QuXG4gKlxuICovXG5leHBvcnQgY2xhc3MgQ29tcG9uZW50UmVmPFQ+IGV4dGVuZHMgdmlld0VuZ2luZV9Db21wb25lbnRSZWY8VD4ge1xuICBkZXN0cm95Q2JzOiAoKCkgPT4gdm9pZClbXXxudWxsID0gW107XG4gIGluc3RhbmNlOiBUO1xuICBob3N0VmlldzogVmlld1JlZjxUPjtcbiAgY2hhbmdlRGV0ZWN0b3JSZWY6IFZpZXdFbmdpbmVfQ2hhbmdlRGV0ZWN0b3JSZWY7XG4gIGNvbXBvbmVudFR5cGU6IFR5cGU8VD47XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBjb21wb25lbnRUeXBlOiBUeXBlPFQ+LCBpbnN0YW5jZTogVCwgcHVibGljIGxvY2F0aW9uOiB2aWV3RW5naW5lX0VsZW1lbnRSZWYsXG4gICAgICBwcml2YXRlIF9yb290TFZpZXc6IExWaWV3LFxuICAgICAgcHJpdmF0ZSBfdE5vZGU6IFRFbGVtZW50Tm9kZXxUQ29udGFpbmVyTm9kZXxURWxlbWVudENvbnRhaW5lck5vZGUpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuaW5zdGFuY2UgPSBpbnN0YW5jZTtcbiAgICB0aGlzLmhvc3RWaWV3ID0gdGhpcy5jaGFuZ2VEZXRlY3RvclJlZiA9IG5ldyBSb290Vmlld1JlZjxUPihfcm9vdExWaWV3KTtcbiAgICB0aGlzLmhvc3RWaWV3Ll90Vmlld05vZGUgPSBjcmVhdGVWaWV3Tm9kZSgtMSwgX3Jvb3RMVmlldyk7XG4gICAgdGhpcy5jb21wb25lbnRUeXBlID0gY29tcG9uZW50VHlwZTtcbiAgfVxuXG4gIGdldCBpbmplY3RvcigpOiBJbmplY3RvciB7IHJldHVybiBuZXcgTm9kZUluamVjdG9yKHRoaXMuX3ROb2RlLCB0aGlzLl9yb290TFZpZXcpOyB9XG5cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0RGVmaW5lZCh0aGlzLmRlc3Ryb3lDYnMsICdOZ01vZHVsZSBhbHJlYWR5IGRlc3Ryb3llZCcpO1xuICAgIHRoaXMuZGVzdHJveUNicyAhLmZvckVhY2goZm4gPT4gZm4oKSk7XG4gICAgdGhpcy5kZXN0cm95Q2JzID0gbnVsbDtcbiAgICB0aGlzLmhvc3RWaWV3LmRlc3Ryb3koKTtcbiAgfVxuICBvbkRlc3Ryb3koY2FsbGJhY2s6ICgpID0+IHZvaWQpOiB2b2lkIHtcbiAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0RGVmaW5lZCh0aGlzLmRlc3Ryb3lDYnMsICdOZ01vZHVsZSBhbHJlYWR5IGRlc3Ryb3llZCcpO1xuICAgIHRoaXMuZGVzdHJveUNicyAhLnB1c2goY2FsbGJhY2spO1xuICB9XG59XG4iXX0=