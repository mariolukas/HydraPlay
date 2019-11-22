"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
/**
 * @deprecated
 */
class TestLogger extends core_1.logging.Logger {
    constructor(name, parent = null) {
        super(name, parent);
        this._latestEntries = [];
        this.subscribe((entry) => this._latestEntries.push(entry));
    }
    clear() {
        this._latestEntries = [];
    }
    includes(message) {
        return this._latestEntries.some((entry) => entry.message.includes(message));
    }
    test(re) {
        return this._latestEntries.some((entry) => re.test(entry.message));
    }
}
exports.TestLogger = TestLogger;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC1sb2dnZXIuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2FuZ3VsYXJfZGV2a2l0L2FyY2hpdGVjdC90ZXN0aW5nL3Rlc3QtbG9nZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7O0FBRUgsK0NBQStDO0FBRy9DOztHQUVHO0FBQ0gsTUFBYSxVQUFXLFNBQVEsY0FBTyxDQUFDLE1BQU07SUFFNUMsWUFBWSxJQUFZLEVBQUUsU0FBZ0MsSUFBSTtRQUM1RCxLQUFLLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRmQsbUJBQWMsR0FBdUIsRUFBRSxDQUFDO1FBRzlDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDN0QsQ0FBQztJQUVELEtBQUs7UUFDSCxJQUFJLENBQUMsY0FBYyxHQUFHLEVBQUUsQ0FBQztJQUMzQixDQUFDO0lBRUQsUUFBUSxDQUFDLE9BQWU7UUFDdEIsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUM5RSxDQUFDO0lBRUQsSUFBSSxDQUFDLEVBQVU7UUFDYixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ3JFLENBQUM7Q0FDRjtBQWxCRCxnQ0FrQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7IGxvZ2dpbmcgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZSc7XG5cblxuLyoqXG4gKiBAZGVwcmVjYXRlZFxuICovXG5leHBvcnQgY2xhc3MgVGVzdExvZ2dlciBleHRlbmRzIGxvZ2dpbmcuTG9nZ2VyIHtcbiAgcHJpdmF0ZSBfbGF0ZXN0RW50cmllczogbG9nZ2luZy5Mb2dFbnRyeVtdID0gW107XG4gIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZywgcGFyZW50OiBsb2dnaW5nLkxvZ2dlciB8IG51bGwgPSBudWxsKSB7XG4gICAgc3VwZXIobmFtZSwgcGFyZW50KTtcbiAgICB0aGlzLnN1YnNjcmliZSgoZW50cnkpID0+IHRoaXMuX2xhdGVzdEVudHJpZXMucHVzaChlbnRyeSkpO1xuICB9XG5cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5fbGF0ZXN0RW50cmllcyA9IFtdO1xuICB9XG5cbiAgaW5jbHVkZXMobWVzc2FnZTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuX2xhdGVzdEVudHJpZXMuc29tZSgoZW50cnkpID0+IGVudHJ5Lm1lc3NhZ2UuaW5jbHVkZXMobWVzc2FnZSkpO1xuICB9XG5cbiAgdGVzdChyZTogUmVnRXhwKSB7XG4gICAgcmV0dXJuIHRoaXMuX2xhdGVzdEVudHJpZXMuc29tZSgoZW50cnkpID0+IHJlLnRlc3QoZW50cnkubWVzc2FnZSkpO1xuICB9XG59XG4iXX0=