"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const json_1 = require("../../json");
const logger_1 = require("../../logger");
const api_1 = require("./api");
const exception_1 = require("./exception");
class JobInboundMessageSchemaValidationError extends json_1.schema.SchemaValidationException {
    constructor(errors) {
        super(errors, 'Job Inbound Message failed to validate. Errors: ');
    }
}
exports.JobInboundMessageSchemaValidationError = JobInboundMessageSchemaValidationError;
class JobOutputSchemaValidationError extends json_1.schema.SchemaValidationException {
    constructor(errors) {
        super(errors, 'Job Output failed to validate. Errors: ');
    }
}
exports.JobOutputSchemaValidationError = JobOutputSchemaValidationError;
function _jobShare() {
    // This is the same code as a `shareReplay()` operator, but uses a dumber Subject rather than a
    // ReplaySubject.
    return (source) => {
        let refCount = 0;
        let subject;
        let hasError = false;
        let isComplete = false;
        let subscription;
        return new rxjs_1.Observable(subscriber => {
            let innerSub;
            refCount++;
            if (!subject) {
                subject = new rxjs_1.Subject();
                innerSub = subject.subscribe(subscriber);
                subscription = source.subscribe({
                    next(value) { subject.next(value); },
                    error(err) {
                        hasError = true;
                        subject.error(err);
                    },
                    complete() {
                        isComplete = true;
                        subject.complete();
                    },
                });
            }
            else {
                innerSub = subject.subscribe(subscriber);
            }
            return () => {
                refCount--;
                innerSub.unsubscribe();
                if (subscription && refCount === 0 && (isComplete || hasError)) {
                    subscription.unsubscribe();
                }
            };
        });
    };
}
/**
 * Simple scheduler. Should be the base of all registries and schedulers.
 */
