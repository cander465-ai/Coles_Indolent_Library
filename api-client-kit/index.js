'use strict'

class ApiClientError extends Error {
    constructor(message, code, status) {
        super(message)
        this.name = 'ApiClientError'
        this.code = code
        this.status = status // 0 means no response came back
    }
}

function createClient({ baseUrl, getToken, fetchImpl, timeoutMs = 10000 } = {}) {
    if (typeof baseUrl !== 'string' || baseUrl.length === 0) {
        throw new ApiClientError('baseUrl is required', 'INVALID_BASE_URL', 0)
    }
    const doFetch = fetchImpl || fetch

    async function request(method, path, body) {
        const headers = { 'Content-Type': 'application/json' }
        const token = getToken ? getToken() : null
        if (token) headers.Authorization = 'Bearer ' + token

        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), timeoutMs)

        let res
        try {
            res = await doFetch(baseUrl + path, {
                method: method,
                headers: headers,
                body: body === undefined ? undefined : JSON.stringify(body),
                signal: controller.signal,
            })
        } catch (err) {
            if (controller.signal.aborted) {
                throw new ApiClientError('request timed out', 'TIMEOUT', 0)
            }
            throw new ApiClientError('network error', 'NETWORK_ERROR', 0)
        } finally {
            clearTimeout(timer)
        }

        let json = null
        try {
            json = await res.json()
        } catch (err) {
            json = null
        }

        // Turn the api-kit envelope into a thrown error
        if (!res.ok || !json || json.ok === false) {
            const e = json && json.error ? json.error : {}
            throw new ApiClientError(e.message || 'request failed', e.code || 'HTTP_ERROR', res.status)
        }
        return json.data
    }

    return {
        get: (path) => request('GET', path),
        post: (path, body) => request('POST', path, body),
        put: (path, body) => request('PUT', path, body),
        del: (path) => request('DELETE', path),
    }
}

module.exports = { createClient, ApiClientError }