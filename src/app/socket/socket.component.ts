import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, Observer } from 'rxjs';
import { io } from 'socket.io-client';

@Component({
  selector: 'app-socket',
  templateUrl: './socket.component.html',
  styleUrls: ['./socket.component.scss'],
})
export class SocketComponent implements OnInit, OnDestroy {
  url = 'http://localhost:3000';
  private socket: any;
  msg = new FormControl('');

  constructor() {}

  ngOnInit(): void {
    this.joinSocket('chat', 'room1', 'message').subscribe((data: any) => {
      console.log(data);
    });
  }

  ngOnDestroy(): void {
    this.disconnectSocket();
  }

  sendMessage() {
    console.log(this.msg.value);
    this.socket.emit('message', this.msg.value);
  }

  leave() {
    console.log(`Leave the Weboscket`);
    this.disconnectSocket();
  }

  /**
   * Connect the socket
   *
   */
  connectSocket(namespace: string): void {
    if (this.socket) {
      console.log('Socket already connected');
    } else {
      this.socket = io(this.url);
      this.socket.nsp = '/' + namespace;
      this.socket.on('connect', () => {
        console.log('Socket connected');
      });
    }
  }

  joinSocket(
    namespace: string,
    roomName: string,
    channelname: string
  ): Observable<any> {
    return new Observable((observer: Observer<any>) => {
      this.socket = io(this.url);
      this.socket.nsp = '/' + namespace;
      this.socket.on(channelname, (data: any) => {
        if (data) {
          observer.next(data);
        } else {
          observer.error('Error');
        }
      });
      return () => {
        this.socket.removeListener(channelname);
      };
    });
  }

  disconnectSocket() {
    this.socket.disconnect();
    this.socket = null;
  }
}
