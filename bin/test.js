#! /usr/bin/env node
const { DataSource } = require('../lib/data_sources/data_source');

(async () => {
  const schema = await DataSource.schema('POSTGRES_SQL', {
    host: 'localhost',
    port: '5342',
    user: 'gauravt',
    password: 'allahabad',
    database: 'sampleapp_development',
  }, null);
  console.log(JSON.stringify(schema));
})();
