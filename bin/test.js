#! /usr/bin/env node
const { DataSource } = require('../lib/data_sources/data_source');

(async () => {
  const schema = await DataSource.schema('MY_SQL', {
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: 'allahabad',
    database: 'chartpress',
  }, null);
  console.log(JSON.stringify(schema));
})();
