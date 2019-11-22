/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { InjectionToken } from '../di/injection_token';
import { Injector } from '../di/injector';
import { InjectFlags } from '../di/injector_compatibility';
import { QueryList } from '../linker';
import { Sanitizer } from '../sanitization/security';
import { StyleSanitizeFn } from '../sanitization/style_sanitizer';
import { Type } from '../type';
import { LContainer } from './interfaces/container';
import { ComponentDef, ComponentQuery, ComponentTemplate, DirectiveDefListOrFactory, PipeDefListOrFactory, RenderFlags } from './interfaces/definition';
import { LocalRefExtractor, TAttributes, TContainerNode, TElementContainerNode, TElementNode, TNode, TNodeType, TProjectionNode, TViewNode } from './interfaces/node';
import { PlayerFactory } from './interfaces/player';
import { CssSelectorList } from './interfaces/projection';
import { LQueries } from './interfaces/query';
import { RComment, RElement, RText, Renderer3, RendererFactory3 } from './interfaces/renderer';
import { SanitizerFn } from './interfaces/sanitization';
import { LView, LViewFlags, OpaqueViewState, RootContext, RootContextFlags, TView } from './interfaces/view';
import { NO_CHANGE } from './tokens';
/**
 * Refreshes the view, executing the following steps in that order:
 * triggers init hooks, refreshes dynamic embedded views, triggers content hooks, sets host
 * bindings, refreshes child components.
 * Note: view hooks are triggered later when leaving the view.
 */
export declare function refreshDescendantViews(lView: LView): void;
/** Sets the host bindings for the current view. */
export declare function setHostBindings(tView: TView, viewData: LView): void;
export declare function createLView<T>(parentLView: LView | null, tView: TView, context: T | null, flags: LViewFlags, rendererFactory?: RendererFactory3 | null, renderer?: Renderer3 | null, sanitizer?: Sanitizer | null, injector?: Injector | null): LView;
/**
 * Create and stores the TNode, and hooks it up to the tree.
 *
 * @param index The index at which the TNode should be saved (null if view, since they are not
 * saved).
 * @param type The type of TNode to create
 * @param native The native element for this node, if applicable
 * @param name The tag name of the associated native element, if applicable
 * @param attrs Any attrs for the native element, if applicable
 */
export declare function createNodeAtIndex(index: number, type: TNodeType.Element, native: RElement | RText | null, name: string | null, attrs: TAttributes | null): TElementNode;
export declare function createNodeAtIndex(index: number, type: TNodeType.Container, native: RComment, name: string | null, attrs: TAttributes | null): TContainerNode;
export declare function createNodeAtIndex(index: number, type: TNodeType.Projection, native: null, name: null, attrs: TAttributes | null): TProjectionNode;
export declare function createNodeAtIndex(index: number, type: TNodeType.ElementContainer, native: RComment, name: string | null, attrs: TAttributes | null): TElementContainerNode;
export declare function createNodeAtIndex(index: number, type: TNodeType.IcuContainer, native: RComment, name: null, attrs: TAttributes | null): TElementContainerNode;
export declare function createViewNode(index: number, view: LView): TViewNode;
/**
 * When elements are created dynamically after a view blueprint is created (e.g. through
 * i18nApply() or ComponentFactory.create), we need to adjust the blueprint for future
 * template passes.
 */
export declare function allocExpando(view: LView): void;
/**
 *
 * @param hostNode Existing node to render into.
 * @param templateFn Template function with the instructions.
 * @param consts The number of nodes, local refs, and pipes in this template
 * @param context to pass into the template.
 * @param providedRendererFactory renderer factory to use
 * @param host The host element node to use
 * @param directives Directive defs that should be used for matching
 * @param pipes Pipe defs that should be used for matching
 */
export declare function renderTemplate<T>(hostNode: RElement, templateFn: ComponentTemplate<T>, consts: number, vars: number, context: T, providedRendererFactory: RendererFactory3, hostView: LView | null, directives?: DirectiveDefListOrFactory | null, pipes?: PipeDefListOrFactory | null, sanitizer?: Sanitizer | null): LView;
/**
 * Used for creating the LViewNode of a dynamic embedded view,
 * either through ViewContainerRef.createEmbeddedView() or TemplateRef.createEmbeddedView().
 * Such lViewNode will then be renderer with renderEmbeddedTemplate() (see below).
 */
