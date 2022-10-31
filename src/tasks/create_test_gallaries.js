const Gallery = require('../mongodb/galery_model')
const { faker } = require('@faker-js/faker');

const env = 'development';
console.log(`Env is ${env}`);

const config = require('../config')(env);
console.log(JSON.stringify(config));

const db = require('../mongodb/connect');
db.connect(config, env);

const count = process.argv[2] || 100;

console.log("Creating count " + count);

const r = Math.floor(Math.random()*10) + 1;
for (let i = 0; i < count; i++) {

  console.log(`Creating ${i + 1}`);
  const gallery = new Gallery({
    _id: r + i,
    title: faker.word.adjective(),
    location: faker.address.city(),
    dateOfPlay: faker.date.past(),
    author: faker.name.firstName(),
    director: faker.name.firstName(),
    createdOn: new Date(),
    tags: ['teatro-cubano'],
    isActive: true,
    isFavorite: true
  });

  gallery.save(function(err){
    if(err) throw err;
    console.log("Gallery successfully created!");
  });

}

