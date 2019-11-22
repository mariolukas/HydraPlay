/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { getOrSetAsInMap } from '../render/shared';
import { copyObj, interpolateParams, iteratorToArray } from '../util';
import { buildAnimationTimelines } from './animation_timeline_builder';
import { createTransitionInstruction } from './animation_transition_instruction';
/** @type {?} */
const EMPTY_OBJECT = {};
export class AnimationTransitionFactory {
    /**
     * @param {?} _triggerName
     * @param {?} ast
     * @param {?} _stateStyles
     */
    constructor(_triggerName, ast, _stateStyles) {
        this._triggerName = _triggerName;
        this.ast = ast;
        this._stateStyles = _stateStyles;
    }
    /**
     * @param {?} currentState
     * @param {?} nextState
     * @param {?} element
     * @param {?} params
     * @return {?}
     */
    match(currentState, nextState, element, params) {
        return oneOrMoreTransitionsMatch(this.ast.matchers, currentState, nextState, element, params);
    }
    /**
     * @param {?} stateName
     * @param {?} params
     * @param {?} errors
     * @return {?}
     */
    buildStyles(stateName, params, errors) {
        /** @type {?} */
        const backupStateStyler = this._stateStyles['*'];
        /** @type {?} */
        const stateStyler = this._stateStyles[stateName];
        /** @type {?} */
        const backupStyles = backupStateStyler ? backupStateStyler.buildStyles(params, errors) : {};
        return stateStyler ? stateStyler.buildStyles(params, errors) : backupStyles;
    }
    /**
     * @param {?} driver
     * @param {?} element
     * @param {?} currentState
     * @param {?} nextState
     * @param {?} enterClassName
     * @param {?} leaveClassName
     * @param {?=} currentOptions
     * @param {?=} nextOptions
     * @param {?=} subInstructions
     * @param {?=} skipAstBuild
     * @return {?}
     */
    build(driver, element, currentState, nextState, enterClassName, leaveClassName, currentOptions, nextOptions, subInstructions, skipAstBuild) {
        /** @type {?} */
        const errors = [];
        /** @type {?} */
        const transitionAnimationParams = this.ast.options && this.ast.options.params || EMPTY_OBJECT;
        /** @type {?} */
        const currentAnimationParams = currentOptions && currentOptions.params || EMPTY_OBJECT;
        /** @type {?} */
        const currentStateStyles = this.buildStyles(currentState, currentAnimationParams, errors);
        /** @type {?} */
        const nextAnimationParams = nextOptions && nextOptions.params || EMPTY_OBJECT;
        /** @type {?} */
        const nextStateStyles = this.buildStyles(nextState, nextAnimationParams, errors);
        /** @type {?} */
        const queriedElements = new Set();
        /** @type {?} */
        const preStyleMap = new Map();
        /** @type {?} */
        const postStyleMap = new Map();
        /** @type {?} */
        const isRemoval = nextState === 'void';
        /** @type {?} */
        const animationOptions = { params: Object.assign({}, transitionAnimationParams, nextAnimationParams) };
        /** @type {?} */
        const timelines = skipAstBuild ? [] : buildAnimationTimelines(driver, element, this.ast.animation, enterClassName, leaveClassName, currentStateStyles, nextStateStyles, animationOptions, subInstructions, errors);
        /** @type {?} */
        let totalTime = 0;
        timelines.forEach(tl => { totalTime = Math.max(tl.duration + tl.delay, totalTime); });
        if (errors.length) {
            return createTransitionInstruction(element, this._triggerName, currentState, nextState, isRemoval, currentStateStyles, nextStateStyles, [], [], preStyleMap, postStyleMap, totalTime, errors);
        }
        timelines.forEach(tl => {
            /** @type {?} */
            const elm = tl.element;
            /** @type {?} */
            const preProps = getOrSetAsInMap(preStyleMap, elm, {});
            tl.preStyleProps.forEach(prop => preProps[prop] = true);
            /** @type {?} */
            const postProps = getOrSetAsInMap(postStyleMap, elm, {});
            tl.postStyleProps.forEach(prop => postProps[prop] = true);
            if (elm !== element) {
                queriedElements.add(elm);
            }
        });
        /** @type {?} */
        const queriedElementsList = iteratorToArray(queriedElements.values());
        return createTransitionInstruction(element, this._triggerName, currentState, nextState, isRemoval, currentStateStyles, nextStateStyles, timelines, queriedElementsList, preStyleMap, postStyleMap, totalTime);
    }
}
if (false) {
    /**
     * @type {?}
     * @private
     */
    AnimationTransitionFactory.prototype._triggerName;
    /** @type {?} */
    AnimationTransitionFactory.prototype.ast;
    /**
     * @type {?}
     * @private
     */
    AnimationTransitionFactory.prototype._stateStyles;
}
/**
 * @param {?} matchFns
 * @param {?} currentState
 * @param {?} nextState
 * @param {?} element
 * @param {?} params
 * @return {?}
 */
