var twit = require('twit');
var config = require('./config');
var nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport. Using gmail can help us out in many things.
var botEmail = '...'; //user name part of email, ie., john for <john@gmail.com> | this must ba a gmail or mailerArgs will be reconstructed
var botPass = '...'; // password for <john@gmail.com>

var toMail = 'user_+name, user@mail.com'; // to mail address, eg: 'Abraham bran, abraham@yahoo.com'
var mailerArgs = 'smtps://'+botEmail+'%40gmail.com:'+botPass+'@smtp.gmail.com';
var transporter = nodemailer.createTransport(mailerArgs);

var Twitter = twit(config);

// setup e-mail data with unicode symbols
var mailOptions = {
    from: '"Email Bot (Twigo)" <'+botEmail+'@gmail.com>', // sender address
    to: toMail // list of receivers
};

//query params to query the tweets. Change the query string of your need
var qparams = {
  q: '#emberjs, #emberJs, #emberJS, #EmberJs, #Emberjs, #EMBERJS',
  result_type: 'recent',
  lang: 'en'
};

// function to retweet tweets that matches my query string..
var retweet = function() {
  Twitter.get('search/tweets', qparams, function(err, data) {
    if (!err) {
      var retweetId = data.statuses[0].id_str;
      Twitter.post('statuses/retweet/:id', {
        id: retweetId
      }, function(err, response) {
        if (response) {
          console.log('Retweeted :)');
        }
        if (err) {
          console.log('OOPS! Something went wrong while retweeting :( ');
          // console.log(err);
          // Email Errors
          emailErrors(2, err);
        }
      })
    } else {
      console.log('[Retweeting] OOPS! Something went wrong while querying tweets :(');
      // console.log(err);
      // Email Errors
      emailErrors(1, err);
    }
  });
}

//Favoriting a tweet

var favoriteTweet = function(){
  // find the tweet
  Twitter.get('search/tweets', qparams, function(err,data){

    if (!err) {
      // find tweets
      var tweet = data.statuses;
      var randomTweet = selectRandom(tweet);   // pick a random tweet

      if(typeof randomTweet != 'undefined'){
        Twitter.post('favorites/create', {id: randomTweet.id_str}, function(err, response){
          if(err){
            console.log('OOPS! Something went wrong while Favoriting a tweet :(');
            emailErrors(3, err);
          }
          else{
            console.log('Favorited :)');
          }
        });
      }
    } else {
      console.log('[Favoriting] OOPS! Something went wrong while querying tweets :(');
      // console.log(err);
      // Email Errors
      emailErrors(1, err);
    }
  });
}

retweet();
setInterval(retweet, 3000000);
favoriteTweet();
setInterval(favoriteTweet, 3600000);


// function to retrun a random tweet from the tweet array
function selectRandom (arr) {
  var index = Math.floor(Math.random()*arr.length);
  return arr[index];
};

var emailErrors = function(type, err) {
  if (type == 1) {
    mailOptions.subject = 'Query: Failed';
  } else if (type == 2) {
    mailOptions.subject = 'Query: Passed | Retweet: Failed';
  } else if (type == 3) {
    mailOptions.subject = 'Query: Passed | Favorite: Failed';
  }

  var errorString = 'error msg: '+err.message+' | error code: '+err.code;
  mailOptions.text = errorString;
  mailOptions.html = '<code style="color: red;">'+errorString+'</code>';

  transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    console.log('Error log is mailed to ' +toMail+ ' - Response : ' + info.response);
  });
}
