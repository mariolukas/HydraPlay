/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, Injectable, Optional, NgModule, Input, defineInjectable } from '@angular/core';
import { MediaMarshaller, BaseDirective2, StyleBuilder, StyleUtils, CoreModule } from '@angular/flex-layout/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
const ROW_DEFAULT = 'stretch';
/** @type {?} */
const COL_DEFAULT = 'stretch';
class GridAlignStyleBuilder extends StyleBuilder {
    /**
     * @param {?} input
     * @return {?}
     */
    buildStyles(input) {
        return buildCss(input || ROW_DEFAULT);
    }
}
GridAlignStyleBuilder.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] },
];
/** @nocollapse */ GridAlignStyleBuilder.ngInjectableDef = defineInjectable({ factory: function GridAlignStyleBuilder_Factory() { return new GridAlignStyleBuilder(); }, token: GridAlignStyleBuilder, providedIn: "root" });
class GridAlignDirective extends BaseDirective2 {
    /**
     * @param {?} elementRef
     * @param {?} styleBuilder
     * @param {?} styler
     * @param {?} marshal
     */
    constructor(elementRef, 
    // NOTE: not actually optional, but we need to force DI without a
    // constructor call
    styleBuilder, styler, marshal) {
        super(elementRef, styleBuilder, styler, marshal);
        this.elementRef = elementRef;
        this.styleBuilder = styleBuilder;
        this.styler = styler;
        this.marshal = marshal;
        this.DIRECTIVE_KEY = 'grid-align';
        this.styleCache = alignCache;
        this.init();
    }
}
/** @nocollapse */
GridAlignDirective.ctorParameters = () => [
    { type: ElementRef },
    { type: GridAlignStyleBuilder, decorators: [{ type: Optional }] },
    { type: StyleUtils },
    { type: MediaMarshaller }
];
/** @type {?} */
const alignCache = new Map();
/** @type {?} */
const inputs = [
    'gdGridAlign',
    'gdGridAlign.xs', 'gdGridAlign.sm', 'gdGridAlign.md', 'gdGridAlign.lg', 'gdGridAlign.xl',
    'gdGridAlign.lt-sm', 'gdGridAlign.lt-md', 'gdGridAlign.lt-lg', 'gdGridAlign.lt-xl',
    'gdGridAlign.gt-xs', 'gdGridAlign.gt-sm', 'gdGridAlign.gt-md', 'gdGridAlign.gt-lg'
];
/** @type {?} */
const selector = `
  [gdGridAlign],
  [gdGridAlign.xs], [gdGridAlign.sm], [gdGridAlign.md], [gdGridAlign.lg],[gdGridAlign.xl],
  [gdGridAlign.lt-sm], [gdGridAlign.lt-md], [gdGridAlign.lt-lg], [gdGridAlign.lt-xl],
  [gdGridAlign.gt-xs], [gdGridAlign.gt-sm], [gdGridAlign.gt-md], [gdGridAlign.gt-lg]
`;
/**
 * 'align' CSS Grid styling directive for grid children
 *  Defines positioning of child elements along row and column axis in a grid container
 *  Optional values: {row-axis} values or {row-axis column-axis} value pairs
 *
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#prop-justify-self
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#prop-align-self
 */
class DefaultGridAlignDirective extends GridAlignDirective {
    constructor() {
        super(...arguments);
        this.inputs = inputs;
    }
}
DefaultGridAlignDirective.decorators = [
    { type: Directive, args: [{ selector, inputs },] },
];
/**
 * @param {?=} align
 * @return {?}
 */
