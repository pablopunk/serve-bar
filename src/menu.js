const { Tray, Menu, shell } = require('electron')
const settings = require('./settings')

let serversSubMenu = []

const stripHomeFolder = pathname => pathname.replace(/\/Users\/[^/]+/, '~')
const getLabelForServer = (pathname, port) =>
  `Stop sharing ${stripHomeFolder(pathname)} at port ${port}`
const getMenuItemForServer = (server, pathname, port) => ({
  pathname,
  label: getLabelForServer(pathname, port),
  type: 'normal',
  click() {
    server.close()
    removeServerFromMenu(pathname)
  }
})
const getMenu = serversSubMenu =>
  Menu.buildFromTemplate([
    {
      label: 'Servers',
      submenu: serversSubMenu
    },
    {
      label: 'Open in browser',
      type: 'checkbox',
      checked: settings.get('openInBrowser'),
      click() {
        settings.set('openInBrowser', !settings.get('openInBrowser'))
      }
    },
    {
      label: 'Copy to clipboard',
      type: 'checkbox',
      checked: settings.get('copyToClipboard'),
      click() {
        settings.set('copyToClipboard', !settings.get('copyToClipboard'))
      }
    },
    {
      label: 'View on Github',
      type: 'normal',
      click() {
        shell.openExternal('https://github.com/pablopunk/serve-bar')
      }
    },
    {
      label: 'Quit',
      type: 'normal',
      role: 'quit'
    }
  ])

module.exports.serverExistsInMenu = pathname =>
  Boolean(serversSubMenu.find(menu => menu.pathname === pathname))

const removeServerFromMenu = pathname => {
  if (module.exports.serverExistsInMenu(pathname)) {
    const index = serversSubMenu.indexOf(pathname)
    serversSubMenu.splice(index, 1)
    module.exports.reloadMenu()
  }
}

module.exports.addServerToMenu = (server, pathname, port) =>
  serversSubMenu.push(getMenuItemForServer(server, pathname, port))

let tray

module.exports.createTray = iconPath => {
  tray = new Tray(iconPath)
  module.exports.reloadMenu()

  return tray
}

module.exports.reloadMenu = () => tray.setContextMenu(getMenu(serversSubMenu))
