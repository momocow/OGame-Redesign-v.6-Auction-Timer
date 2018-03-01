export const MAX_LOG_ENTRIES = 100
export const MAX_DEP_TIMEOUT = 30000 // ms
export const DEP_CHECK_PERIOD = 500 // ms
export const DEP_LIST = {
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
