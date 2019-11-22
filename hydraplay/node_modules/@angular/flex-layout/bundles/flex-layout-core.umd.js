/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/common'), require('rxjs'), require('rxjs/operators')) :
	typeof define === 'function' && define.amd ? define('@angular/flex-layout/core', ['exports', '@angular/core', '@angular/common', 'rxjs', 'rxjs/operators'], factory) :
	(factory((global.ng = global.ng || {}, global.ng.flexLayout = global.ng.flexLayout || {}, global.ng.flexLayout.core = {}),global.ng.core,global.ng.common,global.rxjs,global.rxjs.operators));
}(this, (function (exports,core,common,rxjs,operators) { 'use strict';

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

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * Find all of the server-generated stylings, if any, and remove them
 * This will be in the form of inline classes and the style block in the
 * head of the DOM
 * @param {?} _document
 * @param {?} platformId
 * @return {?}
 */
function removeStyles(_document, platformId) {
    return function () {
        if (common.isPlatformBrowser(platformId)) {
            /** @type {?} */
            var elements = Array.from(_document.querySelectorAll("[class*=" + CLASS_NAME + "]"));
            /** @type {?} */
            var classRegex_1 = /\bflex-layout-.+?\b/g;
            elements.forEach(function (el) {
                el.classList.contains(CLASS_NAME + "ssr") && el.parentNode ?
                    el.parentNode.removeChild(el) : el.className.replace(classRegex_1, '');
            });
        }
    };
}
/** *
 *  Provider to remove SSR styles on the browser
  @type {?} */
var BROWSER_PROVIDER = {
    provide: /** @type {?} */ (core.APP_BOOTSTRAP_LISTENER),
    useFactory: removeStyles,
    deps: [common.DOCUMENT, core.PLATFORM_ID],
    multi: true
};
/** @type {?} */
var CLASS_NAME = 'flex-layout-';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * *****************************************************************
 * Define module for the MediaQuery API
 * *****************************************************************
 */
var CoreModule = /** @class */ (function () {
    function CoreModule() {
    }
    CoreModule.decorators = [
        { type: core.NgModule, args: [{
                    providers: [BROWSER_PROVIDER]
                },] },
    ];
    return CoreModule;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * Class instances emitted [to observers] for each mql notification
 */
var   /**
 * Class instances emitted [to observers] for each mql notification
 */
MediaChange = /** @class */ (function () {
    /**
     * @param matches whether the mediaQuery is currently activated
     * @param mediaQuery e.g. (min-width: 600px) and (max-width: 959px)
     * @param mqAlias e.g. gt-sm, md, gt-lg
     * @param suffix e.g. GtSM, Md, GtLg
     * @param priority the priority of activation for the given breakpoint
     */
    function MediaChange(matches, mediaQuery, mqAlias, suffix, priority) {
        if (matches === void 0) { matches = false; }
        if (mediaQuery === void 0) { mediaQuery = 'all'; }
        if (mqAlias === void 0) { mqAlias = ''; }
        if (suffix === void 0) { suffix = ''; }
        if (priority === void 0) { priority = 0; }
        this.matches = matches;
        this.mediaQuery = mediaQuery;
        this.mqAlias = mqAlias;
        this.suffix = suffix;
        this.priority = priority;
        this.property = '';
    }
    /** Create an exact copy of the MediaChange */
    /**
     * Create an exact copy of the MediaChange
     * @return {?}
     */
    MediaChange.prototype.clone = /**
     * Create an exact copy of the MediaChange
     * @return {?}
     */
    function () {
        return new MediaChange(this.matches, this.mediaQuery, this.mqAlias, this.suffix);
    };
    return MediaChange;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * Utility to emulate a CSS stylesheet
 *
 * This utility class stores all of the styles for a given HTML element
 * as a readonly `stylesheet` map.
 */
var StylesheetMap = /** @class */ (function () {
    function StylesheetMap() {
        this.stylesheet = new Map();
    }
    /**
     * Add an individual style to an HTML element
     */
    /**
     * Add an individual style to an HTML element
     * @param {?} element
     * @param {?} style
     * @param {?} value
     * @return {?}
     */
    StylesheetMap.prototype.addStyleToElement = /**
     * Add an individual style to an HTML element
     * @param {?} element
     * @param {?} style
     * @param {?} value
     * @return {?}
     */
    function (element, style, value) {
        /** @type {?} */
        var stylesheet = this.stylesheet.get(element);
        if (stylesheet) {
            stylesheet.set(style, value);
        }
        else {
            this.stylesheet.set(element, new Map([[style, value]]));
        }
    };
    /**
     * Clear the virtual stylesheet
     */
    /**
     * Clear the virtual stylesheet
     * @return {?}
     */
    StylesheetMap.prototype.clearStyles = /**
     * Clear the virtual stylesheet
     * @return {?}
     */
    function () {
        this.stylesheet.clear();
    };
    /**
     * Retrieve a given style for an HTML element
     */
    /**
     * Retrieve a given style for an HTML element
     * @param {?} el
     * @param {?} styleName
     * @return {?}
     */
    StylesheetMap.prototype.getStyleForElement = /**
     * Retrieve a given style for an HTML element
     * @param {?} el
     * @param {?} styleName
     * @return {?}
     */
    function (el, styleName) {
        /** @type {?} */
        var styles = this.stylesheet.get(el);
        /** @type {?} */
        var value = '';
        if (styles) {
            /** @type {?} */
            var style = styles.get(styleName);
            if (typeof style === 'number' || typeof style === 'string') {
                value = style + '';
            }
        }
        return value;
    };
    StylesheetMap.decorators = [
        { type: core.Injectable, args: [{ providedIn: 'root' },] },
    ];
    /** @nocollapse */ StylesheetMap.ngInjectableDef = core.defineInjectable({ factory: function StylesheetMap_Factory() { return new StylesheetMap(); }, token: StylesheetMap, providedIn: "root" });
    return StylesheetMap;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
var DEFAULT_CONFIG = {
    addFlexToParent: true,
    addOrientationBps: false,
    disableDefaultBps: false,
    disableVendorPrefixes: false,
    serverLoaded: false,
    useColumnBasisZero: true,
    printWithBreakpoints: [],
    mediaTriggerAutoRestore: true,
    ssrObserveBreakpoints: [],
};
/** @type {?} */
var LAYOUT_CONFIG = new core.InjectionToken('Flex Layout token, config options for the library', {
    providedIn: 'root',
    factory: function () { return DEFAULT_CONFIG; }
});

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** *
 * Token that is provided to tell whether the FlexLayoutServerModule
 * has been included in the bundle
 *
 * NOTE: This can be manually provided to disable styles when using SSR
  @type {?} */
var SERVER_TOKEN = new core.InjectionToken('FlexLayoutServerLoaded', {
    providedIn: 'root',
    factory: function () { return false; }
});

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
var BREAKPOINT = new core.InjectionToken('Flex Layout token, collect all breakpoints into one provider', {
    providedIn: 'root',
    factory: function () { return null; }
});

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * For the specified MediaChange, make sure it contains the breakpoint alias
 * and suffix (if available).
 * @param {?} dest
 * @param {?} source
 * @return {?}
 */
function mergeAlias(dest, source) {
    dest = dest ? dest.clone() : new MediaChange();
    if (source) {
        dest.mqAlias = source.alias;
        dest.mediaQuery = source.mediaQuery;
        dest.suffix = /** @type {?} */ (source.suffix);
        dest.priority = /** @type {?} */ (source.priority);
    }
    return dest;
}

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
/**
 * @abstract
 */
var   /**
 * @abstract
 */
BaseDirective2 = /** @class */ (function () {
    function BaseDirective2(elementRef, styleBuilder, styler, marshal) {
        this.elementRef = elementRef;
        this.styleBuilder = styleBuilder;
        this.styler = styler;
        this.marshal = marshal;
        this.DIRECTIVE_KEY = '';
        this.inputs = [];
        /**
         * The most recently used styles for the builder
         */
        this.mru = {};
        this.destroySubject = new rxjs.Subject();
        /**
         * Cache map for style computation
         */
        this.styleCache = new Map();
    }
    Object.defineProperty(BaseDirective2.prototype, "parentElement", {
        /** Access to host element's parent DOM node */
        get: /**
         * Access to host element's parent DOM node
         * @return {?}
         */
        function () {
            return this.elementRef.nativeElement.parentElement;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseDirective2.prototype, "nativeElement", {
        /** Access to the HTMLElement for the directive */
        get: /**
         * Access to the HTMLElement for the directive
         * @return {?}
         */
        function () {
            return this.elementRef.nativeElement;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseDirective2.prototype, "activatedValue", {
        /** Access to the activated value for the directive */
        get: /**
         * Access to the activated value for the directive
         * @return {?}
         */
        function () {
            return this.marshal.getValue(this.nativeElement, this.DIRECTIVE_KEY);
        },
        set: /**
         * @param {?} value
         * @return {?}
         */
        function (value) {
            this.marshal.setValue(this.nativeElement, this.DIRECTIVE_KEY, value, this.marshal.activatedAlias);
        },
        enumerable: true,
        configurable: true
    });
    /** For @Input changes */
    /**
     * For \@Input changes
     * @param {?} changes
     * @return {?}
     */
    BaseDirective2.prototype.ngOnChanges = /**
     * For \@Input changes
     * @param {?} changes
     * @return {?}
     */
    function (changes) {
        var _this = this;
        Object.keys(changes).forEach(function (key) {
            if (_this.inputs.indexOf(key) !== -1) {
                /** @type {?} */
                var bp = key.split('.').slice(1).join('.');
                /** @type {?} */
                var val = changes[key].currentValue;
                _this.setValue(val, bp);
            }
        });
    };
    /**
     * @return {?}
     */
    BaseDirective2.prototype.ngOnDestroy = /**
     * @return {?}
     */
    function () {
        this.destroySubject.next();
        this.destroySubject.complete();
        this.marshal.releaseElement(this.nativeElement);
    };
    /** Register with central marshaller service */
    /**
     * Register with central marshaller service
     * @param {?=} extraTriggers
     * @return {?}
     */
    BaseDirective2.prototype.init = /**
     * Register with central marshaller service
     * @param {?=} extraTriggers
     * @return {?}
     */
    function (extraTriggers) {
        if (extraTriggers === void 0) { extraTriggers = []; }
        this.marshal.init(this.elementRef.nativeElement, this.DIRECTIVE_KEY, this.updateWithValue.bind(this), this.clearStyles.bind(this), extraTriggers);
    };
    /** Add styles to the element using predefined style builder */
    /**
     * Add styles to the element using predefined style builder
     * @param {?} input
     * @param {?=} parent
     * @return {?}
     */
    BaseDirective2.prototype.addStyles = /**
     * Add styles to the element using predefined style builder
     * @param {?} input
     * @param {?=} parent
     * @return {?}
     */
    function (input, parent) {
        /** @type {?} */
        var builder = this.styleBuilder;
        /** @type {?} */
        var useCache = builder.shouldCache;
        /** @type {?} */
        var genStyles = this.styleCache.get(input);
        if (!genStyles || !useCache) {
            genStyles = builder.buildStyles(input, parent);
            if (useCache) {
                this.styleCache.set(input, genStyles);
            }
        }
        this.mru = __assign({}, genStyles);
        this.applyStyleToElement(genStyles);
        builder.sideEffect(input, genStyles, parent);
    };
    /** Remove generated styles from an element using predefined style builder */
    /**
     * Remove generated styles from an element using predefined style builder
     * @return {?}
     */
    BaseDirective2.prototype.clearStyles = /**
     * Remove generated styles from an element using predefined style builder
     * @return {?}
     */
    function () {
        var _this = this;
        Object.keys(this.mru).forEach(function (k) {
            _this.mru[k] = '';
        });
        this.applyStyleToElement(this.mru);
        this.mru = {};
    };
    /** Force trigger style updates on DOM element */
    /**
     * Force trigger style updates on DOM element
     * @return {?}
     */
    BaseDirective2.prototype.triggerUpdate = /**
     * Force trigger style updates on DOM element
     * @return {?}
     */
    function () {
        this.marshal.triggerUpdate(this.nativeElement, this.DIRECTIVE_KEY);
    };
    /**
     * Determine the DOM element's Flexbox flow (flex-direction).
     *
     * Check inline style first then check computed (stylesheet) style.
     * And optionally add the flow value to element's inline style.
     */
    /**
     * Determine the DOM element's Flexbox flow (flex-direction).
     *
     * Check inline style first then check computed (stylesheet) style.
     * And optionally add the flow value to element's inline style.
     * @param {?} target
     * @param {?=} addIfMissing
     * @return {?}
     */
    BaseDirective2.prototype.getFlexFlowDirection = /**
     * Determine the DOM element's Flexbox flow (flex-direction).
     *
     * Check inline style first then check computed (stylesheet) style.
     * And optionally add the flow value to element's inline style.
     * @param {?} target
     * @param {?=} addIfMissing
     * @return {?}
     */
    function (target, addIfMissing) {
        if (addIfMissing === void 0) { addIfMissing = false; }
        if (target) {
            var _a = this.styler.getFlowDirection(target), value = _a[0], hasInlineValue = _a[1];
            if (!hasInlineValue && addIfMissing) {
                /** @type {?} */
                var style = buildLayoutCSS(value);
                /** @type {?} */
                var elements = [target];
                this.styler.applyStyleToElements(style, elements);
            }
            return value.trim();
        }
        return 'row';
    };
    /** Applies styles given via string pair or object map to the directive element */
    /**
     * Applies styles given via string pair or object map to the directive element
     * @param {?} style
     * @param {?=} value
     * @param {?=} element
     * @return {?}
     */
    BaseDirective2.prototype.applyStyleToElement = /**
     * Applies styles given via string pair or object map to the directive element
     * @param {?} style
     * @param {?=} value
     * @param {?=} element
     * @return {?}
     */
    function (style, value, element) {
        if (element === void 0) { element = this.nativeElement; }
        this.styler.applyStyleToElement(element, style, value);
    };
    /**
     * @param {?} val
     * @param {?} bp
     * @return {?}
     */
    BaseDirective2.prototype.setValue = /**
     * @param {?} val
     * @param {?} bp
     * @return {?}
     */
    function (val, bp) {
        this.marshal.setValue(this.nativeElement, this.DIRECTIVE_KEY, val, bp);
    };
    /**
     * @param {?} input
     * @return {?}
     */
    BaseDirective2.prototype.updateWithValue = /**
     * @param {?} input
     * @return {?}
     */
    function (input) {
        this.addStyles(input);
    };
    return BaseDirective2;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** *
 * NOTE: Smaller ranges have HIGHER priority since the match is more specific
  @type {?} */
var DEFAULT_BREAKPOINTS = [
    {
        alias: 'xs',
        mediaQuery: 'screen and (min-width: 0px) and (max-width: 599.99px)',
        priority: 1000,
    },
    {
        alias: 'sm',
        mediaQuery: 'screen and (min-width: 600px) and (max-width: 959.99px)',
        priority: 900,
    },
    {
        alias: 'md',
        mediaQuery: 'screen and (min-width: 960px) and (max-width: 1279.99px)',
        priority: 800,
    },
    {
        alias: 'lg',
        mediaQuery: 'screen and (min-width: 1280px) and (max-width: 1919.99px)',
        priority: 700,
    },
    {
        alias: 'xl',
        mediaQuery: 'screen and (min-width: 1920px) and (max-width: 4999.99px)',
        priority: 600,
    },
    {
        alias: 'lt-sm',
        overlapping: true,
        mediaQuery: 'screen and (max-width: 599.99px)',
        priority: 950,
    },
    {
        alias: 'lt-md',
        overlapping: true,
        mediaQuery: 'screen and (max-width: 959.99px)',
        priority: 850,
    },
    {
        alias: 'lt-lg',
        overlapping: true,
        mediaQuery: 'screen and (max-width: 1279.99px)',
        priority: 750,
    },
    {
        alias: 'lt-xl',
        overlapping: true,
        priority: 650,
        mediaQuery: 'screen and (max-width: 1919.99px)',
    },
    {
        alias: 'gt-xs',
        overlapping: true,
        mediaQuery: 'screen and (min-width: 600px)',
        priority: -950,
    },
    {
        alias: 'gt-sm',
        overlapping: true,
        mediaQuery: 'screen and (min-width: 960px)',
        priority: -850,
    }, {
        alias: 'gt-md',
        overlapping: true,
        mediaQuery: 'screen and (min-width: 1280px)',
        priority: -750,
    },
    {
        alias: 'gt-lg',
        overlapping: true,
        mediaQuery: 'screen and (min-width: 1920px)',
        priority: -650,
    }
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */

/** @type {?} */
var HANDSET_PORTRAIT = '(orientation: portrait) and (max-width: 599.99px)';
/** @type {?} */
var HANDSET_LANDSCAPE = '(orientation: landscape) and (max-width: 959.99px)';
/** @type {?} */
var TABLET_PORTRAIT = '(orientation: portrait) and (min-width: 600px) and (max-width: 839.99px)';
/** @type {?} */
var TABLET_LANDSCAPE = '(orientation: landscape) and (min-width: 960px) and (max-width: 1279.99px)';
/** @type {?} */
var WEB_PORTRAIT = '(orientation: portrait) and (min-width: 840px)';
/** @type {?} */
var WEB_LANDSCAPE = '(orientation: landscape) and (min-width: 1280px)';
/** @type {?} */
var ScreenTypes = {
    'HANDSET': HANDSET_PORTRAIT + ", " + HANDSET_LANDSCAPE,
    'TABLET': TABLET_PORTRAIT + " , " + TABLET_LANDSCAPE,
    'WEB': WEB_PORTRAIT + ", " + WEB_LANDSCAPE + " ",
    'HANDSET_PORTRAIT': "" + HANDSET_PORTRAIT,
    'TABLET_PORTRAIT': TABLET_PORTRAIT + " ",
    'WEB_PORTRAIT': "" + WEB_PORTRAIT,
    'HANDSET_LANDSCAPE': HANDSET_LANDSCAPE + "]",
    'TABLET_LANDSCAPE': "" + TABLET_LANDSCAPE,
    'WEB_LANDSCAPE': "" + WEB_LANDSCAPE
};
/** *
 * Extended Breakpoints for handset/tablets with landscape or portrait orientations
  @type {?} */
var ORIENTATION_BREAKPOINTS = [
    { 'alias': 'handset', priority: 2000, 'mediaQuery': ScreenTypes.HANDSET },
    { 'alias': 'handset.landscape', priority: 2000, 'mediaQuery': ScreenTypes.HANDSET_LANDSCAPE },
    { 'alias': 'handset.portrait', priority: 2000, 'mediaQuery': ScreenTypes.HANDSET_PORTRAIT },
    { 'alias': 'tablet', priority: 2100, 'mediaQuery': ScreenTypes.TABLET },
    { 'alias': 'tablet.landscape', priority: 2100, 'mediaQuery': ScreenTypes.TABLET },
    { 'alias': 'tablet.portrait', priority: 2100, 'mediaQuery': ScreenTypes.TABLET_PORTRAIT },
    { 'alias': 'web', priority: 2200, 'mediaQuery': ScreenTypes.WEB, overlapping: true },
    { 'alias': 'web.landscape', priority: 2200, 'mediaQuery': ScreenTypes.WEB_LANDSCAPE, overlapping: true },
    { 'alias': 'web.portrait', priority: 2200, 'mediaQuery': ScreenTypes.WEB_PORTRAIT, overlapping: true }
];

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
/** @type {?} */
var ALIAS_DELIMITERS = /(\.|-|_)/g;
/**
 * @param {?} part
 * @return {?}
 */
function firstUpperCase(part) {
    /** @type {?} */
    var first = part.length > 0 ? part.charAt(0) : '';
    /** @type {?} */
    var remainder = (part.length > 1) ? part.slice(1) : '';
    return first.toUpperCase() + remainder;
}
/**
 * Converts snake-case to SnakeCase.
 * @param {?} name Text to UpperCamelCase
 * @return {?}
 */
function camelCase(name) {
    return name
        .replace(ALIAS_DELIMITERS, '|')
        .split('|')
        .map(firstUpperCase)
        .join('');
}
/**
 * For each breakpoint, ensure that a Suffix is defined;
 * fallback to UpperCamelCase the unique Alias value
 * @param {?} list
 * @return {?}
 */
function validateSuffixes(list) {
    list.forEach(function (bp) {
        if (!bp.suffix) {
            bp.suffix = camelCase(bp.alias); // create Suffix value based on alias
            bp.overlapping = !!bp.overlapping; // ensure default value
        }
    });
    return list;
}
/**
 * Merge a custom breakpoint list with the default list based on unique alias values
 *  - Items are added if the alias is not in the default list
 *  - Items are merged with the custom override if the alias exists in the default list
 * @param {?} defaults
 * @param {?=} custom
 * @return {?}
 */
function mergeByAlias(defaults, custom) {
    if (custom === void 0) { custom = []; }
    /** @type {?} */
    var dict = {};
    defaults.forEach(function (bp) {
        dict[bp.alias] = bp;
    });
    // Merge custom breakpoints
    custom.forEach(function (bp) {
        if (dict[bp.alias]) {
            extendObject(dict[bp.alias], bp);
        }
        else {
            dict[bp.alias] = bp;
        }
    });
    return validateSuffixes(Object.keys(dict).map(function (k) { return dict[k]; }));
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** *
 *  Injection token unique to the flex-layout library.
 *  Use this token when build a custom provider (see below).
  @type {?} */
var BREAKPOINTS = new core.InjectionToken('Token (@angular/flex-layout) Breakpoints', {
    providedIn: 'root',
    factory: function () {
        /** @type {?} */
        var breakpoints = core.inject(BREAKPOINT);
        /** @type {?} */
        var layoutConfig = core.inject(LAYOUT_CONFIG);
        /** @type {?} */
        var bpFlattenArray = [].concat.apply([], (breakpoints || [])
            .map(function (v) { return Array.isArray(v) ? v : [v]; }));
        /** @type {?} */
        var builtIns = (layoutConfig.disableDefaultBps ? [] : DEFAULT_BREAKPOINTS)
            .concat(layoutConfig.addOrientationBps ? ORIENTATION_BREAKPOINTS : []);
        return mergeByAlias(builtIns, bpFlattenArray);
    }
});

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * HOF to sort the breakpoints by descending priority
 * @template T
 * @param {?} a
 * @param {?} b
 * @return {?}
 */
function sortDescendingPriority(a, b) {
    /** @type {?} */
    var priorityA = a ? a.priority || 0 : 0;
    /** @type {?} */
    var priorityB = b ? b.priority || 0 : 0;
    return priorityB - priorityA;
}
/**
 * HOF to sort the breakpoints by ascending priority
 * @template T
 * @param {?} a
 * @param {?} b
 * @return {?}
 */
function sortAscendingPriority(a, b) {
    /** @type {?} */
    var pA = a.priority || 0;
    /** @type {?} */
    var pB = b.priority || 0;
    return pA - pB;
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * Registry of 1..n MediaQuery breakpoint ranges
 * This is published as a provider and may be overridden from custom, application-specific ranges
 *
 */
var BreakPointRegistry = /** @class */ (function () {
    function BreakPointRegistry(list) {
        /**
         * Memoized BreakPoint Lookups
         */
        this.findByMap = new Map();
        this.items = list.slice().sort(sortAscendingPriority);
    }
    /**
     * Search breakpoints by alias (e.g. gt-xs)
     */
    /**
     * Search breakpoints by alias (e.g. gt-xs)
     * @param {?} alias
     * @return {?}
     */
    BreakPointRegistry.prototype.findByAlias = /**
     * Search breakpoints by alias (e.g. gt-xs)
     * @param {?} alias
     * @return {?}
     */
    function (alias) {
        return !alias ? null : this.findWithPredicate(alias, function (bp) { return bp.alias == alias; });
    };
    /**
     * @param {?} query
     * @return {?}
     */
    BreakPointRegistry.prototype.findByQuery = /**
     * @param {?} query
     * @return {?}
     */
    function (query) {
        return this.findWithPredicate(query, function (bp) { return bp.mediaQuery == query; });
    };
    Object.defineProperty(BreakPointRegistry.prototype, "overlappings", {
        /**
         * Get all the breakpoints whose ranges could overlapping `normal` ranges;
         * e.g. gt-sm overlaps md, lg, and xl
         */
        get: /**
         * Get all the breakpoints whose ranges could overlapping `normal` ranges;
         * e.g. gt-sm overlaps md, lg, and xl
         * @return {?}
         */
        function () {
            return this.items.filter(function (it) { return it.overlapping == true; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BreakPointRegistry.prototype, "aliases", {
        /**
         * Get list of all registered (non-empty) breakpoint aliases
         */
        get: /**
         * Get list of all registered (non-empty) breakpoint aliases
         * @return {?}
         */
        function () {
            return this.items.map(function (it) { return it.alias; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BreakPointRegistry.prototype, "suffixes", {
        /**
         * Aliases are mapped to properties using suffixes
         * e.g.  'gt-sm' for property 'layout'  uses suffix 'GtSm'
         * for property layoutGtSM.
         */
        get: /**
         * Aliases are mapped to properties using suffixes
         * e.g.  'gt-sm' for property 'layout'  uses suffix 'GtSm'
         * for property layoutGtSM.
         * @return {?}
         */
        function () {
            return this.items.map(function (it) { return !!it.suffix ? it.suffix : ''; });
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Memoized lookup using custom predicate function
     * @param {?} key
     * @param {?} searchFn
     * @return {?}
     */
    BreakPointRegistry.prototype.findWithPredicate = /**
     * Memoized lookup using custom predicate function
     * @param {?} key
     * @param {?} searchFn
     * @return {?}
     */
    function (key, searchFn) {
        /** @type {?} */
        var response = this.findByMap.get(key);
        if (!response) {
            response = this.items.find(searchFn) || null;
            this.findByMap.set(key, response);
        }
        return response || null;
    };
    BreakPointRegistry.decorators = [
        { type: core.Injectable, args: [{ providedIn: 'root' },] },
    ];
    /** @nocollapse */
    BreakPointRegistry.ctorParameters = function () { return [
        { type: Array, decorators: [{ type: core.Inject, args: [BREAKPOINTS,] }] }
    ]; };
    /** @nocollapse */ BreakPointRegistry.ngInjectableDef = core.defineInjectable({ factory: function BreakPointRegistry_Factory() { return new BreakPointRegistry(core.inject(BREAKPOINTS)); }, token: BreakPointRegistry, providedIn: "root" });
    return BreakPointRegistry;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * MediaMonitor configures listeners to mediaQuery changes and publishes an Observable facade to
 * convert mediaQuery change callbacks to subscriber notifications. These notifications will be
 * performed within the ng Zone to trigger change detections and component updates.
 *
 * NOTE: both mediaQuery activations and de-activations are announced in notifications
 */
var MatchMedia = /** @class */ (function () {
    function MatchMedia(_zone, _platformId, _document) {
        this._zone = _zone;
        this._platformId = _platformId;
        this._document = _document;
        /**
         * Initialize source with 'all' so all non-responsive APIs trigger style updates
         */
        this.source = new rxjs.BehaviorSubject(new MediaChange(true));
        this.registry = new Map();
        this._observable$ = this.source.asObservable();
    }
    Object.defineProperty(MatchMedia.prototype, "activations", {
        /**
         * Publish list of all current activations
         */
        get: /**
         * Publish list of all current activations
         * @return {?}
         */
        function () {
            /** @type {?} */
            var results = [];
            this.registry.forEach(function (mql, key) {
                if (mql.matches) {
                    results.push(key);
                }
            });
            return results;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * For the specified mediaQuery?
     */
    /**
     * For the specified mediaQuery?
     * @param {?} mediaQuery
     * @return {?}
     */
    MatchMedia.prototype.isActive = /**
     * For the specified mediaQuery?
     * @param {?} mediaQuery
     * @return {?}
     */
    function (mediaQuery) {
        /** @type {?} */
        var mql = this.registry.get(mediaQuery);
        return !!mql ? mql.matches : false;
    };
    /**
     * External observers can watch for all (or a specific) mql changes.
     * Typically used by the MediaQueryAdaptor; optionally available to components
     * who wish to use the MediaMonitor as mediaMonitor$ observable service.
     *
     * Use deferred registration process to register breakpoints only on subscription
     * This logic also enforces logic to register all mediaQueries BEFORE notify
     * subscribers of notifications.
     */
    /**
     * External observers can watch for all (or a specific) mql changes.
     * Typically used by the MediaQueryAdaptor; optionally available to components
     * who wish to use the MediaMonitor as mediaMonitor$ observable service.
     *
     * Use deferred registration process to register breakpoints only on subscription
     * This logic also enforces logic to register all mediaQueries BEFORE notify
     * subscribers of notifications.
     * @param {?=} mqList
     * @param {?=} filterOthers
     * @return {?}
     */
    MatchMedia.prototype.observe = /**
     * External observers can watch for all (or a specific) mql changes.
     * Typically used by the MediaQueryAdaptor; optionally available to components
     * who wish to use the MediaMonitor as mediaMonitor$ observable service.
     *
     * Use deferred registration process to register breakpoints only on subscription
     * This logic also enforces logic to register all mediaQueries BEFORE notify
     * subscribers of notifications.
     * @param {?=} mqList
     * @param {?=} filterOthers
     * @return {?}
     */
    function (mqList, filterOthers) {
        var _this = this;
        if (filterOthers === void 0) { filterOthers = false; }
        if (mqList && mqList.length) {
            /** @type {?} */
            var matchMedia$ = this._observable$.pipe(operators.filter(function (change) {
                return !filterOthers ? true : (mqList.indexOf(change.mediaQuery) > -1);
            }));
            /** @type {?} */
            var registration$ = new rxjs.Observable(function (observer) {
                /** @type {?} */
                var matches = _this.registerQuery(mqList);
                if (matches.length) {
                    /** @type {?} */
                    var lastChange = /** @type {?} */ ((matches.pop()));
                    matches.forEach(function (e) {
                        observer.next(e);
                    });
                    _this.source.next(lastChange); // last match is cached
                }
                observer.complete();
            });
            return rxjs.merge(registration$, matchMedia$);
        }
        return this._observable$;
    };
    /**
     * Based on the BreakPointRegistry provider, register internal listeners for each unique
     * mediaQuery. Each listener emits specific MediaChange data to observers
     */
    /**
     * Based on the BreakPointRegistry provider, register internal listeners for each unique
     * mediaQuery. Each listener emits specific MediaChange data to observers
     * @param {?} mediaQuery
     * @return {?}
     */
    MatchMedia.prototype.registerQuery = /**
     * Based on the BreakPointRegistry provider, register internal listeners for each unique
     * mediaQuery. Each listener emits specific MediaChange data to observers
     * @param {?} mediaQuery
     * @return {?}
     */
    function (mediaQuery) {
        var _this = this;
        /** @type {?} */
        var list = Array.isArray(mediaQuery) ? mediaQuery : [mediaQuery];
        /** @type {?} */
        var matches = [];
        buildQueryCss(list, this._document);
        list.forEach(function (query) {
            /** @type {?} */
            var onMQLEvent = function (e) {
                _this._zone.run(function () { return _this.source.next(new MediaChange(e.matches, query)); });
            };
            /** @type {?} */
            var mql = _this.registry.get(query);
            if (!mql) {
                mql = _this.buildMQL(query);
                mql.addListener(onMQLEvent);
                _this.registry.set(query, mql);
            }
            if (mql.matches) {
                matches.push(new MediaChange(true, query));
            }
        });
        return matches;
    };
    /**
     * Call window.matchMedia() to build a MediaQueryList; which
     * supports 0..n listeners for activation/deactivation
     */
    /**
     * Call window.matchMedia() to build a MediaQueryList; which
     * supports 0..n listeners for activation/deactivation
     * @param {?} query
     * @return {?}
     */
    MatchMedia.prototype.buildMQL = /**
     * Call window.matchMedia() to build a MediaQueryList; which
     * supports 0..n listeners for activation/deactivation
     * @param {?} query
     * @return {?}
     */
    function (query) {
        return constructMql(query, common.isPlatformBrowser(this._platformId));
    };
    MatchMedia.decorators = [
        { type: core.Injectable, args: [{ providedIn: 'root' },] },
    ];
    /** @nocollapse */
    MatchMedia.ctorParameters = function () { return [
        { type: core.NgZone },
        { type: Object, decorators: [{ type: core.Inject, args: [core.PLATFORM_ID,] }] },
        { type: undefined, decorators: [{ type: core.Inject, args: [common.DOCUMENT,] }] }
    ]; };
    /** @nocollapse */ MatchMedia.ngInjectableDef = core.defineInjectable({ factory: function MatchMedia_Factory() { return new MatchMedia(core.inject(core.NgZone), core.inject(core.PLATFORM_ID), core.inject(common.DOCUMENT)); }, token: MatchMedia, providedIn: "root" });
    return MatchMedia;
}());
/** *
 * Private global registry for all dynamically-created, injected style tags
 * @see prepare(query)
  @type {?} */
var ALL_STYLES = {};
/**
 * For Webkit engines that only trigger the MediaQueryList Listener
 * when there is at least one CSS selector for the respective media query.
 *
 * @param {?} mediaQueries
 * @param {?} _document
 * @return {?}
 */
function buildQueryCss(mediaQueries, _document) {
    /** @type {?} */
    var list = mediaQueries.filter(function (it) { return !ALL_STYLES[it]; });
    if (list.length > 0) {
        /** @type {?} */
        var query = list.join(', ');
        try {
            /** @type {?} */
            var styleEl_1 = _document.createElement('style');
            styleEl_1.setAttribute('type', 'text/css');
            if (!(/** @type {?} */ (styleEl_1)).styleSheet) {
                /** @type {?} */
                var cssText = "\n/*\n  @angular/flex-layout - workaround for possible browser quirk with mediaQuery listeners\n  see http://bit.ly/2sd4HMP\n*/\n@media " + query + " {.fx-query-test{ }}\n";
                styleEl_1.appendChild(_document.createTextNode(cssText));
            } /** @type {?} */
            ((_document.head)).appendChild(styleEl_1);
            // Store in private global registry
            list.forEach(function (mq) { return ALL_STYLES[mq] = styleEl_1; });
        }
        catch (e) {
            console.error(e);
        }
    }
}
/**
 * @param {?} query
 * @param {?} isBrowser
 * @return {?}
 */
function constructMql(query, isBrowser) {
    /** @type {?} */
    var canListen = isBrowser && !!(/** @type {?} */ (window)).matchMedia('all').addListener;
    return canListen ? (/** @type {?} */ (window)).matchMedia(query) : /** @type {?} */ (({
        matches: query === 'all' || query === '',
        media: query,
        addListener: function () {
        },
        removeListener: function () {
        }
    }));
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * MockMatchMedia mocks calls to the Window API matchMedia with a build of a simulated
 * MockMediaQueryListener. Methods are available to simulate an activation of a mediaQuery
 * range and to clearAll mediaQuery listeners.
 */
var MockMatchMedia = /** @class */ (function (_super) {
    __extends(MockMatchMedia, _super);
    function MockMatchMedia(_zone, _platformId, _document, _breakpoints) {
        var _this = _super.call(this, _zone, _platformId, _document) || this;
        _this._breakpoints = _breakpoints;
        _this.autoRegisterQueries = true; // Used for testing BreakPoint registrations
        _this.useOverlaps = false;
        return _this;
    }
    /** Easy method to clear all listeners for all mediaQueries */
    /**
     * Easy method to clear all listeners for all mediaQueries
     * @return {?}
     */
    MockMatchMedia.prototype.clearAll = /**
     * Easy method to clear all listeners for all mediaQueries
     * @return {?}
     */
    function () {
        this.registry.forEach(function (mql) {
            (/** @type {?} */ (mql)).destroy();
        });
        this.registry.clear();
        this.useOverlaps = false;
    };
    /** Feature to support manual, simulated activation of a mediaQuery. */
    /**
     * Feature to support manual, simulated activation of a mediaQuery.
     * @param {?} mediaQuery
     * @param {?=} useOverlaps
     * @return {?}
     */
    MockMatchMedia.prototype.activate = /**
     * Feature to support manual, simulated activation of a mediaQuery.
     * @param {?} mediaQuery
     * @param {?=} useOverlaps
     * @return {?}
     */
    function (mediaQuery, useOverlaps) {
        if (useOverlaps === void 0) { useOverlaps = false; }
        useOverlaps = useOverlaps || this.useOverlaps;
        mediaQuery = this._validateQuery(mediaQuery);
        if (useOverlaps || !this.isActive(mediaQuery)) {
            this._deactivateAll();
            this._registerMediaQuery(mediaQuery);
            this._activateWithOverlaps(mediaQuery, useOverlaps);
        }
        return this.hasActivated;
    };
    /** Converts an optional mediaQuery alias to a specific, valid mediaQuery */
    /**
     * Converts an optional mediaQuery alias to a specific, valid mediaQuery
     * @param {?} queryOrAlias
     * @return {?}
     */
    MockMatchMedia.prototype._validateQuery = /**
     * Converts an optional mediaQuery alias to a specific, valid mediaQuery
     * @param {?} queryOrAlias
     * @return {?}
     */
    function (queryOrAlias) {
        /** @type {?} */
        var bp = this._breakpoints.findByAlias(queryOrAlias);
        return (bp && bp.mediaQuery) || queryOrAlias;
    };
    /**
     * Manually onMediaChange any overlapping mediaQueries to simulate
     * similar functionality in the window.matchMedia()
     * @param {?} mediaQuery
     * @param {?} useOverlaps
     * @return {?}
     */
    MockMatchMedia.prototype._activateWithOverlaps = /**
     * Manually onMediaChange any overlapping mediaQueries to simulate
     * similar functionality in the window.matchMedia()
     * @param {?} mediaQuery
     * @param {?} useOverlaps
     * @return {?}
     */
    function (mediaQuery, useOverlaps) {
        if (useOverlaps) {
            /** @type {?} */
            var bp = this._breakpoints.findByQuery(mediaQuery);
            /** @type {?} */
            var alias = bp ? bp.alias : 'unknown';
            // Simulate activation of overlapping lt-<XXX> ranges
            switch (alias) {
                case 'lg':
                    this._activateByAlias('lt-xl');
                    break;
                case 'md':
                    this._activateByAlias('lt-xl, lt-lg');
                    break;
                case 'sm':
                    this._activateByAlias('lt-xl, lt-lg, lt-md');
                    break;
                case 'xs':
                    this._activateByAlias('lt-xl, lt-lg, lt-md, lt-sm');
                    break;
            }
            // Simulate activation of overlapping gt-<xxxx> mediaQuery ranges
            switch (alias) {
                case 'xl':
                    this._activateByAlias('gt-lg, gt-md, gt-sm, gt-xs');
                    break;
                case 'lg':
                    this._activateByAlias('gt-md, gt-sm, gt-xs');
                    break;
                case 'md':
                    this._activateByAlias('gt-sm, gt-xs');
                    break;
                case 'sm':
                    this._activateByAlias('gt-xs');
                    break;
            }
        }
        // Activate last since the responsiveActivation is watching *this* mediaQuery
        return this._activateByQuery(mediaQuery);
    };
    /**
     *
     * @param {?} aliases
     * @return {?}
     */
    MockMatchMedia.prototype._activateByAlias = /**
     *
     * @param {?} aliases
     * @return {?}
     */
    function (aliases) {
        var _this = this;
        /** @type {?} */
        var activate = function (alias) {
            /** @type {?} */
            var bp = _this._breakpoints.findByAlias(alias);
            _this._activateByQuery(bp ? bp.mediaQuery : alias);
        };
        aliases.split(',').forEach(function (alias) { return activate(alias.trim()); });
    };
    /**
     *
     * @param {?} mediaQuery
     * @return {?}
     */
    MockMatchMedia.prototype._activateByQuery = /**
     *
     * @param {?} mediaQuery
     * @return {?}
     */
    function (mediaQuery) {
        /** @type {?} */
        var mql = /** @type {?} */ (this.registry.get(mediaQuery));
        if (mql && !this.isActive(mediaQuery)) {
            this.registry.set(mediaQuery, mql.activate());
        }
        return this.hasActivated;
    };
    /**
     * Deactivate all current MQLs and reset the buffer
     * @return {?}
     */
    MockMatchMedia.prototype._deactivateAll = /**
     * Deactivate all current MQLs and reset the buffer
     * @return {?}
     */
    function () {
        this.registry.forEach(function (it) {
            (/** @type {?} */ (it)).deactivate();
        });
        return this;
    };
    /**
     * Insure the mediaQuery is registered with MatchMedia
     * @param {?} mediaQuery
     * @return {?}
     */
    MockMatchMedia.prototype._registerMediaQuery = /**
     * Insure the mediaQuery is registered with MatchMedia
     * @param {?} mediaQuery
     * @return {?}
     */
    function (mediaQuery) {
        if (!this.registry.has(mediaQuery) && this.autoRegisterQueries) {
            this.registerQuery(mediaQuery);
        }
    };
    /**
     * Call window.matchMedia() to build a MediaQueryList; which
     * supports 0..n listeners for activation/deactivation
     */
    /**
     * Call window.matchMedia() to build a MediaQueryList; which
     * supports 0..n listeners for activation/deactivation
     * @param {?} query
     * @return {?}
     */
    MockMatchMedia.prototype.buildMQL = /**
     * Call window.matchMedia() to build a MediaQueryList; which
     * supports 0..n listeners for activation/deactivation
     * @param {?} query
     * @return {?}
     */
    function (query) {
        return new MockMediaQueryList(query);
    };
    Object.defineProperty(MockMatchMedia.prototype, "hasActivated", {
        get: /**
         * @return {?}
         */
        function () {
            return this.activations.length > 0;
        },
        enumerable: true,
        configurable: true
    });
    MockMatchMedia.decorators = [
        { type: core.Injectable },
    ];
    /** @nocollapse */
    MockMatchMedia.ctorParameters = function () { return [
        { type: core.NgZone },
        { type: Object, decorators: [{ type: core.Inject, args: [core.PLATFORM_ID,] }] },
        { type: undefined, decorators: [{ type: core.Inject, args: [common.DOCUMENT,] }] },
        { type: BreakPointRegistry }
    ]; };
    return MockMatchMedia;
}(MatchMedia));
/**
 * Special internal class to simulate a MediaQueryList and
 * - supports manual activation to simulate mediaQuery matching
 * - manages listeners
 */
var /**
 * Special internal class to simulate a MediaQueryList and
 * - supports manual activation to simulate mediaQuery matching
 * - manages listeners
 */
MockMediaQueryList = /** @class */ (function () {
    function MockMediaQueryList(_mediaQuery) {
        this._mediaQuery = _mediaQuery;
        this._isActive = false;
        this._listeners = [];
        this.onchange = null;
    }
    Object.defineProperty(MockMediaQueryList.prototype, "matches", {
        get: /**
         * @return {?}
         */
        function () {
            return this._isActive;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MockMediaQueryList.prototype, "media", {
        get: /**
         * @return {?}
         */
        function () {
            return this._mediaQuery;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Destroy the current list by deactivating the
     * listeners and clearing the internal list
     */
    /**
     * Destroy the current list by deactivating the
     * listeners and clearing the internal list
     * @return {?}
     */
    MockMediaQueryList.prototype.destroy = /**
     * Destroy the current list by deactivating the
     * listeners and clearing the internal list
     * @return {?}
     */
    function () {
        this.deactivate();
        this._listeners = [];
    };
    /** Notify all listeners that 'matches === TRUE' */
    /**
     * Notify all listeners that 'matches === TRUE'
     * @return {?}
     */
    MockMediaQueryList.prototype.activate = /**
     * Notify all listeners that 'matches === TRUE'
     * @return {?}
     */
    function () {
        var _this = this;
        if (!this._isActive) {
            this._isActive = true;
            this._listeners.forEach(function (callback) {
                /** @type {?} */
                var cb = /** @type {?} */ ((callback));
                cb.call(null, _this);
            });
        }
        return this;
    };
    /** Notify all listeners that 'matches === false' */
    /**
     * Notify all listeners that 'matches === false'
     * @return {?}
     */
    MockMediaQueryList.prototype.deactivate = /**
     * Notify all listeners that 'matches === false'
     * @return {?}
     */
    function () {
        var _this = this;
        if (this._isActive) {
            this._isActive = false;
            this._listeners.forEach(function (callback) {
                /** @type {?} */
                var cb = /** @type {?} */ ((callback));
                cb.call(null, _this);
            });
        }
        return this;
    };
    /** Add a listener to our internal list to activate later */
    /**
     * Add a listener to our internal list to activate later
     * @param {?} listener
     * @return {?}
     */
    MockMediaQueryList.prototype.addListener = /**
     * Add a listener to our internal list to activate later
     * @param {?} listener
     * @return {?}
     */
    function (listener) {
        if (this._listeners.indexOf(listener) === -1) {
            this._listeners.push(listener);
        }
        if (this._isActive) {
            /** @type {?} */
            var cb = /** @type {?} */ ((listener));
            cb.call(null, this);
        }
    };
    /** Don't need to remove listeners in the testing environment */
    /**
     * Don't need to remove listeners in the testing environment
     * @param {?} _
     * @return {?}
     */
    MockMediaQueryList.prototype.removeListener = /**
     * Don't need to remove listeners in the testing environment
     * @param {?} _
     * @return {?}
     */
    function (_) {
    };
    /**
     * @param {?} _
     * @param {?} __
     * @param {?=} ___
     * @return {?}
     */
    MockMediaQueryList.prototype.addEventListener = /**
     * @param {?} _
     * @param {?} __
     * @param {?=} ___
     * @return {?}
     */
    function (_, __, ___) {
    };
    /**
     * @param {?} _
     * @param {?} __
     * @param {?=} ___
     * @return {?}
     */
    MockMediaQueryList.prototype.removeEventListener = /**
     * @param {?} _
     * @param {?} __
     * @param {?=} ___
     * @return {?}
     */
    function (_, __, ___) {
    };
    /**
     * @param {?} _
     * @return {?}
     */
    MockMediaQueryList.prototype.dispatchEvent = /**
     * @param {?} _
     * @return {?}
     */
    function (_) {
        return false;
    };
    return MockMediaQueryList;
}());
/** *
 * Pre-configured provider for MockMatchMedia
  @type {?} */
var MockMatchMediaProvider = {
    // tslint:disable-line:variable-name
    provide: MatchMedia,
    useClass: MockMatchMedia
};

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
var PRINT = 'print';
/** @type {?} */
var BREAKPOINT_PRINT = {
    alias: PRINT,
    mediaQuery: PRINT,
    priority: 1000
};
/**
 * PrintHook - Use to intercept print MediaQuery activations and force
 *             layouts to render with the specified print alias/breakpoint
 *
 * Used in MediaMarshaller and MediaObserver
 */
var PrintHook = /** @class */ (function () {
    function PrintHook(breakpoints, layoutConfig) {
        this.breakpoints = breakpoints;
        this.layoutConfig = layoutConfig;
        /**
         * Is this service currently in Print-mode ?
         */
        this.isPrinting = false;
        this.queue = new PrintQueue();
        this.deactivations = [];
    }
    /** Add 'print' mediaQuery: to listen for matchMedia activations */
    /**
     * Add 'print' mediaQuery: to listen for matchMedia activations
     * @param {?} queries
     * @return {?}
     */
    PrintHook.prototype.withPrintQuery = /**
     * Add 'print' mediaQuery: to listen for matchMedia activations
     * @param {?} queries
     * @return {?}
     */
    function (queries) {
        return queries.concat([PRINT]);
    };
    /** Is the MediaChange event for any 'print' @media */
    /**
     * Is the MediaChange event for any 'print' \@media
     * @param {?} e
     * @return {?}
     */
    PrintHook.prototype.isPrintEvent = /**
     * Is the MediaChange event for any 'print' \@media
     * @param {?} e
     * @return {?}
     */
    function (e) {
        return e.mediaQuery.startsWith(PRINT);
    };
    Object.defineProperty(PrintHook.prototype, "printAlias", {
        /** What is the desired mqAlias to use while printing? */
        get: /**
         * What is the desired mqAlias to use while printing?
         * @return {?}
         */
        function () {
            return this.layoutConfig.printWithBreakpoints || [];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PrintHook.prototype, "printBreakPoints", {
        /** Lookup breakpoints associated with print aliases. */
        get: /**
         * Lookup breakpoints associated with print aliases.
         * @return {?}
         */
        function () {
            var _this = this;
            return /** @type {?} */ (this.printAlias
                .map(function (alias) { return _this.breakpoints.findByAlias(alias); })
                .filter(function (bp) { return bp !== null; }));
        },
        enumerable: true,
        configurable: true
    });
    /** Lookup breakpoint associated with mediaQuery */
    /**
     * Lookup breakpoint associated with mediaQuery
     * @param {?} __0
     * @return {?}
     */
    PrintHook.prototype.getEventBreakpoints = /**
     * Lookup breakpoint associated with mediaQuery
     * @param {?} __0
     * @return {?}
     */
    function (_a) {
        var mediaQuery = _a.mediaQuery;
        /** @type {?} */
        var bp = this.breakpoints.findByQuery(mediaQuery);
        /** @type {?} */
        var list = bp ? this.printBreakPoints.concat([bp]) : this.printBreakPoints;
        return list.sort(sortDescendingPriority);
    };
    /** Update event with printAlias mediaQuery information */
    /**
     * Update event with printAlias mediaQuery information
     * @param {?} event
     * @return {?}
     */
    PrintHook.prototype.updateEvent = /**
     * Update event with printAlias mediaQuery information
     * @param {?} event
     * @return {?}
     */
    function (event) {
        /** @type {?} */
        var bp = this.breakpoints.findByQuery(event.mediaQuery);
        if (this.isPrintEvent(event)) {
            // Reset from 'print' to first (highest priority) print breakpoint
            bp = this.getEventBreakpoints(event)[0];
            event.mediaQuery = bp ? bp.mediaQuery : '';
        }
        return mergeAlias(event, bp);
    };
    /**
     * Prepare RxJs filter operator with partial application
     * @return pipeable filter predicate
     */
    /**
     * Prepare RxJs filter operator with partial application
     * @param {?} target
     * @return {?} pipeable filter predicate
     */
    PrintHook.prototype.interceptEvents = /**
     * Prepare RxJs filter operator with partial application
     * @param {?} target
     * @return {?} pipeable filter predicate
     */
    function (target) {
        var _this = this;
        return function (event) {
            if (_this.isPrintEvent(event)) {
                if (event.matches && !_this.isPrinting) {
                    _this.startPrinting(target, _this.getEventBreakpoints(event));
                    target.updateStyles();
                }
                else if (!event.matches && _this.isPrinting) {
                    _this.stopPrinting(target);
                    target.updateStyles();
                }
            }
            else {
                _this.collectActivations(event);
            }
        };
    };
    /** Stop mediaChange event propagation in event streams */
    /**
     * Stop mediaChange event propagation in event streams
     * @return {?}
     */
    PrintHook.prototype.blockPropagation = /**
     * Stop mediaChange event propagation in event streams
     * @return {?}
     */
    function () {
        var _this = this;
        return function (event) {
            return !(_this.isPrinting || _this.isPrintEvent(event));
        };
    };
    /**
     * Save current activateBreakpoints (for later restore)
     * and substitute only the printAlias breakpoint
     */
    /**
     * Save current activateBreakpoints (for later restore)
     * and substitute only the printAlias breakpoint
     * @param {?} target
     * @param {?} bpList
     * @return {?}
     */
    PrintHook.prototype.startPrinting = /**
     * Save current activateBreakpoints (for later restore)
     * and substitute only the printAlias breakpoint
     * @param {?} target
     * @param {?} bpList
     * @return {?}
     */
    function (target, bpList) {
        this.isPrinting = true;
        target.activatedBreakpoints = this.queue.addPrintBreakpoints(bpList);
    };
    /** For any print de-activations, reset the entire print queue */
    /**
     * For any print de-activations, reset the entire print queue
     * @param {?} target
     * @return {?}
     */
    PrintHook.prototype.stopPrinting = /**
     * For any print de-activations, reset the entire print queue
     * @param {?} target
     * @return {?}
     */
    function (target) {
        target.activatedBreakpoints = this.deactivations;
        this.deactivations = [];
        this.queue.clear();
        this.isPrinting = false;
    };
    /**
     * To restore pre-Print Activations, we must capture the proper
     * list of breakpoint activations BEFORE print starts. OnBeforePrint()
     * is not supported; so 'print' mediaQuery activations must be used.
     *
     * >  But activated breakpoints are deactivated BEFORE 'print' activation.
     *
     * Let's capture all de-activations using the following logic:
     *
     *  When not printing:
     *    - clear cache when activating non-print breakpoint
     *    - update cache (and sort) when deactivating
     *
     *  When printing:
     *    - sort and save when starting print
     *    - restore as activatedTargets and clear when stop printing
     */
    /**
     * To restore pre-Print Activations, we must capture the proper
     * list of breakpoint activations BEFORE print starts. OnBeforePrint()
     * is not supported; so 'print' mediaQuery activations must be used.
     *
     * >  But activated breakpoints are deactivated BEFORE 'print' activation.
     *
     * Let's capture all de-activations using the following logic:
     *
     *  When not printing:
     *    - clear cache when activating non-print breakpoint
     *    - update cache (and sort) when deactivating
     *
     *  When printing:
     *    - sort and save when starting print
     *    - restore as activatedTargets and clear when stop printing
     * @param {?} event
     * @return {?}
     */
    PrintHook.prototype.collectActivations = /**
     * To restore pre-Print Activations, we must capture the proper
     * list of breakpoint activations BEFORE print starts. OnBeforePrint()
     * is not supported; so 'print' mediaQuery activations must be used.
     *
     * >  But activated breakpoints are deactivated BEFORE 'print' activation.
     *
     * Let's capture all de-activations using the following logic:
     *
     *  When not printing:
     *    - clear cache when activating non-print breakpoint
     *    - update cache (and sort) when deactivating
     *
     *  When printing:
     *    - sort and save when starting print
     *    - restore as activatedTargets and clear when stop printing
     * @param {?} event
     * @return {?}
     */
    function (event) {
        if (!this.isPrinting) {
            if (!event.matches) {
                /** @type {?} */
                var bp = this.breakpoints.findByQuery(event.mediaQuery);
                if (bp) { // Deactivating a breakpoint
                    // Deactivating a breakpoint
                    this.deactivations.push(bp);
                    this.deactivations.sort(sortDescendingPriority);
                }
            }
            else {
                this.deactivations = [];
            }
        }
    };
    PrintHook.decorators = [
        { type: core.Injectable, args: [{ providedIn: 'root' },] },
    ];
    /** @nocollapse */
    PrintHook.ctorParameters = function () { return [
        { type: BreakPointRegistry },
        { type: undefined, decorators: [{ type: core.Inject, args: [LAYOUT_CONFIG,] }] }
    ]; };
    /** @nocollapse */ PrintHook.ngInjectableDef = core.defineInjectable({ factory: function PrintHook_Factory() { return new PrintHook(core.inject(BreakPointRegistry), core.inject(LAYOUT_CONFIG)); }, token: PrintHook, providedIn: "root" });
    return PrintHook;
}());
/**
 * Utility class to manage print breakpoints + activatedBreakpoints
 * with correct sorting WHILE printing
 */
var /**
 * Utility class to manage print breakpoints + activatedBreakpoints
 * with correct sorting WHILE printing
 */
PrintQueue = /** @class */ (function () {
    function PrintQueue() {
        /**
         * Sorted queue with prioritized print breakpoints
         */
        this.printBreakpoints = [];
    }
    /**
     * @param {?} bpList
     * @return {?}
     */
    PrintQueue.prototype.addPrintBreakpoints = /**
     * @param {?} bpList
     * @return {?}
     */
    function (bpList) {
        var _this = this;
        bpList.push(BREAKPOINT_PRINT);
        bpList.sort(sortDescendingPriority);
        bpList.forEach(function (bp) { return _this.addBreakpoint(bp); });
        return this.printBreakpoints;
    };
    /** Add Print breakpoint to queue */
    /**
     * Add Print breakpoint to queue
     * @param {?} bp
     * @return {?}
     */
    PrintQueue.prototype.addBreakpoint = /**
     * Add Print breakpoint to queue
     * @param {?} bp
     * @return {?}
     */
    function (bp) {
        if (!!bp) {
            /** @type {?} */
            var bpInList = this.printBreakpoints.find(function (it) { return it.mediaQuery === bp.mediaQuery; });
            if (bpInList === undefined) {
                // If this is a `printAlias` breakpoint, then append. If a true 'print' breakpoint,
                // register as highest priority in the queue
                this.printBreakpoints = isPrintBreakPoint(bp) ? [bp].concat(this.printBreakpoints) : this.printBreakpoints.concat([bp]);
            }
        }
    };
    /** Restore original activated breakpoints and clear internal caches */
    /**
     * Restore original activated breakpoints and clear internal caches
     * @return {?}
     */
    PrintQueue.prototype.clear = /**
     * Restore original activated breakpoints and clear internal caches
     * @return {?}
     */
    function () {
        this.printBreakpoints = [];
    };
    return PrintQueue;
}());
/**
 * Only support intercept queueing if the Breakpoint is a print \@media query
 * @param {?} bp
 * @return {?}
 */
function isPrintBreakPoint(bp) {
    return bp ? bp.mediaQuery.startsWith(PRINT) : false;
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */

/**
 * Wraps the provided value in an array, unless the provided value is an array.
 * @template T
 * @param {?} value
 * @return {?}
 */
function coerceArray(value) {
    return Array.isArray(value) ? value : [value];
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * MediaObserver enables applications to listen for 1..n mediaQuery activations and to determine
 * if a mediaQuery is currently activated.
 *
 * Since a breakpoint change will first deactivate 1...n mediaQueries and then possibly activate
 * 1..n mediaQueries, the MediaObserver will debounce notifications and report ALL *activations*
 * in 1 event notification. The reported activations will be sorted in descending priority order.
 *
 * This class uses the BreakPoint Registry to inject alias information into the raw MediaChange
 * notification. For custom mediaQuery notifications, alias information will not be injected and
 * those fields will be ''.
 *
 * Note: Developers should note that only mediaChange activations (not de-activations)
 *       are announced by the MediaObserver.
 *
 * \@usage
 *
 *  // RxJS
 *  import { filter } from 'rxjs/operators';
 *  import { MediaObserver } from '\@angular/flex-layout';
 *
 * \@Component({ ... })
 *  export class AppComponent {
 *    status: string = '';
 *
 *    constructor(mediaObserver: MediaObserver) {
 *      const media$ = mediaObserver.asObservable().pipe(
 *        filter((changes: MediaChange[]) => true)   // silly noop filter
 *      );
 *
 *      media$.subscribe((changes: MediaChange[]) => {
 *        let status = '';
 *        changes.forEach( change => {
 *          status += `'${change.mqAlias}' = (${change.mediaQuery}) <br/>` ;
 *        });
 *        this.status = status;
 *     });
 *
 *    }
 *  }
 */
var MediaObserver = /** @class */ (function () {
    function MediaObserver(breakpoints, matchMedia, hook) {
        this.breakpoints = breakpoints;
        this.matchMedia = matchMedia;
        this.hook = hook;
        /**
         * Filter MediaChange notifications for overlapping breakpoints
         */
        this.filterOverlaps = false;
        this.destroyed$ = new rxjs.Subject();
        this._media$ = this.watchActivations();
        this.media$ = this._media$.pipe(operators.filter(function (changes) { return changes.length > 0; }), operators.map(function (changes) { return changes[0]; }));
    }
    /**
     * Completes the active subject, signalling to all complete for all
     * MediaObserver subscribers
     */
    /**
     * Completes the active subject, signalling to all complete for all
     * MediaObserver subscribers
     * @return {?}
     */
    MediaObserver.prototype.ngOnDestroy = /**
     * Completes the active subject, signalling to all complete for all
     * MediaObserver subscribers
     * @return {?}
     */
    function () {
        this.destroyed$.next();
        this.destroyed$.complete();
    };
    // ************************************************
    // Public Methods
    // ************************************************
    /**
     * Observe changes to current activation 'list'
     */
    /**
     * Observe changes to current activation 'list'
     * @return {?}
     */
    MediaObserver.prototype.asObservable = /**
     * Observe changes to current activation 'list'
     * @return {?}
     */
    function () {
        return this._media$;
    };
    /**
     * Allow programmatic query to determine if one or more media query/alias match
     * the current viewport size.
     * @param value One or more media queries (or aliases) to check.
     * @returns Whether any of the media queries match.
     */
    /**
     * Allow programmatic query to determine if one or more media query/alias match
     * the current viewport size.
     * @param {?} value One or more media queries (or aliases) to check.
     * @return {?} Whether any of the media queries match.
     */
    MediaObserver.prototype.isActive = /**
     * Allow programmatic query to determine if one or more media query/alias match
     * the current viewport size.
     * @param {?} value One or more media queries (or aliases) to check.
     * @return {?} Whether any of the media queries match.
     */
    function (value) {
        var _this = this;
        /** @type {?} */
        var aliases = splitQueries(coerceArray(value));
        return aliases.some(function (alias) {
            /** @type {?} */
            var query = toMediaQuery(alias, _this.breakpoints);
            return _this.matchMedia.isActive(query);
        });
    };
    /**
     * Register all the mediaQueries registered in the BreakPointRegistry
     * This is needed so subscribers can be auto-notified of all standard, registered
     * mediaQuery activations
     * @return {?}
     */
    MediaObserver.prototype.watchActivations = /**
     * Register all the mediaQueries registered in the BreakPointRegistry
     * This is needed so subscribers can be auto-notified of all standard, registered
     * mediaQuery activations
     * @return {?}
     */
    function () {
        /** @type {?} */
        var queries = this.breakpoints.items.map(function (bp) { return bp.mediaQuery; });
        return this.buildObservable(queries);
    };
    /**
     * Only pass/announce activations (not de-activations)
     *
     * Since multiple-mediaQueries can be activation in a cycle,
     * gather all current activations into a single list of changes to observers
     *
     * Inject associated (if any) alias information into the MediaChange event
     * - Exclude mediaQuery activations for overlapping mQs. List bounded mQ ranges only
     * - Exclude print activations that do not have an associated mediaQuery
     *
     * NOTE: the raw MediaChange events [from MatchMedia] do not
     *       contain important alias information; as such this info
     *       must be injected into the MediaChange
     * @param {?} mqList
     * @return {?}
     */
    MediaObserver.prototype.buildObservable = /**
     * Only pass/announce activations (not de-activations)
     *
     * Since multiple-mediaQueries can be activation in a cycle,
     * gather all current activations into a single list of changes to observers
     *
     * Inject associated (if any) alias information into the MediaChange event
     * - Exclude mediaQuery activations for overlapping mQs. List bounded mQ ranges only
     * - Exclude print activations that do not have an associated mediaQuery
     *
     * NOTE: the raw MediaChange events [from MatchMedia] do not
     *       contain important alias information; as such this info
     *       must be injected into the MediaChange
     * @param {?} mqList
     * @return {?}
     */
    function (mqList) {
        var _this = this;
        /** @type {?} */
        var hasChanges = function (changes) {
            /** @type {?} */
            var isValidQuery = function (change) { return (change.mediaQuery.length > 0); };
            return (changes.filter(isValidQuery).length > 0);
        };
        /** @type {?} */
        var excludeOverlaps = function (changes) {
            return !_this.filterOverlaps ? changes : changes.filter(function (change) {
                /** @type {?} */
                var bp = _this.breakpoints.findByQuery(change.mediaQuery);
                return !bp ? true : !bp.overlapping;
            });
        };
        /**
             */
        return this.matchMedia
            .observe(this.hook.withPrintQuery(mqList))
            .pipe(operators.filter(function (change) { return change.matches; }), operators.debounceTime(0, rxjs.asapScheduler), operators.switchMap(function (_) { return rxjs.of(_this.findAllActivations()); }), operators.map(excludeOverlaps), operators.filter(hasChanges), operators.takeUntil(this.destroyed$));
    };
    /**
     * Find all current activations and prepare single list of activations
     * sorted by descending priority.
     * @return {?}
     */
    MediaObserver.prototype.findAllActivations = /**
     * Find all current activations and prepare single list of activations
     * sorted by descending priority.
     * @return {?}
     */
    function () {
        var _this = this;
        /** @type {?} */
        var mergeMQAlias = function (change) {
            /** @type {?} */
            var bp = _this.breakpoints.findByQuery(change.mediaQuery);
            return mergeAlias(change, bp);
        };
        /** @type {?} */
        var replaceWithPrintAlias = function (change) {
            return _this.hook.isPrintEvent(change) ? _this.hook.updateEvent(change) : change;
        };
        return this.matchMedia
            .activations
            .map(function (query) { return new MediaChange(true, query); })
            .map(replaceWithPrintAlias)
            .map(mergeMQAlias)
            .sort(sortDescendingPriority);
    };
    MediaObserver.decorators = [
        { type: core.Injectable, args: [{ providedIn: 'root' },] },
    ];
    /** @nocollapse */
    MediaObserver.ctorParameters = function () { return [
        { type: BreakPointRegistry },
        { type: MatchMedia },
        { type: PrintHook }
    ]; };
    /** @nocollapse */ MediaObserver.ngInjectableDef = core.defineInjectable({ factory: function MediaObserver_Factory() { return new MediaObserver(core.inject(BreakPointRegistry), core.inject(MatchMedia), core.inject(PrintHook)); }, token: MediaObserver, providedIn: "root" });
    return MediaObserver;
}());
/**
 * Find associated breakpoint (if any)
 * @param {?} query
 * @param {?} locator
 * @return {?}
 */
function toMediaQuery(query, locator) {
    /** @type {?} */
    var bp = locator.findByAlias(query) || locator.findByQuery(query);
    return bp ? bp.mediaQuery : query;
}
/**
 * Split each query string into separate query strings if two queries are provided as comma
 * separated.
 * @param {?} queries
 * @return {?}
 */
function splitQueries(queries) {
    return queries.map(function (query) { return query.split(','); })
        .reduce(function (a1, a2) { return a1.concat(a2); })
        .map(function (query) { return query.trim(); });
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * Class
 */
var MediaTrigger = /** @class */ (function () {
    function MediaTrigger(breakpoints, matchMedia, layoutConfig, _platformId, _document) {
        this.breakpoints = breakpoints;
        this.matchMedia = matchMedia;
        this.layoutConfig = layoutConfig;
        this._platformId = _platformId;
        this._document = _document;
        this.hasCachedRegistryMatches = false;
        this.originalActivations = [];
        this.originalRegistry = new Map();
    }
    /**
     * Manually activate range of breakpoints
     * @param list array of mediaQuery or alias strings
     */
    /**
     * Manually activate range of breakpoints
     * @param {?} list array of mediaQuery or alias strings
     * @return {?}
     */
    MediaTrigger.prototype.activate = /**
     * Manually activate range of breakpoints
     * @param {?} list array of mediaQuery or alias strings
     * @return {?}
     */
    function (list) {
        list = list.map(function (it) { return it.trim(); }); // trim queries
        this.saveActivations();
        this.deactivateAll();
        this.setActivations(list);
        this.prepareAutoRestore();
    };
    /**
     * Restore original, 'real' breakpoints and emit events
     * to trigger stream notification
     */
    /**
     * Restore original, 'real' breakpoints and emit events
     * to trigger stream notification
     * @return {?}
     */
    MediaTrigger.prototype.restore = /**
     * Restore original, 'real' breakpoints and emit events
     * to trigger stream notification
     * @return {?}
     */
    function () {
        if (this.hasCachedRegistryMatches) {
            /** @type {?} */
            var extractQuery = function (change) { return change.mediaQuery; };
            /** @type {?} */
            var list = this.originalActivations.map(extractQuery);
            try {
                this.deactivateAll();
                this.restoreRegistryMatches();
                this.setActivations(list);
            }
            finally {
                this.originalActivations = [];
                if (this.resizeSubscription) {
                    this.resizeSubscription.unsubscribe();
                }
            }
        }
    };
    /**
     * Whenever window resizes, immediately auto-restore original
     * activations (if we are simulating activations)
     * @return {?}
     */
    MediaTrigger.prototype.prepareAutoRestore = /**
     * Whenever window resizes, immediately auto-restore original
     * activations (if we are simulating activations)
     * @return {?}
     */
    function () {
        /** @type {?} */
        var isBrowser = common.isPlatformBrowser(this._platformId) && this._document;
        /** @type {?} */
        var enableAutoRestore = isBrowser && this.layoutConfig.mediaTriggerAutoRestore;
        if (enableAutoRestore) {
            /** @type {?} */
            var resize$ = rxjs.fromEvent(window, 'resize').pipe(operators.take(1));
            this.resizeSubscription = resize$.subscribe(this.restore.bind(this));
        }
    };
    /**
     * Notify all matchMedia subscribers of de-activations
     *
     * Note: we must force 'matches' updates for
     *       future matchMedia::activation lookups
     * @return {?}
     */
    MediaTrigger.prototype.deactivateAll = /**
     * Notify all matchMedia subscribers of de-activations
     *
     * Note: we must force 'matches' updates for
     *       future matchMedia::activation lookups
     * @return {?}
     */
    function () {
        /** @type {?} */
        var list = this.currentActivations;
        this.forceRegistryMatches(list, false);
        this.simulateMediaChanges(list, false);
    };
    /**
     * Cache current activations as sorted, prioritized list of MediaChanges
     * @return {?}
     */
    MediaTrigger.prototype.saveActivations = /**
     * Cache current activations as sorted, prioritized list of MediaChanges
     * @return {?}
     */
    function () {
        var _this = this;
        if (!this.hasCachedRegistryMatches) {
            /** @type {?} */
            var toMediaChange = function (query) { return new MediaChange(true, query); };
            /** @type {?} */
            var mergeMQAlias = function (change) {
                /** @type {?} */
                var bp = _this.breakpoints.findByQuery(change.mediaQuery);
                return mergeAlias(change, bp);
            };
            this.originalActivations = this.currentActivations
                .map(toMediaChange)
                .map(mergeMQAlias)
                .sort(sortDescendingPriority);
            this.cacheRegistryMatches();
        }
    };
    /**
     * Force set manual activations for specified mediaQuery list
     * @param {?} list
     * @return {?}
     */
    MediaTrigger.prototype.setActivations = /**
     * Force set manual activations for specified mediaQuery list
     * @param {?} list
     * @return {?}
     */
    function (list) {
        if (!!this.originalRegistry) {
            this.forceRegistryMatches(list, true);
        }
        this.simulateMediaChanges(list);
    };
    /**
     * For specified mediaQuery list manually simulate activations or deactivations
     * @param {?} queries
     * @param {?=} matches
     * @return {?}
     */
    MediaTrigger.prototype.simulateMediaChanges = /**
     * For specified mediaQuery list manually simulate activations or deactivations
     * @param {?} queries
     * @param {?=} matches
     * @return {?}
     */
    function (queries, matches) {
        var _this = this;
        if (matches === void 0) { matches = true; }
        /** @type {?} */
        var toMediaQuery = function (query) {
            /** @type {?} */
            var locator = _this.breakpoints;
            /** @type {?} */
            var bp = locator.findByAlias(query) || locator.findByQuery(query);
            return bp ? bp.mediaQuery : query;
        };
        /** @type {?} */
        var emitChangeEvent = function (query) { return _this.emitChangeEvent(matches, query); };
        queries.map(toMediaQuery).forEach(emitChangeEvent);
    };
    /**
     * Replace current registry with simulated registry...
     * Note: this is required since MediaQueryList::matches is 'readOnly'
     * @param {?} queries
     * @param {?} matches
     * @return {?}
     */
    MediaTrigger.prototype.forceRegistryMatches = /**
     * Replace current registry with simulated registry...
     * Note: this is required since MediaQueryList::matches is 'readOnly'
     * @param {?} queries
     * @param {?} matches
     * @return {?}
     */
    function (queries, matches) {
        /** @type {?} */
        var registry = new Map();
        queries.forEach(function (query) {
            registry.set(query, /** @type {?} */ ({ matches: matches }));
        });
        this.matchMedia.registry = registry;
    };
    /**
     * Save current MatchMedia::registry items.
     * @return {?}
     */
    MediaTrigger.prototype.cacheRegistryMatches = /**
     * Save current MatchMedia::registry items.
     * @return {?}
     */
    function () {
        /** @type {?} */
        var target = this.originalRegistry;
        target.clear();
        this.matchMedia.registry.forEach(function (value, key) {
            target.set(key, value);
        });
        this.hasCachedRegistryMatches = true;
    };
    /**
     * Restore original, 'true' registry
     * @return {?}
     */
    MediaTrigger.prototype.restoreRegistryMatches = /**
     * Restore original, 'true' registry
     * @return {?}
     */
    function () {
        /** @type {?} */
        var target = this.matchMedia.registry;
        target.clear();
        this.originalRegistry.forEach(function (value, key) {
            target.set(key, value);
        });
        this.originalRegistry.clear();
        this.hasCachedRegistryMatches = false;
    };
    /**
     * Manually emit a MediaChange event via the MatchMedia to MediaMarshaller and MediaObserver
     * @param {?} matches
     * @param {?} query
     * @return {?}
     */
    MediaTrigger.prototype.emitChangeEvent = /**
     * Manually emit a MediaChange event via the MatchMedia to MediaMarshaller and MediaObserver
     * @param {?} matches
     * @param {?} query
     * @return {?}
     */
    function (matches, query) {
        this.matchMedia.source.next(new MediaChange(matches, query));
    };
    Object.defineProperty(MediaTrigger.prototype, "currentActivations", {
        get: /**
         * @return {?}
         */
        function () {
            return this.matchMedia.activations;
        },
        enumerable: true,
        configurable: true
    });
    MediaTrigger.decorators = [
        { type: core.Injectable, args: [{ providedIn: 'root' },] },
    ];
    /** @nocollapse */
    MediaTrigger.ctorParameters = function () { return [
        { type: BreakPointRegistry },
        { type: MatchMedia },
        { type: undefined, decorators: [{ type: core.Inject, args: [LAYOUT_CONFIG,] }] },
        { type: Object, decorators: [{ type: core.Inject, args: [core.PLATFORM_ID,] }] },
        { type: undefined, decorators: [{ type: core.Inject, args: [common.DOCUMENT,] }] }
    ]; };
    /** @nocollapse */ MediaTrigger.ngInjectableDef = core.defineInjectable({ factory: function MediaTrigger_Factory() { return new MediaTrigger(core.inject(BreakPointRegistry), core.inject(MatchMedia), core.inject(LAYOUT_CONFIG), core.inject(core.PLATFORM_ID), core.inject(common.DOCUMENT)); }, token: MediaTrigger, providedIn: "root" });
    return MediaTrigger;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * Applies CSS prefixes to appropriate style keys.
 *
 * Note: `-ms-`, `-moz` and `-webkit-box` are no longer supported. e.g.
 *    {
 *      display: -webkit-flex;     NEW - Safari 6.1+. iOS 7.1+, BB10
 *      display: flex;             NEW, Spec - Firefox, Chrome, Opera
 *      // display: -webkit-box;   OLD - iOS 6-, Safari 3.1-6, BB7
 *      // display: -ms-flexbox;   TWEENER - IE 10
 *      // display: -moz-flexbox;  OLD - Firefox
 *    }
 * @param {?} target
 * @return {?}
 */
function applyCssPrefixes(target) {
    for (var key in target) {
        /** @type {?} */
        var value = target[key] || '';
        switch (key) {
            case 'display':
                if (value === 'flex') {
                    target['display'] = [
                        '-webkit-flex',
                        'flex'
                    ];
                }
                else if (value === 'inline-flex') {
                    target['display'] = [
                        '-webkit-inline-flex',
                        'inline-flex'
                    ];
                }
                else {
                    target['display'] = value;
                }
                break;
            case 'align-items':
            case 'align-self':
            case 'align-content':
            case 'flex':
            case 'flex-basis':
            case 'flex-flow':
            case 'flex-grow':
            case 'flex-shrink':
            case 'flex-wrap':
            case 'justify-content':
                target['-webkit-' + key] = value;
                break;
            case 'flex-direction':
                value = value || 'row';
                target['-webkit-flex-direction'] = value;
                target['flex-direction'] = value;
                break;
            case 'order':
                target['order'] = target['-webkit-' + key] = isNaN(+value) ? '0' : value;
                break;
        }
    }
    return target;
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
var StyleUtils = /** @class */ (function () {
    function StyleUtils(_serverStylesheet, _serverModuleLoaded, _platformId, layoutConfig) {
        this._serverStylesheet = _serverStylesheet;
        this._serverModuleLoaded = _serverModuleLoaded;
        this._platformId = _platformId;
        this.layoutConfig = layoutConfig;
    }
    /**
     * Applies styles given via string pair or object map to the directive element
     */
    /**
     * Applies styles given via string pair or object map to the directive element
     * @param {?} element
     * @param {?} style
     * @param {?=} value
     * @return {?}
     */
    StyleUtils.prototype.applyStyleToElement = /**
     * Applies styles given via string pair or object map to the directive element
     * @param {?} element
     * @param {?} style
     * @param {?=} value
     * @return {?}
     */
    function (element, style, value) {
        if (value === void 0) { value = null; }
        /** @type {?} */
        var styles = {};
        if (typeof style === 'string') {
            styles[style] = value;
            style = styles;
        }
        styles = this.layoutConfig.disableVendorPrefixes ? style : applyCssPrefixes(style);
        this._applyMultiValueStyleToElement(styles, element);
    };
    /**
     * Applies styles given via string pair or object map to the directive's element
     */
    /**
     * Applies styles given via string pair or object map to the directive's element
     * @param {?} style
     * @param {?=} elements
     * @return {?}
     */
    StyleUtils.prototype.applyStyleToElements = /**
     * Applies styles given via string pair or object map to the directive's element
     * @param {?} style
     * @param {?=} elements
     * @return {?}
     */
    function (style, elements) {
        var _this = this;
        if (elements === void 0) { elements = []; }
        /** @type {?} */
        var styles = this.layoutConfig.disableVendorPrefixes ? style : applyCssPrefixes(style);
        elements.forEach(function (el) {
            _this._applyMultiValueStyleToElement(styles, el);
        });
    };
    /**
     * Determine the DOM element's Flexbox flow (flex-direction)
     *
     * Check inline style first then check computed (stylesheet) style
     */
    /**
     * Determine the DOM element's Flexbox flow (flex-direction)
     *
     * Check inline style first then check computed (stylesheet) style
     * @param {?} target
     * @return {?}
     */
    StyleUtils.prototype.getFlowDirection = /**
     * Determine the DOM element's Flexbox flow (flex-direction)
     *
     * Check inline style first then check computed (stylesheet) style
     * @param {?} target
     * @return {?}
     */
    function (target) {
        /** @type {?} */
        var query = 'flex-direction';
        /** @type {?} */
        var value = this.lookupStyle(target, query);
        /** @type {?} */
        var hasInlineValue = this.lookupInlineStyle(target, query) ||
            (common.isPlatformServer(this._platformId) && this._serverModuleLoaded) ? value : '';
        return [value || 'row', hasInlineValue];
    };
    /**
     * Find the DOM element's raw attribute value (if any)
     */
    /**
     * Find the DOM element's raw attribute value (if any)
     * @param {?} element
     * @param {?} attribute
     * @return {?}
     */
    StyleUtils.prototype.lookupAttributeValue = /**
     * Find the DOM element's raw attribute value (if any)
     * @param {?} element
     * @param {?} attribute
     * @return {?}
     */
    function (element, attribute) {
        return element.getAttribute(attribute) || '';
    };
    /**
     * Find the DOM element's inline style value (if any)
     */
    /**
     * Find the DOM element's inline style value (if any)
     * @param {?} element
     * @param {?} styleName
     * @return {?}
     */
    StyleUtils.prototype.lookupInlineStyle = /**
     * Find the DOM element's inline style value (if any)
     * @param {?} element
     * @param {?} styleName
     * @return {?}
     */
    function (element, styleName) {
        return common.isPlatformBrowser(this._platformId) ?
            element.style.getPropertyValue(styleName) : this._getServerStyle(element, styleName);
    };
    /**
     * Determine the inline or inherited CSS style
     * NOTE: platform-server has no implementation for getComputedStyle
     */
    /**
     * Determine the inline or inherited CSS style
     * NOTE: platform-server has no implementation for getComputedStyle
     * @param {?} element
     * @param {?} styleName
     * @param {?=} inlineOnly
     * @return {?}
     */
    StyleUtils.prototype.lookupStyle = /**
     * Determine the inline or inherited CSS style
     * NOTE: platform-server has no implementation for getComputedStyle
     * @param {?} element
     * @param {?} styleName
     * @param {?=} inlineOnly
     * @return {?}
     */
    function (element, styleName, inlineOnly) {
        if (inlineOnly === void 0) { inlineOnly = false; }
        /** @type {?} */
        var value = '';
        if (element) {
            /** @type {?} */
            var immediateValue = value = this.lookupInlineStyle(element, styleName);
            if (!immediateValue) {
                if (common.isPlatformBrowser(this._platformId)) {
                    if (!inlineOnly) {
                        value = getComputedStyle(element).getPropertyValue(styleName);
                    }
                }
                else {
                    if (this._serverModuleLoaded) {
                        value = this._serverStylesheet.getStyleForElement(element, styleName);
                    }
                }
            }
        }
        // Note: 'inline' is the default of all elements, unless UA stylesheet overrides;
        //       in which case getComputedStyle() should determine a valid value.
        return value ? value.trim() : '';
    };
    /**
     * Applies the styles to the element. The styles object map may contain an array of values
     * Each value will be added as element style
     * Keys are sorted to add prefixed styles (like -webkit-x) first, before the standard ones
     * @param {?} styles
     * @param {?} element
     * @return {?}
     */
    StyleUtils.prototype._applyMultiValueStyleToElement = /**
     * Applies the styles to the element. The styles object map may contain an array of values
     * Each value will be added as element style
     * Keys are sorted to add prefixed styles (like -webkit-x) first, before the standard ones
     * @param {?} styles
     * @param {?} element
     * @return {?}
     */
    function (styles, element) {
        var _this = this;
        Object.keys(styles).sort().forEach(function (key) {
            /** @type {?} */
            var el = styles[key];
            /** @type {?} */
            var values = Array.isArray(el) ? el : [el];
            values.sort();
            for (var _i = 0, values_1 = values; _i < values_1.length; _i++) {
                var value = values_1[_i];
                value = value ? value + '' : '';
                if (common.isPlatformBrowser(_this._platformId) || !_this._serverModuleLoaded) {
                    common.isPlatformBrowser(_this._platformId) ?
                        element.style.setProperty(key, value) : _this._setServerStyle(element, key, value);
                }
                else {
                    _this._serverStylesheet.addStyleToElement(element, key, value);
                }
            }
        });
    };
    /**
     * @param {?} element
     * @param {?} styleName
     * @param {?=} styleValue
     * @return {?}
     */
    StyleUtils.prototype._setServerStyle = /**
     * @param {?} element
     * @param {?} styleName
     * @param {?=} styleValue
     * @return {?}
     */
    function (element, styleName, styleValue) {
        styleName = styleName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
        /** @type {?} */
        var styleMap = this._readStyleAttribute(element);
        styleMap[styleName] = styleValue || '';
        this._writeStyleAttribute(element, styleMap);
    };
    /**
     * @param {?} element
     * @param {?} styleName
     * @return {?}
     */
    StyleUtils.prototype._getServerStyle = /**
     * @param {?} element
     * @param {?} styleName
     * @return {?}
     */
    function (element, styleName) {
        /** @type {?} */
        var styleMap = this._readStyleAttribute(element);
        return styleMap[styleName] || '';
    };
    /**
     * @param {?} element
     * @return {?}
     */
    StyleUtils.prototype._readStyleAttribute = /**
     * @param {?} element
     * @return {?}
     */
    function (element) {
        /** @type {?} */
        var styleMap = {};
        /** @type {?} */
        var styleAttribute = element.getAttribute('style');
        if (styleAttribute) {
            /** @type {?} */
            var styleList = styleAttribute.split(/;+/g);
            for (var i = 0; i < styleList.length; i++) {
                /** @type {?} */
                var style = styleList[i].trim();
                if (style.length > 0) {
                    /** @type {?} */
                    var colonIndex = style.indexOf(':');
                    if (colonIndex === -1) {
                        throw new Error("Invalid CSS style: " + style);
                    }
                    /** @type {?} */
                    var name_1 = style.substr(0, colonIndex).trim();
                    styleMap[name_1] = style.substr(colonIndex + 1).trim();
                }
            }
        }
        return styleMap;
    };
    /**
     * @param {?} element
     * @param {?} styleMap
     * @return {?}
     */
    StyleUtils.prototype._writeStyleAttribute = /**
     * @param {?} element
     * @param {?} styleMap
     * @return {?}
     */
    function (element, styleMap) {
        /** @type {?} */
        var styleAttrValue = '';
        for (var key in styleMap) {
            /** @type {?} */
            var newValue = styleMap[key];
            if (newValue) {
                styleAttrValue += key + ':' + styleMap[key] + ';';
            }
        }
        element.setAttribute('style', styleAttrValue);
    };
    StyleUtils.decorators = [
        { type: core.Injectable, args: [{ providedIn: 'root' },] },
    ];
    /** @nocollapse */
    StyleUtils.ctorParameters = function () { return [
        { type: StylesheetMap, decorators: [{ type: core.Optional }] },
        { type: Boolean, decorators: [{ type: core.Optional }, { type: core.Inject, args: [SERVER_TOKEN,] }] },
        { type: Object, decorators: [{ type: core.Inject, args: [core.PLATFORM_ID,] }] },
        { type: undefined, decorators: [{ type: core.Inject, args: [LAYOUT_CONFIG,] }] }
    ]; };
    /** @nocollapse */ StyleUtils.ngInjectableDef = core.defineInjectable({ factory: function StyleUtils_Factory() { return new StyleUtils(core.inject(StylesheetMap, 8), core.inject(SERVER_TOKEN, 8), core.inject(core.PLATFORM_ID), core.inject(LAYOUT_CONFIG)); }, token: StyleUtils, providedIn: "root" });
    return StyleUtils;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * A class that encapsulates CSS style generation for common directives
 * @abstract
 */
var   /**
 * A class that encapsulates CSS style generation for common directives
 * @abstract
 */
StyleBuilder = /** @class */ (function () {
    function StyleBuilder() {
        /**
         * Whether to cache the generated output styles
         */
        this.shouldCache = true;
    }
    /**
     * Run a side effect computation given the input string and the computed styles
     * from the build task and the host configuration object
     * NOTE: This should be a no-op unless an algorithm is provided in a subclass
     */
    /**
     * Run a side effect computation given the input string and the computed styles
     * from the build task and the host configuration object
     * NOTE: This should be a no-op unless an algorithm is provided in a subclass
     * @param {?} _input
     * @param {?} _styles
     * @param {?=} _parent
     * @return {?}
     */
    StyleBuilder.prototype.sideEffect = /**
     * Run a side effect computation given the input string and the computed styles
     * from the build task and the host configuration object
     * NOTE: This should be a no-op unless an algorithm is provided in a subclass
     * @param {?} _input
     * @param {?} _styles
     * @param {?=} _parent
     * @return {?}
     */
    function (_input, _styles, _parent) {
    };
    return StyleBuilder;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */

/**
 * The flex API permits 3 or 1 parts of the value:
 *    - `flex-grow flex-shrink flex-basis`, or
 *    - `flex-basis`
 * @param {?} basis
 * @param {?=} grow
 * @param {?=} shrink
 * @return {?}
 */
function validateBasis(basis, grow, shrink) {
    if (grow === void 0) { grow = '1'; }
    if (shrink === void 0) { shrink = '1'; }
    /** @type {?} */
    var parts = [grow, shrink, basis];
    /** @type {?} */
    var j = basis.indexOf('calc');
    if (j > 0) {
        parts[2] = _validateCalcValue(basis.substring(j).trim());
        /** @type {?} */
        var matches = basis.substr(0, j).trim().split(' ');
        if (matches.length == 2) {
            parts[0] = matches[0];
            parts[1] = matches[1];
        }
    }
    else if (j == 0) {
        parts[2] = _validateCalcValue(basis.trim());
    }
    else {
        /** @type {?} */
        var matches = basis.split(' ');
        parts = (matches.length === 3) ? matches : [
            grow, shrink, basis
        ];
    }
    return parts;
}
/**
 * Calc expressions require whitespace before & after any expression operators
 * This is a simple, crude whitespace padding solution.
 *   - '3 3 calc(15em + 20px)'
 *   - calc(100% / 7 * 2)
 *   - 'calc(15em + 20px)'
 *   - 'calc(15em+20px)'
 *   - '37px'
 *   = '43%'
 * @param {?} calc
 * @return {?}
 */
function _validateCalcValue(calc) {
    return calc.replace(/[\s]/g, '').replace(/[\/\*\+\-]/g, ' $& ');
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * MediaMarshaller - register responsive values from directives and
 *                   trigger them based on media query events
 */
var MediaMarshaller = /** @class */ (function () {
    function MediaMarshaller(matchMedia, breakpoints, hook) {
        this.matchMedia = matchMedia;
        this.breakpoints = breakpoints;
        this.hook = hook;
        this.activatedBreakpoints = [];
        this.elementMap = new Map();
        this.elementKeyMap = new WeakMap();
        this.watcherMap = new WeakMap();
        this.updateMap = new WeakMap();
        this.clearMap = new WeakMap();
        this.subject = new rxjs.Subject();
        this.observeActivations();
    }
    Object.defineProperty(MediaMarshaller.prototype, "activatedAlias", {
        get: /**
         * @return {?}
         */
        function () {
            return this.activatedBreakpoints[0] ? this.activatedBreakpoints[0].alias : '';
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Update styles on breakpoint activates or deactivates
     * @param mc
     */
    /**
     * Update styles on breakpoint activates or deactivates
     * @param {?} mc
     * @return {?}
     */
    MediaMarshaller.prototype.onMediaChange = /**
     * Update styles on breakpoint activates or deactivates
     * @param {?} mc
     * @return {?}
     */
    function (mc) {
        /** @type {?} */
        var bp = this.findByQuery(mc.mediaQuery);
        if (bp) {
            mc = mergeAlias(mc, bp);
            if (mc.matches && this.activatedBreakpoints.indexOf(bp) === -1) {
                this.activatedBreakpoints.push(bp);
                this.activatedBreakpoints.sort(sortDescendingPriority);
                this.updateStyles();
            }
            else if (!mc.matches && this.activatedBreakpoints.indexOf(bp) !== -1) {
                // Remove the breakpoint when it's deactivated
                this.activatedBreakpoints.splice(this.activatedBreakpoints.indexOf(bp), 1);
                this.activatedBreakpoints.sort(sortDescendingPriority);
                this.updateStyles();
            }
        }
    };
    /**
     * initialize the marshaller with necessary elements for delegation on an element
     * @param element
     * @param key
     * @param updateFn optional callback so that custom bp directives don't have to re-provide this
     * @param clearFn optional callback so that custom bp directives don't have to re-provide this
     * @param extraTriggers other triggers to force style updates (e.g. layout, directionality, etc)
     */
    /**
     * initialize the marshaller with necessary elements for delegation on an element
     * @param {?} element
     * @param {?} key
     * @param {?=} updateFn optional callback so that custom bp directives don't have to re-provide this
     * @param {?=} clearFn optional callback so that custom bp directives don't have to re-provide this
     * @param {?=} extraTriggers other triggers to force style updates (e.g. layout, directionality, etc)
     * @return {?}
     */
    MediaMarshaller.prototype.init = /**
     * initialize the marshaller with necessary elements for delegation on an element
     * @param {?} element
     * @param {?} key
     * @param {?=} updateFn optional callback so that custom bp directives don't have to re-provide this
     * @param {?=} clearFn optional callback so that custom bp directives don't have to re-provide this
     * @param {?=} extraTriggers other triggers to force style updates (e.g. layout, directionality, etc)
     * @return {?}
     */
    function (element, key, updateFn, clearFn, extraTriggers) {
        if (extraTriggers === void 0) { extraTriggers = []; }
        initBuilderMap(this.updateMap, element, key, updateFn);
        initBuilderMap(this.clearMap, element, key, clearFn);
        this.buildElementKeyMap(element, key);
        this.watchExtraTriggers(element, key, extraTriggers);
    };
    /**
     * get the value for an element and key and optionally a given breakpoint
     * @param element
     * @param key
     * @param bp
     */
    /**
     * get the value for an element and key and optionally a given breakpoint
     * @param {?} element
     * @param {?} key
     * @param {?=} bp
     * @return {?}
     */
    MediaMarshaller.prototype.getValue = /**
     * get the value for an element and key and optionally a given breakpoint
     * @param {?} element
     * @param {?} key
     * @param {?=} bp
     * @return {?}
     */
    function (element, key, bp) {
        /** @type {?} */
        var bpMap = this.elementMap.get(element);
        if (bpMap) {
            /** @type {?} */
            var values = bp !== undefined ? bpMap.get(bp) : this.getActivatedValues(bpMap, key);
            if (values) {
                return values.get(key);
            }
        }
        return undefined;
    };
    /**
     * whether the element has values for a given key
     * @param element
     * @param key
     */
    /**
     * whether the element has values for a given key
     * @param {?} element
     * @param {?} key
     * @return {?}
     */
    MediaMarshaller.prototype.hasValue = /**
     * whether the element has values for a given key
     * @param {?} element
     * @param {?} key
     * @return {?}
     */
    function (element, key) {
        /** @type {?} */
        var bpMap = this.elementMap.get(element);
        if (bpMap) {
            /** @type {?} */
            var values = this.getActivatedValues(bpMap, key);
            if (values) {
                return values.get(key) !== undefined || false;
            }
        }
        return false;
    };
    /**
     * Set the value for an input on a directive
     * @param element the element in question
     * @param key the type of the directive (e.g. flex, layout-gap, etc)
     * @param bp the breakpoint suffix (empty string = default)
     * @param val the value for the breakpoint
     */
    /**
     * Set the value for an input on a directive
     * @param {?} element the element in question
     * @param {?} key the type of the directive (e.g. flex, layout-gap, etc)
     * @param {?} val the value for the breakpoint
     * @param {?} bp the breakpoint suffix (empty string = default)
     * @return {?}
     */
    MediaMarshaller.prototype.setValue = /**
     * Set the value for an input on a directive
     * @param {?} element the element in question
     * @param {?} key the type of the directive (e.g. flex, layout-gap, etc)
     * @param {?} val the value for the breakpoint
     * @param {?} bp the breakpoint suffix (empty string = default)
     * @return {?}
     */
    function (element, key, val, bp) {
        /** @type {?} */
        var bpMap = this.elementMap.get(element);
        if (!bpMap) {
            bpMap = new Map().set(bp, new Map().set(key, val));
            this.elementMap.set(element, bpMap);
        }
        else {
            /** @type {?} */
            var values = (bpMap.get(bp) || new Map()).set(key, val);
            bpMap.set(bp, values);
            this.elementMap.set(element, bpMap);
        }
        /** @type {?} */
        var value = this.getValue(element, key);
        if (value !== undefined) {
            this.updateElement(element, key, value);
        }
    };
    /** Track element value changes for a specific key */
    /**
     * Track element value changes for a specific key
     * @param {?} element
     * @param {?} key
     * @return {?}
     */
    MediaMarshaller.prototype.trackValue = /**
     * Track element value changes for a specific key
     * @param {?} element
     * @param {?} key
     * @return {?}
     */
    function (element, key) {
        return this.subject
            .asObservable()
            .pipe(operators.filter(function (v) { return v.element === element && v.key === key; }));
    };
    /** update all styles for all elements on the current breakpoint */
    /**
     * update all styles for all elements on the current breakpoint
     * @return {?}
     */
    MediaMarshaller.prototype.updateStyles = /**
     * update all styles for all elements on the current breakpoint
     * @return {?}
     */
    function () {
        var _this = this;
        this.elementMap.forEach(function (bpMap, el) {
            /** @type {?} */
            var keyMap = new Set(/** @type {?} */ ((_this.elementKeyMap.get(el))));
            /** @type {?} */
            var valueMap = _this.getActivatedValues(bpMap);
            if (valueMap) {
                valueMap.forEach(function (v, k) {
                    _this.updateElement(el, k, v);
                    keyMap.delete(k);
                });
            }
            keyMap.forEach(function (k) {
                valueMap = _this.getActivatedValues(bpMap, k);
                if (valueMap) {
                    /** @type {?} */
                    var value = valueMap.get(k);
                    _this.updateElement(el, k, value);
                }
                else {
                    _this.clearElement(el, k);
                }
            });
        });
    };
    /**
     * clear the styles for a given element
     * @param element
     * @param key
     */
    /**
     * clear the styles for a given element
     * @param {?} element
     * @param {?} key
     * @return {?}
     */
    MediaMarshaller.prototype.clearElement = /**
     * clear the styles for a given element
     * @param {?} element
     * @param {?} key
     * @return {?}
     */
    function (element, key) {
        /** @type {?} */
        var builders = this.clearMap.get(element);
        if (builders) {
            /** @type {?} */
            var clearFn = /** @type {?} */ (builders.get(key));
            if (!!clearFn) {
                clearFn();
                this.subject.next({ element: element, key: key, value: '' });
            }
        }
    };
    /**
     * update a given element with the activated values for a given key
     * @param element
     * @param key
     * @param value
     */
    /**
     * update a given element with the activated values for a given key
     * @param {?} element
     * @param {?} key
     * @param {?} value
     * @return {?}
     */
    MediaMarshaller.prototype.updateElement = /**
     * update a given element with the activated values for a given key
     * @param {?} element
     * @param {?} key
     * @param {?} value
     * @return {?}
     */
    function (element, key, value) {
        /** @type {?} */
        var builders = this.updateMap.get(element);
        if (builders) {
            /** @type {?} */
            var updateFn = /** @type {?} */ (builders.get(key));
            if (!!updateFn) {
                updateFn(value);
                this.subject.next({ element: element, key: key, value: value });
            }
        }
    };
    /**
     * release all references to a given element
     * @param element
     */
    /**
     * release all references to a given element
     * @param {?} element
     * @return {?}
     */
    MediaMarshaller.prototype.releaseElement = /**
     * release all references to a given element
     * @param {?} element
     * @return {?}
     */
    function (element) {
        /** @type {?} */
        var watcherMap = this.watcherMap.get(element);
        if (watcherMap) {
            watcherMap.forEach(function (s) { return s.unsubscribe(); });
            this.watcherMap.delete(element);
        }
        /** @type {?} */
        var elementMap = this.elementMap.get(element);
        if (elementMap) {
            elementMap.forEach(function (_, s) { return elementMap.delete(s); });
            this.elementMap.delete(element);
        }
    };
    /**
     * trigger an update for a given element and key (e.g. layout)
     * @param element
     * @param key
     */
    /**
     * trigger an update for a given element and key (e.g. layout)
     * @param {?} element
     * @param {?=} key
     * @return {?}
     */
    MediaMarshaller.prototype.triggerUpdate = /**
     * trigger an update for a given element and key (e.g. layout)
     * @param {?} element
     * @param {?=} key
     * @return {?}
     */
    function (element, key) {
        var _this = this;
        /** @type {?} */
        var bpMap = this.elementMap.get(element);
        if (bpMap) {
            /** @type {?} */
            var valueMap = this.getActivatedValues(bpMap, key);
            if (valueMap) {
                if (key) {
                    this.updateElement(element, key, valueMap.get(key));
                }
                else {
                    valueMap.forEach(function (v, k) { return _this.updateElement(element, k, v); });
                }
            }
        }
    };
    /**
     * Cross-reference for HTMLElement with directive key
     * @param {?} element
     * @param {?} key
     * @return {?}
     */
    MediaMarshaller.prototype.buildElementKeyMap = /**
     * Cross-reference for HTMLElement with directive key
     * @param {?} element
     * @param {?} key
     * @return {?}
     */
    function (element, key) {
        /** @type {?} */
        var keyMap = this.elementKeyMap.get(element);
        if (!keyMap) {
            keyMap = new Set();
            this.elementKeyMap.set(element, keyMap);
        }
        keyMap.add(key);
    };
    /**
     * Other triggers that should force style updates:
     * - directionality
     * - layout changes
     * - mutationobserver updates
     * @param {?} element
     * @param {?} key
     * @param {?} triggers
     * @return {?}
     */
    MediaMarshaller.prototype.watchExtraTriggers = /**
     * Other triggers that should force style updates:
     * - directionality
     * - layout changes
     * - mutationobserver updates
     * @param {?} element
     * @param {?} key
     * @param {?} triggers
     * @return {?}
     */
    function (element, key, triggers) {
        var _this = this;
        if (triggers && triggers.length) {
            /** @type {?} */
            var watchers = this.watcherMap.get(element);
            if (!watchers) {
                watchers = new Map();
                this.watcherMap.set(element, watchers);
            }
            /** @type {?} */
            var subscription = watchers.get(key);
            if (!subscription) {
                /** @type {?} */
                var newSubscription = rxjs.merge.apply(void 0, triggers).subscribe(function () {
                    /** @type {?} */
                    var currentValue = _this.getValue(element, key);
                    _this.updateElement(element, key, currentValue);
                });
                watchers.set(key, newSubscription);
            }
        }
    };
    /**
     * Breakpoint locator by mediaQuery
     * @param {?} query
     * @return {?}
     */
    MediaMarshaller.prototype.findByQuery = /**
     * Breakpoint locator by mediaQuery
     * @param {?} query
     * @return {?}
     */
    function (query) {
        return this.breakpoints.findByQuery(query);
    };
    /**
     * get the fallback breakpoint for a given element, starting with the current breakpoint
     * @param {?} bpMap
     * @param {?=} key
     * @return {?}
     */
    MediaMarshaller.prototype.getActivatedValues = /**
     * get the fallback breakpoint for a given element, starting with the current breakpoint
     * @param {?} bpMap
     * @param {?=} key
     * @return {?}
     */
    function (bpMap, key) {
        for (var i = 0; i < this.activatedBreakpoints.length; i++) {
            /** @type {?} */
            var activatedBp = this.activatedBreakpoints[i];
            /** @type {?} */
            var valueMap = bpMap.get(activatedBp.alias);
            if (valueMap) {
                if (key === undefined || valueMap.has(key)) {
                    return valueMap;
                }
            }
        }
        /** @type {?} */
        var lastHope = bpMap.get('');
        return (key === undefined || lastHope && lastHope.has(key)) ? lastHope : undefined;
    };
    /**
     * Watch for mediaQuery breakpoint activations
     * @return {?}
     */
    MediaMarshaller.prototype.observeActivations = /**
     * Watch for mediaQuery breakpoint activations
     * @return {?}
     */
    function () {
        /** @type {?} */
        var target = /** @type {?} */ ((this));
        /** @type {?} */
        var queries = this.breakpoints.items.map(function (bp) { return bp.mediaQuery; });
        this.matchMedia
            .observe(this.hook.withPrintQuery(queries))
            .pipe(operators.tap(this.hook.interceptEvents(target)), operators.filter(this.hook.blockPropagation()))
            .subscribe(this.onMediaChange.bind(this));
    };
    MediaMarshaller.decorators = [
        { type: core.Injectable, args: [{ providedIn: 'root' },] },
    ];
    /** @nocollapse */
    MediaMarshaller.ctorParameters = function () { return [
        { type: MatchMedia },
        { type: BreakPointRegistry },
        { type: PrintHook }
    ]; };
    /** @nocollapse */ MediaMarshaller.ngInjectableDef = core.defineInjectable({ factory: function MediaMarshaller_Factory() { return new MediaMarshaller(core.inject(MatchMedia), core.inject(BreakPointRegistry), core.inject(PrintHook)); }, token: MediaMarshaller, providedIn: "root" });
    return MediaMarshaller;
}());
/**
 * @param {?} map
 * @param {?} element
 * @param {?} key
 * @param {?=} input
 * @return {?}
 */
function initBuilderMap(map$$1, element, key, input) {
    if (input !== undefined) {
        /** @type {?} */
        var oldMap = map$$1.get(element);
        if (!oldMap) {
            oldMap = new Map();
            map$$1.set(element, oldMap);
        }
        oldMap.set(key, input);
    }
}

exports.ɵMatchMedia = MatchMedia;
exports.ɵMockMatchMedia = MockMatchMedia;
exports.ɵMockMatchMediaProvider = MockMatchMediaProvider;
exports.CoreModule = CoreModule;
exports.removeStyles = removeStyles;
exports.BROWSER_PROVIDER = BROWSER_PROVIDER;
exports.CLASS_NAME = CLASS_NAME;
exports.MediaChange = MediaChange;
exports.StylesheetMap = StylesheetMap;
exports.DEFAULT_CONFIG = DEFAULT_CONFIG;
exports.LAYOUT_CONFIG = LAYOUT_CONFIG;
exports.SERVER_TOKEN = SERVER_TOKEN;
exports.BREAKPOINT = BREAKPOINT;
exports.mergeAlias = mergeAlias;
exports.BaseDirective2 = BaseDirective2;
exports.DEFAULT_BREAKPOINTS = DEFAULT_BREAKPOINTS;
exports.ScreenTypes = ScreenTypes;
exports.ORIENTATION_BREAKPOINTS = ORIENTATION_BREAKPOINTS;
exports.BreakPointRegistry = BreakPointRegistry;
exports.BREAKPOINTS = BREAKPOINTS;
exports.MediaObserver = MediaObserver;
exports.MediaTrigger = MediaTrigger;
exports.sortDescendingPriority = sortDescendingPriority;
exports.sortAscendingPriority = sortAscendingPriority;
exports.coerceArray = coerceArray;
exports.StyleUtils = StyleUtils;
exports.StyleBuilder = StyleBuilder;
exports.validateBasis = validateBasis;
exports.MediaMarshaller = MediaMarshaller;
exports.BREAKPOINT_PRINT = BREAKPOINT_PRINT;
exports.PrintHook = PrintHook;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=flex-layout-core.umd.js.map
