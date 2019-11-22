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
/** @enum {number} */
const I18nMutateOpCode = {
    /// Stores shift amount for bits 17-3 that contain reference index.
    SHIFT_REF: 3,
    /// Stores shift amount for bits 31-17 that contain parent index.
    SHIFT_PARENT: 17,
    /// Mask for OpCode
    MASK_OPCODE: 7,
    /// Mask for reference index.
    MASK_REF: 136,
    /// OpCode to select a node. (next OpCode will contain the operation.)
    Select: 0,
    /// OpCode to append the current node to `PARENT`.
    AppendChild: 1,
    /// OpCode to insert the current node to `PARENT` before `REF`.
    InsertBefore: 2,
    /// OpCode to remove the `REF` node from `PARENT`.
    Remove: 3,
    /// OpCode to set the attribute of a node.
    Attr: 4,
    /// OpCode to simulate elementEnd()
    ElementEnd: 5,
    /// OpCode to read the remove OpCodes for the nested ICU
    RemoveNestedIcu: 6,
};
export { I18nMutateOpCode };
/**
 * Marks that the next string is for element.
 *
 * See `I18nMutateOpCodes` documentation.
 * @type {?}
 */
export const ELEMENT_MARKER = {
    marker: 'element'
};
// WARNING: interface has both a type and a value, skipping emit
/**
 * Marks that the next string is for comment.
 *
 * See `I18nMutateOpCodes` documentation.
 * @type {?}
 */
export const COMMENT_MARKER = {
    marker: 'comment'
};
// WARNING: interface has both a type and a value, skipping emit
/**
 * Array storing OpCode for dynamically creating `i18n` blocks.
 *
 * Example:
 * ```
 * <I18nCreateOpCode>[
 *   // For adding text nodes
 *   // ---------------------
 *   // Equivalent to:
 *   //   const node = lView[index++] = document.createTextNode('abc');
 *   //   lView[1].insertBefore(node, lView[2]);
 *   'abc', 1 << SHIFT_PARENT | 2 << SHIFT_REF | InsertBefore,
 *
 *   // Equivalent to:
 *   //   const node = lView[index++] = document.createTextNode('xyz');
 *   //   lView[1].appendChild(node);
 *   'xyz', 1 << SHIFT_PARENT | AppendChild,
 *
 *   // For adding element nodes
 *   // ---------------------
 *   // Equivalent to:
 *   //   const node = lView[index++] = document.createElement('div');
 *   //   lView[1].insertBefore(node, lView[2]);
 *   ELEMENT_MARKER, 'div', 1 << SHIFT_PARENT | 2 << SHIFT_REF | InsertBefore,
 *
 *   // Equivalent to:
 *   //   const node = lView[index++] = document.createElement('div');
 *   //   lView[1].appendChild(node);
 *   ELEMENT_MARKER, 'div', 1 << SHIFT_PARENT | AppendChild,
 *
 *   // For adding comment nodes
 *   // ---------------------
 *   // Equivalent to:
 *   //   const node = lView[index++] = document.createComment('');
 *   //   lView[1].insertBefore(node, lView[2]);
 *   COMMENT_MARKER, '', 1 << SHIFT_PARENT | 2 << SHIFT_REF | InsertBefore,
 *
 *   // Equivalent to:
 *   //   const node = lView[index++] = document.createComment('');
 *   //   lView[1].appendChild(node);
 *   COMMENT_MARKER, '', 1 << SHIFT_PARENT | AppendChild,
 *
 *   // For moving existing nodes to a different location
 *   // --------------------------------------------------
 *   // Equivalent to:
 *   //   const node = lView[1];
 *   //   lView[2].insertBefore(node, lView[3]);
 *   1 << SHIFT_REF | Select, 2 << SHIFT_PARENT | 3 << SHIFT_REF | InsertBefore,
 *
 *   // Equivalent to:
 *   //   const node = lView[1];
 *   //   lView[2].appendChild(node);
 *   1 << SHIFT_REF | Select, 2 << SHIFT_PARENT | AppendChild,
 *
 *   // For removing existing nodes
 *   // --------------------------------------------------
 *   //   const node = lView[1];
 *   //   removeChild(tView.data(1), node, lView);
 *   1 << SHIFT_REF | Remove,
 *
 *   // For writing attributes
 *   // --------------------------------------------------
 *   //   const node = lView[1];
 *   //   node.setAttribute('attr', 'value');
 *   1 << SHIFT_REF | Select, 'attr', 'value'
 *            // NOTE: Select followed by two string (vs select followed by OpCode)
 * ];
 * ```
 * NOTE:
 *   - `index` is initial location where the extra nodes should be stored in the EXPANDO section of
 * `LVIewData`.
 *
 * See: `applyI18nCreateOpCodes`;
 * @record
 */
