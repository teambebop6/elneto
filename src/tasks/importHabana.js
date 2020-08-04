/**
 * Created by Henry Huang on 2020/8/3.
 */
const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');
const logger = require('../lib/logger');
const db = require('../mongodb/db');

const env = process.env.NODE_ENV || 'development';
const SearchEntry = db.SearchEntry;

const config = require('../config')(env);
console.log(JSON.stringify(config));

const conn = require('../mongodb/connect');
conn.connect(config, env);

SearchEntry.collection.remove(() => {
  logger.info("Old documents removed.")
  let id = 1;
  const filePath = path.resolve(__dirname, '..', 'elneto-secret', 'habana.csv')
  fs.createReadStream(filePath).pipe(csv.parse({
    headers: true,
    encoding: 'latin1'
  })).on('error', error => {
    logger.error(error)
  }).on('data', row => {
    if (row.Anio || row.Autora || row.Obra || row.Dirige) {
      const entity = new SearchEntry({
        _id: id++,
        year: row.Anio,
        author: row.Autora,
        work: row.Obra,
        conductedBy: row.Dirige,
        rep: '',
        createdOn: new Date()
      })
      // logger.info(entity)
      entity.save()
    }
  }).on('end', rowCount => {
    logger.info(`Parsed ${rowCount} rows`)
    logger.info('Creating index')
    SearchEntry.collection.createIndex(
      {
        year: 'text',
        work: 'text',
        conductedBy: 'text',
        author: 'text',
        rep: 'text',
      },
      {
        default_language: 'spanish'
      }
    ).then(() => {
      logger.info('Created index done.')
      logger.info('Try search "Núñez Miró, Isidoro"')
      const query = 'Núñez Miró, Isidoro'
      SearchEntry.find({ $text: { $search: query } }, { score: { $meta: "textScore" } }).sort({
        score:{ $meta: "textScore" }
      }).exec((err, results) => {
        if(err){
          logger.error(err)
        } else {
          logger.info('Results: ')
          results.map(result => {
            logger.info(result.toObject())
          })
          const count = db.SearchEntry.count((err, count) => {
            logger.info(`Parsed ${rowCount} rows, and DB documents count is ${count}.`)
            conn.mongoose.connection.close()
          });
        }
      });
    });
  });
});

