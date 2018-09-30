import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { Timestamp } from '@firebase/firestore-types';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css']
})
export class ManageComponent implements OnInit, OnDestroy {

  private postsCollection: AngularFirestoreCollection<any>
  private paraCollection: AngularFirestoreCollection<any>
  posts: Observable<any[]>;
  pos: any[] = [];
  sub: any;
  promises = [];

  constructor(public router: Router, private db: AngularFirestore, public snackBar: MatSnackBar) { 
    this.postsCollection = db.collection<any>('posts');
    this.sub = this.postsCollection.valueChanges().subscribe( val => {
      console.debug('returned',val)
      val.forEach(x => {
        x.tagsArr = Object.keys(x.tags);
        x.link = 'posts:' + x.id;
        this.pos.push(x)
      })
    })
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  edit(id: string) {
    this.router.navigate(['edit', id]);
  }

  newPost() {
    this.router.navigate(['edit']);
  }

  delete(id: string) {
    this.removeOldParas(id);
    this.promises.push(this.removePost(id));
    Promise.all(this.promises).then(() => {
      this.openSnackBar('Deleted', 'Ok');
    })
  }

  removePost(id: string) {
    this.db.collection("posts").doc(id).delete().then(function() {
      console.log("Document successfully deleted!");
    }).catch(function(error) {
        console.error("Error removing document: ", error);
    });
  }

  removeOldParas(id: string) {
    this.paraCollection = this.db.collection<any>('posts/' + id + '/paragraphs');
    var j = this.paraCollection.ref
    j.get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        this.promises.push(doc.ref.delete());
      });
    })
  }

  publish(id: string) {

  }

}
