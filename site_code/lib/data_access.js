/**
 * Created by akil.harris on 12/14/13.
 */


exports.dataConnection = function() {

    var pg = require('pg');
    var dbpw = process.env.DBPW;
    var dbIP = process.env.DBIP;
    var connection_string = 'postgres://akil:' + dbpw + '@' + dbIP + ':5432/nyc_campaign_finance';
    var client = new pg.Client(connection_string);

    var fetchAllCandidates = function (callBack) {
        pg.connect(connection_string, function(error, client, done) {
            if (error) { return console.error('Error fetching client from pool: ', error); }

            client.query('SELECT * FROM fetch_all_candidates();', function(err, result) {
                //call `done()` to release the client back to the pool
                done();
                if(err) {
                    return console.error('error running query', err);
                }

                callBack(result);

            });
        });
    };

    var fetchOffices = function (callBack) {
        pg.connect(connection_string, function(error, client, done) {
            if (error) { return console.error('Error fetching client from pool: ', error); }

            client.query('SELECT * FROM fetch_candidate_offices();', function(err, result) {
                //call `done()` to release the client back to the pool
                done();
                if(err) {
                    return console.error('error running query', err);
                }

                callBack(result);

            });
        });
    };

    var fetchCandidatesByOffice = function (office_id, callBack) {
        pg.connect(connection_string, function(error, client, done) {
            if (error) { return console.error('Error fetching client from pool: ', error); }

            var queryConfig = {
              text: 'SELECT * FROM fetch_candidates_by_office_id($1);',
              values: [office_id]
            };

            client.query(queryConfig, function(err, result) {
                //call `done()` to release the client back to the pool
                done();
                if(err) {
                    return console.error('error running query', err);
                }

                callBack(result);

            });
        });
    };

    var fetchAllContributionsByZipCode = function (callBack) {

    };

    var fetchCandidateDetails = function(candidate_id, callBack) {
        pg.connect(connection_string, function(error, client, done) {
            if (error) { return console.error('Error fetching client from pool: ', error); }

            var queryConfig = {
                text: 'SELECT * FROM fetch_candidate_details($1);',
                values: [candidate_id]
            };

            client.query(queryConfig, function(err, result) {
                //call `done()` to release the client back to the pool
                done();
                if(err) {
                    return console.error('error running query', err);
                }

                callBack(result);

            });
        });
    };

    var fetchCandidateMonthlyContributions = function (candidate_id, callBack) {
        pg.connect(connection_string, function(error, client, done) {
            if (error) { return console.error('Error fetching client from pool: ', error); }

            var queryConfig = {
                text: 'SELECT * FROM fetch_candidate_monthly_contributions_by_candidate_id($1);',
                values: [candidate_id]
            };

            client.query(queryConfig, function(err, result) {
                //call `done()` to release the client back to the pool
                done();
                if(err) {
                    return console.error('error running query', err);
                }

                callBack(result);

            });
        });
    };

    var fetchCandidateTopNContributors = function (candidate_id, count, callBack) {
        pg.connect(connection_string, function(error, client, done) {
            if (error) { return console.error('Error fetching client from pool: ', error); }

            var queryConfig = {
                text: 'SELECT * FROM fetch_top_n_contributors_for_candidate($1, $2);',
                values: [candidate_id, count]
            };

            client.query(queryConfig, function(err, result) {
                //call `done()` to release the client back to the pool
                done();
                if(err) {
                    return console.error('error running query', err);
                }

                callBack(result);

            });
        });
    };

    var fetchCandidateTopNOccupations = function (candidate_id, count, callBack) {
        pg.connect(connection_string, function(error, client, done) {
            if (error) { return console.error('Error fetching client from pool: ', error); }

            var queryConfig = {
                text: 'SELECT * FROM fetch_top_n_occupations_by_candidate($1, $2);',
                values: [candidate_id, count]
            };

            client.query(queryConfig, function(err, result) {
                //call `done()` to release the client back to the pool
                done();
                if(err) {
                    return console.error('error running query', err);
                }

                callBack(result);

            });
        });
    };

    var fetchCandidateTopNEmployers = function (candidate_id, count, callBack) {
        pg.connect(connection_string, function(error, client, done) {
            if (error) { return console.error('Error fetching client from pool: ', error); }

            var queryConfig = {
                text: 'SELECT * FROM fetch_top_n_employers_by_candidate($1, $2);',
                values: [candidate_id, count]
            };

            client.query(queryConfig, function(err, result) {
                //call `done()` to release the client back to the pool
                done();
                if(err) {
                    return console.error('error running query', err);
                }

                callBack(result);

            });
        });
    };

    var fetchCandidateTopNZips = function (candidate_id, count, callBack) {
        pg.connect(connection_string, function(error, client, done) {
            if (error) { return console.error('Error fetching client from pool: ', error); }

            var queryConfig = {
                text: 'SELECT * FROM fetch_top_n_zip_codes_for_candidate($1, $2);',
                values: [candidate_id, count]
            };

            client.query(queryConfig, function(err, result) {
                //call `done()` to release the client back to the pool
                done();
                if(err) {
                    return console.error('error running query', err);
                }

                callBack(result);

            });
        });
    };

    var fetchCityData = function (callBack) {
        pg.connect(connection_string, function(error, client, done) {
            if (error) { return console.error('Error fetching client from pool: ', error); }

            var queryConfig = {
                text: 'SELECT * FROM fetch_city_zip_data();'
            };

            client.query(queryConfig, function(err, result) {
                //call `done()` to release the client back to the pool
                done();
                if(err) {
                    return console.error('error running query', err);
                }

                callBack(result);

            });
        });
    };

    return {
        fetchAllCandidates:fetchAllCandidates,
        fetchOffices:fetchOffices,
        fetchCandidatesByOffice:fetchCandidatesByOffice,
        fetchAllContributionsByZipCode:fetchAllContributionsByZipCode,
        fetchCandidateDetails:fetchCandidateDetails,
        fetchCandidateMonthlyContributions:fetchCandidateMonthlyContributions,
        fetchCandidateTopNContributors:fetchCandidateTopNContributors,
        fetchCandidateTopNOccupations:fetchCandidateTopNOccupations,
        fetchCandidateTopNEmployers:fetchCandidateTopNEmployers,
        fetchCandidateTopNZips:fetchCandidateTopNZips,
        fetchCityData:fetchCityData
    }
}();

//