const assert = require('assert');
const probeInvalid = require('../src/probeInvalid');

describe('probeInvalid', () => {
  it('returns error code', async () => {
    assert.deepEqual({
      'err_code': 'probe_type_invalid',
      duration: 0,
      probe_status: 2
    }, await probeInvalid());
  });
});