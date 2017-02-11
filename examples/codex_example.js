'use strict';
let Airtable = require('airtable');
let base = new Airtable({apiKey: 'keyfQVO1RdexomXw7'}).base('appVrZJFsq4Rmdm1T');
let Wit = null;
let interactive = null;
let Keyword_Recommendations = {};
var Url_Keyword = {};

try {
  // if running from repo
  Wit = require('../').Wit;
  interactive = require('../').interactive;
} catch (e) {
  Wit = require('node-wit').Wit;
  interactive = require('node-wit').interactive;
}

const accessToken = (() => {
  if (process.argv.length !== 3) {
    console.log('usage: node examples/quickstart.js <wit-access-token>');
    process.exit(1);
  }
  return process.argv[2];
})();

// Quickstart example
// See https://wit.ai/ar7hur/quickstart

const firstEntityValue = (entities, entity) => {
  const val = entities && entities[entity] &&
    Array.isArray(entities[entity]) &&
    entities[entity].length > 0 &&
    entities[entity][0].value
  ;
  if (!val) {
    return null;
  }
  return typeof val === 'object' ? val.value : val;
};

// Function for pulling data from AirTable
function retrieveData() {
  base('Keyword_Recommendations').select({
    maxRecords: 3,
    view: "Main View"
  }).eachPage(function page(records, fetchNextPage) {
      records.forEach(function(record) {
          var currentKeyword = record.get('Keyword');
          var currentURL = record.get('Article_URL');
          
          Url_Keyword[currentURL] = currentKeyword;
          Keyword_Recommendations[currentKeyword] = [];
          Keyword_Recommendations[currentKeyword].push(record.fields.Recommendation1);
          Keyword_Recommendations[currentKeyword].push(record.fields.Recommendation2);
          Keyword_Recommendations[currentKeyword].push(record.fields.Recommendation3);
      });
  }, function done(err) {
      if (err) { console.error(err); return; }
  });
}

// Actually retrieving AirTable data
retrieveData();

const actions = {
  send(request, response) {
    const {sessionId, context, entities} = request;
    const {text, quickreplies} = response;
    console.log('sending...', JSON.stringify(response));
  },
  getRecommendations({context, entities}) {
    var url = firstEntityValue(entities, 'url');
    if (url) {
        var keyword = Url_Keyword[url];
        var recommendation_list = Keyword_Recommendations[keyword].join(" ");
        context.recommendations = url + " brought up recommendations: "
        + recommendation_list;
    } 
    return context;
  },
  getRecommendationOnTopic({context, entities}) {
    var topic = firstEntityValue(entities, 'topic');
    console.log(topic);
    console.log(Keyword_Recommendations);
    if (topic) {
      var recommendation_list = Keyword_Recommendations[keyword].join(" ");
      context.recommendations = topic + " brought up recommendations: "
      + recommendation_list; 
    } 
    return context;
  }
};

const client = new Wit({accessToken, actions});
interactive(client);
