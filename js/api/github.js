const githubApi = axios.create({
  baseURL: 'https://api.github.com',
  timeout: 5000,
  headers: {
    Accept: 'application/vnd.github+json',
  },
});

githubApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const response = error.response;

    if (!response) {
      return Promise.reject(error);
    }

    if (response.status === 403 && response.headers['x-ratelimit-remaining'] === '0') {
      error.rateLimitAtingido = true;
      error.resetTimestamp = Number(response.headers['x-ratelimit-reset']);
      return Promise.reject(error);
    }

    if (response.status === 404) {
      error.usuarioNaoEncontrado = true;
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default githubApi;
