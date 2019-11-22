"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const stableStringify = require('fast-json-stable-stringify');
var strategy;
(function (strategy) {
    /**
     * Creates a JobStrategy that serializes every call. This strategy can be mixed between jobs.
     */
    function serialize() {
        let latest = rxjs_1.of();
        return (handler, options) => {
            const newHandler = (argument, context) => {
                const previous = latest;
                latest = rxjs_1.concat(previous.pipe(operators_1.ignoreElements()), new rxjs_1.Observable(o => handler(argument, context).subscribe(o))).pipe(operators_1.shareReplay(0));
                return latest;
            };
            return Object.assign(newHandler, {
                jobDescription: Object.assign({}, handler.jobDescription, options),
            });
        };
    }
    strategy.serialize = serialize;
    /**
     * Creates a JobStrategy that will reuse a running job if the argument matches.
     * @param replayMessages Replay ALL messages if a job is reused, otherwise just hook up where it
     *        is.
     */
    function memoize(replayMessages = false) {
        const runs = new Map();
        return (handler, options) => {
            const newHandler = (argument, context) => {
                const argumentJson = stableStringify(argument);
                const maybeJob = runs.get(argumentJson);
                if (maybeJob) {
                    return maybeJob;
                }
                const run = handler(argument, context).pipe(replayMessages ? operators_1.shareReplay() : operators_1.share());
                runs.set(argumentJson, run);
                return run;
            };
            return Object.assign(newHandler, handler, options || {});
        };
    }
    strategy.memoize = memoize;
})(strategy = exports.strategy || (exports.strategy = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyYXRlZ3kuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2FuZ3VsYXJfZGV2a2l0L2NvcmUvc3JjL2V4cGVyaW1lbnRhbC9qb2JzL3N0cmF0ZWd5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7OztHQU1HO0FBQ0gsK0JBQThDO0FBQzlDLDhDQUFvRTtBQUlwRSxNQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsNEJBQTRCLENBQUMsQ0FBQztBQUU5RCxJQUFpQixRQUFRLENBc0V4QjtBQXRFRCxXQUFpQixRQUFRO0lBT3ZCOztPQUVHO0lBQ0gsU0FBZ0IsU0FBUztRQUt2QixJQUFJLE1BQU0sR0FBc0MsU0FBRSxFQUFFLENBQUM7UUFFckQsT0FBTyxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsRUFBRTtZQUMxQixNQUFNLFVBQVUsR0FBRyxDQUFDLFFBQVcsRUFBRSxPQUFtQyxFQUFFLEVBQUU7Z0JBQ3RFLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQztnQkFDeEIsTUFBTSxHQUFHLGFBQU0sQ0FDYixRQUFRLENBQUMsSUFBSSxDQUFDLDBCQUFjLEVBQUUsQ0FBQyxFQUMvQixJQUFJLGlCQUFVLENBQXdCLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDcEYsQ0FBQyxJQUFJLENBQ0osdUJBQVcsQ0FBQyxDQUFDLENBQUMsQ0FDZixDQUFDO2dCQUVGLE9BQU8sTUFBTSxDQUFDO1lBQ2hCLENBQUMsQ0FBQztZQUVGLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUU7Z0JBQy9CLGNBQWMsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQzthQUNuRSxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUM7SUFDSixDQUFDO0lBeEJlLGtCQUFTLFlBd0J4QixDQUFBO0lBR0Q7Ozs7T0FJRztJQUNILFNBQWdCLE9BQU8sQ0FJckIsY0FBYyxHQUFHLEtBQUs7UUFDdEIsTUFBTSxJQUFJLEdBQUcsSUFBSSxHQUFHLEVBQTZDLENBQUM7UUFFbEUsT0FBTyxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsRUFBRTtZQUMxQixNQUFNLFVBQVUsR0FBRyxDQUFDLFFBQVcsRUFBRSxPQUFtQyxFQUFFLEVBQUU7Z0JBQ3RFLE1BQU0sWUFBWSxHQUFHLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDL0MsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFFeEMsSUFBSSxRQUFRLEVBQUU7b0JBQ1osT0FBTyxRQUFRLENBQUM7aUJBQ2pCO2dCQUVELE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUN6QyxjQUFjLENBQUMsQ0FBQyxDQUFDLHVCQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsaUJBQUssRUFBRSxDQUN6QyxDQUFDO2dCQUNGLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUU1QixPQUFPLEdBQUcsQ0FBQztZQUNiLENBQUMsQ0FBQztZQUVGLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsT0FBTyxFQUFFLE9BQU8sSUFBSSxFQUFFLENBQUMsQ0FBQztRQUMzRCxDQUFDLENBQUM7SUFDSixDQUFDO0lBMUJlLGdCQUFPLFVBMEJ0QixDQUFBO0FBRUgsQ0FBQyxFQXRFZ0IsUUFBUSxHQUFSLGdCQUFRLEtBQVIsZ0JBQVEsUUFzRXhCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgY29uY2F0LCBvZiB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgaWdub3JlRWxlbWVudHMsIHNoYXJlLCBzaGFyZVJlcGxheSB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7IEpzb25WYWx1ZSB9IGZyb20gJy4uLy4uL2pzb24nO1xuaW1wb3J0IHsgSm9iRGVzY3JpcHRpb24sIEpvYkhhbmRsZXIsIEpvYkhhbmRsZXJDb250ZXh0LCBKb2JPdXRib3VuZE1lc3NhZ2UgfSBmcm9tICcuL2FwaSc7XG5cbmNvbnN0IHN0YWJsZVN0cmluZ2lmeSA9IHJlcXVpcmUoJ2Zhc3QtanNvbi1zdGFibGUtc3RyaW5naWZ5Jyk7XG5cbmV4cG9ydCBuYW1lc3BhY2Ugc3RyYXRlZ3kge1xuXG4gIGV4cG9ydCB0eXBlIEpvYlN0cmF0ZWd5PEEgZXh0ZW5kcyBKc29uVmFsdWUsIEkgZXh0ZW5kcyBKc29uVmFsdWUsIE8gZXh0ZW5kcyBKc29uVmFsdWU+ID0gKFxuICAgIGhhbmRsZXI6IEpvYkhhbmRsZXI8QSwgSSwgTz4sXG4gICAgb3B0aW9ucz86IFBhcnRpYWw8UmVhZG9ubHk8Sm9iRGVzY3JpcHRpb24+PixcbiAgKSA9PiBKb2JIYW5kbGVyPEEsIEksIE8+O1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgSm9iU3RyYXRlZ3kgdGhhdCBzZXJpYWxpemVzIGV2ZXJ5IGNhbGwuIFRoaXMgc3RyYXRlZ3kgY2FuIGJlIG1peGVkIGJldHdlZW4gam9icy5cbiAgICovXG4gIGV4cG9ydCBmdW5jdGlvbiBzZXJpYWxpemU8XG4gICAgQSBleHRlbmRzIEpzb25WYWx1ZSA9IEpzb25WYWx1ZSxcbiAgICBJIGV4dGVuZHMgSnNvblZhbHVlID0gSnNvblZhbHVlLFxuICAgIE8gZXh0ZW5kcyBKc29uVmFsdWUgPSBKc29uVmFsdWUsXG4gID4oKTogSm9iU3RyYXRlZ3k8QSwgSSwgTz4ge1xuICAgIGxldCBsYXRlc3Q6IE9ic2VydmFibGU8Sm9iT3V0Ym91bmRNZXNzYWdlPE8+PiA9IG9mKCk7XG5cbiAgICByZXR1cm4gKGhhbmRsZXIsIG9wdGlvbnMpID0+IHtcbiAgICAgIGNvbnN0IG5ld0hhbmRsZXIgPSAoYXJndW1lbnQ6IEEsIGNvbnRleHQ6IEpvYkhhbmRsZXJDb250ZXh0PEEsIEksIE8+KSA9PiB7XG4gICAgICAgIGNvbnN0IHByZXZpb3VzID0gbGF0ZXN0O1xuICAgICAgICBsYXRlc3QgPSBjb25jYXQoXG4gICAgICAgICAgcHJldmlvdXMucGlwZShpZ25vcmVFbGVtZW50cygpKSxcbiAgICAgICAgICBuZXcgT2JzZXJ2YWJsZTxKb2JPdXRib3VuZE1lc3NhZ2U8Tz4+KG8gPT4gaGFuZGxlcihhcmd1bWVudCwgY29udGV4dCkuc3Vic2NyaWJlKG8pKSxcbiAgICAgICAgKS5waXBlKFxuICAgICAgICAgIHNoYXJlUmVwbGF5KDApLFxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiBsYXRlc3Q7XG4gICAgICB9O1xuXG4gICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihuZXdIYW5kbGVyLCB7XG4gICAgICAgIGpvYkRlc2NyaXB0aW9uOiBPYmplY3QuYXNzaWduKHt9LCBoYW5kbGVyLmpvYkRlc2NyaXB0aW9uLCBvcHRpb25zKSxcbiAgICAgIH0pO1xuICAgIH07XG4gIH1cblxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgSm9iU3RyYXRlZ3kgdGhhdCB3aWxsIHJldXNlIGEgcnVubmluZyBqb2IgaWYgdGhlIGFyZ3VtZW50IG1hdGNoZXMuXG4gICAqIEBwYXJhbSByZXBsYXlNZXNzYWdlcyBSZXBsYXkgQUxMIG1lc3NhZ2VzIGlmIGEgam9iIGlzIHJldXNlZCwgb3RoZXJ3aXNlIGp1c3QgaG9vayB1cCB3aGVyZSBpdFxuICAgKiAgICAgICAgaXMuXG4gICAqL1xuICBleHBvcnQgZnVuY3Rpb24gbWVtb2l6ZTxcbiAgICBBIGV4dGVuZHMgSnNvblZhbHVlID0gSnNvblZhbHVlLFxuICAgIEkgZXh0ZW5kcyBKc29uVmFsdWUgPSBKc29uVmFsdWUsXG4gICAgTyBleHRlbmRzIEpzb25WYWx1ZSA9IEpzb25WYWx1ZSxcbiAgPihyZXBsYXlNZXNzYWdlcyA9IGZhbHNlKTogSm9iU3RyYXRlZ3k8QSwgSSwgTz4ge1xuICAgIGNvbnN0IHJ1bnMgPSBuZXcgTWFwPHN0cmluZywgT2JzZXJ2YWJsZTxKb2JPdXRib3VuZE1lc3NhZ2U8Tz4+PigpO1xuXG4gICAgcmV0dXJuIChoYW5kbGVyLCBvcHRpb25zKSA9PiB7XG4gICAgICBjb25zdCBuZXdIYW5kbGVyID0gKGFyZ3VtZW50OiBBLCBjb250ZXh0OiBKb2JIYW5kbGVyQ29udGV4dDxBLCBJLCBPPikgPT4ge1xuICAgICAgICBjb25zdCBhcmd1bWVudEpzb24gPSBzdGFibGVTdHJpbmdpZnkoYXJndW1lbnQpO1xuICAgICAgICBjb25zdCBtYXliZUpvYiA9IHJ1bnMuZ2V0KGFyZ3VtZW50SnNvbik7XG5cbiAgICAgICAgaWYgKG1heWJlSm9iKSB7XG4gICAgICAgICAgcmV0dXJuIG1heWJlSm9iO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcnVuID0gaGFuZGxlcihhcmd1bWVudCwgY29udGV4dCkucGlwZShcbiAgICAgICAgICByZXBsYXlNZXNzYWdlcyA/IHNoYXJlUmVwbGF5KCkgOiBzaGFyZSgpLFxuICAgICAgICApO1xuICAgICAgICBydW5zLnNldChhcmd1bWVudEpzb24sIHJ1bik7XG5cbiAgICAgICAgcmV0dXJuIHJ1bjtcbiAgICAgIH07XG5cbiAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKG5ld0hhbmRsZXIsIGhhbmRsZXIsIG9wdGlvbnMgfHwge30pO1xuICAgIH07XG4gIH1cblxufVxuIl19