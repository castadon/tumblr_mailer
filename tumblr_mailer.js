var tumblr = require('tumblr.js');
var fs = require('fs');
var ejs = require('ejs');

var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('D10ohfZ59PeobpDus8XcNw');

var csvFile = fs.readFileSync("friend_list.csv","utf8");
var emailTemplate = fs.readFileSync('email_template.html', 'utf8');

var str = csvFile.toString();
var res = str.split("\n");
var friendList = [];
for (var i = 1; i < res.length; i++) {

	var friend = res[i].split(",");
	if (friend[0] !== '') friendList.push({	
					firstName: friend[0],
					lastName: friend[1],
					numMonthsSinceContact: friend[2],
					emailAddress: friend[3]
	});
};// I have the friend list

var client = tumblr.createClient({
  consumer_key: 's42prYKNWWF1vX5XwybL3Qfee8oBtEi38OwYMVzrxMXAKsU8eU',
  consumer_secret: 'QVx5yv1sBuPVVrMRD8UFiAKgqcXxxbbqEHvKSR0VEb1dMn30PB',
  token: 'ITUUuweW74V2urJWm8sJgqDVnh4IVpxQZ0VQh91sKXgiB0Gtc5',
  token_secret: 'H4yBEPGkHz79lqJl5XOFJGxyRwmaTLlnxOeJ7yfLFbvGxa4Dus'
});

client.posts('castadon.tumblr.com', function(err, blog){
	  
	  var latestPosts = [];
	  var oneWeekAgo = new Date();
	  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

	  blog.posts.forEach(function(post){
	  	if ( oneWeekAgo.getTime() < (post.timestamp)*1000 )
	  		latestPosts.push(post);
	  });

	  friendList.forEach(function(friend){
			
			firstName = friend['firstName'];
			numMonthsSinceContact = friend['numMonthsSinceContact'];
			copyTemplate = emailTemplate;
			
			var customizedTemplate = ejs.render(copyTemplate, {firstName: firstName,
									   numMonthsSinceContact: numMonthsSinceContact,
									   latestPosts: latestPosts									
			 });
 			//console.log(customizedTemplate);
			sendEmail(firstName, friend["emailAddress"], "Miguel", "armandssor@yahoo.com", "My latests posts", customizedTemplate);			
		
		});
});
	 
// AUX FUNCTIONS *************************

function sendEmail(to_name, to_email, from_name, from_email, subject, message_html){
	var message = {
	    "html": message_html,
	    "subject": subject,
	    "from_email": from_email,
	    "from_name": from_name,
	    "to": [{
	            "email": to_email,
	            "name": to_name
	        }],
	    "important": false,
	    "track_opens": true,    
	    "auto_html": false,
	    "preserve_recipients": true,
	    "merge": false,
	    "tags": [
	        "Fullstack_Tumblrmailer_Workshop"
	    ]    
	};
	var async = false;
	var ip_pool = "Main Pool";
	mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {
	    	      
	}, function(e) {
	    // Mandrill returns the error as an object with name and message keys
	    console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
	    // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
	});
}
 