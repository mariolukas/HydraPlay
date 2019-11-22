"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const fs = require("fs");
class BepGenerator {
    constructor() { }
    static createBuildStarted(command, time) {
        return {
            id: { started: {} },
            started: {
                command,
                start_time_millis: time == undefined ? Date.now() : time,
            },
        };
    }
    static createBuildFinished(code, time) {
        return {
            id: { finished: {} },
            finished: {
                finish_time_millis: time == undefined ? Date.now() : time,
                exit_code: { code },
            },
        };
    }
}
exports.BepGenerator = BepGenerator;
class BepJsonWriter {
    constructor(filename) {
        this.filename = filename;
        this.stream = fs.createWriteStream(this.filename);
    }
    close() {
        this.stream.close();
    }
    writeEvent(event) {
        const raw = JSON.stringify(event);
        this.stream.write(raw + '\n');
    }
    writeBuildStarted(command, time) {
        const event = BepGenerator.createBuildStarted(command, time);
        this.writeEvent(event);
    }
    writeBuildFinished(code, time) {
        const event = BepGenerator.createBuildFinished(code, time);
        this.writeEvent(event);
    }
}
exports.BepJsonWriter = BepJsonWriter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmVwLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9hbmd1bGFyL2NsaS91dGlsaXRpZXMvYmVwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7OztHQU1HO0FBQ0gseUJBQXlCO0FBUXpCLE1BQWEsWUFBWTtJQUN2QixnQkFBdUIsQ0FBQztJQUV4QixNQUFNLENBQUMsa0JBQWtCLENBQUMsT0FBZSxFQUFFLElBQWE7UUFDdEQsT0FBTztZQUNMLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUU7WUFDbkIsT0FBTyxFQUFFO2dCQUNQLE9BQU87Z0JBQ1AsaUJBQWlCLEVBQUUsSUFBSSxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJO2FBQ3pEO1NBQ0YsQ0FBQztJQUNKLENBQUM7SUFFRCxNQUFNLENBQUMsbUJBQW1CLENBQUMsSUFBWSxFQUFFLElBQWE7UUFDcEQsT0FBTztZQUNMLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUU7WUFDcEIsUUFBUSxFQUFFO2dCQUNSLGtCQUFrQixFQUFFLElBQUksSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSTtnQkFDekQsU0FBUyxFQUFFLEVBQUUsSUFBSSxFQUFFO2FBQ3BCO1NBQ0YsQ0FBQztJQUNKLENBQUM7Q0FDRjtBQXRCRCxvQ0FzQkM7QUFFRCxNQUFhLGFBQWE7SUFHeEIsWUFBNEIsUUFBZ0I7UUFBaEIsYUFBUSxHQUFSLFFBQVEsQ0FBUTtRQUZwQyxXQUFNLEdBQUcsRUFBRSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUlyRCxDQUFDO0lBRUQsS0FBSztRQUNILElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDdEIsQ0FBQztJQUVELFVBQVUsQ0FBQyxLQUF3QjtRQUNqQyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRWxDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUNoQyxDQUFDO0lBRUQsaUJBQWlCLENBQUMsT0FBZSxFQUFFLElBQWE7UUFDOUMsTUFBTSxLQUFLLEdBQUcsWUFBWSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztRQUU3RCxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3pCLENBQUM7SUFFRCxrQkFBa0IsQ0FBQyxJQUFZLEVBQUUsSUFBYTtRQUM1QyxNQUFNLEtBQUssR0FBRyxZQUFZLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRTNELElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDekIsQ0FBQztDQUNGO0FBNUJELHNDQTRCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcblxuXG5leHBvcnQgaW50ZXJmYWNlIEJ1aWxkRXZlbnRNZXNzYWdlIHtcbiAgaWQ6IHt9O1xuICBba2V5OiBzdHJpbmddOiB7fTtcbn1cblxuZXhwb3J0IGNsYXNzIEJlcEdlbmVyYXRvciB7XG4gIHByaXZhdGUgY29uc3RydWN0b3IoKSB7fVxuXG4gIHN0YXRpYyBjcmVhdGVCdWlsZFN0YXJ0ZWQoY29tbWFuZDogc3RyaW5nLCB0aW1lPzogbnVtYmVyKTogQnVpbGRFdmVudE1lc3NhZ2Uge1xuICAgIHJldHVybiB7XG4gICAgICBpZDogeyBzdGFydGVkOiB7fSB9LFxuICAgICAgc3RhcnRlZDoge1xuICAgICAgICBjb21tYW5kLFxuICAgICAgICBzdGFydF90aW1lX21pbGxpczogdGltZSA9PSB1bmRlZmluZWQgPyBEYXRlLm5vdygpIDogdGltZSxcbiAgICAgIH0sXG4gICAgfTtcbiAgfVxuXG4gIHN0YXRpYyBjcmVhdGVCdWlsZEZpbmlzaGVkKGNvZGU6IG51bWJlciwgdGltZT86IG51bWJlcik6IEJ1aWxkRXZlbnRNZXNzYWdlIHtcbiAgICByZXR1cm4ge1xuICAgICAgaWQ6IHsgZmluaXNoZWQ6IHt9IH0sXG4gICAgICBmaW5pc2hlZDoge1xuICAgICAgICBmaW5pc2hfdGltZV9taWxsaXM6IHRpbWUgPT0gdW5kZWZpbmVkID8gRGF0ZS5ub3coKSA6IHRpbWUsXG4gICAgICAgIGV4aXRfY29kZTogeyBjb2RlIH0sXG4gICAgICB9LFxuICAgIH07XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEJlcEpzb25Xcml0ZXIge1xuICBwcml2YXRlIHN0cmVhbSA9IGZzLmNyZWF0ZVdyaXRlU3RyZWFtKHRoaXMuZmlsZW5hbWUpO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyByZWFkb25seSBmaWxlbmFtZTogc3RyaW5nKSB7XG5cbiAgfVxuXG4gIGNsb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuc3RyZWFtLmNsb3NlKCk7XG4gIH1cblxuICB3cml0ZUV2ZW50KGV2ZW50OiBCdWlsZEV2ZW50TWVzc2FnZSk6IHZvaWQge1xuICAgIGNvbnN0IHJhdyA9IEpTT04uc3RyaW5naWZ5KGV2ZW50KTtcblxuICAgIHRoaXMuc3RyZWFtLndyaXRlKHJhdyArICdcXG4nKTtcbiAgfVxuXG4gIHdyaXRlQnVpbGRTdGFydGVkKGNvbW1hbmQ6IHN0cmluZywgdGltZT86IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IGV2ZW50ID0gQmVwR2VuZXJhdG9yLmNyZWF0ZUJ1aWxkU3RhcnRlZChjb21tYW5kLCB0aW1lKTtcblxuICAgIHRoaXMud3JpdGVFdmVudChldmVudCk7XG4gIH1cblxuICB3cml0ZUJ1aWxkRmluaXNoZWQoY29kZTogbnVtYmVyLCB0aW1lPzogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgZXZlbnQgPSBCZXBHZW5lcmF0b3IuY3JlYXRlQnVpbGRGaW5pc2hlZChjb2RlLCB0aW1lKTtcblxuICAgIHRoaXMud3JpdGVFdmVudChldmVudCk7XG4gIH1cbn1cbiJdfQ==