function buildCss(align = '') {
    /** @type {?} */
    const css = {};
    const [rowAxis, columnAxis] = align.split(' ');
    // Row axis
    switch (rowAxis) {
        case 'end':
            css['justify-self'] = 'end';
            break;
        case 'center':
            css['justify-self'] = 'center';
            break;
        case 'stretch':
            css['justify-self'] = 'stretch';
            break;
        case 'start':
            css['justify-self'] = 'start';
            break;
        default:
            css['justify-self'] = ROW_DEFAULT; // default row axis
            break;
    }
    // Column axis
    switch (columnAxis) {
        case 'end':
            css['align-self'] = 'end';
            break;
        case 'center':
            css['align-self'] = 'center';
            break;
        case 'stretch':
            css['align-self'] = 'stretch';
            break;
        case 'start':
            css['align-self'] = 'start';
            break;
        default:
            css['align-self'] = COL_DEFAULT; // default column axis
            break;
    }
    return css;
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
const DEFAULT_MAIN = 'start';
/** @type {?} */
const DEFAULT_CROSS = 'stretch';
class GridAlignColumnsStyleBuilder extends StyleBuilder {
    /**
     * @param {?} input
     * @param {?} parent
     * @return {?}
     */
    buildStyles(input, parent) {
        return buildCss$1(input || `${DEFAULT_MAIN} ${DEFAULT_CROSS}`, parent.inline);
    }
}
GridAlignColumnsStyleBuilder.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] },
];
/** @nocollapse */ GridAlignColumnsStyleBuilder.ngInjectableDef = defineInjectable({ factory: function GridAlignColumnsStyleBuilder_Factory() { return new GridAlignColumnsStyleBuilder(); }, token: GridAlignColumnsStyleBuilder, providedIn: "root" });
class GridAlignColumnsDirective extends BaseDirective2 {
    /**
     * @param {?} elementRef
     * @param {?} styleBuilder
     * @param {?} styler
     * @param {?} marshal
     */
    constructor(elementRef, 
    // NOTE: not actually optional, but we need to force DI without a
    // constructor call
    styleBuilder, styler, marshal) {
        super(elementRef, styleBuilder, styler, marshal);
        this.elementRef = elementRef;
        this.styleBuilder = styleBuilder;
        this.styler = styler;
        this.marshal = marshal;
        this.DIRECTIVE_KEY = 'grid-align-columns';
        this._inline = false;
        this.init();
    }
    /**
     * @return {?}
     */
    get inline() { return this._inline; }
    /**
     * @param {?} val
     * @return {?}
     */
    set inline(val) { this._inline = coerceBooleanProperty(val); }
    /**
     * @param {?} value
     * @return {?}
     */
    updateWithValue(value) {
        this.styleCache = this.inline ? alignColumnsInlineCache : alignColumnsCache;
        this.addStyles(value, { inline: this.inline });
    }
}
/** @nocollapse */
GridAlignColumnsDirective.ctorParameters = () => [
    { type: ElementRef },
    { type: GridAlignColumnsStyleBuilder, decorators: [{ type: Optional }] },
    { type: StyleUtils },
    { type: MediaMarshaller }
];
GridAlignColumnsDirective.propDecorators = {
    inline: [{ type: Input, args: ['gdInline',] }]
};
/** @type {?} */
const alignColumnsCache = new Map();
/** @type {?} */
const alignColumnsInlineCache = new Map();
/** @type {?} */
const inputs$1 = [
    'gdAlignColumns',
    'gdAlignColumns.xs', 'gdAlignColumns.sm', 'gdAlignColumns.md',
    'gdAlignColumns.lg', 'gdAlignColumns.xl', 'gdAlignColumns.lt-sm',
    'gdAlignColumns.lt-md', 'gdAlignColumns.lt-lg', 'gdAlignColumns.lt-xl',
    'gdAlignColumns.gt-xs', 'gdAlignColumns.gt-sm', 'gdAlignColumns.gt-md',
    'gdAlignColumns.gt-lg'
];
/** @type {?} */
const selector$1 = `
  [gdAlignColumns],
  [gdAlignColumns.xs], [gdAlignColumns.sm], [gdAlignColumns.md],
  [gdAlignColumns.lg], [gdAlignColumns.xl], [gdAlignColumns.lt-sm],
  [gdAlignColumns.lt-md], [gdAlignColumns.lt-lg], [gdAlignColumns.lt-xl],
  [gdAlignColumns.gt-xs], [gdAlignColumns.gt-sm], [gdAlignColumns.gt-md],
  [gdAlignColumns.gt-lg]
`;
/**
 * 'column alignment' CSS Grid styling directive
 * Configures the alignment in the column direction
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-19
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-21
 */
class DefaultGridAlignColumnsDirective extends GridAlignColumnsDirective {
    constructor() {
        super(...arguments);
        this.inputs = inputs$1;
    }
}
DefaultGridAlignColumnsDirective.decorators = [
    { type: Directive, args: [{ selector: selector$1, inputs: inputs$1 },] },
];
/**
 * @param {?} align
 * @param {?} inline
 * @return {?}
 */
function buildCss$1(align, inline) {
    /** @type {?} */
    const css = {};
    const [mainAxis, crossAxis] = align.split(' ');
    // Main axis
    switch (mainAxis) {
        case 'center':
            css['align-content'] = 'center';
            break;
        case 'space-around':
            css['align-content'] = 'space-around';
            break;
        case 'space-between':
            css['align-content'] = 'space-between';
            break;
        case 'space-evenly':
            css['align-content'] = 'space-evenly';
            break;
        case 'end':
            css['align-content'] = 'end';
            break;
        case 'start':
            css['align-content'] = 'start';
            break;
        case 'stretch':
            css['align-content'] = 'stretch';
            break;
        default:
            css['align-content'] = DEFAULT_MAIN; // default main axis
            break;
    }
    // Cross-axis
    switch (crossAxis) {
        case 'start':
            css['align-items'] = 'start';
            break;
        case 'center':
            css['align-items'] = 'center';
            break;
        case 'end':
            css['align-items'] = 'end';
            break;
        case 'stretch':
            css['align-items'] = 'stretch';
            break;
        default: // 'stretch'
            // 'stretch'
            css['align-items'] = DEFAULT_CROSS; // default cross axis
            break;
    }
    css['display'] = inline ? 'inline-grid' : 'grid';
    return css;
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
const DEFAULT_MAIN$1 = 'start';
/** @type {?} */
const DEFAULT_CROSS$1 = 'stretch';
class GridAlignRowsStyleBuilder extends StyleBuilder {
    /**
     * @param {?} input
     * @param {?} parent
     * @return {?}
     */
    buildStyles(input, parent) {
        return buildCss$2(input || `${DEFAULT_MAIN$1} ${DEFAULT_CROSS$1}`, parent.inline);
    }
}
GridAlignRowsStyleBuilder.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] },
];
/** @nocollapse */ GridAlignRowsStyleBuilder.ngInjectableDef = defineInjectable({ factory: function GridAlignRowsStyleBuilder_Factory() { return new GridAlignRowsStyleBuilder(); }, token: GridAlignRowsStyleBuilder, providedIn: "root" });
class GridAlignRowsDirective extends BaseDirective2 {
    /**
     * @param {?} elementRef
     * @param {?} styleBuilder
     * @param {?} styler
     * @param {?} marshal
     */
    constructor(elementRef, 
    // NOTE: not actually optional, but we need to force DI without a
    // constructor call
    styleBuilder, styler, marshal) {
        super(elementRef, styleBuilder, styler, marshal);
        this.elementRef = elementRef;
        this.styleBuilder = styleBuilder;
        this.styler = styler;
        this.marshal = marshal;
        this.DIRECTIVE_KEY = 'grid-align-rows';
        this._inline = false;
        this.init();
    }
    /**
     * @return {?}
     */
    get inline() { return this._inline; }
    /**
     * @param {?} val
     * @return {?}
     */
    set inline(val) { this._inline = coerceBooleanProperty(val); }
    /**
     * @param {?} value
     * @return {?}
     */
    updateWithValue(value) {
        this.styleCache = this.inline ? alignRowsInlineCache : alignRowsCache;
        this.addStyles(value, { inline: this.inline });
    }
}
/** @nocollapse */
GridAlignRowsDirective.ctorParameters = () => [
    { type: ElementRef },
    { type: GridAlignRowsStyleBuilder, decorators: [{ type: Optional }] },
    { type: StyleUtils },
    { type: MediaMarshaller }
];
GridAlignRowsDirective.propDecorators = {
    inline: [{ type: Input, args: ['gdInline',] }]
};
/** @type {?} */
const alignRowsCache = new Map();
/** @type {?} */
const alignRowsInlineCache = new Map();
/** @type {?} */
const inputs$2 = [
    'gdAlignRows',
    'gdAlignRows.xs', 'gdAlignRows.sm', 'gdAlignRows.md',
    'gdAlignRows.lg', 'gdAlignRows.xl', 'gdAlignRows.lt-sm',
    'gdAlignRows.lt-md', 'gdAlignRows.lt-lg', 'gdAlignRows.lt-xl',
    'gdAlignRows.gt-xs', 'gdAlignRows.gt-sm', 'gdAlignRows.gt-md',
    'gdAlignRows.gt-lg'
];
/** @type {?} */
const selector$2 = `
  [gdAlignRows],
  [gdAlignRows.xs], [gdAlignRows.sm], [gdAlignRows.md],
  [gdAlignRows.lg], [gdAlignRows.xl], [gdAlignRows.lt-sm],
  [gdAlignRows.lt-md], [gdAlignRows.lt-lg], [gdAlignRows.lt-xl],
  [gdAlignRows.gt-xs], [gdAlignRows.gt-sm], [gdAlignRows.gt-md],
  [gdAlignRows.gt-lg]
`;
/**
 * 'row alignment' CSS Grid styling directive
 * Configures the alignment in the row direction
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-18
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-20
 */
