# videojs-ga-videocloud

Google Analytics plugin for the next generation Brightcove player. Forked from the video.js plugin [videojs.ga](https://github.com/mickey/videojs-ga).

Main changes:

- The video ID and name are read from the player and tracked as the event label
- If the player is in an iframe embed or loaded directly on `(preview-)players.brightcove.net` *and* a tracker is set in the plugin options, the Google universal analytics script will be loaded by the plugin. If the in page embed is used Google Analytics must be separately loaded on the page before the player, as with the original videojs-ga.
- Event names tracked are those used by the Smart Player plugins, where applicable. Event names can be customised / localised with plugin options.

## Getting Started
Download the plugin.

Add the URL to the plugin to the player configuration. Add a JSON setting with the name `ga`.

If you want this to work in the in-page embed, this is enough, but you must ensure that Google Analytics is loaded on the page **before** the player.

If you want this to work in the iframe embed or direct player link, you need to add the tracker to the plugin configuration:

```json
{
    "tracker": "UA-1234567-8"
}
```

## Options

Provide options to the plugin in the player configuraiton using `ga` as the name.

```json
{
  "tracker": "UA-1234567-8",
  "eventNames": {
    "play": "Wiedergabe"
  }
}
```

The following options are supported:

####tracker

If set, this tracker code will be used for iframe embeds and the direct player URL. This is not used for in-page embeds

**default:** Not set

####eventNames

Override or localise the names of the event actions.

**default:**
```
{
  "video_load": "Video Load",
  "percent_played": "Percent played",
  "start": "Media Begin",
  "seek_start": "Seek start",
  "seek_end": "Seek end",
  "play": "Media Play",
  "pause": "Media Pause",
  "error": "Error",
  "fullscreen_exit": "Fullscreen Entered",
  "fullscreen_exit": "Fullscreen Exited",
  "resize": "Resize",
  "volume_change": "Volume Change",
  "player_load": "Player Load",
  "end": "Media Complete"
}```

####eventCategory

This is the ```category``` sent to GA. If you don't know what it is please check [GA's doc](https://developers.google.com/analytics/devguides/collection/gajs/eventTrackerGuide)

**default:** ```'Brightcove Player'```

####eventLabel

This is the ```label``` sent to GA. If you don't know what it is please check [GA's doc](https://developers.google.com/analytics/devguides/collection/gajs/eventTrackerGuide)

**default:** `VIDEO_ID | VIDEO_NAME`. If these are unavailable then basename of the video path, so if the path is ```http://s3.amazonaws.com/pouet.mp4``` the label would be ```pouet```

####eventsToTrack

The events you want to track.

**default:**
```[ 'player_load', 'video_load', 'percent_played', 'start', 'end', 'seek', 'play', 'pause', 'resize', 'volume_change', 'error', 'fullscreen']```

* `player_load` Player has loaded.
* `video_load` Video has loaded. Will fire again when a new video is loaded.
* `percent_played` Every *x*% of the video, with the percentage as a value, where *x* is defined by `percentsPlayedInterval`. Default is 10.
* `start` Playback has started. Once per video load.
* `end` Playback has completed. Once per video load.

####percentsPlayedInterval

This options goes with the ```percents_played``` event. Every ```percentsPlayedInterval``` percents an event will be sent to GA.

**default:** 10

#### ga.js and analytics.js

If the in-page embed is used, this plugin supports the ga.js and the newer analytics.js Google Analytics libraries. It autodetects the library you use.

If the iframe embed or direct player URL is used, and a tracker is provided, the "universal" analytics.js is loaded.

## TODO

- [x] Support media change - "video_load" event
- [ ] Support ad events
