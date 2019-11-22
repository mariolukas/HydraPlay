/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import { BaseDirective2, LayoutConfigOptions, MediaMarshaller, StyleUtils, StyleBuilder } from '@angular/flex-layout/core';
export interface ShowHideParent {
    display: string;
}
export declare class ShowHideStyleBuilder extends StyleBuilder {
    buildStyles(show: string, parent: ShowHideParent): {
        'display': string;
    };
}
export declare class ShowHideDirective extends BaseDirective2 implements AfterViewInit, OnChanges {
    protected elementRef: ElementRef;
    protected styleBuilder: ShowHideStyleBuilder;
    protected styler: StyleUtils;
    protected marshal: MediaMarshaller;
    protected layoutConfig: LayoutConfigOptions;
    protected platformId: Object;
    protected serverModuleLoaded: boolean;
    protected DIRECTIVE_KEY: string;
    /** Original dom Elements CSS display style */
    protected display: string;
    protected hasLayout: boolean;
    protected hasFlexChild: boolean;
    constructor(elementRef: ElementRef, styleBuilder: ShowHideStyleBuilder, styler: StyleUtils, marshal: MediaMarshaller, layoutConfig: LayoutConfigOptions, platformId: Object, serverModuleLoaded: boolean);
    ngAfterViewInit(): void;
    /**
     * On changes to any @Input properties...
     * Default to use the non-responsive Input value ('fxShow')
     * Then conditionally override with the mq-activated Input's current value
     */
    ngOnChanges(changes: SimpleChanges): void;
    /**
     *  Watch for these extra triggers to update fxShow, fxHide stylings
     */
    protected trackExtraTriggers(): void;
    /**
     * Override accessor to the current HTMLElement's `display` style
     * Note: Show/Hide will not change the display to 'flex' but will set it to 'block'
     * unless it was already explicitly specified inline or in a CSS stylesheet.
     */
    protected getDisplayStyle(): string;
    /** Validate the visibility value and then update the host's inline display style */
    protected updateWithValue(value?: boolean | string): void;
}
/**
 * 'show' Layout API directive
 */
export declare class DefaultShowHideDirective extends ShowHideDirective {
    protected inputs: string[];
}
