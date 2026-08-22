# Framework Adapters Architecture

TypeFlow utilizes runtime injection factories (`createTypeFlowReact`, `createTypeFlowVue`, `createTypeFlowSvelte`, `createTypeFlowSolid`, `createTypeFlowAlpine`, `defineTypeFlowElement`) to provide framework-specific hooks and directives without embedding framework dependencies in the library bundle.

---

## 1. Adapter Design Pattern

```mermaid
graph TD
    TypeFlowCore["@staticcanvas/typeflow (Core Singleton)"]
    
    subgraph "Factory Functions (Injected Runtime)"
        ReactFactory["createTypeFlowReact(React)"]
        VueFactory["createTypeFlowVue(Vue)"]
        SvelteFactory["createTypeFlowSvelte()"]
        SolidFactory["createTypeFlowSolid(Solid)"]
        AlpineFactory["createTypeFlowAlpine(Alpine)"]
        CustomElemFactory["defineTypeFlowElement()"]
    end

    subgraph "Consumer Component Runtime"
        ReactApp["React Component (useRef + useEffect)"]
        VueApp["Vue 3 Component (ref + watch + onBeforeUnmount)"]
        SvelteApp["Svelte Component (use:typeflow action)"]
        SolidApp["Solid Component (createSignal + createEffect)"]
        AlpineApp["Alpine HTML Template (x-typeflow)"]
        HTMLApp["Vanilla / Web Component (<type-flow>)"]
    end

    TypeFlowCore --> ReactFactory
    TypeFlowCore --> VueFactory
    TypeFlowCore --> SvelteFactory
    TypeFlowCore --> SolidFactory
    TypeFlowCore --> AlpineFactory
    TypeFlowCore --> CustomElemFactory

    ReactFactory --> ReactApp
    VueFactory --> VueApp
    SvelteFactory --> SvelteApp
    SolidFactory --> SolidApp
    AlpineFactory --> AlpineApp
    CustomElemFactory --> HTMLApp
```

---

## 2. Teardown & Lifecycle Isolation

All adapters adhere to the following invariants:
1. **Unmount Cleanup**: Whenever a host component unmounts, the underlying `TypeFlowController.stop()` method is invoked synchronously to clear pending timers.
2. **Re-render Resilience**: When inputs or text props mutate, the active controller is stopped before initiating the replacement animation, preventing interleaved animation artifacts.
3. **WeakMap Preservation**: DOM baseline elements are managed in `TypeFlowEngine.baselines` WeakMaps to avoid memory leaks during dynamic component destruction.

---

## 3. Supported Ecosystem Implementations

| Framework | Implementation | Lifecycle Contract |
| :--- | :--- | :--- |
| **React** | `useTypeFlow(text, config)` | `useEffect(() => () => controller.stop(), [text])` |
| **Vue 3** | `useTypeFlow(() => ref.value, config)` | `watch` immediate + `onBeforeUnmount(() => controller.stop())` |
| **Svelte** | `use:typeflow={{ text, config }}` | Standard Svelte Action (`update`, `destroy`) |
| **Solid.js** | `useTypeFlow(signal, config)` | `createEffect` + `onCleanup(() => controller.stop())` |
| **Alpine.js** | `x-typeflow="{ text, config }"` | `Alpine.directive` + `cleanup(() => controller.stop())` |
| **Web Components** | `<type-flow text="..." speed="30">` | `connectedCallback()` + `disconnectedCallback()` + `attributeChangedCallback()` |
| **Angular** | Standalone Directive `[appTypeFlow]` | `ngOnChanges` + `ngOnDestroy` |
