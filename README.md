# Lets Go Scraping

Meet `lets-go-scraping`, a simple puppeteer wrapper which makes the process of web scraping and automation with websites a breeze.

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

## Usage

Here are some examples on how to use each feature.

First, import the library:

```javascript
import runScraper, { Action, InitOptions, OnComplete, OnError, OnSuccess, OnRequest, OnResponse } from 'lets-go-scraping';
```

### Basic usage

```javascript
// Define your actions
const actions: Action[] = [
  async (page) => {
    await page.goto('https://example.com');
    const title = await page.title();
    return title;
  },
];

const scraperOptions: InitOptions = {
  // Any Puppeteer browser launch options
};

runScraper({
  initOptions: scraperOptions,
  actions,
}).then((result) => console.log(result.data));
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
  initOptions: scraperOptions,
  actions,
  onRequest,
  onResponse,
  onSuccess,
  onError,
  onComplete,
}).then((result) => console.log(result));
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
```

