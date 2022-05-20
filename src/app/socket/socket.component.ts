import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, Observer } from 'rxjs';
import { io } from 'socket.io-client';

@Component({
  selector: 'app-socket',
  templateUrl: './socket.component.html',
  styleUrls: ['./socket.component.scss']
})
export class SocketComponent implements OnInit, OnDestroy {
  url = 'http://localhost:3000';
  private socket: any;
  msg = new FormControl('');

  joinRoom1 = { user: 'clover', room: 'room1', channel: 'vip' };

  constructor() {}

  ngOnInit(): void {
    this.connectSocket('chat');
  }

  getIO() {
    this.socket.emit('list');
  }

  leaveRoom() {
    this.socket.emit('leave', {
      user: this.joinRoom1.user,
      room: this.joinRoom1.room,
      channel: this.joinRoom1.channel
    });
  }

  joinRoom() {
    this.socket.emit('join', this.joinRoom1);
  }

  ngOnDestroy(): void {
    this.disconnectSocket();
  }

  sendMessage() {
    const message = {
      user: this.joinRoom1.user,
      message: this.msg.value,
      room: this.joinRoom1.room
    };
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
      this.socket.on('message', (data: any) => {
        console.log(data);
      });
    }
  }

  joinSocket(
    namespace: string,
    roomName: string,
    channelname: string,
    user: string
  ): Observable<any> {
    return new Observable((observer: Observer<any>) => {
      this.socket = io(this.url);
      this.socket.nsp = '/' + namespace;
      this.socket.emit('join', {
        user: user,
        room: roomName,
        channel: channelname
      });
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
