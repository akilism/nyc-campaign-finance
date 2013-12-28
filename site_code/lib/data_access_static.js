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
                total: 139282823.83,
                ratio: 23.5
            },
            {
                candidate_id: 3,
                name: 'Test 3',
                total: 8338823.83,
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
                id: 5,
                count: 218,
                office: 'City Council',
                total: 14198497.57
            },
            {
                id: 2,
                count: 5,
                office: 'Comptroller',
                total: 3732385.69
            },
            {
                id: 4,
                count: 23,
                office: 'Borough President',
                total: 2436294.37
            },
            {
                id: 9,
                count: 5,
                office: 'Public Advocate',
                total: 2144979.04
            },
            {
                id: 1,
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
                    { 'total': 4000000.00, 'id': 1, 'name': 'Doctor' },
                    { 'total': 5000000.00, 'id': 6, 'name': 'Baker' },
                    { 'total': 7000000.95, 'id': 2, 'name': 'Web Developer' },
                    { 'total': 3000000.00, 'id': 3, 'name': 'Investment Banker' }
                ],
                'employers': [
                    { 'total': 10000000.00, 'id': 1, 'name': 'Sloan-Kettering' },
                    { 'total': 5500000.95, 'id': 2, 'name': 'Google Inc.' },
                    { 'total': 3500000.00, 'id': 3, 'name': 'Goldman Sachs' }
                ],
                'contributors': [
                    { 'total': 4500000.00, 'id': 1, 'name': 'John Doe' },
                    { 'total': 5500000.00, 'id': 6, 'name': 'Max Smith' },
                    { 'total': 4500000.95, 'id': 2, 'name': 'Jane Doe' },
                    { 'total': 3000000.00, 'id': 3, 'name': 'Mary Jones' },
                    { 'total': 1000000.00, 'id': 4, 'name': 'Patty Smith' },
                    { 'total': 1500000.00, 'id': 5, 'name': 'Amber Tillman' }
                ],
                zip_data: {
                    "type": "Feature",
                    "id": 52,
                    "properties": {
                        "OBJECTID": 53,
                        "postalCode": "10040",
                        "PO_NAME": "New York",
                        "STATE": "NY",
                        "borough": "Manhattan",
                        "ST_FIPS": "36",
                        "CTY_FIPS": "061",
                        "BLDGpostalCode": 0,
                        "Shape_Leng": 24554.784403400000883,
                        "Shape_Area": 16340742.7954,
                        "@id": "http:\/\/nyc.pediacities.com\/Resource\/PostalCode\/10040" },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [ [ [ -73.933788988188951, 40.863071872995604 ], [ -73.932977908529935, 40.865107954039317 ], [ -73.932055275158902, 40.866632924574624 ], [ -73.930996628019059, 40.866809982700893 ], [ -73.929450001070975, 40.865776164509157 ], [ -73.927300373820628, 40.865535388200826 ], [ -73.922949989656743, 40.858868994351248 ], [ -73.921623453737809, 40.860774734556891 ], [ -73.919846237473976, 40.859897805580943 ], [ -73.919379751851423, 40.860527189931098 ], [ -73.918390821764774, 40.860106737364084 ], [ -73.919505142214319, 40.858783963826653 ], [ -73.920662494740682, 40.859283445484543 ], [ -73.921328760414383, 40.86026678799297 ], [ -73.921496423270597, 40.860220395465419 ], [ -73.921862434427936, 40.859173416687995 ], [ -73.921243309047298, 40.858868484919014 ], [ -73.921053247144428, 40.858350579182797 ], [ -73.920758909223622, 40.858140339735968 ], [ -73.920796368482996, 40.857981272150546 ], [ -73.921549655659732, 40.857294031543361 ], [ -73.921583838464372, 40.857061112191822 ], [ -73.921909045361915, 40.856923567563243 ], [ -73.921961717437398, 40.856686844318084 ], [ -73.922240446037691, 40.856592760114928 ], [ -73.922375202625588, 40.856021197538695 ], [ -73.922270518275809, 40.855642946902229 ], [ -73.924316916506541, 40.853012853007023 ], [ -73.928480766882558, 40.846982967849748 ], [ -73.930884298922194, 40.848118956988955 ], [ -73.93062108080143, 40.848480999466993 ], [ -73.929727025454227, 40.848177924419836 ], [ -73.928876622425591, 40.849394041089113 ], [ -73.92747679283157, 40.850694399361906 ], [ -73.927045546767616, 40.851555289379952 ], [ -73.927102693809545, 40.852215121172399 ], [ -73.927695651580578, 40.852487812004014 ], [ -73.928151157478965, 40.851863350802304 ], [ -73.93355655605933, 40.854142245185649 ], [ -73.937787691425854, 40.85537404141855 ], [ -73.937953322227443, 40.855569573191495 ], [ -73.936576120127086, 40.857350531084421 ], [ -73.937688907185006, 40.857651755474727 ], [ -73.936551677265015, 40.859095036316432 ], [ -73.935338894864728, 40.859978440176207 ], [ -73.934841119744974, 40.861457552123454 ], [ -73.933788988188951, 40.863071872995604 ] ] ]
                    },
                    "total": 10000000.00
                }
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
