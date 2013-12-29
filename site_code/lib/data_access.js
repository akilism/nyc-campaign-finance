/**
 * Created by akil.harris on 12/14/13.
 */


exports.dataConnection = function() {

    var pg = require('pg');
    var connection_string = 'postgres://akil:12345@192.168.1.56:5432/nyc_campaign_finance';
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

    var fetchCandidateDetails = function (candidate_id, callBack) {

    };

    return {
        fetchAllCandidates:fetchAllCandidates,
        fetchOffices:fetchOffices,
        fetchCandidatesByOffice:fetchCandidatesByOffice,
        fetchAllContributionsByZipCode:fetchAllContributionsByZipCode,
        fetchCandidateDetails:fetchCandidateDetails
    }

}();
