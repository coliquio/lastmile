const assert = require('assert');
const probeInvalid = require('../src/probeInvalid');

describe('probeInvalid', () => {
  it('returns error code', () => {
    assert.deepEqual({
      'err_code': 'probe_type_invalid'
    }, probeInvalid());
  });
});