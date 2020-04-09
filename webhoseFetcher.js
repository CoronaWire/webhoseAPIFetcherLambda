const webhoseio = require('webhoseio');
const webhoseClient = webhoseio.config({token: 'dcfae39a-1ed7-4227-8de5-515b2b79ccb4'});
const { p1Sources, p2Sources, p3Sources } = require('./sourceList');
const { pgClient } = require('./conn');
const format = require('pg-format');

let apiToDBMap = {
  'uuid': 'ARTICLE_ID',
  'title': 'TITLE',
  'site': 'SOURCE_ID',
  'author': 'AUTHOR',
  'url': 'ARTICLE_URL',
  'text': 'CONTENT',
  'published': 'PUBLISHED_AT'
}

let fieldArray = ['uuid', 'title', 'site', 'author', 'url', 'text', 'published'];

async function main() {
  // Iterate through the different sources (see sourceList.js)
  let querySources = [p1Sources, p2Sources, p3Sources];
  for (let i = 0; i < querySources.length; i++) {
    let queryParams = {
      "q": getJoinedWebhoseQueryString(querySources[i]),
      "ts": getOlderUnixTimestampString('1 hour'),
      "sort": "published"
    };
    await grabContentAndInsert(queryParams);
  }
  await pgClient.end();
}

// TO-DO: This should be split into separate grab and insert functions 
function grabContentAndInsert(queryParams) {
  return webhoseClient.query('filterWebContent', queryParams)
    .then(output => {
      let condensedPosts = output.posts.map((post) => {
        let condensedObj = {};
        fieldArray.forEach(field => parseInput(post, condensedObj, field));
        return condensedObj; 
      })
      let results = [];
      condensedPosts.forEach(post => {
        results.push(Object.values(post));
      });
      const queryString = format(`INSERT INTO moderationtable(${apiToDBMap.uuid}, ${apiToDBMap.title}, ${apiToDBMap.site}, 
                                                              ${apiToDBMap.author}, ${apiToDBMap.url}, ${apiToDBMap.text}, 
                                                              ${apiToDBMap.published}) VALUES %L ON CONFLICT DO NOTHING`, results)
      return pgClient.query(queryString);
    })
    .then(results => {
      console.log(`Successfully inserted records .`);
    })
    .catch(err => {
      console.log('Error on Webhose fetch OR DB Insert', err);
    })
}

function parseInput(post, condensedObj, field) {
  if (field === 'main_image' || field === 'site') { 
    if (field === 'site' && post['thread'][field] === 'NULL') {
      condensedObj[field] = 'no_source_id';
    } else {
      condensedObj[field] = post['thread'][field]; 
    }
  } 
  else {
    if (field === 'title') {
      condensedObj[field] = post[field].slice(0, 255);
    } else {
      condensedObj[field] = post[field]; 
    }
  }
  return condensedObj; 
}

function getJoinedWebhoseQueryString(newsSource) {
  let compiledStr = '';
  for (let key in newsSource) {
    compiledStr += `site:${newsSource[key]} OR `
  }
  return compiledStr.slice(0, -3); 
}

function getOlderUnixTimestampString(howOld) {
  let howFarBackMS; 
  if (howOld === '1 hour') {
    howFarBackMS = 60 * 60 * 1000;
  } else if (howOld === '2 hours') {
    howFarBackMS = 2 * 60 * 60 * 1000.
  } else {
    howFarBackMS = 60 * 60 * 1000;
  }
  return (new Date().getTime() - howFarBackMS).toString();
}

main(); 