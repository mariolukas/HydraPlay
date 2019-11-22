"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const utils_1 = require("../../utils");
const interface_1 = require("../interface");
// TODO: this should be unknown
// tslint:disable-next-line:no-any
function isJsonSchema(value) {
    return interface_1.isJsonObject(value) || value === false || value === true;
}
exports.isJsonSchema = isJsonSchema;
/**
 * Return a schema that is the merge of all subschemas, ie. it should validate all the schemas
 * that were passed in. It is possible to make an invalid schema this way, e.g. by using
 * `mergeSchemas({ type: 'number' }, { type: 'string' })`, which will never validate.
 * @param schemas All schemas to be merged.
 */
function mergeSchemas(...schemas) {
    return utils_1.clean(schemas).reduce((prev, curr) => {
        if (prev === false || curr === false) {
            return false;
        }
        else if (prev === true) {
            return curr;
        }
        else if (curr === true) {
            return prev;
        }
        else if (Array.isArray(prev.allOf)) {
            if (Array.isArray(curr.allOf)) {
                return Object.assign({}, prev, { allOf: [...prev.allOf, ...curr.allOf] });
            }
            else {
                return Object.assign({}, prev, { allOf: [...prev.allOf, curr] });
            }
        }
        else if (Array.isArray(curr.allOf)) {
            return Object.assign({}, prev, { allOf: [prev, ...curr.allOf] });
        }
        else {
            return Object.assign({}, prev, { allOf: [prev, curr] });
        }
    }, true);
}
exports.mergeSchemas = mergeSchemas;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NoZW1hLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9hbmd1bGFyX2RldmtpdC9jb3JlL3NyYy9qc29uL3NjaGVtYS9zY2hlbWEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7O0dBTUc7QUFDSCx1Q0FBb0M7QUFDcEMsNENBQXdEO0FBVXhELCtCQUErQjtBQUMvQixrQ0FBa0M7QUFDbEMsU0FBZ0IsWUFBWSxDQUFDLEtBQVU7SUFDckMsT0FBTyx3QkFBWSxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssS0FBSyxLQUFLLElBQUksS0FBSyxLQUFLLElBQUksQ0FBQztBQUNsRSxDQUFDO0FBRkQsb0NBRUM7QUFFRDs7Ozs7R0FLRztBQUNILFNBQWdCLFlBQVksQ0FBQyxHQUFHLE9BQW1DO0lBQ2pFLE9BQU8sYUFBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsRUFBRTtRQUMxQyxJQUFJLElBQUksS0FBSyxLQUFLLElBQUksSUFBSSxLQUFLLEtBQUssRUFBRTtZQUNwQyxPQUFPLEtBQUssQ0FBQztTQUNkO2FBQU0sSUFBSSxJQUFJLEtBQUssSUFBSSxFQUFFO1lBQ3hCLE9BQU8sSUFBSSxDQUFDO1NBQ2I7YUFBTSxJQUFJLElBQUksS0FBSyxJQUFJLEVBQUU7WUFDeEIsT0FBTyxJQUFJLENBQUM7U0FDYjthQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDcEMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDN0IseUJBQVksSUFBSSxJQUFFLEtBQUssRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBRzthQUMzRDtpQkFBTTtnQkFDTCx5QkFBWSxJQUFJLElBQUUsS0FBSyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxJQUFHO2FBQ2xEO1NBQ0Y7YUFBTSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ3BDLHlCQUFZLElBQUksSUFBRSxLQUFLLEVBQUUsQ0FBQyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUc7U0FDbEQ7YUFBTTtZQUNMLHlCQUFZLElBQUksSUFBRSxLQUFLLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUc7U0FDekM7SUFDSCxDQUFDLEVBQUUsSUFBa0IsQ0FBQyxDQUFDO0FBQ3pCLENBQUM7QUFwQkQsb0NBb0JDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHsgY2xlYW4gfSBmcm9tICcuLi8uLi91dGlscyc7XG5pbXBvcnQgeyBKc29uT2JqZWN0LCBpc0pzb25PYmplY3QgfSBmcm9tICcuLi9pbnRlcmZhY2UnO1xuXG4vKipcbiAqIEEgc3BlY2lhbGl6ZWQgaW50ZXJmYWNlIGZvciBKc29uU2NoZW1hICh0byBjb21lKS4gSnNvblNjaGVtYXMgYXJlIGFsc28gSnNvbk9iamVjdC5cbiAqXG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCB0eXBlIEpzb25TY2hlbWEgPSBKc29uT2JqZWN0IHwgYm9vbGVhbjtcblxuXG4vLyBUT0RPOiB0aGlzIHNob3VsZCBiZSB1bmtub3duXG4vLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG5leHBvcnQgZnVuY3Rpb24gaXNKc29uU2NoZW1hKHZhbHVlOiBhbnkpOiB2YWx1ZSBpcyBKc29uU2NoZW1hIHtcbiAgcmV0dXJuIGlzSnNvbk9iamVjdCh2YWx1ZSkgfHwgdmFsdWUgPT09IGZhbHNlIHx8IHZhbHVlID09PSB0cnVlO1xufVxuXG4vKipcbiAqIFJldHVybiBhIHNjaGVtYSB0aGF0IGlzIHRoZSBtZXJnZSBvZiBhbGwgc3Vic2NoZW1hcywgaWUuIGl0IHNob3VsZCB2YWxpZGF0ZSBhbGwgdGhlIHNjaGVtYXNcbiAqIHRoYXQgd2VyZSBwYXNzZWQgaW4uIEl0IGlzIHBvc3NpYmxlIHRvIG1ha2UgYW4gaW52YWxpZCBzY2hlbWEgdGhpcyB3YXksIGUuZy4gYnkgdXNpbmdcbiAqIGBtZXJnZVNjaGVtYXMoeyB0eXBlOiAnbnVtYmVyJyB9LCB7IHR5cGU6ICdzdHJpbmcnIH0pYCwgd2hpY2ggd2lsbCBuZXZlciB2YWxpZGF0ZS5cbiAqIEBwYXJhbSBzY2hlbWFzIEFsbCBzY2hlbWFzIHRvIGJlIG1lcmdlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlU2NoZW1hcyguLi5zY2hlbWFzOiAoSnNvblNjaGVtYSB8IHVuZGVmaW5lZClbXSk6IEpzb25TY2hlbWEge1xuICByZXR1cm4gY2xlYW4oc2NoZW1hcykucmVkdWNlKChwcmV2LCBjdXJyKSA9PiB7XG4gICAgaWYgKHByZXYgPT09IGZhbHNlIHx8IGN1cnIgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIGlmIChwcmV2ID09PSB0cnVlKSB7XG4gICAgICByZXR1cm4gY3VycjtcbiAgICB9IGVsc2UgaWYgKGN1cnIgPT09IHRydWUpIHtcbiAgICAgIHJldHVybiBwcmV2O1xuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShwcmV2LmFsbE9mKSkge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoY3Vyci5hbGxPZikpIHtcbiAgICAgICAgcmV0dXJuIHsgLi4ucHJldiwgYWxsT2Y6IFsuLi5wcmV2LmFsbE9mLCAuLi5jdXJyLmFsbE9mXSB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHsgLi4ucHJldiwgYWxsT2Y6IFsuLi5wcmV2LmFsbE9mLCBjdXJyXSB9O1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShjdXJyLmFsbE9mKSkge1xuICAgICAgcmV0dXJuIHsgLi4ucHJldiwgYWxsT2Y6IFtwcmV2LCAuLi5jdXJyLmFsbE9mXSB9O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4geyAuLi5wcmV2LCBhbGxPZjogW3ByZXYsIGN1cnJdIH07XG4gICAgfVxuICB9LCB0cnVlIGFzIEpzb25TY2hlbWEpO1xufVxuIl19