/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Used to resolve resource URLs on `@Component` when used with JIT compilation.
 *
 * Example:
 * ```
 * @Component({
 *   selector: 'my-comp',
 *   templateUrl: 'my-comp.html', // This requires asynchronous resolution
 * })
 * class MyComponent{
 * }
 *
 * // Calling `renderComponent` will fail because `renderComponent` is a synchronous process
 * // and `MyComponent`'s `@Component.templateUrl` needs to be resolved asynchronously.
 *
 * // Calling `resolveComponentResources()` will resolve `@Component.templateUrl` into
 * // `@Component.template`, which allows `renderComponent` to proceed in a synchronous manner.
 *
 * // Use browser's `fetch()` function as the default resource resolution strategy.
 * resolveComponentResources(fetch).then(() => {
 *   // After resolution all URLs have been converted into `template` strings.
 *   renderComponent(MyComponent);
 * });
 *
 * ```
 *
 * NOTE: In AOT the resolution happens during compilation, and so there should be no need
 * to call this method outside JIT mode.
 *
 * @param resourceResolver a function which is responsible for returning a `Promise` to the
 * contents of the resolved URL. Browser's `fetch()` method is a good default implementation.
 */
export function resolveComponentResources(resourceResolver) {
    // Store all promises which are fetching the resources.
    var urlFetches = [];
    // Cache so that we don't fetch the same resource more than once.
    var urlMap = new Map();
    function cachedResourceResolve(url) {
        var promise = urlMap.get(url);
        if (!promise) {
            var resp = resourceResolver(url);
            urlMap.set(url, promise = resp.then(unwrapResponse));
            urlFetches.push(promise);
        }
        return promise;
    }
    componentResourceResolutionQueue.forEach(function (component) {
        if (component.templateUrl) {
            cachedResourceResolve(component.templateUrl).then(function (template) {
                component.template = template;
                component.templateUrl = undefined;
            });
        }
        var styleUrls = component.styleUrls;
        var styles = component.styles || (component.styles = []);
        var styleOffset = component.styles.length;
        styleUrls && styleUrls.forEach(function (styleUrl, index) {
            styles.push(''); // pre-allocate array.
            cachedResourceResolve(styleUrl).then(function (style) {
                styles[styleOffset + index] = style;
                styleUrls.splice(styleUrls.indexOf(styleUrl), 1);
                if (styleUrls.length == 0) {
                    component.styleUrls = undefined;
                }
            });
        });
    });
    componentResourceResolutionQueue.clear();
    return Promise.all(urlFetches).then(function () { return null; });
}
var componentResourceResolutionQueue = new Set();
export function maybeQueueResolutionOfComponentResources(metadata) {
    if (componentNeedsResolution(metadata)) {
        componentResourceResolutionQueue.add(metadata);
    }
}
export function componentNeedsResolution(component) {
    return component.templateUrl || component.styleUrls && component.styleUrls.length;
}
export function clearResolutionOfComponentResourcesQueue() {
    componentResourceResolutionQueue.clear();
}
function unwrapResponse(response) {
    return typeof response == 'string' ? response : response.text();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2VfbG9hZGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL21ldGFkYXRhL3Jlc291cmNlX2xvYWRpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBS0g7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0ErQkc7QUFDSCxNQUFNLFVBQVUseUJBQXlCLENBQ3JDLGdCQUE4RTtJQUNoRix1REFBdUQ7SUFDdkQsSUFBTSxVQUFVLEdBQXNCLEVBQUUsQ0FBQztJQUV6QyxpRUFBaUU7SUFDakUsSUFBTSxNQUFNLEdBQUcsSUFBSSxHQUFHLEVBQTJCLENBQUM7SUFDbEQsU0FBUyxxQkFBcUIsQ0FBQyxHQUFXO1FBQ3hDLElBQUksT0FBTyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDOUIsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNaLElBQU0sSUFBSSxHQUFHLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ25DLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7WUFDckQsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUMxQjtRQUNELE9BQU8sT0FBTyxDQUFDO0lBQ2pCLENBQUM7SUFFRCxnQ0FBZ0MsQ0FBQyxPQUFPLENBQUMsVUFBQyxTQUFvQjtRQUM1RCxJQUFJLFNBQVMsQ0FBQyxXQUFXLEVBQUU7WUFDekIscUJBQXFCLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLFFBQVE7Z0JBQ3pELFNBQVMsQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO2dCQUM5QixTQUFTLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQztZQUNwQyxDQUFDLENBQUMsQ0FBQztTQUNKO1FBQ0QsSUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQztRQUN0QyxJQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUMsQ0FBQztRQUMzRCxJQUFNLFdBQVcsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUM1QyxTQUFTLElBQUksU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFDLFFBQVEsRUFBRSxLQUFLO1lBQzdDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBRSxzQkFBc0I7WUFDeEMscUJBQXFCLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUMsS0FBSztnQkFDekMsTUFBTSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUM7Z0JBQ3BDLFNBQVMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDakQsSUFBSSxTQUFTLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtvQkFDekIsU0FBUyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7aUJBQ2pDO1lBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0gsZ0NBQWdDLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDekMsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFNLE9BQUEsSUFBSSxFQUFKLENBQUksQ0FBQyxDQUFDO0FBQ2xELENBQUM7QUFFRCxJQUFNLGdDQUFnQyxHQUFtQixJQUFJLEdBQUcsRUFBRSxDQUFDO0FBRW5FLE1BQU0sVUFBVSx3Q0FBd0MsQ0FBQyxRQUFtQjtJQUMxRSxJQUFJLHdCQUF3QixDQUFDLFFBQVEsQ0FBQyxFQUFFO1FBQ3RDLGdDQUFnQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUNoRDtBQUNILENBQUM7QUFFRCxNQUFNLFVBQVUsd0JBQXdCLENBQUMsU0FBb0I7SUFDM0QsT0FBTyxTQUFTLENBQUMsV0FBVyxJQUFJLFNBQVMsQ0FBQyxTQUFTLElBQUksU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFDcEYsQ0FBQztBQUNELE1BQU0sVUFBVSx3Q0FBd0M7SUFDdEQsZ0NBQWdDLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDM0MsQ0FBQztBQUVELFNBQVMsY0FBYyxDQUFDLFFBQTRDO0lBQ2xFLE9BQU8sT0FBTyxRQUFRLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNsRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnLi9kaXJlY3RpdmVzJztcblxuXG4vKipcbiAqIFVzZWQgdG8gcmVzb2x2ZSByZXNvdXJjZSBVUkxzIG9uIGBAQ29tcG9uZW50YCB3aGVuIHVzZWQgd2l0aCBKSVQgY29tcGlsYXRpb24uXG4gKlxuICogRXhhbXBsZTpcbiAqIGBgYFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnbXktY29tcCcsXG4gKiAgIHRlbXBsYXRlVXJsOiAnbXktY29tcC5odG1sJywgLy8gVGhpcyByZXF1aXJlcyBhc3luY2hyb25vdXMgcmVzb2x1dGlvblxuICogfSlcbiAqIGNsYXNzIE15Q29tcG9uZW50e1xuICogfVxuICpcbiAqIC8vIENhbGxpbmcgYHJlbmRlckNvbXBvbmVudGAgd2lsbCBmYWlsIGJlY2F1c2UgYHJlbmRlckNvbXBvbmVudGAgaXMgYSBzeW5jaHJvbm91cyBwcm9jZXNzXG4gKiAvLyBhbmQgYE15Q29tcG9uZW50YCdzIGBAQ29tcG9uZW50LnRlbXBsYXRlVXJsYCBuZWVkcyB0byBiZSByZXNvbHZlZCBhc3luY2hyb25vdXNseS5cbiAqXG4gKiAvLyBDYWxsaW5nIGByZXNvbHZlQ29tcG9uZW50UmVzb3VyY2VzKClgIHdpbGwgcmVzb2x2ZSBgQENvbXBvbmVudC50ZW1wbGF0ZVVybGAgaW50b1xuICogLy8gYEBDb21wb25lbnQudGVtcGxhdGVgLCB3aGljaCBhbGxvd3MgYHJlbmRlckNvbXBvbmVudGAgdG8gcHJvY2VlZCBpbiBhIHN5bmNocm9ub3VzIG1hbm5lci5cbiAqXG4gKiAvLyBVc2UgYnJvd3NlcidzIGBmZXRjaCgpYCBmdW5jdGlvbiBhcyB0aGUgZGVmYXVsdCByZXNvdXJjZSByZXNvbHV0aW9uIHN0cmF0ZWd5LlxuICogcmVzb2x2ZUNvbXBvbmVudFJlc291cmNlcyhmZXRjaCkudGhlbigoKSA9PiB7XG4gKiAgIC8vIEFmdGVyIHJlc29sdXRpb24gYWxsIFVSTHMgaGF2ZSBiZWVuIGNvbnZlcnRlZCBpbnRvIGB0ZW1wbGF0ZWAgc3RyaW5ncy5cbiAqICAgcmVuZGVyQ29tcG9uZW50KE15Q29tcG9uZW50KTtcbiAqIH0pO1xuICpcbiAqIGBgYFxuICpcbiAqIE5PVEU6IEluIEFPVCB0aGUgcmVzb2x1dGlvbiBoYXBwZW5zIGR1cmluZyBjb21waWxhdGlvbiwgYW5kIHNvIHRoZXJlIHNob3VsZCBiZSBubyBuZWVkXG4gKiB0byBjYWxsIHRoaXMgbWV0aG9kIG91dHNpZGUgSklUIG1vZGUuXG4gKlxuICogQHBhcmFtIHJlc291cmNlUmVzb2x2ZXIgYSBmdW5jdGlvbiB3aGljaCBpcyByZXNwb25zaWJsZSBmb3IgcmV0dXJuaW5nIGEgYFByb21pc2VgIHRvIHRoZVxuICogY29udGVudHMgb2YgdGhlIHJlc29sdmVkIFVSTC4gQnJvd3NlcidzIGBmZXRjaCgpYCBtZXRob2QgaXMgYSBnb29kIGRlZmF1bHQgaW1wbGVtZW50YXRpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlQ29tcG9uZW50UmVzb3VyY2VzKFxuICAgIHJlc291cmNlUmVzb2x2ZXI6ICh1cmw6IHN0cmluZykgPT4gKFByb21pc2U8c3RyaW5nfHt0ZXh0KCk6IFByb21pc2U8c3RyaW5nPn0+KSk6IFByb21pc2U8bnVsbD4ge1xuICAvLyBTdG9yZSBhbGwgcHJvbWlzZXMgd2hpY2ggYXJlIGZldGNoaW5nIHRoZSByZXNvdXJjZXMuXG4gIGNvbnN0IHVybEZldGNoZXM6IFByb21pc2U8c3RyaW5nPltdID0gW107XG5cbiAgLy8gQ2FjaGUgc28gdGhhdCB3ZSBkb24ndCBmZXRjaCB0aGUgc2FtZSByZXNvdXJjZSBtb3JlIHRoYW4gb25jZS5cbiAgY29uc3QgdXJsTWFwID0gbmV3IE1hcDxzdHJpbmcsIFByb21pc2U8c3RyaW5nPj4oKTtcbiAgZnVuY3Rpb24gY2FjaGVkUmVzb3VyY2VSZXNvbHZlKHVybDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBsZXQgcHJvbWlzZSA9IHVybE1hcC5nZXQodXJsKTtcbiAgICBpZiAoIXByb21pc2UpIHtcbiAgICAgIGNvbnN0IHJlc3AgPSByZXNvdXJjZVJlc29sdmVyKHVybCk7XG4gICAgICB1cmxNYXAuc2V0KHVybCwgcHJvbWlzZSA9IHJlc3AudGhlbih1bndyYXBSZXNwb25zZSkpO1xuICAgICAgdXJsRmV0Y2hlcy5wdXNoKHByb21pc2UpO1xuICAgIH1cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuXG4gIGNvbXBvbmVudFJlc291cmNlUmVzb2x1dGlvblF1ZXVlLmZvckVhY2goKGNvbXBvbmVudDogQ29tcG9uZW50KSA9PiB7XG4gICAgaWYgKGNvbXBvbmVudC50ZW1wbGF0ZVVybCkge1xuICAgICAgY2FjaGVkUmVzb3VyY2VSZXNvbHZlKGNvbXBvbmVudC50ZW1wbGF0ZVVybCkudGhlbigodGVtcGxhdGUpID0+IHtcbiAgICAgICAgY29tcG9uZW50LnRlbXBsYXRlID0gdGVtcGxhdGU7XG4gICAgICAgIGNvbXBvbmVudC50ZW1wbGF0ZVVybCA9IHVuZGVmaW5lZDtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBjb25zdCBzdHlsZVVybHMgPSBjb21wb25lbnQuc3R5bGVVcmxzO1xuICAgIGNvbnN0IHN0eWxlcyA9IGNvbXBvbmVudC5zdHlsZXMgfHwgKGNvbXBvbmVudC5zdHlsZXMgPSBbXSk7XG4gICAgY29uc3Qgc3R5bGVPZmZzZXQgPSBjb21wb25lbnQuc3R5bGVzLmxlbmd0aDtcbiAgICBzdHlsZVVybHMgJiYgc3R5bGVVcmxzLmZvckVhY2goKHN0eWxlVXJsLCBpbmRleCkgPT4ge1xuICAgICAgc3R5bGVzLnB1c2goJycpOyAgLy8gcHJlLWFsbG9jYXRlIGFycmF5LlxuICAgICAgY2FjaGVkUmVzb3VyY2VSZXNvbHZlKHN0eWxlVXJsKS50aGVuKChzdHlsZSkgPT4ge1xuICAgICAgICBzdHlsZXNbc3R5bGVPZmZzZXQgKyBpbmRleF0gPSBzdHlsZTtcbiAgICAgICAgc3R5bGVVcmxzLnNwbGljZShzdHlsZVVybHMuaW5kZXhPZihzdHlsZVVybCksIDEpO1xuICAgICAgICBpZiAoc3R5bGVVcmxzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgY29tcG9uZW50LnN0eWxlVXJscyA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuICBjb21wb25lbnRSZXNvdXJjZVJlc29sdXRpb25RdWV1ZS5jbGVhcigpO1xuICByZXR1cm4gUHJvbWlzZS5hbGwodXJsRmV0Y2hlcykudGhlbigoKSA9PiBudWxsKTtcbn1cblxuY29uc3QgY29tcG9uZW50UmVzb3VyY2VSZXNvbHV0aW9uUXVldWU6IFNldDxDb21wb25lbnQ+ID0gbmV3IFNldCgpO1xuXG5leHBvcnQgZnVuY3Rpb24gbWF5YmVRdWV1ZVJlc29sdXRpb25PZkNvbXBvbmVudFJlc291cmNlcyhtZXRhZGF0YTogQ29tcG9uZW50KSB7XG4gIGlmIChjb21wb25lbnROZWVkc1Jlc29sdXRpb24obWV0YWRhdGEpKSB7XG4gICAgY29tcG9uZW50UmVzb3VyY2VSZXNvbHV0aW9uUXVldWUuYWRkKG1ldGFkYXRhKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcG9uZW50TmVlZHNSZXNvbHV0aW9uKGNvbXBvbmVudDogQ29tcG9uZW50KSB7XG4gIHJldHVybiBjb21wb25lbnQudGVtcGxhdGVVcmwgfHwgY29tcG9uZW50LnN0eWxlVXJscyAmJiBjb21wb25lbnQuc3R5bGVVcmxzLmxlbmd0aDtcbn1cbmV4cG9ydCBmdW5jdGlvbiBjbGVhclJlc29sdXRpb25PZkNvbXBvbmVudFJlc291cmNlc1F1ZXVlKCkge1xuICBjb21wb25lbnRSZXNvdXJjZVJlc29sdXRpb25RdWV1ZS5jbGVhcigpO1xufVxuXG5mdW5jdGlvbiB1bndyYXBSZXNwb25zZShyZXNwb25zZTogc3RyaW5nIHwge3RleHQoKTogUHJvbWlzZTxzdHJpbmc+fSk6IHN0cmluZ3xQcm9taXNlPHN0cmluZz4ge1xuICByZXR1cm4gdHlwZW9mIHJlc3BvbnNlID09ICdzdHJpbmcnID8gcmVzcG9uc2UgOiByZXNwb25zZS50ZXh0KCk7XG59Il19