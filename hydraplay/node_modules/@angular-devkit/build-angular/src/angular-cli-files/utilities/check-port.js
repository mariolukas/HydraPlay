"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const net = require("net");
function checkPort(port, host, basePort = 49152) {
    return new Promise((resolve, reject) => {
        function _getPort(portNumber) {
            if (portNumber > 65535) {
                reject(new Error(`There is no port available.`));
            }
            const server = net.createServer();
            server.once('error', (err) => {
                if (err.code !== 'EADDRINUSE') {
                    reject(err);
                }
                else if (port === 0) {
                    _getPort(portNumber + 1);
                }
                else {
                    // If the port isn't available and we weren't looking for any port, throw error.
                    reject(new Error(`Port ${port} is already in use. Use '--port' to specify a different port.`));
                }
            })
                .once('listening', () => {
                server.close();
                resolve(portNumber);
            })
                .listen(portNumber, host);
        }
        _getPort(port || basePort);
    });
}
exports.checkPort = checkPort;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2stcG9ydC5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsicGFja2FnZXMvYW5ndWxhcl9kZXZraXQvYnVpbGRfYW5ndWxhci9zcmMvYW5ndWxhci1jbGktZmlsZXMvdXRpbGl0aWVzL2NoZWNrLXBvcnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7O0dBTUc7QUFDSCwyQkFBMkI7QUFFM0IsU0FBZ0IsU0FBUyxDQUFDLElBQVksRUFBRSxJQUFZLEVBQUUsUUFBUSxHQUFHLEtBQUs7SUFDcEUsT0FBTyxJQUFJLE9BQU8sQ0FBUyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUM3QyxTQUFTLFFBQVEsQ0FBQyxVQUFrQjtZQUNsQyxJQUFJLFVBQVUsR0FBRyxLQUFLLEVBQUU7Z0JBQ3RCLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDLENBQUM7YUFDbEQ7WUFFRCxNQUFNLE1BQU0sR0FBRyxHQUFHLENBQUMsWUFBWSxFQUFFLENBQUM7WUFFbEMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUEyQixFQUFFLEVBQUU7Z0JBQ25ELElBQUksR0FBRyxDQUFDLElBQUksS0FBSyxZQUFZLEVBQUU7b0JBQzdCLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztpQkFDYjtxQkFBTSxJQUFJLElBQUksS0FBSyxDQUFDLEVBQUU7b0JBQ3JCLFFBQVEsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUM7aUJBQzFCO3FCQUFNO29CQUNMLGdGQUFnRjtvQkFDaEYsTUFBTSxDQUNKLElBQUksS0FBSyxDQUFDLFFBQVEsSUFBSSwrREFBK0QsQ0FBQyxDQUN2RixDQUFDO2lCQUNIO1lBQ0gsQ0FBQyxDQUFDO2lCQUNELElBQUksQ0FBQyxXQUFXLEVBQUUsR0FBRyxFQUFFO2dCQUN0QixNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ2YsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3RCLENBQUMsQ0FBQztpQkFDRCxNQUFNLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzVCLENBQUM7UUFFRCxRQUFRLENBQUMsSUFBSSxJQUFJLFFBQVEsQ0FBQyxDQUFDO0lBQzdCLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQTlCRCw4QkE4QkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgKiBhcyBuZXQgZnJvbSAnbmV0JztcblxuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrUG9ydChwb3J0OiBudW1iZXIsIGhvc3Q6IHN0cmluZywgYmFzZVBvcnQgPSA0OTE1Mik6IFByb21pc2U8bnVtYmVyPiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZTxudW1iZXI+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBmdW5jdGlvbiBfZ2V0UG9ydChwb3J0TnVtYmVyOiBudW1iZXIpIHtcbiAgICAgIGlmIChwb3J0TnVtYmVyID4gNjU1MzUpIHtcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgVGhlcmUgaXMgbm8gcG9ydCBhdmFpbGFibGUuYCkpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBzZXJ2ZXIgPSBuZXQuY3JlYXRlU2VydmVyKCk7XG5cbiAgICAgIHNlcnZlci5vbmNlKCdlcnJvcicsIChlcnI6IEVycm9yICYge2NvZGU6IHN0cmluZ30pID0+IHtcbiAgICAgICAgaWYgKGVyci5jb2RlICE9PSAnRUFERFJJTlVTRScpIHtcbiAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgfSBlbHNlIGlmIChwb3J0ID09PSAwKSB7XG4gICAgICAgICAgX2dldFBvcnQocG9ydE51bWJlciArIDEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIElmIHRoZSBwb3J0IGlzbid0IGF2YWlsYWJsZSBhbmQgd2Ugd2VyZW4ndCBsb29raW5nIGZvciBhbnkgcG9ydCwgdGhyb3cgZXJyb3IuXG4gICAgICAgICAgcmVqZWN0KFxuICAgICAgICAgICAgbmV3IEVycm9yKGBQb3J0ICR7cG9ydH0gaXMgYWxyZWFkeSBpbiB1c2UuIFVzZSAnLS1wb3J0JyB0byBzcGVjaWZ5IGEgZGlmZmVyZW50IHBvcnQuYCksXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC5vbmNlKCdsaXN0ZW5pbmcnLCAoKSA9PiB7XG4gICAgICAgIHNlcnZlci5jbG9zZSgpO1xuICAgICAgICByZXNvbHZlKHBvcnROdW1iZXIpO1xuICAgICAgfSlcbiAgICAgIC5saXN0ZW4ocG9ydE51bWJlciwgaG9zdCk7XG4gICAgfVxuXG4gICAgX2dldFBvcnQocG9ydCB8fCBiYXNlUG9ydCk7XG4gIH0pO1xufVxuIl19