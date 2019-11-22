/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { AnimationStateStyles, AnimationTransitionFactory } from './animation_transition_factory';
/**
 * \@publicApi
 * @param {?} name
 * @param {?} ast
 * @return {?}
 */
export function buildTrigger(name, ast) {
    return new AnimationTrigger(name, ast);
}
/**
 * \@publicApi
 */
export class AnimationTrigger {
    /**
     * @param {?} name
     * @param {?} ast
     */
    constructor(name, ast) {
        this.name = name;
        this.ast = ast;
        this.transitionFactories = [];
        this.states = {};
        ast.states.forEach(ast => {
            /** @type {?} */
            const defaultParams = (ast.options && ast.options.params) || {};
            this.states[ast.name] = new AnimationStateStyles(ast.style, defaultParams);
        });
        balanceProperties(this.states, 'true', '1');
        balanceProperties(this.states, 'false', '0');
        ast.transitions.forEach(ast => {
            this.transitionFactories.push(new AnimationTransitionFactory(name, ast, this.states));
        });
        this.fallbackTransition = createFallbackTransition(name, this.states);
    }
    /**
     * @return {?}
     */
    get containsQueries() { return this.ast.queryCount > 0; }
    /**
     * @param {?} currentState
     * @param {?} nextState
     * @param {?} element
     * @param {?} params
     * @return {?}
     */
    matchTransition(currentState, nextState, element, params) {
        /** @type {?} */
        const entry = this.transitionFactories.find(f => f.match(currentState, nextState, element, params));
        return entry || null;
    }
    /**
     * @param {?} currentState
     * @param {?} params
     * @param {?} errors
     * @return {?}
     */
    matchStyles(currentState, params, errors) {
        return this.fallbackTransition.buildStyles(currentState, params, errors);
    }
}
if (false) {
    /** @type {?} */
    AnimationTrigger.prototype.transitionFactories;
    /** @type {?} */
    AnimationTrigger.prototype.fallbackTransition;
    /** @type {?} */
    AnimationTrigger.prototype.states;
    /** @type {?} */
    AnimationTrigger.prototype.name;
    /** @type {?} */
    AnimationTrigger.prototype.ast;
}
/**
 * @param {?} triggerName
 * @param {?} states
 * @return {?}
 */
function createFallbackTransition(triggerName, states) {
    /** @type {?} */
    const matchers = [(fromState, toState) => true];
    /** @type {?} */
    const animation = { type: 2 /* Sequence */, steps: [], options: null };
    /** @type {?} */
    const transition = {
        type: 1 /* Transition */,
        animation,
        matchers,
        options: null,
        queryCount: 0,
        depCount: 0
    };
    return new AnimationTransitionFactory(triggerName, transition, states);
}
/**
 * @param {?} obj
 * @param {?} key1
 * @param {?} key2
 * @return {?}
 */
