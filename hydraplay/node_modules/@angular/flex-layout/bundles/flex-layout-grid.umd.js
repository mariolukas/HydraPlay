/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/flex-layout/core'), require('@angular/cdk/coercion')) :
	typeof define === 'function' && define.amd ? define('@angular/flex-layout/grid', ['exports', '@angular/core', '@angular/flex-layout/core', '@angular/cdk/coercion'], factory) :
	(factory((global.ng = global.ng || {}, global.ng.flexLayout = global.ng.flexLayout || {}, global.ng.flexLayout.grid = {}),global.ng.core,global.ng.flexLayout.core,global.ng.cdk.coercion));
}(this, (function (exports,core,core$1,coercion) { 'use strict';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
var ROW_DEFAULT = 'stretch';
/** @type {?} */
var COL_DEFAULT = 'stretch';
var GridAlignStyleBuilder = /** @class */ (function (_super) {
    __extends(GridAlignStyleBuilder, _super);
    function GridAlignStyleBuilder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * @param {?} input
     * @return {?}
     */
    GridAlignStyleBuilder.prototype.buildStyles = /**
     * @param {?} input
     * @return {?}
     */
    function (input) {
        return buildCss(input || ROW_DEFAULT);
    };
    GridAlignStyleBuilder.decorators = [
        { type: core.Injectable, args: [{ providedIn: 'root' },] },
    ];
    /** @nocollapse */ GridAlignStyleBuilder.ngInjectableDef = core.defineInjectable({ factory: function GridAlignStyleBuilder_Factory() { return new GridAlignStyleBuilder(); }, token: GridAlignStyleBuilder, providedIn: "root" });
    return GridAlignStyleBuilder;
}(core$1.StyleBuilder));
var GridAlignDirective = /** @class */ (function (_super) {
    __extends(GridAlignDirective, _super);
    function GridAlignDirective(elementRef, 
    // NOTE: not actually optional, but we need to force DI without a
    // constructor call
    styleBuilder, styler, marshal) {
        var _this = _super.call(this, elementRef, styleBuilder, styler, marshal) || this;
        _this.elementRef = elementRef;
        _this.styleBuilder = styleBuilder;
        _this.styler = styler;
        _this.marshal = marshal;
        _this.DIRECTIVE_KEY = 'grid-align';
        _this.styleCache = alignCache;
        _this.init();
        return _this;
    }
    /** @nocollapse */
    GridAlignDirective.ctorParameters = function () { return [
        { type: core.ElementRef },
        { type: GridAlignStyleBuilder, decorators: [{ type: core.Optional }] },
        { type: core$1.StyleUtils },
        { type: core$1.MediaMarshaller }
    ]; };
    return GridAlignDirective;
}(core$1.BaseDirective2));
/** @type {?} */
var alignCache = new Map();
/** @type {?} */
var inputs = [
    'gdGridAlign',
    'gdGridAlign.xs', 'gdGridAlign.sm', 'gdGridAlign.md', 'gdGridAlign.lg', 'gdGridAlign.xl',
    'gdGridAlign.lt-sm', 'gdGridAlign.lt-md', 'gdGridAlign.lt-lg', 'gdGridAlign.lt-xl',
    'gdGridAlign.gt-xs', 'gdGridAlign.gt-sm', 'gdGridAlign.gt-md', 'gdGridAlign.gt-lg'
];
/** @type {?} */
var selector = "\n  [gdGridAlign],\n  [gdGridAlign.xs], [gdGridAlign.sm], [gdGridAlign.md], [gdGridAlign.lg],[gdGridAlign.xl],\n  [gdGridAlign.lt-sm], [gdGridAlign.lt-md], [gdGridAlign.lt-lg], [gdGridAlign.lt-xl],\n  [gdGridAlign.gt-xs], [gdGridAlign.gt-sm], [gdGridAlign.gt-md], [gdGridAlign.gt-lg]\n";
/**
 * 'align' CSS Grid styling directive for grid children
 *  Defines positioning of child elements along row and column axis in a grid container
 *  Optional values: {row-axis} values or {row-axis column-axis} value pairs
 *
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#prop-justify-self
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#prop-align-self
 */
var DefaultGridAlignDirective = /** @class */ (function (_super) {
    __extends(DefaultGridAlignDirective, _super);
    function DefaultGridAlignDirective() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.inputs = inputs;
        return _this;
    }
    DefaultGridAlignDirective.decorators = [
        { type: core.Directive, args: [{ selector: selector, inputs: inputs },] },
    ];
    return DefaultGridAlignDirective;
}(GridAlignDirective));
/**
 * @param {?=} align
 * @return {?}
 */
function buildCss(align) {
    if (align === void 0) { align = ''; }
    /** @type {?} */
    var css = {};
    var _a = align.split(' '), rowAxis = _a[0], columnAxis = _a[1];
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
var DEFAULT_MAIN = 'start';
/** @type {?} */
var DEFAULT_CROSS = 'stretch';
var GridAlignColumnsStyleBuilder = /** @class */ (function (_super) {
    __extends(GridAlignColumnsStyleBuilder, _super);
    function GridAlignColumnsStyleBuilder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * @param {?} input
     * @param {?} parent
     * @return {?}
     */
    GridAlignColumnsStyleBuilder.prototype.buildStyles = /**
     * @param {?} input
     * @param {?} parent
     * @return {?}
     */
    function (input, parent) {
        return buildCss$1(input || DEFAULT_MAIN + " " + DEFAULT_CROSS, parent.inline);
    };
    GridAlignColumnsStyleBuilder.decorators = [
        { type: core.Injectable, args: [{ providedIn: 'root' },] },
    ];
    /** @nocollapse */ GridAlignColumnsStyleBuilder.ngInjectableDef = core.defineInjectable({ factory: function GridAlignColumnsStyleBuilder_Factory() { return new GridAlignColumnsStyleBuilder(); }, token: GridAlignColumnsStyleBuilder, providedIn: "root" });
    return GridAlignColumnsStyleBuilder;
}(core$1.StyleBuilder));
var GridAlignColumnsDirective = /** @class */ (function (_super) {
    __extends(GridAlignColumnsDirective, _super);
    function GridAlignColumnsDirective(elementRef, 
    // NOTE: not actually optional, but we need to force DI without a
    // constructor call
    styleBuilder, styler, marshal) {
        var _this = _super.call(this, elementRef, styleBuilder, styler, marshal) || this;
        _this.elementRef = elementRef;
        _this.styleBuilder = styleBuilder;
        _this.styler = styler;
        _this.marshal = marshal;
        _this.DIRECTIVE_KEY = 'grid-align-columns';
        _this._inline = false;
        _this.init();
        return _this;
    }
    Object.defineProperty(GridAlignColumnsDirective.prototype, "inline", {
        get: /**
         * @return {?}
         */
        function () { return this._inline; },
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._inline = coercion.coerceBooleanProperty(val); },
        enumerable: true,
        configurable: true
    });
    // *********************************************
    // Protected methods
    // *********************************************
    /**
     * @param {?} value
     * @return {?}
     */
    GridAlignColumnsDirective.prototype.updateWithValue = /**
     * @param {?} value
     * @return {?}
     */
    function (value) {
        this.styleCache = this.inline ? alignColumnsInlineCache : alignColumnsCache;
        this.addStyles(value, { inline: this.inline });
    };
    /** @nocollapse */
    GridAlignColumnsDirective.ctorParameters = function () { return [
        { type: core.ElementRef },
        { type: GridAlignColumnsStyleBuilder, decorators: [{ type: core.Optional }] },
        { type: core$1.StyleUtils },
        { type: core$1.MediaMarshaller }
    ]; };
    GridAlignColumnsDirective.propDecorators = {
        inline: [{ type: core.Input, args: ['gdInline',] }]
    };
    return GridAlignColumnsDirective;
}(core$1.BaseDirective2));
/** @type {?} */
var alignColumnsCache = new Map();
/** @type {?} */
var alignColumnsInlineCache = new Map();
/** @type {?} */
var inputs$1 = [
    'gdAlignColumns',
    'gdAlignColumns.xs', 'gdAlignColumns.sm', 'gdAlignColumns.md',
    'gdAlignColumns.lg', 'gdAlignColumns.xl', 'gdAlignColumns.lt-sm',
    'gdAlignColumns.lt-md', 'gdAlignColumns.lt-lg', 'gdAlignColumns.lt-xl',
    'gdAlignColumns.gt-xs', 'gdAlignColumns.gt-sm', 'gdAlignColumns.gt-md',
    'gdAlignColumns.gt-lg'
];
/** @type {?} */
var selector$1 = "\n  [gdAlignColumns],\n  [gdAlignColumns.xs], [gdAlignColumns.sm], [gdAlignColumns.md],\n  [gdAlignColumns.lg], [gdAlignColumns.xl], [gdAlignColumns.lt-sm],\n  [gdAlignColumns.lt-md], [gdAlignColumns.lt-lg], [gdAlignColumns.lt-xl],\n  [gdAlignColumns.gt-xs], [gdAlignColumns.gt-sm], [gdAlignColumns.gt-md],\n  [gdAlignColumns.gt-lg]\n";
/**
 * 'column alignment' CSS Grid styling directive
 * Configures the alignment in the column direction
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-19
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-21
 */
var DefaultGridAlignColumnsDirective = /** @class */ (function (_super) {
    __extends(DefaultGridAlignColumnsDirective, _super);
    function DefaultGridAlignColumnsDirective() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.inputs = inputs$1;
        return _this;
    }
    DefaultGridAlignColumnsDirective.decorators = [
        { type: core.Directive, args: [{ selector: selector$1, inputs: inputs$1 },] },
    ];
    return DefaultGridAlignColumnsDirective;
}(GridAlignColumnsDirective));
/**
 * @param {?} align
 * @param {?} inline
 * @return {?}
 */
function buildCss$1(align, inline) {
    /** @type {?} */
    var css = {};
    var _a = align.split(' '), mainAxis = _a[0], crossAxis = _a[1];
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
var DEFAULT_MAIN$1 = 'start';
/** @type {?} */
var DEFAULT_CROSS$1 = 'stretch';
var GridAlignRowsStyleBuilder = /** @class */ (function (_super) {
    __extends(GridAlignRowsStyleBuilder, _super);
    function GridAlignRowsStyleBuilder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * @param {?} input
     * @param {?} parent
     * @return {?}
     */
    GridAlignRowsStyleBuilder.prototype.buildStyles = /**
     * @param {?} input
     * @param {?} parent
     * @return {?}
     */
    function (input, parent) {
        return buildCss$2(input || DEFAULT_MAIN$1 + " " + DEFAULT_CROSS$1, parent.inline);
    };
    GridAlignRowsStyleBuilder.decorators = [
        { type: core.Injectable, args: [{ providedIn: 'root' },] },
    ];
    /** @nocollapse */ GridAlignRowsStyleBuilder.ngInjectableDef = core.defineInjectable({ factory: function GridAlignRowsStyleBuilder_Factory() { return new GridAlignRowsStyleBuilder(); }, token: GridAlignRowsStyleBuilder, providedIn: "root" });
    return GridAlignRowsStyleBuilder;
}(core$1.StyleBuilder));
var GridAlignRowsDirective = /** @class */ (function (_super) {
    __extends(GridAlignRowsDirective, _super);
    function GridAlignRowsDirective(elementRef, 
    // NOTE: not actually optional, but we need to force DI without a
    // constructor call
    styleBuilder, styler, marshal) {
        var _this = _super.call(this, elementRef, styleBuilder, styler, marshal) || this;
        _this.elementRef = elementRef;
        _this.styleBuilder = styleBuilder;
        _this.styler = styler;
        _this.marshal = marshal;
        _this.DIRECTIVE_KEY = 'grid-align-rows';
        _this._inline = false;
        _this.init();
        return _this;
    }
    Object.defineProperty(GridAlignRowsDirective.prototype, "inline", {
        get: /**
         * @return {?}
         */
        function () { return this._inline; },
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._inline = coercion.coerceBooleanProperty(val); },
        enumerable: true,
        configurable: true
    });
    // *********************************************
    // Protected methods
    // *********************************************
    /**
     * @param {?} value
     * @return {?}
     */
    GridAlignRowsDirective.prototype.updateWithValue = /**
     * @param {?} value
     * @return {?}
     */
    function (value) {
        this.styleCache = this.inline ? alignRowsInlineCache : alignRowsCache;
        this.addStyles(value, { inline: this.inline });
    };
    /** @nocollapse */
    GridAlignRowsDirective.ctorParameters = function () { return [
        { type: core.ElementRef },
        { type: GridAlignRowsStyleBuilder, decorators: [{ type: core.Optional }] },
        { type: core$1.StyleUtils },
        { type: core$1.MediaMarshaller }
    ]; };
    GridAlignRowsDirective.propDecorators = {
        inline: [{ type: core.Input, args: ['gdInline',] }]
    };
    return GridAlignRowsDirective;
}(core$1.BaseDirective2));
/** @type {?} */
var alignRowsCache = new Map();
/** @type {?} */
var alignRowsInlineCache = new Map();
/** @type {?} */
var inputs$2 = [
    'gdAlignRows',
    'gdAlignRows.xs', 'gdAlignRows.sm', 'gdAlignRows.md',
    'gdAlignRows.lg', 'gdAlignRows.xl', 'gdAlignRows.lt-sm',
    'gdAlignRows.lt-md', 'gdAlignRows.lt-lg', 'gdAlignRows.lt-xl',
    'gdAlignRows.gt-xs', 'gdAlignRows.gt-sm', 'gdAlignRows.gt-md',
    'gdAlignRows.gt-lg'
];
/** @type {?} */
var selector$2 = "\n  [gdAlignRows],\n  [gdAlignRows.xs], [gdAlignRows.sm], [gdAlignRows.md],\n  [gdAlignRows.lg], [gdAlignRows.xl], [gdAlignRows.lt-sm],\n  [gdAlignRows.lt-md], [gdAlignRows.lt-lg], [gdAlignRows.lt-xl],\n  [gdAlignRows.gt-xs], [gdAlignRows.gt-sm], [gdAlignRows.gt-md],\n  [gdAlignRows.gt-lg]\n";
/**
 * 'row alignment' CSS Grid styling directive
 * Configures the alignment in the row direction
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-18
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-20
 */
var DefaultGridAlignRowsDirective = /** @class */ (function (_super) {
    __extends(DefaultGridAlignRowsDirective, _super);
    function DefaultGridAlignRowsDirective() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.inputs = inputs$2;
        return _this;
    }
    DefaultGridAlignRowsDirective.decorators = [
        { type: core.Directive, args: [{ selector: selector$2, inputs: inputs$2 },] },
    ];
    return DefaultGridAlignRowsDirective;
}(GridAlignRowsDirective));
/**
 * @param {?} align
 * @param {?} inline
 * @return {?}
 */
