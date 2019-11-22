"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 *
 */
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const index_1 = require("../../exception/index");
const index_2 = require("../../logger/index");
const index_3 = require("../../utils/index");
const api_1 = require("./api");
class ChannelAlreadyExistException extends index_1.BaseException {
    constructor(name) {
        super(`Channel ${JSON.stringify(name)} already exist.`);
    }
}
exports.ChannelAlreadyExistException = ChannelAlreadyExistException;
/**
 * Make a simple job handler that sets start and end from a function that's synchronous.
 *
 * @param fn The function to create a handler for.
 * @param options An optional set of properties to set on the handler. Some fields might be
 *   required by registry or schedulers.
 */
function createJobHandler(fn, options = {}) {
    const handler = (argument, context) => {
        const description = context.description;
        const inboundBus = context.inboundBus;
        const inputChannel = new rxjs_1.Subject();
        let subscription;
        return new rxjs_1.Observable(subject => {
            // Handle input.
            inboundBus.subscribe(message => {
                switch (message.kind) {
                    case api_1.JobInboundMessageKind.Ping:
                        subject.next({ kind: api_1.JobOutboundMessageKind.Pong, description, id: message.id });
                        break;
                    case api_1.JobInboundMessageKind.Stop:
                        // There's no way to cancel a promise or a synchronous function, but we do cancel
                        // observables where possible.
                        if (subscription) {
                            subscription.unsubscribe();
                        }
                        subject.next({ kind: api_1.JobOutboundMessageKind.End, description });
                        subject.complete();
                        // Close all channels.
                        channels.forEach(x => x.complete());
                        break;
                    case api_1.JobInboundMessageKind.Input:
                        inputChannel.next(message.value);
                        break;
                }
            });
            // Configure a logger to pass in as additional context.
            const logger = new index_2.Logger('job');
            logger.subscribe(entry => {
                subject.next({
                    kind: api_1.JobOutboundMessageKind.Log,
                    description,
                    entry,
                });
            });
            // Execute the function with the additional context.
            subject.next({ kind: api_1.JobOutboundMessageKind.Start, description });
            const channels = new Map();
            const newContext = Object.assign({}, context, { input: inputChannel.asObservable(), logger,
                createChannel(name) {
                    if (channels.has(name)) {
                        throw new ChannelAlreadyExistException(name);
                    }
                    const channelSubject = new rxjs_1.Subject();
                    channelSubject.subscribe(message => {
                        subject.next({
                            kind: api_1.JobOutboundMessageKind.ChannelMessage, description, name, message,
                        });
                    }, error => {
                        subject.next({ kind: api_1.JobOutboundMessageKind.ChannelError, description, name, error });
                        // This can be reopened.
                        channels.delete(name);
                    }, () => {
                        subject.next({ kind: api_1.JobOutboundMessageKind.ChannelComplete, description, name });
                        // This can be reopened.
                        channels.delete(name);
                    });
                    channels.set(name, channelSubject);
                    return channelSubject;
                } });
            const result = fn(argument, newContext);
            // If the result is a promise, simply wait for it to complete before reporting the result.
            if (index_3.isPromise(result)) {
                result.then(result => {
                    subject.next({ kind: api_1.JobOutboundMessageKind.Output, description, value: result });
                    subject.next({ kind: api_1.JobOutboundMessageKind.End, description });
                    subject.complete();
                }, err => subject.error(err));
            }
            else if (rxjs_1.isObservable(result)) {
                subscription = result.subscribe((value) => subject.next({ kind: api_1.JobOutboundMessageKind.Output, description, value }), error => subject.error(error), () => {
                    subject.next({ kind: api_1.JobOutboundMessageKind.End, description });
                    subject.complete();
                });
                return subscription;
            }
            else {
                // If it's a scalar value, report it synchronously.
                subject.next({ kind: api_1.JobOutboundMessageKind.Output, description, value: result });
                subject.next({ kind: api_1.JobOutboundMessageKind.End, description });
                subject.complete();
            }
        });
    };
    return Object.assign(handler, { jobDescription: options });
}
exports.createJobHandler = createJobHandler;
/**
 * Lazily create a job using a function.
 * @param loader A factory function that returns a promise/observable of a JobHandler.
 * @param options Same options as createJob.
 */