class DefaultGridAlignRowsDirective extends GridAlignRowsDirective {
    constructor() {
        super(...arguments);
        this.inputs = inputs$2;
    }
}
DefaultGridAlignRowsDirective.decorators = [
    { type: Directive, args: [{ selector: selector$2, inputs: inputs$2 },] },
];
/**
 * @param {?} align
 * @param {?} inline
 * @return {?}
 */
function buildCss$2(align, inline) {
    /** @type {?} */
    const css = {};
    const [mainAxis, crossAxis] = align.split(' ');
    // Main axis
    switch (mainAxis) {
        case 'center':
        case 'space-around':
        case 'space-between':
        case 'space-evenly':
        case 'end':
        case 'start':
        case 'stretch':
            css['justify-content'] = mainAxis;
            break;
        default:
            css['justify-content'] = DEFAULT_MAIN$1; // default main axis
            break;
    }
    // Cross-axis
    switch (crossAxis) {
        case 'start':
        case 'center':
        case 'end':
        case 'stretch':
            css['justify-items'] = crossAxis;
            break;
        default: // 'stretch'
            // 'stretch'
            css['justify-items'] = DEFAULT_CROSS$1; // default cross axis
            break;
    }
    css['display'] = inline ? 'inline-grid' : 'grid';
    return css;
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
const DEFAULT_VALUE = 'auto';
class GridAreaStyleBuilder extends StyleBuilder {
    /**
     * @param {?} input
     * @return {?}
     */
    buildStyles(input) {
        return { 'grid-area': input || DEFAULT_VALUE };
    }
}
GridAreaStyleBuilder.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] },
];
/** @nocollapse */ GridAreaStyleBuilder.ngInjectableDef = defineInjectable({ factory: function GridAreaStyleBuilder_Factory() { return new GridAreaStyleBuilder(); }, token: GridAreaStyleBuilder, providedIn: "root" });
class GridAreaDirective extends BaseDirective2 {
    /**
     * @param {?} elRef
     * @param {?} styleUtils
     * @param {?} styleBuilder
     * @param {?} marshal
     */
    constructor(elRef, styleUtils, 
    // NOTE: not actually optional, but we need to force DI without a
    // constructor call
    styleBuilder, marshal) {
        super(elRef, styleBuilder, styleUtils, marshal);
        this.elRef = elRef;
        this.styleUtils = styleUtils;
        this.styleBuilder = styleBuilder;
        this.marshal = marshal;
        this.DIRECTIVE_KEY = 'grid-area';
        this.styleCache = gridAreaCache;
        this.init();
    }
}
/** @nocollapse */
GridAreaDirective.ctorParameters = () => [
    { type: ElementRef },
    { type: StyleUtils },
    { type: GridAreaStyleBuilder, decorators: [{ type: Optional }] },
    { type: MediaMarshaller }
];
/** @type {?} */
const gridAreaCache = new Map();
/** @type {?} */
const inputs$3 = [
    'gdArea',
    'gdArea.xs', 'gdArea.sm', 'gdArea.md', 'gdArea.lg', 'gdArea.xl',
    'gdArea.lt-sm', 'gdArea.lt-md', 'gdArea.lt-lg', 'gdArea.lt-xl',
    'gdArea.gt-xs', 'gdArea.gt-sm', 'gdArea.gt-md', 'gdArea.gt-lg'
];
/** @type {?} */
const selector$3 = `
  [gdArea],
  [gdArea.xs], [gdArea.sm], [gdArea.md], [gdArea.lg], [gdArea.xl],
  [gdArea.lt-sm], [gdArea.lt-md], [gdArea.lt-lg], [gdArea.lt-xl],
  [gdArea.gt-xs], [gdArea.gt-sm], [gdArea.gt-md], [gdArea.gt-lg]
`;
/**
 * 'grid-area' CSS Grid styling directive
 * Configures the name or position of an element within the grid
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-27
 */