export declare function createEmbeddedViewAndNode<T>(tView: TView, context: T, declarationView: LView, renderer: Renderer3, queries: LQueries | null, injectorIndex: number): LView;
/**
 * Used for rendering embedded views (e.g. dynamically created views)
 *
 * Dynamically created views must store/retrieve their TViews differently from component views
 * because their template functions are nested in the template functions of their hosts, creating
 * closures. If their host template happens to be an embedded template in a loop (e.g. ngFor inside
 * an ngFor), the nesting would mean we'd have multiple instances of the template function, so we
 * can't store TViews in the template function itself (as we do for comps). Instead, we store the
 * TView for dynamically created views on their host TNode, which only has one instance.
 */
export declare function renderEmbeddedTemplate<T>(viewToRender: LView, tView: TView, context: T): void;
/**
 * Retrieves a context at the level specified and saves it as the global, contextViewData.
 * Will get the next level up if level is not specified.
 *
 * This is used to save contexts of parent views so they can be bound in embedded views, or
 * in conjunction with reference() to bind a ref from a parent view.
 *
 * @param level The relative level of the view from which to grab context compared to contextVewData
 * @returns context
 */
export declare function nextContext<T = any>(level?: number): T;
export declare function namespaceSVG(): void;
export declare function namespaceMathML(): void;
export declare function namespaceHTML(): void;
/**
 * Creates an empty element using {@link elementStart} and {@link elementEnd}
 *
 * @param index Index of the element in the data array
 * @param name Name of the DOM Node
 * @param attrs Statically bound set of attributes, classes, and styles to be written into the DOM
 *              element on creation. Use [AttributeMarker] to denote the meaning of this array.
 * @param localRefs A set of local reference bindings on the element.
 */
export declare function element(index: number, name: string, attrs?: TAttributes | null, localRefs?: string[] | null): void;
/**
 * Creates a logical container for other nodes (<ng-container>) backed by a comment node in the DOM.
 * The instruction must later be followed by `elementContainerEnd()` call.
 *
 * @param index Index of the element in the LView array
 * @param attrs Set of attributes to be used when matching directives.
 * @param localRefs A set of local reference bindings on the element.
 *
 * Even if this instruction accepts a set of attributes no actual attribute values are propagated to
 * the DOM (as a comment node can't have attributes). Attributes are here only for directive
 * matching purposes and setting initial inputs of directives.
 */
export declare function elementContainerStart(index: number, attrs?: TAttributes | null, localRefs?: string[] | null): void;
/** Mark the end of the <ng-container>. */
export declare function elementContainerEnd(): void;
/**
 * Create DOM element. The instruction must later be followed by `elementEnd()` call.
 *
 * @param index Index of the element in the LView array
 * @param name Name of the DOM Node
 * @param attrs Statically bound set of attributes, classes, and styles to be written into the DOM
 *              element on creation. Use [AttributeMarker] to denote the meaning of this array.
 * @param localRefs A set of local reference bindings on the element.
 *
 * Attributes and localRefs are passed as an array of strings where elements with an even index
 * hold an attribute name and elements with an odd index hold an attribute value, ex.:
 * ['id', 'warning5', 'class', 'alert']
 */
export declare function elementStart(index: number, name: string, attrs?: TAttributes | null, localRefs?: string[] | null): void;
/**
 * Creates a native element from a tag name, using a renderer.
 * @param name the tag name
 * @param overriddenRenderer Optional A renderer to override the default one
 * @returns the element created
 */
export declare function elementCreate(name: string, overriddenRenderer?: Renderer3): RElement;
/**
 * Gets TView from a template function or creates a new TView
 * if it doesn't already exist.
 *
 * @param templateFn The template from which to get static data
 * @param consts The number of nodes, local refs, and pipes in this view
 * @param vars The number of bindings and pure function bindings in this view
 * @param directives Directive defs that should be saved on TView
 * @param pipes Pipe defs that should be saved on TView
 * @returns TView
 */
