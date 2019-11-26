import { Inject, Injectable } from '@angular/core';
import {Http,Response} from '@angular/http'
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';

@Injectable()
export class AppConfig {

    private config: Object = null;
    private env:    Object = null;

    constructor(private http: Http) {
    }

    /**
     * Use to get the data found in the second file (config file)
     */
    public getConfig(key: any) {
        return this.config[key];
    }

    /**
     * Use to get the data found in the first file (env file)
     */
    public getEnv(key: any) {
        return this.env[key];
    }

    /**
     * This method:
     *   a) Loads "env.json" to get the current working environment (e.g.: 'production', 'development')
     *   b) Loads "config.[env].json" to get all env's variables (e.g.: 'config.development.json')
     */
    public load() {
        return new Promise((resolve, reject) => {
            this.http.get('./assets/config/env.json')
                .pipe(map( res => res.json()))
                .pipe( catchError(err => {
                    console.log('Handling error locally and rethrowing it...', err);
                    return Observable.throw(err.json().error || 'Server error');
                })).subscribe( (envResponse) => {
                this.env = envResponse;
                let request: any = null;

                switch (envResponse.env) {
                    case 'production': {
                        request = this.http.get('./assets/config/config.' + envResponse.env + '.json');
                    } break;

                    case 'development': {
                        request = this.http.get('./assets/config/config.' + envResponse.env + '.json');
                        console.log('calling config dev');
                    } break;

                    case 'default': {
                        console.error('Environment file is not set or invalid');
                        resolve(true);
                    } break;
                }

                if (request) {
                    request.pipe(
                        map((res: Response) => (
                            res.json()
                        )))
                        .subscribe((responseData: any) => {
                            this.config = responseData;
                            console.log(responseData);
                            resolve(true);
                        });
                } else {
                    console.error('Env config file "env.json" is not valid');
                    resolve(true);
                }
            });

        });
    }
}