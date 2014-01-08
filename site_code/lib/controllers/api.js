'use strict';

var data_access = require('../data_access');

exports.candidates = function(req, res) {
    data_access.dataConnection.fetchAllCandidates(function(result){
        res.send(result.rows);
    });
};

exports.candidateDetails = function(req, res) {
    var routeParams = req.route.params;
    data_access.dataConnection.fetchCandidateDetails(routeParams['candidateId'], function(result){
        var candidate = result.rows[0];
        candidate.year = 2013;
        res.send(candidate);
    });
};

exports.offices = function (req, res) {
    data_access.dataConnection.fetchOffices(function(result) {

        for(var row in result.rows) {
            result.rows[row].id = result.rows[row].office_id;
            result.rows[row].office = result.rows[row].office.trim();
            result.rows[row].total_contributions = parseFloat(result.rows[row].total_contributions);
            result.rows[row].total_debits = parseFloat(result.rows[row].total_debits);
        }

        res.send(result.rows);
    });
};

exports.candidatesByOffice = function(req, res) {
    var routeParams = req.route.params;
//    console.log(route_params);
    data_access.dataConnection.fetchCandidatesByOffice(routeParams['officeId'], function(result) {
        res.send(result.rows);
    });
};

exports.zipCodes = function (req, res) {
    data_access.dataConnection.fetchAllContributionsByZipCode(function(result) {
        res.send(result.rows);
    });
};

exports.candidateMonthly = function (req, res) {
    var routeParams = req.route.params;
    data_access.dataConnection.fetchCandidateMonthlyContributions(routeParams['candidateId'], function(result) {

        res.send(result.rows);
    });
};

exports.candidateTopOccupations = function (req, res) {
    var routeParams = req.route.params;
    data_access.dataConnection.fetchCandidateTopNOccupations(routeParams['candidateId'], routeParams['count'], function(result) {

        for(var row in result.rows) {
            result.rows[row].id = result.rows[row].occupation_id;
            result.rows[row].name = result.rows[row].occupation.trim();
            result.rows[row].total_contributions = parseFloat(result.rows[row].total_contributions);
        }

        res.send(result.rows);
    });
};

exports.candidateTopContributors = function (req, res) {
    var routeParams = req.route.params;
    data_access.dataConnection.fetchCandidateTopNContributors(routeParams['candidateId'], routeParams['count'], function(result) {

        for(var row in result.rows) {
            result.rows[row].id = result.rows[row].contributor_id;
            result.rows[row].name = result.rows[row].name.trim();
            result.rows[row].total_contributions = parseFloat(result.rows[row].total);
        }

        res.send(result.rows);
    });
};

exports.candidateTopEmployers = function (req, res) {
    var routeParams = req.route.params;
    data_access.dataConnection.fetchCandidateTopNEmployers(routeParams['candidateId'], routeParams['count'], function(result) {

        for(var row in result.rows) {
            result.rows[row].id = result.rows[row].employer_id;
            result.rows[row].name = result.rows[row].employer.trim();
            result.rows[row].total_contributions = parseFloat(result.rows[row].total_contributions);
        }

        res.send(result.rows);
    });
};

exports.candidateTopZips = function (req, res) {
    var routeParams = req.route.params;
    data_access.dataConnection.fetchCandidateTopNZips(routeParams['candidateId'], routeParams['count'], function(result) {

//        for(var row in result.rows) {
//            result.rows[row].zip_code = result.rows[row].zip_code.trim();
//            result.rows[row].total_contributions = parseFloat(result.rows[row].total);
//        }

        res.send(result.rows[0].zip_json);
    });
};

exports.city = function (req, res) {
    var routeParams = req.route.params;
    data_access.dataConnection.fetchCityData(function(result) {
        res.send(result.rows[0].city_json);
    });
};