export declare function getOrCreateTView(templateFn: ComponentTemplate<any>, consts: number, vars: number, directives: DirectiveDefListOrFactory | null, pipes: PipeDefListOrFactory | null, viewQuery: ComponentQuery<any> | null): TView;
/**
 * Creates a TView instance
 *
 * @param viewIndex The viewBlockId for inline views, or -1 if it's a component/dynamic
 * @param templateFn Template function
 * @param consts The number of nodes, local refs, and pipes in this template
 * @param directives Registry of directives for this view
 * @param pipes Registry of pipes for this view
 */
export declare function createTView(viewIndex: number, templateFn: ComponentTemplate<any> | null, consts: number, vars: number, directives: DirectiveDefListOrFactory | null, pipes: PipeDefListOrFactory | null, viewQuery: ComponentQuery<any> | null): TView;
export declare function createError(text: string, token: any): Error;
/**
 * Locates the host native element, used for bootstrapping existing nodes into rendering pipeline.
 *
 * @param elementOrSelector Render element or CSS selector to locate the element.
 */
export declare function locateHostElement(factory: RendererFactory3, elementOrSelector: RElement | string): RElement | null;
/**
 * Adds an event listener to the current node.
 *
 * If an output exists on one of the node's directives, it also subscribes to the output
 * and saves the subscription for later cleanup.
 *
 * @param eventName Name of the event
 * @param listenerFn The function to be called when event emits
 * @param useCapture Whether or not to use capture in event listener.
 */
export declare function listener(eventName: string, listenerFn: (e?: any) => any, useCapture?: boolean): void;
/**
 * Saves context for this cleanup function in LView.cleanupInstances.
 *
 * On the first template pass, saves in TView:
 * - Cleanup function
 * - Index of context we just saved in LView.cleanupInstances
 */
export declare function storeCleanupWithContext(lView: LView, context: any, cleanupFn: Function): void;
/**
 * Saves the cleanup function itself in LView.cleanupInstances.
 *
 * This is necessary for functions that are wrapped with their contexts, like in renderer2
 * listeners.
 *
 * On the first template pass, the index of the cleanup function is saved in TView.
 */
export declare function storeCleanupFn(view: LView, cleanupFn: Function): void;
/** Mark the end of the element. */
export declare function elementEnd(): void;
/**
 * Updates the value of removes an attribute on an Element.
 *
 * @param number index The index of the element in the data array
 * @param name name The name of the attribute.
 * @param value value The attribute is removed when value is `null` or `undefined`.
 *                  Otherwise the attribute value is set to the stringified value.
 * @param sanitizer An optional function used to sanitize the value.
 */
export declare function elementAttribute(index: number, name: string, value: any, sanitizer?: SanitizerFn | null): void;
/**
 * Update a property on an element.
 *
 * If the property name also exists as an input property on one of the element's directives,
 * the component property will be set instead of the element property. This check must
 * be conducted at runtime so child components that add new @Inputs don't have to be re-compiled.
 *
 * @param index The index of the element to update in the data array
 * @param propName Name of property. Because it is going to DOM, this is not subject to
 *        renaming as part of minification.
 * @param value New value to write.
 * @param sanitizer An optional function used to sanitize the value.
 * @param nativeOnly Whether or not we should only set native properties and skip input check
 * (this is necessary for host property bindings)
 */
export declare function elementProperty<T>(index: number, propName: string, value: T | NO_CHANGE, sanitizer?: SanitizerFn | null, nativeOnly?: boolean): void;
/**
 * Updates a synthetic host binding (e.g. `[@foo]`) on a component.
 *
 * This instruction is for compatibility purposes and is designed to ensure that a
 * synthetic host binding (e.g. `@HostBinding('@foo')`) properly gets rendered in
 * the component's renderer. Normally all host bindings are evaluated with the parent
 * component's renderer, but, in the case of animation @triggers, they need to be
 * evaluated with the sub components renderer (because that's where the animation
 * triggers are defined).
 *
 * Do not use this instruction as a replacement for `elementProperty`. This instruction
 * only exists to ensure compatibility with the ViewEngine's host binding behavior.
 *
 * @param index The index of the element to update in the data array
 * @param propName Name of property. Because it is going to DOM, this is not subject to
 *        renaming as part of minification.
 * @param value New value to write.
 * @param sanitizer An optional function used to sanitize the value.
 * @param nativeOnly Whether or not we should only set native properties and skip input check
 * (this is necessary for host property bindings)
 */
