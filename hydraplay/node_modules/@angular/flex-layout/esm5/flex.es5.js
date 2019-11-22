/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __extends, __assign } from 'tslib';
import { Directive, ElementRef, Injectable, Optional, NgModule, NgZone, Inject, Input, defineInjectable, inject } from '@angular/core';
import { BaseDirective2, StyleBuilder, StyleUtils, MediaMarshaller, CoreModule, LAYOUT_CONFIG, validateBasis } from '@angular/flex-layout/core';
import { Directionality, BidiModule } from '@angular/cdk/bidi';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** *
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
  @type {?} */
var INLINE = 'inline';
/** @type {?} */
var LAYOUT_VALUES = ['row', 'column', 'row-reverse', 'column-reverse'];
/**
 * Validate the direction|'direction wrap' value and then update the host's inline flexbox styles
 * @param {?} value
 * @return {?}
 */
function buildLayoutCSS(value) {
    var _a = validateValue(value), direction = _a[0], wrap = _a[1], isInline = _a[2];
    return buildCSS(direction, wrap, isInline);
}
/**
 * Validate the value to be one of the acceptable value options
 * Use default fallback of 'row'
 * @param {?} value
 * @return {?}
 */
function validateValue(value) {
    value = value ? value.toLowerCase() : '';
    var _a = value.split(' '), direction = _a[0], wrap = _a[1], inline = _a[2];
    // First value must be the `flex-direction`
    if (!LAYOUT_VALUES.find(function (x) { return x === direction; })) {
        direction = LAYOUT_VALUES[0];
    }
    if (wrap === INLINE) {
        wrap = (inline !== INLINE) ? inline : '';
        inline = INLINE;
    }
    return [direction, validateWrapValue(wrap), !!inline];
}
/**
 * Determine if the validated, flex-direction value specifies
 * a horizontal/row flow.
 * @param {?} value
 * @return {?}
 */
function isFlowHorizontal(value) {
    var flow = validateValue(value)[0];
    return flow.indexOf('row') > -1;
}
/**
 * Convert layout-wrap='<value>' to expected flex-wrap style
 * @param {?} value
 * @return {?}
 */
function validateWrapValue(value) {
    if (!!value) {
        switch (value.toLowerCase()) {
            case 'reverse':
            case 'wrap-reverse':
            case 'reverse-wrap':
                value = 'wrap-reverse';
                break;
            case 'no':
            case 'none':
            case 'nowrap':
                value = 'nowrap';
                break;
            // All other values fallback to 'wrap'
            default:
                value = 'wrap';
                break;
        }
    }
    return value;
}
/**
 * Build the CSS that should be assigned to the element instance
 * BUG:
 *   1) min-height on a column flex container won’t apply to its flex item children in IE 10-11.
 *      Use height instead if possible; height : <xxx>vh;
 *
 *  This way any padding or border specified on the child elements are
 *  laid out and drawn inside that element's specified width and height.
 * @param {?} direction
 * @param {?=} wrap
 * @param {?=} inline
 * @return {?}
 */
function buildCSS(direction, wrap, inline) {
    if (wrap === void 0) { wrap = null; }
    if (inline === void 0) { inline = false; }
    return {
        'display': inline ? 'inline-flex' : 'flex',
        'box-sizing': 'border-box',
        'flex-direction': direction,
        'flex-wrap': !!wrap ? wrap : null
    };
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
var LayoutStyleBuilder = /** @class */ (function (_super) {
    __extends(LayoutStyleBuilder, _super);
    function LayoutStyleBuilder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * @param {?} input
     * @return {?}
     */
    LayoutStyleBuilder.prototype.buildStyles = /**
     * @param {?} input
     * @return {?}
     */
    function (input) {
        return buildLayoutCSS(input);
    };
    LayoutStyleBuilder.decorators = [
        { type: Injectable, args: [{ providedIn: 'root' },] },
    ];
    /** @nocollapse */ LayoutStyleBuilder.ngInjectableDef = defineInjectable({ factory: function LayoutStyleBuilder_Factory() { return new LayoutStyleBuilder(); }, token: LayoutStyleBuilder, providedIn: "root" });
    return LayoutStyleBuilder;
}(StyleBuilder));
/** @type {?} */
var inputs = [
    'fxLayout', 'fxLayout.xs', 'fxLayout.sm', 'fxLayout.md',
    'fxLayout.lg', 'fxLayout.xl', 'fxLayout.lt-sm', 'fxLayout.lt-md',
    'fxLayout.lt-lg', 'fxLayout.lt-xl', 'fxLayout.gt-xs', 'fxLayout.gt-sm',
    'fxLayout.gt-md', 'fxLayout.gt-lg'
];
/** @type {?} */
var selector = "\n  [fxLayout], [fxLayout.xs], [fxLayout.sm], [fxLayout.md],\n  [fxLayout.lg], [fxLayout.xl], [fxLayout.lt-sm], [fxLayout.lt-md],\n  [fxLayout.lt-lg], [fxLayout.lt-xl], [fxLayout.gt-xs], [fxLayout.gt-sm],\n  [fxLayout.gt-md], [fxLayout.gt-lg]\n";
/**
 * 'layout' flexbox styling directive
 * Defines the positioning flow direction for the child elements: row or column
 * Optional values: column or row (default)
 * @see https://css-tricks.com/almanac/properties/f/flex-direction/
 *
 */
var LayoutDirective = /** @class */ (function (_super) {
    __extends(LayoutDirective, _super);
    function LayoutDirective(elRef, styleUtils, 
    // NOTE: not actually optional, but we need to force DI without a
    // constructor call
    styleBuilder, marshal) {
        var _this = _super.call(this, elRef, styleBuilder, styleUtils, marshal) || this;
        _this.elRef = elRef;
        _this.styleUtils = styleUtils;
        _this.styleBuilder = styleBuilder;
        _this.marshal = marshal;
        _this.DIRECTIVE_KEY = 'layout';
        _this.styleCache = layoutCache;
        _this.init();
        return _this;
    }
    /** @nocollapse */
    LayoutDirective.ctorParameters = function () { return [
        { type: ElementRef },
        { type: StyleUtils },
        { type: LayoutStyleBuilder, decorators: [{ type: Optional }] },
        { type: MediaMarshaller }
    ]; };
    return LayoutDirective;
}(BaseDirective2));
var DefaultLayoutDirective = /** @class */ (function (_super) {
    __extends(DefaultLayoutDirective, _super);
    function DefaultLayoutDirective() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.inputs = inputs;
        return _this;
    }
    DefaultLayoutDirective.decorators = [
        { type: Directive, args: [{ selector: selector, inputs: inputs },] },
    ];
    return DefaultLayoutDirective;
}(LayoutDirective));
/** @type {?} */
var layoutCache = new Map();

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
var CLEAR_MARGIN_CSS = {
    'margin-left': null,
    'margin-right': null,
    'margin-top': null,
    'margin-bottom': null
};
var LayoutGapStyleBuilder = /** @class */ (function (_super) {
    __extends(LayoutGapStyleBuilder, _super);
    function LayoutGapStyleBuilder(_styler) {
        var _this = _super.call(this) || this;
        _this._styler = _styler;
        return _this;
    }
    /**
     * @param {?} gapValue
     * @param {?} parent
     * @return {?}
     */
    LayoutGapStyleBuilder.prototype.buildStyles = /**
     * @param {?} gapValue
     * @param {?} parent
     * @return {?}
     */
    function (gapValue, parent) {
        if (gapValue.endsWith(GRID_SPECIFIER)) {
            gapValue = gapValue.slice(0, gapValue.indexOf(GRID_SPECIFIER));
            // Add the margin to the host element
            return buildGridMargin(gapValue, parent.directionality);
        }
        else {
            return {};
        }
    };
    /**
     * @param {?} gapValue
     * @param {?} _styles
     * @param {?} parent
     * @return {?}
     */
    LayoutGapStyleBuilder.prototype.sideEffect = /**
     * @param {?} gapValue
     * @param {?} _styles
     * @param {?} parent
     * @return {?}
     */
    function (gapValue, _styles, parent) {
        /** @type {?} */
        var items = parent.items;
        if (gapValue.endsWith(GRID_SPECIFIER)) {
            gapValue = gapValue.slice(0, gapValue.indexOf(GRID_SPECIFIER));
            /** @type {?} */
            var paddingStyles = buildGridPadding(gapValue, parent.directionality);
            this._styler.applyStyleToElements(paddingStyles, parent.items);
        }
        else {
            /** @type {?} */
            var lastItem = /** @type {?} */ ((items.pop()));
            /** @type {?} */
            var gapCss = buildGapCSS(gapValue, parent);
            this._styler.applyStyleToElements(gapCss, items);
            // Clear all gaps for all visible elements
            this._styler.applyStyleToElements(CLEAR_MARGIN_CSS, [lastItem]);
        }
    };
    LayoutGapStyleBuilder.decorators = [
        { type: Injectable, args: [{ providedIn: 'root' },] },
    ];
    /** @nocollapse */
    LayoutGapStyleBuilder.ctorParameters = function () { return [
        { type: StyleUtils }
    ]; };
    /** @nocollapse */ LayoutGapStyleBuilder.ngInjectableDef = defineInjectable({ factory: function LayoutGapStyleBuilder_Factory() { return new LayoutGapStyleBuilder(inject(StyleUtils)); }, token: LayoutGapStyleBuilder, providedIn: "root" });
    return LayoutGapStyleBuilder;
}(StyleBuilder));
/** @type {?} */
var inputs$1 = [
    'fxLayoutGap', 'fxLayoutGap.xs', 'fxLayoutGap.sm', 'fxLayoutGap.md',
    'fxLayoutGap.lg', 'fxLayoutGap.xl', 'fxLayoutGap.lt-sm', 'fxLayoutGap.lt-md',
    'fxLayoutGap.lt-lg', 'fxLayoutGap.lt-xl', 'fxLayoutGap.gt-xs', 'fxLayoutGap.gt-sm',
    'fxLayoutGap.gt-md', 'fxLayoutGap.gt-lg'
];
/** @type {?} */
var selector$1 = "\n  [fxLayoutGap], [fxLayoutGap.xs], [fxLayoutGap.sm], [fxLayoutGap.md],\n  [fxLayoutGap.lg], [fxLayoutGap.xl], [fxLayoutGap.lt-sm], [fxLayoutGap.lt-md],\n  [fxLayoutGap.lt-lg], [fxLayoutGap.lt-xl], [fxLayoutGap.gt-xs], [fxLayoutGap.gt-sm],\n  [fxLayoutGap.gt-md], [fxLayoutGap.gt-lg]\n";
/**
 * 'layout-padding' styling directive
 *  Defines padding of child elements in a layout container
 */
