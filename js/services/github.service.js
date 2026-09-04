import githubApi from '../api/github.js';

export async function getUser(username) {
  const resposta = await githubApi.get(`/users/${username}`);
  return resposta.data;
}

export async function getRepos(username) {
  const resposta = await githubApi.get(`/users/${username}/repos`, {
    params: {
      sort: 'updated',
      per_page: 100,
    },
  });
  return resposta.data;
}

export async function getFollowers(username) {
  const resposta = await githubApi.get(`/users/${username}/followers`, {
    params: {
      sort: 'updated',
      per_page: 100,
    },
  });
  return resposta.data;
}
