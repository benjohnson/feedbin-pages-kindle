const axios = require('axios');

const FEEDBIN_API = 'https://api.feedbin.com/v2/';

export const validateCredentials = async (username, password) => {
    const response = await axios.request({
      url: 'authentication',
      baseURL: FEEDBIN_API,
      auth: {
        username,
        password,
      },
      validateStatus: status => status !== 200 || status !== 401
    });
    return response.status === 200;
};
