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
import { ɵisPromise as isPromise } from '@angular/core';
import { global } from '@angular/core/src/util';
import { AsyncTestCompleter } from './async_test_completer';
import { getTestBed } from './test_bed';
export { AsyncTestCompleter } from './async_test_completer';
export { inject } from './test_bed';
export { Log } from './logger';
export { MockNgZone } from './ng_zone_mock';
/** @type {?} */
export const proxy = (t) => t;
/** @type {?} */
const _global = (/** @type {?} */ ((typeof window === 'undefined' ? global : window)));
/** @type {?} */
export const afterEach = _global.afterEach;
/** @type {?} */
export const expect = _global.expect;
/** @type {?} */
const jsmBeforeEach = _global.beforeEach;
/** @type {?} */
const jsmDescribe = _global.describe;
/** @type {?} */
const jsmDDescribe = _global.fdescribe;
/** @type {?} */
const jsmXDescribe = _global.xdescribe;
/** @type {?} */
const jsmIt = _global.it;
/** @type {?} */
const jsmFIt = _global.fit;
/** @type {?} */
const jsmXIt = _global.xit;
/** @type {?} */
const runnerStack = [];
jasmine.DEFAULT_TIMEOUT_INTERVAL = 3000;
/** @type {?} */
const globalTimeOut = jasmine.DEFAULT_TIMEOUT_INTERVAL;
/** @type {?} */
const testBed = getTestBed();
/**
 * Mechanism to run `beforeEach()` functions of Angular tests.
 *
 * Note: Jasmine own `beforeEach` is used by this library to handle DI providers.
 */
