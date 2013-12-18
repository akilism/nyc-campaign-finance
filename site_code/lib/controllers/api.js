'use strict';

var data_access = require('../data_access');

exports.candidates = function(req, res) {
    data_access.dataConnection.fetchAllCandidates(function(result){
        res.send(result.rows);
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