var LayoutGapDirective = /** @class */ (function (_super) {
    __extends(LayoutGapDirective, _super);
    function LayoutGapDirective(elRef, zone, directionality, styleUtils, 
    // NOTE: not actually optional, but we need to force DI without a
    // constructor call
    styleBuilder, marshal) {
        var _this = _super.call(this, elRef, styleBuilder, styleUtils, marshal) || this;
        _this.elRef = elRef;
        _this.zone = zone;
        _this.directionality = directionality;
        _this.styleUtils = styleUtils;
        _this.styleBuilder = styleBuilder;
        _this.marshal = marshal;
        _this.layout = 'row'; // default flex-direction
        _this.DIRECTIVE_KEY = 'layout-gap';
        _this.observerSubject = new Subject();
        /** @type {?} */
        var extraTriggers = [_this.directionality.change, _this.observerSubject.asObservable()];
        _this.init(extraTriggers);
        _this.marshal
            .trackValue(_this.nativeElement, 'layout')
            .pipe(takeUntil(_this.destroySubject))
            .subscribe(_this.onLayoutChange.bind(_this));
        return _this;
    }
    Object.defineProperty(LayoutGapDirective.prototype, "childrenNodes", {
        /** Special accessor to query for all child 'element' nodes regardless of type, class, etc */
        get: /**
         * Special accessor to query for all child 'element' nodes regardless of type, class, etc
         * @return {?}
         */
        function () {
            /** @type {?} */
            var obj = this.nativeElement.children;
            /** @type {?} */
            var buffer = [];
            // iterate backwards ensuring that length is an UInt32
            for (var i = obj.length; i--;) {
                buffer[i] = obj[i];
            }
            return buffer;
        },
        enumerable: true,
        configurable: true
    });
    // *********************************************
    // Lifecycle Methods
    // *********************************************
    /**
     * @return {?}
     */
    LayoutGapDirective.prototype.ngAfterContentInit = /**
     * @return {?}
     */
    function () {
        this.buildChildObservable();
        this.triggerUpdate();
    };
    /**
     * @return {?}
     */
    LayoutGapDirective.prototype.ngOnDestroy = /**
     * @return {?}
     */
    function () {
        _super.prototype.ngOnDestroy.call(this);
        if (this.observer) {
            this.observer.disconnect();
        }
    };
    // *********************************************
    // Protected methods
    // *********************************************
    /**
     * Cache the parent container 'flex-direction' and update the 'margin' styles
     */
    /**
     * Cache the parent container 'flex-direction' and update the 'margin' styles
     * @param {?} matcher
     * @return {?}
     */
    LayoutGapDirective.prototype.onLayoutChange = /**
     * Cache the parent container 'flex-direction' and update the 'margin' styles
     * @param {?} matcher
     * @return {?}
     */
    function (matcher) {
        var _this = this;
        /** @type {?} */
        var layout = matcher.value;
        /** @type {?} */
        var direction = layout.split(' ');
        this.layout = direction[0];
        if (!LAYOUT_VALUES.find(function (x) { return x === _this.layout; })) {
            this.layout = 'row';
        }
        this.triggerUpdate();
    };
    /**
     *
     */
    /**
     *
     * @param {?} value
     * @return {?}
     */
    LayoutGapDirective.prototype.updateWithValue = /**
     *
     * @param {?} value
     * @return {?}
     */
    function (value) {
        var _this = this;
        /** @type {?} */
        var items = this.childrenNodes
            .filter(function (el) { return el.nodeType === 1 && _this.willDisplay(el); })
            .sort(function (a, b) {
            /** @type {?} */
            var orderA = +_this.styler.lookupStyle(a, 'order');
            /** @type {?} */
            var orderB = +_this.styler.lookupStyle(b, 'order');
            if (isNaN(orderA) || isNaN(orderB) || orderA === orderB) {
                return 0;
            }
            else {
                return orderA > orderB ? 1 : -1;
            }
        });
        if (items.length > 0) {
            /** @type {?} */
            var directionality = this.directionality.value;
            /** @type {?} */
            var layout = this.layout;
            if (layout === 'row' && directionality === 'rtl') {
                this.styleCache = layoutGapCacheRowRtl;
            }
            else if (layout === 'row' && directionality !== 'rtl') {
                this.styleCache = layoutGapCacheRowLtr;
            }
            else if (layout === 'column' && directionality === 'rtl') {
                this.styleCache = layoutGapCacheColumnRtl;
            }
            else if (layout === 'column' && directionality !== 'rtl') {
                this.styleCache = layoutGapCacheColumnLtr;
            }
            this.addStyles(value, { directionality: directionality, items: items, layout: layout });
        }
    };
    /** We need to override clearStyles because in most cases mru isn't populated */
    /**
     * We need to override clearStyles because in most cases mru isn't populated
     * @return {?}
     */
    LayoutGapDirective.prototype.clearStyles = /**
     * We need to override clearStyles because in most cases mru isn't populated
     * @return {?}
     */
    function () {
        var _a;
        /** @type {?} */
        var gridMode = Object.keys(this.mru).length > 0;
        /** @type {?} */
        var childrenStyle = gridMode ? 'padding' :
            getMarginType(this.directionality.value, this.layout);
        // If there are styles on the parent remove them
        if (gridMode) {
            _super.prototype.clearStyles.call(this);
        }
        // Then remove the children styles too
        this.styleUtils.applyStyleToElements((_a = {}, _a[childrenStyle] = '', _a), this.childrenNodes);
    };
    /** Determine if an element will show or hide based on current activation */
    /**
     * Determine if an element will show or hide based on current activation
     * @param {?} source
     * @return {?}
     */
    LayoutGapDirective.prototype.willDisplay = /**
     * Determine if an element will show or hide based on current activation
     * @param {?} source
     * @return {?}
     */
    function (source) {
        /** @type {?} */
        var value = this.marshal.getValue(source, 'show-hide');
        return value === true ||
            (value === undefined && this.styleUtils.lookupStyle(source, 'display') !== 'none');
    };
    /**
     * @return {?}
     */
    LayoutGapDirective.prototype.buildChildObservable = /**
     * @return {?}
     */
    function () {
        var _this = this;
        this.zone.runOutsideAngular(function () {
            if (typeof MutationObserver !== 'undefined') {
                _this.observer = new MutationObserver(function (mutations) {
                    /** @type {?} */
                    var validatedChanges = function (it) {
                        return (it.addedNodes && it.addedNodes.length > 0) ||
                            (it.removedNodes && it.removedNodes.length > 0);
                    };
                    // update gap styles only for child 'added' or 'removed' events
                    if (mutations.some(validatedChanges)) {
                        _this.observerSubject.next();
                    }
                });
                _this.observer.observe(_this.nativeElement, { childList: true });
            }
        });
    };
    /** @nocollapse */
    LayoutGapDirective.ctorParameters = function () { return [
        { type: ElementRef },
        { type: NgZone },
        { type: Directionality },
        { type: StyleUtils },
        { type: LayoutGapStyleBuilder, decorators: [{ type: Optional }] },
        { type: MediaMarshaller }
    ]; };
    return LayoutGapDirective;
}(BaseDirective2));
var DefaultLayoutGapDirective = /** @class */ (function (_super) {
    __extends(DefaultLayoutGapDirective, _super);
    function DefaultLayoutGapDirective() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.inputs = inputs$1;
        return _this;
    }
    DefaultLayoutGapDirective.decorators = [
        { type: Directive, args: [{ selector: selector$1, inputs: inputs$1 },] },
    ];
    return DefaultLayoutGapDirective;
}(LayoutGapDirective));
/** @type {?} */
var layoutGapCacheRowRtl = new Map();
/** @type {?} */
var layoutGapCacheColumnRtl = new Map();
/** @type {?} */
var layoutGapCacheRowLtr = new Map();
/** @type {?} */
var layoutGapCacheColumnLtr = new Map();
/** @type {?} */
var GRID_SPECIFIER = ' grid';
/**
 * @param {?} value
 * @param {?} directionality
 * @return {?}
 */
