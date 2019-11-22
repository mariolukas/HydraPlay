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
import { dashCaseToCamelCase } from '../../util';
import { AnimationStyleNormalizer } from './animation_style_normalizer';
export class WebAnimationsStyleNormalizer extends AnimationStyleNormalizer {
    /**
     * @param {?} propertyName
     * @param {?} errors
     * @return {?}
     */
    normalizePropertyName(propertyName, errors) {
        return dashCaseToCamelCase(propertyName);
    }
    /**
     * @param {?} userProvidedProperty
     * @param {?} normalizedProperty
     * @param {?} value
     * @param {?} errors
     * @return {?}
     */
    normalizeStyleValue(userProvidedProperty, normalizedProperty, value, errors) {
        /** @type {?} */
        let unit = '';
        /** @type {?} */
        const strVal = value.toString().trim();
        if (DIMENSIONAL_PROP_MAP[normalizedProperty] && value !== 0 && value !== '0') {
            if (typeof value === 'number') {
                unit = 'px';
            }
            else {
                /** @type {?} */
                const valAndSuffixMatch = value.match(/^[+-]?[\d\.]+([a-z]*)$/);
                if (valAndSuffixMatch && valAndSuffixMatch[1].length == 0) {
                    errors.push(`Please provide a CSS unit value for ${userProvidedProperty}:${value}`);
                }
            }
        }
        return strVal + unit;
    }
}
/** @type {?} */
const DIMENSIONAL_PROP_MAP = makeBooleanMap('width,height,minWidth,minHeight,maxWidth,maxHeight,left,top,bottom,right,fontSize,outlineWidth,outlineOffset,paddingTop,paddingLeft,paddingBottom,paddingRight,marginTop,marginLeft,marginBottom,marginRight,borderRadius,borderWidth,borderTopWidth,borderLeftWidth,borderRightWidth,borderBottomWidth,textIndent,perspective'
    .split(','));
/**
 * @param {?} keys
 * @return {?}
 */
