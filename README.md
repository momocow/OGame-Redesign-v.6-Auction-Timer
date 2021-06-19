> This project is in maintenance mode, which means bug fixes only, no new feature will be added.

# OGame Redesign (v7): Auction Timer

## Changelog
- v3.0.3
    - [FIXED] Socket.io connection port changed.
- v3.0.2
    - [FIXED] Migrate to OGame v7. [(#10)](https://github.com/momocow/OGame-Redesign-v.6-Auction-Timer/issues/10)
- v3.0.0
    - [ADDED] Dependency check [(#3)](https://github.com/momocow/OGame-Redesign-v.6-Auction-Timer/issues/3)
    - [ADDED] Stateful timer [(#4)](https://github.com/momocow/OGame-Redesign-v.6-Auction-Timer/issues/4)
    - [ADDED] Ingame logger panel [(#6)](https://github.com/momocow/OGame-Redesign-v.6-Auction-Timer/issues/6)
    - [CHANGED] Deprecate `localStorage`, use the storage provide by the script engine, e.g. TamperMonkey, through `GM_setValue`/`GM_getValue` instead
- v2.1.2
    - [ADDED] Introduce update flow into the script meta block. [(db80143)](https://github.com/momocow/OGame-Redesign-v.6-Auction-Timer/commit/db801437f5e9366805182405a41100aeac30e88b)
- v2.1.1
    - [FIXED] protocol changed from `http` to `https`. [(05ce6de)](https://github.com/momocow/OGame-Redesign-v.6-Auction-Timer/commit/05ce6de73e77654c2b716d6667da9b516acef864)

## Installation Guide
There are different ways to install userscripts. Here is the [official installation guide](http://tampermonkey.net/faq.php#Q102) from Tampermonkey.

### Update existing script
Take a look [here](http://tampermonkey.net/faq.php#Q101) in the official Q&A of TamperMonkey. You can always force an update check through the update button in the context menu.

For users under v3.0.0 where the update pipeline is not clear. Please do a clean install first, i.e. remove the old one and then follow the following steps.

### Clean install (Recommended)
1. [**[Click me]**](https://raw.githubusercontent.com/momocow/OGame-Redesign-v.6-Auction-Timer/master/dist/auction-timer.user.js) and the Tampermonkey will show up asking if you want to install the script.
2. If Tampermonkey does not show up
    - open Tampermonkey's dashboard
    - go to the **utils** tab
    - paste [the following link](#the-distributable-is-here) to import from the **URL**.

## For Developers

### Setup
- Clone the repository using  
`git clone https://github.com/momocow/OGame-Redesign-v.6-Auction-Timer.git`
- Switch to the branch you want to modify with.  
`git checkout -b <branch_name> origin/<branch_name>`
- Install all dependencies.  
`npm install`

### Build
- To generate distributable userscripts, use `npm run dist`.

### Gulp tasks
If you are familiar with `gulp`, the project is using `gulp@4.0.0` to manage all tasks. Try `gulp --tasks` to view all tasks dependency graph.

#### Task list
- `init`
- `clean`
- `meta`
- `rollup`
- `babel`
- `build`
- `dist` build all userscripts
- `dist:prod` build product version of userscripts only
- `dist:dev` build development version of userscripts only
- `build:clean` clean up `build/` folder
- `default` (`dist`)
