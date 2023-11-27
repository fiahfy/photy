const imageExtensions = require('image-extensions')

module.exports = {
  appId: 'net.fiahfy.photy',
  asar: true,
  directories: {
    output: 'dist-package',
  },
  files: ['dist', 'dist-electron'],
  // @see https://github.com/electron-userland/electron-builder/issues/3204
  fileAssociations: [
    ...imageExtensions.map((ext) => ({
      ext,
    })),
  ],
}
