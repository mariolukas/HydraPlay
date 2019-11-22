/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef } from '@angular/core';
import { BaseDirective2, LayoutConfigOptions, StyleUtils, StyleBuilder, StyleDefinition, MediaMarshaller, ElementMatcher } from '@angular/flex-layout/core';
interface FlexBuilderParent {
    direction: string;
    hasWrap: boolean;
}
export declare class FlexStyleBuilder extends StyleBuilder {
    protected layoutConfig: LayoutConfigOptions;
    constructor(layoutConfig: LayoutConfigOptions);
    buildStyles(input: string, parent: FlexBuilderParent): StyleDefinition;
}
/**
 * Directive to control the size of a flex item using flex-basis, flex-grow, and flex-shrink.
 * Corresponds to the css `flex` shorthand property.
 *
 * @see https://css-tricks.com/snippets/css/a-guide-to-flexbox/
 */
export declare class FlexDirective extends BaseDirective2 {
    protected elRef: ElementRef;
    protected styleUtils: StyleUtils;
    protected layoutConfig: LayoutConfigOptions;
    protected styleBuilder: FlexStyleBuilder;
    protected marshal: MediaMarshaller;
    protected DIRECTIVE_KEY: string;
    protected direction: string;
    protected wrap: boolean;
    shrink: string;
    grow: string;
    protected flexGrow: string;
    protected flexShrink: string;
    constructor(elRef: ElementRef, styleUtils: StyleUtils, layoutConfig: LayoutConfigOptions, styleBuilder: FlexStyleBuilder, marshal: MediaMarshaller);
    /**
     * Caches the parent container's 'flex-direction' and updates the element's style.
     * Used as a handler for layout change events from the parent flex container.
     */
    protected onLayoutChange(matcher: ElementMatcher): void;
    /** Input to this is exclusively the basis input value */
    protected updateWithValue(value: string): void;
    /** Trigger a style reflow, usually based on a shrink/grow input event */
    protected triggerReflow(): void;
}
export declare class DefaultFlexDirective extends FlexDirective {
    protected inputs: string[];
}
export {};
