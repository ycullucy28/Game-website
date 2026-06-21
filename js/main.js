document.addEventListener('DOMContentLoaded', function () {
  var menuToggle = document.getElementById('menu-toggle');
  var mainNav = document.getElementById('main-nav');
  var gamesItem = document.querySelector('.nav-item-has-submenu');

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', function () {
      var isOpen = mainNav.classList.toggle('nav-open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');

      if (!isOpen && gamesItem) {
        gamesItem.classList.remove('submenu-open');
        var gamesLink = gamesItem.querySelector(':scope > a');
        if (gamesLink) {
          gamesLink.setAttribute('aria-expanded', 'false');
        }
      }
    });
  }

  if (gamesItem) {
    var gamesLink = gamesItem.querySelector(':scope > a');

    if (gamesLink) {
      gamesLink.addEventListener('click', function (event) {
        event.preventDefault();

        if (window.matchMedia('(max-width: 768px)').matches) {
          var isSubmenuOpen = gamesItem.classList.toggle('submenu-open');
          gamesLink.setAttribute('aria-expanded', String(isSubmenuOpen));
        }
      });
    }
  }
});

(function () {
  var musicMuteEl = null;
  var musicStatusEl = null;
  var sfxToggleEl = null;
  var sfxStatusEl = null;
  var sfxSelectEl = null;
  var sfxSelectionStatusEl = null;

  var gameName = 'snake';
  var themeSound = null;
  var moveSound = null;
  var scoreSound = null;
  var gameOverSound = null;
  var themeShouldPlay = false;
  var noopSound = { play: function () {}, stop: function () {} };

  function getAudioStyle() {
    return sfxSelectEl ? sfxSelectEl.value : 'classic';
  }

  function isMusicMuted() {
    return musicMuteEl ? musicMuteEl.checked : false;
  }

  function isSfxEnabled() {
    return sfxToggleEl ? sfxToggleEl.checked : true;
  }

  function shouldPlayTheme() {
    var style = getAudioStyle();
    return style === 'classic' || style === 'retro';
  }

  function shouldPlayActionSounds() {
    return getAudioStyle() === 'minimal';
  }

  function getThemeFile() {
    if (!shouldPlayTheme()) {
      return null;
    }

    return 'audio/' + gameName + '-theme-' + getAudioStyle() + '.wav';
  }

  function updateMusicStatus() {
    if (musicStatusEl) {
      if (!shouldPlayTheme()) {
        musicStatusEl.textContent = 'Off (Minimal)';
      } else {
        musicStatusEl.textContent = isMusicMuted() ? 'Muted' : 'On';
      }
    }
  }

  function updateSfxStatus() {
    if (sfxStatusEl) {
      sfxStatusEl.textContent = isSfxEnabled() ? 'On' : 'Off';
    }
  }

  function updateSfxSelectionStatus() {
    if (sfxSelectEl && sfxSelectionStatusEl) {
      sfxSelectionStatusEl.textContent = sfxSelectEl.options[sfxSelectEl.selectedIndex].text;
    }
  }

  function createOptionalSound(src, options) {
    var settings = options || {};
    var audio = null;
    var unavailable = false;

    function markUnavailable() {
      unavailable = true;
      if (audio) {
        audio.pause();
        audio = null;
      }
    }

    return {
      play: function () {
        if (unavailable) {
          return;
        }

        if (settings.isMusic && isMusicMuted()) {
          return;
        }

        if (!settings.isMusic && !isSfxEnabled()) {
          return;
        }

        if (!audio) {
          audio = new Audio(src);
          audio.loop = Boolean(settings.loop);
          audio.volume = settings.volume !== undefined ? settings.volume : 1;
          audio.preload = 'auto';
          audio.addEventListener('error', markUnavailable, { once: true });
        }

        if (unavailable) {
          return;
        }

        if (settings.restart !== false) {
          audio.currentTime = 0;
        }

        var playPromise = audio.play();

        if (playPromise && playPromise.catch) {
          playPromise.catch(markUnavailable);
        }
      },
      stop: function () {
        if (audio && !unavailable) {
          audio.pause();
          audio.currentTime = 0;
        }
      }
    };
  }

  function rebuildThemeSound() {
    var wasPlaying = themeShouldPlay && shouldPlayTheme() && !isMusicMuted();

    if (themeSound && themeSound.stop) {
      themeSound.stop();
    }

    var themeFile = getThemeFile();

    if (themeFile) {
      themeSound = createOptionalSound(themeFile, {
        loop: true,
        isMusic: true,
        volume: 0.35,
        restart: false
      });
    } else {
      themeSound = noopSound;
    }

    if (wasPlaying) {
      themeSound.play();
    }

    updateMusicStatus();
  }

  function handleStyleChange() {
    updateSfxSelectionStatus();
    rebuildThemeSound();
  }

  window.GameAudio = {
    init: function (config) {
      var settings = config || {};

      gameName = settings.game || 'snake';
      musicMuteEl = document.getElementById('music-mute');
      musicStatusEl = document.getElementById('music-status');
      sfxToggleEl = document.getElementById('sfx-toggle');
      sfxStatusEl = document.getElementById('sfx-status');
      sfxSelectEl = document.getElementById('sfx-select');
      sfxSelectionStatusEl = document.getElementById('sfx-selection-status');

      themeShouldPlay = false;
      moveSound = createOptionalSound('audio/move.wav', {
        isMusic: false,
        volume: 0.45
      });
      scoreSound = createOptionalSound('audio/score.wav', {
        isMusic: false,
        volume: 0.55
      });
      gameOverSound = createOptionalSound('audio/game-over.wav', {
        isMusic: false,
        volume: 0.6
      });

      rebuildThemeSound();
      this.bindSettings();
      return this;
    },

    bindSettings: function () {
      updateSfxStatus();
      updateSfxSelectionStatus();

      if (musicMuteEl) {
        musicMuteEl.addEventListener('change', function () {
          updateMusicStatus();

          if (isMusicMuted() || !shouldPlayTheme()) {
            themeSound.stop();
          } else if (themeShouldPlay) {
            themeSound.play();
          }
        });
      }

      if (sfxToggleEl) {
        sfxToggleEl.addEventListener('change', updateSfxStatus);
      }

      if (sfxSelectEl) {
        sfxSelectEl.addEventListener('change', handleStyleChange);
      }
    },

    startTheme: function () {
      themeShouldPlay = true;

      if (shouldPlayTheme() && !isMusicMuted()) {
        themeSound.play();
      }
    },

    stopTheme: function () {
      themeShouldPlay = false;
      themeSound.stop();
    },

    playMove: function () {
      if (shouldPlayActionSounds()) {
        moveSound.play();
      }
    },

    playScore: function () {
      if (shouldPlayActionSounds()) {
        scoreSound.play();
      }
    },

    playGameOver: function () {
      themeShouldPlay = false;
      themeSound.stop();
      gameOverSound.play();
    }
  };
})();