function buildCss$2(align, inline) {
    /** @type {?} */
    var css = {};
    var _a = align.split(' '), mainAxis = _a[0], crossAxis = _a[1];
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
var DEFAULT_VALUE = 'auto';
var GridAreaStyleBuilder = /** @class */ (function (_super) {
    __extends(GridAreaStyleBuilder, _super);
    function GridAreaStyleBuilder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * @param {?} input
     * @return {?}
     */
    GridAreaStyleBuilder.prototype.buildStyles = /**
     * @param {?} input
     * @return {?}
     */
    function (input) {
        return { 'grid-area': input || DEFAULT_VALUE };
    };
    GridAreaStyleBuilder.decorators = [
        { type: core.Injectable, args: [{ providedIn: 'root' },] },
    ];
    /** @nocollapse */ GridAreaStyleBuilder.ngInjectableDef = core.defineInjectable({ factory: function GridAreaStyleBuilder_Factory() { return new GridAreaStyleBuilder(); }, token: GridAreaStyleBuilder, providedIn: "root" });
    return GridAreaStyleBuilder;
}(core$1.StyleBuilder));
var GridAreaDirective = /** @class */ (function (_super) {
    __extends(GridAreaDirective, _super);
    function GridAreaDirective(elRef, styleUtils, 
    // NOTE: not actually optional, but we need to force DI without a
    // constructor call
    styleBuilder, marshal) {
        var _this = _super.call(this, elRef, styleBuilder, styleUtils, marshal) || this;
        _this.elRef = elRef;
        _this.styleUtils = styleUtils;
        _this.styleBuilder = styleBuilder;
        _this.marshal = marshal;
        _this.DIRECTIVE_KEY = 'grid-area';
        _this.styleCache = gridAreaCache;
        _this.init();
        return _this;
    }
    /** @nocollapse */
    GridAreaDirective.ctorParameters = function () { return [
        { type: core.ElementRef },
        { type: core$1.StyleUtils },
        { type: GridAreaStyleBuilder, decorators: [{ type: core.Optional }] },
        { type: core$1.MediaMarshaller }
    ]; };
    return GridAreaDirective;
}(core$1.BaseDirective2));
/** @type {?} */
var gridAreaCache = new Map();
/** @type {?} */
var inputs$3 = [
    'gdArea',
    'gdArea.xs', 'gdArea.sm', 'gdArea.md', 'gdArea.lg', 'gdArea.xl',
    'gdArea.lt-sm', 'gdArea.lt-md', 'gdArea.lt-lg', 'gdArea.lt-xl',
    'gdArea.gt-xs', 'gdArea.gt-sm', 'gdArea.gt-md', 'gdArea.gt-lg'
];
/** @type {?} */
var selector$3 = "\n  [gdArea],\n  [gdArea.xs], [gdArea.sm], [gdArea.md], [gdArea.lg], [gdArea.xl],\n  [gdArea.lt-sm], [gdArea.lt-md], [gdArea.lt-lg], [gdArea.lt-xl],\n  [gdArea.gt-xs], [gdArea.gt-sm], [gdArea.gt-md], [gdArea.gt-lg]\n";
/**
 * 'grid-area' CSS Grid styling directive
 * Configures the name or position of an element within the grid
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-27
 */
var DefaultGridAreaDirective = /** @class */ (function (_super) {
    __extends(DefaultGridAreaDirective, _super);
    function DefaultGridAreaDirective() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.inputs = inputs$3;
        return _this;
    }
    DefaultGridAreaDirective.decorators = [
        { type: core.Directive, args: [{ selector: selector$3, inputs: inputs$3 },] },
    ];
    return DefaultGridAreaDirective;
}(GridAreaDirective));

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
var DEFAULT_VALUE$1 = 'none';
/** @type {?} */
var DELIMETER = '|';
var GridAreasStyleBuiler = /** @class */ (function (_super) {
    __extends(GridAreasStyleBuiler, _super);
    function GridAreasStyleBuiler() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * @param {?} input
     * @param {?} parent
     * @return {?}
     */
    GridAreasStyleBuiler.prototype.buildStyles = /**
     * @param {?} input
     * @param {?} parent
     * @return {?}
     */
    function (input, parent) {
        /** @type {?} */
        var areas = (input || DEFAULT_VALUE$1).split(DELIMETER).map(function (v) { return "\"" + v.trim() + "\""; });
        return {
            'display': parent.inline ? 'inline-grid' : 'grid',
            'grid-template-areas': areas.join(' ')
        };
    };
    GridAreasStyleBuiler.decorators = [
        { type: core.Injectable, args: [{ providedIn: 'root' },] },
    ];
    /** @nocollapse */ GridAreasStyleBuiler.ngInjectableDef = core.defineInjectable({ factory: function GridAreasStyleBuiler_Factory() { return new GridAreasStyleBuiler(); }, token: GridAreasStyleBuiler, providedIn: "root" });
    return GridAreasStyleBuiler;
}(core$1.StyleBuilder));
var GridAreasDirective = /** @class */ (function (_super) {
    __extends(GridAreasDirective, _super);
    function GridAreasDirective(elRef, styleUtils, 
    // NOTE: not actually optional, but we need to force DI without a
    // constructor call
    styleBuilder, marshal) {
        var _this = _super.call(this, elRef, styleBuilder, styleUtils, marshal) || this;
        _this.elRef = elRef;
        _this.styleUtils = styleUtils;
        _this.styleBuilder = styleBuilder;
        _this.marshal = marshal;
        _this.DIRECTIVE_KEY = 'grid-areas';
        _this._inline = false;
        _this.init();
        return _this;
    }
    Object.defineProperty(GridAreasDirective.prototype, "inline", {
        get: /**
         * @return {?}
         */
        function () { return this._inline; },
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._inline = coercion.coerceBooleanProperty(val); },
        enumerable: true,
        configurable: true
    });
    // *********************************************
    // Protected methods
    // *********************************************
    /**
     * @param {?} value
     * @return {?}
     */
    GridAreasDirective.prototype.updateWithValue = /**
     * @param {?} value
     * @return {?}
     */
    function (value) {
        this.styleCache = this.inline ? areasInlineCache : areasCache;
        this.addStyles(value, { inline: this.inline });
    };
    /** @nocollapse */
    GridAreasDirective.ctorParameters = function () { return [
        { type: core.ElementRef },
        { type: core$1.StyleUtils },
        { type: GridAreasStyleBuiler, decorators: [{ type: core.Optional }] },
        { type: core$1.MediaMarshaller }
    ]; };
    GridAreasDirective.propDecorators = {
        inline: [{ type: core.Input, args: ['gdInline',] }]
    };
    return GridAreasDirective;
}(core$1.BaseDirective2));
/** @type {?} */
var areasCache = new Map();
/** @type {?} */
var areasInlineCache = new Map();
/** @type {?} */
var inputs$4 = [
    'gdAreas',
    'gdAreas.xs', 'gdAreas.sm', 'gdAreas.md', 'gdAreas.lg', 'gdAreas.xl',
    'gdAreas.lt-sm', 'gdAreas.lt-md', 'gdAreas.lt-lg', 'gdAreas.lt-xl',
    'gdAreas.gt-xs', 'gdAreas.gt-sm', 'gdAreas.gt-md', 'gdAreas.gt-lg'
];
/** @type {?} */
var selector$4 = "\n  [gdAreas],\n  [gdAreas.xs], [gdAreas.sm], [gdAreas.md], [gdAreas.lg], [gdAreas.xl],\n  [gdAreas.lt-sm], [gdAreas.lt-md], [gdAreas.lt-lg], [gdAreas.lt-xl],\n  [gdAreas.gt-xs], [gdAreas.gt-sm], [gdAreas.gt-md], [gdAreas.gt-lg]\n";
/**
 * 'grid-template-areas' CSS Grid styling directive
 * Configures the names of elements within the grid
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-14
 */