function buildGridPadding(value, directionality) {
    /** @type {?} */
    var paddingTop = '0px';
    /** @type {?} */
    var paddingRight = '0px';
    /** @type {?} */
    var paddingBottom = value;
    /** @type {?} */
    var paddingLeft = '0px';
    if (directionality === 'rtl') {
        paddingLeft = value;
    }
    else {
        paddingRight = value;
    }
    return { 'padding': paddingTop + " " + paddingRight + " " + paddingBottom + " " + paddingLeft };
}
/**
 * @param {?} value
 * @param {?} directionality
 * @return {?}
 */
function buildGridMargin(value, directionality) {
    /** @type {?} */
    var marginTop = '0px';
    /** @type {?} */
    var marginRight = '0px';
    /** @type {?} */
    var marginBottom = '-' + value;
    /** @type {?} */
    var marginLeft = '0px';
    if (directionality === 'rtl') {
        marginLeft = '-' + value;
    }
    else {
        marginRight = '-' + value;
    }
    return { 'margin': marginTop + " " + marginRight + " " + marginBottom + " " + marginLeft };
}
/**
 * @param {?} directionality
 * @param {?} layout
 * @return {?}
 */
function getMarginType(directionality, layout) {
    switch (layout) {
        case 'column':
            return 'margin-bottom';
        case 'column-reverse':
            return 'margin-top';
        case 'row':
            return directionality === 'rtl' ? 'margin-left' : 'margin-right';
        case 'row-reverse':
            return directionality === 'rtl' ? 'margin-right' : 'margin-left';
        default:
            return directionality === 'rtl' ? 'margin-left' : 'margin-right';
    }
}
/**
 * @param {?} gapValue
 * @param {?} parent
 * @return {?}
 */
