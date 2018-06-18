(function(window, undefined) {

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
          winnings: result.phone
        };
      });
      console.log(leaderboard);
      // Update the view with the new data
      updateLeaderboard();
    };
    request.open('GET', 'https://randomuser.me/api/?inc=name,picture,phone,nat&results=10', true);
    request.send();
  }

  function updateLeaderboard() {
    // TODO: sort leaderboard, extract median and mean

    // var t = document.querySelector('#tpl-leaderboard');
    //
    // // Clone the new row and insert it into the table
    // var tb = document.querySelector("tbody");
    // var clone = document.importNode(t.content, true);
    // td = clone.querySelectorAll("td");
    // td[0].textContent = "1235646565";
    // td[1].textContent = "Stuff";
    //
    // tb.appendChild(clone);
    //
    // // Clone the new row and insert it into the table
    // var clone2 = document.importNode(t.content, true);
    // td = clone2.querySelectorAll("td");
    // td[0].textContent = "0384928528";
    // td[1].textContent = "Acme Kidney Beans 2";
    //
    // // <img src="http://www.countryflags.io/:country_code/:style/:size.png">
    //
    // tb.appendChild(clone2);
  }

})(window);
