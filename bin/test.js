#! /usr/bin/env node
const { DataSource } = require('../lib/data_sources/data_source');

(async () => {
  const schema = await DataSource.query('MY_SQL', {
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: 'allahabad',
    database: 'chartpress',
  }, {
    query: `select ID  from wp_posts`,
  });
  console.log('Schema is' ,JSON.stringify(schema));
})();
