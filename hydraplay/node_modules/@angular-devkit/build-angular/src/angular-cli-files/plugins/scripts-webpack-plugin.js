"use strict";
// tslint:disable
// TODO: cleanup this file, it's copied as is from Angular CLI.
Object.defineProperty(exports, "__esModule", { value: true });
const webpack_sources_1 = require("webpack-sources");
const loader_utils_1 = require("loader-utils");
const path = require("path");
const Chunk = require('webpack/lib/Chunk');
const EntryPoint = require('webpack/lib/Entrypoint');
function addDependencies(compilation, scripts) {
    for (const script of scripts) {
        compilation.fileDependencies.add(script);
    }
}
function hook(compiler, action) {
    compiler.hooks.thisCompilation.tap('scripts-webpack-plugin', (compilation) => {
        compilation.hooks.additionalAssets.tapAsync('scripts-webpack-plugin', (callback) => action(compilation, callback));
    });
}
class ScriptsWebpackPlugin {
    constructor(options = {}) {
        this.options = options;
    }
    shouldSkip(compilation, scripts) {
        if (this._lastBuildTime == undefined) {
            this._lastBuildTime = Date.now();
            return false;
        }
        for (let i = 0; i < scripts.length; i++) {
            const scriptTime = compilation.fileTimestamps.get(scripts[i]);
            if (!scriptTime || scriptTime > this._lastBuildTime) {
                this._lastBuildTime = Date.now();
                return false;
            }
        }
        return true;
    }
    _insertOutput(compilation, { filename, source }, cached = false) {
        const chunk = new Chunk(this.options.name);
        chunk.rendered = !cached;
        chunk.id = this.options.name;
        chunk.ids = [chunk.id];
        chunk.files.push(filename);
        const entrypoint = new EntryPoint(this.options.name);
        entrypoint.pushChunk(chunk);
        chunk.addGroup(entrypoint);
        compilation.entrypoints.set(this.options.name, entrypoint);
        compilation.chunks.push(chunk);
        compilation.assets[filename] = source;
    }
    apply(compiler) {
        if (!this.options.scripts || this.options.scripts.length === 0) {
            return;
        }
        const scripts = this.options.scripts
            .filter(script => !!script)
            .map(script => path.resolve(this.options.basePath || '', script));
        hook(compiler, (compilation, callback) => {
            if (this.shouldSkip(compilation, scripts)) {
                if (this._cachedOutput) {
                    this._insertOutput(compilation, this._cachedOutput, true);
                }
                addDependencies(compilation, scripts);
                callback();
                return;
            }
            const sourceGetters = scripts.map(fullPath => {
                return new Promise((resolve, reject) => {
                    compilation.inputFileSystem.readFile(fullPath, (err, data) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        const content = data.toString();
                        let source;
                        if (this.options.sourceMap) {
                            // TODO: Look for source map file (for '.min' scripts, etc.)
                            let adjustedPath = fullPath;
                            if (this.options.basePath) {
                                adjustedPath = path.relative(this.options.basePath, fullPath);
                            }
                            source = new webpack_sources_1.OriginalSource(content, adjustedPath);
                        }
                        else {
                            source = new webpack_sources_1.RawSource(content);
                        }
                        resolve(source);
                    });
                });
            });
            Promise.all(sourceGetters)
                .then(sources => {
                const concatSource = new webpack_sources_1.ConcatSource();
                sources.forEach(source => {
                    concatSource.add(source);
                    concatSource.add('\n;');
                });
                const combinedSource = new webpack_sources_1.CachedSource(concatSource);
                const filename = loader_utils_1.interpolateName({ resourcePath: 'scripts.js' }, this.options.filename, { content: combinedSource.source() });
                const output = { filename, source: combinedSource };
                this._insertOutput(compilation, output);
                this._cachedOutput = output;
                addDependencies(compilation, scripts);
                callback();
            })
                .catch((err) => callback(err));
        });
    }
}
exports.ScriptsWebpackPlugin = ScriptsWebpackPlugin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NyaXB0cy13ZWJwYWNrLXBsdWdpbi5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsicGFja2FnZXMvYW5ndWxhcl9kZXZraXQvYnVpbGRfYW5ndWxhci9zcmMvYW5ndWxhci1jbGktZmlsZXMvcGx1Z2lucy9zY3JpcHRzLXdlYnBhY2stcGx1Z2luLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxpQkFBaUI7QUFDakIsK0RBQStEOztBQWlCL0QscURBQWdHO0FBQ2hHLCtDQUErQztBQUMvQyw2QkFBNkI7QUFFN0IsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFDM0MsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLHdCQUF3QixDQUFDLENBQUM7QUFlckQsU0FBUyxlQUFlLENBQUMsV0FBZ0IsRUFBRSxPQUFpQjtJQUMxRCxLQUFLLE1BQU0sTUFBTSxJQUFJLE9BQU8sRUFBRTtRQUM1QixXQUFXLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQzFDO0FBQ0gsQ0FBQztBQUVELFNBQVMsSUFBSSxDQUFDLFFBQWEsRUFBRSxNQUFtRTtJQUM5RixRQUFRLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsd0JBQXdCLEVBQUUsQ0FBQyxXQUFnQixFQUFFLEVBQUU7UUFDaEYsV0FBVyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQ3pDLHdCQUF3QixFQUN4QixDQUFDLFFBQStCLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQ25FLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7QUFFRCxNQUFhLG9CQUFvQjtJQUkvQixZQUFvQixVQUFnRCxFQUFFO1FBQWxELFlBQU8sR0FBUCxPQUFPLENBQTJDO0lBQUksQ0FBQztJQUUzRSxVQUFVLENBQUMsV0FBZ0IsRUFBRSxPQUFpQjtRQUM1QyxJQUFJLElB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dkIsWUFBWSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDekIsWUFBWSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDMUIsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsTUFBTSxjQUFjLEdBQUcsSUFBSSw4QkFBWSxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUN0RCxNQUFNLFFBQVEsR0FBRyw4QkFBZSxDQUM5QixFQUFFLFlBQVksRUFBRSxZQUFZLEVBQTBCLEVBQ3RELElBQUksQ0FBQyxPQUFPLENBQUMsUUFBa0IsRUFDL0IsRUFBRSxPQUFPLEVBQUUsY0FBYyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQ3JDLENBQUM7Z0JBRUYsTUFBTSxNQUFNLEdBQUcsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLGNBQWMsRUFBRSxDQUFDO2dCQUNwRCxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDeEMsSUFBSSxDQUFDLGFBQWEsR0FBRyxNQUFNLENBQUM7Z0JBQzVCLGVBQWUsQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBRXRDLFFBQVEsRUFBRSxDQUFDO1lBQ2IsQ0FBQyxDQUFDO2lCQUNELEtBQUssQ0FBQyxDQUFDLEdBQVUsRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDMUMsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUFoSEQsb0RBZ0hDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gdHNsaW50OmRpc2FibGVcbi8vIFRPRE86IGNsZWFudXAgdGhpcyBmaWxlLCBpdCdzIGNvcGllZCBhcyBpcyBmcm9tIEFuZ3VsYXIgQ0xJLlxuXG4vKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG4vKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgeyBDb21waWxlciwgbG9hZGVyIH0gZnJvbSAnd2VicGFjayc7XG5pbXBvcnQgeyBDYWNoZWRTb3VyY2UsIENvbmNhdFNvdXJjZSwgT3JpZ2luYWxTb3VyY2UsIFJhd1NvdXJjZSwgU291cmNlIH0gZnJvbSAnd2VicGFjay1zb3VyY2VzJztcbmltcG9ydCB7IGludGVycG9sYXRlTmFtZSB9IGZyb20gJ2xvYWRlci11dGlscyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuXG5jb25zdCBDaHVuayA9IHJlcXVpcmUoJ3dlYnBhY2svbGliL0NodW5rJyk7XG5jb25zdCBFbnRyeVBvaW50ID0gcmVxdWlyZSgnd2VicGFjay9saWIvRW50cnlwb2ludCcpO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNjcmlwdHNXZWJwYWNrUGx1Z2luT3B0aW9ucyB7XG4gIG5hbWU6IHN0cmluZztcbiAgc291cmNlTWFwOiBib29sZWFuO1xuICBzY3JpcHRzOiBzdHJpbmdbXTtcbiAgZmlsZW5hbWU6IHN0cmluZztcbiAgYmFzZVBhdGg6IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIFNjcmlwdE91dHB1dCB7XG4gIGZpbGVuYW1lOiBzdHJpbmc7XG4gIHNvdXJjZTogQ2FjaGVkU291cmNlO1xufVxuXG5mdW5jdGlvbiBhZGREZXBlbmRlbmNpZXMoY29tcGlsYXRpb246IGFueSwgc2NyaXB0czogc3RyaW5nW10pOiB2b2lkIHtcbiAgZm9yIChjb25zdCBzY3JpcHQgb2Ygc2NyaXB0cykge1xuICAgIGNvbXBpbGF0aW9uLmZpbGVEZXBlbmRlbmNpZXMuYWRkKHNjcmlwdCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaG9vayhjb21waWxlcjogYW55LCBhY3Rpb246IChjb21waWxhdGlvbjogYW55LCBjYWxsYmFjazogKGVycj86IEVycm9yKSA9PiB2b2lkKSA9PiB2b2lkKSB7XG4gIGNvbXBpbGVyLmhvb2tzLnRoaXNDb21waWxhdGlvbi50YXAoJ3NjcmlwdHMtd2VicGFjay1wbHVnaW4nLCAoY29tcGlsYXRpb246IGFueSkgPT4ge1xuICAgIGNvbXBpbGF0aW9uLmhvb2tzLmFkZGl0aW9uYWxBc3NldHMudGFwQXN5bmMoXG4gICAgICAnc2NyaXB0cy13ZWJwYWNrLXBsdWdpbicsXG4gICAgICAoY2FsbGJhY2s6IChlcnI/OiBFcnJvcikgPT4gdm9pZCkgPT4gYWN0aW9uKGNvbXBpbGF0aW9uLCBjYWxsYmFjayksXG4gICAgKTtcbiAgfSk7XG59XG5cbmV4cG9ydCBjbGFzcyBTY3JpcHRzV2VicGFja1BsdWdpbiB7XG4gIHByaXZhdGUgX2xhc3RCdWlsZFRpbWU/OiBudW1iZXI7XG4gIHByaXZhdGUgX2NhY2hlZE91dHB1dD86IFNjcmlwdE91dHB1dDtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIG9wdGlvbnM6IFBhcnRpYWw8U2NyaXB0c1dlYnBhY2tQbHVnaW5PcHRpb25zPiA9IHt9KSB7IH1cblxuICBzaG91bGRTa2lwKGNvbXBpbGF0aW9uOiBhbnksIHNjcmlwdHM6IHN0cmluZ1tdKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMuX2xhc3RCdWlsZFRpbWUgPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLl9sYXN0QnVpbGRUaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNjcmlwdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHNjcmlwdFRpbWUgPSBjb21waWxhdGlvbi5maWxlVGltZXN0YW1wcy5nZXQoc2NyaXB0c1tpXSk7XG4gICAgICBpZiAoIXNjcmlwdFRpbWUgfHwgc2NyaXB0VGltZSA+IHRoaXMuX2xhc3RCdWlsZFRpbWUpIHtcbiAgICAgICAgdGhpcy5fbGFzdEJ1aWxkVGltZSA9IERhdGUubm93KCk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHByaXZhdGUgX2luc2VydE91dHB1dChjb21waWxhdGlvbjogYW55LCB7IGZpbGVuYW1lLCBzb3VyY2UgfTogU2NyaXB0T3V0cHV0LCBjYWNoZWQgPSBmYWxzZSkge1xuICAgIGNvbnN0IGNodW5rID0gbmV3IENodW5rKHRoaXMub3B0aW9ucy5uYW1lKTtcbiAgICBjaHVuay5yZW5kZXJlZCA9ICFjYWNoZWQ7XG4gICAgY2h1bmsuaWQgPSB0aGlzLm9wdGlvbnMubmFtZTtcbiAgICBjaHVuay5pZHMgPSBbY2h1bmsuaWRdO1xuICAgIGNodW5rLmZpbGVzLnB1c2goZmlsZW5hbWUpO1xuXG4gICAgY29uc3QgZW50cnlwb2ludCA9IG5ldyBFbnRyeVBvaW50KHRoaXMub3B0aW9ucy5uYW1lKTtcbiAgICBlbnRyeXBvaW50LnB1c2hDaHVuayhjaHVuayk7XG4gICAgY2h1bmsuYWRkR3JvdXAoZW50cnlwb2ludCk7XG4gICAgY29tcGlsYXRpb24uZW50cnlwb2ludHMuc2V0KHRoaXMub3B0aW9ucy5uYW1lLCBlbnRyeXBvaW50KTtcbiAgICBjb21waWxhdGlvbi5jaHVua3MucHVzaChjaHVuayk7XG4gICAgY29tcGlsYXRpb24uYXNzZXRzW2ZpbGVuYW1lXSA9IHNvdXJjZTtcbiAgfVxuXG4gIGFwcGx5KGNvbXBpbGVyOiBDb21waWxlcik6IHZvaWQge1xuICAgIGlmICghdGhpcy5vcHRpb25zLnNjcmlwdHMgfHwgdGhpcy5vcHRpb25zLnNjcmlwdHMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgc2NyaXB0cyA9IHRoaXMub3B0aW9ucy5zY3JpcHRzXG4gICAgICAuZmlsdGVyKHNjcmlwdCA9PiAhIXNjcmlwdClcbiAgICAgIC5tYXAoc2NyaXB0ID0+IHBhdGgucmVzb2x2ZSh0aGlzLm9wdGlvbnMuYmFzZVBhdGggfHwgJycsIHNjcmlwdCkpO1xuXG4gICAgaG9vayhjb21waWxlciwgKGNvbXBpbGF0aW9uLCBjYWxsYmFjaykgPT4ge1xuICAgICAgaWYgKHRoaXMuc2hvdWxkU2tpcChjb21waWxhdGlvbiwgc2NyaXB0cykpIHtcbiAgICAgICAgaWYgKHRoaXMuX2NhY2hlZE91dHB1dCkge1xuICAgICAgICAgIHRoaXMuX2luc2VydE91dHB1dChjb21waWxhdGlvbiwgdGhpcy5fY2FjaGVkT3V0cHV0LCB0cnVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFkZERlcGVuZGVuY2llcyhjb21waWxhdGlvbiwgc2NyaXB0cyk7XG4gICAgICAgIGNhbGxiYWNrKCk7XG5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBzb3VyY2VHZXR0ZXJzID0gc2NyaXB0cy5tYXAoZnVsbFBhdGggPT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8U291cmNlPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgY29tcGlsYXRpb24uaW5wdXRGaWxlU3lzdGVtLnJlYWRGaWxlKGZ1bGxQYXRoLCAoZXJyOiBFcnJvciwgZGF0YTogQnVmZmVyKSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBkYXRhLnRvU3RyaW5nKCk7XG5cbiAgICAgICAgICAgIGxldCBzb3VyY2U7XG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNvdXJjZU1hcCkge1xuICAgICAgICAgICAgICAvLyBUT0RPOiBMb29rIGZvciBzb3VyY2UgbWFwIGZpbGUgKGZvciAnLm1pbicgc2NyaXB0cywgZXRjLilcblxuICAgICAgICAgICAgICBsZXQgYWRqdXN0ZWRQYXRoID0gZnVsbFBhdGg7XG4gICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYmFzZVBhdGgpIHtcbiAgICAgICAgICAgICAgICBhZGp1c3RlZFBhdGggPSBwYXRoLnJlbGF0aXZlKHRoaXMub3B0aW9ucy5iYXNlUGF0aCwgZnVsbFBhdGgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHNvdXJjZSA9IG5ldyBPcmlnaW5hbFNvdXJjZShjb250ZW50LCBhZGp1c3RlZFBhdGgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgc291cmNlID0gbmV3IFJhd1NvdXJjZShjb250ZW50KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmVzb2x2ZShzb3VyY2UpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICBQcm9taXNlLmFsbChzb3VyY2VHZXR0ZXJzKVxuICAgICAgICAudGhlbihzb3VyY2VzID0+IHtcbiAgICAgICAgICBjb25zdCBjb25jYXRTb3VyY2UgPSBuZXcgQ29uY2F0U291cmNlKCk7XG4gICAgICAgICAgc291cmNlcy5mb3JFYWNoKHNvdXJjZSA9PiB7XG4gICAgICAgICAgICBjb25jYXRTb3VyY2UuYWRkKHNvdXJjZSk7XG4gICAgICAgICAgICBjb25jYXRTb3VyY2UuYWRkKCdcXG47Jyk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBjb25zdCBjb21iaW5lZFNvdXJjZSA9IG5ldyBDYWNoZWRTb3VyY2UoY29uY2F0U291cmNlKTtcbiAgICAgICAgICBjb25zdCBmaWxlbmFtZSA9IGludGVycG9sYXRlTmFtZShcbiAgICAgICAgICAgIHsgcmVzb3VyY2VQYXRoOiAnc2NyaXB0cy5qcycgfSBhcyBsb2FkZXIuTG9hZGVyQ29udGV4dCxcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5maWxlbmFtZSBhcyBzdHJpbmcsXG4gICAgICAgICAgICB7IGNvbnRlbnQ6IGNvbWJpbmVkU291cmNlLnNvdXJjZSgpIH0sXG4gICAgICAgICAgKTtcblxuICAgICAgICAgIGNvbnN0IG91dHB1dCA9IHsgZmlsZW5hbWUsIHNvdXJjZTogY29tYmluZWRTb3VyY2UgfTtcbiAgICAgICAgICB0aGlzLl9pbnNlcnRPdXRwdXQoY29tcGlsYXRpb24sIG91dHB1dCk7XG4gICAgICAgICAgdGhpcy5fY2FjaGVkT3V0cHV0ID0gb3V0cHV0O1xuICAgICAgICAgIGFkZERlcGVuZGVuY2llcyhjb21waWxhdGlvbiwgc2NyaXB0cyk7XG5cbiAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goKGVycjogRXJyb3IpID0+IGNhbGxiYWNrKGVycikpO1xuICAgIH0pO1xuICB9XG59XG4iXX0=