import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { Timestamp } from '@firebase/firestore-types';
import { FormControl, FormGroupDirective, NgForm, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatSnackBar } from '@angular/material';
import { MatChipInputEvent } from '@angular/material';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { map } from 'rxjs/operators';
import { AngularFireStorage } from 'angularfire2/storage';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit {

  separatorKeysCodes = [ENTER, COMMA];

  sub: any;
  private paraCollection: AngularFirestoreCollection<any>
  paras: Observable<any[]>;
  private postDoc: AngularFirestoreDocument<p>;
  po: Observable<p>;
  post: p;
  str: string;
  form: FormGroup;
  tags: string[];
  published: boolean = false;
  newPost: boolean = true;

  constructor(
    public router: Router, 
    public db: AngularFirestore,
    private afStorage: AngularFireStorage,
    public active: ActivatedRoute, 
    public snackBar: MatSnackBar,
    public fb: FormBuilder) {
      this.form = fb.group({
        title: '',
        tags: '',
        slug: '',
        content: ''
      });
  }

  ngOnInit() {
    this.sub = this.active.params.subscribe(params => {
      if (params['id']) {
        this.newPost = false;
        this.subs(params['id']);
      } else {
        this.tags = [];
      }
    });
  }

  subs(id: string) {
    this.postDoc = this.db.doc<p>('posts/' + id);
    this.po = this.postDoc.valueChanges();
    this.po.subscribe( val => {
      this.post = val;
      console.log(this.post.id)
      this.published = val.published;
      this.tags = Object.keys(val.tags);
      this.form.patchValue({
        title: val.title,
        slug: val.slug
      })
    })
    this.paraCollection = this.db.collection<any>('posts/' + id + '/paragraphs', ref => ref.orderBy('order'));
    this.paras = this.paraCollection.valueChanges();
    this.paras.subscribe( val => {
      console.log('updating')
      this.form.patchValue({
        content: this.stringifyParas(val)
      })
      this.str = this.stringifyParas(val);
    })
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  remove(tag: any): void {
    let index = this.tags.indexOf(tag);
    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  add(event: MatChipInputEvent): void {
    let input = event.input;
    let value = event.value;
    if ((value || '').trim()) {
      this.tags.push(value.trim());
    }
    if (input) {
      input.value = '';
    }
  }

  stringifyParas(paras: any[]) {
    let str = '';
    for(let i = 0; i < paras.length; i++) {
      str += paras[i].para;
      if (i != paras.length - 1) {
        str += '\n';
      }
    }
    return str;
  }

  jsonify(tags: string[]){
    return tags.reduce((json, value, key) => { json[value] = true; return json; }, {});
  }

  paragraphify(content: string) {
    return content.split('\n');
  }

  save() {
    let x: p = this.post;
    console.log(this.form)
    x.title = this.form.get('title') ? this.form.get('title').value : '';
    x.slug = this.form.get('slug') ? this.form.get('slug').value : '';
    x.tags = this.jsonify(this.tags);
    x.published = this.published;
    x.updatedAt = this.timestamp;
    let y = this.form.get('content') ? this.form.get('content').value : this.str;
    this.update(x, this.paragraphify(y));
  }

  removeOldParas() {
    var j = this.paraCollection.ref
    j.get().then(function(querySnapshot) {
      querySnapshot.forEach(function(doc) {
        doc.ref.delete();
      });
    }).then(() => {this.save()});
  }

  update(item: p, paras: string[]) {
    let promises = [];
    promises.push(this.postDoc.update(item));
    paras.forEach((x, i) => {
      promises.push(this.paraCollection.add({order: i, para:x}));
    })
    Promise.all(promises).then(() => {
      this.openSnackBar('Saved', 'Splendid!');
    })
  }

  create(item: p, paras: string[]) {
    this.postDoc.set(item);
    paras.forEach((x, i) => {
      this.paraCollection.add({order: i, para:x});
    })
    this.newPost = false;
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  format(s: string) {
    return s.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s{2,}/g,"-").replace(/ /g, '');
  }

  saveNewPost() {
    let id = this.form.get('title');
    if (id) {
      let idFormat = this.format(id.value);
      this.setNewRefs(idFormat);
      let x: any = {};
      x.id = idFormat;
      x.title = id.value
      x.slug = this.form.get('slug') ? this.form.get('slug').value : '';
      x.tags = this.jsonify(this.tags);
      x.published = this.published;
      x.date = this.timestamp
      this.post = x;
      let y = this.form.get('content') ? this.form.get('content').value : this.str;
      this.create(x, this.paragraphify(y));
    } else {
      this.openSnackBar('You need a title at least', 'Cool')
    }
  }

  publishChange() {
    console.log('publish change')
  }

  setNewRefs(id: string) {
    this.postDoc = this.db.doc<p>('posts/' + id);
    this.paraCollection = this.db.collection<any>('posts/' + id + '/paragraphs', ref => ref.orderBy('order'));
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
    this.task.then(() => {
      this.updateContentWithImg(path)
    })
  }

  updateContentWithImg(path: string) {
    let con = this.form.get('content').value;
    this.form.patchValue({
      content: con + '\n--IMG' + path
    })
  }

  get timestamp() {
    return firebase.firestore.FieldValue.serverTimestamp();
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
  updatedAt: firebase.firestore.FieldValue;
}