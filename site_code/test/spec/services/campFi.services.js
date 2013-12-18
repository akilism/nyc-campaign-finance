'use strict';

describe('Service: CampfiServices', function () {

  // load the service's module
  beforeEach(module('nycCampaignFinanceApp'));

  // instantiate service
  var CampfiServices;
  beforeEach(inject(function (_CampfiServices_) {
    CampfiServices = _CampfiServices_;
  }));

  it('should do something', function () {
    expect(!!CampfiServices).toBe(true);
  });

});