class DefaultGridAreaDirective extends GridAreaDirective {
    constructor() {
        super(...arguments);
        this.inputs = inputs$3;
    }
}
DefaultGridAreaDirective.decorators = [
    { type: Directive, args: [{ selector: selector$3, inputs: inputs$3 },] },
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
const DEFAULT_VALUE$1 = 'none';
/** @type {?} */
const DELIMETER = '|';
class GridAreasStyleBuiler extends StyleBuilder {
    /**
     * @param {?} input
     * @param {?} parent
     * @return {?}
     */
    buildStyles(input, parent) {
        /** @type {?} */
        const areas = (input || DEFAULT_VALUE$1).split(DELIMETER).map(v => `"${v.trim()}"`);
        return {
            'display': parent.inline ? 'inline-grid' : 'grid',
            'grid-template-areas': areas.join(' ')
        };
    }
}
GridAreasStyleBuiler.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] },
];
/** @nocollapse */ GridAreasStyleBuiler.ngInjectableDef = defineInjectable({ factory: function GridAreasStyleBuiler_Factory() { return new GridAreasStyleBuiler(); }, token: GridAreasStyleBuiler, providedIn: "root" });
class GridAreasDirective extends BaseDirective2 {
    /**
     * @param {?} elRef
     * @param {?} styleUtils
     * @param {?} styleBuilder
     * @param {?} marshal
     */
    constructor(elRef, styleUtils, 
    // NOTE: not actually optional, but we need to force DI without a
    // constructor call
    styleBuilder, marshal) {
        super(elRef, styleBuilder, styleUtils, marshal);
        this.elRef = elRef;
        this.styleUtils = styleUtils;
        this.styleBuilder = styleBuilder;
        this.marshal = marshal;
        this.DIRECTIVE_KEY = 'grid-areas';
        this._inline = false;
        this.init();
    }
    /**
     * @return {?}
     */
    get inline() { return this._inline; }
    /**
     * @param {?} val
     * @return {?}
     */
    set inline(val) { this._inline = coerceBooleanProperty(val); }
    /**
     * @param {?} value
     * @return {?}
     */
    updateWithValue(value) {
        this.styleCache = this.inline ? areasInlineCache : areasCache;
        this.addStyles(value, { inline: this.inline });
    }
}
/** @nocollapse */
GridAreasDirective.ctorParameters = () => [
    { type: ElementRef },
    { type: StyleUtils },
    { type: GridAreasStyleBuiler, decorators: [{ type: Optional }] },
    { type: MediaMarshaller }
];
GridAreasDirective.propDecorators = {
    inline: [{ type: Input, args: ['gdInline',] }]
};
/** @type {?} */
const areasCache = new Map();
/** @type {?} */
const areasInlineCache = new Map();
/** @type {?} */
const inputs$4 = [
    'gdAreas',
    'gdAreas.xs', 'gdAreas.sm', 'gdAreas.md', 'gdAreas.lg', 'gdAreas.xl',
    'gdAreas.lt-sm', 'gdAreas.lt-md', 'gdAreas.lt-lg', 'gdAreas.lt-xl',
    'gdAreas.gt-xs', 'gdAreas.gt-sm', 'gdAreas.gt-md', 'gdAreas.gt-lg'
];
/** @type {?} */
const selector$4 = `
  [gdAreas],
  [gdAreas.xs], [gdAreas.sm], [gdAreas.md], [gdAreas.lg], [gdAreas.xl],
  [gdAreas.lt-sm], [gdAreas.lt-md], [gdAreas.lt-lg], [gdAreas.lt-xl],
  [gdAreas.gt-xs], [gdAreas.gt-sm], [gdAreas.gt-md], [gdAreas.gt-lg]
`;
/**
 * 'grid-template-areas' CSS Grid styling directive
 * Configures the names of elements within the grid
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-14
 */
