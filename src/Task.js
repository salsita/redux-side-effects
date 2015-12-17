import { invariant, isUndefined, defer, clearDefer } from './utils';

/**
 * A utility class to manage a single defferable task.
 *
 * @class Task
 */

export default class Task {
  _id;

  /**
   * Checks if a task is set to execute in the future.
   *
   * @returns {boolean} True if a task is set.
   */

  isSet() {
    return !isUndefined(this._id);
  }

  /**
   * Defers a function to be executed on the next turn of the event loop.
   * Will not allow a defer if the task is already set to execute.
   *
   * @param {Function} Callback to execute.
   */

  defer(callback) {
    invariant(!this.isSet(),
      'Cannot set a new task while another is currently set.');

    this._id = defer(() => {
      this.clear();
      callback();
    });
  }

  /**
   * Clears the task this class is managing. If the task has not run,
   * it will never run. If the task has run, the class will be opened
   * up for a new callback to be deffered.
   */

  clear() {
    clearDefer(this._id);
    delete this._id;
  }
}
