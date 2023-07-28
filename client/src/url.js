export let envURL = window.location.protocol + '//' + window.location.host;

const baseURL =
  envURL === 'http://localhost:3000'
    ? 'http://localhost:4000'
    : 'https://seahorse-app-847hs.ondigitalocean.app';

export default baseURL;