var DefaultGridAreasDirective = /** @class */ (function (_super) {
    __extends(DefaultGridAreasDirective, _super);
    function DefaultGridAreasDirective() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.inputs = inputs$4;
        return _this;
    }
    DefaultGridAreasDirective.decorators = [
        { type: core.Directive, args: [{ selector: selector$4, inputs: inputs$4 },] },
    ];
    return DefaultGridAreasDirective;
}(GridAreasDirective));

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
var DEFAULT_VALUE$2 = 'initial';
var GridAutoStyleBuilder = /** @class */ (function (_super) {
    __extends(GridAutoStyleBuilder, _super);
    function GridAutoStyleBuilder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * @param {?} input
     * @param {?} parent
     * @return {?}
     */
    GridAutoStyleBuilder.prototype.buildStyles = /**
     * @param {?} input
     * @param {?} parent
     * @return {?}
     */
    function (input, parent) {
        var _a = (input || DEFAULT_VALUE$2).split(' '), direction = _a[0], dense = _a[1];
        if (direction !== 'column' && direction !== 'row' && direction !== 'dense') {
            direction = 'row';
        }
        dense = (dense === 'dense' && direction !== 'dense') ? ' dense' : '';
        return {
            'display': parent.inline ? 'inline-grid' : 'grid',
            'grid-auto-flow': direction + dense
        };
    };
    GridAutoStyleBuilder.decorators = [
        { type: core.Injectable, args: [{ providedIn: 'root' },] },
    ];
    /** @nocollapse */ GridAutoStyleBuilder.ngInjectableDef = core.defineInjectable({ factory: function GridAutoStyleBuilder_Factory() { return new GridAutoStyleBuilder(); }, token: GridAutoStyleBuilder, providedIn: "root" });
    return GridAutoStyleBuilder;
}(core$1.StyleBuilder));
var GridAutoDirective = /** @class */ (function (_super) {
    __extends(GridAutoDirective, _super);
    function GridAutoDirective(elementRef, 
    // NOTE: not actually optional, but we need to force DI without a
    // constructor call
    styleBuilder, styler, marshal) {
        var _this = _super.call(this, elementRef, styleBuilder, styler, marshal) || this;
        _this.elementRef = elementRef;
        _this.styleBuilder = styleBuilder;
        _this.styler = styler;
        _this.marshal = marshal;
        _this._inline = false;
        _this.DIRECTIVE_KEY = 'grid-auto';
        _this.init();
        return _this;
    }
    Object.defineProperty(GridAutoDirective.prototype, "inline", {
        get: /**
         * @return {?}
         */
        function () { return this._inline; },
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._inline = coercion.coerceBooleanProperty(val); },
        enumerable: true,
        configurable: true
    });
    // *********************************************
    // Protected methods
    // *********************************************
    /**
     * @param {?} value
     * @return {?}
     */
    GridAutoDirective.prototype.updateWithValue = /**
     * @param {?} value
     * @return {?}
     */
    function (value) {
        this.styleCache = this.inline ? autoInlineCache : autoCache;
        this.addStyles(value, { inline: this.inline });
    };
    /** @nocollapse */
    GridAutoDirective.ctorParameters = function () { return [
        { type: core.ElementRef },
        { type: GridAutoStyleBuilder, decorators: [{ type: core.Optional }] },
        { type: core$1.StyleUtils },
        { type: core$1.MediaMarshaller }
    ]; };
    GridAutoDirective.propDecorators = {
        inline: [{ type: core.Input, args: ['gdInline',] }]
    };
    return GridAutoDirective;
}(core$1.BaseDirective2));
/** @type {?} */
var autoCache = new Map();
/** @type {?} */
var autoInlineCache = new Map();
/** @type {?} */
var inputs$5 = [
    'gdAuto',
    'gdAuto.xs', 'gdAuto.sm', 'gdAuto.md', 'gdAuto.lg', 'gdAuto.xl',
    'gdAuto.lt-sm', 'gdAuto.lt-md', 'gdAuto.lt-lg', 'gdAuto.lt-xl',
    'gdAuto.gt-xs', 'gdAuto.gt-sm', 'gdAuto.gt-md', 'gdAuto.gt-lg'
];
/** @type {?} */
var selector$5 = "\n  [gdAuto],\n  [gdAuto.xs], [gdAuto.sm], [gdAuto.md], [gdAuto.lg], [gdAuto.xl],\n  [gdAuto.lt-sm], [gdAuto.lt-md], [gdAuto.lt-lg], [gdAuto.lt-xl],\n  [gdAuto.gt-xs], [gdAuto.gt-sm], [gdAuto.gt-md], [gdAuto.gt-lg]\n";
/**
 * 'grid-auto-flow' CSS Grid styling directive
 * Configures the auto placement algorithm for the grid
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-23
 */
