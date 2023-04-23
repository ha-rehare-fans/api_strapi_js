import * as path from 'path-browserify';

export class StrapiClient {
  #_url;

  constructor(config = {}) {
    this.#_url = config.url || process.env.NEXT_PUBLIC_STRAPI_URL || 'https://cms.ha-rehare.fans/';
  }

  // Property handlers
  get url() {
    return this.#_url;
  }
  set url(value) {
    this.#_url = value;
  }

  // Utilities
  absolute(pathname) {
    return new URL(pathname, this.#_url).toString();
  }
};

