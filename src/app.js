const { promises: fs } = require('fs')
const path = require('path')
const http = require('http')
const {app, clipboard, shell, Menu, Tray} = require('electron')
const handler = require('serve-handler')
const notifier = require('node-notifier')
const portfinder = require('portfinder')

const iconPath = path.join(__dirname, '..', 'build/iconTemplate.png')

let serversSubMenu = []

const getLabelForServer = (pathname, port) =>
  `Stop sharing ${pathname} at port ${port}`

const getMenuItemForServer = (server, pathname, port) => ({
  pathname,
  label: getLabelForServer(pathname, port),
  type: 'normal',
  click() {
    server.close();
    removeServerFromMenu(pathname)
  }
})

const getMenu = serversSubMenu => Menu.buildFromTemplate([
  {
    label: 'Servers',
    submenu: serversSubMenu
  },
  {
    label: 'View on Github',
    type: 'normal',
    click () { shell.openExternal('https://github.com/pablopunk/serve-bar') }
  },
  {
    label: 'Quit',
    type: 'normal',
    role: 'quit'
  }
])

const serverExists = pathname => Boolean(
  serversSubMenu.find((menu) => menu.pathname === pathname))

const removeServerFromMenu = pathname => {
  if (serverExists(pathname)) {
    const index = serversSubMenu.indexOf(pathname)
    serversSubMenu.splice(index, 1)
    reloadMenu()
  }
}

const addServerToMenu = (server, pathname, port) =>
  serversSubMenu.push(getMenuItemForServer(server, pathname, port))

let tray

const reloadMenu = () => tray.setContextMenu(getMenu(serversSubMenu))

const notifyServerSuccess = pathname => {
  notifier.notify({
    title: 'On browser and clipboard!',
    message: `Now you are sharing "${path.basename(pathname)}"`,
    wait: false
  })
}

const notifyServerAlreadyExists = pathname => {
  notifier.notify({
    title: 'Duplicate server!',
    message: `You are already sharing this folder "${path.basename(pathname)}"`,
    wait: false
  })
}

const isDirectory = async pathname => (await fs.lstat(pathname)).isDirectory()

const newServerEvent = async pathname => {
  if (serverExists(pathname)) {
    notifyServerAlreadyExists(pathname)
    return
  }

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

  server.listen(openPort, () => {
    const sharedUrl = `http://localhost:${openPort}/`
    clipboard.writeText(sharedUrl)
    shell.openExternal(sharedUrl)
  })

  addServerToMenu(server, pathname, openPort)
  notifyServerSuccess(pathname)
  reloadMenu()
}

app.on('ready', _ => {
  app.dock.hide()

  tray = new Tray(iconPath)
  reloadMenu()
  tray.setToolTip(`Open ${app.getName()}`)
  tray.on('drop-files', (_, files) => {
    files.forEach(file => newServerEvent(file))
  })
})
