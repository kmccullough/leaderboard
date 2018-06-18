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

  function isNumber(value) {
    return ('' + value) === ('' + +value);
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
    if (value >= Math.pow(10, 8)) {
      value = (v.length > 9 ? v.substring(0, v.length - 9) : '0')
        + '.' + v.substr(v.length - 9, 1) + 'B';
    } else if (value >= Math.pow(10, 5)) {
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

  function addLeaderboardEntry() {
    editLeaderboardEntry();
  }

  function removeLeaderboardEntry(index) {
    if (index >= 0 && index < leaderboard.length
      && confirm('Delete entry for ' + leaderboard[index].name + '?')
    ) {
      leaderboard.splice(index, 1);
      updateLeaderboard();
    }
  }

  function editLeaderboardEntry(index) {
    var isAdd = index === undefined || index === null
      || index < 0 || index > leaderboard.length;
    var modalEl = document.querySelector('.js-modal');
    var editTpl = document.querySelector('#tpl-leaderboard-edit');
    var editEl = document.importNode(editTpl.content, true);
    var modalNode = editEl.querySelector('.js-modal');

    var titleEl = editEl.querySelector('.js-leaderboard-edit__title');

    if (isAdd) {
      titleEl.textContent = 'Add Entry';
    } else {
      var entry = leaderboard[index];
      titleEl.textContent = 'Edit Entry';

      var fieldEl;

      // Player Icon
      fieldEl = editEl.querySelector('.js-leaderboard-edit__icon');
      fieldEl.value = entry.icon;

      // Player Name
      fieldEl = editEl.querySelector('.js-leaderboard-edit__name');
      fieldEl.value = '' + entry.name;

      // Player Winnings
      fieldEl = editEl.querySelector('.js-leaderboard-edit__winnings');
      fieldEl.value = entry.winnings;

      // Player Nationality
      fieldEl = editEl.querySelector('.js-leaderboard-edit__nat');
      fieldEl.value = entry.nativeOf;
    }

    var cancelEl = editEl.querySelector('.js-leaderboard-edit__cancel');
    cancelEl.addEventListener('click', function () {
      modalEl.removeChild(modalNode);
    });

    var submitEl = editEl.querySelector('.js-leaderboard-edit__submit');
    submitEl.addEventListener('click', function () {

      var fieldEl;
      var editedEntry = {};

      // Player Icon
      fieldEl = modalNode.querySelector('.js-leaderboard-edit__icon');
      editedEntry.icon = fieldEl.value;

      // Player Name
      fieldEl = modalNode.querySelector('.js-leaderboard-edit__name');
      editedEntry.name = fieldEl.value;

      // Player Winnings
      fieldEl = modalNode.querySelector('.js-leaderboard-edit__winnings');
      if (!isNumber(fieldEl.value)) {
        alert('Expected winnings to be a number');
        return;
      }
      editedEntry.winnings = +fieldEl.value;

      // Player Nationality
      fieldEl = modalNode.querySelector('.js-leaderboard-edit__nat');
      editedEntry.nativeOf = fieldEl.value;

      if (isAdd) {
        leaderboard.push(editedEntry);
      } else {
        leaderboard[index] = editedEntry;
      }
      modalEl.removeChild(modalNode);
      updateLeaderboard();

    });

    modalEl.appendChild(editEl);
  }

  function getLeaderboardEntryNode(entry) {
    var entryTpl = document.querySelector('#tpl-leaderboard__entry');
    var entryEl = document.importNode(entryTpl.content, true);
    var fieldEl;

    // Leaderboard Index
    fieldEl = entryEl.querySelector('.js-leaderboard-entry__index');
    fieldEl.textContent = (entry.index + 1) + '.';

    // Player Icon
    fieldEl = entryEl.querySelector('.js-leaderboard-entry__player-icon');
    fieldEl.src = entry.icon;

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

    entryEl.querySelector('.js-leaderboard-actions__remove')
      .addEventListener('click', function () {
        removeLeaderboardEntry(entry.index)
      });

    entryEl.querySelector('.js-leaderboard-actions__edit')
      .addEventListener('click', function () {
        editLeaderboardEntry(entry.index)
      });

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

      leaderboard = leaderboard.sort(function (a, b) {
        return a.winnings > b.winnings ? -1 : a.winnings < b.winnings ? 1 : 0;
      });

      var fieldEl;

      // Mean Average
      var mean = meanAverageWinnings(leaderboard);
      fieldEl = leaderboardEl.querySelector('.js-leaderboard__mean');
      fieldEl.textContent = dollarFilter(mean);

      // Median Average
      var median = medianAverageWinnings(leaderboard);
      fieldEl = leaderboardEl.querySelector('.js-leaderboard__median');
      fieldEl.textContent = dollarFilter(median.value);

      var closestToMean;

      leaderboard
        .forEach(function (entry, index) {
          var diff = Math.abs(entry.winnings - mean);
          if (!closestToMean || diff < closestToMean.diff) {
            closestToMean = {
              diff: diff,
              index: index
            };
          }
        });

      leaderboard
        .forEach(function (entry, index) {
            entry.index = index;
            entry.isClosestToMean = closestToMean.index === index;
            entry.isMedian = median.indices.indexOf(index) >= 0;
          entriesEl.appendChild(getLeaderboardEntryNode(entry));
        });

      var actionsTpl = document.querySelector('#tpl-leaderboard__bottom-actions');
      var actionsEl = document.importNode(actionsTpl.content, true);
      actionsEl.querySelector('.js-leaderboard__add')
        .addEventListener('click', addLeaderboardEntry);
      entriesEl.appendChild(actionsEl)

    } // Tournament Results

    el.appendChild(leaderboardEl);
  }

})(window, document);