function makeBooleanMap(keys) {
    /** @type {?} */
    const map = {};
    keys.forEach(key => map[key] = true);
    return map;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViX2FuaW1hdGlvbnNfc3R5bGVfbm9ybWFsaXplci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuaW1hdGlvbnMvYnJvd3Nlci9zcmMvZHNsL3N0eWxlX25vcm1hbGl6YXRpb24vd2ViX2FuaW1hdGlvbnNfc3R5bGVfbm9ybWFsaXplci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQU9BLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLFlBQVksQ0FBQztBQUUvQyxPQUFPLEVBQUMsd0JBQXdCLEVBQUMsTUFBTSw4QkFBOEIsQ0FBQztBQUV0RSxNQUFNLE9BQU8sNEJBQTZCLFNBQVEsd0JBQXdCOzs7Ozs7SUFDeEUscUJBQXFCLENBQUMsWUFBb0IsRUFBRSxNQUFnQjtRQUMxRCxPQUFPLG1CQUFtQixDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzNDLENBQUM7Ozs7Ozs7O0lBRUQsbUJBQW1CLENBQ2Ysb0JBQTRCLEVBQUUsa0JBQTBCLEVBQUUsS0FBb0IsRUFDOUUsTUFBZ0I7O1lBQ2QsSUFBSSxHQUFXLEVBQUU7O2NBQ2YsTUFBTSxHQUFHLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLEVBQUU7UUFFdEMsSUFBSSxvQkFBb0IsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEtBQUssS0FBSyxDQUFDLElBQUksS0FBSyxLQUFLLEdBQUcsRUFBRTtZQUM1RSxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTtnQkFDN0IsSUFBSSxHQUFHLElBQUksQ0FBQzthQUNiO2lCQUFNOztzQkFDQyxpQkFBaUIsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLHdCQUF3QixDQUFDO2dCQUMvRCxJQUFJLGlCQUFpQixJQUFJLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7b0JBQ3pELE1BQU0sQ0FBQyxJQUFJLENBQUMsdUNBQXVDLG9CQUFvQixJQUFJLEtBQUssRUFBRSxDQUFDLENBQUM7aUJBQ3JGO2FBQ0Y7U0FDRjtRQUNELE9BQU8sTUFBTSxHQUFHLElBQUksQ0FBQztJQUN2QixDQUFDO0NBQ0Y7O01BRUssb0JBQW9CLEdBQUcsY0FBYyxDQUN2QyxnVUFBZ1U7S0FDM1QsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDOzs7OztBQUVwQixTQUFTLGNBQWMsQ0FBQyxJQUFjOztVQUM5QixHQUFHLEdBQTZCLEVBQUU7SUFDeEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUNyQyxPQUFPLEdBQUcsQ0FBQztBQUNiLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge2Rhc2hDYXNlVG9DYW1lbENhc2V9IGZyb20gJy4uLy4uL3V0aWwnO1xuXG5pbXBvcnQge0FuaW1hdGlvblN0eWxlTm9ybWFsaXplcn0gZnJvbSAnLi9hbmltYXRpb25fc3R5bGVfbm9ybWFsaXplcic7XG5cbmV4cG9ydCBjbGFzcyBXZWJBbmltYXRpb25zU3R5bGVOb3JtYWxpemVyIGV4dGVuZHMgQW5pbWF0aW9uU3R5bGVOb3JtYWxpemVyIHtcbiAgbm9ybWFsaXplUHJvcGVydHlOYW1lKHByb3BlcnR5TmFtZTogc3RyaW5nLCBlcnJvcnM6IHN0cmluZ1tdKTogc3RyaW5nIHtcbiAgICByZXR1cm4gZGFzaENhc2VUb0NhbWVsQ2FzZShwcm9wZXJ0eU5hbWUpO1xuICB9XG5cbiAgbm9ybWFsaXplU3R5bGVWYWx1ZShcbiAgICAgIHVzZXJQcm92aWRlZFByb3BlcnR5OiBzdHJpbmcsIG5vcm1hbGl6ZWRQcm9wZXJ0eTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nfG51bWJlcixcbiAgICAgIGVycm9yczogc3RyaW5nW10pOiBzdHJpbmcge1xuICAgIGxldCB1bml0OiBzdHJpbmcgPSAnJztcbiAgICBjb25zdCBzdHJWYWwgPSB2YWx1ZS50b1N0cmluZygpLnRyaW0oKTtcblxuICAgIGlmIChESU1FTlNJT05BTF9QUk9QX01BUFtub3JtYWxpemVkUHJvcGVydHldICYmIHZhbHVlICE9PSAwICYmIHZhbHVlICE9PSAnMCcpIHtcbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKSB7XG4gICAgICAgIHVuaXQgPSAncHgnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgdmFsQW5kU3VmZml4TWF0Y2ggPSB2YWx1ZS5tYXRjaCgvXlsrLV0/W1xcZFxcLl0rKFthLXpdKikkLyk7XG4gICAgICAgIGlmICh2YWxBbmRTdWZmaXhNYXRjaCAmJiB2YWxBbmRTdWZmaXhNYXRjaFsxXS5sZW5ndGggPT0gMCkge1xuICAgICAgICAgIGVycm9ycy5wdXNoKGBQbGVhc2UgcHJvdmlkZSBhIENTUyB1bml0IHZhbHVlIGZvciAke3VzZXJQcm92aWRlZFByb3BlcnR5fToke3ZhbHVlfWApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzdHJWYWwgKyB1bml0O1xuICB9XG59XG5cbmNvbnN0IERJTUVOU0lPTkFMX1BST1BfTUFQID0gbWFrZUJvb2xlYW5NYXAoXG4gICAgJ3dpZHRoLGhlaWdodCxtaW5XaWR0aCxtaW5IZWlnaHQsbWF4V2lkdGgsbWF4SGVpZ2h0LGxlZnQsdG9wLGJvdHRvbSxyaWdodCxmb250U2l6ZSxvdXRsaW5lV2lkdGgsb3V0bGluZU9mZnNldCxwYWRkaW5nVG9wLHBhZGRpbmdMZWZ0LHBhZGRpbmdCb3R0b20scGFkZGluZ1JpZ2h0LG1hcmdpblRvcCxtYXJnaW5MZWZ0LG1hcmdpbkJvdHRvbSxtYXJnaW5SaWdodCxib3JkZXJSYWRpdXMsYm9yZGVyV2lkdGgsYm9yZGVyVG9wV2lkdGgsYm9yZGVyTGVmdFdpZHRoLGJvcmRlclJpZ2h0V2lkdGgsYm9yZGVyQm90dG9tV2lkdGgsdGV4dEluZGVudCxwZXJzcGVjdGl2ZSdcbiAgICAgICAgLnNwbGl0KCcsJykpO1xuXG5mdW5jdGlvbiBtYWtlQm9vbGVhbk1hcChrZXlzOiBzdHJpbmdbXSk6IHtba2V5OiBzdHJpbmddOiBib29sZWFufSB7XG4gIGNvbnN0IG1hcDoge1trZXk6IHN0cmluZ106IGJvb2xlYW59ID0ge307XG4gIGtleXMuZm9yRWFjaChrZXkgPT4gbWFwW2tleV0gPSB0cnVlKTtcbiAgcmV0dXJuIG1hcDtcbn1cbiJdfQ==