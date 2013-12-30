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

        res.send(result.rows);
    });
};

exports.candidateTopContributors = function (req, res) {
    var routeParams = req.route.params;
    data_access.dataConnection.fetchCandidateTopNContributors(routeParams['candidateId'], routeParams['count'], function(result) {

        res.send(result.rows);
    });
};