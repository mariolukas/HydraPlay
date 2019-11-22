'use strict'

module.exports = function hideVirtualKeyboard () {
  if (
    document.activeElement &&
    document.activeElement.blur &&
    typeof document.activeElement.blur === 'function'
  ) {
    document.activeElement.blur()
  }
}
