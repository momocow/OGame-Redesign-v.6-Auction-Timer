/* global GM_addStyle */

GM_addStyle(`
  #auctionTimer {
    display: inline-block;
    width: 100%;
    text-align: center;
    background-color: initial;
    transition: background-color 0.5s;
    padding-top: 5px;
    padding-bottom: 5px;
  }

  #auctionTimer.service {
    background-color: #1d5a1d;
  }

  #auctionTimer.pending {
    background-color: #922929;
  }
`)