export declare function componentHostSyntheticProperty<T>(index: number, propName: string, value: T | NO_CHANGE, sanitizer?: SanitizerFn | null, nativeOnly?: boolean): void;
/**
 * Constructs a TNode object from the arguments.
 *
 * @param type The type of the node
 * @param adjustedIndex The index of the TNode in TView.data, adjusted for HEADER_OFFSET
 * @param tagName The tag name of the node
 * @param attrs The attributes defined on this node
 * @param tViews Any TViews attached to this node
 * @returns the TNode object
 */
export declare function createTNode(lView: LView, type: TNodeType, adjustedIndex: number, tagName: string | null, attrs: TAttributes | null, tViews: TView[] | null): TNode;
/**
 * Assign any inline style values to the element during creation mode.
 *
 * This instruction is meant to be called during creation mode to register all
 * dynamic style and class bindings on the element. Note for static values (no binding)
 * see `elementStart` and `elementHostAttrs`.
 *
 * @param classBindingNames An array containing bindable class names.
 *        The `elementClassProp` refers to the class name by index in this array.
 *        (i.e. `['foo', 'bar']` means `foo=0` and `bar=1`).
 * @param styleBindingNames An array containing bindable style properties.
 *        The `elementStyleProp` refers to the class name by index in this array.
 *        (i.e. `['width', 'height']` means `width=0` and `height=1`).
 * @param styleSanitizer An optional sanitizer function that will be used to sanitize any CSS
 *        property values that are applied to the element (during rendering).
 *        Note that the sanitizer instance itself is tied to the `directive` (if  provided).
 * @param directive A directive instance the styling is associated with. If not provided
 *        current view's controller instance is assumed.
 *
 * @publicApi
 */
export declare function elementStyling(classBindingNames?: string[] | null, styleBindingNames?: string[] | null, styleSanitizer?: StyleSanitizeFn | null, directive?: {}): void;
/**
 * Assign static styling values to a host element.
 *
 * NOTE: This instruction is meant to used from `hostBindings` function only.
 *
 * @param directive A directive instance the styling is associated with.
 * @param attrs An array containing class and styling information. The values must be marked with
 *              `AttributeMarker`.
 *
 *        ```
 *        var attrs = [AttributeMarker.Classes, 'foo', 'bar',
 *                     AttributeMarker.Styles, 'width', '100px', 'height, '200px']
 *        elementHostAttrs(directive, attrs);
 *        ```
 *
 * @publicApi
 */
export declare function elementHostAttrs(directive: any, attrs: TAttributes): void;
/**
 * Apply styling binding to the element.
 *
 * This instruction is meant to be run after `elementStyle` and/or `elementStyleProp`.
 * if any styling bindings have changed then the changes are flushed to the element.
 *
 *
 * @param index Index of the element's with which styling is associated.
 * @param directive Directive instance that is attempting to change styling. (Defaults to the
 *        component of the current view).
components
 *
 * @publicApi
 */
export declare function elementStylingApply(index: number, directive?: any): void;
/**
 * Update a style bindings value on an element.
 *
 * If the style value is `null` then it will be removed from the element
 * (or assigned a different value depending if there are any styles placed
 * on the element with `elementStyle` or any styles that are present
 * from when the element was created (with `elementStyling`).
 *
 * (Note that the styling element is updated as part of `elementStylingApply`.)
 *
 * @param index Index of the element's with which styling is associated.
 * @param styleIndex Index of style to update. This index value refers to the
 *        index of the style in the style bindings array that was passed into
 *        `elementStlyingBindings`.
 * @param value New value to write (null to remove). Note that if a directive also
 *        attempts to write to the same binding value then it will only be able to
 *        do so if the template binding value is `null` (or doesn't exist at all).
 * @param suffix Optional suffix. Used with scalar values to add unit such as `px`.
 *        Note that when a suffix is provided then the underlying sanitizer will
 *        be ignored.
 * @param directive Directive instance that is attempting to change styling. (Defaults to the
 *        component of the current view).
components
 *
 * @publicApi
 */