var DefaultGridAutoDirective = /** @class */ (function (_super) {
    __extends(DefaultGridAutoDirective, _super);
    function DefaultGridAutoDirective() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.inputs = inputs$5;
        return _this;
    }
    DefaultGridAutoDirective.decorators = [
        { type: core.Directive, args: [{ selector: selector$5, inputs: inputs$5 },] },
    ];
    return DefaultGridAutoDirective;
}(GridAutoDirective));

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
var DEFAULT_VALUE$3 = 'auto';
var GridColumnStyleBuilder = /** @class */ (function (_super) {
    __extends(GridColumnStyleBuilder, _super);
    function GridColumnStyleBuilder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * @param {?} input
     * @return {?}
     */
    GridColumnStyleBuilder.prototype.buildStyles = /**
     * @param {?} input
     * @return {?}
     */
    function (input) {
        return { 'grid-column': input || DEFAULT_VALUE$3 };
    };
    GridColumnStyleBuilder.decorators = [
        { type: core.Injectable, args: [{ providedIn: 'root' },] },
    ];
    /** @nocollapse */ GridColumnStyleBuilder.ngInjectableDef = core.defineInjectable({ factory: function GridColumnStyleBuilder_Factory() { return new GridColumnStyleBuilder(); }, token: GridColumnStyleBuilder, providedIn: "root" });
    return GridColumnStyleBuilder;
}(core$1.StyleBuilder));
var GridColumnDirective = /** @class */ (function (_super) {
    __extends(GridColumnDirective, _super);
    function GridColumnDirective(elementRef, 
    // NOTE: not actually optional, but we need to force DI without a
    // constructor call
    styleBuilder, styler, marshal) {
        var _this = _super.call(this, elementRef, styleBuilder, styler, marshal) || this;
        _this.elementRef = elementRef;
        _this.styleBuilder = styleBuilder;
        _this.styler = styler;
        _this.marshal = marshal;
        _this.DIRECTIVE_KEY = 'grid-column';
        _this.styleCache = columnCache;
        _this.init();
        return _this;
    }
    /** @nocollapse */
    GridColumnDirective.ctorParameters = function () { return [
        { type: core.ElementRef },
        { type: GridColumnStyleBuilder, decorators: [{ type: core.Optional }] },
        { type: core$1.StyleUtils },
        { type: core$1.MediaMarshaller }
    ]; };
    return GridColumnDirective;
}(core$1.BaseDirective2));
/** @type {?} */
var columnCache = new Map();
/** @type {?} */
var inputs$6 = [
    'gdColumn',
    'gdColumn.xs', 'gdColumn.sm', 'gdColumn.md', 'gdColumn.lg', 'gdColumn.xl',
    'gdColumn.lt-sm', 'gdColumn.lt-md', 'gdColumn.lt-lg', 'gdColumn.lt-xl',
    'gdColumn.gt-xs', 'gdColumn.gt-sm', 'gdColumn.gt-md', 'gdColumn.gt-lg'
];
/** @type {?} */
var selector$6 = "\n  [gdColumn],\n  [gdColumn.xs], [gdColumn.sm], [gdColumn.md], [gdColumn.lg], [gdColumn.xl],\n  [gdColumn.lt-sm], [gdColumn.lt-md], [gdColumn.lt-lg], [gdColumn.lt-xl],\n  [gdColumn.gt-xs], [gdColumn.gt-sm], [gdColumn.gt-md], [gdColumn.gt-lg]\n";
/**
 * 'grid-column' CSS Grid styling directive
 * Configures the name or position of an element within the grid
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-26
 */
