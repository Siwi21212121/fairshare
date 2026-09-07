import client from './client';

export async function registerRequest(data) {
  const res = await client.post('/auth/register', data);
  return res.data; // { token, user }
}

export async function loginRequest(data) {
  const res = await client.post('/auth/login', data);
  return res.data; // { token, user }
}

export async function meRequest() {
  const res = await client.get('/auth/me');
  return res.data.user;
}
