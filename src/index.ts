import puppeteer, { Browser } from 'puppeteer'
import {
  InitOptions,
  Action,
  OnComplete,
  OnSuccess,
  OnError,
  OnRequest,
  OnResponse,
  RunScraper
} from './types'
import { actionWrapper } from './helpers'


export type { InitOptions, Action, OnComplete, OnSuccess, OnError, OnRequest, OnResponse, RunScraper } from './types'

// Main Scraper function
const runScraper: RunScraper = async ({
  puppeteerPackage = puppeteer,
  initOptions,
  actions,
  onComplete,
  onSuccess,
  onError,
  onRequest,
  onResponse,
  timeout = 60000, // default timeout to 60 seconds
  retries = 3, // default number of retries to 3
  delayBetweenActions = 0 // default delay between actions to 0 seconds
}) => {
  let data: any[] = []
  let isComplete = false
  let errors: any[] = []
  let browser: Browser | null = null

  try {
    browser = await puppeteerPackage.launch(initOptions)
    if (!browser) {
      throw new Error('Unable to launch the browser')
    }

    // Set the timeout for scraper execution
    const timer = setTimeout(() => {
      throw new Error(`Scraping timed out after ${timeout} milliseconds`)
    }, timeout)

    // Execute each action with retry and delay mechanism
    for (const action of actions) {
      const result = await actionWrapper(
        action,
        browser,
        retries,
        delayBetweenActions,
        timeout,
        initOptions,
        onRequest,
        onResponse
      )
      if (result?.status === 'fulfilled') {
        data.push(result.value)
      } else {
        errors.push(result?.reason ?? 'Unknown error')
      }
      await new Promise((resolve) => setTimeout(resolve, delayBetweenActions))
    }

    clearTimeout(timer)

    if (!errors.length) {
      isComplete = true
      onSuccess && onSuccess(data)
    } else {
      onError && onError(errors)
    }
  } catch (error) {
    errors.push(error)
    onError && onError(errors)
  } finally {
    try {
      if (browser) {
        await browser.close()
      }
    } catch (error) {
      errors.push(error)
    }

    onComplete && onComplete(data, errors)
  }

  return {
    data,
    isComplete,
    errors,
    actions: { eject: () => browser && browser.close() }
  }
}

export default runScraper
