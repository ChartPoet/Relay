#! /usr/bin/env node
const { DataSource } = require('../lib/data_sources/data_source');

(async () => {
  
  const schema = await DataSource.schema('MY_SQL', {
    host: 'localhost',
    port: '33061',
    user: 'root',
    password: 'allahabad',
    database: 'chartpress',
  }, {
    query: `select post_type, count(post_type) from wp_posts group by post_type`,
  });
  console.log(JSON.stringify(schema));
})();
