(function(window, document, undefined) {

  var leaderboard = [];

  document.addEventListener('DOMContentLoaded', function () {
    getRandomData();
  });

  function capitalize(text) {
    return (''+text).replace(/^\w/, function (first) {
      return first.toUpperCase();
    });
  }

  function getRandomData() {
    var minWinnings = Math.pow(10, 5);
    var maxWinnings = Math.pow(10, 8);
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
      if (request.readyState !== XMLHttpRequest.DONE || request.status !== 200) {
        return;
      }
      var response = request && request.responseText && JSON.parse(request.responseText);
      if (!response || !response.results || !response.results.length) {
        return;
      }
      leaderboard = response.results.map(function (result) {
        return {
          name: capitalize(result.name.first) + ' ' + capitalize(result.name.last),
          nativeOf: result.nat,
          icon: result.picture.thumbnail,
          winnings: Math.floor(Math.random() * (maxWinnings - minWinnings) + minWinnings)
        };
      });
      // Update the view with the new data
      updateLeaderboard();
    };
    request.open('GET', 'https://randomuser.me/api/?inc=name,picture,nat&results=10', true);
    request.send();
  }

  function clearElementChildren(el) {
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
    return el;
  }

  function dollarFilter(value) {
    value = Math.floor(value);
    var v = '' + value;
    if (value >= Math.pow(10, 5)) {
      value = (v.length > 6 ? v.substring(0, v.length - 6) : '0')
        + '.' + v.substr(v.length - 6, 1) + 'M';
    } else if (value >= Math.pow(10, 3)) {
      value = v.substring(0, v.length - 3)
        + '.' + v.substr(v.length - 3, 1) + 'K';
    }
    return '$' + value;
  }

  function getLeaderboardEntryNode(entry) {
    var entryTpl = document.querySelector('#tpl-leaderboard__entry');
    var entryEl = document.importNode(entryTpl.content, true);
    var fieldEl;

    // Leaderboard Index
    fieldEl = entryEl.querySelector('.js-leaderboard-entry__index');
    fieldEl.textContent = entry.index + '.';

    // Player Icon
    fieldEl = entryEl.querySelector('.js-leaderboard-entry__player-icon');
    fieldEl.src = '' + entry.icon;

    // Player Name
    fieldEl = entryEl.querySelector('.js-leaderboard-entry__player-name');
    fieldEl.textContent = '' + entry.name;

    // Player Winnings
    fieldEl = entryEl.querySelector('.js-leaderboard-entry__winnings');
    fieldEl.textContent = dollarFilter(entry.winnings);

    // Player Nationality Flag
    fieldEl = entryEl.querySelector('.js-leaderboard-entry__flag');
    fieldEl.src = 'http://www.countryflags.io/' + entry.nativeOf + '/flat/48.png';

    // Player Nationality
    fieldEl = entryEl.querySelector('.js-leaderboard-entry__country');
    fieldEl.textContent = entry.nativeOf;

    return entryEl;
  }

  function updateLeaderboard() {
    var leaderboardTpl, leaderboardEl;
    var el = document.querySelector('.js-leaderboard');
    clearElementChildren(el);

    // No Tournament Results
    if (!leaderboard.length) {

      leaderboardTpl = document.querySelector('#tpl-leaderboard--empty');
      leaderboardEl = document.importNode(leaderboardTpl.content, true);

    // Tournament Results
    } else {

      leaderboardTpl = document.querySelector('#tpl-leaderboard');
      leaderboardEl = document.importNode(leaderboardTpl.content, true);

      var entriesEl = leaderboardEl.querySelector('.js-leaderboard__entries');

      leaderboard
        // TODO: sort leaderboard, extract median and mean
        .forEach(function (entry, index) {
          entry.index = index + 1;
          entriesEl.appendChild(getLeaderboardEntryNode(entry));
        });

    } // Tournament Results

    el.appendChild(leaderboardEl);
  }

})(window, document);