export declare function elementStyleProp(index: number, styleIndex: number, value: string | number | String | PlayerFactory | null, suffix?: string | null, directive?: {}): void;
/**
 * Add or remove a class via a class binding on a DOM element.
 *
 * This instruction is meant to handle the [class.foo]="exp" case and, therefore,
 * the class itself must already be applied using `elementStyling` within
 * the creation block.
 *
 * @param index Index of the element's with which styling is associated.
 * @param classIndex Index of class to toggle. This index value refers to the
 *        index of the class in the class bindings array that was passed into
 *        `elementStlyingBindings` (which is meant to be called before this
 *        function is).
 * @param value A true/false value which will turn the class on or off.
 * @param directive Directive instance that is attempting to change styling. (Defaults to the
 *        component of the current view).
components
 *
 * @publicApi
 */
export declare function elementClassProp(index: number, classIndex: number, value: boolean | PlayerFactory, directive?: {}): void;
/**
 * Update style and/or class bindings using object literal.
 *
 * This instruction is meant apply styling via the `[style]="exp"` and `[class]="exp"` template
 * bindings. When styles are applied to the Element they will then be placed with respect to
 * any styles set with `elementStyleProp`. If any styles are set to `null` then they will be
 * removed from the element.
 *
 * (Note that the styling instruction will not be applied until `elementStylingApply` is called.)
 *
 * @param index Index of the element's with which styling is associated.
 * @param classes A key/value style map of CSS classes that will be added to the given element.
 *        Any missing classes (that have already been applied to the element beforehand) will be
 *        removed (unset) from the element's list of CSS classes.
 * @param styles A key/value style map of the styles that will be applied to the given element.
 *        Any missing styles (that have already been applied to the element beforehand) will be
 *        removed (unset) from the element's styling.
 * @param directive Directive instance that is attempting to change styling. (Defaults to the
 *        component of the current view).
 *
 * @publicApi
 */
export declare function elementStylingMap<T>(index: number, classes: {
    [key: string]: any;
} | string | NO_CHANGE | null, styles?: {
    [styleName: string]: any;
} | NO_CHANGE | null, directive?: {}): void;
/**
 * Create static text node
 *
 * @param index Index of the node in the data array
 * @param value Value to write. This value will be stringified.
 */
export declare function text(index: number, value?: any): void;
/**
 * Create text node with binding
 * Bindings should be handled externally with the proper interpolation(1-8) method
 *
 * @param index Index of the node in the data array.
 * @param value Stringified value to write.
 */
export declare function textBinding<T>(index: number, value: T | NO_CHANGE): void;
/**
 * Instantiate a root component.
 */
export declare function instantiateRootComponent<T>(tView: TView, viewData: LView, def: ComponentDef<T>): T;
/**
* Generates a new block in TView.expandoInstructions for this node.
*
* Each expando block starts with the element index (turned negative so we can distinguish
* it from the hostVar count) and the directive count. See more in VIEW_DATA.md.
*/
export declare function generateExpandoInstructionBlock(tView: TView, tNode: TNode, directiveCount: number): void;
/** Stores index of component's host element so it will be queued for view refresh during CD. */
export declare function queueComponentIndexForCheck(previousOrParentTNode: TNode): void;
/**
 * Initializes the flags on the current node, setting all indices to the initial index,
 * the directive count to 0, and adding the isComponent flag.
 * @param index the initial index
 */
export declare function initNodeFlags(tNode: TNode, index: number, numberOfDirectives: number): void;
/**
 * Creates a LContainer, either from a container instruction, or for a ViewContainerRef.
 *
 * @param hostNative The host element for the LContainer
 * @param hostTNode The host TNode for the LContainer
 * @param currentView The parent view of the LContainer
 * @param native The native comment element
 * @param isForViewContainerRef Optional a flag indicating the ViewContainerRef case
 * @returns LContainer
 */
