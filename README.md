NYC Campaign Finance Explorer
================================
### http://nyc.wolvesintheserverroom.com/


Trying my hand at d3.js and AngularJS.

Using node and express for the back end.


### You can checkout the API with calls to:

* All offices: 
  * nyc.wolvesintheserverroom.com/api/office
* Candidates for a specific office by office_id: 
  * nyc.wolvesintheserverroom.com/api/office/`office_id`
* All candidates: 
  * nyc.wolvesintheserverroom.com/api/candidate
* Candidate by candidate_id: 
  * nyc.wolvesintheserverroom.com/api/candidate/`candidate_id`
* Monthly amounts by candidate_id: 
  * nyc.wolvesintheserverroom.com/api/candidate/`candidate_id`/months
* Occupations by candidate_id: 
  * nyc.wolvesintheserverroom.com/api/candidate/`candidate_id`/occupations/`count`
* Contributors by candidate_id: 
  * nyc.wolvesintheserverroom.com/api/candidate/`candidate_id`/contributors/`count`
* Employers by candidate_id: 
  * nyc.wolvesintheserverroom.com/api/candidate/`candidate_id`/employers/`count`
* Zip codes by candidate_id: 
  * nyc.wolvesintheserverroom.com/api/candidate/`candidate_id`/zip_codes/`count`
* All city zip codes by total amounts: 
  * nyc.wolvesintheserverroom.com/api/city

_occupations, contributors, employers, zip codes take a `count` that will determine the amount of results to return._

--
nyc-campaign-finance
