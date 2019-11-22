/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { assertNotEqual } from '../assert';
import { EMPTY_ARRAY, EMPTY_OBJ } from '../empty';
import { RendererStyleFlags3, isProceduralRenderer } from '../interfaces/renderer';
import { NO_CHANGE } from '../tokens';
import { getRootContext } from '../util';
import { BoundPlayerFactory } from './player_factory';
import { addPlayerInternal, allocPlayerContext, createEmptyStylingContext, getPlayerContext } from './util';
/**
 * This file includes the code to power all styling-binding operations in Angular.
 *
 * These include:
 * [style]="myStyleObj"
 * [class]="myClassObj"
 * [style.prop]="myPropValue"
 * [class.name]="myClassValue"
 *
 * There are many different ways in which these functions below are called. Please see
 * `interfaces/styles.ts` to get a better idea of how the styling algorithm works.
 */
/**
 * Creates a new StylingContext an fills it with the provided static styling attribute values.
 * @param {?} attrs
 * @return {?}
 */
export function initializeStaticContext(attrs) {
    /** @type {?} */
    const context = createEmptyStylingContext();
    /** @type {?} */
    const initialClasses = context[3 /* InitialClassValuesPosition */] =
        [null];
    /** @type {?} */
    const initialStyles = context[2 /* InitialStyleValuesPosition */] =
        [null];
    // The attributes array has marker values (numbers) indicating what the subsequent
    // values represent. When we encounter a number, we set the mode to that type of attribute.
    /** @type {?} */
    let mode = -1;
    for (let i = 0; i < attrs.length; i++) {
        /** @type {?} */
        const attr = attrs[i];
        if (typeof attr == 'number') {
            mode = attr;
        }
        else if (mode === 2 /* Styles */) {
            initialStyles.push((/** @type {?} */ (attr)), (/** @type {?} */ (attrs[++i])));
        }
        else if (mode === 1 /* Classes */) {
            initialClasses.push((/** @type {?} */ (attr)), true);
        }
        else if (mode === 3 /* SelectOnly */) {
            break;
        }
    }
    return context;
}
/**
 * Designed to update an existing styling context with new static styling
 * data (classes and styles).
 *
 * @param {?} context the existing styling context
 * @param {?} attrs an array of new static styling attributes that will be
 *              assigned to the context
 * @param {?} directive the directive instance with which static data is associated with.
 * @return {?}
 */
export function patchContextWithStaticAttrs(context, attrs, directive) {
    // If the styling context has already been patched with the given directive's bindings,
    // then there is no point in doing it again. The reason why this may happen (the directive
    // styling being patched twice) is because the `stylingBinding` function is called each time
    // an element is created (both within a template function and within directive host bindings).
    /** @type {?} */
    const directives = context[1 /* DirectiveRegistryPosition */];
    if (getDirectiveRegistryValuesIndexOf(directives, directive) == -1) {
        // this is a new directive which we have not seen yet.
        directives.push(directive, -1, false, null);
        /** @type {?} */
        let initialClasses = null;
        /** @type {?} */
        let initialStyles = null;
        /** @type {?} */
        let mode = -1;
        for (let i = 0; i < attrs.length; i++) {
            /** @type {?} */
            const attr = attrs[i];
            if (typeof attr == 'number') {
                mode = attr;
            }
            else if (mode == 1 /* Classes */) {
                initialClasses = initialClasses || context[3 /* InitialClassValuesPosition */];
                patchInitialStylingValue(initialClasses, attr, true);
            }
            else if (mode == 2 /* Styles */) {
                initialStyles = initialStyles || context[2 /* InitialStyleValuesPosition */];
                patchInitialStylingValue(initialStyles, attr, attrs[++i]);
            }
        }
    }
}
/**
 * Designed to add a style or class value into the existing set of initial styles.
 *
 * The function will search and figure out if a style/class value is already present
 * within the provided initial styling array. If and when a style/class value is not
 * present (or if it's value is falsy) then it will be inserted/updated in the list
 * of initial styling values.
 * @param {?} initialStyling
 * @param {?} prop
 * @param {?} value
 * @return {?}
 */
function patchInitialStylingValue(initialStyling, prop, value) {
    // Even values are keys; Odd numbers are values; Search keys only
    for (let i = 1 /* KeyValueStartPosition */; i < initialStyling.length;) {
        /** @type {?} */
        const key = initialStyling[i];
        if (key === prop) {
            /** @type {?} */
            const existingValue = initialStyling[i + 1 /* ValueOffset */];
            // If there is no previous style value (when `null`) or no previous class
            // applied (when `false`) then we update the the newly given value.
            if (existingValue == null || existingValue == false) {
                initialStyling[i + 1 /* ValueOffset */] = value;
            }
            return;
        }
        i = i + 2 /* Size */;
    }
    // We did not find existing key, add a new one.
    initialStyling.push(prop, value);
}
/**
 * Runs through the initial styling data present in the context and renders
 * them via the renderer on the element.
 * @param {?} element
 * @param {?} context
 * @param {?} renderer
 * @return {?}
 */
export function renderInitialStylesAndClasses(element, context, renderer) {
    /** @type {?} */
    const initialClasses = context[3 /* InitialClassValuesPosition */];
    renderInitialStylingValues(element, renderer, initialClasses, true);
    /** @type {?} */
    const initialStyles = context[2 /* InitialStyleValuesPosition */];
    renderInitialStylingValues(element, renderer, initialStyles, false);
}
/**
 * This is a helper function designed to render each entry present within the
 * provided list of initialStylingValues.
 * @param {?} element
 * @param {?} renderer
 * @param {?} initialStylingValues
 * @param {?} isEntryClassBased
 * @return {?}
 */
function renderInitialStylingValues(element, renderer, initialStylingValues, isEntryClassBased) {
    for (let i = 1 /* KeyValueStartPosition */; i < initialStylingValues.length; i += 2 /* Size */) {
        /** @type {?} */
        const value = initialStylingValues[i + 1 /* ValueOffset */];
        if (value) {
            if (isEntryClassBased) {
                setClass(element, (/** @type {?} */ (initialStylingValues[i + 0 /* PropOffset */])), true, renderer, null);
            }
            else {
                setStyle(element, (/** @type {?} */ (initialStylingValues[i + 0 /* PropOffset */])), (/** @type {?} */ (value)), renderer, null);
            }
        }
    }
}
/**
 * @param {?} context
 * @return {?}
 */
export function allowNewBindingsForStylingContext(context) {
    return (context[0 /* MasterFlagPosition */] & 32 /* BindingAllocationLocked */) === 0;
}
/**
 * Adds in new binding values to a styling context.
 *
 * If a directive value is provided then all provided class/style binding names will
 * reference the provided directive.
 *
 * @param {?} context the existing styling context
 * @param {?} directiveRef the directive that the new bindings will reference
 * @param {?=} classBindingNames an array of class binding names that will be added to the context
 * @param {?=} styleBindingNames an array of style binding names that will be added to the context
 * @param {?=} styleSanitizer an optional sanitizer that handle all sanitization on for each of
 *    the bindings added to the context. Note that if a directive is provided then the sanitizer
 *    instance will only be active if and when the directive updates the bindings that it owns.
 * @param {?=} onlyProcessSingleClasses
 * @return {?}
 */
export function updateContextWithBindings(context, directiveRef, classBindingNames, styleBindingNames, styleSanitizer, onlyProcessSingleClasses) {
    if (context[0 /* MasterFlagPosition */] & 32 /* BindingAllocationLocked */)
        return;
    // this means the context has already been patched with the directive's bindings
    /** @type {?} */
    const directiveIndex = findOrPatchDirectiveIntoRegistry(context, directiveRef, styleSanitizer);
    if (directiveIndex === -1) {
        // this means the directive has already been patched in ... No point in doing anything
        return;
    }
    // there are alot of variables being used below to track where in the context the new
    // binding values will be placed. Because the context consists of multiple types of
    // entries (single classes/styles and multi classes/styles) alot of the index positions
    // need to be computed ahead of time and the context needs to be extended before the values
    // are inserted in.
    /** @type {?} */
    const singlePropOffsetValues = context[4 /* SinglePropOffsetPositions */];
    /** @type {?} */
    const totalCurrentClassBindings = singlePropOffsetValues[1 /* ClassesCountPosition */];
    /** @type {?} */
    const totalCurrentStyleBindings = singlePropOffsetValues[0 /* StylesCountPosition */];
    /** @type {?} */
    const classesOffset = totalCurrentClassBindings * 4 /* Size */;
    /** @type {?} */
    const stylesOffset = totalCurrentStyleBindings * 4 /* Size */;
    /** @type {?} */
    const singleStylesStartIndex = 9 /* SingleStylesStartPosition */;
    /** @type {?} */
    let singleClassesStartIndex = singleStylesStartIndex + stylesOffset;
    /** @type {?} */
    let multiStylesStartIndex = singleClassesStartIndex + classesOffset;
    /** @type {?} */
    let multiClassesStartIndex = multiStylesStartIndex + stylesOffset;
    // because we're inserting more bindings into the context, this means that the
    // binding values need to be referenced the singlePropOffsetValues array so that
    // the template/directive can easily find them inside of the `elementStyleProp`
    // and the `elementClassProp` functions without iterating through the entire context.
    // The first step to setting up these reference points is to mark how many bindings
    // are being added. Even if these bindings already exist in the context, the directive
    // or template code will still call them unknowingly. Therefore the total values need
    // to be registered so that we know how many bindings are assigned to each directive.
    /** @type {?} */
    const currentSinglePropsLength = singlePropOffsetValues.length;
    singlePropOffsetValues.push(styleBindingNames ? styleBindingNames.length : 0, classBindingNames ? classBindingNames.length : 0);
    // the code below will check to see if a new style binding already exists in the context
    // if so then there is no point in inserting it into the context again. Whether or not it
    // exists the styling offset code will now know exactly where it is
    /** @type {?} */
    let insertionOffset = 0;
    /** @type {?} */
    const filteredStyleBindingNames = [];
    if (styleBindingNames && styleBindingNames.length) {
        for (let i = 0; i < styleBindingNames.length; i++) {
            /** @type {?} */
            const name = styleBindingNames[i];
            /** @type {?} */
            let singlePropIndex = getMatchingBindingIndex(context, name, singleStylesStartIndex, singleClassesStartIndex);
            if (singlePropIndex == -1) {
                singlePropIndex = singleClassesStartIndex + insertionOffset;
                insertionOffset += 4 /* Size */;
                filteredStyleBindingNames.push(name);
            }
            singlePropOffsetValues.push(singlePropIndex);
        }
    }
    // just like with the style binding loop above, the new class bindings get the same treatment...
    /** @type {?} */
    const filteredClassBindingNames = [];
    if (classBindingNames && classBindingNames.length) {
        for (let i = 0; i < classBindingNames.length; i++) {
            /** @type {?} */
            const name = classBindingNames[i];
            /** @type {?} */
            let singlePropIndex = getMatchingBindingIndex(context, name, singleClassesStartIndex, multiStylesStartIndex);
            if (singlePropIndex == -1) {
                singlePropIndex = multiStylesStartIndex + insertionOffset;
                insertionOffset += 4 /* Size */;
                filteredClassBindingNames.push(name);
            }
            else {
                singlePropIndex += filteredStyleBindingNames.length * 4 /* Size */;
            }
            singlePropOffsetValues.push(singlePropIndex);
        }
    }
    // because new styles are being inserted, this means the existing collection of style offset
    // index values are incorrect (they point to the wrong values). The code below will run through
    // the entire offset array and update the existing set of index values to point to their new
    // locations while taking the new binding values into consideration.
    /** @type {?} */
    let i = 2 /* ValueStartPosition */;
    if (filteredStyleBindingNames.length) {
        while (i < currentSinglePropsLength) {
            /** @type {?} */
            const totalStyles = singlePropOffsetValues[i + 0 /* StylesCountPosition */];
            /** @type {?} */
            const totalClasses = singlePropOffsetValues[i + 1 /* ClassesCountPosition */];
            if (totalClasses) {
                /** @type {?} */
                const start = i + 2 /* ValueStartPosition */ + totalStyles;
                for (let j = start; j < start + totalClasses; j++) {
                    singlePropOffsetValues[j] += filteredStyleBindingNames.length * 4 /* Size */;
                }
            }
            /** @type {?} */
            const total = totalStyles + totalClasses;
            i += 2 /* ValueStartPosition */ + total;
        }
    }
    /** @type {?} */
    const totalNewEntries = filteredClassBindingNames.length + filteredStyleBindingNames.length;
    // in the event that there are new style values being inserted, all existing class and style
    // bindings need to have their pointer values offsetted with the new amount of space that is
    // used for the new style/class bindings.
    for (let i = singleStylesStartIndex; i < context.length; i += 4 /* Size */) {
        /** @type {?} */
        const isMultiBased = i >= multiStylesStartIndex;
        /** @type {?} */
        const isClassBased = i >= (isMultiBased ? multiClassesStartIndex : singleClassesStartIndex);
        /** @type {?} */
        const flag = getPointers(context, i);
        /** @type {?} */
        const staticIndex = getInitialIndex(flag);
        /** @type {?} */
        let singleOrMultiIndex = getMultiOrSingleIndex(flag);
        if (isMultiBased) {
            singleOrMultiIndex +=
                isClassBased ? (filteredStyleBindingNames.length * 4 /* Size */) : 0;
        }
        else {
            singleOrMultiIndex += (totalNewEntries * 4 /* Size */) +
                ((isClassBased ? filteredStyleBindingNames.length : 0) * 4 /* Size */);
        }
        setFlag(context, i, pointers(flag, staticIndex, singleOrMultiIndex));
    }
    // this is where we make space in the context for the new style bindings
    for (let i = 0; i < filteredStyleBindingNames.length * 4 /* Size */; i++) {
        context.splice(multiClassesStartIndex, 0, null);
        context.splice(singleClassesStartIndex, 0, null);
        singleClassesStartIndex++;
        multiStylesStartIndex++;
        multiClassesStartIndex += 2; // both single + multi slots were inserted
    }
    // this is where we make space in the context for the new class bindings
    for (let i = 0; i < filteredClassBindingNames.length * 4 /* Size */; i++) {
        context.splice(multiStylesStartIndex, 0, null);
        context.push(null);
        multiStylesStartIndex++;
        multiClassesStartIndex++;
    }
    /** @type {?} */
    const initialClasses = context[3 /* InitialClassValuesPosition */];
    /** @type {?} */
    const initialStyles = context[2 /* InitialStyleValuesPosition */];
    // the code below will insert each new entry into the context and assign the appropriate
    // flags and index values to them. It's important this runs at the end of this function
    // because the context, property offset and index values have all been computed just before.
    for (let i = 0; i < totalNewEntries; i++) {
        /** @type {?} */
        const entryIsClassBased = i >= filteredStyleBindingNames.length;
        /** @type {?} */
        const adjustedIndex = entryIsClassBased ? (i - filteredStyleBindingNames.length) : i;
        /** @type {?} */
        const propName = entryIsClassBased ? filteredClassBindingNames[adjustedIndex] :
            filteredStyleBindingNames[adjustedIndex];
        /** @type {?} */
        let multiIndex;
        /** @type {?} */
        let singleIndex;
        if (entryIsClassBased) {
            multiIndex = multiClassesStartIndex +
                ((totalCurrentClassBindings + adjustedIndex) * 4 /* Size */);
            singleIndex = singleClassesStartIndex +
                ((totalCurrentClassBindings + adjustedIndex) * 4 /* Size */);
        }
        else {
            multiIndex =
                multiStylesStartIndex + ((totalCurrentStyleBindings + adjustedIndex) * 4 /* Size */);
            singleIndex = singleStylesStartIndex +
                ((totalCurrentStyleBindings + adjustedIndex) * 4 /* Size */);
        }
        // if a property is not found in the initial style values list then it
        // is ALWAYS added incase a follow-up directive introduces the same initial
        // style/class value later on.
        /** @type {?} */
        let initialValuesToLookup = entryIsClassBased ? initialClasses : initialStyles;
        /** @type {?} */
        let indexForInitial = getInitialStylingValuesIndexOf(initialValuesToLookup, propName);
        if (indexForInitial === -1) {
            indexForInitial = initialValuesToLookup.length + 1 /* ValueOffset */;
            initialValuesToLookup.push(propName, entryIsClassBased ? false : null);
        }
        else {
            indexForInitial += 1 /* ValueOffset */;
        }
        /** @type {?} */
        const initialFlag = prepareInitialFlag(context, propName, entryIsClassBased, styleSanitizer || null);
        setFlag(context, singleIndex, pointers(initialFlag, indexForInitial, multiIndex));
        setProp(context, singleIndex, propName);
        setValue(context, singleIndex, null);
        setPlayerBuilderIndex(context, singleIndex, 0, directiveIndex);
        setFlag(context, multiIndex, pointers(initialFlag, indexForInitial, singleIndex));
        setProp(context, multiIndex, propName);
        setValue(context, multiIndex, null);
        setPlayerBuilderIndex(context, multiIndex, 0, directiveIndex);
    }
    // the total classes/style values are updated so the next time the context is patched
    // additional style/class bindings from another directive then it knows exactly where
    // to insert them in the context
    singlePropOffsetValues[1 /* ClassesCountPosition */] =
        totalCurrentClassBindings + filteredClassBindingNames.length;
    singlePropOffsetValues[0 /* StylesCountPosition */] =
        totalCurrentStyleBindings + filteredStyleBindingNames.length;
    // there is no initial value flag for the master index since it doesn't
    // reference an initial style value
    /** @type {?} */
    const masterFlag = pointers(0, 0, multiStylesStartIndex) |
        (onlyProcessSingleClasses ? 16 /* OnlyProcessSingleClasses */ : 0);
    setFlag(context, 0 /* MasterFlagPosition */, masterFlag);
}
/**
 * Searches through the existing registry of directives
 * @param {?} context
 * @param {?} directiveRef
 * @param {?=} styleSanitizer
 * @return {?}
 */
function findOrPatchDirectiveIntoRegistry(context, directiveRef, styleSanitizer) {
    /** @type {?} */
    const directiveRefs = context[1 /* DirectiveRegistryPosition */];
    /** @type {?} */
    const nextOffsetInsertionIndex = context[4 /* SinglePropOffsetPositions */].length;
    /** @type {?} */
    let directiveIndex;
    /** @type {?} */
    const detectedIndex = getDirectiveRegistryValuesIndexOf(directiveRefs, directiveRef);
    if (detectedIndex === -1) {
        directiveIndex = directiveRefs.length / 4 /* Size */;
        directiveRefs.push(directiveRef, nextOffsetInsertionIndex, false, styleSanitizer || null);
    }
    else {
        /** @type {?} */
        const singlePropStartPosition = detectedIndex + 1 /* SinglePropValuesIndexOffset */;
        if ((/** @type {?} */ (directiveRefs[singlePropStartPosition])) >= 0) {
            // the directive has already been patched into the context
            return -1;
        }
        directiveIndex = detectedIndex / 4 /* Size */;
        // because the directive already existed this means that it was set during elementHostAttrs or
        // elementStart which means that the binding values were not here. Therefore, the values below
        // need to be applied so that single class and style properties can be assigned later.
        /** @type {?} */
        const singlePropPositionIndex = detectedIndex + 1 /* SinglePropValuesIndexOffset */;
        directiveRefs[singlePropPositionIndex] = nextOffsetInsertionIndex;
        // the sanitizer is also apart of the binding process and will be used when bindings are
        // applied.
        /** @type {?} */
        const styleSanitizerIndex = detectedIndex + 3 /* StyleSanitizerOffset */;
        directiveRefs[styleSanitizerIndex] = styleSanitizer || null;
    }
    return directiveIndex;
}
/**
 * @param {?} context
 * @param {?} bindingName
 * @param {?} start
 * @param {?} end
 * @return {?}
 */
function getMatchingBindingIndex(context, bindingName, start, end) {
    for (let j = start; j < end; j += 4 /* Size */) {
        if (getProp(context, j) === bindingName)
            return j;
    }
    return -1;
}
/**
 * Sets and resolves all `multi` styling on an `StylingContext` so that they can be
 * applied to the element once `renderStyling` is called.
 *
 * All missing styles/class (any values that are not provided in the new `styles`
 * or `classes` params) will resolve to `null` within their respective positions
 * in the context.
 *
 * @param {?} context The styling context that will be updated with the
 *    newly provided style values.
 * @param {?} classesInput The key/value map of CSS class names that will be used for the update.
 * @param {?=} stylesInput The key/value map of CSS styles that will be used for the update.
 * @param {?=} directiveRef
 * @return {?}
 */
export function updateStylingMap(context, classesInput, stylesInput, directiveRef) {
    stylesInput = stylesInput || null;
    /** @type {?} */
    const directiveIndex = getDirectiveIndexFromRegistry(context, directiveRef || null);
    /** @type {?} */
    const element = (/** @type {?} */ ((/** @type {?} */ (context[5 /* ElementPosition */]))));
    /** @type {?} */
    const classesPlayerBuilder = classesInput instanceof BoundPlayerFactory ?
        new ClassAndStylePlayerBuilder((/** @type {?} */ (classesInput)), element, 1 /* Class */) :
        null;
    /** @type {?} */
    const stylesPlayerBuilder = stylesInput instanceof BoundPlayerFactory ?
        new ClassAndStylePlayerBuilder((/** @type {?} */ (stylesInput)), element, 2 /* Style */) :
        null;
    /** @type {?} */
    const classesValue = classesPlayerBuilder ?
        (/** @type {?} */ (((/** @type {?} */ (classesInput))))).value :
        classesInput;
    /** @type {?} */
    const stylesValue = stylesPlayerBuilder ? (/** @type {?} */ (stylesInput))['value'] : stylesInput;
    // early exit (this is what's done to avoid using ctx.bind() to cache the value)
    /** @type {?} */
    const ignoreAllClassUpdates = limitToSingleClasses(context) || classesValue === NO_CHANGE ||
        classesValue === context[6 /* CachedClassValueOrInitialClassString */];
    /** @type {?} */
    const ignoreAllStyleUpdates = stylesValue === NO_CHANGE || stylesValue === context[7 /* CachedStyleValue */];
    if (ignoreAllClassUpdates && ignoreAllStyleUpdates)
        return;
    context[6 /* CachedClassValueOrInitialClassString */] = classesValue;
    context[7 /* CachedStyleValue */] = stylesValue;
    /** @type {?} */
    let classNames = EMPTY_ARRAY;
    /** @type {?} */
    let applyAllClasses = false;
    /** @type {?} */
    let playerBuildersAreDirty = false;
    /** @type {?} */
    const classesPlayerBuilderIndex = classesPlayerBuilder ? 1 /* ClassMapPlayerBuilderPosition */ : 0;
    if (hasPlayerBuilderChanged(context, classesPlayerBuilder, 1 /* ClassMapPlayerBuilderPosition */)) {
        setPlayerBuilder(context, classesPlayerBuilder, 1 /* ClassMapPlayerBuilderPosition */);
        playerBuildersAreDirty = true;
    }
    /** @type {?} */
    const stylesPlayerBuilderIndex = stylesPlayerBuilder ? 3 /* StyleMapPlayerBuilderPosition */ : 0;
    if (hasPlayerBuilderChanged(context, stylesPlayerBuilder, 3 /* StyleMapPlayerBuilderPosition */)) {
        setPlayerBuilder(context, stylesPlayerBuilder, 3 /* StyleMapPlayerBuilderPosition */);
        playerBuildersAreDirty = true;
    }
    // each time a string-based value pops up then it shouldn't require a deep
    // check of what's changed.
    if (!ignoreAllClassUpdates) {
        if (typeof classesValue == 'string') {
            classNames = classesValue.split(/\s+/);
            // this boolean is used to avoid having to create a key/value map of `true` values
            // since a classname string implies that all those classes are added
            applyAllClasses = true;
        }
        else {
            classNames = classesValue ? Object.keys(classesValue) : EMPTY_ARRAY;
        }
    }
    /** @type {?} */
    const classes = (/** @type {?} */ ((classesValue || EMPTY_OBJ)));
    /** @type {?} */
    const styleProps = stylesValue ? Object.keys(stylesValue) : EMPTY_ARRAY;
    /** @type {?} */
    const styles = stylesValue || EMPTY_OBJ;
    /** @type {?} */
    const classesStartIndex = styleProps.length;
    /** @type {?} */
    let multiStartIndex = getMultiStartIndex(context);
    /** @type {?} */
    let dirty = false;
    /** @type {?} */
    let ctxIndex = multiStartIndex;
    /** @type {?} */
    let propIndex = 0;
    /** @type {?} */
    const propLimit = styleProps.length + classNames.length;
    // the main loop here will try and figure out how the shape of the provided
    // styles differ with respect to the context. Later if the context/styles/classes
    // are off-balance then they will be dealt in another loop after this one
    while (ctxIndex < context.length && propIndex < propLimit) {
        /** @type {?} */
        const isClassBased = propIndex >= classesStartIndex;
        /** @type {?} */
        const processValue = (!isClassBased && !ignoreAllStyleUpdates) || (isClassBased && !ignoreAllClassUpdates);
        // when there is a cache-hit for a string-based class then we should
        // avoid doing any work diffing any of the changes
        if (processValue) {
            /** @type {?} */
            const adjustedPropIndex = isClassBased ? propIndex - classesStartIndex : propIndex;
            /** @type {?} */
            const newProp = isClassBased ? classNames[adjustedPropIndex] : styleProps[adjustedPropIndex];
            /** @type {?} */
            const newValue = isClassBased ? (applyAllClasses ? true : classes[newProp]) : styles[newProp];
            /** @type {?} */
            const playerBuilderIndex = isClassBased ? classesPlayerBuilderIndex : stylesPlayerBuilderIndex;
            /** @type {?} */
            const prop = getProp(context, ctxIndex);
            if (prop === newProp) {
                /** @type {?} */
                const value = getValue(context, ctxIndex);
                /** @type {?} */
                const flag = getPointers(context, ctxIndex);
                setPlayerBuilderIndex(context, ctxIndex, playerBuilderIndex, directiveIndex);
                if (hasValueChanged(flag, value, newValue)) {
                    setValue(context, ctxIndex, newValue);
                    playerBuildersAreDirty = playerBuildersAreDirty || !!playerBuilderIndex;
                    /** @type {?} */
                    const initialValue = getInitialValue(context, flag);
                    // SKIP IF INITIAL CHECK
                    // If the former `value` is `null` then it means that an initial value
                    // could be being rendered on screen. If that is the case then there is
                    // no point in updating the value incase it matches. In other words if the
                    // new value is the exact same as the previously rendered value (which
                    // happens to be the initial value) then do nothing.
                    if (value != null || hasValueChanged(flag, initialValue, newValue)) {
                        setDirty(context, ctxIndex, true);
                        dirty = true;
                    }
                }
            }
            else {
                /** @type {?} */
                const indexOfEntry = findEntryPositionByProp(context, newProp, ctxIndex);
                if (indexOfEntry > 0) {
                    // it was found at a later point ... just swap the values
                    /** @type {?} */
                    const valueToCompare = getValue(context, indexOfEntry);
                    /** @type {?} */
                    const flagToCompare = getPointers(context, indexOfEntry);
                    swapMultiContextEntries(context, ctxIndex, indexOfEntry);
                    if (hasValueChanged(flagToCompare, valueToCompare, newValue)) {
                        /** @type {?} */
                        const initialValue = getInitialValue(context, flagToCompare);
                        setValue(context, ctxIndex, newValue);
                        // same if statement logic as above (look for SKIP IF INITIAL CHECK).
                        if (valueToCompare != null || hasValueChanged(flagToCompare, initialValue, newValue)) {
                            setDirty(context, ctxIndex, true);
                            playerBuildersAreDirty = playerBuildersAreDirty || !!playerBuilderIndex;
                            dirty = true;
                        }
                    }
                }
                else {
                    // we only care to do this if the insertion is in the middle
                    /** @type {?} */
                    const newFlag = prepareInitialFlag(context, newProp, isClassBased, getStyleSanitizer(context, directiveIndex));
                    playerBuildersAreDirty = playerBuildersAreDirty || !!playerBuilderIndex;
                    insertNewMultiProperty(context, ctxIndex, isClassBased, newProp, newFlag, newValue, directiveIndex, playerBuilderIndex);
                    dirty = true;
                }
            }
        }
        ctxIndex += 4 /* Size */;
        propIndex++;
    }
    // this means that there are left-over values in the context that
    // were not included in the provided styles/classes and in this
    // case the  goal is to "remove" them from the context (by nullifying)
    while (ctxIndex < context.length) {
        /** @type {?} */
        const flag = getPointers(context, ctxIndex);
        /** @type {?} */
        const isClassBased = (flag & 2 /* Class */) === 2 /* Class */;
        /** @type {?} */
        const processValue = (!isClassBased && !ignoreAllStyleUpdates) || (isClassBased && !ignoreAllClassUpdates);
        if (processValue) {
            /** @type {?} */
            const value = getValue(context, ctxIndex);
            /** @type {?} */
            const doRemoveValue = valueExists(value, isClassBased);
            if (doRemoveValue) {
                setDirty(context, ctxIndex, true);
                setValue(context, ctxIndex, null);
                // we keep the player factory the same so that the `nulled` value can
                // be instructed into the player because removing a style and/or a class
                // is a valid animation player instruction.
                /** @type {?} */
                const playerBuilderIndex = isClassBased ? classesPlayerBuilderIndex : stylesPlayerBuilderIndex;
                setPlayerBuilderIndex(context, ctxIndex, playerBuilderIndex, directiveIndex);
                dirty = true;
            }
        }
        ctxIndex += 4 /* Size */;
    }
    // this means that there are left-over properties in the context that
    // were not detected in the context during the loop above. In that
    // case we want to add the new entries into the list
    /** @type {?} */
    const sanitizer = getStyleSanitizer(context, directiveIndex);
    while (propIndex < propLimit) {
        /** @type {?} */
        const isClassBased = propIndex >= classesStartIndex;
        /** @type {?} */
        const processValue = (!isClassBased && !ignoreAllStyleUpdates) || (isClassBased && !ignoreAllClassUpdates);
        if (processValue) {
            /** @type {?} */
            const adjustedPropIndex = isClassBased ? propIndex - classesStartIndex : propIndex;
            /** @type {?} */
            const prop = isClassBased ? classNames[adjustedPropIndex] : styleProps[adjustedPropIndex];
            /** @type {?} */
            const value = isClassBased ? (applyAllClasses ? true : classes[prop]) : styles[prop];
            /** @type {?} */
            const flag = prepareInitialFlag(context, prop, isClassBased, sanitizer) | 1 /* Dirty */;
            /** @type {?} */
            const playerBuilderIndex = isClassBased ? classesPlayerBuilderIndex : stylesPlayerBuilderIndex;
            /** @type {?} */
            const ctxIndex = context.length;
            context.push(flag, prop, value, 0);
            setPlayerBuilderIndex(context, ctxIndex, playerBuilderIndex, directiveIndex);
            dirty = true;
        }
        propIndex++;
    }
    if (dirty) {
        setContextDirty(context, true);
        setDirectiveDirty(context, directiveIndex, true);
    }
    if (playerBuildersAreDirty) {
        setContextPlayersDirty(context, true);
    }
}
/**
 * This method will toggle the referenced CSS class (by the provided index)
 * within the given context.
 *
 * @param {?} context The styling context that will be updated with the
 *    newly provided class value.
 * @param {?} offset The index of the CSS class which is being updated.
 * @param {?} addOrRemove Whether or not to add or remove the CSS class
 * @param {?=} directiveRef
 * @return {?}
 */
export function updateClassProp(context, offset, addOrRemove, directiveRef) {
    _updateSingleStylingValue(context, offset, addOrRemove, true, directiveRef);
}
/**
 * Sets and resolves a single style value on the provided `StylingContext` so
 * that they can be applied to the element once `renderStyling` is called.
 *
 * Note that prop-level styling values are considered higher priority than any styling that
 * has been applied using `updateStylingMap`, therefore, when styling values are rendered
 * then any styles/classes that have been applied using this function will be considered first
 * (then multi values second and then initial values as a backup).
 *
 * @param {?} context The styling context that will be updated with the
 *    newly provided style value.
 * @param {?} offset The index of the property which is being updated.
 * @param {?} input
 * @param {?=} directiveRef an optional reference to the directive responsible
 *    for this binding change. If present then style binding will only
 *    actualize if the directive has ownership over this binding
 *    (see styling.ts#directives for more information about the algorithm).
 * @return {?}
 */
export function updateStyleProp(context, offset, input, directiveRef) {
    _updateSingleStylingValue(context, offset, input, false, directiveRef);
}
/**
 * @param {?} context
 * @param {?} offset
 * @param {?} input
 * @param {?} isClassBased
 * @param {?} directiveRef
 * @return {?}
 */
