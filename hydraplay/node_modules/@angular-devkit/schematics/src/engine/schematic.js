"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const core_1 = require("@angular-devkit/core");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const call_1 = require("../rules/call");
const scoped_1 = require("../tree/scoped");
class InvalidSchematicsNameException extends core_1.BaseException {
    constructor(name) {
        super(`Schematics has invalid name: "${name}".`);
    }
}
exports.InvalidSchematicsNameException = InvalidSchematicsNameException;
class SchematicImpl {
    constructor(_description, _factory, _collection, _engine) {
        this._description = _description;
        this._factory = _factory;
        this._collection = _collection;
        this._engine = _engine;
        if (!_description.name.match(/^[-@/_.a-zA-Z0-9]+$/)) {
            throw new InvalidSchematicsNameException(_description.name);
        }
    }
    get description() { return this._description; }
    get collection() { return this._collection; }
    call(options, host, parentContext, executionOptions) {
        const context = this._engine.createContext(this, parentContext, executionOptions);
        return host
            .pipe(operators_1.first(), operators_1.concatMap(tree => this._engine.transformOptions(this, options, context).pipe(operators_1.map(o => [tree, o]))), operators_1.concatMap(([tree, transformedOptions]) => {
            let input;
            let scoped = false;
            if (executionOptions && executionOptions.scope) {
                scoped = true;
                input = new scoped_1.ScopedTree(tree, executionOptions.scope);
            }
            else {
                input = tree;
            }
            return call_1.callRule(this._factory(transformedOptions), rxjs_1.of(input), context).pipe(operators_1.map(output => {
                if (output === input) {
                    return tree;
                }
                else if (scoped) {
                    tree.merge(output);
                    return tree;
                }
                else {
                    return output;
                }
            }));
        }));
    }
}
exports.SchematicImpl = SchematicImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NoZW1hdGljLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9hbmd1bGFyX2RldmtpdC9zY2hlbWF0aWNzL3NyYy9lbmdpbmUvc2NoZW1hdGljLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7OztHQU1HO0FBQ0gsK0NBQXFEO0FBQ3JELCtCQUFzRDtBQUN0RCw4Q0FBdUQ7QUFDdkQsd0NBQXlDO0FBRXpDLDJDQUE0QztBQVk1QyxNQUFhLDhCQUErQixTQUFRLG9CQUFhO0lBQy9ELFlBQVksSUFBWTtRQUN0QixLQUFLLENBQUMsaUNBQWlDLElBQUksSUFBSSxDQUFDLENBQUM7SUFDbkQsQ0FBQztDQUNGO0FBSkQsd0VBSUM7QUFHRCxNQUFhLGFBQWE7SUFHeEIsWUFBb0IsWUFBMkQsRUFDM0QsUUFBeUIsRUFDekIsV0FBZ0QsRUFDaEQsT0FBd0M7UUFIeEMsaUJBQVksR0FBWixZQUFZLENBQStDO1FBQzNELGFBQVEsR0FBUixRQUFRLENBQWlCO1FBQ3pCLGdCQUFXLEdBQVgsV0FBVyxDQUFxQztRQUNoRCxZQUFPLEdBQVAsT0FBTyxDQUFpQztRQUMxRCxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMscUJBQXFCLENBQUMsRUFBRTtZQUNuRCxNQUFNLElBQUksOEJBQThCLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzdEO0lBQ0gsQ0FBQztJQUVELElBQUksV0FBVyxLQUFLLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7SUFDL0MsSUFBSSxVQUFVLEtBQUssT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztJQUU3QyxJQUFJLENBQ0YsT0FBZ0IsRUFDaEIsSUFBc0IsRUFDdEIsYUFBdUUsRUFDdkUsZ0JBQTRDO1FBRTVDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztRQUVsRixPQUFPLElBQUk7YUFDUixJQUFJLENBQ0gsaUJBQUssRUFBRSxFQUNQLHFCQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUMxRSxlQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUNwQixDQUFDLEVBQ0YscUJBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLGtCQUFrQixDQUFrQixFQUFFLEVBQUU7WUFDeEQsSUFBSSxLQUFXLENBQUM7WUFDaEIsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDO1lBQ25CLElBQUksZ0JBQWdCLElBQUksZ0JBQWdCLENBQUMsS0FBSyxFQUFFO2dCQUM5QyxNQUFNLEdBQUcsSUFBSSxDQUFDO2dCQUNkLEtBQUssR0FBRyxJQUFJLG1CQUFVLENBQUMsSUFBSSxFQUFFLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ3REO2lCQUFNO2dCQUNMLEtBQUssR0FBRyxJQUFJLENBQUM7YUFDZDtZQUVELE9BQU8sZUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsRUFBRSxTQUFZLENBQUMsS0FBSyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUNuRixlQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQ1gsSUFBSSxNQUFNLEtBQUssS0FBSyxFQUFFO29CQUNwQixPQUFPLElBQUksQ0FBQztpQkFDYjtxQkFBTSxJQUFJLE1BQU0sRUFBRTtvQkFDakIsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFFbkIsT0FBTyxJQUFJLENBQUM7aUJBQ2I7cUJBQU07b0JBQ0wsT0FBTyxNQUFNLENBQUM7aUJBQ2Y7WUFDSCxDQUFDLENBQUMsQ0FDSCxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQ0gsQ0FBQztJQUNOLENBQUM7Q0FDRjtBQXZERCxzQ0F1REMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgeyBCYXNlRXhjZXB0aW9uIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2NvcmUnO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgb2YgYXMgb2JzZXJ2YWJsZU9mIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBjb25jYXRNYXAsIGZpcnN0LCBtYXAgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQgeyBjYWxsUnVsZSB9IGZyb20gJy4uL3J1bGVzL2NhbGwnO1xuaW1wb3J0IHsgVHJlZSB9IGZyb20gJy4uL3RyZWUvaW50ZXJmYWNlJztcbmltcG9ydCB7IFNjb3BlZFRyZWUgfSBmcm9tICcuLi90cmVlL3Njb3BlZCc7XG5pbXBvcnQge1xuICBDb2xsZWN0aW9uLFxuICBFbmdpbmUsXG4gIEV4ZWN1dGlvbk9wdGlvbnMsXG4gIFJ1bGVGYWN0b3J5LFxuICBTY2hlbWF0aWMsXG4gIFNjaGVtYXRpY0Rlc2NyaXB0aW9uLFxuICBUeXBlZFNjaGVtYXRpY0NvbnRleHQsXG59IGZyb20gJy4vaW50ZXJmYWNlJztcblxuXG5leHBvcnQgY2xhc3MgSW52YWxpZFNjaGVtYXRpY3NOYW1lRXhjZXB0aW9uIGV4dGVuZHMgQmFzZUV4Y2VwdGlvbiB7XG4gIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZykge1xuICAgIHN1cGVyKGBTY2hlbWF0aWNzIGhhcyBpbnZhbGlkIG5hbWU6IFwiJHtuYW1lfVwiLmApO1xuICB9XG59XG5cblxuZXhwb3J0IGNsYXNzIFNjaGVtYXRpY0ltcGw8Q29sbGVjdGlvblQgZXh0ZW5kcyBvYmplY3QsIFNjaGVtYXRpY1QgZXh0ZW5kcyBvYmplY3Q+XG4gICAgaW1wbGVtZW50cyBTY2hlbWF0aWM8Q29sbGVjdGlvblQsIFNjaGVtYXRpY1Q+IHtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9kZXNjcmlwdGlvbjogU2NoZW1hdGljRGVzY3JpcHRpb248Q29sbGVjdGlvblQsIFNjaGVtYXRpY1Q+LFxuICAgICAgICAgICAgICBwcml2YXRlIF9mYWN0b3J5OiBSdWxlRmFjdG9yeTx7fT4sXG4gICAgICAgICAgICAgIHByaXZhdGUgX2NvbGxlY3Rpb246IENvbGxlY3Rpb248Q29sbGVjdGlvblQsIFNjaGVtYXRpY1Q+LFxuICAgICAgICAgICAgICBwcml2YXRlIF9lbmdpbmU6IEVuZ2luZTxDb2xsZWN0aW9uVCwgU2NoZW1hdGljVD4pIHtcbiAgICBpZiAoIV9kZXNjcmlwdGlvbi5uYW1lLm1hdGNoKC9eWy1AL18uYS16QS1aMC05XSskLykpIHtcbiAgICAgIHRocm93IG5ldyBJbnZhbGlkU2NoZW1hdGljc05hbWVFeGNlcHRpb24oX2Rlc2NyaXB0aW9uLm5hbWUpO1xuICAgIH1cbiAgfVxuXG4gIGdldCBkZXNjcmlwdGlvbigpIHsgcmV0dXJuIHRoaXMuX2Rlc2NyaXB0aW9uOyB9XG4gIGdldCBjb2xsZWN0aW9uKCkgeyByZXR1cm4gdGhpcy5fY29sbGVjdGlvbjsgfVxuXG4gIGNhbGw8T3B0aW9uVCBleHRlbmRzIG9iamVjdD4oXG4gICAgb3B0aW9uczogT3B0aW9uVCxcbiAgICBob3N0OiBPYnNlcnZhYmxlPFRyZWU+LFxuICAgIHBhcmVudENvbnRleHQ/OiBQYXJ0aWFsPFR5cGVkU2NoZW1hdGljQ29udGV4dDxDb2xsZWN0aW9uVCwgU2NoZW1hdGljVD4+LFxuICAgIGV4ZWN1dGlvbk9wdGlvbnM/OiBQYXJ0aWFsPEV4ZWN1dGlvbk9wdGlvbnM+LFxuICApOiBPYnNlcnZhYmxlPFRyZWU+IHtcbiAgICBjb25zdCBjb250ZXh0ID0gdGhpcy5fZW5naW5lLmNyZWF0ZUNvbnRleHQodGhpcywgcGFyZW50Q29udGV4dCwgZXhlY3V0aW9uT3B0aW9ucyk7XG5cbiAgICByZXR1cm4gaG9zdFxuICAgICAgLnBpcGUoXG4gICAgICAgIGZpcnN0KCksXG4gICAgICAgIGNvbmNhdE1hcCh0cmVlID0+IHRoaXMuX2VuZ2luZS50cmFuc2Zvcm1PcHRpb25zKHRoaXMsIG9wdGlvbnMsIGNvbnRleHQpLnBpcGUoXG4gICAgICAgICAgbWFwKG8gPT4gW3RyZWUsIG9dKSxcbiAgICAgICAgKSksXG4gICAgICAgIGNvbmNhdE1hcCgoW3RyZWUsIHRyYW5zZm9ybWVkT3B0aW9uc106IFtUcmVlLCBPcHRpb25UXSkgPT4ge1xuICAgICAgICAgIGxldCBpbnB1dDogVHJlZTtcbiAgICAgICAgICBsZXQgc2NvcGVkID0gZmFsc2U7XG4gICAgICAgICAgaWYgKGV4ZWN1dGlvbk9wdGlvbnMgJiYgZXhlY3V0aW9uT3B0aW9ucy5zY29wZSkge1xuICAgICAgICAgICAgc2NvcGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGlucHV0ID0gbmV3IFNjb3BlZFRyZWUodHJlZSwgZXhlY3V0aW9uT3B0aW9ucy5zY29wZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlucHV0ID0gdHJlZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gY2FsbFJ1bGUodGhpcy5fZmFjdG9yeSh0cmFuc2Zvcm1lZE9wdGlvbnMpLCBvYnNlcnZhYmxlT2YoaW5wdXQpLCBjb250ZXh0KS5waXBlKFxuICAgICAgICAgICAgbWFwKG91dHB1dCA9PiB7XG4gICAgICAgICAgICAgIGlmIChvdXRwdXQgPT09IGlucHV0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRyZWU7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoc2NvcGVkKSB7XG4gICAgICAgICAgICAgICAgdHJlZS5tZXJnZShvdXRwdXQpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRyZWU7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgKTtcbiAgICAgICAgfSksXG4gICAgICApO1xuICB9XG59XG4iXX0=