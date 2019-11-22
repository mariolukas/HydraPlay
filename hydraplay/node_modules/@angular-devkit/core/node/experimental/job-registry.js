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
const src_1 = require("../../src");
const resolve_1 = require("../resolve");
class NodeModuleJobRegistry {
    constructor(_resolveLocal = true, _resolveGlobal = false) {
        this._resolveLocal = _resolveLocal;
        this._resolveGlobal = _resolveGlobal;
    }
    _resolve(name) {
        try {
            return resolve_1.resolve(name, {
                checkLocal: this._resolveLocal,
                checkGlobal: this._resolveGlobal,
                basedir: __dirname,
            });
        }
        catch (e) {
            if (e instanceof resolve_1.ModuleNotFoundException) {
                return null;
            }
            throw e;
        }
    }
    /**
     * Get a job description for a named job.
     *
     * @param name The name of the job.
     * @returns A description, or null if the job is not registered.
     */
    get(name) {
        const [moduleName, exportName] = name.split(/#/, 2);
        const resolvedPath = this._resolve(moduleName);
        if (!resolvedPath) {
            return rxjs_1.of(null);
        }
        const pkg = require(resolvedPath);
        const handler = pkg[exportName || 'default'];
        if (!handler) {
            return rxjs_1.of(null);
        }
        // TODO: this should be unknown
        // tslint:disable-next-line:no-any
        function _getValue(...fields) {
            return fields.find(x => src_1.schema.isJsonSchema(x)) || true;
        }
        const argument = _getValue(pkg.argument, handler.argument);
        const input = _getValue(pkg.input, handler.input);
        const output = _getValue(pkg.output, handler.output);
        const channels = _getValue(pkg.channels, handler.channels);
        return rxjs_1.of(Object.assign(handler.bind(undefined), {
            jobDescription: {
                argument,
                input,
                output,
                channels,
            },
        }));
    }
}
exports.NodeModuleJobRegistry = NodeModuleJobRegistry;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiam9iLXJlZ2lzdHJ5LmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9hbmd1bGFyX2RldmtpdC9jb3JlL25vZGUvZXhwZXJpbWVudGFsL2pvYi1yZWdpc3RyeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7R0FNRztBQUNILCtCQUFzQztBQUN0QyxtQ0FBaUY7QUFDakYsd0NBQThEO0FBRTlELE1BQWEscUJBQXFCO0lBTWhDLFlBQTJCLGdCQUFnQixJQUFJLEVBQVUsaUJBQWlCLEtBQUs7UUFBcEQsa0JBQWEsR0FBYixhQUFhLENBQU87UUFBVSxtQkFBYyxHQUFkLGNBQWMsQ0FBUTtJQUMvRSxDQUFDO0lBRVMsUUFBUSxDQUFDLElBQVk7UUFDN0IsSUFBSTtZQUNGLE9BQU8saUJBQU8sQ0FBQyxJQUFJLEVBQUU7Z0JBQ25CLFVBQVUsRUFBRSxJQUFJLENBQUMsYUFBYTtnQkFDOUIsV0FBVyxFQUFFLElBQUksQ0FBQyxjQUFjO2dCQUNoQyxPQUFPLEVBQUUsU0FBUzthQUNuQixDQUFDLENBQUM7U0FDSjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1YsSUFBSSxDQUFDLFlBQVksaUNBQXVCLEVBQUU7Z0JBQ3hDLE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFDRCxNQUFNLENBQUMsQ0FBQztTQUNUO0lBQ0gsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsR0FBRyxDQUlELElBQW9DO1FBRXBDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFcEQsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUMvQyxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQ2pCLE9BQU8sU0FBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ2pCO1FBRUQsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ2xDLE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQyxVQUFVLElBQUksU0FBUyxDQUFDLENBQUM7UUFDN0MsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNaLE9BQU8sU0FBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ2pCO1FBRUQsK0JBQStCO1FBQy9CLGtDQUFrQztRQUNsQyxTQUFTLFNBQVMsQ0FBQyxHQUFHLE1BQWE7WUFDakMsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsWUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQztRQUMxRCxDQUFDO1FBRUQsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzNELE1BQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNsRCxNQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDckQsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRTNELE9BQU8sU0FBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUMvQyxjQUFjLEVBQUU7Z0JBQ2QsUUFBUTtnQkFDUixLQUFLO2dCQUNMLE1BQU07Z0JBQ04sUUFBUTthQUNUO1NBQ0YsQ0FBQyxDQUFDLENBQUM7SUFDTixDQUFDO0NBQ0Y7QUFyRUQsc0RBcUVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgb2YgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IEpzb25WYWx1ZSwgZXhwZXJpbWVudGFsIGFzIGNvcmVfZXhwZXJpbWVudGFsLCBzY2hlbWEgfSBmcm9tICcuLi8uLi9zcmMnO1xuaW1wb3J0IHsgTW9kdWxlTm90Rm91bmRFeGNlcHRpb24sIHJlc29sdmUgfSBmcm9tICcuLi9yZXNvbHZlJztcblxuZXhwb3J0IGNsYXNzIE5vZGVNb2R1bGVKb2JSZWdpc3RyeTxNaW5pbXVtQXJndW1lbnRWYWx1ZVQgZXh0ZW5kcyBKc29uVmFsdWUgPSBKc29uVmFsdWUsXG4gIE1pbmltdW1JbnB1dFZhbHVlVCBleHRlbmRzIEpzb25WYWx1ZSA9IEpzb25WYWx1ZSxcbiAgTWluaW11bU91dHB1dFZhbHVlVCBleHRlbmRzIEpzb25WYWx1ZSA9IEpzb25WYWx1ZSxcbj4gaW1wbGVtZW50cyBjb3JlX2V4cGVyaW1lbnRhbC5qb2JzLlJlZ2lzdHJ5PE1pbmltdW1Bcmd1bWVudFZhbHVlVCxcbiAgTWluaW11bUlucHV0VmFsdWVULFxuICBNaW5pbXVtT3V0cHV0VmFsdWVUPiB7XG4gIHB1YmxpYyBjb25zdHJ1Y3Rvcihwcml2YXRlIF9yZXNvbHZlTG9jYWwgPSB0cnVlLCBwcml2YXRlIF9yZXNvbHZlR2xvYmFsID0gZmFsc2UpIHtcbiAgfVxuXG4gIHByb3RlY3RlZCBfcmVzb2x2ZShuYW1lOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHJlc29sdmUobmFtZSwge1xuICAgICAgICBjaGVja0xvY2FsOiB0aGlzLl9yZXNvbHZlTG9jYWwsXG4gICAgICAgIGNoZWNrR2xvYmFsOiB0aGlzLl9yZXNvbHZlR2xvYmFsLFxuICAgICAgICBiYXNlZGlyOiBfX2Rpcm5hbWUsXG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoZSBpbnN0YW5jZW9mIE1vZHVsZU5vdEZvdW5kRXhjZXB0aW9uKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgam9iIGRlc2NyaXB0aW9uIGZvciBhIG5hbWVkIGpvYi5cbiAgICpcbiAgICogQHBhcmFtIG5hbWUgVGhlIG5hbWUgb2YgdGhlIGpvYi5cbiAgICogQHJldHVybnMgQSBkZXNjcmlwdGlvbiwgb3IgbnVsbCBpZiB0aGUgam9iIGlzIG5vdCByZWdpc3RlcmVkLlxuICAgKi9cbiAgZ2V0PEEgZXh0ZW5kcyBNaW5pbXVtQXJndW1lbnRWYWx1ZVQsXG4gICAgSSBleHRlbmRzIE1pbmltdW1JbnB1dFZhbHVlVCxcbiAgICBPIGV4dGVuZHMgTWluaW11bU91dHB1dFZhbHVlVCxcbiAgICA+KFxuICAgIG5hbWU6IGNvcmVfZXhwZXJpbWVudGFsLmpvYnMuSm9iTmFtZSxcbiAgKTogT2JzZXJ2YWJsZTxjb3JlX2V4cGVyaW1lbnRhbC5qb2JzLkpvYkhhbmRsZXI8QSwgSSwgTz4gfCBudWxsPiB7XG4gICAgY29uc3QgW21vZHVsZU5hbWUsIGV4cG9ydE5hbWVdID0gbmFtZS5zcGxpdCgvIy8sIDIpO1xuXG4gICAgY29uc3QgcmVzb2x2ZWRQYXRoID0gdGhpcy5fcmVzb2x2ZShtb2R1bGVOYW1lKTtcbiAgICBpZiAoIXJlc29sdmVkUGF0aCkge1xuICAgICAgcmV0dXJuIG9mKG51bGwpO1xuICAgIH1cblxuICAgIGNvbnN0IHBrZyA9IHJlcXVpcmUocmVzb2x2ZWRQYXRoKTtcbiAgICBjb25zdCBoYW5kbGVyID0gcGtnW2V4cG9ydE5hbWUgfHwgJ2RlZmF1bHQnXTtcbiAgICBpZiAoIWhhbmRsZXIpIHtcbiAgICAgIHJldHVybiBvZihudWxsKTtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiB0aGlzIHNob3VsZCBiZSB1bmtub3duXG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuICAgIGZ1bmN0aW9uIF9nZXRWYWx1ZSguLi5maWVsZHM6IGFueVtdKSB7XG4gICAgICByZXR1cm4gZmllbGRzLmZpbmQoeCA9PiBzY2hlbWEuaXNKc29uU2NoZW1hKHgpKSB8fCB0cnVlO1xuICAgIH1cblxuICAgIGNvbnN0IGFyZ3VtZW50ID0gX2dldFZhbHVlKHBrZy5hcmd1bWVudCwgaGFuZGxlci5hcmd1bWVudCk7XG4gICAgY29uc3QgaW5wdXQgPSBfZ2V0VmFsdWUocGtnLmlucHV0LCBoYW5kbGVyLmlucHV0KTtcbiAgICBjb25zdCBvdXRwdXQgPSBfZ2V0VmFsdWUocGtnLm91dHB1dCwgaGFuZGxlci5vdXRwdXQpO1xuICAgIGNvbnN0IGNoYW5uZWxzID0gX2dldFZhbHVlKHBrZy5jaGFubmVscywgaGFuZGxlci5jaGFubmVscyk7XG5cbiAgICByZXR1cm4gb2YoT2JqZWN0LmFzc2lnbihoYW5kbGVyLmJpbmQodW5kZWZpbmVkKSwge1xuICAgICAgam9iRGVzY3JpcHRpb246IHtcbiAgICAgICAgYXJndW1lbnQsXG4gICAgICAgIGlucHV0LFxuICAgICAgICBvdXRwdXQsXG4gICAgICAgIGNoYW5uZWxzLFxuICAgICAgfSxcbiAgICB9KSk7XG4gIH1cbn1cbiJdfQ==