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

  function meanAverageWinnings(entries) {
    var total = entries.reduce(function (total, entry) {
      return total + entry.winnings;
    }, 0);
    return total / entries.length;
  }

  // Expects entries to already be sorted
  function medianAverageWinnings(sortedEntries) {
    var median, indices = [];
    if (sortedEntries.length % 2) {
      indices.push((sortedEntries.length + 1) / 2);
      median = sortedEntries[indices[0]].winnings;
    } else {
      var half = sortedEntries.length / 2;
      indices.push(half);
      indices.push(half + 1);
      median = (sortedEntries[indices[0]].winnings + sortedEntries[indices[1]].winnings) / 2
    }
    return {
      value:   median,
      indices: indices
    };
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

    var row = entryEl.querySelector('.c-leaderboard__entry');
    if (entry.isClosestToMean) {
      row.classList.add('c-leaderboard__entry--mean');
    }
    if (entry.isMedian) {
      row.classList.add('c-leaderboard__entry--median');
    }

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

      var sortedLeaderboard = leaderboard.sort(function (a, b) {
        return a.winnings > b.winnings ? -1 : a.winnings < b.winnings ? 1 : 0;
      });

      var fieldEl;

      // Mean Average
      var mean = meanAverageWinnings(leaderboard);
      fieldEl = leaderboardEl.querySelector('.js-leaderboard__mean');
      fieldEl.textContent = dollarFilter(mean);

      // Median Average
      var median = medianAverageWinnings(sortedLeaderboard);
      fieldEl = leaderboardEl.querySelector('.js-leaderboard__median');
      fieldEl.textContent = dollarFilter(median.value);

      var closestToMean;

      sortedLeaderboard
        .forEach(function (entry, index) {
          var diff = Math.abs(entry.winnings - mean);
          if (!closestToMean || diff < closestToMean.diff) {
            closestToMean = {
              diff: diff,
              index: index
            };
          }
        });

      sortedLeaderboard
        .forEach(function (entry, index) {
            entry.index = index + 1;
            entry.isClosestToMean = closestToMean.index === index;
            entry.isMedian = median.indices.indexOf(index) >= 0;
            entriesEl.appendChild(getLeaderboardEntryNode(entry));
        });

    } // Tournament Results

    el.appendChild(leaderboardEl);
  }

})(window, document);
