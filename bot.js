var twit = require('twit');
var config = require('./config');

var Twitter = twit(config);

// function to retweet tweets that matches my query string..

var retweet = function() {
  var params = {
    q: '#emberjs, #emberJs #EmberJs #EMBERJS',
    result_type: 'recent',
    lang: 'en'
  };

  Twitter.get('search/tweets', params, function(err, data) {
    if (!err) {
      var retweetId = data.statuses[0].id_str;
      Twitter.post('statuses/retweet/:id', {
        id: retweetId
      }, function(err, response) {
        if (response) {
          console.log('Retweeted :)');
        }
        if (err) {
          console.log('OOPS! Something went wrong while retweeting :( Heres the log');
          console.log(err);
        }
      })
    } else {
      console.log('OOPS! Something went wrong while querying tweets :(');
      console.log(err);
    }
  })
}

retweet();
setInterval(retweet, 3000000);
