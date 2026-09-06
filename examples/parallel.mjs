import { TypeFlow, seq } from '../src/typeflow.js';
import { installParallel } from '../src/typeflow-parallel.js';

installParallel(TypeFlow, seq);

/**
 * Executable experimental parallel example. Pass a Document so this module is
 * also usable in browsers, JSDOM, and documentation smoke tests.
 */
export async function runParallelExample(document) {
  const first = document.createElement('p');
  const second = document.createElement('p');
  document.body.append(first, second);

  return TypeFlow.parallel([
    seq.type(first, 'First target', { speed: 1, cursor: '', respectReducedMotion: false }),
    seq.type(second, 'Second target', { speed: 1, cursor: '', respectReducedMotion: false }),
  ], { concurrency: 2, settlement: 'all-settled' }).promise;
}
