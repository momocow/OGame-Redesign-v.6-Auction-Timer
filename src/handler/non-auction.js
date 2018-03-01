/* globals $, localStorage */
/* globals simpleCountdown */
const SimpleCountdown = simpleCountdown

export function handleNonAuction () {
  let uni = document.location.href.replace(/^https:\/\/([^/]+).+/, '$1')
  let auctionEndTime = localStorage.getItem(uni + '_auctionEndTime')
  if (auctionEndTime == null) { return }
  auctionEndTime = parseInt(auctionEndTime)
  let currentTime = new Date().getTime()
  if (auctionEndTime < currentTime) { return }
  let clock = $('#OGameClock')
  if (clock.length <= 0) { clock = $('.OGameClock') }
  if (clock.length <= 0) { return }
  clock.parent().append('<li id="auctionTimer" style="position: absolute; right: 125px;"></li>')
  let auctionTimer = new SimpleCountdown($('#auctionTimer').get(0),
    Math.round((auctionEndTime - currentTime) / 1000),
    function () { $('#auctionTimer').text('') })
}
