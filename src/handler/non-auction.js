/* globals $ */
/* globals GM_getValue, GM_setValue */
/* globals simpleCountdown */
import { LOG } from '../logger'

const SimpleCountdown = simpleCountdown

export function handleNonAuction () {
  let uni = document.location.href.replace(/^https:\/\/([^/]+).+/, '$1')
  let auctionEndTime = GM_getValue(uni + '_auctionEndTime', -1)
  auctionEndTime = parseInt(auctionEndTime)
  let currentTime = new Date().getTime()
  let clock = $('.OGameClock')
  clock.parent().append('<li id="auctionTimer" style="padding: 0;width: 120px;position: absolute; right: 135px;"></li>')
  if (auctionEndTime < currentTime) {
    LOG.info('Invalid ending time: ' + (new Date(auctionEndTime).toLocaleString()) + ' (' + auctionEndTime + 'ms)')
    $('#auctionTimer').text('Pending...').addClass('pending')
  } else {
    LOG.info('Ending time is found in storage. Action will end at ' + (new Date(auctionEndTime).toLocaleString()))
    $('#auctionTimer').addClass('service')
    let auctionTimer = new SimpleCountdown($('#auctionTimer').get(0),
      Math.round((auctionEndTime - currentTime) / 1000),
      function () { $('#auctionTimer').text('') })
  }
}