var DefaultGridColumnDirective = /** @class */ (function (_super) {
    __extends(DefaultGridColumnDirective, _super);
    function DefaultGridColumnDirective() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.inputs = inputs$6;
        return _this;
    }
    DefaultGridColumnDirective.decorators = [
        { type: core.Directive, args: [{ selector: selector$6, inputs: inputs$6 },] },
    ];
    return DefaultGridColumnDirective;
}(GridColumnDirective));

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
var DEFAULT_VALUE$4 = 'none';
/** @type {?} */
var AUTO_SPECIFIER = '!';
var GridColumnsStyleBuilder = /** @class */ (function (_super) {
    __extends(GridColumnsStyleBuilder, _super);
    function GridColumnsStyleBuilder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * @param {?} input
     * @param {?} parent
     * @return {?}
     */
    GridColumnsStyleBuilder.prototype.buildStyles = /**
     * @param {?} input
     * @param {?} parent
     * @return {?}
     */
    function (input, parent) {
        input = input || DEFAULT_VALUE$4;
        /** @type {?} */
        var auto = false;
        if (input.endsWith(AUTO_SPECIFIER)) {
            input = input.substring(0, input.indexOf(AUTO_SPECIFIER));
            auto = true;
        }
        /** @type {?} */
        var css = {
            'display': parent.inline ? 'inline-grid' : 'grid',
            'grid-auto-columns': '',
            'grid-template-columns': '',
        };
        /** @type {?} */
        var key = (auto ? 'grid-auto-columns' : 'grid-template-columns');
        css[key] = input;
        return css;
    };
    GridColumnsStyleBuilder.decorators = [
        { type: core.Injectable, args: [{ providedIn: 'root' },] },
    ];
    /** @nocollapse */ GridColumnsStyleBuilder.ngInjectableDef = core.defineInjectable({ factory: function GridColumnsStyleBuilder_Factory() { return new GridColumnsStyleBuilder(); }, token: GridColumnsStyleBuilder, providedIn: "root" });
    return GridColumnsStyleBuilder;
}(core$1.StyleBuilder));
var GridColumnsDirective = /** @class */ (function (_super) {
    __extends(GridColumnsDirective, _super);
    function GridColumnsDirective(elementRef, 
    // NOTE: not actually optional, but we need to force DI without a
    // constructor call
    styleBuilder, styler, marshal) {
        var _this = _super.call(this, elementRef, styleBuilder, styler, marshal) || this;
        _this.elementRef = elementRef;
        _this.styleBuilder = styleBuilder;
        _this.styler = styler;
        _this.marshal = marshal;
        _this.DIRECTIVE_KEY = 'grid-columns';
        _this._inline = false;
        _this.init();
        return _this;
    }
    Object.defineProperty(GridColumnsDirective.prototype, "inline", {
        get: /**
         * @return {?}
         */
        function () { return this._inline; },
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._inline = coercion.coerceBooleanProperty(val); },
        enumerable: true,
        configurable: true
    });
    // *********************************************
    // Protected methods
    // *********************************************
    /**
     * @param {?} value
     * @return {?}
     */
    GridColumnsDirective.prototype.updateWithValue = /**
     * @param {?} value
     * @return {?}
     */
    function (value) {
        this.styleCache = this.inline ? columnsInlineCache : columnsCache;
        this.addStyles(value, { inline: this.inline });
    };
    /** @nocollapse */
    GridColumnsDirective.ctorParameters = function () { return [
        { type: core.ElementRef },
        { type: GridColumnsStyleBuilder, decorators: [{ type: core.Optional }] },
        { type: core$1.StyleUtils },
        { type: core$1.MediaMarshaller }
    ]; };
    GridColumnsDirective.propDecorators = {
        inline: [{ type: core.Input, args: ['gdInline',] }]
    };
    return GridColumnsDirective;
}(core$1.BaseDirective2));
/** @type {?} */
var columnsCache = new Map();
/** @type {?} */
var columnsInlineCache = new Map();
/** @type {?} */
var inputs$7 = [
    'gdColumns',
    'gdColumns.xs', 'gdColumns.sm', 'gdColumns.md', 'gdColumns.lg', 'gdColumns.xl',
    'gdColumns.lt-sm', 'gdColumns.lt-md', 'gdColumns.lt-lg', 'gdColumns.lt-xl',
    'gdColumns.gt-xs', 'gdColumns.gt-sm', 'gdColumns.gt-md', 'gdColumns.gt-lg'
];
/** @type {?} */
var selector$7 = "\n  [gdColumns],\n  [gdColumns.xs], [gdColumns.sm], [gdColumns.md], [gdColumns.lg], [gdColumns.xl],\n  [gdColumns.lt-sm], [gdColumns.lt-md], [gdColumns.lt-lg], [gdColumns.lt-xl],\n  [gdColumns.gt-xs], [gdColumns.gt-sm], [gdColumns.gt-md], [gdColumns.gt-lg]\n";
/**
 * 'grid-template-columns' CSS Grid styling directive
 * Configures the sizing for the columns in the grid
 * Syntax: <column value> [auto]
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-13
 */
