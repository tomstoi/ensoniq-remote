export const FileSystem = {
  ls (path) {
    require('fs').readdirSync(path)
  },
  rm (path) {
    require('fs').unlinkSync(path)
  },
  chmod (path, mode) {
    require('fs').chmodSync(path, mode)
  },
  exists (path) {
    try {
      const fs = require('fs')
      fs.accessSync(path, fs.constants.F_OK)
      console.log('file exists')
      return true
    } catch (err) {
      console.error(path + ' - file not found!')
      return false
    }
  },
  isDirectory (path) {
    return require('fs').lstatSync(path).isDirectory()
  },
  hasAccess (path) {
    try {
      const fs = require('fs')
      fs.accessSync(path, fs.constants.R_OK | fs.constants.W_OK)
      return true
    } catch (err) {
      console.error('no access to ' + path)
      return false
    }
  },
  isExecutable (path) {
    try {
      const fs = require('fs')
      fs.accessSync(path, fs.constants.X_OK)
      return true
    } catch (err) {
      console.error('no execute rights to ' + path)
      return false
    }
  },
  sudo (cmd) {
    // Mac (Catalina) cannot use sudo-prompt so need to get the access through terminal
    if (require('os').platform() === 'darwin') {
      const run = `osascript -e 'tell application "Terminal" to do script "sudo ${cmd} ; exit"'`
      require('child_process').exec(run, (error) => {
        if (error) throw error
      })
      return
    }

    const sudo = require('sudo-prompt')
    const options = {
      name: 'Ensoniq Remote'
    }
    sudo.exec(cmd, options,
      function (error, stdout, stderr) {
        if (error) throw error
        console.log('stdout: ' + stdout)
      }
    )
  }
}
