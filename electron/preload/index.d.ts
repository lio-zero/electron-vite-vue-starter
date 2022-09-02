declare function domReady(condition?: DocumentReadyState[]): Promise<unknown>;
declare const safeDOM: {
    append(parent: HTMLElement, child: HTMLElement): HTMLElement;
    remove(parent: HTMLElement, child: HTMLElement): HTMLElement;
};
/**
 * https://tobiasahlin.com/spinkit
 * https://connoratherton.com/loaders
 * https://projects.lukehaas.me/css-loaders
 * https://matejkustec.github.io/SpinThatShit
 */
declare function useLoading(): {
    appendLoading(): void;
    removeLoading(): void;
};
declare const appendLoading: () => void, removeLoading: () => void;
