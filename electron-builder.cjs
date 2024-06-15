module.exports = (async () => {
  const imageExtensions = (
    await import('image-extensions', { assert: { type: 'json' } })
  ).default

  return {
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
})()
