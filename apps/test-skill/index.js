module.change_code = 1;
'use strict';

var alexa = require( 'alexa-app' );
var app = new alexa.app('oneStopCareer');
var elasticsearch = require('elasticsearch');
app.launch( function( request, response ) {
	response.say( 'Welcome to One Stop Career. What can I do for you today ? ' ).reprompt( 'What can I do for you today' ).shouldEndSession( false );
} );

var client = new elasticsearch.Client({
  host: 'http://localhost:9200/'
});
app.error = function( exception, request, response ) {
	console.log(exception)
	console.log(request);
	console.log(response);
	response.say( 'Sorry an error occured ' + error.message);
};

app.intent('oneStopCareer',
  {
    "slots":{
			"jobtitle" : "AMAZON.Person" ,
			"positionType" : "AMAZON.Person" ,
			"skill" : "AMAZON.Person"
		},
	"utterances":[
		"oneStopCareer	I am looking for {positionType} positions for {jobtitle} roles",
		"oneStopCareer	I am looking for {positionType} positions for {jobtitle} jobs",
		"oneStopCareer	Show me {positionType} positions for {jobtitle} jobs",
		"oneStopCareer	I have {skill} skills",
		"oneStopCareer	I know {skill} skills"
		]
  },
  function(request,response) {
    var jobtitle = request.slot('jobtitle');
		var session = request.getSession();
		var positionType = request.slot('positionType');
		if(session.get('jobtitle') == undefined)
			session.set('jobtitle', jobtitle);
		if(session.get('positionType') == undefined)
			session.set('positionType', positionType);
		var skill = request.slot('skill');
		if(skill === undefined){
				response.say('Tell me about your skills to do a better search for you.').reprompt(
					'Tell me about your skills to do a better search for you.').shouldEndSession(false);
						skill = request.slot('skill');
						session.set('skill', skill);

		}else{
			response.say("You have 5 matching job as per your preference. Those companies are : Amazon, Google, Microsoft, IBM, Raytheon. I will mail you the details");
			client.search({
			index: 'resume_directory',
			type: 'resume_info',
			body: {
				"query": {
					"bool": {
							"should": [
								 {"match": {
											"skill": skill }},
											{"match": {
											"jobtitle": session.get('jobtitle') }}
							]
					}
			}
			}
		}).then(function (data) {
				// console.log(resp);
				var hits = data.hits.hits;
				output = "You have "+hits.length+" jobs matching your preference. Here are the list of comapnies";
				// console.log(output);
				for(var i=0; i< hits.length; i++){
					output+= hits[i]._source.company_name + " ";
				}
				response.say(output);
				// console.log(output);

			});



}
});

function createOutput(session,skill, globalResp){

}
module.exports = app;
