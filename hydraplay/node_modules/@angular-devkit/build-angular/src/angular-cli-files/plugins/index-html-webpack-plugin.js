"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const crypto_1 = require("crypto");
const webpack_sources_1 = require("webpack-sources");
const parse5 = require('parse5');
function readFile(filename, compilation) {
    return new Promise((resolve, reject) => {
        compilation.inputFileSystem.readFile(filename, (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            let content;
            if (data.length >= 3 && data[0] === 0xEF && data[1] === 0xBB && data[2] === 0xBF) {
                // Strip UTF-8 BOM
                content = data.toString('utf8', 3);
            }
            else if (data.length >= 2 && data[0] === 0xFF && data[1] === 0xFE) {
                // Strip UTF-16 LE BOM
                content = data.toString('utf16le', 2);
            }
            else {
                content = data.toString();
            }
            resolve(content);
        });
    });
}
class IndexHtmlWebpackPlugin {
    constructor(options) {
        this._options = Object.assign({ input: 'index.html', output: 'index.html', entrypoints: ['polyfills', 'main'], noModuleEntrypoints: [], sri: false }, options);
    }
    apply(compiler) {
        compiler.hooks.emit.tapPromise('index-html-webpack-plugin', async (compilation) => {
            // Get input html file
            const inputContent = await readFile(this._options.input, compilation);
            compilation
                .fileDependencies.add(this._options.input);
            // Get all files for selected entrypoints
            const unfilteredSortedFiles = [];
            const noModuleFiles = new Set();
            const otherFiles = new Set();
            for (const entryName of this._options.entrypoints) {
                const entrypoint = compilation.entrypoints.get(entryName);
                if (entrypoint && entrypoint.getFiles) {
                    const files = entrypoint.getFiles() || [];
                    unfilteredSortedFiles.push(...files);
                    if (this._options.noModuleEntrypoints.includes(entryName)) {
                        files.forEach(file => noModuleFiles.add(file));
                    }
                    else {
                        files.forEach(file => otherFiles.add(file));
                    }
                }
            }
            // Clean out files that are used in all types of entrypoints
            otherFiles.forEach(file => noModuleFiles.delete(file));
            // Filter files
            const existingFiles = new Set();
            const stylesheets = [];
            const scripts = [];
            for (const file of unfilteredSortedFiles) {
                if (existingFiles.has(file)) {
                    continue;
                }
                existingFiles.add(file);
                if (file.endsWith('.js')) {
                    scripts.push(file);
                }
                else if (file.endsWith('.css')) {
                    stylesheets.push(file);
                }
            }
            // Find the head and body elements
            const treeAdapter = parse5.treeAdapters.default;
            const document = parse5.parse(inputContent, { treeAdapter, locationInfo: true });
            let headElement;
            let bodyElement;
            for (const docChild of document.childNodes) {
                if (docChild.tagName === 'html') {
                    for (const htmlChild of docChild.childNodes) {
                        if (htmlChild.tagName === 'head') {
                            headElement = htmlChild;
                        }
                        if (htmlChild.tagName === 'body') {
                            bodyElement = htmlChild;
                        }
                    }
                }
            }
            if (!headElement || !bodyElement) {
                throw new Error('Missing head and/or body elements');
            }
            // Determine script insertion point
            let scriptInsertionPoint;
            if (bodyElement.__location && bodyElement.__location.endTag) {
                scriptInsertionPoint = bodyElement.__location.endTag.startOffset;
            }
            else {
                // Less accurate fallback
                // parse5 4.x does not provide locations if malformed html is present
                scriptInsertionPoint = inputContent.indexOf('</body>');
            }
            let styleInsertionPoint;
            if (headElement.__location && headElement.__location.endTag) {
                styleInsertionPoint = headElement.__location.endTag.startOffset;
            }
            else {
                // Less accurate fallback
                // parse5 4.x does not provide locations if malformed html is present
                styleInsertionPoint = inputContent.indexOf('</head>');
            }
            // Inject into the html
            const indexSource = new webpack_sources_1.ReplaceSource(new webpack_sources_1.RawSource(inputContent), this._options.input);
            let scriptElements = '';
            for (const script of scripts) {
                const attrs = [
                    { name: 'type', value: 'text/javascript' },
                    { name: 'src', value: (this._options.deployUrl || '') + script },
                ];
                if (noModuleFiles.has(script)) {
                    attrs.push({ name: 'nomodule', value: null });
                }
                if (this._options.sri) {
                    const content = compilation.assets[script].source();
                    attrs.push(...this._generateSriAttributes(content));
                }
                const attributes = attrs
                    .map(attr => attr.value === null ? attr.name : `${attr.name}="${attr.value}"`)
                    .join(' ');
                scriptElements += `<script ${attributes}></script>`;
            }
            indexSource.insert(scriptInsertionPoint, scriptElements);
            // Adjust base href if specified
            if (typeof this._options.baseHref == 'string') {
                let baseElement;
                for (const headChild of headElement.childNodes) {
                    if (headChild.tagName === 'base') {
                        baseElement = headChild;
                    }
                }
                const baseFragment = treeAdapter.createDocumentFragment();
                if (!baseElement) {
                    baseElement = treeAdapter.createElement('base', undefined, [
                        { name: 'href', value: this._options.baseHref },
                    ]);
                    treeAdapter.appendChild(baseFragment, baseElement);
                    indexSource.insert(headElement.__location.startTag.endOffset, parse5.serialize(baseFragment, { treeAdapter }));
                }
                else {
                    let hrefAttribute;
                    for (const attribute of baseElement.attrs) {
                        if (attribute.name === 'href') {
                            hrefAttribute = attribute;
                        }
                    }
                    if (hrefAttribute) {
                        hrefAttribute.value = this._options.baseHref;
                    }
                    else {
                        baseElement.attrs.push({ name: 'href', value: this._options.baseHref });
                    }
                    treeAdapter.appendChild(baseFragment, baseElement);
                    indexSource.replace(baseElement.__location.startOffset, baseElement.__location.endOffset, parse5.serialize(baseFragment, { treeAdapter }));
                }
            }
            const styleElements = treeAdapter.createDocumentFragment();
            for (const stylesheet of stylesheets) {
                const attrs = [
                    { name: 'rel', value: 'stylesheet' },
                    { name: 'href', value: (this._options.deployUrl || '') + stylesheet },
                ];
                if (this._options.sri) {
                    const content = compilation.assets[stylesheet].source();
                    attrs.push(...this._generateSriAttributes(content));
                }
                const element = treeAdapter.createElement('link', undefined, attrs);
                treeAdapter.appendChild(styleElements, element);
            }
            indexSource.insert(styleInsertionPoint, parse5.serialize(styleElements, { treeAdapter }));
            // Add to compilation assets
            compilation.assets[this._options.output] = indexSource;
        });
    }
    _generateSriAttributes(content) {
        const algo = 'sha384';
        const hash = crypto_1.createHash(algo)
            .update(content, 'utf8')
            .digest('base64');
        return [
            { name: 'integrity', value: `${algo}-${hash}` },
            { name: 'crossorigin', value: 'anonymous' },
        ];
    }
}
exports.IndexHtmlWebpackPlugin = IndexHtmlWebpackPlugin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgtaHRtbC13ZWJwYWNrLXBsdWdpbi5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsicGFja2FnZXMvYW5ndWxhcl9kZXZraXQvYnVpbGRfYW5ndWxhci9zcmMvYW5ndWxhci1jbGktZmlsZXMvcGx1Z2lucy9pbmRleC1odG1sLXdlYnBhY2stcGx1Z2luLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7OztHQU1HO0FBQ0gsbUNBQW9DO0FBRXBDLHFEQUEyRDtBQUUzRCxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFZakMsU0FBUyxRQUFRLENBQUMsUUFBZ0IsRUFBRSxXQUFvQztJQUN0RSxPQUFPLElBQUksT0FBTyxDQUFTLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQzdDLFdBQVcsQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLEdBQVUsRUFBRSxJQUFZLEVBQUUsRUFBRTtZQUMxRSxJQUFJLEdBQUcsRUFBRTtnQkFDUCxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBRVosT0FBTzthQUNSO1lBRUQsSUFBSSxPQUFPLENBQUM7WUFDWixJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUFFO2dCQUNoRixrQkFBa0I7Z0JBQ2xCLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQzthQUNwQztpQkFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksRUFBRTtnQkFDbkUsc0JBQXNC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RUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFO1NBQzVDLENBQUM7SUFDSixDQUFDO0NBQ0Y7QUF4TkQsd0RBd05DIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHsgY3JlYXRlSGFzaCB9IGZyb20gJ2NyeXB0byc7XG5pbXBvcnQgeyBDb21waWxlciwgY29tcGlsYXRpb24gfSBmcm9tICd3ZWJwYWNrJztcbmltcG9ydCB7IFJhd1NvdXJjZSwgUmVwbGFjZVNvdXJjZSB9IGZyb20gJ3dlYnBhY2stc291cmNlcyc7XG5cbmNvbnN0IHBhcnNlNSA9IHJlcXVpcmUoJ3BhcnNlNScpO1xuXG5leHBvcnQgaW50ZXJmYWNlIEluZGV4SHRtbFdlYnBhY2tQbHVnaW5PcHRpb25zIHtcbiAgaW5wdXQ6IHN0cmluZztcbiAgb3V0cHV0OiBzdHJpbmc7XG4gIGJhc2VIcmVmPzogc3RyaW5nO1xuICBlbnRyeXBvaW50czogc3RyaW5nW107XG4gIGRlcGxveVVybD86IHN0cmluZztcbiAgc3JpOiBib29sZWFuO1xuICBub01vZHVsZUVudHJ5cG9pbnRzOiBzdHJpbmdbXTtcbn1cblxuZnVuY3Rpb24gcmVhZEZpbGUoZmlsZW5hbWU6IHN0cmluZywgY29tcGlsYXRpb246IGNvbXBpbGF0aW9uLkNvbXBpbGF0aW9uKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlPHN0cmluZz4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbXBpbGF0aW9uLmlucHV0RmlsZVN5c3RlbS5yZWFkRmlsZShmaWxlbmFtZSwgKGVycjogRXJyb3IsIGRhdGE6IEJ1ZmZlcikgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICByZWplY3QoZXJyKTtcblxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGxldCBjb250ZW50O1xuICAgICAgaWYgKGRhdGEubGVuZ3RoID49IDMgJiYgZGF0YVswXSA9PT0gMHhFRiAmJiBkYXRhWzFdID09PSAweEJCICYmIGRhdGFbMl0gPT09IDB4QkYpIHtcbiAgICAgICAgLy8gU3RyaXAgVVRGLTggQk9NXG4gICAgICAgIGNvbnRlbnQgPSBkYXRhLnRvU3RyaW5nKCd1dGY4JywgMyk7XG4gICAgICB9IGVsc2UgaWYgKGRhdGEubGVuZ3RoID49IDIgJiYgZGF0YVswXSA9PT0gMHhGRiAmJiBkYXRhWzFdID09PSAweEZFKSB7XG4gICAgICAgIC8vIFN0cmlwIFVURi0xNiBMRSBCT01cbiAgICAgICAgY29udGVudCA9IGRhdGEudG9TdHJpbmcoJ3V0ZjE2bGUnLCAyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnRlbnQgPSBkYXRhLnRvU3RyaW5nKCk7XG4gICAgICB9XG5cbiAgICAgIHJlc29sdmUoY29udGVudCk7XG4gICAgfSk7XG4gIH0pO1xufVxuXG5leHBvcnQgY2xhc3MgSW5kZXhIdG1sV2VicGFja1BsdWdpbiB7XG4gIHByaXZhdGUgX29wdGlvbnM6IEluZGV4SHRtbFdlYnBhY2tQbHVnaW5PcHRpb25zO1xuXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM/OiBQYXJ0aWFsPEluZGV4SHRtbFdlYnBhY2tQbHVnaW5PcHRpb25zPikge1xuICAgIHRoaXMuX29wdGlvbnMgPSB7XG4gICAgICBpbnB1dDogJ2luZGV4Lmh0bWwnLFxuICAgICAgb3V0cHV0OiAnaW5kZXguaHRtbCcsXG4gICAgICBlbnRyeXBvaW50czogWydwb2x5ZmlsbHMnLCAnbWFpbiddLFxuICAgICAgbm9Nb2R1bGVFbnRyeXBvaW50czogW10sXG4gICAgICBzcmk6IGZhbHNlLFxuICAgICAgLi4ub3B0aW9ucyxcbiAgICB9O1xuICB9XG5cbiAgYXBwbHkoY29tcGlsZXI6IENvbXBpbGVyKSB7XG4gICAgY29tcGlsZXIuaG9va3MuZW1pdC50YXBQcm9taXNlKCdpbmRleC1odG1sLXdlYnBhY2stcGx1Z2luJywgYXN5bmMgY29tcGlsYXRpb24gPT4ge1xuICAgICAgLy8gR2V0IGlucHV0IGh0bWwgZmlsZVxuICAgICAgY29uc3QgaW5wdXRDb250ZW50ID0gYXdhaXQgcmVhZEZpbGUodGhpcy5fb3B0aW9ucy5pbnB1dCwgY29tcGlsYXRpb24pO1xuICAgICAgKGNvbXBpbGF0aW9uIGFzIGNvbXBpbGF0aW9uLkNvbXBpbGF0aW9uICYgeyBmaWxlRGVwZW5kZW5jaWVzOiBTZXQ8c3RyaW5nPiB9KVxuICAgICAgICAuZmlsZURlcGVuZGVuY2llcy5hZGQodGhpcy5fb3B0aW9ucy5pbnB1dCk7XG5cblxuICAgICAgLy8gR2V0IGFsbCBmaWxlcyBmb3Igc2VsZWN0ZWQgZW50cnlwb2ludHNcbiAgICAgIGNvbnN0IHVuZmlsdGVyZWRTb3J0ZWRGaWxlczogc3RyaW5nW10gPSBbXTtcbiAgICAgIGNvbnN0IG5vTW9kdWxlRmlsZXMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICAgIGNvbnN0IG90aGVyRmlsZXMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICAgIGZvciAoY29uc3QgZW50cnlOYW1lIG9mIHRoaXMuX29wdGlvbnMuZW50cnlwb2ludHMpIHtcbiAgICAgICAgY29uc3QgZW50cnlwb2ludCA9IGNvbXBpbGF0aW9uLmVudHJ5cG9pbnRzLmdldChlbnRyeU5hbWUpO1xuICAgICAgICBpZiAoZW50cnlwb2ludCAmJiBlbnRyeXBvaW50LmdldEZpbGVzKSB7XG4gICAgICAgICAgY29uc3QgZmlsZXM6IHN0cmluZ1tdID0gZW50cnlwb2ludC5nZXRGaWxlcygpIHx8IFtdO1xuICAgICAgICAgIHVuZmlsdGVyZWRTb3J0ZWRGaWxlcy5wdXNoKC4uLmZpbGVzKTtcblxuICAgICAgICAgIGlmICh0aGlzLl9vcHRpb25zLm5vTW9kdWxlRW50cnlwb2ludHMuaW5jbHVkZXMoZW50cnlOYW1lKSkge1xuICAgICAgICAgICAgZmlsZXMuZm9yRWFjaChmaWxlID0+IG5vTW9kdWxlRmlsZXMuYWRkKGZpbGUpKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZmlsZXMuZm9yRWFjaChmaWxlID0+IG90aGVyRmlsZXMuYWRkKGZpbGUpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gQ2xlYW4gb3V0IGZpbGVzIHRoYXQgYXJlIHVzZWQgaW4gYWxsIHR5cGVzIG9mIGVudHJ5cG9pbnRzXG4gICAgICBvdGhlckZpbGVzLmZvckVhY2goZmlsZSA9PiBub01vZHVsZUZpbGVzLmRlbGV0ZShmaWxlKSk7XG5cbiAgICAgIC8vIEZpbHRlciBmaWxlc1xuICAgICAgY29uc3QgZXhpc3RpbmdGaWxlcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgY29uc3Qgc3R5bGVzaGVldHM6IHN0cmluZ1tdID0gW107XG4gICAgICBjb25zdCBzY3JpcHRzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgZm9yIChjb25zdCBmaWxlIG9mIHVuZmlsdGVyZWRTb3J0ZWRGaWxlcykge1xuICAgICAgICBpZiAoZXhpc3RpbmdGaWxlcy5oYXMoZmlsZSkpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBleGlzdGluZ0ZpbGVzLmFkZChmaWxlKTtcblxuICAgICAgICBpZiAoZmlsZS5lbmRzV2l0aCgnLmpzJykpIHtcbiAgICAgICAgICBzY3JpcHRzLnB1c2goZmlsZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZmlsZS5lbmRzV2l0aCgnLmNzcycpKSB7XG4gICAgICAgICAgc3R5bGVzaGVldHMucHVzaChmaWxlKTtcbiAgICAgICAgfVxuXG4gICAgICB9XG5cbiAgICAgIC8vIEZpbmQgdGhlIGhlYWQgYW5kIGJvZHkgZWxlbWVudHNcbiAgICAgIGNvbnN0IHRyZWVBZGFwdGVyID0gcGFyc2U1LnRyZWVBZGFwdGVycy5kZWZhdWx0O1xuICAgICAgY29uc3QgZG9jdW1lbnQgPSBwYXJzZTUucGFyc2UoaW5wdXRDb250ZW50LCB7IHRyZWVBZGFwdGVyLCBsb2NhdGlvbkluZm86IHRydWUgfSk7XG4gICAgICBsZXQgaGVhZEVsZW1lbnQ7XG4gICAgICBsZXQgYm9keUVsZW1lbnQ7XG4gICAgICBmb3IgKGNvbnN0IGRvY0NoaWxkIG9mIGRvY3VtZW50LmNoaWxkTm9kZXMpIHtcbiAgICAgICAgaWYgKGRvY0NoaWxkLnRhZ05hbWUgPT09ICdodG1sJykge1xuICAgICAgICAgIGZvciAoY29uc3QgaHRtbENoaWxkIG9mIGRvY0NoaWxkLmNoaWxkTm9kZXMpIHtcbiAgICAgICAgICAgIGlmIChodG1sQ2hpbGQudGFnTmFtZSA9PT0gJ2hlYWQnKSB7XG4gICAgICAgICAgICAgIGhlYWRFbGVtZW50ID0gaHRtbENoaWxkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGh0bWxDaGlsZC50YWdOYW1lID09PSAnYm9keScpIHtcbiAgICAgICAgICAgICAgYm9keUVsZW1lbnQgPSBodG1sQ2hpbGQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICghaGVhZEVsZW1lbnQgfHwgIWJvZHlFbGVtZW50KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTWlzc2luZyBoZWFkIGFuZC9vciBib2R5IGVsZW1lbnRzJyk7XG4gICAgICB9XG5cbiAgICAgIC8vIERldGVybWluZSBzY3JpcHQgaW5zZXJ0aW9uIHBvaW50XG4gICAgICBsZXQgc2NyaXB0SW5zZXJ0aW9uUG9pbnQ7XG4gICAgICBpZiAoYm9keUVsZW1lbnQuX19sb2NhdGlvbiAmJiBib2R5RWxlbWVudC5fX2xvY2F0aW9uLmVuZFRhZykge1xuICAgICAgICBzY3JpcHRJbnNlcnRpb25Qb2ludCA9IGJvZHlFbGVtZW50Ll9fbG9jYXRpb24uZW5kVGFnLnN0YXJ0T2Zmc2V0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gTGVzcyBhY2N1cmF0ZSBmYWxsYmFja1xuICAgICAgICAvLyBwYXJzZTUgNC54IGRvZXMgbm90IHByb3ZpZGUgbG9jYXRpb25zIGlmIG1hbGZvcm1lZCBodG1sIGlzIHByZXNlbnRcbiAgICAgICAgc2NyaXB0SW5zZXJ0aW9uUG9pbnQgPSBpbnB1dENvbnRlbnQuaW5kZXhPZignPC9ib2R5PicpO1xuICAgICAgfVxuXG4gICAgICBsZXQgc3R5bGVJbnNlcnRpb25Qb2ludDtcbiAgICAgIGlmIChoZWFkRWxlbWVudC5fX2xvY2F0aW9uICYmIGhlYWRFbGVtZW50Ll9fbG9jYXRpb24uZW5kVGFnKSB7XG4gICAgICAgIHN0eWxlSW5zZXJ0aW9uUG9pbnQgPSBoZWFkRWxlbWVudC5fX2xvY2F0aW9uLmVuZFRhZy5zdGFydE9mZnNldDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIExlc3MgYWNjdXJhdGUgZmFsbGJhY2tcbiAgICAgICAgLy8gcGFyc2U1IDQueCBkb2VzIG5vdCBwcm92aWRlIGxvY2F0aW9ucyBpZiBtYWxmb3JtZWQgaHRtbCBpcyBwcmVzZW50XG4gICAgICAgIHN0eWxlSW5zZXJ0aW9uUG9pbnQgPSBpbnB1dENvbnRlbnQuaW5kZXhPZignPC9oZWFkPicpO1xuICAgICAgfVxuXG4gICAgICAvLyBJbmplY3QgaW50byB0aGUgaHRtbFxuICAgICAgY29uc3QgaW5kZXhTb3VyY2UgPSBuZXcgUmVwbGFjZVNvdXJjZShuZXcgUmF3U291cmNlKGlucHV0Q29udGVudCksIHRoaXMuX29wdGlvbnMuaW5wdXQpO1xuXG4gICAgICBsZXQgc2NyaXB0RWxlbWVudHMgPSAnJztcbiAgICAgIGZvciAoY29uc3Qgc2NyaXB0IG9mIHNjcmlwdHMpIHtcbiAgICAgICAgY29uc3QgYXR0cnM6IHsgbmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nIHwgbnVsbCB9W10gPSBbXG4gICAgICAgICAgeyBuYW1lOiAndHlwZScsIHZhbHVlOiAndGV4dC9qYXZhc2NyaXB0JyB9LFxuICAgICAgICAgIHsgbmFtZTogJ3NyYycsIHZhbHVlOiAodGhpcy5fb3B0aW9ucy5kZXBsb3lVcmwgfHwgJycpICsgc2NyaXB0IH0sXG4gICAgICAgIF07XG5cbiAgICAgICAgaWYgKG5vTW9kdWxlRmlsZXMuaGFzKHNjcmlwdCkpIHtcbiAgICAgICAgICBhdHRycy5wdXNoKHsgbmFtZTogJ25vbW9kdWxlJywgdmFsdWU6IG51bGwgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fb3B0aW9ucy5zcmkpIHtcbiAgICAgICAgICBjb25zdCBjb250ZW50ID0gY29tcGlsYXRpb24uYXNzZXRzW3NjcmlwdF0uc291cmNlKCk7XG4gICAgICAgICAgYXR0cnMucHVzaCguLi50aGlzLl9nZW5lcmF0ZVNyaUF0dHJpYnV0ZXMoY29udGVudCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYXR0cmlidXRlcyA9IGF0dHJzXG4gICAgICAgICAgLm1hcChhdHRyID0+IGF0dHIudmFsdWUgPT09IG51bGwgPyBhdHRyLm5hbWUgOiBgJHthdHRyLm5hbWV9PVwiJHthdHRyLnZhbHVlfVwiYClcbiAgICAgICAgICAuam9pbignICcpO1xuICAgICAgICBzY3JpcHRFbGVtZW50cyArPSBgPHNjcmlwdCAke2F0dHJpYnV0ZXN9Pjwvc2NyaXB0PmA7XG4gICAgICB9XG5cbiAgICAgIGluZGV4U291cmNlLmluc2VydChcbiAgICAgICAgc2NyaXB0SW5zZXJ0aW9uUG9pbnQsXG4gICAgICAgIHNjcmlwdEVsZW1lbnRzLFxuICAgICAgKTtcblxuICAgICAgLy8gQWRqdXN0IGJhc2UgaHJlZiBpZiBzcGVjaWZpZWRcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5fb3B0aW9ucy5iYXNlSHJlZiA9PSAnc3RyaW5nJykge1xuICAgICAgICBsZXQgYmFzZUVsZW1lbnQ7XG4gICAgICAgIGZvciAoY29uc3QgaGVhZENoaWxkIG9mIGhlYWRFbGVtZW50LmNoaWxkTm9kZXMpIHtcbiAgICAgICAgICBpZiAoaGVhZENoaWxkLnRhZ05hbWUgPT09ICdiYXNlJykge1xuICAgICAgICAgICAgYmFzZUVsZW1lbnQgPSBoZWFkQ2hpbGQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYmFzZUZyYWdtZW50ID0gdHJlZUFkYXB0ZXIuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuXG4gICAgICAgIGlmICghYmFzZUVsZW1lbnQpIHtcbiAgICAgICAgICBiYXNlRWxlbWVudCA9IHRyZWVBZGFwdGVyLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnYmFzZScsXG4gICAgICAgICAgICB1bmRlZmluZWQsXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgIHsgbmFtZTogJ2hyZWYnLCB2YWx1ZTogdGhpcy5fb3B0aW9ucy5iYXNlSHJlZiB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICApO1xuXG4gICAgICAgICAgdHJlZUFkYXB0ZXIuYXBwZW5kQ2hpbGQoYmFzZUZyYWdtZW50LCBiYXNlRWxlbWVudCk7XG4gICAgICAgICAgaW5kZXhTb3VyY2UuaW5zZXJ0KFxuICAgICAgICAgICAgaGVhZEVsZW1lbnQuX19sb2NhdGlvbi5zdGFydFRhZy5lbmRPZmZzZXQsXG4gICAgICAgICAgICBwYXJzZTUuc2VyaWFsaXplKGJhc2VGcmFnbWVudCwgeyB0cmVlQWRhcHRlciB9KSxcbiAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxldCBocmVmQXR0cmlidXRlO1xuICAgICAgICAgIGZvciAoY29uc3QgYXR0cmlidXRlIG9mIGJhc2VFbGVtZW50LmF0dHJzKSB7XG4gICAgICAgICAgICBpZiAoYXR0cmlidXRlLm5hbWUgPT09ICdocmVmJykge1xuICAgICAgICAgICAgICBocmVmQXR0cmlidXRlID0gYXR0cmlidXRlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoaHJlZkF0dHJpYnV0ZSkge1xuICAgICAgICAgICAgaHJlZkF0dHJpYnV0ZS52YWx1ZSA9IHRoaXMuX29wdGlvbnMuYmFzZUhyZWY7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJhc2VFbGVtZW50LmF0dHJzLnB1c2goeyBuYW1lOiAnaHJlZicsIHZhbHVlOiB0aGlzLl9vcHRpb25zLmJhc2VIcmVmIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRyZWVBZGFwdGVyLmFwcGVuZENoaWxkKGJhc2VGcmFnbWVudCwgYmFzZUVsZW1lbnQpO1xuICAgICAgICAgIGluZGV4U291cmNlLnJlcGxhY2UoXG4gICAgICAgICAgICBiYXNlRWxlbWVudC5fX2xvY2F0aW9uLnN0YXJ0T2Zmc2V0LFxuICAgICAgICAgICAgYmFzZUVsZW1lbnQuX19sb2NhdGlvbi5lbmRPZmZzZXQsXG4gICAgICAgICAgICBwYXJzZTUuc2VyaWFsaXplKGJhc2VGcmFnbWVudCwgeyB0cmVlQWRhcHRlciB9KSxcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHN0eWxlRWxlbWVudHMgPSB0cmVlQWRhcHRlci5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgICBmb3IgKGNvbnN0IHN0eWxlc2hlZXQgb2Ygc3R5bGVzaGVldHMpIHtcbiAgICAgICAgY29uc3QgYXR0cnMgPSBbXG4gICAgICAgICAgeyBuYW1lOiAncmVsJywgdmFsdWU6ICdzdHlsZXNoZWV0JyB9LFxuICAgICAgICAgIHsgbmFtZTogJ2hyZWYnLCB2YWx1ZTogKHRoaXMuX29wdGlvbnMuZGVwbG95VXJsIHx8ICcnKSArIHN0eWxlc2hlZXQgfSxcbiAgICAgICAgXTtcblxuICAgICAgICBpZiAodGhpcy5fb3B0aW9ucy5zcmkpIHtcbiAgICAgICAgICBjb25zdCBjb250ZW50ID0gY29tcGlsYXRpb24uYXNzZXRzW3N0eWxlc2hlZXRdLnNvdXJjZSgpO1xuICAgICAgICAgIGF0dHJzLnB1c2goLi4udGhpcy5fZ2VuZXJhdGVTcmlBdHRyaWJ1dGVzKGNvbnRlbnQpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSB0cmVlQWRhcHRlci5jcmVhdGVFbGVtZW50KCdsaW5rJywgdW5kZWZpbmVkLCBhdHRycyk7XG4gICAgICAgIHRyZWVBZGFwdGVyLmFwcGVuZENoaWxkKHN0eWxlRWxlbWVudHMsIGVsZW1lbnQpO1xuICAgICAgfVxuXG4gICAgICBpbmRleFNvdXJjZS5pbnNlcnQoXG4gICAgICAgIHN0eWxlSW5zZXJ0aW9uUG9pbnQsXG4gICAgICAgIHBhcnNlNS5zZXJpYWxpemUoc3R5bGVFbGVtZW50cywgeyB0cmVlQWRhcHRlciB9KSxcbiAgICAgICk7XG5cbiAgICAgIC8vIEFkZCB0byBjb21waWxhdGlvbiBhc3NldHNcbiAgICAgIGNvbXBpbGF0aW9uLmFzc2V0c1t0aGlzLl9vcHRpb25zLm91dHB1dF0gPSBpbmRleFNvdXJjZTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2dlbmVyYXRlU3JpQXR0cmlidXRlcyhjb250ZW50OiBzdHJpbmcpIHtcbiAgICBjb25zdCBhbGdvID0gJ3NoYTM4NCc7XG4gICAgY29uc3QgaGFzaCA9IGNyZWF0ZUhhc2goYWxnbylcbiAgICAgIC51cGRhdGUoY29udGVudCwgJ3V0ZjgnKVxuICAgICAgLmRpZ2VzdCgnYmFzZTY0Jyk7XG5cbiAgICByZXR1cm4gW1xuICAgICAgeyBuYW1lOiAnaW50ZWdyaXR5JywgdmFsdWU6IGAke2FsZ299LSR7aGFzaH1gIH0sXG4gICAgICB7IG5hbWU6ICdjcm9zc29yaWdpbicsIHZhbHVlOiAnYW5vbnltb3VzJyB9LFxuICAgIF07XG4gIH1cbn1cbiJdfQ==