function buildGapCSS(gapValue, parent) {
    /** @type {?} */
    var key = getMarginType(parent.directionality, parent.layout);
    /** @type {?} */
    var margins = __assign({}, CLEAR_MARGIN_CSS);
    margins[key] = gapValue;
    return margins;
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * Extends an object with the *enumerable* and *own* properties of one or more source objects,
 * similar to Object.assign.
 *
 * @param {?} dest The object which will have properties copied to it.
 * @param {...?} sources The source objects from which properties will be copied.
 * @return {?}
 */
function extendObject(dest) {
    var sources = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        sources[_i - 1] = arguments[_i];
    }
    if (dest == null) {
        throw TypeError('Cannot convert undefined or null to object');
    }
    for (var _a = 0, sources_1 = sources; _a < sources_1.length; _a++) {
        var source = sources_1[_a];
        if (source != null) {
            for (var key in source) {
                if (source.hasOwnProperty(key)) {
                    dest[key] = source[key];
                }
            }
        }
    }
    return dest;
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
var FlexStyleBuilder = /** @class */ (function (_super) {
    __extends(FlexStyleBuilder, _super);
    function FlexStyleBuilder(layoutConfig) {
        var _this = _super.call(this) || this;
        _this.layoutConfig = layoutConfig;
        return _this;
    }
    /**
     * @param {?} input
     * @param {?} parent
     * @return {?}
     */
    FlexStyleBuilder.prototype.buildStyles = /**
     * @param {?} input
     * @param {?} parent
     * @return {?}
     */
    function (input, parent) {
        var _a = input.split(' '), grow = _a[0], shrink = _a[1], basisParts = _a.slice(2);
        /** @type {?} */
        var basis = basisParts.join(' ');
        /** @type {?} */
        var direction = (parent.direction.indexOf('column') > -1) ? 'column' : 'row';
        /** @type {?} */
        var max = isFlowHorizontal(direction) ? 'max-width' : 'max-height';
        /** @type {?} */
        var min = isFlowHorizontal(direction) ? 'min-width' : 'min-height';
        /** @type {?} */
        var hasCalc = String(basis).indexOf('calc') > -1;
        /** @type {?} */
        var usingCalc = hasCalc || (basis === 'auto');
        /** @type {?} */
        var isPercent = String(basis).indexOf('%') > -1 && !hasCalc;
        /** @type {?} */
        var hasUnits = String(basis).indexOf('px') > -1 || String(basis).indexOf('rem') > -1 ||
            String(basis).indexOf('em') > -1 || String(basis).indexOf('vw') > -1 ||
            String(basis).indexOf('vh') > -1;
        /** @type {?} */
        var isValue = (hasCalc || hasUnits);
        grow = (grow == '0') ? 0 : grow;
        shrink = (shrink == '0') ? 0 : shrink;
        /** @type {?} */
        var isFixed = !grow && !shrink;
        /** @type {?} */
        var css = {};
        /** @type {?} */
        var clearStyles = {
            'max-width': null,
            'max-height': null,
            'min-width': null,
            'min-height': null
        };
        switch (basis || '') {
            case '':
                /** @type {?} */
                var useColumnBasisZero = this.layoutConfig.useColumnBasisZero !== false;
                basis = direction === 'row' ? '0%' : (useColumnBasisZero ? '0.000000001px' : 'auto');
                break;
            case 'initial': // default
            case 'nogrow':
                grow = 0;
                basis = 'auto';
                break;
            case 'grow':
                basis = '100%';
                break;
            case 'noshrink':
                shrink = 0;
                basis = 'auto';
                break;
            case 'auto':
                break;
            case 'none':
                grow = 0;
                shrink = 0;
                basis = 'auto';
                break;
            default:
                // Defaults to percentage sizing unless `px` is explicitly set
                if (!isValue && !isPercent && !isNaN(/** @type {?} */ (basis))) {
                    basis = basis + '%';
                }
                // Fix for issue 280
                if (basis === '0%') {
                    isValue = true;
                }
                if (basis === '0px') {
                    basis = '0%';
                }
                // fix issue #5345
                if (hasCalc) {
                    css = extendObject(clearStyles, {
                        'flex-grow': grow,
                        'flex-shrink': shrink,
                        'flex-basis': isValue ? basis : '100%'
                    });
                }
                else {
                    css = extendObject(clearStyles, {
                        'flex': grow + " " + shrink + " " + (isValue ? basis : '100%')
                    });
                }
                break;
        }
        if (!(css['flex'] || css['flex-grow'])) {
            if (hasCalc) {
                css = extendObject(clearStyles, {
                    'flex-grow': grow,
                    'flex-shrink': shrink,
                    'flex-basis': basis
                });
            }
            else {
                css = extendObject(clearStyles, {
                    'flex': grow + " " + shrink + " " + basis
                });
            }
        }
        // Fix for issues 277, 534, and 728
        if (basis !== '0%' && basis !== '0px' && basis !== '0.000000001px' && basis !== 'auto') {
            css[min] = isFixed || (isValue && grow) ? basis : null;
            css[max] = isFixed || (!usingCalc && shrink) ? basis : null;
        }
        // Fix for issue 528
        if (!css[min] && !css[max]) {
            if (hasCalc) {
                css = extendObject(clearStyles, {
                    'flex-grow': grow,
                    'flex-shrink': shrink,
                    'flex-basis': basis
                });
            }
            else {
                css = extendObject(clearStyles, {
                    'flex': grow + " " + shrink + " " + basis
                });
            }
        }
        else {
            // Fix for issue 660
            if (parent.hasWrap) {
                css[hasCalc ? 'flex-basis' : 'flex'] = css[max] ?
                    (hasCalc ? css[max] : grow + " " + shrink + " " + css[max]) :
                    (hasCalc ? css[min] : grow + " " + shrink + " " + css[min]);
            }
        }
        return /** @type {?} */ (extendObject(css, { 'box-sizing': 'border-box' }));
    };
    FlexStyleBuilder.decorators = [
        { type: Injectable, args: [{ providedIn: 'root' },] },
    ];
    /** @nocollapse */
    FlexStyleBuilder.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: Inject, args: [LAYOUT_CONFIG,] }] }
    ]; };
    /** @nocollapse */ FlexStyleBuilder.ngInjectableDef = defineInjectable({ factory: function FlexStyleBuilder_Factory() { return new FlexStyleBuilder(inject(LAYOUT_CONFIG)); }, token: FlexStyleBuilder, providedIn: "root" });
    return FlexStyleBuilder;
}(StyleBuilder));
/** @type {?} */
var inputs$2 = [
    'fxFlex', 'fxFlex.xs', 'fxFlex.sm', 'fxFlex.md',
    'fxFlex.lg', 'fxFlex.xl', 'fxFlex.lt-sm', 'fxFlex.lt-md',
    'fxFlex.lt-lg', 'fxFlex.lt-xl', 'fxFlex.gt-xs', 'fxFlex.gt-sm',
    'fxFlex.gt-md', 'fxFlex.gt-lg'
];
/** @type {?} */
var selector$2 = "\n  [fxFlex], [fxFlex.xs], [fxFlex.sm], [fxFlex.md],\n  [fxFlex.lg], [fxFlex.xl], [fxFlex.lt-sm], [fxFlex.lt-md],\n  [fxFlex.lt-lg], [fxFlex.lt-xl], [fxFlex.gt-xs], [fxFlex.gt-sm],\n  [fxFlex.gt-md], [fxFlex.gt-lg]\n";
/**
 * Directive to control the size of a flex item using flex-basis, flex-grow, and flex-shrink.
 * Corresponds to the css `flex` shorthand property.
 *
 * @see https://css-tricks.com/snippets/css/a-guide-to-flexbox/
 */
