
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "redirectTo": "/login",
    "route": "/"
  },
  {
    "renderMode": 2,
    "route": "/login"
  },
  {
    "renderMode": 2,
    "route": "/home"
  },
  {
    "renderMode": 2,
    "redirectTo": "/login",
    "route": "/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 638, hash: '4256bce1d6cbcbae8c16ccd1c7b0cf4c7b3c477c11d834b2eaa0cfadbebdc78d', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1011, hash: '2a0ee448a768132d1a4cf14e9435ae59c2874398d95154b70c93d444700f9300', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'login/index.html': {size: 5351, hash: '92afeedc542ff950e5a1706ea0bbb0f821c388cc325a389507364c717a3b29da', text: () => import('./assets-chunks/login_index_html.mjs').then(m => m.default)},
    'home/index.html': {size: 11828, hash: 'edbd0e34341abf95877e19bacfc4be039e7c726bcd992e15e9ab6aec1b4d9c6e', text: () => import('./assets-chunks/home_index_html.mjs').then(m => m.default)},
    'styles-TAZMSP2Z.css': {size: 15, hash: 'sJ5RzYgp5+o', text: () => import('./assets-chunks/styles-TAZMSP2Z_css.mjs').then(m => m.default)}
  },
};
