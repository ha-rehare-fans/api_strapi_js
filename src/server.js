import * as path from 'path';
import axios from 'axios';


export const Strapi = class Strapi {
  constructor(backendUrl) {
    this.backendUrl = backendUrl;
  }

  signInWithGoogleAccessToken(googleAccessToken) {
    return axios.get(
      path.join(this.backendUrl, '/api/auth/google/callback'),
      {
        params: {
          access_token: googleAccessToken,
        },
      }
    ).then(resp => {
      return resp.data;
    }).catch(err => {
      console.error(err.data);
      throw err.data;
    });
  }
};