class BeforeEachRunner {
    /**
     * @param {?} _parent
     */
    constructor(_parent) {
        this._parent = _parent;
        this._fns = [];
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    beforeEach(fn) { this._fns.push(fn); }
    /**
     * @return {?}
     */
    run() {
        if (this._parent)
            this._parent.run();
        this._fns.forEach((fn) => { fn(); });
    }
}
if (false) {
    /**
     * @type {?}
     * @private
     */
    BeforeEachRunner.prototype._fns;
    /**
     * @type {?}
     * @private
     */
    BeforeEachRunner.prototype._parent;
}
// Reset the test providers before each test
jsmBeforeEach(() => { testBed.resetTestingModule(); });
/**
 * @param {?} jsmFn
 * @param {...?} args
 * @return {?}
 */
function _describe(jsmFn, ...args) {
    /** @type {?} */
    const parentRunner = runnerStack.length === 0 ? null : runnerStack[runnerStack.length - 1];
    /** @type {?} */
    const runner = new BeforeEachRunner((/** @type {?} */ (parentRunner)));
    runnerStack.push(runner);
    /** @type {?} */
    const suite = jsmFn(...args);
    runnerStack.pop();
    return suite;
}
/**
 * @param {...?} args
 * @return {?}
 */
export function describe(...args) {
    return _describe(jsmDescribe, ...args);
}
/**
 * @param {...?} args
 * @return {?}
 */
export function ddescribe(...args) {
    return _describe(jsmDDescribe, ...args);
}
/**
 * @param {...?} args
 * @return {?}
 */
export function xdescribe(...args) {
    return _describe(jsmXDescribe, ...args);
}
/**
 * @param {?} fn
 * @return {?}
 */
export function beforeEach(fn) {
    if (runnerStack.length > 0) {
        // Inside a describe block, beforeEach() uses a BeforeEachRunner
        runnerStack[runnerStack.length - 1].beforeEach(fn);
    }
    else {
        // Top level beforeEach() are delegated to jasmine
        jsmBeforeEach(fn);
    }
}
/**
 * Allows overriding default providers defined in test_injector.js.
 *
 * The given function must return a list of DI providers.
 *
 * Example:
 *
 *   beforeEachProviders(() => [
 *     {provide: Compiler, useClass: MockCompiler},
 *     {provide: SomeToken, useValue: myValue},
 *   ]);
 * @param {?} fn
 * @return {?}
 */
export function beforeEachProviders(fn) {
    jsmBeforeEach(() => {
        /** @type {?} */
        const providers = fn();
        if (!providers)
            return;
        testBed.configureTestingModule({ providers: providers });
    });
}
/**
 * @param {?} jsmFn
 * @param {?} testName
 * @param {?} testFn
 * @param {?=} testTimeout
 * @return {?}
 */
function _it(jsmFn, testName, testFn, testTimeout = 0) {
    if (runnerStack.length == 0) {
        // This left here intentionally, as we should never get here, and it aids debugging.
        // tslint:disable-next-line
        debugger;
        throw new Error('Empty Stack!');
    }
    /** @type {?} */
    const runner = runnerStack[runnerStack.length - 1];
    /** @type {?} */
    const timeout = Math.max(globalTimeOut, testTimeout);
    jsmFn(testName, (done) => {
        /** @type {?} */
        const completerProvider = {
            provide: AsyncTestCompleter,
            useFactory: () => {
                // Mark the test as async when an AsyncTestCompleter is injected in an it()
                return new AsyncTestCompleter();
            }
        };
        testBed.configureTestingModule({ providers: [completerProvider] });
        runner.run();
        if (testFn.length === 0) {
            /** @type {?} */
            const retVal = testFn();
            if (isPromise(retVal)) {
                // Asynchronous test function that returns a Promise - wait for completion.
                retVal.then(done, done.fail);
            }
            else {
                // Synchronous test function - complete immediately.
                done();
            }
        }
        else {
            // Asynchronous test function that takes in 'done' parameter.
            testFn(done);
        }
    }, timeout);
}
/**
 * @param {?} expectation
 * @param {?} assertion
 * @param {?=} timeout
 * @return {?}
 */
export function it(expectation, assertion, timeout) {
    return _it(jsmIt, expectation, assertion, timeout);
}
/**
 * @param {?} expectation
 * @param {?} assertion
 * @param {?=} timeout
 * @return {?}
 */
export function fit(expectation, assertion, timeout) {
    return _it(jsmFIt, expectation, assertion, timeout);
}
/**
 * @param {?} expectation
 * @param {?} assertion
 * @param {?=} timeout
 * @return {?}
 */
export function xit(expectation, assertion, timeout) {
    return _it(jsmXIt, expectation, assertion, timeout);
}
export class SpyObject {
    /**
     * @param {?=} type
     */
    constructor(type) {
        if (type) {
            for (const prop in type.prototype) {
                /** @type {?} */
                let m = null;
                try {
                    m = type.prototype[prop];
                }
                catch (_a) {
                    // As we are creating spys for abstract classes,
                    // these classes might have getters that throw when they are accessed.
                    // As we are only auto creating spys for methods, this
                    // should not matter.
                }
                if (typeof m === 'function') {
                    this.spy(prop);
                }
            }
        }
    }
    /**
     * @param {?} name
     * @return {?}
     */
    spy(name) {
        if (!((/** @type {?} */ (this)))[name]) {
            ((/** @type {?} */ (this)))[name] = jasmine.createSpy(name);
        }
        return ((/** @type {?} */ (this)))[name];
    }
    /**
     * @param {?} name
     * @param {?} value
     * @return {?}
     */
    prop(name, value) { ((/** @type {?} */ (this)))[name] = value; }
    /**
     * @param {?=} object
     * @param {?=} config
     * @param {?=} overrides
     * @return {?}
     */
    static stub(object = null, config = null, overrides = null) {
        if (!(object instanceof SpyObject)) {
            overrides = config;
            config = object;
            object = new SpyObject();
        }
        /** @type {?} */
        const m = Object.assign({}, config, overrides);
        Object.keys(m).forEach(key => { object.spy(key).and.returnValue(m[key]); });
        return object;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGluZ19pbnRlcm5hbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvdGVzdGluZy9zcmMvdGVzdGluZ19pbnRlcm5hbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBQyxVQUFVLElBQUksU0FBUyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3RELE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUU5QyxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUMxRCxPQUFPLEVBQUMsVUFBVSxFQUFTLE1BQU0sWUFBWSxDQUFDO0FBRTlDLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQzFELE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFFbEMsb0JBQWMsVUFBVSxDQUFDO0FBQ3pCLDJCQUFjLGdCQUFnQixDQUFDOztBQUUvQixNQUFNLE9BQU8sS0FBSyxHQUFtQixDQUFDLENBQU0sRUFBRSxFQUFFLENBQUMsQ0FBQzs7TUFFNUMsT0FBTyxHQUFHLG1CQUFLLENBQUMsT0FBTyxNQUFNLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFBOztBQUV0RSxNQUFNLE9BQU8sU0FBUyxHQUFhLE9BQU8sQ0FBQyxTQUFTOztBQUNwRCxNQUFNLE9BQU8sTUFBTSxHQUEwQyxPQUFPLENBQUMsTUFBTTs7TUFFckUsYUFBYSxHQUFHLE9BQU8sQ0FBQyxVQUFVOztNQUNsQyxXQUFXLEdBQUcsT0FBTyxDQUFDLFFBQVE7O01BQzlCLFlBQVksR0FBRyxPQUFPLENBQUMsU0FBUzs7TUFDaEMsWUFBWSxHQUFHLE9BQU8sQ0FBQyxTQUFTOztNQUNoQyxLQUFLLEdBQUcsT0FBTyxDQUFDLEVBQUU7O01BQ2xCLE1BQU0sR0FB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bUJBQUEsSUFBSSxFQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQy9DO1FBQ0QsT0FBTyxDQUFDLG1CQUFBLElBQUksRUFBTyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDN0IsQ0FBQzs7Ozs7O0lBRUQsSUFBSSxDQUFDLElBQVksRUFBRSxLQUFVLElBQUksQ0FBQyxtQkFBQSxJQUFJLEVBQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7Ozs7Ozs7SUFFL0QsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFjLElBQUksRUFBRSxTQUFjLElBQUksRUFBRSxZQUFpQixJQUFJO1FBQ3ZFLElBQUksQ0FBQyxDQUFDLE1BQU0sWUFBWSxTQUFTLENBQUMsRUFBRTtZQUNsQyxTQUFTLEdBQUcsTUFBTSxDQUFDO1lBQ25CLE1BQU0sR0FBRyxNQUFNLENBQUM7WUFDaEIsTUFBTSxHQUFHLElBQUksU0FBUyxFQUFFLENBQUM7U0FDMUI7O2NBRUssQ0FBQyxxQkFBTyxNQUFNLEVBQUssU0FBUyxDQUFDO1FBQ25DLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUUsT0FBTyxNQUFNLENBQUM7SUFDaEIsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge8m1aXNQcm9taXNlIGFzIGlzUHJvbWlzZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge2dsb2JhbH0gZnJvbSAnQGFuZ3VsYXIvY29yZS9zcmMvdXRpbCc7XG5cbmltcG9ydCB7QXN5bmNUZXN0Q29tcGxldGVyfSBmcm9tICcuL2FzeW5jX3Rlc3RfY29tcGxldGVyJztcbmltcG9ydCB7Z2V0VGVzdEJlZCwgaW5qZWN0fSBmcm9tICcuL3Rlc3RfYmVkJztcblxuZXhwb3J0IHtBc3luY1Rlc3RDb21wbGV0ZXJ9IGZyb20gJy4vYXN5bmNfdGVzdF9jb21wbGV0ZXInO1xuZXhwb3J0IHtpbmplY3R9IGZyb20gJy4vdGVzdF9iZWQnO1xuXG5leHBvcnQgKiBmcm9tICcuL2xvZ2dlcic7XG5leHBvcnQgKiBmcm9tICcuL25nX3pvbmVfbW9jayc7XG5cbmV4cG9ydCBjb25zdCBwcm94eTogQ2xhc3NEZWNvcmF0b3IgPSAodDogYW55KSA9PiB0O1xuXG5jb25zdCBfZ2xvYmFsID0gPGFueT4odHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwgOiB3aW5kb3cpO1xuXG5leHBvcnQgY29uc3QgYWZ0ZXJFYWNoOiBGdW5jdGlvbiA9IF9nbG9iYWwuYWZ0ZXJFYWNoO1xuZXhwb3J0IGNvbnN0IGV4cGVjdDogPFQ+KGFjdHVhbDogVCkgPT4gamFzbWluZS5NYXRjaGVyczxUPiA9IF9nbG9iYWwuZXhwZWN0O1xuXG5jb25zdCBqc21CZWZvcmVFYWNoID0gX2dsb2JhbC5iZWZvcmVFYWNoO1xuY29uc3QganNtRGVzY3JpYmUgPSBfZ2xvYmFsLmRlc2NyaWJlO1xuY29uc3QganNtRERlc2NyaWJlID0gX2dsb2JhbC5mZGVzY3JpYmU7XG5jb25zdCBqc21YRGVzY3JpYmUgPSBfZ2xvYmFsLnhkZXNjcmliZTtcbmNvbnN0IGpzbUl0ID0gX2dsb2JhbC5pdDtcbmNvbnN0IGpzbUZJdCA9IF9nbG9iYWwuZml0O1xuY29uc3QganNtWEl0ID0gX2dsb2JhbC54aXQ7XG5cbmNvbnN0IHJ1bm5lclN0YWNrOiBCZWZvcmVFYWNoUnVubmVyW10gPSBbXTtcbmphc21pbmUuREVGQVVMVF9USU1FT1VUX0lOVEVSVkFMID0gMzAwMDtcbmNvbnN0IGdsb2JhbFRpbWVPdXQgPSBqYXNtaW5lLkRFRkFVTFRfVElNRU9VVF9JTlRFUlZBTDtcblxuY29uc3QgdGVzdEJlZCA9IGdldFRlc3RCZWQoKTtcblxuLyoqXG4gKiBNZWNoYW5pc20gdG8gcnVuIGBiZWZvcmVFYWNoKClgIGZ1bmN0aW9ucyBvZiBBbmd1bGFyIHRlc3RzLlxuICpcbiAqIE5vdGU6IEphc21pbmUgb3duIGBiZWZvcmVFYWNoYCBpcyB1c2VkIGJ5IHRoaXMgbGlicmFyeSB0byBoYW5kbGUgREkgcHJvdmlkZXJzLlxuICovXG5jbGFzcyBCZWZvcmVFYWNoUnVubmVyIHtcbiAgcHJpdmF0ZSBfZm5zOiBBcnJheTxGdW5jdGlvbj4gPSBbXTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9wYXJlbnQ6IEJlZm9yZUVhY2hSdW5uZXIpIHt9XG5cbiAgYmVmb3JlRWFjaChmbjogRnVuY3Rpb24pOiB2b2lkIHsgdGhpcy5fZm5zLnB1c2goZm4pOyB9XG5cbiAgcnVuKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9wYXJlbnQpIHRoaXMuX3BhcmVudC5ydW4oKTtcbiAgICB0aGlzLl9mbnMuZm9yRWFjaCgoZm4pID0+IHsgZm4oKTsgfSk7XG4gIH1cbn1cblxuLy8gUmVzZXQgdGhlIHRlc3QgcHJvdmlkZXJzIGJlZm9yZSBlYWNoIHRlc3RcbmpzbUJlZm9yZUVhY2goKCkgPT4geyB0ZXN0QmVkLnJlc2V0VGVzdGluZ01vZHVsZSgpOyB9KTtcblxuZnVuY3Rpb24gX2Rlc2NyaWJlKGpzbUZuOiBGdW5jdGlvbiwgLi4uYXJnczogYW55W10pIHtcbiAgY29uc3QgcGFyZW50UnVubmVyID0gcnVubmVyU3RhY2subGVuZ3RoID09PSAwID8gbnVsbCA6IHJ1bm5lclN0YWNrW3J1bm5lclN0YWNrLmxlbmd0aCAtIDFdO1xuICBjb25zdCBydW5uZXIgPSBuZXcgQmVmb3JlRWFjaFJ1bm5lcihwYXJlbnRSdW5uZXIgISk7XG4gIHJ1bm5lclN0YWNrLnB1c2gocnVubmVyKTtcbiAgY29uc3Qgc3VpdGUgPSBqc21GbiguLi5hcmdzKTtcbiAgcnVubmVyU3RhY2sucG9wKCk7XG4gIHJldHVybiBzdWl0ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlc2NyaWJlKC4uLmFyZ3M6IGFueVtdKTogdm9pZCB7XG4gIHJldHVybiBfZGVzY3JpYmUoanNtRGVzY3JpYmUsIC4uLmFyZ3MpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGRlc2NyaWJlKC4uLmFyZ3M6IGFueVtdKTogdm9pZCB7XG4gIHJldHVybiBfZGVzY3JpYmUoanNtRERlc2NyaWJlLCAuLi5hcmdzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHhkZXNjcmliZSguLi5hcmdzOiBhbnlbXSk6IHZvaWQge1xuICByZXR1cm4gX2Rlc2NyaWJlKGpzbVhEZXNjcmliZSwgLi4uYXJncyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiZWZvcmVFYWNoKGZuOiBGdW5jdGlvbik6IHZvaWQge1xuICBpZiAocnVubmVyU3RhY2subGVuZ3RoID4gMCkge1xuICAgIC8vIEluc2lkZSBhIGRlc2NyaWJlIGJsb2NrLCBiZWZvcmVFYWNoKCkgdXNlcyBhIEJlZm9yZUVhY2hSdW5uZXJcbiAgICBydW5uZXJTdGFja1tydW5uZXJTdGFjay5sZW5ndGggLSAxXS5iZWZvcmVFYWNoKGZuKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBUb3AgbGV2ZWwgYmVmb3JlRWFjaCgpIGFyZSBkZWxlZ2F0ZWQgdG8gamFzbWluZVxuICAgIGpzbUJlZm9yZUVhY2goZm4pO1xuICB9XG59XG5cbi8qKlxuICogQWxsb3dzIG92ZXJyaWRpbmcgZGVmYXVsdCBwcm92aWRlcnMgZGVmaW5lZCBpbiB0ZXN0X2luamVjdG9yLmpzLlxuICpcbiAqIFRoZSBnaXZlbiBmdW5jdGlvbiBtdXN0IHJldHVybiBhIGxpc3Qgb2YgREkgcHJvdmlkZXJzLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogICBiZWZvcmVFYWNoUHJvdmlkZXJzKCgpID0+IFtcbiAqICAgICB7cHJvdmlkZTogQ29tcGlsZXIsIHVzZUNsYXNzOiBNb2NrQ29tcGlsZXJ9LFxuICogICAgIHtwcm92aWRlOiBTb21lVG9rZW4sIHVzZVZhbHVlOiBteVZhbHVlfSxcbiAqICAgXSk7XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiZWZvcmVFYWNoUHJvdmlkZXJzKGZuOiBGdW5jdGlvbik6IHZvaWQge1xuICBqc21CZWZvcmVFYWNoKCgpID0+IHtcbiAgICBjb25zdCBwcm92aWRlcnMgPSBmbigpO1xuICAgIGlmICghcHJvdmlkZXJzKSByZXR1cm47XG4gICAgdGVzdEJlZC5jb25maWd1cmVUZXN0aW5nTW9kdWxlKHtwcm92aWRlcnM6IHByb3ZpZGVyc30pO1xuICB9KTtcbn1cblxuXG5mdW5jdGlvbiBfaXQoXG4gICAganNtRm46IEZ1bmN0aW9uLCB0ZXN0TmFtZTogc3RyaW5nLCB0ZXN0Rm46IChkb25lPzogRG9uZUZuKSA9PiBhbnksIHRlc3RUaW1lb3V0ID0gMCk6IHZvaWQge1xuICBpZiAocnVubmVyU3RhY2subGVuZ3RoID09IDApIHtcbiAgICAvLyBUaGlzIGxlZnQgaGVyZSBpbnRlbnRpb25hbGx5LCBhcyB3ZSBzaG91bGQgbmV2ZXIgZ2V0IGhlcmUsIGFuZCBpdCBhaWRzIGRlYnVnZ2luZy5cbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmVcbiAgICBkZWJ1Z2dlcjtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0VtcHR5IFN0YWNrIScpO1xuICB9XG4gIGNvbnN0IHJ1bm5lciA9IHJ1bm5lclN0YWNrW3J1bm5lclN0YWNrLmxlbmd0aCAtIDFdO1xuICBjb25zdCB0aW1lb3V0ID0gTWF0aC5tYXgoZ2xvYmFsVGltZU91dCwgdGVzdFRpbWVvdXQpO1xuXG4gIGpzbUZuKHRlc3ROYW1lLCAoZG9uZTogRG9uZUZuKSA9PiB7XG4gICAgY29uc3QgY29tcGxldGVyUHJvdmlkZXIgPSB7XG4gICAgICBwcm92aWRlOiBBc3luY1Rlc3RDb21wbGV0ZXIsXG4gICAgICB1c2VGYWN0b3J5OiAoKSA9PiB7XG4gICAgICAgIC8vIE1hcmsgdGhlIHRlc3QgYXMgYXN5bmMgd2hlbiBhbiBBc3luY1Rlc3RDb21wbGV0ZXIgaXMgaW5qZWN0ZWQgaW4gYW4gaXQoKVxuICAgICAgICByZXR1cm4gbmV3IEFzeW5jVGVzdENvbXBsZXRlcigpO1xuICAgICAgfVxuICAgIH07XG4gICAgdGVzdEJlZC5jb25maWd1cmVUZXN0aW5nTW9kdWxlKHtwcm92aWRlcnM6IFtjb21wbGV0ZXJQcm92aWRlcl19KTtcbiAgICBydW5uZXIucnVuKCk7XG5cbiAgICBpZiAodGVzdEZuLmxlbmd0aCA9PT0gMCkge1xuICAgICAgY29uc3QgcmV0VmFsID0gdGVzdEZuKCk7XG4gICAgICBpZiAoaXNQcm9taXNlKHJldFZhbCkpIHtcbiAgICAgICAgLy8gQXN5bmNocm9ub3VzIHRlc3QgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGEgUHJvbWlzZSAtIHdhaXQgZm9yIGNvbXBsZXRpb24uXG4gICAgICAgIHJldFZhbC50aGVuKGRvbmUsIGRvbmUuZmFpbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBTeW5jaHJvbm91cyB0ZXN0IGZ1bmN0aW9uIC0gY29tcGxldGUgaW1tZWRpYXRlbHkuXG4gICAgICAgIGRvbmUoKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gQXN5bmNocm9ub3VzIHRlc3QgZnVuY3Rpb24gdGhhdCB0YWtlcyBpbiAnZG9uZScgcGFyYW1ldGVyLlxuICAgICAgdGVzdEZuKGRvbmUpO1xuICAgIH1cbiAgfSwgdGltZW91dCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpdChleHBlY3RhdGlvbjogc3RyaW5nLCBhc3NlcnRpb246IChkb25lOiBEb25lRm4pID0+IGFueSwgdGltZW91dD86IG51bWJlcik6IHZvaWQge1xuICByZXR1cm4gX2l0KGpzbUl0LCBleHBlY3RhdGlvbiwgYXNzZXJ0aW9uLCB0aW1lb3V0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpdChleHBlY3RhdGlvbjogc3RyaW5nLCBhc3NlcnRpb246IChkb25lOiBEb25lRm4pID0+IGFueSwgdGltZW91dD86IG51bWJlcik6IHZvaWQge1xuICByZXR1cm4gX2l0KGpzbUZJdCwgZXhwZWN0YXRpb24sIGFzc2VydGlvbiwgdGltZW91dCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB4aXQoZXhwZWN0YXRpb246IHN0cmluZywgYXNzZXJ0aW9uOiAoZG9uZTogRG9uZUZuKSA9PiBhbnksIHRpbWVvdXQ/OiBudW1iZXIpOiB2b2lkIHtcbiAgcmV0dXJuIF9pdChqc21YSXQsIGV4cGVjdGF0aW9uLCBhc3NlcnRpb24sIHRpbWVvdXQpO1xufVxuXG5leHBvcnQgY2xhc3MgU3B5T2JqZWN0IHtcbiAgY29uc3RydWN0b3IodHlwZT86IGFueSkge1xuICAgIGlmICh0eXBlKSB7XG4gICAgICBmb3IgKGNvbnN0IHByb3AgaW4gdHlwZS5wcm90b3R5cGUpIHtcbiAgICAgICAgbGV0IG06IGFueSA9IG51bGw7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgbSA9IHR5cGUucHJvdG90eXBlW3Byb3BdO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAvLyBBcyB3ZSBhcmUgY3JlYXRpbmcgc3B5cyBmb3IgYWJzdHJhY3QgY2xhc3NlcyxcbiAgICAgICAgICAvLyB0aGVzZSBjbGFzc2VzIG1pZ2h0IGhhdmUgZ2V0dGVycyB0aGF0IHRocm93IHdoZW4gdGhleSBhcmUgYWNjZXNzZWQuXG4gICAgICAgICAgLy8gQXMgd2UgYXJlIG9ubHkgYXV0byBjcmVhdGluZyBzcHlzIGZvciBtZXRob2RzLCB0aGlzXG4gICAgICAgICAgLy8gc2hvdWxkIG5vdCBtYXR0ZXIuXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBtID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgdGhpcy5zcHkocHJvcCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzcHkobmFtZTogc3RyaW5nKSB7XG4gICAgaWYgKCEodGhpcyBhcyBhbnkpW25hbWVdKSB7XG4gICAgICAodGhpcyBhcyBhbnkpW25hbWVdID0gamFzbWluZS5jcmVhdGVTcHkobmFtZSk7XG4gICAgfVxuICAgIHJldHVybiAodGhpcyBhcyBhbnkpW25hbWVdO1xuICB9XG5cbiAgcHJvcChuYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnkpIHsgKHRoaXMgYXMgYW55KVtuYW1lXSA9IHZhbHVlOyB9XG5cbiAgc3RhdGljIHN0dWIob2JqZWN0OiBhbnkgPSBudWxsLCBjb25maWc6IGFueSA9IG51bGwsIG92ZXJyaWRlczogYW55ID0gbnVsbCkge1xuICAgIGlmICghKG9iamVjdCBpbnN0YW5jZW9mIFNweU9iamVjdCkpIHtcbiAgICAgIG92ZXJyaWRlcyA9IGNvbmZpZztcbiAgICAgIGNvbmZpZyA9IG9iamVjdDtcbiAgICAgIG9iamVjdCA9IG5ldyBTcHlPYmplY3QoKTtcbiAgICB9XG5cbiAgICBjb25zdCBtID0gey4uLmNvbmZpZywgLi4ub3ZlcnJpZGVzfTtcbiAgICBPYmplY3Qua2V5cyhtKS5mb3JFYWNoKGtleSA9PiB7IG9iamVjdC5zcHkoa2V5KS5hbmQucmV0dXJuVmFsdWUobVtrZXldKTsgfSk7XG4gICAgcmV0dXJuIG9iamVjdDtcbiAgfVxufVxuIl19