class DefaultGridAreasDirective extends GridAreasDirective {
    constructor() {
        super(...arguments);
        this.inputs = inputs$4;
    }
}
DefaultGridAreasDirective.decorators = [
    { type: Directive, args: [{ selector: selector$4, inputs: inputs$4 },] },
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
const DEFAULT_VALUE$2 = 'initial';
class GridAutoStyleBuilder extends StyleBuilder {
    /**
     * @param {?} input
     * @param {?} parent
     * @return {?}
     */
    buildStyles(input, parent) {
        let [direction, dense] = (input || DEFAULT_VALUE$2).split(' ');
        if (direction !== 'column' && direction !== 'row' && direction !== 'dense') {
            direction = 'row';
        }
        dense = (dense === 'dense' && direction !== 'dense') ? ' dense' : '';
        return {
            'display': parent.inline ? 'inline-grid' : 'grid',
            'grid-auto-flow': direction + dense
        };
    }
}
GridAutoStyleBuilder.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] },
];
/** @nocollapse */ GridAutoStyleBuilder.ngInjectableDef = defineInjectable({ factory: function GridAutoStyleBuilder_Factory() { return new GridAutoStyleBuilder(); }, token: GridAutoStyleBuilder, providedIn: "root" });
class GridAutoDirective extends BaseDirective2 {
    /**
     * @param {?} elementRef
     * @param {?} styleBuilder
     * @param {?} styler
     * @param {?} marshal
     */
    constructor(elementRef, 
    // NOTE: not actually optional, but we need to force DI without a
    // constructor call
    styleBuilder, styler, marshal) {
        super(elementRef, styleBuilder, styler, marshal);
        this.elementRef = elementRef;
        this.styleBuilder = styleBuilder;
        this.styler = styler;
        this.marshal = marshal;
        this._inline = false;
        this.DIRECTIVE_KEY = 'grid-auto';
        this.init();
    }
    /**
     * @return {?}
     */
    get inline() { return this._inline; }
    /**
     * @param {?} val
     * @return {?}
     */
    set inline(val) { this._inline = coerceBooleanProperty(val); }
    /**
     * @param {?} value
     * @return {?}
     */
    updateWithValue(value) {
        this.styleCache = this.inline ? autoInlineCache : autoCache;
        this.addStyles(value, { inline: this.inline });
    }
}
/** @nocollapse */
GridAutoDirective.ctorParameters = () => [
    { type: ElementRef },
    { type: GridAutoStyleBuilder, decorators: [{ type: Optional }] },
    { type: StyleUtils },
    { type: MediaMarshaller }
];
GridAutoDirective.propDecorators = {
    inline: [{ type: Input, args: ['gdInline',] }]
};
/** @type {?} */
const autoCache = new Map();
/** @type {?} */
const autoInlineCache = new Map();
/** @type {?} */
const inputs$5 = [
    'gdAuto',
    'gdAuto.xs', 'gdAuto.sm', 'gdAuto.md', 'gdAuto.lg', 'gdAuto.xl',
    'gdAuto.lt-sm', 'gdAuto.lt-md', 'gdAuto.lt-lg', 'gdAuto.lt-xl',
    'gdAuto.gt-xs', 'gdAuto.gt-sm', 'gdAuto.gt-md', 'gdAuto.gt-lg'
];
/** @type {?} */
const selector$5 = `
  [gdAuto],
  [gdAuto.xs], [gdAuto.sm], [gdAuto.md], [gdAuto.lg], [gdAuto.xl],
  [gdAuto.lt-sm], [gdAuto.lt-md], [gdAuto.lt-lg], [gdAuto.lt-xl],
  [gdAuto.gt-xs], [gdAuto.gt-sm], [gdAuto.gt-md], [gdAuto.gt-lg]
`;
/**
 * 'grid-auto-flow' CSS Grid styling directive
 * Configures the auto placement algorithm for the grid
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-23
 */
class DefaultGridAutoDirective extends GridAutoDirective {
    constructor() {
        super(...arguments);
        this.inputs = inputs$5;
    }
}
DefaultGridAutoDirective.decorators = [
    { type: Directive, args: [{ selector: selector$5, inputs: inputs$5 },] },
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
const DEFAULT_VALUE$3 = 'auto';
class GridColumnStyleBuilder extends StyleBuilder {
    /**
     * @param {?} input
     * @return {?}
     */
    buildStyles(input) {
        return { 'grid-column': input || DEFAULT_VALUE$3 };
    }
}
GridColumnStyleBuilder.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] },
];
/** @nocollapse */ GridColumnStyleBuilder.ngInjectableDef = defineInjectable({ factory: function GridColumnStyleBuilder_Factory() { return new GridColumnStyleBuilder(); }, token: GridColumnStyleBuilder, providedIn: "root" });
class GridColumnDirective extends BaseDirective2 {
    /**
     * @param {?} elementRef
     * @param {?} styleBuilder
     * @param {?} styler
     * @param {?} marshal
     */
    constructor(elementRef, 
    // NOTE: not actually optional, but we need to force DI without a
    // constructor call
    styleBuilder, styler, marshal) {
        super(elementRef, styleBuilder, styler, marshal);
        this.elementRef = elementRef;
        this.styleBuilder = styleBuilder;
        this.styler = styler;
        this.marshal = marshal;
        this.DIRECTIVE_KEY = 'grid-column';
        this.styleCache = columnCache;
        this.init();
    }
}
/** @nocollapse */
GridColumnDirective.ctorParameters = () => [
    { type: ElementRef },
    { type: GridColumnStyleBuilder, decorators: [{ type: Optional }] },
    { type: StyleUtils },
    { type: MediaMarshaller }
];
/** @type {?} */
const columnCache = new Map();
/** @type {?} */
const inputs$6 = [
    'gdColumn',
    'gdColumn.xs', 'gdColumn.sm', 'gdColumn.md', 'gdColumn.lg', 'gdColumn.xl',
    'gdColumn.lt-sm', 'gdColumn.lt-md', 'gdColumn.lt-lg', 'gdColumn.lt-xl',
    'gdColumn.gt-xs', 'gdColumn.gt-sm', 'gdColumn.gt-md', 'gdColumn.gt-lg'
];
/** @type {?} */
const selector$6 = `
  [gdColumn],
  [gdColumn.xs], [gdColumn.sm], [gdColumn.md], [gdColumn.lg], [gdColumn.xl],
  [gdColumn.lt-sm], [gdColumn.lt-md], [gdColumn.lt-lg], [gdColumn.lt-xl],
  [gdColumn.gt-xs], [gdColumn.gt-sm], [gdColumn.gt-md], [gdColumn.gt-lg]
`;
/**
 * 'grid-column' CSS Grid styling directive
 * Configures the name or position of an element within the grid
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-26
 */
