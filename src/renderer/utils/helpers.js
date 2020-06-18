export const Helpers = {

  capital_letter (str) {
    str = str.trim().toLowerCase()
    str = str.split(' ')
    for (var i = 0, x = str.length; i < x; i++) {
      if (str[i].length > 1) { str[i] = str[i][0].toUpperCase() + str[i].substr(1) }
    }
    return str.join(' ')
  },

  parent_dir (path) {
    var pathParts = path.split('/')
    pathParts.pop()
    pathParts = pathParts.join('/')
    var parentPath = pathParts
    if (parentPath === '') parentPath = '/'
    return parentPath
  },

  promiseTimeout (ms, promise) {
    // Create a promise that rejects in <ms> milliseconds
    var id = null
    let timeout = new Promise((resolve, reject) => {
      id = setTimeout(() => {
        clearTimeout(id)
        console.warn('TIMEOUT')
        reject(Error('Timeout'))
      }, ms)
    })

    // Returns a race between our timeout and the passed in promise
    return Promise.race([
      promise,
      timeout
    ]).then((result) => {
      clearTimeout(id)
      return result
    })
  },

  delay (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
