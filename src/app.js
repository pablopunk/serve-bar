const path = require('path')
const {app, clipboard, shell, Menu, Tray} = require('electron')
const notifier = require('node-notifier')
const {createServer} = require('./server')

const iconPath = path.join(__dirname, '..', 'assets/iconTemplate.png')

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

const serverExistsInMenu = pathname => Boolean(
  serversSubMenu.find((menu) => menu.pathname === pathname))

const removeServerFromMenu = pathname => {
  if (serverExistsInMenu(pathname)) {
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
    wait: false,
    icon: path.join(__dirname, '..', 'assets', 'icon.png')
  })
}

const notifyServerAlreadyExists = pathname => {
  notifier.notify({
    title: 'Duplicate server!',
    message: `You are already sharing this folder "${path.basename(pathname)}"`,
    wait: false,
    icon: path.join(__dirname, '..', 'assets', 'icon.png')
  })
}


const newServerEvent = pathname => {
  if (serverExistsInMenu(pathname)) {
    notifyServerAlreadyExists(pathname)
    return
  }

  createServer(pathname, (server, ip, port) => {
    const sharedUrl = `http://${ip}:${port}/`
    clipboard.writeText(sharedUrl)
    shell.openExternal(sharedUrl)
    addServerToMenu(server, pathname, port)
    notifyServerSuccess(pathname)
    reloadMenu()
  })
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
