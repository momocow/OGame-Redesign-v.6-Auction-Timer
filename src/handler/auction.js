/* globals $, io */
/* globals GM_getValue, GM_setValue */
/* globals nodePort, nodeParams, simpleCountdown, loca */

import { SafeFunction } from '../../util/function'
import { LOG } from '../logger'

const SimpleCountdown = simpleCountdown

function changeTimeLeft (timer, timeLeft) {
  if (typeof (timer) !== 'object') { return }
  let time = new Date()
  if (typeof (timer.countdown) === 'object') {
    timer.countdown.startTime = time.getTime()
    timer.countdown.startLeftoverTime = timeLeft
  } else if (typeof (timer.countdownObject) === 'object') {
    timer.countdownObject.startTime = time.getTime()
    timer.countdownObject.startLeftoverTime = timeLeft
  }
}

export function handleAuction () {
  let createTimer = function () {
    let oldMins = -1
    let first = false
    let overflowAuctionTimer = null
    let newMins, mins, secs, auctionTimer, auctionEndTime, currentTime
    let uni = document.location.href.replace(/^https:\/\/([^/]+).+/, '$1')

    if ($('#auctionTimer').length > 0) { return }
    $('p.auction_info').next().before('<span id="auctionTimer" style="font-weight: bold; color: ' + $('p.auction_info span').css('color') + ';"></span>')
    if ($('#div_traderAuctioneer .left_header h2').text().indexOf(loca.auctionFinished) < 0) {
      auctionEndTime = GM_getValue(uni + '_auctionEndTime', -1)
      currentTime = new Date().getTime()
      if (auctionEndTime >= currentTime) {
        secs = Math.round((auctionEndTime - currentTime) / 1000)
        oldMins = Math.ceil(secs / 60)
        first = false
        LOG.info('Ending time is found in storage. Action will end at ' + (new Date(auctionEndTime).toLocaleString()))
        document.getElementById('auctionTimer').classList.add('service')
      } else {
        let matched = $('p.auction_info').text().match(/\d+/g)
        if (!matched) return

        oldMins = parseInt(matched[0])
        secs = oldMins * 60
        first = true
      }
      mins = oldMins
      auctionTimer = new SimpleCountdown($('#auctionTimer').get(0), secs, function () { $('#auctionTimer').text('') })
    }

    let mySock = io.connect(':' + nodePort + '/auctioneer', nodeParams)
    let onConnect = new SafeFunction(function () {
      mySock.on('timeLeft', function (msg) {
        if ($('#div_traderAuctioneer .left_header h2').text().indexOf(loca.auctionFinished) >= 0) {
          first = true
          GM_setValue(uni + '_auctionEndTime', '-1')
          LOG.info('Auction ends')
          document.getElementById('auctionTimer').classList.remove('service')
          return
        }
        auctionEndTime = GM_getValue(uni + '_auctionEndTime', -1)
        currentTime = new Date().getTime()
        newMins = parseInt(/<b>\D+(\d+)/.exec(msg)[1])
        if (newMins === oldMins) {
          mins--
          if (first) {
            first = false
          } else if (auctionEndTime >= 0) {
            GM_setValue(uni + '_auctionEndTime', currentTime + mins * 60 * 1000)
            LOG.info('Auction ending time is locked')
            document.getElementById('auctionTimer').classList.add('service')
          }
        } else {
          if ((newMins > oldMins) && (auctionEndTime >= currentTime)) { newMins = Math.round((auctionEndTime - currentTime) / (1000 * 60)) }
          if (first) {
            first = false
          } else if (oldMins >= 0) {
            GM_setValue(uni + '_auctionEndTime', currentTime + newMins * 60 * 1000)
            LOG.info('Auction ending time is locked')
            document.getElementById('auctionTimer').classList.add('service')
          }
          oldMins = newMins
          mins = newMins
        }
        if (mins) { changeTimeLeft(auctionTimer, mins * 60) } else { overflowAuctionTimer = new SimpleCountdown($('#auctionTimer').get(0), 30, function () { $('#auctionTimer').text('') }) }
        setTimeout(function () {
          $('#auctionTimer').css('color', $('p.auction_info span').css('color'))
        }, 100)
      })
      mySock.on('new auction', function (msg) {
        /<b>\D+(\d+)/.exec(msg.info)
        mins = parseInt(RegExp.$1)
        auctionTimer = new SimpleCountdown($('#auctionTimer').get(0), mins * 60, function () { $('#auctionTimer').text('') })
        overflowAuctionTimer = null
        first = true
        LOG.info('Auction starts')
        setTimeout(function () {
          $('#auctionTimer').css('color', $('p.auction_info span').css('color'))
        }, 100)
      })
      mySock.on('auction finished', function (msg) {
        changeTimeLeft(auctionTimer, 0)
        changeTimeLeft(overflowAuctionTimer, 0)
        first = true
        GM_setValue(uni + '_auctionEndTime', '-1')
        LOG.info('Auction ends')
        document.getElementById('auctionTimer').classList.remove('service')
      })
    })

    onConnect.on('error', err => {
      LOG.error('Error occurs in #onConnect()')
      LOG.error(err)
    })

    mySock.on('connect', onConnect)
      .on('connect_error', (err) => {
        LOG.error('Connect error.')
        LOG.error(err)
      })
  }

  if (document.getElementById('div_traderAuctioneer')) {
    createTimer()
  } else {
    $(document).ajaxSuccess(function () {
      if ($('#auctionTimer').length === 0) {
        createTimer()
      }
    })
  }
}