function _updateSingleStylingValue(context, offset, input, isClassBased, directiveRef) {
    /** @type {?} */
    const directiveIndex = getDirectiveIndexFromRegistry(context, directiveRef || null);
    /** @type {?} */
    const singleIndex = getSinglePropIndexValue(context, directiveIndex, offset, isClassBased);
    /** @type {?} */
    const currValue = getValue(context, singleIndex);
    /** @type {?} */
    const currFlag = getPointers(context, singleIndex);
    /** @type {?} */
    const currDirective = getDirectiveIndexFromEntry(context, singleIndex);
    /** @type {?} */
    const value = (input instanceof BoundPlayerFactory) ? input.value : input;
    if (hasValueChanged(currFlag, currValue, value) &&
        allowValueChange(currValue, value, currDirective, directiveIndex)) {
        /** @type {?} */
        const isClassBased = (currFlag & 2 /* Class */) === 2 /* Class */;
        /** @type {?} */
        const element = (/** @type {?} */ ((/** @type {?} */ (context[5 /* ElementPosition */]))));
        /** @type {?} */
        const playerBuilder = input instanceof BoundPlayerFactory ?
            new ClassAndStylePlayerBuilder((/** @type {?} */ (input)), element, isClassBased ? 1 /* Class */ : 2 /* Style */) :
            null;
        /** @type {?} */
        const value = (/** @type {?} */ ((playerBuilder ? ((/** @type {?} */ (input))).value : input)));
        /** @type {?} */
        const currPlayerIndex = getPlayerBuilderIndex(context, singleIndex);
        /** @type {?} */
        let playerBuildersAreDirty = false;
        /** @type {?} */
        let playerBuilderIndex = playerBuilder ? currPlayerIndex : 0;
        if (hasPlayerBuilderChanged(context, playerBuilder, currPlayerIndex)) {
            /** @type {?} */
            const newIndex = setPlayerBuilder(context, playerBuilder, currPlayerIndex);
            playerBuilderIndex = playerBuilder ? newIndex : 0;
            playerBuildersAreDirty = true;
        }
        if (playerBuildersAreDirty || currDirective !== directiveIndex) {
            setPlayerBuilderIndex(context, singleIndex, playerBuilderIndex, directiveIndex);
        }
        if (currDirective !== directiveIndex) {
            /** @type {?} */
            const prop = getProp(context, singleIndex);
            /** @type {?} */
            const sanitizer = getStyleSanitizer(context, directiveIndex);
            setSanitizeFlag(context, singleIndex, (sanitizer && sanitizer(prop)) ? true : false);
        }
        // the value will always get updated (even if the dirty flag is skipped)
        setValue(context, singleIndex, value);
        /** @type {?} */
        const indexForMulti = getMultiOrSingleIndex(currFlag);
        // if the value is the same in the multi-area then there's no point in re-assembling
        /** @type {?} */
        const valueForMulti = getValue(context, indexForMulti);
        if (!valueForMulti || hasValueChanged(currFlag, valueForMulti, value)) {
            /** @type {?} */
            let multiDirty = false;
            /** @type {?} */
            let singleDirty = true;
            // only when the value is set to `null` should the multi-value get flagged
            if (!valueExists(value, isClassBased) && valueExists(valueForMulti, isClassBased)) {
                multiDirty = true;
                singleDirty = false;
            }
            setDirty(context, indexForMulti, multiDirty);
            setDirty(context, singleIndex, singleDirty);
            setDirectiveDirty(context, directiveIndex, true);
            setContextDirty(context, true);
        }
        if (playerBuildersAreDirty) {
            setContextPlayersDirty(context, true);
        }
    }
}
/**
 * Renders all queued styling using a renderer onto the given element.
 *
 * This function works by rendering any styles (that have been applied
 * using `updateStylingMap`) and any classes (that have been applied using
 * `updateStyleProp`) onto the provided element using the provided renderer.
 * Just before the styles/classes are rendered a final key/value style map
 * will be assembled (if `styleStore` or `classStore` are provided).
 *
 * @param {?} context The styling context that will be used to determine
 *      what styles will be rendered
 * @param {?} renderer the renderer that will be used to apply the styling
 * @param {?} rootOrView
 * @param {?} isFirstRender
 * @param {?=} classesStore if provided, the updated class values will be applied
 *    to this key/value map instead of being renderered via the renderer.
 * @param {?=} stylesStore if provided, the updated style values will be applied
 *    to this key/value map instead of being renderered via the renderer.
 * @param {?=} directiveRef an optional directive that will be used to target which
 *    styling values are rendered. If left empty, only the bindings that are
 *    registered on the template will be rendered.
 * @return {?} number the total amount of players that got queued for animation (if any)
 */
export function renderStyling(context, renderer, rootOrView, isFirstRender, classesStore, stylesStore, directiveRef) {
    /** @type {?} */
    let totalPlayersQueued = 0;
    /** @type {?} */
    const targetDirectiveIndex = getDirectiveIndexFromRegistry(context, directiveRef || null);
    if (isContextDirty(context) && isDirectiveDirty(context, targetDirectiveIndex)) {
        /** @type {?} */
        const flushPlayerBuilders = context[0 /* MasterFlagPosition */] & 8 /* PlayerBuildersDirty */;
        /** @type {?} */
        const native = (/** @type {?} */ (context[5 /* ElementPosition */]));
        /** @type {?} */
        const multiStartIndex = getMultiStartIndex(context);
        /** @type {?} */
        const onlySingleClasses = limitToSingleClasses(context);
        /** @type {?} */
        let stillDirty = false;
        for (let i = 9 /* SingleStylesStartPosition */; i < context.length; i += 4 /* Size */) {
            // there is no point in rendering styles that have not changed on screen
            if (isDirty(context, i)) {
                /** @type {?} */
                const flag = getPointers(context, i);
                /** @type {?} */
                const directiveIndex = getDirectiveIndexFromEntry(context, i);
                if (targetDirectiveIndex !== directiveIndex) {
                    stillDirty = true;
                    continue;
                }
                /** @type {?} */
                const prop = getProp(context, i);
                /** @type {?} */
                const value = getValue(context, i);
                /** @type {?} */
                const styleSanitizer = (flag & 4 /* Sanitize */) ? getStyleSanitizer(context, directiveIndex) : null;
                /** @type {?} */
                const playerBuilder = getPlayerBuilder(context, i);
                /** @type {?} */
                const isClassBased = flag & 2 /* Class */ ? true : false;
                /** @type {?} */
                const isInSingleRegion = i < multiStartIndex;
                /** @type {?} */
                const readInitialValue = !isClassBased || !onlySingleClasses;
                /** @type {?} */
                let valueToApply = value;
                // VALUE DEFER CASE 1: Use a multi value instead of a null single value
                // this check implies that a single value was removed and we
                // should now defer to a multi value and use that (if set).
                if (isInSingleRegion && !valueExists(valueToApply, isClassBased)) {
                    // single values ALWAYS have a reference to a multi index
                    /** @type {?} */
                    const multiIndex = getMultiOrSingleIndex(flag);
                    valueToApply = getValue(context, multiIndex);
                }
                // VALUE DEFER CASE 2: Use the initial value if all else fails (is falsy)
                // the initial value will always be a string or null,
                // therefore we can safely adopt it incase there's nothing else
                // note that this should always be a falsy check since `false` is used
                // for both class and style comparisons (styles can't be false and false
                // classes are turned off and should therefore defer to their initial values)
                // Note that we ignore class-based deferals because otherwise a class can never
                // be removed in the case that it exists as true in the initial classes list...
                if (!isClassBased && !valueExists(valueToApply, isClassBased) && readInitialValue) {
                    valueToApply = getInitialValue(context, flag);
                }
                // if the first render is true then we do not want to start applying falsy
                // values to the DOM element's styling. Otherwise then we know there has
                // been a change and even if it's falsy then it's removing something that
                // was truthy before.
                /** @type {?} */
                const doApplyValue = isFirstRender ? valueToApply : true;
                if (doApplyValue) {
                    if (isClassBased) {
                        setClass(native, prop, valueToApply ? true : false, renderer, classesStore, playerBuilder);
                    }
                    else {
                        setStyle(native, prop, (/** @type {?} */ (valueToApply)), renderer, styleSanitizer, stylesStore, playerBuilder);
                    }
                }
                setDirty(context, i, false);
            }
        }
        if (flushPlayerBuilders) {
            /** @type {?} */
            const rootContext = Array.isArray(rootOrView) ? getRootContext(rootOrView) : (/** @type {?} */ (rootOrView));
            /** @type {?} */
            const playerContext = (/** @type {?} */ (getPlayerContext(context)));
            /** @type {?} */
            const playersStartIndex = playerContext[0 /* NonBuilderPlayersStart */];
            for (let i = 1 /* PlayerBuildersStartPosition */; i < playersStartIndex; i += 2 /* PlayerAndPlayerBuildersTupleSize */) {
                /** @type {?} */
                const builder = (/** @type {?} */ (playerContext[i]));
                /** @type {?} */
                const playerInsertionIndex = i + 1 /* PlayerOffsetPosition */;
                /** @type {?} */
                const oldPlayer = (/** @type {?} */ (playerContext[playerInsertionIndex]));
                if (builder) {
                    /** @type {?} */
                    const player = builder.buildPlayer(oldPlayer, isFirstRender);
                    if (player !== undefined) {
                        if (player != null) {
                            /** @type {?} */
                            const wasQueued = addPlayerInternal(playerContext, rootContext, (/** @type {?} */ (native)), player, playerInsertionIndex);
                            wasQueued && totalPlayersQueued++;
                        }
                        if (oldPlayer) {
                            oldPlayer.destroy();
                        }
                    }
                }
                else if (oldPlayer) {
                    // the player builder has been removed ... therefore we should delete the associated
                    // player
                    oldPlayer.destroy();
                }
            }
            setContextPlayersDirty(context, false);
        }
        setDirectiveDirty(context, targetDirectiveIndex, false);
        setContextDirty(context, stillDirty);
    }
    return totalPlayersQueued;
}
/**
 * This function renders a given CSS prop/value entry using the
 * provided renderer. If a `store` value is provided then
 * that will be used a render context instead of the provided
 * renderer.
 *
 * @param {?} native the DOM Element
 * @param {?} prop the CSS style property that will be rendered
 * @param {?} value the CSS style value that will be rendered
 * @param {?} renderer
 * @param {?} sanitizer
 * @param {?=} store an optional key/value map that will be used as a context to render styles on
 * @param {?=} playerBuilder
 * @return {?}
 */
export function setStyle(native, prop, value, renderer, sanitizer, store, playerBuilder) {
    value = sanitizer && value ? sanitizer(prop, value) : value;
    if (store || playerBuilder) {
        if (store) {
            store.setValue(prop, value);
        }
        if (playerBuilder) {
            playerBuilder.setValue(prop, value);
        }
    }
    else if (value) {
        value = value.toString(); // opacity, z-index and flexbox all have number values which may not
        // assign as numbers
        ngDevMode && ngDevMode.rendererSetStyle++;
        isProceduralRenderer(renderer) ?
            renderer.setStyle(native, prop, value, RendererStyleFlags3.DashCase) :
            native['style'].setProperty(prop, value);
    }
    else {
        ngDevMode && ngDevMode.rendererRemoveStyle++;
        isProceduralRenderer(renderer) ?
            renderer.removeStyle(native, prop, RendererStyleFlags3.DashCase) :
            native['style'].removeProperty(prop);
    }
}
/**
 * This function renders a given CSS class value using the provided
 * renderer (by adding or removing it from the provided element).
 * If a `store` value is provided then that will be used a render
 * context instead of the provided renderer.
 *
 * @param {?} native the DOM Element
 * @param {?} className
 * @param {?} add
 * @param {?} renderer
 * @param {?=} store an optional key/value map that will be used as a context to render styles on
 * @param {?=} playerBuilder
 * @return {?}
 */
function setClass(native, className, add, renderer, store, playerBuilder) {
    if (store || playerBuilder) {
        if (store) {
            store.setValue(className, add);
        }
        if (playerBuilder) {
            playerBuilder.setValue(className, add);
        }
    }
    else if (add) {
        ngDevMode && ngDevMode.rendererAddClass++;
        isProceduralRenderer(renderer) ? renderer.addClass(native, className) :
            native['classList'].add(className);
    }
    else {
        ngDevMode && ngDevMode.rendererRemoveClass++;
        isProceduralRenderer(renderer) ? renderer.removeClass(native, className) :
            native['classList'].remove(className);
    }
}
/**
 * @param {?} context
 * @param {?} index
 * @param {?} sanitizeYes
 * @return {?}
 */
function setSanitizeFlag(context, index, sanitizeYes) {
    if (sanitizeYes) {
        ((/** @type {?} */ (context[index]))) |= 4 /* Sanitize */;
    }
    else {
        ((/** @type {?} */ (context[index]))) &= ~4 /* Sanitize */;
    }
}
/**
 * @param {?} context
 * @param {?} index
 * @param {?} isDirtyYes
 * @return {?}
 */
function setDirty(context, index, isDirtyYes) {
    /** @type {?} */
    const adjustedIndex = index >= 9 /* SingleStylesStartPosition */ ? (index + 0 /* FlagsOffset */) : index;
    if (isDirtyYes) {
        ((/** @type {?} */ (context[adjustedIndex]))) |= 1 /* Dirty */;
    }
    else {
        ((/** @type {?} */ (context[adjustedIndex]))) &= ~1 /* Dirty */;
    }
}
/**
 * @param {?} context
 * @param {?} index
 * @return {?}
 */
function isDirty(context, index) {
    /** @type {?} */
    const adjustedIndex = index >= 9 /* SingleStylesStartPosition */ ? (index + 0 /* FlagsOffset */) : index;
    return (((/** @type {?} */ (context[adjustedIndex]))) & 1 /* Dirty */) == 1 /* Dirty */;
}
/**
 * @param {?} context
 * @param {?} index
 * @return {?}
 */
export function isClassBasedValue(context, index) {
    /** @type {?} */
    const adjustedIndex = index >= 9 /* SingleStylesStartPosition */ ? (index + 0 /* FlagsOffset */) : index;
    return (((/** @type {?} */ (context[adjustedIndex]))) & 2 /* Class */) == 2 /* Class */;
}
/**
 * @param {?} context
 * @param {?} index
 * @return {?}
 */
function isSanitizable(context, index) {
    /** @type {?} */
    const adjustedIndex = index >= 9 /* SingleStylesStartPosition */ ? (index + 0 /* FlagsOffset */) : index;
    return (((/** @type {?} */ (context[adjustedIndex]))) & 4 /* Sanitize */) == 4 /* Sanitize */;
}
/**
 * @param {?} configFlag
 * @param {?} staticIndex
 * @param {?} dynamicIndex
 * @return {?}
 */
function pointers(configFlag, staticIndex, dynamicIndex) {
    return (configFlag & 63 /* BitMask */) | (staticIndex << 6 /* BitCountSize */) |
        (dynamicIndex << (14 /* BitCountSize */ + 6 /* BitCountSize */));
}
/**
 * @param {?} context
 * @param {?} flag
 * @return {?}
 */
function getInitialValue(context, flag) {
    /** @type {?} */
    const index = getInitialIndex(flag);
    /** @type {?} */
    const entryIsClassBased = flag & 2 /* Class */;
    /** @type {?} */
    const initialValues = entryIsClassBased ? context[3 /* InitialClassValuesPosition */] :
        context[2 /* InitialStyleValuesPosition */];
    return initialValues[index];
}
/**
 * @param {?} flag
 * @return {?}
 */
function getInitialIndex(flag) {
    return (flag >> 6 /* BitCountSize */) & 16383 /* BitMask */;
}
/**
 * @param {?} flag
 * @return {?}
 */
function getMultiOrSingleIndex(flag) {
    /** @type {?} */
    const index = (flag >> (14 /* BitCountSize */ + 6 /* BitCountSize */)) & 16383 /* BitMask */;
    return index >= 9 /* SingleStylesStartPosition */ ? index : -1;
}
/**
 * @param {?} context
 * @return {?}
 */
function getMultiStartIndex(context) {
    return (/** @type {?} */ (getMultiOrSingleIndex(context[0 /* MasterFlagPosition */])));
}
/**
 * @param {?} context
 * @param {?} index
 * @param {?} prop
 * @return {?}
 */
function setProp(context, index, prop) {
    context[index + 1 /* PropertyOffset */] = prop;
}
/**
 * @param {?} context
 * @param {?} index
 * @param {?} value
 * @return {?}
 */
function setValue(context, index, value) {
    context[index + 2 /* ValueOffset */] = value;
}
/**
 * @param {?} context
 * @param {?} builder
 * @param {?} index
 * @return {?}
 */
function hasPlayerBuilderChanged(context, builder, index) {
    /** @type {?} */
    const playerContext = (/** @type {?} */ (context[8 /* PlayerContext */]));
    if (builder) {
        if (!playerContext || index === 0) {
            return true;
        }
    }
    else if (!playerContext) {
        return false;
    }
    return playerContext[index] !== builder;
}
/**
 * @param {?} context
 * @param {?} builder
 * @param {?} insertionIndex
 * @return {?}
 */
function setPlayerBuilder(context, builder, insertionIndex) {
    /** @type {?} */
    let playerContext = context[8 /* PlayerContext */] || allocPlayerContext(context);
    if (insertionIndex > 0) {
        playerContext[insertionIndex] = builder;
    }
    else {
        insertionIndex = playerContext[0 /* NonBuilderPlayersStart */];
        playerContext.splice(insertionIndex, 0, builder, null);
        playerContext[0 /* NonBuilderPlayersStart */] +=
            2 /* PlayerAndPlayerBuildersTupleSize */;
    }
    return insertionIndex;
}
/**
 * @param {?} directiveIndex
 * @param {?} playerIndex
 * @return {?}
 */
export function directiveOwnerPointers(directiveIndex, playerIndex) {
    return (playerIndex << 16 /* BitCountSize */) | directiveIndex;
}
/**
 * @param {?} context
 * @param {?} index
 * @param {?} playerBuilderIndex
 * @param {?} directiveIndex
 * @return {?}
 */
function setPlayerBuilderIndex(context, index, playerBuilderIndex, directiveIndex) {
    /** @type {?} */
    const value = directiveOwnerPointers(directiveIndex, playerBuilderIndex);
    context[index + 3 /* PlayerBuilderIndexOffset */] = value;
}
/**
 * @param {?} context
 * @param {?} index
 * @return {?}
 */
function getPlayerBuilderIndex(context, index) {
    /** @type {?} */
    const flag = (/** @type {?} */ (context[index + 3 /* PlayerBuilderIndexOffset */]));
    /** @type {?} */
    const playerBuilderIndex = (flag >> 16 /* BitCountSize */) &
        65535 /* BitMask */;
    return playerBuilderIndex;
}
/**
 * @param {?} context
 * @param {?} index
 * @return {?}
 */
function getPlayerBuilder(context, index) {
    /** @type {?} */
    const playerBuilderIndex = getPlayerBuilderIndex(context, index);
    if (playerBuilderIndex) {
        /** @type {?} */
        const playerContext = context[8 /* PlayerContext */];
        if (playerContext) {
            return (/** @type {?} */ (playerContext[playerBuilderIndex]));
        }
    }
    return null;
}
/**
 * @param {?} context
 * @param {?} index
 * @param {?} flag
 * @return {?}
 */
function setFlag(context, index, flag) {
    /** @type {?} */
    const adjustedIndex = index === 0 /* MasterFlagPosition */ ? index : (index + 0 /* FlagsOffset */);
    context[adjustedIndex] = flag;
}
/**
 * @param {?} context
 * @param {?} index
 * @return {?}
 */
function getPointers(context, index) {
    /** @type {?} */
    const adjustedIndex = index === 0 /* MasterFlagPosition */ ? index : (index + 0 /* FlagsOffset */);
    return (/** @type {?} */ (context[adjustedIndex]));
}
/**
 * @param {?} context
 * @param {?} index
 * @return {?}
 */
export function getValue(context, index) {
    return (/** @type {?} */ (context[index + 2 /* ValueOffset */]));
}
/**
 * @param {?} context
 * @param {?} index
 * @return {?}
 */
export function getProp(context, index) {
    return (/** @type {?} */ (context[index + 1 /* PropertyOffset */]));
}
/**
 * @param {?} context
 * @return {?}
 */
export function isContextDirty(context) {
    return isDirty(context, 0 /* MasterFlagPosition */);
}
/**
 * @param {?} context
 * @return {?}
 */
export function limitToSingleClasses(context) {
    return context[0 /* MasterFlagPosition */] & 16 /* OnlyProcessSingleClasses */;
}
/**
 * @param {?} context
 * @param {?} isDirtyYes
 * @return {?}
 */
export function setContextDirty(context, isDirtyYes) {
    setDirty(context, 0 /* MasterFlagPosition */, isDirtyYes);
}
/**
 * @param {?} context
 * @param {?} isDirtyYes
 * @return {?}
 */
export function setContextPlayersDirty(context, isDirtyYes) {
    if (isDirtyYes) {
        ((/** @type {?} */ (context[0 /* MasterFlagPosition */]))) |= 8 /* PlayerBuildersDirty */;
    }
    else {
        ((/** @type {?} */ (context[0 /* MasterFlagPosition */]))) &= ~8 /* PlayerBuildersDirty */;
    }
}
/**
 * @param {?} context
 * @param {?} prop
 * @param {?=} startIndex
 * @return {?}
 */
function findEntryPositionByProp(context, prop, startIndex) {
    for (let i = (startIndex || 0) + 1 /* PropertyOffset */; i < context.length; i += 4 /* Size */) {
        /** @type {?} */
        const thisProp = context[i];
        if (thisProp == prop) {
            return i - 1 /* PropertyOffset */;
        }
    }
    return -1;
}
/**
 * @param {?} context
 * @param {?} indexA
 * @param {?} indexB
 * @return {?}
 */
function swapMultiContextEntries(context, indexA, indexB) {
    /** @type {?} */
    const tmpValue = getValue(context, indexA);
    /** @type {?} */
    const tmpProp = getProp(context, indexA);
    /** @type {?} */
    const tmpFlag = getPointers(context, indexA);
    /** @type {?} */
    const tmpPlayerBuilderIndex = getPlayerBuilderIndex(context, indexA);
    /** @type {?} */
    let flagA = tmpFlag;
    /** @type {?} */
    let flagB = getPointers(context, indexB);
    /** @type {?} */
    const singleIndexA = getMultiOrSingleIndex(flagA);
    if (singleIndexA >= 0) {
        /** @type {?} */
        const _flag = getPointers(context, singleIndexA);
        /** @type {?} */
        const _initial = getInitialIndex(_flag);
        setFlag(context, singleIndexA, pointers(_flag, _initial, indexB));
    }
    /** @type {?} */
    const singleIndexB = getMultiOrSingleIndex(flagB);
    if (singleIndexB >= 0) {
        /** @type {?} */
        const _flag = getPointers(context, singleIndexB);
        /** @type {?} */
        const _initial = getInitialIndex(_flag);
        setFlag(context, singleIndexB, pointers(_flag, _initial, indexA));
    }
    setValue(context, indexA, getValue(context, indexB));
    setProp(context, indexA, getProp(context, indexB));
    setFlag(context, indexA, getPointers(context, indexB));
    /** @type {?} */
    const playerIndexA = getPlayerBuilderIndex(context, indexB);
    /** @type {?} */
    const directiveIndexA = 0;
    setPlayerBuilderIndex(context, indexA, playerIndexA, directiveIndexA);
    setValue(context, indexB, tmpValue);
    setProp(context, indexB, tmpProp);
    setFlag(context, indexB, tmpFlag);
    setPlayerBuilderIndex(context, indexB, tmpPlayerBuilderIndex, directiveIndexA);
}
/**
 * @param {?} context
 * @param {?} indexStartPosition
 * @return {?}
 */
function updateSinglePointerValues(context, indexStartPosition) {
    for (let i = indexStartPosition; i < context.length; i += 4 /* Size */) {
        /** @type {?} */
        const multiFlag = getPointers(context, i);
        /** @type {?} */
        const singleIndex = getMultiOrSingleIndex(multiFlag);
        if (singleIndex > 0) {
            /** @type {?} */
            const singleFlag = getPointers(context, singleIndex);
            /** @type {?} */
            const initialIndexForSingle = getInitialIndex(singleFlag);
            /** @type {?} */
            const flagValue = (isDirty(context, singleIndex) ? 1 /* Dirty */ : 0 /* None */) |
                (isClassBasedValue(context, singleIndex) ? 2 /* Class */ : 0 /* None */) |
                (isSanitizable(context, singleIndex) ? 4 /* Sanitize */ : 0 /* None */);
            /** @type {?} */
            const updatedFlag = pointers(flagValue, initialIndexForSingle, i);
            setFlag(context, singleIndex, updatedFlag);
        }
    }
}
/**
 * @param {?} context
 * @param {?} index
 * @param {?} classBased
 * @param {?} name
 * @param {?} flag
 * @param {?} value
 * @param {?} directiveIndex
 * @param {?} playerIndex
 * @return {?}
 */
function insertNewMultiProperty(context, index, classBased, name, flag, value, directiveIndex, playerIndex) {
    /** @type {?} */
    const doShift = index < context.length;
    // prop does not exist in the list, add it in
    context.splice(index, 0, flag | 1 /* Dirty */ | (classBased ? 2 /* Class */ : 0 /* None */), name, value, 0);
    setPlayerBuilderIndex(context, index, playerIndex, directiveIndex);
    if (doShift) {
        // because the value was inserted midway into the array then we
        // need to update all the shifted multi values' single value
        // pointers to point to the newly shifted location
        updateSinglePointerValues(context, index + 4 /* Size */);
    }
}
/**
 * @param {?} value
 * @param {?=} isClassBased
 * @return {?}
 */
function valueExists(value, isClassBased) {
    if (isClassBased) {
        return value ? true : false;
    }
    return value !== null;
}
/**
 * @param {?} context
 * @param {?} prop
 * @param {?} entryIsClassBased
 * @param {?=} sanitizer
 * @return {?}
 */
function prepareInitialFlag(context, prop, entryIsClassBased, sanitizer) {
    /** @type {?} */
    let flag = (sanitizer && sanitizer(prop)) ? 4 /* Sanitize */ : 0 /* None */;
    /** @type {?} */
    let initialIndex;
    if (entryIsClassBased) {
        flag |= 2 /* Class */;
        initialIndex =
            getInitialStylingValuesIndexOf(context[3 /* InitialClassValuesPosition */], prop);
    }
    else {
        initialIndex =
            getInitialStylingValuesIndexOf(context[2 /* InitialStyleValuesPosition */], prop);
    }
    initialIndex = initialIndex > 0 ? (initialIndex + 1 /* ValueOffset */) : 0;
    return pointers(flag, initialIndex, 0);
}
/**
 * @param {?} flag
 * @param {?} a
 * @param {?} b
 * @return {?}
 */
function hasValueChanged(flag, a, b) {
    /** @type {?} */
    const isClassBased = flag & 2 /* Class */;
    /** @type {?} */
    const hasValues = a && b;
    /** @type {?} */
    const usesSanitizer = flag & 4 /* Sanitize */;
    // the toString() comparison ensures that a value is checked
    // ... otherwise (during sanitization bypassing) the === comparsion
    // would fail since a new String() instance is created
    if (!isClassBased && hasValues && usesSanitizer) {
        // we know for sure we're dealing with strings at this point
        return ((/** @type {?} */ (a))).toString() !== ((/** @type {?} */ (b))).toString();
    }
    // everything else is safe to check with a normal equality check
    return a !== b;
}
/**
 * @template T
 */
export class ClassAndStylePlayerBuilder {
    /**
     * @param {?} factory
     * @param {?} _element
     * @param {?} _type
     */
    constructor(factory, _element, _type) {
        this._element = _element;
        this._type = _type;
        this._values = {};
        this._dirty = false;
        this._factory = (/** @type {?} */ (factory));
    }
    /**
     * @param {?} prop
     * @param {?} value
     * @return {?}
     */
    setValue(prop, value) {
        if (this._values[prop] !== value) {
            this._values[prop] = value;
            this._dirty = true;
        }
    }
    /**
     * @param {?} currentPlayer
     * @param {?} isFirstRender
     * @return {?}
     */
    buildPlayer(currentPlayer, isFirstRender) {
        // if no values have been set here then this means the binding didn't
        // change and therefore the binding values were not updated through
        // `setValue` which means no new player will be provided.
        if (this._dirty) {
            /** @type {?} */
            const player = this._factory.fn(this._element, this._type, (/** @type {?} */ (this._values)), isFirstRender, currentPlayer || null);
            this._values = {};
            this._dirty = false;
            return player;
        }
        return undefined;
    }
}
if (false) {
    /**
     * @type {?}
     * @private
     */
    ClassAndStylePlayerBuilder.prototype._values;
    /**
     * @type {?}
     * @private
     */
    ClassAndStylePlayerBuilder.prototype._dirty;
    /**
     * @type {?}
     * @private
     */
    ClassAndStylePlayerBuilder.prototype._factory;
    /**
     * @type {?}
     * @private
     */
    ClassAndStylePlayerBuilder.prototype._element;
    /**
     * @type {?}
     * @private
     */
    ClassAndStylePlayerBuilder.prototype._type;
}
/**
 * Used to provide a summary of the state of the styling context.
 *
 * This is an internal interface that is only used inside of test tooling to
 * help summarize what's going on within the styling context. None of this code
 * is designed to be exported publicly and will, therefore, be tree-shaken away
 * during runtime.
 * @record
 */
export function LogSummary() { }
if (false) {
    /** @type {?} */
    LogSummary.prototype.name;
    /** @type {?} */
    LogSummary.prototype.staticIndex;
    /** @type {?} */
    LogSummary.prototype.dynamicIndex;
    /** @type {?} */
    LogSummary.prototype.value;
    /** @type {?} */
    LogSummary.prototype.flags;
}
/**
 * @param {?} source
 * @param {?=} index
 * @return {?}
 */
export function generateConfigSummary(source, index) {
    /** @type {?} */
    let flag;
    /** @type {?} */
    let name = 'config value for ';
    if (Array.isArray(source)) {
        if (index) {
            name += 'index: ' + index;
        }
        else {
            name += 'master config';
        }
        index = index || 0 /* MasterFlagPosition */;
        flag = (/** @type {?} */ (source[index]));
    }
    else {
        flag = source;
        name += 'index: ' + flag;
    }
    /** @type {?} */
    const dynamicIndex = getMultiOrSingleIndex(flag);
    /** @type {?} */
    const staticIndex = getInitialIndex(flag);
    return {
        name,
        staticIndex,
        dynamicIndex,
        value: flag,
        flags: {
            dirty: flag & 1 /* Dirty */ ? true : false,
            class: flag & 2 /* Class */ ? true : false,
            sanitize: flag & 4 /* Sanitize */ ? true : false,
            playerBuildersDirty: flag & 8 /* PlayerBuildersDirty */ ? true : false,
            onlyProcessSingleClasses: flag & 16 /* OnlyProcessSingleClasses */ ? true : false,
            bindingAllocationLocked: flag & 32 /* BindingAllocationLocked */ ? true : false,
        }
    };
}
/**
 * @param {?} context
 * @param {?} index
 * @return {?}
 */
export function getDirectiveIndexFromEntry(context, index) {
    /** @type {?} */
    const value = (/** @type {?} */ (context[index + 3 /* PlayerBuilderIndexOffset */]));
    return value & 65535 /* BitMask */;
}
/**
 * @param {?} context
 * @param {?} directive
 * @return {?}
 */
function getDirectiveIndexFromRegistry(context, directive) {
    /** @type {?} */
    const index = getDirectiveRegistryValuesIndexOf(context[1 /* DirectiveRegistryPosition */], directive);
    ngDevMode &&
        assertNotEqual(index, -1, `The provided directive ${directive} has not been allocated to the element\'s style/class bindings`);
    return index > 0 ? index / 4 /* Size */ : 0;
    // return index / DirectiveRegistryValuesIndex.Size;
}
/**
 * @param {?} directives
 * @param {?} directive
 * @return {?}
 */
function getDirectiveRegistryValuesIndexOf(directives, directive) {
    for (let i = 0; i < directives.length; i += 4 /* Size */) {
        if (directives[i] === directive) {
            return i;
        }
    }
    return -1;
}
/**
 * @param {?} keyValues
 * @param {?} key
 * @return {?}
 */
function getInitialStylingValuesIndexOf(keyValues, key) {
    for (let i = 1 /* KeyValueStartPosition */; i < keyValues.length; i += 2 /* Size */) {
        if (keyValues[i] === key)
            return i;
    }
    return -1;
}
/**
 * @param {?} a
 * @param {?} b
 * @return {?}
 */
export function compareLogSummaries(a, b) {
    /** @type {?} */
    const log = [];
    /** @type {?} */
    const diffs = [];
    diffSummaryValues(diffs, 'staticIndex', 'staticIndex', a, b);
    diffSummaryValues(diffs, 'dynamicIndex', 'dynamicIndex', a, b);
    Object.keys(a.flags).forEach(name => { diffSummaryValues(diffs, 'flags.' + name, name, a.flags, b.flags); });
    if (diffs.length) {
        log.push('Log Summaries for:');
        log.push('  A: ' + a.name);
        log.push('  B: ' + b.name);
        log.push('\n  Differ in the following way (A !== B):');
        diffs.forEach(result => {
            const [name, aVal, bVal] = result;
            log.push('    => ' + name);
            log.push('    => ' + aVal + ' !== ' + bVal + '\n');
        });
    }
    return log;
}
/**
 * @param {?} result
 * @param {?} name
 * @param {?} prop
 * @param {?} a
 * @param {?} b
 * @return {?}
 */
function diffSummaryValues(result, name, prop, a, b) {
    /** @type {?} */
    const aVal = a[prop];
    /** @type {?} */
    const bVal = b[prop];
    if (aVal !== bVal) {
        result.push([name, aVal, bVal]);
    }
}
/**
 * @param {?} context
 * @param {?} directiveIndex
 * @param {?} offset
 * @param {?} isClassBased
 * @return {?}
 */
function getSinglePropIndexValue(context, directiveIndex, offset, isClassBased) {
    /** @type {?} */
    const singlePropOffsetRegistryIndex = (/** @type {?} */ (context[1 /* DirectiveRegistryPosition */][(directiveIndex * 4 /* Size */) +
        1 /* SinglePropValuesIndexOffset */]));
    /** @type {?} */
    const offsets = context[4 /* SinglePropOffsetPositions */];
    /** @type {?} */
    const indexForOffset = singlePropOffsetRegistryIndex +
        2 /* ValueStartPosition */ +
        (isClassBased ?
            offsets[singlePropOffsetRegistryIndex + 0 /* StylesCountPosition */] :
            0) +
        offset;
    return offsets[indexForOffset];
}
/**
 * @param {?} context
 * @param {?} directiveIndex
 * @return {?}
 */
function getStyleSanitizer(context, directiveIndex) {
    /** @type {?} */
    const dirs = context[1 /* DirectiveRegistryPosition */];
    /** @type {?} */
    const value = dirs[directiveIndex * 4 /* Size */ +
        3 /* StyleSanitizerOffset */] ||
        dirs[3 /* StyleSanitizerOffset */] || null;
    return (/** @type {?} */ (value));
}
/**
 * @param {?} context
 * @param {?} directiveIndex
 * @return {?}
 */
function isDirectiveDirty(context, directiveIndex) {
    /** @type {?} */
    const dirs = context[1 /* DirectiveRegistryPosition */];
    return (/** @type {?} */ (dirs[directiveIndex * 4 /* Size */ +
        2 /* DirtyFlagOffset */]));
}
/**
 * @param {?} context
 * @param {?} directiveIndex
 * @param {?} dirtyYes
 * @return {?}
 */
function setDirectiveDirty(context, directiveIndex, dirtyYes) {
    /** @type {?} */
    const dirs = context[1 /* DirectiveRegistryPosition */];
    dirs[directiveIndex * 4 /* Size */ +
        2 /* DirtyFlagOffset */] = dirtyYes;
}
/**
 * @param {?} currentValue
 * @param {?} newValue
 * @param {?} currentDirectiveOwner
 * @param {?} newDirectiveOwner
 * @return {?}
 */
