/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { ɵparseCookieValue as parseCookieValue } from '@angular/common';
import { ɵglobal as global } from '@angular/core';
import { setRootDomAdapter } from '../dom/dom_adapter';
import { GenericBrowserDomAdapter } from './generic_browser_adapter';
var _attrToPropMap = {
    'class': 'className',
    'innerHtml': 'innerHTML',
    'readonly': 'readOnly',
    'tabindex': 'tabIndex',
};
var DOM_KEY_LOCATION_NUMPAD = 3;
// Map to convert some key or keyIdentifier values to what will be returned by getEventKey
var _keyMap = {
    // The following values are here for cross-browser compatibility and to match the W3C standard
    // cf http://www.w3.org/TR/DOM-Level-3-Events-key/
    '\b': 'Backspace',
    '\t': 'Tab',
    '\x7F': 'Delete',
    '\x1B': 'Escape',
    'Del': 'Delete',
    'Esc': 'Escape',
    'Left': 'ArrowLeft',
    'Right': 'ArrowRight',
    'Up': 'ArrowUp',
    'Down': 'ArrowDown',
    'Menu': 'ContextMenu',
    'Scroll': 'ScrollLock',
    'Win': 'OS'
};
// There is a bug in Chrome for numeric keypad keys:
// https://code.google.com/p/chromium/issues/detail?id=155654
// 1, 2, 3 ... are reported as A, B, C ...
var _chromeNumKeyPadMap = {
    'A': '1',
    'B': '2',
    'C': '3',
    'D': '4',
    'E': '5',
    'F': '6',
    'G': '7',
    'H': '8',
    'I': '9',
    'J': '*',
    'K': '+',
    'M': '-',
    'N': '.',
    'O': '/',
    '\x60': '0',
    '\x90': 'NumLock'
};
var nodeContains;
if (global['Node']) {
    nodeContains = global['Node'].prototype.contains || function (node) {
        return !!(this.compareDocumentPosition(node) & 16);
    };
}
/**
 * A `DomAdapter` powered by full browser DOM APIs.
 *
 * @security Tread carefully! Interacting with the DOM directly is dangerous and
 * can introduce XSS risks.
 */
