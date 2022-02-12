import { Injectable } from '@angular/core';
import { MatSnackBar,   MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition} from "@angular/material/snack-bar";
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  public horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  public verticalPosition: MatSnackBarVerticalPosition = 'top';
  public durationInSeconds = 5;

  constructor(public snackBar: MatSnackBar) {

  }

  public error(message: string): void {
     this.snackBar.open(message, "", {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.durationInSeconds *300
    });
  };

  public success(message: string): void {
     this.snackBar.open(message, "", {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.durationInSeconds *300
    });
  };

  public info(message: string): void {
     this.snackBar.open(message, "", {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.durationInSeconds *300
    });
  };

  public modalInfo(message: string): void{
     this.snackBar.open(message, "close", {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }

  public dismissInfo(){
      this.snackBar.dismiss();
  }

}
