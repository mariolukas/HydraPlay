// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  snapcast: {
    ip: '192.168.178.56',
    port: 8080
  },
  mopidy: [
    {
      ip: '192.168.178.56',
      port: 6681,
      id: 'mopidy1'
    },
    {
      ip: '192.168.178.56',
      port: 6682,
      id: 'mopidy2'
    }
  ]
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
