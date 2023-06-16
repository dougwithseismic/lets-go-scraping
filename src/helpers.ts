import { Page, Browser } from 'puppeteer'
import {
  OnRequest,
  OnResponse,
  ProxySettings,
  Action,
  InitOptions
} from './types'

// Helper function to initialize the puppeteer page with required configurations
export const initializePage = async (
  page: Page,
  onRequest?: OnRequest,
  onResponse?: OnResponse,
  proxyCredentials?: ProxySettings['proxyCredentials'],
  timeout?: number
) => {
  // Set the timeout for each page
  timeout && page.setDefaultNavigationTimeout(timeout)

  if (onRequest || onResponse) {
    // Enable request/response interception if handlers are provided
    await page.setRequestInterception(true)
    onRequest && page.on('request', onRequest)
    onResponse && page.on('response', onResponse)
  }

  if (proxyCredentials) {
    // Provide credentials for HTTP authentication if your proxy requires it
    await page.authenticate(proxyCredentials)
  }
}

// Helper function that wraps each action with a retry mechanism and delay control
export const actionWrapper = async (
  action: Action,
  browser: Browser,
  retries: number,
  delayBetweenActions: number,
  timeout: number,
  initOptions: InitOptions,
  onRequest?: OnRequest,
  onResponse?: OnResponse
) => {
  for (let i = 0; i < retries; i++) {
    let page: Page | undefined
    try {
      // Create a new page for each action
      page = await browser.newPage()
      await initializePage(
        page,
        onRequest,
        onResponse,
        initOptions.proxyCredentials,
        timeout
      )

      // Execute the action
      const result = await action(page)
      return { status: 'fulfilled', value: result }
    } catch (error) {
      if (i === retries - 1) {
        // If we've exhausted all retries, return the error
        return { status: 'rejected', reason: error }
      }
      // Wait before retrying the action
      await new Promise((resolve) => setTimeout(resolve, delayBetweenActions))
    } finally {
      // Ensure to close the page, even in case of an error
      if (page) {
        await page.close()
      }
    }
  }
  // If we have gone through all retries without an error being thrown
  // but also without a successful return, we can assume the action failed.
  return { status: 'rejected', reason: 'Action failed after all retries' }
}