/* tslint:disable:requireParameterType no-console */
var BrowserDomAdapter = /** @class */ (function (_super) {
    tslib_1.__extends(BrowserDomAdapter, _super);
    function BrowserDomAdapter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BrowserDomAdapter.prototype.parse = function (templateHtml) { throw new Error('parse not implemented'); };
    BrowserDomAdapter.makeCurrent = function () { setRootDomAdapter(new BrowserDomAdapter()); };
    BrowserDomAdapter.prototype.hasProperty = function (element, name) { return name in element; };
    BrowserDomAdapter.prototype.setProperty = function (el, name, value) { el[name] = value; };
    BrowserDomAdapter.prototype.getProperty = function (el, name) { return el[name]; };
    BrowserDomAdapter.prototype.invoke = function (el, methodName, args) {
        var _a;
        (_a = el)[methodName].apply(_a, tslib_1.__spread(args));
    };
    // TODO(tbosch): move this into a separate environment class once we have it
    BrowserDomAdapter.prototype.logError = function (error) {
        if (window.console) {
            if (console.error) {
                console.error(error);
            }
            else {
                console.log(error);
            }
        }
    };
    BrowserDomAdapter.prototype.log = function (error) {
        if (window.console) {
            window.console.log && window.console.log(error);
        }
    };
    BrowserDomAdapter.prototype.logGroup = function (error) {
        if (window.console) {
            window.console.group && window.console.group(error);
        }
    };
    BrowserDomAdapter.prototype.logGroupEnd = function () {
        if (window.console) {
            window.console.groupEnd && window.console.groupEnd();
        }
    };
    Object.defineProperty(BrowserDomAdapter.prototype, "attrToPropMap", {
        get: function () { return _attrToPropMap; },
        enumerable: true,
        configurable: true
    });
    BrowserDomAdapter.prototype.contains = function (nodeA, nodeB) { return nodeContains.call(nodeA, nodeB); };
    BrowserDomAdapter.prototype.querySelector = function (el, selector) { return el.querySelector(selector); };
    BrowserDomAdapter.prototype.querySelectorAll = function (el, selector) { return el.querySelectorAll(selector); };
    BrowserDomAdapter.prototype.on = function (el, evt, listener) { el.addEventListener(evt, listener, false); };
    BrowserDomAdapter.prototype.onAndCancel = function (el, evt, listener) {
        el.addEventListener(evt, listener, false);
        // Needed to follow Dart's subscription semantic, until fix of
        // https://code.google.com/p/dart/issues/detail?id=17406
        return function () { el.removeEventListener(evt, listener, false); };
    };
    BrowserDomAdapter.prototype.dispatchEvent = function (el, evt) { el.dispatchEvent(evt); };
    BrowserDomAdapter.prototype.createMouseEvent = function (eventType) {
        var evt = this.getDefaultDocument().createEvent('MouseEvent');
        evt.initEvent(eventType, true, true);
        return evt;
    };
    BrowserDomAdapter.prototype.createEvent = function (eventType) {
        var evt = this.getDefaultDocument().createEvent('Event');
        evt.initEvent(eventType, true, true);
        return evt;
    };
    BrowserDomAdapter.prototype.preventDefault = function (evt) {
        evt.preventDefault();
        evt.returnValue = false;
    };
    BrowserDomAdapter.prototype.isPrevented = function (evt) {
        return evt.defaultPrevented || evt.returnValue != null && !evt.returnValue;
    };
    BrowserDomAdapter.prototype.getInnerHTML = function (el) { return el.innerHTML; };
    BrowserDomAdapter.prototype.getTemplateContent = function (el) {
        return 'content' in el && this.isTemplateElement(el) ? el.content : null;
    };
    BrowserDomAdapter.prototype.getOuterHTML = function (el) { return el.outerHTML; };
    BrowserDomAdapter.prototype.nodeName = function (node) { return node.nodeName; };
    BrowserDomAdapter.prototype.nodeValue = function (node) { return node.nodeValue; };
    BrowserDomAdapter.prototype.type = function (node) { return node.type; };
    BrowserDomAdapter.prototype.content = function (node) {
        if (this.hasProperty(node, 'content')) {
            return node.content;
        }
        else {
            return node;
        }
    };
    BrowserDomAdapter.prototype.firstChild = function (el) { return el.firstChild; };
    BrowserDomAdapter.prototype.nextSibling = function (el) { return el.nextSibling; };
    BrowserDomAdapter.prototype.parentElement = function (el) { return el.parentNode; };
    BrowserDomAdapter.prototype.childNodes = function (el) { return el.childNodes; };
    BrowserDomAdapter.prototype.childNodesAsList = function (el) {
        var childNodes = el.childNodes;
        var res = new Array(childNodes.length);
        for (var i = 0; i < childNodes.length; i++) {
            res[i] = childNodes[i];
        }
        return res;
    };
    BrowserDomAdapter.prototype.clearNodes = function (el) {
        while (el.firstChild) {
            el.removeChild(el.firstChild);
        }
    };
    BrowserDomAdapter.prototype.appendChild = function (el, node) { el.appendChild(node); };
    BrowserDomAdapter.prototype.removeChild = function (el, node) { el.removeChild(node); };
    BrowserDomAdapter.prototype.replaceChild = function (el, newChild, oldChild) { el.replaceChild(newChild, oldChild); };
    BrowserDomAdapter.prototype.remove = function (node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
        return node;
    };
    BrowserDomAdapter.prototype.insertBefore = function (parent, ref, node) { parent.insertBefore(node, ref); };
    BrowserDomAdapter.prototype.insertAllBefore = function (parent, ref, nodes) {
        nodes.forEach(function (n) { return parent.insertBefore(n, ref); });
    };
    BrowserDomAdapter.prototype.insertAfter = function (parent, ref, node) { parent.insertBefore(node, ref.nextSibling); };
    BrowserDomAdapter.prototype.setInnerHTML = function (el, value) { el.innerHTML = value; };
    BrowserDomAdapter.prototype.getText = function (el) { return el.textContent; };
    BrowserDomAdapter.prototype.setText = function (el, value) { el.textContent = value; };
    BrowserDomAdapter.prototype.getValue = function (el) { return el.value; };
    BrowserDomAdapter.prototype.setValue = function (el, value) { el.value = value; };
    BrowserDomAdapter.prototype.getChecked = function (el) { return el.checked; };
    BrowserDomAdapter.prototype.setChecked = function (el, value) { el.checked = value; };
    BrowserDomAdapter.prototype.createComment = function (text) { return this.getDefaultDocument().createComment(text); };
    BrowserDomAdapter.prototype.createTemplate = function (html) {
        var t = this.getDefaultDocument().createElement('template');
        t.innerHTML = html;
        return t;
    };
    BrowserDomAdapter.prototype.createElement = function (tagName, doc) {
        doc = doc || this.getDefaultDocument();
        return doc.createElement(tagName);
    };
    BrowserDomAdapter.prototype.createElementNS = function (ns, tagName, doc) {
        doc = doc || this.getDefaultDocument();
        return doc.createElementNS(ns, tagName);
    };
    BrowserDomAdapter.prototype.createTextNode = function (text, doc) {
        doc = doc || this.getDefaultDocument();
        return doc.createTextNode(text);
    };
    BrowserDomAdapter.prototype.createScriptTag = function (attrName, attrValue, doc) {
        doc = doc || this.getDefaultDocument();
        var el = doc.createElement('SCRIPT');
        el.setAttribute(attrName, attrValue);
        return el;
    };
    BrowserDomAdapter.prototype.createStyleElement = function (css, doc) {
        doc = doc || this.getDefaultDocument();
        var style = doc.createElement('style');
        this.appendChild(style, this.createTextNode(css, doc));
        return style;
    };
    BrowserDomAdapter.prototype.createShadowRoot = function (el) { return el.createShadowRoot(); };
    BrowserDomAdapter.prototype.getShadowRoot = function (el) { return el.shadowRoot; };
    BrowserDomAdapter.prototype.getHost = function (el) { return el.host; };
    BrowserDomAdapter.prototype.clone = function (node) { return node.cloneNode(true); };
    BrowserDomAdapter.prototype.getElementsByClassName = function (element, name) {
        return element.getElementsByClassName(name);
    };
    BrowserDomAdapter.prototype.getElementsByTagName = function (element, name) {
        return element.getElementsByTagName(name);
    };
    BrowserDomAdapter.prototype.classList = function (element) { return Array.prototype.slice.call(element.classList, 0); };
    BrowserDomAdapter.prototype.addClass = function (element, className) { element.classList.add(className); };
    BrowserDomAdapter.prototype.removeClass = function (element, className) { element.classList.remove(className); };
    BrowserDomAdapter.prototype.hasClass = function (element, className) {
        return element.classList.contains(className);
    };
    BrowserDomAdapter.prototype.setStyle = function (element, styleName, styleValue) {
        element.style[styleName] = styleValue;
    };
    BrowserDomAdapter.prototype.removeStyle = function (element, stylename) {
        // IE requires '' instead of null
        // see https://github.com/angular/angular/issues/7916
        element.style[stylename] = '';
    };
    BrowserDomAdapter.prototype.getStyle = function (element, stylename) { return element.style[stylename]; };
    BrowserDomAdapter.prototype.hasStyle = function (element, styleName, styleValue) {
        var value = this.getStyle(element, styleName) || '';
        return styleValue ? value == styleValue : value.length > 0;
    };
    BrowserDomAdapter.prototype.tagName = function (element) { return element.tagName; };
    BrowserDomAdapter.prototype.attributeMap = function (element) {
        var res = new Map();
        var elAttrs = element.attributes;
        for (var i = 0; i < elAttrs.length; i++) {
            var attrib = elAttrs.item(i);
            res.set(attrib.name, attrib.value);
        }
        return res;
    };
    BrowserDomAdapter.prototype.hasAttribute = function (element, attribute) {
        return element.hasAttribute(attribute);
    };
    BrowserDomAdapter.prototype.hasAttributeNS = function (element, ns, attribute) {
        return element.hasAttributeNS(ns, attribute);
    };
    BrowserDomAdapter.prototype.getAttribute = function (element, attribute) {
        return element.getAttribute(attribute);
    };
    BrowserDomAdapter.prototype.getAttributeNS = function (element, ns, name) {
        return element.getAttributeNS(ns, name);
    };
    BrowserDomAdapter.prototype.setAttribute = function (element, name, value) { element.setAttribute(name, value); };
    BrowserDomAdapter.prototype.setAttributeNS = function (element, ns, name, value) {
        element.setAttributeNS(ns, name, value);
    };
    BrowserDomAdapter.prototype.removeAttribute = function (element, attribute) { element.removeAttribute(attribute); };
    BrowserDomAdapter.prototype.removeAttributeNS = function (element, ns, name) {
        element.removeAttributeNS(ns, name);
    };
    BrowserDomAdapter.prototype.templateAwareRoot = function (el) { return this.isTemplateElement(el) ? this.content(el) : el; };
    BrowserDomAdapter.prototype.createHtmlDocument = function () {
        return document.implementation.createHTMLDocument('fakeTitle');
    };
    BrowserDomAdapter.prototype.getDefaultDocument = function () { return document; };
    BrowserDomAdapter.prototype.getBoundingClientRect = function (el) {
        try {
            return el.getBoundingClientRect();
        }
        catch (_a) {
            return { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0 };
        }
    };
    BrowserDomAdapter.prototype.getTitle = function (doc) { return doc.title; };
    BrowserDomAdapter.prototype.setTitle = function (doc, newTitle) { doc.title = newTitle || ''; };
    BrowserDomAdapter.prototype.elementMatches = function (n, selector) {
        if (this.isElementNode(n)) {
            return n.matches && n.matches(selector) ||
                n.msMatchesSelector && n.msMatchesSelector(selector) ||
                n.webkitMatchesSelector && n.webkitMatchesSelector(selector);
        }
        return false;
    };
    BrowserDomAdapter.prototype.isTemplateElement = function (el) {
        return this.isElementNode(el) && el.nodeName === 'TEMPLATE';
    };
    BrowserDomAdapter.prototype.isTextNode = function (node) { return node.nodeType === Node.TEXT_NODE; };
    BrowserDomAdapter.prototype.isCommentNode = function (node) { return node.nodeType === Node.COMMENT_NODE; };
    BrowserDomAdapter.prototype.isElementNode = function (node) { return node.nodeType === Node.ELEMENT_NODE; };
    BrowserDomAdapter.prototype.hasShadowRoot = function (node) {
        return node.shadowRoot != null && node instanceof HTMLElement;
    };
    BrowserDomAdapter.prototype.isShadowRoot = function (node) { return node instanceof DocumentFragment; };
    BrowserDomAdapter.prototype.importIntoDoc = function (node) { return document.importNode(this.templateAwareRoot(node), true); };
    BrowserDomAdapter.prototype.adoptNode = function (node) { return document.adoptNode(node); };
    BrowserDomAdapter.prototype.getHref = function (el) { return el.getAttribute('href'); };
    BrowserDomAdapter.prototype.getEventKey = function (event) {
        var key = event.key;
        if (key == null) {
            key = event.keyIdentifier;
            // keyIdentifier is defined in the old draft of DOM Level 3 Events implemented by Chrome and
            // Safari cf
            // http://www.w3.org/TR/2007/WD-DOM-Level-3-Events-20071221/events.html#Events-KeyboardEvents-Interfaces
            if (key == null) {
                return 'Unidentified';
            }
            if (key.startsWith('U+')) {
                key = String.fromCharCode(parseInt(key.substring(2), 16));
                if (event.location === DOM_KEY_LOCATION_NUMPAD && _chromeNumKeyPadMap.hasOwnProperty(key)) {
                    // There is a bug in Chrome for numeric keypad keys:
                    // https://code.google.com/p/chromium/issues/detail?id=155654
                    // 1, 2, 3 ... are reported as A, B, C ...
                    key = _chromeNumKeyPadMap[key];
                }
            }
        }
        return _keyMap[key] || key;
    };
    BrowserDomAdapter.prototype.getGlobalEventTarget = function (doc, target) {
        if (target === 'window') {
            return window;
        }
        if (target === 'document') {
            return doc;
        }
        if (target === 'body') {
            return doc.body;
        }
        return null;
    };
    BrowserDomAdapter.prototype.getHistory = function () { return window.history; };
    BrowserDomAdapter.prototype.getLocation = function () { return window.location; };
    BrowserDomAdapter.prototype.getBaseHref = function (doc) {
        var href = getBaseElementHref();
        return href == null ? null : relativePath(href);
    };
    BrowserDomAdapter.prototype.resetBaseElement = function () { baseElement = null; };
    BrowserDomAdapter.prototype.getUserAgent = function () { return window.navigator.userAgent; };
    BrowserDomAdapter.prototype.setData = function (element, name, value) {
        this.setAttribute(element, 'data-' + name, value);
    };
    BrowserDomAdapter.prototype.getData = function (element, name) {
        return this.getAttribute(element, 'data-' + name);
    };
    BrowserDomAdapter.prototype.getComputedStyle = function (element) { return getComputedStyle(element); };
    // TODO(tbosch): move this into a separate environment class once we have it
    BrowserDomAdapter.prototype.supportsWebAnimation = function () {
        return typeof Element.prototype['animate'] === 'function';
    };
    BrowserDomAdapter.prototype.performanceNow = function () {
        // performance.now() is not available in all browsers, see
        // http://caniuse.com/#search=performance.now
        return window.performance && window.performance.now ? window.performance.now() :
            new Date().getTime();
    };
    BrowserDomAdapter.prototype.supportsCookies = function () { return true; };
    BrowserDomAdapter.prototype.getCookie = function (name) { return parseCookieValue(document.cookie, name); };
    BrowserDomAdapter.prototype.setCookie = function (name, value) {
        // document.cookie is magical, assigning into it assigns/overrides one cookie value, but does
        // not clear other cookies.
        document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value);
    };
    return BrowserDomAdapter;
}(GenericBrowserDomAdapter));
export { BrowserDomAdapter };
var baseElement = null;
function getBaseElementHref() {
    if (!baseElement) {
        baseElement = document.querySelector('base');
        if (!baseElement) {
            return null;
        }
    }
    return baseElement.getAttribute('href');
}
// based on urlUtils.js in AngularJS 1
var urlParsingNode;
function relativePath(url) {
    if (!urlParsingNode) {
        urlParsingNode = document.createElement('a');
    }
    urlParsingNode.setAttribute('href', url);
    return (urlParsingNode.pathname.charAt(0) === '/') ? urlParsingNode.pathname :
        '/' + urlParsingNode.pathname;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlcl9hZGFwdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvcGxhdGZvcm0tYnJvd3Nlci9zcmMvYnJvd3Nlci9icm93c2VyX2FkYXB0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxpQkFBaUIsSUFBSSxnQkFBZ0IsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3RFLE9BQU8sRUFBQyxPQUFPLElBQUksTUFBTSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRWhELE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBRXJELE9BQU8sRUFBQyx3QkFBd0IsRUFBQyxNQUFNLDJCQUEyQixDQUFDO0FBRW5FLElBQU0sY0FBYyxHQUFHO0lBQ3JCLE9BQU8sRUFBRSxXQUFXO0lBQ3BCLFdBQVcsRUFBRSxXQUFXO0lBQ3hCLFVBQVUsRUFBRSxVQUFVO0lBQ3RCLFVBQVUsRUFBRSxVQUFVO0NBQ3ZCLENBQUM7QUFFRixJQUFNLHVCQUF1QixHQUFHLENBQUMsQ0FBQztBQUVsQywwRkFBMEY7QUFDMUYsSUFBTSxPQUFPLEdBQTBCO0lBQ3JDLDhGQUE4RjtJQUM5RixrREFBa0Q7SUFDbEQsSUFBSSxFQUFFLFdBQVc7SUFDakIsSUFBSSxFQUFFLEtBQUs7SUFDWCxNQUFNLEVBQUUsUUFBUTtJQUNoQixNQUFNLEVBQUUsUUFBUTtJQUNoQixLQUFLLEVBQUUsUUFBUTtJQUNmLEtBQUssRUFBRSxRQUFRO0lBQ2YsTUFBTSxFQUFFLFdBQVc7SUFDbkIsT0FBTyxFQUFFLFlBQVk7SUFDckIsSUFBSSxFQUFFLFNBQVM7SUFDZixNQUFNLEVBQUUsV0FBVztJQUNuQixNQUFNLEVBQUUsYUFBYTtJQUNyQixRQUFRLEVBQUUsWUFBWTtJQUN0QixLQUFLLEVBQUUsSUFBSTtDQUNaLENBQUM7QUFFRixvREFBb0Q7QUFDcEQs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LFlBQVksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDekMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDekIsR0FBRyxHQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUM7QUFDckYsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHvJtXBhcnNlQ29va2llVmFsdWUgYXMgcGFyc2VDb29raWVWYWx1ZX0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7ybVnbG9iYWwgYXMgZ2xvYmFsfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtzZXRSb290RG9tQWRhcHRlcn0gZnJvbSAnLi4vZG9tL2RvbV9hZGFwdGVyJztcblxuaW1wb3J0IHtHZW5lcmljQnJvd3NlckRvbUFkYXB0ZXJ9IGZyb20gJy4vZ2VuZXJpY19icm93c2VyX2FkYXB0ZXInO1xuXG5jb25zdCBfYXR0clRvUHJvcE1hcCA9IHtcbiAgJ2NsYXNzJzogJ2NsYXNzTmFtZScsXG4gICdpbm5lckh0bWwnOiAnaW5uZXJIVE1MJyxcbiAgJ3JlYWRvbmx5JzogJ3JlYWRPbmx5JyxcbiAgJ3RhYmluZGV4JzogJ3RhYkluZGV4Jyxcbn07XG5cbmNvbnN0IERPTV9LRVlfTE9DQVRJT05fTlVNUEFEID0gMztcblxuLy8gTWFwIHRvIGNvbnZlcnQgc29tZSBrZXkgb3Iga2V5SWRlbnRpZmllciB2YWx1ZXMgdG8gd2hhdCB3aWxsIGJlIHJldHVybmVkIGJ5IGdldEV2ZW50S2V5XG5jb25zdCBfa2V5TWFwOiB7W2s6IHN0cmluZ106IHN0cmluZ30gPSB7XG4gIC8vIFRoZSBmb2xsb3dpbmcgdmFsdWVzIGFyZSBoZXJlIGZvciBjcm9zcy1icm93c2VyIGNvbXBhdGliaWxpdHkgYW5kIHRvIG1hdGNoIHRoZSBXM0Mgc3RhbmRhcmRcbiAgLy8gY2YgaHR0cDovL3d3dy53My5vcmcvVFIvRE9NLUxldmVsLTMtRXZlbnRzLWtleS9cbiAgJ1xcYic6ICdCYWNrc3BhY2UnLFxuICAnXFx0JzogJ1RhYicsXG4gICdcXHg3Ric6ICdEZWxldGUnLFxuICAnXFx4MUInOiAnRXNjYXBlJyxcbiAgJ0RlbCc6ICdEZWxldGUnLFxuICAnRXNjJzogJ0VzY2FwZScsXG4gICdMZWZ0JzogJ0Fycm93TGVmdCcsXG4gICdSaWdodCc6ICdBcnJvd1JpZ2h0JyxcbiAgJ1VwJzogJ0Fycm93VXAnLFxuICAnRG93bic6ICdBcnJvd0Rvd24nLFxuICAnTWVudSc6ICdDb250ZXh0TWVudScsXG4gICdTY3JvbGwnOiAnU2Nyb2xsTG9jaycsXG4gICdXaW4nOiAnT1MnXG59O1xuXG4vLyBUaGVyZSBpcyBhIGJ1ZyBpbiBDaHJvbWUgZm9yIG51bWVyaWMga2V5cGFkIGtleXM6XG4vLyBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9MTU1NjU0XG4vLyAxLCAyLCAzIC4uLiBhcmUgcmVwb3J0ZWQgYXMgQSwgQiwgQyAuLi5cbmNvbnN0IF9jaHJvbWVOdW1LZXlQYWRNYXAgPSB7XG4gICdBJzogJzEnLFxuICAnQic6ICcyJyxcbiAgJ0MnOiAnMycsXG4gICdEJzogJzQnLFxuICAnRSc6ICc1JyxcbiAgJ0YnOiAnNicsXG4gICdHJzogJzcnLFxuICAnSCc6ICc4JyxcbiAgJ0knOiAnOScsXG4gICdKJzogJyonLFxuICAnSyc6ICcrJyxcbiAgJ00nOiAnLScsXG4gICdOJzogJy4nLFxuICAnTyc6ICcvJyxcbiAgJ1xceDYwJzogJzAnLFxuICAnXFx4OTAnOiAnTnVtTG9jaydcbn07XG5cbmxldCBub2RlQ29udGFpbnM6IChhOiBhbnksIGI6IGFueSkgPT4gYm9vbGVhbjtcblxuaWYgKGdsb2JhbFsnTm9kZSddKSB7XG4gIG5vZGVDb250YWlucyA9IGdsb2JhbFsnTm9kZSddLnByb3RvdHlwZS5jb250YWlucyB8fCBmdW5jdGlvbihub2RlKSB7XG4gICAgcmV0dXJuICEhKHRoaXMuY29tcGFyZURvY3VtZW50UG9zaXRpb24obm9kZSkgJiAxNik7XG4gIH07XG59XG5cbi8qKlxuICogQSBgRG9tQWRhcHRlcmAgcG93ZXJlZCBieSBmdWxsIGJyb3dzZXIgRE9NIEFQSXMuXG4gKlxuICogQHNlY3VyaXR5IFRyZWFkIGNhcmVmdWxseSEgSW50ZXJhY3Rpbmcgd2l0aCB0aGUgRE9NIGRpcmVjdGx5IGlzIGRhbmdlcm91cyBhbmRcbiAqIGNhbiBpbnRyb2R1Y2UgWFNTIHJpc2tzLlxuICovXG4vKiB0c2xpbnQ6ZGlzYWJsZTpyZXF1aXJlUGFyYW1ldGVyVHlwZSBuby1jb25zb2xlICovXG5leHBvcnQgY2xhc3MgQnJvd3NlckRvbUFkYXB0ZXIgZXh0ZW5kcyBHZW5lcmljQnJvd3NlckRvbUFkYXB0ZXIge1xuICBwYXJzZSh0ZW1wbGF0ZUh0bWw6IHN0cmluZykgeyB0aHJvdyBuZXcgRXJyb3IoJ3BhcnNlIG5vdCBpbXBsZW1lbnRlZCcpOyB9XG4gIHN0YXRpYyBtYWtlQ3VycmVudCgpIHsgc2V0Um9vdERvbUFkYXB0ZXIobmV3IEJyb3dzZXJEb21BZGFwdGVyKCkpOyB9XG4gIGhhc1Byb3BlcnR5KGVsZW1lbnQ6IE5vZGUsIG5hbWU6IHN0cmluZyk6IGJvb2xlYW4geyByZXR1cm4gbmFtZSBpbiBlbGVtZW50OyB9XG4gIHNldFByb3BlcnR5KGVsOiBOb2RlLCBuYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnkpIHsgKDxhbnk+ZWwpW25hbWVdID0gdmFsdWU7IH1cbiAgZ2V0UHJvcGVydHkoZWw6IE5vZGUsIG5hbWU6IHN0cmluZyk6IGFueSB7IHJldHVybiAoPGFueT5lbClbbmFtZV07IH1cbiAgaW52b2tlKGVsOiBOb2RlLCBtZXRob2ROYW1lOiBzdHJpbmcsIGFyZ3M6IGFueVtdKTogYW55IHsgKDxhbnk+ZWwpW21ldGhvZE5hbWVdKC4uLmFyZ3MpOyB9XG5cbiAgLy8gVE9ETyh0Ym9zY2gpOiBtb3ZlIHRoaXMgaW50byBhIHNlcGFyYXRlIGVudmlyb25tZW50IGNsYXNzIG9uY2Ugd2UgaGF2ZSBpdFxuICBsb2dFcnJvcihlcnJvcjogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKHdpbmRvdy5jb25zb2xlKSB7XG4gICAgICBpZiAoY29uc29sZS5lcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBsb2coZXJyb3I6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICh3aW5kb3cuY29uc29sZSkge1xuICAgICAgd2luZG93LmNvbnNvbGUubG9nICYmIHdpbmRvdy5jb25zb2xlLmxvZyhlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgbG9nR3JvdXAoZXJyb3I6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICh3aW5kb3cuY29uc29sZSkge1xuICAgICAgd2luZG93LmNvbnNvbGUuZ3JvdXAgJiYgd2luZG93LmNvbnNvbGUuZ3JvdXAoZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIGxvZ0dyb3VwRW5kKCk6IHZvaWQge1xuICAgIGlmICh3aW5kb3cuY29uc29sZSkge1xuICAgICAgd2luZG93LmNvbnNvbGUuZ3JvdXBFbmQgJiYgd2luZG93LmNvbnNvbGUuZ3JvdXBFbmQoKTtcbiAgICB9XG4gIH1cblxuICBnZXQgYXR0clRvUHJvcE1hcCgpOiBhbnkgeyByZXR1cm4gX2F0dHJUb1Byb3BNYXA7IH1cblxuICBjb250YWlucyhub2RlQTogYW55LCBub2RlQjogYW55KTogYm9vbGVhbiB7IHJldHVybiBub2RlQ29udGFpbnMuY2FsbChub2RlQSwgbm9kZUIpOyB9XG4gIHF1ZXJ5U2VsZWN0b3IoZWw6IEhUTUxFbGVtZW50LCBzZWxlY3Rvcjogc3RyaW5nKTogYW55IHsgcmV0dXJuIGVsLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpOyB9XG4gIHF1ZXJ5U2VsZWN0b3JBbGwoZWw6IGFueSwgc2VsZWN0b3I6IHN0cmluZyk6IGFueVtdIHsgcmV0dXJuIGVsLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpOyB9XG4gIG9uKGVsOiBOb2RlLCBldnQ6IGFueSwgbGlzdGVuZXI6IGFueSkgeyBlbC5hZGRFdmVudExpc3RlbmVyKGV2dCwgbGlzdGVuZXIsIGZhbHNlKTsgfVxuICBvbkFuZENhbmNlbChlbDogTm9kZSwgZXZ0OiBhbnksIGxpc3RlbmVyOiBhbnkpOiBGdW5jdGlvbiB7XG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihldnQsIGxpc3RlbmVyLCBmYWxzZSk7XG4gICAgLy8gTmVlZGVkIHRvIGZvbGxvdyBEYXJ0J3Mgc3Vic2NyaXB0aW9uIHNlbWFudGljLCB1bnRpbCBmaXggb2ZcbiAgICAvLyBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL2RhcnQvaXNzdWVzL2RldGFpbD9pZD0xNzQwNlxuICAgIHJldHVybiAoKSA9PiB7IGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZ0LCBsaXN0ZW5lciwgZmFsc2UpOyB9O1xuICB9XG4gIGRpc3BhdGNoRXZlbnQoZWw6IE5vZGUsIGV2dDogYW55KSB7IGVsLmRpc3BhdGNoRXZlbnQoZXZ0KTsgfVxuICBjcmVhdGVNb3VzZUV2ZW50KGV2ZW50VHlwZTogc3RyaW5nKTogTW91c2VFdmVudCB7XG4gICAgY29uc3QgZXZ0OiBNb3VzZUV2ZW50ID0gdGhpcy5nZXREZWZhdWx0RG9jdW1lbnQoKS5jcmVhdGVFdmVudCgnTW91c2VFdmVudCcpO1xuICAgIGV2dC5pbml0RXZlbnQoZXZlbnRUeXBlLCB0cnVlLCB0cnVlKTtcbiAgICByZXR1cm4gZXZ0O1xuICB9XG4gIGNyZWF0ZUV2ZW50KGV2ZW50VHlwZTogYW55KTogRXZlbnQge1xuICAgIGNvbnN0IGV2dDogRXZlbnQgPSB0aGlzLmdldERlZmF1bHREb2N1bWVudCgpLmNyZWF0ZUV2ZW50KCdFdmVudCcpO1xuICAgIGV2dC5pbml0RXZlbnQoZXZlbnRUeXBlLCB0cnVlLCB0cnVlKTtcbiAgICByZXR1cm4gZXZ0O1xuICB9XG4gIHByZXZlbnREZWZhdWx0KGV2dDogRXZlbnQpIHtcbiAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICBldnQucmV0dXJuVmFsdWUgPSBmYWxzZTtcbiAgfVxuICBpc1ByZXZlbnRlZChldnQ6IEV2ZW50KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGV2dC5kZWZhdWx0UHJldmVudGVkIHx8IGV2dC5yZXR1cm5WYWx1ZSAhPSBudWxsICYmICFldnQucmV0dXJuVmFsdWU7XG4gIH1cbiAgZ2V0SW5uZXJIVE1MKGVsOiBIVE1MRWxlbWVudCk6IHN0cmluZyB7IHJldHVybiBlbC5pbm5lckhUTUw7IH1cbiAgZ2V0VGVtcGxhdGVDb250ZW50KGVsOiBOb2RlKTogTm9kZXxudWxsIHtcbiAgICByZXR1cm4gJ2NvbnRlbnQnIGluIGVsICYmIHRoaXMuaXNUZW1wbGF0ZUVsZW1lbnQoZWwpID8gKDxhbnk+ZWwpLmNvbnRlbnQgOiBudWxsO1xuICB9XG4gIGdldE91dGVySFRNTChlbDogSFRNTEVsZW1lbnQpOiBzdHJpbmcgeyByZXR1cm4gZWwub3V0ZXJIVE1MOyB9XG4gIG5vZGVOYW1lKG5vZGU6IE5vZGUpOiBzdHJpbmcgeyByZXR1cm4gbm9kZS5ub2RlTmFtZTsgfVxuICBub2RlVmFsdWUobm9kZTogTm9kZSk6IHN0cmluZ3xudWxsIHsgcmV0dXJuIG5vZGUubm9kZVZhbHVlOyB9XG4gIHR5cGUobm9kZTogSFRNTElucHV0RWxlbWVudCk6IHN0cmluZyB7IHJldHVybiBub2RlLnR5cGU7IH1cbiAgY29udGVudChub2RlOiBOb2RlKTogTm9kZSB7XG4gICAgaWYgKHRoaXMuaGFzUHJvcGVydHkobm9kZSwgJ2NvbnRlbnQnKSkge1xuICAgICAgcmV0dXJuICg8YW55Pm5vZGUpLmNvbnRlbnQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBub2RlO1xuICAgIH1cbiAgfVxuICBmaXJzdENoaWxkKGVsOiBOb2RlKTogTm9kZXxudWxsIHsgcmV0dXJuIGVsLmZpcnN0Q2hpbGQ7IH1cbiAgbmV4dFNpYmxpbmcoZWw6IE5vZGUpOiBOb2RlfG51bGwgeyByZXR1cm4gZWwubmV4dFNpYmxpbmc7IH1cbiAgcGFyZW50RWxlbWVudChlbDogTm9kZSk6IE5vZGV8bnVsbCB7IHJldHVybiBlbC5wYXJlbnROb2RlOyB9XG4gIGNoaWxkTm9kZXMoZWw6IGFueSk6IE5vZGVbXSB7IHJldHVybiBlbC5jaGlsZE5vZGVzOyB9XG4gIGNoaWxkTm9kZXNBc0xpc3QoZWw6IE5vZGUpOiBhbnlbXSB7XG4gICAgY29uc3QgY2hpbGROb2RlcyA9IGVsLmNoaWxkTm9kZXM7XG4gICAgY29uc3QgcmVzID0gbmV3IEFycmF5KGNoaWxkTm9kZXMubGVuZ3RoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkTm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHJlc1tpXSA9IGNoaWxkTm9kZXNbaV07XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cbiAgY2xlYXJOb2RlcyhlbDogTm9kZSkge1xuICAgIHdoaWxlIChlbC5maXJzdENoaWxkKSB7XG4gICAgICBlbC5yZW1vdmVDaGlsZChlbC5maXJzdENoaWxkKTtcbiAgICB9XG4gIH1cbiAgYXBwZW5kQ2hpbGQoZWw6IE5vZGUsIG5vZGU6IE5vZGUpIHsgZWwuYXBwZW5kQ2hpbGQobm9kZSk7IH1cbiAgcmVtb3ZlQ2hpbGQoZWw6IE5vZGUsIG5vZGU6IE5vZGUpIHsgZWwucmVtb3ZlQ2hpbGQobm9kZSk7IH1cbiAgcmVwbGFjZUNoaWxkKGVsOiBOb2RlLCBuZXdDaGlsZDogTm9kZSwgb2xkQ2hpbGQ6IE5vZGUpIHsgZWwucmVwbGFjZUNoaWxkKG5ld0NoaWxkLCBvbGRDaGlsZCk7IH1cbiAgcmVtb3ZlKG5vZGU6IE5vZGUpOiBOb2RlIHtcbiAgICBpZiAobm9kZS5wYXJlbnROb2RlKSB7XG4gICAgICBub2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobm9kZSk7XG4gICAgfVxuICAgIHJldHVybiBub2RlO1xuICB9XG4gIGluc2VydEJlZm9yZShwYXJlbnQ6IE5vZGUsIHJlZjogTm9kZSwgbm9kZTogTm9kZSkgeyBwYXJlbnQuaW5zZXJ0QmVmb3JlKG5vZGUsIHJlZik7IH1cbiAgaW5zZXJ0QWxsQmVmb3JlKHBhcmVudDogTm9kZSwgcmVmOiBOb2RlLCBub2RlczogTm9kZVtdKSB7XG4gICAgbm9kZXMuZm9yRWFjaCgobjogYW55KSA9PiBwYXJlbnQuaW5zZXJ0QmVmb3JlKG4sIHJlZikpO1xuICB9XG4gIGluc2VydEFmdGVyKHBhcmVudDogTm9kZSwgcmVmOiBOb2RlLCBub2RlOiBhbnkpIHsgcGFyZW50Lmluc2VydEJlZm9yZShub2RlLCByZWYubmV4dFNpYmxpbmcpOyB9XG4gIHNldElubmVySFRNTChlbDogRWxlbWVudCwgdmFsdWU6IHN0cmluZykgeyBlbC5pbm5lckhUTUwgPSB2YWx1ZTsgfVxuICBnZXRUZXh0KGVsOiBOb2RlKTogc3RyaW5nfG51bGwgeyByZXR1cm4gZWwudGV4dENvbnRlbnQ7IH1cbiAgc2V0VGV4dChlbDogTm9kZSwgdmFsdWU6IHN0cmluZykgeyBlbC50ZXh0Q29udGVudCA9IHZhbHVlOyB9XG4gIGdldFZhbHVlKGVsOiBhbnkpOiBzdHJpbmcgeyByZXR1cm4gZWwudmFsdWU7IH1cbiAgc2V0VmFsdWUoZWw6IGFueSwgdmFsdWU6IHN0cmluZykgeyBlbC52YWx1ZSA9IHZhbHVlOyB9XG4gIGdldENoZWNrZWQoZWw6IGFueSk6IGJvb2xlYW4geyByZXR1cm4gZWwuY2hlY2tlZDsgfVxuICBzZXRDaGVja2VkKGVsOiBhbnksIHZhbHVlOiBib29sZWFuKSB7IGVsLmNoZWNrZWQgPSB2YWx1ZTsgfVxuICBjcmVhdGVDb21tZW50KHRleHQ6IHN0cmluZyk6IENvbW1lbnQgeyByZXR1cm4gdGhpcy5nZXREZWZhdWx0RG9jdW1lbnQoKS5jcmVhdGVDb21tZW50KHRleHQpOyB9XG4gIGNyZWF0ZVRlbXBsYXRlKGh0bWw6IGFueSk6IEhUTUxFbGVtZW50IHtcbiAgICBjb25zdCB0ID0gdGhpcy5nZXREZWZhdWx0RG9jdW1lbnQoKS5jcmVhdGVFbGVtZW50KCd0ZW1wbGF0ZScpO1xuICAgIHQuaW5uZXJIVE1MID0gaHRtbDtcbiAgICByZXR1cm4gdDtcbiAgfVxuICBjcmVhdGVFbGVtZW50KHRhZ05hbWU6IHN0cmluZywgZG9jPzogRG9jdW1lbnQpOiBIVE1MRWxlbWVudCB7XG4gICAgZG9jID0gZG9jIHx8IHRoaXMuZ2V0RGVmYXVsdERvY3VtZW50KCk7XG4gICAgcmV0dXJuIGRvYy5jcmVhdGVFbGVtZW50KHRhZ05hbWUpO1xuICB9XG4gIGNyZWF0ZUVsZW1lbnROUyhuczogc3RyaW5nLCB0YWdOYW1lOiBzdHJpbmcsIGRvYz86IERvY3VtZW50KTogRWxlbWVudCB7XG4gICAgZG9jID0gZG9jIHx8IHRoaXMuZ2V0RGVmYXVsdERvY3VtZW50KCk7XG4gICAgcmV0dXJuIGRvYy5jcmVhdGVFbGVtZW50TlMobnMsIHRhZ05hbWUpO1xuICB9XG4gIGNyZWF0ZVRleHROb2RlKHRleHQ6IHN0cmluZywgZG9jPzogRG9jdW1lbnQpOiBUZXh0IHtcbiAgICBkb2MgPSBkb2MgfHwgdGhpcy5nZXREZWZhdWx0RG9jdW1lbnQoKTtcbiAgICByZXR1cm4gZG9jLmNyZWF0ZVRleHROb2RlKHRleHQpO1xuICB9XG4gIGNyZWF0ZVNjcmlwdFRhZyhhdHRyTmFtZTogc3RyaW5nLCBhdHRyVmFsdWU6IHN0cmluZywgZG9jPzogRG9jdW1lbnQpOiBIVE1MU2NyaXB0RWxlbWVudCB7XG4gICAgZG9jID0gZG9jIHx8IHRoaXMuZ2V0RGVmYXVsdERvY3VtZW50KCk7XG4gICAgY29uc3QgZWwgPSA8SFRNTFNjcmlwdEVsZW1lbnQ+ZG9jLmNyZWF0ZUVsZW1lbnQoJ1NDUklQVCcpO1xuICAgIGVsLnNldEF0dHJpYnV0ZShhdHRyTmFtZSwgYXR0clZhbHVlKTtcbiAgICByZXR1cm4gZWw7XG4gIH1cbiAgY3JlYXRlU3R5bGVFbGVtZW50KGNzczogc3RyaW5nLCBkb2M/OiBEb2N1bWVudCk6IEhUTUxTdHlsZUVsZW1lbnQge1xuICAgIGRvYyA9IGRvYyB8fCB0aGlzLmdldERlZmF1bHREb2N1bWVudCgpO1xuICAgIGNvbnN0IHN0eWxlID0gPEhUTUxTdHlsZUVsZW1lbnQ+ZG9jLmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgdGhpcy5hcHBlbmRDaGlsZChzdHlsZSwgdGhpcy5jcmVhdGVUZXh0Tm9kZShjc3MsIGRvYykpO1xuICAgIHJldHVybiBzdHlsZTtcbiAgfVxuICBjcmVhdGVTaGFkb3dSb290KGVsOiBIVE1MRWxlbWVudCk6IERvY3VtZW50RnJhZ21lbnQgeyByZXR1cm4gKDxhbnk+ZWwpLmNyZWF0ZVNoYWRvd1Jvb3QoKTsgfVxuICBnZXRTaGFkb3dSb290KGVsOiBIVE1MRWxlbWVudCk6IERvY3VtZW50RnJhZ21lbnQgeyByZXR1cm4gKDxhbnk+ZWwpLnNoYWRvd1Jvb3Q7IH1cbiAgZ2V0SG9zdChlbDogSFRNTEVsZW1lbnQpOiBIVE1MRWxlbWVudCB7IHJldHVybiAoPGFueT5lbCkuaG9zdDsgfVxuICBjbG9uZShub2RlOiBOb2RlKTogTm9kZSB7IHJldHVybiBub2RlLmNsb25lTm9kZSh0cnVlKTsgfVxuICBnZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGVsZW1lbnQ6IGFueSwgbmFtZTogc3RyaW5nKTogSFRNTEVsZW1lbnRbXSB7XG4gICAgcmV0dXJuIGVsZW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShuYW1lKTtcbiAgfVxuICBnZXRFbGVtZW50c0J5VGFnTmFtZShlbGVtZW50OiBhbnksIG5hbWU6IHN0cmluZyk6IEhUTUxFbGVtZW50W10ge1xuICAgIHJldHVybiBlbGVtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKG5hbWUpO1xuICB9XG4gIGNsYXNzTGlzdChlbGVtZW50OiBhbnkpOiBhbnlbXSB7IHJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChlbGVtZW50LmNsYXNzTGlzdCwgMCk7IH1cbiAgYWRkQ2xhc3MoZWxlbWVudDogYW55LCBjbGFzc05hbWU6IHN0cmluZykgeyBlbGVtZW50LmNsYXNzTGlzdC5hZGQoY2xhc3NOYW1lKTsgfVxuICByZW1vdmVDbGFzcyhlbGVtZW50OiBhbnksIGNsYXNzTmFtZTogc3RyaW5nKSB7IGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShjbGFzc05hbWUpOyB9XG4gIGhhc0NsYXNzKGVsZW1lbnQ6IGFueSwgY2xhc3NOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoY2xhc3NOYW1lKTtcbiAgfVxuICBzZXRTdHlsZShlbGVtZW50OiBhbnksIHN0eWxlTmFtZTogc3RyaW5nLCBzdHlsZVZhbHVlOiBzdHJpbmcpIHtcbiAgICBlbGVtZW50LnN0eWxlW3N0eWxlTmFtZV0gPSBzdHlsZVZhbHVlO1xuICB9XG4gIHJlbW92ZVN0eWxlKGVsZW1lbnQ6IGFueSwgc3R5bGVuYW1lOiBzdHJpbmcpIHtcbiAgICAvLyBJRSByZXF1aXJlcyAnJyBpbnN0ZWFkIG9mIG51bGxcbiAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvNzkxNlxuICAgIGVsZW1lbnQuc3R5bGVbc3R5bGVuYW1lXSA9ICcnO1xuICB9XG4gIGdldFN0eWxlKGVsZW1lbnQ6IGFueSwgc3R5bGVuYW1lOiBzdHJpbmcpOiBzdHJpbmcgeyByZXR1cm4gZWxlbWVudC5zdHlsZVtzdHlsZW5hbWVdOyB9XG4gIGhhc1N0eWxlKGVsZW1lbnQ6IGFueSwgc3R5bGVOYW1lOiBzdHJpbmcsIHN0eWxlVmFsdWU/OiBzdHJpbmd8bnVsbCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHZhbHVlID0gdGhpcy5nZXRTdHlsZShlbGVtZW50LCBzdHlsZU5hbWUpIHx8ICcnO1xuICAgIHJldHVybiBzdHlsZVZhbHVlID8gdmFsdWUgPT0gc3R5bGVWYWx1ZSA6IHZhbHVlLmxlbmd0aCA+IDA7XG4gIH1cbiAgdGFnTmFtZShlbGVtZW50OiBhbnkpOiBzdHJpbmcgeyByZXR1cm4gZWxlbWVudC50YWdOYW1lOyB9XG4gIGF0dHJpYnV0ZU1hcChlbGVtZW50OiBhbnkpOiBNYXA8c3RyaW5nLCBzdHJpbmc+IHtcbiAgICBjb25zdCByZXMgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xuICAgIGNvbnN0IGVsQXR0cnMgPSBlbGVtZW50LmF0dHJpYnV0ZXM7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbEF0dHJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBhdHRyaWIgPSBlbEF0dHJzLml0ZW0oaSk7XG4gICAgICByZXMuc2V0KGF0dHJpYi5uYW1lLCBhdHRyaWIudmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG4gIGhhc0F0dHJpYnV0ZShlbGVtZW50OiBFbGVtZW50LCBhdHRyaWJ1dGU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBlbGVtZW50Lmhhc0F0dHJpYnV0ZShhdHRyaWJ1dGUpO1xuICB9XG4gIGhhc0F0dHJpYnV0ZU5TKGVsZW1lbnQ6IEVsZW1lbnQsIG5zOiBzdHJpbmcsIGF0dHJpYnV0ZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGVsZW1lbnQuaGFzQXR0cmlidXRlTlMobnMsIGF0dHJpYnV0ZSk7XG4gIH1cbiAgZ2V0QXR0cmlidXRlKGVsZW1lbnQ6IEVsZW1lbnQsIGF0dHJpYnV0ZTogc3RyaW5nKTogc3RyaW5nfG51bGwge1xuICAgIHJldHVybiBlbGVtZW50LmdldEF0dHJpYnV0ZShhdHRyaWJ1dGUpO1xuICB9XG4gIGdldEF0dHJpYnV0ZU5TKGVsZW1lbnQ6IEVsZW1lbnQsIG5zOiBzdHJpbmcsIG5hbWU6IHN0cmluZyk6IHN0cmluZ3xudWxsIHtcbiAgICByZXR1cm4gZWxlbWVudC5nZXRBdHRyaWJ1dGVOUyhucywgbmFtZSk7XG4gIH1cbiAgc2V0QXR0cmlidXRlKGVsZW1lbnQ6IEVsZW1lbnQsIG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZykgeyBlbGVtZW50LnNldEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSk7IH1cbiAgc2V0QXR0cmlidXRlTlMoZWxlbWVudDogRWxlbWVudCwgbnM6IHN0cmluZywgbmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKSB7XG4gICAgZWxlbWVudC5zZXRBdHRyaWJ1dGVOUyhucywgbmFtZSwgdmFsdWUpO1xuICB9XG4gIHJlbW92ZUF0dHJpYnV0ZShlbGVtZW50OiBFbGVtZW50LCBhdHRyaWJ1dGU6IHN0cmluZykgeyBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZShhdHRyaWJ1dGUpOyB9XG4gIHJlbW92ZUF0dHJpYnV0ZU5TKGVsZW1lbnQ6IEVsZW1lbnQsIG5zOiBzdHJpbmcsIG5hbWU6IHN0cmluZykge1xuICAgIGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlTlMobnMsIG5hbWUpO1xuICB9XG4gIHRlbXBsYXRlQXdhcmVSb290KGVsOiBOb2RlKTogYW55IHsgcmV0dXJuIHRoaXMuaXNUZW1wbGF0ZUVsZW1lbnQoZWwpID8gdGhpcy5jb250ZW50KGVsKSA6IGVsOyB9XG4gIGNyZWF0ZUh0bWxEb2N1bWVudCgpOiBIVE1MRG9jdW1lbnQge1xuICAgIHJldHVybiBkb2N1bWVudC5pbXBsZW1lbnRhdGlvbi5jcmVhdGVIVE1MRG9jdW1lbnQoJ2Zha2VUaXRsZScpO1xuICB9XG4gIGdldERlZmF1bHREb2N1bWVudCgpOiBEb2N1bWVudCB7IHJldHVybiBkb2N1bWVudDsgfVxuICBnZXRCb3VuZGluZ0NsaWVudFJlY3QoZWw6IEVsZW1lbnQpOiBhbnkge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4ge3RvcDogMCwgYm90dG9tOiAwLCBsZWZ0OiAwLCByaWdodDogMCwgd2lkdGg6IDAsIGhlaWdodDogMH07XG4gICAgfVxuICB9XG4gIGdldFRpdGxlKGRvYzogRG9jdW1lbnQpOiBzdHJpbmcgeyByZXR1cm4gZG9jLnRpdGxlOyB9XG4gIHNldFRpdGxlKGRvYzogRG9jdW1lbnQsIG5ld1RpdGxlOiBzdHJpbmcpIHsgZG9jLnRpdGxlID0gbmV3VGl0bGUgfHwgJyc7IH1cbiAgZWxlbWVudE1hdGNoZXMobjogYW55LCBzZWxlY3Rvcjogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMuaXNFbGVtZW50Tm9kZShuKSkge1xuICAgICAgcmV0dXJuIG4ubWF0Y2hlcyAmJiBuLm1hdGNoZXMoc2VsZWN0b3IpIHx8XG4gICAgICAgICAgbi5tc01hdGNoZXNTZWxlY3RvciAmJiBuLm1zTWF0Y2hlc1NlbGVjdG9yKHNlbGVjdG9yKSB8fFxuICAgICAgICAgIG4ud2Via2l0TWF0Y2hlc1NlbGVjdG9yICYmIG4ud2Via2l0TWF0Y2hlc1NlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaXNUZW1wbGF0ZUVsZW1lbnQoZWw6IE5vZGUpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pc0VsZW1lbnROb2RlKGVsKSAmJiBlbC5ub2RlTmFtZSA9PT0gJ1RFTVBMQVRFJztcbiAgfVxuICBpc1RleHROb2RlKG5vZGU6IE5vZGUpOiBib29sZWFuIHsgcmV0dXJuIG5vZGUubm9kZVR5cGUgPT09IE5vZGUuVEVYVF9OT0RFOyB9XG4gIGlzQ29tbWVudE5vZGUobm9kZTogTm9kZSk6IGJvb2xlYW4geyByZXR1cm4gbm9kZS5ub2RlVHlwZSA9PT0gTm9kZS5DT01NRU5UX05PREU7IH1cbiAgaXNFbGVtZW50Tm9kZShub2RlOiBOb2RlKTogYm9vbGVhbiB7IHJldHVybiBub2RlLm5vZGVUeXBlID09PSBOb2RlLkVMRU1FTlRfTk9ERTsgfVxuICBoYXNTaGFkb3dSb290KG5vZGU6IGFueSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBub2RlLnNoYWRvd1Jvb3QgIT0gbnVsbCAmJiBub2RlIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQ7XG4gIH1cbiAgaXNTaGFkb3dSb290KG5vZGU6IGFueSk6IGJvb2xlYW4geyByZXR1cm4gbm9kZSBpbnN0YW5jZW9mIERvY3VtZW50RnJhZ21lbnQ7IH1cbiAgaW1wb3J0SW50b0RvYyhub2RlOiBOb2RlKTogYW55IHsgcmV0dXJuIGRvY3VtZW50LmltcG9ydE5vZGUodGhpcy50ZW1wbGF0ZUF3YXJlUm9vdChub2RlKSwgdHJ1ZSk7IH1cbiAgYWRvcHROb2RlKG5vZGU6IE5vZGUpOiBhbnkgeyByZXR1cm4gZG9jdW1lbnQuYWRvcHROb2RlKG5vZGUpOyB9XG4gIGdldEhyZWYoZWw6IEVsZW1lbnQpOiBzdHJpbmcgeyByZXR1cm4gZWwuZ2V0QXR0cmlidXRlKCdocmVmJykgITsgfVxuXG4gIGdldEV2ZW50S2V5KGV2ZW50OiBhbnkpOiBzdHJpbmcge1xuICAgIGxldCBrZXkgPSBldmVudC5rZXk7XG4gICAgaWYgKGtleSA9PSBudWxsKSB7XG4gICAgICBrZXkgPSBldmVudC5rZXlJZGVudGlmaWVyO1xuICAgICAgLy8ga2V5SWRlbnRpZmllciBpcyBkZWZpbmVkIGluIHRoZSBvbGQgZHJhZnQgb2YgRE9NIExldmVsIDMgRXZlbnRzIGltcGxlbWVudGVkIGJ5IENocm9tZSBhbmRcbiAgICAgIC8vIFNhZmFyaSBjZlxuICAgICAgLy8gaHR0cDovL3d3dy53My5vcmcvVFIvMjAwNy9XRC1ET00tTGV2ZWwtMy1FdmVudHMtMjAwNzEyMjEvZXZlbnRzLmh0bWwjRXZlbnRzLUtleWJvYXJkRXZlbnRzLUludGVyZmFjZXNcbiAgICAgIGlmIChrZXkgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gJ1VuaWRlbnRpZmllZCc7XG4gICAgICB9XG4gICAgICBpZiAoa2V5LnN0YXJ0c1dpdGgoJ1UrJykpIHtcbiAgICAgICAga2V5ID0gU3RyaW5nLmZyb21DaGFyQ29kZShwYXJzZUludChrZXkuc3Vic3RyaW5nKDIpLCAxNikpO1xuICAgICAgICBpZiAoZXZlbnQubG9jYXRpb24gPT09IERPTV9LRVlfTE9DQVRJT05fTlVNUEFEICYmIF9jaHJvbWVOdW1LZXlQYWRNYXAuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgIC8vIFRoZXJlIGlzIGEgYnVnIGluIENocm9tZSBmb3IgbnVtZXJpYyBrZXlwYWQga2V5czpcbiAgICAgICAgICAvLyBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9MTU1NjU0XG4gICAgICAgICAgLy8gMSwgMiwgMyAuLi4gYXJlIHJlcG9ydGVkIGFzIEEsIEIsIEMgLi4uXG4gICAgICAgICAga2V5ID0gKF9jaHJvbWVOdW1LZXlQYWRNYXAgYXMgYW55KVtrZXldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIF9rZXlNYXBba2V5XSB8fCBrZXk7XG4gIH1cbiAgZ2V0R2xvYmFsRXZlbnRUYXJnZXQoZG9jOiBEb2N1bWVudCwgdGFyZ2V0OiBzdHJpbmcpOiBFdmVudFRhcmdldHxudWxsIHtcbiAgICBpZiAodGFyZ2V0ID09PSAnd2luZG93Jykge1xuICAgICAgcmV0dXJuIHdpbmRvdztcbiAgICB9XG4gICAgaWYgKHRhcmdldCA9PT0gJ2RvY3VtZW50Jykge1xuICAgICAgcmV0dXJuIGRvYztcbiAgICB9XG4gICAgaWYgKHRhcmdldCA9PT0gJ2JvZHknKSB7XG4gICAgICByZXR1cm4gZG9jLmJvZHk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGdldEhpc3RvcnkoKTogSGlzdG9yeSB7IHJldHVybiB3aW5kb3cuaGlzdG9yeTsgfVxuICBnZXRMb2NhdGlvbigpOiBMb2NhdGlvbiB7IHJldHVybiB3aW5kb3cubG9jYXRpb247IH1cbiAgZ2V0QmFzZUhyZWYoZG9jOiBEb2N1bWVudCk6IHN0cmluZ3xudWxsIHtcbiAgICBjb25zdCBocmVmID0gZ2V0QmFzZUVsZW1lbnRIcmVmKCk7XG4gICAgcmV0dXJuIGhyZWYgPT0gbnVsbCA/IG51bGwgOiByZWxhdGl2ZVBhdGgoaHJlZik7XG4gIH1cbiAgcmVzZXRCYXNlRWxlbWVudCgpOiB2b2lkIHsgYmFzZUVsZW1lbnQgPSBudWxsOyB9XG4gIGdldFVzZXJBZ2VudCgpOiBzdHJpbmcgeyByZXR1cm4gd2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQ7IH1cbiAgc2V0RGF0YShlbGVtZW50OiBFbGVtZW50LCBuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpIHtcbiAgICB0aGlzLnNldEF0dHJpYnV0ZShlbGVtZW50LCAnZGF0YS0nICsgbmFtZSwgdmFsdWUpO1xuICB9XG4gIGdldERhdGEoZWxlbWVudDogRWxlbWVudCwgbmFtZTogc3RyaW5nKTogc3RyaW5nfG51bGwge1xuICAgIHJldHVybiB0aGlzLmdldEF0dHJpYnV0ZShlbGVtZW50LCAnZGF0YS0nICsgbmFtZSk7XG4gIH1cbiAgZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50OiBhbnkpOiBhbnkgeyByZXR1cm4gZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KTsgfVxuICAvLyBUT0RPKHRib3NjaCk6IG1vdmUgdGhpcyBpbnRvIGEgc2VwYXJhdGUgZW52aXJvbm1lbnQgY2xhc3Mgb25jZSB3ZSBoYXZlIGl0XG4gIHN1cHBvcnRzV2ViQW5pbWF0aW9uKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0eXBlb2YoPGFueT5FbGVtZW50KS5wcm90b3R5cGVbJ2FuaW1hdGUnXSA9PT0gJ2Z1bmN0aW9uJztcbiAgfVxuICBwZXJmb3JtYW5jZU5vdygpOiBudW1iZXIge1xuICAgIC8vIHBlcmZvcm1hbmNlLm5vdygpIGlzIG5vdCBhdmFpbGFibGUgaW4gYWxsIGJyb3dzZXJzLCBzZWVcbiAgICAvLyBodHRwOi8vY2FuaXVzZS5jb20vI3NlYXJjaD1wZXJmb3JtYW5jZS5ub3dcbiAgICByZXR1cm4gd2luZG93LnBlcmZvcm1hbmNlICYmIHdpbmRvdy5wZXJmb3JtYW5jZS5ub3cgPyB3aW5kb3cucGVyZm9ybWFuY2Uubm93KCkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICB9XG5cbiAgc3VwcG9ydHNDb29raWVzKCk6IGJvb2xlYW4geyByZXR1cm4gdHJ1ZTsgfVxuXG4gIGdldENvb2tpZShuYW1lOiBzdHJpbmcpOiBzdHJpbmd8bnVsbCB7IHJldHVybiBwYXJzZUNvb2tpZVZhbHVlKGRvY3VtZW50LmNvb2tpZSwgbmFtZSk7IH1cblxuICBzZXRDb29raWUobmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKSB7XG4gICAgLy8gZG9jdW1lbnQuY29va2llIGlzIG1hZ2ljYWwsIGFzc2lnbmluZyBpbnRvIGl0IGFzc2lnbnMvb3ZlcnJpZGVzIG9uZSBjb29raWUgdmFsdWUsIGJ1dCBkb2VzXG4gICAgLy8gbm90IGNsZWFyIG90aGVyIGNvb2tpZXMuXG4gICAgZG9jdW1lbnQuY29va2llID0gZW5jb2RlVVJJQ29tcG9uZW50KG5hbWUpICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKTtcbiAgfVxufVxuXG5sZXQgYmFzZUVsZW1lbnQ6IEhUTUxFbGVtZW50fG51bGwgPSBudWxsO1xuZnVuY3Rpb24gZ2V0QmFzZUVsZW1lbnRIcmVmKCk6IHN0cmluZ3xudWxsIHtcbiAgaWYgKCFiYXNlRWxlbWVudCkge1xuICAgIGJhc2VFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYmFzZScpICE7XG4gICAgaWYgKCFiYXNlRWxlbWVudCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG4gIHJldHVybiBiYXNlRWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcbn1cblxuLy8gYmFzZWQgb24gdXJsVXRpbHMuanMgaW4gQW5ndWxhckpTIDFcbmxldCB1cmxQYXJzaW5nTm9kZTogYW55O1xuZnVuY3Rpb24gcmVsYXRpdmVQYXRoKHVybDogYW55KTogc3RyaW5nIHtcbiAgaWYgKCF1cmxQYXJzaW5nTm9kZSkge1xuICAgIHVybFBhcnNpbmdOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICB9XG4gIHVybFBhcnNpbmdOb2RlLnNldEF0dHJpYnV0ZSgnaHJlZicsIHVybCk7XG4gIHJldHVybiAodXJsUGFyc2luZ05vZGUucGF0aG5hbWUuY2hhckF0KDApID09PSAnLycpID8gdXJsUGFyc2luZ05vZGUucGF0aG5hbWUgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcvJyArIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lO1xufVxuIl19