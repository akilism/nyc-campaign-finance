/**
 * Created by akil.harris on 12/14/13.
 */


exports.dataConnection = function() {

    var pg = require('pg');
    var connection_string = 'postgres://akil:12345@localhost:5432/nyc_campaign_finance';
    var client = new pg.Client(connection_string);

    var fetchAllCandidates = function (callBack) {
        callBack({ 'rows': [
            {
                candidate_id: 1,
                name: 'Test 1',
                total: 19282838823.83,
                ratio: 45.5
            },
            {
                candidate_id: 2,
                name: 'Test 2',
                total: 19282823.83,
                ratio: 23.5
            },
            {
                candidate_id: 3,
                name: 'Test 3',
                total: 838823.83,
                ratio: 15.5
            },
            {
                candidate_id: 4,
                name: 'Test 4',
                total: 38823.83,
                ratio: 5.5
            }
        ]});
    };

//    5;"City Council                                                                                        ";218;$4,198,497.57
//    3;"Comptroller                                                                                         ";5;$3,732,385.69
//    4;"Borough President                                                                                   ";23;$2,436,294.37
//    2;"Public Advocate                                                                                     ";5;$2,144,979.04
//    1;"Mayor                                                                                               ";23;$426,451.50

    var fetchOffices = function (callBack) {
        console.log('Fetching Static Offices.')
        callBack({ 'rows': [
            {
                officeId: 5,
                count: 218,
                office: 'City Council',
                total: 4198497.57
            },
            {
                officeId: 2,
                count: 5,
                office: 'Comptroller',
                total: 3732385.69
            },
            {
                officeId: 4,
                count: 23,
                office: 'Borough President',
                total: 2436294.37
            },
            {
                officeId: 2,
                count: 5,
                office: 'Public Advocate',
                total: 2144979.04
            },
            {
                officeId: 1,
                count: 23,
                office: 'Mayor',
                total: 426451.50
            }
        ]});
    };

    var fetchCandidatesByOffice = function (office_id, callBack) {
        callBack({ 'rows': [
            {
                candidate_id: 1,
                name: 'Test 1',
                total: 19282838823.83,
                ratio: 45.5
            },
            {
                candidate_id: 2,
                name: 'Test 2',
                total: 19282823.83,
                ratio: 23.5
            },
            {
                candidate_id: 3,
                name: 'Test 3',
                total: 838823.83,
                ratio: 15.5
            },
            {
                candidate_id: 4,
                name: 'Test 4',
                total: 38823.83,
                ratio: 5.5
            }
        ]});
    };

    var fetchAllContributionsByZipCode = function(callBack) {
        callBack({
            'rows': [
                {
                    'count': 1768,
                    'total': 193900.00,
                    'party_totals': [
                        {party_id: 1, total: 141900.00, color: '#cc00ff'},
                        {party_id: 2, total: 100000.00, color: '#ffcc00'},
                        {party_id: 3, total: 42000.00, color: '#00ffcc'}
                    ],
                    'zip_code': '10023'
                },
                {
                    'count': 923,
                    'total': 303900.00,
                    'party_totals': [
                        {party_id: 1, total: 241900.00, color: '#cc00ff'},
                        {party_id: 2, total: 200000.00, color: '#ffcc00'},
                        {party_id: 3, total: 42000.00, color: '#00ffcc'}
                    ],
                    'zip_code': '10021'
                },
                {
                    'count': 1795,
                    'total': 683900.00,
                    'party_totals': [
                        {party_id: 1, total: 341900.00, color: '#cc00ff'},
                        {party_id: 2, total: 300000.00, color: '#ffcc00'},
                        {party_id: 3, total: 42000.00, color: '#00ffcc'}
                    ],
                    'zip_code': '10024'
                },
                {
                    'count': 1586,
                    'total': 883900.00,
                    'party_totals': [
                        {party_id: 1, total: 441900.00, color: '#cc00ff'},
                        {party_id: 2, total: 400000.00, color: '#ffcc00'},
                        {party_id: 3, total: 42000.00, color: '#00ffcc'}
                    ],
                    'zip_code': '11201'
                },
                {
                    'count': 890,
                    'total': 1083900.0,
                    'party_totals': [
                        {party_id: 1, total: 541900.00, color: '#cc00ff'},
                        {party_id: 2, total: 500000.00, color: '#ffcc00'},
                        {party_id: 3, total: 42000.00, color: '#00ffcc'}
                    ],
                    'zip_code': '10028'
                },
                {
                    'count': 1316,
                    'total': 1283900.00,
                    'party_totals': [
                        {party_id: 1, total: 641900.00, color: '#cc00ff'},
                        {party_id: 2, total: 600000.00, color: '#ffcc00'},
                        {party_id: 3, total: 42000.00, color: '#00ffcc'}
                    ],
                    'zip_code': '10011'
                }
            ]
        });
    };

    var fetchCandidateDetails = function(callBack) {
        callBack({'rows': [{
                'name': 'Bill de Blasio',
                'cfb_id': '132',
                'total': 19000000.95,
                'office': 'Mayor',
                'year': 2013,
                'candidate_id': 42,
                'occupations': [
                    { 'total': 4000000.00, 'occupation_id': 1, 'name': 'Doctor' },
                    { 'total': 5000000.00, 'occupation_id': 1, 'name': 'Baker' },
                    { 'total': 7000000.95, 'occupation_id': 2, 'name': 'Web Developer' },
                    { 'total': 3000000.00, 'occupation_id': 3, 'name': 'Investment Banker' }
                ],
                'employers': [
                    { 'total': 10000000.00, 'employer_id': 1, 'name': 'Sloan-Kettering' },
                    { 'total': 5500000.95, 'employer_id': 2, 'name': 'Google Inc.' },
                    { 'total': 3500000.00, 'employer_id': 3, 'name': 'Goldman Sachs' }
                ]
            }
        ]});
    };

    return {
        fetchAllCandidates:fetchAllCandidates,
        fetchOffices:fetchOffices,
        fetchCandidatesByOffice:fetchCandidatesByOffice,
        fetchAllContributionsByZipCode:fetchAllContributionsByZipCode,
        fetchCandidateDetails:fetchCandidateDetails
    }

}();