var FlexDirective = /** @class */ (function (_super) {
    __extends(FlexDirective, _super);
    function FlexDirective(elRef, styleUtils, layoutConfig, styleBuilder, marshal) {
        var _this = _super.call(this, elRef, styleBuilder, styleUtils, marshal) || this;
        _this.elRef = elRef;
        _this.styleUtils = styleUtils;
        _this.layoutConfig = layoutConfig;
        _this.styleBuilder = styleBuilder;
        _this.marshal = marshal;
        _this.DIRECTIVE_KEY = 'flex';
        _this.direction = '';
        _this.wrap = false;
        _this.flexGrow = '1';
        _this.flexShrink = '1';
        _this.init();
        if (_this.parentElement) {
            _this.marshal.trackValue(_this.parentElement, 'layout')
                .pipe(takeUntil(_this.destroySubject))
                .subscribe(_this.onLayoutChange.bind(_this));
            _this.marshal.trackValue(_this.nativeElement, 'layout-align')
                .pipe(takeUntil(_this.destroySubject))
                .subscribe(_this.triggerReflow.bind(_this));
        }
        return _this;
    }
    Object.defineProperty(FlexDirective.prototype, "shrink", {
        get: /**
         * @return {?}
         */
        function () { return this.flexShrink; },
        set: /**
         * @param {?} value
         * @return {?}
         */
        function (value) {
            this.flexShrink = value || '1';
            this.triggerReflow();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FlexDirective.prototype, "grow", {
        get: /**
         * @return {?}
         */
        function () { return this.flexGrow; },
        set: /**
         * @param {?} value
         * @return {?}
         */
        function (value) {
            this.flexGrow = value || '1';
            this.triggerReflow();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Caches the parent container's 'flex-direction' and updates the element's style.
     * Used as a handler for layout change events from the parent flex container.
     */
    /**
     * Caches the parent container's 'flex-direction' and updates the element's style.
     * Used as a handler for layout change events from the parent flex container.
     * @param {?} matcher
     * @return {?}
     */
    FlexDirective.prototype.onLayoutChange = /**
     * Caches the parent container's 'flex-direction' and updates the element's style.
     * Used as a handler for layout change events from the parent flex container.
     * @param {?} matcher
     * @return {?}
     */
    function (matcher) {
        /** @type {?} */
        var layout = matcher.value;
        /** @type {?} */
        var layoutParts = layout.split(' ');
        this.direction = layoutParts[0];
        this.wrap = layoutParts[1] !== undefined && layoutParts[1] === 'wrap';
        this.triggerUpdate();
    };
    /** Input to this is exclusively the basis input value */
    /**
     * Input to this is exclusively the basis input value
     * @param {?} value
     * @return {?}
     */
    FlexDirective.prototype.updateWithValue = /**
     * Input to this is exclusively the basis input value
     * @param {?} value
     * @return {?}
     */
    function (value) {
        /** @type {?} */
        var addFlexToParent = this.layoutConfig.addFlexToParent !== false;
        if (!this.direction) {
            this.direction = this.getFlexFlowDirection(/** @type {?} */ ((this.parentElement)), addFlexToParent);
        }
        /** @type {?} */
        var direction = this.direction;
        /** @type {?} */
        var isHorizontal = direction.startsWith('row');
        /** @type {?} */
        var hasWrap = this.wrap;
        if (isHorizontal && hasWrap) {
            this.styleCache = flexRowWrapCache;
        }
        else if (isHorizontal && !hasWrap) {
            this.styleCache = flexRowCache;
        }
        else if (!isHorizontal && hasWrap) {
            this.styleCache = flexColumnWrapCache;
        }
        else if (!isHorizontal && !hasWrap) {
            this.styleCache = flexColumnCache;
        }
        /** @type {?} */
        var basis = String(value).replace(';', '');
        /** @type {?} */
        var parts = validateBasis(basis, this.flexGrow, this.flexShrink);
        this.addStyles(parts.join(' '), { direction: direction, hasWrap: hasWrap });
    };
    /** Trigger a style reflow, usually based on a shrink/grow input event */
    /**
     * Trigger a style reflow, usually based on a shrink/grow input event
     * @return {?}
     */
    FlexDirective.prototype.triggerReflow = /**
     * Trigger a style reflow, usually based on a shrink/grow input event
     * @return {?}
     */
    function () {
        /** @type {?} */
        var activatedValue = this.activatedValue;
        if (activatedValue !== undefined) {
            /** @type {?} */
            var parts = validateBasis(activatedValue, this.flexGrow, this.flexShrink);
            this.marshal.updateElement(this.nativeElement, this.DIRECTIVE_KEY, parts.join(' '));
        }
    };
    /** @nocollapse */
    FlexDirective.ctorParameters = function () { return [
        { type: ElementRef },
        { type: StyleUtils },
        { type: undefined, decorators: [{ type: Inject, args: [LAYOUT_CONFIG,] }] },
        { type: FlexStyleBuilder },
        { type: MediaMarshaller }
    ]; };
    FlexDirective.propDecorators = {
        shrink: [{ type: Input, args: ['fxShrink',] }],
        grow: [{ type: Input, args: ['fxGrow',] }]
    };
    return FlexDirective;
}(BaseDirective2));
var DefaultFlexDirective = /** @class */ (function (_super) {
    __extends(DefaultFlexDirective, _super);
    function DefaultFlexDirective() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.inputs = inputs$2;
        return _this;
    }
    DefaultFlexDirective.decorators = [
        { type: Directive, args: [{ inputs: inputs$2, selector: selector$2 },] },
    ];
    return DefaultFlexDirective;
}(FlexDirective));
/** @type {?} */
var flexRowCache = new Map();
/** @type {?} */
var flexColumnCache = new Map();
/** @type {?} */
var flexRowWrapCache = new Map();
/** @type {?} */
var flexColumnWrapCache = new Map();

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
var FlexOrderStyleBuilder = /** @class */ (function (_super) {
    __extends(FlexOrderStyleBuilder, _super);
    function FlexOrderStyleBuilder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * @param {?} value
     * @return {?}
     */
    FlexOrderStyleBuilder.prototype.buildStyles = /**
     * @param {?} value
     * @return {?}
     */
    function (value) {
        return { order: (value && parseInt(value, 10)) || '' };
    };
    FlexOrderStyleBuilder.decorators = [
        { type: Injectable, args: [{ providedIn: 'root' },] },
    ];
    /** @nocollapse */ FlexOrderStyleBuilder.ngInjectableDef = defineInjectable({ factory: function FlexOrderStyleBuilder_Factory() { return new FlexOrderStyleBuilder(); }, token: FlexOrderStyleBuilder, providedIn: "root" });
    return FlexOrderStyleBuilder;
}(StyleBuilder));
/** @type {?} */
var inputs$3 = [
    'fxFlexOrder', 'fxFlexOrder.xs', 'fxFlexOrder.sm', 'fxFlexOrder.md',
    'fxFlexOrder.lg', 'fxFlexOrder.xl', 'fxFlexOrder.lt-sm', 'fxFlexOrder.lt-md',
    'fxFlexOrder.lt-lg', 'fxFlexOrder.lt-xl', 'fxFlexOrder.gt-xs', 'fxFlexOrder.gt-sm',
    'fxFlexOrder.gt-md', 'fxFlexOrder.gt-lg'
];
/** @type {?} */
var selector$3 = "\n  [fxFlexOrder], [fxFlexOrder.xs], [fxFlexOrder.sm], [fxFlexOrder.md],\n  [fxFlexOrder.lg], [fxFlexOrder.xl], [fxFlexOrder.lt-sm], [fxFlexOrder.lt-md],\n  [fxFlexOrder.lt-lg], [fxFlexOrder.lt-xl], [fxFlexOrder.gt-xs], [fxFlexOrder.gt-sm],\n  [fxFlexOrder.gt-md], [fxFlexOrder.gt-lg]\n";
/**
 * 'flex-order' flexbox styling directive
 * Configures the positional ordering of the element in a sorted layout container
 * @see https://css-tricks.com/almanac/properties/o/order/
 */
var FlexOrderDirective = /** @class */ (function (_super) {
    __extends(FlexOrderDirective, _super);
    function FlexOrderDirective(elRef, styleUtils, 
    // NOTE: not actually optional, but we need to force DI without a
    // constructor call
    styleBuilder, marshal) {
        var _this = _super.call(this, elRef, styleBuilder, styleUtils, marshal) || this;
        _this.elRef = elRef;
        _this.styleUtils = styleUtils;
        _this.styleBuilder = styleBuilder;
        _this.marshal = marshal;
        _this.DIRECTIVE_KEY = 'flex-order';
        _this.styleCache = flexOrderCache;
        _this.init();
        return _this;
    }
    /** @nocollapse */
    FlexOrderDirective.ctorParameters = function () { return [
        { type: ElementRef },
        { type: StyleUtils },
        { type: FlexOrderStyleBuilder, decorators: [{ type: Optional }] },
        { type: MediaMarshaller }
    ]; };
    return FlexOrderDirective;
}(BaseDirective2));
/** @type {?} */
var flexOrderCache = new Map();
var DefaultFlexOrderDirective = /** @class */ (function (_super) {
    __extends(DefaultFlexOrderDirective, _super);
    function DefaultFlexOrderDirective() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.inputs = inputs$3;
        return _this;
    }
    DefaultFlexOrderDirective.decorators = [
        { type: Directive, args: [{ selector: selector$3, inputs: inputs$3 },] },
    ];
    return DefaultFlexOrderDirective;
}(FlexOrderDirective));

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
var FlexOffsetStyleBuilder = /** @class */ (function (_super) {
    __extends(FlexOffsetStyleBuilder, _super);
    function FlexOffsetStyleBuilder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * @param {?} offset
     * @param {?} parent
     * @return {?}
     */
    FlexOffsetStyleBuilder.prototype.buildStyles = /**
     * @param {?} offset
     * @param {?} parent
     * @return {?}
     */
    function (offset, parent) {
        var _a;
        if (offset === '') {
            offset = '0';
        }
        /** @type {?} */
        var isPercent = String(offset).indexOf('%') > -1;
        /** @type {?} */
        var isPx = String(offset).indexOf('px') > -1;
        if (!isPx && !isPercent && !isNaN(+offset)) {
            offset = offset + '%';
        }
        /** @type {?} */
        var horizontalLayoutKey = parent.isRtl ? 'margin-right' : 'margin-left';
        /** @type {?} */
        var styles = isFlowHorizontal(parent.layout) ? (_a = {}, _a[horizontalLayoutKey] = "" + offset, _a) : { 'margin-top': "" + offset };
        return styles;
    };
    FlexOffsetStyleBuilder.decorators = [
        { type: Injectable, args: [{ providedIn: 'root' },] },
    ];
    /** @nocollapse */ FlexOffsetStyleBuilder.ngInjectableDef = defineInjectable({ factory: function FlexOffsetStyleBuilder_Factory() { return new FlexOffsetStyleBuilder(); }, token: FlexOffsetStyleBuilder, providedIn: "root" });
    return FlexOffsetStyleBuilder;
}(StyleBuilder));
/** @type {?} */
var inputs$4 = [
    'fxFlexOffset', 'fxFlexOffset.xs', 'fxFlexOffset.sm', 'fxFlexOffset.md',
    'fxFlexOffset.lg', 'fxFlexOffset.xl', 'fxFlexOffset.lt-sm', 'fxFlexOffset.lt-md',
    'fxFlexOffset.lt-lg', 'fxFlexOffset.lt-xl', 'fxFlexOffset.gt-xs', 'fxFlexOffset.gt-sm',
    'fxFlexOffset.gt-md', 'fxFlexOffset.gt-lg'
];
/** @type {?} */
var selector$4 = "\n  [fxFlexOffset], [fxFlexOffset.xs], [fxFlexOffset.sm], [fxFlexOffset.md],\n  [fxFlexOffset.lg], [fxFlexOffset.xl], [fxFlexOffset.lt-sm], [fxFlexOffset.lt-md],\n  [fxFlexOffset.lt-lg], [fxFlexOffset.lt-xl], [fxFlexOffset.gt-xs], [fxFlexOffset.gt-sm],\n  [fxFlexOffset.gt-md], [fxFlexOffset.gt-lg]\n";
/**
 * 'flex-offset' flexbox styling directive
 * Configures the 'margin-left' of the element in a layout container
 */
var FlexOffsetDirective = /** @class */ (function (_super) {
    __extends(FlexOffsetDirective, _super);
    function FlexOffsetDirective(elRef, directionality, 
    // NOTE: not actually optional, but we need to force DI without a
    // constructor call
    styleBuilder, marshal, styler) {
        var _this = _super.call(this, elRef, styleBuilder, styler, marshal) || this;
        _this.elRef = elRef;
        _this.directionality = directionality;
        _this.styleBuilder = styleBuilder;
        _this.marshal = marshal;
        _this.styler = styler;
        _this.DIRECTIVE_KEY = 'flex-offset';
        _this.init([_this.directionality.change]);
        // Parent DOM `layout-gap` with affect the nested child with `flex-offset`
        if (_this.parentElement) {
            _this.marshal
                .trackValue(_this.parentElement, 'layout-gap')
                .pipe(takeUntil(_this.destroySubject))
                .subscribe(_this.triggerUpdate.bind(_this));
        }
        return _this;
    }
    // *********************************************
    // Protected methods
    // *********************************************
    /**
     * Using the current fxFlexOffset value, update the inline CSS
     * NOTE: this will assign `margin-left` if the parent flex-direction == 'row',
     *       otherwise `margin-top` is used for the offset.
     */
    /**
     * Using the current fxFlexOffset value, update the inline CSS
     * NOTE: this will assign `margin-left` if the parent flex-direction == 'row',
     *       otherwise `margin-top` is used for the offset.
     * @param {?=} value
     * @return {?}
     */
    FlexOffsetDirective.prototype.updateWithValue = /**
     * Using the current fxFlexOffset value, update the inline CSS
     * NOTE: this will assign `margin-left` if the parent flex-direction == 'row',
     *       otherwise `margin-top` is used for the offset.
     * @param {?=} value
     * @return {?}
     */
    function (value) {
        if (value === void 0) { value = ''; }
        /** @type {?} */
        var layout = this.getFlexFlowDirection(/** @type {?} */ ((this.parentElement)), true);
        /** @type {?} */
        var isRtl = this.directionality.value === 'rtl';
        if (layout === 'row' && isRtl) {
            this.styleCache = flexOffsetCacheRowRtl;
        }
        else if (layout === 'row' && !isRtl) {
            this.styleCache = flexOffsetCacheRowLtr;
        }
        else if (layout === 'column' && isRtl) {
            this.styleCache = flexOffsetCacheColumnRtl;
        }
        else if (layout === 'column' && !isRtl) {
            this.styleCache = flexOffsetCacheColumnLtr;
        }
        this.addStyles(value + '', { layout: layout, isRtl: isRtl });
    };
    /** @nocollapse */
    FlexOffsetDirective.ctorParameters = function () { return [
        { type: ElementRef },
        { type: Directionality },
        { type: FlexOffsetStyleBuilder, decorators: [{ type: Optional }] },
        { type: MediaMarshaller },
        { type: StyleUtils }
    ]; };
    return FlexOffsetDirective;
}(BaseDirective2));
var DefaultFlexOffsetDirective = /** @class */ (function (_super) {
    __extends(DefaultFlexOffsetDirective, _super);
    function DefaultFlexOffsetDirective() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.inputs = inputs$4;
        return _this;
    }
    DefaultFlexOffsetDirective.decorators = [
        { type: Directive, args: [{ selector: selector$4, inputs: inputs$4 },] },
    ];
    return DefaultFlexOffsetDirective;
}(FlexOffsetDirective));
/** @type {?} */
var flexOffsetCacheRowRtl = new Map();
/** @type {?} */
var flexOffsetCacheColumnRtl = new Map();
/** @type {?} */
var flexOffsetCacheRowLtr = new Map();
/** @type {?} */
var flexOffsetCacheColumnLtr = new Map();

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
var FlexAlignStyleBuilder = /** @class */ (function (_super) {
    __extends(FlexAlignStyleBuilder, _super);
    function FlexAlignStyleBuilder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * @param {?} input
     * @return {?}
     */
    FlexAlignStyleBuilder.prototype.buildStyles = /**
     * @param {?} input
     * @return {?}
     */
    function (input) {
        input = input || 'stretch';
        /** @type {?} */
        var styles = {};
        // Cross-axis
        switch (input) {
            case 'start':
                styles['align-self'] = 'flex-start';
                break;
            case 'end':
                styles['align-self'] = 'flex-end';
                break;
            default:
                styles['align-self'] = input;
                break;
        }
        return styles;
    };
    FlexAlignStyleBuilder.decorators = [
        { type: Injectable, args: [{ providedIn: 'root' },] },
    ];
    /** @nocollapse */ FlexAlignStyleBuilder.ngInjectableDef = defineInjectable({ factory: function FlexAlignStyleBuilder_Factory() { return new FlexAlignStyleBuilder(); }, token: FlexAlignStyleBuilder, providedIn: "root" });
    return FlexAlignStyleBuilder;
}(StyleBuilder));
/** @type {?} */
var inputs$5 = [
    'fxFlexAlign', 'fxFlexAlign.xs', 'fxFlexAlign.sm', 'fxFlexAlign.md',
    'fxFlexAlign.lg', 'fxFlexAlign.xl', 'fxFlexAlign.lt-sm', 'fxFlexAlign.lt-md',
    'fxFlexAlign.lt-lg', 'fxFlexAlign.lt-xl', 'fxFlexAlign.gt-xs', 'fxFlexAlign.gt-sm',
    'fxFlexAlign.gt-md', 'fxFlexAlign.gt-lg'
];
/** @type {?} */
var selector$5 = "\n  [fxFlexAlign], [fxFlexAlign.xs], [fxFlexAlign.sm], [fxFlexAlign.md],\n  [fxFlexAlign.lg], [fxFlexAlign.xl], [fxFlexAlign.lt-sm], [fxFlexAlign.lt-md],\n  [fxFlexAlign.lt-lg], [fxFlexAlign.lt-xl], [fxFlexAlign.gt-xs], [fxFlexAlign.gt-sm],\n  [fxFlexAlign.gt-md], [fxFlexAlign.gt-lg]\n";
/**
 * 'flex-align' flexbox styling directive
 * Allows element-specific overrides for cross-axis alignments in a layout container
 * @see https://css-tricks.com/almanac/properties/a/align-self/
 */
var FlexAlignDirective = /** @class */ (function (_super) {
    __extends(FlexAlignDirective, _super);
    function FlexAlignDirective(elRef, styleUtils, 
    // NOTE: not actually optional, but we need to force DI without a
    // constructor call
    styleBuilder, marshal) {
        var _this = _super.call(this, elRef, styleBuilder, styleUtils, marshal) || this;
        _this.elRef = elRef;
        _this.styleUtils = styleUtils;
        _this.styleBuilder = styleBuilder;
        _this.marshal = marshal;
        _this.DIRECTIVE_KEY = 'flex-align';
        _this.styleCache = flexAlignCache;
        _this.init();
        return _this;
    }
    /** @nocollapse */
    FlexAlignDirective.ctorParameters = function () { return [
        { type: ElementRef },
        { type: StyleUtils },
        { type: FlexAlignStyleBuilder, decorators: [{ type: Optional }] },
        { type: MediaMarshaller }
    ]; };
    return FlexAlignDirective;
}(BaseDirective2));
/** @type {?} */
var flexAlignCache = new Map();
var DefaultFlexAlignDirective = /** @class */ (function (_super) {
    __extends(DefaultFlexAlignDirective, _super);
    function DefaultFlexAlignDirective() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.inputs = inputs$5;
        return _this;
    }
    DefaultFlexAlignDirective.decorators = [
        { type: Directive, args: [{ selector: selector$5, inputs: inputs$5 },] },
    ];
    return DefaultFlexAlignDirective;
}(FlexAlignDirective));

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
var FLEX_FILL_CSS = {
    'margin': 0,
    'width': '100%',
    'height': '100%',
    'min-width': '100%',
    'min-height': '100%'
};
var FlexFillStyleBuilder = /** @class */ (function (_super) {
    __extends(FlexFillStyleBuilder, _super);
    function FlexFillStyleBuilder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * @param {?} _input
     * @return {?}
     */
    FlexFillStyleBuilder.prototype.buildStyles = /**
     * @param {?} _input
     * @return {?}
     */
    function (_input) {
        return FLEX_FILL_CSS;
    };
    FlexFillStyleBuilder.decorators = [
        { type: Injectable, args: [{ providedIn: 'root' },] },
    ];
    /** @nocollapse */ FlexFillStyleBuilder.ngInjectableDef = defineInjectable({ factory: function FlexFillStyleBuilder_Factory() { return new FlexFillStyleBuilder(); }, token: FlexFillStyleBuilder, providedIn: "root" });
    return FlexFillStyleBuilder;
}(StyleBuilder));
/**
 * 'fxFill' flexbox styling directive
 *  Maximizes width and height of element in a layout container
 *
 *  NOTE: fxFill is NOT responsive API!!
 */
var FlexFillDirective = /** @class */ (function (_super) {
    __extends(FlexFillDirective, _super);
    function FlexFillDirective(elRef, styleUtils, styleBuilder, marshal) {
        var _this = _super.call(this, elRef, styleBuilder, styleUtils, marshal) || this;
        _this.elRef = elRef;
        _this.styleUtils = styleUtils;
        _this.styleBuilder = styleBuilder;
        _this.marshal = marshal;
        _this.styleCache = flexFillCache;
        _this.addStyles('');
        return _this;
    }
    FlexFillDirective.decorators = [
        { type: Directive, args: [{ selector: "[fxFill], [fxFlexFill]" },] },
    ];
    /** @nocollapse */
    FlexFillDirective.ctorParameters = function () { return [
        { type: ElementRef },
        { type: StyleUtils },
        { type: FlexFillStyleBuilder },
        { type: MediaMarshaller }
    ]; };
    return FlexFillDirective;
}(BaseDirective2));
/** @type {?} */
var flexFillCache = new Map();

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
var LayoutAlignStyleBuilder = /** @class */ (function (_super) {
    __extends(LayoutAlignStyleBuilder, _super);
    function LayoutAlignStyleBuilder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * @param {?} align
     * @param {?} parent
     * @return {?}
     */
    LayoutAlignStyleBuilder.prototype.buildStyles = /**
     * @param {?} align
     * @param {?} parent
     * @return {?}
     */
    function (align, parent) {
        /** @type {?} */
        var css = {};
        var _a = align.split(' '), mainAxis = _a[0], crossAxis = _a[1];
        // Main axis
        switch (mainAxis) {
            case 'center':
                css['justify-content'] = 'center';
                break;
            case 'space-around':
                css['justify-content'] = 'space-around';
                break;
            case 'space-between':
                css['justify-content'] = 'space-between';
                break;
            case 'space-evenly':
                css['justify-content'] = 'space-evenly';
                break;
            case 'end':
            case 'flex-end':
                css['justify-content'] = 'flex-end';
                break;
            case 'start':
            case 'flex-start':
            default:
                css['justify-content'] = 'flex-start'; // default main axis
                break;
        }
        // Cross-axis
        switch (crossAxis) {
            case 'start':
            case 'flex-start':
                css['align-items'] = css['align-content'] = 'flex-start';
                break;
            case 'center':
                css['align-items'] = css['align-content'] = 'center';
                break;
            case 'end':
            case 'flex-end':
                css['align-items'] = css['align-content'] = 'flex-end';
                break;
            case 'space-between':
                css['align-content'] = 'space-between';
                css['align-items'] = 'stretch';
                break;
            case 'space-around':
                css['align-content'] = 'space-around';
                css['align-items'] = 'stretch';
                break;
            case 'baseline':
                css['align-content'] = 'stretch';
                css['align-items'] = 'baseline';
                break;
            case 'stretch':
            default: // 'stretch'
                // 'stretch'
                css['align-items'] = css['align-content'] = 'stretch'; // default cross axis
                break;
        }
        return /** @type {?} */ (extendObject(css, {
            'display': parent.inline ? 'inline-flex' : 'flex',
            'flex-direction': parent.layout,
            'box-sizing': 'border-box',
            'max-width': crossAxis === 'stretch' ?
                !isFlowHorizontal(parent.layout) ? '100%' : null : null,
            'max-height': crossAxis === 'stretch' ?
                isFlowHorizontal(parent.layout) ? '100%' : null : null,
        }));
    };
    LayoutAlignStyleBuilder.decorators = [
        { type: Injectable, args: [{ providedIn: 'root' },] },
    ];
    /** @nocollapse */ LayoutAlignStyleBuilder.ngInjectableDef = defineInjectable({ factory: function LayoutAlignStyleBuilder_Factory() { return new LayoutAlignStyleBuilder(); }, token: LayoutAlignStyleBuilder, providedIn: "root" });
    return LayoutAlignStyleBuilder;
}(StyleBuilder));
/** @type {?} */
var inputs$6 = [
    'fxLayoutAlign', 'fxLayoutAlign.xs', 'fxLayoutAlign.sm', 'fxLayoutAlign.md',
    'fxLayoutAlign.lg', 'fxLayoutAlign.xl', 'fxLayoutAlign.lt-sm', 'fxLayoutAlign.lt-md',
    'fxLayoutAlign.lt-lg', 'fxLayoutAlign.lt-xl', 'fxLayoutAlign.gt-xs', 'fxLayoutAlign.gt-sm',
    'fxLayoutAlign.gt-md', 'fxLayoutAlign.gt-lg'
];
/** @type {?} */
var selector$6 = "\n  [fxLayoutAlign], [fxLayoutAlign.xs], [fxLayoutAlign.sm], [fxLayoutAlign.md],\n  [fxLayoutAlign.lg], [fxLayoutAlign.xl], [fxLayoutAlign.lt-sm], [fxLayoutAlign.lt-md],\n  [fxLayoutAlign.lt-lg], [fxLayoutAlign.lt-xl], [fxLayoutAlign.gt-xs], [fxLayoutAlign.gt-sm],\n  [fxLayoutAlign.gt-md], [fxLayoutAlign.gt-lg]\n";
/**
 * 'layout-align' flexbox styling directive
 *  Defines positioning of child elements along main and cross axis in a layout container
 *  Optional values: {main-axis} values or {main-axis cross-axis} value pairs
 *
 * @see https://css-tricks.com/almanac/properties/j/justify-content/
 * @see https://css-tricks.com/almanac/properties/a/align-items/
 * @see https://css-tricks.com/almanac/properties/a/align-content/
 */
var LayoutAlignDirective = /** @class */ (function (_super) {
    __extends(LayoutAlignDirective, _super);
    function LayoutAlignDirective(elRef, styleUtils, 
    // NOTE: not actually optional, but we need to force DI without a
    // constructor call
    styleBuilder, marshal) {
        var _this = _super.call(this, elRef, styleBuilder, styleUtils, marshal) || this;
        _this.elRef = elRef;
        _this.styleUtils = styleUtils;
        _this.styleBuilder = styleBuilder;
        _this.marshal = marshal;
        _this.DIRECTIVE_KEY = 'layout-align';
        _this.layout = 'row'; // default flex-direction
        _this.inline = false;
        _this.init();
        _this.marshal.trackValue(_this.nativeElement, 'layout')
            .pipe(takeUntil(_this.destroySubject))
            .subscribe(_this.onLayoutChange.bind(_this));
        return _this;
    }
    // *********************************************
    // Protected methods
    // *********************************************
    /**
     *
     */
    /**
     *
     * @param {?} value
     * @return {?}
     */
    LayoutAlignDirective.prototype.updateWithValue = /**
     *
     * @param {?} value
     * @return {?}
     */
    function (value) {
        /** @type {?} */
        var layout = this.layout || 'row';
        /** @type {?} */
        var inline = this.inline;
        if (layout === 'row' && inline) {
            this.styleCache = layoutAlignHorizontalInlineCache;
        }
        else if (layout === 'row' && !inline) {
            this.styleCache = layoutAlignHorizontalCache;
        }
        else if (layout === 'row-reverse' && inline) {
            this.styleCache = layoutAlignHorizontalRevInlineCache;
        }
        else if (layout === 'row-reverse' && !inline) {
            this.styleCache = layoutAlignHorizontalRevCache;
        }
        else if (layout === 'column' && inline) {
            this.styleCache = layoutAlignVerticalInlineCache;
        }
        else if (layout === 'column' && !inline) {
            this.styleCache = layoutAlignVerticalCache;
        }
        else if (layout === 'column-reverse' && inline) {
            this.styleCache = layoutAlignVerticalRevInlineCache;
        }
        else if (layout === 'column-reverse' && !inline) {
            this.styleCache = layoutAlignVerticalRevCache;
        }
        this.addStyles(value, { layout: layout, inline: inline });
    };
    /**
     * Cache the parent container 'flex-direction' and update the 'flex' styles
     */
    /**
     * Cache the parent container 'flex-direction' and update the 'flex' styles
     * @param {?} matcher
     * @return {?}
     */
    LayoutAlignDirective.prototype.onLayoutChange = /**
     * Cache the parent container 'flex-direction' and update the 'flex' styles
     * @param {?} matcher
     * @return {?}
     */
    function (matcher) {
        var _this = this;
        /** @type {?} */
        var layoutKeys = matcher.value.split(' ');
        this.layout = layoutKeys[0];
        this.inline = matcher.value.includes('inline');
        if (!LAYOUT_VALUES.find(function (x) { return x === _this.layout; })) {
            this.layout = 'row';
        }
        this.triggerUpdate();
    };
    /** @nocollapse */
    LayoutAlignDirective.ctorParameters = function () { return [
        { type: ElementRef },
        { type: StyleUtils },
        { type: LayoutAlignStyleBuilder, decorators: [{ type: Optional }] },
        { type: MediaMarshaller }
    ]; };
    return LayoutAlignDirective;
}(BaseDirective2));
var DefaultLayoutAlignDirective = /** @class */ (function (_super) {
    __extends(DefaultLayoutAlignDirective, _super);
    function DefaultLayoutAlignDirective() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.inputs = inputs$6;
        return _this;
    }
    DefaultLayoutAlignDirective.decorators = [
        { type: Directive, args: [{ selector: selector$6, inputs: inputs$6 },] },
    ];
    return DefaultLayoutAlignDirective;
}(LayoutAlignDirective));
/** @type {?} */
var layoutAlignHorizontalCache = new Map();
/** @type {?} */
var layoutAlignVerticalCache = new Map();
/** @type {?} */
var layoutAlignHorizontalRevCache = new Map();
/** @type {?} */
var layoutAlignVerticalRevCache = new Map();
/** @type {?} */
var layoutAlignHorizontalInlineCache = new Map();
/** @type {?} */
var layoutAlignVerticalInlineCache = new Map();
/** @type {?} */
var layoutAlignHorizontalRevInlineCache = new Map();
/** @type {?} */
var layoutAlignVerticalRevInlineCache = new Map();

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
var ALL_DIRECTIVES = [
    DefaultLayoutDirective,
    DefaultLayoutGapDirective,
    DefaultLayoutAlignDirective,
    DefaultFlexOrderDirective,
    DefaultFlexOffsetDirective,
    FlexFillDirective,
    DefaultFlexAlignDirective,
    DefaultFlexDirective,
];
/**
 * *****************************************************************
 * Define module for the Flex API
 * *****************************************************************
 */
var FlexModule = /** @class */ (function () {
    function FlexModule() {
    }
    FlexModule.decorators = [
        { type: NgModule, args: [{
                    imports: [CoreModule, BidiModule],
                    declarations: ALL_DIRECTIVES.slice(),
                    exports: ALL_DIRECTIVES.slice()
                },] },
    ];
    return FlexModule;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */

export { FlexModule, FlexStyleBuilder, FlexDirective, DefaultFlexDirective, FlexAlignStyleBuilder, FlexAlignDirective, DefaultFlexAlignDirective, FlexFillStyleBuilder, FlexFillDirective, FlexOffsetStyleBuilder, FlexOffsetDirective, DefaultFlexOffsetDirective, FlexOrderStyleBuilder, FlexOrderDirective, DefaultFlexOrderDirective, LayoutStyleBuilder, LayoutDirective, DefaultLayoutDirective, LayoutAlignStyleBuilder, LayoutAlignDirective, DefaultLayoutAlignDirective, LayoutGapStyleBuilder, LayoutGapDirective, DefaultLayoutGapDirective };
//# sourceMappingURL=flex.es5.js.map
