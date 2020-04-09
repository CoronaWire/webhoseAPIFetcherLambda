const { Client } = require('pg');

const pgClient = new Client({
  user: 'sanjeevdatta',
  host: 'localhost',
  database: 'coronaviruswire'
});

pgClient.connect(err => {
  if (err) {
    console.log(err);
    console.log('Error while trying to establish connection.')
  } else {
    console.log('PostgreSQL corona DB connected.');
  }
});

module.exports = {
  pgClient: pgClient
}; 