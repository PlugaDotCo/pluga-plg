const axios = require('../../../lib/axios');
const AxiosService = require('../../../lib/files/local/axiosService');

jest.mock('../../../lib/axios');

describe('AxiosService', () => {
  let service;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AxiosService();
  });

  it('downloads a file as stream using axios', async () => {
    const fakeStream = { fake: 'stream' };

    axios.mockResolvedValue({
      data: fakeStream,
    });

    const params = {
      downloadRequestParams: {
        downloadUrl: 'https://example.com/file.txt',
        headers: {
          Authorization: 'Bearer token',
        },
      },
    };

    const result = await service.download(params);

    expect(axios).toHaveBeenCalledWith({
      method: 'get',
      url: 'https://example.com/file.txt',
      responseType: 'stream',
      headers: {
        Authorization: 'Bearer token',
      },
    });

    expect(result).toEqual({
      stream: fakeStream,
    });
  });
});
