module.exports = {
    sessionSecret: '%h*2?VY9vX',
    secret:'extY@7sbx*',
    mongo: {
        development: {
            connectionString: 'mongodb://localhost:27017/travel'
        },
        production: {
            connectionString: 'mongodb://localhost:27017/travel',
        },
    },
};