function allowValueChange(currentValue, newValue, currentDirectiveOwner, newDirectiveOwner) {
    // the code below relies the importance of directive's being tied to their
    // index value. The index values for each directive are derived from being
    // registered into the styling context directive registry. The most important
    // directive is the parent component directive (the template) and each directive
    // that is added after is considered less important than the previous entry. This
    // prioritization of directives enables the styling algorithm to decide if a style
    // or class should be allowed to be updated/replaced incase an earlier directive
    // already wrote to the exact same style-property or className value. In other words
    // ... this decides what to do if and when there is a collision.
    if (currentValue) {
        if (newValue) {
            // if a directive index is lower than it always has priority over the
            // previous directive's value...
            return newDirectiveOwner <= currentDirectiveOwner;
        }
        else {
            // only write a null value incase it's the same owner writing it.
            // this avoids having a higher-priority directive write to null
            // only to have a lesser-priority directive change right to a
            // non-null value immediately afterwards.
            return currentDirectiveOwner === newDirectiveOwner;
        }
    }
    return true;
}
/**
 * This function is only designed to be called for `[class]` bindings when
 * `[ngClass]` (or something that uses `class` as an input) is present. Once
 * directive host bindings fully work for `[class]` and `[style]` inputs
 * then this can be deleted.
 * @param {?} context
 * @return {?}
 */
