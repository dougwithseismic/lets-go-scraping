import { Page, HTTPRequest, HTTPResponse, BrowserLaunchArgumentOptions } from 'puppeteer'

export type ProxySettings = {
  proxy?: string
  proxyCredentials?: { username: string; password: string }
}

// Defining types
export type InitOptions = BrowserLaunchArgumentOptions & ProxySettings
export type Action = (page: Page) => Promise<any>
export type OnComplete = (data: any, errors?: any) => void
export type OnSuccess = (data: any) => void
export type OnError = (error: any) => void
export type OnRequest = (request: HTTPRequest) => void
export type OnResponse = (response: HTTPResponse) => void

export interface RunScraper {
  (params: {
    initOptions: InitOptions
    actions: Action[]
    onComplete?: OnComplete
    onSuccess?: OnSuccess
    onError?: OnError
    onRequest?: OnRequest
    onResponse?: OnResponse
    timeout?: number
    retries?: number
    delayBetweenActions?: number
  }): Promise<{ data: any; isComplete: boolean; errors: any; actions: any }>
}