export declare function createLContainer(hostNative: RElement | RComment, hostTNode: TElementNode | TContainerNode | TElementContainerNode, currentView: LView, native: RComment, isForViewContainerRef?: boolean): LContainer;
/**
 * Creates an LContainer for an ng-template (dynamically-inserted view), e.g.
 *
 * <ng-template #foo>
 *    <div></div>
 * </ng-template>
 *
 * @param index The index of the container in the data array
 * @param templateFn Inline template
 * @param consts The number of nodes, local refs, and pipes for this template
 * @param vars The number of bindings for this template
 * @param tagName The name of the container element, if applicable
 * @param attrs The attrs attached to the container, if applicable
 * @param localRefs A set of local reference bindings on the element.
 * @param localRefExtractor A function which extracts local-refs values from the template.
 *        Defaults to the current element associated with the local-ref.
 */
export declare function template(index: number, templateFn: ComponentTemplate<any> | null, consts: number, vars: number, tagName?: string | null, attrs?: TAttributes | null, localRefs?: string[] | null, localRefExtractor?: LocalRefExtractor): void;
/**
 * Creates an LContainer for inline views, e.g.
 *
 * % if (showing) {
 *   <div></div>
 * % }
 *
 * @param index The index of the container in the data array
 */
export declare function container(index: number): void;
/**
 * Sets a container up to receive views.
 *
 * @param index The index of the container in the data array
 */
export declare function containerRefreshStart(index: number): void;
/**
 * Marks the end of the LContainer.
 *
 * Marking the end of LContainer is the time when to child views get inserted or removed.
 */
export declare function containerRefreshEnd(): void;
/**
 * Marks the start of an embedded view.
 *
 * @param viewBlockId The ID of this view
 * @return boolean Whether or not this view is in creation mode
 */
export declare function embeddedViewStart(viewBlockId: number, consts: number, vars: number): RenderFlags;
/** Marks the end of an embedded view. */
export declare function embeddedViewEnd(): void;
/**
 * Refreshes components by entering the component view and processing its bindings, queries, etc.
 *
 * @param adjustedElementIndex  Element index in LView[] (adjusted for HEADER_OFFSET)
 */
export declare function componentRefresh<T>(adjustedElementIndex: number): void;
/** Returns a boolean for whether the view is attached */
export declare function viewAttached(view: LView): boolean;
/**
 * Instruction to distribute projectable nodes among <ng-content> occurrences in a given template.
 * It takes all the selectors from the entire component's template and decides where
 * each projected node belongs (it re-distributes nodes among "buckets" where each "bucket" is
 * backed by a selector).
 *
 * This function requires CSS selectors to be provided in 2 forms: parsed (by a compiler) and text,
 * un-parsed form.
 *
 * The parsed form is needed for efficient matching of a node against a given CSS selector.
 * The un-parsed, textual form is needed for support of the ngProjectAs attribute.
 *
 * Having a CSS selector in 2 different formats is not ideal, but alternatives have even more
 * drawbacks:
 * - having only a textual form would require runtime parsing of CSS selectors;
 * - we can't have only a parsed as we can't re-construct textual form from it (as entered by a
 * template author).
 *
 * @param selectors A collection of parsed CSS selectors
 * @param rawSelectors A collection of CSS selectors in the raw, un-parsed form
 */
export declare function projectionDef(selectors?: CssSelectorList[], textSelectors?: string[]): void;
/**
 * Inserts previously re-distributed projected nodes. This instruction must be preceded by a call
 * to the projectionDef instruction.
 *
 * @param nodeIndex
 * @param selectorIndex:
 *        - 0 when the selector is `*` (or unspecified as this is the default value),
 *        - 1 based index of the selector from the {@link projectionDef}
 */
