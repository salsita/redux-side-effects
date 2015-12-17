import { assert } from 'chai';

import Task from '../src/Task';

describe('Task', () => {
  it('will defer a callback', done => {
    const task = new Task();
    task.defer(done);
  });

  it('will not allow deferring multiple callbacks', done => {
    const task = new Task();
    task.defer(done);

    try {
      task.defer(() => done(new Error('Should not be called')));
    } catch (ex) {
      assert.equal(ex.message, `Invariant violation: Cannot set a new task while another is currently set.`);
    }
  });

  it('will know if a deferred callback is set', done => {
    const task = new Task();
    assert.isTrue(!task.isSet());
    task.defer(done);
    assert.isTrue(task.isSet());
  });

  it('will clear a deferred callback', done => {
    const task = new Task();
    assert.isTrue(!task.isSet());
    task.defer(() => done(new Error('Should not be called')));
    assert.isTrue(task.isSet());
    task.clear();
    task.defer(done);
    assert.isTrue(task.isSet());
  });
});
