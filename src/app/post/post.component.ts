import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { Timestamp } from '@firebase/firestore-types';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatSnackBar } from '@angular/material';
import { AngularFireStorage } from 'angularfire2/storage';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit, OnDestroy {

  private sub: any;

  private paraCollection: AngularFirestoreCollection<any>
  paras: Observable<any[]>;
  private postDoc: AngularFirestoreDocument<p>;
  post: p;
  paraContent = [];

  emailFormControl = new FormControl('', [
    Validators.email,
  ]);

  matcher = new MyErrorStateMatcher();

  constructor(public router: Router, private afStorage: AngularFireStorage, public db: AngularFirestore, public active: ActivatedRoute, public snackBar: MatSnackBar) { 
  }

  ngOnInit() {
    this.sub = this.active.params.subscribe(params => {
      this.postDoc = this.db.doc<p>(`posts/${params['id']}`);
      this.postDoc.valueChanges().subscribe( val => {
        if (val.published) {
          this.post = val;
          this.post.tagsArr = Object.keys(val.tags);
        }
      })
      this.paraCollection = this.db.collection<any>(`posts/${params['id']}/paragraphs`, ref => ref.orderBy('order'));
      this.paraCollection.valueChanges().subscribe( val => {
        this.filterContent(val)
      })
   });
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

  ref;
  task;
  uploadProgress;
  downloadURL;
  upload(event) {
    const randomId = Math.random().toString(36).substring(2);
    let path = this.post.id + '/images/' + randomId;
    console.log(path)
    this.ref = this.afStorage.ref(path);
    this.task = this.ref.put(event.target.files[0]);
    this.uploadProgress = this.task.percentageChanges();
  }

  filterContent(paras: any[]) {
    let str = [];
    let promises = [];
    paras.forEach(i => {
      this.src.push('');
    })
    paras.forEach((val, i) => {
      let p;/*
      if (val.para.startsWith('--IMG')) {
        let r = val.para.replace('--IMG', '');
        promises.push(this.afStorage.ref(r).getDownloadURL().subscribe(url => {
          p = '<img [src]="' + url + '"/>';
        }))
      } else {
        p = val.para
      }*/
      if (val.para.startsWith('--IMG')) {
        let r = val.para.replace('--IMG', '');
        this.afStorage.ref(r).getDownloadURL().subscribe(url => {
          this.src[i] = (url)
        })
      }
      p = val.para;
      str.push(p);     
    })
    console.log(str)
    Promise.all(promises).then(() => {this.paraContent = str});
  }

  src = [];
  fil() {
    let r = 'post1/images/nikp14yw0aj'
    this.afStorage.ref(r).getDownloadURL().subscribe(i => {
      this.src = i;
    })
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
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
  published: boolean;
  date: Timestamp;
  slug: string;
  tags: {};
  tagsArr: any[];
  link: string;
  updatedAt: any;
}