export declare function projection(nodeIndex: number, selectorIndex?: number, attrs?: string[]): void;
/**
 * Adds LView or LContainer to the end of the current view tree.
 *
 * This structure will be used to traverse through nested views to remove listeners
 * and call onDestroy callbacks.
 *
 * @param lView The view where LView or LContainer should be added
 * @param adjustedHostIndex Index of the view's host node in LView[], adjusted for header
 * @param state The LView or LContainer to add to the view tree
 * @returns The state passed in
 */
export declare function addToViewTree<T extends LView | LContainer>(lView: LView, adjustedHostIndex: number, state: T): T;
/** Marks current view and all ancestors dirty */
export declare function markViewDirty(lView: LView): void;
/**
 * Used to schedule change detection on the whole application.
 *
 * Unlike `tick`, `scheduleTick` coalesces multiple calls into one change detection run.
 * It is usually called indirectly by calling `markDirty` when the view needs to be
 * re-rendered.
 *
 * Typically `scheduleTick` uses `requestAnimationFrame` to coalesce multiple
 * `scheduleTick` requests. The scheduling function can be overridden in
 * `renderComponent`'s `scheduler` option.
 */
export declare function scheduleTick<T>(rootContext: RootContext, flags: RootContextFlags): void;
/**
 * Used to perform change detection on the whole application.
 *
 * This is equivalent to `detectChanges`, but invoked on root component. Additionally, `tick`
 * executes lifecycle hooks and conditionally checks components based on their
 * `ChangeDetectionStrategy` and dirtiness.
 *
 * The preferred way to trigger change detection is to call `markDirty`. `markDirty` internally
 * schedules `tick` using a scheduler in order to coalesce multiple `markDirty` calls into a
 * single change detection run. By default, the scheduler is `requestAnimationFrame`, but can
 * be changed when calling `renderComponent` and providing the `scheduler` option.
 */
export declare function tick<T>(component: T): void;
/**
 * Synchronously perform change detection on a component (and possibly its sub-components).
 *
 * This function triggers change detection in a synchronous way on a component. There should
 * be very little reason to call this function directly since a preferred way to do change
 * detection is to {@link markDirty} the component and wait for the scheduler to call this method
 * at some future point in time. This is because a single user action often results in many
 * components being invalidated and calling change detection on each component synchronously
 * would be inefficient. It is better to wait until all components are marked as dirty and
 * then perform single change detection across all of the components
 *
 * @param component The component which the change detection should be performed on.
 */
export declare function detectChanges<T>(component: T): void;
export declare function detectChangesInternal<T>(view: LView, context: T): void;
/**
 * Synchronously perform change detection on a root view and its components.
 *
 * @param lView The view which the change detection should be performed on.
 */
export declare function detectChangesInRootView(lView: LView): void;
/**
 * Checks the change detector and its children, and throws if any changes are detected.
 *
 * This is used in development mode to verify that running change detection doesn't
 * introduce other changes.
 */
export declare function checkNoChanges<T>(component: T): void;
/**
 * Checks the change detector on a root view and its components, and throws if any changes are
 * detected.
 *
 * This is used in development mode to verify that running change detection doesn't
 * introduce other changes.
 *
 * @param lView The view which the change detection should be checked on.
 */
export declare function checkNoChangesInRootView(lView: LView): void;
/** Checks the view of the component provided. Does not gate on dirty checks or execute doCheck. */
export declare function checkView<T>(hostView: LView, component: T): void;
/**
 * Mark the component as dirty (needing change detection).
 *
 * Marking a component dirty will schedule a change detection on this
 * component at some point in the future. Marking an already dirty
 * component as dirty is a noop. Only one outstanding change detection
 * can be scheduled per component tree. (Two components bootstrapped with
 * separate `renderComponent` will have separate schedulers)
 *
 * When the root component is bootstrapped with `renderComponent`, a scheduler
 * can be provided.
 *
 * @param component Component to mark as dirty.
 *
 * @publicApi
 */
export declare function markDirty<T>(component: T): void;
/**
 * Creates a single value binding.
 *
 * @param value Value to diff
 */
export declare function bind<T>(value: T): T | NO_CHANGE;
/**
 * Allocates the necessary amount of slots for host vars.
 *
 * @param count Amount of vars to be allocated
 */
