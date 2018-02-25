module.exports = {
  MAX_LOG_ENTRIES: 100,
  MAX_DEP_TIMEOUT: 30000, // ms
  DEP_CHECK_PERIOD: 500, // ms
  DEP_LIST: {
    AUCTION: [
      'io',
      '$',
      'localStorage',
      'nodeParams',
      'simpleCountdown',
      'loca'
    ],
    NON_AUCTION: [
      '$',
      'localStorage',
      'simpleCountdown'
    ]
  }
}
