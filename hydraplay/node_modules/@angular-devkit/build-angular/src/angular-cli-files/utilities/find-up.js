"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const fs_1 = require("fs");
const path = require("path");
const is_directory_1 = require("./is-directory");
function findUp(names, from, stopOnNodeModules = false) {
    if (!Array.isArray(names)) {
        names = [names];
    }
    const root = path.parse(from).root;
    let currentDir = from;
    while (currentDir && currentDir !== root) {
        for (const name of names) {
            const p = path.join(currentDir, name);
            if (fs_1.existsSync(p)) {
                return p;
            }
        }
        if (stopOnNodeModules) {
            const nodeModuleP = path.join(currentDir, 'node_modules');
            if (fs_1.existsSync(nodeModuleP)) {
                return null;
            }
        }
        currentDir = path.dirname(currentDir);
    }
    return null;
}
exports.findUp = findUp;
function findAllNodeModules(from, root) {
    const nodeModules = [];
    let current = from;
    while (current && current !== root) {
        const potential = path.join(current, 'node_modules');
        if (fs_1.existsSync(potential) && is_directory_1.isDirectory(potential)) {
            nodeModules.push(potential);
        }
        const next = path.dirname(current);
        if (next === current) {
            break;
        }
        current = next;
    }
    return nodeModules;
}
exports.findAllNodeModules = findAllNodeModules;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmluZC11cC5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsicGFja2FnZXMvYW5ndWxhcl9kZXZraXQvYnVpbGRfYW5ndWxhci9zcmMvYW5ndWxhci1jbGktZmlsZXMvdXRpbGl0aWVzL2ZpbmQtdXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7O0dBTUc7QUFDSCwyQkFBZ0M7QUFDaEMsNkJBQTZCO0FBQzdCLGlEQUE2QztBQUU3QyxTQUFnQixNQUFNLENBQUMsS0FBd0IsRUFBRSxJQUFZLEVBQUUsaUJBQWlCLEdBQUcsS0FBSztJQUN0RixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUN6QixLQUFLLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUNqQjtJQUNELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDO0lBRW5DLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQztJQUN0QixPQUFPLFVBQVUsSUFBSSxVQUFVLEtBQUssSUFBSSxFQUFFO1FBQ3hDLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxFQUFFO1lBQ3hCLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3RDLElBQUksZUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUNqQixPQUFPLENBQUMsQ0FBQzthQUNWO1NBQ0Y7UUFFRCxJQUFJLGlCQUFpQixFQUFFO1lBQ3JCLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQzFELElBQUksZUFBVSxDQUFDLFdBQVcsQ0FBQyxFQUFFO2dCQUMzQixPQUFPLElBQUksQ0FBQzthQUNiO1NBQ0Y7UUFFRCxVQUFVLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztLQUN2QztJQUVELE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQTFCRCx3QkEwQkM7QUFFRCxTQUFnQixrQkFBa0IsQ0FBQyxJQUFZLEVBQUUsSUFBYTtJQUM1RCxNQUFNLFdBQVcsR0FBYSxFQUFFLENBQUM7SUFFakMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDO0lBQ25CLE9BQU8sT0FBTyxJQUFJLE9BQU8sS0FBSyxJQUFJLEVBQUU7UUFDbEMsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDckQsSUFBSSxlQUFVLENBQUMsU0FBUyxDQUFDLElBQUksMEJBQVcsQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUNuRCxXQUFXLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1NBQzdCO1FBRUQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNuQyxJQUFJLElBQUksS0FBSyxPQUFPLEVBQUU7WUFDcEIsTUFBTTtTQUNQO1FBQ0QsT0FBTyxHQUFHLElBQUksQ0FBQztLQUNoQjtJQUVELE9BQU8sV0FBVyxDQUFDO0FBQ3JCLENBQUM7QUFsQkQsZ0RBa0JDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHsgZXhpc3RzU3luYyB9IGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBpc0RpcmVjdG9yeSB9IGZyb20gJy4vaXMtZGlyZWN0b3J5JztcblxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRVcChuYW1lczogc3RyaW5nIHwgc3RyaW5nW10sIGZyb206IHN0cmluZywgc3RvcE9uTm9kZU1vZHVsZXMgPSBmYWxzZSkge1xuICBpZiAoIUFycmF5LmlzQXJyYXkobmFtZXMpKSB7XG4gICAgbmFtZXMgPSBbbmFtZXNdO1xuICB9XG4gIGNvbnN0IHJvb3QgPSBwYXRoLnBhcnNlKGZyb20pLnJvb3Q7XG5cbiAgbGV0IGN1cnJlbnREaXIgPSBmcm9tO1xuICB3aGlsZSAoY3VycmVudERpciAmJiBjdXJyZW50RGlyICE9PSByb290KSB7XG4gICAgZm9yIChjb25zdCBuYW1lIG9mIG5hbWVzKSB7XG4gICAgICBjb25zdCBwID0gcGF0aC5qb2luKGN1cnJlbnREaXIsIG5hbWUpO1xuICAgICAgaWYgKGV4aXN0c1N5bmMocCkpIHtcbiAgICAgICAgcmV0dXJuIHA7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN0b3BPbk5vZGVNb2R1bGVzKSB7XG4gICAgICBjb25zdCBub2RlTW9kdWxlUCA9IHBhdGguam9pbihjdXJyZW50RGlyLCAnbm9kZV9tb2R1bGVzJyk7XG4gICAgICBpZiAoZXhpc3RzU3luYyhub2RlTW9kdWxlUCkpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY3VycmVudERpciA9IHBhdGguZGlybmFtZShjdXJyZW50RGlyKTtcbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmluZEFsbE5vZGVNb2R1bGVzKGZyb206IHN0cmluZywgcm9vdD86IHN0cmluZykge1xuICBjb25zdCBub2RlTW9kdWxlczogc3RyaW5nW10gPSBbXTtcblxuICBsZXQgY3VycmVudCA9IGZyb207XG4gIHdoaWxlIChjdXJyZW50ICYmIGN1cnJlbnQgIT09IHJvb3QpIHtcbiAgICBjb25zdCBwb3RlbnRpYWwgPSBwYXRoLmpvaW4oY3VycmVudCwgJ25vZGVfbW9kdWxlcycpO1xuICAgIGlmIChleGlzdHNTeW5jKHBvdGVudGlhbCkgJiYgaXNEaXJlY3RvcnkocG90ZW50aWFsKSkge1xuICAgICAgbm9kZU1vZHVsZXMucHVzaChwb3RlbnRpYWwpO1xuICAgIH1cblxuICAgIGNvbnN0IG5leHQgPSBwYXRoLmRpcm5hbWUoY3VycmVudCk7XG4gICAgaWYgKG5leHQgPT09IGN1cnJlbnQpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBjdXJyZW50ID0gbmV4dDtcbiAgfVxuXG4gIHJldHVybiBub2RlTW9kdWxlcztcbn1cbiJdfQ==