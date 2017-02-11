'use strict';

let Wit = null;
let interactive = null;
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

const actions = {
  send(request, response) {
    const {sessionId, context, entities} = request;
    const {text, quickreplies} = response;
    console.log('sending...', JSON.stringify(response));
  },
  getRecommendations({context, entities}) {
    var url = firstEntityValue(entities, 'url');
    if (url) {
      context.recommendations = url + " brought up recommendations: Pride and Prejudice"; // we should call a weather API here
    } 
    return context;
  },
  getRecommendationOnTopic({context, entities}) {
    var topic = firstEntityValue(entities, 'intent');
    if (topic) {
      context.recommendations = topic + " brought up recommendations: Pride and Prejudice"; // we should call a weather API here
    } 
    return context;
  },
};

const client = new Wit({accessToken, actions});
interactive(client);