export declare function allocHostVars(count: number): void;
/**
 * Create interpolation bindings with a variable number of expressions.
 *
 * If there are 1 to 8 expressions `interpolation1()` to `interpolation8()` should be used instead.
 * Those are faster because there is no need to create an array of expressions and iterate over it.
 *
 * `values`:
 * - has static text at even indexes,
 * - has evaluated expressions at odd indexes.
 *
 * Returns the concatenated string when any of the arguments changes, `NO_CHANGE` otherwise.
 */
export declare function interpolationV(values: any[]): string | NO_CHANGE;
/**
 * Creates an interpolation binding with 1 expression.
 *
 * @param prefix static value used for concatenation only.
 * @param v0 value checked for change.
 * @param suffix static value used for concatenation only.
 */
export declare function interpolation1(prefix: string, v0: any, suffix: string): string | NO_CHANGE;
/** Creates an interpolation binding with 2 expressions. */
export declare function interpolation2(prefix: string, v0: any, i0: string, v1: any, suffix: string): string | NO_CHANGE;
/** Creates an interpolation binding with 3 expressions. */
export declare function interpolation3(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, suffix: string): string | NO_CHANGE;
/** Create an interpolation binding with 4 expressions. */
export declare function interpolation4(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, suffix: string): string | NO_CHANGE;
/** Creates an interpolation binding with 5 expressions. */
export declare function interpolation5(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, suffix: string): string | NO_CHANGE;
/** Creates an interpolation binding with 6 expressions. */
export declare function interpolation6(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, suffix: string): string | NO_CHANGE;
/** Creates an interpolation binding with 7 expressions. */
export declare function interpolation7(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, i5: string, v6: any, suffix: string): string | NO_CHANGE;
/** Creates an interpolation binding with 8 expressions. */
export declare function interpolation8(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, i5: string, v6: any, i6: string, v7: any, suffix: string): string | NO_CHANGE;
/** Store a value in the `data` at a given `index`. */
export declare function store<T>(index: number, value: T): void;
/**
 * Retrieves a local reference from the current contextViewData.
 *
 * If the reference to retrieve is in a parent view, this instruction is used in conjunction
 * with a nextContext() call, which walks up the tree and updates the contextViewData instance.
 *
 * @param index The index of the local ref in contextViewData.
 */
export declare function reference<T>(index: number): T;
export declare function loadQueryList<T>(queryListIdx: number): QueryList<T>;
/** Retrieves a value from current `viewData`. */
export declare function load<T>(index: number): T;
/**
 * Returns the value associated to the given token from the injectors.
 *
 * `directiveInject` is intended to be used for directive, component and pipe factories.
 *  All other injection use `inject` which does not walk the node injector tree.
 *
 * Usage example (in factory function):
 *
 * class SomeDirective {
 *   constructor(directive: DirectiveA) {}
 *
 *   static ngDirectiveDef = defineDirective({
 *     type: SomeDirective,
 *     factory: () => new SomeDirective(directiveInject(DirectiveA))
 *   });
 * }
 *
 * @param token the type or token to inject
 * @param flags Injection flags
 * @returns the value from the injector or `null` when not found
 */
export declare function directiveInject<T>(token: Type<T> | InjectionToken<T>): T;
export declare function directiveInject<T>(token: Type<T> | InjectionToken<T>, flags: InjectFlags): T;
/**
 * Facade for the attribute injection from DI.
 */
export declare function injectAttribute(attrNameToInject: string): string | null;
/**
 * Registers a QueryList, associated with a content query, for later refresh (part of a view
 * refresh).
 */
export declare function registerContentQuery<Q>(queryList: QueryList<Q>, currentDirectiveIndex: number): void;
export declare const CLEAN_PROMISE: Promise<null>;
/**
 * Returns the current OpaqueViewState instance.
 *
 * Used in conjunction with the restoreView() instruction to save a snapshot
 * of the current view and restore it when listeners are invoked. This allows
 * walking the declaration view tree in listeners to get vars from parent views.
 */
export declare function getCurrentView(): OpaqueViewState;
