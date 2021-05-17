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
        fulfillmentText: outString
    };
};

// Handle userAsksForRoomTypes
const userAsksForRoomTypes = async (req) => {

    let room_type = req.body.queryResult.parameters.room_type;

    let response = await axios.get(`${BASE_URL}//rooms.types.list`);
    let roomTypes = response.data.roomTypes;
    let outString = 'We have ';
    
    for (let index = 0; index < roomTypes.length; index++) {
        const rt = roomTypes[index];
        if (index == roomTypes.length - 1) {
            outString += `and ${rt}`;
        } else {
            outString += `${rt}, `;
        }
    }

    outString += ' rooms in our premisses.'

    return {
        fulfillmentText: outString
    };
};

// Webhook route
webApp.post('/webhook', async (req, res) => {

    let action = req.body.queryResult.action;

    let responseData = {};

    if (action === 'userProvidesRoomType') {
        responseData = await userProvidesRoomType(req);
    } else if (action === 'userAsksForRoomTypes') {
        responseData = await userAsksForRoomTypes(req);
    } else {
        responseData['fulfillmentText'] = 'Unknown action called.'
    }

    res.send(responseData);
});

// Start the server
webApp.listen(PORT, () => {
    console.log(`Server is up and running at ${PORT}`);
});