"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const http = require("http");
const https = require("https");
const Url = require("url");
/**
 * @deprecated
 */
function request(url, headers = {}) {
    return new Promise((resolve, reject) => {
        const u = Url.parse(url);
        const options = {
            hostname: u.hostname,
            protocol: u.protocol,
            host: u.host,
            port: u.port,
            path: u.path,
            headers: Object.assign({ 'Accept': 'text/html' }, headers),
        };
        function _callback(res) {
            if (!res.statusCode || res.statusCode >= 400) {
                // Consume the rest of the data to free memory.
                res.resume();
                reject(new Error(`Requesting "${url}" returned status code ${res.statusCode}.`));
            }
            else {
                res.setEncoding('utf8');
                let data = '';
                res.on('data', chunk => {
                    data += chunk;
                });
                res.on('end', () => {
                    try {
                        resolve(data);
                    }
                    catch (err) {
                        reject(err);
                    }
                });
            }
        }
        if (u.protocol == 'https:') {
            options.agent = new https.Agent({ rejectUnauthorized: false });
            https.get(options, _callback);
        }
        else if (u.protocol == 'http:') {
            http.get(options, _callback);
        }
        else {
            throw new Error(`Unknown protocol: ${JSON.stringify(u.protocol)}.`);
        }
    });
}
exports.request = request;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWVzdC5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsicGFja2FnZXMvYW5ndWxhcl9kZXZraXQvYXJjaGl0ZWN0L3Rlc3RpbmcvcmVxdWVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7R0FNRztBQUNILDZCQUE2QjtBQUM3QiwrQkFBK0I7QUFDL0IsMkJBQTJCO0FBRTNCOztHQUVHO0FBQ0gsU0FBZ0IsT0FBTyxDQUFDLEdBQVcsRUFBRSxPQUFPLEdBQUcsRUFBRTtJQUMvQyxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQ3JDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDekIsTUFBTSxPQUFPLEdBQXdCO1lBQ25DLFFBQVEsRUFBRSxDQUFDLENBQUMsUUFBUTtZQUNwQixRQUFRLEVBQUUsQ0FBQyxDQUFDLFFBQVE7WUFDcEIsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJO1lBQ1osSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJO1lBQ1osSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJO1lBQ1osT0FBTyxrQkFBSSxRQUFRLEVBQUUsV0FBVyxJQUFLLE9BQU8sQ0FBRTtTQUMvQyxDQUFDO1FBRUYsU0FBUyxTQUFTLENBQUMsR0FBeUI7WUFDMUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLElBQUksR0FBRyxDQUFDLFVBQVUsSUFBSSxHQUFHLEVBQUU7Z0JBQzVDLCtDQUErQztnQkFDL0MsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNiLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxlQUFlLEdBQUcsMEJBQTBCLEdBQUcsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUM7YUFDbEY7aUJBQU07Z0JBQ0wsR0FBRyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDeEIsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO2dCQUNkLEdBQUcsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxFQUFFO29CQUNyQixJQUFJLElBQUksS0FBSyxDQUFDO2dCQUNoQixDQUFDLENBQUMsQ0FBQztnQkFDSCxHQUFHLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUU7b0JBQ2pCLElBQUk7d0JBQ0YsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNmO29CQUFDLE9BQU8sR0FBRyxFQUFFO3dCQUNaLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztxQkFDYjtnQkFDSCxDQUFDLENBQUMsQ0FBQzthQUNKO1FBQ0gsQ0FBQztRQUVELElBQUksQ0FBQyxDQUFDLFFBQVEsSUFBSSxRQUFRLEVBQUU7WUFDMUIsT0FBTyxDQUFDLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxrQkFBa0IsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQy9ELEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1NBQy9CO2FBQU0sSUFBSSxDQUFDLENBQUMsUUFBUSxJQUFJLE9BQU8sRUFBRTtZQUNoQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztTQUM5QjthQUFNO1lBQ0wsTUFBTSxJQUFJLEtBQUssQ0FBQyxxQkFBcUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ3JFO0lBQ0gsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDO0FBMUNELDBCQTBDQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCAqIGFzIGh0dHAgZnJvbSAnaHR0cCc7XG5pbXBvcnQgKiBhcyBodHRwcyBmcm9tICdodHRwcyc7XG5pbXBvcnQgKiBhcyBVcmwgZnJvbSAndXJsJztcblxuLyoqXG4gKiBAZGVwcmVjYXRlZFxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVxdWVzdCh1cmw6IHN0cmluZywgaGVhZGVycyA9IHt9KTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCB1ID0gVXJsLnBhcnNlKHVybCk7XG4gICAgY29uc3Qgb3B0aW9uczogaHR0cC5SZXF1ZXN0T3B0aW9ucyA9IHtcbiAgICAgIGhvc3RuYW1lOiB1Lmhvc3RuYW1lLFxuICAgICAgcHJvdG9jb2w6IHUucHJvdG9jb2wsXG4gICAgICBob3N0OiB1Lmhvc3QsXG4gICAgICBwb3J0OiB1LnBvcnQsXG4gICAgICBwYXRoOiB1LnBhdGgsXG4gICAgICBoZWFkZXJzOiB7ICdBY2NlcHQnOiAndGV4dC9odG1sJywgLi4uaGVhZGVycyB9LFxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfY2FsbGJhY2socmVzOiBodHRwLkluY29taW5nTWVzc2FnZSkge1xuICAgICAgaWYgKCFyZXMuc3RhdHVzQ29kZSB8fCByZXMuc3RhdHVzQ29kZSA+PSA0MDApIHtcbiAgICAgICAgLy8gQ29uc3VtZSB0aGUgcmVzdCBvZiB0aGUgZGF0YSB0byBmcmVlIG1lbW9yeS5cbiAgICAgICAgcmVzLnJlc3VtZSgpO1xuICAgICAgICByZWplY3QobmV3IEVycm9yKGBSZXF1ZXN0aW5nIFwiJHt1cmx9XCIgcmV0dXJuZWQgc3RhdHVzIGNvZGUgJHtyZXMuc3RhdHVzQ29kZX0uYCkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzLnNldEVuY29kaW5nKCd1dGY4Jyk7XG4gICAgICAgIGxldCBkYXRhID0gJyc7XG4gICAgICAgIHJlcy5vbignZGF0YScsIGNodW5rID0+IHtcbiAgICAgICAgICBkYXRhICs9IGNodW5rO1xuICAgICAgICB9KTtcbiAgICAgICAgcmVzLm9uKCdlbmQnLCAoKSA9PiB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJlc29sdmUoZGF0YSk7XG4gICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh1LnByb3RvY29sID09ICdodHRwczonKSB7XG4gICAgICBvcHRpb25zLmFnZW50ID0gbmV3IGh0dHBzLkFnZW50KHsgcmVqZWN0VW5hdXRob3JpemVkOiBmYWxzZSB9KTtcbiAgICAgIGh0dHBzLmdldChvcHRpb25zLCBfY2FsbGJhY2spO1xuICAgIH0gZWxzZSBpZiAodS5wcm90b2NvbCA9PSAnaHR0cDonKSB7XG4gICAgICBodHRwLmdldChvcHRpb25zLCBfY2FsbGJhY2spO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gcHJvdG9jb2w6ICR7SlNPTi5zdHJpbmdpZnkodS5wcm90b2NvbCl9LmApO1xuICAgIH1cbiAgfSk7XG59XG4iXX0=