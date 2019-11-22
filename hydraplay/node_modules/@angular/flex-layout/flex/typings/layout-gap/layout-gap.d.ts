/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef, OnDestroy, NgZone, AfterContentInit } from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';
import { BaseDirective2, StyleBuilder, StyleDefinition, StyleUtils, MediaMarshaller, ElementMatcher } from '@angular/flex-layout/core';
import { Subject } from 'rxjs';
export interface LayoutGapParent {
    directionality: string;
    items: HTMLElement[];
    layout: string;
}
export declare class LayoutGapStyleBuilder extends StyleBuilder {
    private _styler;
    constructor(_styler: StyleUtils);
    buildStyles(gapValue: string, parent: LayoutGapParent): StyleDefinition;
    sideEffect(gapValue: string, _styles: StyleDefinition, parent: LayoutGapParent): void;
}
/**
 * 'layout-padding' styling directive
 *  Defines padding of child elements in a layout container
 */
export declare class LayoutGapDirective extends BaseDirective2 implements AfterContentInit, OnDestroy {
    protected elRef: ElementRef;
    protected zone: NgZone;
    protected directionality: Directionality;
    protected styleUtils: StyleUtils;
    protected styleBuilder: LayoutGapStyleBuilder;
    protected marshal: MediaMarshaller;
    protected layout: string;
    protected DIRECTIVE_KEY: string;
    protected observerSubject: Subject<void>;
    /** Special accessor to query for all child 'element' nodes regardless of type, class, etc */
    protected readonly childrenNodes: HTMLElement[];
    constructor(elRef: ElementRef, zone: NgZone, directionality: Directionality, styleUtils: StyleUtils, styleBuilder: LayoutGapStyleBuilder, marshal: MediaMarshaller);
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
    /**
     * Cache the parent container 'flex-direction' and update the 'margin' styles
     */
    protected onLayoutChange(matcher: ElementMatcher): void;
    /**
     *
     */
    protected updateWithValue(value: string): void;
    /** We need to override clearStyles because in most cases mru isn't populated */
    protected clearStyles(): void;
    /** Determine if an element will show or hide based on current activation */
    protected willDisplay(source: HTMLElement): boolean;
    protected buildChildObservable(): void;
    protected observer?: MutationObserver;
}
export declare class DefaultLayoutGapDirective extends LayoutGapDirective {
    protected inputs: string[];
}
