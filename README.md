# proof-study

A crowdsourced study tool for making and solving proof-based problems.

Proof Study is a project made with Professor McCarty for University of Illinois Chicago's CS 151 class.

## Project Setup

This project depends on having a correctly configured Firebase instance.
Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/) and enable the following services:

- Realtime Database
- Firestore Database
- Authentication

Firebase Authentication must be configured to allow Google logins. Enable the Google provider and save. (When deployed to production remember to add the production url to Authentication > Settings > Authorized domains.)

You'll need some Firebase credentials to put in an `.env` file. Go to Project Settings > Service Accounts > Firebase Admin SDK > Generate new private key. You'll be given a JSON file with credentials you'll need later.

Next, in Project Settings > General, scroll down and create a new Web App. Save the credentials you just generated for later.

Then click Realtime Database in the sidebar and click the link to copy the database URL.

Finally, rename the `.env.example` file to `.env` and fill in the approriate values wtih all the credentials you have gathered. The `NEXT_PUBLIC_ADMINS` environment variable can be filled in with user ids later once you have users in the Authentication section of the Firebase Console.

Now that the project is correctly configured, run the development server to see the project locally:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app). To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
