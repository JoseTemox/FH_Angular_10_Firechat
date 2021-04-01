import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import {  map } from 'rxjs/operators';
import { Mensaje } from '../interface/mensaje.interface';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';


@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private itemsCollection: AngularFirestoreCollection<Mensaje>;

  public chats: Mensaje[] = [];
  public usuario: any = {};

  constructor(private afs: AngularFirestore, public auth: AngularFireAuth) {

    this.auth.authState.subscribe( user => {
      console.log('Estado del servicio',user);

      if(!user){
        return
      }

      this.usuario.nombre = user.displayName;
      this.usuario.uid = user.uid;
    });
  }

  login(proveedor: string) {
    if(proveedor === 'google'){
    this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    }else{
    this.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider());

    }
  }
  logout() {

    this.usuario ={};
    this.auth.signOut();
  }

  cargarMensaje(){
    this.itemsCollection = this.afs.collection<Mensaje>('chats', ref => ref.orderBy('fecha','desc').limit(5));

    return this.itemsCollection.valueChanges()
      .pipe(map( (mensajes:Mensaje[]) => {
          console.log(mensajes);

          this.chats = [];
          for ( let mensaje of mensajes){
            this.chats.unshift(mensaje);
          }

          return this.chats

      }))
  }

  agregarMensaje(texto: string){

   // TODO falta el UID de mensaje
    let mensaje: Mensaje = {
      nombre: this.usuario.nombre,
      mensaje: texto,
      fecha: new Date().getTime(),
      uid: this.usuario.uid
    }
    return this.itemsCollection.add(mensaje);
  }
}