class DefaultGridColumnDirective extends GridColumnDirective {
    constructor() {
        super(...arguments);
        this.inputs = inputs$6;
    }
}
DefaultGridColumnDirective.decorators = [
    { type: Directive, args: [{ selector: selector$6, inputs: inputs$6 },] },
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
const DEFAULT_VALUE$4 = 'none';
/** @type {?} */
const AUTO_SPECIFIER = '!';
class GridColumnsStyleBuilder extends StyleBuilder {
    /**
     * @param {?} input
     * @param {?} parent
     * @return {?}
     */
    buildStyles(input, parent) {
        input = input || DEFAULT_VALUE$4;
        /** @type {?} */
        let auto = false;
        if (input.endsWith(AUTO_SPECIFIER)) {
            input = input.substring(0, input.indexOf(AUTO_SPECIFIER));
            auto = true;
        }
        /** @type {?} */
        const css = {
            'display': parent.inline ? 'inline-grid' : 'grid',
            'grid-auto-columns': '',
            'grid-template-columns': '',
        };
        /** @type {?} */
        const key = (auto ? 'grid-auto-columns' : 'grid-template-columns');
        css[key] = input;
        return css;
    }
}
GridColumnsStyleBuilder.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] },
];
/** @nocollapse */ GridColumnsStyleBuilder.ngInjectableDef = defineInjectable({ factory: function GridColumnsStyleBuilder_Factory() { return new GridColumnsStyleBuilder(); }, token: GridColumnsStyleBuilder, providedIn: "root" });
class GridColumnsDirective extends BaseDirective2 {
    /**
     * @param {?} elementRef
     * @param {?} styleBuilder
     * @param {?} styler
     * @param {?} marshal
     */
    constructor(elementRef, 
    // NOTE: not actually optional, but we need to force DI without a
    // constructor call
    styleBuilder, styler, marshal) {
        super(elementRef, styleBuilder, styler, marshal);
        this.elementRef = elementRef;
        this.styleBuilder = styleBuilder;
        this.styler = styler;
        this.marshal = marshal;
        this.DIRECTIVE_KEY = 'grid-columns';
        this._inline = false;
        this.init();
    }
    /**
     * @return {?}
     */
    get inline() { return this._inline; }
    /**
     * @param {?} val
     * @return {?}
     */
    set inline(val) { this._inline = coerceBooleanProperty(val); }
    /**
     * @param {?} value
     * @return {?}
     */
    updateWithValue(value) {
        this.styleCache = this.inline ? columnsInlineCache : columnsCache;
        this.addStyles(value, { inline: this.inline });
    }
}
/** @nocollapse */
GridColumnsDirective.ctorParameters = () => [
    { type: ElementRef },
    { type: GridColumnsStyleBuilder, decorators: [{ type: Optional }] },
    { type: StyleUtils },
    { type: MediaMarshaller }
];
GridColumnsDirective.propDecorators = {
    inline: [{ type: Input, args: ['gdInline',] }]
};
/** @type {?} */
const columnsCache = new Map();
/** @type {?} */
const columnsInlineCache = new Map();
/** @type {?} */
const inputs$7 = [
    'gdColumns',
    'gdColumns.xs', 'gdColumns.sm', 'gdColumns.md', 'gdColumns.lg', 'gdColumns.xl',
    'gdColumns.lt-sm', 'gdColumns.lt-md', 'gdColumns.lt-lg', 'gdColumns.lt-xl',
    'gdColumns.gt-xs', 'gdColumns.gt-sm', 'gdColumns.gt-md', 'gdColumns.gt-lg'
];
/** @type {?} */
const selector$7 = `
  [gdColumns],
  [gdColumns.xs], [gdColumns.sm], [gdColumns.md], [gdColumns.lg], [gdColumns.xl],
  [gdColumns.lt-sm], [gdColumns.lt-md], [gdColumns.lt-lg], [gdColumns.lt-xl],
  [gdColumns.gt-xs], [gdColumns.gt-sm], [gdColumns.gt-md], [gdColumns.gt-lg]
`;
/**
 * 'grid-template-columns' CSS Grid styling directive
 * Configures the sizing for the columns in the grid
 * Syntax: <column value> [auto]
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-13
 */
class DefaultGridColumnsDirective extends GridColumnsDirective {
    constructor() {
        super(...arguments);
        this.inputs = inputs$7;
    }
}
DefaultGridColumnsDirective.decorators = [
    { type: Directive, args: [{ selector: selector$7, inputs: inputs$7 },] },
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
const DEFAULT_VALUE$5 = '0';
class GridGapStyleBuilder extends StyleBuilder {
    /**
     * @param {?} input
     * @param {?} parent
     * @return {?}
     */
    buildStyles(input, parent) {
        return {
            'display': parent.inline ? 'inline-grid' : 'grid',
            'grid-gap': input || DEFAULT_VALUE$5
        };
    }
}
GridGapStyleBuilder.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] },
];
/** @nocollapse */ GridGapStyleBuilder.ngInjectableDef = defineInjectable({ factory: function GridGapStyleBuilder_Factory() { return new GridGapStyleBuilder(); }, token: GridGapStyleBuilder, providedIn: "root" });
class GridGapDirective extends BaseDirective2 {
    /**
     * @param {?} elRef
     * @param {?} styleUtils
     * @param {?} styleBuilder
     * @param {?} marshal
     */
    constructor(elRef, styleUtils, 
    // NOTE: not actually optional, but we need to force DI without a
    // constructor call
    styleBuilder, marshal) {
        super(elRef, styleBuilder, styleUtils, marshal);
        this.elRef = elRef;
        this.styleUtils = styleUtils;
        this.styleBuilder = styleBuilder;
        this.marshal = marshal;
        this.DIRECTIVE_KEY = 'grid-gap';
        this._inline = false;
        this.init();
    }
    /**
     * @return {?}
     */
    get inline() { return this._inline; }
    /**
     * @param {?} val
     * @return {?}
     */
    set inline(val) { this._inline = coerceBooleanProperty(val); }
    /**
     * @param {?} value
     * @return {?}
     */
    updateWithValue(value) {
        this.styleCache = this.inline ? gapInlineCache : gapCache;
        this.addStyles(value, { inline: this.inline });
    }
}
/** @nocollapse */
GridGapDirective.ctorParameters = () => [
    { type: ElementRef },
    { type: StyleUtils },
    { type: GridGapStyleBuilder, decorators: [{ type: Optional }] },
    { type: MediaMarshaller }
];
GridGapDirective.propDecorators = {
    inline: [{ type: Input, args: ['gdInline',] }]
};
/** @type {?} */
const gapCache = new Map();
/** @type {?} */
const gapInlineCache = new Map();
/** @type {?} */
const inputs$8 = [
    'gdGap',
    'gdGap.xs', 'gdGap.sm', 'gdGap.md', 'gdGap.lg', 'gdGap.xl',
    'gdGap.lt-sm', 'gdGap.lt-md', 'gdGap.lt-lg', 'gdGap.lt-xl',
    'gdGap.gt-xs', 'gdGap.gt-sm', 'gdGap.gt-md', 'gdGap.gt-lg'
];
/** @type {?} */
const selector$8 = `
  [gdGap],
  [gdGap.xs], [gdGap.sm], [gdGap.md], [gdGap.lg], [gdGap.xl],
  [gdGap.lt-sm], [gdGap.lt-md], [gdGap.lt-lg], [gdGap.lt-xl],
  [gdGap.gt-xs], [gdGap.gt-sm], [gdGap.gt-md], [gdGap.gt-lg]
`;
/**
 * 'grid-gap' CSS Grid styling directive
 * Configures the gap between items in the grid
 * Syntax: <row gap> [<column-gap>]
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-17
 */