function balanceProperties(obj, key1, key2) {
    if (obj.hasOwnProperty(key1)) {
        if (!obj.hasOwnProperty(key2)) {
            obj[key2] = obj[key1];
        }
    }
    else if (obj.hasOwnProperty(key2)) {
        obj[key1] = obj[key2];
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX3RyaWdnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmltYXRpb25zL2Jyb3dzZXIvc3JjL2RzbC9hbmltYXRpb25fdHJpZ2dlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBWUEsT0FBTyxFQUFDLG9CQUFvQixFQUFFLDBCQUEwQixFQUFDLE1BQU0sZ0NBQWdDLENBQUM7Ozs7Ozs7QUFPaEcsTUFBTSxVQUFVLFlBQVksQ0FBQyxJQUFZLEVBQUUsR0FBZTtJQUN4RCxPQUFPLElBQUksZ0JBQWdCLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ3pDLENBQUM7Ozs7QUFLRCxNQUFNLE9BQU8sZ0JBQWdCOzs7OztJQUszQixZQUFtQixJQUFZLEVBQVMsR0FBZTtRQUFwQyxTQUFJLEdBQUosSUFBSSxDQUFRO1FBQVMsUUFBRyxHQUFILEdBQUcsQ0FBWTtRQUpoRCx3QkFBbUIsR0FBaUMsRUFBRSxDQUFDO1FBRXZELFdBQU0sR0FBZ0QsRUFBRSxDQUFDO1FBRzlELEdBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFOztrQkFDakIsYUFBYSxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUU7WUFDL0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQzdFLENBQUMsQ0FBQyxDQUFDO1FBRUgsaUJBQWlCLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDNUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFN0MsR0FBRyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDNUIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxJQUFJLDBCQUEwQixDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDeEYsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsa0JBQWtCLEdBQUcsd0JBQXdCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN4RSxDQUFDOzs7O0lBRUQsSUFBSSxlQUFlLEtBQUssT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7Ozs7OztJQUV6RCxlQUFlLENBQUMsWUFBaUIsRUFBRSxTQUFjLEVBQUUsT0FBWSxFQUFFLE1BQTRCOztjQUVyRixLQUFLLEdBQ1AsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDekYsT0FBTyxLQUFLLElBQUksSUFBSSxDQUFDO0lBQ3ZCLENBQUM7Ozs7Ozs7SUFFRCxXQUFXLENBQUMsWUFBaUIsRUFBRSxNQUE0QixFQUFFLE1BQWE7UUFDeEUsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsV0FBVyxDQUFDLFlBQVksRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDM0UsQ0FBQztDQUNGOzs7SUFoQ0MsK0NBQThEOztJQUM5RCw4Q0FBc0Q7O0lBQ3RELGtDQUFnRTs7SUFFcEQsZ0NBQW1COztJQUFFLCtCQUFzQjs7Ozs7OztBQThCekQsU0FBUyx3QkFBd0IsQ0FDN0IsV0FBbUIsRUFDbkIsTUFBbUQ7O1VBQy9DLFFBQVEsR0FBRyxDQUFDLENBQUMsU0FBYyxFQUFFLE9BQVksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDOztVQUNuRCxTQUFTLEdBQWdCLEVBQUMsSUFBSSxrQkFBZ0MsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUM7O1VBQ3pGLFVBQVUsR0FBa0I7UUFDaEMsSUFBSSxvQkFBa0M7UUFDdEMsU0FBUztRQUNULFFBQVE7UUFDUixPQUFPLEVBQUUsSUFBSTtRQUNiLFVBQVUsRUFBRSxDQUFDO1FBQ2IsUUFBUSxFQUFFLENBQUM7S0FDWjtJQUNELE9BQU8sSUFBSSwwQkFBMEIsQ0FBQyxXQUFXLEVBQUUsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ3pFLENBQUM7Ozs7Ozs7QUFFRCxTQUFTLGlCQUFpQixDQUFDLEdBQXlCLEVBQUUsSUFBWSxFQUFFLElBQVk7SUFDOUUsSUFBSSxHQUFHLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQzVCLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQzdCLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDdkI7S0FDRjtTQUFNLElBQUksR0FBRyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUNuQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ3ZCO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7QW5pbWF0aW9uTWV0YWRhdGFUeXBlLCDJtVN0eWxlRGF0YX0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5cbmltcG9ydCB7Y29weVN0eWxlcywgaW50ZXJwb2xhdGVQYXJhbXN9IGZyb20gJy4uL3V0aWwnO1xuXG5pbXBvcnQge1NlcXVlbmNlQXN0LCBTdHlsZUFzdCwgVHJhbnNpdGlvbkFzdCwgVHJpZ2dlckFzdH0gZnJvbSAnLi9hbmltYXRpb25fYXN0JztcbmltcG9ydCB7QW5pbWF0aW9uU3RhdGVTdHlsZXMsIEFuaW1hdGlvblRyYW5zaXRpb25GYWN0b3J5fSBmcm9tICcuL2FuaW1hdGlvbl90cmFuc2l0aW9uX2ZhY3RvcnknO1xuXG5cblxuLyoqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFRyaWdnZXIobmFtZTogc3RyaW5nLCBhc3Q6IFRyaWdnZXJBc3QpOiBBbmltYXRpb25UcmlnZ2VyIHtcbiAgcmV0dXJuIG5ldyBBbmltYXRpb25UcmlnZ2VyKG5hbWUsIGFzdCk7XG59XG5cbi8qKlxuKiBAcHVibGljQXBpXG4qL1xuZXhwb3J0IGNsYXNzIEFuaW1hdGlvblRyaWdnZXIge1xuICBwdWJsaWMgdHJhbnNpdGlvbkZhY3RvcmllczogQW5pbWF0aW9uVHJhbnNpdGlvbkZhY3RvcnlbXSA9IFtdO1xuICBwdWJsaWMgZmFsbGJhY2tUcmFuc2l0aW9uOiBBbmltYXRpb25UcmFuc2l0aW9uRmFjdG9yeTtcbiAgcHVibGljIHN0YXRlczoge1tzdGF0ZU5hbWU6IHN0cmluZ106IEFuaW1hdGlvblN0YXRlU3R5bGVzfSA9IHt9O1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBuYW1lOiBzdHJpbmcsIHB1YmxpYyBhc3Q6IFRyaWdnZXJBc3QpIHtcbiAgICBhc3Quc3RhdGVzLmZvckVhY2goYXN0ID0+IHtcbiAgICAgIGNvbnN0IGRlZmF1bHRQYXJhbXMgPSAoYXN0Lm9wdGlvbnMgJiYgYXN0Lm9wdGlvbnMucGFyYW1zKSB8fCB7fTtcbiAgICAgIHRoaXMuc3RhdGVzW2FzdC5uYW1lXSA9IG5ldyBBbmltYXRpb25TdGF0ZVN0eWxlcyhhc3Quc3R5bGUsIGRlZmF1bHRQYXJhbXMpO1xuICAgIH0pO1xuXG4gICAgYmFsYW5jZVByb3BlcnRpZXModGhpcy5zdGF0ZXMsICd0cnVlJywgJzEnKTtcbiAgICBiYWxhbmNlUHJvcGVydGllcyh0aGlzLnN0YXRlcywgJ2ZhbHNlJywgJzAnKTtcblxuICAgIGFzdC50cmFuc2l0aW9ucy5mb3JFYWNoKGFzdCA9PiB7XG4gICAgICB0aGlzLnRyYW5zaXRpb25GYWN0b3JpZXMucHVzaChuZXcgQW5pbWF0aW9uVHJhbnNpdGlvbkZhY3RvcnkobmFtZSwgYXN0LCB0aGlzLnN0YXRlcykpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5mYWxsYmFja1RyYW5zaXRpb24gPSBjcmVhdGVGYWxsYmFja1RyYW5zaXRpb24obmFtZSwgdGhpcy5zdGF0ZXMpO1xuICB9XG5cbiAgZ2V0IGNvbnRhaW5zUXVlcmllcygpIHsgcmV0dXJuIHRoaXMuYXN0LnF1ZXJ5Q291bnQgPiAwOyB9XG5cbiAgbWF0Y2hUcmFuc2l0aW9uKGN1cnJlbnRTdGF0ZTogYW55LCBuZXh0U3RhdGU6IGFueSwgZWxlbWVudDogYW55LCBwYXJhbXM6IHtba2V5OiBzdHJpbmddOiBhbnl9KTpcbiAgICAgIEFuaW1hdGlvblRyYW5zaXRpb25GYWN0b3J5fG51bGwge1xuICAgIGNvbnN0IGVudHJ5ID1cbiAgICAgICAgdGhpcy50cmFuc2l0aW9uRmFjdG9yaWVzLmZpbmQoZiA9PiBmLm1hdGNoKGN1cnJlbnRTdGF0ZSwgbmV4dFN0YXRlLCBlbGVtZW50LCBwYXJhbXMpKTtcbiAgICByZXR1cm4gZW50cnkgfHwgbnVsbDtcbiAgfVxuXG4gIG1hdGNoU3R5bGVzKGN1cnJlbnRTdGF0ZTogYW55LCBwYXJhbXM6IHtba2V5OiBzdHJpbmddOiBhbnl9LCBlcnJvcnM6IGFueVtdKTogybVTdHlsZURhdGEge1xuICAgIHJldHVybiB0aGlzLmZhbGxiYWNrVHJhbnNpdGlvbi5idWlsZFN0eWxlcyhjdXJyZW50U3RhdGUsIHBhcmFtcywgZXJyb3JzKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVGYWxsYmFja1RyYW5zaXRpb24oXG4gICAgdHJpZ2dlck5hbWU6IHN0cmluZyxcbiAgICBzdGF0ZXM6IHtbc3RhdGVOYW1lOiBzdHJpbmddOiBBbmltYXRpb25TdGF0ZVN0eWxlc30pOiBBbmltYXRpb25UcmFuc2l0aW9uRmFjdG9yeSB7XG4gIGNvbnN0IG1hdGNoZXJzID0gWyhmcm9tU3RhdGU6IGFueSwgdG9TdGF0ZTogYW55KSA9PiB0cnVlXTtcbiAgY29uc3QgYW5pbWF0aW9uOiBTZXF1ZW5jZUFzdCA9IHt0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuU2VxdWVuY2UsIHN0ZXBzOiBbXSwgb3B0aW9uczogbnVsbH07XG4gIGNvbnN0IHRyYW5zaXRpb246IFRyYW5zaXRpb25Bc3QgPSB7XG4gICAgdHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlRyYW5zaXRpb24sXG4gICAgYW5pbWF0aW9uLFxuICAgIG1hdGNoZXJzLFxuICAgIG9wdGlvbnM6IG51bGwsXG4gICAgcXVlcnlDb3VudDogMCxcbiAgICBkZXBDb3VudDogMFxuICB9O1xuICByZXR1cm4gbmV3IEFuaW1hdGlvblRyYW5zaXRpb25GYWN0b3J5KHRyaWdnZXJOYW1lLCB0cmFuc2l0aW9uLCBzdGF0ZXMpO1xufVxuXG5mdW5jdGlvbiBiYWxhbmNlUHJvcGVydGllcyhvYmo6IHtba2V5OiBzdHJpbmddOiBhbnl9LCBrZXkxOiBzdHJpbmcsIGtleTI6IHN0cmluZykge1xuICBpZiAob2JqLmhhc093blByb3BlcnR5KGtleTEpKSB7XG4gICAgaWYgKCFvYmouaGFzT3duUHJvcGVydHkoa2V5MikpIHtcbiAgICAgIG9ialtrZXkyXSA9IG9ialtrZXkxXTtcbiAgICB9XG4gIH0gZWxzZSBpZiAob2JqLmhhc093blByb3BlcnR5KGtleTIpKSB7XG4gICAgb2JqW2tleTFdID0gb2JqW2tleTJdO1xuICB9XG59XG4iXX0=