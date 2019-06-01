const settings = {
  openInBrowser: true,
  copyToClipboard: true
}

module.exports.set = function (setting, value) {
  if (settings.hasOwnProperty(setting)) {
    settings[setting] = value
  }
}

module.exports.get = function (setting) {
  return settings[setting]
}