class DefaultGridGapDirective extends GridGapDirective {
    constructor() {
        super(...arguments);
        this.inputs = inputs$8;
    }
}
DefaultGridGapDirective.decorators = [
    { type: Directive, args: [{ selector: selector$8, inputs: inputs$8 },] },
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
const DEFAULT_VALUE$6 = 'auto';
class GridRowStyleBuilder extends StyleBuilder {
    /**
     * @param {?} input
     * @return {?}
     */
    buildStyles(input) {
        return { 'grid-row': input || DEFAULT_VALUE$6 };
    }
}
GridRowStyleBuilder.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] },
];
/** @nocollapse */ GridRowStyleBuilder.ngInjectableDef = defineInjectable({ factory: function GridRowStyleBuilder_Factory() { return new GridRowStyleBuilder(); }, token: GridRowStyleBuilder, providedIn: "root" });
class GridRowDirective extends BaseDirective2 {
    /**
     * @param {?} elementRef
     * @param {?} styleBuilder
     * @param {?} styler
     * @param {?} marshal
     */
    constructor(elementRef, 
    // NOTE: not actually optional, but we need to force DI without a
    // constructor call
    styleBuilder, styler, marshal) {
        super(elementRef, styleBuilder, styler, marshal);
        this.elementRef = elementRef;
        this.styleBuilder = styleBuilder;
        this.styler = styler;
        this.marshal = marshal;
        this.DIRECTIVE_KEY = 'grid-row';
        this.styleCache = rowCache;
        this.init();
    }
}
/** @nocollapse */
GridRowDirective.ctorParameters = () => [
    { type: ElementRef },
    { type: GridRowStyleBuilder, decorators: [{ type: Optional }] },
    { type: StyleUtils },
    { type: MediaMarshaller }
];
/** @type {?} */
const rowCache = new Map();
/** @type {?} */
const inputs$9 = [
    'gdRow',
    'gdRow.xs', 'gdRow.sm', 'gdRow.md', 'gdRow.lg', 'gdRow.xl',
    'gdRow.lt-sm', 'gdRow.lt-md', 'gdRow.lt-lg', 'gdRow.lt-xl',
    'gdRow.gt-xs', 'gdRow.gt-sm', 'gdRow.gt-md', 'gdRow.gt-lg'
];
/** @type {?} */
const selector$9 = `
  [gdRow],
  [gdRow.xs], [gdRow.sm], [gdRow.md], [gdRow.lg], [gdRow.xl],
  [gdRow.lt-sm], [gdRow.lt-md], [gdRow.lt-lg], [gdRow.lt-xl],
  [gdRow.gt-xs], [gdRow.gt-sm], [gdRow.gt-md], [gdRow.gt-lg]
`;
/**
 * 'grid-row' CSS Grid styling directive
 * Configures the name or position of an element within the grid
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-26
 */
