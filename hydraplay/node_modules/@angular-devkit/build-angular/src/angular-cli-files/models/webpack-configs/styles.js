"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const webpack_1 = require("../../plugins/webpack");
const utils_1 = require("./utils");
const autoprefixer = require('autoprefixer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const postcssImports = require('postcss-import');
/**
 * Enumerate loaders and their dependencies from this file to let the dependency validator
 * know they are used.
 *
 * require('style-loader')
 * require('postcss-loader')
 * require('stylus')
 * require('stylus-loader')
 * require('less')
 * require('less-loader')
 * require('node-sass')
 * require('sass-loader')
 */
function getStylesConfig(wco) {
    const { root, buildOptions } = wco;
    const entryPoints = {};
    const globalStylePaths = [];
    const extraPlugins = [];
    const cssSourceMap = buildOptions.sourceMap.styles;
    // Determine hashing format.
    const hashFormat = utils_1.getOutputHashFormat(buildOptions.outputHashing);
    // Convert absolute resource URLs to account for base-href and deploy-url.
    const baseHref = buildOptions.baseHref || '';
    const deployUrl = buildOptions.deployUrl || '';
    const resourcesOutputPath = buildOptions.resourcesOutputPath || '';
    const postcssPluginCreator = function (loader) {
        return [
            postcssImports({
                resolve: (url) => url.startsWith('~') ? url.substr(1) : url,
                load: (filename) => {
                    return new Promise((resolve, reject) => {
                        loader.fs.readFile(filename, (err, data) => {
                            if (err) {
                                reject(err);
                                return;
                            }
                            const content = data.toString();
                            resolve(content);
                        });
                    });
                },
            }),
            webpack_1.PostcssCliResources({
                baseHref,
                deployUrl,
                resourcesOutputPath,
                loader,
                filename: `[name]${hashFormat.file}.[ext]`,
            }),
            autoprefixer(),
        ];
    };
    // use includePaths from appConfig
    const includePaths = [];
    let lessPathOptions = {};
    if (buildOptions.stylePreprocessorOptions
        && buildOptions.stylePreprocessorOptions.includePaths
        && buildOptions.stylePreprocessorOptions.includePaths.length > 0) {
        buildOptions.stylePreprocessorOptions.includePaths.forEach((includePath) => includePaths.push(path.resolve(root, includePath)));
        lessPathOptions = {
            paths: includePaths,
        };
    }
    // Process global styles.
    if (buildOptions.styles.length > 0) {
        const chunkNames = [];
        utils_1.normalizeExtraEntryPoints(buildOptions.styles, 'styles').forEach(style => {
            const resolvedPath = path.resolve(root, style.input);
            // Add style entry points.
            if (entryPoints[style.bundleName]) {
                entryPoints[style.bundleName].push(resolvedPath);
            }
            else {
                entryPoints[style.bundleName] = [resolvedPath];
            }
            // Add lazy styles to the list.
            if (style.lazy) {
                chunkNames.push(style.bundleName);
            }
            // Add global css paths.
            globalStylePaths.push(resolvedPath);
        });
        if (chunkNames.length > 0) {
            // Add plugin to remove hashes from lazy styles.
            extraPlugins.push(new webpack_1.RemoveHashPlugin({ chunkNames, hashFormat }));
        }
    }
    let dartSass;
    try {
        // tslint:disable-next-line:no-implicit-dependencies
        dartSass = require('sass');
    }
    catch (_a) { }
    let fiber;
    if (dartSass) {
        try {
            // tslint:disable-next-line:no-implicit-dependencies
            fiber = require('fibers');
        }
        catch (_b) { }
    }
    // set base rules to derive final rules from
    const baseRules = [
        { test: /\.css$/, use: [] },
        {
            test: /\.scss$|\.sass$/,
            use: [{
                    loader: 'sass-loader',
                    options: {
                        implementation: dartSass,
                        fiber,
                        sourceMap: cssSourceMap,
                        // bootstrap-sass requires a minimum precision of 8
                        precision: 8,
                        includePaths,
                    },
                }],
        },
        {
            test: /\.less$/,
            use: [{
                    loader: 'less-loader',
                    options: Object.assign({ sourceMap: cssSourceMap, javascriptEnabled: true }, lessPathOptions),
                }],
        },
        {
            test: /\.styl$/,
            use: [{
                    loader: 'stylus-loader',
                    options: {
                        sourceMap: cssSourceMap,
                        paths: includePaths,
                    },
                }],
        },
    ];
    // load component css as raw strings
    const rules = baseRules.map(({ test, use }) => ({
        exclude: globalStylePaths,
        test,
        use: [
            { loader: 'raw-loader' },
            {
                loader: 'postcss-loader',
                options: {
                    ident: 'embedded',
                    plugins: postcssPluginCreator,
                    sourceMap: cssSourceMap && !buildOptions.sourceMap.hidden ? 'inline' : false,
                },
            },
            ...use,
        ],
    }));
    // load global css as css files
    if (globalStylePaths.length > 0) {
        rules.push(...baseRules.map(({ test, use }) => {
            return {
                include: globalStylePaths,
                test,
                use: [
                    buildOptions.extractCss ? MiniCssExtractPlugin.loader : 'style-loader',
                    webpack_1.RawCssLoader,
                    {
                        loader: 'postcss-loader',
                        options: {
                            ident: buildOptions.extractCss ? 'extracted' : 'embedded',
                            plugins: postcssPluginCreator,
                            sourceMap: cssSourceMap
                                && !buildOptions.extractCss
                                && !buildOptions.sourceMap.hidden
                                ? 'inline' : cssSourceMap,
                        },
                    },
                    ...use,
                ],
            };
        }));
    }
    if (buildOptions.extractCss) {
        extraPlugins.push(
        // extract global css from js files into own css file
        new MiniCssExtractPlugin({ filename: `[name]${hashFormat.extract}.css` }), 
        // suppress empty .js files in css only entry points
        new webpack_1.SuppressExtractedTextChunksWebpackPlugin());
    }
    return {
        entry: entryPoints,
        module: { rules },
        plugins: extraPlugins,
    };
}
exports.getStylesConfig = getStylesConfig;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGVzLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9hbmd1bGFyX2RldmtpdC9idWlsZF9hbmd1bGFyL3NyYy9hbmd1bGFyLWNsaS1maWxlcy9tb2RlbHMvd2VicGFjay1jb25maWdzL3N0eWxlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOztBQUVILDZCQUE2QjtBQUU3QixtREFLK0I7QUFFL0IsbUNBQXlFO0FBRXpFLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUM3QyxNQUFNLG9CQUFvQixHQUFHLE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0FBQ2hFLE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBRWpEOzs7Ozs7Ozs7Ozs7R0FZRztBQUVILFNBQWdCLGVBQWUsQ0FBQyxHQUF5QjtJQUN2RCxNQUFNLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxHQUFHLEdBQUcsQ0FBQztJQUNuQyxNQUFNLFdBQVcsR0FBZ0MsRUFBRSxDQUFDO0lBQ3BELE1BQU0sZ0JBQWdCLEdBQWEsRUFBRSxDQUFDO0lBQ3RDLE1BQU0sWUFBWSxHQUFHLEVBQUUsQ0FBQztJQUV4QixNQUFNLFlBQVksR0FBRyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQztJQUVuRCw0QkFBNEI7SUFDNUIsTUFBTSxVQUFVLEdBQUcsMkJBQW1CLENBQUMsWUFBWSxDQUFDLGFBQXVCLENBQUMsQ0FBQztJQUM3RSwwRUFBMEU7SUFDMUUsTUFBTSxRQUFRLEdBQUcsWUFBWSxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUM7SUFDN0MsTUFBTSxTQUFTLEdBQUcsWUFBWSxDQUFDLFNBQVMsSUFBSSxFQUFFLENBQUM7SUFDL0MsTUFBTSxtQkFBbUIsR0FBRyxZQUFZLENBQUMsbUJBQW1CLElBQUksRUFBRSxDQUFDO0lBRW5FLE1BQU0sb0JBQW9CLEdBQUcsVUFBVSxNQUFvQztRQUN6RSxPQUFPO1lBQ0wsY0FBYyxDQUFDO2dCQUNiLE9BQU8sRUFBRSxDQUFDLEdBQVcsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRztnQkFDbkUsSUFBSSxFQUFFLENBQUMsUUFBZ0IsRUFBRSxFQUFFO29CQUN6QixPQUFPLElBQUksT0FBTyxDQUFTLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO3dCQUM3QyxNQUFNLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxHQUFVLEVBQUUsSUFBWSxFQUFFLEVBQUU7NEJBQ3hELElBQUksR0FBRyxFQUFFO2dDQUNQLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztnQ0FFWixPQUFPOzZCQUNSOzRCQUVELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQzs0QkFDaEMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO3dCQUNuQixDQUFDLENBQUMsQ0FBQztvQkFDTCxDQUFDLENBQUMsQ0FBQztnQkFDTCxDQUFDO2FBQ0YsQ0FBQztZQUNGLDZCQUFtQixDQUFDO2dCQUNsQixRQUFRO2dCQUNSLFNBQVM7Z0JBQ1QsbUJBQW1CO2dCQUNuQixNQUFNO2dCQUNOLFFBQVEsRUFBRSxTQUFTLFVBQVUsQ0FBQyxJQUFJLFFBQVE7YUFDM0MsQ0FBQztZQUNGLFlBQVksRUFBRTtTQUNmLENBQUM7SUFDSixDQUFDLENBQUM7SUFFRixrQ0FBa0M7SUFDbEMsTUFBTSxZQUFZLEdBQWEsRUFBRSxDQUFDO0lBQ2xDLElBQUksZUFBZSxHQUF5QixFQUFFLENBQUM7SUFFL0MsSUFBSSxZQUFZLENBQUMsd0JBQXdCO1dBQ3BDLFlBQVksQ0FBQyx3QkFBd0IsQ0FBQyxZQUFZO1dBQ2xELFlBQVksQ0FBQyx3QkFBd0IsQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsRUFDaEU7UUFDQSxZQUFZLENBQUMsd0JBQXdCLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFdBQW1CLEVBQUUsRUFBRSxDQUNqRixZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0RCxlQUFlLEdBQUc7WUFDaEIsS0FBSyxFQUFFLFlBQVk7U0FDcEIsQ0FBQztLQUNIO0lBRUQseUJBQXlCO0lBQ3pCLElBQUksWUFBWSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1FBQ2xDLE1BQU0sVUFBVSxHQUFhLEVBQUUsQ0FBQztRQUVoQyxpQ0FBeUIsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUN2RSxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDckQsMEJBQTBCO1lBQzFCLElBQUksV0FBVyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsRUFBRTtnQkFDakMsV0FBVyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7YUFDbEQ7aUJBQU07Z0JBQ0wsV0FBVyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO2FBQ2hEO1lBRUQsK0JBQStCO1lBQy9CLElBQUksS0FBSyxDQUFDLElBQUksRUFBRTtnQkFDZCxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUNuQztZQUVELHdCQUF3QjtZQUN4QixnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDdEMsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ3pCLGdEQUFnRDtZQUNoRCxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksMEJBQWdCLENBQUMsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQ3JFO0tBQ0Y7SUFFRCxJQUFJLFFBQXdCLENBQUM7SUFDN0IsSUFBSTtRQUNGLG9EQUFvRDtRQUNwRCxRQUFRLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQzVCO0lBQUMsV0FBTSxHQUFHO0lBRVgsSUFBSSxLQUFxQixDQUFDO0lBQzFCLElBQUksUUFBUSxFQUFFO1FBQ1osSUFBSTtZQUNGLG9EQUFvRDtZQUNwRCxLQUFLLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQzNCO1FBQUMsV0FBTSxHQUFHO0tBQ1o7SUFFRCw0Q0FBNEM7SUFDNUMsTUFBTSxTQUFTLEdBQTBCO1FBQ3ZDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFO1FBQzNCO1lBQ0UsSUFBSSxFQUFFLGlCQUFpQjtZQUN2QixHQUFHLEVBQUUsQ0FBQztvQkFDSixNQUFNLEVBQUUsYUFBYTtvQkFDckIsT0FBTyxFQUFFO3dCQUNQLGNBQWMsRUFBRSxRQUFRO3dCQUN4QixLQUFLO3dCQUNMLFNBQVMsRUFBRSxZQUFZO3dCQUN2QixtREFBbUQ7d0JBQ25ELFNBQVMsRUFBRSxDQUFDO3dCQUNaLFlBQVk7cUJBQ2I7aUJBQ0YsQ0FBQztTQUNIO1FBQ0Q7WUFDRSxJQUFJLEVBQUUsU0FBUztZQUNmLEdBQUcsRUFBRSxDQUFDO29CQUNKLE1BQU0sRUFBRSxhQUFhO29CQUNyQixPQUFPLGtCQUNMLFNBQVMsRUFBRSxZQUFZLEVBQ3ZCLGlCQUFpQixFQUFFLElBQUksSUFDcEIsZUFBZSxDQUNuQjtpQkFDRixDQUFDO1NBQ0g7UUFDRDtZQUNFLElBQUksRUFBRSxTQUFTO1lBQ2YsR0FBRyxFQUFFLENBQUM7b0JBQ0osTUFBTSxFQUFFLGVBQWU7b0JBQ3ZCLE9BQU8sRUFBRTt3QkFDUCxTQUFTLEVBQUUsWUFBWTt3QkFDdkIsS0FBSyxFQUFFLFlBQVk7cUJBQ3BCO2lCQUNGLENBQUM7U0FDSDtLQUNGLENBQUM7SUFFRixvQ0FBb0M7SUFDcEMsTUFBTSxLQUFLLEdBQTBCLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNyRSxPQUFPLEVBQUUsZ0JBQWdCO1FBQ3pCLElBQUk7UUFDSixHQUFHLEVBQUU7WUFDSCxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUU7WUFDeEI7Z0JBQ0UsTUFBTSxFQUFFLGdCQUFnQjtnQkFDeEIsT0FBTyxFQUFFO29CQUNQLEtBQUssRUFBRSxVQUFVO29CQUNqQixPQUFPLEVBQUUsb0JBQW9CO29CQUM3QixTQUFTLEVBQUUsWUFBWSxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSztpQkFDN0U7YUFDRjtZQUNELEdBQUksR0FBd0I7U0FDN0I7S0FDRixDQUFDLENBQUMsQ0FBQztJQUVKLCtCQUErQjtJQUMvQixJQUFJLGdCQUFnQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDL0IsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFO1lBQzVDLE9BQU87Z0JBQ0wsT0FBTyxFQUFFLGdCQUFnQjtnQkFDekIsSUFBSTtnQkFDSixHQUFHLEVBQUU7b0JBQ0gsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxjQUFjO29CQUN0RSxzQkFBWTtvQkFDWjt3QkFDRSxNQUFNLEVBQUUsZ0JBQWdCO3dCQUN4QixPQUFPLEVBQUU7NEJBQ1AsS0FBSyxFQUFFLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsVUFBVTs0QkFDekQsT0FBTyxFQUFFLG9CQUFvQjs0QkFDN0IsU0FBUyxFQUFFLFlBQVk7bUNBQ2xCLENBQUMsWUFBWSxDQUFDLFVBQVU7bUNBQ3hCLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxNQUFNO2dDQUNqQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxZQUFZO3lCQUM1QjtxQkFDRjtvQkFDRCxHQUFJLEdBQXdCO2lCQUM3QjthQUNGLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ0w7SUFFRCxJQUFJLFlBQVksQ0FBQyxVQUFVLEVBQUU7UUFDM0IsWUFBWSxDQUFDLElBQUk7UUFDZixxREFBcUQ7UUFDckQsSUFBSSxvQkFBb0IsQ0FBQyxFQUFFLFFBQVEsRUFBRSxTQUFTLFVBQVUsQ0FBQyxPQUFPLE1BQU0sRUFBRSxDQUFDO1FBQ3pFLG9EQUFvRDtRQUNwRCxJQUFJLGtEQUF3QyxFQUFFLENBQy9DLENBQUM7S0FDSDtJQUVELE9BQU87UUFDTCxLQUFLLEVBQUUsV0FBVztRQUNsQixNQUFNLEVBQUUsRUFBRSxLQUFLLEVBQUU7UUFDakIsT0FBTyxFQUFFLFlBQVk7S0FDdEIsQ0FBQztBQUNKLENBQUM7QUF4TUQsMENBd01DIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgd2VicGFjayBmcm9tICd3ZWJwYWNrJztcbmltcG9ydCB7XG4gIFBvc3Rjc3NDbGlSZXNvdXJjZXMsXG4gIFJhd0Nzc0xvYWRlcixcbiAgUmVtb3ZlSGFzaFBsdWdpbixcbiAgU3VwcHJlc3NFeHRyYWN0ZWRUZXh0Q2h1bmtzV2VicGFja1BsdWdpbixcbn0gZnJvbSAnLi4vLi4vcGx1Z2lucy93ZWJwYWNrJztcbmltcG9ydCB7IFdlYnBhY2tDb25maWdPcHRpb25zIH0gZnJvbSAnLi4vYnVpbGQtb3B0aW9ucyc7XG5pbXBvcnQgeyBnZXRPdXRwdXRIYXNoRm9ybWF0LCBub3JtYWxpemVFeHRyYUVudHJ5UG9pbnRzIH0gZnJvbSAnLi91dGlscyc7XG5cbmNvbnN0IGF1dG9wcmVmaXhlciA9IHJlcXVpcmUoJ2F1dG9wcmVmaXhlcicpO1xuY29uc3QgTWluaUNzc0V4dHJhY3RQbHVnaW4gPSByZXF1aXJlKCdtaW5pLWNzcy1leHRyYWN0LXBsdWdpbicpO1xuY29uc3QgcG9zdGNzc0ltcG9ydHMgPSByZXF1aXJlKCdwb3N0Y3NzLWltcG9ydCcpO1xuXG4vKipcbiAqIEVudW1lcmF0ZSBsb2FkZXJzIGFuZCB0aGVpciBkZXBlbmRlbmNpZXMgZnJvbSB0aGlzIGZpbGUgdG8gbGV0IHRoZSBkZXBlbmRlbmN5IHZhbGlkYXRvclxuICoga25vdyB0aGV5IGFyZSB1c2VkLlxuICpcbiAqIHJlcXVpcmUoJ3N0eWxlLWxvYWRlcicpXG4gKiByZXF1aXJlKCdwb3N0Y3NzLWxvYWRlcicpXG4gKiByZXF1aXJlKCdzdHlsdXMnKVxuICogcmVxdWlyZSgnc3R5bHVzLWxvYWRlcicpXG4gKiByZXF1aXJlKCdsZXNzJylcbiAqIHJlcXVpcmUoJ2xlc3MtbG9hZGVyJylcbiAqIHJlcXVpcmUoJ25vZGUtc2FzcycpXG4gKiByZXF1aXJlKCdzYXNzLWxvYWRlcicpXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFN0eWxlc0NvbmZpZyh3Y286IFdlYnBhY2tDb25maWdPcHRpb25zKSB7XG4gIGNvbnN0IHsgcm9vdCwgYnVpbGRPcHRpb25zIH0gPSB3Y287XG4gIGNvbnN0IGVudHJ5UG9pbnRzOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZ1tdIH0gPSB7fTtcbiAgY29uc3QgZ2xvYmFsU3R5bGVQYXRoczogc3RyaW5nW10gPSBbXTtcbiAgY29uc3QgZXh0cmFQbHVnaW5zID0gW107XG5cbiAgY29uc3QgY3NzU291cmNlTWFwID0gYnVpbGRPcHRpb25zLnNvdXJjZU1hcC5zdHlsZXM7XG5cbiAgLy8gRGV0ZXJtaW5lIGhhc2hpbmcgZm9ybWF0LlxuICBjb25zdCBoYXNoRm9ybWF0ID0gZ2V0T3V0cHV0SGFzaEZvcm1hdChidWlsZE9wdGlvbnMub3V0cHV0SGFzaGluZyBhcyBzdHJpbmcpO1xuICAvLyBDb252ZXJ0IGFic29sdXRlIHJlc291cmNlIFVSTHMgdG8gYWNjb3VudCBmb3IgYmFzZS1ocmVmIGFuZCBkZXBsb3ktdXJsLlxuICBjb25zdCBiYXNlSHJlZiA9IGJ1aWxkT3B0aW9ucy5iYXNlSHJlZiB8fCAnJztcbiAgY29uc3QgZGVwbG95VXJsID0gYnVpbGRPcHRpb25zLmRlcGxveVVybCB8fCAnJztcbiAgY29uc3QgcmVzb3VyY2VzT3V0cHV0UGF0aCA9IGJ1aWxkT3B0aW9ucy5yZXNvdXJjZXNPdXRwdXRQYXRoIHx8ICcnO1xuXG4gIGNvbnN0IHBvc3Rjc3NQbHVnaW5DcmVhdG9yID0gZnVuY3Rpb24gKGxvYWRlcjogd2VicGFjay5sb2FkZXIuTG9hZGVyQ29udGV4dCkge1xuICAgIHJldHVybiBbXG4gICAgICBwb3N0Y3NzSW1wb3J0cyh7XG4gICAgICAgIHJlc29sdmU6ICh1cmw6IHN0cmluZykgPT4gdXJsLnN0YXJ0c1dpdGgoJ34nKSA/IHVybC5zdWJzdHIoMSkgOiB1cmwsXG4gICAgICAgIGxvYWQ6IChmaWxlbmFtZTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPHN0cmluZz4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgbG9hZGVyLmZzLnJlYWRGaWxlKGZpbGVuYW1lLCAoZXJyOiBFcnJvciwgZGF0YTogQnVmZmVyKSA9PiB7XG4gICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcblxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBkYXRhLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgIHJlc29sdmUoY29udGVudCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgIH0pLFxuICAgICAgUG9zdGNzc0NsaVJlc291cmNlcyh7XG4gICAgICAgIGJhc2VIcmVmLFxuICAgICAgICBkZXBsb3lVcmwsXG4gICAgICAgIHJlc291cmNlc091dHB1dFBhdGgsXG4gICAgICAgIGxvYWRlcixcbiAgICAgICAgZmlsZW5hbWU6IGBbbmFtZV0ke2hhc2hGb3JtYXQuZmlsZX0uW2V4dF1gLFxuICAgICAgfSksXG4gICAgICBhdXRvcHJlZml4ZXIoKSxcbiAgICBdO1xuICB9O1xuXG4gIC8vIHVzZSBpbmNsdWRlUGF0aHMgZnJvbSBhcHBDb25maWdcbiAgY29uc3QgaW5jbHVkZVBhdGhzOiBzdHJpbmdbXSA9IFtdO1xuICBsZXQgbGVzc1BhdGhPcHRpb25zOiB7IHBhdGhzPzogc3RyaW5nW10gfSA9IHt9O1xuXG4gIGlmIChidWlsZE9wdGlvbnMuc3R5bGVQcmVwcm9jZXNzb3JPcHRpb25zXG4gICAgJiYgYnVpbGRPcHRpb25zLnN0eWxlUHJlcHJvY2Vzc29yT3B0aW9ucy5pbmNsdWRlUGF0aHNcbiAgICAmJiBidWlsZE9wdGlvbnMuc3R5bGVQcmVwcm9jZXNzb3JPcHRpb25zLmluY2x1ZGVQYXRocy5sZW5ndGggPiAwXG4gICkge1xuICAgIGJ1aWxkT3B0aW9ucy5zdHlsZVByZXByb2Nlc3Nvck9wdGlvbnMuaW5jbHVkZVBhdGhzLmZvckVhY2goKGluY2x1ZGVQYXRoOiBzdHJpbmcpID0+XG4gICAgICBpbmNsdWRlUGF0aHMucHVzaChwYXRoLnJlc29sdmUocm9vdCwgaW5jbHVkZVBhdGgpKSk7XG4gICAgbGVzc1BhdGhPcHRpb25zID0ge1xuICAgICAgcGF0aHM6IGluY2x1ZGVQYXRocyxcbiAgICB9O1xuICB9XG5cbiAgLy8gUHJvY2VzcyBnbG9iYWwgc3R5bGVzLlxuICBpZiAoYnVpbGRPcHRpb25zLnN0eWxlcy5sZW5ndGggPiAwKSB7XG4gICAgY29uc3QgY2h1bmtOYW1lczogc3RyaW5nW10gPSBbXTtcblxuICAgIG5vcm1hbGl6ZUV4dHJhRW50cnlQb2ludHMoYnVpbGRPcHRpb25zLnN0eWxlcywgJ3N0eWxlcycpLmZvckVhY2goc3R5bGUgPT4ge1xuICAgICAgY29uc3QgcmVzb2x2ZWRQYXRoID0gcGF0aC5yZXNvbHZlKHJvb3QsIHN0eWxlLmlucHV0KTtcbiAgICAgIC8vIEFkZCBzdHlsZSBlbnRyeSBwb2ludHMuXG4gICAgICBpZiAoZW50cnlQb2ludHNbc3R5bGUuYnVuZGxlTmFtZV0pIHtcbiAgICAgICAgZW50cnlQb2ludHNbc3R5bGUuYnVuZGxlTmFtZV0ucHVzaChyZXNvbHZlZFBhdGgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZW50cnlQb2ludHNbc3R5bGUuYnVuZGxlTmFtZV0gPSBbcmVzb2x2ZWRQYXRoXTtcbiAgICAgIH1cblxuICAgICAgLy8gQWRkIGxhenkgc3R5bGVzIHRvIHRoZSBsaXN0LlxuICAgICAgaWYgKHN0eWxlLmxhenkpIHtcbiAgICAgICAgY2h1bmtOYW1lcy5wdXNoKHN0eWxlLmJ1bmRsZU5hbWUpO1xuICAgICAgfVxuXG4gICAgICAvLyBBZGQgZ2xvYmFsIGNzcyBwYXRocy5cbiAgICAgIGdsb2JhbFN0eWxlUGF0aHMucHVzaChyZXNvbHZlZFBhdGgpO1xuICAgIH0pO1xuXG4gICAgaWYgKGNodW5rTmFtZXMubGVuZ3RoID4gMCkge1xuICAgICAgLy8gQWRkIHBsdWdpbiB0byByZW1vdmUgaGFzaGVzIGZyb20gbGF6eSBzdHlsZXMuXG4gICAgICBleHRyYVBsdWdpbnMucHVzaChuZXcgUmVtb3ZlSGFzaFBsdWdpbih7IGNodW5rTmFtZXMsIGhhc2hGb3JtYXQgfSkpO1xuICAgIH1cbiAgfVxuXG4gIGxldCBkYXJ0U2Fzczoge30gfCB1bmRlZmluZWQ7XG4gIHRyeSB7XG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWltcGxpY2l0LWRlcGVuZGVuY2llc1xuICAgIGRhcnRTYXNzID0gcmVxdWlyZSgnc2FzcycpO1xuICB9IGNhdGNoIHsgfVxuXG4gIGxldCBmaWJlcjoge30gfCB1bmRlZmluZWQ7XG4gIGlmIChkYXJ0U2Fzcykge1xuICAgIHRyeSB7XG4gICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8taW1wbGljaXQtZGVwZW5kZW5jaWVzXG4gICAgICBmaWJlciA9IHJlcXVpcmUoJ2ZpYmVycycpO1xuICAgIH0gY2F0Y2ggeyB9XG4gIH1cblxuICAvLyBzZXQgYmFzZSBydWxlcyB0byBkZXJpdmUgZmluYWwgcnVsZXMgZnJvbVxuICBjb25zdCBiYXNlUnVsZXM6IHdlYnBhY2suUnVsZVNldFJ1bGVbXSA9IFtcbiAgICB7IHRlc3Q6IC9cXC5jc3MkLywgdXNlOiBbXSB9LFxuICAgIHtcbiAgICAgIHRlc3Q6IC9cXC5zY3NzJHxcXC5zYXNzJC8sXG4gICAgICB1c2U6IFt7XG4gICAgICAgIGxvYWRlcjogJ3Nhc3MtbG9hZGVyJyxcbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgIGltcGxlbWVudGF0aW9uOiBkYXJ0U2FzcyxcbiAgICAgICAgICBmaWJlcixcbiAgICAgICAgICBzb3VyY2VNYXA6IGNzc1NvdXJjZU1hcCxcbiAgICAgICAgICAvLyBib290c3RyYXAtc2FzcyByZXF1aXJlcyBhIG1pbmltdW0gcHJlY2lzaW9uIG9mIDhcbiAgICAgICAgICBwcmVjaXNpb246IDgsXG4gICAgICAgICAgaW5jbHVkZVBhdGhzLFxuICAgICAgICB9LFxuICAgICAgfV0sXG4gICAgfSxcbiAgICB7XG4gICAgICB0ZXN0OiAvXFwubGVzcyQvLFxuICAgICAgdXNlOiBbe1xuICAgICAgICBsb2FkZXI6ICdsZXNzLWxvYWRlcicsXG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICBzb3VyY2VNYXA6IGNzc1NvdXJjZU1hcCxcbiAgICAgICAgICBqYXZhc2NyaXB0RW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgICAuLi5sZXNzUGF0aE9wdGlvbnMsXG4gICAgICAgIH0sXG4gICAgICB9XSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHRlc3Q6IC9cXC5zdHlsJC8sXG4gICAgICB1c2U6IFt7XG4gICAgICAgIGxvYWRlcjogJ3N0eWx1cy1sb2FkZXInLFxuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgc291cmNlTWFwOiBjc3NTb3VyY2VNYXAsXG4gICAgICAgICAgcGF0aHM6IGluY2x1ZGVQYXRocyxcbiAgICAgICAgfSxcbiAgICAgIH1dLFxuICAgIH0sXG4gIF07XG5cbiAgLy8gbG9hZCBjb21wb25lbnQgY3NzIGFzIHJhdyBzdHJpbmdzXG4gIGNvbnN0IHJ1bGVzOiB3ZWJwYWNrLlJ1bGVTZXRSdWxlW10gPSBiYXNlUnVsZXMubWFwKCh7IHRlc3QsIHVzZSB9KSA9PiAoe1xuICAgIGV4Y2x1ZGU6IGdsb2JhbFN0eWxlUGF0aHMsXG4gICAgdGVzdCxcbiAgICB1c2U6IFtcbiAgICAgIHsgbG9hZGVyOiAncmF3LWxvYWRlcicgfSxcbiAgICAgIHtcbiAgICAgICAgbG9hZGVyOiAncG9zdGNzcy1sb2FkZXInLFxuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgaWRlbnQ6ICdlbWJlZGRlZCcsXG4gICAgICAgICAgcGx1Z2luczogcG9zdGNzc1BsdWdpbkNyZWF0b3IsXG4gICAgICAgICAgc291cmNlTWFwOiBjc3NTb3VyY2VNYXAgJiYgIWJ1aWxkT3B0aW9ucy5zb3VyY2VNYXAuaGlkZGVuID8gJ2lubGluZScgOiBmYWxzZSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICAuLi4odXNlIGFzIHdlYnBhY2suTG9hZGVyW10pLFxuICAgIF0sXG4gIH0pKTtcblxuICAvLyBsb2FkIGdsb2JhbCBjc3MgYXMgY3NzIGZpbGVzXG4gIGlmIChnbG9iYWxTdHlsZVBhdGhzLmxlbmd0aCA+IDApIHtcbiAgICBydWxlcy5wdXNoKC4uLmJhc2VSdWxlcy5tYXAoKHsgdGVzdCwgdXNlIH0pID0+IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGluY2x1ZGU6IGdsb2JhbFN0eWxlUGF0aHMsXG4gICAgICAgIHRlc3QsXG4gICAgICAgIHVzZTogW1xuICAgICAgICAgIGJ1aWxkT3B0aW9ucy5leHRyYWN0Q3NzID8gTWluaUNzc0V4dHJhY3RQbHVnaW4ubG9hZGVyIDogJ3N0eWxlLWxvYWRlcicsXG4gICAgICAgICAgUmF3Q3NzTG9hZGVyLFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGxvYWRlcjogJ3Bvc3Rjc3MtbG9hZGVyJyxcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgaWRlbnQ6IGJ1aWxkT3B0aW9ucy5leHRyYWN0Q3NzID8gJ2V4dHJhY3RlZCcgOiAnZW1iZWRkZWQnLFxuICAgICAgICAgICAgICBwbHVnaW5zOiBwb3N0Y3NzUGx1Z2luQ3JlYXRvcixcbiAgICAgICAgICAgICAgc291cmNlTWFwOiBjc3NTb3VyY2VNYXBcbiAgICAgICAgICAgICAgICAmJiAhYnVpbGRPcHRpb25zLmV4dHJhY3RDc3NcbiAgICAgICAgICAgICAgICAmJiAhYnVpbGRPcHRpb25zLnNvdXJjZU1hcC5oaWRkZW5cbiAgICAgICAgICAgICAgICA/ICdpbmxpbmUnIDogY3NzU291cmNlTWFwLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIC4uLih1c2UgYXMgd2VicGFjay5Mb2FkZXJbXSksXG4gICAgICAgIF0sXG4gICAgICB9O1xuICAgIH0pKTtcbiAgfVxuXG4gIGlmIChidWlsZE9wdGlvbnMuZXh0cmFjdENzcykge1xuICAgIGV4dHJhUGx1Z2lucy5wdXNoKFxuICAgICAgLy8gZXh0cmFjdCBnbG9iYWwgY3NzIGZyb20ganMgZmlsZXMgaW50byBvd24gY3NzIGZpbGVcbiAgICAgIG5ldyBNaW5pQ3NzRXh0cmFjdFBsdWdpbih7IGZpbGVuYW1lOiBgW25hbWVdJHtoYXNoRm9ybWF0LmV4dHJhY3R9LmNzc2AgfSksXG4gICAgICAvLyBzdXBwcmVzcyBlbXB0eSAuanMgZmlsZXMgaW4gY3NzIG9ubHkgZW50cnkgcG9pbnRzXG4gICAgICBuZXcgU3VwcHJlc3NFeHRyYWN0ZWRUZXh0Q2h1bmtzV2VicGFja1BsdWdpbigpLFxuICAgICk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGVudHJ5OiBlbnRyeVBvaW50cyxcbiAgICBtb2R1bGU6IHsgcnVsZXMgfSxcbiAgICBwbHVnaW5zOiBleHRyYVBsdWdpbnMsXG4gIH07XG59XG4iXX0=