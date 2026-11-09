AMWAJ HOTEL APP - SETUP NOTES

This is the source bundle for the Amwaj hotel room manager. It is not yet online or installable until hosted over HTTPS.

Firebase project is preconfigured in firebase-config.js.
Firebase Authentication Email/Password must be enabled.
The admin UID document must exist at settings/admin with field uid (string) set to the admin Firebase Auth UID.
Publish firestore.rules in Firebase Console > Firestore Database > Rules.

Room data is stored in one document: hotel/rooms.
All signed-in users can read room/guest data. Only the UID in settings/admin can write.
Create viewer accounts in Firebase Authentication. Do not share the admin password.

Hosting requires deploying this folder to Firebase Hosting or another HTTPS static host. The ZIP itself does not deploy the app.
