/**
 * EXPERIMENTAL opt-in parallel orchestration for TypeFlow.
 * This module intentionally does not import core, keeping stable bundles small.
 */

export const parallelStep = (steps, options) => ({ kind: 'parallel', steps, options });

export function createParallel(engine) {
  if (!engine?.type || !engine?.erase)
    throw new TypeError('TypeFlow parallel: a TypeFlow engine instance is required.');

  const parallel = (steps, options = {}) => {
    const input = Array.isArray(steps) ? steps : [];
    if (input.length === 0)
      return {
        stop: () => {},
        promise: Promise.resolve({ completed: true, text: '', results: [] }),
      };

    const requested = Number(options.concurrency);
    const concurrency = Number.isFinite(requested)
      ? Math.max(1, Math.min(input.length, Math.floor(requested)))
      : input.length;
    const settlement = options.settlement === 'fail-fast' ? 'fail-fast' : 'all-settled';
    const activeChildren = new Set();
    const cancelWaits = new Set();
    const results = new Array(input.length);
    let nextIndex = 0;
    let interrupted = false;
    let halted = false;

    const stopActive = () => {
      activeChildren.forEach((child) => child.stop());
      cancelWaits.forEach((cancel) => cancel());
      activeChildren.clear();
      cancelWaits.clear();
    };
    const controller = {
      stop: () => {
        if (interrupted) return;
        interrupted = true;
        halted = true;
        stopActive();
      },
      promise: null,
    };
    const targetFor = (step) => {
      const target = step.target ?? options.target;
      if (!target)
        throw new Error('TypeFlow parallel: a step requires a target or default `target`.');
      return target;
    };
    const wait = (duration) =>
      new Promise((resolve) => {
        let done = false;
        const finish = (completed) => {
          if (done) return;
          done = true;
          clearTimeout(id);
          cancelWaits.delete(cancel);
          resolve(completed);
        };
        const id = setTimeout(() => finish(true), Math.max(0, Number(duration) || 0));
        const cancel = () => finish(false);
        cancelWaits.add(cancel);
      });
    const visible = (step) =>
      new Promise((resolve) => {
        if (typeof IntersectionObserver === 'undefined') return resolve(true);
        let done = false;
        const observer = new IntersectionObserver(
          (entries) => {
            if (entries.some((entry) => entry.isIntersecting)) finish(true);
          },
          { threshold: step.threshold ?? 0.1 }
        );
        const finish = (completed) => {
          if (done) return;
          done = true;
          observer.disconnect();
          cancelWaits.delete(cancel);
          resolve(completed);
        };
        const cancel = () => finish(false);
        cancelWaits.add(cancel);
        const target =
          typeof targetFor(step) === 'string'
            ? document.querySelector(targetFor(step))
            : targetFor(step);
        if (!target) throw new Error('TypeFlow parallel: visibility target not found.');
        observer.observe(target);
      });
    const runStep = async (step) => {
      if (!step || typeof step !== 'object')
        throw new TypeError('TypeFlow parallel: invalid step.');
      if (step.kind === 'pause') return { completed: await wait(step.duration), text: '' };
      if (step.kind === 'visible') return { completed: await visible(step), text: '' };
      if (step.kind === 'call') {
        await step.fn();
        return { completed: true, text: '' };
      }
      let child;
      if (step.kind === 'type') child = engine.type(targetFor(step), step.text, step.config);
      else if (step.kind === 'erase') child = engine.erase(targetFor(step), step.config);
      else if (step.kind === 'parallel')
        child = parallel(step.steps, {
          ...step.options,
          target: step.options?.target ?? options.target,
        });
      else
        throw new TypeError(`TypeFlow parallel: unsupported step kind \`${String(step.kind)}\`.`);
      activeChildren.add(child);
      try {
        return await child.promise;
      } finally {
        activeChildren.delete(child);
      }
    };
    const worker = async () => {
      while (!halted) {
        const index = nextIndex++;
        if (index >= input.length) return;
        try {
          const value = await runStep(input[index]);
          results[index] = { status: value.completed ? 'fulfilled' : 'interrupted', value };
        } catch (error) {
          results[index] = { status: 'rejected', reason: error };
        }
        if (results[index].status !== 'fulfilled' && settlement === 'fail-fast') {
          halted = true;
          stopActive();
        }
      }
    };
    controller.promise = Promise.all(Array.from({ length: concurrency }, worker)).then(() => {
      for (let index = 0; index < input.length; index += 1) {
        results[index] ??= { status: 'interrupted', value: { completed: false, text: '' } };
      }
      return {
        completed: !interrupted && results.every(({ status }) => status === 'fulfilled'),
        text: '',
        results,
      };
    });
    return controller;
  };
  return parallel;
}

/** Explicitly installs the experimental methods onto caller-provided core objects. */
export function installParallel(engine, sequenceHelpers) {
  const parallel = createParallel(engine);
  Object.defineProperty(engine, 'parallel', { configurable: true, value: parallel });
  if (sequenceHelpers)
    Object.defineProperty(sequenceHelpers, 'parallel', { configurable: true, value: parallelStep });
  return engine;
}