var DefaultGridColumnsDirective = /** @class */ (function (_super) {
    __extends(DefaultGridColumnsDirective, _super);
    function DefaultGridColumnsDirective() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.inputs = inputs$7;
        return _this;
    }
    DefaultGridColumnsDirective.decorators = [
        { type: core.Directive, args: [{ selector: selector$7, inputs: inputs$7 },] },
    ];
    return DefaultGridColumnsDirective;
}(GridColumnsDirective));

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
var DEFAULT_VALUE$5 = '0';
var GridGapStyleBuilder = /** @class */ (function (_super) {
    __extends(GridGapStyleBuilder, _super);
    function GridGapStyleBuilder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * @param {?} input
     * @param {?} parent
     * @return {?}
     */
    GridGapStyleBuilder.prototype.buildStyles = /**
     * @param {?} input
     * @param {?} parent
     * @return {?}
     */
    function (input, parent) {
        return {
            'display': parent.inline ? 'inline-grid' : 'grid',
            'grid-gap': input || DEFAULT_VALUE$5
        };
    };
    GridGapStyleBuilder.decorators = [
        { type: core.Injectable, args: [{ providedIn: 'root' },] },
    ];
    /** @nocollapse */ GridGapStyleBuilder.ngInjectableDef = core.defineInjectable({ factory: function GridGapStyleBuilder_Factory() { return new GridGapStyleBuilder(); }, token: GridGapStyleBuilder, providedIn: "root" });
    return GridGapStyleBuilder;
}(core$1.StyleBuilder));
var GridGapDirective = /** @class */ (function (_super) {
    __extends(GridGapDirective, _super);
    function GridGapDirective(elRef, styleUtils, 
    // NOTE: not actually optional, but we need to force DI without a
    // constructor call
    styleBuilder, marshal) {
        var _this = _super.call(this, elRef, styleBuilder, styleUtils, marshal) || this;
        _this.elRef = elRef;
        _this.styleUtils = styleUtils;
        _this.styleBuilder = styleBuilder;
        _this.marshal = marshal;
        _this.DIRECTIVE_KEY = 'grid-gap';
        _this._inline = false;
        _this.init();
        return _this;
    }
    Object.defineProperty(GridGapDirective.prototype, "inline", {
        get: /**
         * @return {?}
         */
        function () { return this._inline; },
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._inline = coercion.coerceBooleanProperty(val); },
        enumerable: true,
        configurable: true
    });
    // *********************************************
    // Protected methods
    // *********************************************
    /**
     * @param {?} value
     * @return {?}
     */
    GridGapDirective.prototype.updateWithValue = /**
     * @param {?} value
     * @return {?}
     */
    function (value) {
        this.styleCache = this.inline ? gapInlineCache : gapCache;
        this.addStyles(value, { inline: this.inline });
    };
    /** @nocollapse */
    GridGapDirective.ctorParameters = function () { return [
        { type: core.ElementRef },
        { type: core$1.StyleUtils },
        { type: GridGapStyleBuilder, decorators: [{ type: core.Optional }] },
        { type: core$1.MediaMarshaller }
    ]; };
    GridGapDirective.propDecorators = {
        inline: [{ type: core.Input, args: ['gdInline',] }]
    };
    return GridGapDirective;
}(core$1.BaseDirective2));
/** @type {?} */
var gapCache = new Map();
/** @type {?} */
var gapInlineCache = new Map();
/** @type {?} */
var inputs$8 = [
    'gdGap',
    'gdGap.xs', 'gdGap.sm', 'gdGap.md', 'gdGap.lg', 'gdGap.xl',
    'gdGap.lt-sm', 'gdGap.lt-md', 'gdGap.lt-lg', 'gdGap.lt-xl',
    'gdGap.gt-xs', 'gdGap.gt-sm', 'gdGap.gt-md', 'gdGap.gt-lg'
];
/** @type {?} */
var selector$8 = "\n  [gdGap],\n  [gdGap.xs], [gdGap.sm], [gdGap.md], [gdGap.lg], [gdGap.xl],\n  [gdGap.lt-sm], [gdGap.lt-md], [gdGap.lt-lg], [gdGap.lt-xl],\n  [gdGap.gt-xs], [gdGap.gt-sm], [gdGap.gt-md], [gdGap.gt-lg]\n";
/**
 * 'grid-gap' CSS Grid styling directive
 * Configures the gap between items in the grid
 * Syntax: <row gap> [<column-gap>]
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-17
 */
