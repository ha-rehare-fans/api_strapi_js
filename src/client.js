import * as path from 'path-browserify';
import axios from 'axios';

class Strapi {
  backendUrl;

  constructor(backendUrl) {
    if(!backendUrl) throw new Error('backendUrl is required parameter.');

    this.backendUrl = backendUrl;
    return;
  }
};

export const initializeStrapi = (backendUrl) => {
  return new Strapi(backendUrl);
};

export const signInWithGoogleAccessToken = (strapi, googleAccessToken) => {
  return axios.get(
    path.join(strapi.backendUrl, '/api/auth/google/callback'),
    {
      params: {
        access_token: googleAccessToken,
      },
    }
  ).then(resp => {
    return resp.data;
  }).catch(err => {
    console.error(err);
    throw err;
  });
};

export const call = (strapi, jwt, options = {}) => {
  return axios({
    ...options,
    baseURL: strapi.backendUrl,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${jwt}`,
    },
  }).then(resp => {
    return resp.data;
  }).catch(err => {
    throw err;
  });
};

export const absolute = (strapi, pathname) => {
  return path.join(strapi.backendUrl, pathname);
};

