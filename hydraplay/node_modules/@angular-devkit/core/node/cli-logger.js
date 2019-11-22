"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const operators_1 = require("rxjs/operators");
const src_1 = require("../src");
/**
 * A Logger that sends information to STDOUT and STDERR.
 */
function createConsoleLogger(verbose = false, stdout = process.stdout, stderr = process.stderr) {
    const logger = new src_1.logging.IndentLogger('cling');
    logger
        .pipe(operators_1.filter(entry => (entry.level != 'debug' || verbose)))
        .subscribe(entry => {
        let color = src_1.terminal.dim;
        let output = stdout;
        switch (entry.level) {
            case 'info':
                color = s => s;
                break;
            case 'warn':
                color = (s) => src_1.terminal.bold(src_1.terminal.yellow(s));
                output = stderr;
                break;
            case 'fatal':
            case 'error':
                color = (s) => src_1.terminal.bold(src_1.terminal.red(s));
                output = stderr;
                break;
        }
        // If we do console.log(message) or process.stdout.write(message + '\n'), the process might
        // stop before the whole message is written and the stream is flushed. This happens when
        // streams are asynchronous.
        //
        // NodeJS IO streams are different depending on platform and usage. In POSIX environment,
        // for example, they're asynchronous when writing to a pipe, but synchronous when writing
        // to a TTY. In windows, it's the other way around. You can verify which is which with
        // stream.isTTY and platform, but this is not good enough.
        // In the async case, one should wait for the callback before sending more data or
        // continuing the process. In our case it would be rather hard to do (but not impossible).
        //
        // Instead we take the easy way out and simply chunk the message and call the write
        // function while the buffer drain itself asynchronously. With a smaller chunk size than
        // the buffer, we are mostly certain that it works. In this case, the chunk has been picked
        // as half a page size (4096/2 = 2048), minus some bytes for the color formatting.
        // On POSIX it seems the buffer is 2 pages (8192), but just to be sure (could be different
        // by platform).
        //
        // For more details, see https://nodejs.org/api/process.html#process_a_note_on_process_i_o
        const chunkSize = 2000; // Small chunk.
        let message = entry.message;
        while (message) {
            const chunk = message.slice(0, chunkSize);
            message = message.slice(chunkSize);
            output.write(color(chunk));
        }
        output.write('\n');
    });
    return logger;
}
exports.createConsoleLogger = createConsoleLogger;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLWxvZ2dlci5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsicGFja2FnZXMvYW5ndWxhcl9kZXZraXQvY29yZS9ub2RlL2NsaS1sb2dnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7O0dBTUc7QUFDSCw4Q0FBd0M7QUFDeEMsZ0NBQTJDO0FBTTNDOztHQUVHO0FBQ0gsU0FBZ0IsbUJBQW1CLENBQ2pDLE9BQU8sR0FBRyxLQUFLLEVBQ2YsU0FBd0IsT0FBTyxDQUFDLE1BQU0sRUFDdEMsU0FBd0IsT0FBTyxDQUFDLE1BQU07SUFFdEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxhQUFPLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBRWpELE1BQU07U0FDSCxJQUFJLENBQUMsa0JBQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssSUFBSSxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQztTQUMxRCxTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDakIsSUFBSSxLQUFLLEdBQUcsY0FBUSxDQUFDLEdBQUcsQ0FBQztRQUN6QixJQUFJLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDcEIsUUFBUSxLQUFLLENBQUMsS0FBSyxFQUFFO1lBQ25CLEtBQUssTUFBTTtnQkFDVCxLQUFLLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ2YsTUFBTTtZQUNSLEtBQUssTUFBTTtnQkFDVCxLQUFLLEdBQUcsQ0FBQyxDQUFTLEVBQUUsRUFBRSxDQUFDLGNBQVEsQ0FBQyxJQUFJLENBQUMsY0FBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN6RCxNQUFNLEdBQUcsTUFBTSxDQUFDO2dCQUNoQixNQUFNO1lBQ1IsS0FBSyxPQUFPLENBQUM7WUFDYixLQUFLLE9BQU87Z0JBQ1YsS0FBSyxHQUFHLENBQUMsQ0FBUyxFQUFFLEVBQUUsQ0FBQyxjQUFRLENBQUMsSUFBSSxDQUFDLGNBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdEQsTUFBTSxHQUFHLE1BQU0sQ0FBQztnQkFDaEIsTUFBTTtTQUNUO1FBRUQsMkZBQTJGO1FBQzNGLHdGQUF3RjtRQUN4Riw0QkFBNEI7UUFDNUIsRUFBRTtRQUNGLHlGQUF5RjtRQUN6Rix5RkFBeUY7UUFDekYsc0ZBQXNGO1FBQ3RGLDBEQUEwRDtRQUMxRCxrRkFBa0Y7UUFDbEYsMEZBQTBGO1FBQzFGLEVBQUU7UUFDRixtRkFBbUY7UUFDbkYsd0ZBQXdGO1FBQ3hGLDJGQUEyRjtRQUMzRixrRkFBa0Y7UUFDbEYsMEZBQTBGO1FBQzFGLGdCQUFnQjtRQUNoQixFQUFFO1FBQ0YsMEZBQTBGO1FBQzFGLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxDQUFFLGVBQWU7UUFDeEMsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQztRQUM1QixPQUFPLE9BQU8sRUFBRTtZQUNkLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQzFDLE9BQU8sR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ25DLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7U0FDNUI7UUFDRCxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3JCLENBQUMsQ0FBQyxDQUFDO0lBRUwsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQztBQXpERCxrREF5REMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgeyBmaWx0ZXIgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQgeyBsb2dnaW5nLCB0ZXJtaW5hbCB9IGZyb20gJy4uL3NyYyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHJvY2Vzc091dHB1dCB7XG4gIHdyaXRlKGJ1ZmZlcjogc3RyaW5nIHwgQnVmZmVyKTogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBBIExvZ2dlciB0aGF0IHNlbmRzIGluZm9ybWF0aW9uIHRvIFNURE9VVCBhbmQgU1RERVJSLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ29uc29sZUxvZ2dlcihcbiAgdmVyYm9zZSA9IGZhbHNlLFxuICBzdGRvdXQ6IFByb2Nlc3NPdXRwdXQgPSBwcm9jZXNzLnN0ZG91dCxcbiAgc3RkZXJyOiBQcm9jZXNzT3V0cHV0ID0gcHJvY2Vzcy5zdGRlcnIsXG4pOiBsb2dnaW5nLkxvZ2dlciB7XG4gIGNvbnN0IGxvZ2dlciA9IG5ldyBsb2dnaW5nLkluZGVudExvZ2dlcignY2xpbmcnKTtcblxuICBsb2dnZXJcbiAgICAucGlwZShmaWx0ZXIoZW50cnkgPT4gKGVudHJ5LmxldmVsICE9ICdkZWJ1ZycgfHwgdmVyYm9zZSkpKVxuICAgIC5zdWJzY3JpYmUoZW50cnkgPT4ge1xuICAgICAgbGV0IGNvbG9yID0gdGVybWluYWwuZGltO1xuICAgICAgbGV0IG91dHB1dCA9IHN0ZG91dDtcbiAgICAgIHN3aXRjaCAoZW50cnkubGV2ZWwpIHtcbiAgICAgICAgY2FzZSAnaW5mbyc6XG4gICAgICAgICAgY29sb3IgPSBzID0+IHM7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3dhcm4nOlxuICAgICAgICAgIGNvbG9yID0gKHM6IHN0cmluZykgPT4gdGVybWluYWwuYm9sZCh0ZXJtaW5hbC55ZWxsb3cocykpO1xuICAgICAgICAgIG91dHB1dCA9IHN0ZGVycjtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZmF0YWwnOlxuICAgICAgICBjYXNlICdlcnJvcic6XG4gICAgICAgICAgY29sb3IgPSAoczogc3RyaW5nKSA9PiB0ZXJtaW5hbC5ib2xkKHRlcm1pbmFsLnJlZChzKSk7XG4gICAgICAgICAgb3V0cHV0ID0gc3RkZXJyO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiB3ZSBkbyBjb25zb2xlLmxvZyhtZXNzYWdlKSBvciBwcm9jZXNzLnN0ZG91dC53cml0ZShtZXNzYWdlICsgJ1xcbicpLCB0aGUgcHJvY2VzcyBtaWdodFxuICAgICAgLy8gc3RvcCBiZWZvcmUgdGhlIHdob2xlIG1lc3NhZ2UgaXMgd3JpdHRlbiBhbmQgdGhlIHN0cmVhbSBpcyBmbHVzaGVkLiBUaGlzIGhhcHBlbnMgd2hlblxuICAgICAgLy8gc3RyZWFtcyBhcmUgYXN5bmNocm9ub3VzLlxuICAgICAgLy9cbiAgICAgIC8vIE5vZGVKUyBJTyBzdHJlYW1zIGFyZSBkaWZmZXJlbnQgZGVwZW5kaW5nIG9uIHBsYXRmb3JtIGFuZCB1c2FnZS4gSW4gUE9TSVggZW52aXJvbm1lbnQsXG4gICAgICAvLyBmb3IgZXhhbXBsZSwgdGhleSdyZSBhc3luY2hyb25vdXMgd2hlbiB3cml0aW5nIHRvIGEgcGlwZSwgYnV0IHN5bmNocm9ub3VzIHdoZW4gd3JpdGluZ1xuICAgICAgLy8gdG8gYSBUVFkuIEluIHdpbmRvd3MsIGl0J3MgdGhlIG90aGVyIHdheSBhcm91bmQuIFlvdSBjYW4gdmVyaWZ5IHdoaWNoIGlzIHdoaWNoIHdpdGhcbiAgICAgIC8vIHN0cmVhbS5pc1RUWSBhbmQgcGxhdGZvcm0sIGJ1dCB0aGlzIGlzIG5vdCBnb29kIGVub3VnaC5cbiAgICAgIC8vIEluIHRoZSBhc3luYyBjYXNlLCBvbmUgc2hvdWxkIHdhaXQgZm9yIHRoZSBjYWxsYmFjayBiZWZvcmUgc2VuZGluZyBtb3JlIGRhdGEgb3JcbiAgICAgIC8vIGNvbnRpbnVpbmcgdGhlIHByb2Nlc3MuIEluIG91ciBjYXNlIGl0IHdvdWxkIGJlIHJhdGhlciBoYXJkIHRvIGRvIChidXQgbm90IGltcG9zc2libGUpLlxuICAgICAgLy9cbiAgICAgIC8vIEluc3RlYWQgd2UgdGFrZSB0aGUgZWFzeSB3YXkgb3V0IGFuZCBzaW1wbHkgY2h1bmsgdGhlIG1lc3NhZ2UgYW5kIGNhbGwgdGhlIHdyaXRlXG4gICAgICAvLyBmdW5jdGlvbiB3aGlsZSB0aGUgYnVmZmVyIGRyYWluIGl0c2VsZiBhc3luY2hyb25vdXNseS4gV2l0aCBhIHNtYWxsZXIgY2h1bmsgc2l6ZSB0aGFuXG4gICAgICAvLyB0aGUgYnVmZmVyLCB3ZSBhcmUgbW9zdGx5IGNlcnRhaW4gdGhhdCBpdCB3b3Jrcy4gSW4gdGhpcyBjYXNlLCB0aGUgY2h1bmsgaGFzIGJlZW4gcGlja2VkXG4gICAgICAvLyBhcyBoYWxmIGEgcGFnZSBzaXplICg0MDk2LzIgPSAyMDQ4KSwgbWludXMgc29tZSBieXRlcyBmb3IgdGhlIGNvbG9yIGZvcm1hdHRpbmcuXG4gICAgICAvLyBPbiBQT1NJWCBpdCBzZWVtcyB0aGUgYnVmZmVyIGlzIDIgcGFnZXMgKDgxOTIpLCBidXQganVzdCB0byBiZSBzdXJlIChjb3VsZCBiZSBkaWZmZXJlbnRcbiAgICAgIC8vIGJ5IHBsYXRmb3JtKS5cbiAgICAgIC8vXG4gICAgICAvLyBGb3IgbW9yZSBkZXRhaWxzLCBzZWUgaHR0cHM6Ly9ub2RlanMub3JnL2FwaS9wcm9jZXNzLmh0bWwjcHJvY2Vzc19hX25vdGVfb25fcHJvY2Vzc19pX29cbiAgICAgIGNvbnN0IGNodW5rU2l6ZSA9IDIwMDA7ICAvLyBTbWFsbCBjaHVuay5cbiAgICAgIGxldCBtZXNzYWdlID0gZW50cnkubWVzc2FnZTtcbiAgICAgIHdoaWxlIChtZXNzYWdlKSB7XG4gICAgICAgIGNvbnN0IGNodW5rID0gbWVzc2FnZS5zbGljZSgwLCBjaHVua1NpemUpO1xuICAgICAgICBtZXNzYWdlID0gbWVzc2FnZS5zbGljZShjaHVua1NpemUpO1xuICAgICAgICBvdXRwdXQud3JpdGUoY29sb3IoY2h1bmspKTtcbiAgICAgIH1cbiAgICAgIG91dHB1dC53cml0ZSgnXFxuJyk7XG4gICAgfSk7XG5cbiAgcmV0dXJuIGxvZ2dlcjtcbn1cbiJdfQ==