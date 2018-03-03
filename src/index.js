import { DEP_LIST } from './config'
import { checkDependencies } from './dependency'
import { handleAuction } from './handler/auction'
import { handleNonAuction } from './handler/non-auction'
import { LOG } from './logger'

(function () {
  // The following "if" is not really necessary but with it this script will work for Opera too
  if (document.location.href.indexOf('/game/index.php?') < 0) { return }

  try {
    let handle = function (cb, err) {
      if (err) {
        LOG.error('Failed to pass dependency check.')
        LOG.error(err)
        return
      }

      LOG.info('Dependency check passed')
      cb()
    }
    let deps

    if (document.location.href.indexOf('/game/index.php?page=traderOverview') >= 0) {
      LOG.debug('This is traderOverview page')
      deps = DEP_LIST.AUCTION
      handle = handle.bind(null, handleAuction)
    } else if (document.getElementById('bar')) {
      LOG.debug('This is not traderOverview page')
      deps = DEP_LIST.NON_AUCTION
      handle = handle.bind(null, handleNonAuction)
    }

    LOG.info('Start dependency check')
    checkDependencies(unsafeWindow, deps, handle)
  } catch (e) {
    LOG.error('Error is caught in the entry.')
    LOG.error(e)
  }
})()
