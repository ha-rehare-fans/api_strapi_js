import { google } from 'googleapis';


export const Strapi = class Strapi {
  constructor() {
    this.auth = {
      googleOAuth2Client: (
        new google.auth.OAuth2(
          process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
          process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI
        )
      ),
    };
  }

  signIn(providerName, options = { providerOptions = {} }) {
    switch(providerName) {
      default: {
        const err = new Error(`Provider "${providerName}" is not implemented.`);
        err.name = 'NotImplemented';
        throw err;
      }
      case 'google': {
        const authorizeUrl = this.auth.googleOAuth2Client.generateAuthUrl({
          ...providerOptions,
          access_type: 'offline',
          scope: (options.providerOptions.scope || [ 'email', 'profile' ]).join(' '),
        });
        if(options.method === 'popup') {
          return;
        }
        else {
          return;
        }
      }
    }
  }
};


