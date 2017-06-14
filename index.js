const fs = require('fs')
const path = require('path')
const {app, shell, Menu, Tray} = require('electron')
// TODO: Import clipboard from electron to parse the output of serve
const serve = require('serve')
const notifier = require('node-notifier')

const iconPath = path.join(__dirname, 'assets/iconTemplate.png')

let serversSubmenu = []

const getMenuItemForServer = (server, path) => {
  return {
    label: `Stop sharing ${path}`,
    type: 'normal',
    click () { server.stop(); removeServerFromMenu(path) }
  }
}

const getMenu = serversSubmenu => {
  return Menu.buildFromTemplate([
    {
      label: 'Servers',
      submenu: serversSubmenu
    },
    {
      label: 'View on github',
      type: 'normal',
      click () { shell.openExternal('https://github.com/pablopunk/serve-bar') }
    },
    {
      label: 'Quit',
      type: 'normal',
      role: 'quit'
    }
  ])
}

const indexOfServer = pathname => serversSubmenu.findIndex(a => a.label === `Stop sharing ${pathname}`)

const serverExists = pathname => indexOfServer(pathname) > -1

const removeServerFromMenu = pathname => {
  const index = indexOfServer(pathname)
  if (index > -1) {
    serversSubmenu.splice(index, 1)
    reloadMenu()
  }
}

const addServerToMenu = (server, pathname) => {
  serversSubmenu.push(getMenuItemForServer(server, pathname))
}

let tray
const reloadMenu = () => {
  tray.setContextMenu(getMenu(serversSubmenu))
}

const getLastPath = pathname => path.basename(pathname)

const notifyServerSuccess = pathname => {
  notifier.notify({
    title: 'URL copied to clipboard!',
    message: `Now you are sharing "${getLastPath(pathname)}"`,
    timeout: 5
  })
}

const notifyServerAlreadyExists = pathname => {
  notifier.notify({
    title: 'Duplicate server!',
    message: `You are already sharing this folder "${getLastPath(pathname)}"`,
    timeout: 5
  })
}

const newServerEvent = (pathname) => {
  if (serverExists(pathname)) {
    notifyServerAlreadyExists(pathname)
    return
  }
  addServerToMenu(serve(pathname, {silent: true}), pathname)
  notifyServerSuccess(pathname)
  reloadMenu()
}

const isDirectory = pathname => fs.lstatSync(pathname).isDirectory()

app.on('ready', () => {
  app.dock.hide()

  tray = new Tray(iconPath)
  reloadMenu()
  tray.setToolTip(`Open ${app.getName()}`)
  tray.on('drop-files', (evt, files) => {
    files.filter(file => {
      if (isDirectory(file)) {
        newServerEvent(file)
      } else {
        newServerEvent(path.dirname(file))
      }
    })
  })
})
