// Stub for node-fetch → use browser's native fetch
export default (...args) => fetch(...args)
export const Headers = window.Headers
export const Request = window.Request
export const Response = window.Response