var DefaultGridGapDirective = /** @class */ (function (_super) {
    __extends(DefaultGridGapDirective, _super);
    function DefaultGridGapDirective() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.inputs = inputs$8;
        return _this;
    }
    DefaultGridGapDirective.decorators = [
        { type: core.Directive, args: [{ selector: selector$8, inputs: inputs$8 },] },
    ];
    return DefaultGridGapDirective;
}(GridGapDirective));

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
var DEFAULT_VALUE$6 = 'auto';
var GridRowStyleBuilder = /** @class */ (function (_super) {
    __extends(GridRowStyleBuilder, _super);
    function GridRowStyleBuilder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * @param {?} input
     * @return {?}
     */
    GridRowStyleBuilder.prototype.buildStyles = /**
     * @param {?} input
     * @return {?}
     */
    function (input) {
        return { 'grid-row': input || DEFAULT_VALUE$6 };
    };
    GridRowStyleBuilder.decorators = [
        { type: core.Injectable, args: [{ providedIn: 'root' },] },
    ];
    /** @nocollapse */ GridRowStyleBuilder.ngInjectableDef = core.defineInjectable({ factory: function GridRowStyleBuilder_Factory() { return new GridRowStyleBuilder(); }, token: GridRowStyleBuilder, providedIn: "root" });
    return GridRowStyleBuilder;
}(core$1.StyleBuilder));
var GridRowDirective = /** @class */ (function (_super) {
    __extends(GridRowDirective, _super);
    function GridRowDirective(elementRef, 
    // NOTE: not actually optional, but we need to force DI without a
    // constructor call
    styleBuilder, styler, marshal) {
        var _this = _super.call(this, elementRef, styleBuilder, styler, marshal) || this;
        _this.elementRef = elementRef;
        _this.styleBuilder = styleBuilder;
        _this.styler = styler;
        _this.marshal = marshal;
        _this.DIRECTIVE_KEY = 'grid-row';
        _this.styleCache = rowCache;
        _this.init();
        return _this;
    }
    /** @nocollapse */
    GridRowDirective.ctorParameters = function () { return [
        { type: core.ElementRef },
        { type: GridRowStyleBuilder, decorators: [{ type: core.Optional }] },
        { type: core$1.StyleUtils },
        { type: core$1.MediaMarshaller }
    ]; };
    return GridRowDirective;
}(core$1.BaseDirective2));
/** @type {?} */
var rowCache = new Map();
/** @type {?} */
var inputs$9 = [
    'gdRow',
    'gdRow.xs', 'gdRow.sm', 'gdRow.md', 'gdRow.lg', 'gdRow.xl',
    'gdRow.lt-sm', 'gdRow.lt-md', 'gdRow.lt-lg', 'gdRow.lt-xl',
    'gdRow.gt-xs', 'gdRow.gt-sm', 'gdRow.gt-md', 'gdRow.gt-lg'
];
/** @type {?} */
var selector$9 = "\n  [gdRow],\n  [gdRow.xs], [gdRow.sm], [gdRow.md], [gdRow.lg], [gdRow.xl],\n  [gdRow.lt-sm], [gdRow.lt-md], [gdRow.lt-lg], [gdRow.lt-xl],\n  [gdRow.gt-xs], [gdRow.gt-sm], [gdRow.gt-md], [gdRow.gt-lg]\n";
/**
 * 'grid-row' CSS Grid styling directive
 * Configures the name or position of an element within the grid
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-26
 */
