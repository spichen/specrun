import { describe, it, expect } from 'vitest';
import { State } from '../state.js';

describe('State', () => {
  it('creates from data', () => {
    const s = new State({ key: 'value' });
    const [v, ok] = s.get('key');
    expect(ok).toBe(true);
    expect(v).toBe('value');
  });

  it('creates empty from null', () => {
    const s = new State(null);
    expect(s.keys().length).toBe(0);
  });

  it('creates empty from undefined', () => {
    const s = new State();
    expect(s.keys().length).toBe(0);
  });

  it('set returns new state without modifying original', () => {
    const s = new State();
    const s2 = s.set('foo', 'bar');

    const [, ok] = s.get('foo');
    expect(ok).toBe(false);

    const [v, ok2] = s2.get('foo');
    expect(ok2).toBe(true);
    expect(v).toBe('bar');
  });

  it('merge combines states with override', () => {
    const s1 = new State({ a: '1', b: '2' });
    const s2 = new State({ b: 'overridden', c: '3' });

    const merged = s1.merge(s2);

    const tests: Record<string, string> = {
      a: '1',
      b: 'overridden',
      c: '3',
    };

    for (const [k, expected] of Object.entries(tests)) {
      const [v, ok] = merged.getString(k);
      expect(ok).toBe(true);
      expect(v).toBe(expected);
    }
  });

  it('clone does not modify original', () => {
    const s = new State({ x: 'y' });
    let c = s.clone();
    c = c.set('x', 'modified');

    const [v] = s.getString('x');
    expect(v).toBe('y');
  });

  it('JSON round-trip', () => {
    const s = new State({ name: 'test', count: 42 });
    const json = JSON.stringify(s);
    const parsed = JSON.parse(json);

    const s2 = new State(parsed);
    const [v, ok] = s2.getString('name');
    expect(ok).toBe(true);
    expect(v).toBe('test');
  });

  it('getString returns string values', () => {
    const s = new State({ str: 'hello', num: 42 });

    const [v, ok] = s.getString('str');
    expect(ok).toBe(true);
    expect(v).toBe('hello');

    const [, ok2] = s.getString('num');
    expect(ok2).toBe(false);

    const [, ok3] = s.getString('missing');
    expect(ok3).toBe(false);
  });
});
