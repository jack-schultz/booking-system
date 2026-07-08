/** @type {AbortController | null} */
let abortController = null;

/**
 * @param {{ registerOnAccountSwitch: Function }} _ctx
 */
export async function mountWalkinView(_ctx) {
    abortController = new AbortController();
}

export async function unmountWalkinView() {
    abortController?.abort();
    abortController = null;
}
