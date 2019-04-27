const FIVE_MINUTES = 5 * 60 * 1000;

class AutoShutdownManager {
  constructor(timerDelay = FIVE_MINUTES) {
    this.timerDelay = timerDelay;
    this.timers = new Set();
    this.instances = new WeakMap();
  }

  register(instance) {
    let timer = setTimeout(() => instance.shutdown(), this.timerDelay);
    this.timers.add(timer);
    this.instances.set(instance, timer);
  }

  unregister(instance) {
    let timer = this.instances.get(instance);
    clearTimeout(timer);
    this.timers.delete(timer);
    this.instances.delete(instance);
  }

  refresh(instance) {
    this.unregister(instance);
    this.register(instance);
  }

  reset() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    this.instances = new WeakMap();
  }
}

module.exports = AutoShutdownManager;
