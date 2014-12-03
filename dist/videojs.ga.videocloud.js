/*
* videojs-ga - v0.4.1 - 2014-12-03
* Copyright (c) 2014 Michael Bensoussan
* Licensed MIT
*/
(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  videojs.plugin('ga', function(options) {
    var adStateRegex, dataSetupOptions, defaultLabel, defaultsEventsToTrack, end, endTracked, error, eventCategory, eventLabel, eventNames, eventsToTrack, fullscreen, getEventName, href, iframe, isInAdState, loaded, parsedOptions, pause, percentsAlreadyTracked, percentsPlayedInterval, play, player, resize, seekEnd, seekStart, seeking, sendbeacon, start, startTracked, timeupdate, tracker, volumeChange,
      _this = this;
    if (options == null) {
      options = {};
    }
    console.log(7);
    player = this;
    dataSetupOptions = {};
    if (this.options()["data-setup"]) {
      parsedOptions = JSON.parse(this.options()["data-setup"]);
      if (parsedOptions.ga) {
        dataSetupOptions = parsedOptions.ga;
      }
    }
    defaultsEventsToTrack = ['playerLoad', 'loaded', 'percentsPlayed', 'start', 'end', 'seek', 'play', 'pause', 'resize', 'volumeChange', 'error', 'fullscreen'];
    eventsToTrack = options.eventsToTrack || dataSetupOptions.eventsToTrack || defaultsEventsToTrack;
    percentsPlayedInterval = options.percentsPlayedInterval || dataSetupOptions.percentsPlayedInterval || 10;
    eventCategory = options.eventCategory || dataSetupOptions.eventCategory || 'Brightcove Player';
    defaultLabel = options.eventLabel || dataSetupOptions.eventLabel;
    percentsAlreadyTracked = [];
    startTracked = false;
    endTracked = false;
    seekStart = seekEnd = 0;
    seeking = false;
    eventLabel = '';
    eventNames = {
      "loadedmetadata": "Video Load",
      "percent played": "Percent played",
      "start": "Media Begin",
      "seek start": "Seek start",
      "seek end": "Seek end",
      "play": "Media Play",
      "pause": "Media Pause",
      "error": "Error",
      "exit fullscreen": "Fullscreen Exited",
      "enter fullscreen": "Fullscreen Entered",
      "resize": "Resize",
      "volume change": "Volume Change",
      "player load": "Player Load",
      "end": "Media Complete"
    };
    getEventName = function(name) {
      if (options.eventNames && options.eventNames[name]) {
        return options.eventNames[name];
      }
      if (dataSetupOptions.eventNames && dataSetupOptions.eventNames[name]) {
        return dataSetupOptions.eventNames[name];
      }
      if (eventNames[name]) {
        return eventNames[name];
      }
      return name;
    };
    if (window.location.host === 'players.brightcove.net' || window.location.host === 'preview-players.brightcove.net') {
      tracker = options.tracker || dataSetupOptions.tracker;
      if (tracker) {
        (function(i, s, o, g, r, a, m) {
          i["GoogleAnalyticsObject"] = r;
          i[r] = i[r] || function() {
            return (i[r].q = i[r].q || []).push(arguments);
          };
          i[r].l = 1 * new Date();
          a = s.createElement(o);
          m = s.getElementsByTagName(o)[0];
          a.async = 1;
          a.src = g;
          return m.parentNode.insertBefore(a, m);
        })(window, document, "script", "//www.google-analytics.com/analytics.js", "ga");
        ga('create', tracker, 'auto');
        ga('require', 'displayfeatures');
      }
    }
    adStateRegex = /(\s|^)vjs-ad-(playing|loading)(\s|$)/;
    isInAdState = function(player) {
      return adStateRegex.test(player.el().className);
    };
    loaded = function() {
      if (!isInAdState(player)) {
        if (defaultLabel) {
          eventLabel = defaultLabel;
        } else {
          if (player.mediainfo) {
            eventLabel = player.mediainfo.id + ' | ' + player.mediainfo.name;
          } else {
            eventLabel = this.currentSrc().split("/").slice(-1)[0].replace(/\.(\w{3,4})(\?.*)?$/i, '');
          }
        }
        if (__indexOf.call(eventsToTrack, "loadedmetadata") >= 0) {
          sendbeacon(getEventName('loadedmetadata'), true);
        }
      }
    };
    timeupdate = function() {
      var currentTime, duration, percent, percentPlayed, _i;
      if (!isInAdState(player)) {
        currentTime = Math.round(this.currentTime());
        duration = Math.round(this.duration());
        percentPlayed = Math.round(currentTime / duration * 100);
        for (percent = _i = 0; _i <= 99; percent = _i += percentsPlayedInterval) {
          if (percentPlayed >= percent && __indexOf.call(percentsAlreadyTracked, percent) < 0) {
            if (__indexOf.call(eventsToTrack, "percentsPlayed") >= 0 && percentPlayed !== 0) {
              sendbeacon(getEventName('percent played'), true, percent);
            }
            if (percentPlayed > 0) {
              percentsAlreadyTracked.push(percent);
            }
          }
        }
        if (__indexOf.call(eventsToTrack, "seek") >= 0) {
          seekStart = seekEnd;
          seekEnd = currentTime;
          if (Math.abs(seekStart - seekEnd) > 1) {
            seeking = true;
            sendbeacon(getEventName('seek start'), false, seekStart);
            sendbeacon(getEventName('seek end'), false, seekEnd);
          }
        }
      }
    };
    end = function() {
      if (!isInAdState(player) && !endTracked) {
        sendbeacon('end', true);
        endTracked = true;
      }
    };
    play = function() {
      var currentTime;
      if (!isInAdState(player)) {
        currentTime = Math.round(this.currentTime());
        sendbeacon(getEventName('play'), true, currentTime);
        seeking = false;
      }
    };
    start = function() {
      if (!isInAdState(player)) {
        if (__indexOf.call(eventsToTrack, "start") >= 0 && !startTracked) {
          sendbeacon(getEventName('start'), true);
          return startTracked = true;
        }
      }
    };
    pause = function() {
      var currentTime, duration;
      if (!isInAdState(player)) {
        currentTime = Math.round(this.currentTime());
        duration = Math.round(this.duration());
        if (currentTime !== duration && !seeking) {
          sendbeacon(getEventName('pause'), false, currentTime);
        }
      }
    };
    volumeChange = function() {
      var volume;
      volume = this.muted() === true ? 0 : this.volume();
      sendbeacon(getEventName('volume change'), false, volume);
    };
    resize = function() {
      sendbeacon(getEventName('resize') + ' - ' + this.width() + "*" + this.height(), true);
    };
    error = function() {
      var currentTime;
      currentTime = Math.round(this.currentTime());
      sendbeacon(getEventName('error'), true, currentTime);
    };
    fullscreen = function() {
      var currentTime;
      currentTime = Math.round(this.currentTime());
      if ((typeof this.isFullscreen === "function" ? this.isFullscreen() : void 0) || (typeof this.isFullScreen === "function" ? this.isFullScreen() : void 0)) {
        sendbeacon(getEventName('enter fullscreen'), false, currentTime);
      } else {
        sendbeacon(getEventName('exit fullscreen'), false, currentTime);
      }
    };
    sendbeacon = function(action, nonInteraction, value) {
      if (window.ga) {
        ga('send', 'event', {
          'eventCategory': eventCategory,
          'eventAction': action,
          'eventLabel': eventLabel,
          'eventValue': value,
          'nonInteraction': nonInteraction
        });
      } else if (window._gaq) {
        _gaq.push(['_trackEvent', eventCategory, action, eventLabel, value, nonInteraction]);
      } else {
        console.log("Google Analytics not detected");
      }
    };
    if (__indexOf.call(eventsToTrack, "playerLoad") >= 0) {
      if (self !== top) {
        href = document.referrer + '(iframe)';
        iframe = 1;
      } else {
        href = window.location.href;
        iframe = 0;
      }
      if (window.ga) {
        ga('send', 'event', {
          'eventCategory': eventCategory,
          'eventAction': getEventName('player load'),
          'eventLabel': href,
          'eventValue': iframe,
          'nonInteraction': false
        });
      } else if (window._gaq) {
        _gaq.push(['_trackEvent', eventCategory, getEventName('player load'), href, iframe, false]);
      } else {
        console.log("Google Analytics not detected");
      }
    }
    this.ready(function() {
      this.on("loadedmetadata", loaded);
      this.on("timeupdate", timeupdate);
      if (__indexOf.call(eventsToTrack, "end") >= 0) {
        this.on("ended", end);
      }
      if (__indexOf.call(eventsToTrack, "play") >= 0) {
        this.on("play", play);
      }
      if (__indexOf.call(eventsToTrack, "start") >= 0) {
        this.on("playing", start);
      }
      if (__indexOf.call(eventsToTrack, "pause") >= 0) {
        this.on("pause", pause);
      }
      if (__indexOf.call(eventsToTrack, "volumeChange") >= 0) {
        this.on("volumechange", volumeChange);
      }
      if (__indexOf.call(eventsToTrack, "resize") >= 0) {
        this.on("resize", resize);
      }
      if (__indexOf.call(eventsToTrack, "error") >= 0) {
        this.on("error", error);
      }
      if (__indexOf.call(eventsToTrack, "fullscreen") >= 0) {
        return this.on("fullscreenchange", fullscreen);
      }
    });
  });

}).call(this);
