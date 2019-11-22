/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { APP_BOOTSTRAP_LISTENER, PLATFORM_ID, NgModule, Injectable, InjectionToken, Inject, inject, NgZone, Optional, defineInjectable } from '@angular/core';
import { DOCUMENT, isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Subject, BehaviorSubject, Observable, merge, asapScheduler, of, fromEvent } from 'rxjs';
import { filter, debounceTime, map, switchMap, takeUntil, take, tap } from 'rxjs/operators';

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
    return () => {
        if (isPlatformBrowser(platformId)) {
            /** @type {?} */
            const elements = Array.from(_document.querySelectorAll(`[class*=${CLASS_NAME}]`));
            /** @type {?} */
            const classRegex = /\bflex-layout-.+?\b/g;
            elements.forEach(el => {
                el.classList.contains(`${CLASS_NAME}ssr`) && el.parentNode ?
                    el.parentNode.removeChild(el) : el.className.replace(classRegex, '');
            });
        }
    };
}
/** *
 *  Provider to remove SSR styles on the browser
  @type {?} */
const BROWSER_PROVIDER = {
    provide: /** @type {?} */ (APP_BOOTSTRAP_LISTENER),
    useFactory: removeStyles,
    deps: [DOCUMENT, PLATFORM_ID],
    multi: true
};
/** @type {?} */
const CLASS_NAME = 'flex-layout-';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * *****************************************************************
 * Define module for the MediaQuery API
 * *****************************************************************
 */
