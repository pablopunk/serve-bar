const path = require('path')
const { app } = require('electron')
const { createTray } = require('./menu')
const { newServerEvent } = require('./server')
const iconPath = path.join(__dirname, '..', 'assets/iconTemplate.png')

app.on('ready', _ => {
  app.dock.hide()
  const tray = createTray(iconPath)
  tray.setToolTip(`Open ${app.getName()}`)
  tray.on('drop-files', (_, files) => {
    files.forEach(newServerEvent)
  })
})
