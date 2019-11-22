"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const core_1 = require("@angular-devkit/core");
exports.NodeWatchFileSystem = require('webpack/lib/node/NodeWatchFileSystem');
// NOTE: @types/webpack InputFileSystem is missing some methods
class VirtualFileSystemDecorator {
    constructor(_inputFileSystem, _webpackCompilerHost) {
        this._inputFileSystem = _inputFileSystem;
        this._webpackCompilerHost = _webpackCompilerHost;
    }
    getVirtualFilesPaths() {
        return this._webpackCompilerHost.getNgFactoryPaths();
    }
    stat(path, callback) {
        const result = this._webpackCompilerHost.stat(path);
        if (result) {
            // tslint:disable-next-line:no-any
            callback(null, result);
        }
        else {
            // tslint:disable-next-line:no-any
            callback(new core_1.FileDoesNotExistException(path), undefined);
        }
    }
    readdir(path, callback) {
        // tslint:disable-next-line:no-any
        this._inputFileSystem.readdir(path, callback);
    }
    readFile(path, callback) {
        try {
            // tslint:disable-next-line:no-any
            callback(null, this._webpackCompilerHost.readFileBuffer(path));
        }
        catch (e) {
            // tslint:disable-next-line:no-any
            callback(e, undefined);
        }
    }
    readJson(path, callback) {
        // tslint:disable-next-line:no-any
        this._inputFileSystem.readJson(path, callback);
    }
    readlink(path, callback) {
        this._inputFileSystem.readlink(path, callback);
    }
    statSync(path) {
        const stats = this._webpackCompilerHost.stat(path);
        if (stats === null) {
            throw new core_1.FileDoesNotExistException(path);
        }
        return stats;
    }
    readdirSync(path) {
        // tslint:disable-next-line:no-any
        return this._inputFileSystem.readdirSync(path);
    }
    readFileSync(path) {
        return this._webpackCompilerHost.readFileBuffer(path);
    }
    readJsonSync(path) {
        // tslint:disable-next-line:no-any
        return this._inputFileSystem.readJsonSync(path);
    }
    readlinkSync(path) {
        return this._inputFileSystem.readlinkSync(path);
    }
    purge(changes) {
        if (typeof changes === 'string') {
            this._webpackCompilerHost.invalidate(changes);
        }
        else if (Array.isArray(changes)) {
            changes.forEach((fileName) => this._webpackCompilerHost.invalidate(fileName));
        }
        if (this._inputFileSystem.purge) {
            // tslint:disable-next-line:no-any
            this._inputFileSystem.purge(changes);
        }
    }
}
exports.VirtualFileSystemDecorator = VirtualFileSystemDecorator;
class VirtualWatchFileSystemDecorator extends exports.NodeWatchFileSystem {
    constructor(_virtualInputFileSystem, _replacements) {
        super(_virtualInputFileSystem);
        this._virtualInputFileSystem = _virtualInputFileSystem;
        this._replacements = _replacements;
    }
    watch(files, dirs, missing, startTime, options, callback, // tslint:disable-line:no-any
    callbackUndelayed) {
        const reverseReplacements = new Map();
        const reverseTimestamps = (map) => {
            for (const entry of Array.from(map.entries())) {
                const original = reverseReplacements.get(entry[0]);
                if (original) {
                    map.set(original, entry[1]);
                    map.delete(entry[0]);
                }
            }
            return map;
        };
        const newCallbackUndelayed = (filename, timestamp) => {
            const original = reverseReplacements.get(filename);
            if (original) {
                this._virtualInputFileSystem.purge(original);
                callbackUndelayed(original, timestamp);
            }
            else {
                callbackUndelayed(filename, timestamp);
            }
        };
        const newCallback = (err, filesModified, contextModified, missingModified, fileTimestamps, contextTimestamps) => {
            // Update fileTimestamps with timestamps from virtual files.
            const virtualFilesStats = this._virtualInputFileSystem.getVirtualFilesPaths()
                .map((fileName) => ({
                path: fileName,
                mtime: +this._virtualInputFileSystem.statSync(fileName).mtime,
            }));
            virtualFilesStats.forEach(stats => fileTimestamps.set(stats.path, +stats.mtime));
            callback(err, filesModified.map(value => reverseReplacements.get(value) || value), contextModified.map(value => reverseReplacements.get(value) || value), missingModified.map(value => reverseReplacements.get(value) || value), reverseTimestamps(fileTimestamps), reverseTimestamps(contextTimestamps));
        };
        const mapReplacements = (original) => {
            if (!this._replacements) {
                return original;
            }
            const replacements = this._replacements;
            return original.map(file => {
                if (typeof replacements === 'function') {
                    const replacement = core_1.getSystemPath(replacements(core_1.normalize(file)));
                    if (replacement !== file) {
                        reverseReplacements.set(replacement, file);
                    }
                    return replacement;
                }
                else {
                    const replacement = replacements.get(core_1.normalize(file));
                    if (replacement) {
                        const fullReplacement = core_1.getSystemPath(replacement);
                        reverseReplacements.set(fullReplacement, file);
                        return fullReplacement;
                    }
                    else {
                        return file;
                    }
                }
            });
        };
        const watcher = super.watch(mapReplacements(files), mapReplacements(dirs), mapReplacements(missing), startTime, options, newCallback, newCallbackUndelayed);
        return {
            close: () => watcher.close(),
            pause: () => watcher.pause(),
            getFileTimestamps: () => reverseTimestamps(watcher.getFileTimestamps()),
            getContextTimestamps: () => reverseTimestamps(watcher.getContextTimestamps()),
        };
    }
}
exports.VirtualWatchFileSystemDecorator = VirtualWatchFileSystemDecorator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlydHVhbF9maWxlX3N5c3RlbV9kZWNvcmF0b3IuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL25ndG9vbHMvd2VicGFjay9zcmMvdmlydHVhbF9maWxlX3N5c3RlbV9kZWNvcmF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7O0dBTUc7QUFDSCwrQ0FBaUc7QUFNcEYsUUFBQSxtQkFBbUIsR0FBaUMsT0FBTyxDQUN0RSxzQ0FBc0MsQ0FBQyxDQUFDO0FBRTFDLCtEQUErRDtBQUMvRCxNQUFhLDBCQUEwQjtJQUNyQyxZQUNVLGdCQUFpQyxFQUNqQyxvQkFBeUM7UUFEekMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFpQjtRQUNqQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXFCO0lBQy9DLENBQUM7SUFFTCxvQkFBb0I7UUFDbEIsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztJQUN2RCxDQUFDO0lBRUQsSUFBSSxDQUFDLElBQVksRUFBRSxRQUE0QztRQUM3RCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BELElBQUksTUFBTSxFQUFFO1lBQ1Ysa0NBQWtDO1lBQ2xDLFFBQVEsQ0FBQyxJQUFXLEVBQUUsTUFBTSxDQUFDLENBQUM7U0FDL0I7YUFBTTtZQUNMLGtDQUFrQztZQUNsQyxRQUFRLENBQUMsSUFBSSxnQ0FBeUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxTQUFnQixDQUFDLENBQUM7U0FDakU7SUFDSCxDQUFDO0lBRUQsT0FBTyxDQUFDLElBQVksRUFBRSxRQUE0QjtRQUNoRCxrQ0FBa0M7UUFDakMsSUFBSSxDQUFDLGdCQUF3QixDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDekQsQ0FBQztJQUVELFFBQVEsQ0FBQyxJQUFZLEVBQUUsUUFBZ0Q7UUFDckUsSUFBSTtZ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QUcsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7cUJBQzVDO29CQUVELE9BQU8sV0FBVyxDQUFDO2lCQUNwQjtxQkFBTTtvQkFDTCxNQUFNLFdBQVcsR0FBRyxZQUFZLENBQUMsR0FBRyxDQUFDLGdCQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDdEQsSUFBSSxXQUFXLEVBQUU7d0JBQ2YsTUFBTSxlQUFlLEdBQUcsb0JBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQzt3QkFDbkQsbUJBQW1CLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsQ0FBQzt3QkFFL0MsT0FBTyxlQUFlLENBQUM7cUJBQ3hCO3lCQUFNO3dCQUNMLE9BQU8sSUFBSSxDQUFDO3FCQUNiO2lCQUNGO1lBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUM7UUFFRixNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsS0FBSyxDQUN6QixlQUFlLENBQUMsS0FBSyxDQUFDLEVBQ3RCLGVBQWUsQ0FBQyxJQUFJLENBQUMsRUFDckIsZUFBZSxDQUFDLE9BQU8sQ0FBQyxFQUN4QixTQUFTLEVBQ1QsT0FBTyxFQUNQLFdBQVcsRUFDWCxvQkFBb0IsQ0FDckIsQ0FBQztRQUVGLE9BQU87WUFDTCxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRTtZQUM1QixLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRTtZQUM1QixpQkFBaUIsRUFBRSxHQUFHLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUN2RSxvQkFBb0IsRUFBRSxHQUFHLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztTQUM5RSxDQUFDO0lBQ0osQ0FBQztDQUNGO0FBOUdELDBFQThHQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7IEZpbGVEb2VzTm90RXhpc3RFeGNlcHRpb24sIFBhdGgsIGdldFN5c3RlbVBhdGgsIG5vcm1hbGl6ZSB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9jb3JlJztcbmltcG9ydCB7IFN0YXRzIH0gZnJvbSAnZnMnO1xuaW1wb3J0IHsgSW5wdXRGaWxlU3lzdGVtIH0gZnJvbSAnd2VicGFjayc7XG5pbXBvcnQgeyBXZWJwYWNrQ29tcGlsZXJIb3N0IH0gZnJvbSAnLi9jb21waWxlcl9ob3N0JztcbmltcG9ydCB7IENhbGxiYWNrLCBOb2RlV2F0Y2hGaWxlU3lzdGVtSW50ZXJmYWNlIH0gZnJvbSAnLi93ZWJwYWNrJztcblxuZXhwb3J0IGNvbnN0IE5vZGVXYXRjaEZpbGVTeXN0ZW06IE5vZGVXYXRjaEZpbGVTeXN0ZW1JbnRlcmZhY2UgPSByZXF1aXJlKFxuICAnd2VicGFjay9saWIvbm9kZS9Ob2RlV2F0Y2hGaWxlU3lzdGVtJyk7XG5cbi8vIE5PVEU6IEB0eXBlcy93ZWJwYWNrIElucHV0RmlsZVN5c3RlbSBpcyBtaXNzaW5nIHNvbWUgbWV0aG9kc1xuZXhwb3J0IGNsYXNzIFZpcnR1YWxGaWxlU3lzdGVtRGVjb3JhdG9yIGltcGxlbWVudHMgSW5wdXRGaWxlU3lzdGVtIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBfaW5wdXRGaWxlU3lzdGVtOiBJbnB1dEZpbGVTeXN0ZW0sXG4gICAgcHJpdmF0ZSBfd2VicGFja0NvbXBpbGVySG9zdDogV2VicGFja0NvbXBpbGVySG9zdCxcbiAgKSB7IH1cblxuICBnZXRWaXJ0dWFsRmlsZXNQYXRocygpIHtcbiAgICByZXR1cm4gdGhpcy5fd2VicGFja0NvbXBpbGVySG9zdC5nZXROZ0ZhY3RvcnlQYXRocygpO1xuICB9XG5cbiAgc3RhdChwYXRoOiBzdHJpbmcsIGNhbGxiYWNrOiAoZXJyOiBFcnJvciwgc3RhdHM6IFN0YXRzKSA9PiB2b2lkKTogdm9pZCB7XG4gICAgY29uc3QgcmVzdWx0ID0gdGhpcy5fd2VicGFja0NvbXBpbGVySG9zdC5zdGF0KHBhdGgpO1xuICAgIGlmIChyZXN1bHQpIHtcbiAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgICAgIGNhbGxiYWNrKG51bGwgYXMgYW55LCByZXN1bHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gICAgICBjYWxsYmFjayhuZXcgRmlsZURvZXNOb3RFeGlzdEV4Y2VwdGlvbihwYXRoKSwgdW5kZWZpbmVkIGFzIGFueSk7XG4gICAgfVxuICB9XG5cbiAgcmVhZGRpcihwYXRoOiBzdHJpbmcsIGNhbGxiYWNrOiBDYWxsYmFjazxzdHJpbmdbXT4pOiB2b2lkIHtcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gICAgKHRoaXMuX2lucHV0RmlsZVN5c3RlbSBhcyBhbnkpLnJlYWRkaXIocGF0aCwgY2FsbGJhY2spO1xuICB9XG5cbiAgcmVhZEZpbGUocGF0aDogc3RyaW5nLCBjYWxsYmFjazogKGVycjogRXJyb3IsIGNvbnRlbnRzOiBCdWZmZXIpID0+IHZvaWQpOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuICAgICAgY2FsbGJhY2sobnVsbCBhcyBhbnksIHRoaXMuX3dlYnBhY2tDb21waWxlckhvc3QucmVhZEZpbGVCdWZmZXIocGF0aCkpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgICAgIGNhbGxiYWNrKGUsIHVuZGVmaW5lZCBhcyBhbnkpO1xuICAgIH1cbiAgfVxuXG4gIHJlYWRKc29uKHBhdGg6IHN0cmluZywgY2FsbGJhY2s6IENhbGxiYWNrPHt9Pik6IHZvaWQge1xuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgICAodGhpcy5faW5wdXRGaWxlU3lzdGVtIGFzIGFueSkucmVhZEpzb24ocGF0aCwgY2FsbGJhY2spO1xuICB9XG5cbiAgcmVhZGxpbmsocGF0aDogc3RyaW5nLCBjYWxsYmFjazogKGVycjogRXJyb3IsIGxpbmtTdHJpbmc6IHN0cmluZykgPT4gdm9pZCk6IHZvaWQge1xuICAgIHRoaXMuX2lucHV0RmlsZVN5c3RlbS5yZWFkbGluayhwYXRoLCBjYWxsYmFjayk7XG4gIH1cblxuICBzdGF0U3luYyhwYXRoOiBzdHJpbmcpOiBTdGF0cyB7XG4gICAgY29uc3Qgc3RhdHMgPSB0aGlzLl93ZWJwYWNrQ29tcGlsZXJIb3N0LnN0YXQocGF0aCk7XG4gICAgaWYgKHN0YXRzID09PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRmlsZURvZXNOb3RFeGlzdEV4Y2VwdGlvbihwYXRoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc3RhdHM7XG4gIH1cblxuICByZWFkZGlyU3luYyhwYXRoOiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuICAgIHJldHVybiAodGhpcy5faW5wdXRGaWxlU3lzdGVtIGFzIGFueSkucmVhZGRpclN5bmMocGF0aCk7XG4gIH1cblxuICByZWFkRmlsZVN5bmMocGF0aDogc3RyaW5nKTogQnVmZmVyIHtcbiAgICByZXR1cm4gdGhpcy5fd2VicGFja0NvbXBpbGVySG9zdC5yZWFkRmlsZUJ1ZmZlcihwYXRoKTtcbiAgfVxuXG4gIHJlYWRKc29uU3luYyhwYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgICByZXR1cm4gKHRoaXMuX2lucHV0RmlsZVN5c3RlbSBhcyBhbnkpLnJlYWRKc29uU3luYyhwYXRoKTtcbiAgfVxuXG4gIHJlYWRsaW5rU3luYyhwYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9pbnB1dEZpbGVTeXN0ZW0ucmVhZGxpbmtTeW5jKHBhdGgpO1xuICB9XG5cbiAgcHVyZ2UoY2hhbmdlcz86IHN0cmluZ1tdIHwgc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKHR5cGVvZiBjaGFuZ2VzID09PSAnc3RyaW5nJykge1xuICAgICAgdGhpcy5fd2VicGFja0NvbXBpbGVySG9zdC5pbnZhbGlkYXRlKGNoYW5nZXMpO1xuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShjaGFuZ2VzKSkge1xuICAgICAgY2hhbmdlcy5mb3JFYWNoKChmaWxlTmFtZTogc3RyaW5nKSA9PiB0aGlzLl93ZWJwYWNrQ29tcGlsZXJIb3N0LmludmFsaWRhdGUoZmlsZU5hbWUpKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2lucHV0RmlsZVN5c3RlbS5wdXJnZSkge1xuICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuICAgICAgKHRoaXMuX2lucHV0RmlsZVN5c3RlbSBhcyBhbnkpLnB1cmdlKGNoYW5nZXMpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgVmlydHVhbFdhdGNoRmlsZVN5c3RlbURlY29yYXRvciBleHRlbmRzIE5vZGVXYXRjaEZpbGVTeXN0ZW0ge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIF92aXJ0dWFsSW5wdXRGaWxlU3lzdGVtOiBWaXJ0dWFsRmlsZVN5c3RlbURlY29yYXRvcixcbiAgICBwcml2YXRlIF9yZXBsYWNlbWVudHM/OiBNYXA8UGF0aCwgUGF0aD4gfCAoKHBhdGg6IFBhdGgpID0+IFBhdGgpLFxuICApIHtcbiAgICBzdXBlcihfdmlydHVhbElucHV0RmlsZVN5c3RlbSk7XG4gIH1cblxuICB3YXRjaChcbiAgICBmaWxlczogc3RyaW5nW10sXG4gICAgZGlyczogc3RyaW5nW10sXG4gICAgbWlzc2luZzogc3RyaW5nW10sXG4gICAgc3RhcnRUaW1lOiBudW1iZXIgfCB1bmRlZmluZWQsXG4gICAgb3B0aW9uczoge30sXG4gICAgY2FsbGJhY2s6IGFueSwgIC8vIHRzbGludDpkaXNhYmxlLWxpbmU6bm8tYW55XG4gICAgY2FsbGJhY2tVbmRlbGF5ZWQ6IChmaWxlbmFtZTogc3RyaW5nLCB0aW1lc3RhbXA6IG51bWJlcikgPT4gdm9pZCxcbiAgKSB7XG4gICAgY29uc3QgcmV2ZXJzZVJlcGxhY2VtZW50cyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG4gICAgY29uc3QgcmV2ZXJzZVRpbWVzdGFtcHMgPSAobWFwOiBNYXA8c3RyaW5nLCBudW1iZXI+KSA9PiB7XG4gICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIEFycmF5LmZyb20obWFwLmVudHJpZXMoKSkpIHtcbiAgICAgICAgY29uc3Qgb3JpZ2luYWwgPSByZXZlcnNlUmVwbGFjZW1lbnRzLmdldChlbnRyeVswXSk7XG4gICAgICAgIGlmIChvcmlnaW5hbCkge1xuICAgICAgICAgIG1hcC5zZXQob3JpZ2luYWwsIGVudHJ5WzFdKTtcbiAgICAgICAgICBtYXAuZGVsZXRlKGVudHJ5WzBdKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gbWFwO1xuICAgIH07XG5cbiAgICBjb25zdCBuZXdDYWxsYmFja1VuZGVsYXllZCA9IChmaWxlbmFtZTogc3RyaW5nLCB0aW1lc3RhbXA6IG51bWJlcikgPT4ge1xuICAgICAgY29uc3Qgb3JpZ2luYWwgPSByZXZlcnNlUmVwbGFjZW1lbnRzLmdldChmaWxlbmFtZSk7XG4gICAgICBpZiAob3JpZ2luYWwpIHtcbiAgICAgICAgdGhpcy5fdmlydHVhbElucHV0RmlsZVN5c3RlbS5wdXJnZShvcmlnaW5hbCk7XG4gICAgICAgIGNhbGxiYWNrVW5kZWxheWVkKG9yaWdpbmFsLCB0aW1lc3RhbXApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2FsbGJhY2tVbmRlbGF5ZWQoZmlsZW5hbWUsIHRpbWVzdGFtcCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0IG5ld0NhbGxiYWNrID0gKFxuICAgICAgZXJyOiBFcnJvciB8IG51bGwsXG4gICAgICBmaWxlc01vZGlmaWVkOiBzdHJpbmdbXSxcbiAgICAgIGNvbnRleHRNb2RpZmllZDogc3RyaW5nW10sXG4gICAgICBtaXNzaW5nTW9kaWZpZWQ6IHN0cmluZ1tdLFxuICAgICAgZmlsZVRpbWVzdGFtcHM6IE1hcDxzdHJpbmcsIG51bWJlcj4sXG4gICAgICBjb250ZXh0VGltZXN0YW1wczogTWFwPHN0cmluZywgbnVtYmVyPixcbiAgICApID0+IHtcbiAgICAgIC8vIFVwZGF0ZSBmaWxlVGltZXN0YW1wcyB3aXRoIHRpbWVzdGFtcHMgZnJvbSB2aXJ0dWFsIGZpbGVzLlxuICAgICAgY29uc3QgdmlydHVhbEZpbGVzU3RhdHMgPSB0aGlzLl92aXJ0dWFsSW5wdXRGaWxlU3lzdGVtLmdldFZpcnR1YWxGaWxlc1BhdGhzKClcbiAgICAgICAgLm1hcCgoZmlsZU5hbWUpID0+ICh7XG4gICAgICAgICAgcGF0aDogZmlsZU5hbWUsXG4gICAgICAgICAgbXRpbWU6ICt0aGlzLl92aXJ0dWFsSW5wdXRGaWxlU3lzdGVtLnN0YXRTeW5jKGZpbGVOYW1lKS5tdGltZSxcbiAgICAgICAgfSkpO1xuICAgICAgdmlydHVhbEZpbGVzU3RhdHMuZm9yRWFjaChzdGF0cyA9PiBmaWxlVGltZXN0YW1wcy5zZXQoc3RhdHMucGF0aCwgK3N0YXRzLm10aW1lKSk7XG4gICAgICBjYWxsYmFjayhcbiAgICAgICAgZXJyLFxuICAgICAgICBmaWxlc01vZGlmaWVkLm1hcCh2YWx1ZSA9PiByZXZlcnNlUmVwbGFjZW1lbnRzLmdldCh2YWx1ZSkgfHwgdmFsdWUpLFxuICAgICAgICBjb250ZXh0TW9kaWZpZWQubWFwKHZhbHVlID0+IHJldmVyc2VSZXBsYWNlbWVudHMuZ2V0KHZhbHVlKSB8fCB2YWx1ZSksXG4gICAgICAgIG1pc3NpbmdNb2RpZmllZC5tYXAodmFsdWUgPT4gcmV2ZXJzZVJlcGxhY2VtZW50cy5nZXQodmFsdWUpIHx8IHZhbHVlKSxcbiAgICAgICAgcmV2ZXJzZVRpbWVzdGFtcHMoZmlsZVRpbWVzdGFtcHMpLFxuICAgICAgICByZXZlcnNlVGltZXN0YW1wcyhjb250ZXh0VGltZXN0YW1wcyksXG4gICAgICApO1xuICAgIH07XG5cbiAgICBjb25zdCBtYXBSZXBsYWNlbWVudHMgPSAob3JpZ2luYWw6IHN0cmluZ1tdKTogc3RyaW5nW10gPT4ge1xuICAgICAgaWYgKCF0aGlzLl9yZXBsYWNlbWVudHMpIHtcbiAgICAgICAgcmV0dXJuIG9yaWdpbmFsO1xuICAgICAgfVxuICAgICAgY29uc3QgcmVwbGFjZW1lbnRzID0gdGhpcy5fcmVwbGFjZW1lbnRzO1xuXG4gICAgICByZXR1cm4gb3JpZ2luYWwubWFwKGZpbGUgPT4ge1xuICAgICAgICBpZiAodHlwZW9mIHJlcGxhY2VtZW50cyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGNvbnN0IHJlcGxhY2VtZW50ID0gZ2V0U3lzdGVtUGF0aChyZXBsYWNlbWVudHMobm9ybWFsaXplKGZpbGUpKSk7XG4gICAgICAgICAgaWYgKHJlcGxhY2VtZW50ICE9PSBmaWxlKSB7XG4gICAgICAgICAgICByZXZlcnNlUmVwbGFjZW1lbnRzLnNldChyZXBsYWNlbWVudCwgZmlsZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHJlcGxhY2VtZW50O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IHJlcGxhY2VtZW50ID0gcmVwbGFjZW1lbnRzLmdldChub3JtYWxpemUoZmlsZSkpO1xuICAgICAgICAgIGlmIChyZXBsYWNlbWVudCkge1xuICAgICAgICAgICAgY29uc3QgZnVsbFJlcGxhY2VtZW50ID0gZ2V0U3lzdGVtUGF0aChyZXBsYWNlbWVudCk7XG4gICAgICAgICAgICByZXZlcnNlUmVwbGFjZW1lbnRzLnNldChmdWxsUmVwbGFjZW1lbnQsIGZpbGUpO1xuXG4gICAgICAgICAgICByZXR1cm4gZnVsbFJlcGxhY2VtZW50O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmlsZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBjb25zdCB3YXRjaGVyID0gc3VwZXIud2F0Y2goXG4gICAgICBtYXBSZXBsYWNlbWVudHMoZmlsZXMpLFxuICAgICAgbWFwUmVwbGFjZW1lbnRzKGRpcnMpLFxuICAgICAgbWFwUmVwbGFjZW1lbnRzKG1pc3NpbmcpLFxuICAgICAgc3RhcnRUaW1lLFxuICAgICAgb3B0aW9ucyxcbiAgICAgIG5ld0NhbGxiYWNrLFxuICAgICAgbmV3Q2FsbGJhY2tVbmRlbGF5ZWQsXG4gICAgKTtcblxuICAgIHJldHVybiB7XG4gICAgICBjbG9zZTogKCkgPT4gd2F0Y2hlci5jbG9zZSgpLFxuICAgICAgcGF1c2U6ICgpID0+IHdhdGNoZXIucGF1c2UoKSxcbiAgICAgIGdldEZpbGVUaW1lc3RhbXBzOiAoKSA9PiByZXZlcnNlVGltZXN0YW1wcyh3YXRjaGVyLmdldEZpbGVUaW1lc3RhbXBzKCkpLFxuICAgICAgZ2V0Q29udGV4dFRpbWVzdGFtcHM6ICgpID0+IHJldmVyc2VUaW1lc3RhbXBzKHdhdGNoZXIuZ2V0Q29udGV4dFRpbWVzdGFtcHMoKSksXG4gICAgfTtcbiAgfVxufVxuIl19