const { promises: fs } = require('fs')
const http = require('http')
const os = require('os')
const path = require('path')
const portfinder = require('portfinder')
const handler = require('serve-handler')

const IP = getNetworkIp()

function getNetworkIp () {
  const ifaces = os.networkInterfaces()
  let ip = 'localhost'

  for (let i in ifaces) {
    const externalIpv4s = ifaces[i].filter(_ => !_.internal && _.family === 'IPv4')
    if (externalIpv4s.length > 0) {
      ip = externalIpv4s[0].address
      break
    }
  }

  return ip
}

const isDirectory = async pathname => (await fs.lstat(pathname)).isDirectory()

module.exports.createServer = async function (pathname, whenReady) {
  let server

  if (await isDirectory(pathname)) {
    server = http.createServer((req, res) => handler(req, res, {
      public: pathname
    }))
  } else {
    const fileName = path.basename(pathname)
    server = http.createServer((req, res) => handler(req, res, {
      public: path.dirname(pathname),
      rewrites: [
        { source: '*', destination: `/${fileName}` }
      ]
    }))
  }

  const openPort = await portfinder.getPortPromise()

  server.listen(openPort, whenReady.bind(server, server, IP, openPort))
}
