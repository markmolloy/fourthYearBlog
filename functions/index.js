
/*const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

const sendgrid = require('sendgrid')
const client = sendgrid("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")

function parseBody(body) {
  var helper = sendgrid.mail;
  var fromEmail = new helper.Email(body.from);
  var toEmail = new helper.Email(body.to);
  var subject = body.subject;
  var content = new helper.Content('text/html', body.content);
  var mail = new helper.Mail(fromEmail, subject, toEmail, content);
  return  mail.toJSON();
}



/*
exports.httpEmail = functions.https.onRequest((req, res) => {
  return Promise.resolve()
    .then(() => {
      if (req.method !== 'POST') {
        const error = new Error('Only POST requests are accepted');
        error.code = 405;
        throw error;
      }
      const request = client.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: parseBody(req.body)
      });
      return client.API(request)
    })
    .then((response) => {
      if (response.body) {
        res.send(response.body);
      } else {
        res.end();
      }
    })
    .catch((err) => {
      console.error(err);
      return Promise.reject(err);
    });
})
*


exports.emailOnNewPublication = functions.firestore.document('posts/{post}').onWrite((snap, context) => {
    //const published = snap.data().published;
    //const id = snap.data().id;
    sendMail();
});

function sendMail() {
    var sgMail = require('@sendgrid/mail');
    sgMail.setApiKey("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");
    var msg = {
        to: 'hilko57@gmail.com',
        from: 'markmolloy57@gmail.com',
        subject: 'Sending with SendGrid is Fun',
        text: 'and easy to do anywhere, even with Node.js',
        html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    };
    sgMail.send(msg);
}
*/
var functions = require('firebase-functions');
var sendgrid = require("@sendgrid/mail");
var admin = require('firebase-admin');

admin.initializeApp();
var SENDGRID_API_KEY = functions.config().sendgrid.key;
sendgrid.setApiKey(SENDGRID_API_KEY);

exports.firestoreEmail = functions.firestore
    .document('posts/{post}')
    .onWrite((change, context) => {
        //console.log('change = ' + change.data());

        const data = change.after.exists ? change.after.data() : null;
        const published = data.published;
        const title = data.title;
        const slug = data.slug;
        const link = 'https://marksfourthyearblog.firebaseapp.com/post/' + data.id;

        const db = admin.firestore()

        return db.collection('emails')
                 .get()
                 .then(doc => {

                    doc.forEach(d => {
                        const user = d.data()

                        const msg = {
                            to: user.email,
                            from: 'markmolloy57@gmail.com',
                            subject:  'New Post',
                            // text: `Hey ${toName}. You have a new follower!!! `,
                            // html: `<strong>Hey ${toName}. You have a new follower!!!</strong>`,
                
                            // custom templates
                            templateId: '7f488186-1d9e-4208-bf0e-30bd76713b3e',
                            substitutionWrappers: ['{{', '}}'],
                            substitutions: {
                                title: title,
                                slug: slug,
                                link: link
                            }
                        };

                        return sendgrid.send(msg)
                    })
                })
                .then(() => console.log('email sent!') )
                .catch(err => console.log(err) )
                     

});