class CoreModule {
}
CoreModule.decorators = [
    { type: NgModule, args: [{
                providers: [BROWSER_PROVIDER]
            },] },
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * Class instances emitted [to observers] for each mql notification
 */
class MediaChange {
    /**
     * @param {?=} matches whether the mediaQuery is currently activated
     * @param {?=} mediaQuery e.g. (min-width: 600px) and (max-width: 959px)
     * @param {?=} mqAlias e.g. gt-sm, md, gt-lg
     * @param {?=} suffix e.g. GtSM, Md, GtLg
     * @param {?=} priority the priority of activation for the given breakpoint
     */
    constructor(matches = false, mediaQuery = 'all', mqAlias = '', suffix = '', priority = 0) {
        this.matches = matches;
        this.mediaQuery = mediaQuery;
        this.mqAlias = mqAlias;
        this.suffix = suffix;
        this.priority = priority;
        this.property = '';
    }
    /**
     * Create an exact copy of the MediaChange
     * @return {?}
     */
    clone() {
        return new MediaChange(this.matches, this.mediaQuery, this.mqAlias, this.suffix);
    }
}

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
class StylesheetMap {
    constructor() {
        this.stylesheet = new Map();
    }
    /**
     * Add an individual style to an HTML element
     * @param {?} element
     * @param {?} style
     * @param {?} value
     * @return {?}
     */
    addStyleToElement(element, style, value) {
        /** @type {?} */
        const stylesheet = this.stylesheet.get(element);
        if (stylesheet) {
            stylesheet.set(style, value);
        }
        else {
            this.stylesheet.set(element, new Map([[style, value]]));
        }
    }
    /**
     * Clear the virtual stylesheet
     * @return {?}
     */
    clearStyles() {
        this.stylesheet.clear();
    }
    /**
     * Retrieve a given style for an HTML element
     * @param {?} el
     * @param {?} styleName
     * @return {?}
     */
    getStyleForElement(el, styleName) {
        /** @type {?} */
        const styles = this.stylesheet.get(el);
        /** @type {?} */
        let value = '';
        if (styles) {
            /** @type {?} */
            const style = styles.get(styleName);
            if (typeof style === 'number' || typeof style === 'string') {
                value = style + '';
            }
        }
        return value;
    }
}
StylesheetMap.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] },
];
/** @nocollapse */ StylesheetMap.ngInjectableDef = defineInjectable({ factory: function StylesheetMap_Factory() { return new StylesheetMap(); }, token: StylesheetMap, providedIn: "root" });

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
const DEFAULT_CONFIG = {
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
const LAYOUT_CONFIG = new InjectionToken('Flex Layout token, config options for the library', {
    providedIn: 'root',
    factory: () => DEFAULT_CONFIG
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
const SERVER_TOKEN = new InjectionToken('FlexLayoutServerLoaded', {
    providedIn: 'root',
    factory: () => false
});

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
const BREAKPOINT = new InjectionToken('Flex Layout token, collect all breakpoints into one provider', {
    providedIn: 'root',
    factory: () => null
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
const INLINE = 'inline';
/** @type {?} */
const LAYOUT_VALUES = ['row', 'column', 'row-reverse', 'column-reverse'];
/**
 * Validate the direction|'direction wrap' value and then update the host's inline flexbox styles
 * @param {?} value
 * @return {?}
 */
function buildLayoutCSS(value) {
    let [direction, wrap, isInline] = validateValue(value);
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
    let [direction, wrap, inline] = value.split(' ');
    // First value must be the `flex-direction`
    if (!LAYOUT_VALUES.find(x => x === direction)) {
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
function buildCSS(direction, wrap = null, inline = false) {
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
class BaseDirective2 {
    /**
     * @param {?} elementRef
     * @param {?} styleBuilder
     * @param {?} styler
     * @param {?} marshal
     */
    constructor(elementRef, styleBuilder, styler, marshal) {
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
        this.destroySubject = new Subject();
        /**
         * Cache map for style computation
         */
        this.styleCache = new Map();
    }
    /**
     * Access to host element's parent DOM node
     * @return {?}
     */
    get parentElement() {
        return this.elementRef.nativeElement.parentElement;
    }
    /**
     * Access to the HTMLElement for the directive
     * @return {?}
     */
    get nativeElement() {
        return this.elementRef.nativeElement;
    }
    /**
     * Access to the activated value for the directive
     * @return {?}
     */
    get activatedValue() {
        return this.marshal.getValue(this.nativeElement, this.DIRECTIVE_KEY);
    }
    /**
     * @param {?} value
     * @return {?}
     */
    set activatedValue(value) {
        this.marshal.setValue(this.nativeElement, this.DIRECTIVE_KEY, value, this.marshal.activatedAlias);
    }
    /**
     * For \@Input changes
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        Object.keys(changes).forEach(key => {
            if (this.inputs.indexOf(key) !== -1) {
                /** @type {?} */
                const bp = key.split('.').slice(1).join('.');
                /** @type {?} */
                const val = changes[key].currentValue;
                this.setValue(val, bp);
            }
        });
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        this.destroySubject.next();
        this.destroySubject.complete();
        this.marshal.releaseElement(this.nativeElement);
    }
    /**
     * Register with central marshaller service
     * @param {?=} extraTriggers
     * @return {?}
     */
    init(extraTriggers = []) {
        this.marshal.init(this.elementRef.nativeElement, this.DIRECTIVE_KEY, this.updateWithValue.bind(this), this.clearStyles.bind(this), extraTriggers);
    }
    /**
     * Add styles to the element using predefined style builder
     * @param {?} input
     * @param {?=} parent
     * @return {?}
     */
    addStyles(input, parent) {
        /** @type {?} */
        const builder = this.styleBuilder;
        /** @type {?} */
        const useCache = builder.shouldCache;
        /** @type {?} */
        let genStyles = this.styleCache.get(input);
        if (!genStyles || !useCache) {
            genStyles = builder.buildStyles(input, parent);
            if (useCache) {
                this.styleCache.set(input, genStyles);
            }
        }
        this.mru = Object.assign({}, genStyles);
        this.applyStyleToElement(genStyles);
        builder.sideEffect(input, genStyles, parent);
    }
    /**
     * Remove generated styles from an element using predefined style builder
     * @return {?}
     */
    clearStyles() {
        Object.keys(this.mru).forEach(k => {
            this.mru[k] = '';
        });
        this.applyStyleToElement(this.mru);
        this.mru = {};
    }
    /**
     * Force trigger style updates on DOM element
     * @return {?}
     */
    triggerUpdate() {
        this.marshal.triggerUpdate(this.nativeElement, this.DIRECTIVE_KEY);
    }
    /**
     * Determine the DOM element's Flexbox flow (flex-direction).
     *
     * Check inline style first then check computed (stylesheet) style.
     * And optionally add the flow value to element's inline style.
     * @param {?} target
     * @param {?=} addIfMissing
     * @return {?}
     */
    getFlexFlowDirection(target, addIfMissing = false) {
        if (target) {
            const [value, hasInlineValue] = this.styler.getFlowDirection(target);
            if (!hasInlineValue && addIfMissing) {
                /** @type {?} */
                const style = buildLayoutCSS(value);
                /** @type {?} */
                const elements = [target];
                this.styler.applyStyleToElements(style, elements);
            }
            return value.trim();
        }
        return 'row';
    }
    /**
     * Applies styles given via string pair or object map to the directive element
     * @param {?} style
     * @param {?=} value
     * @param {?=} element
     * @return {?}
     */
    applyStyleToElement(style, value, element = this.nativeElement) {
        this.styler.applyStyleToElement(element, style, value);
    }
    /**
     * @param {?} val
     * @param {?} bp
     * @return {?}
     */
    setValue(val, bp) {
        this.marshal.setValue(this.nativeElement, this.DIRECTIVE_KEY, val, bp);
    }
    /**
     * @param {?} input
     * @return {?}
     */
    updateWithValue(input) {
        this.addStyles(input);
    }
}

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
const DEFAULT_BREAKPOINTS = [
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
const HANDSET_PORTRAIT = '(orientation: portrait) and (max-width: 599.99px)';
/** @type {?} */
const HANDSET_LANDSCAPE = '(orientation: landscape) and (max-width: 959.99px)';
/** @type {?} */
const TABLET_PORTRAIT = '(orientation: portrait) and (min-width: 600px) and (max-width: 839.99px)';
/** @type {?} */
const TABLET_LANDSCAPE = '(orientation: landscape) and (min-width: 960px) and (max-width: 1279.99px)';
/** @type {?} */
const WEB_PORTRAIT = '(orientation: portrait) and (min-width: 840px)';
/** @type {?} */
const WEB_LANDSCAPE = '(orientation: landscape) and (min-width: 1280px)';
/** @type {?} */
const ScreenTypes = {
    'HANDSET': `${HANDSET_PORTRAIT}, ${HANDSET_LANDSCAPE}`,
    'TABLET': `${TABLET_PORTRAIT} , ${TABLET_LANDSCAPE}`,
    'WEB': `${WEB_PORTRAIT}, ${WEB_LANDSCAPE} `,
    'HANDSET_PORTRAIT': `${HANDSET_PORTRAIT}`,
    'TABLET_PORTRAIT': `${TABLET_PORTRAIT} `,
    'WEB_PORTRAIT': `${WEB_PORTRAIT}`,
    'HANDSET_LANDSCAPE': `${HANDSET_LANDSCAPE}]`,
    'TABLET_LANDSCAPE': `${TABLET_LANDSCAPE}`,
    'WEB_LANDSCAPE': `${WEB_LANDSCAPE}`
};
/** *
 * Extended Breakpoints for handset/tablets with landscape or portrait orientations
  @type {?} */
const ORIENTATION_BREAKPOINTS = [
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
function extendObject(dest, ...sources) {
    if (dest == null) {
        throw TypeError('Cannot convert undefined or null to object');
    }
    for (let source of sources) {
        if (source != null) {
            for (let key in source) {
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
const ALIAS_DELIMITERS = /(\.|-|_)/g;
/**
 * @param {?} part
 * @return {?}
 */
function firstUpperCase(part) {
    /** @type {?} */
    let first = part.length > 0 ? part.charAt(0) : '';
    /** @type {?} */
    let remainder = (part.length > 1) ? part.slice(1) : '';
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
    list.forEach((bp) => {
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
function mergeByAlias(defaults, custom = []) {
    /** @type {?} */
    const dict = {};
    defaults.forEach(bp => {
        dict[bp.alias] = bp;
    });
    // Merge custom breakpoints
    custom.forEach((bp) => {
        if (dict[bp.alias]) {
            extendObject(dict[bp.alias], bp);
        }
        else {
            dict[bp.alias] = bp;
        }
    });
    return validateSuffixes(Object.keys(dict).map(k => dict[k]));
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** *
 *  Injection token unique to the flex-layout library.
 *  Use this token when build a custom provider (see below).
  @type {?} */
const BREAKPOINTS = new InjectionToken('Token (@angular/flex-layout) Breakpoints', {
    providedIn: 'root',
    factory: () => {
        /** @type {?} */
        const breakpoints = inject(BREAKPOINT);
        /** @type {?} */
        const layoutConfig = inject(LAYOUT_CONFIG);
        /** @type {?} */
        const bpFlattenArray = [].concat.apply([], (breakpoints || [])
            .map((v) => Array.isArray(v) ? v : [v]));
        /** @type {?} */
        const builtIns = (layoutConfig.disableDefaultBps ? [] : DEFAULT_BREAKPOINTS)
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
    const priorityA = a ? a.priority || 0 : 0;
    /** @type {?} */
    const priorityB = b ? b.priority || 0 : 0;
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
    const pA = a.priority || 0;
    /** @type {?} */
    const pB = b.priority || 0;
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
class BreakPointRegistry {
    /**
     * @param {?} list
     */
    constructor(list) {
        /**
         * Memoized BreakPoint Lookups
         */
        this.findByMap = new Map();
        this.items = [...list].sort(sortAscendingPriority);
    }
    /**
     * Search breakpoints by alias (e.g. gt-xs)
     * @param {?} alias
     * @return {?}
     */
    findByAlias(alias) {
        return !alias ? null : this.findWithPredicate(alias, (bp) => bp.alias == alias);
    }
    /**
     * @param {?} query
     * @return {?}
     */
    findByQuery(query) {
        return this.findWithPredicate(query, (bp) => bp.mediaQuery == query);
    }
    /**
     * Get all the breakpoints whose ranges could overlapping `normal` ranges;
     * e.g. gt-sm overlaps md, lg, and xl
     * @return {?}
     */
    get overlappings() {
        return this.items.filter(it => it.overlapping == true);
    }
    /**
     * Get list of all registered (non-empty) breakpoint aliases
     * @return {?}
     */
    get aliases() {
        return this.items.map(it => it.alias);
    }
    /**
     * Aliases are mapped to properties using suffixes
     * e.g.  'gt-sm' for property 'layout'  uses suffix 'GtSm'
     * for property layoutGtSM.
     * @return {?}
     */
    get suffixes() {
        return this.items.map(it => !!it.suffix ? it.suffix : '');
    }
    /**
     * Memoized lookup using custom predicate function
     * @param {?} key
     * @param {?} searchFn
     * @return {?}
     */
    findWithPredicate(key, searchFn) {
        /** @type {?} */
        let response = this.findByMap.get(key);
        if (!response) {
            response = this.items.find(searchFn) || null;
            this.findByMap.set(key, response);
        }
        return response || null;
    }
}
BreakPointRegistry.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] },
];
/** @nocollapse */
BreakPointRegistry.ctorParameters = () => [
    { type: Array, decorators: [{ type: Inject, args: [BREAKPOINTS,] }] }
];
/** @nocollapse */ BreakPointRegistry.ngInjectableDef = defineInjectable({ factory: function BreakPointRegistry_Factory() { return new BreakPointRegistry(inject(BREAKPOINTS)); }, token: BreakPointRegistry, providedIn: "root" });

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
class MatchMedia {
    /**
     * @param {?} _zone
     * @param {?} _platformId
     * @param {?} _document
     */
    constructor(_zone, _platformId, _document) {
        this._zone = _zone;
        this._platformId = _platformId;
        this._document = _document;
        /**
         * Initialize source with 'all' so all non-responsive APIs trigger style updates
         */
        this.source = new BehaviorSubject(new MediaChange(true));
        this.registry = new Map();
        this._observable$ = this.source.asObservable();
    }
    /**
     * Publish list of all current activations
     * @return {?}
     */
    get activations() {
        /** @type {?} */
        const results = [];
        this.registry.forEach((mql, key) => {
            if (mql.matches) {
                results.push(key);
            }
        });
        return results;
    }
    /**
     * For the specified mediaQuery?
     * @param {?} mediaQuery
     * @return {?}
     */
    isActive(mediaQuery) {
        /** @type {?} */
        const mql = this.registry.get(mediaQuery);
        return !!mql ? mql.matches : false;
    }
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
    observe(mqList, filterOthers = false) {
        if (mqList && mqList.length) {
            /** @type {?} */
            const matchMedia$ = this._observable$.pipe(filter((change) => {
                return !filterOthers ? true : (mqList.indexOf(change.mediaQuery) > -1);
            }));
            /** @type {?} */
            const registration$ = new Observable((observer) => {
                /** @type {?} */
                const matches = this.registerQuery(mqList);
                if (matches.length) {
                    /** @type {?} */
                    const lastChange = /** @type {?} */ ((matches.pop()));
                    matches.forEach((e) => {
                        observer.next(e);
                    });
                    this.source.next(lastChange); // last match is cached
                }
                observer.complete();
            });
            return merge(registration$, matchMedia$);
        }
        return this._observable$;
    }
    /**
     * Based on the BreakPointRegistry provider, register internal listeners for each unique
     * mediaQuery. Each listener emits specific MediaChange data to observers
     * @param {?} mediaQuery
     * @return {?}
     */
    registerQuery(mediaQuery) {
        /** @type {?} */
        const list = Array.isArray(mediaQuery) ? mediaQuery : [mediaQuery];
        /** @type {?} */
        const matches = [];
        buildQueryCss(list, this._document);
        list.forEach((query) => {
            /** @type {?} */
            const onMQLEvent = (e) => {
                this._zone.run(() => this.source.next(new MediaChange(e.matches, query)));
            };
            /** @type {?} */
            let mql = this.registry.get(query);
            if (!mql) {
                mql = this.buildMQL(query);
                mql.addListener(onMQLEvent);
                this.registry.set(query, mql);
            }
            if (mql.matches) {
                matches.push(new MediaChange(true, query));
            }
        });
        return matches;
    }
    /**
     * Call window.matchMedia() to build a MediaQueryList; which
     * supports 0..n listeners for activation/deactivation
     * @param {?} query
     * @return {?}
     */
    buildMQL(query) {
        return constructMql(query, isPlatformBrowser(this._platformId));
    }
}
MatchMedia.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] },
];
/** @nocollapse */
MatchMedia.ctorParameters = () => [
    { type: NgZone },
    { type: Object, decorators: [{ type: Inject, args: [PLATFORM_ID,] }] },
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] }
];
/** @nocollapse */ MatchMedia.ngInjectableDef = defineInjectable({ factory: function MatchMedia_Factory() { return new MatchMedia(inject(NgZone), inject(PLATFORM_ID), inject(DOCUMENT)); }, token: MatchMedia, providedIn: "root" });
/** *
 * Private global registry for all dynamically-created, injected style tags
 * @see prepare(query)
  @type {?} */
const ALL_STYLES = {};
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
    const list = mediaQueries.filter(it => !ALL_STYLES[it]);
    if (list.length > 0) {
        /** @type {?} */
        const query = list.join(', ');
        try {
            /** @type {?} */
            const styleEl = _document.createElement('style');
            styleEl.setAttribute('type', 'text/css');
            if (!(/** @type {?} */ (styleEl)).styleSheet) {
                /** @type {?} */
                const cssText = `
/*
  @angular/flex-layout - workaround for possible browser quirk with mediaQuery listeners
  see http://bit.ly/2sd4HMP
*/
@media ${query} {.fx-query-test{ }}
`;
                styleEl.appendChild(_document.createTextNode(cssText));
            } /** @type {?} */
            ((_document.head)).appendChild(styleEl);
            // Store in private global registry
            list.forEach(mq => ALL_STYLES[mq] = styleEl);
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
    const canListen = isBrowser && !!(/** @type {?} */ (window)).matchMedia('all').addListener;
    return canListen ? (/** @type {?} */ (window)).matchMedia(query) : /** @type {?} */ (({
        matches: query === 'all' || query === '',
        media: query,
        addListener: () => {
        },
        removeListener: () => {
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
class MockMatchMedia extends MatchMedia {
    /**
     * @param {?} _zone
     * @param {?} _platformId
     * @param {?} _document
     * @param {?} _breakpoints
     */
    constructor(_zone, _platformId, _document, _breakpoints) {
        super(_zone, _platformId, _document);
        this._breakpoints = _breakpoints;
        this.autoRegisterQueries = true; // Used for testing BreakPoint registrations
        this.useOverlaps = false;
    }
    /**
     * Easy method to clear all listeners for all mediaQueries
     * @return {?}
     */
    clearAll() {
        this.registry.forEach((mql) => {
            (/** @type {?} */ (mql)).destroy();
        });
        this.registry.clear();
        this.useOverlaps = false;
    }
    /**
     * Feature to support manual, simulated activation of a mediaQuery.
     * @param {?} mediaQuery
     * @param {?=} useOverlaps
     * @return {?}
     */
    activate(mediaQuery, useOverlaps = false) {
        useOverlaps = useOverlaps || this.useOverlaps;
        mediaQuery = this._validateQuery(mediaQuery);
        if (useOverlaps || !this.isActive(mediaQuery)) {
            this._deactivateAll();
            this._registerMediaQuery(mediaQuery);
            this._activateWithOverlaps(mediaQuery, useOverlaps);
        }
        return this.hasActivated;
    }
    /**
     * Converts an optional mediaQuery alias to a specific, valid mediaQuery
     * @param {?} queryOrAlias
     * @return {?}
     */
    _validateQuery(queryOrAlias) {
        /** @type {?} */
        const bp = this._breakpoints.findByAlias(queryOrAlias);
        return (bp && bp.mediaQuery) || queryOrAlias;
    }
    /**
     * Manually onMediaChange any overlapping mediaQueries to simulate
     * similar functionality in the window.matchMedia()
     * @param {?} mediaQuery
     * @param {?} useOverlaps
     * @return {?}
     */
    _activateWithOverlaps(mediaQuery, useOverlaps) {
        if (useOverlaps) {
            /** @type {?} */
            const bp = this._breakpoints.findByQuery(mediaQuery);
            /** @type {?} */
            const alias = bp ? bp.alias : 'unknown';
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
    }
    /**
     *
     * @param {?} aliases
     * @return {?}
     */
    _activateByAlias(aliases) {
        /** @type {?} */
        const activate = (alias) => {
            /** @type {?} */
            const bp = this._breakpoints.findByAlias(alias);
            this._activateByQuery(bp ? bp.mediaQuery : alias);
        };
        aliases.split(',').forEach(alias => activate(alias.trim()));
    }
    /**
     *
     * @param {?} mediaQuery
     * @return {?}
     */
    _activateByQuery(mediaQuery) {
        /** @type {?} */
        const mql = /** @type {?} */ (this.registry.get(mediaQuery));
        if (mql && !this.isActive(mediaQuery)) {
            this.registry.set(mediaQuery, mql.activate());
        }
        return this.hasActivated;
    }
    /**
     * Deactivate all current MQLs and reset the buffer
     * @return {?}
     */
    _deactivateAll() {
        this.registry.forEach((it) => {
            (/** @type {?} */ (it)).deactivate();
        });
        return this;
    }
    /**
     * Insure the mediaQuery is registered with MatchMedia
     * @param {?} mediaQuery
     * @return {?}
     */
    _registerMediaQuery(mediaQuery) {
        if (!this.registry.has(mediaQuery) && this.autoRegisterQueries) {
            this.registerQuery(mediaQuery);
        }
    }
    /**
     * Call window.matchMedia() to build a MediaQueryList; which
     * supports 0..n listeners for activation/deactivation
     * @param {?} query
     * @return {?}
     */
    buildMQL(query) {
        return new MockMediaQueryList(query);
    }
    /**
     * @return {?}
     */
    get hasActivated() {
        return this.activations.length > 0;
    }
}
MockMatchMedia.decorators = [
    { type: Injectable },
];
/** @nocollapse */
MockMatchMedia.ctorParameters = () => [
    { type: NgZone },
    { type: Object, decorators: [{ type: Inject, args: [PLATFORM_ID,] }] },
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] },
    { type: BreakPointRegistry }
];
/**
 * Special internal class to simulate a MediaQueryList and
 * - supports manual activation to simulate mediaQuery matching
 * - manages listeners
 */
class MockMediaQueryList {
    /**
     * @param {?} _mediaQuery
     */
    constructor(_mediaQuery) {
        this._mediaQuery = _mediaQuery;
        this._isActive = false;
        this._listeners = [];
        this.onchange = null;
    }
    /**
     * @return {?}
     */
    get matches() {
        return this._isActive;
    }
    /**
     * @return {?}
     */
    get media() {
        return this._mediaQuery;
    }
    /**
     * Destroy the current list by deactivating the
     * listeners and clearing the internal list
     * @return {?}
     */
    destroy() {
        this.deactivate();
        this._listeners = [];
    }
    /**
     * Notify all listeners that 'matches === TRUE'
     * @return {?}
     */
    activate() {
        if (!this._isActive) {
            this._isActive = true;
            this._listeners.forEach((callback) => {
                /** @type {?} */
                const cb = /** @type {?} */ ((callback));
                cb.call(null, this);
            });
        }
        return this;
    }
    /**
     * Notify all listeners that 'matches === false'
     * @return {?}
     */
    deactivate() {
        if (this._isActive) {
            this._isActive = false;
            this._listeners.forEach((callback) => {
                /** @type {?} */
                const cb = /** @type {?} */ ((callback));
                cb.call(null, this);
            });
        }
        return this;
    }
    /**
     * Add a listener to our internal list to activate later
     * @param {?} listener
     * @return {?}
     */
    addListener(listener) {
        if (this._listeners.indexOf(listener) === -1) {
            this._listeners.push(listener);
        }
        if (this._isActive) {
            /** @type {?} */
            const cb = /** @type {?} */ ((listener));
            cb.call(null, this);
        }
    }
    /**
     * Don't need to remove listeners in the testing environment
     * @param {?} _
     * @return {?}
     */
    removeListener(_) {
    }
    /**
     * @param {?} _
     * @param {?} __
     * @param {?=} ___
     * @return {?}
     */
    addEventListener(_, __, ___) {
    }
    /**
     * @param {?} _
     * @param {?} __
     * @param {?=} ___
     * @return {?}
     */
    removeEventListener(_, __, ___) {
    }
    /**
     * @param {?} _
     * @return {?}
     */
    dispatchEvent(_) {
        return false;
    }
}
/** *
 * Pre-configured provider for MockMatchMedia
  @type {?} */
const MockMatchMediaProvider = {
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
const PRINT = 'print';
/** @type {?} */
const BREAKPOINT_PRINT = {
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
class PrintHook {
    /**
     * @param {?} breakpoints
     * @param {?} layoutConfig
     */
    constructor(breakpoints, layoutConfig) {
        this.breakpoints = breakpoints;
        this.layoutConfig = layoutConfig;
        /**
         * Is this service currently in Print-mode ?
         */
        this.isPrinting = false;
        this.queue = new PrintQueue();
        this.deactivations = [];
    }
    /**
     * Add 'print' mediaQuery: to listen for matchMedia activations
     * @param {?} queries
     * @return {?}
     */
    withPrintQuery(queries) {
        return [...queries, PRINT];
    }
    /**
     * Is the MediaChange event for any 'print' \@media
     * @param {?} e
     * @return {?}
     */
    isPrintEvent(e) {
        return e.mediaQuery.startsWith(PRINT);
    }
    /**
     * What is the desired mqAlias to use while printing?
     * @return {?}
     */
    get printAlias() {
        return this.layoutConfig.printWithBreakpoints || [];
    }
    /**
     * Lookup breakpoints associated with print aliases.
     * @return {?}
     */
    get printBreakPoints() {
        return /** @type {?} */ (this.printAlias
            .map(alias => this.breakpoints.findByAlias(alias))
            .filter(bp => bp !== null));
    }
    /**
     * Lookup breakpoint associated with mediaQuery
     * @param {?} __0
     * @return {?}
     */
    getEventBreakpoints({ mediaQuery }) {
        /** @type {?} */
        const bp = this.breakpoints.findByQuery(mediaQuery);
        /** @type {?} */
        const list = bp ? [...this.printBreakPoints, bp] : this.printBreakPoints;
        return list.sort(sortDescendingPriority);
    }
    /**
     * Update event with printAlias mediaQuery information
     * @param {?} event
     * @return {?}
     */
    updateEvent(event) {
        /** @type {?} */
        let bp = this.breakpoints.findByQuery(event.mediaQuery);
        if (this.isPrintEvent(event)) {
            // Reset from 'print' to first (highest priority) print breakpoint
            bp = this.getEventBreakpoints(event)[0];
            event.mediaQuery = bp ? bp.mediaQuery : '';
        }
        return mergeAlias(event, bp);
    }
    /**
     * Prepare RxJs filter operator with partial application
     * @param {?} target
     * @return {?} pipeable filter predicate
     */
    interceptEvents(target) {
        return (event) => {
            if (this.isPrintEvent(event)) {
                if (event.matches && !this.isPrinting) {
                    this.startPrinting(target, this.getEventBreakpoints(event));
                    target.updateStyles();
                }
                else if (!event.matches && this.isPrinting) {
                    this.stopPrinting(target);
                    target.updateStyles();
                }
            }
            else {
                this.collectActivations(event);
            }
        };
    }
    /**
     * Stop mediaChange event propagation in event streams
     * @return {?}
     */
    blockPropagation() {
        return (event) => {
            return !(this.isPrinting || this.isPrintEvent(event));
        };
    }
    /**
     * Save current activateBreakpoints (for later restore)
     * and substitute only the printAlias breakpoint
     * @param {?} target
     * @param {?} bpList
     * @return {?}
     */
    startPrinting(target, bpList) {
        this.isPrinting = true;
        target.activatedBreakpoints = this.queue.addPrintBreakpoints(bpList);
    }
    /**
     * For any print de-activations, reset the entire print queue
     * @param {?} target
     * @return {?}
     */
    stopPrinting(target) {
        target.activatedBreakpoints = this.deactivations;
        this.deactivations = [];
        this.queue.clear();
        this.isPrinting = false;
    }
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
    collectActivations(event) {
        if (!this.isPrinting) {
            if (!event.matches) {
                /** @type {?} */
                const bp = this.breakpoints.findByQuery(event.mediaQuery);
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
    }
}
PrintHook.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] },
];
/** @nocollapse */
PrintHook.ctorParameters = () => [
    { type: BreakPointRegistry },
    { type: undefined, decorators: [{ type: Inject, args: [LAYOUT_CONFIG,] }] }
];
/** @nocollapse */ PrintHook.ngInjectableDef = defineInjectable({ factory: function PrintHook_Factory() { return new PrintHook(inject(BreakPointRegistry), inject(LAYOUT_CONFIG)); }, token: PrintHook, providedIn: "root" });
/**
 * Utility class to manage print breakpoints + activatedBreakpoints
 * with correct sorting WHILE printing
 */
class PrintQueue {
    constructor() {
        /**
         * Sorted queue with prioritized print breakpoints
         */
        this.printBreakpoints = [];
    }
    /**
     * @param {?} bpList
     * @return {?}
     */
    addPrintBreakpoints(bpList) {
        bpList.push(BREAKPOINT_PRINT);
        bpList.sort(sortDescendingPriority);
        bpList.forEach(bp => this.addBreakpoint(bp));
        return this.printBreakpoints;
    }
    /**
     * Add Print breakpoint to queue
     * @param {?} bp
     * @return {?}
     */
    addBreakpoint(bp) {
        if (!!bp) {
            /** @type {?} */
            const bpInList = this.printBreakpoints.find(it => it.mediaQuery === bp.mediaQuery);
            if (bpInList === undefined) {
                // If this is a `printAlias` breakpoint, then append. If a true 'print' breakpoint,
                // register as highest priority in the queue
                this.printBreakpoints = isPrintBreakPoint(bp) ? [bp, ...this.printBreakpoints]
                    : [...this.printBreakpoints, bp];
            }
        }
    }
    /**
     * Restore original activated breakpoints and clear internal caches
     * @return {?}
     */
    clear() {
        this.printBreakpoints = [];
    }
}
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
class MediaObserver {
    /**
     * @param {?} breakpoints
     * @param {?} matchMedia
     * @param {?} hook
     */
    constructor(breakpoints, matchMedia, hook) {
        this.breakpoints = breakpoints;
        this.matchMedia = matchMedia;
        this.hook = hook;
        /**
         * Filter MediaChange notifications for overlapping breakpoints
         */
        this.filterOverlaps = false;
        this.destroyed$ = new Subject();
        this._media$ = this.watchActivations();
        this.media$ = this._media$.pipe(filter((changes) => changes.length > 0), map((changes) => changes[0]));
    }
    /**
     * Completes the active subject, signalling to all complete for all
     * MediaObserver subscribers
     * @return {?}
     */
    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
    /**
     * Observe changes to current activation 'list'
     * @return {?}
     */
    asObservable() {
        return this._media$;
    }
    /**
     * Allow programmatic query to determine if one or more media query/alias match
     * the current viewport size.
     * @param {?} value One or more media queries (or aliases) to check.
     * @return {?} Whether any of the media queries match.
     */
    isActive(value) {
        /** @type {?} */
        const aliases = splitQueries(coerceArray(value));
        return aliases.some(alias => {
            /** @type {?} */
            const query = toMediaQuery(alias, this.breakpoints);
            return this.matchMedia.isActive(query);
        });
    }
    /**
     * Register all the mediaQueries registered in the BreakPointRegistry
     * This is needed so subscribers can be auto-notified of all standard, registered
     * mediaQuery activations
     * @return {?}
     */
    watchActivations() {
        /** @type {?} */
        const queries = this.breakpoints.items.map(bp => bp.mediaQuery);
        return this.buildObservable(queries);
    }
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
    buildObservable(mqList) {
        /** @type {?} */
        const hasChanges = (changes) => {
            /** @type {?} */
            const isValidQuery = (change) => (change.mediaQuery.length > 0);
            return (changes.filter(isValidQuery).length > 0);
        };
        /** @type {?} */
        const excludeOverlaps = (changes) => {
            return !this.filterOverlaps ? changes : changes.filter(change => {
                /** @type {?} */
                const bp = this.breakpoints.findByQuery(change.mediaQuery);
                return !bp ? true : !bp.overlapping;
            });
        };
        /**
             */
        return this.matchMedia
            .observe(this.hook.withPrintQuery(mqList))
            .pipe(filter((change) => change.matches), debounceTime(0, asapScheduler), switchMap(_ => of(this.findAllActivations())), map(excludeOverlaps), filter(hasChanges), takeUntil(this.destroyed$));
    }
    /**
     * Find all current activations and prepare single list of activations
     * sorted by descending priority.
     * @return {?}
     */
    findAllActivations() {
        /** @type {?} */
        const mergeMQAlias = (change) => {
            /** @type {?} */
            let bp = this.breakpoints.findByQuery(change.mediaQuery);
            return mergeAlias(change, bp);
        };
        /** @type {?} */
        const replaceWithPrintAlias = (change) => {
            return this.hook.isPrintEvent(change) ? this.hook.updateEvent(change) : change;
        };
        return this.matchMedia
            .activations
            .map(query => new MediaChange(true, query))
            .map(replaceWithPrintAlias)
            .map(mergeMQAlias)
            .sort(sortDescendingPriority);
    }
}
MediaObserver.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] },
];
/** @nocollapse */
MediaObserver.ctorParameters = () => [
    { type: BreakPointRegistry },
    { type: MatchMedia },
    { type: PrintHook }
];
/** @nocollapse */ MediaObserver.ngInjectableDef = defineInjectable({ factory: function MediaObserver_Factory() { return new MediaObserver(inject(BreakPointRegistry), inject(MatchMedia), inject(PrintHook)); }, token: MediaObserver, providedIn: "root" });
/**
 * Find associated breakpoint (if any)
 * @param {?} query
 * @param {?} locator
 * @return {?}
 */
function toMediaQuery(query, locator) {
    /** @type {?} */
    const bp = locator.findByAlias(query) || locator.findByQuery(query);
    return bp ? bp.mediaQuery : query;
}
/**
 * Split each query string into separate query strings if two queries are provided as comma
 * separated.
 * @param {?} queries
 * @return {?}
 */
function splitQueries(queries) {
    return queries.map((query) => query.split(','))
        .reduce((a1, a2) => a1.concat(a2))
        .map(query => query.trim());
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
class MediaTrigger {
    /**
     * @param {?} breakpoints
     * @param {?} matchMedia
     * @param {?} layoutConfig
     * @param {?} _platformId
     * @param {?} _document
     */
    constructor(breakpoints, matchMedia, layoutConfig, _platformId, _document) {
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
     * @param {?} list array of mediaQuery or alias strings
     * @return {?}
     */
    activate(list) {
        list = list.map(it => it.trim()); // trim queries
        this.saveActivations();
        this.deactivateAll();
        this.setActivations(list);
        this.prepareAutoRestore();
    }
    /**
     * Restore original, 'real' breakpoints and emit events
     * to trigger stream notification
     * @return {?}
     */
    restore() {
        if (this.hasCachedRegistryMatches) {
            /** @type {?} */
            const extractQuery = (change) => change.mediaQuery;
            /** @type {?} */
            const list = this.originalActivations.map(extractQuery);
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
    }
    /**
     * Whenever window resizes, immediately auto-restore original
     * activations (if we are simulating activations)
     * @return {?}
     */
    prepareAutoRestore() {
        /** @type {?} */
        const isBrowser = isPlatformBrowser(this._platformId) && this._document;
        /** @type {?} */
        const enableAutoRestore = isBrowser && this.layoutConfig.mediaTriggerAutoRestore;
        if (enableAutoRestore) {
            /** @type {?} */
            const resize$ = fromEvent(window, 'resize').pipe(take(1));
            this.resizeSubscription = resize$.subscribe(this.restore.bind(this));
        }
    }
    /**
     * Notify all matchMedia subscribers of de-activations
     *
     * Note: we must force 'matches' updates for
     *       future matchMedia::activation lookups
     * @return {?}
     */
    deactivateAll() {
        /** @type {?} */
        const list = this.currentActivations;
        this.forceRegistryMatches(list, false);
        this.simulateMediaChanges(list, false);
    }
    /**
     * Cache current activations as sorted, prioritized list of MediaChanges
     * @return {?}
     */
    saveActivations() {
        if (!this.hasCachedRegistryMatches) {
            /** @type {?} */
            const toMediaChange = (query) => new MediaChange(true, query);
            /** @type {?} */
            const mergeMQAlias = (change) => {
                /** @type {?} */
                const bp = this.breakpoints.findByQuery(change.mediaQuery);
                return mergeAlias(change, bp);
            };
            this.originalActivations = this.currentActivations
                .map(toMediaChange)
                .map(mergeMQAlias)
                .sort(sortDescendingPriority);
            this.cacheRegistryMatches();
        }
    }
    /**
     * Force set manual activations for specified mediaQuery list
     * @param {?} list
     * @return {?}
     */
    setActivations(list) {
        if (!!this.originalRegistry) {
            this.forceRegistryMatches(list, true);
        }
        this.simulateMediaChanges(list);
    }
    /**
     * For specified mediaQuery list manually simulate activations or deactivations
     * @param {?} queries
     * @param {?=} matches
     * @return {?}
     */
    simulateMediaChanges(queries, matches = true) {
        /** @type {?} */
        const toMediaQuery = (query) => {
            /** @type {?} */
            const locator = this.breakpoints;
            /** @type {?} */
            const bp = locator.findByAlias(query) || locator.findByQuery(query);
            return bp ? bp.mediaQuery : query;
        };
        /** @type {?} */
        const emitChangeEvent = (query) => this.emitChangeEvent(matches, query);
        queries.map(toMediaQuery).forEach(emitChangeEvent);
    }
    /**
     * Replace current registry with simulated registry...
     * Note: this is required since MediaQueryList::matches is 'readOnly'
     * @param {?} queries
     * @param {?} matches
     * @return {?}
     */
    forceRegistryMatches(queries, matches) {
        /** @type {?} */
        const registry = new Map();
        queries.forEach(query => {
            registry.set(query, /** @type {?} */ ({ matches: matches }));
        });
        this.matchMedia.registry = registry;
    }
    /**
     * Save current MatchMedia::registry items.
     * @return {?}
     */
    cacheRegistryMatches() {
        /** @type {?} */
        const target = this.originalRegistry;
        target.clear();
        this.matchMedia.registry.forEach((value, key) => {
            target.set(key, value);
        });
        this.hasCachedRegistryMatches = true;
    }
    /**
     * Restore original, 'true' registry
     * @return {?}
     */
    restoreRegistryMatches() {
        /** @type {?} */
        const target = this.matchMedia.registry;
        target.clear();
        this.originalRegistry.forEach((value, key) => {
            target.set(key, value);
        });
        this.originalRegistry.clear();
        this.hasCachedRegistryMatches = false;
    }
    /**
     * Manually emit a MediaChange event via the MatchMedia to MediaMarshaller and MediaObserver
     * @param {?} matches
     * @param {?} query
     * @return {?}
     */
    emitChangeEvent(matches, query) {
        this.matchMedia.source.next(new MediaChange(matches, query));
    }
    /**
     * @return {?}
     */
    get currentActivations() {
        return this.matchMedia.activations;
    }
}
MediaTrigger.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] },
];
/** @nocollapse */
MediaTrigger.ctorParameters = () => [
    { type: BreakPointRegistry },
    { type: MatchMedia },
    { type: undefined, decorators: [{ type: Inject, args: [LAYOUT_CONFIG,] }] },
    { type: Object, decorators: [{ type: Inject, args: [PLATFORM_ID,] }] },
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] }
];
/** @nocollapse */ MediaTrigger.ngInjectableDef = defineInjectable({ factory: function MediaTrigger_Factory() { return new MediaTrigger(inject(BreakPointRegistry), inject(MatchMedia), inject(LAYOUT_CONFIG), inject(PLATFORM_ID), inject(DOCUMENT)); }, token: MediaTrigger, providedIn: "root" });

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
    for (let key in target) {
        /** @type {?} */
        let value = target[key] || '';
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
class StyleUtils {
    /**
     * @param {?} _serverStylesheet
     * @param {?} _serverModuleLoaded
     * @param {?} _platformId
     * @param {?} layoutConfig
     */
    constructor(_serverStylesheet, _serverModuleLoaded, _platformId, layoutConfig) {
        this._serverStylesheet = _serverStylesheet;
        this._serverModuleLoaded = _serverModuleLoaded;
        this._platformId = _platformId;
        this.layoutConfig = layoutConfig;
    }
    /**
     * Applies styles given via string pair or object map to the directive element
     * @param {?} element
     * @param {?} style
     * @param {?=} value
     * @return {?}
     */
    applyStyleToElement(element, style, value = null) {
        /** @type {?} */
        let styles = {};
        if (typeof style === 'string') {
            styles[style] = value;
            style = styles;
        }
        styles = this.layoutConfig.disableVendorPrefixes ? style : applyCssPrefixes(style);
        this._applyMultiValueStyleToElement(styles, element);
    }
    /**
     * Applies styles given via string pair or object map to the directive's element
     * @param {?} style
     * @param {?=} elements
     * @return {?}
     */
    applyStyleToElements(style, elements = []) {
        /** @type {?} */
        const styles = this.layoutConfig.disableVendorPrefixes ? style : applyCssPrefixes(style);
        elements.forEach(el => {
            this._applyMultiValueStyleToElement(styles, el);
        });
    }
    /**
     * Determine the DOM element's Flexbox flow (flex-direction)
     *
     * Check inline style first then check computed (stylesheet) style
     * @param {?} target
     * @return {?}
     */
    getFlowDirection(target) {
        /** @type {?} */
        const query = 'flex-direction';
        /** @type {?} */
        let value = this.lookupStyle(target, query);
        /** @type {?} */
        const hasInlineValue = this.lookupInlineStyle(target, query) ||
            (isPlatformServer(this._platformId) && this._serverModuleLoaded) ? value : '';
        return [value || 'row', hasInlineValue];
    }
    /**
     * Find the DOM element's raw attribute value (if any)
     * @param {?} element
     * @param {?} attribute
     * @return {?}
     */
    lookupAttributeValue(element, attribute) {
        return element.getAttribute(attribute) || '';
    }
    /**
     * Find the DOM element's inline style value (if any)
     * @param {?} element
     * @param {?} styleName
     * @return {?}
     */
    lookupInlineStyle(element, styleName) {
        return isPlatformBrowser(this._platformId) ?
            element.style.getPropertyValue(styleName) : this._getServerStyle(element, styleName);
    }
    /**
     * Determine the inline or inherited CSS style
     * NOTE: platform-server has no implementation for getComputedStyle
     * @param {?} element
     * @param {?} styleName
     * @param {?=} inlineOnly
     * @return {?}
     */
    lookupStyle(element, styleName, inlineOnly = false) {
        /** @type {?} */
        let value = '';
        if (element) {
            /** @type {?} */
            let immediateValue = value = this.lookupInlineStyle(element, styleName);
            if (!immediateValue) {
                if (isPlatformBrowser(this._platformId)) {
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
    }
    /**
     * Applies the styles to the element. The styles object map may contain an array of values
     * Each value will be added as element style
     * Keys are sorted to add prefixed styles (like -webkit-x) first, before the standard ones
     * @param {?} styles
     * @param {?} element
     * @return {?}
     */
    _applyMultiValueStyleToElement(styles, element) {
        Object.keys(styles).sort().forEach(key => {
            /** @type {?} */
            const el = styles[key];
            /** @type {?} */
            const values = Array.isArray(el) ? el : [el];
            values.sort();
            for (let value of values) {
                value = value ? value + '' : '';
                if (isPlatformBrowser(this._platformId) || !this._serverModuleLoaded) {
                    isPlatformBrowser(this._platformId) ?
                        element.style.setProperty(key, value) : this._setServerStyle(element, key, value);
                }
                else {
                    this._serverStylesheet.addStyleToElement(element, key, value);
                }
            }
        });
    }
    /**
     * @param {?} element
     * @param {?} styleName
     * @param {?=} styleValue
     * @return {?}
     */
    _setServerStyle(element, styleName, styleValue) {
        styleName = styleName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
        /** @type {?} */
        const styleMap = this._readStyleAttribute(element);
        styleMap[styleName] = styleValue || '';
        this._writeStyleAttribute(element, styleMap);
    }
    /**
     * @param {?} element
     * @param {?} styleName
     * @return {?}
     */
    _getServerStyle(element, styleName) {
        /** @type {?} */
        const styleMap = this._readStyleAttribute(element);
        return styleMap[styleName] || '';
    }
    /**
     * @param {?} element
     * @return {?}
     */
    _readStyleAttribute(element) {
        /** @type {?} */
        const styleMap = {};
        /** @type {?} */
        const styleAttribute = element.getAttribute('style');
        if (styleAttribute) {
            /** @type {?} */
            const styleList = styleAttribute.split(/;+/g);
            for (let i = 0; i < styleList.length; i++) {
                /** @type {?} */
                const style = styleList[i].trim();
                if (style.length > 0) {
                    /** @type {?} */
                    const colonIndex = style.indexOf(':');
                    if (colonIndex === -1) {
                        throw new Error(`Invalid CSS style: ${style}`);
                    }
                    /** @type {?} */
                    const name = style.substr(0, colonIndex).trim();
                    styleMap[name] = style.substr(colonIndex + 1).trim();
                }
            }
        }
        return styleMap;
    }
    /**
     * @param {?} element
     * @param {?} styleMap
     * @return {?}
     */
    _writeStyleAttribute(element, styleMap) {
        /** @type {?} */
        let styleAttrValue = '';
        for (const key in styleMap) {
            /** @type {?} */
            const newValue = styleMap[key];
            if (newValue) {
                styleAttrValue += key + ':' + styleMap[key] + ';';
            }
        }
        element.setAttribute('style', styleAttrValue);
    }
}
StyleUtils.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] },
];
/** @nocollapse */
StyleUtils.ctorParameters = () => [
    { type: StylesheetMap, decorators: [{ type: Optional }] },
    { type: Boolean, decorators: [{ type: Optional }, { type: Inject, args: [SERVER_TOKEN,] }] },
    { type: Object, decorators: [{ type: Inject, args: [PLATFORM_ID,] }] },
    { type: undefined, decorators: [{ type: Inject, args: [LAYOUT_CONFIG,] }] }
];
/** @nocollapse */ StyleUtils.ngInjectableDef = defineInjectable({ factory: function StyleUtils_Factory() { return new StyleUtils(inject(StylesheetMap, 8), inject(SERVER_TOKEN, 8), inject(PLATFORM_ID), inject(LAYOUT_CONFIG)); }, token: StyleUtils, providedIn: "root" });

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * A class that encapsulates CSS style generation for common directives
 * @abstract
 */
class StyleBuilder {
    constructor() {
        /**
         * Whether to cache the generated output styles
         */
        this.shouldCache = true;
    }
    /**
     * Run a side effect computation given the input string and the computed styles
     * from the build task and the host configuration object
     * NOTE: This should be a no-op unless an algorithm is provided in a subclass
     * @param {?} _input
     * @param {?} _styles
     * @param {?=} _parent
     * @return {?}
     */
    sideEffect(_input, _styles, _parent) {
    }
}

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
function validateBasis(basis, grow = '1', shrink = '1') {
    /** @type {?} */
    let parts = [grow, shrink, basis];
    /** @type {?} */
    let j = basis.indexOf('calc');
    if (j > 0) {
        parts[2] = _validateCalcValue(basis.substring(j).trim());
        /** @type {?} */
        let matches = basis.substr(0, j).trim().split(' ');
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
        let matches = basis.split(' ');
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
class MediaMarshaller {
    /**
     * @param {?} matchMedia
     * @param {?} breakpoints
     * @param {?} hook
     */
    constructor(matchMedia, breakpoints, hook) {
        this.matchMedia = matchMedia;
        this.breakpoints = breakpoints;
        this.hook = hook;
        this.activatedBreakpoints = [];
        this.elementMap = new Map();
        this.elementKeyMap = new WeakMap();
        this.watcherMap = new WeakMap();
        this.updateMap = new WeakMap();
        this.clearMap = new WeakMap();
        this.subject = new Subject();
        this.observeActivations();
    }
    /**
     * @return {?}
     */
    get activatedAlias() {
        return this.activatedBreakpoints[0] ? this.activatedBreakpoints[0].alias : '';
    }
    /**
     * Update styles on breakpoint activates or deactivates
     * @param {?} mc
     * @return {?}
     */
    onMediaChange(mc) {
        /** @type {?} */
        const bp = this.findByQuery(mc.mediaQuery);
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
    }
    /**
     * initialize the marshaller with necessary elements for delegation on an element
     * @param {?} element
     * @param {?} key
     * @param {?=} updateFn optional callback so that custom bp directives don't have to re-provide this
     * @param {?=} clearFn optional callback so that custom bp directives don't have to re-provide this
     * @param {?=} extraTriggers other triggers to force style updates (e.g. layout, directionality, etc)
     * @return {?}
     */
    init(element, key, updateFn, clearFn, extraTriggers = []) {
        initBuilderMap(this.updateMap, element, key, updateFn);
        initBuilderMap(this.clearMap, element, key, clearFn);
        this.buildElementKeyMap(element, key);
        this.watchExtraTriggers(element, key, extraTriggers);
    }
    /**
     * get the value for an element and key and optionally a given breakpoint
     * @param {?} element
     * @param {?} key
     * @param {?=} bp
     * @return {?}
     */
    getValue(element, key, bp) {
        /** @type {?} */
        const bpMap = this.elementMap.get(element);
        if (bpMap) {
            /** @type {?} */
            const values = bp !== undefined ? bpMap.get(bp) : this.getActivatedValues(bpMap, key);
            if (values) {
                return values.get(key);
            }
        }
        return undefined;
    }
    /**
     * whether the element has values for a given key
     * @param {?} element
     * @param {?} key
     * @return {?}
     */
    hasValue(element, key) {
        /** @type {?} */
        const bpMap = this.elementMap.get(element);
        if (bpMap) {
            /** @type {?} */
            const values = this.getActivatedValues(bpMap, key);
            if (values) {
                return values.get(key) !== undefined || false;
            }
        }
        return false;
    }
    /**
     * Set the value for an input on a directive
     * @param {?} element the element in question
     * @param {?} key the type of the directive (e.g. flex, layout-gap, etc)
     * @param {?} val the value for the breakpoint
     * @param {?} bp the breakpoint suffix (empty string = default)
     * @return {?}
     */
    setValue(element, key, val, bp) {
        /** @type {?} */
        let bpMap = this.elementMap.get(element);
        if (!bpMap) {
            bpMap = new Map().set(bp, new Map().set(key, val));
            this.elementMap.set(element, bpMap);
        }
        else {
            /** @type {?} */
            const values = (bpMap.get(bp) || new Map()).set(key, val);
            bpMap.set(bp, values);
            this.elementMap.set(element, bpMap);
        }
        /** @type {?} */
        const value = this.getValue(element, key);
        if (value !== undefined) {
            this.updateElement(element, key, value);
        }
    }
    /**
     * Track element value changes for a specific key
     * @param {?} element
     * @param {?} key
     * @return {?}
     */
    trackValue(element, key) {
        return this.subject
            .asObservable()
            .pipe(filter(v => v.element === element && v.key === key));
    }
    /**
     * update all styles for all elements on the current breakpoint
     * @return {?}
     */
    updateStyles() {
        this.elementMap.forEach((bpMap, el) => {
            /** @type {?} */
            const keyMap = new Set(/** @type {?} */ ((this.elementKeyMap.get(el))));
            /** @type {?} */
            let valueMap = this.getActivatedValues(bpMap);
            if (valueMap) {
                valueMap.forEach((v, k) => {
                    this.updateElement(el, k, v);
                    keyMap.delete(k);
                });
            }
            keyMap.forEach(k => {
                valueMap = this.getActivatedValues(bpMap, k);
                if (valueMap) {
                    /** @type {?} */
                    const value = valueMap.get(k);
                    this.updateElement(el, k, value);
                }
                else {
                    this.clearElement(el, k);
                }
            });
        });
    }
    /**
     * clear the styles for a given element
     * @param {?} element
     * @param {?} key
     * @return {?}
     */
    clearElement(element, key) {
        /** @type {?} */
        const builders = this.clearMap.get(element);
        if (builders) {
            /** @type {?} */
            const clearFn = /** @type {?} */ (builders.get(key));
            if (!!clearFn) {
                clearFn();
                this.subject.next({ element, key, value: '' });
            }
        }
    }
    /**
     * update a given element with the activated values for a given key
     * @param {?} element
     * @param {?} key
     * @param {?} value
     * @return {?}
     */
    updateElement(element, key, value) {
        /** @type {?} */
        const builders = this.updateMap.get(element);
        if (builders) {
            /** @type {?} */
            const updateFn = /** @type {?} */ (builders.get(key));
            if (!!updateFn) {
                updateFn(value);
                this.subject.next({ element, key, value });
            }
        }
    }
    /**
     * release all references to a given element
     * @param {?} element
     * @return {?}
     */
    releaseElement(element) {
        /** @type {?} */
        const watcherMap = this.watcherMap.get(element);
        if (watcherMap) {
            watcherMap.forEach(s => s.unsubscribe());
            this.watcherMap.delete(element);
        }
        /** @type {?} */
        const elementMap = this.elementMap.get(element);
        if (elementMap) {
            elementMap.forEach((_, s) => elementMap.delete(s));
            this.elementMap.delete(element);
        }
    }
    /**
     * trigger an update for a given element and key (e.g. layout)
     * @param {?} element
     * @param {?=} key
     * @return {?}
     */
    triggerUpdate(element, key) {
        /** @type {?} */
        const bpMap = this.elementMap.get(element);
        if (bpMap) {
            /** @type {?} */
            const valueMap = this.getActivatedValues(bpMap, key);
            if (valueMap) {
                if (key) {
                    this.updateElement(element, key, valueMap.get(key));
                }
                else {
                    valueMap.forEach((v, k) => this.updateElement(element, k, v));
                }
            }
        }
    }
    /**
     * Cross-reference for HTMLElement with directive key
     * @param {?} element
     * @param {?} key
     * @return {?}
     */
    buildElementKeyMap(element, key) {
        /** @type {?} */
        let keyMap = this.elementKeyMap.get(element);
        if (!keyMap) {
            keyMap = new Set();
            this.elementKeyMap.set(element, keyMap);
        }
        keyMap.add(key);
    }
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
    watchExtraTriggers(element, key, triggers) {
        if (triggers && triggers.length) {
            /** @type {?} */
            let watchers = this.watcherMap.get(element);
            if (!watchers) {
                watchers = new Map();
                this.watcherMap.set(element, watchers);
            }
            /** @type {?} */
            const subscription = watchers.get(key);
            if (!subscription) {
                /** @type {?} */
                const newSubscription = merge(...triggers).subscribe(() => {
                    /** @type {?} */
                    const currentValue = this.getValue(element, key);
                    this.updateElement(element, key, currentValue);
                });
                watchers.set(key, newSubscription);
            }
        }
    }
    /**
     * Breakpoint locator by mediaQuery
     * @param {?} query
     * @return {?}
     */
    findByQuery(query) {
        return this.breakpoints.findByQuery(query);
    }
    /**
     * get the fallback breakpoint for a given element, starting with the current breakpoint
     * @param {?} bpMap
     * @param {?=} key
     * @return {?}
     */
    getActivatedValues(bpMap, key) {
        for (let i = 0; i < this.activatedBreakpoints.length; i++) {
            /** @type {?} */
            const activatedBp = this.activatedBreakpoints[i];
            /** @type {?} */
            const valueMap = bpMap.get(activatedBp.alias);
            if (valueMap) {
                if (key === undefined || valueMap.has(key)) {
                    return valueMap;
                }
            }
        }
        /** @type {?} */
        const lastHope = bpMap.get('');
        return (key === undefined || lastHope && lastHope.has(key)) ? lastHope : undefined;
    }
    /**
     * Watch for mediaQuery breakpoint activations
     * @return {?}
     */
    observeActivations() {
        /** @type {?} */
        const target = /** @type {?} */ ((this));
        /** @type {?} */
        const queries = this.breakpoints.items.map(bp => bp.mediaQuery);
        this.matchMedia
            .observe(this.hook.withPrintQuery(queries))
            .pipe(tap(this.hook.interceptEvents(target)), filter(this.hook.blockPropagation()))
            .subscribe(this.onMediaChange.bind(this));
    }
}
MediaMarshaller.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] },
];
/** @nocollapse */
MediaMarshaller.ctorParameters = () => [
    { type: MatchMedia },
    { type: BreakPointRegistry },
    { type: PrintHook }
];
/** @nocollapse */ MediaMarshaller.ngInjectableDef = defineInjectable({ factory: function MediaMarshaller_Factory() { return new MediaMarshaller(inject(MatchMedia), inject(BreakPointRegistry), inject(PrintHook)); }, token: MediaMarshaller, providedIn: "root" });
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
        let oldMap = map$$1.get(element);
        if (!oldMap) {
            oldMap = new Map();
            map$$1.set(element, oldMap);
        }
        oldMap.set(key, input);
    }
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */

export { MatchMedia as ɵMatchMedia, MockMatchMedia as ɵMockMatchMedia, MockMatchMediaProvider as ɵMockMatchMediaProvider, CoreModule, removeStyles, BROWSER_PROVIDER, CLASS_NAME, MediaChange, StylesheetMap, DEFAULT_CONFIG, LAYOUT_CONFIG, SERVER_TOKEN, BREAKPOINT, mergeAlias, BaseDirective2, DEFAULT_BREAKPOINTS, ScreenTypes, ORIENTATION_BREAKPOINTS, BreakPointRegistry, BREAKPOINTS, MediaObserver, MediaTrigger, sortDescendingPriority, sortAscendingPriority, coerceArray, StyleUtils, StyleBuilder, validateBasis, MediaMarshaller, BREAKPOINT_PRINT, PrintHook };
//# sourceMappingURL=core.js.map