class DefaultGridRowDirective extends GridRowDirective {
    constructor() {
        super(...arguments);
        this.inputs = inputs$9;
    }
}
DefaultGridRowDirective.decorators = [
    { type: Directive, args: [{ selector: selector$9, inputs: inputs$9 },] },
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
const DEFAULT_VALUE$7 = 'none';
/** @type {?} */
const AUTO_SPECIFIER$1 = '!';
class GridRowsStyleBuilder extends StyleBuilder {
    /**
     * @param {?} input
     * @param {?} parent
     * @return {?}
     */
    buildStyles(input, parent) {
        input = input || DEFAULT_VALUE$7;
        /** @type {?} */
        let auto = false;
        if (input.endsWith(AUTO_SPECIFIER$1)) {
            input = input.substring(0, input.indexOf(AUTO_SPECIFIER$1));
            auto = true;
        }
        /** @type {?} */
        const css = {
            'display': parent.inline ? 'inline-grid' : 'grid',
            'grid-auto-rows': '',
            'grid-template-rows': '',
        };
        /** @type {?} */
        const key = (auto ? 'grid-auto-rows' : 'grid-template-rows');
        css[key] = input;
        return css;
    }
}
GridRowsStyleBuilder.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] },
];
/** @nocollapse */ GridRowsStyleBuilder.ngInjectableDef = defineInjectable({ factory: function GridRowsStyleBuilder_Factory() { return new GridRowsStyleBuilder(); }, token: GridRowsStyleBuilder, providedIn: "root" });
class GridRowsDirective extends BaseDirective2 {
    /**
     * @param {?} elementRef
     * @param {?} styleBuilder
     * @param {?} styler
     * @param {?} marshal
     */
    constructor(elementRef, 
    // NOTE: not actually optional, but we need to force DI without a
    // constructor call
    styleBuilder, styler, marshal) {
        super(elementRef, styleBuilder, styler, marshal);
        this.elementRef = elementRef;
        this.styleBuilder = styleBuilder;
        this.styler = styler;
        this.marshal = marshal;
        this.DIRECTIVE_KEY = 'grid-rows';
        this._inline = false;
        this.init();
    }
    /**
     * @return {?}
     */
    get inline() { return this._inline; }
    /**
     * @param {?} val
     * @return {?}
     */
    set inline(val) { this._inline = coerceBooleanProperty(val); }
    /**
     * @param {?} value
     * @return {?}
     */
    updateWithValue(value) {
        this.styleCache = this.inline ? rowsInlineCache : rowsCache;
        this.addStyles(value, { inline: this.inline });
    }
}
/** @nocollapse */
GridRowsDirective.ctorParameters = () => [
    { type: ElementRef },
    { type: GridRowsStyleBuilder, decorators: [{ type: Optional }] },
    { type: StyleUtils },
    { type: MediaMarshaller }
];
GridRowsDirective.propDecorators = {
    inline: [{ type: Input, args: ['gdInline',] }]
};
/** @type {?} */
const rowsCache = new Map();
/** @type {?} */
const rowsInlineCache = new Map();
/** @type {?} */
const inputs$10 = [
    'gdRows',
    'gdRows.xs', 'gdRows.sm', 'gdRows.md', 'gdRows.lg', 'gdRows.xl',
    'gdRows.lt-sm', 'gdRows.lt-md', 'gdRows.lt-lg', 'gdRows.lt-xl',
    'gdRows.gt-xs', 'gdRows.gt-sm', 'gdRows.gt-md', 'gdRows.gt-lg'
];
/** @type {?} */
const selector$10 = `
  [gdRows],
  [gdRows.xs], [gdRows.sm], [gdRows.md], [gdRows.lg], [gdRows.xl],
  [gdRows.lt-sm], [gdRows.lt-md], [gdRows.lt-lg], [gdRows.lt-xl],
  [gdRows.gt-xs], [gdRows.gt-sm], [gdRows.gt-md], [gdRows.gt-lg]
`;
/**
 * 'grid-template-rows' CSS Grid styling directive
 * Configures the sizing for the rows in the grid
 * Syntax: <column value> [auto]
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-13
 */
class DefaultGridRowsDirective extends GridRowsDirective {
    constructor() {
        super(...arguments);
        this.inputs = inputs$10;
    }
}
DefaultGridRowsDirective.decorators = [
    { type: Directive, args: [{ selector: selector$10, inputs: inputs$10 },] },
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
const ALL_DIRECTIVES = [
    DefaultGridAlignDirective,
    DefaultGridAlignColumnsDirective,
    DefaultGridAlignRowsDirective,
    DefaultGridAreaDirective,
    DefaultGridAreasDirective,
    DefaultGridAutoDirective,
    DefaultGridColumnDirective,
    DefaultGridColumnsDirective,
    DefaultGridGapDirective,
    DefaultGridRowDirective,
    DefaultGridRowsDirective,
];
/**
 * *****************************************************************
 * Define module for the CSS Grid API
 * *****************************************************************
 */
class GridModule {
}
GridModule.decorators = [
    { type: NgModule, args: [{
                imports: [CoreModule],
                declarations: [...ALL_DIRECTIVES],
                exports: [...ALL_DIRECTIVES]
            },] },
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */

export { GridModule, DefaultGridAlignColumnsDirective as ɵf1, GridAlignColumnsDirective as ɵe1, GridAlignColumnsStyleBuilder as ɵd1, DefaultGridAlignRowsDirective as ɵi1, GridAlignRowsDirective as ɵh1, GridAlignRowsStyleBuilder as ɵg1, DefaultGridAreaDirective as ɵl1, GridAreaDirective as ɵk1, GridAreaStyleBuilder as ɵj1, DefaultGridAreasDirective as ɵo1, GridAreasDirective as ɵn1, GridAreasStyleBuiler as ɵm1, DefaultGridAutoDirective as ɵr1, GridAutoDirective as ɵq1, GridAutoStyleBuilder as ɵp1, DefaultGridColumnDirective as ɵu1, GridColumnDirective as ɵt1, GridColumnStyleBuilder as ɵs1, DefaultGridColumnsDirective as ɵx1, GridColumnsDirective as ɵw1, GridColumnsStyleBuilder as ɵv1, DefaultGridGapDirective as ɵba1, GridGapDirective as ɵz1, GridGapStyleBuilder as ɵy1, DefaultGridAlignDirective as ɵc1, GridAlignDirective as ɵb1, GridAlignStyleBuilder as ɵa1, DefaultGridRowDirective as ɵbd1, GridRowDirective as ɵbc1, GridRowStyleBuilder as ɵbb1, DefaultGridRowsDirective as ɵbg1, GridRowsDirective as ɵbf1, GridRowsStyleBuilder as ɵbe1 };
//# sourceMappingURL=grid.js.map