var DefaultGridRowDirective = /** @class */ (function (_super) {
    __extends(DefaultGridRowDirective, _super);
    function DefaultGridRowDirective() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.inputs = inputs$9;
        return _this;
    }
    DefaultGridRowDirective.decorators = [
        { type: core.Directive, args: [{ selector: selector$9, inputs: inputs$9 },] },
    ];
    return DefaultGridRowDirective;
}(GridRowDirective));

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
var DEFAULT_VALUE$7 = 'none';
/** @type {?} */
var AUTO_SPECIFIER$1 = '!';
var GridRowsStyleBuilder = /** @class */ (function (_super) {
    __extends(GridRowsStyleBuilder, _super);
    function GridRowsStyleBuilder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * @param {?} input
     * @param {?} parent
     * @return {?}
     */
    GridRowsStyleBuilder.prototype.buildStyles = /**
     * @param {?} input
     * @param {?} parent
     * @return {?}
     */
    function (input, parent) {
        input = input || DEFAULT_VALUE$7;
        /** @type {?} */
        var auto = false;
        if (input.endsWith(AUTO_SPECIFIER$1)) {
            input = input.substring(0, input.indexOf(AUTO_SPECIFIER$1));
            auto = true;
        }
        /** @type {?} */
        var css = {
            'display': parent.inline ? 'inline-grid' : 'grid',
            'grid-auto-rows': '',
            'grid-template-rows': '',
        };
        /** @type {?} */
        var key = (auto ? 'grid-auto-rows' : 'grid-template-rows');
        css[key] = input;
        return css;
    };
    GridRowsStyleBuilder.decorators = [
        { type: core.Injectable, args: [{ providedIn: 'root' },] },
    ];
    /** @nocollapse */ GridRowsStyleBuilder.ngInjectableDef = core.defineInjectable({ factory: function GridRowsStyleBuilder_Factory() { return new GridRowsStyleBuilder(); }, token: GridRowsStyleBuilder, providedIn: "root" });
    return GridRowsStyleBuilder;
}(core$1.StyleBuilder));
var GridRowsDirective = /** @class */ (function (_super) {
    __extends(GridRowsDirective, _super);
    function GridRowsDirective(elementRef, 
    // NOTE: not actually optional, but we need to force DI without a
    // constructor call
    styleBuilder, styler, marshal) {
        var _this = _super.call(this, elementRef, styleBuilder, styler, marshal) || this;
        _this.elementRef = elementRef;
        _this.styleBuilder = styleBuilder;
        _this.styler = styler;
        _this.marshal = marshal;
        _this.DIRECTIVE_KEY = 'grid-rows';
        _this._inline = false;
        _this.init();
        return _this;
    }
    Object.defineProperty(GridRowsDirective.prototype, "inline", {
        get: /**
         * @return {?}
         */
        function () { return this._inline; },
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._inline = coercion.coerceBooleanProperty(val); },
        enumerable: true,
        configurable: true
    });
    // *********************************************
    // Protected methods
    // *********************************************
    /**
     * @param {?} value
     * @return {?}
     */
    GridRowsDirective.prototype.updateWithValue = /**
     * @param {?} value
     * @return {?}
     */
    function (value) {
        this.styleCache = this.inline ? rowsInlineCache : rowsCache;
        this.addStyles(value, { inline: this.inline });
    };
    /** @nocollapse */
    GridRowsDirective.ctorParameters = function () { return [
        { type: core.ElementRef },
        { type: GridRowsStyleBuilder, decorators: [{ type: core.Optional }] },
        { type: core$1.StyleUtils },
        { type: core$1.MediaMarshaller }
    ]; };
    GridRowsDirective.propDecorators = {
        inline: [{ type: core.Input, args: ['gdInline',] }]
    };
    return GridRowsDirective;
}(core$1.BaseDirective2));
/** @type {?} */
var rowsCache = new Map();
/** @type {?} */
var rowsInlineCache = new Map();
/** @type {?} */
var inputs$10 = [
    'gdRows',
    'gdRows.xs', 'gdRows.sm', 'gdRows.md', 'gdRows.lg', 'gdRows.xl',
    'gdRows.lt-sm', 'gdRows.lt-md', 'gdRows.lt-lg', 'gdRows.lt-xl',
    'gdRows.gt-xs', 'gdRows.gt-sm', 'gdRows.gt-md', 'gdRows.gt-lg'
];
/** @type {?} */
var selector$10 = "\n  [gdRows],\n  [gdRows.xs], [gdRows.sm], [gdRows.md], [gdRows.lg], [gdRows.xl],\n  [gdRows.lt-sm], [gdRows.lt-md], [gdRows.lt-lg], [gdRows.lt-xl],\n  [gdRows.gt-xs], [gdRows.gt-sm], [gdRows.gt-md], [gdRows.gt-lg]\n";
/**
 * 'grid-template-rows' CSS Grid styling directive
 * Configures the sizing for the rows in the grid
 * Syntax: <column value> [auto]
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-13
 */
var DefaultGridRowsDirective = /** @class */ (function (_super) {
    __extends(DefaultGridRowsDirective, _super);
    function DefaultGridRowsDirective() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.inputs = inputs$10;
        return _this;
    }
    DefaultGridRowsDirective.decorators = [
        { type: core.Directive, args: [{ selector: selector$10, inputs: inputs$10 },] },
    ];
    return DefaultGridRowsDirective;
}(GridRowsDirective));

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
var ALL_DIRECTIVES = [
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
var GridModule = /** @class */ (function () {
    function GridModule() {
    }
    GridModule.decorators = [
        { type: core.NgModule, args: [{
                    imports: [core$1.CoreModule],
                    declarations: ALL_DIRECTIVES.slice(),
                    exports: ALL_DIRECTIVES.slice()
                },] },
    ];
    return GridModule;
}());

exports.GridModule = GridModule;
exports.ɵf1 = DefaultGridAlignColumnsDirective;
exports.ɵe1 = GridAlignColumnsDirective;
exports.ɵd1 = GridAlignColumnsStyleBuilder;
exports.ɵi1 = DefaultGridAlignRowsDirective;
exports.ɵh1 = GridAlignRowsDirective;
exports.ɵg1 = GridAlignRowsStyleBuilder;
exports.ɵl1 = DefaultGridAreaDirective;
exports.ɵk1 = GridAreaDirective;
exports.ɵj1 = GridAreaStyleBuilder;
exports.ɵo1 = DefaultGridAreasDirective;
exports.ɵn1 = GridAreasDirective;
exports.ɵm1 = GridAreasStyleBuiler;
exports.ɵr1 = DefaultGridAutoDirective;
exports.ɵq1 = GridAutoDirective;
exports.ɵp1 = GridAutoStyleBuilder;
exports.ɵu1 = DefaultGridColumnDirective;
exports.ɵt1 = GridColumnDirective;
exports.ɵs1 = GridColumnStyleBuilder;
exports.ɵx1 = DefaultGridColumnsDirective;
exports.ɵw1 = GridColumnsDirective;
exports.ɵv1 = GridColumnsStyleBuilder;
exports.ɵba1 = DefaultGridGapDirective;
exports.ɵz1 = GridGapDirective;
exports.ɵy1 = GridGapStyleBuilder;
exports.ɵc1 = DefaultGridAlignDirective;
exports.ɵb1 = GridAlignDirective;
exports.ɵa1 = GridAlignStyleBuilder;
exports.ɵbd1 = DefaultGridRowDirective;
exports.ɵbc1 = GridRowDirective;
exports.ɵbb1 = GridRowStyleBuilder;
exports.ɵbg1 = DefaultGridRowsDirective;
exports.ɵbf1 = GridRowsDirective;
exports.ɵbe1 = GridRowsStyleBuilder;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=flex-layout-grid.umd.js.map
