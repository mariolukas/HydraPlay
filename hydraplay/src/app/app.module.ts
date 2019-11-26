import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PlayerComponent } from './components/player/player.component';
import { StreamComponent } from './components/stream/stream.component';
import { MediaComponent } from './components/media/media.component';
import { NoopAnimationsModule} from '@angular/platform-browser/animations';
import { PlaylistComponent } from './components/playlist/playlist.component';
import { FlexLayoutModule } from '@angular/flex-layout';

import { APP_INITIALIZER } from '@angular/core';
import {AppConfig} from './services/config.service';
import {HttpModule} from '@angular/http';

export function initConfig(config: AppConfig) {
  return () => config.load();
}

@NgModule({
  declarations: [
    AppComponent,
    PlayerComponent,
    StreamComponent,
    MediaComponent,
    PlaylistComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    NoopAnimationsModule,
    FlexLayoutModule,
    HttpModule
  ],
  providers: [
    AppConfig,
    {
      provide: APP_INITIALIZER,
      useFactory: initConfig,
      deps: [AppConfig],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
