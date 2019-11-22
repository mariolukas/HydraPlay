/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { computeStyle } from '../../util';
import { ElementAnimationStyleHandler } from './element_animation_style_handler';
/** @type {?} */
const DEFAULT_FILL_MODE = 'forwards';
/** @type {?} */
const DEFAULT_EASING = 'linear';
/** @enum {number} */
const AnimatorControlState = {
    INITIALIZED: 1, STARTED: 2, FINISHED: 3, DESTROYED: 4,
};
export { AnimatorControlState };
export class CssKeyframesPlayer {
    /**
     * @param {?} element
     * @param {?} keyframes
     * @param {?} animationName
     * @param {?} _duration
     * @param {?} _delay
     * @param {?} easing
     * @param {?} _finalStyles
     * @param {?=} _specialStyles
     */
    constructor(element, keyframes, animationName, _duration, _delay, easing, _finalStyles, _specialStyles) {
        this.element = element;
        this.keyframes = keyframes;
        this.animationName = animationName;
        this._duration = _duration;
        this._delay = _delay;
        this._finalStyles = _finalStyles;
        this._specialStyles = _specialStyles;
        this._onDoneFns = [];
        this._onStartFns = [];
        this._onDestroyFns = [];
        this._started = false;
        this.currentSnapshot = {};
        this._state = 0;
        this.easing = easing || DEFAULT_EASING;
        this.totalTime = _duration + _delay;
        this._buildStyler();
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    onStart(fn) { this._onStartFns.push(fn); }
    /**
     * @param {?} fn
     * @return {?}
     */
    onDone(fn) { this._onDoneFns.push(fn); }
    /**
     * @param {?} fn
     * @return {?}
     */
    onDestroy(fn) { this._onDestroyFns.push(fn); }
    /**
     * @return {?}
     */
    destroy() {
        this.init();
        if (this._state >= 4 /* DESTROYED */)
            return;
        this._state = 4 /* DESTROYED */;
        this._styler.destroy();
        this._flushStartFns();
        this._flushDoneFns();
        if (this._specialStyles) {
            this._specialStyles.destroy();
        }
        this._onDestroyFns.forEach(fn => fn());
        this._onDestroyFns = [];
    }
    /**
     * @private
     * @return {?}
     */
    _flushDoneFns() {
        this._onDoneFns.forEach(fn => fn());
        this._onDoneFns = [];
    }
    /**
     * @private
     * @return {?}
     */
    _flushStartFns() {
        this._onStartFns.forEach(fn => fn());
        this._onStartFns = [];
    }
    /**
     * @return {?}
     */
    finish() {
        this.init();
        if (this._state >= 3 /* FINISHED */)
            return;
        this._state = 3 /* FINISHED */;
        this._styler.finish();
        this._flushStartFns();
        if (this._specialStyles) {
            this._specialStyles.finish();
        }
        this._flushDoneFns();
    }
    /**
     * @param {?} value
     * @return {?}
     */
    setPosition(value) { this._styler.setPosition(value); }
    /**
     * @return {?}
     */
    getPosition() { return this._styler.getPosition(); }
    /**
     * @return {?}
     */
    hasStarted() { return this._state >= 2 /* STARTED */; }
    /**
     * @return {?}
     */
    init() {
        if (this._state >= 1 /* INITIALIZED */)
            return;
        this._state = 1 /* INITIALIZED */;
        /** @type {?} */
        const elm = this.element;
        this._styler.apply();
        if (this._delay) {
            this._styler.pause();
        }
    }
    /**
     * @return {?}
     */
    play() {
        this.init();
        if (!this.hasStarted()) {
            this._flushStartFns();
            this._state = 2 /* STARTED */;
            if (this._specialStyles) {
                this._specialStyles.start();
            }
        }
        this._styler.resume();
    }
    /**
     * @return {?}
     */
    pause() {
        this.init();
        this._styler.pause();
    }
    /**
     * @return {?}
     */
    restart() {
        this.reset();
        this.play();
    }
    /**
     * @return {?}
     */
    reset() {
        this._styler.destroy();
        this._buildStyler();
        this._styler.apply();
    }
    /**
     * @private
     * @return {?}
     */
    _buildStyler() {
        this._styler = new ElementAnimationStyleHandler(this.element, this.animationName, this._duration, this._delay, this.easing, DEFAULT_FILL_MODE, () => this.finish());
    }
    /**
     * \@internal
     * @param {?} phaseName
     * @return {?}
     */
    triggerCallback(phaseName) {
        /** @type {?} */
        const methods = phaseName == 'start' ? this._onStartFns : this._onDoneFns;
        methods.forEach(fn => fn());
        methods.length = 0;
    }
    /**
     * @return {?}
     */
    beforeDestroy() {
        this.init();
        /** @type {?} */
        const styles = {};
        if (this.hasStarted()) {
            /** @type {?} */
            const finished = this._state >= 3 /* FINISHED */;
            Object.keys(this._finalStyles).forEach(prop => {
                if (prop != 'offset') {
                    styles[prop] = finished ? this._finalStyles[prop] : computeStyle(this.element, prop);
                }
            });
        }
        this.currentSnapshot = styles;
    }
}
if (false) {
    /**
     * @type {?}
     * @private
     */
    CssKeyframesPlayer.prototype._onDoneFns;
    /**
     * @type {?}
     * @private
     */
    CssKeyframesPlayer.prototype._onStartFns;
    /**
     * @type {?}
     * @private
     */
    CssKeyframesPlayer.prototype._onDestroyFns;
    /**
     * @type {?}
     * @private
     */
    CssKeyframesPlayer.prototype._started;
    /**
     * @type {?}
     * @private
     */
    CssKeyframesPlayer.prototype._styler;
    /** @type {?} */
    CssKeyframesPlayer.prototype.parentPlayer;
    /** @type {?} */
    CssKeyframesPlayer.prototype.totalTime;
    /** @type {?} */
    CssKeyframesPlayer.prototype.easing;
    /** @type {?} */
    CssKeyframesPlayer.prototype.currentSnapshot;
    /**
     * @type {?}
     * @private
     */
    CssKeyframesPlayer.prototype._state;
    /** @type {?} */
    CssKeyframesPlayer.prototype.element;
    /** @type {?} */
    CssKeyframesPlayer.prototype.keyframes;
    /** @type {?} */
    CssKeyframesPlayer.prototype.animationName;
    /**
     * @type {?}
     * @private
     */
    CssKeyframesPlayer.prototype._duration;
    /**
     * @type {?}
     * @private
     */
    CssKeyframesPlayer.prototype._delay;
    /**
     * @type {?}
     * @private
     */
    CssKeyframesPlayer.prototype._finalStyles;
    /**
     * @type {?}
     * @private
     */
    CssKeyframesPlayer.prototype._specialStyles;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3NzX2tleWZyYW1lc19wbGF5ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmltYXRpb25zL2Jyb3dzZXIvc3JjL3JlbmRlci9jc3Nfa2V5ZnJhbWVzL2Nzc19rZXlmcmFtZXNfcGxheWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFTQSxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBRXhDLE9BQU8sRUFBQyw0QkFBNEIsRUFBQyxNQUFNLG1DQUFtQyxDQUFDOztNQUV6RSxpQkFBaUIsR0FBRyxVQUFVOztNQUM5QixjQUFjLEdBQUcsUUFBUTs7O0lBRVMsY0FBZSxFQUFFLFVBQVcsRUFBRSxXQUFZLEVBQUUsWUFBYTs7O0FBRWpHLE1BQU0sT0FBTyxrQkFBa0I7Ozs7Ozs7Ozs7O0lBaUI3QixZQUNvQixPQUFZLEVBQWtCLFNBQTZDLEVBQzNFLGFBQXFCLEVBQW1CLFNBQWlCLEVBQ3hELE1BQWMsRUFBRSxNQUFjLEVBQzlCLFlBQWtDLEVBQ2xDLGNBQXdDO1FBSnpDLFlBQU8sR0FBUCxPQUFPLENBQUs7UUFBa0IsY0FBUyxHQUFULFNBQVMsQ0FBb0M7UUFDM0Usa0JBQWEsR0FBYixhQUFhLENBQVE7UUFBbUIsY0FBUyxHQUFULFNBQVMsQ0FBUTtRQUN4RCxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBQ2QsaUJBQVksR0FBWixZQUFZLENBQXNCO1FBQ2xDLG1CQUFjLEdBQWQsY0FBYyxDQUEwQjtRQXJCckQsZUFBVSxHQUFlLEVBQUUsQ0FBQztRQUM1QixnQkFBVyxHQUFlLEVBQUUsQ0FBQztRQUM3QixrQkFBYSxHQUFlLEVBQUUsQ0FBQztRQUUvQixhQUFRLEdBQUcsS0FBSyxDQUFDO1FBUWxCLG9CQUFlLEdBQTRCLEVBQUUsQ0FBQztRQUU3QyxXQUFNLEdBQXlCLENBQUMsQ0FBQztRQVF2QyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sSUFBSSxj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QUNuRCw0Q0FBeUQiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0FuaW1hdGlvblBsYXllcn0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5cbmltcG9ydCB7Y29tcHV0ZVN0eWxlfSBmcm9tICcuLi8uLi91dGlsJztcbmltcG9ydCB7U3BlY2lhbENhc2VkU3R5bGVzfSBmcm9tICcuLi9zcGVjaWFsX2Nhc2VkX3N0eWxlcyc7XG5pbXBvcnQge0VsZW1lbnRBbmltYXRpb25TdHlsZUhhbmRsZXJ9IGZyb20gJy4vZWxlbWVudF9hbmltYXRpb25fc3R5bGVfaGFuZGxlcic7XG5cbmNvbnN0IERFRkFVTFRfRklMTF9NT0RFID0gJ2ZvcndhcmRzJztcbmNvbnN0IERFRkFVTFRfRUFTSU5HID0gJ2xpbmVhcic7XG5cbmV4cG9ydCBjb25zdCBlbnVtIEFuaW1hdG9yQ29udHJvbFN0YXRlIHtJTklUSUFMSVpFRCA9IDEsIFNUQVJURUQgPSAyLCBGSU5JU0hFRCA9IDMsIERFU1RST1lFRCA9IDR9XG5cbmV4cG9ydCBjbGFzcyBDc3NLZXlmcmFtZXNQbGF5ZXIgaW1wbGVtZW50cyBBbmltYXRpb25QbGF5ZXIge1xuICBwcml2YXRlIF9vbkRvbmVGbnM6IEZ1bmN0aW9uW10gPSBbXTtcbiAgcHJpdmF0ZSBfb25TdGFydEZuczogRnVuY3Rpb25bXSA9IFtdO1xuICBwcml2YXRlIF9vbkRlc3Ryb3lGbnM6IEZ1bmN0aW9uW10gPSBbXTtcblxuICBwcml2YXRlIF9zdGFydGVkID0gZmFsc2U7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIF9zdHlsZXIgITogRWxlbWVudEFuaW1hdGlvblN0eWxlSGFuZGxlcjtcblxuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHVibGljIHBhcmVudFBsYXllciAhOiBBbmltYXRpb25QbGF5ZXI7XG4gIHB1YmxpYyByZWFkb25seSB0b3RhbFRpbWU6IG51bWJlcjtcbiAgcHVibGljIHJlYWRvbmx5IGVhc2luZzogc3RyaW5nO1xuICBwdWJsaWMgY3VycmVudFNuYXBzaG90OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuXG4gIHByaXZhdGUgX3N0YXRlOiBBbmltYXRvckNvbnRyb2xTdGF0ZSA9IDA7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgcmVhZG9ubHkgZWxlbWVudDogYW55LCBwdWJsaWMgcmVhZG9ubHkga2V5ZnJhbWVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyfVtdLFxuICAgICAgcHVibGljIHJlYWRvbmx5IGFuaW1hdGlvbk5hbWU6IHN0cmluZywgcHJpdmF0ZSByZWFkb25seSBfZHVyYXRpb246IG51bWJlcixcbiAgICAgIHByaXZhdGUgcmVhZG9ubHkgX2RlbGF5OiBudW1iZXIsIGVhc2luZzogc3RyaW5nLFxuICAgICAgcHJpdmF0ZSByZWFkb25seSBfZmluYWxTdHlsZXM6IHtba2V5OiBzdHJpbmddOiBhbnl9LFxuICAgICAgcHJpdmF0ZSByZWFkb25seSBfc3BlY2lhbFN0eWxlcz86IFNwZWNpYWxDYXNlZFN0eWxlc3xudWxsKSB7XG4gICAgdGhpcy5lYXNpbmcgPSBlYXNpbmcgfHwgREVGQVVMVF9FQVNJTkc7XG4gICAgdGhpcy50b3RhbFRpbWUgPSBfZHVyYXRpb24gKyBfZGVsYXk7XG4gICAgdGhpcy5fYnVpbGRTdHlsZXIoKTtcbiAgfVxuXG4gIG9uU3RhcnQoZm46ICgpID0+IHZvaWQpOiB2b2lkIHsgdGhpcy5fb25TdGFydEZucy5wdXNoKGZuKTsgfVxuXG4gIG9uRG9uZShmbjogKCkgPT4gdm9pZCk6IHZvaWQgeyB0aGlzLl9vbkRvbmVGbnMucHVzaChmbik7IH1cblxuICBvbkRlc3Ryb3koZm46ICgpID0+IHZvaWQpOiB2b2lkIHsgdGhpcy5fb25EZXN0cm95Rm5zLnB1c2goZm4pOyB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLmluaXQoKTtcbiAgICBpZiAodGhpcy5fc3RhdGUgPj0gQW5pbWF0b3JDb250cm9sU3RhdGUuREVTVFJPWUVEKSByZXR1cm47XG4gICAgdGhpcy5fc3RhdGUgPSBBbmltYXRvckNvbnRyb2xTdGF0ZS5ERVNUUk9ZRUQ7XG4gICAgdGhpcy5fc3R5bGVyLmRlc3Ryb3koKTtcbiAgICB0aGlzLl9mbHVzaFN0YXJ0Rm5zKCk7XG4gICAgdGhpcy5fZmx1c2hEb25lRm5zKCk7XG4gICAgaWYgKHRoaXMuX3NwZWNpYWxTdHlsZXMpIHtcbiAgICAgIHRoaXMuX3NwZWNpYWxTdHlsZXMuZGVzdHJveSgpO1xuICAgIH1cbiAgICB0aGlzLl9vbkRlc3Ryb3lGbnMuZm9yRWFjaChmbiA9PiBmbigpKTtcbiAgICB0aGlzLl9vbkRlc3Ryb3lGbnMgPSBbXTtcbiAgfVxuXG4gIHByaXZhdGUgX2ZsdXNoRG9uZUZucygpIHtcbiAgICB0aGlzLl9vbkRvbmVGbnMuZm9yRWFjaChmbiA9PiBmbigpKTtcbiAgICB0aGlzLl9vbkRvbmVGbnMgPSBbXTtcbiAgfVxuXG4gIHByaXZhdGUgX2ZsdXNoU3RhcnRGbnMoKSB7XG4gICAgdGhpcy5fb25TdGFydEZucy5mb3JFYWNoKGZuID0+IGZuKCkpO1xuICAgIHRoaXMuX29uU3RhcnRGbnMgPSBbXTtcbiAgfVxuXG4gIGZpbmlzaCgpIHtcbiAgICB0aGlzLmluaXQoKTtcbiAgICBpZiAodGhpcy5fc3RhdGUgPj0gQW5pbWF0b3JDb250cm9sU3RhdGUuRklOSVNIRUQpIHJldHVybjtcbiAgICB0aGlzLl9zdGF0ZSA9IEFuaW1hdG9yQ29udHJvbFN0YXRlLkZJTklTSEVEO1xuICAgIHRoaXMuX3N0eWxlci5maW5pc2goKTtcbiAgICB0aGlzLl9mbHVzaFN0YXJ0Rm5zKCk7XG4gICAgaWYgKHRoaXMuX3NwZWNpYWxTdHlsZXMpIHtcbiAgICAgIHRoaXMuX3NwZWNpYWxTdHlsZXMuZmluaXNoKCk7XG4gICAgfVxuICAgIHRoaXMuX2ZsdXNoRG9uZUZucygpO1xuICB9XG5cbiAgc2V0UG9zaXRpb24odmFsdWU6IG51bWJlcikgeyB0aGlzLl9zdHlsZXIuc2V0UG9zaXRpb24odmFsdWUpOyB9XG5cbiAgZ2V0UG9zaXRpb24oKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX3N0eWxlci5nZXRQb3NpdGlvbigpOyB9XG5cbiAgaGFzU3RhcnRlZCgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX3N0YXRlID49IEFuaW1hdG9yQ29udHJvbFN0YXRlLlNUQVJURUQ7IH1cbiAgaW5pdCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fc3RhdGUgPj0gQW5pbWF0b3JDb250cm9sU3RhdGUuSU5JVElBTElaRUQpIHJldHVybjtcbiAgICB0aGlzLl9zdGF0ZSA9IEFuaW1hdG9yQ29udHJvbFN0YXRlLklOSVRJQUxJWkVEO1xuICAgIGNvbnN0IGVsbSA9IHRoaXMuZWxlbWVudDtcbiAgICB0aGlzLl9zdHlsZXIuYXBwbHkoKTtcbiAgICBpZiAodGhpcy5fZGVsYXkpIHtcbiAgICAgIHRoaXMuX3N0eWxlci5wYXVzZSgpO1xuICAgIH1cbiAgfVxuXG4gIHBsYXkoKTogdm9pZCB7XG4gICAgdGhpcy5pbml0KCk7XG4gICAgaWYgKCF0aGlzLmhhc1N0YXJ0ZWQoKSkge1xuICAgICAgdGhpcy5fZmx1c2hTdGFydEZucygpO1xuICAgICAgdGhpcy5fc3RhdGUgPSBBbmltYXRvckNvbnRyb2xTdGF0ZS5TVEFSVEVEO1xuICAgICAgaWYgKHRoaXMuX3NwZWNpYWxTdHlsZXMpIHtcbiAgICAgICAgdGhpcy5fc3BlY2lhbFN0eWxlcy5zdGFydCgpO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl9zdHlsZXIucmVzdW1lKCk7XG4gIH1cblxuICBwYXVzZSgpOiB2b2lkIHtcbiAgICB0aGlzLmluaXQoKTtcbiAgICB0aGlzLl9zdHlsZXIucGF1c2UoKTtcbiAgfVxuICByZXN0YXJ0KCk6IHZvaWQge1xuICAgIHRoaXMucmVzZXQoKTtcbiAgICB0aGlzLnBsYXkoKTtcbiAgfVxuICByZXNldCgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdHlsZXIuZGVzdHJveSgpO1xuICAgIHRoaXMuX2J1aWxkU3R5bGVyKCk7XG4gICAgdGhpcy5fc3R5bGVyLmFwcGx5KCk7XG4gIH1cblxuICBwcml2YXRlIF9idWlsZFN0eWxlcigpIHtcbiAgICB0aGlzLl9zdHlsZXIgPSBuZXcgRWxlbWVudEFuaW1hdGlvblN0eWxlSGFuZGxlcihcbiAgICAgICAgdGhpcy5lbGVtZW50LCB0aGlzLmFuaW1hdGlvbk5hbWUsIHRoaXMuX2R1cmF0aW9uLCB0aGlzLl9kZWxheSwgdGhpcy5lYXNpbmcsXG4gICAgICAgIERFRkFVTFRfRklMTF9NT0RFLCAoKSA9PiB0aGlzLmZpbmlzaCgpKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgdHJpZ2dlckNhbGxiYWNrKHBoYXNlTmFtZTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgbWV0aG9kcyA9IHBoYXNlTmFtZSA9PSAnc3RhcnQnID8gdGhpcy5fb25TdGFydEZucyA6IHRoaXMuX29uRG9uZUZucztcbiAgICBtZXRob2RzLmZvckVhY2goZm4gPT4gZm4oKSk7XG4gICAgbWV0aG9kcy5sZW5ndGggPSAwO1xuICB9XG5cbiAgYmVmb3JlRGVzdHJveSgpIHtcbiAgICB0aGlzLmluaXQoKTtcbiAgICBjb25zdCBzdHlsZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gICAgaWYgKHRoaXMuaGFzU3RhcnRlZCgpKSB7XG4gICAgICBjb25zdCBmaW5pc2hlZCA9IHRoaXMuX3N0YXRlID49IEFuaW1hdG9yQ29udHJvbFN0YXRlLkZJTklTSEVEO1xuICAgICAgT2JqZWN0LmtleXModGhpcy5fZmluYWxTdHlsZXMpLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICAgIGlmIChwcm9wICE9ICdvZmZzZXQnKSB7XG4gICAgICAgICAgc3R5bGVzW3Byb3BdID0gZmluaXNoZWQgPyB0aGlzLl9maW5hbFN0eWxlc1twcm9wXSA6IGNvbXB1dGVTdHlsZSh0aGlzLmVsZW1lbnQsIHByb3ApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgdGhpcy5jdXJyZW50U25hcHNob3QgPSBzdHlsZXM7XG4gIH1cbn1cbiJdfQ==