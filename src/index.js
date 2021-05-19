// external packages
const express = require('express');
require('dotenv').config();
const axios = require('axios');

// Start the webapp
const webApp = express();

// Webapp settings
webApp.use(express.urlencoded({
    extended: true
}));
webApp.use(express.json());

// Server Port
const PORT = process.env.PORT || 5000;

// Home route
webApp.get('/', (req, res) => {
    res.send(`Hello World.!`);
});

const BASE_URL = process.env.BASE_URL;

// Handle userProvidesRoomType
const userProvidesRoomType = async (req) => {

    let room_type = req.body.queryResult.parameters.room_type;

    let response = await axios.get(`${BASE_URL}/rooms.price.list`);
    let roomTypes = response.data.roomTypes;
    let outString = '';
    roomTypes.forEach(rt => {
        if (rt.room_type === room_type) {
            outString += `The per night rate for ${room_type} is ${rt.price} rupees.`;
        }
    });

    if (outString === '') {
        outString += 'Something is wrong at getting price list.'
    }

    return {
        fulfillmentText: JSON.stringify({
            text: outString,
            buttons: ['Book a room', 'Connect with agent']
        })
    };
};

// Handle userAsksForRoomTypes
const userAsksForRoomTypes = async () => {

    let response = await axios.get(`${BASE_URL}//rooms.types.list`);
    let roomTypes = response.data.roomTypes;
    let outString = 'We have following type of rooms in our premisses.';
    let buttons = [];
    
    for (let index = 0; index < roomTypes.length; index++) {
        const rt = roomTypes[index];
        buttons.push(rt);
    }

    return {
        fulfillmentText: JSON.stringify({
            text: outString,
            buttons: buttons
        })
    };
};

// Handle userAsksForPricing
const userAsksForPricing = async () => {

    let response = await axios.get(`${BASE_URL}//rooms.types.list`);
    let roomTypes = response.data.roomTypes;
    let outString = 'I can help you with that, which type of room are you looking for?';
    let buttons = [];
    
    for (let index = 0; index < roomTypes.length; index++) {
        const rt = roomTypes[index];
        buttons.push(rt);
    }

    return {
        fulfillmentText: JSON.stringify({
            text: outString,
            buttons: buttons
        })
    };
};

// Handle userProvideName
const userProvideName = (req) => {

    let person = req.body.queryResult.parameters.person.name;

    return {
        fulfillmentText: JSON.stringify({
            text: `Thank you ${person}, what is email address?`,
            buttons: []
        })
    };
};

// Webhook route
webApp.post('/webhook', async (req, res) => {

    let action = req.body.queryResult.action;
    console.log('Webhook called.');
    console.log(`Action name --> ${action}`);
    console.log(`Session --> ${req.body.session}`);

    let responseData = {};

    if (action === 'userProvidesRoomType') {
        responseData = await userProvidesRoomType(req);
    } else if (action === 'userAsksForRoomTypes') {
        responseData = await userAsksForRoomTypes();
    } else if (action === 'userAsksForPricing') {
        responseData = await userAsksForPricing();
    } else if (action === 'userProvideName') {
        responseData = userProvideName(req);
    } else {
        responseData['fulfillmentText'] = 'Unknown action called.'
    }

    res.send(responseData);
});

const DF = require('../helper-functions/dialogflow_apicalls');

// Website route
webApp.post('/website', async (req, res) => {

    let queryText = req.body.queryText;
    let sessionId = req.body.sessionId;
    let languageCode = req.body.languageCode;

    let intentData = await DF.detectIntent(queryText, sessionId, languageCode);
    if (intentData.status == 200) {
        res.json(JSON.parse(intentData.data));
    } else {
        res.status(400).send('Invalid input data');
    }
});

// Start the server
webApp.listen(PORT, () => {
    console.log(`Server is up and running at ${PORT}`);
});