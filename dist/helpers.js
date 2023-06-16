"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.actionWrapper = exports.initializePage = void 0;
// Helper function to initialize the puppeteer page with required configurations
const initializePage = (page, onRequest, onResponse, proxyCredentials, timeout) => __awaiter(void 0, void 0, void 0, function* () {
    // Set the timeout for each page
    timeout && page.setDefaultNavigationTimeout(timeout);
    if (onRequest || onResponse) {
        // Enable request/response interception if handlers are provided
        yield page.setRequestInterception(true);
        onRequest && page.on('request', onRequest);
        onResponse && page.on('response', onResponse);
    }
    if (proxyCredentials) {
        // Provide credentials for HTTP authentication if your proxy requires it
        yield page.authenticate(proxyCredentials);
    }
});
exports.initializePage = initializePage;
// Helper function that wraps each action with a retry mechanism and delay control
const actionWrapper = (action, browser, retries, delayBetweenActions, timeout, initOptions, onRequest, onResponse) => __awaiter(void 0, void 0, void 0, function* () {
    for (let i = 0; i < retries; i++) {
        let page;
        try {
            // Create a new page for each action
            page = yield browser.newPage();
            yield (0, exports.initializePage)(page, onRequest, onResponse, initOptions.proxyCredentials, timeout);
            // Execute the action
            const result = yield action(page);
            return { status: 'fulfilled', value: result };
        }
        catch (error) {
            if (i === retries - 1) {
                // If we've exhausted all retries, return the error
                return { status: 'rejected', reason: error };
            }
            // Wait before retrying the action
            yield new Promise((resolve) => setTimeout(resolve, delayBetweenActions));
        }
        finally {
            // Ensure to close the page, even in case of an error
            if (page) {
                yield page.close();
            }
        }
    }
    // If we have gone through all retries without an error being thrown
    // but also without a successful return, we can assume the action failed.
    return { status: 'rejected', reason: 'Action failed after all retries' };
});
exports.actionWrapper = actionWrapper;
