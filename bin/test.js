#! /usr/bin/env node
const { DataSource } = require('../lib/data_sources/data_source');

(async () => {
  const schema = await DataSource.query('POSTGRES_SQL', {
    host: 'localhost',
    port: '5432',
    user: 'gauravt',
    password: 'allahabad',
    database: 'sampleapp_development',
  }, {
    query: `SELECT id FROM "events" LIMIT 50`,
  });
  console.log('Schema is' , JSON.stringify(schema));
})();
