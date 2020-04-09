const webhoseio = require('webhoseio');
const webhoseClient = webhoseio.config({ token: '/* Enter Webhose API Token here*/' });
const { p1Sources, p2Sources, p3Sources } = require('./sourceList');
const { pgClient } = require('./conn');
const format = require('pg-format');

const apiToDBMap = {
  uuid: 'ARTICLE_ID',
  title: 'TITLE',
  site: 'SOURCE_ID',
  author: 'AUTHOR',
  url: 'ARTICLE_URL',
  text: 'CONTENT',
  published: 'PUBLISHED_AT',
};

const fieldArray = ['uuid', 'title', 'site', 'author', 'url', 'text', 'published'];

function getJoinedWebhoseQueryString(newsSource) {
  let compiledStr = '';
  for (const key in newsSource) {
    compiledStr += `site:${newsSource[key]} OR `;
  }
  return compiledStr.slice(0, -3);
}

function getOlderUnixTimestampString(howOld) {
  let howFarBackMS;
  if (howOld === '1 hour') {
    howFarBackMS = 60 * 60 * 1000;
  } else if (howOld === '2 hours') {
    howFarBackMS = 2 * 60 * 60 * 1000.0;
  } else {
    howFarBackMS = 60 * 60 * 1000;
  }
  return (new Date().getTime() - howFarBackMS).toString();
}

function parseInput(post, condensedObj, field) {
  if (field === 'main_image' || field === 'site') {
    if (field === 'site' && post.thread[field] === 'NULL') {
      condensedObj[field] = 'no_source_id';
    } else {
      condensedObj[field] = post.thread[field];
    }
  } else if (field === 'title') {
    condensedObj[field] = post[field].slice(0, 255);
  } else {
    condensedObj[field] = post[field];
  }
  return condensedObj;
}

// TO-DO: This should be split into separate grab and insert functions
function grabContentAndInsert(queryParams) {
  return webhoseClient.query('filterWebContent', queryParams)
    .then((output) => {
      const condensedPosts = output.posts.map((post) => {
        const condensedObj = {};
        fieldArray.forEach((field) => parseInput(post, condensedObj, field));
        return condensedObj;
      });
      const results = [];
      condensedPosts.forEach((post) => {
        results.push(Object.values(post));
      });
      const queryString = format(`INSERT INTO moderationtable(${apiToDBMap.uuid}, ${apiToDBMap.title}, ${apiToDBMap.site}, 
                                                              ${apiToDBMap.author}, ${apiToDBMap.url}, ${apiToDBMap.text}, 
                                                              ${apiToDBMap.published}) VALUES %L ON CONFLICT DO NOTHING`, results);
      return pgClient.query(queryString);
    })
    .then(() => {
      console.log('Successfully inserted records .');
    })
    .catch((err) => {
      console.log('Error on Webhose fetch OR DB Insert', err);
    });
}

async function main() {
  // Iterate through the different sources (see sourceList.js)
  const querySources = [p1Sources, p2Sources, p3Sources];
  for (let i = 0; i < querySources.length; i++) {
    const queryParams = {
      q: getJoinedWebhoseQueryString(querySources[i]),
      ts: getOlderUnixTimestampString('1 hour'),
      sort: 'published',
    };
    await grabContentAndInsert(queryParams);
  }
  await pgClient.end();
}

main();
