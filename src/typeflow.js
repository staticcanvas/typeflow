/**
 * TypeFlow - A lightweight, interruptible typewriter effect library
 * @version 1.0.0
 * @license MIT
 */

class TypeFlow {
    constructor() {
        this.activeInstances = new Map();
    }

    /**
     * Creates a typewriter effect that can be interrupted and restarted
     * @param {HTMLElement|string} targetElement - Element or selector to type into
     * @param {string} text - Text to type
     * @param {Object} config - Configuration options
     * @param {number} config.speed - Typing speed in ms per character (default: 50)
     * @param {number} config.delay - Initial delay before typing starts (default: 0)
     * @param {string} config.cursor - Cursor character (default: '|', set to '' to disable)
     * @param {boolean} config.cursorBlink - Enable cursor blinking (default: true)
     * @param {Function} config.onComplete - Callback when typing completes
     * @param {Function} config.onInterrupt - Callback when typing is interrupted
     * @param {string} config.mode - 'replace' or 'append' (default: 'replace')
     * @returns {Object} Control object with stop() method and promise
     */
    type(targetElement, text, config = {}) {
        // Normalize target element
        const target = typeof targetElement === "string" ? document.querySelector(targetElement) : targetElement;

        if (!target) {
            throw new Error("TypeFlow: Target element not found");
        }

        // Generate unique instance ID for this target
        const instanceId = this._getInstanceId(target);

        // Interrupt any existing animation on this target
        this.stop(target);

        // Default configuration
        const options = {
            speed: 50,
            delay: 0,
            cursor: "|",
            cursorBlink: true,
            onComplete: null,
            onInterrupt: null,
            mode: "replace",
            ...config,
        };

        // Validate text
        if (typeof text !== "string") {
            text = String(text);
        }

        // Create control object
        let isInterrupted = false;
        let timeoutId = null;
        let cursorInterval = null;

        const controller = {
            stop: () => {
                isInterrupted = true;
                if (timeoutId) clearTimeout(timeoutId);
                if (cursorInterval) clearInterval(cursorInterval);
                this.activeInstances.delete(instanceId);
                if (options.onInterrupt) {
                    options.onInterrupt();
                }
            },
            promise: null,
        };

        // Store active instance
        this.activeInstances.set(instanceId, controller);

        // Create the typing promise
        controller.promise = new Promise((resolve, reject) => {
            const typeCharacter = async (index) => {
                if (isInterrupted) {
                    reject(new Error("Typing interrupted"));
                    return;
                }

                if (index <= text.length) {
                    const currentText = text.slice(0, index);
                    const displayText = options.cursor ? currentText + options.cursor : currentText;

                    target.textContent = displayText;

                    if (index < text.length) {
                        timeoutId = setTimeout(() => typeCharacter(index + 1), options.speed);
                    } else {
                        // Typing complete
                        if (options.cursor && options.cursorBlink) {
                            // Blinking cursor after completion
                            let cursorVisible = true;
                            cursorInterval = setInterval(() => {
                                target.textContent = cursorVisible ? text + options.cursor : text;
                                cursorVisible = !cursorVisible;
                            }, 530);
                        } else {
                            target.textContent = text;
                        }

                        this.activeInstances.delete(instanceId);
                        if (options.onComplete) {
                            options.onComplete();
                        }
                        resolve(text);
                    }
                }
            };

            // Start typing after delay
            if (options.delay > 0) {
                timeoutId = setTimeout(() => typeCharacter(0), options.delay);
            } else {
                typeCharacter(0);
            }
        });

        return controller;
    }

    /**
     * Stops typing animation on a specific element
     * @param {HTMLElement|string} targetElement - Element or selector
     */
    stop(targetElement) {
        const target = typeof targetElement === "string" ? document.querySelector(targetElement) : targetElement;

        if (!target) return;

        const instanceId = this._getInstanceId(target);
        const instance = this.activeInstances.get(instanceId);

        if (instance) {
            instance.stop();
        }
    }

    /**
     * Stops all active typing animations
     */
    stopAll() {
        this.activeInstances.forEach((instance) => instance.stop());
        this.activeInstances.clear();
    }

    /**
     * Check if an element has an active typing animation
     * @param {HTMLElement|string} targetElement - Element or selector
     * @returns {boolean}
     */
    isTyping(targetElement) {
        const target = typeof targetElement === "string" ? document.querySelector(targetElement) : targetElement;

        if (!target) return false;

        const instanceId = this._getInstanceId(target);
        return this.activeInstances.has(instanceId);
    }

    /**
     * Generates a unique ID for an element
     * @private
     */
    _getInstanceId(element) {
        if (!element._typeFlowId) {
            element._typeFlowId = `typeflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        return element._typeFlowId;
    }
}

// Create singleton instance
const typeFlow = new TypeFlow();

// Export for different module systems
if (typeof module !== "undefined" && module.exports) {
    module.exports = typeFlow;
} else if (typeof define === "function" && define.amd) {
    define([], () => typeFlow);
} else {
    window.TypeFlow = typeFlow;
}

/* ============================================
   USAGE EXAMPLES
   ============================================

// Basic usage
TypeFlow.type('#output', 'Hello, World!', { speed: 100 });

// With all options
TypeFlow.type('#output', 'Hello, World!', {
  speed: 50,
  delay: 500,
  cursor: '|',
  cursorBlink: true,
  onComplete: () => console.log('Done!'),
  onInterrupt: () => console.log('Stopped!')
});

// Search input example - interrupts previous typing
const searchInput = document.querySelector('#search');
const output = document.querySelector('#output');

searchInput.addEventListener('input', (e) => {
  const value = e.target.value;

  if (value.length >= 3) {
    // Automatically interrupts previous typing
    TypeFlow.type(output, `Searching for: ${value}...`, {
      speed: 30
    });
  }
});

// Using the controller
const controller = TypeFlow.type('#output', 'Long text...', { speed: 50 });

// Stop manually
setTimeout(() => controller.stop(), 2000);

// Or use the promise
controller.promise
  .then(text => console.log('Completed:', text))
  .catch(err => console.log('Interrupted'));

// Check if typing
if (TypeFlow.isTyping('#output')) {
  console.log('Still typing...');
}

// Stop all animations
TypeFlow.stopAll();

*/
