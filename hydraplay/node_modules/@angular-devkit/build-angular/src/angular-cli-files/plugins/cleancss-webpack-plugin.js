"use strict";
// tslint:disable
// TODO: cleanup this file, it's copied as is from Angular CLI.
Object.defineProperty(exports, "__esModule", { value: true });
const webpack_sources_1 = require("webpack-sources");
const CleanCSS = require('clean-css');
function hook(compiler, action) {
    compiler.hooks.compilation.tap('cleancss-webpack-plugin', (compilation) => {
        compilation.hooks.optimizeChunkAssets.tapPromise('cleancss-webpack-plugin', (chunks) => action(compilation, chunks));
    });
}
class CleanCssWebpackPlugin {
    constructor(options) {
        this._options = Object.assign({ sourceMap: false, test: (file) => file.endsWith('.css') }, options);
    }
    apply(compiler) {
        hook(compiler, (compilation, chunks) => {
            const cleancss = new CleanCSS({
                compatibility: 'ie9',
                level: {
                    2: {
                        skipProperties: ['transition'] // Fixes #12408
                    }
                },
                inline: false,
                returnPromise: true,
                sourceMap: this._options.sourceMap,
            });
            const files = [...compilation.additionalChunkAssets];
            chunks.forEach(chunk => {
                if (chunk.files && chunk.files.length > 0) {
                    files.push(...chunk.files);
                }
            });
            const actions = files
                .filter(file => this._options.test(file))
                .map(file => {
                const asset = compilation.assets[file];
                if (!asset) {
                    return Promise.resolve();
                }
                let content;
                let map;
                if (this._options.sourceMap && asset.sourceAndMap) {
                    const sourceAndMap = asset.sourceAndMap();
                    content = sourceAndMap.source;
                    map = sourceAndMap.map;
                }
                else {
                    content = asset.source();
                }
                if (content.length === 0) {
                    return Promise.resolve();
                }
                return Promise.resolve()
                    .then(() => map ? cleancss.minify(content, map) : cleancss.minify(content))
                    .then((output) => {
                    let hasWarnings = false;
                    if (output.warnings && output.warnings.length > 0) {
                        compilation.warnings.push(...output.warnings);
                        hasWarnings = true;
                    }
                    if (output.errors && output.errors.length > 0) {
                        output.errors
                            .forEach((error) => compilation.errors.push(new Error(error)));
                        return;
                    }
                    // generally means invalid syntax so bail
                    if (hasWarnings && output.stats.minifiedSize === 0) {
                        return;
                    }
                    let newSource;
                    if (output.sourceMap) {
                        newSource = new webpack_sources_1.SourceMapSource(output.styles, file, output.sourceMap.toString(), content, map);
                    }
                    else {
                        newSource = new webpack_sources_1.RawSource(output.styles);
                    }
                    compilation.assets[file] = newSource;
                });
            });
            return Promise.all(actions);
        });
    }
}
exports.CleanCssWebpackPlugin = CleanCssWebpackPlugin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xlYW5jc3Mtd2VicGFjay1wbHVnaW4uanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2FuZ3VsYXJfZGV2a2l0L2J1aWxkX2FuZ3VsYXIvc3JjL2FuZ3VsYXItY2xpLWZpbGVzL3BsdWdpbnMvY2xlYW5jc3Mtd2VicGFjay1wbHVnaW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLGlCQUFpQjtBQUNqQiwrREFBK0Q7O0FBVy9ELHFEQUFxRTtBQUVyRSxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7QUFXdEMsU0FBUyxJQUFJLENBQ1gsUUFBYSxFQUNiLE1BQTBFO0lBRTFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsRUFBRSxDQUFDLFdBQWdCLEVBQUUsRUFBRTtRQUM3RSxXQUFXLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLFVBQVUsQ0FDOUMseUJBQXlCLEVBQ3pCLENBQUMsTUFBb0IsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FDdEQsQ0FBQztJQUNKLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVELE1BQWEscUJBQXFCO0lBR2hDLFlBQVksT0FBOEM7UUFDeEQsSUFBSSxDQUFDLFFBQVEsbUJBQ1gsU0FBUyxFQUFFLEtBQUssRUFDaEIsSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUNsQyxPQUFPLENBQ1gsQ0FBQztJQUNKLENBQUM7SUFFRCxLQUFLLENBQUMsUUFBa0I7UUFDdEIsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLFdBQW9DLEVBQUUsTUFBb0IsRUFBRSxFQUFFO1lBQzVFLE1BQU0sUUFBUSxHQUFHLElBQUksUUFBUSxDQUFDO2dCQUM1QixhQUFhLEVBQUUsS0FBSztnQkFDcEIsS0FBSyxFQUFFO29CQUNMLENB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QUM7b0JBQ2QsSUFBSSxNQUFNLENBQUMsU0FBUyxFQUFFO3dCQUNwQixTQUFTLEdBQUcsSUFBSSxpQ0FBZSxDQUM3QixNQUFNLENBQUMsTUFBTSxFQUNiLElBQUksRUFDSixNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxFQUMzQixPQUFPLEVBQ1AsR0FBRyxDQUNKLENBQUM7cUJBQ0g7eUJBQU07d0JBQ0wsU0FBUyxHQUFHLElBQUksMkJBQVMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7cUJBQzFDO29CQUVELFdBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsU0FBUyxDQUFDO2dCQUN2QyxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1lBRUwsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzlCLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBL0ZELHNEQStGQyIsInNvdXJjZXNDb250ZW50IjpbIi8vIHRzbGludDpkaXNhYmxlXG4vLyBUT0RPOiBjbGVhbnVwIHRoaXMgZmlsZSwgaXQncyBjb3BpZWQgYXMgaXMgZnJvbSBBbmd1bGFyIENMSS5cblxuLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgeyBDb21waWxlciwgY29tcGlsYXRpb24gfSBmcm9tICd3ZWJwYWNrJztcbmltcG9ydCB7IFJhd1NvdXJjZSwgU291cmNlLCBTb3VyY2VNYXBTb3VyY2UgfSBmcm9tICd3ZWJwYWNrLXNvdXJjZXMnO1xuXG5jb25zdCBDbGVhbkNTUyA9IHJlcXVpcmUoJ2NsZWFuLWNzcycpO1xuXG5pbnRlcmZhY2UgQ2h1bmsge1xuICBmaWxlczogc3RyaW5nW107XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2xlYW5Dc3NXZWJwYWNrUGx1Z2luT3B0aW9ucyB7XG4gIHNvdXJjZU1hcDogYm9vbGVhbjtcbiAgdGVzdDogKGZpbGU6IHN0cmluZykgPT4gYm9vbGVhbjtcbn1cblxuZnVuY3Rpb24gaG9vayhcbiAgY29tcGlsZXI6IGFueSxcbiAgYWN0aW9uOiAoY29tcGlsYXRpb246IGFueSwgY2h1bmtzOiBBcnJheTxDaHVuaz4pID0+IFByb21pc2U8dm9pZCB8IHZvaWRbXT4sXG4pIHtcbiAgY29tcGlsZXIuaG9va3MuY29tcGlsYXRpb24udGFwKCdjbGVhbmNzcy13ZWJwYWNrLXBsdWdpbicsIChjb21waWxhdGlvbjogYW55KSA9PiB7XG4gICAgY29tcGlsYXRpb24uaG9va3Mub3B0aW1pemVDaHVua0Fzc2V0cy50YXBQcm9taXNlKFxuICAgICAgJ2NsZWFuY3NzLXdlYnBhY2stcGx1Z2luJyxcbiAgICAgIChjaHVua3M6IEFycmF5PENodW5rPikgPT4gYWN0aW9uKGNvbXBpbGF0aW9uLCBjaHVua3MpLFxuICAgICk7XG4gIH0pO1xufVxuXG5leHBvcnQgY2xhc3MgQ2xlYW5Dc3NXZWJwYWNrUGx1Z2luIHtcbiAgcHJpdmF0ZSByZWFkb25seSBfb3B0aW9uczogQ2xlYW5Dc3NXZWJwYWNrUGx1Z2luT3B0aW9ucztcblxuICBjb25zdHJ1Y3RvcihvcHRpb25zOiBQYXJ0aWFsPENsZWFuQ3NzV2VicGFja1BsdWdpbk9wdGlvbnM+KSB7XG4gICAgdGhpcy5fb3B0aW9ucyA9IHtcbiAgICAgIHNvdXJjZU1hcDogZmFsc2UsXG4gICAgICB0ZXN0OiAoZmlsZSkgPT4gZmlsZS5lbmRzV2l0aCgnLmNzcycpLFxuICAgICAgLi4ub3B0aW9ucyxcbiAgICB9O1xuICB9XG5cbiAgYXBwbHkoY29tcGlsZXI6IENvbXBpbGVyKTogdm9pZCB7XG4gICAgaG9vayhjb21waWxlciwgKGNvbXBpbGF0aW9uOiBjb21waWxhdGlvbi5Db21waWxhdGlvbiwgY2h1bmtzOiBBcnJheTxDaHVuaz4pID0+IHtcbiAgICAgIGNvbnN0IGNsZWFuY3NzID0gbmV3IENsZWFuQ1NTKHtcbiAgICAgICAgY29tcGF0aWJpbGl0eTogJ2llOScsXG4gICAgICAgIGxldmVsOiB7XG4gICAgICAgICAgMjoge1xuICAgICAgICAgICAgc2tpcFByb3BlcnRpZXM6IFsndHJhbnNpdGlvbiddIC8vIEZpeGVzICMxMjQwOFxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgaW5saW5lOiBmYWxzZSxcbiAgICAgICAgcmV0dXJuUHJvbWlzZTogdHJ1ZSxcbiAgICAgICAgc291cmNlTWFwOiB0aGlzLl9vcHRpb25zLnNvdXJjZU1hcCxcbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCBmaWxlczogc3RyaW5nW10gPSBbLi4uY29tcGlsYXRpb24uYWRkaXRpb25hbENodW5rQXNzZXRzXTtcblxuICAgICAgY2h1bmtzLmZvckVhY2goY2h1bmsgPT4ge1xuICAgICAgICBpZiAoY2h1bmsuZmlsZXMgJiYgY2h1bmsuZmlsZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGZpbGVzLnB1c2goLi4uY2h1bmsuZmlsZXMpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgY29uc3QgYWN0aW9ucyA9IGZpbGVzXG4gICAgICAgIC5maWx0ZXIoZmlsZSA9PiB0aGlzLl9vcHRpb25zLnRlc3QoZmlsZSkpXG4gICAgICAgIC5tYXAoZmlsZSA9PiB7XG4gICAgICAgICAgY29uc3QgYXNzZXQgPSBjb21waWxhdGlvbi5hc3NldHNbZmlsZV0gYXMgU291cmNlO1xuICAgICAgICAgIGlmICghYXNzZXQpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsZXQgY29udGVudDogc3RyaW5nO1xuICAgICAgICAgIGxldCBtYXA6IGFueTtcbiAgICAgICAgICBpZiAodGhpcy5fb3B0aW9ucy5zb3VyY2VNYXAgJiYgYXNzZXQuc291cmNlQW5kTWFwKSB7XG4gICAgICAgICAgICBjb25zdCBzb3VyY2VBbmRNYXAgPSBhc3NldC5zb3VyY2VBbmRNYXAoKTtcbiAgICAgICAgICAgIGNvbnRlbnQgPSBzb3VyY2VBbmRNYXAuc291cmNlO1xuICAgICAgICAgICAgbWFwID0gc291cmNlQW5kTWFwLm1hcDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29udGVudCA9IGFzc2V0LnNvdXJjZSgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChjb250ZW50Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4gbWFwID8gY2xlYW5jc3MubWluaWZ5KGNvbnRlbnQsIG1hcCkgOiBjbGVhbmNzcy5taW5pZnkoY29udGVudCkpXG4gICAgICAgICAgICAudGhlbigob3V0cHV0OiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgbGV0IGhhc1dhcm5pbmdzID0gZmFsc2U7XG4gICAgICAgICAgICAgIGlmIChvdXRwdXQud2FybmluZ3MgJiYgb3V0cHV0Lndhcm5pbmdzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBjb21waWxhdGlvbi53YXJuaW5ncy5wdXNoKC4uLm91dHB1dC53YXJuaW5ncyk7XG4gICAgICAgICAgICAgICAgaGFzV2FybmluZ3MgPSB0cnVlO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgaWYgKG91dHB1dC5lcnJvcnMgJiYgb3V0cHV0LmVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgb3V0cHV0LmVycm9yc1xuICAgICAgICAgICAgICAgICAgLmZvckVhY2goKGVycm9yOiBzdHJpbmcpID0+IGNvbXBpbGF0aW9uLmVycm9ycy5wdXNoKG5ldyBFcnJvcihlcnJvcikpKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvLyBnZW5lcmFsbHkgbWVhbnMgaW52YWxpZCBzeW50YXggc28gYmFpbFxuICAgICAgICAgICAgICBpZiAoaGFzV2FybmluZ3MgJiYgb3V0cHV0LnN0YXRzLm1pbmlmaWVkU2l6ZSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGxldCBuZXdTb3VyY2U7XG4gICAgICAgICAgICAgIGlmIChvdXRwdXQuc291cmNlTWFwKSB7XG4gICAgICAgICAgICAgICAgbmV3U291cmNlID0gbmV3IFNvdXJjZU1hcFNvdXJjZShcbiAgICAgICAgICAgICAgICAgIG91dHB1dC5zdHlsZXMsXG4gICAgICAgICAgICAgICAgICBmaWxlLFxuICAgICAgICAgICAgICAgICAgb3V0cHV0LnNvdXJjZU1hcC50b1N0cmluZygpLFxuICAgICAgICAgICAgICAgICAgY29udGVudCxcbiAgICAgICAgICAgICAgICAgIG1hcCxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5ld1NvdXJjZSA9IG5ldyBSYXdTb3VyY2Uob3V0cHV0LnN0eWxlcyk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBjb21waWxhdGlvbi5hc3NldHNbZmlsZV0gPSBuZXdTb3VyY2U7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBQcm9taXNlLmFsbChhY3Rpb25zKTtcbiAgICB9KTtcbiAgfVxufVxuIl19