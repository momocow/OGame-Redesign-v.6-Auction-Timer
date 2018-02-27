/* globals $, localStorage, io */
/* globals nodeParams, simpleCountdown, loca */

import { LOG } from './logger'

(function () {
  // The following "if" is not really necessary but with it this script will work for Opera too
  if (document.location.href.indexOf('/game/index.php?') < 0) { return }

  // // functions
  // /**************************************/
  // const checkDependencies = function (scope, deps, cb, due) {
  //   due = due instanceof Date ? due : new Date(new Date().getTime() + MAX_DEP_TIMEOUT)

  //   const lacks = []

  //   if (lacks.length === 0) {
  //     cb(null)
  //   } else if (lacks.length > 0) {
  //     if (new Date().getTime() <= due.getTime()) { // effective
  //       setTimeout(checkDependencies.bind(undefined, cb, due), DEP_CHECK_PERIOD)
  //     } else { // expired
  //       cb(new DependencyError('socket.io', 'Initialization timeout'))
  //     }
  //   }
  // }

  // const handleAuctionPage = function () {
  //   let createTimer = function () {
  //     let oldMins = -1
  //     let first = false
  //     let overflowAuctionTimer = null
  //     let newMins, mins, secs, auctionTimer, auctionEndTime, currentTime
  //     let uni = document.location.href.replace(/^https:\/\/([^/]+).+/, '$1')
  //     function changeTimeLeft (timer, timeLeft) {
  //       if (typeof (timer) !== 'object') { return }
  //       let time = new Date()
  //       if (typeof (timer.countdown) === 'object') {
  //         timer.countdown.startTime = time.getTime()
  //         timer.countdown.startLeftoverTime = timeLeft
  //       } else if (typeof (timer.countdownObject) === 'object') {
  //         timer.countdownObject.startTime = time.getTime()
  //         timer.countdownObject.startLeftoverTime = timeLeft
  //       }
  //     }

  //     if ($('#auctionTimer').length) { return }
  //     $('p.auction_info').next().before('<span id="auctionTimer" style="font-weight: bold; color: ' + $('p.auction_info span').css('color') + ';"></span>')
  //     if ($('#div_traderAuctioneer .left_header h2').text().indexOf(loca.auctionFinished) < 0) {
  //       auctionEndTime = localStorage.getItem(uni + '_auctionEndTime')
  //       auctionEndTime = (auctionEndTime) ? parseInt(auctionEndTime) : -1
  //       currentTime = new Date().getTime()
  //       if (auctionEndTime >= currentTime) {
  //         secs = Math.round((auctionEndTime - currentTime) / 1000)
  //         oldMins = Math.ceil(secs / 60)
  //         first = false
  //       } else {
  //         oldMins = parseInt($('p.auction_info').text().match(/\d+/g)[0])
  //         secs = oldMins * 60
  //         first = true
  //       }
  //       mins = oldMins
  //       auctionTimer = new simpleCountdown($('#auctionTimer').get(0), secs, function () { $('#auctionTimer').text('') })
  //     }
  //     let mySock = new io.connect('/auctioneer', nodeParams)
  //     mySock.on('timeLeft', function (msg) {
  //       if ($('#div_traderAuctioneer .left_header h2').text().indexOf(loca.auctionFinished) >= 0) {
  //         first = true
  //         localStorage.setItem(uni + '_auctionEndTime', '-1')
  //         return
  //       }
  //       auctionEndTime = localStorage.getItem(uni + '_auctionEndTime')
  //       auctionEndTime = (auctionEndTime) ? parseInt(auctionEndTime) : -1
  //       currentTime = new Date().getTime();
  //       /<b>\D+(\d+)/.exec(msg)
  //       newMins = parseInt(RegExp.$1)
  //       if (newMins === oldMins) {
  //         mins--
  //         if (first) { first = false } else if (auctionEndTime >= 0) { localStorage.setItem(uni + '_auctionEndTime', currentTime + mins * 60 * 1000) }
  //       } else {
  //         if ((newMins > oldMins) && (auctionEndTime >= currentTime)) { newMins = Math.round((auctionEndTime - currentTime) / (1000 * 60)) }
  //         if (first) { first = false } else if (oldMins >= 0) { localStorage.setItem(uni + '_auctionEndTime', currentTime + newMins * 60 * 1000) }
  //         oldMins = newMins
  //         mins = newMins
  //       }
  //       if (mins) { changeTimeLeft(auctionTimer, mins * 60) } else { overflowAuctionTimer = new simpleCountdown($('#auctionTimer').get(0), 30, function () { $('#auctionTimer').text('') }) }
  //       setTimeout(function () {
  //         $('#auctionTimer').css('color', $('p.auction_info span').css('color'))
  //       }, 100)
  //     })
  //     mySock.on('new auction', function (msg) {
  //       /<b>\D+(\d+)/.exec(msg.info)
  //       mins = parseInt(RegExp.$1)
  //       auctionTimer = new simpleCountdown($('#auctionTimer').get(0), mins * 60, function () { $('#auctionTimer').text('') })
  //       overflowAuctionTimer = null
  //       first = true
  //       setTimeout(function () {
  //         $('#auctionTimer').css('color', $('p.auction_info span').css('color'))
  //       }, 100)
  //     })
  //     mySock.on('auction finished', function (msg) {
  //       changeTimeLeft(auctionTimer, 0)
  //       changeTimeLeft(overflowAuctionTimer, 0)
  //       first = true
  //       localStorage.setItem(uni + '_auctionEndTime', '-1')
  //     })
  //   }

  //   if (document.getElementById('div_traderAuctioneer')) {
  //     createTimer()
  //   } else {
  //     $(document).ajaxSuccess(function () {
  //       if ($('#auctionTimer').length === 0) {
  //         createTimer()
  //       }
  //     })
  //   }
  // }

  // const handleNonAuctionPage = function () {
  //   let uni = document.location.href.replace(/^https:\/\/([^/]+).+/, '$1')
  //   let auctionEndTime = localStorage.getItem(uni + '_auctionEndTime')
  //   if (auctionEndTime == null) { return }
  //   auctionEndTime = parseInt(auctionEndTime)
  //   let currentTime = new Date().getTime()
  //   if (auctionEndTime < currentTime) { return }
  //   let clock = $('#OGameClock')
  //   if (clock.length <= 0) { clock = $('.OGameClock') }
  //   if (clock.length <= 0) { return }
  //   clock.parent().append('<li id="auctionTimer" style="position: absolute; right: 125px;"></li>')
  //   let auctionTimer = new simpleCountdown($('#auctionTimer').get(0),
  //     Math.round((auctionEndTime - currentTime) / 1000),
  //     function () { $('#auctionTimer').text('') })
  // }
  // /**************************************/

  // init
  /**************************************/
  /**************************************/

  try {
    if (document.location.href.indexOf('/game/index.php?page=traderOverview') >= 0) {
      checkDependencies(window, DEP_LIST.AUCTION, handleAuctionPage)
    } else if (document.getElementById('bar')) {
      checkDependencies(window, DEP_LIST.NON_AUCTION, handleNonAuctionPage)
    }
  } catch (e) {
    LOG.
  }
})()
