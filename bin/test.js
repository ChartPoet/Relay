#! /usr/bin/env node
const { DataSource } = require('../lib/data_sources/data_source');

(async () => {
  const schema = await DataSource.query('POSTGRES_SQL', {
    host: 'localhost',
    port: '5342',
    user: 'gauravt',
    password: 'allahabad',
    database: 'sampleapp_development',
  }, {
    query: `SELECT COUNT(*) AS count_all, "events"."category" AS events_category FROM "events" GROUP BY "events"."category"`,
  });
  console.log(JSON.stringify(schema));
})();
