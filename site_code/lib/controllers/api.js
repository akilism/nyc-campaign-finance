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
    var route_params = req.route.params;
//    console.log(route_params);
    data_access.dataConnection.fetchCandidatesByOffice(route_params['office_id'], function(result) {
        res.send(result.rows);
    });
};
