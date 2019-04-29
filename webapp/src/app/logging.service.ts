import {Injectable} from "@angular/core";
import {WebsocketService} from "./websocket.service";
import {BehaviorSubject, Observable, Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class LoggingService {
  static MAX_LOG_SIZE = 1000;

  private _messageLog: string[] = [];
  private _messageStream: Subject<string[]> = new BehaviorSubject<string[]>([]);

  constructor(private _ws: WebsocketService) {
    this._ws.on('message', (data: string) => {
      this.logMessage(data);
    });
  }

  logMessage(msg: string) {
    this._messageLog.unshift(msg);
    if(this._messageLog.length > LoggingService.MAX_LOG_SIZE) {
      this._messageLog = this._messageLog.slice(0, LoggingService.MAX_LOG_SIZE);
    }
    this._messageStream.next(this._messageLog);
  }

  get log(): string[] {
    return this._messageLog;
  }

  get log$(): Observable<string[]> {
    return this._messageStream;
  }
}
