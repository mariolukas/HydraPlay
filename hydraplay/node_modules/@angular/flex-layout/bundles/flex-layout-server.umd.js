/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/common'), require('@angular/core'), require('@angular/flex-layout/core'), require('@angular/platform-server')) :
	typeof define === 'function' && define.amd ? define('@angular/flex-layout/server', ['exports', '@angular/common', '@angular/core', '@angular/flex-layout/core', '@angular/platform-server'], factory) :
	(factory((global.ng = global.ng || {}, global.ng.flexLayout = global.ng.flexLayout || {}, global.ng.flexLayout.server = {}),global.ng.common,global.ng.core,global.ng.flexLayout.core,global.ng.platformServer));
}(this, (function (exports,common,core,core$1,platformServer) { 'use strict';

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
/**
 * Special server-only class to simulate a MediaQueryList and
 * - supports manual activation to simulate mediaQuery matching
 * - manages listeners
 */
var /**
 * Special server-only class to simulate a MediaQueryList and
 * - supports manual activation to simulate mediaQuery matching
 * - manages listeners
 */
ServerMediaQueryList = /** @class */ (function () {
    function ServerMediaQueryList(_mediaQuery) {
        this._mediaQuery = _mediaQuery;
        this._isActive = false;
        this._listeners = [];
        this.onchange = null;
    }
    Object.defineProperty(ServerMediaQueryList.prototype, "matches", {
        get: /**
         * @return {?}
         */
        function () {
            return this._isActive;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ServerMediaQueryList.prototype, "media", {
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
    ServerMediaQueryList.prototype.destroy = /**
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
    ServerMediaQueryList.prototype.activate = /**
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
    ServerMediaQueryList.prototype.deactivate = /**
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
    ServerMediaQueryList.prototype.addListener = /**
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
    /** Don't need to remove listeners in the server environment */
    /**
     * Don't need to remove listeners in the server environment
     * @param {?} _
     * @return {?}
     */
    ServerMediaQueryList.prototype.removeListener = /**
     * Don't need to remove listeners in the server environment
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
    ServerMediaQueryList.prototype.addEventListener = /**
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
    ServerMediaQueryList.prototype.removeEventListener = /**
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
    ServerMediaQueryList.prototype.dispatchEvent = /**
     * @param {?} _
     * @return {?}
     */
    function (_) {
        return false;
    };
    return ServerMediaQueryList;
}());
/**
 * Special server-only implementation of MatchMedia that uses the above
 * ServerMediaQueryList as its internal representation
 *
 * Also contains methods to activate and deactivate breakpoints
 */
var ServerMatchMedia = /** @class */ (function (_super) {
    __extends(ServerMatchMedia, _super);
    function ServerMatchMedia(_zone, _platformId, _document) {
        var _this = _super.call(this, _zone, _platformId, _document) || this;
        _this._zone = _zone;
        _this._platformId = _platformId;
        _this._document = _document;
        return _this;
    }
    /** Activate the specified breakpoint if we're on the server, no-op otherwise */
    /**
     * Activate the specified breakpoint if we're on the server, no-op otherwise
     * @param {?} bp
     * @return {?}
     */
    ServerMatchMedia.prototype.activateBreakpoint = /**
     * Activate the specified breakpoint if we're on the server, no-op otherwise
     * @param {?} bp
     * @return {?}
     */
    function (bp) {
        /** @type {?} */
        var lookupBreakpoint = /** @type {?} */ (this.registry.get(bp.mediaQuery));
        if (lookupBreakpoint) {
            lookupBreakpoint.activate();
        }
    };
    /** Deactivate the specified breakpoint if we're on the server, no-op otherwise */
    /**
     * Deactivate the specified breakpoint if we're on the server, no-op otherwise
     * @param {?} bp
     * @return {?}
     */
    ServerMatchMedia.prototype.deactivateBreakpoint = /**
     * Deactivate the specified breakpoint if we're on the server, no-op otherwise
     * @param {?} bp
     * @return {?}
     */
    function (bp) {
        /** @type {?} */
        var lookupBreakpoint = /** @type {?} */ (this.registry.get(bp.mediaQuery));
        if (lookupBreakpoint) {
            lookupBreakpoint.deactivate();
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
    ServerMatchMedia.prototype.buildMQL = /**
     * Call window.matchMedia() to build a MediaQueryList; which
     * supports 0..n listeners for activation/deactivation
     * @param {?} query
     * @return {?}
     */
    function (query) {
        return new ServerMediaQueryList(query);
    };
    ServerMatchMedia.decorators = [
        { type: core.Injectable },
    ];
    /** @nocollapse */
    ServerMatchMedia.ctorParameters = function () { return [
        { type: core.NgZone },
        { type: Object, decorators: [{ type: core.Inject, args: [core.PLATFORM_ID,] }] },
        { type: undefined, decorators: [{ type: core.Inject, args: [common.DOCUMENT,] }] }
    ]; };
    return ServerMatchMedia;
}(core$1.ɵMatchMedia));

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * Activate all of the registered breakpoints in sequence, and then
 * retrieve the associated stylings from the virtual stylesheet
 * @param {?} serverSheet the virtual stylesheet that stores styles for each
 *        element
 * @param {?} mediaController the MatchMedia service to activate/deactivate breakpoints
 * @param {?} breakpoints the registered breakpoints to activate/deactivate
 * @param {?} layoutConfig the library config, and specifically the breakpoints to activate
 * @return {?}
 */
function generateStaticFlexLayoutStyles(serverSheet, mediaController, breakpoints, layoutConfig) {
    /** @type {?} */
    var classMap = new Map();
    /** @type {?} */
    var defaultStyles = new Map(serverSheet.stylesheet);
    /** @type {?} */
    var styleText = generateCss(defaultStyles, 'all', classMap);
    breakpoints.slice().sort(core$1.sortAscendingPriority).forEach(function (bp, i) {
        serverSheet.clearStyles();
        mediaController.activateBreakpoint(bp);
        /** @type {?} */
        var stylesheet = new Map(serverSheet.stylesheet);
        if (stylesheet.size > 0) {
            styleText += generateCss(stylesheet, bp.mediaQuery, classMap);
        }
        mediaController.deactivateBreakpoint(breakpoints[i]);
    });
    /** @type {?} */
    var serverBps = layoutConfig.ssrObserveBreakpoints;
    if (serverBps) {
        serverBps
            .reduce(function (acc, serverBp) {
            /** @type {?} */
            var foundBp = breakpoints.find(function (bp) { return serverBp === bp.alias; });
            if (!foundBp) {
                console.warn("FlexLayoutServerModule: unknown breakpoint alias \"" + serverBp + "\"");
            }
            else {
                acc.push(foundBp);
            }
            return acc;
        }, [])
            .forEach(mediaController.activateBreakpoint);
    }
    return styleText;
}
/**
 * Create a style tag populated with the dynamic stylings from Flex
 * components and attach it to the head of the DOM
 * @param {?} serverSheet
 * @param {?} mediaController
 * @param {?} _document
 * @param {?} breakpoints
 * @param {?} layoutConfig
 * @return {?}
 */
function FLEX_SSR_SERIALIZER_FACTORY(serverSheet, mediaController, _document, breakpoints, layoutConfig) {
    return function () {
        /** @type {?} */
        var styleTag = _document.createElement('style');
        /** @type {?} */
        var styleText = generateStaticFlexLayoutStyles(serverSheet, mediaController, breakpoints, layoutConfig);
        styleTag.classList.add(core$1.CLASS_NAME + "ssr");
        styleTag.textContent = styleText; /** @type {?} */
        ((_document.head)).appendChild(styleTag);
    };
}
/** *
 *  Provider to set static styles on the server
  @type {?} */
var SERVER_PROVIDERS = [
    {
        provide: /** @type {?} */ (platformServer.BEFORE_APP_SERIALIZED),
        useFactory: FLEX_SSR_SERIALIZER_FACTORY,
        deps: [
            core$1.StylesheetMap,
            core$1.ɵMatchMedia,
            common.DOCUMENT,
            core$1.BREAKPOINTS,
            core$1.LAYOUT_CONFIG,
        ],
        multi: true
    },
    {
        provide: core$1.SERVER_TOKEN,
        useValue: true
    },
    {
        provide: core$1.ɵMatchMedia,
        useClass: ServerMatchMedia
    }
];
/** @type {?} */
var nextId = 0;
/** @type {?} */
var IS_DEBUG_MODE = false;
/**
 * create \@media queries based on a virtual stylesheet
 * * Adds a unique class to each element and stores it
 *   in a shared classMap for later reuse
 * @param {?} stylesheet the virtual stylesheet that stores styles for each
 *        element
 * @param {?} mediaQuery the given \@media CSS selector for the current breakpoint
 * @param {?} classMap the map of HTML elements to class names to avoid duplications
 * @return {?}
 */
function generateCss(stylesheet, mediaQuery, classMap) {
    /** @type {?} */
    var css = '';
    stylesheet.forEach(function (styles, el) {
        /** @type {?} */
        var keyVals = '';
        /** @type {?} */
        var className = getClassName(el, classMap);
        styles.forEach(function (v, k) {
            keyVals += v ? format(k + ":" + v + ";") : '';
        });
        // Build list of CSS styles; each with a className
        css += format("." + className + " {", keyVals, '}');
    });
    // Group 1 or more styles (each with className) in a specific mediaQuery
    return format("@media " + mediaQuery + " {", css, '}');
}
/**
 * For debugging purposes, prefix css segment with linefeed(s) for easy
 * debugging purposes.
 * @param {...?} list
 * @return {?}
 */
function format() {
    var list = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        list[_i] = arguments[_i];
    }
    /** @type {?} */
    var result = '';
    list.forEach(function (css, i) {
        result += IS_DEBUG_MODE ? formatSegment(css, i !== 0) : css;
    });
    return result;
}
/**
 * @param {?} css
 * @param {?=} asPrefix
 * @return {?}
 */
function formatSegment(css, asPrefix) {
    if (asPrefix === void 0) { asPrefix = true; }
    return asPrefix ? "\n" + css : css + "\n";
}
/**
 * Get className associated with CSS styling
 * If not found, generate global className and set
 * association.
 * @param {?} element
 * @param {?} classMap
 * @return {?}
 */
function getClassName(element, classMap) {
    /** @type {?} */
    var className = classMap.get(element);
    if (!className) {
        className = "" + core$1.CLASS_NAME + nextId++;
        classMap.set(element, className);
    }
    element.classList.add(className);
    return className;
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
var FlexLayoutServerModule = /** @class */ (function () {
    function FlexLayoutServerModule() {
    }
    FlexLayoutServerModule.decorators = [
        { type: core.NgModule, args: [{
                    providers: [SERVER_PROVIDERS]
                },] },
    ];
    return FlexLayoutServerModule;
}());

exports.FlexLayoutServerModule = FlexLayoutServerModule;
exports.generateStaticFlexLayoutStyles = generateStaticFlexLayoutStyles;
exports.FLEX_SSR_SERIALIZER_FACTORY = FLEX_SSR_SERIALIZER_FACTORY;
exports.SERVER_PROVIDERS = SERVER_PROVIDERS;
exports.ɵa2 = ServerMatchMedia;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=flex-layout-server.umd.js.map
