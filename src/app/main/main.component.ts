import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { Timestamp } from '@firebase/firestore-types';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatSnackBar } from '@angular/material';


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit, OnDestroy {

  private postsCollection: AngularFirestoreCollection<p>
  posts: Observable<p[]>;
  pos: any[] = [];
  sub: any;

  emailFormControl = new FormControl('', [
    Validators.email,
  ]);

  matcher = new MyErrorStateMatcher();

  constructor(public router: Router, private db: AngularFirestore, public snackBar: MatSnackBar) { 
    this.postsCollection = db.collection<p>('posts', ref => ref.where('published', '==', true).orderBy('date'));
    this.sub = this.postsCollection.valueChanges().subscribe( val => {
      val.forEach(x => {
        x.tagsArr = Object.keys(x.tags);
        x.link = 'posts:' + x.id;
        this.pos.push(x)
        console.log(x);
      })
    })
  }

  ngOnInit() {
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  subscribe() {
    let email: string;
    if (this.emailFormControl) {
      console.log('subscribe()');
      email = this.emailFormControl.value;
      if (email.length > 0) {
        const emailRef: AngularFirestoreCollection<any> = this.db.collection('emails');
        emailRef.add( {email: email} );
        this.emailFormControl.patchValue('');
        this.openSnackBar("You're in!", 'Great!');
      }
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  nav() {
    this.sub.unsubscribe();
  }

  log() {
  }
}

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

interface p {
  id: string;
  title: String;
  date: Timestamp;
  slug: string;
  tags: {};
  tagsArr: any[];
  link: string;
}