function createJobFactory(loader, options) {
    const handler = (argument, context) => {
        return rxjs_1.from(loader())
            .pipe(operators_1.switchMap(fn => fn(argument, context)));
    };
    return Object.assign(handler, { jobDescription: options });
}
exports.createJobFactory = createJobFactory;
/**
 * Creates a job that logs out input/output messages of another Job. The messages are still
 * propagated to the other job.
 */
function createLoggerJob(job, logger) {
    const handler = (argument, context) => {
        context.inboundBus.pipe(operators_1.tap(message => logger.info(`Input: ${JSON.stringify(message)}`))).subscribe();
        return job(argument, context).pipe(operators_1.tap(message => logger.info(`Message: ${JSON.stringify(message)}`), error => logger.warn(`Error: ${JSON.stringify(error)}`), () => logger.info(`Completed`)));
    };
    return Object.assign(handler, job);
}
exports.createLoggerJob = createLoggerJob;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLWpvYi1oYW5kbGVyLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9hbmd1bGFyX2RldmtpdC9jb3JlL3NyYy9leHBlcmltZW50YWwvam9icy9jcmVhdGUtam9iLWhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztHQU9HO0FBQ0gsK0JBQXVGO0FBQ3ZGLDhDQUFnRDtBQUNoRCxpREFBc0Q7QUFFdEQsOENBQXVEO0FBQ3ZELDZDQUE4QztBQUM5QywrQkFPZTtBQUdmLE1BQWEsNEJBQTZCLFNBQVEscUJBQWE7SUFDN0QsWUFBWSxJQUFZO1FBQ3RCLEtBQUssQ0FBQyxXQUFXLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDMUQsQ0FBQztDQUNGO0FBSkQsb0VBSUM7QUE0QkQ7Ozs7OztHQU1HO0FBQ0gsU0FBZ0IsZ0JBQWdCLENBQzlCLEVBQStCLEVBQy9CLFVBQW1DLEVBQUU7SUFFckMsTUFBTSxPQUFPLEdBQUcsQ0FBQyxRQUFXLEVBQUUsT0FBbUMsRUFBRSxFQUFFO1FBQ25FLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUM7UUFDeEMsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQztRQUN0QyxNQUFNLFlBQVksR0FBRyxJQUFJLGNBQU8sRUFBYSxDQUFDO1FBQzlDLElBQUksWUFBMEIsQ0FBQztRQUUvQixPQUFPLElBQUksaUJBQVUsQ0FBd0IsT0FBTyxDQUFDLEVBQUU7WUFDckQsZ0JBQWdCO1lBQ2hCLFVBQVUsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQzdCLFFBQVEsT0FBTyxDQUFDLElBQUksRUFBRTtvQkFDcEIsS0FBSywyQkFBcUIsQ0FBQyxJQUFJO3dCQUM3QixPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLDRCQUFzQixDQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsRUFB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R0FBRyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQ2hDLGVBQUcsQ0FDRCxPQUFPLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFDN0QsS0FBSyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEVBQ3ZELEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQy9CLENBQ0YsQ0FBQztJQUNKLENBQUMsQ0FBQztJQUVGLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDckMsQ0FBQztBQW5CRCwwQ0FtQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICpcbiAqL1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgT2JzZXJ2ZXIsIFN1YmplY3QsIFN1YnNjcmlwdGlvbiwgZnJvbSwgaXNPYnNlcnZhYmxlIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBzd2l0Y2hNYXAsIHRhcCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7IEJhc2VFeGNlcHRpb24gfSBmcm9tICcuLi8uLi9leGNlcHRpb24vaW5kZXgnO1xuaW1wb3J0IHsgSnNvblZhbHVlIH0gZnJvbSAnLi4vLi4vanNvbi9pbmRleCc7XG5pbXBvcnQgeyBMb2dnZXIsIExvZ2dlckFwaSB9IGZyb20gJy4uLy4uL2xvZ2dlci9pbmRleCc7XG5pbXBvcnQgeyBpc1Byb21pc2UgfSBmcm9tICcuLi8uLi91dGlscy9pbmRleCc7XG5pbXBvcnQge1xuICBKb2JEZXNjcmlwdGlvbixcbiAgSm9iSGFuZGxlcixcbiAgSm9iSGFuZGxlckNvbnRleHQsXG4gIEpvYkluYm91bmRNZXNzYWdlS2luZCxcbiAgSm9iT3V0Ym91bmRNZXNzYWdlLFxuICBKb2JPdXRib3VuZE1lc3NhZ2VLaW5kLFxufSBmcm9tICcuL2FwaSc7XG5cblxuZXhwb3J0IGNsYXNzIENoYW5uZWxBbHJlYWR5RXhpc3RFeGNlcHRpb24gZXh0ZW5kcyBCYXNlRXhjZXB0aW9uIHtcbiAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nKSB7XG4gICAgc3VwZXIoYENoYW5uZWwgJHtKU09OLnN0cmluZ2lmeShuYW1lKX0gYWxyZWFkeSBleGlzdC5gKTtcbiAgfVxufVxuXG4vKipcbiAqIEludGVyZmFjZSBmb3IgdGhlIEpvYkhhbmRsZXIgY29udGV4dCB0aGF0IGlzIHVzZWQgd2hlbiB1c2luZyBgY3JlYXRlSm9iSGFuZGxlcigpYC4gSXQgZXh0ZW5kc1xuICogdGhlIGJhc2ljIGBKb2JIYW5kbGVyQ29udGV4dGAgd2l0aCBhZGRpdGlvbmFsIGZ1bmN0aW9uYWxpdHkuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU2ltcGxlSm9iSGFuZGxlckNvbnRleHQ8XG4gIEEgZXh0ZW5kcyBKc29uVmFsdWUsXG4gIEkgZXh0ZW5kcyBKc29uVmFsdWUsXG4gIE8gZXh0ZW5kcyBKc29uVmFsdWUsXG4+IGV4dGVuZHMgSm9iSGFuZGxlckNvbnRleHQ8QSwgSSwgTz4ge1xuICBsb2dnZXI6IExvZ2dlckFwaTtcbiAgY3JlYXRlQ2hhbm5lbDogKG5hbWU6IHN0cmluZykgPT4gT2JzZXJ2ZXI8SnNvblZhbHVlPjtcbiAgaW5wdXQ6IE9ic2VydmFibGU8SnNvblZhbHVlPjtcbn1cblxuXG4vKipcbiAqIEEgc2ltcGxlIHZlcnNpb24gb2YgdGhlIEpvYkhhbmRsZXIuIFRoaXMgc2ltcGxpZmllcyBhIGxvdCBvZiB0aGUgaW50ZXJhY3Rpb24gd2l0aCB0aGUgam9iXG4gKiBzY2hlZHVsZXIgYW5kIHJlZ2lzdHJ5LiBGb3IgZXhhbXBsZSwgaW5zdGVhZCBvZiByZXR1cm5pbmcgYSBKb2JPdXRib3VuZE1lc3NhZ2Ugb2JzZXJ2YWJsZSwgeW91XG4gKiBjYW4gZGlyZWN0bHkgcmV0dXJuIGFuIG91dHB1dC5cbiAqL1xuZXhwb3J0IHR5cGUgU2ltcGxlSm9iSGFuZGxlckZuPEEgZXh0ZW5kcyBKc29uVmFsdWUsIEkgZXh0ZW5kcyBKc29uVmFsdWUsIE8gZXh0ZW5kcyBKc29uVmFsdWU+ID0gKFxuICBpbnB1dDogQSxcbiAgY29udGV4dDogU2ltcGxlSm9iSGFuZGxlckNvbnRleHQ8QSwgSSwgTz4sXG4pID0+IE8gfCBQcm9taXNlPE8+IHwgT2JzZXJ2YWJsZTxPPjtcblxuXG4vKipcbiAqIE1ha2UgYSBzaW1wbGUgam9iIGhhbmRsZXIgdGhhdCBzZXRzIHN0YXJ0IGFuZCBlbmQgZnJvbSBhIGZ1bmN0aW9uIHRoYXQncyBzeW5jaHJvbm91cy5cbiAqXG4gKiBAcGFyYW0gZm4gVGhlIGZ1bmN0aW9uIHRvIGNyZWF0ZSBhIGhhbmRsZXIgZm9yLlxuICogQHBhcmFtIG9wdGlvbnMgQW4gb3B0aW9uYWwgc2V0IG9mIHByb3BlcnRpZXMgdG8gc2V0IG9uIHRoZSBoYW5kbGVyLiBTb21lIGZpZWxkcyBtaWdodCBiZVxuICogICByZXF1aXJlZCBieSByZWdpc3RyeSBvciBzY2hlZHVsZXJzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlSm9iSGFuZGxlcjxBIGV4dGVuZHMgSnNvblZhbHVlLCBJIGV4dGVuZHMgSnNvblZhbHVlLCBPIGV4dGVuZHMgSnNvblZhbHVlPihcbiAgZm46IFNpbXBsZUpvYkhhbmRsZXJGbjxBLCBJLCBPPixcbiAgb3B0aW9uczogUGFydGlhbDxKb2JEZXNjcmlwdGlvbj4gPSB7fSxcbik6IEpvYkhhbmRsZXI8QSwgSSwgTz4ge1xuICBjb25zdCBoYW5kbGVyID0gKGFyZ3VtZW50OiBBLCBjb250ZXh0OiBKb2JIYW5kbGVyQ29udGV4dDxBLCBJLCBPPikgPT4ge1xuICAgIGNvbnN0IGRlc2NyaXB0aW9uID0gY29udGV4dC5kZXNjcmlwdGlvbjtcbiAgICBjb25zdCBpbmJvdW5kQnVzID0gY29udGV4dC5pbmJvdW5kQnVzO1xuICAgIGNvbnN0IGlucHV0Q2hhbm5lbCA9IG5ldyBTdWJqZWN0PEpzb25WYWx1ZT4oKTtcbiAgICBsZXQgc3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb247XG5cbiAgICByZXR1cm4gbmV3IE9ic2VydmFibGU8Sm9iT3V0Ym91bmRNZXNzYWdlPE8+PihzdWJqZWN0ID0+IHtcbiAgICAgIC8vIEhhbmRsZSBpbnB1dC5cbiAgICAgIGluYm91bmRCdXMuc3Vic2NyaWJlKG1lc3NhZ2UgPT4ge1xuICAgICAgICBzd2l0Y2ggKG1lc3NhZ2Uua2luZCkge1xuICAgICAgICAgIGNhc2UgSm9iSW5ib3VuZE1lc3NhZ2VLaW5kLlBpbmc6XG4gICAgICAgICAgICBzdWJqZWN0Lm5leHQoeyBraW5kOiBKb2JPdXRib3VuZE1lc3NhZ2VLaW5kLlBvbmcsIGRlc2NyaXB0aW9uLCBpZDogbWVzc2FnZS5pZCB9KTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgY2FzZSBKb2JJbmJvdW5kTWVzc2FnZUtpbmQuU3RvcDpcbiAgICAgICAgICAgIC8vIFRoZXJlJ3Mgbm8gd2F5IHRvIGNhbmNlbCBhIHByb21pc2Ugb3IgYSBzeW5jaHJvbm91cyBmdW5jdGlvbiwgYnV0IHdlIGRvIGNhbmNlbFxuICAgICAgICAgICAgLy8gb2JzZXJ2YWJsZXMgd2hlcmUgcG9zc2libGUuXG4gICAgICAgICAgICBpZiAoc3Vic2NyaXB0aW9uKSB7XG4gICAgICAgICAgICAgIHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3ViamVjdC5uZXh0KHsga2luZDogSm9iT3V0Ym91bmRNZXNzYWdlS2luZC5FbmQsIGRlc2NyaXB0aW9uIH0pO1xuICAgICAgICAgICAgc3ViamVjdC5jb21wbGV0ZSgpO1xuICAgICAgICAgICAgLy8gQ2xvc2UgYWxsIGNoYW5uZWxzLlxuICAgICAgICAgICAgY2hhbm5lbHMuZm9yRWFjaCh4ID0+IHguY29tcGxldGUoKSk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIGNhc2UgSm9iSW5ib3VuZE1lc3NhZ2VLaW5kLklucHV0OlxuICAgICAgICAgICAgaW5wdXRDaGFubmVsLm5leHQobWVzc2FnZS52YWx1ZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIENvbmZpZ3VyZSBhIGxvZ2dlciB0byBwYXNzIGluIGFzIGFkZGl0aW9uYWwgY29udGV4dC5cbiAgICAgIGNvbnN0IGxvZ2dlciA9IG5ldyBMb2dnZXIoJ2pvYicpO1xuICAgICAgbG9nZ2VyLnN1YnNjcmliZShlbnRyeSA9PiB7XG4gICAgICAgIHN1YmplY3QubmV4dCh7XG4gICAgICAgICAga2luZDogSm9iT3V0Ym91bmRNZXNzYWdlS2luZC5Mb2csXG4gICAgICAgICAgZGVzY3JpcHRpb24sXG4gICAgICAgICAgZW50cnksXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIEV4ZWN1dGUgdGhlIGZ1bmN0aW9uIHdpdGggdGhlIGFkZGl0aW9uYWwgY29udGV4dC5cbiAgICAgIHN1YmplY3QubmV4dCh7IGtpbmQ6IEpvYk91dGJvdW5kTWVzc2FnZUtpbmQuU3RhcnQsIGRlc2NyaXB0aW9uIH0pO1xuXG4gICAgICBjb25zdCBjaGFubmVscyA9IG5ldyBNYXA8c3RyaW5nLCBTdWJqZWN0PEpzb25WYWx1ZT4+KCk7XG5cbiAgICAgIGNvbnN0IG5ld0NvbnRleHQgPSB7XG4gICAgICAgIC4uLmNvbnRleHQsXG4gICAgICAgIGlucHV0OiBpbnB1dENoYW5uZWwuYXNPYnNlcnZhYmxlKCksXG4gICAgICAgIGxvZ2dlcixcbiAgICAgICAgY3JlYXRlQ2hhbm5lbChuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgICBpZiAoY2hhbm5lbHMuaGFzKG5hbWUpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgQ2hhbm5lbEFscmVhZHlFeGlzdEV4Y2VwdGlvbihuYW1lKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgY2hhbm5lbFN1YmplY3QgPSBuZXcgU3ViamVjdDxKc29uVmFsdWU+KCk7XG4gICAgICAgICAgY2hhbm5lbFN1YmplY3Quc3Vic2NyaWJlKFxuICAgICAgICAgICAgbWVzc2FnZSA9PiB7XG4gICAgICAgICAgICAgIHN1YmplY3QubmV4dCh7XG4gICAgICAgICAgICAgICAga2luZDogSm9iT3V0Ym91bmRNZXNzYWdlS2luZC5DaGFubmVsTWVzc2FnZSwgZGVzY3JpcHRpb24sIG5hbWUsIG1lc3NhZ2UsXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVycm9yID0+IHtcbiAgICAgICAgICAgICAgc3ViamVjdC5uZXh0KHsga2luZDogSm9iT3V0Ym91bmRNZXNzYWdlS2luZC5DaGFubmVsRXJyb3IsIGRlc2NyaXB0aW9uLCBuYW1lLCBlcnJvciB9KTtcbiAgICAgICAgICAgICAgLy8gVGhpcyBjYW4gYmUgcmVvcGVuZWQuXG4gICAgICAgICAgICAgIGNoYW5uZWxzLmRlbGV0ZShuYW1lKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICAgIHN1YmplY3QubmV4dCh7IGtpbmQ6IEpvYk91dGJvdW5kTWVzc2FnZUtpbmQuQ2hhbm5lbENvbXBsZXRlLCBkZXNjcmlwdGlvbiwgbmFtZSB9KTtcbiAgICAgICAgICAgICAgLy8gVGhpcyBjYW4gYmUgcmVvcGVuZWQuXG4gICAgICAgICAgICAgIGNoYW5uZWxzLmRlbGV0ZShuYW1lKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgKTtcblxuICAgICAgICAgIGNoYW5uZWxzLnNldChuYW1lLCBjaGFubmVsU3ViamVjdCk7XG5cbiAgICAgICAgICByZXR1cm4gY2hhbm5lbFN1YmplY3Q7XG4gICAgICAgIH0sXG4gICAgICB9O1xuXG4gICAgICBjb25zdCByZXN1bHQgPSBmbihhcmd1bWVudCwgbmV3Q29udGV4dCk7XG4gICAgICAvLyBJZiB0aGUgcmVzdWx0IGlzIGEgcHJvbWlzZSwgc2ltcGx5IHdhaXQgZm9yIGl0IHRvIGNvbXBsZXRlIGJlZm9yZSByZXBvcnRpbmcgdGhlIHJlc3VsdC5cbiAgICAgIGlmIChpc1Byb21pc2UocmVzdWx0KSkge1xuICAgICAgICByZXN1bHQudGhlbihyZXN1bHQgPT4ge1xuICAgICAgICAgIHN1YmplY3QubmV4dCh7IGtpbmQ6IEpvYk91dGJvdW5kTWVzc2FnZUtpbmQuT3V0cHV0LCBkZXNjcmlwdGlvbiwgdmFsdWU6IHJlc3VsdCB9KTtcbiAgICAgICAgICBzdWJqZWN0Lm5leHQoeyBraW5kOiBKb2JPdXRib3VuZE1lc3NhZ2VLaW5kLkVuZCwgZGVzY3JpcHRpb24gfSk7XG4gICAgICAgICAgc3ViamVjdC5jb21wbGV0ZSgpO1xuICAgICAgICB9LCBlcnIgPT4gc3ViamVjdC5lcnJvcihlcnIpKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNPYnNlcnZhYmxlKHJlc3VsdCkpIHtcbiAgICAgICAgc3Vic2NyaXB0aW9uID0gKHJlc3VsdCBhcyBPYnNlcnZhYmxlPE8+KS5zdWJzY3JpYmUoXG4gICAgICAgICAgKHZhbHVlOiBPKSA9PiBzdWJqZWN0Lm5leHQoeyBraW5kOiBKb2JPdXRib3VuZE1lc3NhZ2VLaW5kLk91dHB1dCwgZGVzY3JpcHRpb24sIHZhbHVlIH0pLFxuICAgICAgICAgIGVycm9yID0+IHN1YmplY3QuZXJyb3IoZXJyb3IpLFxuICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgIHN1YmplY3QubmV4dCh7IGtpbmQ6IEpvYk91dGJvdW5kTWVzc2FnZUtpbmQuRW5kLCBkZXNjcmlwdGlvbiB9KTtcbiAgICAgICAgICAgIHN1YmplY3QuY29tcGxldGUoKTtcbiAgICAgICAgICB9LFxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiBzdWJzY3JpcHRpb247XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBJZiBpdCdzIGEgc2NhbGFyIHZhbHVlLCByZXBvcnQgaXQgc3luY2hyb25vdXNseS5cbiAgICAgICAgc3ViamVjdC5uZXh0KHsga2luZDogSm9iT3V0Ym91bmRNZXNzYWdlS2luZC5PdXRwdXQsIGRlc2NyaXB0aW9uLCB2YWx1ZTogcmVzdWx0IGFzIE8gfSk7XG4gICAgICAgIHN1YmplY3QubmV4dCh7IGtpbmQ6IEpvYk91dGJvdW5kTWVzc2FnZUtpbmQuRW5kLCBkZXNjcmlwdGlvbiB9KTtcbiAgICAgICAgc3ViamVjdC5jb21wbGV0ZSgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIHJldHVybiBPYmplY3QuYXNzaWduKGhhbmRsZXIsIHsgam9iRGVzY3JpcHRpb246IG9wdGlvbnMgfSk7XG59XG5cblxuLyoqXG4gKiBMYXppbHkgY3JlYXRlIGEgam9iIHVzaW5nIGEgZnVuY3Rpb24uXG4gKiBAcGFyYW0gbG9hZGVyIEEgZmFjdG9yeSBmdW5jdGlvbiB0aGF0IHJldHVybnMgYSBwcm9taXNlL29ic2VydmFibGUgb2YgYSBKb2JIYW5kbGVyLlxuICogQHBhcmFtIG9wdGlvbnMgU2FtZSBvcHRpb25zIGFzIGNyZWF0ZUpvYi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUpvYkZhY3Rvcnk8QSBleHRlbmRzIEpzb25WYWx1ZSwgSSBleHRlbmRzIEpzb25WYWx1ZSwgTyBleHRlbmRzIEpzb25WYWx1ZT4oXG4gIGxvYWRlcjogKCkgPT4gUHJvbWlzZTxKb2JIYW5kbGVyPEEsIEksIE8+PixcbiAgb3B0aW9uczogUGFydGlhbDxKb2JEZXNjcmlwdGlvbj4sXG4pOiBKb2JIYW5kbGVyPEEsIEksIE8+IHtcbiAgY29uc3QgaGFuZGxlciA9IChhcmd1bWVudDogQSwgY29udGV4dDogSm9iSGFuZGxlckNvbnRleHQ8QSwgSSwgTz4pID0+IHtcbiAgICByZXR1cm4gZnJvbShsb2FkZXIoKSlcbiAgICAgIC5waXBlKHN3aXRjaE1hcChmbiA9PiBmbihhcmd1bWVudCwgY29udGV4dCkpKTtcbiAgfTtcblxuICByZXR1cm4gT2JqZWN0LmFzc2lnbihoYW5kbGVyLCB7IGpvYkRlc2NyaXB0aW9uOiBvcHRpb25zIH0pO1xufVxuXG5cbi8qKlxuICogQ3JlYXRlcyBhIGpvYiB0aGF0IGxvZ3Mgb3V0IGlucHV0L291dHB1dCBtZXNzYWdlcyBvZiBhbm90aGVyIEpvYi4gVGhlIG1lc3NhZ2VzIGFyZSBzdGlsbFxuICogcHJvcGFnYXRlZCB0byB0aGUgb3RoZXIgam9iLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTG9nZ2VySm9iPEEgZXh0ZW5kcyBKc29uVmFsdWUsIEkgZXh0ZW5kcyBKc29uVmFsdWUsIE8gZXh0ZW5kcyBKc29uVmFsdWU+KFxuICBqb2I6IEpvYkhhbmRsZXI8QSwgSSwgTz4sXG4gIGxvZ2dlcjogTG9nZ2VyQXBpLFxuKTogSm9iSGFuZGxlcjxBLCBJLCBPPiB7XG4gIGNvbnN0IGhhbmRsZXIgPSAoYXJndW1lbnQ6IEEsIGNvbnRleHQ6IEpvYkhhbmRsZXJDb250ZXh0PEEsIEksIE8+KSA9PiB7XG4gICAgY29udGV4dC5pbmJvdW5kQnVzLnBpcGUoXG4gICAgICB0YXAobWVzc2FnZSA9PiBsb2dnZXIuaW5mbyhgSW5wdXQ6ICR7SlNPTi5zdHJpbmdpZnkobWVzc2FnZSl9YCkpLFxuICAgICkuc3Vic2NyaWJlKCk7XG5cbiAgICByZXR1cm4gam9iKGFyZ3VtZW50LCBjb250ZXh0KS5waXBlKFxuICAgICAgdGFwKFxuICAgICAgICBtZXNzYWdlID0+IGxvZ2dlci5pbmZvKGBNZXNzYWdlOiAke0pTT04uc3RyaW5naWZ5KG1lc3NhZ2UpfWApLFxuICAgICAgICBlcnJvciA9PiBsb2dnZXIud2FybihgRXJyb3I6ICR7SlNPTi5zdHJpbmdpZnkoZXJyb3IpfWApLFxuICAgICAgICAoKSA9PiBsb2dnZXIuaW5mbyhgQ29tcGxldGVkYCksXG4gICAgICApLFxuICAgICk7XG4gIH07XG5cbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oaGFuZGxlciwgam9iKTtcbn1cbiJdfQ==