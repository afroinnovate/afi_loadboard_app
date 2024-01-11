import { createCookieSessionStorage } from "@remix-run/node";

// Define different secrets for different environments
const secretKeyDevelopment = process.env.SECRET_KEY_DEV || 'developmentSecret';
const secretKeyProduction = process.env.SECRET_KEY_PROD || 'productionSecret';

// Choose the secret based on the environment
const secretKey = process.env.NODE_ENV === "production" ? secretKeyProduction : secretKeyDevelopment;

// export the whole sessionStorage object
export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "_session", // use any name you want here
    domain:"localhost", //change it to afroinnovate.com when you deploy
    sameSite: "lax", // this helps with CSRF
    path: "/", // remember to add this so the cookie will work in all routes
    httpOnly: true, // for security reasons, make this cookie http only
    secrets: [secretKey], // replace this with an actual secret
    secure: process.env.NODE_ENV === "production", // enable this in prod only
  },
});

// you can also export the methods individually for your own usage
export let { getSession, commitSession, destroySession } = sessionStorage;