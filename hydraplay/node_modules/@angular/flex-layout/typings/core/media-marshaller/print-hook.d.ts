import { MediaChange } from '../media-change';
import { BreakPoint } from '../breakpoints/break-point';
import { LayoutConfigOptions } from '../tokens/library-config';
import { BreakPointRegistry, OptionalBreakPoint } from '../breakpoints/break-point-registry';
/**
 * Interface to apply PrintHook to call anonymous `target.updateStyles()`
 */
export interface HookTarget {
    activatedBreakpoints: BreakPoint[];
    updateStyles(): void;
}
export declare const BREAKPOINT_PRINT: {
    alias: string;
    mediaQuery: string;
    priority: number;
};
/**
 * PrintHook - Use to intercept print MediaQuery activations and force
 *             layouts to render with the specified print alias/breakpoint
 *
 * Used in MediaMarshaller and MediaObserver
 */
export declare class PrintHook {
    protected breakpoints: BreakPointRegistry;
    protected layoutConfig: LayoutConfigOptions;
    constructor(breakpoints: BreakPointRegistry, layoutConfig: LayoutConfigOptions);
    /** Add 'print' mediaQuery: to listen for matchMedia activations */
    withPrintQuery(queries: string[]): string[];
    /** Is the MediaChange event for any 'print' @media */
    isPrintEvent(e: MediaChange): Boolean;
    /** What is the desired mqAlias to use while printing? */
    readonly printAlias: string[];
    /** Lookup breakpoints associated with print aliases. */
    readonly printBreakPoints: BreakPoint[];
    /** Lookup breakpoint associated with mediaQuery */
    getEventBreakpoints({ mediaQuery }: MediaChange): BreakPoint[];
    /** Update event with printAlias mediaQuery information */
    updateEvent(event: MediaChange): MediaChange;
    /**
     * Prepare RxJs filter operator with partial application
     * @return pipeable filter predicate
     */
    interceptEvents(target: HookTarget): (event: MediaChange) => void;
    /** Stop mediaChange event propagation in event streams */
    blockPropagation(): (event: MediaChange) => boolean;
    /**
     * Save current activateBreakpoints (for later restore)
     * and substitute only the printAlias breakpoint
     */
    protected startPrinting(target: HookTarget, bpList: OptionalBreakPoint[]): void;
    /** For any print de-activations, reset the entire print queue */
    protected stopPrinting(target: HookTarget): void;
    /**
     * To restore pre-Print Activations, we must capture the proper
     * list of breakpoint activations BEFORE print starts. OnBeforePrint()
     * is not supported; so 'print' mediaQuery activations must be used.
     *
     * >  But activated breakpoints are deactivated BEFORE 'print' activation.
     *
     * Let's capture all de-activations using the following logic:
     *
     *  When not printing:
     *    - clear cache when activating non-print breakpoint
     *    - update cache (and sort) when deactivating
     *
     *  When printing:
     *    - sort and save when starting print
     *    - restore as activatedTargets and clear when stop printing
     */
    collectActivations(event: MediaChange): void;
    /** Is this service currently in Print-mode ? */
    private isPrinting;
    private queue;
    private deactivations;
}