function oneOrMoreTransitionsMatch(matchFns, currentState, nextState, element, params) {
    return matchFns.some(fn => fn(currentState, nextState, element, params));
}
export class AnimationStateStyles {
    /**
     * @param {?} styles
     * @param {?} defaultParams
     */
    constructor(styles, defaultParams) {
        this.styles = styles;
        this.defaultParams = defaultParams;
    }
    /**
     * @param {?} params
     * @param {?} errors
     * @return {?}
     */
    buildStyles(params, errors) {
        /** @type {?} */
        const finalStyles = {};
        /** @type {?} */
        const combinedParams = copyObj(this.defaultParams);
        Object.keys(params).forEach(key => {
            /** @type {?} */
            const value = params[key];
            if (value != null) {
                combinedParams[key] = value;
            }
        });
        this.styles.styles.forEach(value => {
            if (typeof value !== 'string') {
                /** @type {?} */
                const styleObj = (/** @type {?} */ (value));
                Object.keys(styleObj).forEach(prop => {
                    /** @type {?} */
                    let val = styleObj[prop];
                    if (val.length > 1) {
                        val = interpolateParams(val, combinedParams, errors);
                    }
                    finalStyles[prop] = val;
                });
            }
        });
        return finalStyles;
    }
}
if (false) {
    /**
     * @type {?}
     * @private
     */
    AnimationStateStyles.prototype.styles;
    /**
     * @type {?}
     * @private
     */
    AnimationStateStyles.prototype.defaultParams;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX3RyYW5zaXRpb25fZmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuaW1hdGlvbnMvYnJvd3Nlci9zcmMvZHNsL2FuaW1hdGlvbl90cmFuc2l0aW9uX2ZhY3RvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQVVBLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUNqRCxPQUFPLEVBQUMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLGVBQWUsRUFBd0IsTUFBTSxTQUFTLENBQUM7QUFHM0YsT0FBTyxFQUFDLHVCQUF1QixFQUFDLE1BQU0sOEJBQThCLENBQUM7QUFFckUsT0FBTyxFQUFpQywyQkFBMkIsRUFBQyxNQUFNLG9DQUFvQyxDQUFDOztNQUd6RyxZQUFZLEdBQUcsRUFBRTtBQUV2QixNQUFNLE9BQU8sMEJBQTBCOzs7Ozs7SUFDckMsWUFDWSxZQUFvQixFQUFTLEdBQWtCLEVBQy9DLFlBQXlEO1FBRHpELGlCQUFZLEdBQVosWUFBWSxDQUFRO1FBQVMsUUFBRyxHQUFILEdBQUcsQ0FBZTtRQUMvQyxpQkFBWSxHQUFaLFlBQVksQ0FBNkM7SUFBRyxDQUFDOzs7Ozs7OztJQUV6RSxLQUFLLENBQUMsWUFBaUIsRUFBRSxTQUFjLEVBQUUsT0FBWSxFQUFFLE1BQTRCO1FBQ2pGLE9BQU8seUJBQXlCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDaEcsQ0FBQzs7Ozs7OztJQUVELFdBQVcsQ0FBQyxTQUFpQixFQUFFLE1BQTRCLEVBQUUsTUFBYTs7Y0FDbEUsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUM7O2NBQzFDLFdBQVcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQzs7Y0FDMUMsWUFBWSxHQUFHLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO1FBQzNGLE9BQU8sV0FBVyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDO0lBQzlFLENBQUM7Ozs7Ozs7Ozs7Ozs7O0lBRUQsS0FBSyxDQUNELE1BQXVCLEVBQUUsT0FBWSxFQUFFLFlBQWlCLEVBQUUsU0FBYyxFQUN4RSxjQUFzQixFQUFFLGNBQXNCLEVBQUUsY0FBaUMsRUFDakYsV0FBOEIsRUFBRSxlQUF1QyxFQUN2RSxZQUFzQjs7Y0FDbEIsTUFBTSxHQUFVLEVBQUU7O2NBRWxCLHlCQUF5QixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sSUFBSSxZQUFZOztjQUN2RixzQkFBc0IsR0FBRyxjQUFjLElBQUksY0FBYyxDQUFDLE1BQU0sSUFBSSxZQUFZOztjQUNoRixrQkFBa0IsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksRUFBRSxzQkFBc0IsRUFBRSxNQUFNLENBQUM7O2NBQ25GLG1CQUFtQixHQUFHLFdBQVcsSUFBSSxXQUFXLENBQUMsTUFBTSxJQUFJLFlBQVk7O2NBQ3ZFLGVBQWUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxtQkFBbUIsRUFBRSxNQUFNLENBQUM7O2NBRTFFLGVBQWUsR0FBRyxJQUFJLEdBQUcsRUFBTzs7Y0FDaEMsV0FBVyxHQUFHLElBQUksR0FBRyxFQUFrQzs7Y0FDdkQsWUFBWSxHQUFHLElBQUksR0FBRyxFQUFrQzs7Y0FDeEQsU0FBUyxHQUFHLFNBQVMsS0FBSyxNQUFNOztjQUVoQyxnQkFBZ0IsR0FBRyxFQUFDLE1BQU0sb0JBQU0seUJBQXlCLEVBQUssbUJBQW1CLENBQUMsRUFBQzs7Y0FFbkYsU0FBUyxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyx1QkFBdUIsQ0FDbkIsTUFBTSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxjQUFjLEVBQ25ELGNBQWMsRUFBRSxrQkFBa0IsRUFBRSxlQUFlLEVBQ25ELGdCQUFnQixFQUFFLGVBQWUsRUFBRSxNQUFNLENBQUM7O1lBRWhGLFNBQVMsR0FBRyxDQUFDO1FBQ2pCLFNBQVMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUV0RixJQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQUU7WUFDakIsT0FBTywyQkFBMkIsQ0FDOUIsT0FBTyxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsa0JBQWtCLEVBQ2xGLGVBQWUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQzVFO1FBRUQsU0FBUyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRTs7a0JBQ2YsR0FBRyxHQUFHLEVBQUUsQ0FBQyxPQUFPOztrQkFDaEIsUUFBUSxHQUFHLGVBQWUsQ0FBQyxXQUFXLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQztZQUN0RCxFQUFFLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQzs7a0JBRWxELFNBQVMsR0FBRyxlQUFlLENBQUMsWUFBWSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUM7WUFDeEQsRUFBRSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7WUFFMUQsSUFBSSxHQUFHLEtBQUssT0FBTyxFQUFFO2dCQUNuQixlQUFlLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQzFCO1FBQ0gsQ0FBQyxDQUFDLENBQUM7O2NBRUcsbUJBQW1CLEdBQUcsZUFBZSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNyRSxPQUFPLDJCQUEyQixDQUM5QixPQUFPLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxZQUFZLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxrQkFBa0IsRUFDbEYsZUFBZSxFQUFFLFNBQVMsRUFBRSxtQkFBbUIsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQzdGLENBQUM7Q0FDRjs7Ozs7O0lBbEVLLGtEQUE0Qjs7SUFBRSx5Q0FBeUI7Ozs7O0lBQ3ZELGtEQUFpRTs7Ozs7Ozs7OztBQW1FdkUsU0FBUyx5QkFBeUIsQ0FDOUIsUUFBK0IsRUFBRSxZQUFpQixFQUFFLFNBQWMsRUFBRSxPQUFZLEVBQ2hGLE1BQTRCO0lBQzlCLE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQzNFLENBQUM7QUFFRCxNQUFNLE9BQU8sb0JBQW9COzs7OztJQUMvQixZQUFvQixNQUFnQixFQUFVLGFBQW1DO1FBQTdELFdBQU0sR0FBTixNQUFNLENBQVU7UUFBVSxrQkFBYSxHQUFiLGFBQWEsQ0FBc0I7SUFBRyxDQUFDOzs7Ozs7SUFFckYsV0FBVyxDQUFDLE1BQTRCLEVBQUUsTUFBZ0I7O2NBQ2xELFdBQVcsR0FBZSxFQUFFOztjQUM1QixjQUFjLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUM7UUFDbEQsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7O2tCQUMxQixLQUFLLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQztZQUN6QixJQUFJLEtBQUssSUFBSSxJQUFJLEVBQUU7Z0JBQ2pCLGNBQWMsQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7YUFDN0I7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNqQyxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTs7c0JBQ3ZCLFFBQVEsR0FBRyxtQkFBQSxLQUFLLEVBQU87Z0JBQzdCLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFOzt3QkFDL0IsR0FBRyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUM7b0JBQ3hCLElBQUksR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7d0JBQ2xCLEdBQUcsR0FBRyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsY0FBYyxFQUFFLE1BQU0sQ0FBQyxDQUFDO3FCQUN0RDtvQkFDRCxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDO2dCQUMxQixDQUFDLENBQUMsQ0FBQzthQUNKO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLFdBQVcsQ0FBQztJQUNyQixDQUFDO0NBQ0Y7Ozs7OztJQXpCYSxzQ0FBd0I7Ozs7O0lBQUUsNkNBQTJDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtBbmltYXRpb25PcHRpb25zLCDJtVN0eWxlRGF0YX0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5cbmltcG9ydCB7QW5pbWF0aW9uRHJpdmVyfSBmcm9tICcuLi9yZW5kZXIvYW5pbWF0aW9uX2RyaXZlcic7XG5pbXBvcnQge2dldE9yU2V0QXNJbk1hcH0gZnJvbSAnLi4vcmVuZGVyL3NoYXJlZCc7XG5pbXBvcnQge2NvcHlPYmosIGludGVycG9sYXRlUGFyYW1zLCBpdGVyYXRvclRvQXJyYXksIG1lcmdlQW5pbWF0aW9uT3B0aW9uc30gZnJvbSAnLi4vdXRpbCc7XG5cbmltcG9ydCB7U3R5bGVBc3QsIFRyYW5zaXRpb25Bc3R9IGZyb20gJy4vYW5pbWF0aW9uX2FzdCc7XG5pbXBvcnQge2J1aWxkQW5pbWF0aW9uVGltZWxpbmVzfSBmcm9tICcuL2FuaW1hdGlvbl90aW1lbGluZV9idWlsZGVyJztcbmltcG9ydCB7VHJhbnNpdGlvbk1hdGNoZXJGbn0gZnJvbSAnLi9hbmltYXRpb25fdHJhbnNpdGlvbl9leHByJztcbmltcG9ydCB7QW5pbWF0aW9uVHJhbnNpdGlvbkluc3RydWN0aW9uLCBjcmVhdGVUcmFuc2l0aW9uSW5zdHJ1Y3Rpb259IGZyb20gJy4vYW5pbWF0aW9uX3RyYW5zaXRpb25faW5zdHJ1Y3Rpb24nO1xuaW1wb3J0IHtFbGVtZW50SW5zdHJ1Y3Rpb25NYXB9IGZyb20gJy4vZWxlbWVudF9pbnN0cnVjdGlvbl9tYXAnO1xuXG5jb25zdCBFTVBUWV9PQkpFQ1QgPSB7fTtcblxuZXhwb3J0IGNsYXNzIEFuaW1hdGlvblRyYW5zaXRpb25GYWN0b3J5IHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIF90cmlnZ2VyTmFtZTogc3RyaW5nLCBwdWJsaWMgYXN0OiBUcmFuc2l0aW9uQXN0LFxuICAgICAgcHJpdmF0ZSBfc3RhdGVTdHlsZXM6IHtbc3RhdGVOYW1lOiBzdHJpbmddOiBBbmltYXRpb25TdGF0ZVN0eWxlc30pIHt9XG5cbiAgbWF0Y2goY3VycmVudFN0YXRlOiBhbnksIG5leHRTdGF0ZTogYW55LCBlbGVtZW50OiBhbnksIHBhcmFtczoge1trZXk6IHN0cmluZ106IGFueX0pOiBib29sZWFuIHtcbiAgICByZXR1cm4gb25lT3JNb3JlVHJhbnNpdGlvbnNNYXRjaCh0aGlzLmFzdC5tYXRjaGVycywgY3VycmVudFN0YXRlLCBuZXh0U3RhdGUsIGVsZW1lbnQsIHBhcmFtcyk7XG4gIH1cblxuICBidWlsZFN0eWxlcyhzdGF0ZU5hbWU6IHN0cmluZywgcGFyYW1zOiB7W2tleTogc3RyaW5nXTogYW55fSwgZXJyb3JzOiBhbnlbXSkge1xuICAgIGNvbnN0IGJhY2t1cFN0YXRlU3R5bGVyID0gdGhpcy5fc3RhdGVTdHlsZXNbJyonXTtcbiAgICBjb25zdCBzdGF0ZVN0eWxlciA9IHRoaXMuX3N0YXRlU3R5bGVzW3N0YXRlTmFtZV07XG4gICAgY29uc3QgYmFja3VwU3R5bGVzID0gYmFja3VwU3RhdGVTdHlsZXIgPyBiYWNrdXBTdGF0ZVN0eWxlci5idWlsZFN0eWxlcyhwYXJhbXMsIGVycm9ycykgOiB7fTtcbiAgICByZXR1cm4gc3RhdGVTdHlsZXIgPyBzdGF0ZVN0eWxlci5idWlsZFN0eWxlcyhwYXJhbXMsIGVycm9ycykgOiBiYWNrdXBTdHlsZXM7XG4gIH1cblxuICBidWlsZChcbiAgICAgIGRyaXZlcjogQW5pbWF0aW9uRHJpdmVyLCBlbGVtZW50OiBhbnksIGN1cnJlbnRTdGF0ZTogYW55LCBuZXh0U3RhdGU6IGFueSxcbiAgICAgIGVudGVyQ2xhc3NOYW1lOiBzdHJpbmcsIGxlYXZlQ2xhc3NOYW1lOiBzdHJpbmcsIGN1cnJlbnRPcHRpb25zPzogQW5pbWF0aW9uT3B0aW9ucyxcbiAgICAgIG5leHRPcHRpb25zPzogQW5pbWF0aW9uT3B0aW9ucywgc3ViSW5zdHJ1Y3Rpb25zPzogRWxlbWVudEluc3RydWN0aW9uTWFwLFxuICAgICAgc2tpcEFzdEJ1aWxkPzogYm9vbGVhbik6IEFuaW1hdGlvblRyYW5zaXRpb25JbnN0cnVjdGlvbiB7XG4gICAgY29uc3QgZXJyb3JzOiBhbnlbXSA9IFtdO1xuXG4gICAgY29uc3QgdHJhbnNpdGlvbkFuaW1hdGlvblBhcmFtcyA9IHRoaXMuYXN0Lm9wdGlvbnMgJiYgdGhpcy5hc3Qub3B0aW9ucy5wYXJhbXMgfHwgRU1QVFlfT0JKRUNUO1xuICAgIGNvbnN0IGN1cnJlbnRBbmltYXRpb25QYXJhbXMgPSBjdXJyZW50T3B0aW9ucyAmJiBjdXJyZW50T3B0aW9ucy5wYXJhbXMgfHwgRU1QVFlfT0JKRUNUO1xuICAgIGNvbnN0IGN1cnJlbnRTdGF0ZVN0eWxlcyA9IHRoaXMuYnVpbGRTdHlsZXMoY3VycmVudFN0YXRlLCBjdXJyZW50QW5pbWF0aW9uUGFyYW1zLCBlcnJvcnMpO1xuICAgIGNvbnN0IG5leHRBbmltYXRpb25QYXJhbXMgPSBuZXh0T3B0aW9ucyAmJiBuZXh0T3B0aW9ucy5wYXJhbXMgfHwgRU1QVFlfT0JKRUNUO1xuICAgIGNvbnN0IG5leHRTdGF0ZVN0eWxlcyA9IHRoaXMuYnVpbGRTdHlsZXMobmV4dFN0YXRlLCBuZXh0QW5pbWF0aW9uUGFyYW1zLCBlcnJvcnMpO1xuXG4gICAgY29uc3QgcXVlcmllZEVsZW1lbnRzID0gbmV3IFNldDxhbnk+KCk7XG4gICAgY29uc3QgcHJlU3R5bGVNYXAgPSBuZXcgTWFwPGFueSwge1twcm9wOiBzdHJpbmddOiBib29sZWFufT4oKTtcbiAgICBjb25zdCBwb3N0U3R5bGVNYXAgPSBuZXcgTWFwPGFueSwge1twcm9wOiBzdHJpbmddOiBib29sZWFufT4oKTtcbiAgICBjb25zdCBpc1JlbW92YWwgPSBuZXh0U3RhdGUgPT09ICd2b2lkJztcblxuICAgIGNvbnN0IGFuaW1hdGlvbk9wdGlvbnMgPSB7cGFyYW1zOiB7Li4udHJhbnNpdGlvbkFuaW1hdGlvblBhcmFtcywgLi4ubmV4dEFuaW1hdGlvblBhcmFtc319O1xuXG4gICAgY29uc3QgdGltZWxpbmVzID0gc2tpcEFzdEJ1aWxkID8gW10gOiBidWlsZEFuaW1hdGlvblRpbWVsaW5lcyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkcml2ZXIsIGVsZW1lbnQsIHRoaXMuYXN0LmFuaW1hdGlvbiwgZW50ZXJDbGFzc05hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVhdmVDbGFzc05hbWUsIGN1cnJlbnRTdGF0ZVN0eWxlcywgbmV4dFN0YXRlU3R5bGVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbk9wdGlvbnMsIHN1Ykluc3RydWN0aW9ucywgZXJyb3JzKTtcblxuICAgIGxldCB0b3RhbFRpbWUgPSAwO1xuICAgIHRpbWVsaW5lcy5mb3JFYWNoKHRsID0+IHsgdG90YWxUaW1lID0gTWF0aC5tYXgodGwuZHVyYXRpb24gKyB0bC5kZWxheSwgdG90YWxUaW1lKTsgfSk7XG5cbiAgICBpZiAoZXJyb3JzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIGNyZWF0ZVRyYW5zaXRpb25JbnN0cnVjdGlvbihcbiAgICAgICAgICBlbGVtZW50LCB0aGlzLl90cmlnZ2VyTmFtZSwgY3VycmVudFN0YXRlLCBuZXh0U3RhdGUsIGlzUmVtb3ZhbCwgY3VycmVudFN0YXRlU3R5bGVzLFxuICAgICAgICAgIG5leHRTdGF0ZVN0eWxlcywgW10sIFtdLCBwcmVTdHlsZU1hcCwgcG9zdFN0eWxlTWFwLCB0b3RhbFRpbWUsIGVycm9ycyk7XG4gICAgfVxuXG4gICAgdGltZWxpbmVzLmZvckVhY2godGwgPT4ge1xuICAgICAgY29uc3QgZWxtID0gdGwuZWxlbWVudDtcbiAgICAgIGNvbnN0IHByZVByb3BzID0gZ2V0T3JTZXRBc0luTWFwKHByZVN0eWxlTWFwLCBlbG0sIHt9KTtcbiAgICAgIHRsLnByZVN0eWxlUHJvcHMuZm9yRWFjaChwcm9wID0+IHByZVByb3BzW3Byb3BdID0gdHJ1ZSk7XG5cbiAgICAgIGNvbnN0IHBvc3RQcm9wcyA9IGdldE9yU2V0QXNJbk1hcChwb3N0U3R5bGVNYXAsIGVsbSwge30pO1xuICAgICAgdGwucG9zdFN0eWxlUHJvcHMuZm9yRWFjaChwcm9wID0+IHBvc3RQcm9wc1twcm9wXSA9IHRydWUpO1xuXG4gICAgICBpZiAoZWxtICE9PSBlbGVtZW50KSB7XG4gICAgICAgIHF1ZXJpZWRFbGVtZW50cy5hZGQoZWxtKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGNvbnN0IHF1ZXJpZWRFbGVtZW50c0xpc3QgPSBpdGVyYXRvclRvQXJyYXkocXVlcmllZEVsZW1lbnRzLnZhbHVlcygpKTtcbiAgICByZXR1cm4gY3JlYXRlVHJhbnNpdGlvbkluc3RydWN0aW9uKFxuICAgICAgICBlbGVtZW50LCB0aGlzLl90cmlnZ2VyTmFtZSwgY3VycmVudFN0YXRlLCBuZXh0U3RhdGUsIGlzUmVtb3ZhbCwgY3VycmVudFN0YXRlU3R5bGVzLFxuICAgICAgICBuZXh0U3RhdGVTdHlsZXMsIHRpbWVsaW5lcywgcXVlcmllZEVsZW1lbnRzTGlzdCwgcHJlU3R5bGVNYXAsIHBvc3RTdHlsZU1hcCwgdG90YWxUaW1lKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBvbmVPck1vcmVUcmFuc2l0aW9uc01hdGNoKFxuICAgIG1hdGNoRm5zOiBUcmFuc2l0aW9uTWF0Y2hlckZuW10sIGN1cnJlbnRTdGF0ZTogYW55LCBuZXh0U3RhdGU6IGFueSwgZWxlbWVudDogYW55LFxuICAgIHBhcmFtczoge1trZXk6IHN0cmluZ106IGFueX0pOiBib29sZWFuIHtcbiAgcmV0dXJuIG1hdGNoRm5zLnNvbWUoZm4gPT4gZm4oY3VycmVudFN0YXRlLCBuZXh0U3RhdGUsIGVsZW1lbnQsIHBhcmFtcykpO1xufVxuXG5leHBvcnQgY2xhc3MgQW5pbWF0aW9uU3RhdGVTdHlsZXMge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHN0eWxlczogU3R5bGVBc3QsIHByaXZhdGUgZGVmYXVsdFBhcmFtczoge1trZXk6IHN0cmluZ106IGFueX0pIHt9XG5cbiAgYnVpbGRTdHlsZXMocGFyYW1zOiB7W2tleTogc3RyaW5nXTogYW55fSwgZXJyb3JzOiBzdHJpbmdbXSk6IMm1U3R5bGVEYXRhIHtcbiAgICBjb25zdCBmaW5hbFN0eWxlczogybVTdHlsZURhdGEgPSB7fTtcbiAgICBjb25zdCBjb21iaW5lZFBhcmFtcyA9IGNvcHlPYmoodGhpcy5kZWZhdWx0UGFyYW1zKTtcbiAgICBPYmplY3Qua2V5cyhwYXJhbXMpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgIGNvbnN0IHZhbHVlID0gcGFyYW1zW2tleV07XG4gICAgICBpZiAodmFsdWUgIT0gbnVsbCkge1xuICAgICAgICBjb21iaW5lZFBhcmFtc1trZXldID0gdmFsdWU7XG4gICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5zdHlsZXMuc3R5bGVzLmZvckVhY2godmFsdWUgPT4ge1xuICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgY29uc3Qgc3R5bGVPYmogPSB2YWx1ZSBhcyBhbnk7XG4gICAgICAgIE9iamVjdC5rZXlzKHN0eWxlT2JqKS5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgICAgIGxldCB2YWwgPSBzdHlsZU9ialtwcm9wXTtcbiAgICAgICAgICBpZiAodmFsLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIHZhbCA9IGludGVycG9sYXRlUGFyYW1zKHZhbCwgY29tYmluZWRQYXJhbXMsIGVycm9ycyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGZpbmFsU3R5bGVzW3Byb3BdID0gdmFsO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gZmluYWxTdHlsZXM7XG4gIH1cbn1cbiJdfQ==