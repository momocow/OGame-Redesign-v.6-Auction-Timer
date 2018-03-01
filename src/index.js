import { DEP_LIST } from './config'
import { checkDependencies } from './dependency'
import { handleAuction } from './handler/auction'
import { handleNonAuction } from './handler/non-auction'
import { LOG } from './logger'

(function () {
  // The following "if" is not really necessary but with it this script will work for Opera too
  if (document.location.href.indexOf('/game/index.php?') < 0) { return }

  try {
    if (document.location.href.indexOf('/game/index.php?page=traderOverview') >= 0) {
      checkDependencies(window, DEP_LIST.AUCTION, handleAuction)
    } else if (document.getElementById('bar')) {
      checkDependencies(window, DEP_LIST.NON_AUCTION, handleNonAuction)
    }
  } catch (e) {
    LOG.error(e)
  }
})()
