importScripts('/_nuxt/workbox.4c4f5ca6.js')

workbox.precaching.precacheAndRoute([
  {
    "url": "/_nuxt/1e06374a3d745ff0f1bd.js",
    "revision": "99a32d68a3b163b06434190e53bfedb5"
  },
  {
    "url": "/_nuxt/6ec24fb8fd8146ac8839.js",
    "revision": "1222e44754cc977853671facfbe4f72d"
  },
  {
    "url": "/_nuxt/90ef8647e9e406b58e19.js",
    "revision": "aa75b85dd486d0a1a60e4e209bbee7d4"
  },
  {
    "url": "/_nuxt/936dbcfe1d27f587dbb5.js",
    "revision": "179366aa3a8cba1138471ec1a2e6ee39"
  },
  {
    "url": "/_nuxt/b22841b1f4a0aa7affb9.js",
    "revision": "67bab92fb0fea0cfab3a25c9f4278761"
  },
  {
    "url": "/_nuxt/c222c6f7dea8ae1215d9.js",
    "revision": "72dde96b9ec1de3e2fbe445d881256c4"
  }
], {
  "cacheId": "cmd-project",
  "directoryIndex": "/",
  "cleanUrls": false
})

workbox.clientsClaim()
workbox.skipWaiting()

workbox.routing.registerRoute(new RegExp('/_nuxt/.*'), workbox.strategies.cacheFirst({}), 'GET')

workbox.routing.registerRoute(new RegExp('/.*'), workbox.strategies.networkFirst({}), 'GET')