export function I18nMutateOpCodes() { }
/** @enum {number} */
const I18nUpdateOpCode = {
    /// Stores shift amount for bits 17-2 that contain reference index.
    SHIFT_REF: 2,
    /// Stores shift amount for bits 31-17 that contain which ICU in i18n block are we referring to.
    SHIFT_ICU: 17,
    /// Mask for OpCode
    MASK_OPCODE: 3,
    /// Mask for reference index.
    MASK_REF: 68,
    /// OpCode to update a text node.
    Text: 0,
    /// OpCode to update a attribute of a node.
    Attr: 1,
    /// OpCode to switch the current ICU case.
    IcuSwitch: 2,
    /// OpCode to update the current ICU case.
    IcuUpdate: 3,
};
export { I18nUpdateOpCode };
/**
 * Stores DOM operations which need to be applied to update DOM render tree due to changes in
 * expressions.
 *
 * The basic idea is that `i18nExp` OpCodes capture expression changes and update a change
 * mask bit. (Bit 1 for expression 1, bit 2 for expression 2 etc..., bit 32 for expression 32 and
 * higher.) The OpCodes then compare its own change mask against the expression change mask to
 * determine if the OpCodes should execute.
 *
 * These OpCodes can be used by both the i18n block as well as ICU sub-block.
 *
 * ## Example
 *
 * Assume
 * ```
 *   if (rf & RenderFlags.Update) {
 *    i18nExp(bind(ctx.exp1)); // If changed set mask bit 1
 *    i18nExp(bind(ctx.exp2)); // If changed set mask bit 2
 *    i18nExp(bind(ctx.exp3)); // If changed set mask bit 3
 *    i18nExp(bind(ctx.exp4)); // If changed set mask bit 4
 *    i18nApply(0);            // Apply all changes by executing the OpCodes.
 *  }
 * ```
 * We can assume that each call to `i18nExp` sets an internal `changeMask` bit depending on the
 * index of `i18nExp`.
 *
 * OpCodes
 * ```
 * <I18nUpdateOpCodes>[
 *   // The following OpCodes represent: `<div i18n-title="pre{{exp1}}in{{exp2}}post">`
 *   // If `changeMask & 0b11`
 *   //        has changed then execute update OpCodes.
 *   //        has NOT changed then skip `7` values and start processing next OpCodes.
 *   0b11, 7,
 *   // Concatenate `newValue = 'pre'+lView[bindIndex-4]+'in'+lView[bindIndex-3]+'post';`.
 *   'pre', -4, 'in', -3, 'post',
 *   // Update attribute: `elementAttribute(1, 'title', sanitizerFn(newValue));`
 *   1 << SHIFT_REF | Attr, 'title', sanitizerFn,
 *
 *   // The following OpCodes represent: `<div i18n>Hello {{exp3}}!">`
 *   // If `changeMask & 0b100`
 *   //        has changed then execute update OpCodes.
 *   //        has NOT changed then skip `4` values and start processing next OpCodes.
 *   0b100, 4,
 *   // Concatenate `newValue = 'Hello ' + lView[bindIndex -2] + '!';`.
 *   'Hello ', -2, '!',
 *   // Update text: `lView[1].textContent = newValue;`
 *   1 << SHIFT_REF | Text,
 *
 *   // The following OpCodes represent: `<div i18n>{exp4, plural, ... }">`
 *   // If `changeMask & 0b1000`
 *   //        has changed then execute update OpCodes.
 *   //        has NOT changed then skip `4` values and start processing next OpCodes.
 *   0b1000, 4,
 *   // Concatenate `newValue = lView[bindIndex -1];`.
 *   -1,
 *   // Switch ICU: `icuSwitchCase(lView[1], 0, newValue);`
 *   0 << SHIFT_ICU | 1 << SHIFT_REF | IcuSwitch,
 *
 *   // Note `changeMask & -1` is always true, so the IcuUpdate will always execute.
 *   -1, 1,
 *   // Update ICU: `icuUpdateCase(lView[1], 0);`
 *   0 << SHIFT_ICU | 1 << SHIFT_REF | IcuUpdate,
 *
 * ];
 * ```
 *
 * @record
 */
export function I18nUpdateOpCodes() { }
/**
 * Store information for the i18n translation block.
 * @record
 */
export function TI18n() { }
if (false) {
    /**
     * Number of slots to allocate in expando.
     *
     * This is the max number of DOM elements which will be created by this i18n + ICU blocks. When
     * the DOM elements are being created they are stored in the EXPANDO, so that update OpCodes can
     * write into them.
     * @type {?}
     */
    TI18n.prototype.vars;
    /**
     * Index in EXPANDO where the i18n stores its DOM nodes.
     *
     * When the bindings are processed by the `i18nEnd` instruction it is necessary to know where the
     * newly created DOM nodes will be inserted.
     * @type {?}
     */
    TI18n.prototype.expandoStartIndex;
    /**
     * A set of OpCodes which will create the Text Nodes and ICU anchors for the translation blocks.
     *
     * NOTE: The ICU anchors are filled in with ICU Update OpCode.
     * @type {?}
     */
    TI18n.prototype.create;
    /**
     * A set of OpCodes which will be executed on each change detection to determine if any changes to
     * DOM are required.
     * @type {?}
     */
    TI18n.prototype.update;
    /**
     * A list of ICUs in a translation block (or `null` if block has no ICUs).
     *
     * Example:
     * Given: `<div i18n>You have {count, plural, ...} and {state, switch, ...}</div>`
     * There would be 2 ICUs in this array.
     *   1. `{count, plural, ...}`
     *   2. `{state, switch, ...}`
     * @type {?}
     */
    TI18n.prototype.icus;
}
/** @enum {number} */
const IcuType = {
    select: 0,
    plural: 1,
};
export { IcuType };
/**
 * @record
 */
