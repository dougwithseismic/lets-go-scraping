# Lets Go Scraping

[![npm version](https://badge.fury.io/js/lets-go-scraping.svg)](https://www.npmjs.com/package/lets-go-scraping)

Meet `lets-go-scraping`, a simple puppeteer wrapper which makes the process of web scraping and automation with websites a breeze. If you're spending too much time writing puppeteer boilerplate and not enough time automating tasks then `lets-go-scraping` will break that cycle.

## What is `lets-go-scraping`?

Born from the need to go fast on data collection projects, `lets-go-scraping` is a great way to utilize puppeteer without extensive setup and configuration. In it's simplest form, start scraping like this:

```javascript
runScraper({
  initOptions: scraperOptions,
  actions: [async (page) => {
    await page.goto('https://example.com');
    const title = await page.title();
    return { url, title };
  },async (page) => {
    await page.goto('https://google.com');
    const title = await page.title();
    return { url, title };
  }],
}).then((result) => console.log(result.data));

```

## Installation

You can install the Puppeteer Wrapper through npm:

```bash
npm install lets-go-scraping
```

## Features

- Allows retrying actions with a customizable number of retries.
- You can set delay between actions.
- You can set request and response handlers.
- It can be configured with custom Puppeteer launch options.
- Allows to set success, error, and completion handlers.
- Supports the use of a proxy server.
- Plug in `puppeteer-extra` easily.

## Usage

Here are some examples on how to use each feature.

First, import the library:

```javascript
import runScraper, { Action, InitOptions, OnComplete, OnError, OnSuccess, OnRequest, OnResponse } from 'lets-go-scraping';
```

### Basic usage

```javascript
// Define your actions - This is an array that would typically contain many urls, and a callback for each of them.
const actions: Action[] = [
  async (page) => {
    await page.goto('https://example.com');
    const title = await page.title();
    return title;
  },
];

const scraperOptions: InitOptions = {
    headless: 'new',
    devtools: true
  // Any Puppeteer browser launch options
};

runScraper({
  initOptions: scraperOptions,
  actions,
}).then((result) => console.log(result.data));
```

### Using `puppeteer-extra`

Sometimes, you'll find scraping cases where the regular puppeteer package just won't cut it, but `puppeteer-extra` will (Stealth plugin, anyone?) Here's how you can do that.

```ts
import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import runScraper from 'lets-go-scraping';

// Add Stealth Plugin to puppeteerExtra
puppeteerExtra.use(StealthPlugin());

// Define the scraper options and actions
const scraperOptions = {
  puppeteerPackage: puppeteerExtra, // Use puppeteer-extra with Stealth Plugin
  initOptions: {
    headless: true,
  },

// ...
```

### With all optional handlers

```javascript
// Define your actions
  const urls = [
    'https://reddit.com/r/expressjs',
    'https://reddit.com/r/reactjs',
    'https://reddit.com/r/nodejs',
    'https://reddit.com/r/webdev',
    'https://reddit.com/r/learnjavascript',
    'https://reddit.com/r/nextjs',
    'https://reddit.com/r/typescript',
    'https://reddit.com/r/supabase',
    'https://reddit.com/r/sveltejs'
  ]

  // Define your actions
  const actions: Action[] = urls.map((url) => async (page: Page) => {
    await page.goto(url, { waitUntil: 'networkidle2' })
    const title = await page.title()
    return { url, title }
  })


const onRequest: OnRequest = (request) => {
  console.log(`Starting request to ${request.url()}`);
  // Dont forget to abort or continue the request here!
  // https://pptr.dev/guides/request-interception
  // request.abort() will stop the request from being made oooor..
 request.continue() // ... will continue the request

};

const onResponse: OnResponse = (response) => {
  console.log(`Completed request to ${response.url()}`);
};

const onSuccess: OnSuccess = (data) => {
  console.log('Data:', data);
};

const onError: OnError = (error) => {
  console.error('Error occurred:', error);
};

const onComplete: OnComplete = (data, errors) => {
  console.log('Completed with data:', data, 'and errors:', errors);
};

const scraperOptions: InitOptions = {
  // Any Puppeteer browser launch options
};

  runScraper({
    initOptions: {
      headless: false,
      devtools: true,
      delayBetweenActions: 2000, // 2 seconds between each action
      timeout: 30000, // 30 seconds before page times out and moves on (default 60 seconds)
      retries: 3,// Number of times an action will be tried if it fails. default 3.
      proxy: 'http://myproxy:8080',
      proxyCredentials: {
        username: 'myUsername',
        password: 'myPassword'
      },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    },
    actions,
    onSuccess: (data) => console.log('Success: ', data),
    onError: (errors) => console.error('Error: ', errors),
    onComplete: (data, errors) => console.log('Complete: ', data, errors)
  })
    .then(({ data, isComplete, errors }) => {
      console.log('Data: ', data)
      console.log('Is Complete: ', isComplete)
      console.log('Errors: ', errors)
    })
    .catch((error) => {
      console.error('Unexpected Error: ', error)
    })
```

### With Proxy Settings

```javascript
const scraperOptions: InitOptions = {
  // Any Puppeteer browser launch options
  proxy: 'http://localhost:8080',
  proxyCredentials: {
    username: 'myUsername',
    password: 'myPassword',
  },
};

// ...rest of the code
```

## License

[ISC](LICENSE) © Doug Silkstone
