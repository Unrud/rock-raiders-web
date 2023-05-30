# Rock Raiders Web

Rock Raiders Web is an experiment aimed at recreating Rock Raiders PC game (1999) using browser based technologies.

**Enjoy!**

<a href="https://github.com/Scarabol/rock-raiders-web/blob/dev/screenshots/2021-04-02%2001.png?raw=true">
<img src="https://github.com/Scarabol/rock-raiders-web/blob/dev/screenshots/2021-04-02%2001.png?raw=true" width="360" alt="Screenshot">
</a>
<a href="https://github.com/Scarabol/rock-raiders-web/blob/dev/screenshots/2021-04-02%2002.png?raw=true">
<img src="https://github.com/Scarabol/rock-raiders-web/blob/dev/screenshots/2021-04-02%2002.png?raw=true" width="360" alt="Screenshot">
</a>

<a href="https://github.com/Scarabol/rock-raiders-web/blob/dev/screenshots/2021-04-02%2003.png?raw=true">
<img src="https://github.com/Scarabol/rock-raiders-web/blob/dev/screenshots/2021-04-02%2003.png?raw=true" width="360" alt="Screenshot">
</a>
<a href="https://github.com/Scarabol/rock-raiders-web/blob/dev/screenshots/2021-04-02%2004.png?raw=true">
<img src="https://github.com/Scarabol/rock-raiders-web/blob/dev/screenshots/2021-04-02%2004.png?raw=true" width="360" alt="Screenshot">
</a>

<a href="https://github.com/Scarabol/rock-raiders-web/blob/dev/screenshots/2021-07-05%2001.png?raw=true">
<img src="https://github.com/Scarabol/rock-raiders-web/blob/dev/screenshots/2021-07-05%2001.png?raw=true" width="360" alt="Screenshot">
</a>
<a href="https://github.com/Scarabol/rock-raiders-web/blob/dev/screenshots/2021-07-05%2002.png?raw=true">
<img src="https://github.com/Scarabol/rock-raiders-web/blob/dev/screenshots/2021-07-05%2002.png?raw=true" width="360" alt="Screenshot">
</a>

<a href="https://github.com/Scarabol/rock-raiders-web/blob/dev/screenshots/2022-03-20%2001.png?raw=true">
<img src="https://github.com/Scarabol/rock-raiders-web/blob/dev/screenshots/2022-03-20%2001.png?raw=true" width="360" alt="Screenshot">
</a>
<a href="https://github.com/Scarabol/rock-raiders-web/blob/dev/screenshots/2022-03-20%2002.png?raw=true">
<img src="https://github.com/Scarabol/rock-raiders-web/blob/dev/screenshots/2022-03-20%2002.png?raw=true" width="360" alt="Screenshot">
</a>
<a href="https://github.com/Scarabol/rock-raiders-web/blob/dev/screenshots/2022-03-20%2003.png?raw=true">
<img src="https://github.com/Scarabol/rock-raiders-web/blob/dev/screenshots/2022-03-20%2003.png?raw=true" width="360" alt="Screenshot">
</a>
<a href="https://github.com/Scarabol/rock-raiders-web/blob/dev/screenshots/2022-03-20%2004.png?raw=true">
<img src="https://github.com/Scarabol/rock-raiders-web/blob/dev/screenshots/2022-03-20%2004.png?raw=true" width="360" alt="Screenshot">
</a>

## Development Roadmap

### v0.6.0 - Complete Base Systems

- Refactor upgrade system and make vehicles upgradeable
- Large digger and walker digger moving into wall for drilling
- Implement buildings with improved ECS and animation system
- Implement raiders with improved ECS and animation system
- Refactor job system to allow multi-carry jobs
- Raider get tired while carrying and eat at barracks
- Raider scatter on right-click move

### v0.7.0 - Rockies, Slugs And Damage

- switch all raider with weapon from work to defend
- let raider in defend mode target any known slug or rock monster
- make raider flee from nearby monsters and ticking dynamite
- add spawn timer for slugs, only one slug per hole
- make slugs look for nearby reachable buildings or fences to leech energy
- spawn a depleted energy crystal, when slug leeched energy
- wake up rock monsters, when raider are near or by big bangs
- show health bar over raider, monster and buildings, when health changes
- beam up raider or buildings when health is too low
- emerge rock monster by timer from walls
- make monster attack any nearby powered buildings
- make monster create bolder and throw at buildings
- show lightning between electric fences
- show ElectricFenceStud between electric fences and buildings
- make rock monster crumble when reaching a fence or lightning
- make rock monster pick up nearby raider and shake them upside down
- make rock monster punch vehicles passing by

### v0.8.0 - Late game features

- First-Person and shoulder camera
- Geologists and scanner
- Background music and soundtrack
- Tutorial levels and helper features
- Show mini-figure with mission briefing
- Show dependencies as tooltip for buildings/vehicles
- Add Beam-up animation sequence on successful level end
- Add screen shake for exploding dynamites
- Add Work sounds for jobs
- Show loading screen when starting a level
- Add rockfall transition when switching in main menu
- Show misc anim LavaErosionSmoke over lava
- Add water and lava animation (texture UV coords tearing)
- Change cursor to X when over disabled IconPanelButtons

### Polishing (v0.9.0)

- Fix all remaining bugs

## Known Issues

### Nice to have

- Seams do not show tear down progress while drilling
- Camera can glitch through terrain
- Add rotation speed to entities and play turnLeft, turnRight animations

### Cosmetics

- Level 11 spams console with unreachable jobs
- Two buttons in priority list can be hovered/pressed/released at the same time

## Technical Debt

- Uplift configuration parsing into loading process for type safety and error resilience
- Move three.js rendering to separate worker (blocked until [worker support for audio](https://github.com/WebAudio/web-audio-api/issues/2423) is solved, so [AudioContext](https://github.com/mrdoob/three.js/blob/master/src/audio/AudioContext.js) does not need _window_ anymore)

## Development

To start development environment, please take the following steps:

```bash
git clone https://github.com/scarabol/rock-raiders-web.git
cd rock-raiders-web
npm install
npm run dev
```

## Credits

### Related Projects

* [Rock Raiders Remake](https://github.com/rystills/rock-raiders-remake) - another web based 2D clone
* [toolstore.io](https://github.com/marcbizal/toolstore-io) - web based WAD file handling
* [RRU](https://www.rockraidersunited.com/) - Game and mods community

### Technical Stuff

* [three.js](https://github.com/mrdoob/three.js) - Web based 3D Engine
* [IDB-Keyval](https://github.com/jakearchibald/idb-keyval) - Indexed cache handling helper

### Media

* [YouTube walkthrough](https://www.youtube.com/watch?v=2jQ93-cdJeY) - Nice walkthrough with many details
