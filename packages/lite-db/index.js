const EventEmitter = require('events');
const Sequelize = require('sequelize');


/**
 * @class LiteDb
 * @extends EventEmitter
 * @property {boolean} debug
 * @property {Sequelize} sequelize
 */
class LiteDb extends EventEmitter {
  constructor(dbPath = 'data.db') {
    super();

    this.sequelize = new Sequelize('database', 'username', 'password', {
      dialect: 'sqlite',
      operatorsAliases: false,

      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },

      // SQLite only
      storage: dbPath,
    });
  }

  query(...args) {
    return this.sequelize.query(...args);
  }
}

module.exports = LiteDb;
