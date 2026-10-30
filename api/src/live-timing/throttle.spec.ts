import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { Throttle } from './throttle';

describe('Throttle', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('runs the first request straight away', () => {
    const task = jest.fn();
    new Throttle(1_000, task).request();

    expect(task).toHaveBeenCalledTimes(1);
  });

  it('runs requests within the interval once, when it has passed', () => {
    const task = jest.fn();
    const throttle = new Throttle(1_000, task);

    throttle.request();
    jest.advanceTimersByTime(200);
    throttle.request();
    throttle.request();
    expect(task).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(800);
    expect(task).toHaveBeenCalledTimes(2);
  });

  it('runs straight away again once the interval has passed', () => {
    const task = jest.fn();
    const throttle = new Throttle(1_000, task);

    throttle.request();
    jest.advanceTimersByTime(1_500);
    throttle.request();

    expect(task).toHaveBeenCalledTimes(2);
  });

  it('drops a pending run when cancelled', () => {
    const task = jest.fn();
    const throttle = new Throttle(1_000, task);

    throttle.request();
    throttle.request();
    throttle.cancel();
    jest.advanceTimersByTime(2_000);

    expect(task).toHaveBeenCalledTimes(1);
  });
});
