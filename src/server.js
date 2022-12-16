import * as path from 'path';
import { google } from 'googleapis';
import axios from 'axios';


export const Strapi = class Strapi {
  constructor(options = {}) {
    this.auth = {
      googleOAuth2Client: (
        new google.auth.OAuth2(
          options.googleClientId,
          options.googleClientSecret,
          options.googleRedirectUri
        )
      ),
    };
  }

  generateAuthUrl(
    providerName,
    options = {}
  ) {
    switch(providerName) {
      default: {
        const err = new Error(`Provider "${providerName}" is not implemented.`);
        err.name = 'NotImplemented';
        throw err;
      }
      case 'google': {
        return this.auth.googleOAuth2Client.generateAuthUrl({
          ...(options.providerOptions || {}),
          access_type: 'offline',
          scope: (options.providerOptions?.scope || [ 'email', 'profile' ]).join(' '),
        });
      }
    }
  }

  handleAuthRedirect(
    providerName,
    options = {}
  ) {
    switch(providerName) {
      default: {
        const err = new Error(`Provider "${providerName}" is not implemented.`);
        err.name = 'NotImplemented';
        throw err;
      }
      case 'google': {
        return this.auth.googleOAuth2Client.getToken({
          ...(options.providerOptions || {}),
          code: options.providerOptions?.code,
        }).then(({ tokens }) => {
          return axios.get(
            path.join(process.env.STRAPI_URL, '/api/auth/google/callback'),
            {
              params: {
                access_token: tokens.access_token,
              },
            }
          ).then(resp => {
            return {
              tokens,
              jwt: resp.data.jwt,
              user: resp.data.user,
            };
          });
        });
      }
    }
  }
};