class SimpleScheduler {
    constructor(_jobRegistry, _schemaRegistry = new json_1.schema.CoreSchemaRegistry()) {
        this._jobRegistry = _jobRegistry;
        this._schemaRegistry = _schemaRegistry;
        this._internalJobDescriptionMap = new Map();
        this._queue = [];
        this._pauseCounter = 0;
    }
    _getInternalDescription(name) {
        const maybeHandler = this._internalJobDescriptionMap.get(name);
        if (maybeHandler !== undefined) {
            return rxjs_1.of(maybeHandler);
        }
        const handler = this._jobRegistry.get(name);
        return handler.pipe(operators_1.switchMap(handler => {
            if (handler === null) {
                return rxjs_1.of(null);
            }
            const description = {
                name,
                argument: handler.jobDescription.argument || true,
                input: handler.jobDescription.input || true,
                output: handler.jobDescription.output || true,
                channels: handler.jobDescription.channels || {},
            };
            const handlerWithExtra = Object.assign(handler.bind(undefined), {
                jobDescription: description,
                argumentV: this._schemaRegistry.compile(description.argument).pipe(operators_1.shareReplay(1)),
                inputV: this._schemaRegistry.compile(description.input).pipe(operators_1.shareReplay(1)),
                outputV: this._schemaRegistry.compile(description.output).pipe(operators_1.shareReplay(1)),
            });
            this._internalJobDescriptionMap.set(name, handlerWithExtra);
            return rxjs_1.of(handlerWithExtra);
        }));
    }
    /**
     * Get a job description for a named job.
     *
     * @param name The name of the job.
     * @returns A description, or null if the job is not registered.
     */
    getDescription(name) {
        return rxjs_1.concat(this._getInternalDescription(name).pipe(operators_1.map(x => x && x.jobDescription)), rxjs_1.of(null)).pipe(operators_1.first());
    }
    /**
     * Returns true if the job name has been registered.
     * @param name The name of the job.
     * @returns True if the job exists, false otherwise.
     */
    has(name) {
        return this.getDescription(name).pipe(operators_1.map(x => x !== null));
    }
    /**
     * Pause the scheduler, temporary queueing _new_ jobs. Returns a resume function that should be
     * used to resume execution. If multiple `pause()` were called, all their resume functions must
     * be called before the Scheduler actually starts new jobs. Additional calls to the same resume
     * function will have no effect.
     *
     * Jobs already running are NOT paused. This is pausing the scheduler only.
     */
    pause() {
        let called = false;
        this._pauseCounter++;
        return () => {
            if (!called) {
                called = true;
                if (--this._pauseCounter == 0) {
                    // Resume the queue.
                    const q = this._queue;
                    this._queue = [];
                    q.forEach(fn => fn());
                }
            }
        };
    }
    /**
     * Schedule a job to be run, using its name.
     * @param name The name of job to be run.
     * @param argument The argument to send to the job when starting it.
     * @param options Scheduling options.
     * @returns The Job being run.
     */
    schedule(name, argument, options) {
        if (this._pauseCounter > 0) {
            const waitable = new rxjs_1.Subject();
            this._queue.push(() => waitable.complete());
            return this._scheduleJob(name, argument, options || {}, waitable);
        }
        return this._scheduleJob(name, argument, options || {}, rxjs_1.EMPTY);
    }
    /**
     * Filter messages.
     * @private
     */
    _filterJobOutboundMessages(message, state) {
        switch (message.kind) {
            case api_1.JobOutboundMessageKind.OnReady:
                return state == api_1.JobState.Queued;
            case api_1.JobOutboundMessageKind.Start:
                return state == api_1.JobState.Ready;
            case api_1.JobOutboundMessageKind.End:
                return state == api_1.JobState.Started || state == api_1.JobState.Ready;
        }
        return true;
    }
    /**
     * Return a new state. This is just to simplify the reading of the _createJob method.
     * @private
     */
    _updateState(message, state) {
        switch (message.kind) {
            case api_1.JobOutboundMessageKind.OnReady:
                return api_1.JobState.Ready;
            case api_1.JobOutboundMessageKind.Start:
                return api_1.JobState.Started;
            case api_1.JobOutboundMessageKind.End:
                return api_1.JobState.Ended;
        }
        return state;
    }
    /**
     * Create the job.
     * @private
     */
    _createJob(name, argument, handler, inboundBus, outboundBus, options) {
        const schemaRegistry = this._schemaRegistry;
        const channelsSubject = new Map();
        const channels = new Map();
        let state = api_1.JobState.Queued;
        let pingId = 0;
        const logger = options.logger ? options.logger.createChild('job') : new logger_1.NullLogger();
        // Create the input channel by having a filter.
        const input = new rxjs_1.Subject();
        input.pipe(operators_1.switchMap(message => handler.pipe(operators_1.switchMap(handler => {
            if (handler === null) {
                throw new exception_1.JobDoesNotExistException(name);
            }
            else {
                return handler.inputV.pipe(operators_1.switchMap(validate => validate(message)));
            }
        }))), operators_1.filter(result => result.success), operators_1.map(result => result.data)).subscribe(value => inboundBus.next({ kind: api_1.JobInboundMessageKind.Input, value }));
        outboundBus = rxjs_1.concat(outboundBus, 
        // Add an End message at completion. This will be filtered out if the job actually send an
        // End.
        handler.pipe(operators_1.switchMap(handler => {
            if (handler) {
                return rxjs_1.of({
                    kind: api_1.JobOutboundMessageKind.End, description: handler.jobDescription,
                });
            }
            else {
                return rxjs_1.EMPTY;
            }
        }))).pipe(operators_1.filter(message => this._filterJobOutboundMessages(message, state)), 
        // Update internal logic and Job<> members.
        operators_1.tap(message => {
            // Update the state.
            state = this._updateState(message, state);
            switch (message.kind) {
                case api_1.JobOutboundMessageKind.Log:
                    logger.next(message.entry);
                    break;
                case api_1.JobOutboundMessageKind.ChannelCreate: {
                    const maybeSubject = channelsSubject.get(message.name);
                    // If it doesn't exist or it's closed on the other end.
                    if (!maybeSubject) {
                        const s = new rxjs_1.Subject();
                        channelsSubject.set(message.name, s);
                        channels.set(message.name, s.asObservable());
                    }
                    break;
                }
                case api_1.JobOutboundMessageKind.ChannelMessage: {
                    const maybeSubject = channelsSubject.get(message.name);
                    if (maybeSubject) {
                        maybeSubject.next(message.message);
                    }
                    break;
                }
                case api_1.JobOutboundMessageKind.ChannelComplete: {
                    const maybeSubject = channelsSubject.get(message.name);
                    if (maybeSubject) {
                        maybeSubject.complete();
                        channelsSubject.delete(message.name);
                    }
                    break;
                }
                case api_1.JobOutboundMessageKind.ChannelError: {
                    const maybeSubject = channelsSubject.get(message.name);
                    if (maybeSubject) {
                        maybeSubject.error(message.error);
                        channelsSubject.delete(message.name);
                    }
                    break;
                }
            }
        }, () => {
            state = api_1.JobState.Errored;
        }), 
        // Do output validation (might include default values so this might have side
        // effects). We keep all messages in order.
        operators_1.concatMap(message => {
            if (message.kind !== api_1.JobOutboundMessageKind.Output) {
                return rxjs_1.of(message);
            }
            return handler.pipe(operators_1.switchMap(handler => {
                if (handler === null) {
                    throw new exception_1.JobDoesNotExistException(name);
                }
                else {
                    return handler.outputV.pipe(operators_1.switchMap(validate => validate(message.value)), operators_1.switchMap(output => {
                        if (!output.success) {
                            throw new JobOutputSchemaValidationError(output.errors);
                        }
                        return rxjs_1.of(Object.assign({}, message, { output: output.data }));
                    }));
                }
            }));
        }), _jobShare());
        const output = outboundBus.pipe(operators_1.filter(x => x.kind == api_1.JobOutboundMessageKind.Output), operators_1.map((x) => x.value), operators_1.shareReplay(1));
        // Return the Job.
        return {
            get state() { return state; },
            argument,
            description: handler.pipe(operators_1.switchMap(handler => {
                if (handler === null) {
                    throw new exception_1.JobDoesNotExistException(name);
                }
                else {
                    return rxjs_1.of(handler.jobDescription);
                }
            })),
            output,
            getChannel(name, schema = true) {
                let maybeObservable = channels.get(name);
                if (!maybeObservable) {
                    const s = new rxjs_1.Subject();
                    channelsSubject.set(name, s);
                    channels.set(name, s.asObservable());
                    maybeObservable = s.asObservable();
                }
                return maybeObservable.pipe(
                // Keep the order of messages.
                operators_1.concatMap(message => {
                    return schemaRegistry.compile(schema).pipe(operators_1.switchMap(validate => validate(message)), operators_1.filter(x => x.success), operators_1.map(x => x.data));
                }));
            },
            ping() {
                const id = pingId++;
                inboundBus.next({ kind: api_1.JobInboundMessageKind.Ping, id });
                return outboundBus.pipe(operators_1.filter(x => x.kind === api_1.JobOutboundMessageKind.Pong && x.id == id), operators_1.first(), operators_1.ignoreElements());
            },
            stop() {
                inboundBus.next({ kind: api_1.JobInboundMessageKind.Stop });
            },
            input,
            inboundBus,
            outboundBus,
        };
    }
    _scheduleJob(name, argument, options, waitable) {
        // Get handler first, since this can error out if there's no handler for the job name.
        const handler = this._getInternalDescription(name);
        const optionsDeps = (options && options.dependencies) || [];
        const dependencies = Array.isArray(optionsDeps) ? optionsDeps : [optionsDeps];
        const inboundBus = new rxjs_1.Subject();
        const outboundBus = rxjs_1.concat(
        // Wait for dependencies, make sure to not report messages from dependencies. Subscribe to
        // all dependencies at the same time so they run concurrently.
        rxjs_1.merge(...dependencies.map(x => x.outboundBus)).pipe(operators_1.ignoreElements()), 
        // Wait for pause() to clear (if necessary).
        waitable, rxjs_1.from(handler).pipe(operators_1.switchMap(handler => new rxjs_1.Observable((subscriber) => {
            if (!handler) {
                throw new exception_1.JobDoesNotExistException(name);
            }
            // Validate the argument.
            return handler.argumentV.pipe(operators_1.switchMap(validate => validate(argument)), operators_1.switchMap(output => {
                if (!output.success) {
                    throw new JobInboundMessageSchemaValidationError(output.errors);
                }
                const argument = output.data;
                const description = handler.jobDescription;
                subscriber.next({ kind: api_1.JobOutboundMessageKind.OnReady, description });
                const context = {
                    description,
                    dependencies: [...dependencies],
                    inboundBus: inboundBus.asObservable(),
                    scheduler: this,
                };
                return handler(argument, context);
            })).subscribe(subscriber);
        }))));
        return this._createJob(name, argument, handler, inboundBus, outboundBus, options);
    }
}
exports.SimpleScheduler = SimpleScheduler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2ltcGxlLXNjaGVkdWxlci5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsicGFja2FnZXMvYW5ndWxhcl9kZXZraXQvY29yZS9zcmMvZXhwZXJpbWVudGFsL2pvYnMvc2ltcGxlLXNjaGVkdWxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7R0FNRztBQUNILCtCQVdjO0FBQ2QsOENBU3dCO0FBQ3hCLHFDQUErQztBQUMvQyx5Q0FBMEM7QUFDMUMsK0JBY2U7QUFDZiwyQ0FBdUQ7QUFHdkQsTUFBYSxzQ0FBdUMsU0FBUSxhQUFNLENBQUMseUJBQXlCO0lBQzFGLFlBQVksTUFBc0M7UUFDaEQsS0FBSyxDQUFDLE1BQU0sRUFBRSxrREFBa0QsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7Q0FDRjtBQUpELHdGQUlDO0FBQ0QsTUFBYSw4QkFBK0IsU0FBUSxhQUFNLENBQUMseUJBQXlCO0lBQ2xGLFlBQVksTUFBc0M7UUFDaEQsS0FBSyxDQUFDLE1BQU0sRUFBRSx5Q0FBeUMsQ0FBQyxDQUFDO0lBQzNELENBQUM7Q0FDRjtBQUpELHdFQUlDO0FBWUQsU0FBUyxTQUFTO0lBQ2hCLCtGQUErRjtJQUMvRixpQkFBaUI7SUFDakIsT0FBTyxDQUFDLE1BQXFCLEVBQWlCLEVBQUU7UUFDOUMsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLElBQUksT0FBbUIsQ0FBQztRQUN4QixJQUFJLFFBQVEsR0FBRyxLQUFLLENBQUM7UUFDckIsSUFBSSxVQUFVLEdBQUcsS0FBSyxDQUFDO1FBQ3ZCLElBQUksWUFBMEIsQ0FBQztRQUUvQixPQUFPLElBQUksaUJBQVUsQ0FBSSxVQUFVLENBQUMsRUFBRTtZQUNwQyxJQUFJLFFBQXNCLENBQUM7WUFDM0IsUUFBUSxFQUFFLENBQUM7WUFDWCxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNaLE9BQU8sR0FBRyxJQUFJLGNBQU8sRUFBSyxDQUFDO2dCQUUzQixRQUFRLEdBQUcsT0FBTyxDQUFDLFNBQVMs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QUFRLENBQUMsUUFBUSxDQUFDLENBQUMsRUFDekMscUJBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDakIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUU7b0JBQ25CLE1BQU0sSUFBSSxzQ0FBc0MsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7aUJBQ2pFO2dCQUVELE1BQU0sUUFBUSxHQUFNLE1BQU0sQ0FBQyxJQUFTLENBQUM7Z0JBQ3JDLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUM7Z0JBQzNDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsNEJBQXNCLENBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUM7Z0JBRXZFLE1BQU0sT0FBTyxHQUFHO29CQUNkLFdBQVc7b0JBQ1gsWUFBWSxFQUFFLENBQUMsR0FBRyxZQUFZLENBQUM7b0JBQy9CLFVBQVUsRUFBRSxVQUFVLENBQUMsWUFBWSxFQUFFO29CQUNyQyxTQUFTLEVBQUUsSUFBa0U7aUJBQzlFLENBQUM7Z0JBRUYsT0FBTyxPQUFPLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3BDLENBQUMsQ0FBQyxDQUNILENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzFCLENBQUMsQ0FBQyxDQUFDLENBQ0osQ0FDRixDQUFDO1FBRUYsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDcEYsQ0FBQztDQUNGO0FBM2FELDBDQTJhQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7XG4gIEVNUFRZLFxuICBNb25vVHlwZU9wZXJhdG9yRnVuY3Rpb24sXG4gIE9ic2VydmFibGUsXG4gIE9ic2VydmVyLFxuICBTdWJqZWN0LFxuICBTdWJzY3JpcHRpb24sXG4gIGNvbmNhdCxcbiAgZnJvbSxcbiAgbWVyZ2UsXG4gIG9mLFxufSBmcm9tICdyeGpzJztcbmltcG9ydCB7XG4gIGNvbmNhdE1hcCxcbiAgZmlsdGVyLFxuICBmaXJzdCxcbiAgaWdub3JlRWxlbWVudHMsXG4gIG1hcCxcbiAgc2hhcmVSZXBsYXksXG4gIHN3aXRjaE1hcCxcbiAgdGFwLFxufSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQgeyBKc29uVmFsdWUsIHNjaGVtYSB9IGZyb20gJy4uLy4uL2pzb24nO1xuaW1wb3J0IHsgTnVsbExvZ2dlciB9IGZyb20gJy4uLy4uL2xvZ2dlcic7XG5pbXBvcnQge1xuICBKb2IsXG4gIEpvYkRlc2NyaXB0aW9uLFxuICBKb2JIYW5kbGVyLFxuICBKb2JJbmJvdW5kTWVzc2FnZSxcbiAgSm9iSW5ib3VuZE1lc3NhZ2VLaW5kLFxuICBKb2JOYW1lLFxuICBKb2JPdXRib3VuZE1lc3NhZ2UsXG4gIEpvYk91dGJvdW5kTWVzc2FnZUtpbmQsXG4gIEpvYk91dGJvdW5kTWVzc2FnZU91dHB1dCxcbiAgSm9iU3RhdGUsXG4gIFJlZ2lzdHJ5LFxuICBTY2hlZHVsZUpvYk9wdGlvbnMsXG4gIFNjaGVkdWxlcixcbn0gZnJvbSAnLi9hcGknO1xuaW1wb3J0IHsgSm9iRG9lc05vdEV4aXN0RXhjZXB0aW9uIH0gZnJvbSAnLi9leGNlcHRpb24nO1xuXG5cbmV4cG9ydCBjbGFzcyBKb2JJbmJvdW5kTWVzc2FnZVNjaGVtYVZhbGlkYXRpb25FcnJvciBleHRlbmRzIHNjaGVtYS5TY2hlbWFWYWxpZGF0aW9uRXhjZXB0aW9uIHtcbiAgY29uc3RydWN0b3IoZXJyb3JzPzogc2NoZW1hLlNjaGVtYVZhbGlkYXRvckVycm9yW10pIHtcbiAgICBzdXBlcihlcnJvcnMsICdKb2IgSW5ib3VuZCBNZXNzYWdlIGZhaWxlZCB0byB2YWxpZGF0ZS4gRXJyb3JzOiAnKTtcbiAgfVxufVxuZXhwb3J0IGNsYXNzIEpvYk91dHB1dFNjaGVtYVZhbGlkYXRpb25FcnJvciBleHRlbmRzIHNjaGVtYS5TY2hlbWFWYWxpZGF0aW9uRXhjZXB0aW9uIHtcbiAgY29uc3RydWN0b3IoZXJyb3JzPzogc2NoZW1hLlNjaGVtYVZhbGlkYXRvckVycm9yW10pIHtcbiAgICBzdXBlcihlcnJvcnMsICdKb2IgT3V0cHV0IGZhaWxlZCB0byB2YWxpZGF0ZS4gRXJyb3JzOiAnKTtcbiAgfVxufVxuXG5cbmludGVyZmFjZSBKb2JIYW5kbGVyV2l0aEV4dHJhIGV4dGVuZHMgSm9iSGFuZGxlcjxKc29uVmFsdWUsIEpzb25WYWx1ZSwgSnNvblZhbHVlPiB7XG4gIGpvYkRlc2NyaXB0aW9uOiBKb2JEZXNjcmlwdGlvbjtcblxuICBhcmd1bWVudFY6IE9ic2VydmFibGU8c2NoZW1hLlNjaGVtYVZhbGlkYXRvcj47XG4gIG91dHB1dFY6IE9ic2VydmFibGU8c2NoZW1hLlNjaGVtYVZhbGlkYXRvcj47XG4gIGlucHV0VjogT2JzZXJ2YWJsZTxzY2hlbWEuU2NoZW1hVmFsaWRhdG9yPjtcbn1cblxuXG5mdW5jdGlvbiBfam9iU2hhcmU8VD4oKTogTW9ub1R5cGVPcGVyYXRvckZ1bmN0aW9uPFQ+IHtcbiAgLy8gVGhpcyBpcyB0aGUgc2FtZSBjb2RlIGFzIGEgYHNoYXJlUmVwbGF5KClgIG9wZXJhdG9yLCBidXQgdXNlcyBhIGR1bWJlciBTdWJqZWN0IHJhdGhlciB0aGFuIGFcbiAgLy8gUmVwbGF5U3ViamVjdC5cbiAgcmV0dXJuIChzb3VyY2U6IE9ic2VydmFibGU8VD4pOiBPYnNlcnZhYmxlPFQ+ID0+IHtcbiAgICBsZXQgcmVmQ291bnQgPSAwO1xuICAgIGxldCBzdWJqZWN0OiBTdWJqZWN0PFQ+O1xuICAgIGxldCBoYXNFcnJvciA9IGZhbHNlO1xuICAgIGxldCBpc0NvbXBsZXRlID0gZmFsc2U7XG4gICAgbGV0IHN1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uO1xuXG4gICAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlPFQ+KHN1YnNjcmliZXIgPT4ge1xuICAgICAgbGV0IGlubmVyU3ViOiBTdWJzY3JpcHRpb247XG4gICAgICByZWZDb3VudCsrO1xuICAgICAgaWYgKCFzdWJqZWN0KSB7XG4gICAgICAgIHN1YmplY3QgPSBuZXcgU3ViamVjdDxUPigpO1xuXG4gICAgICAgIGlubmVyU3ViID0gc3ViamVjdC5zdWJzY3JpYmUoc3Vic2NyaWJlcik7XG4gICAgICAgIHN1YnNjcmlwdGlvbiA9IHNvdXJjZS5zdWJzY3JpYmUoe1xuICAgICAgICAgIG5leHQodmFsdWUpIHsgc3ViamVjdC5uZXh0KHZhbHVlKTsgfSxcbiAgICAgICAgICBlcnJvcihlcnIpIHtcbiAgICAgICAgICAgIGhhc0Vycm9yID0gdHJ1ZTtcbiAgICAgICAgICAgIHN1YmplY3QuZXJyb3IoZXJyKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGNvbXBsZXRlKCkge1xuICAgICAgICAgICAgaXNDb21wbGV0ZSA9IHRydWU7XG4gICAgICAgICAgICBzdWJqZWN0LmNvbXBsZXRlKCk7XG4gICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbm5lclN1YiA9IHN1YmplY3Quc3Vic2NyaWJlKHN1YnNjcmliZXIpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICByZWZDb3VudC0tO1xuICAgICAgICBpbm5lclN1Yi51bnN1YnNjcmliZSgpO1xuICAgICAgICBpZiAoc3Vic2NyaXB0aW9uICYmIHJlZkNvdW50ID09PSAwICYmIChpc0NvbXBsZXRlIHx8IGhhc0Vycm9yKSkge1xuICAgICAgICAgIHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pO1xuICB9O1xufVxuXG5cbi8qKlxuICogU2ltcGxlIHNjaGVkdWxlci4gU2hvdWxkIGJlIHRoZSBiYXNlIG9mIGFsbCByZWdpc3RyaWVzIGFuZCBzY2hlZHVsZXJzLlxuICovXG5leHBvcnQgY2xhc3MgU2ltcGxlU2NoZWR1bGVyPFxuICBNaW5pbXVtQXJndW1lbnRUIGV4dGVuZHMgSnNvblZhbHVlID0gSnNvblZhbHVlLFxuICBNaW5pbXVtSW5wdXRUIGV4dGVuZHMgSnNvblZhbHVlID0gSnNvblZhbHVlLFxuICBNaW5pbXVtT3V0cHV0VCBleHRlbmRzIEpzb25WYWx1ZSA9IEpzb25WYWx1ZSxcbj4gaW1wbGVtZW50cyBTY2hlZHVsZXI8TWluaW11bUFyZ3VtZW50VCwgTWluaW11bUlucHV0VCwgTWluaW11bU91dHB1dFQ+IHtcbiAgcHJpdmF0ZSBfaW50ZXJuYWxKb2JEZXNjcmlwdGlvbk1hcCA9IG5ldyBNYXA8Sm9iTmFtZSwgSm9iSGFuZGxlcldpdGhFeHRyYT4oKTtcbiAgcHJpdmF0ZSBfcXVldWU6ICgoKSA9PiB2b2lkKVtdID0gW107XG4gIHByaXZhdGUgX3BhdXNlQ291bnRlciA9IDA7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJvdGVjdGVkIF9qb2JSZWdpc3RyeTogUmVnaXN0cnk8TWluaW11bUFyZ3VtZW50VCwgTWluaW11bUlucHV0VCwgTWluaW11bU91dHB1dFQ+LFxuICAgIHByb3RlY3RlZCBfc2NoZW1hUmVnaXN0cnk6IHNjaGVtYS5TY2hlbWFSZWdpc3RyeSA9IG5ldyBzY2hlbWEuQ29yZVNjaGVtYVJlZ2lzdHJ5KCksXG4gICkge31cblxuICBwcml2YXRlIF9nZXRJbnRlcm5hbERlc2NyaXB0aW9uKG5hbWU6IEpvYk5hbWUpOiBPYnNlcnZhYmxlPEpvYkhhbmRsZXJXaXRoRXh0cmEgfCBudWxsPiB7XG4gICAgY29uc3QgbWF5YmVIYW5kbGVyID0gdGhpcy5faW50ZXJuYWxKb2JEZXNjcmlwdGlvbk1hcC5nZXQobmFtZSk7XG4gICAgaWYgKG1heWJlSGFuZGxlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gb2YobWF5YmVIYW5kbGVyKTtcbiAgICB9XG5cbiAgICBjb25zdCBoYW5kbGVyID0gdGhpcy5fam9iUmVnaXN0cnkuZ2V0PE1pbmltdW1Bcmd1bWVudFQsIE1pbmltdW1JbnB1dFQsIE1pbmltdW1PdXRwdXRUPihuYW1lKTtcblxuICAgIHJldHVybiBoYW5kbGVyLnBpcGUoXG4gICAgICBzd2l0Y2hNYXAoaGFuZGxlciA9PiB7XG4gICAgICAgIGlmIChoYW5kbGVyID09PSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIG9mKG51bGwpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZGVzY3JpcHRpb246IEpvYkRlc2NyaXB0aW9uID0ge1xuICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgYXJndW1lbnQ6IGhhbmRsZXIuam9iRGVzY3JpcHRpb24uYXJndW1lbnQgfHwgdHJ1ZSxcbiAgICAgICAgICBpbnB1dDogaGFuZGxlci5qb2JEZXNjcmlwdGlvbi5pbnB1dCB8fCB0cnVlLFxuICAgICAgICAgIG91dHB1dDogaGFuZGxlci5qb2JEZXNjcmlwdGlvbi5vdXRwdXQgfHwgdHJ1ZSxcbiAgICAgICAgICBjaGFubmVsczogaGFuZGxlci5qb2JEZXNjcmlwdGlvbi5jaGFubmVscyB8fCB7fSxcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBoYW5kbGVyV2l0aEV4dHJhID0gT2JqZWN0LmFzc2lnbihoYW5kbGVyLmJpbmQodW5kZWZpbmVkKSwge1xuICAgICAgICAgIGpvYkRlc2NyaXB0aW9uOiBkZXNjcmlwdGlvbixcbiAgICAgICAgICBhcmd1bWVudFY6IHRoaXMuX3NjaGVtYVJlZ2lzdHJ5LmNvbXBpbGUoZGVzY3JpcHRpb24uYXJndW1lbnQpLnBpcGUoc2hhcmVSZXBsYXkoMSkpLFxuICAgICAgICAgIGlucHV0VjogdGhpcy5fc2NoZW1hUmVnaXN0cnkuY29tcGlsZShkZXNjcmlwdGlvbi5pbnB1dCkucGlwZShzaGFyZVJlcGxheSgxKSksXG4gICAgICAgICAgb3V0cHV0VjogdGhpcy5fc2NoZW1hUmVnaXN0cnkuY29tcGlsZShkZXNjcmlwdGlvbi5vdXRwdXQpLnBpcGUoc2hhcmVSZXBsYXkoMSkpLFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5faW50ZXJuYWxKb2JEZXNjcmlwdGlvbk1hcC5zZXQobmFtZSwgaGFuZGxlcldpdGhFeHRyYSk7XG5cbiAgICAgICAgcmV0dXJuIG9mKGhhbmRsZXJXaXRoRXh0cmEpO1xuICAgICAgfSksXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSBqb2IgZGVzY3JpcHRpb24gZm9yIGEgbmFtZWQgam9iLlxuICAgKlxuICAgKiBAcGFyYW0gbmFtZSBUaGUgbmFtZSBvZiB0aGUgam9iLlxuICAgKiBAcmV0dXJucyBBIGRlc2NyaXB0aW9uLCBvciBudWxsIGlmIHRoZSBqb2IgaXMgbm90IHJlZ2lzdGVyZWQuXG4gICAqL1xuICBnZXREZXNjcmlwdGlvbihuYW1lOiBKb2JOYW1lKSB7XG4gICAgcmV0dXJuIGNvbmNhdChcbiAgICAgIHRoaXMuX2dldEludGVybmFsRGVzY3JpcHRpb24obmFtZSkucGlwZShtYXAoeCA9PiB4ICYmIHguam9iRGVzY3JpcHRpb24pKSxcbiAgICAgIG9mKG51bGwpLFxuICAgICkucGlwZShcbiAgICAgIGZpcnN0KCksXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIGpvYiBuYW1lIGhhcyBiZWVuIHJlZ2lzdGVyZWQuXG4gICAqIEBwYXJhbSBuYW1lIFRoZSBuYW1lIG9mIHRoZSBqb2IuXG4gICAqIEByZXR1cm5zIFRydWUgaWYgdGhlIGpvYiBleGlzdHMsIGZhbHNlIG90aGVyd2lzZS5cbiAgICovXG4gIGhhcyhuYW1lOiBKb2JOYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0RGVzY3JpcHRpb24obmFtZSkucGlwZShcbiAgICAgIG1hcCh4ID0+IHggIT09IG51bGwpLFxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogUGF1c2UgdGhlIHNjaGVkdWxlciwgdGVtcG9yYXJ5IHF1ZXVlaW5nIF9uZXdfIGpvYnMuIFJldHVybnMgYSByZXN1bWUgZnVuY3Rpb24gdGhhdCBzaG91bGQgYmVcbiAgICogdXNlZCB0byByZXN1bWUgZXhlY3V0aW9uLiBJZiBtdWx0aXBsZSBgcGF1c2UoKWAgd2VyZSBjYWxsZWQsIGFsbCB0aGVpciByZXN1bWUgZnVuY3Rpb25zIG11c3RcbiAgICogYmUgY2FsbGVkIGJlZm9yZSB0aGUgU2NoZWR1bGVyIGFjdHVhbGx5IHN0YXJ0cyBuZXcgam9icy4gQWRkaXRpb25hbCBjYWxscyB0byB0aGUgc2FtZSByZXN1bWVcbiAgICogZnVuY3Rpb24gd2lsbCBoYXZlIG5vIGVmZmVjdC5cbiAgICpcbiAgICogSm9icyBhbHJlYWR5IHJ1bm5pbmcgYXJlIE5PVCBwYXVzZWQuIFRoaXMgaXMgcGF1c2luZyB0aGUgc2NoZWR1bGVyIG9ubHkuXG4gICAqL1xuICBwYXVzZSgpIHtcbiAgICBsZXQgY2FsbGVkID0gZmFsc2U7XG4gICAgdGhpcy5fcGF1c2VDb3VudGVyKys7XG5cbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgaWYgKCFjYWxsZWQpIHtcbiAgICAgICAgY2FsbGVkID0gdHJ1ZTtcbiAgICAgICAgaWYgKC0tdGhpcy5fcGF1c2VDb3VudGVyID09IDApIHtcbiAgICAgICAgICAvLyBSZXN1bWUgdGhlIHF1ZXVlLlxuICAgICAgICAgIGNvbnN0IHEgPSB0aGlzLl9xdWV1ZTtcbiAgICAgICAgICB0aGlzLl9xdWV1ZSA9IFtdO1xuICAgICAgICAgIHEuZm9yRWFjaChmbiA9PiBmbigpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogU2NoZWR1bGUgYSBqb2IgdG8gYmUgcnVuLCB1c2luZyBpdHMgbmFtZS5cbiAgICogQHBhcmFtIG5hbWUgVGhlIG5hbWUgb2Ygam9iIHRvIGJlIHJ1bi5cbiAgICogQHBhcmFtIGFyZ3VtZW50IFRoZSBhcmd1bWVudCB0byBzZW5kIHRvIHRoZSBqb2Igd2hlbiBzdGFydGluZyBpdC5cbiAgICogQHBhcmFtIG9wdGlvbnMgU2NoZWR1bGluZyBvcHRpb25zLlxuICAgKiBAcmV0dXJucyBUaGUgSm9iIGJlaW5nIHJ1bi5cbiAgICovXG4gIHNjaGVkdWxlPEEgZXh0ZW5kcyBNaW5pbXVtQXJndW1lbnRULCBJIGV4dGVuZHMgTWluaW11bUlucHV0VCwgTyBleHRlbmRzIE1pbmltdW1PdXRwdXRUPihcbiAgICBuYW1lOiBKb2JOYW1lLFxuICAgIGFyZ3VtZW50OiBBLFxuICAgIG9wdGlvbnM/OiBTY2hlZHVsZUpvYk9wdGlvbnMsXG4gICk6IEpvYjxBLCBJLCBPPiB7XG4gICAgaWYgKHRoaXMuX3BhdXNlQ291bnRlciA+IDApIHtcbiAgICAgIGNvbnN0IHdhaXRhYmxlID0gbmV3IFN1YmplY3Q8bmV2ZXI+KCk7XG4gICAgICB0aGlzLl9xdWV1ZS5wdXNoKCgpID0+IHdhaXRhYmxlLmNvbXBsZXRlKCkpO1xuXG4gICAgICByZXR1cm4gdGhpcy5fc2NoZWR1bGVKb2I8QSwgSSwgTz4obmFtZSwgYXJndW1lbnQsIG9wdGlvbnMgfHwge30sIHdhaXRhYmxlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fc2NoZWR1bGVKb2I8QSwgSSwgTz4obmFtZSwgYXJndW1lbnQsIG9wdGlvbnMgfHwge30sIEVNUFRZKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaWx0ZXIgbWVzc2FnZXMuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBwcml2YXRlIF9maWx0ZXJKb2JPdXRib3VuZE1lc3NhZ2VzPE8gZXh0ZW5kcyBNaW5pbXVtT3V0cHV0VD4oXG4gICAgbWVzc2FnZTogSm9iT3V0Ym91bmRNZXNzYWdlPE8+LFxuICAgIHN0YXRlOiBKb2JTdGF0ZSxcbiAgKSB7XG4gICAgc3dpdGNoIChtZXNzYWdlLmtpbmQpIHtcbiAgICAgIGNhc2UgSm9iT3V0Ym91bmRNZXNzYWdlS2luZC5PblJlYWR5OlxuICAgICAgICByZXR1cm4gc3RhdGUgPT0gSm9iU3RhdGUuUXVldWVkO1xuICAgICAgY2FzZSBKb2JPdXRib3VuZE1lc3NhZ2VLaW5kLlN0YXJ0OlxuICAgICAgICByZXR1cm4gc3RhdGUgPT0gSm9iU3RhdGUuUmVhZHk7XG5cbiAgICAgIGNhc2UgSm9iT3V0Ym91bmRNZXNzYWdlS2luZC5FbmQ6XG4gICAgICAgIHJldHVybiBzdGF0ZSA9PSBKb2JTdGF0ZS5TdGFydGVkIHx8IHN0YXRlID09IEpvYlN0YXRlLlJlYWR5O1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiBhIG5ldyBzdGF0ZS4gVGhpcyBpcyBqdXN0IHRvIHNpbXBsaWZ5IHRoZSByZWFkaW5nIG9mIHRoZSBfY3JlYXRlSm9iIG1ldGhvZC5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHByaXZhdGUgX3VwZGF0ZVN0YXRlPE8gZXh0ZW5kcyBNaW5pbXVtT3V0cHV0VD4oXG4gICAgbWVzc2FnZTogSm9iT3V0Ym91bmRNZXNzYWdlPE8+LFxuICAgIHN0YXRlOiBKb2JTdGF0ZSxcbiAgKTogSm9iU3RhdGUge1xuICAgIHN3aXRjaCAobWVzc2FnZS5raW5kKSB7XG4gICAgICBjYXNlIEpvYk91dGJvdW5kTWVzc2FnZUtpbmQuT25SZWFkeTpcbiAgICAgICAgcmV0dXJuIEpvYlN0YXRlLlJlYWR5O1xuICAgICAgY2FzZSBKb2JPdXRib3VuZE1lc3NhZ2VLaW5kLlN0YXJ0OlxuICAgICAgICByZXR1cm4gSm9iU3RhdGUuU3RhcnRlZDtcbiAgICAgIGNhc2UgSm9iT3V0Ym91bmRNZXNzYWdlS2luZC5FbmQ6XG4gICAgICAgIHJldHVybiBKb2JTdGF0ZS5FbmRlZDtcbiAgICB9XG5cbiAgICByZXR1cm4gc3RhdGU7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIHRoZSBqb2IuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBwcml2YXRlIF9jcmVhdGVKb2I8QSBleHRlbmRzIE1pbmltdW1Bcmd1bWVudFQsIEkgZXh0ZW5kcyBNaW5pbXVtSW5wdXRULCBPIGV4dGVuZHMgTWluaW11bU91dHB1dFQ+KFxuICAgIG5hbWU6IEpvYk5hbWUsXG4gICAgYXJndW1lbnQ6IEEsXG4gICAgaGFuZGxlcjogT2JzZXJ2YWJsZTxKb2JIYW5kbGVyV2l0aEV4dHJhIHwgbnVsbD4sXG4gICAgaW5ib3VuZEJ1czogT2JzZXJ2ZXI8Sm9iSW5ib3VuZE1lc3NhZ2U8ST4+LFxuICAgIG91dGJvdW5kQnVzOiBPYnNlcnZhYmxlPEpvYk91dGJvdW5kTWVzc2FnZTxPPj4sXG4gICAgb3B0aW9uczogU2NoZWR1bGVKb2JPcHRpb25zLFxuICApOiBKb2I8QSwgSSwgTz4ge1xuICAgIGNvbnN0IHNjaGVtYVJlZ2lzdHJ5ID0gdGhpcy5fc2NoZW1hUmVnaXN0cnk7XG5cbiAgICBjb25zdCBjaGFubmVsc1N1YmplY3QgPSBuZXcgTWFwPHN0cmluZywgU3ViamVjdDxKc29uVmFsdWU+PigpO1xuICAgIGNvbnN0IGNoYW5uZWxzID0gbmV3IE1hcDxzdHJpbmcsIE9ic2VydmFibGU8SnNvblZhbHVlPj4oKTtcblxuICAgIGxldCBzdGF0ZSA9IEpvYlN0YXRlLlF1ZXVlZDtcbiAgICBsZXQgcGluZ0lkID0gMDtcblxuICAgIGNvbnN0IGxvZ2dlciA9IG9wdGlvbnMubG9nZ2VyID8gb3B0aW9ucy5sb2dnZXIuY3JlYXRlQ2hpbGQoJ2pvYicpIDogbmV3IE51bGxMb2dnZXIoKTtcblxuICAgIC8vIENyZWF0ZSB0aGUgaW5wdXQgY2hhbm5lbCBieSBoYXZpbmcgYSBmaWx0ZXIuXG4gICAgY29uc3QgaW5wdXQgPSBuZXcgU3ViamVjdDxKc29uVmFsdWU+KCk7XG4gICAgaW5wdXQucGlwZShcbiAgICAgIHN3aXRjaE1hcChtZXNzYWdlID0+IGhhbmRsZXIucGlwZShcbiAgICAgICAgc3dpdGNoTWFwKGhhbmRsZXIgPT4ge1xuICAgICAgICAgIGlmIChoYW5kbGVyID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgSm9iRG9lc05vdEV4aXN0RXhjZXB0aW9uKG5hbWUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlci5pbnB1dFYucGlwZShcbiAgICAgICAgICAgICAgc3dpdGNoTWFwKHZhbGlkYXRlID0+IHZhbGlkYXRlKG1lc3NhZ2UpKSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICB9KSxcbiAgICAgICkpLFxuICAgICAgZmlsdGVyKHJlc3VsdCA9PiByZXN1bHQuc3VjY2VzcyksXG4gICAgICBtYXAocmVzdWx0ID0+IHJlc3VsdC5kYXRhIGFzIEkpLFxuICAgICkuc3Vic2NyaWJlKFxuICAgICAgdmFsdWUgPT4gaW5ib3VuZEJ1cy5uZXh0KHsga2luZDogSm9iSW5ib3VuZE1lc3NhZ2VLaW5kLklucHV0LCB2YWx1ZSB9KSxcbiAgICApO1xuXG4gICAgb3V0Ym91bmRCdXMgPSBjb25jYXQoXG4gICAgICBvdXRib3VuZEJ1cyxcbiAgICAgIC8vIEFkZCBhbiBFbmQgbWVzc2FnZSBhdCBjb21wbGV0aW9uLiBUaGlzIHdpbGwgYmUgZmlsdGVyZWQgb3V0IGlmIHRoZSBqb2IgYWN0dWFsbHkgc2VuZCBhblxuICAgICAgLy8gRW5kLlxuICAgICAgaGFuZGxlci5waXBlKHN3aXRjaE1hcChoYW5kbGVyID0+IHtcbiAgICAgICAgaWYgKGhhbmRsZXIpIHtcbiAgICAgICAgICByZXR1cm4gb2Y8Sm9iT3V0Ym91bmRNZXNzYWdlPE8+Pih7XG4gICAgICAgICAgICBraW5kOiBKb2JPdXRib3VuZE1lc3NhZ2VLaW5kLkVuZCwgZGVzY3JpcHRpb246IGhhbmRsZXIuam9iRGVzY3JpcHRpb24sXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIEVNUFRZIGFzIE9ic2VydmFibGU8Sm9iT3V0Ym91bmRNZXNzYWdlPE8+PjtcbiAgICAgICAgfVxuICAgICAgfSkpLFxuICAgICkucGlwZShcbiAgICAgIGZpbHRlcihtZXNzYWdlID0+IHRoaXMuX2ZpbHRlckpvYk91dGJvdW5kTWVzc2FnZXMobWVzc2FnZSwgc3RhdGUpKSxcbiAgICAgIC8vIFVwZGF0ZSBpbnRlcm5hbCBsb2dpYyBhbmQgSm9iPD4gbWVtYmVycy5cbiAgICAgIHRhcChtZXNzYWdlID0+IHtcbiAgICAgICAgLy8gVXBkYXRlIHRoZSBzdGF0ZS5cbiAgICAgICAgc3RhdGUgPSB0aGlzLl91cGRhdGVTdGF0ZShtZXNzYWdlLCBzdGF0ZSk7XG5cbiAgICAgICAgc3dpdGNoIChtZXNzYWdlLmtpbmQpIHtcbiAgICAgICAgICBjYXNlIEpvYk91dGJvdW5kTWVzc2FnZUtpbmQuTG9nOlxuICAgICAgICAgICAgbG9nZ2VyLm5leHQobWVzc2FnZS5lbnRyeSk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIGNhc2UgSm9iT3V0Ym91bmRNZXNzYWdlS2luZC5DaGFubmVsQ3JlYXRlOiB7XG4gICAgICAgICAgICBjb25zdCBtYXliZVN1YmplY3QgPSBjaGFubmVsc1N1YmplY3QuZ2V0KG1lc3NhZ2UubmFtZSk7XG4gICAgICAgICAgICAvLyBJZiBpdCBkb2Vzbid0IGV4aXN0IG9yIGl0J3MgY2xvc2VkIG9uIHRoZSBvdGhlciBlbmQuXG4gICAgICAgICAgICBpZiAoIW1heWJlU3ViamVjdCkge1xuICAgICAgICAgICAgICBjb25zdCBzID0gbmV3IFN1YmplY3Q8SnNvblZhbHVlPigpO1xuICAgICAgICAgICAgICBjaGFubmVsc1N1YmplY3Quc2V0KG1lc3NhZ2UubmFtZSwgcyk7XG4gICAgICAgICAgICAgIGNoYW5uZWxzLnNldChtZXNzYWdlLm5hbWUsIHMuYXNPYnNlcnZhYmxlKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY2FzZSBKb2JPdXRib3VuZE1lc3NhZ2VLaW5kLkNoYW5uZWxNZXNzYWdlOiB7XG4gICAgICAgICAgICBjb25zdCBtYXliZVN1YmplY3QgPSBjaGFubmVsc1N1YmplY3QuZ2V0KG1lc3NhZ2UubmFtZSk7XG4gICAgICAgICAgICBpZiAobWF5YmVTdWJqZWN0KSB7XG4gICAgICAgICAgICAgIG1heWJlU3ViamVjdC5uZXh0KG1lc3NhZ2UubWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjYXNlIEpvYk91dGJvdW5kTWVzc2FnZUtpbmQuQ2hhbm5lbENvbXBsZXRlOiB7XG4gICAgICAgICAgICBjb25zdCBtYXliZVN1YmplY3QgPSBjaGFubmVsc1N1YmplY3QuZ2V0KG1lc3NhZ2UubmFtZSk7XG4gICAgICAgICAgICBpZiAobWF5YmVTdWJqZWN0KSB7XG4gICAgICAgICAgICAgIG1heWJlU3ViamVjdC5jb21wbGV0ZSgpO1xuICAgICAgICAgICAgICBjaGFubmVsc1N1YmplY3QuZGVsZXRlKG1lc3NhZ2UubmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjYXNlIEpvYk91dGJvdW5kTWVzc2FnZUtpbmQuQ2hhbm5lbEVycm9yOiB7XG4gICAgICAgICAgICBjb25zdCBtYXliZVN1YmplY3QgPSBjaGFubmVsc1N1YmplY3QuZ2V0KG1lc3NhZ2UubmFtZSk7XG4gICAgICAgICAgICBpZiAobWF5YmVTdWJqZWN0KSB7XG4gICAgICAgICAgICAgIG1heWJlU3ViamVjdC5lcnJvcihtZXNzYWdlLmVycm9yKTtcbiAgICAgICAgICAgICAgY2hhbm5lbHNTdWJqZWN0LmRlbGV0ZShtZXNzYWdlLm5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LCAoKSA9PiB7XG4gICAgICAgIHN0YXRlID0gSm9iU3RhdGUuRXJyb3JlZDtcbiAgICAgIH0pLFxuXG4gICAgICAvLyBEbyBvdXRwdXQgdmFsaWRhdGlvbiAobWlnaHQgaW5jbHVkZSBkZWZhdWx0IHZhbHVlcyBzbyB0aGlzIG1pZ2h0IGhhdmUgc2lkZVxuICAgICAgLy8gZWZmZWN0cykuIFdlIGtlZXAgYWxsIG1lc3NhZ2VzIGluIG9yZGVyLlxuICAgICAgY29uY2F0TWFwKG1lc3NhZ2UgPT4ge1xuICAgICAgICBpZiAobWVzc2FnZS5raW5kICE9PSBKb2JPdXRib3VuZE1lc3NhZ2VLaW5kLk91dHB1dCkge1xuICAgICAgICAgIHJldHVybiBvZihtZXNzYWdlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBoYW5kbGVyLnBpcGUoXG4gICAgICAgICAgc3dpdGNoTWFwKGhhbmRsZXIgPT4ge1xuICAgICAgICAgICAgaWYgKGhhbmRsZXIgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEpvYkRvZXNOb3RFeGlzdEV4Y2VwdGlvbihuYW1lKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGVyLm91dHB1dFYucGlwZShcbiAgICAgICAgICAgICAgICBzd2l0Y2hNYXAodmFsaWRhdGUgPT4gdmFsaWRhdGUobWVzc2FnZS52YWx1ZSkpLFxuICAgICAgICAgICAgICAgIHN3aXRjaE1hcChvdXRwdXQgPT4ge1xuICAgICAgICAgICAgICAgICAgaWYgKCFvdXRwdXQuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgSm9iT3V0cHV0U2NoZW1hVmFsaWRhdGlvbkVycm9yKG91dHB1dC5lcnJvcnMpO1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICByZXR1cm4gb2Yoe1xuICAgICAgICAgICAgICAgICAgICAuLi5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBvdXRwdXQ6IG91dHB1dC5kYXRhIGFzIE8sXG4gICAgICAgICAgICAgICAgICB9IGFzIEpvYk91dGJvdW5kTWVzc2FnZU91dHB1dDxPPik7XG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSksXG4gICAgICAgICkgYXMgT2JzZXJ2YWJsZTxKb2JPdXRib3VuZE1lc3NhZ2U8Tz4+O1xuICAgICAgfSksXG4gICAgICBfam9iU2hhcmUoKSxcbiAgICApO1xuXG4gICAgY29uc3Qgb3V0cHV0ID0gb3V0Ym91bmRCdXMucGlwZShcbiAgICAgIGZpbHRlcih4ID0+IHgua2luZCA9PSBKb2JPdXRib3VuZE1lc3NhZ2VLaW5kLk91dHB1dCksXG4gICAgICBtYXAoKHg6IEpvYk91dGJvdW5kTWVzc2FnZU91dHB1dDxPPikgPT4geC52YWx1ZSksXG4gICAgICBzaGFyZVJlcGxheSgxKSxcbiAgICApO1xuXG4gICAgLy8gUmV0dXJuIHRoZSBKb2IuXG4gICAgcmV0dXJuIHtcbiAgICAgIGdldCBzdGF0ZSgpIHsgcmV0dXJuIHN0YXRlOyB9LFxuICAgICAgYXJndW1lbnQsXG4gICAgICBkZXNjcmlwdGlvbjogaGFuZGxlci5waXBlKFxuICAgICAgICBzd2l0Y2hNYXAoaGFuZGxlciA9PiB7XG4gICAgICAgICAgaWYgKGhhbmRsZXIgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBKb2JEb2VzTm90RXhpc3RFeGNlcHRpb24obmFtZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBvZihoYW5kbGVyLmpvYkRlc2NyaXB0aW9uKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pLFxuICAgICAgKSxcbiAgICAgIG91dHB1dCxcbiAgICAgIGdldENoYW5uZWw8VCBleHRlbmRzIEpzb25WYWx1ZT4oXG4gICAgICAgIG5hbWU6IEpvYk5hbWUsXG4gICAgICAgIHNjaGVtYTogc2NoZW1hLkpzb25TY2hlbWEgPSB0cnVlLFxuICAgICAgKTogT2JzZXJ2YWJsZTxUPiB7XG4gICAgICAgIGxldCBtYXliZU9ic2VydmFibGUgPSBjaGFubmVscy5nZXQobmFtZSk7XG4gICAgICAgIGlmICghbWF5YmVPYnNlcnZhYmxlKSB7XG4gICAgICAgICAgY29uc3QgcyA9IG5ldyBTdWJqZWN0PFQ+KCk7XG4gICAgICAgICAgY2hhbm5lbHNTdWJqZWN0LnNldChuYW1lLCBzKTtcbiAgICAgICAgICBjaGFubmVscy5zZXQobmFtZSwgcy5hc09ic2VydmFibGUoKSk7XG5cbiAgICAgICAgICBtYXliZU9ic2VydmFibGUgPSBzLmFzT2JzZXJ2YWJsZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG1heWJlT2JzZXJ2YWJsZS5waXBlKFxuICAgICAgICAgIC8vIEtlZXAgdGhlIG9yZGVyIG9mIG1lc3NhZ2VzLlxuICAgICAgICAgIGNvbmNhdE1hcChcbiAgICAgICAgICAgIG1lc3NhZ2UgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gc2NoZW1hUmVnaXN0cnkuY29tcGlsZShzY2hlbWEpLnBpcGUoXG4gICAgICAgICAgICAgICAgc3dpdGNoTWFwKHZhbGlkYXRlID0+IHZhbGlkYXRlKG1lc3NhZ2UpKSxcbiAgICAgICAgICAgICAgICBmaWx0ZXIoeCA9PiB4LnN1Y2Nlc3MpLFxuICAgICAgICAgICAgICAgIG1hcCh4ID0+IHguZGF0YSBhcyBUKSxcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgKSxcbiAgICAgICAgKTtcbiAgICAgIH0sXG4gICAgICBwaW5nKCkge1xuICAgICAgICBjb25zdCBpZCA9IHBpbmdJZCsrO1xuICAgICAgICBpbmJvdW5kQnVzLm5leHQoeyBraW5kOiBKb2JJbmJvdW5kTWVzc2FnZUtpbmQuUGluZywgaWQgfSk7XG5cbiAgICAgICAgcmV0dXJuIG91dGJvdW5kQnVzLnBpcGUoXG4gICAgICAgICAgZmlsdGVyKHggPT4geC5raW5kID09PSBKb2JPdXRib3VuZE1lc3NhZ2VLaW5kLlBvbmcgJiYgeC5pZCA9PSBpZCksXG4gICAgICAgICAgZmlyc3QoKSxcbiAgICAgICAgICBpZ25vcmVFbGVtZW50cygpLFxuICAgICAgICApO1xuICAgICAgfSxcbiAgICAgIHN0b3AoKSB7XG4gICAgICAgIGluYm91bmRCdXMubmV4dCh7IGtpbmQ6IEpvYkluYm91bmRNZXNzYWdlS2luZC5TdG9wIH0pO1xuICAgICAgfSxcbiAgICAgIGlucHV0LFxuICAgICAgaW5ib3VuZEJ1cyxcbiAgICAgIG91dGJvdW5kQnVzLFxuICAgIH07XG4gIH1cblxuICBwcm90ZWN0ZWQgX3NjaGVkdWxlSm9iPFxuICAgIEEgZXh0ZW5kcyBNaW5pbXVtQXJndW1lbnRULFxuICAgIEkgZXh0ZW5kcyBNaW5pbXVtSW5wdXRULFxuICAgIE8gZXh0ZW5kcyBNaW5pbXVtT3V0cHV0VCxcbiAgPihcbiAgICBuYW1lOiBKb2JOYW1lLFxuICAgIGFyZ3VtZW50OiBBLFxuICAgIG9wdGlvbnM6IFNjaGVkdWxlSm9iT3B0aW9ucyxcbiAgICB3YWl0YWJsZTogT2JzZXJ2YWJsZTxuZXZlcj4sXG4gICk6IEpvYjxBLCBJLCBPPiB7XG4gICAgLy8gR2V0IGhhbmRsZXIgZmlyc3QsIHNpbmNlIHRoaXMgY2FuIGVycm9yIG91dCBpZiB0aGVyZSdzIG5vIGhhbmRsZXIgZm9yIHRoZSBqb2IgbmFtZS5cbiAgICBjb25zdCBoYW5kbGVyID0gdGhpcy5fZ2V0SW50ZXJuYWxEZXNjcmlwdGlvbihuYW1lKTtcblxuICAgIGNvbnN0IG9wdGlvbnNEZXBzID0gKG9wdGlvbnMgJiYgb3B0aW9ucy5kZXBlbmRlbmNpZXMpIHx8IFtdO1xuICAgIGNvbnN0IGRlcGVuZGVuY2llcyA9IEFycmF5LmlzQXJyYXkob3B0aW9uc0RlcHMpID8gb3B0aW9uc0RlcHMgOiBbb3B0aW9uc0RlcHNdO1xuXG4gICAgY29uc3QgaW5ib3VuZEJ1cyA9IG5ldyBTdWJqZWN0PEpvYkluYm91bmRNZXNzYWdlPEk+PigpO1xuICAgIGNvbnN0IG91dGJvdW5kQnVzID0gY29uY2F0KFxuICAgICAgLy8gV2FpdCBmb3IgZGVwZW5kZW5jaWVzLCBtYWtlIHN1cmUgdG8gbm90IHJlcG9ydCBtZXNzYWdlcyBmcm9tIGRlcGVuZGVuY2llcy4gU3Vic2NyaWJlIHRvXG4gICAgICAvLyBhbGwgZGVwZW5kZW5jaWVzIGF0IHRoZSBzYW1lIHRpbWUgc28gdGhleSBydW4gY29uY3VycmVudGx5LlxuICAgICAgbWVyZ2UoLi4uZGVwZW5kZW5jaWVzLm1hcCh4ID0+IHgub3V0Ym91bmRCdXMpKS5waXBlKGlnbm9yZUVsZW1lbnRzKCkpLFxuXG4gICAgICAvLyBXYWl0IGZvciBwYXVzZSgpIHRvIGNsZWFyIChpZiBuZWNlc3NhcnkpLlxuICAgICAgd2FpdGFibGUsXG5cbiAgICAgIGZyb20oaGFuZGxlcikucGlwZShcbiAgICAgICAgc3dpdGNoTWFwKGhhbmRsZXIgPT4gbmV3IE9ic2VydmFibGUoKHN1YnNjcmliZXI6IE9ic2VydmVyPEpvYk91dGJvdW5kTWVzc2FnZTxPPj4pID0+IHtcbiAgICAgICAgICBpZiAoIWhhbmRsZXIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBKb2JEb2VzTm90RXhpc3RFeGNlcHRpb24obmFtZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gVmFsaWRhdGUgdGhlIGFyZ3VtZW50LlxuICAgICAgICAgIHJldHVybiBoYW5kbGVyLmFyZ3VtZW50Vi5waXBlKFxuICAgICAgICAgICAgc3dpdGNoTWFwKHZhbGlkYXRlID0+IHZhbGlkYXRlKGFyZ3VtZW50KSksXG4gICAgICAgICAgICBzd2l0Y2hNYXAob3V0cHV0ID0+IHtcbiAgICAgICAgICAgICAgaWYgKCFvdXRwdXQuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBKb2JJbmJvdW5kTWVzc2FnZVNjaGVtYVZhbGlkYXRpb25FcnJvcihvdXRwdXQuZXJyb3JzKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGNvbnN0IGFyZ3VtZW50OiBBID0gb3V0cHV0LmRhdGEgYXMgQTtcbiAgICAgICAgICAgICAgY29uc3QgZGVzY3JpcHRpb24gPSBoYW5kbGVyLmpvYkRlc2NyaXB0aW9uO1xuICAgICAgICAgICAgICBzdWJzY3JpYmVyLm5leHQoeyBraW5kOiBKb2JPdXRib3VuZE1lc3NhZ2VLaW5kLk9uUmVhZHksIGRlc2NyaXB0aW9uIH0pO1xuXG4gICAgICAgICAgICAgIGNvbnN0IGNvbnRleHQgPSB7XG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgICAgZGVwZW5kZW5jaWVzOiBbLi4uZGVwZW5kZW5jaWVzXSxcbiAgICAgICAgICAgICAgICBpbmJvdW5kQnVzOiBpbmJvdW5kQnVzLmFzT2JzZXJ2YWJsZSgpLFxuICAgICAgICAgICAgICAgIHNjaGVkdWxlcjogdGhpcyBhcyBTY2hlZHVsZXI8TWluaW11bUFyZ3VtZW50VCwgTWluaW11bUlucHV0VCwgTWluaW11bU91dHB1dFQ+LFxuICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGVyKGFyZ3VtZW50LCBjb250ZXh0KTtcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICkuc3Vic2NyaWJlKHN1YnNjcmliZXIpO1xuICAgICAgICB9KSksXG4gICAgICApLFxuICAgICk7XG5cbiAgICByZXR1cm4gdGhpcy5fY3JlYXRlSm9iKG5hbWUsIGFyZ3VtZW50LCBoYW5kbGVyLCBpbmJvdW5kQnVzLCBvdXRib3VuZEJ1cywgb3B0aW9ucyk7XG4gIH1cbn1cbiJdfQ==