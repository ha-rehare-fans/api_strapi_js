import axios from 'axios';
import axiosRetry from 'axios-retry';

export default class Strapi {
  #_url;
  #_apiToken;
  #axiosInstance;

  constructor(config = {}) {
    this.#_url = config.url || process.env.STRAPI_URL || 'https://cms.ha-rehare.fans/';
    this.#_apiToken = config.apiToken || process.env.STRAPI_API_TOKEN || '';

    this.#init();
  }

  // Property handlers
  get url() {
    return this.#_url;
  }
  set url(value) {
    this.#_url = value;
    this.#init();
  }

  set apiToken(value) {
    this.#_apiToken = value;
    this.#init();
  }

  // Utilities
  #init() {
    this.#axiosInstance = axios.create({
      baseURL: this.#_url,
      headers: {
        Authorization: `Bearer ${this.#_apiToken}`,
      },
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

  // API wrappers
  getProvidedServices(page = 1) {
    return this.#axiosInstance.request({
      method: 'get',
      url: '/api/provided-services',
      params: {
        populate: [
          'links',
          'thumbnail',
        ],
        pagination: {
          page,
          pageSize: 10,
        },
      },
    }).then(resp => {
      return resp.data;
    });
  }

  getRelatedLinks(key) {
    return this.#axiosInstance.request({
      method: 'get',
      url: '/api/related-links-sets',
      params: {
        filters: {
          key: {
            $eq: key,
          },
        },
        populate: [
          'relatedLinks',
          'relatedLinks.thumbnail',
        ],
        pagination: {
          start: 0,
          limit: 1,
          withCount: false,
        },
      },
    }).then(resp => {
      return resp.data;
    });
  }
}

