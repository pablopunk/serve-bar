const path = require('path')
const notifier = require('node-notifier')

module.exports.notifyServerSuccess = pathname => {
  notifier.notify({
    title: 'Shared successfully!',
    message: `Now you are sharing "${path.basename(pathname)}"`,
    wait: false,
    icon: path.join(__dirname, '..', 'assets', 'icon.png')
  })
}

module.exports.notifyServerAlreadyExists = pathname => {
  notifier.notify({
    title: 'Duplicate server!',
    message: `You are already sharing this folder "${path.basename(pathname)}"`,
    wait: false,
    icon: path.join(__dirname, '..', 'assets', 'icon.png')
  })
}
