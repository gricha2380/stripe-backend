const STRIPE_SK_KEY=process.env.STRIPE_SK_KEY;
const stripe = require("stripe")(STRIPE_SK_KEY);
const AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'});
const URL = "https://whystripeshouldhireme.com"

const sendResponse = (statusCode, message) => {
	const response = {
		headers: {
			// "Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
			"Content-Type": "application/json"
		},
		statusCode: statusCode,
		body: JSON.stringify(message),
	};
	return response;
};

const handlePost = async event =>{
	 const PRICE_ID = process.env.PRICE_ID;
	 console.log('PRICE_ID', PRICE_ID);
	 try{
		if(!PRICE_ID)	return sendResponse(401, {err:`Item not found`}); 
		const session = await stripe.checkout.sessions.create({
			line_items: [
				{
					price: PRICE_ID,
					quantity: 1,
				},
			],
			mode: 'payment',
			success_url: `${URL}?success=true`,
			cancel_url: `${URL}?canceled=true`,
		});
		console.log("Session created", session);
		console.log("Session url", session.url);
    return sendResponse(200, session);	
  } catch(err){
		console.log("Stripe request hit an error", err);
    return sendResponse(200, { err });
  }
}

exports.handler = async (event) => {
	console.log('inside function. Event:', event);
	console.log('Event method:', event.requestContext.http.method);
	switch (event.requestContext.http.method) {
		case 'POST':
			return handlePost(event);
		case 'OPTIONS':
			return sendResponse(200, {"Allow":"POST"});
	    default:
			return sendResponse(404, `Unsupported method "${event.httpMethod}"`);    
	}
};