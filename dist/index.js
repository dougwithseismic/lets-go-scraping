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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
const helpers_1 = require("./helpers");
// Main Scraper function
const runScraper = ({ initOptions, actions, onComplete, onSuccess, onError, onRequest, onResponse, timeout = 60000, // default timeout to 60 seconds
retries = 3, // default number of retries to 3
delayBetweenActions = 0 // default delay between actions to 0 seconds
 }) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let data = [];
    let isComplete = false;
    let errors = [];
    let browser = yield puppeteer_1.default.launch(initOptions);
    if (!browser) {
        throw new Error('Unable to launch the browser');
    }
    try {
        // Set the timeout for scraper execution
        const timer = setTimeout(() => {
            throw new Error(`Scraping timed out after ${timeout} milliseconds`);
        }, timeout);
        // Execute each action with retry and delay mechanism
        for (const action of actions) {
            const result = yield (0, helpers_1.actionWrapper)(action, browser, retries, delayBetweenActions, timeout, initOptions, onRequest, onResponse);
            if ((result === null || result === void 0 ? void 0 : result.status) === 'fulfilled') {
                data.push(result.value);
            }
            else {
                errors.push((_a = result === null || result === void 0 ? void 0 : result.reason) !== null && _a !== void 0 ? _a : 'Unknown error');
            }
            yield new Promise((resolve) => setTimeout(resolve, delayBetweenActions));
        }
        clearTimeout(timer);
        if (!errors.length) {
            isComplete = true;
            onSuccess && onSuccess(data);
        }
        else {
            onError && onError(errors);
        }
    }
    catch (error) {
        errors.push(error);
        onError && onError(errors);
    }
    finally {
        try {
            if (browser) {
                yield browser.close();
            }
        }
        catch (error) {
            errors.push(error);
        }
        onComplete && onComplete(data, errors);
    }
    return {
        data,
        isComplete,
        errors,
        actions: { eject: () => browser && browser.close() }
    };
});
exports.default = runScraper;
