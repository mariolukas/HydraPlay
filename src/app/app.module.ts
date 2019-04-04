import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PlayerComponent } from './components/player/player.component';
import { StreamComponent } from './components/stream/stream.component';
import { MediaComponent } from './components/media/media.component';
import { NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MessageService} from './services/message.service';
import { PlaylistComponent } from './components/playlist/playlist.component';
import { FlexLayoutModule } from '@angular/flex-layout';

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
    FlexLayoutModule
  ],
  providers: [
    MessageService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
