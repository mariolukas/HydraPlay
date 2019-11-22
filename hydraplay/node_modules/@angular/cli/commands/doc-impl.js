"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("../models/command");
const opn = require('opn');
class DocCommand extends command_1.Command {
    async run(options) {
        if (!options.keyword) {
            this.logger.error('You should specify a keyword, for instance, `ng doc ActivatedRoute`.');
            return 0;
        }
        let searchUrl = `https://angular.io/api?query=${options.keyword}`;
        if (options.search) {
            searchUrl = `https://www.google.com/search?q=site%3Aangular.io+${options.keyword}`;
        }
        // We should wrap `opn` in a new Promise because `opn` is already resolved
        await new Promise(() => {
            opn(searchUrl, {
                wait: false,
            });
        });
    }
}
exports.DocCommand = DocCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9jLWltcGwuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2FuZ3VsYXIvY2xpL2NvbW1hbmRzL2RvYy1pbXBsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7O0FBRUgsK0NBQTRDO0FBSTVDLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUUzQixNQUFhLFVBQVcsU0FBUSxpQkFBeUI7SUFDaEQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFxQztRQUNwRCxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRTtZQUNwQixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxzRUFBc0UsQ0FBQyxDQUFDO1lBRTFGLE9BQU8sQ0FBQyxDQUFDO1NBQ1Y7UUFDRCxJQUFJLFNBQVMsR0FBRyxnQ0FBZ0MsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2xFLElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRTtZQUNsQixTQUFTLEdBQUcscURBQXFELE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUNwRjtRQUVELDBFQUEwRTtRQUMxRSxNQUFNLElBQUksT0FBTyxDQUFDLEdBQUcsRUFBRTtZQUNyQixHQUFHLENBQUMsU0FBUyxFQUFFO2dCQUNiLElBQUksRUFBRSxLQUFLO2FBQ1osQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUFuQkQsZ0NBbUJDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgeyBDb21tYW5kIH0gZnJvbSAnLi4vbW9kZWxzL2NvbW1hbmQnO1xuaW1wb3J0IHsgQXJndW1lbnRzIH0gZnJvbSAnLi4vbW9kZWxzL2ludGVyZmFjZSc7XG5pbXBvcnQgeyBTY2hlbWEgYXMgRG9jQ29tbWFuZFNjaGVtYSB9IGZyb20gJy4vZG9jJztcblxuY29uc3Qgb3BuID0gcmVxdWlyZSgnb3BuJyk7XG5cbmV4cG9ydCBjbGFzcyBEb2NDb21tYW5kIGV4dGVuZHMgQ29tbWFuZDxEb2NDb21tYW5kU2NoZW1hPiB7XG4gIHB1YmxpYyBhc3luYyBydW4ob3B0aW9uczogRG9jQ29tbWFuZFNjaGVtYSAmIEFyZ3VtZW50cykge1xuICAgIGlmICghb3B0aW9ucy5rZXl3b3JkKSB7XG4gICAgICB0aGlzLmxvZ2dlci5lcnJvcignWW91IHNob3VsZCBzcGVjaWZ5IGEga2V5d29yZCwgZm9yIGluc3RhbmNlLCBgbmcgZG9jIEFjdGl2YXRlZFJvdXRlYC4nKTtcblxuICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIGxldCBzZWFyY2hVcmwgPSBgaHR0cHM6Ly9hbmd1bGFyLmlvL2FwaT9xdWVyeT0ke29wdGlvbnMua2V5d29yZH1gO1xuICAgIGlmIChvcHRpb25zLnNlYXJjaCkge1xuICAgICAgc2VhcmNoVXJsID0gYGh0dHBzOi8vd3d3Lmdvb2dsZS5jb20vc2VhcmNoP3E9c2l0ZSUzQWFuZ3VsYXIuaW8rJHtvcHRpb25zLmtleXdvcmR9YDtcbiAgICB9XG5cbiAgICAvLyBXZSBzaG91bGQgd3JhcCBgb3BuYCBpbiBhIG5ldyBQcm9taXNlIGJlY2F1c2UgYG9wbmAgaXMgYWxyZWFkeSByZXNvbHZlZFxuICAgIGF3YWl0IG5ldyBQcm9taXNlKCgpID0+IHtcbiAgICAgIG9wbihzZWFyY2hVcmwsIHtcbiAgICAgICAgd2FpdDogZmFsc2UsXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxufVxuIl19