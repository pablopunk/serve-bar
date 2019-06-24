const { promises: fs } = require('fs')
const http = require('http')
const os = require('os')
const path = require('path')
const portfinder = require('portfinder')
const handler = require('serve-handler')
const { clipboard, shell } = require('electron')
const { reloadMenu, addServerToMenu, serverExistsInMenu } = require('./menu')
const {
  notifyServerSuccess,
  notifyServerAlreadyExists
} = require('./notifications')
const settings = require('./settings')

const IP = getNetworkIp()

function getNetworkIp() {
  const ifaces = os.networkInterfaces()
  let ip = 'localhost'

  for (let i in ifaces) {
    const externalIpv4s = ifaces[i].filter(
      _ => !_.internal && _.family === 'IPv4'
    )
    if (externalIpv4s.length > 0) {
      ip = externalIpv4s[0].address
      break
    }
  }

  return ip
}

const isDirectory = async pathname => (await fs.lstat(pathname)).isDirectory()

async function createServer(pathname, whenReady) {
  let server

  if (await isDirectory(pathname)) {
    server = http.createServer((req, res) =>
      handler(req, res, {
        public: pathname
      })
    )
  } else {
    const fileName = path.basename(pathname)
    server = http.createServer((req, res) =>
      handler(req, res, {
        public: path.dirname(pathname),
        rewrites: [{ source: '*', destination: `/${fileName}` }]
      })
    )
  }

  const openPort = await portfinder.getPortPromise()

  server.listen(openPort, whenReady.bind(server, server, IP, openPort))
}

module.exports.newServerEvent = (pathname, callback) => {
  if (serverExistsInMenu(pathname)) {
    notifyServerAlreadyExists(pathname)
    return
  }

  createServer(pathname, (server, ip, port) => {
    const sharedUrl = `http://${ip}:${port}/`
    if (settings.get('copyToClipboard')) {
      clipboard.writeText(sharedUrl)
    }
    if (settings.get('openInBrowser')) {
      shell.openExternal(sharedUrl)
    }
    addServerToMenu(server, pathname, port)
    notifyServerSuccess(pathname)
    reloadMenu()
  })
}
