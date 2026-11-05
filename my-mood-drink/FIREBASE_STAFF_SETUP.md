# Staff access setup

The `/admin` route uses Firebase Authentication and a role document at
`users/{uid}`. A person reaches the staff dashboard only when both checks pass:

1. They sign in with a Firebase Authentication email/password account.
2. Their Firestore document has `role: "staff"` or `role: "admin"`.

## One-time Firebase Console setup

1. Open **Authentication → Sign-in method** and enable **Email/Password**.
2. Open **Authentication → Users** and create each staff account.
3. Copy the account's UID.
4. In **Firestore Database**, create `users/{UID}` with these fields:

```json
{
  "role": "staff",
  "displayName": "ชื่อพนักงาน"
}
```

Use `"admin"` only for people who may manage menu data and staff access.

## Deploy the rules

The project includes [firestore.rules](firestore.rules). Deploy it before using
the portal in production:

```bash
firebase deploy --only firestore:rules
```

The deployed rules prevent customers from listing or updating orders, reading
feedback, or writing role documents. Staff roles must be added from the Firebase
Console or trusted server-side code; never let a browser create its own role.
