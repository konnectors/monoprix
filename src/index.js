const { BaseKonnector, requestFactory, log } = require('cozy-konnector-libs')
const request = requestFactory({
  cheerio: true,
  //json: false,
  //  debug: true,
  jar: true
})

const baseUrl = 'https://www.monoprix.fr/'
const loginUrl = baseUrl + 'jsp/account/loginPage.jsp'
const ordersUrl = baseUrl + '/jsp/account/accountOrders.jsp'

module.exports = new BaseKonnector(start)

// This version is working from a 'home' IP but everything is blocked from OVH Ip
async function start(fields) {
  log('info', 'Starting')
  await authenticate(fields.login, fields.password)
  log('info', 'Fetching orders')
  const $ = await request(ordersUrl)
  const table = $('tr', 'table[class="table commandes-related"]')

  if (table.length <= 5) {
    throw new Error('LOGIN_FAILED')
  }
}

async function authenticate(username, password) {
  // Prefetching form and cookie jar
  const $ = await request({
    url: baseUrl,
    gzip: true,
    headers: {
      'Accept-language': 'fr'
    }
  })
  // All occurency of this token are the same in html
  const dynSessConf = $('input[name="_dynSessConf"]').val()
  log('info', 'Token _dynSessConf ' + dynSessConf)
  await request({
    url: loginUrl,
    method: 'POST',
    gzip: true,
    headers: {
      'Accept-language': 'fr'
    },
    form: {
      // Minimalized
      _dynSessConf: dynSessConf,
      '/atg/userprofiling/ProfileFormHandler.value.login': username,
      '_D:/atg/userprofiling/ProfileFormHandler.value.login': '',
      '/atg/userprofiling/ProfileFormHandler.value.password': password,
      '_D:/atg/userprofiling/ProfileFormHandler.value.password': '',
      '/atg/userprofiling/ProfileFormHandler.login': 'valider',
      '_D:/atg/userprofiling/ProfileFormHandler.login': '',
      _DARGS: '/jsp/account/loginPage.jsp.loginForm'
    }
  })
}
