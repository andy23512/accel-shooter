import { nodeShared } from './node-shared';

describe('nodeShared', () => {
  it('should work', () => {
    expect(nodeShared()).toEqual('node-shared');
  });
});
