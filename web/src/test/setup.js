import "@testing-library/jest-dom/vitest";
if (!("ResizeObserver" in globalThis)) {
    class ResizeObserverMock {
        observe() { }
        unobserve() { }
        disconnect() { }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    globalThis.ResizeObserver = ResizeObserverMock;
}