export function getInitialClassNameValue(context) {
    /** @type {?} */
    let className = (/** @type {?} */ (context[6 /* CachedClassValueOrInitialClassString */]));
    if (className == null) {
        className = '';
        /** @type {?} */
        const initialClassValues = context[3 /* InitialClassValuesPosition */];
        for (let i = 1 /* KeyValueStartPosition */; i < initialClassValues.length; i += 2 /* Size */) {
            /** @type {?} */
            const isPresent = initialClassValues[i + 1];
            if (isPresent) {
                className += (className.length ? ' ' : '') + initialClassValues[i];
            }
        }
        context[6 /* CachedClassValueOrInitialClassString */] = className;
    }
    return className;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xhc3NfYW5kX3N0eWxlX2JpbmRpbmdzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvcmVuZGVyMy9zdHlsaW5nL2NsYXNzX2FuZF9zdHlsZV9iaW5kaW5ncy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBUUEsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUN6QyxPQUFPLEVBQUMsV0FBVyxFQUFFLFNBQVMsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUdoRCxPQUFPLEVBQXNCLG1CQUFtQixFQUFFLG9CQUFvQixFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFHdEcsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUNwQyxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sU0FBUyxDQUFDO0FBRXZDLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBQ3BELE9BQU8sRUFBQyxpQkFBaUIsRUFBRSxrQkFBa0IsRUFBRSx5QkFBeUIsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLFFBQVEsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBcUIxRyxNQUFNLFVBQVUsdUJBQXVCLENBQUMsS0FBa0I7O1VBQ2xELE9BQU8sR0FBRyx5QkFBeUIsRUFBRTs7VUFDckMsY0FBYyxHQUF5QixPQUFPLG9DQUF5QztRQUN6RixDQUFDLElBQUksQ0FBQzs7VUFDSixhQUFhLEdBQXlCLE9BQU8sb0NBQXlDO1FBQ3hGLENBQUMsSUFBSSxDQUFDOzs7O1FBSU4sSUFBSSxHQUFHLENBQUMsQ0FBQztJQUNiLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFOztjQUMvQixJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNyQixJQUFJLE9BQU8sSUFBSSxJQUFJ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QUM7Ozs7Ozs7OztBQVFELE1BQU0sVUFBVSx3QkFBd0IsQ0FBQyxPQUF1Qjs7UUFDMUQsU0FBUyxHQUFHLG1CQUFBLE9BQU8sOENBQW1ELEVBQVU7SUFDcEYsSUFBSSxTQUFTLElBQUksSUFBSSxFQUFFO1FBQ3JCLFNBQVMsR0FBRyxFQUFFLENBQUM7O2NBQ1Qsa0JBQWtCLEdBQUcsT0FBTyxvQ0FBeUM7UUFDM0UsS0FBSyxJQUFJLENBQUMsZ0NBQWtELEVBQUUsQ0FBQyxHQUFHLGtCQUFrQixDQUFDLE1BQU0sRUFDdEYsQ0FBQyxnQkFBa0MsRUFBRTs7a0JBQ2xDLFNBQVMsR0FBRyxrQkFBa0IsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzNDLElBQUksU0FBUyxFQUFFO2dCQUNiLFNBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDcEU7U0FDRjtRQUNELE9BQU8sOENBQW1ELEdBQUcsU0FBUyxDQUFDO0tBQ3hFO0lBQ0QsT0FBTyxTQUFTLENBQUM7QUFDbkIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuKiBAbGljZW5zZVxuKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbipcbiogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuKi9cbmltcG9ydCB7U3R5bGVTYW5pdGl6ZUZufSBmcm9tICcuLi8uLi9zYW5pdGl6YXRpb24vc3R5bGVfc2FuaXRpemVyJztcbmltcG9ydCB7YXNzZXJ0Tm90RXF1YWx9IGZyb20gJy4uL2Fzc2VydCc7XG5pbXBvcnQge0VNUFRZX0FSUkFZLCBFTVBUWV9PQkp9IGZyb20gJy4uL2VtcHR5JztcbmltcG9ydCB7QXR0cmlidXRlTWFya2VyLCBUQXR0cmlidXRlc30gZnJvbSAnLi4vaW50ZXJmYWNlcy9ub2RlJztcbmltcG9ydCB7QmluZGluZ1N0b3JlLCBCaW5kaW5nVHlwZSwgUGxheWVyLCBQbGF5ZXJCdWlsZGVyLCBQbGF5ZXJGYWN0b3J5LCBQbGF5ZXJJbmRleH0gZnJvbSAnLi4vaW50ZXJmYWNlcy9wbGF5ZXInO1xuaW1wb3J0IHtSRWxlbWVudCwgUmVuZGVyZXIzLCBSZW5kZXJlclN0eWxlRmxhZ3MzLCBpc1Byb2NlZHVyYWxSZW5kZXJlcn0gZnJvbSAnLi4vaW50ZXJmYWNlcy9yZW5kZXJlcic7XG5pbXBvcnQge0RpcmVjdGl2ZU93bmVyQW5kUGxheWVyQnVpbGRlckluZGV4LCBEaXJlY3RpdmVSZWdpc3RyeVZhbHVlcywgRGlyZWN0aXZlUmVnaXN0cnlWYWx1ZXNJbmRleCwgSW5pdGlhbFN0eWxpbmdWYWx1ZXMsIEluaXRpYWxTdHlsaW5nVmFsdWVzSW5kZXgsIFNpbmdsZVByb3BPZmZzZXRWYWx1ZXMsIFNpbmdsZVByb3BPZmZzZXRWYWx1ZXNJbmRleCwgU3R5bGluZ0NvbnRleHQsIFN0eWxpbmdGbGFncywgU3R5bGluZ0luZGV4fSBmcm9tICcuLi9pbnRlcmZhY2VzL3N0eWxpbmcnO1xuaW1wb3J0IHtMVmlldywgUm9vdENvbnRleHR9IGZyb20gJy4uL2ludGVyZmFjZXMvdmlldyc7XG5pbXBvcnQge05PX0NIQU5HRX0gZnJvbSAnLi4vdG9rZW5zJztcbmltcG9ydCB7Z2V0Um9vdENvbnRleHR9IGZyb20gJy4uL3V0aWwnO1xuXG5pbXBvcnQge0JvdW5kUGxheWVyRmFjdG9yeX0gZnJvbSAnLi9wbGF5ZXJfZmFjdG9yeSc7XG5pbXBvcnQge2FkZFBsYXllckludGVybmFsLCBhbGxvY1BsYXllckNvbnRleHQsIGNyZWF0ZUVtcHR5U3R5bGluZ0NvbnRleHQsIGdldFBsYXllckNvbnRleHR9IGZyb20gJy4vdXRpbCc7XG5cblxuLyoqXG4gKiBUaGlzIGZpbGUgaW5jbHVkZXMgdGhlIGNvZGUgdG8gcG93ZXIgYWxsIHN0eWxpbmctYmluZGluZyBvcGVyYXRpb25zIGluIEFuZ3VsYXIuXG4gKlxuICogVGhlc2UgaW5jbHVkZTpcbiAqIFtzdHlsZV09XCJteVN0eWxlT2JqXCJcbiAqIFtjbGFzc109XCJteUNsYXNzT2JqXCJcbiAqIFtzdHlsZS5wcm9wXT1cIm15UHJvcFZhbHVlXCJcbiAqIFtjbGFzcy5uYW1lXT1cIm15Q2xhc3NWYWx1ZVwiXG4gKlxuICogVGhlcmUgYXJlIG1hbnkgZGlmZmVyZW50IHdheXMgaW4gd2hpY2ggdGhlc2UgZnVuY3Rpb25zIGJlbG93IGFyZSBjYWxsZWQuIFBsZWFzZSBzZWVcbiAqIGBpbnRlcmZhY2VzL3N0eWxlcy50c2AgdG8gZ2V0IGEgYmV0dGVyIGlkZWEgb2YgaG93IHRoZSBzdHlsaW5nIGFsZ29yaXRobSB3b3Jrcy5cbiAqL1xuXG5cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IFN0eWxpbmdDb250ZXh0IGFuIGZpbGxzIGl0IHdpdGggdGhlIHByb3ZpZGVkIHN0YXRpYyBzdHlsaW5nIGF0dHJpYnV0ZSB2YWx1ZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbml0aWFsaXplU3RhdGljQ29udGV4dChhdHRyczogVEF0dHJpYnV0ZXMpIHtcbiAgY29uc3QgY29udGV4dCA9IGNyZWF0ZUVtcHR5U3R5bGluZ0NvbnRleHQoKTtcbiAgY29uc3QgaW5pdGlhbENsYXNzZXM6IEluaXRpYWxTdHlsaW5nVmFsdWVzID0gY29udGV4dFtTdHlsaW5nSW5kZXguSW5pdGlhbENsYXNzVmFsdWVzUG9zaXRpb25dID1cbiAgICAgIFtudWxsXTtcbiAgY29uc3QgaW5pdGlhbFN0eWxlczogSW5pdGlhbFN0eWxpbmdWYWx1ZXMgPSBjb250ZXh0W1N0eWxpbmdJbmRleC5Jbml0aWFsU3R5bGVWYWx1ZXNQb3NpdGlvbl0gPVxuICAgICAgW251bGxdO1xuXG4gIC8vIFRoZSBhdHRyaWJ1dGVzIGFycmF5IGhhcyBtYXJrZXIgdmFsdWVzIChudW1iZXJzKSBpbmRpY2F0aW5nIHdoYXQgdGhlIHN1YnNlcXVlbnRcbiAgLy8gdmFsdWVzIHJlcHJlc2VudC4gV2hlbiB3ZSBlbmNvdW50ZXIgYSBudW1iZXIsIHdlIHNldCB0aGUgbW9kZSB0byB0aGF0IHR5cGUgb2YgYXR0cmlidXRlLlxuICBsZXQgbW9kZSA9IC0xO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGF0dHJzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgYXR0ciA9IGF0dHJzW2ldO1xuICAgIGlmICh0eXBlb2YgYXR0ciA9PSAnbnVtYmVyJykge1xuICAgICAgbW9kZSA9IGF0dHI7XG4gICAgfSBlbHNlIGlmIChtb2RlID09PSBBdHRyaWJ1dGVNYXJrZXIuU3R5bGVzKSB7XG4gICAgICBpbml0aWFsU3R5bGVzLnB1c2goYXR0ciBhcyBzdHJpbmcsIGF0dHJzWysraV0gYXMgc3RyaW5nKTtcbiAgICB9IGVsc2UgaWYgKG1vZGUgPT09IEF0dHJpYnV0ZU1hcmtlci5DbGFzc2VzKSB7XG4gICAgICBpbml0aWFsQ2xhc3Nlcy5wdXNoKGF0dHIgYXMgc3RyaW5nLCB0cnVlKTtcbiAgICB9IGVsc2UgaWYgKG1vZGUgPT09IEF0dHJpYnV0ZU1hcmtlci5TZWxlY3RPbmx5KSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gY29udGV4dDtcbn1cblxuLyoqXG4gKiBEZXNpZ25lZCB0byB1cGRhdGUgYW4gZXhpc3Rpbmcgc3R5bGluZyBjb250ZXh0IHdpdGggbmV3IHN0YXRpYyBzdHlsaW5nXG4gKiBkYXRhIChjbGFzc2VzIGFuZCBzdHlsZXMpLlxuICpcbiAqIEBwYXJhbSBjb250ZXh0IHRoZSBleGlzdGluZyBzdHlsaW5nIGNvbnRleHRcbiAqIEBwYXJhbSBhdHRycyBhbiBhcnJheSBvZiBuZXcgc3RhdGljIHN0eWxpbmcgYXR0cmlidXRlcyB0aGF0IHdpbGwgYmVcbiAqICAgICAgICAgICAgICBhc3NpZ25lZCB0byB0aGUgY29udGV4dFxuICogQHBhcmFtIGRpcmVjdGl2ZSB0aGUgZGlyZWN0aXZlIGluc3RhbmNlIHdpdGggd2hpY2ggc3RhdGljIGRhdGEgaXMgYXNzb2NpYXRlZCB3aXRoLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGF0Y2hDb250ZXh0V2l0aFN0YXRpY0F0dHJzKFxuICAgIGNvbnRleHQ6IFN0eWxpbmdDb250ZXh0LCBhdHRyczogVEF0dHJpYnV0ZXMsIGRpcmVjdGl2ZTogYW55KTogdm9pZCB7XG4gIC8vIElmIHRoZSBzdHlsaW5nIGNvbnRleHQgaGFzIGFscmVhZHkgYmVlbiBwYXRjaGVkIHdpdGggdGhlIGdpdmVuIGRpcmVjdGl2ZSdzIGJpbmRpbmdzLFxuICAvLyB0aGVuIHRoZXJlIGlzIG5vIHBvaW50IGluIGRvaW5nIGl0IGFnYWluLiBUaGUgcmVhc29uIHdoeSB0aGlzIG1heSBoYXBwZW4gKHRoZSBkaXJlY3RpdmVcbiAgLy8gc3R5bGluZyBiZWluZyBwYXRjaGVkIHR3aWNlKSBpcyBiZWNhdXNlIHRoZSBgc3R5bGluZ0JpbmRpbmdgIGZ1bmN0aW9uIGlzIGNhbGxlZCBlYWNoIHRpbWVcbiAgLy8gYW4gZWxlbWVudCBpcyBjcmVhdGVkIChib3RoIHdpdGhpbiBhIHRlbXBsYXRlIGZ1bmN0aW9uIGFuZCB3aXRoaW4gZGlyZWN0aXZlIGhvc3QgYmluZGluZ3MpLlxuICBjb25zdCBkaXJlY3RpdmVzID0gY29udGV4dFtTdHlsaW5nSW5kZXguRGlyZWN0aXZlUmVnaXN0cnlQb3NpdGlvbl07XG4gIGlmIChnZXREaXJlY3RpdmVSZWdpc3RyeVZhbHVlc0luZGV4T2YoZGlyZWN0aXZlcywgZGlyZWN0aXZlKSA9PSAtMSkge1xuICAgIC8vIHRoaXMgaXMgYSBuZXcgZGlyZWN0aXZlIHdoaWNoIHdlIGhhdmUgbm90IHNlZW4geWV0LlxuICAgIGRpcmVjdGl2ZXMucHVzaChkaXJlY3RpdmUsIC0xLCBmYWxzZSwgbnVsbCk7XG5cbiAgICBsZXQgaW5pdGlhbENsYXNzZXM6IEluaXRpYWxTdHlsaW5nVmFsdWVzfG51bGwgPSBudWxsO1xuICAgIGxldCBpbml0aWFsU3R5bGVzOiBJbml0aWFsU3R5bGluZ1ZhbHVlc3xudWxsID0gbnVsbDtcblxuICAgIGxldCBtb2RlID0gLTE7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhdHRycy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgYXR0ciA9IGF0dHJzW2ldO1xuICAgICAgaWYgKHR5cGVvZiBhdHRyID09ICdudW1iZXInKSB7XG4gICAgICAgIG1vZGUgPSBhdHRyO1xuICAgICAgfSBlbHNlIGlmIChtb2RlID09IEF0dHJpYnV0ZU1hcmtlci5DbGFzc2VzKSB7XG4gICAgICAgIGluaXRpYWxDbGFzc2VzID0gaW5pdGlhbENsYXNzZXMgfHwgY29udGV4dFtTdHlsaW5nSW5kZXguSW5pdGlhbENsYXNzVmFsdWVzUG9zaXRpb25dO1xuICAgICAgICBwYXRjaEluaXRpYWxTdHlsaW5nVmFsdWUoaW5pdGlhbENsYXNzZXMsIGF0dHIsIHRydWUpO1xuICAgICAgfSBlbHNlIGlmIChtb2RlID09IEF0dHJpYnV0ZU1hcmtlci5TdHlsZXMpIHtcbiAgICAgICAgaW5pdGlhbFN0eWxlcyA9IGluaXRpYWxTdHlsZXMgfHwgY29udGV4dFtTdHlsaW5nSW5kZXguSW5pdGlhbFN0eWxlVmFsdWVzUG9zaXRpb25dO1xuICAgICAgICBwYXRjaEluaXRpYWxTdHlsaW5nVmFsdWUoaW5pdGlhbFN0eWxlcywgYXR0ciwgYXR0cnNbKytpXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogRGVzaWduZWQgdG8gYWRkIGEgc3R5bGUgb3IgY2xhc3MgdmFsdWUgaW50byB0aGUgZXhpc3Rpbmcgc2V0IG9mIGluaXRpYWwgc3R5bGVzLlxuICpcbiAqIFRoZSBmdW5jdGlvbiB3aWxsIHNlYXJjaCBhbmQgZmlndXJlIG91dCBpZiBhIHN0eWxlL2NsYXNzIHZhbHVlIGlzIGFscmVhZHkgcHJlc2VudFxuICogd2l0aGluIHRoZSBwcm92aWRlZCBpbml0aWFsIHN0eWxpbmcgYXJyYXkuIElmIGFuZCB3aGVuIGEgc3R5bGUvY2xhc3MgdmFsdWUgaXMgbm90XG4gKiBwcmVzZW50IChvciBpZiBpdCdzIHZhbHVlIGlzIGZhbHN5KSB0aGVuIGl0IHdpbGwgYmUgaW5zZXJ0ZWQvdXBkYXRlZCBpbiB0aGUgbGlzdFxuICogb2YgaW5pdGlhbCBzdHlsaW5nIHZhbHVlcy5cbiAqL1xuZnVuY3Rpb24gcGF0Y2hJbml0aWFsU3R5bGluZ1ZhbHVlKFxuICAgIGluaXRpYWxTdHlsaW5nOiBJbml0aWFsU3R5bGluZ1ZhbHVlcywgcHJvcDogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZCB7XG4gIC8vIEV2ZW4gdmFsdWVzIGFyZSBrZXlzOyBPZGQgbnVtYmVycyBhcmUgdmFsdWVzOyBTZWFyY2gga2V5cyBvbmx5XG4gIGZvciAobGV0IGkgPSBJbml0aWFsU3R5bGluZ1ZhbHVlc0luZGV4LktleVZhbHVlU3RhcnRQb3NpdGlvbjsgaSA8IGluaXRpYWxTdHlsaW5nLmxlbmd0aDspIHtcbiAgICBjb25zdCBrZXkgPSBpbml0aWFsU3R5bGluZ1tpXTtcbiAgICBpZiAoa2V5ID09PSBwcm9wKSB7XG4gICAgICBjb25zdCBleGlzdGluZ1ZhbHVlID0gaW5pdGlhbFN0eWxpbmdbaSArIEluaXRpYWxTdHlsaW5nVmFsdWVzSW5kZXguVmFsdWVPZmZzZXRdO1xuXG4gICAgICAvLyBJZiB0aGVyZSBpcyBubyBwcmV2aW91cyBzdHlsZSB2YWx1ZSAod2hlbiBgbnVsbGApIG9yIG5vIHByZXZpb3VzIGNsYXNzXG4gICAgICAvLyBhcHBsaWVkICh3aGVuIGBmYWxzZWApIHRoZW4gd2UgdXBkYXRlIHRoZSB0aGUgbmV3bHkgZ2l2ZW4gdmFsdWUuXG4gICAgICBpZiAoZXhpc3RpbmdWYWx1ZSA9PSBudWxsIHx8IGV4aXN0aW5nVmFsdWUgPT0gZmFsc2UpIHtcbiAgICAgICAgaW5pdGlhbFN0eWxpbmdbaSArIEluaXRpYWxTdHlsaW5nVmFsdWVzSW5kZXguVmFsdWVPZmZzZXRdID0gdmFsdWU7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGkgPSBpICsgSW5pdGlhbFN0eWxpbmdWYWx1ZXNJbmRleC5TaXplO1xuICB9XG4gIC8vIFdlIGRpZCBub3QgZmluZCBleGlzdGluZyBrZXksIGFkZCBhIG5ldyBvbmUuXG4gIGluaXRpYWxTdHlsaW5nLnB1c2gocHJvcCwgdmFsdWUpO1xufVxuXG4vKipcbiAqIFJ1bnMgdGhyb3VnaCB0aGUgaW5pdGlhbCBzdHlsaW5nIGRhdGEgcHJlc2VudCBpbiB0aGUgY29udGV4dCBhbmQgcmVuZGVyc1xuICogdGhlbSB2aWEgdGhlIHJlbmRlcmVyIG9uIHRoZSBlbGVtZW50LlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVySW5pdGlhbFN0eWxlc0FuZENsYXNzZXMoXG4gICAgZWxlbWVudDogUkVsZW1lbnQsIGNvbnRleHQ6IFN0eWxpbmdDb250ZXh0LCByZW5kZXJlcjogUmVuZGVyZXIzKSB7XG4gIGNvbnN0IGluaXRpYWxDbGFzc2VzID0gY29udGV4dFtTdHlsaW5nSW5kZXguSW5pdGlhbENsYXNzVmFsdWVzUG9zaXRpb25dO1xuICByZW5kZXJJbml0aWFsU3R5bGluZ1ZhbHVlcyhlbGVtZW50LCByZW5kZXJlciwgaW5pdGlhbENsYXNzZXMsIHRydWUpO1xuXG4gIGNvbnN0IGluaXRpYWxTdHlsZXMgPSBjb250ZXh0W1N0eWxpbmdJbmRleC5Jbml0aWFsU3R5bGVWYWx1ZXNQb3NpdGlvbl07XG4gIHJlbmRlckluaXRpYWxTdHlsaW5nVmFsdWVzKGVsZW1lbnQsIHJlbmRlcmVyLCBpbml0aWFsU3R5bGVzLCBmYWxzZSk7XG59XG5cbi8qKlxuICogVGhpcyBpcyBhIGhlbHBlciBmdW5jdGlvbiBkZXNpZ25lZCB0byByZW5kZXIgZWFjaCBlbnRyeSBwcmVzZW50IHdpdGhpbiB0aGVcbiAqIHByb3ZpZGVkIGxpc3Qgb2YgaW5pdGlhbFN0eWxpbmdWYWx1ZXMuXG4gKi9cbmZ1bmN0aW9uIHJlbmRlckluaXRpYWxTdHlsaW5nVmFsdWVzKFxuICAgIGVsZW1lbnQ6IFJFbGVtZW50LCByZW5kZXJlcjogUmVuZGVyZXIzLCBpbml0aWFsU3R5bGluZ1ZhbHVlczogSW5pdGlhbFN0eWxpbmdWYWx1ZXMsXG4gICAgaXNFbnRyeUNsYXNzQmFzZWQ6IGJvb2xlYW4pIHtcbiAgZm9yIChsZXQgaSA9IEluaXRpYWxTdHlsaW5nVmFsdWVzSW5kZXguS2V5VmFsdWVTdGFydFBvc2l0aW9uOyBpIDwgaW5pdGlhbFN0eWxpbmdWYWx1ZXMubGVuZ3RoO1xuICAgICAgIGkgKz0gSW5pdGlhbFN0eWxpbmdWYWx1ZXNJbmRleC5TaXplKSB7XG4gICAgY29uc3QgdmFsdWUgPSBpbml0aWFsU3R5bGluZ1ZhbHVlc1tpICsgSW5pdGlhbFN0eWxpbmdWYWx1ZXNJbmRleC5WYWx1ZU9mZnNldF07XG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICBpZiAoaXNFbnRyeUNsYXNzQmFzZWQpIHtcbiAgICAgICAgc2V0Q2xhc3MoXG4gICAgICAgICAgICBlbGVtZW50LCBpbml0aWFsU3R5bGluZ1ZhbHVlc1tpICsgSW5pdGlhbFN0eWxpbmdWYWx1ZXNJbmRleC5Qcm9wT2Zmc2V0XSBhcyBzdHJpbmcsIHRydWUsXG4gICAgICAgICAgICByZW5kZXJlciwgbnVsbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXRTdHlsZShcbiAgICAgICAgICAgIGVsZW1lbnQsIGluaXRpYWxTdHlsaW5nVmFsdWVzW2kgKyBJbml0aWFsU3R5bGluZ1ZhbHVlc0luZGV4LlByb3BPZmZzZXRdIGFzIHN0cmluZyxcbiAgICAgICAgICAgIHZhbHVlIGFzIHN0cmluZywgcmVuZGVyZXIsIG51bGwpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYWxsb3dOZXdCaW5kaW5nc0ZvclN0eWxpbmdDb250ZXh0KGNvbnRleHQ6IFN0eWxpbmdDb250ZXh0KTogYm9vbGVhbiB7XG4gIHJldHVybiAoY29udGV4dFtTdHlsaW5nSW5kZXguTWFzdGVyRmxhZ1Bvc2l0aW9uXSAmIFN0eWxpbmdGbGFncy5CaW5kaW5nQWxsb2NhdGlvbkxvY2tlZCkgPT09IDA7XG59XG5cbi8qKlxuICogQWRkcyBpbiBuZXcgYmluZGluZyB2YWx1ZXMgdG8gYSBzdHlsaW5nIGNvbnRleHQuXG4gKlxuICogSWYgYSBkaXJlY3RpdmUgdmFsdWUgaXMgcHJvdmlkZWQgdGhlbiBhbGwgcHJvdmlkZWQgY2xhc3Mvc3R5bGUgYmluZGluZyBuYW1lcyB3aWxsXG4gKiByZWZlcmVuY2UgdGhlIHByb3ZpZGVkIGRpcmVjdGl2ZS5cbiAqXG4gKiBAcGFyYW0gY29udGV4dCB0aGUgZXhpc3Rpbmcgc3R5bGluZyBjb250ZXh0XG4gKiBAcGFyYW0gZGlyZWN0aXZlUmVmIHRoZSBkaXJlY3RpdmUgdGhhdCB0aGUgbmV3IGJpbmRpbmdzIHdpbGwgcmVmZXJlbmNlXG4gKiBAcGFyYW0gY2xhc3NCaW5kaW5nTmFtZXMgYW4gYXJyYXkgb2YgY2xhc3MgYmluZGluZyBuYW1lcyB0aGF0IHdpbGwgYmUgYWRkZWQgdG8gdGhlIGNvbnRleHRcbiAqIEBwYXJhbSBzdHlsZUJpbmRpbmdOYW1lcyBhbiBhcnJheSBvZiBzdHlsZSBiaW5kaW5nIG5hbWVzIHRoYXQgd2lsbCBiZSBhZGRlZCB0byB0aGUgY29udGV4dFxuICogQHBhcmFtIHN0eWxlU2FuaXRpemVyIGFuIG9wdGlvbmFsIHNhbml0aXplciB0aGF0IGhhbmRsZSBhbGwgc2FuaXRpemF0aW9uIG9uIGZvciBlYWNoIG9mXG4gKiAgICB0aGUgYmluZGluZ3MgYWRkZWQgdG8gdGhlIGNvbnRleHQuIE5vdGUgdGhhdCBpZiBhIGRpcmVjdGl2ZSBpcyBwcm92aWRlZCB0aGVuIHRoZSBzYW5pdGl6ZXJcbiAqICAgIGluc3RhbmNlIHdpbGwgb25seSBiZSBhY3RpdmUgaWYgYW5kIHdoZW4gdGhlIGRpcmVjdGl2ZSB1cGRhdGVzIHRoZSBiaW5kaW5ncyB0aGF0IGl0IG93bnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVDb250ZXh0V2l0aEJpbmRpbmdzKFxuICAgIGNvbnRleHQ6IFN0eWxpbmdDb250ZXh0LCBkaXJlY3RpdmVSZWY6IGFueSB8IG51bGwsIGNsYXNzQmluZGluZ05hbWVzPzogc3RyaW5nW10gfCBudWxsLFxuICAgIHN0eWxlQmluZGluZ05hbWVzPzogc3RyaW5nW10gfCBudWxsLCBzdHlsZVNhbml0aXplcj86IFN0eWxlU2FuaXRpemVGbiB8IG51bGwsXG4gICAgb25seVByb2Nlc3NTaW5nbGVDbGFzc2VzPzogYm9vbGVhbikge1xuICBpZiAoY29udGV4dFtTdHlsaW5nSW5kZXguTWFzdGVyRmxhZ1Bvc2l0aW9uXSAmIFN0eWxpbmdGbGFncy5CaW5kaW5nQWxsb2NhdGlvbkxvY2tlZCkgcmV0dXJuO1xuXG4gIC8vIHRoaXMgbWVhbnMgdGhlIGNvbnRleHQgaGFzIGFscmVhZHkgYmVlbiBwYXRjaGVkIHdpdGggdGhlIGRpcmVjdGl2ZSdzIGJpbmRpbmdzXG4gIGNvbnN0IGRpcmVjdGl2ZUluZGV4ID0gZmluZE9yUGF0Y2hEaXJlY3RpdmVJbnRvUmVnaXN0cnkoY29udGV4dCwgZGlyZWN0aXZlUmVmLCBzdHlsZVNhbml0aXplcik7XG4gIGlmIChkaXJlY3RpdmVJbmRleCA9PT0gLTEpIHtcbiAgICAvLyB0aGlzIG1lYW5zIHRoZSBkaXJlY3RpdmUgaGFzIGFscmVhZHkgYmVlbiBwYXRjaGVkIGluIC4uLiBObyBwb2ludCBpbiBkb2luZyBhbnl0aGluZ1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIHRoZXJlIGFyZSBhbG90IG9mIHZhcmlhYmxlcyBiZWluZyB1c2VkIGJlbG93IHRvIHRyYWNrIHdoZXJlIGluIHRoZSBjb250ZXh0IHRoZSBuZXdcbiAgLy8gYmluZGluZyB2YWx1ZXMgd2lsbCBiZSBwbGFjZWQuIEJlY2F1c2UgdGhlIGNvbnRleHQgY29uc2lzdHMgb2YgbXVsdGlwbGUgdHlwZXMgb2ZcbiAgLy8gZW50cmllcyAoc2luZ2xlIGNsYXNzZXMvc3R5bGVzIGFuZCBtdWx0aSBjbGFzc2VzL3N0eWxlcykgYWxvdCBvZiB0aGUgaW5kZXggcG9zaXRpb25zXG4gIC8vIG5lZWQgdG8gYmUgY29tcHV0ZWQgYWhlYWQgb2YgdGltZSBhbmQgdGhlIGNvbnRleHQgbmVlZHMgdG8gYmUgZXh0ZW5kZWQgYmVmb3JlIHRoZSB2YWx1ZXNcbiAgLy8gYXJlIGluc2VydGVkIGluLlxuICBjb25zdCBzaW5nbGVQcm9wT2Zmc2V0VmFsdWVzID0gY29udGV4dFtTdHlsaW5nSW5kZXguU2luZ2xlUHJvcE9mZnNldFBvc2l0aW9uc107XG4gIGNvbnN0IHRvdGFsQ3VycmVudENsYXNzQmluZGluZ3MgPVxuICAgICAgc2luZ2xlUHJvcE9mZnNldFZhbHVlc1tTaW5nbGVQcm9wT2Zmc2V0VmFsdWVzSW5kZXguQ2xhc3Nlc0NvdW50UG9zaXRpb25dO1xuICBjb25zdCB0b3RhbEN1cnJlbnRTdHlsZUJpbmRpbmdzID1cbiAgICAgIHNpbmdsZVByb3BPZmZzZXRWYWx1ZXNbU2luZ2xlUHJvcE9mZnNldFZhbHVlc0luZGV4LlN0eWxlc0NvdW50UG9zaXRpb25dO1xuXG4gIGNvbnN0IGNsYXNzZXNPZmZzZXQgPSB0b3RhbEN1cnJlbnRDbGFzc0JpbmRpbmdzICogU3R5bGluZ0luZGV4LlNpemU7XG4gIGNvbnN0IHN0eWxlc09mZnNldCA9IHRvdGFsQ3VycmVudFN0eWxlQmluZGluZ3MgKiBTdHlsaW5nSW5kZXguU2l6ZTtcblxuICBjb25zdCBzaW5nbGVTdHlsZXNTdGFydEluZGV4ID0gU3R5bGluZ0luZGV4LlNpbmdsZVN0eWxlc1N0YXJ0UG9zaXRpb247XG4gIGxldCBzaW5nbGVDbGFzc2VzU3RhcnRJbmRleCA9IHNpbmdsZVN0eWxlc1N0YXJ0SW5kZXggKyBzdHlsZXNPZmZzZXQ7XG4gIGxldCBtdWx0aVN0eWxlc1N0YXJ0SW5kZXggPSBzaW5nbGVDbGFzc2VzU3RhcnRJbmRleCArIGNsYXNzZXNPZmZzZXQ7XG4gIGxldCBtdWx0aUNsYXNzZXNTdGFydEluZGV4ID0gbXVsdGlTdHlsZXNTdGFydEluZGV4ICsgc3R5bGVzT2Zmc2V0O1xuXG4gIC8vIGJlY2F1c2Ugd2UncmUgaW5zZXJ0aW5nIG1vcmUgYmluZGluZ3MgaW50byB0aGUgY29udGV4dCwgdGhpcyBtZWFucyB0aGF0IHRoZVxuICAvLyBiaW5kaW5nIHZhbHVlcyBuZWVkIHRvIGJlIHJlZmVyZW5jZWQgdGhlIHNpbmdsZVByb3BPZmZzZXRWYWx1ZXMgYXJyYXkgc28gdGhhdFxuICAvLyB0aGUgdGVtcGxhdGUvZGlyZWN0aXZlIGNhbiBlYXNpbHkgZmluZCB0aGVtIGluc2lkZSBvZiB0aGUgYGVsZW1lbnRTdHlsZVByb3BgXG4gIC8vIGFuZCB0aGUgYGVsZW1lbnRDbGFzc1Byb3BgIGZ1bmN0aW9ucyB3aXRob3V0IGl0ZXJhdGluZyB0aHJvdWdoIHRoZSBlbnRpcmUgY29udGV4dC5cbiAgLy8gVGhlIGZpcnN0IHN0ZXAgdG8gc2V0dGluZyB1cCB0aGVzZSByZWZlcmVuY2UgcG9pbnRzIGlzIHRvIG1hcmsgaG93IG1hbnkgYmluZGluZ3NcbiAgLy8gYXJlIGJlaW5nIGFkZGVkLiBFdmVuIGlmIHRoZXNlIGJpbmRpbmdzIGFscmVhZHkgZXhpc3QgaW4gdGhlIGNvbnRleHQsIHRoZSBkaXJlY3RpdmVcbiAgLy8gb3IgdGVtcGxhdGUgY29kZSB3aWxsIHN0aWxsIGNhbGwgdGhlbSB1bmtub3dpbmdseS4gVGhlcmVmb3JlIHRoZSB0b3RhbCB2YWx1ZXMgbmVlZFxuICAvLyB0byBiZSByZWdpc3RlcmVkIHNvIHRoYXQgd2Uga25vdyBob3cgbWFueSBiaW5kaW5ncyBhcmUgYXNzaWduZWQgdG8gZWFjaCBkaXJlY3RpdmUuXG4gIGNvbnN0IGN1cnJlbnRTaW5nbGVQcm9wc0xlbmd0aCA9IHNpbmdsZVByb3BPZmZzZXRWYWx1ZXMubGVuZ3RoO1xuICBzaW5nbGVQcm9wT2Zmc2V0VmFsdWVzLnB1c2goXG4gICAgICBzdHlsZUJpbmRpbmdOYW1lcyA/IHN0eWxlQmluZGluZ05hbWVzLmxlbmd0aCA6IDAsXG4gICAgICBjbGFzc0JpbmRpbmdOYW1lcyA/IGNsYXNzQmluZGluZ05hbWVzLmxlbmd0aCA6IDApO1xuXG4gIC8vIHRoZSBjb2RlIGJlbG93IHdpbGwgY2hlY2sgdG8gc2VlIGlmIGEgbmV3IHN0eWxlIGJpbmRpbmcgYWxyZWFkeSBleGlzdHMgaW4gdGhlIGNvbnRleHRcbiAgLy8gaWYgc28gdGhlbiB0aGVyZSBpcyBubyBwb2ludCBpbiBpbnNlcnRpbmcgaXQgaW50byB0aGUgY29udGV4dCBhZ2Fpbi4gV2hldGhlciBvciBub3QgaXRcbiAgLy8gZXhpc3RzIHRoZSBzdHlsaW5nIG9mZnNldCBjb2RlIHdpbGwgbm93IGtub3cgZXhhY3RseSB3aGVyZSBpdCBpc1xuICBsZXQgaW5zZXJ0aW9uT2Zmc2V0ID0gMDtcbiAgY29uc3QgZmlsdGVyZWRTdHlsZUJpbmRpbmdOYW1lczogc3RyaW5nW10gPSBbXTtcbiAgaWYgKHN0eWxlQmluZGluZ05hbWVzICYmIHN0eWxlQmluZGluZ05hbWVzLmxlbmd0aCkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3R5bGVCaW5kaW5nTmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IG5hbWUgPSBzdHlsZUJpbmRpbmdOYW1lc1tpXTtcbiAgICAgIGxldCBzaW5nbGVQcm9wSW5kZXggPVxuICAgICAgICAgIGdldE1hdGNoaW5nQmluZGluZ0luZGV4KGNvbnRleHQsIG5hbWUsIHNpbmdsZVN0eWxlc1N0YXJ0SW5kZXgsIHNpbmdsZUNsYXNzZXNTdGFydEluZGV4KTtcbiAgICAgIGlmIChzaW5nbGVQcm9wSW5kZXggPT0gLTEpIHtcbiAgICAgICAgc2luZ2xlUHJvcEluZGV4ID0gc2luZ2xlQ2xhc3Nlc1N0YXJ0SW5kZXggKyBpbnNlcnRpb25PZmZzZXQ7XG4gICAgICAgIGluc2VydGlvbk9mZnNldCArPSBTdHlsaW5nSW5kZXguU2l6ZTtcbiAgICAgICAgZmlsdGVyZWRTdHlsZUJpbmRpbmdOYW1lcy5wdXNoKG5hbWUpO1xuICAgICAgfVxuICAgICAgc2luZ2xlUHJvcE9mZnNldFZhbHVlcy5wdXNoKHNpbmdsZVByb3BJbmRleCk7XG4gICAgfVxuICB9XG5cbiAgLy8ganVzdCBsaWtlIHdpdGggdGhlIHN0eWxlIGJpbmRpbmcgbG9vcCBhYm92ZSwgdGhlIG5ldyBjbGFzcyBiaW5kaW5ncyBnZXQgdGhlIHNhbWUgdHJlYXRtZW50Li4uXG4gIGNvbnN0IGZpbHRlcmVkQ2xhc3NCaW5kaW5nTmFtZXM6IHN0cmluZ1tdID0gW107XG4gIGlmIChjbGFzc0JpbmRpbmdOYW1lcyAmJiBjbGFzc0JpbmRpbmdOYW1lcy5sZW5ndGgpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNsYXNzQmluZGluZ05hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBuYW1lID0gY2xhc3NCaW5kaW5nTmFtZXNbaV07XG4gICAgICBsZXQgc2luZ2xlUHJvcEluZGV4ID1cbiAgICAgICAgICBnZXRNYXRjaGluZ0JpbmRpbmdJbmRleChjb250ZXh0LCBuYW1lLCBzaW5nbGVDbGFzc2VzU3RhcnRJbmRleCwgbXVsdGlTdHlsZXNTdGFydEluZGV4KTtcbiAgICAgIGlmIChzaW5nbGVQcm9wSW5kZXggPT0gLTEpIHtcbiAgICAgICAgc2luZ2xlUHJvcEluZGV4ID0gbXVsdGlTdHlsZXNTdGFydEluZGV4ICsgaW5zZXJ0aW9uT2Zmc2V0O1xuICAgICAgICBpbnNlcnRpb25PZmZzZXQgKz0gU3R5bGluZ0luZGV4LlNpemU7XG4gICAgICAgIGZpbHRlcmVkQ2xhc3NCaW5kaW5nTmFtZXMucHVzaChuYW1lKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNpbmdsZVByb3BJbmRleCArPSBmaWx0ZXJlZFN0eWxlQmluZGluZ05hbWVzLmxlbmd0aCAqIFN0eWxpbmdJbmRleC5TaXplO1xuICAgICAgfVxuICAgICAgc2luZ2xlUHJvcE9mZnNldFZhbHVlcy5wdXNoKHNpbmdsZVByb3BJbmRleCk7XG4gICAgfVxuICB9XG5cbiAgLy8gYmVjYXVzZSBuZXcgc3R5bGVzIGFyZSBiZWluZyBpbnNlcnRlZCwgdGhpcyBtZWFucyB0aGUgZXhpc3RpbmcgY29sbGVjdGlvbiBvZiBzdHlsZSBvZmZzZXRcbiAgLy8gaW5kZXggdmFsdWVzIGFyZSBpbmNvcnJlY3QgKHRoZXkgcG9pbnQgdG8gdGhlIHdyb25nIHZhbHVlcykuIFRoZSBjb2RlIGJlbG93IHdpbGwgcnVuIHRocm91Z2hcbiAgLy8gdGhlIGVudGlyZSBvZmZzZXQgYXJyYXkgYW5kIHVwZGF0ZSB0aGUgZXhpc3Rpbmcgc2V0IG9mIGluZGV4IHZhbHVlcyB0byBwb2ludCB0byB0aGVpciBuZXdcbiAgLy8gbG9jYXRpb25zIHdoaWxlIHRha2luZyB0aGUgbmV3IGJpbmRpbmcgdmFsdWVzIGludG8gY29uc2lkZXJhdGlvbi5cbiAgbGV0IGkgPSBTaW5nbGVQcm9wT2Zmc2V0VmFsdWVzSW5kZXguVmFsdWVTdGFydFBvc2l0aW9uO1xuICBpZiAoZmlsdGVyZWRTdHlsZUJpbmRpbmdOYW1lcy5sZW5ndGgpIHtcbiAgICB3aGlsZSAoaSA8IGN1cnJlbnRTaW5nbGVQcm9wc0xlbmd0aCkge1xuICAgICAgY29uc3QgdG90YWxTdHlsZXMgPVxuICAgICAgICAgIHNpbmdsZVByb3BPZmZzZXRWYWx1ZXNbaSArIFNpbmdsZVByb3BPZmZzZXRWYWx1ZXNJbmRleC5TdHlsZXNDb3VudFBvc2l0aW9uXTtcbiAgICAgIGNvbnN0IHRvdGFsQ2xhc3NlcyA9XG4gICAgICAgICAgc2luZ2xlUHJvcE9mZnNldFZhbHVlc1tpICsgU2luZ2xlUHJvcE9mZnNldFZhbHVlc0luZGV4LkNsYXNzZXNDb3VudFBvc2l0aW9uXTtcbiAgICAgIGlmICh0b3RhbENsYXNzZXMpIHtcbiAgICAgICAgY29uc3Qgc3RhcnQgPSBpICsgU2luZ2xlUHJvcE9mZnNldFZhbHVlc0luZGV4LlZhbHVlU3RhcnRQb3NpdGlvbiArIHRvdGFsU3R5bGVzO1xuICAgICAgICBmb3IgKGxldCBqID0gc3RhcnQ7IGogPCBzdGFydCArIHRvdGFsQ2xhc3NlczsgaisrKSB7XG4gICAgICAgICAgc2luZ2xlUHJvcE9mZnNldFZhbHVlc1tqXSArPSBmaWx0ZXJlZFN0eWxlQmluZGluZ05hbWVzLmxlbmd0aCAqIFN0eWxpbmdJbmRleC5TaXplO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHRvdGFsID0gdG90YWxTdHlsZXMgKyB0b3RhbENsYXNzZXM7XG4gICAgICBpICs9IFNpbmdsZVByb3BPZmZzZXRWYWx1ZXNJbmRleC5WYWx1ZVN0YXJ0UG9zaXRpb24gKyB0b3RhbDtcbiAgICB9XG4gIH1cblxuICBjb25zdCB0b3RhbE5ld0VudHJpZXMgPSBmaWx0ZXJlZENsYXNzQmluZGluZ05hbWVzLmxlbmd0aCArIGZpbHRlcmVkU3R5bGVCaW5kaW5nTmFtZXMubGVuZ3RoO1xuXG4gIC8vIGluIHRoZSBldmVudCB0aGF0IHRoZXJlIGFyZSBuZXcgc3R5bGUgdmFsdWVzIGJlaW5nIGluc2VydGVkLCBhbGwgZXhpc3RpbmcgY2xhc3MgYW5kIHN0eWxlXG4gIC8vIGJpbmRpbmdzIG5lZWQgdG8gaGF2ZSB0aGVpciBwb2ludGVyIHZhbHVlcyBvZmZzZXR0ZWQgd2l0aCB0aGUgbmV3IGFtb3VudCBvZiBzcGFjZSB0aGF0IGlzXG4gIC8vIHVzZWQgZm9yIHRoZSBuZXcgc3R5bGUvY2xhc3MgYmluZGluZ3MuXG4gIGZvciAobGV0IGkgPSBzaW5nbGVTdHlsZXNTdGFydEluZGV4OyBpIDwgY29udGV4dC5sZW5ndGg7IGkgKz0gU3R5bGluZ0luZGV4LlNpemUpIHtcbiAgICBjb25zdCBpc011bHRpQmFzZWQgPSBpID49IG11bHRpU3R5bGVzU3RhcnRJbmRleDtcbiAgICBjb25zdCBpc0NsYXNzQmFzZWQgPSBpID49IChpc011bHRpQmFzZWQgPyBtdWx0aUNsYXNzZXNTdGFydEluZGV4IDogc2luZ2xlQ2xhc3Nlc1N0YXJ0SW5kZXgpO1xuICAgIGNvbnN0IGZsYWcgPSBnZXRQb2ludGVycyhjb250ZXh0LCBpKTtcbiAgICBjb25zdCBzdGF0aWNJbmRleCA9IGdldEluaXRpYWxJbmRleChmbGFnKTtcbiAgICBsZXQgc2luZ2xlT3JNdWx0aUluZGV4ID0gZ2V0TXVsdGlPclNpbmdsZUluZGV4KGZsYWcpO1xuICAgIGlmIChpc011bHRpQmFzZWQpIHtcbiAgICAgIHNpbmdsZU9yTXVsdGlJbmRleCArPVxuICAgICAgICAgIGlzQ2xhc3NCYXNlZCA/IChmaWx0ZXJlZFN0eWxlQmluZGluZ05hbWVzLmxlbmd0aCAqIFN0eWxpbmdJbmRleC5TaXplKSA6IDA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNpbmdsZU9yTXVsdGlJbmRleCArPSAodG90YWxOZXdFbnRyaWVzICogU3R5bGluZ0luZGV4LlNpemUpICtcbiAgICAgICAgICAoKGlzQ2xhc3NCYXNlZCA/IGZpbHRlcmVkU3R5bGVCaW5kaW5nTmFtZXMubGVuZ3RoIDogMCkgKiBTdHlsaW5nSW5kZXguU2l6ZSk7XG4gICAgfVxuICAgIHNldEZsYWcoY29udGV4dCwgaSwgcG9pbnRlcnMoZmxhZywgc3RhdGljSW5kZXgsIHNpbmdsZU9yTXVsdGlJbmRleCkpO1xuICB9XG5cbiAgLy8gdGhpcyBpcyB3aGVyZSB3ZSBtYWtlIHNwYWNlIGluIHRoZSBjb250ZXh0IGZvciB0aGUgbmV3IHN0eWxlIGJpbmRpbmdzXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZmlsdGVyZWRTdHlsZUJpbmRpbmdOYW1lcy5sZW5ndGggKiBTdHlsaW5nSW5kZXguU2l6ZTsgaSsrKSB7XG4gICAgY29udGV4dC5zcGxpY2UobXVsdGlDbGFzc2VzU3RhcnRJbmRleCwgMCwgbnVsbCk7XG4gICAgY29udGV4dC5zcGxpY2Uoc2luZ2xlQ2xhc3Nlc1N0YXJ0SW5kZXgsIDAsIG51bGwpO1xuICAgIHNpbmdsZUNsYXNzZXNTdGFydEluZGV4Kys7XG4gICAgbXVsdGlTdHlsZXNTdGFydEluZGV4Kys7XG4gICAgbXVsdGlDbGFzc2VzU3RhcnRJbmRleCArPSAyOyAgLy8gYm90aCBzaW5nbGUgKyBtdWx0aSBzbG90cyB3ZXJlIGluc2VydGVkXG4gIH1cblxuICAvLyB0aGlzIGlzIHdoZXJlIHdlIG1ha2Ugc3BhY2UgaW4gdGhlIGNvbnRleHQgZm9yIHRoZSBuZXcgY2xhc3MgYmluZGluZ3NcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBmaWx0ZXJlZENsYXNzQmluZGluZ05hbWVzLmxlbmd0aCAqIFN0eWxpbmdJbmRleC5TaXplOyBpKyspIHtcbiAgICBjb250ZXh0LnNwbGljZShtdWx0aVN0eWxlc1N0YXJ0SW5kZXgsIDAsIG51bGwpO1xuICAgIGNvbnRleHQucHVzaChudWxsKTtcbiAgICBtdWx0aVN0eWxlc1N0YXJ0SW5kZXgrKztcbiAgICBtdWx0aUNsYXNzZXNTdGFydEluZGV4Kys7XG4gIH1cblxuICBjb25zdCBpbml0aWFsQ2xhc3NlcyA9IGNvbnRleHRbU3R5bGluZ0luZGV4LkluaXRpYWxDbGFzc1ZhbHVlc1Bvc2l0aW9uXTtcbiAgY29uc3QgaW5pdGlhbFN0eWxlcyA9IGNvbnRleHRbU3R5bGluZ0luZGV4LkluaXRpYWxTdHlsZVZhbHVlc1Bvc2l0aW9uXTtcblxuICAvLyB0aGUgY29kZSBiZWxvdyB3aWxsIGluc2VydCBlYWNoIG5ldyBlbnRyeSBpbnRvIHRoZSBjb250ZXh0IGFuZCBhc3NpZ24gdGhlIGFwcHJvcHJpYXRlXG4gIC8vIGZsYWdzIGFuZCBpbmRleCB2YWx1ZXMgdG8gdGhlbS4gSXQncyBpbXBvcnRhbnQgdGhpcyBydW5zIGF0IHRoZSBlbmQgb2YgdGhpcyBmdW5jdGlvblxuICAvLyBiZWNhdXNlIHRoZSBjb250ZXh0LCBwcm9wZXJ0eSBvZmZzZXQgYW5kIGluZGV4IHZhbHVlcyBoYXZlIGFsbCBiZWVuIGNvbXB1dGVkIGp1c3QgYmVmb3JlLlxuICBmb3IgKGxldCBpID0gMDsgaSA8IHRvdGFsTmV3RW50cmllczsgaSsrKSB7XG4gICAgY29uc3QgZW50cnlJc0NsYXNzQmFzZWQgPSBpID49IGZpbHRlcmVkU3R5bGVCaW5kaW5nTmFtZXMubGVuZ3RoO1xuICAgIGNvbnN0IGFkanVzdGVkSW5kZXggPSBlbnRyeUlzQ2xhc3NCYXNlZCA/IChpIC0gZmlsdGVyZWRTdHlsZUJpbmRpbmdOYW1lcy5sZW5ndGgpIDogaTtcbiAgICBjb25zdCBwcm9wTmFtZSA9IGVudHJ5SXNDbGFzc0Jhc2VkID8gZmlsdGVyZWRDbGFzc0JpbmRpbmdOYW1lc1thZGp1c3RlZEluZGV4XSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlcmVkU3R5bGVCaW5kaW5nTmFtZXNbYWRqdXN0ZWRJbmRleF07XG5cbiAgICBsZXQgbXVsdGlJbmRleCwgc2luZ2xlSW5kZXg7XG4gICAgaWYgKGVudHJ5SXNDbGFzc0Jhc2VkKSB7XG4gICAgICBtdWx0aUluZGV4ID0gbXVsdGlDbGFzc2VzU3RhcnRJbmRleCArXG4gICAgICAgICAgKCh0b3RhbEN1cnJlbnRDbGFzc0JpbmRpbmdzICsgYWRqdXN0ZWRJbmRleCkgKiBTdHlsaW5nSW5kZXguU2l6ZSk7XG4gICAgICBzaW5nbGVJbmRleCA9IHNpbmdsZUNsYXNzZXNTdGFydEluZGV4ICtcbiAgICAgICAgICAoKHRvdGFsQ3VycmVudENsYXNzQmluZGluZ3MgKyBhZGp1c3RlZEluZGV4KSAqIFN0eWxpbmdJbmRleC5TaXplKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbXVsdGlJbmRleCA9XG4gICAgICAgICAgbXVsdGlTdHlsZXNTdGFydEluZGV4ICsgKCh0b3RhbEN1cnJlbnRTdHlsZUJpbmRpbmdzICsgYWRqdXN0ZWRJbmRleCkgKiBTdHlsaW5nSW5kZXguU2l6ZSk7XG4gICAgICBzaW5nbGVJbmRleCA9IHNpbmdsZVN0eWxlc1N0YXJ0SW5kZXggK1xuICAgICAgICAgICgodG90YWxDdXJyZW50U3R5bGVCaW5kaW5ncyArIGFkanVzdGVkSW5kZXgpICogU3R5bGluZ0luZGV4LlNpemUpO1xuICAgIH1cblxuICAgIC8vIGlmIGEgcHJvcGVydHkgaXMgbm90IGZvdW5kIGluIHRoZSBpbml0aWFsIHN0eWxlIHZhbHVlcyBsaXN0IHRoZW4gaXRcbiAgICAvLyBpcyBBTFdBWVMgYWRkZWQgaW5jYXNlIGEgZm9sbG93LXVwIGRpcmVjdGl2ZSBpbnRyb2R1Y2VzIHRoZSBzYW1lIGluaXRpYWxcbiAgICAvLyBzdHlsZS9jbGFzcyB2YWx1ZSBsYXRlciBvbi5cbiAgICBsZXQgaW5pdGlhbFZhbHVlc1RvTG9va3VwID0gZW50cnlJc0NsYXNzQmFzZWQgPyBpbml0aWFsQ2xhc3NlcyA6IGluaXRpYWxTdHlsZXM7XG4gICAgbGV0IGluZGV4Rm9ySW5pdGlhbCA9IGdldEluaXRpYWxTdHlsaW5nVmFsdWVzSW5kZXhPZihpbml0aWFsVmFsdWVzVG9Mb29rdXAsIHByb3BOYW1lKTtcbiAgICBpZiAoaW5kZXhGb3JJbml0aWFsID09PSAtMSkge1xuICAgICAgaW5kZXhGb3JJbml0aWFsID0gaW5pdGlhbFZhbHVlc1RvTG9va3VwLmxlbmd0aCArIEluaXRpYWxTdHlsaW5nVmFsdWVzSW5kZXguVmFsdWVPZmZzZXQ7XG4gICAgICBpbml0aWFsVmFsdWVzVG9Mb29rdXAucHVzaChwcm9wTmFtZSwgZW50cnlJc0NsYXNzQmFzZWQgPyBmYWxzZSA6IG51bGwpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpbmRleEZvckluaXRpYWwgKz0gSW5pdGlhbFN0eWxpbmdWYWx1ZXNJbmRleC5WYWx1ZU9mZnNldDtcbiAgICB9XG5cbiAgICBjb25zdCBpbml0aWFsRmxhZyA9XG4gICAgICAgIHByZXBhcmVJbml0aWFsRmxhZyhjb250ZXh0LCBwcm9wTmFtZSwgZW50cnlJc0NsYXNzQmFzZWQsIHN0eWxlU2FuaXRpemVyIHx8IG51bGwpO1xuXG4gICAgc2V0RmxhZyhjb250ZXh0LCBzaW5nbGVJbmRleCwgcG9pbnRlcnMoaW5pdGlhbEZsYWcsIGluZGV4Rm9ySW5pdGlhbCwgbXVsdGlJbmRleCkpO1xuICAgIHNldFByb3AoY29udGV4dCwgc2luZ2xlSW5kZXgsIHByb3BOYW1lKTtcbiAgICBzZXRWYWx1ZShjb250ZXh0LCBzaW5nbGVJbmRleCwgbnVsbCk7XG4gICAgc2V0UGxheWVyQnVpbGRlckluZGV4KGNvbnRleHQsIHNpbmdsZUluZGV4LCAwLCBkaXJlY3RpdmVJbmRleCk7XG5cbiAgICBzZXRGbGFnKGNvbnRleHQsIG11bHRpSW5kZXgsIHBvaW50ZXJzKGluaXRpYWxGbGFnLCBpbmRleEZvckluaXRpYWwsIHNpbmdsZUluZGV4KSk7XG4gICAgc2V0UHJvcChjb250ZXh0LCBtdWx0aUluZGV4LCBwcm9wTmFtZSk7XG4gICAgc2V0VmFsdWUoY29udGV4dCwgbXVsdGlJbmRleCwgbnVsbCk7XG4gICAgc2V0UGxheWVyQnVpbGRlckluZGV4KGNvbnRleHQsIG11bHRpSW5kZXgsIDAsIGRpcmVjdGl2ZUluZGV4KTtcbiAgfVxuXG4gIC8vIHRoZSB0b3RhbCBjbGFzc2VzL3N0eWxlIHZhbHVlcyBhcmUgdXBkYXRlZCBzbyB0aGUgbmV4dCB0aW1lIHRoZSBjb250ZXh0IGlzIHBhdGNoZWRcbiAgLy8gYWRkaXRpb25hbCBzdHlsZS9jbGFzcyBiaW5kaW5ncyBmcm9tIGFub3RoZXIgZGlyZWN0aXZlIHRoZW4gaXQga25vd3MgZXhhY3RseSB3aGVyZVxuICAvLyB0byBpbnNlcnQgdGhlbSBpbiB0aGUgY29udGV4dFxuICBzaW5nbGVQcm9wT2Zmc2V0VmFsdWVzW1NpbmdsZVByb3BPZmZzZXRWYWx1ZXNJbmRleC5DbGFzc2VzQ291bnRQb3NpdGlvbl0gPVxuICAgICAgdG90YWxDdXJyZW50Q2xhc3NCaW5kaW5ncyArIGZpbHRlcmVkQ2xhc3NCaW5kaW5nTmFtZXMubGVuZ3RoO1xuICBzaW5nbGVQcm9wT2Zmc2V0VmFsdWVzW1NpbmdsZVByb3BPZmZzZXRWYWx1ZXNJbmRleC5TdHlsZXNDb3VudFBvc2l0aW9uXSA9XG4gICAgICB0b3RhbEN1cnJlbnRTdHlsZUJpbmRpbmdzICsgZmlsdGVyZWRTdHlsZUJpbmRpbmdOYW1lcy5sZW5ndGg7XG5cbiAgLy8gdGhlcmUgaXMgbm8gaW5pdGlhbCB2YWx1ZSBmbGFnIGZvciB0aGUgbWFzdGVyIGluZGV4IHNpbmNlIGl0IGRvZXNuJ3RcbiAgLy8gcmVmZXJlbmNlIGFuIGluaXRpYWwgc3R5bGUgdmFsdWVcbiAgY29uc3QgbWFzdGVyRmxhZyA9IHBvaW50ZXJzKDAsIDAsIG11bHRpU3R5bGVzU3RhcnRJbmRleCkgfFxuICAgICAgKG9ubHlQcm9jZXNzU2luZ2xlQ2xhc3NlcyA/IFN0eWxpbmdGbGFncy5Pbmx5UHJvY2Vzc1NpbmdsZUNsYXNzZXMgOiAwKTtcbiAgc2V0RmxhZyhjb250ZXh0LCBTdHlsaW5nSW5kZXguTWFzdGVyRmxhZ1Bvc2l0aW9uLCBtYXN0ZXJGbGFnKTtcbn1cblxuLyoqXG4gKiBTZWFyY2hlcyB0aHJvdWdoIHRoZSBleGlzdGluZyByZWdpc3RyeSBvZiBkaXJlY3RpdmVzXG4gKi9cbmZ1bmN0aW9uIGZpbmRPclBhdGNoRGlyZWN0aXZlSW50b1JlZ2lzdHJ5KFxuICAgIGNvbnRleHQ6IFN0eWxpbmdDb250ZXh0LCBkaXJlY3RpdmVSZWY6IGFueSwgc3R5bGVTYW5pdGl6ZXI/OiBTdHlsZVNhbml0aXplRm4gfCBudWxsKSB7XG4gIGNvbnN0IGRpcmVjdGl2ZVJlZnMgPSBjb250ZXh0W1N0eWxpbmdJbmRleC5EaXJlY3RpdmVSZWdpc3RyeVBvc2l0aW9uXTtcbiAgY29uc3QgbmV4dE9mZnNldEluc2VydGlvbkluZGV4ID0gY29udGV4dFtTdHlsaW5nSW5kZXguU2luZ2xlUHJvcE9mZnNldFBvc2l0aW9uc10ubGVuZ3RoO1xuXG4gIGxldCBkaXJlY3RpdmVJbmRleDogbnVtYmVyO1xuICBjb25zdCBkZXRlY3RlZEluZGV4ID0gZ2V0RGlyZWN0aXZlUmVnaXN0cnlWYWx1ZXNJbmRleE9mKGRpcmVjdGl2ZVJlZnMsIGRpcmVjdGl2ZVJlZik7XG5cbiAgaWYgKGRldGVjdGVkSW5kZXggPT09IC0xKSB7XG4gICAgZGlyZWN0aXZlSW5kZXggPSBkaXJlY3RpdmVSZWZzLmxlbmd0aCAvIERpcmVjdGl2ZVJlZ2lzdHJ5VmFsdWVzSW5kZXguU2l6ZTtcbiAgICBkaXJlY3RpdmVSZWZzLnB1c2goZGlyZWN0aXZlUmVmLCBuZXh0T2Zmc2V0SW5zZXJ0aW9uSW5kZXgsIGZhbHNlLCBzdHlsZVNhbml0aXplciB8fCBudWxsKTtcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBzaW5nbGVQcm9wU3RhcnRQb3NpdGlvbiA9XG4gICAgICAgIGRldGVjdGVkSW5kZXggKyBEaXJlY3RpdmVSZWdpc3RyeVZhbHVlc0luZGV4LlNpbmdsZVByb3BWYWx1ZXNJbmRleE9mZnNldDtcbiAgICBpZiAoZGlyZWN0aXZlUmVmc1tzaW5nbGVQcm9wU3RhcnRQb3NpdGlvbl0gISA+PSAwKSB7XG4gICAgICAvLyB0aGUgZGlyZWN0aXZlIGhhcyBhbHJlYWR5IGJlZW4gcGF0Y2hlZCBpbnRvIHRoZSBjb250ZXh0XG4gICAgICByZXR1cm4gLTE7XG4gICAgfVxuXG4gICAgZGlyZWN0aXZlSW5kZXggPSBkZXRlY3RlZEluZGV4IC8gRGlyZWN0aXZlUmVnaXN0cnlWYWx1ZXNJbmRleC5TaXplO1xuXG4gICAgLy8gYmVjYXVzZSB0aGUgZGlyZWN0aXZlIGFscmVhZHkgZXhpc3RlZCB0aGlzIG1lYW5zIHRoYXQgaXQgd2FzIHNldCBkdXJpbmcgZWxlbWVudEhvc3RBdHRycyBvclxuICAgIC8vIGVsZW1lbnRTdGFydCB3aGljaCBtZWFucyB0aGF0IHRoZSBiaW5kaW5nIHZhbHVlcyB3ZXJlIG5vdCBoZXJlLiBUaGVyZWZvcmUsIHRoZSB2YWx1ZXMgYmVsb3dcbiAgICAvLyBuZWVkIHRvIGJlIGFwcGxpZWQgc28gdGhhdCBzaW5nbGUgY2xhc3MgYW5kIHN0eWxlIHByb3BlcnRpZXMgY2FuIGJlIGFzc2lnbmVkIGxhdGVyLlxuICAgIGNvbnN0IHNpbmdsZVByb3BQb3NpdGlvbkluZGV4ID1cbiAgICAgICAgZGV0ZWN0ZWRJbmRleCArIERpcmVjdGl2ZVJlZ2lzdHJ5VmFsdWVzSW5kZXguU2luZ2xlUHJvcFZhbHVlc0luZGV4T2Zmc2V0O1xuICAgIGRpcmVjdGl2ZVJlZnNbc2luZ2xlUHJvcFBvc2l0aW9uSW5kZXhdID0gbmV4dE9mZnNldEluc2VydGlvbkluZGV4O1xuXG4gICAgLy8gdGhlIHNhbml0aXplciBpcyBhbHNvIGFwYXJ0IG9mIHRoZSBiaW5kaW5nIHByb2Nlc3MgYW5kIHdpbGwgYmUgdXNlZCB3aGVuIGJpbmRpbmdzIGFyZVxuICAgIC8vIGFwcGxpZWQuXG4gICAgY29uc3Qgc3R5bGVTYW5pdGl6ZXJJbmRleCA9IGRldGVjdGVkSW5kZXggKyBEaXJlY3RpdmVSZWdpc3RyeVZhbHVlc0luZGV4LlN0eWxlU2FuaXRpemVyT2Zmc2V0O1xuICAgIGRpcmVjdGl2ZVJlZnNbc3R5bGVTYW5pdGl6ZXJJbmRleF0gPSBzdHlsZVNhbml0aXplciB8fCBudWxsO1xuICB9XG5cbiAgcmV0dXJuIGRpcmVjdGl2ZUluZGV4O1xufVxuXG5mdW5jdGlvbiBnZXRNYXRjaGluZ0JpbmRpbmdJbmRleChcbiAgICBjb250ZXh0OiBTdHlsaW5nQ29udGV4dCwgYmluZGluZ05hbWU6IHN0cmluZywgc3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXIpIHtcbiAgZm9yIChsZXQgaiA9IHN0YXJ0OyBqIDwgZW5kOyBqICs9IFN0eWxpbmdJbmRleC5TaXplKSB7XG4gICAgaWYgKGdldFByb3AoY29udGV4dCwgaikgPT09IGJpbmRpbmdOYW1lKSByZXR1cm4gajtcbiAgfVxuICByZXR1cm4gLTE7XG59XG5cbi8qKlxuICogU2V0cyBhbmQgcmVzb2x2ZXMgYWxsIGBtdWx0aWAgc3R5bGluZyBvbiBhbiBgU3R5bGluZ0NvbnRleHRgIHNvIHRoYXQgdGhleSBjYW4gYmVcbiAqIGFwcGxpZWQgdG8gdGhlIGVsZW1lbnQgb25jZSBgcmVuZGVyU3R5bGluZ2AgaXMgY2FsbGVkLlxuICpcbiAqIEFsbCBtaXNzaW5nIHN0eWxlcy9jbGFzcyAoYW55IHZhbHVlcyB0aGF0IGFyZSBub3QgcHJvdmlkZWQgaW4gdGhlIG5ldyBgc3R5bGVzYFxuICogb3IgYGNsYXNzZXNgIHBhcmFtcykgd2lsbCByZXNvbHZlIHRvIGBudWxsYCB3aXRoaW4gdGhlaXIgcmVzcGVjdGl2ZSBwb3NpdGlvbnNcbiAqIGluIHRoZSBjb250ZXh0LlxuICpcbiAqIEBwYXJhbSBjb250ZXh0IFRoZSBzdHlsaW5nIGNvbnRleHQgdGhhdCB3aWxsIGJlIHVwZGF0ZWQgd2l0aCB0aGVcbiAqICAgIG5ld2x5IHByb3ZpZGVkIHN0eWxlIHZhbHVlcy5cbiAqIEBwYXJhbSBjbGFzc2VzSW5wdXQgVGhlIGtleS92YWx1ZSBtYXAgb2YgQ1NTIGNsYXNzIG5hbWVzIHRoYXQgd2lsbCBiZSB1c2VkIGZvciB0aGUgdXBkYXRlLlxuICogQHBhcmFtIHN0eWxlc0lucHV0IFRoZSBrZXkvdmFsdWUgbWFwIG9mIENTUyBzdHlsZXMgdGhhdCB3aWxsIGJlIHVzZWQgZm9yIHRoZSB1cGRhdGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVTdHlsaW5nTWFwKFxuICAgIGNvbnRleHQ6IFN0eWxpbmdDb250ZXh0LCBjbGFzc2VzSW5wdXQ6IHtba2V5OiBzdHJpbmddOiBhbnl9IHwgc3RyaW5nIHxcbiAgICAgICAgQm91bmRQbGF5ZXJGYWN0b3J5PG51bGx8c3RyaW5nfHtba2V5OiBzdHJpbmddOiBhbnl9PnwgTk9fQ0hBTkdFIHwgbnVsbCxcbiAgICBzdHlsZXNJbnB1dD86IHtba2V5OiBzdHJpbmddOiBhbnl9IHwgQm91bmRQbGF5ZXJGYWN0b3J5PG51bGx8e1trZXk6IHN0cmluZ106IGFueX0+fCBOT19DSEFOR0UgfFxuICAgICAgICBudWxsLFxuICAgIGRpcmVjdGl2ZVJlZj86IGFueSk6IHZvaWQge1xuICBzdHlsZXNJbnB1dCA9IHN0eWxlc0lucHV0IHx8IG51bGw7XG5cbiAgY29uc3QgZGlyZWN0aXZlSW5kZXggPSBnZXREaXJlY3RpdmVJbmRleEZyb21SZWdpc3RyeShjb250ZXh0LCBkaXJlY3RpdmVSZWYgfHwgbnVsbCk7XG4gIGNvbnN0IGVsZW1lbnQgPSBjb250ZXh0W1N0eWxpbmdJbmRleC5FbGVtZW50UG9zaXRpb25dICFhcyBIVE1MRWxlbWVudDtcbiAgY29uc3QgY2xhc3Nlc1BsYXllckJ1aWxkZXIgPSBjbGFzc2VzSW5wdXQgaW5zdGFuY2VvZiBCb3VuZFBsYXllckZhY3RvcnkgP1xuICAgICAgbmV3IENsYXNzQW5kU3R5bGVQbGF5ZXJCdWlsZGVyKGNsYXNzZXNJbnB1dCBhcyBhbnksIGVsZW1lbnQsIEJpbmRpbmdUeXBlLkNsYXNzKSA6XG4gICAgICBudWxsO1xuICBjb25zdCBzdHlsZXNQbGF5ZXJCdWlsZGVyID0gc3R5bGVzSW5wdXQgaW5zdGFuY2VvZiBCb3VuZFBsYXllckZhY3RvcnkgP1xuICAgICAgbmV3IENsYXNzQW5kU3R5bGVQbGF5ZXJCdWlsZGVyKHN0eWxlc0lucHV0IGFzIGFueSwgZWxlbWVudCwgQmluZGluZ1R5cGUuU3R5bGUpIDpcbiAgICAgIG51bGw7XG5cbiAgY29uc3QgY2xhc3Nlc1ZhbHVlID0gY2xhc3Nlc1BsYXllckJ1aWxkZXIgP1xuICAgICAgKGNsYXNzZXNJbnB1dCBhcyBCb3VuZFBsYXllckZhY3Rvcnk8e1trZXk6IHN0cmluZ106IGFueX18c3RyaW5nPikgIS52YWx1ZSA6XG4gICAgICBjbGFzc2VzSW5wdXQ7XG4gIGNvbnN0IHN0eWxlc1ZhbHVlID0gc3R5bGVzUGxheWVyQnVpbGRlciA/IHN0eWxlc0lucHV0ICFbJ3ZhbHVlJ10gOiBzdHlsZXNJbnB1dDtcbiAgLy8gZWFybHkgZXhpdCAodGhpcyBpcyB3aGF0J3MgZG9uZSB0byBhdm9pZCB1c2luZyBjdHguYmluZCgpIHRvIGNhY2hlIHRoZSB2YWx1ZSlcbiAgY29uc3QgaWdub3JlQWxsQ2xhc3NVcGRhdGVzID0gbGltaXRUb1NpbmdsZUNsYXNzZXMoY29udGV4dCkgfHwgY2xhc3Nlc1ZhbHVlID09PSBOT19DSEFOR0UgfHxcbiAgICAgIGNsYXNzZXNWYWx1ZSA9PT0gY29udGV4dFtTdHlsaW5nSW5kZXguQ2FjaGVkQ2xhc3NWYWx1ZU9ySW5pdGlhbENsYXNzU3RyaW5nXTtcbiAgY29uc3QgaWdub3JlQWxsU3R5bGVVcGRhdGVzID1cbiAgICAgIHN0eWxlc1ZhbHVlID09PSBOT19DSEFOR0UgfHwgc3R5bGVzVmFsdWUgPT09IGNvbnRleHRbU3R5bGluZ0luZGV4LkNhY2hlZFN0eWxlVmFsdWVdO1xuICBpZiAoaWdub3JlQWxsQ2xhc3NVcGRhdGVzICYmIGlnbm9yZUFsbFN0eWxlVXBkYXRlcykgcmV0dXJuO1xuXG4gIGNvbnRleHRbU3R5bGluZ0luZGV4LkNhY2hlZENsYXNzVmFsdWVPckluaXRpYWxDbGFzc1N0cmluZ10gPSBjbGFzc2VzVmFsdWU7XG4gIGNvbnRleHRbU3R5bGluZ0luZGV4LkNhY2hlZFN0eWxlVmFsdWVdID0gc3R5bGVzVmFsdWU7XG5cbiAgbGV0IGNsYXNzTmFtZXM6IHN0cmluZ1tdID0gRU1QVFlfQVJSQVk7XG4gIGxldCBhcHBseUFsbENsYXNzZXMgPSBmYWxzZTtcbiAgbGV0IHBsYXllckJ1aWxkZXJzQXJlRGlydHkgPSBmYWxzZTtcblxuICBjb25zdCBjbGFzc2VzUGxheWVyQnVpbGRlckluZGV4ID1cbiAgICAgIGNsYXNzZXNQbGF5ZXJCdWlsZGVyID8gUGxheWVySW5kZXguQ2xhc3NNYXBQbGF5ZXJCdWlsZGVyUG9zaXRpb24gOiAwO1xuICBpZiAoaGFzUGxheWVyQnVpbGRlckNoYW5nZWQoXG4gICAgICAgICAgY29udGV4dCwgY2xhc3Nlc1BsYXllckJ1aWxkZXIsIFBsYXllckluZGV4LkNsYXNzTWFwUGxheWVyQnVpbGRlclBvc2l0aW9uKSkge1xuICAgIHNldFBsYXllckJ1aWxkZXIoY29udGV4dCwgY2xhc3Nlc1BsYXllckJ1aWxkZXIsIFBsYXllckluZGV4LkNsYXNzTWFwUGxheWVyQnVpbGRlclBvc2l0aW9uKTtcbiAgICBwbGF5ZXJCdWlsZGVyc0FyZURpcnR5ID0gdHJ1ZTtcbiAgfVxuXG4gIGNvbnN0IHN0eWxlc1BsYXllckJ1aWxkZXJJbmRleCA9XG4gICAgICBzdHlsZXNQbGF5ZXJCdWlsZGVyID8gUGxheWVySW5kZXguU3R5bGVNYXBQbGF5ZXJCdWlsZGVyUG9zaXRpb24gOiAwO1xuICBpZiAoaGFzUGxheWVyQnVpbGRlckNoYW5nZWQoXG4gICAgICAgICAgY29udGV4dCwgc3R5bGVzUGxheWVyQnVpbGRlciwgUGxheWVySW5kZXguU3R5bGVNYXBQbGF5ZXJCdWlsZGVyUG9zaXRpb24pKSB7XG4gICAgc2V0UGxheWVyQnVpbGRlcihjb250ZXh0LCBzdHlsZXNQbGF5ZXJCdWlsZGVyLCBQbGF5ZXJJbmRleC5TdHlsZU1hcFBsYXllckJ1aWxkZXJQb3NpdGlvbik7XG4gICAgcGxheWVyQnVpbGRlcnNBcmVEaXJ0eSA9IHRydWU7XG4gIH1cblxuICAvLyBlYWNoIHRpbWUgYSBzdHJpbmctYmFzZWQgdmFsdWUgcG9wcyB1cCB0aGVuIGl0IHNob3VsZG4ndCByZXF1aXJlIGEgZGVlcFxuICAvLyBjaGVjayBvZiB3aGF0J3MgY2hhbmdlZC5cbiAgaWYgKCFpZ25vcmVBbGxDbGFzc1VwZGF0ZXMpIHtcbiAgICBpZiAodHlwZW9mIGNsYXNzZXNWYWx1ZSA9PSAnc3RyaW5nJykge1xuICAgICAgY2xhc3NOYW1lcyA9IGNsYXNzZXNWYWx1ZS5zcGxpdCgvXFxzKy8pO1xuICAgICAgLy8gdGhpcyBib29sZWFuIGlzIHVzZWQgdG8gYXZvaWQgaGF2aW5nIHRvIGNyZWF0ZSBhIGtleS92YWx1ZSBtYXAgb2YgYHRydWVgIHZhbHVlc1xuICAgICAgLy8gc2luY2UgYSBjbGFzc25hbWUgc3RyaW5nIGltcGxpZXMgdGhhdCBhbGwgdGhvc2UgY2xhc3NlcyBhcmUgYWRkZWRcbiAgICAgIGFwcGx5QWxsQ2xhc3NlcyA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNsYXNzTmFtZXMgPSBjbGFzc2VzVmFsdWUgPyBPYmplY3Qua2V5cyhjbGFzc2VzVmFsdWUpIDogRU1QVFlfQVJSQVk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgY2xhc3NlcyA9IChjbGFzc2VzVmFsdWUgfHwgRU1QVFlfT0JKKSBhc3tba2V5OiBzdHJpbmddOiBhbnl9O1xuICBjb25zdCBzdHlsZVByb3BzID0gc3R5bGVzVmFsdWUgPyBPYmplY3Qua2V5cyhzdHlsZXNWYWx1ZSkgOiBFTVBUWV9BUlJBWTtcbiAgY29uc3Qgc3R5bGVzID0gc3R5bGVzVmFsdWUgfHwgRU1QVFlfT0JKO1xuXG4gIGNvbnN0IGNsYXNzZXNTdGFydEluZGV4ID0gc3R5bGVQcm9wcy5sZW5ndGg7XG4gIGxldCBtdWx0aVN0YXJ0SW5kZXggPSBnZXRNdWx0aVN0YXJ0SW5kZXgoY29udGV4dCk7XG5cbiAgbGV0IGRpcnR5ID0gZmFsc2U7XG4gIGxldCBjdHhJbmRleCA9IG11bHRpU3RhcnRJbmRleDtcblxuICBsZXQgcHJvcEluZGV4ID0gMDtcbiAgY29uc3QgcHJvcExpbWl0ID0gc3R5bGVQcm9wcy5sZW5ndGggKyBjbGFzc05hbWVzLmxlbmd0aDtcblxuICAvLyB0aGUgbWFpbiBsb29wIGhlcmUgd2lsbCB0cnkgYW5kIGZpZ3VyZSBvdXQgaG93IHRoZSBzaGFwZSBvZiB0aGUgcHJvdmlkZWRcbiAgLy8gc3R5bGVzIGRpZmZlciB3aXRoIHJlc3BlY3QgdG8gdGhlIGNvbnRleHQuIExhdGVyIGlmIHRoZSBjb250ZXh0L3N0eWxlcy9jbGFzc2VzXG4gIC8vIGFyZSBvZmYtYmFsYW5jZSB0aGVuIHRoZXkgd2lsbCBiZSBkZWFsdCBpbiBhbm90aGVyIGxvb3AgYWZ0ZXIgdGhpcyBvbmVcbiAgd2hpbGUgKGN0eEluZGV4IDwgY29udGV4dC5sZW5ndGggJiYgcHJvcEluZGV4IDwgcHJvcExpbWl0KSB7XG4gICAgY29uc3QgaXNDbGFzc0Jhc2VkID0gcHJvcEluZGV4ID49IGNsYXNzZXNTdGFydEluZGV4O1xuICAgIGNvbnN0IHByb2Nlc3NWYWx1ZSA9XG4gICAgICAgICghaXNDbGFzc0Jhc2VkICYmICFpZ25vcmVBbGxTdHlsZVVwZGF0ZXMpIHx8IChpc0NsYXNzQmFzZWQgJiYgIWlnbm9yZUFsbENsYXNzVXBkYXRlcyk7XG5cbiAgICAvLyB3aGVuIHRoZXJlIGlzIGEgY2FjaGUtaGl0IGZvciBhIHN0cmluZy1iYXNlZCBjbGFzcyB0aGVuIHdlIHNob3VsZFxuICAgIC8vIGF2b2lkIGRvaW5nIGFueSB3b3JrIGRpZmZpbmcgYW55IG9mIHRoZSBjaGFuZ2VzXG4gICAgaWYgKHByb2Nlc3NWYWx1ZSkge1xuICAgICAgY29uc3QgYWRqdXN0ZWRQcm9wSW5kZXggPSBpc0NsYXNzQmFzZWQgPyBwcm9wSW5kZXggLSBjbGFzc2VzU3RhcnRJbmRleCA6IHByb3BJbmRleDtcbiAgICAgIGNvbnN0IG5ld1Byb3A6IHN0cmluZyA9XG4gICAgICAgICAgaXNDbGFzc0Jhc2VkID8gY2xhc3NOYW1lc1thZGp1c3RlZFByb3BJbmRleF0gOiBzdHlsZVByb3BzW2FkanVzdGVkUHJvcEluZGV4XTtcbiAgICAgIGNvbnN0IG5ld1ZhbHVlOiBzdHJpbmd8Ym9vbGVhbiA9XG4gICAgICAgICAgaXNDbGFzc0Jhc2VkID8gKGFwcGx5QWxsQ2xhc3NlcyA/IHRydWUgOiBjbGFzc2VzW25ld1Byb3BdKSA6IHN0eWxlc1tuZXdQcm9wXTtcbiAgICAgIGNvbnN0IHBsYXllckJ1aWxkZXJJbmRleCA9XG4gICAgICAgICAgaXNDbGFzc0Jhc2VkID8gY2xhc3Nlc1BsYXllckJ1aWxkZXJJbmRleCA6IHN0eWxlc1BsYXllckJ1aWxkZXJJbmRleDtcblxuICAgICAgY29uc3QgcHJvcCA9IGdldFByb3AoY29udGV4dCwgY3R4SW5kZXgpO1xuICAgICAgaWYgKHByb3AgPT09IG5ld1Byb3ApIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBnZXRWYWx1ZShjb250ZXh0LCBjdHhJbmRleCk7XG4gICAgICAgIGNvbnN0IGZsYWcgPSBnZXRQb2ludGVycyhjb250ZXh0LCBjdHhJbmRleCk7XG4gICAgICAgIHNldFBsYXllckJ1aWxkZXJJbmRleChjb250ZXh0LCBjdHhJbmRleCwgcGxheWVyQnVpbGRlckluZGV4LCBkaXJlY3RpdmVJbmRleCk7XG5cbiAgICAgICAgaWYgKGhhc1ZhbHVlQ2hhbmdlZChmbGFnLCB2YWx1ZSwgbmV3VmFsdWUpKSB7XG4gICAgICAgICAgc2V0VmFsdWUoY29udGV4dCwgY3R4SW5kZXgsIG5ld1ZhbHVlKTtcbiAgICAgICAgICBwbGF5ZXJCdWlsZGVyc0FyZURpcnR5ID0gcGxheWVyQnVpbGRlcnNBcmVEaXJ0eSB8fCAhIXBsYXllckJ1aWxkZXJJbmRleDtcblxuICAgICAgICAgIGNvbnN0IGluaXRpYWxWYWx1ZSA9IGdldEluaXRpYWxWYWx1ZShjb250ZXh0LCBmbGFnKTtcblxuICAgICAgICAgIC8vIFNLSVAgSUYgSU5JVElBTCBDSEVDS1xuICAgICAgICAgIC8vIElmIHRoZSBmb3JtZXIgYHZhbHVlYCBpcyBgbnVsbGAgdGhlbiBpdCBtZWFucyB0aGF0IGFuIGluaXRpYWwgdmFsdWVcbiAgICAgICAgICAvLyBjb3VsZCBiZSBiZWluZyByZW5kZXJlZCBvbiBzY3JlZW4uIElmIHRoYXQgaXMgdGhlIGNhc2UgdGhlbiB0aGVyZSBpc1xuICAgICAgICAgIC8vIG5vIHBvaW50IGluIHVwZGF0aW5nIHRoZSB2YWx1ZSBpbmNhc2UgaXQgbWF0Y2hlcy4gSW4gb3RoZXIgd29yZHMgaWYgdGhlXG4gICAgICAgICAgLy8gbmV3IHZhbHVlIGlzIHRoZSBleGFjdCBzYW1lIGFzIHRoZSBwcmV2aW91c2x5IHJlbmRlcmVkIHZhbHVlICh3aGljaFxuICAgICAgICAgIC8vIGhhcHBlbnMgdG8gYmUgdGhlIGluaXRpYWwgdmFsdWUpIHRoZW4gZG8gbm90aGluZy5cbiAgICAgICAgICBpZiAodmFsdWUgIT0gbnVsbCB8fCBoYXNWYWx1ZUNoYW5nZWQoZmxhZywgaW5pdGlhbFZhbHVlLCBuZXdWYWx1ZSkpIHtcbiAgICAgICAgICAgIHNldERpcnR5KGNvbnRleHQsIGN0eEluZGV4LCB0cnVlKTtcbiAgICAgICAgICAgIGRpcnR5ID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGluZGV4T2ZFbnRyeSA9IGZpbmRFbnRyeVBvc2l0aW9uQnlQcm9wKGNvbnRleHQsIG5ld1Byb3AsIGN0eEluZGV4KTtcbiAgICAgICAgaWYgKGluZGV4T2ZFbnRyeSA+IDApIHtcbiAgICAgICAgICAvLyBpdCB3YXMgZm91bmQgYXQgYSBsYXRlciBwb2ludCAuLi4ganVzdCBzd2FwIHRoZSB2YWx1ZXNcbiAgICAgICAgICBjb25zdCB2YWx1ZVRvQ29tcGFyZSA9IGdldFZhbHVlKGNvbnRleHQsIGluZGV4T2ZFbnRyeSk7XG4gICAgICAgICAgY29uc3QgZmxhZ1RvQ29tcGFyZSA9IGdldFBvaW50ZXJzKGNvbnRleHQsIGluZGV4T2ZFbnRyeSk7XG4gICAgICAgICAgc3dhcE11bHRpQ29udGV4dEVudHJpZXMoY29udGV4dCwgY3R4SW5kZXgsIGluZGV4T2ZFbnRyeSk7XG4gICAgICAgICAgaWYgKGhhc1ZhbHVlQ2hhbmdlZChmbGFnVG9Db21wYXJlLCB2YWx1ZVRvQ29tcGFyZSwgbmV3VmFsdWUpKSB7XG4gICAgICAgICAgICBjb25zdCBpbml0aWFsVmFsdWUgPSBnZXRJbml0aWFsVmFsdWUoY29udGV4dCwgZmxhZ1RvQ29tcGFyZSk7XG4gICAgICAgICAgICBzZXRWYWx1ZShjb250ZXh0LCBjdHhJbmRleCwgbmV3VmFsdWUpO1xuXG4gICAgICAgICAgICAvLyBzYW1lIGlmIHN0YXRlbWVudCBsb2dpYyBhcyBhYm92ZSAobG9vayBmb3IgU0tJUCBJRiBJTklUSUFMIENIRUNLKS5cbiAgICAgICAgICAgIGlmICh2YWx1ZVRvQ29tcGFyZSAhPSBudWxsIHx8IGhhc1ZhbHVlQ2hhbmdlZChmbGFnVG9Db21wYXJlLCBpbml0aWFsVmFsdWUsIG5ld1ZhbHVlKSkge1xuICAgICAgICAgICAgICBzZXREaXJ0eShjb250ZXh0LCBjdHhJbmRleCwgdHJ1ZSk7XG4gICAgICAgICAgICAgIHBsYXllckJ1aWxkZXJzQXJlRGlydHkgPSBwbGF5ZXJCdWlsZGVyc0FyZURpcnR5IHx8ICEhcGxheWVyQnVpbGRlckluZGV4O1xuICAgICAgICAgICAgICBkaXJ0eSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIHdlIG9ubHkgY2FyZSB0byBkbyB0aGlzIGlmIHRoZSBpbnNlcnRpb24gaXMgaW4gdGhlIG1pZGRsZVxuICAgICAgICAgIGNvbnN0IG5ld0ZsYWcgPSBwcmVwYXJlSW5pdGlhbEZsYWcoXG4gICAgICAgICAgICAgIGNvbnRleHQsIG5ld1Byb3AsIGlzQ2xhc3NCYXNlZCwgZ2V0U3R5bGVTYW5pdGl6ZXIoY29udGV4dCwgZGlyZWN0aXZlSW5kZXgpKTtcbiAgICAgICAgICBwbGF5ZXJCdWlsZGVyc0FyZURpcnR5ID0gcGxheWVyQnVpbGRlcnNBcmVEaXJ0eSB8fCAhIXBsYXllckJ1aWxkZXJJbmRleDtcbiAgICAgICAgICBpbnNlcnROZXdNdWx0aVByb3BlcnR5KFxuICAgICAgICAgICAgICBjb250ZXh0LCBjdHhJbmRleCwgaXNDbGFzc0Jhc2VkLCBuZXdQcm9wLCBuZXdGbGFnLCBuZXdWYWx1ZSwgZGlyZWN0aXZlSW5kZXgsXG4gICAgICAgICAgICAgIHBsYXllckJ1aWxkZXJJbmRleCk7XG4gICAgICAgICAgZGlydHkgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgY3R4SW5kZXggKz0gU3R5bGluZ0luZGV4LlNpemU7XG4gICAgcHJvcEluZGV4Kys7XG4gIH1cblxuICAvLyB0aGlzIG1lYW5zIHRoYXQgdGhlcmUgYXJlIGxlZnQtb3ZlciB2YWx1ZXMgaW4gdGhlIGNvbnRleHQgdGhhdFxuICAvLyB3ZXJlIG5vdCBpbmNsdWRlZCBpbiB0aGUgcHJvdmlkZWQgc3R5bGVzL2NsYXNzZXMgYW5kIGluIHRoaXNcbiAgLy8gY2FzZSB0aGUgIGdvYWwgaXMgdG8gXCJyZW1vdmVcIiB0aGVtIGZyb20gdGhlIGNvbnRleHQgKGJ5IG51bGxpZnlpbmcpXG4gIHdoaWxlIChjdHhJbmRleCA8IGNvbnRleHQubGVuZ3RoKSB7XG4gICAgY29uc3QgZmxhZyA9IGdldFBvaW50ZXJzKGNvbnRleHQsIGN0eEluZGV4KTtcbiAgICBjb25zdCBpc0NsYXNzQmFzZWQgPSAoZmxhZyAmIFN0eWxpbmdGbGFncy5DbGFzcykgPT09IFN0eWxpbmdGbGFncy5DbGFzcztcbiAgICBjb25zdCBwcm9jZXNzVmFsdWUgPVxuICAgICAgICAoIWlzQ2xhc3NCYXNlZCAmJiAhaWdub3JlQWxsU3R5bGVVcGRhdGVzKSB8fCAoaXNDbGFzc0Jhc2VkICYmICFpZ25vcmVBbGxDbGFzc1VwZGF0ZXMpO1xuICAgIGlmIChwcm9jZXNzVmFsdWUpIHtcbiAgICAgIGNvbnN0IHZhbHVlID0gZ2V0VmFsdWUoY29udGV4dCwgY3R4SW5kZXgpO1xuICAgICAgY29uc3QgZG9SZW1vdmVWYWx1ZSA9IHZhbHVlRXhpc3RzKHZhbHVlLCBpc0NsYXNzQmFzZWQpO1xuICAgICAgaWYgKGRvUmVtb3ZlVmFsdWUpIHtcbiAgICAgICAgc2V0RGlydHkoY29udGV4dCwgY3R4SW5kZXgsIHRydWUpO1xuICAgICAgICBzZXRWYWx1ZShjb250ZXh0LCBjdHhJbmRleCwgbnVsbCk7XG5cbiAgICAgICAgLy8gd2Uga2VlcCB0aGUgcGxheWVyIGZhY3RvcnkgdGhlIHNhbWUgc28gdGhhdCB0aGUgYG51bGxlZGAgdmFsdWUgY2FuXG4gICAgICAgIC8vIGJlIGluc3RydWN0ZWQgaW50byB0aGUgcGxheWVyIGJlY2F1c2UgcmVtb3ZpbmcgYSBzdHlsZSBhbmQvb3IgYSBjbGFzc1xuICAgICAgICAvLyBpcyBhIHZhbGlkIGFuaW1hdGlvbiBwbGF5ZXIgaW5zdHJ1Y3Rpb24uXG4gICAgICAgIGNvbnN0IHBsYXllckJ1aWxkZXJJbmRleCA9XG4gICAgICAgICAgICBpc0NsYXNzQmFzZWQgPyBjbGFzc2VzUGxheWVyQnVpbGRlckluZGV4IDogc3R5bGVzUGxheWVyQnVpbGRlckluZGV4O1xuICAgICAgICBzZXRQbGF5ZXJCdWlsZGVySW5kZXgoY29udGV4dCwgY3R4SW5kZXgsIHBsYXllckJ1aWxkZXJJbmRleCwgZGlyZWN0aXZlSW5kZXgpO1xuICAgICAgICBkaXJ0eSA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIGN0eEluZGV4ICs9IFN0eWxpbmdJbmRleC5TaXplO1xuICB9XG5cbiAgLy8gdGhpcyBtZWFucyB0aGF0IHRoZXJlIGFyZSBsZWZ0LW92ZXIgcHJvcGVydGllcyBpbiB0aGUgY29udGV4dCB0aGF0XG4gIC8vIHdlcmUgbm90IGRldGVjdGVkIGluIHRoZSBjb250ZXh0IGR1cmluZyB0aGUgbG9vcCBhYm92ZS4gSW4gdGhhdFxuICAvLyBjYXNlIHdlIHdhbnQgdG8gYWRkIHRoZSBuZXcgZW50cmllcyBpbnRvIHRoZSBsaXN0XG4gIGNvbnN0IHNhbml0aXplciA9IGdldFN0eWxlU2FuaXRpemVyKGNvbnRleHQsIGRpcmVjdGl2ZUluZGV4KTtcbiAgd2hpbGUgKHByb3BJbmRleCA8IHByb3BMaW1pdCkge1xuICAgIGNvbnN0IGlzQ2xhc3NCYXNlZCA9IHByb3BJbmRleCA+PSBjbGFzc2VzU3RhcnRJbmRleDtcbiAgICBjb25zdCBwcm9jZXNzVmFsdWUgPVxuICAgICAgICAoIWlzQ2xhc3NCYXNlZCAmJiAhaWdub3JlQWxsU3R5bGVVcGRhdGVzKSB8fCAoaXNDbGFzc0Jhc2VkICYmICFpZ25vcmVBbGxDbGFzc1VwZGF0ZXMpO1xuICAgIGlmIChwcm9jZXNzVmFsdWUpIHtcbiAgICAgIGNvbnN0IGFkanVzdGVkUHJvcEluZGV4ID0gaXNDbGFzc0Jhc2VkID8gcHJvcEluZGV4IC0gY2xhc3Nlc1N0YXJ0SW5kZXggOiBwcm9wSW5kZXg7XG4gICAgICBjb25zdCBwcm9wID0gaXNDbGFzc0Jhc2VkID8gY2xhc3NOYW1lc1thZGp1c3RlZFByb3BJbmRleF0gOiBzdHlsZVByb3BzW2FkanVzdGVkUHJvcEluZGV4XTtcbiAgICAgIGNvbnN0IHZhbHVlOiBzdHJpbmd8Ym9vbGVhbiA9XG4gICAgICAgICAgaXNDbGFzc0Jhc2VkID8gKGFwcGx5QWxsQ2xhc3NlcyA/IHRydWUgOiBjbGFzc2VzW3Byb3BdKSA6IHN0eWxlc1twcm9wXTtcbiAgICAgIGNvbnN0IGZsYWcgPSBwcmVwYXJlSW5pdGlhbEZsYWcoY29udGV4dCwgcHJvcCwgaXNDbGFzc0Jhc2VkLCBzYW5pdGl6ZXIpIHwgU3R5bGluZ0ZsYWdzLkRpcnR5O1xuICAgICAgY29uc3QgcGxheWVyQnVpbGRlckluZGV4ID1cbiAgICAgICAgICBpc0NsYXNzQmFzZWQgPyBjbGFzc2VzUGxheWVyQnVpbGRlckluZGV4IDogc3R5bGVzUGxheWVyQnVpbGRlckluZGV4O1xuICAgICAgY29uc3QgY3R4SW5kZXggPSBjb250ZXh0Lmxlbmd0aDtcbiAgICAgIGNvbnRleHQucHVzaChmbGFnLCBwcm9wLCB2YWx1ZSwgMCk7XG4gICAgICBzZXRQbGF5ZXJCdWlsZGVySW5kZXgoY29udGV4dCwgY3R4SW5kZXgsIHBsYXllckJ1aWxkZXJJbmRleCwgZGlyZWN0aXZlSW5kZXgpO1xuICAgICAgZGlydHkgPSB0cnVlO1xuICAgIH1cbiAgICBwcm9wSW5kZXgrKztcbiAgfVxuXG4gIGlmIChkaXJ0eSkge1xuICAgIHNldENvbnRleHREaXJ0eShjb250ZXh0LCB0cnVlKTtcbiAgICBzZXREaXJlY3RpdmVEaXJ0eShjb250ZXh0LCBkaXJlY3RpdmVJbmRleCwgdHJ1ZSk7XG4gIH1cblxuICBpZiAocGxheWVyQnVpbGRlcnNBcmVEaXJ0eSkge1xuICAgIHNldENvbnRleHRQbGF5ZXJzRGlydHkoY29udGV4dCwgdHJ1ZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGlzIG1ldGhvZCB3aWxsIHRvZ2dsZSB0aGUgcmVmZXJlbmNlZCBDU1MgY2xhc3MgKGJ5IHRoZSBwcm92aWRlZCBpbmRleClcbiAqIHdpdGhpbiB0aGUgZ2l2ZW4gY29udGV4dC5cbiAqXG4gKiBAcGFyYW0gY29udGV4dCBUaGUgc3R5bGluZyBjb250ZXh0IHRoYXQgd2lsbCBiZSB1cGRhdGVkIHdpdGggdGhlXG4gKiAgICBuZXdseSBwcm92aWRlZCBjbGFzcyB2YWx1ZS5cbiAqIEBwYXJhbSBvZmZzZXQgVGhlIGluZGV4IG9mIHRoZSBDU1MgY2xhc3Mgd2hpY2ggaXMgYmVpbmcgdXBkYXRlZC5cbiAqIEBwYXJhbSBhZGRPclJlbW92ZSBXaGV0aGVyIG9yIG5vdCB0byBhZGQgb3IgcmVtb3ZlIHRoZSBDU1MgY2xhc3NcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZUNsYXNzUHJvcChcbiAgICBjb250ZXh0OiBTdHlsaW5nQ29udGV4dCwgb2Zmc2V0OiBudW1iZXIsIGFkZE9yUmVtb3ZlOiBib29sZWFuIHwgQm91bmRQbGF5ZXJGYWN0b3J5PGJvb2xlYW4+LFxuICAgIGRpcmVjdGl2ZVJlZj86IGFueSk6IHZvaWQge1xuICBfdXBkYXRlU2luZ2xlU3R5bGluZ1ZhbHVlKGNvbnRleHQsIG9mZnNldCwgYWRkT3JSZW1vdmUsIHRydWUsIGRpcmVjdGl2ZVJlZik7XG59XG5cbi8qKlxuICogU2V0cyBhbmQgcmVzb2x2ZXMgYSBzaW5nbGUgc3R5bGUgdmFsdWUgb24gdGhlIHByb3ZpZGVkIGBTdHlsaW5nQ29udGV4dGAgc29cbiAqIHRoYXQgdGhleSBjYW4gYmUgYXBwbGllZCB0byB0aGUgZWxlbWVudCBvbmNlIGByZW5kZXJTdHlsaW5nYCBpcyBjYWxsZWQuXG4gKlxuICogTm90ZSB0aGF0IHByb3AtbGV2ZWwgc3R5bGluZyB2YWx1ZXMgYXJlIGNvbnNpZGVyZWQgaGlnaGVyIHByaW9yaXR5IHRoYW4gYW55IHN0eWxpbmcgdGhhdFxuICogaGFzIGJlZW4gYXBwbGllZCB1c2luZyBgdXBkYXRlU3R5bGluZ01hcGAsIHRoZXJlZm9yZSwgd2hlbiBzdHlsaW5nIHZhbHVlcyBhcmUgcmVuZGVyZWRcbiAqIHRoZW4gYW55IHN0eWxlcy9jbGFzc2VzIHRoYXQgaGF2ZSBiZWVuIGFwcGxpZWQgdXNpbmcgdGhpcyBmdW5jdGlvbiB3aWxsIGJlIGNvbnNpZGVyZWQgZmlyc3RcbiAqICh0aGVuIG11bHRpIHZhbHVlcyBzZWNvbmQgYW5kIHRoZW4gaW5pdGlhbCB2YWx1ZXMgYXMgYSBiYWNrdXApLlxuICpcbiAqIEBwYXJhbSBjb250ZXh0IFRoZSBzdHlsaW5nIGNvbnRleHQgdGhhdCB3aWxsIGJlIHVwZGF0ZWQgd2l0aCB0aGVcbiAqICAgIG5ld2x5IHByb3ZpZGVkIHN0eWxlIHZhbHVlLlxuICogQHBhcmFtIG9mZnNldCBUaGUgaW5kZXggb2YgdGhlIHByb3BlcnR5IHdoaWNoIGlzIGJlaW5nIHVwZGF0ZWQuXG4gKiBAcGFyYW0gdmFsdWUgVGhlIENTUyBzdHlsZSB2YWx1ZSB0aGF0IHdpbGwgYmUgYXNzaWduZWRcbiAqIEBwYXJhbSBkaXJlY3RpdmVSZWYgYW4gb3B0aW9uYWwgcmVmZXJlbmNlIHRvIHRoZSBkaXJlY3RpdmUgcmVzcG9uc2libGVcbiAqICAgIGZvciB0aGlzIGJpbmRpbmcgY2hhbmdlLiBJZiBwcmVzZW50IHRoZW4gc3R5bGUgYmluZGluZyB3aWxsIG9ubHlcbiAqICAgIGFjdHVhbGl6ZSBpZiB0aGUgZGlyZWN0aXZlIGhhcyBvd25lcnNoaXAgb3ZlciB0aGlzIGJpbmRpbmdcbiAqICAgIChzZWUgc3R5bGluZy50cyNkaXJlY3RpdmVzIGZvciBtb3JlIGluZm9ybWF0aW9uIGFib3V0IHRoZSBhbGdvcml0aG0pLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlU3R5bGVQcm9wKFxuICAgIGNvbnRleHQ6IFN0eWxpbmdDb250ZXh0LCBvZmZzZXQ6IG51bWJlcixcbiAgICBpbnB1dDogc3RyaW5nIHwgYm9vbGVhbiB8IG51bGwgfCBCb3VuZFBsYXllckZhY3Rvcnk8c3RyaW5nfGJvb2xlYW58bnVsbD4sXG4gICAgZGlyZWN0aXZlUmVmPzogYW55KTogdm9pZCB7XG4gIF91cGRhdGVTaW5nbGVTdHlsaW5nVmFsdWUoY29udGV4dCwgb2Zmc2V0LCBpbnB1dCwgZmFsc2UsIGRpcmVjdGl2ZVJlZik7XG59XG5cbmZ1bmN0aW9uIF91cGRhdGVTaW5nbGVTdHlsaW5nVmFsdWUoXG4gICAgY29udGV4dDogU3R5bGluZ0NvbnRleHQsIG9mZnNldDogbnVtYmVyLFxuICAgIGlucHV0OiBzdHJpbmcgfCBib29sZWFuIHwgbnVsbCB8IEJvdW5kUGxheWVyRmFjdG9yeTxzdHJpbmd8Ym9vbGVhbnxudWxsPiwgaXNDbGFzc0Jhc2VkOiBib29sZWFuLFxuICAgIGRpcmVjdGl2ZVJlZjogYW55KTogdm9pZCB7XG4gIGNvbnN0IGRpcmVjdGl2ZUluZGV4ID0gZ2V0RGlyZWN0aXZlSW5kZXhGcm9tUmVnaXN0cnkoY29udGV4dCwgZGlyZWN0aXZlUmVmIHx8IG51bGwpO1xuICBjb25zdCBzaW5nbGVJbmRleCA9IGdldFNpbmdsZVByb3BJbmRleFZhbHVlKGNvbnRleHQsIGRpcmVjdGl2ZUluZGV4LCBvZmZzZXQsIGlzQ2xhc3NCYXNlZCk7XG4gIGNvbnN0IGN1cnJWYWx1ZSA9IGdldFZhbHVlKGNvbnRleHQsIHNpbmdsZUluZGV4KTtcbiAgY29uc3QgY3VyckZsYWcgPSBnZXRQb2ludGVycyhjb250ZXh0LCBzaW5nbGVJbmRleCk7XG4gIGNvbnN0IGN1cnJEaXJlY3RpdmUgPSBnZXREaXJlY3RpdmVJbmRleEZyb21FbnRyeShjb250ZXh0LCBzaW5nbGVJbmRleCk7XG4gIGNvbnN0IHZhbHVlOiBzdHJpbmd8Ym9vbGVhbnxudWxsID0gKGlucHV0IGluc3RhbmNlb2YgQm91bmRQbGF5ZXJGYWN0b3J5KSA/IGlucHV0LnZhbHVlIDogaW5wdXQ7XG5cbiAgaWYgKGhhc1ZhbHVlQ2hhbmdlZChjdXJyRmxhZywgY3VyclZhbHVlLCB2YWx1ZSkgJiZcbiAgICAgIGFsbG93VmFsdWVDaGFuZ2UoY3VyclZhbHVlLCB2YWx1ZSwgY3VyckRpcmVjdGl2ZSwgZGlyZWN0aXZlSW5kZXgpKSB7XG4gICAgY29uc3QgaXNDbGFzc0Jhc2VkID0gKGN1cnJGbGFnICYgU3R5bGluZ0ZsYWdzLkNsYXNzKSA9PT0gU3R5bGluZ0ZsYWdzLkNsYXNzO1xuICAgIGNvbnN0IGVsZW1lbnQgPSBjb250ZXh0W1N0eWxpbmdJbmRleC5FbGVtZW50UG9zaXRpb25dICFhcyBIVE1MRWxlbWVudDtcbiAgICBjb25zdCBwbGF5ZXJCdWlsZGVyID0gaW5wdXQgaW5zdGFuY2VvZiBCb3VuZFBsYXllckZhY3RvcnkgP1xuICAgICAgICBuZXcgQ2xhc3NBbmRTdHlsZVBsYXllckJ1aWxkZXIoXG4gICAgICAgICAgICBpbnB1dCBhcyBhbnksIGVsZW1lbnQsIGlzQ2xhc3NCYXNlZCA/IEJpbmRpbmdUeXBlLkNsYXNzIDogQmluZGluZ1R5cGUuU3R5bGUpIDpcbiAgICAgICAgbnVsbDtcbiAgICBjb25zdCB2YWx1ZSA9IChwbGF5ZXJCdWlsZGVyID8gKGlucHV0IGFzIEJvdW5kUGxheWVyRmFjdG9yeTxhbnk+KS52YWx1ZSA6IGlucHV0KSBhcyBzdHJpbmcgfFxuICAgICAgICBib29sZWFuIHwgbnVsbDtcbiAgICBjb25zdCBjdXJyUGxheWVySW5kZXggPSBnZXRQbGF5ZXJCdWlsZGVySW5kZXgoY29udGV4dCwgc2luZ2xlSW5kZXgpO1xuXG4gICAgbGV0IHBsYXllckJ1aWxkZXJzQXJlRGlydHkgPSBmYWxzZTtcbiAgICBsZXQgcGxheWVyQnVpbGRlckluZGV4ID0gcGxheWVyQnVpbGRlciA/IGN1cnJQbGF5ZXJJbmRleCA6IDA7XG4gICAgaWYgKGhhc1BsYXllckJ1aWxkZXJDaGFuZ2VkKGNvbnRleHQsIHBsYXllckJ1aWxkZXIsIGN1cnJQbGF5ZXJJbmRleCkpIHtcbiAgICAgIGNvbnN0IG5ld0luZGV4ID0gc2V0UGxheWVyQnVpbGRlcihjb250ZXh0LCBwbGF5ZXJCdWlsZGVyLCBjdXJyUGxheWVySW5kZXgpO1xuICAgICAgcGxheWVyQnVpbGRlckluZGV4ID0gcGxheWVyQnVpbGRlciA/IG5ld0luZGV4IDogMDtcbiAgICAgIHBsYXllckJ1aWxkZXJzQXJlRGlydHkgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmIChwbGF5ZXJCdWlsZGVyc0FyZURpcnR5IHx8IGN1cnJEaXJlY3RpdmUgIT09IGRpcmVjdGl2ZUluZGV4KSB7XG4gICAgICBzZXRQbGF5ZXJCdWlsZGVySW5kZXgoY29udGV4dCwgc2luZ2xlSW5kZXgsIHBsYXllckJ1aWxkZXJJbmRleCwgZGlyZWN0aXZlSW5kZXgpO1xuICAgIH1cblxuICAgIGlmIChjdXJyRGlyZWN0aXZlICE9PSBkaXJlY3RpdmVJbmRleCkge1xuICAgICAgY29uc3QgcHJvcCA9IGdldFByb3AoY29udGV4dCwgc2luZ2xlSW5kZXgpO1xuICAgICAgY29uc3Qgc2FuaXRpemVyID0gZ2V0U3R5bGVTYW5pdGl6ZXIoY29udGV4dCwgZGlyZWN0aXZlSW5kZXgpO1xuICAgICAgc2V0U2FuaXRpemVGbGFnKGNvbnRleHQsIHNpbmdsZUluZGV4LCAoc2FuaXRpemVyICYmIHNhbml0aXplcihwcm9wKSkgPyB0cnVlIDogZmFsc2UpO1xuICAgIH1cblxuICAgIC8vIHRoZSB2YWx1ZSB3aWxsIGFsd2F5cyBnZXQgdXBkYXRlZCAoZXZlbiBpZiB0aGUgZGlydHkgZmxhZyBpcyBza2lwcGVkKVxuICAgIHNldFZhbHVlKGNvbnRleHQsIHNpbmdsZUluZGV4LCB2YWx1ZSk7XG4gICAgY29uc3QgaW5kZXhGb3JNdWx0aSA9IGdldE11bHRpT3JTaW5nbGVJbmRleChjdXJyRmxhZyk7XG5cbiAgICAvLyBpZiB0aGUgdmFsdWUgaXMgdGhlIHNhbWUgaW4gdGhlIG11bHRpLWFyZWEgdGhlbiB0aGVyZSdzIG5vIHBvaW50IGluIHJlLWFzc2VtYmxpbmdcbiAgICBjb25zdCB2YWx1ZUZvck11bHRpID0gZ2V0VmFsdWUoY29udGV4dCwgaW5kZXhGb3JNdWx0aSk7XG4gICAgaWYgKCF2YWx1ZUZvck11bHRpIHx8IGhhc1ZhbHVlQ2hhbmdlZChjdXJyRmxhZywgdmFsdWVGb3JNdWx0aSwgdmFsdWUpKSB7XG4gICAgICBsZXQgbXVsdGlEaXJ0eSA9IGZhbHNlO1xuICAgICAgbGV0IHNpbmdsZURpcnR5ID0gdHJ1ZTtcblxuICAgICAgLy8gb25seSB3aGVuIHRoZSB2YWx1ZSBpcyBzZXQgdG8gYG51bGxgIHNob3VsZCB0aGUgbXVsdGktdmFsdWUgZ2V0IGZsYWdnZWRcbiAgICAgIGlmICghdmFsdWVFeGlzdHModmFsdWUsIGlzQ2xhc3NCYXNlZCkgJiYgdmFsdWVFeGlzdHModmFsdWVGb3JNdWx0aSwgaXNDbGFzc0Jhc2VkKSkge1xuICAgICAgICBtdWx0aURpcnR5ID0gdHJ1ZTtcbiAgICAgICAgc2luZ2xlRGlydHkgPSBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgc2V0RGlydHkoY29udGV4dCwgaW5kZXhGb3JNdWx0aSwgbXVsdGlEaXJ0eSk7XG4gICAgICBzZXREaXJ0eShjb250ZXh0LCBzaW5nbGVJbmRleCwgc2luZ2xlRGlydHkpO1xuICAgICAgc2V0RGlyZWN0aXZlRGlydHkoY29udGV4dCwgZGlyZWN0aXZlSW5kZXgsIHRydWUpO1xuICAgICAgc2V0Q29udGV4dERpcnR5KGNvbnRleHQsIHRydWUpO1xuICAgIH1cblxuICAgIGlmIChwbGF5ZXJCdWlsZGVyc0FyZURpcnR5KSB7XG4gICAgICBzZXRDb250ZXh0UGxheWVyc0RpcnR5KGNvbnRleHQsIHRydWUpO1xuICAgIH1cbiAgfVxufVxuXG5cbi8qKlxuICogUmVuZGVycyBhbGwgcXVldWVkIHN0eWxpbmcgdXNpbmcgYSByZW5kZXJlciBvbnRvIHRoZSBnaXZlbiBlbGVtZW50LlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gd29ya3MgYnkgcmVuZGVyaW5nIGFueSBzdHlsZXMgKHRoYXQgaGF2ZSBiZWVuIGFwcGxpZWRcbiAqIHVzaW5nIGB1cGRhdGVTdHlsaW5nTWFwYCkgYW5kIGFueSBjbGFzc2VzICh0aGF0IGhhdmUgYmVlbiBhcHBsaWVkIHVzaW5nXG4gKiBgdXBkYXRlU3R5bGVQcm9wYCkgb250byB0aGUgcHJvdmlkZWQgZWxlbWVudCB1c2luZyB0aGUgcHJvdmlkZWQgcmVuZGVyZXIuXG4gKiBKdXN0IGJlZm9yZSB0aGUgc3R5bGVzL2NsYXNzZXMgYXJlIHJlbmRlcmVkIGEgZmluYWwga2V5L3ZhbHVlIHN0eWxlIG1hcFxuICogd2lsbCBiZSBhc3NlbWJsZWQgKGlmIGBzdHlsZVN0b3JlYCBvciBgY2xhc3NTdG9yZWAgYXJlIHByb3ZpZGVkKS5cbiAqXG4gKiBAcGFyYW0gbEVsZW1lbnQgdGhlIGVsZW1lbnQgdGhhdCB0aGUgc3R5bGVzIHdpbGwgYmUgcmVuZGVyZWQgb25cbiAqIEBwYXJhbSBjb250ZXh0IFRoZSBzdHlsaW5nIGNvbnRleHQgdGhhdCB3aWxsIGJlIHVzZWQgdG8gZGV0ZXJtaW5lXG4gKiAgICAgIHdoYXQgc3R5bGVzIHdpbGwgYmUgcmVuZGVyZWRcbiAqIEBwYXJhbSByZW5kZXJlciB0aGUgcmVuZGVyZXIgdGhhdCB3aWxsIGJlIHVzZWQgdG8gYXBwbHkgdGhlIHN0eWxpbmdcbiAqIEBwYXJhbSBjbGFzc2VzU3RvcmUgaWYgcHJvdmlkZWQsIHRoZSB1cGRhdGVkIGNsYXNzIHZhbHVlcyB3aWxsIGJlIGFwcGxpZWRcbiAqICAgIHRvIHRoaXMga2V5L3ZhbHVlIG1hcCBpbnN0ZWFkIG9mIGJlaW5nIHJlbmRlcmVyZWQgdmlhIHRoZSByZW5kZXJlci5cbiAqIEBwYXJhbSBzdHlsZXNTdG9yZSBpZiBwcm92aWRlZCwgdGhlIHVwZGF0ZWQgc3R5bGUgdmFsdWVzIHdpbGwgYmUgYXBwbGllZFxuICogICAgdG8gdGhpcyBrZXkvdmFsdWUgbWFwIGluc3RlYWQgb2YgYmVpbmcgcmVuZGVyZXJlZCB2aWEgdGhlIHJlbmRlcmVyLlxuICogQHBhcmFtIGRpcmVjdGl2ZVJlZiBhbiBvcHRpb25hbCBkaXJlY3RpdmUgdGhhdCB3aWxsIGJlIHVzZWQgdG8gdGFyZ2V0IHdoaWNoXG4gKiAgICBzdHlsaW5nIHZhbHVlcyBhcmUgcmVuZGVyZWQuIElmIGxlZnQgZW1wdHksIG9ubHkgdGhlIGJpbmRpbmdzIHRoYXQgYXJlXG4gKiAgICByZWdpc3RlcmVkIG9uIHRoZSB0ZW1wbGF0ZSB3aWxsIGJlIHJlbmRlcmVkLlxuICogQHJldHVybnMgbnVtYmVyIHRoZSB0b3RhbCBhbW91bnQgb2YgcGxheWVycyB0aGF0IGdvdCBxdWV1ZWQgZm9yIGFuaW1hdGlvbiAoaWYgYW55KVxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyU3R5bGluZyhcbiAgICBjb250ZXh0OiBTdHlsaW5nQ29udGV4dCwgcmVuZGVyZXI6IFJlbmRlcmVyMywgcm9vdE9yVmlldzogUm9vdENvbnRleHQgfCBMVmlldyxcbiAgICBpc0ZpcnN0UmVuZGVyOiBib29sZWFuLCBjbGFzc2VzU3RvcmU/OiBCaW5kaW5nU3RvcmUgfCBudWxsLCBzdHlsZXNTdG9yZT86IEJpbmRpbmdTdG9yZSB8IG51bGwsXG4gICAgZGlyZWN0aXZlUmVmPzogYW55KTogbnVtYmVyIHtcbiAgbGV0IHRvdGFsUGxheWVyc1F1ZXVlZCA9IDA7XG4gIGNvbnN0IHRhcmdldERpcmVjdGl2ZUluZGV4ID0gZ2V0RGlyZWN0aXZlSW5kZXhGcm9tUmVnaXN0cnkoY29udGV4dCwgZGlyZWN0aXZlUmVmIHx8IG51bGwpO1xuXG4gIGlmIChpc0NvbnRleHREaXJ0eShjb250ZXh0KSAmJiBpc0RpcmVjdGl2ZURpcnR5KGNvbnRleHQsIHRhcmdldERpcmVjdGl2ZUluZGV4KSkge1xuICAgIGNvbnN0IGZsdXNoUGxheWVyQnVpbGRlcnM6IGFueSA9XG4gICAgICAgIGNvbnRleHRbU3R5bGluZ0luZGV4Lk1hc3RlckZsYWdQb3NpdGlvbl0gJiBTdHlsaW5nRmxhZ3MuUGxheWVyQnVpbGRlcnNEaXJ0eTtcbiAgICBjb25zdCBuYXRpdmUgPSBjb250ZXh0W1N0eWxpbmdJbmRleC5FbGVtZW50UG9zaXRpb25dICE7XG4gICAgY29uc3QgbXVsdGlTdGFydEluZGV4ID0gZ2V0TXVsdGlTdGFydEluZGV4KGNvbnRleHQpO1xuICAgIGNvbnN0IG9ubHlTaW5nbGVDbGFzc2VzID0gbGltaXRUb1NpbmdsZUNsYXNzZXMoY29udGV4dCk7XG5cbiAgICBsZXQgc3RpbGxEaXJ0eSA9IGZhbHNlO1xuICAgIGZvciAobGV0IGkgPSBTdHlsaW5nSW5kZXguU2luZ2xlU3R5bGVzU3RhcnRQb3NpdGlvbjsgaSA8IGNvbnRleHQubGVuZ3RoO1xuICAgICAgICAgaSArPSBTdHlsaW5nSW5kZXguU2l6ZSkge1xuICAgICAgLy8gdGhlcmUgaXMgbm8gcG9pbnQgaW4gcmVuZGVyaW5nIHN0eWxlcyB0aGF0IGhhdmUgbm90IGNoYW5nZWQgb24gc2NyZWVuXG4gICAgICBpZiAoaXNEaXJ0eShjb250ZXh0LCBpKSkge1xuICAgICAgICBjb25zdCBmbGFnID0gZ2V0UG9pbnRlcnMoY29udGV4dCwgaSk7XG4gICAgICAgIGNvbnN0IGRpcmVjdGl2ZUluZGV4ID0gZ2V0RGlyZWN0aXZlSW5kZXhGcm9tRW50cnkoY29udGV4dCwgaSk7XG4gICAgICAgIGlmICh0YXJnZXREaXJlY3RpdmVJbmRleCAhPT0gZGlyZWN0aXZlSW5kZXgpIHtcbiAgICAgICAgICBzdGlsbERpcnR5ID0gdHJ1ZTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHByb3AgPSBnZXRQcm9wKGNvbnRleHQsIGkpO1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGdldFZhbHVlKGNvbnRleHQsIGkpO1xuICAgICAgICBjb25zdCBzdHlsZVNhbml0aXplciA9XG4gICAgICAgICAgICAoZmxhZyAmIFN0eWxpbmdGbGFncy5TYW5pdGl6ZSkgPyBnZXRTdHlsZVNhbml0aXplcihjb250ZXh0LCBkaXJlY3RpdmVJbmRleCkgOiBudWxsO1xuICAgICAgICBjb25zdCBwbGF5ZXJCdWlsZGVyID0gZ2V0UGxheWVyQnVpbGRlcihjb250ZXh0LCBpKTtcbiAgICAgICAgY29uc3QgaXNDbGFzc0Jhc2VkID0gZmxhZyAmIFN0eWxpbmdGbGFncy5DbGFzcyA/IHRydWUgOiBmYWxzZTtcbiAgICAgICAgY29uc3QgaXNJblNpbmdsZVJlZ2lvbiA9IGkgPCBtdWx0aVN0YXJ0SW5kZXg7XG4gICAgICAgIGNvbnN0IHJlYWRJbml0aWFsVmFsdWUgPSAhaXNDbGFzc0Jhc2VkIHx8ICFvbmx5U2luZ2xlQ2xhc3NlcztcblxuICAgICAgICBsZXQgdmFsdWVUb0FwcGx5OiBzdHJpbmd8Ym9vbGVhbnxudWxsID0gdmFsdWU7XG5cbiAgICAgICAgLy8gVkFMVUUgREVGRVIgQ0FTRSAxOiBVc2UgYSBtdWx0aSB2YWx1ZSBpbnN0ZWFkIG9mIGEgbnVsbCBzaW5nbGUgdmFsdWVcbiAgICAgICAgLy8gdGhpcyBjaGVjayBpbXBsaWVzIHRoYXQgYSBzaW5nbGUgdmFsdWUgd2FzIHJlbW92ZWQgYW5kIHdlXG4gICAgICAgIC8vIHNob3VsZCBub3cgZGVmZXIgdG8gYSBtdWx0aSB2YWx1ZSBhbmQgdXNlIHRoYXQgKGlmIHNldCkuXG4gICAgICAgIGlmIChpc0luU2luZ2xlUmVnaW9uICYmICF2YWx1ZUV4aXN0cyh2YWx1ZVRvQXBwbHksIGlzQ2xhc3NCYXNlZCkpIHtcbiAgICAgICAgICAvLyBzaW5nbGUgdmFsdWVzIEFMV0FZUyBoYXZlIGEgcmVmZXJlbmNlIHRvIGEgbXVsdGkgaW5kZXhcbiAgICAgICAgICBjb25zdCBtdWx0aUluZGV4ID0gZ2V0TXVsdGlPclNpbmdsZUluZGV4KGZsYWcpO1xuICAgICAgICAgIHZhbHVlVG9BcHBseSA9IGdldFZhbHVlKGNvbnRleHQsIG11bHRpSW5kZXgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVkFMVUUgREVGRVIgQ0FTRSAyOiBVc2UgdGhlIGluaXRpYWwgdmFsdWUgaWYgYWxsIGVsc2UgZmFpbHMgKGlzIGZhbHN5KVxuICAgICAgICAvLyB0aGUgaW5pdGlhbCB2YWx1ZSB3aWxsIGFsd2F5cyBiZSBhIHN0cmluZyBvciBudWxsLFxuICAgICAgICAvLyB0aGVyZWZvcmUgd2UgY2FuIHNhZmVseSBhZG9wdCBpdCBpbmNhc2UgdGhlcmUncyBub3RoaW5nIGVsc2VcbiAgICAgICAgLy8gbm90ZSB0aGF0IHRoaXMgc2hvdWxkIGFsd2F5cyBiZSBhIGZhbHN5IGNoZWNrIHNpbmNlIGBmYWxzZWAgaXMgdXNlZFxuICAgICAgICAvLyBmb3IgYm90aCBjbGFzcyBhbmQgc3R5bGUgY29tcGFyaXNvbnMgKHN0eWxlcyBjYW4ndCBiZSBmYWxzZSBhbmQgZmFsc2VcbiAgICAgICAgLy8gY2xhc3NlcyBhcmUgdHVybmVkIG9mZiBhbmQgc2hvdWxkIHRoZXJlZm9yZSBkZWZlciB0byB0aGVpciBpbml0aWFsIHZhbHVlcylcbiAgICAgICAgLy8gTm90ZSB0aGF0IHdlIGlnbm9yZSBjbGFzcy1iYXNlZCBkZWZlcmFscyBiZWNhdXNlIG90aGVyd2lzZSBhIGNsYXNzIGNhbiBuZXZlclxuICAgICAgICAvLyBiZSByZW1vdmVkIGluIHRoZSBjYXNlIHRoYXQgaXQgZXhpc3RzIGFzIHRydWUgaW4gdGhlIGluaXRpYWwgY2xhc3NlcyBsaXN0Li4uXG4gICAgICAgIGlmICghaXNDbGFzc0Jhc2VkICYmICF2YWx1ZUV4aXN0cyh2YWx1ZVRvQXBwbHksIGlzQ2xhc3NCYXNlZCkgJiYgcmVhZEluaXRpYWxWYWx1ZSkge1xuICAgICAgICAgIHZhbHVlVG9BcHBseSA9IGdldEluaXRpYWxWYWx1ZShjb250ZXh0LCBmbGFnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlmIHRoZSBmaXJzdCByZW5kZXIgaXMgdHJ1ZSB0aGVuIHdlIGRvIG5vdCB3YW50IHRvIHN0YXJ0IGFwcGx5aW5nIGZhbHN5XG4gICAgICAgIC8vIHZhbHVlcyB0byB0aGUgRE9NIGVsZW1lbnQncyBzdHlsaW5nLiBPdGhlcndpc2UgdGhlbiB3ZSBrbm93IHRoZXJlIGhhc1xuICAgICAgICAvLyBiZWVuIGEgY2hhbmdlIGFuZCBldmVuIGlmIGl0J3MgZmFsc3kgdGhlbiBpdCdzIHJlbW92aW5nIHNvbWV0aGluZyB0aGF0XG4gICAgICAgIC8vIHdhcyB0cnV0aHkgYmVmb3JlLlxuICAgICAgICBjb25zdCBkb0FwcGx5VmFsdWUgPSBpc0ZpcnN0UmVuZGVyID8gdmFsdWVUb0FwcGx5IDogdHJ1ZTtcbiAgICAgICAgaWYgKGRvQXBwbHlWYWx1ZSkge1xuICAgICAgICAgIGlmIChpc0NsYXNzQmFzZWQpIHtcbiAgICAgICAgICAgIHNldENsYXNzKFxuICAgICAgICAgICAgICAgIG5hdGl2ZSwgcHJvcCwgdmFsdWVUb0FwcGx5ID8gdHJ1ZSA6IGZhbHNlLCByZW5kZXJlciwgY2xhc3Nlc1N0b3JlLCBwbGF5ZXJCdWlsZGVyKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2V0U3R5bGUoXG4gICAgICAgICAgICAgICAgbmF0aXZlLCBwcm9wLCB2YWx1ZVRvQXBwbHkgYXMgc3RyaW5nIHwgbnVsbCwgcmVuZGVyZXIsIHN0eWxlU2FuaXRpemVyLCBzdHlsZXNTdG9yZSxcbiAgICAgICAgICAgICAgICBwbGF5ZXJCdWlsZGVyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBzZXREaXJ0eShjb250ZXh0LCBpLCBmYWxzZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGZsdXNoUGxheWVyQnVpbGRlcnMpIHtcbiAgICAgIGNvbnN0IHJvb3RDb250ZXh0ID1cbiAgICAgICAgICBBcnJheS5pc0FycmF5KHJvb3RPclZpZXcpID8gZ2V0Um9vdENvbnRleHQocm9vdE9yVmlldykgOiByb290T3JWaWV3IGFzIFJvb3RDb250ZXh0O1xuICAgICAgY29uc3QgcGxheWVyQ29udGV4dCA9IGdldFBsYXllckNvbnRleHQoY29udGV4dCkgITtcbiAgICAgIGNvbnN0IHBsYXllcnNTdGFydEluZGV4ID0gcGxheWVyQ29udGV4dFtQbGF5ZXJJbmRleC5Ob25CdWlsZGVyUGxheWVyc1N0YXJ0XTtcbiAgICAgIGZvciAobGV0IGkgPSBQbGF5ZXJJbmRleC5QbGF5ZXJCdWlsZGVyc1N0YXJ0UG9zaXRpb247IGkgPCBwbGF5ZXJzU3RhcnRJbmRleDtcbiAgICAgICAgICAgaSArPSBQbGF5ZXJJbmRleC5QbGF5ZXJBbmRQbGF5ZXJCdWlsZGVyc1R1cGxlU2l6ZSkge1xuICAgICAgICBjb25zdCBidWlsZGVyID0gcGxheWVyQ29udGV4dFtpXSBhcyBDbGFzc0FuZFN0eWxlUGxheWVyQnVpbGRlcjxhbnk+fCBudWxsO1xuICAgICAgICBjb25zdCBwbGF5ZXJJbnNlcnRpb25JbmRleCA9IGkgKyBQbGF5ZXJJbmRleC5QbGF5ZXJPZmZzZXRQb3NpdGlvbjtcbiAgICAgICAgY29uc3Qgb2xkUGxheWVyID0gcGxheWVyQ29udGV4dFtwbGF5ZXJJbnNlcnRpb25JbmRleF0gYXMgUGxheWVyIHwgbnVsbDtcbiAgICAgICAgaWYgKGJ1aWxkZXIpIHtcbiAgICAgICAgICBjb25zdCBwbGF5ZXIgPSBidWlsZGVyLmJ1aWxkUGxheWVyKG9sZFBsYXllciwgaXNGaXJzdFJlbmRlcik7XG4gICAgICAgICAgaWYgKHBsYXllciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpZiAocGxheWVyICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgY29uc3Qgd2FzUXVldWVkID0gYWRkUGxheWVySW50ZXJuYWwoXG4gICAgICAgICAgICAgICAgICBwbGF5ZXJDb250ZXh0LCByb290Q29udGV4dCwgbmF0aXZlIGFzIEhUTUxFbGVtZW50LCBwbGF5ZXIsIHBsYXllckluc2VydGlvbkluZGV4KTtcbiAgICAgICAgICAgICAgd2FzUXVldWVkICYmIHRvdGFsUGxheWVyc1F1ZXVlZCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG9sZFBsYXllcikge1xuICAgICAgICAgICAgICBvbGRQbGF5ZXIuZGVzdHJveSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChvbGRQbGF5ZXIpIHtcbiAgICAgICAgICAvLyB0aGUgcGxheWVyIGJ1aWxkZXIgaGFzIGJlZW4gcmVtb3ZlZCAuLi4gdGhlcmVmb3JlIHdlIHNob3VsZCBkZWxldGUgdGhlIGFzc29jaWF0ZWRcbiAgICAgICAgICAvLyBwbGF5ZXJcbiAgICAgICAgICBvbGRQbGF5ZXIuZGVzdHJveSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBzZXRDb250ZXh0UGxheWVyc0RpcnR5KGNvbnRleHQsIGZhbHNlKTtcbiAgICB9XG5cbiAgICBzZXREaXJlY3RpdmVEaXJ0eShjb250ZXh0LCB0YXJnZXREaXJlY3RpdmVJbmRleCwgZmFsc2UpO1xuICAgIHNldENvbnRleHREaXJ0eShjb250ZXh0LCBzdGlsbERpcnR5KTtcbiAgfVxuXG4gIHJldHVybiB0b3RhbFBsYXllcnNRdWV1ZWQ7XG59XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiByZW5kZXJzIGEgZ2l2ZW4gQ1NTIHByb3AvdmFsdWUgZW50cnkgdXNpbmcgdGhlXG4gKiBwcm92aWRlZCByZW5kZXJlci4gSWYgYSBgc3RvcmVgIHZhbHVlIGlzIHByb3ZpZGVkIHRoZW5cbiAqIHRoYXQgd2lsbCBiZSB1c2VkIGEgcmVuZGVyIGNvbnRleHQgaW5zdGVhZCBvZiB0aGUgcHJvdmlkZWRcbiAqIHJlbmRlcmVyLlxuICpcbiAqIEBwYXJhbSBuYXRpdmUgdGhlIERPTSBFbGVtZW50XG4gKiBAcGFyYW0gcHJvcCB0aGUgQ1NTIHN0eWxlIHByb3BlcnR5IHRoYXQgd2lsbCBiZSByZW5kZXJlZFxuICogQHBhcmFtIHZhbHVlIHRoZSBDU1Mgc3R5bGUgdmFsdWUgdGhhdCB3aWxsIGJlIHJlbmRlcmVkXG4gKiBAcGFyYW0gcmVuZGVyZXJcbiAqIEBwYXJhbSBzdG9yZSBhbiBvcHRpb25hbCBrZXkvdmFsdWUgbWFwIHRoYXQgd2lsbCBiZSB1c2VkIGFzIGEgY29udGV4dCB0byByZW5kZXIgc3R5bGVzIG9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRTdHlsZShcbiAgICBuYXRpdmU6IGFueSwgcHJvcDogc3RyaW5nLCB2YWx1ZTogc3RyaW5nIHwgbnVsbCwgcmVuZGVyZXI6IFJlbmRlcmVyMyxcbiAgICBzYW5pdGl6ZXI6IFN0eWxlU2FuaXRpemVGbiB8IG51bGwsIHN0b3JlPzogQmluZGluZ1N0b3JlIHwgbnVsbCxcbiAgICBwbGF5ZXJCdWlsZGVyPzogQ2xhc3NBbmRTdHlsZVBsYXllckJ1aWxkZXI8YW55PnwgbnVsbCkge1xuICB2YWx1ZSA9IHNhbml0aXplciAmJiB2YWx1ZSA/IHNhbml0aXplcihwcm9wLCB2YWx1ZSkgOiB2YWx1ZTtcbiAgaWYgKHN0b3JlIHx8IHBsYXllckJ1aWxkZXIpIHtcbiAgICBpZiAoc3RvcmUpIHtcbiAgICAgIHN0b3JlLnNldFZhbHVlKHByb3AsIHZhbHVlKTtcbiAgICB9XG4gICAgaWYgKHBsYXllckJ1aWxkZXIpIHtcbiAgICAgIHBsYXllckJ1aWxkZXIuc2V0VmFsdWUocHJvcCwgdmFsdWUpO1xuICAgIH1cbiAgfSBlbHNlIGlmICh2YWx1ZSkge1xuICAgIHZhbHVlID0gdmFsdWUudG9TdHJpbmcoKTsgIC8vIG9wYWNpdHksIHotaW5kZXggYW5kIGZsZXhib3ggYWxsIGhhdmUgbnVtYmVyIHZhbHVlcyB3aGljaCBtYXkgbm90XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYXNzaWduIGFzIG51bWJlcnNcbiAgICBuZ0Rldk1vZGUgJiYgbmdEZXZNb2RlLnJlbmRlcmVyU2V0U3R5bGUrKztcbiAgICBpc1Byb2NlZHVyYWxSZW5kZXJlcihyZW5kZXJlcikgP1xuICAgICAgICByZW5kZXJlci5zZXRTdHlsZShuYXRpdmUsIHByb3AsIHZhbHVlLCBSZW5kZXJlclN0eWxlRmxhZ3MzLkRhc2hDYXNlKSA6XG4gICAgICAgIG5hdGl2ZVsnc3R5bGUnXS5zZXRQcm9wZXJ0eShwcm9wLCB2YWx1ZSk7XG4gIH0gZWxzZSB7XG4gICAgbmdEZXZNb2RlICYmIG5nRGV2TW9kZS5yZW5kZXJlclJlbW92ZVN0eWxlKys7XG4gICAgaXNQcm9jZWR1cmFsUmVuZGVyZXIocmVuZGVyZXIpID9cbiAgICAgICAgcmVuZGVyZXIucmVtb3ZlU3R5bGUobmF0aXZlLCBwcm9wLCBSZW5kZXJlclN0eWxlRmxhZ3MzLkRhc2hDYXNlKSA6XG4gICAgICAgIG5hdGl2ZVsnc3R5bGUnXS5yZW1vdmVQcm9wZXJ0eShwcm9wKTtcbiAgfVxufVxuXG4vKipcbiAqIFRoaXMgZnVuY3Rpb24gcmVuZGVycyBhIGdpdmVuIENTUyBjbGFzcyB2YWx1ZSB1c2luZyB0aGUgcHJvdmlkZWRcbiAqIHJlbmRlcmVyIChieSBhZGRpbmcgb3IgcmVtb3ZpbmcgaXQgZnJvbSB0aGUgcHJvdmlkZWQgZWxlbWVudCkuXG4gKiBJZiBhIGBzdG9yZWAgdmFsdWUgaXMgcHJvdmlkZWQgdGhlbiB0aGF0IHdpbGwgYmUgdXNlZCBhIHJlbmRlclxuICogY29udGV4dCBpbnN0ZWFkIG9mIHRoZSBwcm92aWRlZCByZW5kZXJlci5cbiAqXG4gKiBAcGFyYW0gbmF0aXZlIHRoZSBET00gRWxlbWVudFxuICogQHBhcmFtIHByb3AgdGhlIENTUyBzdHlsZSBwcm9wZXJ0eSB0aGF0IHdpbGwgYmUgcmVuZGVyZWRcbiAqIEBwYXJhbSB2YWx1ZSB0aGUgQ1NTIHN0eWxlIHZhbHVlIHRoYXQgd2lsbCBiZSByZW5kZXJlZFxuICogQHBhcmFtIHJlbmRlcmVyXG4gKiBAcGFyYW0gc3RvcmUgYW4gb3B0aW9uYWwga2V5L3ZhbHVlIG1hcCB0aGF0IHdpbGwgYmUgdXNlZCBhcyBhIGNvbnRleHQgdG8gcmVuZGVyIHN0eWxlcyBvblxuICovXG5mdW5jdGlvbiBzZXRDbGFzcyhcbiAgICBuYXRpdmU6IGFueSwgY2xhc3NOYW1lOiBzdHJpbmcsIGFkZDogYm9vbGVhbiwgcmVuZGVyZXI6IFJlbmRlcmVyMywgc3RvcmU/OiBCaW5kaW5nU3RvcmUgfCBudWxsLFxuICAgIHBsYXllckJ1aWxkZXI/OiBDbGFzc0FuZFN0eWxlUGxheWVyQnVpbGRlcjxhbnk+fCBudWxsKSB7XG4gIGlmIChzdG9yZSB8fCBwbGF5ZXJCdWlsZGVyKSB7XG4gICAgaWYgKHN0b3JlKSB7XG4gICAgICBzdG9yZS5zZXRWYWx1ZShjbGFzc05hbWUsIGFkZCk7XG4gICAgfVxuICAgIGlmIChwbGF5ZXJCdWlsZGVyKSB7XG4gICAgICBwbGF5ZXJCdWlsZGVyLnNldFZhbHVlKGNsYXNzTmFtZSwgYWRkKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoYWRkKSB7XG4gICAgbmdEZXZNb2RlICYmIG5nRGV2TW9kZS5yZW5kZXJlckFkZENsYXNzKys7XG4gICAgaXNQcm9jZWR1cmFsUmVuZGVyZXIocmVuZGVyZXIpID8gcmVuZGVyZXIuYWRkQ2xhc3MobmF0aXZlLCBjbGFzc05hbWUpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYXRpdmVbJ2NsYXNzTGlzdCddLmFkZChjbGFzc05hbWUpO1xuICB9IGVsc2Uge1xuICAgIG5nRGV2TW9kZSAmJiBuZ0Rldk1vZGUucmVuZGVyZXJSZW1vdmVDbGFzcysrO1xuICAgIGlzUHJvY2VkdXJhbFJlbmRlcmVyKHJlbmRlcmVyKSA/IHJlbmRlcmVyLnJlbW92ZUNsYXNzKG5hdGl2ZSwgY2xhc3NOYW1lKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF0aXZlWydjbGFzc0xpc3QnXS5yZW1vdmUoY2xhc3NOYW1lKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzZXRTYW5pdGl6ZUZsYWcoY29udGV4dDogU3R5bGluZ0NvbnRleHQsIGluZGV4OiBudW1iZXIsIHNhbml0aXplWWVzOiBib29sZWFuKSB7XG4gIGlmIChzYW5pdGl6ZVllcykge1xuICAgIChjb250ZXh0W2luZGV4XSBhcyBudW1iZXIpIHw9IFN0eWxpbmdGbGFncy5TYW5pdGl6ZTtcbiAgfSBlbHNlIHtcbiAgICAoY29udGV4dFtpbmRleF0gYXMgbnVtYmVyKSAmPSB+U3R5bGluZ0ZsYWdzLlNhbml0aXplO1xuICB9XG59XG5cbmZ1bmN0aW9uIHNldERpcnR5KGNvbnRleHQ6IFN0eWxpbmdDb250ZXh0LCBpbmRleDogbnVtYmVyLCBpc0RpcnR5WWVzOiBib29sZWFuKSB7XG4gIGNvbnN0IGFkanVzdGVkSW5kZXggPVxuICAgICAgaW5kZXggPj0gU3R5bGluZ0luZGV4LlNpbmdsZVN0eWxlc1N0YXJ0UG9zaXRpb24gPyAoaW5kZXggKyBTdHlsaW5nSW5kZXguRmxhZ3NPZmZzZXQpIDogaW5kZXg7XG4gIGlmIChpc0RpcnR5WWVzKSB7XG4gICAgKGNvbnRleHRbYWRqdXN0ZWRJbmRleF0gYXMgbnVtYmVyKSB8PSBTdHlsaW5nRmxhZ3MuRGlydHk7XG4gIH0gZWxzZSB7XG4gICAgKGNvbnRleHRbYWRqdXN0ZWRJbmRleF0gYXMgbnVtYmVyKSAmPSB+U3R5bGluZ0ZsYWdzLkRpcnR5O1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzRGlydHkoY29udGV4dDogU3R5bGluZ0NvbnRleHQsIGluZGV4OiBudW1iZXIpOiBib29sZWFuIHtcbiAgY29uc3QgYWRqdXN0ZWRJbmRleCA9XG4gICAgICBpbmRleCA+PSBTdHlsaW5nSW5kZXguU2luZ2xlU3R5bGVzU3RhcnRQb3NpdGlvbiA/IChpbmRleCArIFN0eWxpbmdJbmRleC5GbGFnc09mZnNldCkgOiBpbmRleDtcbiAgcmV0dXJuICgoY29udGV4dFthZGp1c3RlZEluZGV4XSBhcyBudW1iZXIpICYgU3R5bGluZ0ZsYWdzLkRpcnR5KSA9PSBTdHlsaW5nRmxhZ3MuRGlydHk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0NsYXNzQmFzZWRWYWx1ZShjb250ZXh0OiBTdHlsaW5nQ29udGV4dCwgaW5kZXg6IG51bWJlcik6IGJvb2xlYW4ge1xuICBjb25zdCBhZGp1c3RlZEluZGV4ID1cbiAgICAgIGluZGV4ID49IFN0eWxpbmdJbmRleC5TaW5nbGVTdHlsZXNTdGFydFBvc2l0aW9uID8gKGluZGV4ICsgU3R5bGluZ0luZGV4LkZsYWdzT2Zmc2V0KSA6IGluZGV4O1xuICByZXR1cm4gKChjb250ZXh0W2FkanVzdGVkSW5kZXhdIGFzIG51bWJlcikgJiBTdHlsaW5nRmxhZ3MuQ2xhc3MpID09IFN0eWxpbmdGbGFncy5DbGFzcztcbn1cblxuZnVuY3Rpb24gaXNTYW5pdGl6YWJsZShjb250ZXh0OiBTdHlsaW5nQ29udGV4dCwgaW5kZXg6IG51bWJlcik6IGJvb2xlYW4ge1xuICBjb25zdCBhZGp1c3RlZEluZGV4ID1cbiAgICAgIGluZGV4ID49IFN0eWxpbmdJbmRleC5TaW5nbGVTdHlsZXNTdGFydFBvc2l0aW9uID8gKGluZGV4ICsgU3R5bGluZ0luZGV4LkZsYWdzT2Zmc2V0KSA6IGluZGV4O1xuICByZXR1cm4gKChjb250ZXh0W2FkanVzdGVkSW5kZXhdIGFzIG51bWJlcikgJiBTdHlsaW5nRmxhZ3MuU2FuaXRpemUpID09IFN0eWxpbmdGbGFncy5TYW5pdGl6ZTtcbn1cblxuZnVuY3Rpb24gcG9pbnRlcnMoY29uZmlnRmxhZzogbnVtYmVyLCBzdGF0aWNJbmRleDogbnVtYmVyLCBkeW5hbWljSW5kZXg6IG51bWJlcikge1xuICByZXR1cm4gKGNvbmZpZ0ZsYWcgJiBTdHlsaW5nRmxhZ3MuQml0TWFzaykgfCAoc3RhdGljSW5kZXggPDwgU3R5bGluZ0ZsYWdzLkJpdENvdW50U2l6ZSkgfFxuICAgICAgKGR5bmFtaWNJbmRleCA8PCAoU3R5bGluZ0luZGV4LkJpdENvdW50U2l6ZSArIFN0eWxpbmdGbGFncy5CaXRDb3VudFNpemUpKTtcbn1cblxuZnVuY3Rpb24gZ2V0SW5pdGlhbFZhbHVlKGNvbnRleHQ6IFN0eWxpbmdDb250ZXh0LCBmbGFnOiBudW1iZXIpOiBzdHJpbmd8Ym9vbGVhbnxudWxsIHtcbiAgY29uc3QgaW5kZXggPSBnZXRJbml0aWFsSW5kZXgoZmxhZyk7XG4gIGNvbnN0IGVudHJ5SXNDbGFzc0Jhc2VkID0gZmxhZyAmIFN0eWxpbmdGbGFncy5DbGFzcztcbiAgY29uc3QgaW5pdGlhbFZhbHVlcyA9IGVudHJ5SXNDbGFzc0Jhc2VkID8gY29udGV4dFtTdHlsaW5nSW5kZXguSW5pdGlhbENsYXNzVmFsdWVzUG9zaXRpb25dIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dFtTdHlsaW5nSW5kZXguSW5pdGlhbFN0eWxlVmFsdWVzUG9zaXRpb25dO1xuICByZXR1cm4gaW5pdGlhbFZhbHVlc1tpbmRleF07XG59XG5cbmZ1bmN0aW9uIGdldEluaXRpYWxJbmRleChmbGFnOiBudW1iZXIpOiBudW1iZXIge1xuICByZXR1cm4gKGZsYWcgPj4gU3R5bGluZ0ZsYWdzLkJpdENvdW50U2l6ZSkgJiBTdHlsaW5nSW5kZXguQml0TWFzaztcbn1cblxuZnVuY3Rpb24gZ2V0TXVsdGlPclNpbmdsZUluZGV4KGZsYWc6IG51bWJlcik6IG51bWJlciB7XG4gIGNvbnN0IGluZGV4ID1cbiAgICAgIChmbGFnID4+IChTdHlsaW5nSW5kZXguQml0Q291bnRTaXplICsgU3R5bGluZ0ZsYWdzLkJpdENvdW50U2l6ZSkpICYgU3R5bGluZ0luZGV4LkJpdE1hc2s7XG4gIHJldHVybiBpbmRleCA+PSBTdHlsaW5nSW5kZXguU2luZ2xlU3R5bGVzU3RhcnRQb3NpdGlvbiA/IGluZGV4IDogLTE7XG59XG5cbmZ1bmN0aW9uIGdldE11bHRpU3RhcnRJbmRleChjb250ZXh0OiBTdHlsaW5nQ29udGV4dCk6IG51bWJlciB7XG4gIHJldHVybiBnZXRNdWx0aU9yU2luZ2xlSW5kZXgoY29udGV4dFtTdHlsaW5nSW5kZXguTWFzdGVyRmxhZ1Bvc2l0aW9uXSkgYXMgbnVtYmVyO1xufVxuXG5mdW5jdGlvbiBzZXRQcm9wKGNvbnRleHQ6IFN0eWxpbmdDb250ZXh0LCBpbmRleDogbnVtYmVyLCBwcm9wOiBzdHJpbmcpIHtcbiAgY29udGV4dFtpbmRleCArIFN0eWxpbmdJbmRleC5Qcm9wZXJ0eU9mZnNldF0gPSBwcm9wO1xufVxuXG5mdW5jdGlvbiBzZXRWYWx1ZShjb250ZXh0OiBTdHlsaW5nQ29udGV4dCwgaW5kZXg6IG51bWJlciwgdmFsdWU6IHN0cmluZyB8IG51bGwgfCBib29sZWFuKSB7XG4gIGNvbnRleHRbaW5kZXggKyBTdHlsaW5nSW5kZXguVmFsdWVPZmZzZXRdID0gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIGhhc1BsYXllckJ1aWxkZXJDaGFuZ2VkKFxuICAgIGNvbnRleHQ6IFN0eWxpbmdDb250ZXh0LCBidWlsZGVyOiBDbGFzc0FuZFN0eWxlUGxheWVyQnVpbGRlcjxhbnk+fCBudWxsLCBpbmRleDogbnVtYmVyKSB7XG4gIGNvbnN0IHBsYXllckNvbnRleHQgPSBjb250ZXh0W1N0eWxpbmdJbmRleC5QbGF5ZXJDb250ZXh0XSAhO1xuICBpZiAoYnVpbGRlcikge1xuICAgIGlmICghcGxheWVyQ29udGV4dCB8fCBpbmRleCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9IGVsc2UgaWYgKCFwbGF5ZXJDb250ZXh0KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiBwbGF5ZXJDb250ZXh0W2luZGV4XSAhPT0gYnVpbGRlcjtcbn1cblxuZnVuY3Rpb24gc2V0UGxheWVyQnVpbGRlcihcbiAgICBjb250ZXh0OiBTdHlsaW5nQ29udGV4dCwgYnVpbGRlcjogQ2xhc3NBbmRTdHlsZVBsYXllckJ1aWxkZXI8YW55PnwgbnVsbCxcbiAgICBpbnNlcnRpb25JbmRleDogbnVtYmVyKTogbnVtYmVyIHtcbiAgbGV0IHBsYXllckNvbnRleHQgPSBjb250ZXh0W1N0eWxpbmdJbmRleC5QbGF5ZXJDb250ZXh0XSB8fCBhbGxvY1BsYXllckNvbnRleHQoY29udGV4dCk7XG4gIGlmIChpbnNlcnRpb25JbmRleCA+IDApIHtcbiAgICBwbGF5ZXJDb250ZXh0W2luc2VydGlvbkluZGV4XSA9IGJ1aWxkZXI7XG4gIH0gZWxzZSB7XG4gICAgaW5zZXJ0aW9uSW5kZXggPSBwbGF5ZXJDb250ZXh0W1BsYXllckluZGV4Lk5vbkJ1aWxkZXJQbGF5ZXJzU3RhcnRdO1xuICAgIHBsYXllckNvbnRleHQuc3BsaWNlKGluc2VydGlvbkluZGV4LCAwLCBidWlsZGVyLCBudWxsKTtcbiAgICBwbGF5ZXJDb250ZXh0W1BsYXllckluZGV4Lk5vbkJ1aWxkZXJQbGF5ZXJzU3RhcnRdICs9XG4gICAgICAgIFBsYXllckluZGV4LlBsYXllckFuZFBsYXllckJ1aWxkZXJzVHVwbGVTaXplO1xuICB9XG4gIHJldHVybiBpbnNlcnRpb25JbmRleDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpcmVjdGl2ZU93bmVyUG9pbnRlcnMoZGlyZWN0aXZlSW5kZXg6IG51bWJlciwgcGxheWVySW5kZXg6IG51bWJlcikge1xuICByZXR1cm4gKHBsYXllckluZGV4IDw8IERpcmVjdGl2ZU93bmVyQW5kUGxheWVyQnVpbGRlckluZGV4LkJpdENvdW50U2l6ZSkgfCBkaXJlY3RpdmVJbmRleDtcbn1cblxuZnVuY3Rpb24gc2V0UGxheWVyQnVpbGRlckluZGV4KFxuICAgIGNvbnRleHQ6IFN0eWxpbmdDb250ZXh0LCBpbmRleDogbnVtYmVyLCBwbGF5ZXJCdWlsZGVySW5kZXg6IG51bWJlciwgZGlyZWN0aXZlSW5kZXg6IG51bWJlcikge1xuICBjb25zdCB2YWx1ZSA9IGRpcmVjdGl2ZU93bmVyUG9pbnRlcnMoZGlyZWN0aXZlSW5kZXgsIHBsYXllckJ1aWxkZXJJbmRleCk7XG4gIGNvbnRleHRbaW5kZXggKyBTdHlsaW5nSW5kZXguUGxheWVyQnVpbGRlckluZGV4T2Zmc2V0XSA9IHZhbHVlO1xufVxuXG5mdW5jdGlvbiBnZXRQbGF5ZXJCdWlsZGVySW5kZXgoY29udGV4dDogU3R5bGluZ0NvbnRleHQsIGluZGV4OiBudW1iZXIpOiBudW1iZXIge1xuICBjb25zdCBmbGFnID0gY29udGV4dFtpbmRleCArIFN0eWxpbmdJbmRleC5QbGF5ZXJCdWlsZGVySW5kZXhPZmZzZXRdIGFzIG51bWJlcjtcbiAgY29uc3QgcGxheWVyQnVpbGRlckluZGV4ID0gKGZsYWcgPj4gRGlyZWN0aXZlT3duZXJBbmRQbGF5ZXJCdWlsZGVySW5kZXguQml0Q291bnRTaXplKSAmXG4gICAgICBEaXJlY3RpdmVPd25lckFuZFBsYXllckJ1aWxkZXJJbmRleC5CaXRNYXNrO1xuICByZXR1cm4gcGxheWVyQnVpbGRlckluZGV4O1xufVxuXG5mdW5jdGlvbiBnZXRQbGF5ZXJCdWlsZGVyKGNvbnRleHQ6IFN0eWxpbmdDb250ZXh0LCBpbmRleDogbnVtYmVyKTogQ2xhc3NBbmRTdHlsZVBsYXllckJ1aWxkZXI8YW55PnxcbiAgICBudWxsIHtcbiAgY29uc3QgcGxheWVyQnVpbGRlckluZGV4ID0gZ2V0UGxheWVyQnVpbGRlckluZGV4KGNvbnRleHQsIGluZGV4KTtcbiAgaWYgKHBsYXllckJ1aWxkZXJJbmRleCkge1xuICAgIGNvbnN0IHBsYXllckNvbnRleHQgPSBjb250ZXh0W1N0eWxpbmdJbmRleC5QbGF5ZXJDb250ZXh0XTtcbiAgICBpZiAocGxheWVyQ29udGV4dCkge1xuICAgICAgcmV0dXJuIHBsYXllckNvbnRleHRbcGxheWVyQnVpbGRlckluZGV4XSBhcyBDbGFzc0FuZFN0eWxlUGxheWVyQnVpbGRlcjxhbnk+fCBudWxsO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gc2V0RmxhZyhjb250ZXh0OiBTdHlsaW5nQ29udGV4dCwgaW5kZXg6IG51bWJlciwgZmxhZzogbnVtYmVyKSB7XG4gIGNvbnN0IGFkanVzdGVkSW5kZXggPVxuICAgICAgaW5kZXggPT09IFN0eWxpbmdJbmRleC5NYXN0ZXJGbGFnUG9zaXRpb24gPyBpbmRleCA6IChpbmRleCArIFN0eWxpbmdJbmRleC5GbGFnc09mZnNldCk7XG4gIGNvbnRleHRbYWRqdXN0ZWRJbmRleF0gPSBmbGFnO1xufVxuXG5mdW5jdGlvbiBnZXRQb2ludGVycyhjb250ZXh0OiBTdHlsaW5nQ29udGV4dCwgaW5kZXg6IG51bWJlcik6IG51bWJlciB7XG4gIGNvbnN0IGFkanVzdGVkSW5kZXggPVxuICAgICAgaW5kZXggPT09IFN0eWxpbmdJbmRleC5NYXN0ZXJGbGFnUG9zaXRpb24gPyBpbmRleCA6IChpbmRleCArIFN0eWxpbmdJbmRleC5GbGFnc09mZnNldCk7XG4gIHJldHVybiBjb250ZXh0W2FkanVzdGVkSW5kZXhdIGFzIG51bWJlcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFZhbHVlKGNvbnRleHQ6IFN0eWxpbmdDb250ZXh0LCBpbmRleDogbnVtYmVyKTogc3RyaW5nfGJvb2xlYW58bnVsbCB7XG4gIHJldHVybiBjb250ZXh0W2luZGV4ICsgU3R5bGluZ0luZGV4LlZhbHVlT2Zmc2V0XSBhcyBzdHJpbmcgfCBib29sZWFuIHwgbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFByb3AoY29udGV4dDogU3R5bGluZ0NvbnRleHQsIGluZGV4OiBudW1iZXIpOiBzdHJpbmcge1xuICByZXR1cm4gY29udGV4dFtpbmRleCArIFN0eWxpbmdJbmRleC5Qcm9wZXJ0eU9mZnNldF0gYXMgc3RyaW5nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNDb250ZXh0RGlydHkoY29udGV4dDogU3R5bGluZ0NvbnRleHQpOiBib29sZWFuIHtcbiAgcmV0dXJuIGlzRGlydHkoY29udGV4dCwgU3R5bGluZ0luZGV4Lk1hc3RlckZsYWdQb3NpdGlvbik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsaW1pdFRvU2luZ2xlQ2xhc3Nlcyhjb250ZXh0OiBTdHlsaW5nQ29udGV4dCkge1xuICByZXR1cm4gY29udGV4dFtTdHlsaW5nSW5kZXguTWFzdGVyRmxhZ1Bvc2l0aW9uXSAmIFN0eWxpbmdGbGFncy5Pbmx5UHJvY2Vzc1NpbmdsZUNsYXNzZXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRDb250ZXh0RGlydHkoY29udGV4dDogU3R5bGluZ0NvbnRleHQsIGlzRGlydHlZZXM6IGJvb2xlYW4pOiB2b2lkIHtcbiAgc2V0RGlydHkoY29udGV4dCwgU3R5bGluZ0luZGV4Lk1hc3RlckZsYWdQb3NpdGlvbiwgaXNEaXJ0eVllcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRDb250ZXh0UGxheWVyc0RpcnR5KGNvbnRleHQ6IFN0eWxpbmdDb250ZXh0LCBpc0RpcnR5WWVzOiBib29sZWFuKTogdm9pZCB7XG4gIGlmIChpc0RpcnR5WWVzKSB7XG4gICAgKGNvbnRleHRbU3R5bGluZ0luZGV4Lk1hc3RlckZsYWdQb3NpdGlvbl0gYXMgbnVtYmVyKSB8PSBTdHlsaW5nRmxhZ3MuUGxheWVyQnVpbGRlcnNEaXJ0eTtcbiAgfSBlbHNlIHtcbiAgICAoY29udGV4dFtTdHlsaW5nSW5kZXguTWFzdGVyRmxhZ1Bvc2l0aW9uXSBhcyBudW1iZXIpICY9IH5TdHlsaW5nRmxhZ3MuUGxheWVyQnVpbGRlcnNEaXJ0eTtcbiAgfVxufVxuXG5mdW5jdGlvbiBmaW5kRW50cnlQb3NpdGlvbkJ5UHJvcChcbiAgICBjb250ZXh0OiBTdHlsaW5nQ29udGV4dCwgcHJvcDogc3RyaW5nLCBzdGFydEluZGV4PzogbnVtYmVyKTogbnVtYmVyIHtcbiAgZm9yIChsZXQgaSA9IChzdGFydEluZGV4IHx8IDApICsgU3R5bGluZ0luZGV4LlByb3BlcnR5T2Zmc2V0OyBpIDwgY29udGV4dC5sZW5ndGg7XG4gICAgICAgaSArPSBTdHlsaW5nSW5kZXguU2l6ZSkge1xuICAgIGNvbnN0IHRoaXNQcm9wID0gY29udGV4dFtpXTtcbiAgICBpZiAodGhpc1Byb3AgPT0gcHJvcCkge1xuICAgICAgcmV0dXJuIGkgLSBTdHlsaW5nSW5kZXguUHJvcGVydHlPZmZzZXQ7XG4gICAgfVxuICB9XG4gIHJldHVybiAtMTtcbn1cblxuZnVuY3Rpb24gc3dhcE11bHRpQ29udGV4dEVudHJpZXMoY29udGV4dDogU3R5bGluZ0NvbnRleHQsIGluZGV4QTogbnVtYmVyLCBpbmRleEI6IG51bWJlcikge1xuICBjb25zdCB0bXBWYWx1ZSA9IGdldFZhbHVlKGNvbnRleHQsIGluZGV4QSk7XG4gIGNvbnN0IHRtcFByb3AgPSBnZXRQcm9wKGNvbnRleHQsIGluZGV4QSk7XG4gIGNvbnN0IHRtcEZsYWcgPSBnZXRQb2ludGVycyhjb250ZXh0LCBpbmRleEEpO1xuICBjb25zdCB0bXBQbGF5ZXJCdWlsZGVySW5kZXggPSBnZXRQbGF5ZXJCdWlsZGVySW5kZXgoY29udGV4dCwgaW5kZXhBKTtcblxuICBsZXQgZmxhZ0EgPSB0bXBGbGFnO1xuICBsZXQgZmxhZ0IgPSBnZXRQb2ludGVycyhjb250ZXh0LCBpbmRleEIpO1xuXG4gIGNvbnN0IHNpbmdsZUluZGV4QSA9IGdldE11bHRpT3JTaW5nbGVJbmRleChmbGFnQSk7XG4gIGlmIChzaW5nbGVJbmRleEEgPj0gMCkge1xuICAgIGNvbnN0IF9mbGFnID0gZ2V0UG9pbnRlcnMoY29udGV4dCwgc2luZ2xlSW5kZXhBKTtcbiAgICBjb25zdCBfaW5pdGlhbCA9IGdldEluaXRpYWxJbmRleChfZmxhZyk7XG4gICAgc2V0RmxhZyhjb250ZXh0LCBzaW5nbGVJbmRleEEsIHBvaW50ZXJzKF9mbGFnLCBfaW5pdGlhbCwgaW5kZXhCKSk7XG4gIH1cblxuICBjb25zdCBzaW5nbGVJbmRleEIgPSBnZXRNdWx0aU9yU2luZ2xlSW5kZXgoZmxhZ0IpO1xuICBpZiAoc2luZ2xlSW5kZXhCID49IDApIHtcbiAgICBjb25zdCBfZmxhZyA9IGdldFBvaW50ZXJzKGNvbnRleHQsIHNpbmdsZUluZGV4Qik7XG4gICAgY29uc3QgX2luaXRpYWwgPSBnZXRJbml0aWFsSW5kZXgoX2ZsYWcpO1xuICAgIHNldEZsYWcoY29udGV4dCwgc2luZ2xlSW5kZXhCLCBwb2ludGVycyhfZmxhZywgX2luaXRpYWwsIGluZGV4QSkpO1xuICB9XG5cbiAgc2V0VmFsdWUoY29udGV4dCwgaW5kZXhBLCBnZXRWYWx1ZShjb250ZXh0LCBpbmRleEIpKTtcbiAgc2V0UHJvcChjb250ZXh0LCBpbmRleEEsIGdldFByb3AoY29udGV4dCwgaW5kZXhCKSk7XG4gIHNldEZsYWcoY29udGV4dCwgaW5kZXhBLCBnZXRQb2ludGVycyhjb250ZXh0LCBpbmRleEIpKTtcbiAgY29uc3QgcGxheWVySW5kZXhBID0gZ2V0UGxheWVyQnVpbGRlckluZGV4KGNvbnRleHQsIGluZGV4Qik7XG4gIGNvbnN0IGRpcmVjdGl2ZUluZGV4QSA9IDA7XG4gIHNldFBsYXllckJ1aWxkZXJJbmRleChjb250ZXh0LCBpbmRleEEsIHBsYXllckluZGV4QSwgZGlyZWN0aXZlSW5kZXhBKTtcblxuICBzZXRWYWx1ZShjb250ZXh0LCBpbmRleEIsIHRtcFZhbHVlKTtcbiAgc2V0UHJvcChjb250ZXh0LCBpbmRleEIsIHRtcFByb3ApO1xuICBzZXRGbGFnKGNvbnRleHQsIGluZGV4QiwgdG1wRmxhZyk7XG4gIHNldFBsYXllckJ1aWxkZXJJbmRleChjb250ZXh0LCBpbmRleEIsIHRtcFBsYXllckJ1aWxkZXJJbmRleCwgZGlyZWN0aXZlSW5kZXhBKTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlU2luZ2xlUG9pbnRlclZhbHVlcyhjb250ZXh0OiBTdHlsaW5nQ29udGV4dCwgaW5kZXhTdGFydFBvc2l0aW9uOiBudW1iZXIpIHtcbiAgZm9yIChsZXQgaSA9IGluZGV4U3RhcnRQb3NpdGlvbjsgaSA8IGNvbnRleHQubGVuZ3RoOyBpICs9IFN0eWxpbmdJbmRleC5TaXplKSB7XG4gICAgY29uc3QgbXVsdGlGbGFnID0gZ2V0UG9pbnRlcnMoY29udGV4dCwgaSk7XG4gICAgY29uc3Qgc2luZ2xlSW5kZXggPSBnZXRNdWx0aU9yU2luZ2xlSW5kZXgobXVsdGlGbGFnKTtcbiAgICBpZiAoc2luZ2xlSW5kZXggPiAwKSB7XG4gICAgICBjb25zdCBzaW5nbGVGbGFnID0gZ2V0UG9pbnRlcnMoY29udGV4dCwgc2luZ2xlSW5kZXgpO1xuICAgICAgY29uc3QgaW5pdGlhbEluZGV4Rm9yU2luZ2xlID0gZ2V0SW5pdGlhbEluZGV4KHNpbmdsZUZsYWcpO1xuICAgICAgY29uc3QgZmxhZ1ZhbHVlID0gKGlzRGlydHkoY29udGV4dCwgc2luZ2xlSW5kZXgpID8gU3R5bGluZ0ZsYWdzLkRpcnR5IDogU3R5bGluZ0ZsYWdzLk5vbmUpIHxcbiAgICAgICAgICAoaXNDbGFzc0Jhc2VkVmFsdWUoY29udGV4dCwgc2luZ2xlSW5kZXgpID8gU3R5bGluZ0ZsYWdzLkNsYXNzIDogU3R5bGluZ0ZsYWdzLk5vbmUpIHxcbiAgICAgICAgICAoaXNTYW5pdGl6YWJsZShjb250ZXh0LCBzaW5nbGVJbmRleCkgPyBTdHlsaW5nRmxhZ3MuU2FuaXRpemUgOiBTdHlsaW5nRmxhZ3MuTm9uZSk7XG4gICAgICBjb25zdCB1cGRhdGVkRmxhZyA9IHBvaW50ZXJzKGZsYWdWYWx1ZSwgaW5pdGlhbEluZGV4Rm9yU2luZ2xlLCBpKTtcbiAgICAgIHNldEZsYWcoY29udGV4dCwgc2luZ2xlSW5kZXgsIHVwZGF0ZWRGbGFnKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gaW5zZXJ0TmV3TXVsdGlQcm9wZXJ0eShcbiAgICBjb250ZXh0OiBTdHlsaW5nQ29udGV4dCwgaW5kZXg6IG51bWJlciwgY2xhc3NCYXNlZDogYm9vbGVhbiwgbmFtZTogc3RyaW5nLCBmbGFnOiBudW1iZXIsXG4gICAgdmFsdWU6IHN0cmluZyB8IGJvb2xlYW4sIGRpcmVjdGl2ZUluZGV4OiBudW1iZXIsIHBsYXllckluZGV4OiBudW1iZXIpOiB2b2lkIHtcbiAgY29uc3QgZG9TaGlmdCA9IGluZGV4IDwgY29udGV4dC5sZW5ndGg7XG5cbiAgLy8gcHJvcCBkb2VzIG5vdCBleGlzdCBpbiB0aGUgbGlzdCwgYWRkIGl0IGluXG4gIGNvbnRleHQuc3BsaWNlKFxuICAgICAgaW5kZXgsIDAsIGZsYWcgfCBTdHlsaW5nRmxhZ3MuRGlydHkgfCAoY2xhc3NCYXNlZCA/IFN0eWxpbmdGbGFncy5DbGFzcyA6IFN0eWxpbmdGbGFncy5Ob25lKSxcbiAgICAgIG5hbWUsIHZhbHVlLCAwKTtcbiAgc2V0UGxheWVyQnVpbGRlckluZGV4KGNvbnRleHQsIGluZGV4LCBwbGF5ZXJJbmRleCwgZGlyZWN0aXZlSW5kZXgpO1xuXG4gIGlmIChkb1NoaWZ0KSB7XG4gICAgLy8gYmVjYXVzZSB0aGUgdmFsdWUgd2FzIGluc2VydGVkIG1pZHdheSBpbnRvIHRoZSBhcnJheSB0aGVuIHdlXG4gICAgLy8gbmVlZCB0byB1cGRhdGUgYWxsIHRoZSBzaGlmdGVkIG11bHRpIHZhbHVlcycgc2luZ2xlIHZhbHVlXG4gICAgLy8gcG9pbnRlcnMgdG8gcG9pbnQgdG8gdGhlIG5ld2x5IHNoaWZ0ZWQgbG9jYXRpb25cbiAgICB1cGRhdGVTaW5nbGVQb2ludGVyVmFsdWVzKGNvbnRleHQsIGluZGV4ICsgU3R5bGluZ0luZGV4LlNpemUpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHZhbHVlRXhpc3RzKHZhbHVlOiBzdHJpbmcgfCBudWxsIHwgYm9vbGVhbiwgaXNDbGFzc0Jhc2VkPzogYm9vbGVhbikge1xuICBpZiAoaXNDbGFzc0Jhc2VkKSB7XG4gICAgcmV0dXJuIHZhbHVlID8gdHJ1ZSA6IGZhbHNlO1xuICB9XG4gIHJldHVybiB2YWx1ZSAhPT0gbnVsbDtcbn1cblxuZnVuY3Rpb24gcHJlcGFyZUluaXRpYWxGbGFnKFxuICAgIGNvbnRleHQ6IFN0eWxpbmdDb250ZXh0LCBwcm9wOiBzdHJpbmcsIGVudHJ5SXNDbGFzc0Jhc2VkOiBib29sZWFuLFxuICAgIHNhbml0aXplcj86IFN0eWxlU2FuaXRpemVGbiB8IG51bGwpIHtcbiAgbGV0IGZsYWcgPSAoc2FuaXRpemVyICYmIHNhbml0aXplcihwcm9wKSkgPyBTdHlsaW5nRmxhZ3MuU2FuaXRpemUgOiBTdHlsaW5nRmxhZ3MuTm9uZTtcblxuICBsZXQgaW5pdGlhbEluZGV4OiBudW1iZXI7XG4gIGlmIChlbnRyeUlzQ2xhc3NCYXNlZCkge1xuICAgIGZsYWcgfD0gU3R5bGluZ0ZsYWdzLkNsYXNzO1xuICAgIGluaXRpYWxJbmRleCA9XG4gICAgICAgIGdldEluaXRpYWxTdHlsaW5nVmFsdWVzSW5kZXhPZihjb250ZXh0W1N0eWxpbmdJbmRleC5Jbml0aWFsQ2xhc3NWYWx1ZXNQb3NpdGlvbl0sIHByb3ApO1xuICB9IGVsc2Uge1xuICAgIGluaXRpYWxJbmRleCA9XG4gICAgICAgIGdldEluaXRpYWxTdHlsaW5nVmFsdWVzSW5kZXhPZihjb250ZXh0W1N0eWxpbmdJbmRleC5Jbml0aWFsU3R5bGVWYWx1ZXNQb3NpdGlvbl0sIHByb3ApO1xuICB9XG5cbiAgaW5pdGlhbEluZGV4ID0gaW5pdGlhbEluZGV4ID4gMCA/IChpbml0aWFsSW5kZXggKyBJbml0aWFsU3R5bGluZ1ZhbHVlc0luZGV4LlZhbHVlT2Zmc2V0KSA6IDA7XG4gIHJldHVybiBwb2ludGVycyhmbGFnLCBpbml0aWFsSW5kZXgsIDApO1xufVxuXG5mdW5jdGlvbiBoYXNWYWx1ZUNoYW5nZWQoXG4gICAgZmxhZzogbnVtYmVyLCBhOiBzdHJpbmcgfCBib29sZWFuIHwgbnVsbCwgYjogc3RyaW5nIHwgYm9vbGVhbiB8IG51bGwpOiBib29sZWFuIHtcbiAgY29uc3QgaXNDbGFzc0Jhc2VkID0gZmxhZyAmIFN0eWxpbmdGbGFncy5DbGFzcztcbiAgY29uc3QgaGFzVmFsdWVzID0gYSAmJiBiO1xuICBjb25zdCB1c2VzU2FuaXRpemVyID0gZmxhZyAmIFN0eWxpbmdGbGFncy5TYW5pdGl6ZTtcbiAgLy8gdGhlIHRvU3RyaW5nKCkgY29tcGFyaXNvbiBlbnN1cmVzIHRoYXQgYSB2YWx1ZSBpcyBjaGVja2VkXG4gIC8vIC4uLiBvdGhlcndpc2UgKGR1cmluZyBzYW5pdGl6YXRpb24gYnlwYXNzaW5nKSB0aGUgPT09IGNvbXBhcnNpb25cbiAgLy8gd291bGQgZmFpbCBzaW5jZSBhIG5ldyBTdHJpbmcoKSBpbnN0YW5jZSBpcyBjcmVhdGVkXG4gIGlmICghaXNDbGFzc0Jhc2VkICYmIGhhc1ZhbHVlcyAmJiB1c2VzU2FuaXRpemVyKSB7XG4gICAgLy8gd2Uga25vdyBmb3Igc3VyZSB3ZSdyZSBkZWFsaW5nIHdpdGggc3RyaW5ncyBhdCB0aGlzIHBvaW50XG4gICAgcmV0dXJuIChhIGFzIHN0cmluZykudG9TdHJpbmcoKSAhPT0gKGIgYXMgc3RyaW5nKS50b1N0cmluZygpO1xuICB9XG5cbiAgLy8gZXZlcnl0aGluZyBlbHNlIGlzIHNhZmUgdG8gY2hlY2sgd2l0aCBhIG5vcm1hbCBlcXVhbGl0eSBjaGVja1xuICByZXR1cm4gYSAhPT0gYjtcbn1cblxuZXhwb3J0IGNsYXNzIENsYXNzQW5kU3R5bGVQbGF5ZXJCdWlsZGVyPFQ+IGltcGxlbWVudHMgUGxheWVyQnVpbGRlciB7XG4gIHByaXZhdGUgX3ZhbHVlczoge1trZXk6IHN0cmluZ106IHN0cmluZyB8IG51bGx9ID0ge307XG4gIHByaXZhdGUgX2RpcnR5ID0gZmFsc2U7XG4gIHByaXZhdGUgX2ZhY3Rvcnk6IEJvdW5kUGxheWVyRmFjdG9yeTxUPjtcblxuICBjb25zdHJ1Y3RvcihmYWN0b3J5OiBQbGF5ZXJGYWN0b3J5LCBwcml2YXRlIF9lbGVtZW50OiBIVE1MRWxlbWVudCwgcHJpdmF0ZSBfdHlwZTogQmluZGluZ1R5cGUpIHtcbiAgICB0aGlzLl9mYWN0b3J5ID0gZmFjdG9yeSBhcyBhbnk7XG4gIH1cblxuICBzZXRWYWx1ZShwcm9wOiBzdHJpbmcsIHZhbHVlOiBhbnkpIHtcbiAgICBpZiAodGhpcy5fdmFsdWVzW3Byb3BdICE9PSB2YWx1ZSkge1xuICAgICAgdGhpcy5fdmFsdWVzW3Byb3BdID0gdmFsdWU7XG4gICAgICB0aGlzLl9kaXJ0eSA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgYnVpbGRQbGF5ZXIoY3VycmVudFBsYXllcjogUGxheWVyfG51bGwsIGlzRmlyc3RSZW5kZXI6IGJvb2xlYW4pOiBQbGF5ZXJ8dW5kZWZpbmVkfG51bGwge1xuICAgIC8vIGlmIG5vIHZhbHVlcyBoYXZlIGJlZW4gc2V0IGhlcmUgdGhlbiB0aGlzIG1lYW5zIHRoZSBiaW5kaW5nIGRpZG4ndFxuICAgIC8vIGNoYW5nZSBhbmQgdGhlcmVmb3JlIHRoZSBiaW5kaW5nIHZhbHVlcyB3ZXJlIG5vdCB1cGRhdGVkIHRocm91Z2hcbiAgICAvLyBgc2V0VmFsdWVgIHdoaWNoIG1lYW5zIG5vIG5ldyBwbGF5ZXIgd2lsbCBiZSBwcm92aWRlZC5cbiAgICBpZiAodGhpcy5fZGlydHkpIHtcbiAgICAgIGNvbnN0IHBsYXllciA9IHRoaXMuX2ZhY3RvcnkuZm4oXG4gICAgICAgICAgdGhpcy5fZWxlbWVudCwgdGhpcy5fdHlwZSwgdGhpcy5fdmFsdWVzICEsIGlzRmlyc3RSZW5kZXIsIGN1cnJlbnRQbGF5ZXIgfHwgbnVsbCk7XG4gICAgICB0aGlzLl92YWx1ZXMgPSB7fTtcbiAgICAgIHRoaXMuX2RpcnR5ID0gZmFsc2U7XG4gICAgICByZXR1cm4gcGxheWVyO1xuICAgIH1cblxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbn1cblxuLyoqXG4gKiBVc2VkIHRvIHByb3ZpZGUgYSBzdW1tYXJ5IG9mIHRoZSBzdGF0ZSBvZiB0aGUgc3R5bGluZyBjb250ZXh0LlxuICpcbiAqIFRoaXMgaXMgYW4gaW50ZXJuYWwgaW50ZXJmYWNlIHRoYXQgaXMgb25seSB1c2VkIGluc2lkZSBvZiB0ZXN0IHRvb2xpbmcgdG9cbiAqIGhlbHAgc3VtbWFyaXplIHdoYXQncyBnb2luZyBvbiB3aXRoaW4gdGhlIHN0eWxpbmcgY29udGV4dC4gTm9uZSBvZiB0aGlzIGNvZGVcbiAqIGlzIGRlc2lnbmVkIHRvIGJlIGV4cG9ydGVkIHB1YmxpY2x5IGFuZCB3aWxsLCB0aGVyZWZvcmUsIGJlIHRyZWUtc2hha2VuIGF3YXlcbiAqIGR1cmluZyBydW50aW1lLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIExvZ1N1bW1hcnkge1xuICBuYW1lOiBzdHJpbmc7ICAgICAgICAgIC8vXG4gIHN0YXRpY0luZGV4OiBudW1iZXI7ICAgLy9cbiAgZHluYW1pY0luZGV4OiBudW1iZXI7ICAvL1xuICB2YWx1ZTogbnVtYmVyOyAgICAgICAgIC8vXG4gIGZsYWdzOiB7XG4gICAgZGlydHk6IGJvb2xlYW47ICAgICAgICAgICAgICAgICAgICAgLy9cbiAgICBjbGFzczogYm9vbGVhbjsgICAgICAgICAgICAgICAgICAgICAvL1xuICAgIHNhbml0aXplOiBib29sZWFuOyAgICAgICAgICAgICAgICAgIC8vXG4gICAgcGxheWVyQnVpbGRlcnNEaXJ0eTogYm9vbGVhbjsgICAgICAgLy9cbiAgICBvbmx5UHJvY2Vzc1NpbmdsZUNsYXNzZXM6IGJvb2xlYW47ICAvL1xuICAgIGJpbmRpbmdBbGxvY2F0aW9uTG9ja2VkOiBib29sZWFuOyAgIC8vXG4gIH07XG59XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiBpcyBub3QgZGVzaWduZWQgdG8gYmUgdXNlZCBpbiBwcm9kdWN0aW9uLlxuICogSXQgaXMgYSB1dGlsaXR5IHRvb2wgZm9yIGRlYnVnZ2luZyBhbmQgdGVzdGluZyBhbmQgaXRcbiAqIHdpbGwgYXV0b21hdGljYWxseSBiZSB0cmVlLXNoYWtlbiBhd2F5IGR1cmluZyBwcm9kdWN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVDb25maWdTdW1tYXJ5KHNvdXJjZTogbnVtYmVyKTogTG9nU3VtbWFyeTtcbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZUNvbmZpZ1N1bW1hcnkoc291cmNlOiBTdHlsaW5nQ29udGV4dCk6IExvZ1N1bW1hcnk7XG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVDb25maWdTdW1tYXJ5KHNvdXJjZTogU3R5bGluZ0NvbnRleHQsIGluZGV4OiBudW1iZXIpOiBMb2dTdW1tYXJ5O1xuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlQ29uZmlnU3VtbWFyeShzb3VyY2U6IG51bWJlciB8IFN0eWxpbmdDb250ZXh0LCBpbmRleD86IG51bWJlcik6IExvZ1N1bW1hcnkge1xuICBsZXQgZmxhZywgbmFtZSA9ICdjb25maWcgdmFsdWUgZm9yICc7XG4gIGlmIChBcnJheS5pc0FycmF5KHNvdXJjZSkpIHtcbiAgICBpZiAoaW5kZXgpIHtcbiAgICAgIG5hbWUgKz0gJ2luZGV4OiAnICsgaW5kZXg7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5hbWUgKz0gJ21hc3RlciBjb25maWcnO1xuICAgIH1cbiAgICBpbmRleCA9IGluZGV4IHx8IFN0eWxpbmdJbmRleC5NYXN0ZXJGbGFnUG9zaXRpb247XG4gICAgZmxhZyA9IHNvdXJjZVtpbmRleF0gYXMgbnVtYmVyO1xuICB9IGVsc2Uge1xuICAgIGZsYWcgPSBzb3VyY2U7XG4gICAgbmFtZSArPSAnaW5kZXg6ICcgKyBmbGFnO1xuICB9XG4gIGNvbnN0IGR5bmFtaWNJbmRleCA9IGdldE11bHRpT3JTaW5nbGVJbmRleChmbGFnKTtcbiAgY29uc3Qgc3RhdGljSW5kZXggPSBnZXRJbml0aWFsSW5kZXgoZmxhZyk7XG4gIHJldHVybiB7XG4gICAgbmFtZSxcbiAgICBzdGF0aWNJbmRleCxcbiAgICBkeW5hbWljSW5kZXgsXG4gICAgdmFsdWU6IGZsYWcsXG4gICAgZmxhZ3M6IHtcbiAgICAgIGRpcnR5OiBmbGFnICYgU3R5bGluZ0ZsYWdzLkRpcnR5ID8gdHJ1ZSA6IGZhbHNlLFxuICAgICAgY2xhc3M6IGZsYWcgJiBTdHlsaW5nRmxhZ3MuQ2xhc3MgPyB0cnVlIDogZmFsc2UsXG4gICAgICBzYW5pdGl6ZTogZmxhZyAmIFN0eWxpbmdGbGFncy5TYW5pdGl6ZSA/IHRydWUgOiBmYWxzZSxcbiAgICAgIHBsYXllckJ1aWxkZXJzRGlydHk6IGZsYWcgJiBTdHlsaW5nRmxhZ3MuUGxheWVyQnVpbGRlcnNEaXJ0eSA/IHRydWUgOiBmYWxzZSxcbiAgICAgIG9ubHlQcm9jZXNzU2luZ2xlQ2xhc3NlczogZmxhZyAmIFN0eWxpbmdGbGFncy5Pbmx5UHJvY2Vzc1NpbmdsZUNsYXNzZXMgPyB0cnVlIDogZmFsc2UsXG4gICAgICBiaW5kaW5nQWxsb2NhdGlvbkxvY2tlZDogZmxhZyAmIFN0eWxpbmdGbGFncy5CaW5kaW5nQWxsb2NhdGlvbkxvY2tlZCA/IHRydWUgOiBmYWxzZSxcbiAgICB9XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXREaXJlY3RpdmVJbmRleEZyb21FbnRyeShjb250ZXh0OiBTdHlsaW5nQ29udGV4dCwgaW5kZXg6IG51bWJlcikge1xuICBjb25zdCB2YWx1ZSA9IGNvbnRleHRbaW5kZXggKyBTdHlsaW5nSW5kZXguUGxheWVyQnVpbGRlckluZGV4T2Zmc2V0XSBhcyBudW1iZXI7XG4gIHJldHVybiB2YWx1ZSAmIERpcmVjdGl2ZU93bmVyQW5kUGxheWVyQnVpbGRlckluZGV4LkJpdE1hc2s7XG59XG5cbmZ1bmN0aW9uIGdldERpcmVjdGl2ZUluZGV4RnJvbVJlZ2lzdHJ5KGNvbnRleHQ6IFN0eWxpbmdDb250ZXh0LCBkaXJlY3RpdmU6IGFueSkge1xuICBjb25zdCBpbmRleCA9XG4gICAgICBnZXREaXJlY3RpdmVSZWdpc3RyeVZhbHVlc0luZGV4T2YoY29udGV4dFtTdHlsaW5nSW5kZXguRGlyZWN0aXZlUmVnaXN0cnlQb3NpdGlvbl0sIGRpcmVjdGl2ZSk7XG4gIG5nRGV2TW9kZSAmJlxuICAgICAgYXNzZXJ0Tm90RXF1YWwoXG4gICAgICAgICAgaW5kZXgsIC0xLFxuICAgICAgICAgIGBUaGUgcHJvdmlkZWQgZGlyZWN0aXZlICR7ZGlyZWN0aXZlfSBoYXMgbm90IGJlZW4gYWxsb2NhdGVkIHRvIHRoZSBlbGVtZW50XFwncyBzdHlsZS9jbGFzcyBiaW5kaW5nc2ApO1xuICByZXR1cm4gaW5kZXggPiAwID8gaW5kZXggLyBEaXJlY3RpdmVSZWdpc3RyeVZhbHVlc0luZGV4LlNpemUgOiAwO1xuICAvLyByZXR1cm4gaW5kZXggLyBEaXJlY3RpdmVSZWdpc3RyeVZhbHVlc0luZGV4LlNpemU7XG59XG5cbmZ1bmN0aW9uIGdldERpcmVjdGl2ZVJlZ2lzdHJ5VmFsdWVzSW5kZXhPZihcbiAgICBkaXJlY3RpdmVzOiBEaXJlY3RpdmVSZWdpc3RyeVZhbHVlcywgZGlyZWN0aXZlOiB7fSk6IG51bWJlciB7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZGlyZWN0aXZlcy5sZW5ndGg7IGkgKz0gRGlyZWN0aXZlUmVnaXN0cnlWYWx1ZXNJbmRleC5TaXplKSB7XG4gICAgaWYgKGRpcmVjdGl2ZXNbaV0gPT09IGRpcmVjdGl2ZSkge1xuICAgICAgcmV0dXJuIGk7XG4gICAgfVxuICB9XG4gIHJldHVybiAtMTtcbn1cblxuZnVuY3Rpb24gZ2V0SW5pdGlhbFN0eWxpbmdWYWx1ZXNJbmRleE9mKGtleVZhbHVlczogSW5pdGlhbFN0eWxpbmdWYWx1ZXMsIGtleTogc3RyaW5nKTogbnVtYmVyIHtcbiAgZm9yIChsZXQgaSA9IEluaXRpYWxTdHlsaW5nVmFsdWVzSW5kZXguS2V5VmFsdWVTdGFydFBvc2l0aW9uOyBpIDwga2V5VmFsdWVzLmxlbmd0aDtcbiAgICAgICBpICs9IEluaXRpYWxTdHlsaW5nVmFsdWVzSW5kZXguU2l6ZSkge1xuICAgIGlmIChrZXlWYWx1ZXNbaV0gPT09IGtleSkgcmV0dXJuIGk7XG4gIH1cbiAgcmV0dXJuIC0xO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcGFyZUxvZ1N1bW1hcmllcyhhOiBMb2dTdW1tYXJ5LCBiOiBMb2dTdW1tYXJ5KSB7XG4gIGNvbnN0IGxvZzogc3RyaW5nW10gPSBbXTtcbiAgY29uc3QgZGlmZnM6IFtzdHJpbmcsIGFueSwgYW55XVtdID0gW107XG4gIGRpZmZTdW1tYXJ5VmFsdWVzKGRpZmZzLCAnc3RhdGljSW5kZXgnLCAnc3RhdGljSW5kZXgnLCBhLCBiKTtcbiAgZGlmZlN1bW1hcnlWYWx1ZXMoZGlmZnMsICdkeW5hbWljSW5kZXgnLCAnZHluYW1pY0luZGV4JywgYSwgYik7XG4gIE9iamVjdC5rZXlzKGEuZmxhZ3MpLmZvckVhY2goXG4gICAgICBuYW1lID0+IHsgZGlmZlN1bW1hcnlWYWx1ZXMoZGlmZnMsICdmbGFncy4nICsgbmFtZSwgbmFtZSwgYS5mbGFncywgYi5mbGFncyk7IH0pO1xuXG4gIGlmIChkaWZmcy5sZW5ndGgpIHtcbiAgICBsb2cucHVzaCgnTG9nIFN1bW1hcmllcyBmb3I6Jyk7XG4gICAgbG9nLnB1c2goJyAgQTogJyArIGEubmFtZSk7XG4gICAgbG9nLnB1c2goJyAgQjogJyArIGIubmFtZSk7XG4gICAgbG9nLnB1c2goJ1xcbiAgRGlmZmVyIGluIHRoZSBmb2xsb3dpbmcgd2F5IChBICE9PSBCKTonKTtcbiAgICBkaWZmcy5mb3JFYWNoKHJlc3VsdCA9PiB7XG4gICAgICBjb25zdCBbbmFtZSwgYVZhbCwgYlZhbF0gPSByZXN1bHQ7XG4gICAgICBsb2cucHVzaCgnICAgID0+ICcgKyBuYW1lKTtcbiAgICAgIGxvZy5wdXNoKCcgICAgPT4gJyArIGFWYWwgKyAnICE9PSAnICsgYlZhbCArICdcXG4nKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiBsb2c7XG59XG5cbmZ1bmN0aW9uIGRpZmZTdW1tYXJ5VmFsdWVzKHJlc3VsdDogYW55W10sIG5hbWU6IHN0cmluZywgcHJvcDogc3RyaW5nLCBhOiBhbnksIGI6IGFueSkge1xuICBjb25zdCBhVmFsID0gYVtwcm9wXTtcbiAgY29uc3QgYlZhbCA9IGJbcHJvcF07XG4gIGlmIChhVmFsICE9PSBiVmFsKSB7XG4gICAgcmVzdWx0LnB1c2goW25hbWUsIGFWYWwsIGJWYWxdKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRTaW5nbGVQcm9wSW5kZXhWYWx1ZShcbiAgICBjb250ZXh0OiBTdHlsaW5nQ29udGV4dCwgZGlyZWN0aXZlSW5kZXg6IG51bWJlciwgb2Zmc2V0OiBudW1iZXIsIGlzQ2xhc3NCYXNlZDogYm9vbGVhbikge1xuICBjb25zdCBzaW5nbGVQcm9wT2Zmc2V0UmVnaXN0cnlJbmRleCA9XG4gICAgICBjb250ZXh0W1N0eWxpbmdJbmRleC5EaXJlY3RpdmVSZWdpc3RyeVBvc2l0aW9uXVxuICAgICAgICAgICAgIFsoZGlyZWN0aXZlSW5kZXggKiBEaXJlY3RpdmVSZWdpc3RyeVZhbHVlc0luZGV4LlNpemUpICtcbiAgICAgICAgICAgICAgRGlyZWN0aXZlUmVnaXN0cnlWYWx1ZXNJbmRleC5TaW5nbGVQcm9wVmFsdWVzSW5kZXhPZmZzZXRdIGFzIG51bWJlcjtcbiAgY29uc3Qgb2Zmc2V0cyA9IGNvbnRleHRbU3R5bGluZ0luZGV4LlNpbmdsZVByb3BPZmZzZXRQb3NpdGlvbnNdO1xuICBjb25zdCBpbmRleEZvck9mZnNldCA9IHNpbmdsZVByb3BPZmZzZXRSZWdpc3RyeUluZGV4ICtcbiAgICAgIFNpbmdsZVByb3BPZmZzZXRWYWx1ZXNJbmRleC5WYWx1ZVN0YXJ0UG9zaXRpb24gK1xuICAgICAgKGlzQ2xhc3NCYXNlZCA/XG4gICAgICAgICAgIG9mZnNldHNcbiAgICAgICAgICAgICAgIFtzaW5nbGVQcm9wT2Zmc2V0UmVnaXN0cnlJbmRleCArIFNpbmdsZVByb3BPZmZzZXRWYWx1ZXNJbmRleC5TdHlsZXNDb3VudFBvc2l0aW9uXSA6XG4gICAgICAgICAgIDApICtcbiAgICAgIG9mZnNldDtcbiAgcmV0dXJuIG9mZnNldHNbaW5kZXhGb3JPZmZzZXRdO1xufVxuXG5mdW5jdGlvbiBnZXRTdHlsZVNhbml0aXplcihjb250ZXh0OiBTdHlsaW5nQ29udGV4dCwgZGlyZWN0aXZlSW5kZXg6IG51bWJlcik6IFN0eWxlU2FuaXRpemVGbnxudWxsIHtcbiAgY29uc3QgZGlycyA9IGNvbnRleHRbU3R5bGluZ0luZGV4LkRpcmVjdGl2ZVJlZ2lzdHJ5UG9zaXRpb25dO1xuICBjb25zdCB2YWx1ZSA9IGRpcnNcbiAgICAgICAgICAgICAgICAgICAgW2RpcmVjdGl2ZUluZGV4ICogRGlyZWN0aXZlUmVnaXN0cnlWYWx1ZXNJbmRleC5TaXplICtcbiAgICAgICAgICAgICAgICAgICAgIERpcmVjdGl2ZVJlZ2lzdHJ5VmFsdWVzSW5kZXguU3R5bGVTYW5pdGl6ZXJPZmZzZXRdIHx8XG4gICAgICBkaXJzW0RpcmVjdGl2ZVJlZ2lzdHJ5VmFsdWVzSW5kZXguU3R5bGVTYW5pdGl6ZXJPZmZzZXRdIHx8IG51bGw7XG4gIHJldHVybiB2YWx1ZSBhcyBTdHlsZVNhbml0aXplRm4gfCBudWxsO1xufVxuXG5mdW5jdGlvbiBpc0RpcmVjdGl2ZURpcnR5KGNvbnRleHQ6IFN0eWxpbmdDb250ZXh0LCBkaXJlY3RpdmVJbmRleDogbnVtYmVyKTogYm9vbGVhbiB7XG4gIGNvbnN0IGRpcnMgPSBjb250ZXh0W1N0eWxpbmdJbmRleC5EaXJlY3RpdmVSZWdpc3RyeVBvc2l0aW9uXTtcbiAgcmV0dXJuIGRpcnNcbiAgICAgIFtkaXJlY3RpdmVJbmRleCAqIERpcmVjdGl2ZVJlZ2lzdHJ5VmFsdWVzSW5kZXguU2l6ZSArXG4gICAgICAgRGlyZWN0aXZlUmVnaXN0cnlWYWx1ZXNJbmRleC5EaXJ0eUZsYWdPZmZzZXRdIGFzIGJvb2xlYW47XG59XG5cbmZ1bmN0aW9uIHNldERpcmVjdGl2ZURpcnR5KFxuICAgIGNvbnRleHQ6IFN0eWxpbmdDb250ZXh0LCBkaXJlY3RpdmVJbmRleDogbnVtYmVyLCBkaXJ0eVllczogYm9vbGVhbik6IHZvaWQge1xuICBjb25zdCBkaXJzID0gY29udGV4dFtTdHlsaW5nSW5kZXguRGlyZWN0aXZlUmVnaXN0cnlQb3NpdGlvbl07XG4gIGRpcnNcbiAgICAgIFtkaXJlY3RpdmVJbmRleCAqIERpcmVjdGl2ZVJlZ2lzdHJ5VmFsdWVzSW5kZXguU2l6ZSArXG4gICAgICAgRGlyZWN0aXZlUmVnaXN0cnlWYWx1ZXNJbmRleC5EaXJ0eUZsYWdPZmZzZXRdID0gZGlydHlZZXM7XG59XG5cbmZ1bmN0aW9uIGFsbG93VmFsdWVDaGFuZ2UoXG4gICAgY3VycmVudFZhbHVlOiBzdHJpbmcgfCBib29sZWFuIHwgbnVsbCwgbmV3VmFsdWU6IHN0cmluZyB8IGJvb2xlYW4gfCBudWxsLFxuICAgIGN1cnJlbnREaXJlY3RpdmVPd25lcjogbnVtYmVyLCBuZXdEaXJlY3RpdmVPd25lcjogbnVtYmVyKSB7XG4gIC8vIHRoZSBjb2RlIGJlbG93IHJlbGllcyB0aGUgaW1wb3J0YW5jZSBvZiBkaXJlY3RpdmUncyBiZWluZyB0aWVkIHRvIHRoZWlyXG4gIC8vIGluZGV4IHZhbHVlLiBUaGUgaW5kZXggdmFsdWVzIGZvciBlYWNoIGRpcmVjdGl2ZSBhcmUgZGVyaXZlZCBmcm9tIGJlaW5nXG4gIC8vIHJlZ2lzdGVyZWQgaW50byB0aGUgc3R5bGluZyBjb250ZXh0IGRpcmVjdGl2ZSByZWdpc3RyeS4gVGhlIG1vc3QgaW1wb3J0YW50XG4gIC8vIGRpcmVjdGl2ZSBpcyB0aGUgcGFyZW50IGNvbXBvbmVudCBkaXJlY3RpdmUgKHRoZSB0ZW1wbGF0ZSkgYW5kIGVhY2ggZGlyZWN0aXZlXG4gIC8vIHRoYXQgaXMgYWRkZWQgYWZ0ZXIgaXMgY29uc2lkZXJlZCBsZXNzIGltcG9ydGFudCB0aGFuIHRoZSBwcmV2aW91cyBlbnRyeS4gVGhpc1xuICAvLyBwcmlvcml0aXphdGlvbiBvZiBkaXJlY3RpdmVzIGVuYWJsZXMgdGhlIHN0eWxpbmcgYWxnb3JpdGhtIHRvIGRlY2lkZSBpZiBhIHN0eWxlXG4gIC8vIG9yIGNsYXNzIHNob3VsZCBiZSBhbGxvd2VkIHRvIGJlIHVwZGF0ZWQvcmVwbGFjZWQgaW5jYXNlIGFuIGVhcmxpZXIgZGlyZWN0aXZlXG4gIC8vIGFscmVhZHkgd3JvdGUgdG8gdGhlIGV4YWN0IHNhbWUgc3R5bGUtcHJvcGVydHkgb3IgY2xhc3NOYW1lIHZhbHVlLiBJbiBvdGhlciB3b3Jkc1xuICAvLyAuLi4gdGhpcyBkZWNpZGVzIHdoYXQgdG8gZG8gaWYgYW5kIHdoZW4gdGhlcmUgaXMgYSBjb2xsaXNpb24uXG4gIGlmIChjdXJyZW50VmFsdWUpIHtcbiAgICBpZiAobmV3VmFsdWUpIHtcbiAgICAgIC8vIGlmIGEgZGlyZWN0aXZlIGluZGV4IGlzIGxvd2VyIHRoYW4gaXQgYWx3YXlzIGhhcyBwcmlvcml0eSBvdmVyIHRoZVxuICAgICAgLy8gcHJldmlvdXMgZGlyZWN0aXZlJ3MgdmFsdWUuLi5cbiAgICAgIHJldHVybiBuZXdEaXJlY3RpdmVPd25lciA8PSBjdXJyZW50RGlyZWN0aXZlT3duZXI7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIG9ubHkgd3JpdGUgYSBudWxsIHZhbHVlIGluY2FzZSBpdCdzIHRoZSBzYW1lIG93bmVyIHdyaXRpbmcgaXQuXG4gICAgICAvLyB0aGlzIGF2b2lkcyBoYXZpbmcgYSBoaWdoZXItcHJpb3JpdHkgZGlyZWN0aXZlIHdyaXRlIHRvIG51bGxcbiAgICAgIC8vIG9ubHkgdG8gaGF2ZSBhIGxlc3Nlci1wcmlvcml0eSBkaXJlY3RpdmUgY2hhbmdlIHJpZ2h0IHRvIGFcbiAgICAgIC8vIG5vbi1udWxsIHZhbHVlIGltbWVkaWF0ZWx5IGFmdGVyd2FyZHMuXG4gICAgICByZXR1cm4gY3VycmVudERpcmVjdGl2ZU93bmVyID09PSBuZXdEaXJlY3RpdmVPd25lcjtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiBpcyBvbmx5IGRlc2lnbmVkIHRvIGJlIGNhbGxlZCBmb3IgYFtjbGFzc11gIGJpbmRpbmdzIHdoZW5cbiAqIGBbbmdDbGFzc11gIChvciBzb21ldGhpbmcgdGhhdCB1c2VzIGBjbGFzc2AgYXMgYW4gaW5wdXQpIGlzIHByZXNlbnQuIE9uY2VcbiAqIGRpcmVjdGl2ZSBob3N0IGJpbmRpbmdzIGZ1bGx5IHdvcmsgZm9yIGBbY2xhc3NdYCBhbmQgYFtzdHlsZV1gIGlucHV0c1xuICogdGhlbiB0aGlzIGNhbiBiZSBkZWxldGVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0SW5pdGlhbENsYXNzTmFtZVZhbHVlKGNvbnRleHQ6IFN0eWxpbmdDb250ZXh0KTogc3RyaW5nIHtcbiAgbGV0IGNsYXNzTmFtZSA9IGNvbnRleHRbU3R5bGluZ0luZGV4LkNhY2hlZENsYXNzVmFsdWVPckluaXRpYWxDbGFzc1N0cmluZ10gYXMgc3RyaW5nO1xuICBpZiAoY2xhc3NOYW1lID09IG51bGwpIHtcbiAgICBjbGFzc05hbWUgPSAnJztcbiAgICBjb25zdCBpbml0aWFsQ2xhc3NWYWx1ZXMgPSBjb250ZXh0W1N0eWxpbmdJbmRleC5Jbml0aWFsQ2xhc3NWYWx1ZXNQb3NpdGlvbl07XG4gICAgZm9yIChsZXQgaSA9IEluaXRpYWxTdHlsaW5nVmFsdWVzSW5kZXguS2V5VmFsdWVTdGFydFBvc2l0aW9uOyBpIDwgaW5pdGlhbENsYXNzVmFsdWVzLmxlbmd0aDtcbiAgICAgICAgIGkgKz0gSW5pdGlhbFN0eWxpbmdWYWx1ZXNJbmRleC5TaXplKSB7XG4gICAgICBjb25zdCBpc1ByZXNlbnQgPSBpbml0aWFsQ2xhc3NWYWx1ZXNbaSArIDFdO1xuICAgICAgaWYgKGlzUHJlc2VudCkge1xuICAgICAgICBjbGFzc05hbWUgKz0gKGNsYXNzTmFtZS5sZW5ndGggPyAnICcgOiAnJykgKyBpbml0aWFsQ2xhc3NWYWx1ZXNbaV07XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnRleHRbU3R5bGluZ0luZGV4LkNhY2hlZENsYXNzVmFsdWVPckluaXRpYWxDbGFzc1N0cmluZ10gPSBjbGFzc05hbWU7XG4gIH1cbiAgcmV0dXJuIGNsYXNzTmFtZTtcbn1cbiJdfQ==