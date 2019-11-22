/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { isDevMode } from '../is_dev_mode';
import { InertBodyHelper } from './inert_body';
import { _sanitizeUrl, sanitizeSrcset } from './url_sanitizer';
/**
 * @param {?} tags
 * @return {?}
 */
function tagSet(tags) {
    /** @type {?} */
    const res = {};
    for (const t of tags.split(','))
        res[t] = true;
    return res;
}
/**
 * @param {...?} sets
 * @return {?}
 */
function merge(...sets) {
    /** @type {?} */
    const res = {};
    for (const s of sets) {
        for (const v in s) {
            if (s.hasOwnProperty(v))
                res[v] = true;
        }
    }
    return res;
}
// Good source of info about elements and attributes
// http://dev.w3.org/html5/spec/Overview.html#semantics
// http://simon.html5.org/html-elements
// Safe Void Elements - HTML5
// http://dev.w3.org/html5/spec/Overview.html#void-elements
/** @type {?} */
const VOID_ELEMENTS = tagSet('area,br,col,hr,img,wbr');
// Elements that you can, intentionally, leave open (and which close themselves)
// http://dev.w3.org/html5/spec/Overview.html#optional-tags
/** @type {?} */
const OPTIONAL_END_TAG_BLOCK_ELEMENTS = tagSet('colgroup,dd,dt,li,p,tbody,td,tfoot,th,thead,tr');
/** @type {?} */
const OPTIONAL_END_TAG_INLINE_ELEMENTS = tagSet('rp,rt');
/** @type {?} */
const OPTIONAL_END_TAG_ELEMENTS = merge(OPTIONAL_END_TAG_INLINE_ELEMENTS, OPTIONAL_END_TAG_BLOCK_ELEMENTS);
// Safe Block Elements - HTML5
/** @type {?} */
const BLOCK_ELEMENTS = merge(OPTIONAL_END_TAG_BLOCK_ELEMENTS, tagSet('address,article,' +
    'aside,blockquote,caption,center,del,details,dialog,dir,div,dl,figure,figcaption,footer,h1,h2,h3,h4,h5,' +
    'h6,header,hgroup,hr,ins,main,map,menu,nav,ol,pre,section,summary,table,ul'));
// Inline Elements - HTML5
/** @type {?} */
const INLINE_ELEMENTS = merge(OPTIONAL_END_TAG_INLINE_ELEMENTS, tagSet('a,abbr,acronym,audio,b,' +
    'bdi,bdo,big,br,cite,code,del,dfn,em,font,i,img,ins,kbd,label,map,mark,picture,q,ruby,rp,rt,s,' +
    'samp,small,source,span,strike,strong,sub,sup,time,track,tt,u,var,video'));
/** @type {?} */
export const VALID_ELEMENTS = merge(VOID_ELEMENTS, BLOCK_ELEMENTS, INLINE_ELEMENTS, OPTIONAL_END_TAG_ELEMENTS);
// Attributes that have href and hence need to be sanitized
/** @type {?} */
export const URI_ATTRS = tagSet('background,cite,href,itemtype,longdesc,poster,src,xlink:href');
// Attributes that have special href set hence need to be sanitized
/** @type {?} */
export const SRCSET_ATTRS = tagSet('srcset');
/** @type {?} */
const HTML_ATTRS = tagSet('abbr,accesskey,align,alt,autoplay,axis,bgcolor,border,cellpadding,cellspacing,class,clear,color,cols,colspan,' +
    'compact,controls,coords,datetime,default,dir,download,face,headers,height,hidden,hreflang,hspace,' +
    'ismap,itemscope,itemprop,kind,label,lang,language,loop,media,muted,nohref,nowrap,open,preload,rel,rev,role,rows,rowspan,rules,' +
    'scope,scrolling,shape,size,sizes,span,srclang,start,summary,tabindex,target,title,translate,type,usemap,' +
    'valign,value,vspace,width');
// NB: This currently consciously doesn't support SVG. SVG sanitization has had several security
// issues in the past, so it seems safer to leave it out if possible. If support for binding SVG via
// innerHTML is required, SVG attributes should be added here.
// NB: Sanitization does not allow <form> elements or other active elements (<button> etc). Those
// can be sanitized, but they increase security surface area without a legitimate use case, so they
// are left out here.
/** @type {?} */
export const VALID_ATTRS = merge(URI_ATTRS, SRCSET_ATTRS, HTML_ATTRS);
// Elements whose content should not be traversed/preserved, if the elements themselves are invalid.
//
// Typically, `<invalid>Some content</invalid>` would traverse (and in this case preserve)
// `Some content`, but strip `invalid-element` opening/closing tags. For some elements, though, we
// don't want to preserve the content, if the elements themselves are going to be removed.
/** @type {?} */
const SKIP_TRAVERSING_CONTENT_IF_INVALID_ELEMENTS = tagSet('script,style,template');
/**
 * SanitizingHtmlSerializer serializes a DOM fragment, stripping out any unsafe elements and unsafe
 * attributes.
 */