export function TIcu() { }
if (false) {
    /**
     * Defines the ICU type of `select` or `plural`
     * @type {?}
     */
    TIcu.prototype.type;
    /**
     * Number of slots to allocate in expando for each case.
     *
     * This is the max number of DOM elements which will be created by this i18n + ICU blocks. When
     * the DOM elements are being created they are stored in the EXPANDO, so that update OpCodes can
     * write into them.
     * @type {?}
     */
    TIcu.prototype.vars;
    /**
     * An optional array of child/sub ICUs.
     *
     * In case of nested ICUs such as:
     * ```
     * {�0�, plural,
     *   =0 {zero}
     *   other {�0� {�1�, select,
     *                     cat {cats}
     *                     dog {dogs}
     *                     other {animals}
     *                   }!
     *   }
     * }
     * ```
     * When the parent ICU is changing it must clean up child ICUs as well. For this reason it needs
     * to know which child ICUs to run clean up for as well.
     *
     * In the above example this would be:
     * ```
     * [
     *   [],   // `=0` has no sub ICUs
     *   [1],  // `other` has one subICU at `1`st index.
     * ]
     * ```
     *
     * The reason why it is Array of Arrays is because first array represents the case, and second
     * represents the child ICUs to clean up. There may be more than one child ICUs per case.
     * @type {?}
     */
    TIcu.prototype.childIcus;
    /**
     * Index in EXPANDO where the i18n stores its DOM nodes.
     *
     * When the bindings are processed by the `i18nEnd` instruction it is necessary to know where the
     * newly created DOM nodes will be inserted.
     * @type {?}
     */
    TIcu.prototype.expandoStartIndex;
    /**
     * A list of case values which the current ICU will try to match.
     *
     * The last value is `other`
     * @type {?}
     */
    TIcu.prototype.cases;
    /**
     * A set of OpCodes to apply in order to build up the DOM render tree for the ICU
     * @type {?}
     */
    TIcu.prototype.create;
    /**
     * A set of OpCodes to apply in order to destroy the DOM render tree for the ICU.
     * @type {?}
     */
    TIcu.prototype.remove;
    /**
     * A set of OpCodes to apply in order to update the DOM render tree for the ICU bindings.
     * @type {?}
     */
    TIcu.prototype.update;
}
// Note: This hack is necessary so we don't erroneously get a circular dependency
// failure based on types.
/** @type {?} */
export const unusedValueExportToPlacateAjd = 1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3JlbmRlcjMvaW50ZXJmYWNlcy9pMThuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFxQkUsbUVBQW1FO0lBQ25FLFlBQWE7SUFDYixpRUFBaUU7SUFDakUsZ0JBQWlCO0lBQ2pCLG1CQUFtQjtJQUNuQixjQUFtQjtJQUNuQiw2QkFBNkI7SUFDN0IsYUFBc0M7SUFFdEMsc0VBQXNFO0lBQ3RFLFNBQWM7SUFDZCxrREFBa0Q7SUFDbEQsY0FBbUI7SUFDbkIsK0RBQStEO0lBQy9ELGVBQW9CO0lBQ3BCLGtEQUFrRDtJQUNsRCxTQUFjO0lBQ2QsMENBQTBDO0lBQzFDLE9BQVk7SUFDWixtQ0FBbUM7SUFDbkMsYUFBa0I7SUFDbEIsd0RBQXdEO0lBQ3hELGtCQUF1Qjs7Ozs7Ozs7O0FBUXpCLE1BQU0sT0FBTyxjQUFjLEdBQW1CO0lBQzVDLE1BQU0sRUFBRSxTQUFTO0NBQ2xCOzs7Ozs7OztBQVFELE1BQU0sT0FBTyxjQUFjLEdBQW1CO0lBQzVDLE1BQU0sRUFBRSxTQUFTO0NBQ2xCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQThFRCx1Q0FDQzs7O0lBR0MsbUVBQW1FO0lBQ25FLFlBQWE7SUFDYixnR0FBZ0c7SUFDaEcsYUFBYztJQUNkLG1CQUFtQjtJQUNuQixjQUFrQjtJQUNsQiw2QkFBNkI7SUFDN0IsWUFBc0M7SUFFdEMsaUNBQWlDO0lBQ2pDLE9BQVc7SUFDWCwyQ0FBMkM7SUFDM0MsT0FBVztJQUNYLDBDQUEwQztJQUMxQyxZQUFnQjtJQUNoQiwwQ0FBMEM7SUFDMUMsWUFBZ0I7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXVFbEIsdUNBQW1GOzs7OztBQUtuRiwyQkF5Q0M7Ozs7Ozs7Ozs7SUFqQ0MscUJBQWE7Ozs7Ozs7O0lBUWIsa0NBQTBCOzs7Ozs7O0lBTzFCLHVCQUEwQjs7Ozs7O0lBTTFCLHVCQUEwQjs7Ozs7Ozs7Ozs7SUFXMUIscUJBQWtCOzs7O0lBT2xCLFNBQVU7SUFDVixTQUFVOzs7Ozs7QUFHWiwwQkEyRUM7Ozs7OztJQXZFQyxvQkFBYzs7Ozs7Ozs7O0lBU2Qsb0JBQWU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUErQmYseUJBQXNCOzs7Ozs7OztJQVF0QixpQ0FBMEI7Ozs7Ozs7SUFPMUIscUJBQWE7Ozs7O0lBS2Isc0JBQTRCOzs7OztJQUs1QixzQkFBNEI7Ozs7O0lBSzVCLHNCQUE0Qjs7Ozs7QUFLOUIsTUFBTSxPQUFPLDZCQUE2QixHQUFHLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8qKlxuICogYEkxOG5NdXRhdGVPcENvZGVgIGRlZmluZXMgT3BDb2RlcyBmb3IgYEkxOG5NdXRhdGVPcENvZGVzYCBhcnJheS5cbiAqXG4gKiBPcENvZGVzIGNvbnRhaW4gdGhyZWUgcGFydHM6XG4gKiAgMSkgUGFyZW50IG5vZGUgaW5kZXggb2Zmc2V0LlxuICogIDIpIFJlZmVyZW5jZSBub2RlIGluZGV4IG9mZnNldC5cbiAqICAzKSBUaGUgT3BDb2RlIHRvIGV4ZWN1dGUuXG4gKlxuICogU2VlOiBgSTE4bkNyZWF0ZU9wQ29kZXNgIGZvciBleGFtcGxlIG9mIHVzYWdlLlxuICovXG5pbXBvcnQge1Nhbml0aXplckZufSBmcm9tICcuL3Nhbml0aXphdGlvbic7XG5cbmV4cG9ydCBjb25zdCBlbnVtIEkxOG5NdXRhdGVPcENvZGUge1xuICAvLy8gU3RvcmVzIHNoaWZ0IGFtb3VudCBmb3IgYml0cyAxNy0zIHRoYXQgY29udGFpbiByZWZlcmVuY2UgaW5kZXguXG4gIFNISUZUX1JFRiA9IDMsXG4gIC8vLyBTdG9yZXMgc2hpZnQgYW1vdW50IGZvciBiaXRzIDMxLTE3IHRoYXQgY29udGFpbiBwYXJlbnQgaW5kZXguXG4gIFNISUZUX1BBUkVOVCA9IDE3LFxuICAvLy8gTWFzayBmb3IgT3BDb2RlXG4gIE1BU0tfT1BDT0RFID0gMGIxMTEsXG4gIC8vLyBNYXNrIGZvciByZWZlcmVuY2UgaW5kZXguXG4gIE1BU0tfUkVGID0gKCgyIF4gMTYpIC0gMSkgPDwgU0hJRlRfUkVGLFxuXG4gIC8vLyBPcENvZGUgdG8gc2VsZWN0IGEgbm9kZS4gKG5leHQgT3BDb2RlIHdpbGwgY29udGFpbiB0aGUgb3BlcmF0aW9uLilcbiAgU2VsZWN0ID0gMGIwMDAsXG4gIC8vLyBPcENvZGUgdG8gYXBwZW5kIHRoZSBjdXJyZW50IG5vZGUgdG8gYFBBUkVOVGAuXG4gIEFwcGVuZENoaWxkID0gMGIwMDEsXG4gIC8vLyBPcENvZGUgdG8gaW5zZXJ0IHRoZSBjdXJyZW50IG5vZGUgdG8gYFBBUkVOVGAgYmVmb3JlIGBSRUZgLlxuICBJbnNlcnRCZWZvcmUgPSAwYjAxMCxcbiAgLy8vIE9wQ29kZSB0byByZW1vdmUgdGhlIGBSRUZgIG5vZGUgZnJvbSBgUEFSRU5UYC5cbiAgUmVtb3ZlID0gMGIwMTEsXG4gIC8vLyBPcENvZGUgdG8gc2V0IHRoZSBhdHRyaWJ1dGUgb2YgYSBub2RlLlxuICBBdHRyID0gMGIxMDAsXG4gIC8vLyBPcENvZGUgdG8gc2ltdWxhdGUgZWxlbWVudEVuZCgpXG4gIEVsZW1lbnRFbmQgPSAwYjEwMSxcbiAgLy8vIE9wQ29kZSB0byByZWFkIHRoZSByZW1vdmUgT3BDb2RlcyBmb3IgdGhlIG5lc3RlZCBJQ1VcbiAgUmVtb3ZlTmVzdGVkSWN1ID0gMGIxMTAsXG59XG5cbi8qKlxuICogTWFya3MgdGhhdCB0aGUgbmV4dCBzdHJpbmcgaXMgZm9yIGVsZW1lbnQuXG4gKlxuICogU2VlIGBJMThuTXV0YXRlT3BDb2Rlc2AgZG9jdW1lbnRhdGlvbi5cbiAqL1xuZXhwb3J0IGNvbnN0IEVMRU1FTlRfTUFSS0VSOiBFTEVNRU5UX01BUktFUiA9IHtcbiAgbWFya2VyOiAnZWxlbWVudCdcbn07XG5leHBvcnQgaW50ZXJmYWNlIEVMRU1FTlRfTUFSS0VSIHsgbWFya2VyOiAnZWxlbWVudCc7IH1cblxuLyoqXG4gKiBNYXJrcyB0aGF0IHRoZSBuZXh0IHN0cmluZyBpcyBmb3IgY29tbWVudC5cbiAqXG4gKiBTZWUgYEkxOG5NdXRhdGVPcENvZGVzYCBkb2N1bWVudGF0aW9uLlxuICovXG5leHBvcnQgY29uc3QgQ09NTUVOVF9NQVJLRVI6IENPTU1FTlRfTUFSS0VSID0ge1xuICBtYXJrZXI6ICdjb21tZW50J1xufTtcblxuZXhwb3J0IGludGVyZmFjZSBDT01NRU5UX01BUktFUiB7IG1hcmtlcjogJ2NvbW1lbnQnOyB9XG5cbi8qKlxuICogQXJyYXkgc3RvcmluZyBPcENvZGUgZm9yIGR5bmFtaWNhbGx5IGNyZWF0aW5nIGBpMThuYCBibG9ja3MuXG4gKlxuICogRXhhbXBsZTpcbiAqIGBgYFxuICogPEkxOG5DcmVhdGVPcENvZGU+W1xuICogICAvLyBGb3IgYWRkaW5nIHRleHQgbm9kZXNcbiAqICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKiAgIC8vIEVxdWl2YWxlbnQgdG86XG4gKiAgIC8vICAgY29uc3Qgbm9kZSA9IGxWaWV3W2luZGV4KytdID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJ2FiYycpO1xuICogICAvLyAgIGxWaWV3WzFdLmluc2VydEJlZm9yZShub2RlLCBsVmlld1syXSk7XG4gKiAgICdhYmMnLCAxIDw8IFNISUZUX1BBUkVOVCB8IDIgPDwgU0hJRlRfUkVGIHwgSW5zZXJ0QmVmb3JlLFxuICpcbiAqICAgLy8gRXF1aXZhbGVudCB0bzpcbiAqICAgLy8gICBjb25zdCBub2RlID0gbFZpZXdbaW5kZXgrK10gPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgneHl6Jyk7XG4gKiAgIC8vICAgbFZpZXdbMV0uYXBwZW5kQ2hpbGQobm9kZSk7XG4gKiAgICd4eXonLCAxIDw8IFNISUZUX1BBUkVOVCB8IEFwcGVuZENoaWxkLFxuICpcbiAqICAgLy8gRm9yIGFkZGluZyBlbGVtZW50IG5vZGVzXG4gKiAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICogICAvLyBFcXVpdmFsZW50IHRvOlxuICogICAvLyAgIGNvbnN0IG5vZGUgPSBsVmlld1tpbmRleCsrXSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICogICAvLyAgIGxWaWV3WzFdLmluc2VydEJlZm9yZShub2RlLCBsVmlld1syXSk7XG4gKiAgIEVMRU1FTlRfTUFSS0VSLCAnZGl2JywgMSA8PCBTSElGVF9QQVJFTlQgfCAyIDw8IFNISUZUX1JFRiB8IEluc2VydEJlZm9yZSxcbiAqXG4gKiAgIC8vIEVxdWl2YWxlbnQgdG86XG4gKiAgIC8vICAgY29uc3Qgbm9kZSA9IGxWaWV3W2luZGV4KytdID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gKiAgIC8vICAgbFZpZXdbMV0uYXBwZW5kQ2hpbGQobm9kZSk7XG4gKiAgIEVMRU1FTlRfTUFSS0VSLCAnZGl2JywgMSA8PCBTSElGVF9QQVJFTlQgfCBBcHBlbmRDaGlsZCxcbiAqXG4gKiAgIC8vIEZvciBhZGRpbmcgY29tbWVudCBub2Rlc1xuICogICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqICAgLy8gRXF1aXZhbGVudCB0bzpcbiAqICAgLy8gICBjb25zdCBub2RlID0gbFZpZXdbaW5kZXgrK10gPSBkb2N1bWVudC5jcmVhdGVDb21tZW50KCcnKTtcbiAqICAgLy8gICBsVmlld1sxXS5pbnNlcnRCZWZvcmUobm9kZSwgbFZpZXdbMl0pO1xuICogICBDT01NRU5UX01BUktFUiwgJycsIDEgPDwgU0hJRlRfUEFSRU5UIHwgMiA8PCBTSElGVF9SRUYgfCBJbnNlcnRCZWZvcmUsXG4gKlxuICogICAvLyBFcXVpdmFsZW50IHRvOlxuICogICAvLyAgIGNvbnN0IG5vZGUgPSBsVmlld1tpbmRleCsrXSA9IGRvY3VtZW50LmNyZWF0ZUNvbW1lbnQoJycpO1xuICogICAvLyAgIGxWaWV3WzFdLmFwcGVuZENoaWxkKG5vZGUpO1xuICogICBDT01NRU5UX01BUktFUiwgJycsIDEgPDwgU0hJRlRfUEFSRU5UIHwgQXBwZW5kQ2hpbGQsXG4gKlxuICogICAvLyBGb3IgbW92aW5nIGV4aXN0aW5nIG5vZGVzIHRvIGEgZGlmZmVyZW50IGxvY2F0aW9uXG4gKiAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKiAgIC8vIEVxdWl2YWxlbnQgdG86XG4gKiAgIC8vICAgY29uc3Qgbm9kZSA9IGxWaWV3WzFdO1xuICogICAvLyAgIGxWaWV3WzJdLmluc2VydEJlZm9yZShub2RlLCBsVmlld1szXSk7XG4gKiAgIDEgPDwgU0hJRlRfUkVGIHwgU2VsZWN0LCAyIDw8IFNISUZUX1BBUkVOVCB8IDMgPDwgU0hJRlRfUkVGIHwgSW5zZXJ0QmVmb3JlLFxuICpcbiAqICAgLy8gRXF1aXZhbGVudCB0bzpcbiAqICAgLy8gICBjb25zdCBub2RlID0gbFZpZXdbMV07XG4gKiAgIC8vICAgbFZpZXdbMl0uYXBwZW5kQ2hpbGQobm9kZSk7XG4gKiAgIDEgPDwgU0hJRlRfUkVGIHwgU2VsZWN0LCAyIDw8IFNISUZUX1BBUkVOVCB8IEFwcGVuZENoaWxkLFxuICpcbiAqICAgLy8gRm9yIHJlbW92aW5nIGV4aXN0aW5nIG5vZGVzXG4gKiAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKiAgIC8vICAgY29uc3Qgbm9kZSA9IGxWaWV3WzFdO1xuICogICAvLyAgIHJlbW92ZUNoaWxkKHRWaWV3LmRhdGEoMSksIG5vZGUsIGxWaWV3KTtcbiAqICAgMSA8PCBTSElGVF9SRUYgfCBSZW1vdmUsXG4gKlxuICogICAvLyBGb3Igd3JpdGluZyBhdHRyaWJ1dGVzXG4gKiAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKiAgIC8vICAgY29uc3Qgbm9kZSA9IGxWaWV3WzFdO1xuICogICAvLyAgIG5vZGUuc2V0QXR0cmlidXRlKCdhdHRyJywgJ3ZhbHVlJyk7XG4gKiAgIDEgPDwgU0hJRlRfUkVGIHwgU2VsZWN0LCAnYXR0cicsICd2YWx1ZSdcbiAqICAgICAgICAgICAgLy8gTk9URTogU2VsZWN0IGZvbGxvd2VkIGJ5IHR3byBzdHJpbmcgKHZzIHNlbGVjdCBmb2xsb3dlZCBieSBPcENvZGUpXG4gKiBdO1xuICogYGBgXG4gKiBOT1RFOlxuICogICAtIGBpbmRleGAgaXMgaW5pdGlhbCBsb2NhdGlvbiB3aGVyZSB0aGUgZXh0cmEgbm9kZXMgc2hvdWxkIGJlIHN0b3JlZCBpbiB0aGUgRVhQQU5ETyBzZWN0aW9uIG9mXG4gKiBgTFZJZXdEYXRhYC5cbiAqXG4gKiBTZWU6IGBhcHBseUkxOG5DcmVhdGVPcENvZGVzYDtcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBJMThuTXV0YXRlT3BDb2RlcyBleHRlbmRzIEFycmF5PG51bWJlcnxzdHJpbmd8RUxFTUVOVF9NQVJLRVJ8Q09NTUVOVF9NQVJLRVJ8bnVsbD4ge1xufVxuXG5leHBvcnQgY29uc3QgZW51bSBJMThuVXBkYXRlT3BDb2RlIHtcbiAgLy8vIFN0b3JlcyBzaGlmdCBhbW91bnQgZm9yIGJpdHMgMTctMiB0aGF0IGNvbnRhaW4gcmVmZXJlbmNlIGluZGV4LlxuICBTSElGVF9SRUYgPSAyLFxuICAvLy8gU3RvcmVzIHNoaWZ0IGFtb3VudCBmb3IgYml0cyAzMS0xNyB0aGF0IGNvbnRhaW4gd2hpY2ggSUNVIGluIGkxOG4gYmxvY2sgYXJlIHdlIHJlZmVycmluZyB0by5cbiAgU0hJRlRfSUNVID0gMTcsXG4gIC8vLyBNYXNrIGZvciBPcENvZGVcbiAgTUFTS19PUENPREUgPSAwYjExLFxuICAvLy8gTWFzayBmb3IgcmVmZXJlbmNlIGluZGV4LlxuICBNQVNLX1JFRiA9ICgoMiBeIDE2KSAtIDEpIDw8IFNISUZUX1JFRixcblxuICAvLy8gT3BDb2RlIHRvIHVwZGF0ZSBhIHRleHQgbm9kZS5cbiAgVGV4dCA9IDBiMDAsXG4gIC8vLyBPcENvZGUgdG8gdXBkYXRlIGEgYXR0cmlidXRlIG9mIGEgbm9kZS5cbiAgQXR0ciA9IDBiMDEsXG4gIC8vLyBPcENvZGUgdG8gc3dpdGNoIHRoZSBjdXJyZW50IElDVSBjYXNlLlxuICBJY3VTd2l0Y2ggPSAwYjEwLFxuICAvLy8gT3BDb2RlIHRvIHVwZGF0ZSB0aGUgY3VycmVudCBJQ1UgY2FzZS5cbiAgSWN1VXBkYXRlID0gMGIxMSxcbn1cblxuLyoqXG4gKiBTdG9yZXMgRE9NIG9wZXJhdGlvbnMgd2hpY2ggbmVlZCB0byBiZSBhcHBsaWVkIHRvIHVwZGF0ZSBET00gcmVuZGVyIHRyZWUgZHVlIHRvIGNoYW5nZXMgaW5cbiAqIGV4cHJlc3Npb25zLlxuICpcbiAqIFRoZSBiYXNpYyBpZGVhIGlzIHRoYXQgYGkxOG5FeHBgIE9wQ29kZXMgY2FwdHVyZSBleHByZXNzaW9uIGNoYW5nZXMgYW5kIHVwZGF0ZSBhIGNoYW5nZVxuICogbWFzayBiaXQuIChCaXQgMSBmb3IgZXhwcmVzc2lvbiAxLCBiaXQgMiBmb3IgZXhwcmVzc2lvbiAyIGV0Yy4uLiwgYml0IDMyIGZvciBleHByZXNzaW9uIDMyIGFuZFxuICogaGlnaGVyLikgVGhlIE9wQ29kZXMgdGhlbiBjb21wYXJlIGl0cyBvd24gY2hhbmdlIG1hc2sgYWdhaW5zdCB0aGUgZXhwcmVzc2lvbiBjaGFuZ2UgbWFzayB0b1xuICogZGV0ZXJtaW5lIGlmIHRoZSBPcENvZGVzIHNob3VsZCBleGVjdXRlLlxuICpcbiAqIFRoZXNlIE9wQ29kZXMgY2FuIGJlIHVzZWQgYnkgYm90aCB0aGUgaTE4biBibG9jayBhcyB3ZWxsIGFzIElDVSBzdWItYmxvY2suXG4gKlxuICogIyMgRXhhbXBsZVxuICpcbiAqIEFzc3VtZVxuICogYGBgXG4gKiAgIGlmIChyZiAmIFJlbmRlckZsYWdzLlVwZGF0ZSkge1xuICogICAgaTE4bkV4cChiaW5kKGN0eC5leHAxKSk7IC8vIElmIGNoYW5nZWQgc2V0IG1hc2sgYml0IDFcbiAqICAgIGkxOG5FeHAoYmluZChjdHguZXhwMikpOyAvLyBJZiBjaGFuZ2VkIHNldCBtYXNrIGJpdCAyXG4gKiAgICBpMThuRXhwKGJpbmQoY3R4LmV4cDMpKTsgLy8gSWYgY2hhbmdlZCBzZXQgbWFzayBiaXQgM1xuICogICAgaTE4bkV4cChiaW5kKGN0eC5leHA0KSk7IC8vIElmIGNoYW5nZWQgc2V0IG1hc2sgYml0IDRcbiAqICAgIGkxOG5BcHBseSgwKTsgICAgICAgICAgICAvLyBBcHBseSBhbGwgY2hhbmdlcyBieSBleGVjdXRpbmcgdGhlIE9wQ29kZXMuXG4gKiAgfVxuICogYGBgXG4gKiBXZSBjYW4gYXNzdW1lIHRoYXQgZWFjaCBjYWxsIHRvIGBpMThuRXhwYCBzZXRzIGFuIGludGVybmFsIGBjaGFuZ2VNYXNrYCBiaXQgZGVwZW5kaW5nIG9uIHRoZVxuICogaW5kZXggb2YgYGkxOG5FeHBgLlxuICpcbiAqIE9wQ29kZXNcbiAqIGBgYFxuICogPEkxOG5VcGRhdGVPcENvZGVzPltcbiAqICAgLy8gVGhlIGZvbGxvd2luZyBPcENvZGVzIHJlcHJlc2VudDogYDxkaXYgaTE4bi10aXRsZT1cInByZXt7ZXhwMX19aW57e2V4cDJ9fXBvc3RcIj5gXG4gKiAgIC8vIElmIGBjaGFuZ2VNYXNrICYgMGIxMWBcbiAqICAgLy8gICAgICAgIGhhcyBjaGFuZ2VkIHRoZW4gZXhlY3V0ZSB1cGRhdGUgT3BDb2Rlcy5cbiAqICAgLy8gICAgICAgIGhhcyBOT1QgY2hhbmdlZCB0aGVuIHNraXAgYDdgIHZhbHVlcyBhbmQgc3RhcnQgcHJvY2Vzc2luZyBuZXh0IE9wQ29kZXMuXG4gKiAgIDBiMTEsIDcsXG4gKiAgIC8vIENvbmNhdGVuYXRlIGBuZXdWYWx1ZSA9ICdwcmUnK2xWaWV3W2JpbmRJbmRleC00XSsnaW4nK2xWaWV3W2JpbmRJbmRleC0zXSsncG9zdCc7YC5cbiAqICAgJ3ByZScsIC00LCAnaW4nLCAtMywgJ3Bvc3QnLFxuICogICAvLyBVcGRhdGUgYXR0cmlidXRlOiBgZWxlbWVudEF0dHJpYnV0ZSgxLCAndGl0bGUnLCBzYW5pdGl6ZXJGbihuZXdWYWx1ZSkpO2BcbiAqICAgMSA8PCBTSElGVF9SRUYgfCBBdHRyLCAndGl0bGUnLCBzYW5pdGl6ZXJGbixcbiAqXG4gKiAgIC8vIFRoZSBmb2xsb3dpbmcgT3BDb2RlcyByZXByZXNlbnQ6IGA8ZGl2IGkxOG4+SGVsbG8ge3tleHAzfX0hXCI+YFxuICogICAvLyBJZiBgY2hhbmdlTWFzayAmIDBiMTAwYFxuICogICAvLyAgICAgICAgaGFzIGNoYW5nZWQgdGhlbiBleGVjdXRlIHVwZGF0ZSBPcENvZGVzLlxuICogICAvLyAgICAgICAgaGFzIE5PVCBjaGFuZ2VkIHRoZW4gc2tpcCBgNGAgdmFsdWVzIGFuZCBzdGFydCBwcm9jZXNzaW5nIG5leHQgT3BDb2Rlcy5cbiAqICAgMGIxMDAsIDQsXG4gKiAgIC8vIENvbmNhdGVuYXRlIGBuZXdWYWx1ZSA9ICdIZWxsbyAnICsgbFZpZXdbYmluZEluZGV4IC0yXSArICchJztgLlxuICogICAnSGVsbG8gJywgLTIsICchJyxcbiAqICAgLy8gVXBkYXRlIHRleHQ6IGBsVmlld1sxXS50ZXh0Q29udGVudCA9IG5ld1ZhbHVlO2BcbiAqICAgMSA8PCBTSElGVF9SRUYgfCBUZXh0LFxuICpcbiAqICAgLy8gVGhlIGZvbGxvd2luZyBPcENvZGVzIHJlcHJlc2VudDogYDxkaXYgaTE4bj57ZXhwNCwgcGx1cmFsLCAuLi4gfVwiPmBcbiAqICAgLy8gSWYgYGNoYW5nZU1hc2sgJiAwYjEwMDBgXG4gKiAgIC8vICAgICAgICBoYXMgY2hhbmdlZCB0aGVuIGV4ZWN1dGUgdXBkYXRlIE9wQ29kZXMuXG4gKiAgIC8vICAgICAgICBoYXMgTk9UIGNoYW5nZWQgdGhlbiBza2lwIGA0YCB2YWx1ZXMgYW5kIHN0YXJ0IHByb2Nlc3NpbmcgbmV4dCBPcENvZGVzLlxuICogICAwYjEwMDAsIDQsXG4gKiAgIC8vIENvbmNhdGVuYXRlIGBuZXdWYWx1ZSA9IGxWaWV3W2JpbmRJbmRleCAtMV07YC5cbiAqICAgLTEsXG4gKiAgIC8vIFN3aXRjaCBJQ1U6IGBpY3VTd2l0Y2hDYXNlKGxWaWV3WzFdLCAwLCBuZXdWYWx1ZSk7YFxuICogICAwIDw8IFNISUZUX0lDVSB8IDEgPDwgU0hJRlRfUkVGIHwgSWN1U3dpdGNoLFxuICpcbiAqICAgLy8gTm90ZSBgY2hhbmdlTWFzayAmIC0xYCBpcyBhbHdheXMgdHJ1ZSwgc28gdGhlIEljdVVwZGF0ZSB3aWxsIGFsd2F5cyBleGVjdXRlLlxuICogICAtMSwgMSxcbiAqICAgLy8gVXBkYXRlIElDVTogYGljdVVwZGF0ZUNhc2UobFZpZXdbMV0sIDApO2BcbiAqICAgMCA8PCBTSElGVF9JQ1UgfCAxIDw8IFNISUZUX1JFRiB8IEljdVVwZGF0ZSxcbiAqXG4gKiBdO1xuICogYGBgXG4gKlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEkxOG5VcGRhdGVPcENvZGVzIGV4dGVuZHMgQXJyYXk8c3RyaW5nfG51bWJlcnxTYW5pdGl6ZXJGbnxudWxsPiB7fVxuXG4vKipcbiAqIFN0b3JlIGluZm9ybWF0aW9uIGZvciB0aGUgaTE4biB0cmFuc2xhdGlvbiBibG9jay5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBUSTE4biB7XG4gIC8qKlxuICAgKiBOdW1iZXIgb2Ygc2xvdHMgdG8gYWxsb2NhdGUgaW4gZXhwYW5kby5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgbWF4IG51bWJlciBvZiBET00gZWxlbWVudHMgd2hpY2ggd2lsbCBiZSBjcmVhdGVkIGJ5IHRoaXMgaTE4biArIElDVSBibG9ja3MuIFdoZW5cbiAgICogdGhlIERPTSBlbGVtZW50cyBhcmUgYmVpbmcgY3JlYXRlZCB0aGV5IGFyZSBzdG9yZWQgaW4gdGhlIEVYUEFORE8sIHNvIHRoYXQgdXBkYXRlIE9wQ29kZXMgY2FuXG4gICAqIHdyaXRlIGludG8gdGhlbS5cbiAgICovXG4gIHZhcnM6IG51bWJlcjtcblxuICAvKipcbiAgICogSW5kZXggaW4gRVhQQU5ETyB3aGVyZSB0aGUgaTE4biBzdG9yZXMgaXRzIERPTSBub2Rlcy5cbiAgICpcbiAgICogV2hlbiB0aGUgYmluZGluZ3MgYXJlIHByb2Nlc3NlZCBieSB0aGUgYGkxOG5FbmRgIGluc3RydWN0aW9uIGl0IGlzIG5lY2Vzc2FyeSB0byBrbm93IHdoZXJlIHRoZVxuICAgKiBuZXdseSBjcmVhdGVkIERPTSBub2RlcyB3aWxsIGJlIGluc2VydGVkLlxuICAgKi9cbiAgZXhwYW5kb1N0YXJ0SW5kZXg6IG51bWJlcjtcblxuICAvKipcbiAgICogQSBzZXQgb2YgT3BDb2RlcyB3aGljaCB3aWxsIGNyZWF0ZSB0aGUgVGV4dCBOb2RlcyBhbmQgSUNVIGFuY2hvcnMgZm9yIHRoZSB0cmFuc2xhdGlvbiBibG9ja3MuXG4gICAqXG4gICAqIE5PVEU6IFRoZSBJQ1UgYW5jaG9ycyBhcmUgZmlsbGVkIGluIHdpdGggSUNVIFVwZGF0ZSBPcENvZGUuXG4gICAqL1xuICBjcmVhdGU6IEkxOG5NdXRhdGVPcENvZGVzO1xuXG4gIC8qKlxuICAgKiBBIHNldCBvZiBPcENvZGVzIHdoaWNoIHdpbGwgYmUgZXhlY3V0ZWQgb24gZWFjaCBjaGFuZ2UgZGV0ZWN0aW9uIHRvIGRldGVybWluZSBpZiBhbnkgY2hhbmdlcyB0b1xuICAgKiBET00gYXJlIHJlcXVpcmVkLlxuICAgKi9cbiAgdXBkYXRlOiBJMThuVXBkYXRlT3BDb2RlcztcblxuICAvKipcbiAgICogQSBsaXN0IG9mIElDVXMgaW4gYSB0cmFuc2xhdGlvbiBibG9jayAob3IgYG51bGxgIGlmIGJsb2NrIGhhcyBubyBJQ1VzKS5cbiAgICpcbiAgICogRXhhbXBsZTpcbiAgICogR2l2ZW46IGA8ZGl2IGkxOG4+WW91IGhhdmUge2NvdW50LCBwbHVyYWwsIC4uLn0gYW5kIHtzdGF0ZSwgc3dpdGNoLCAuLi59PC9kaXY+YFxuICAgKiBUaGVyZSB3b3VsZCBiZSAyIElDVXMgaW4gdGhpcyBhcnJheS5cbiAgICogICAxLiBge2NvdW50LCBwbHVyYWwsIC4uLn1gXG4gICAqICAgMi4gYHtzdGF0ZSwgc3dpdGNoLCAuLi59YFxuICAgKi9cbiAgaWN1czogVEljdVtdfG51bGw7XG59XG5cbi8qKlxuICogRGVmaW5lcyB0aGUgSUNVIHR5cGUgb2YgYHNlbGVjdGAgb3IgYHBsdXJhbGBcbiAqL1xuZXhwb3J0IGNvbnN0IGVudW0gSWN1VHlwZSB7XG4gIHNlbGVjdCA9IDAsXG4gIHBsdXJhbCA9IDEsXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVEljdSB7XG4gIC8qKlxuICAgKiBEZWZpbmVzIHRoZSBJQ1UgdHlwZSBvZiBgc2VsZWN0YCBvciBgcGx1cmFsYFxuICAgKi9cbiAgdHlwZTogSWN1VHlwZTtcblxuICAvKipcbiAgICogTnVtYmVyIG9mIHNsb3RzIHRvIGFsbG9jYXRlIGluIGV4cGFuZG8gZm9yIGVhY2ggY2FzZS5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgbWF4IG51bWJlciBvZiBET00gZWxlbWVudHMgd2hpY2ggd2lsbCBiZSBjcmVhdGVkIGJ5IHRoaXMgaTE4biArIElDVSBibG9ja3MuIFdoZW5cbiAgICogdGhlIERPTSBlbGVtZW50cyBhcmUgYmVpbmcgY3JlYXRlZCB0aGV5IGFyZSBzdG9yZWQgaW4gdGhlIEVYUEFORE8sIHNvIHRoYXQgdXBkYXRlIE9wQ29kZXMgY2FuXG4gICAqIHdyaXRlIGludG8gdGhlbS5cbiAgICovXG4gIHZhcnM6IG51bWJlcltdO1xuXG4gIC8qKlxuICAgKiBBbiBvcHRpb25hbCBhcnJheSBvZiBjaGlsZC9zdWIgSUNVcy5cbiAgICpcbiAgICogSW4gY2FzZSBvZiBuZXN0ZWQgSUNVcyBzdWNoIGFzOlxuICAgKiBgYGBcbiAgICoge++/vTDvv70sIHBsdXJhbCxcbiAgICogICA9MCB7emVyb31cbiAgICogICBvdGhlciB777+9MO+/vSB777+9Me+/vSwgc2VsZWN0LFxuICAgKiAgICAgICAgICAgICAgICAgICAgIGNhdCB7Y2F0c31cbiAgICogICAgICAgICAgICAgICAgICAgICBkb2cge2RvZ3N9XG4gICAqICAgICAgICAgICAgICAgICAgICAgb3RoZXIge2FuaW1hbHN9XG4gICAqICAgICAgICAgICAgICAgICAgIH0hXG4gICAqICAgfVxuICAgKiB9XG4gICAqIGBgYFxuICAgKiBXaGVuIHRoZSBwYXJlbnQgSUNVIGlzIGNoYW5naW5nIGl0IG11c3QgY2xlYW4gdXAgY2hpbGQgSUNVcyBhcyB3ZWxsLiBGb3IgdGhpcyByZWFzb24gaXQgbmVlZHNcbiAgICogdG8ga25vdyB3aGljaCBjaGlsZCBJQ1VzIHRvIHJ1biBjbGVhbiB1cCBmb3IgYXMgd2VsbC5cbiAgICpcbiAgICogSW4gdGhlIGFib3ZlIGV4YW1wbGUgdGhpcyB3b3VsZCBiZTpcbiAgICogYGBgXG4gICAqIFtcbiAgICogICBbXSwgICAvLyBgPTBgIGhhcyBubyBzdWIgSUNVc1xuICAgKiAgIFsxXSwgIC8vIGBvdGhlcmAgaGFzIG9uZSBzdWJJQ1UgYXQgYDFgc3QgaW5kZXguXG4gICAqIF1cbiAgICogYGBgXG4gICAqXG4gICAqIFRoZSByZWFzb24gd2h5IGl0IGlzIEFycmF5IG9mIEFycmF5cyBpcyBiZWNhdXNlIGZpcnN0IGFycmF5IHJlcHJlc2VudHMgdGhlIGNhc2UsIGFuZCBzZWNvbmRcbiAgICogcmVwcmVzZW50cyB0aGUgY2hpbGQgSUNVcyB0byBjbGVhbiB1cC4gVGhlcmUgbWF5IGJlIG1vcmUgdGhhbiBvbmUgY2hpbGQgSUNVcyBwZXIgY2FzZS5cbiAgICovXG4gIGNoaWxkSWN1czogbnVtYmVyW11bXTtcblxuICAvKipcbiAgICogSW5kZXggaW4gRVhQQU5ETyB3aGVyZSB0aGUgaTE4biBzdG9yZXMgaXRzIERPTSBub2Rlcy5cbiAgICpcbiAgICogV2hlbiB0aGUgYmluZGluZ3MgYXJlIHByb2Nlc3NlZCBieSB0aGUgYGkxOG5FbmRgIGluc3RydWN0aW9uIGl0IGlzIG5lY2Vzc2FyeSB0byBrbm93IHdoZXJlIHRoZVxuICAgKiBuZXdseSBjcmVhdGVkIERPTSBub2RlcyB3aWxsIGJlIGluc2VydGVkLlxuICAgKi9cbiAgZXhwYW5kb1N0YXJ0SW5kZXg6IG51bWJlcjtcblxuICAvKipcbiAgICogQSBsaXN0IG9mIGNhc2UgdmFsdWVzIHdoaWNoIHRoZSBjdXJyZW50IElDVSB3aWxsIHRyeSB0byBtYXRjaC5cbiAgICpcbiAgICogVGhlIGxhc3QgdmFsdWUgaXMgYG90aGVyYFxuICAgKi9cbiAgY2FzZXM6IGFueVtdO1xuXG4gIC8qKlxuICAgKiBBIHNldCBvZiBPcENvZGVzIHRvIGFwcGx5IGluIG9yZGVyIHRvIGJ1aWxkIHVwIHRoZSBET00gcmVuZGVyIHRyZWUgZm9yIHRoZSBJQ1VcbiAgICovXG4gIGNyZWF0ZTogSTE4bk11dGF0ZU9wQ29kZXNbXTtcblxuICAvKipcbiAgICogQSBzZXQgb2YgT3BDb2RlcyB0byBhcHBseSBpbiBvcmRlciB0byBkZXN0cm95IHRoZSBET00gcmVuZGVyIHRyZWUgZm9yIHRoZSBJQ1UuXG4gICAqL1xuICByZW1vdmU6IEkxOG5NdXRhdGVPcENvZGVzW107XG5cbiAgLyoqXG4gICAqIEEgc2V0IG9mIE9wQ29kZXMgdG8gYXBwbHkgaW4gb3JkZXIgdG8gdXBkYXRlIHRoZSBET00gcmVuZGVyIHRyZWUgZm9yIHRoZSBJQ1UgYmluZGluZ3MuXG4gICAqL1xuICB1cGRhdGU6IEkxOG5VcGRhdGVPcENvZGVzW107XG59XG5cbi8vIE5vdGU6IFRoaXMgaGFjayBpcyBuZWNlc3Nhcnkgc28gd2UgZG9uJ3QgZXJyb25lb3VzbHkgZ2V0IGEgY2lyY3VsYXIgZGVwZW5kZW5jeVxuLy8gZmFpbHVyZSBiYXNlZCBvbiB0eXBlcy5cbmV4cG9ydCBjb25zdCB1bnVzZWRWYWx1ZUV4cG9ydFRvUGxhY2F0ZUFqZCA9IDE7XG4iXX0=