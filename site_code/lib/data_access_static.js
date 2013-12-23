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
                    'total': 641975.30,
                    'party_totals': {
                        1: 141900.00,
                        2: 100000.00,
                        4: 175.30
                    },
                    'zip_code': '10023'
                },
                {
                    'count': 923,
                    'total': 640638.18,
                    'party_totals': {
                        1: 241900.00,
                        2: 200000.00,
                        4: 275.30
                    },
                    'zip_code': '10021'
                },
                {
                    'count': 1795,
                    'total': 612626.18,
                    'party_totals': {
                        1: 341900.00,
                        2: 300000.00,
                        4: 375.30
                    },
                    'zip_code': '10024'
                },
                {
                    'count': 1586,
                    'total': 527475.18,
                    'party_totals': {
                        1: 441900.00,
                        2: 400000.00,
                        4: 475.30
                    },
                    'zip_code': '11201'
                },
                {
                    'count': 890,
                    'total': 477145.18,
                    'party_totals': {
                        1: 541900.00,
                        2: 500000.00,
                        4: 575.30
                    },
                    'zip_code': '10028'
                },
                {
                    'count': 1316,
                    'total': 454358.83,
                    'party_totals': {
                        1: 641900.00,
                        2: 600000.00,
                        4: 675.30
                    },
                    'zip_code': '10011'
                }
            ]
        });
    };

    return {
        fetchAllCandidates:fetchAllCandidates,
        fetchOffices:fetchOffices,
        fetchCandidatesByOffice:fetchCandidatesByOffice,
        fetchAllContributionsByZipCode:fetchAllContributionsByZipCode
    }

}();