class SanitizingHtmlSerializer {
    constructor() {
        // Explicitly track if something was stripped, to avoid accidentally warning of sanitization just
        // because characters were re-encoded.
        this.sanitizedSomething = false;
        this.buf = [];
    }
    /**
     * @param {?} el
     * @return {?}
     */
    sanitizeChildren(el) {
        // This cannot use a TreeWalker, as it has to run on Angular's various DOM adapters.
        // However this code never accesses properties off of `document` before deleting its contents
        // again, so it shouldn't be vulnerable to DOM clobbering.
        /** @type {?} */
        let current = (/** @type {?} */ (el.firstChild));
        /** @type {?} */
        let traverseContent = true;
        while (current) {
            if (current.nodeType === Node.ELEMENT_NODE) {
                traverseContent = this.startElement((/** @type {?} */ (current)));
            }
            else if (current.nodeType === Node.TEXT_NODE) {
                this.chars((/** @type {?} */ (current.nodeValue)));
            }
            else {
                // Strip non-element, non-text nodes.
                this.sanitizedSomething = true;
            }
            if (traverseContent && current.firstChild) {
                current = (/** @type {?} */ (current.firstChild));
                continue;
            }
            while (current) {
                // Leaving the element. Walk up and to the right, closing tags as we go.
                if (current.nodeType === Node.ELEMENT_NODE) {
                    this.endElement((/** @type {?} */ (current)));
                }
                /** @type {?} */
                let next = this.checkClobberedElement(current, (/** @type {?} */ (current.nextSibling)));
                if (next) {
                    current = next;
                    break;
                }
                current = this.checkClobberedElement(current, (/** @type {?} */ (current.parentNode)));
            }
        }
        return this.buf.join('');
    }
    /**
     * Sanitizes an opening element tag (if valid) and returns whether the element's contents should
     * be traversed. Element content must always be traversed (even if the element itself is not
     * valid/safe), unless the element is one of `SKIP_TRAVERSING_CONTENT_IF_INVALID_ELEMENTS`.
     *
     * @private
     * @param {?} element The element to sanitize.
     * @return {?} True if the element's contents should be traversed.
     */
    startElement(element) {
        /** @type {?} */
        const tagName = element.nodeName.toLowerCase();
        if (!VALID_ELEMENTS.hasOwnProperty(tagName)) {
            this.sanitizedSomething = true;
            return !SKIP_TRAVERSING_CONTENT_IF_INVALID_ELEMENTS.hasOwnProperty(tagName);
        }
        this.buf.push('<');
        this.buf.push(tagName);
        /** @type {?} */
        const elAttrs = element.attributes;
        for (let i = 0; i < elAttrs.length; i++) {
            /** @type {?} */
            const elAttr = elAttrs.item(i);
            /** @type {?} */
            const attrName = (/** @type {?} */ (elAttr)).name;
            /** @type {?} */
            const lower = attrName.toLowerCase();
            if (!VALID_ATTRS.hasOwnProperty(lower)) {
                this.sanitizedSomething = true;
                continue;
            }
            /** @type {?} */
            let value = (/** @type {?} */ (elAttr)).value;
            // TODO(martinprobst): Special case image URIs for data:image/...
            if (URI_ATTRS[lower])
                value = _sanitizeUrl(value);
            if (SRCSET_ATTRS[lower])
                value = sanitizeSrcset(value);
            this.buf.push(' ', attrName, '="', encodeEntities(value), '"');
        }
        this.buf.push('>');
        return true;
    }
    /**
     * @private
     * @param {?} current
     * @return {?}
     */
    endElement(current) {
        /** @type {?} */
        const tagName = current.nodeName.toLowerCase();
        if (VALID_ELEMENTS.hasOwnProperty(tagName) && !VOID_ELEMENTS.hasOwnProperty(tagName)) {
            this.buf.push('</');
            this.buf.push(tagName);
            this.buf.push('>');
        }
    }
    /**
     * @private
     * @param {?} chars
     * @return {?}
     */
    chars(chars) { this.buf.push(encodeEntities(chars)); }
    /**
     * @param {?} node
     * @param {?} nextNode
     * @return {?}
     */
    checkClobberedElement(node, nextNode) {
        if (nextNode &&
            (node.compareDocumentPosition(nextNode) &
                Node.DOCUMENT_POSITION_CONTAINED_BY) === Node.DOCUMENT_POSITION_CONTAINED_BY) {
            throw new Error(`Failed to sanitize html because the element is clobbered: ${((/** @type {?} */ (node))).outerHTML}`);
        }
        return nextNode;
    }
}
if (false) {
    /** @type {?} */
    SanitizingHtmlSerializer.prototype.sanitizedSomething;
    /**
     * @type {?}
     * @private
     */
    SanitizingHtmlSerializer.prototype.buf;
}
// Regular Expressions for parsing tags and attributes
/** @type {?} */
const SURROGATE_PAIR_REGEXP = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
// ! to ~ is the ASCII range.
/** @type {?} */
const NON_ALPHANUMERIC_REGEXP = /([^\#-~ |!])/g;
/**
 * Escapes all potentially dangerous characters, so that the
 * resulting string can be safely inserted into attribute or
 * element text.
 * @param {?} value
 * @return {?}
 */
function encodeEntities(value) {
    return value.replace(/&/g, '&amp;')
        .replace(SURROGATE_PAIR_REGEXP, function (match) {
        /** @type {?} */
        const hi = match.charCodeAt(0);
        /** @type {?} */
        const low = match.charCodeAt(1);
        return '&#' + (((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000) + ';';
    })
        .replace(NON_ALPHANUMERIC_REGEXP, function (match) { return '&#' + match.charCodeAt(0) + ';'; })
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
/** @type {?} */
let inertBodyHelper;
/**
 * Sanitizes the given unsafe, untrusted HTML fragment, and returns HTML text that is safe to add to
 * the DOM in a browser environment.
 * @param {?} defaultDoc
 * @param {?} unsafeHtmlInput
 * @return {?}
 */
export function _sanitizeHtml(defaultDoc, unsafeHtmlInput) {
    /** @type {?} */
    let inertBodyElement = null;
    try {
        inertBodyHelper = inertBodyHelper || new InertBodyHelper(defaultDoc);
        // Make sure unsafeHtml is actually a string (TypeScript types are not enforced at runtime).
        /** @type {?} */
        let unsafeHtml = unsafeHtmlInput ? String(unsafeHtmlInput) : '';
        inertBodyElement = inertBodyHelper.getInertBodyElement(unsafeHtml);
        // mXSS protection. Repeatedly parse the document to make sure it stabilizes, so that a browser
        // trying to auto-correct incorrect HTML cannot cause formerly inert HTML to become dangerous.
        /** @type {?} */
        let mXSSAttempts = 5;
        /** @type {?} */
        let parsedHtml = unsafeHtml;
        do {
            if (mXSSAttempts === 0) {
                throw new Error('Failed to sanitize html because the input is unstable');
            }
            mXSSAttempts--;
            unsafeHtml = parsedHtml;
            parsedHtml = (/** @type {?} */ (inertBodyElement)).innerHTML;
            inertBodyElement = inertBodyHelper.getInertBodyElement(unsafeHtml);
        } while (unsafeHtml !== parsedHtml);
        /** @type {?} */
        const sanitizer = new SanitizingHtmlSerializer();
        /** @type {?} */
        const safeHtml = sanitizer.sanitizeChildren((/** @type {?} */ (getTemplateContent((/** @type {?} */ (inertBodyElement))))) || inertBodyElement);
        if (isDevMode() && sanitizer.sanitizedSomething) {
            console.warn('WARNING: sanitizing HTML stripped some content, see http://g.co/ng/security#xss');
        }
        return safeHtml;
    }
    finally {
        // In case anything goes wrong, clear out inertElement to reset the entire DOM structure.
        if (inertBodyElement) {
            /** @type {?} */
            const parent = getTemplateContent(inertBodyElement) || inertBodyElement;
            while (parent.firstChild) {
                parent.removeChild(parent.firstChild);
            }
        }
    }
}
/**
 * @param {?} el
 * @return {?}
 */
export function getTemplateContent(el) {
    return 'content' in ((/** @type {?} */ (el))) && isTemplateElement(el) ?
        el.content :
        null;
}
/**
 * @param {?} el
 * @return {?}
 */
function isTemplateElement(el) {
    return el.nodeType === Node.ELEMENT_NODE && el.nodeName === 'TEMPLATE';
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHRtbF9zYW5pdGl6ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9zYW5pdGl6YXRpb24vaHRtbF9zYW5pdGl6ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDekMsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUM3QyxPQUFPLEVBQUMsWUFBWSxFQUFFLGNBQWMsRUFBQyxNQUFNLGlCQUFpQixDQUFDOzs7OztBQUU3RCxTQUFTLE1BQU0sQ0FBQyxJQUFZOztVQUNwQixHQUFHLEdBQTJCLEVBQUU7SUFDdEMsS0FBSyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQztRQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7SUFDL0MsT0FBTyxHQUFHLENBQUM7QUFDYixDQUFDOzs7OztBQUVELFNBQVMsS0FBSyxDQUFDLEdBQUcsSUFBOEI7O1VBQ3hDLEdBQUcsR0FBMkIsRUFBRTtJQUN0QyxLQUFLLE1BQU0sQ0FBQyxJQUFJLElBQUksRUFBRTtRQUNwQixLQUFLLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNqQixJQUFJLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO2dCQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7U0FDeEM7S0FDRjtJQUNELE9BQU8sR0FBRyxDQUFDO0FBQ2IsQ0FBQzs7Ozs7OztNQVFLLGFBQWEsR0FBRyxNQUFNLENBQUMsd0JBQXdCLENBQUM7Ozs7TUFJaEQsK0JBQStCLEdBQUcsTUFBTSxDQUFDLGdEQUFnRCxDQUFDOztNQUMxRixnQ0FBZ0MsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDOztNQUNsRCx5QkFBeUIsR0FDM0IsS0FBSyxDQUFDLGdD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QUFLLElBQUksQ0FBQyxZQUFZLElBQUksRUFBRSxDQUFDLFFBQVEsS0FBSyxVQUFVLENBQUM7QUFDekUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtpc0Rldk1vZGV9IGZyb20gJy4uL2lzX2Rldl9tb2RlJztcbmltcG9ydCB7SW5lcnRCb2R5SGVscGVyfSBmcm9tICcuL2luZXJ0X2JvZHknO1xuaW1wb3J0IHtfc2FuaXRpemVVcmwsIHNhbml0aXplU3Jjc2V0fSBmcm9tICcuL3VybF9zYW5pdGl6ZXInO1xuXG5mdW5jdGlvbiB0YWdTZXQodGFnczogc3RyaW5nKToge1trOiBzdHJpbmddOiBib29sZWFufSB7XG4gIGNvbnN0IHJlczoge1trOiBzdHJpbmddOiBib29sZWFufSA9IHt9O1xuICBmb3IgKGNvbnN0IHQgb2YgdGFncy5zcGxpdCgnLCcpKSByZXNbdF0gPSB0cnVlO1xuICByZXR1cm4gcmVzO1xufVxuXG5mdW5jdGlvbiBtZXJnZSguLi5zZXRzOiB7W2s6IHN0cmluZ106IGJvb2xlYW59W10pOiB7W2s6IHN0cmluZ106IGJvb2xlYW59IHtcbiAgY29uc3QgcmVzOiB7W2s6IHN0cmluZ106IGJvb2xlYW59ID0ge307XG4gIGZvciAoY29uc3QgcyBvZiBzZXRzKSB7XG4gICAgZm9yIChjb25zdCB2IGluIHMpIHtcbiAgICAgIGlmIChzLmhhc093blByb3BlcnR5KHYpKSByZXNbdl0gPSB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzO1xufVxuXG4vLyBHb29kIHNvdXJjZSBvZiBpbmZvIGFib3V0IGVsZW1lbnRzIGFuZCBhdHRyaWJ1dGVzXG4vLyBodHRwOi8vZGV2LnczLm9yZy9odG1sNS9zcGVjL092ZXJ2aWV3Lmh0bWwjc2VtYW50aWNzXG4vLyBodHRwOi8vc2ltb24uaHRtbDUub3JnL2h0bWwtZWxlbWVudHNcblxuLy8gU2FmZSBWb2lkIEVsZW1lbnRzIC0gSFRNTDVcbi8vIGh0dHA6Ly9kZXYudzMub3JnL2h0bWw1L3NwZWMvT3ZlcnZpZXcuaHRtbCN2b2lkLWVsZW1lbnRzXG5jb25zdCBWT0lEX0VMRU1FTlRTID0gdGFnU2V0KCdhcmVhLGJyLGNvbCxocixpbWcsd2JyJyk7XG5cbi8vIEVsZW1lbnRzIHRoYXQgeW91IGNhbiwgaW50ZW50aW9uYWxseSwgbGVhdmUgb3BlbiAoYW5kIHdoaWNoIGNsb3NlIHRoZW1zZWx2ZXMpXG4vLyBodHRwOi8vZGV2LnczLm9yZy9odG1sNS9zcGVjL092ZXJ2aWV3Lmh0bWwjb3B0aW9uYWwtdGFnc1xuY29uc3QgT1BUSU9OQUxfRU5EX1RBR19CTE9DS19FTEVNRU5UUyA9IHRhZ1NldCgnY29sZ3JvdXAsZGQsZHQsbGkscCx0Ym9keSx0ZCx0Zm9vdCx0aCx0aGVhZCx0cicpO1xuY29uc3QgT1BUSU9OQUxfRU5EX1RBR19JTkxJTkVfRUxFTUVOVFMgPSB0YWdTZXQoJ3JwLHJ0Jyk7XG5jb25zdCBPUFRJT05BTF9FTkRfVEFHX0VMRU1FTlRTID1cbiAgICBtZXJnZShPUFRJT05BTF9FTkRfVEFHX0lOTElORV9FTEVNRU5UUywgT1BUSU9OQUxfRU5EX1RBR19CTE9DS19FTEVNRU5UUyk7XG5cbi8vIFNhZmUgQmxvY2sgRWxlbWVudHMgLSBIVE1MNVxuY29uc3QgQkxPQ0tfRUxFTUVOVFMgPSBtZXJnZShcbiAgICBPUFRJT05BTF9FTkRfVEFHX0JMT0NLX0VMRU1FTlRTLFxuICAgIHRhZ1NldChcbiAgICAgICAgJ2FkZHJlc3MsYXJ0aWNsZSwnICtcbiAgICAgICAgJ2FzaWRlLGJsb2NrcXVvdGUsY2FwdGlvbixjZW50ZXIsZGVsLGRldGFpbHMsZGlhbG9nLGRpcixkaXYsZGwsZmlndXJlLGZpZ2NhcHRpb24sZm9vdGVyLGgxLGgyLGgzLGg0LGg1LCcgK1xuICAgICAgICAnaDYsaGVhZGVyLGhncm91cCxocixpbnMsbWFpbixtYXAsbWVudSxuYXYsb2wscHJlLHNlY3Rpb24sc3VtbWFyeSx0YWJsZSx1bCcpKTtcblxuLy8gSW5saW5lIEVsZW1lbnRzIC0gSFRNTDVcbmNvbnN0IElOTElORV9FTEVNRU5UUyA9IG1lcmdlKFxuICAgIE9QVElPTkFMX0VORF9UQUdfSU5MSU5FX0VMRU1FTlRTLFxuICAgIHRhZ1NldChcbiAgICAgICAgJ2EsYWJicixhY3JvbnltLGF1ZGlvLGIsJyArXG4gICAgICAgICdiZGksYmRvLGJpZyxicixjaXRlLGNvZGUsZGVsLGRmbixlbSxmb250LGksaW1nLGlucyxrYmQsbGFiZWwsbWFwLG1hcmsscGljdHVyZSxxLHJ1YnkscnAscnQscywnICtcbiAgICAgICAgJ3NhbXAsc21hbGwsc291cmNlLHNwYW4sc3RyaWtlLHN0cm9uZyxzdWIsc3VwLHRpbWUsdHJhY2ssdHQsdSx2YXIsdmlkZW8nKSk7XG5cbmV4cG9ydCBjb25zdCBWQUxJRF9FTEVNRU5UUyA9XG4gICAgbWVyZ2UoVk9JRF9FTEVNRU5UUywgQkxPQ0tfRUxFTUVOVFMsIElOTElORV9FTEVNRU5UUywgT1BUSU9OQUxfRU5EX1RBR19FTEVNRU5UUyk7XG5cbi8vIEF0dHJpYnV0ZXMgdGhhdCBoYXZlIGhyZWYgYW5kIGhlbmNlIG5lZWQgdG8gYmUgc2FuaXRpemVkXG5leHBvcnQgY29uc3QgVVJJX0FUVFJTID0gdGFnU2V0KCdiYWNrZ3JvdW5kLGNpdGUsaHJlZixpdGVtdHlwZSxsb25nZGVzYyxwb3N0ZXIsc3JjLHhsaW5rOmhyZWYnKTtcblxuLy8gQXR0cmlidXRlcyB0aGF0IGhhdmUgc3BlY2lhbCBocmVmIHNldCBoZW5jZSBuZWVkIHRvIGJlIHNhbml0aXplZFxuZXhwb3J0IGNvbnN0IFNSQ1NFVF9BVFRSUyA9IHRhZ1NldCgnc3Jjc2V0Jyk7XG5cbmNvbnN0IEhUTUxfQVRUUlMgPSB0YWdTZXQoXG4gICAgJ2FiYnIsYWNjZXNza2V5LGFsaWduLGFsdCxhdXRvcGxheSxheGlzLGJnY29sb3IsYm9yZGVyLGNlbGxwYWRkaW5nLGNlbGxzcGFjaW5nLGNsYXNzLGNsZWFyLGNvbG9yLGNvbHMsY29sc3BhbiwnICtcbiAgICAnY29tcGFjdCxjb250cm9scyxjb29yZHMsZGF0ZXRpbWUsZGVmYXVsdCxkaXIsZG93bmxvYWQsZmFjZSxoZWFkZXJzLGhlaWdodCxoaWRkZW4saHJlZmxhbmcsaHNwYWNlLCcgK1xuICAgICdpc21hcCxpdGVtc2NvcGUsaXRlbXByb3Asa2luZCxsYWJlbCxsYW5nLGxhbmd1YWdlLGxvb3AsbWVkaWEsbXV0ZWQsbm9ocmVmLG5vd3JhcCxvcGVuLHByZWxvYWQscmVsLHJldixyb2xlLHJvd3Mscm93c3BhbixydWxlcywnICtcbiAgICAnc2NvcGUsc2Nyb2xsaW5nLHNoYXBlLHNpemUsc2l6ZXMsc3BhbixzcmNsYW5nLHN0YXJ0LHN1bW1hcnksdGFiaW5kZXgsdGFyZ2V0LHRpdGxlLHRyYW5zbGF0ZSx0eXBlLHVzZW1hcCwnICtcbiAgICAndmFsaWduLHZhbHVlLHZzcGFjZSx3aWR0aCcpO1xuXG4vLyBOQjogVGhpcyBjdXJyZW50bHkgY29uc2Npb3VzbHkgZG9lc24ndCBzdXBwb3J0IFNWRy4gU1ZHIHNhbml0aXphdGlvbiBoYXMgaGFkIHNldmVyYWwgc2VjdXJpdHlcbi8vIGlzc3VlcyBpbiB0aGUgcGFzdCwgc28gaXQgc2VlbXMgc2FmZXIgdG8gbGVhdmUgaXQgb3V0IGlmIHBvc3NpYmxlLiBJZiBzdXBwb3J0IGZvciBiaW5kaW5nIFNWRyB2aWFcbi8vIGlubmVySFRNTCBpcyByZXF1aXJlZCwgU1ZHIGF0dHJpYnV0ZXMgc2hvdWxkIGJlIGFkZGVkIGhlcmUuXG5cbi8vIE5COiBTYW5pdGl6YXRpb24gZG9lcyBub3QgYWxsb3cgPGZvcm0+IGVsZW1lbnRzIG9yIG90aGVyIGFjdGl2ZSBlbGVtZW50cyAoPGJ1dHRvbj4gZXRjKS4gVGhvc2Vcbi8vIGNhbiBiZSBzYW5pdGl6ZWQsIGJ1dCB0aGV5IGluY3JlYXNlIHNlY3VyaXR5IHN1cmZhY2UgYXJlYSB3aXRob3V0IGEgbGVnaXRpbWF0ZSB1c2UgY2FzZSwgc28gdGhleVxuLy8gYXJlIGxlZnQgb3V0IGhlcmUuXG5cbmV4cG9ydCBjb25zdCBWQUxJRF9BVFRSUyA9IG1lcmdlKFVSSV9BVFRSUywgU1JDU0VUX0FUVFJTLCBIVE1MX0FUVFJTKTtcblxuLy8gRWxlbWVudHMgd2hvc2UgY29udGVudCBzaG91bGQgbm90IGJlIHRyYXZlcnNlZC9wcmVzZXJ2ZWQsIGlmIHRoZSBlbGVtZW50cyB0aGVtc2VsdmVzIGFyZSBpbnZhbGlkLlxuLy9cbi8vIFR5cGljYWxseSwgYDxpbnZhbGlkPlNvbWUgY29udGVudDwvaW52YWxpZD5gIHdvdWxkIHRyYXZlcnNlIChhbmQgaW4gdGhpcyBjYXNlIHByZXNlcnZlKVxuLy8gYFNvbWUgY29udGVudGAsIGJ1dCBzdHJpcCBgaW52YWxpZC1lbGVtZW50YCBvcGVuaW5nL2Nsb3NpbmcgdGFncy4gRm9yIHNvbWUgZWxlbWVudHMsIHRob3VnaCwgd2Vcbi8vIGRvbid0IHdhbnQgdG8gcHJlc2VydmUgdGhlIGNvbnRlbnQsIGlmIHRoZSBlbGVtZW50cyB0aGVtc2VsdmVzIGFyZSBnb2luZyB0byBiZSByZW1vdmVkLlxuY29uc3QgU0tJUF9UUkFWRVJTSU5HX0NPTlRFTlRfSUZfSU5WQUxJRF9FTEVNRU5UUyA9IHRhZ1NldCgnc2NyaXB0LHN0eWxlLHRlbXBsYXRlJyk7XG5cbi8qKlxuICogU2FuaXRpemluZ0h0bWxTZXJpYWxpemVyIHNlcmlhbGl6ZXMgYSBET00gZnJhZ21lbnQsIHN0cmlwcGluZyBvdXQgYW55IHVuc2FmZSBlbGVtZW50cyBhbmQgdW5zYWZlXG4gKiBhdHRyaWJ1dGVzLlxuICovXG5jbGFzcyBTYW5pdGl6aW5nSHRtbFNlcmlhbGl6ZXIge1xuICAvLyBFeHBsaWNpdGx5IHRyYWNrIGlmIHNvbWV0aGluZyB3YXMgc3RyaXBwZWQsIHRvIGF2b2lkIGFjY2lkZW50YWxseSB3YXJuaW5nIG9mIHNhbml0aXphdGlvbiBqdXN0XG4gIC8vIGJlY2F1c2UgY2hhcmFjdGVycyB3ZXJlIHJlLWVuY29kZWQuXG4gIHB1YmxpYyBzYW5pdGl6ZWRTb21ldGhpbmcgPSBmYWxzZTtcbiAgcHJpdmF0ZSBidWY6IHN0cmluZ1tdID0gW107XG5cbiAgc2FuaXRpemVDaGlsZHJlbihlbDogRWxlbWVudCk6IHN0cmluZyB7XG4gICAgLy8gVGhpcyBjYW5ub3QgdXNlIGEgVHJlZVdhbGtlciwgYXMgaXQgaGFzIHRvIHJ1biBvbiBBbmd1bGFyJ3MgdmFyaW91cyBET00gYWRhcHRlcnMuXG4gICAgLy8gSG93ZXZlciB0aGlzIGNvZGUgbmV2ZXIgYWNjZXNzZXMgcHJvcGVydGllcyBvZmYgb2YgYGRvY3VtZW50YCBiZWZvcmUgZGVsZXRpbmcgaXRzIGNvbnRlbnRzXG4gICAgLy8gYWdhaW4sIHNvIGl0IHNob3VsZG4ndCBiZSB2dWxuZXJhYmxlIHRvIERPTSBjbG9iYmVyaW5nLlxuICAgIGxldCBjdXJyZW50OiBOb2RlID0gZWwuZmlyc3RDaGlsZCAhO1xuICAgIGxldCB0cmF2ZXJzZUNvbnRlbnQgPSB0cnVlO1xuICAgIHdoaWxlIChjdXJyZW50KSB7XG4gICAgICBpZiAoY3VycmVudC5ub2RlVHlwZSA9PT0gTm9kZS5FTEVNRU5UX05PREUpIHtcbiAgICAgICAgdHJhdmVyc2VDb250ZW50ID0gdGhpcy5zdGFydEVsZW1lbnQoY3VycmVudCBhcyBFbGVtZW50KTtcbiAgICAgIH0gZWxzZSBpZiAoY3VycmVudC5ub2RlVHlwZSA9PT0gTm9kZS5URVhUX05PREUpIHtcbiAgICAgICAgdGhpcy5jaGFycyhjdXJyZW50Lm5vZGVWYWx1ZSAhKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFN0cmlwIG5vbi1lbGVtZW50LCBub24tdGV4dCBub2Rlcy5cbiAgICAgICAgdGhpcy5zYW5pdGl6ZWRTb21ldGhpbmcgPSB0cnVlO1xuICAgICAgfVxuICAgICAgaWYgKHRyYXZlcnNlQ29udGVudCAmJiBjdXJyZW50LmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgY3VycmVudCA9IGN1cnJlbnQuZmlyc3RDaGlsZCAhO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIHdoaWxlIChjdXJyZW50KSB7XG4gICAgICAgIC8vIExlYXZpbmcgdGhlIGVsZW1lbnQuIFdhbGsgdXAgYW5kIHRvIHRoZSByaWdodCwgY2xvc2luZyB0YWdzIGFzIHdlIGdvLlxuICAgICAgICBpZiAoY3VycmVudC5ub2RlVHlwZSA9PT0gTm9kZS5FTEVNRU5UX05PREUpIHtcbiAgICAgICAgICB0aGlzLmVuZEVsZW1lbnQoY3VycmVudCBhcyBFbGVtZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBuZXh0ID0gdGhpcy5jaGVja0Nsb2JiZXJlZEVsZW1lbnQoY3VycmVudCwgY3VycmVudC5uZXh0U2libGluZyAhKTtcblxuICAgICAgICBpZiAobmV4dCkge1xuICAgICAgICAgIGN1cnJlbnQgPSBuZXh0O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgY3VycmVudCA9IHRoaXMuY2hlY2tDbG9iYmVyZWRFbGVtZW50KGN1cnJlbnQsIGN1cnJlbnQucGFyZW50Tm9kZSAhKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuYnVmLmpvaW4oJycpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNhbml0aXplcyBhbiBvcGVuaW5nIGVsZW1lbnQgdGFnIChpZiB2YWxpZCkgYW5kIHJldHVybnMgd2hldGhlciB0aGUgZWxlbWVudCdzIGNvbnRlbnRzIHNob3VsZFxuICAgKiBiZSB0cmF2ZXJzZWQuIEVsZW1lbnQgY29udGVudCBtdXN0IGFsd2F5cyBiZSB0cmF2ZXJzZWQgKGV2ZW4gaWYgdGhlIGVsZW1lbnQgaXRzZWxmIGlzIG5vdFxuICAgKiB2YWxpZC9zYWZlKSwgdW5sZXNzIHRoZSBlbGVtZW50IGlzIG9uZSBvZiBgU0tJUF9UUkFWRVJTSU5HX0NPTlRFTlRfSUZfSU5WQUxJRF9FTEVNRU5UU2AuXG4gICAqXG4gICAqIEBwYXJhbSBlbGVtZW50IFRoZSBlbGVtZW50IHRvIHNhbml0aXplLlxuICAgKiBAcmV0dXJuIFRydWUgaWYgdGhlIGVsZW1lbnQncyBjb250ZW50cyBzaG91bGQgYmUgdHJhdmVyc2VkLlxuICAgKi9cbiAgcHJpdmF0ZSBzdGFydEVsZW1lbnQoZWxlbWVudDogRWxlbWVudCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHRhZ05hbWUgPSBlbGVtZW50Lm5vZGVOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKCFWQUxJRF9FTEVNRU5UUy5oYXNPd25Qcm9wZXJ0eSh0YWdOYW1lKSkge1xuICAgICAgdGhpcy5zYW5pdGl6ZWRTb21ldGhpbmcgPSB0cnVlO1xuICAgICAgcmV0dXJuICFTS0lQX1RSQVZFUlNJTkdfQ09OVEVOVF9JRl9JTlZBTElEX0VMRU1FTlRTLmhhc093blByb3BlcnR5KHRhZ05hbWUpO1xuICAgIH1cbiAgICB0aGlzLmJ1Zi5wdXNoKCc8Jyk7XG4gICAgdGhpcy5idWYucHVzaCh0YWdOYW1lKTtcbiAgICBjb25zdCBlbEF0dHJzID0gZWxlbWVudC5hdHRyaWJ1dGVzO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZWxBdHRycy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgZWxBdHRyID0gZWxBdHRycy5pdGVtKGkpO1xuICAgICAgY29uc3QgYXR0ck5hbWUgPSBlbEF0dHIgIS5uYW1lO1xuICAgICAgY29uc3QgbG93ZXIgPSBhdHRyTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgaWYgKCFWQUxJRF9BVFRSUy5oYXNPd25Qcm9wZXJ0eShsb3dlcikpIHtcbiAgICAgICAgdGhpcy5zYW5pdGl6ZWRTb21ldGhpbmcgPSB0cnVlO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGxldCB2YWx1ZSA9IGVsQXR0ciAhLnZhbHVlO1xuICAgICAgLy8gVE9ETyhtYXJ0aW5wcm9ic3QpOiBTcGVjaWFsIGNhc2UgaW1hZ2UgVVJJcyBmb3IgZGF0YTppbWFnZS8uLi5cbiAgICAgIGlmIChVUklfQVRUUlNbbG93ZXJdKSB2YWx1ZSA9IF9zYW5pdGl6ZVVybCh2YWx1ZSk7XG4gICAgICBpZiAoU1JDU0VUX0FUVFJTW2xvd2VyXSkgdmFsdWUgPSBzYW5pdGl6ZVNyY3NldCh2YWx1ZSk7XG4gICAgICB0aGlzLmJ1Zi5wdXNoKCcgJywgYXR0ck5hbWUsICc9XCInLCBlbmNvZGVFbnRpdGllcyh2YWx1ZSksICdcIicpO1xuICAgIH1cbiAgICB0aGlzLmJ1Zi5wdXNoKCc+Jyk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBwcml2YXRlIGVuZEVsZW1lbnQoY3VycmVudDogRWxlbWVudCkge1xuICAgIGNvbnN0IHRhZ05hbWUgPSBjdXJyZW50Lm5vZGVOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKFZBTElEX0VMRU1FTlRTLmhhc093blByb3BlcnR5KHRhZ05hbWUpICYmICFWT0lEX0VMRU1FTlRTLmhhc093blByb3BlcnR5KHRhZ05hbWUpKSB7XG4gICAgICB0aGlzLmJ1Zi5wdXNoKCc8LycpO1xuICAgICAgdGhpcy5idWYucHVzaCh0YWdOYW1lKTtcbiAgICAgIHRoaXMuYnVmLnB1c2goJz4nKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNoYXJzKGNoYXJzOiBzdHJpbmcpIHsgdGhpcy5idWYucHVzaChlbmNvZGVFbnRpdGllcyhjaGFycykpOyB9XG5cbiAgY2hlY2tDbG9iYmVyZWRFbGVtZW50KG5vZGU6IE5vZGUsIG5leHROb2RlOiBOb2RlKTogTm9kZSB7XG4gICAgaWYgKG5leHROb2RlICYmXG4gICAgICAgIChub2RlLmNvbXBhcmVEb2N1bWVudFBvc2l0aW9uKG5leHROb2RlKSAmXG4gICAgICAgICBOb2RlLkRPQ1VNRU5UX1BPU0lUSU9OX0NPTlRBSU5FRF9CWSkgPT09wqBOb2RlLkRPQ1VNRU5UX1BPU0lUSU9OX0NPTlRBSU5FRF9CWSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBGYWlsZWQgdG8gc2FuaXRpemUgaHRtbCBiZWNhdXNlIHRoZSBlbGVtZW50IGlzIGNsb2JiZXJlZDogJHsobm9kZSBhcyBFbGVtZW50KS5vdXRlckhUTUx9YCk7XG4gICAgfVxuICAgIHJldHVybiBuZXh0Tm9kZTtcbiAgfVxufVxuXG4vLyBSZWd1bGFyIEV4cHJlc3Npb25zIGZvciBwYXJzaW5nIHRhZ3MgYW5kIGF0dHJpYnV0ZXNcbmNvbnN0IFNVUlJPR0FURV9QQUlSX1JFR0VYUCA9IC9bXFx1RDgwMC1cXHVEQkZGXVtcXHVEQzAwLVxcdURGRkZdL2c7XG4vLyAhIHRvIH4gaXMgdGhlIEFTQ0lJIHJhbmdlLlxuY29uc3QgTk9OX0FMUEhBTlVNRVJJQ19SRUdFWFAgPSAvKFteXFwjLX4gfCFdKS9nO1xuXG4vKipcbiAqIEVzY2FwZXMgYWxsIHBvdGVudGlhbGx5IGRhbmdlcm91cyBjaGFyYWN0ZXJzLCBzbyB0aGF0IHRoZVxuICogcmVzdWx0aW5nIHN0cmluZyBjYW4gYmUgc2FmZWx5IGluc2VydGVkIGludG8gYXR0cmlidXRlIG9yXG4gKiBlbGVtZW50IHRleHQuXG4gKiBAcGFyYW0gdmFsdWVcbiAqL1xuZnVuY3Rpb24gZW5jb2RlRW50aXRpZXModmFsdWU6IHN0cmluZykge1xuICByZXR1cm4gdmFsdWUucmVwbGFjZSgvJi9nLCAnJmFtcDsnKVxuICAgICAgLnJlcGxhY2UoXG4gICAgICAgICAgU1VSUk9HQVRFX1BBSVJfUkVHRVhQLFxuICAgICAgICAgIGZ1bmN0aW9uKG1hdGNoOiBzdHJpbmcpIHtcbiAgICAgICAgICAgIGNvbnN0IGhpID0gbWF0Y2guY2hhckNvZGVBdCgwKTtcbiAgICAgICAgICAgIGNvbnN0IGxvdyA9IG1hdGNoLmNoYXJDb2RlQXQoMSk7XG4gICAgICAgICAgICByZXR1cm4gJyYjJyArICgoKGhpIC0gMHhEODAwKSAqIDB4NDAwKSArIChsb3cgLSAweERDMDApICsgMHgxMDAwMCkgKyAnOyc7XG4gICAgICAgICAgfSlcbiAgICAgIC5yZXBsYWNlKFxuICAgICAgICAgIE5PTl9BTFBIQU5VTUVSSUNfUkVHRVhQLFxuICAgICAgICAgIGZ1bmN0aW9uKG1hdGNoOiBzdHJpbmcpIHsgcmV0dXJuICcmIycgKyBtYXRjaC5jaGFyQ29kZUF0KDApICsgJzsnOyB9KVxuICAgICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKTtcbn1cblxubGV0IGluZXJ0Qm9keUhlbHBlcjogSW5lcnRCb2R5SGVscGVyO1xuXG4vKipcbiAqIFNhbml0aXplcyB0aGUgZ2l2ZW4gdW5zYWZlLCB1bnRydXN0ZWQgSFRNTCBmcmFnbWVudCwgYW5kIHJldHVybnMgSFRNTCB0ZXh0IHRoYXQgaXMgc2FmZSB0byBhZGQgdG9cbiAqIHRoZSBET00gaW4gYSBicm93c2VyIGVudmlyb25tZW50LlxuICovXG5leHBvcnQgZnVuY3Rpb24gX3Nhbml0aXplSHRtbChkZWZhdWx0RG9jOiBhbnksIHVuc2FmZUh0bWxJbnB1dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgbGV0IGluZXJ0Qm9keUVsZW1lbnQ6IEhUTUxFbGVtZW50fG51bGwgPSBudWxsO1xuICB0cnkge1xuICAgIGluZXJ0Qm9keUhlbHBlciA9IGluZXJ0Qm9keUhlbHBlciB8fCBuZXcgSW5lcnRCb2R5SGVscGVyKGRlZmF1bHREb2MpO1xuICAgIC8vIE1ha2Ugc3VyZSB1bnNhZmVIdG1sIGlzIGFjdHVhbGx5IGEgc3RyaW5nIChUeXBlU2NyaXB0IHR5cGVzIGFyZSBub3QgZW5mb3JjZWQgYXQgcnVudGltZSkuXG4gICAgbGV0IHVuc2FmZUh0bWwgPSB1bnNhZmVIdG1sSW5wdXQgPyBTdHJpbmcodW5zYWZlSHRtbElucHV0KSA6ICcnO1xuICAgIGluZXJ0Qm9keUVsZW1lbnQgPSBpbmVydEJvZHlIZWxwZXIuZ2V0SW5lcnRCb2R5RWxlbWVudCh1bnNhZmVIdG1sKTtcblxuICAgIC8vIG1YU1MgcHJvdGVjdGlvbi4gUmVwZWF0ZWRseSBwYXJzZSB0aGUgZG9jdW1lbnQgdG8gbWFrZSBzdXJlIGl0IHN0YWJpbGl6ZXMsIHNvIHRoYXQgYSBicm93c2VyXG4gICAgLy8gdHJ5aW5nIHRvIGF1dG8tY29ycmVjdCBpbmNvcnJlY3QgSFRNTCBjYW5ub3QgY2F1c2UgZm9ybWVybHkgaW5lcnQgSFRNTCB0byBiZWNvbWUgZGFuZ2Vyb3VzLlxuICAgIGxldCBtWFNTQXR0ZW1wdHMgPSA1O1xuICAgIGxldCBwYXJzZWRIdG1sID0gdW5zYWZlSHRtbDtcblxuICAgIGRvIHtcbiAgICAgIGlmIChtWFNTQXR0ZW1wdHMgPT09IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gc2FuaXRpemUgaHRtbCBiZWNhdXNlIHRoZSBpbnB1dCBpcyB1bnN0YWJsZScpO1xuICAgICAgfVxuICAgICAgbVhTU0F0dGVtcHRzLS07XG5cbiAgICAgIHVuc2FmZUh0bWwgPSBwYXJzZWRIdG1sO1xuICAgICAgcGFyc2VkSHRtbCA9IGluZXJ0Qm9keUVsZW1lbnQgIS5pbm5lckhUTUw7XG4gICAgICBpbmVydEJvZHlFbGVtZW50ID0gaW5lcnRCb2R5SGVscGVyLmdldEluZXJ0Qm9keUVsZW1lbnQodW5zYWZlSHRtbCk7XG4gICAgfSB3aGlsZSAodW5zYWZlSHRtbCAhPT0gcGFyc2VkSHRtbCk7XG5cbiAgICBjb25zdCBzYW5pdGl6ZXIgPSBuZXcgU2FuaXRpemluZ0h0bWxTZXJpYWxpemVyKCk7XG4gICAgY29uc3Qgc2FmZUh0bWwgPSBzYW5pdGl6ZXIuc2FuaXRpemVDaGlsZHJlbihcbiAgICAgICAgZ2V0VGVtcGxhdGVDb250ZW50KGluZXJ0Qm9keUVsZW1lbnQgISkgYXMgRWxlbWVudCB8fCBpbmVydEJvZHlFbGVtZW50KTtcbiAgICBpZiAoaXNEZXZNb2RlKCkgJiYgc2FuaXRpemVyLnNhbml0aXplZFNvbWV0aGluZykge1xuICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICdXQVJOSU5HOiBzYW5pdGl6aW5nIEhUTUwgc3RyaXBwZWQgc29tZSBjb250ZW50LCBzZWUgaHR0cDovL2cuY28vbmcvc2VjdXJpdHkjeHNzJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNhZmVIdG1sO1xuICB9IGZpbmFsbHkge1xuICAgIC8vIEluIGNhc2UgYW55dGhpbmcgZ29lcyB3cm9uZywgY2xlYXIgb3V0IGluZXJ0RWxlbWVudCB0byByZXNldCB0aGUgZW50aXJlIERPTSBzdHJ1Y3R1cmUuXG4gICAgaWYgKGluZXJ0Qm9keUVsZW1lbnQpIHtcbiAgICAgIGNvbnN0IHBhcmVudCA9IGdldFRlbXBsYXRlQ29udGVudChpbmVydEJvZHlFbGVtZW50KSB8fCBpbmVydEJvZHlFbGVtZW50O1xuICAgICAgd2hpbGUgKHBhcmVudC5maXJzdENoaWxkKSB7XG4gICAgICAgIHBhcmVudC5yZW1vdmVDaGlsZChwYXJlbnQuZmlyc3RDaGlsZCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUZW1wbGF0ZUNvbnRlbnQoZWw6IE5vZGUpOiBOb2RlfG51bGwge1xuICByZXR1cm4gJ2NvbnRlbnQnIGluIChlbCBhcyBhbnkgLyoqIE1pY3Jvc29mdC9UeXBlU2NyaXB0IzIxNTE3ICovKSAmJiBpc1RlbXBsYXRlRWxlbWVudChlbCkgP1xuICAgICAgZWwuY29udGVudCA6XG4gICAgICBudWxsO1xufVxuZnVuY3Rpb24gaXNUZW1wbGF0ZUVsZW1lbnQoZWw6IE5vZGUpOiBlbCBpcyBIVE1MVGVtcGxhdGVFbGVtZW50IHtcbiAgcmV0dXJuIGVsLm5vZGVUeXBlID09PSBOb2RlLkVMRU1FTlRfTk9ERSAmJiBlbC5ub2RlTmFtZSA9PT0gJ1RFTVBMQVRFJztcbn1cbiJdfQ==