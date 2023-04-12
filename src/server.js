import axios from 'axios';
import axiosRetry from 'axios-retry';

export class StrapiServer {
  #_url;
  #_apiToken;
  #_userJWT;
  #axiosInstance;
  #axiosInstanceWithAPIToken;
  #axiosInstanceWithUserJWT;

  constructor(config = {}) {
    this.#_url = config.url || process.env.STRAPI_URL || 'https://cms.ha-rehare.fans/';
    this.#_apiToken = config.apiToken || process.env.STRAPI_API_TOKEN || '';
    this.#_userJWT = config.userJWT || null;

    this.#init();
  }

  // Property handlers
  get url() {
    return this.#_url;
  }
  set url(value) {
    this.#_url = value;
    this.#initAxiosInstanceWithAPIToken();
    this.#initAxiosInstanceWithUserJWT();
  }

  set apiToken(value) {
    this.#_apiToken = value;
    this.#initAxiosInstanceWithAPIToken();
  }

  set userJWT(value) {
    this.#_userJWT = value;
    this.#initAxiosInstanceWithUserJWT();
  }

  // Utilities
  #init() {
    this.#initAxiosInstance();
    this.#initAxiosInstanceWithAPIToken();
    this.#initAxiosInstanceWithUserJWT();
  }

  #initAxiosInstance() {
    this.#axiosInstance = axios.create({
      baseURL: this.#_url,
    });

    axiosRetry(this.#axiosInstance, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      onRetry: (retryCount, error, requestConfig) => {
        if(retryCount === 1) return;
        console.log(`[AxiosRetry] Retrying axios request \`${requestConfig.method.toUpperCase()} ${(new URL(requestConfig.baseURL, requestConfig.url)).toString()}\` due to an error "${error.message}" (${retryCount - 1})...`);
        return;
      },
    });
  }

  #initAxiosInstanceWithAPIToken() {
    this.#axiosInstanceWithAPIToken = axios.create({
      baseURL: this.#_url,
      headers: {
        Authorization: `Bearer ${this.#_apiToken}`,
      },
    });

    axiosRetry(this.#axiosInstanceWithAPIToken, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      onRetry: (retryCount, error, requestConfig) => {
        if(retryCount === 1) return;
        console.log(`[AxiosRetry] Retrying axios request \`${requestConfig.method.toUpperCase()} ${(new URL(requestConfig.baseURL, requestConfig.url)).toString()}\` due to an error "${error.message}" (${retryCount - 1})...`);
        return;
      },
    });
  }

  #initAxiosInstanceWithUserJWT() {
    this.#axiosInstanceWithUserJWT = axios.create({
      baseURL: this.#_url,
      headers: {
        Authorization: `Bearer ${this.#_userJWT}`,
      },
    });

    axiosRetry(this.#axiosInstanceWithUserJWT, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      onRetry: (retryCount, error, requestConfig) => {
        if(retryCount === 1) return;
        console.log(`[AxiosRetry] Retrying axios request \`${requestConfig.method.toUpperCase()} ${(new URL(requestConfig.baseURL, requestConfig.url)).toString()}\` due to an error "${error.message}" (${retryCount - 1})...`);
        return;
      },
    });
  }

  // Auth
  signInWithProvider(provider, accessToken) {
    return this.#axiosInstance.request({
      method: 'get',
      url: `/api/auth/${provider}/callback`,
      params: {
        access_token: accessToken,
      },
    }).then(authResp => {
      const {
        jwt,
      } = authResp.data;
      this.userJWT = jwt;

      return this.#axiosInstanceWithUserJWT.request({
        method: 'get',
        url: '/api/users/me',
        params: {
          populate: '*',
        },
      }).then(profileResp => {
        const profile = profileResp.data;

        return {
          jwt,
          user: profile,
        };
      });
    });
  }

  // API wrappers
  execAsApp({
    endpoint,
    method,
    params,
    data,
  } = {}) {
    return this.#axiosInstanceWithAPIToken.request({
      method,
      url: endpoint,
      params,
      data,
    }).then(resp => {
      return resp.data;
    });
  }

  execAsUser({
  } = {}) {
    return this.#axiosInstanceWithUserJWT.request({
      method,
      url: endpoint,
      params,
      data,
    }).then(resp => {
      return resp.data;
    });
  }
}

