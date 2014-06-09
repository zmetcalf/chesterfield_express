var assert = require('chai').assert,
    mongoose = require('mongoose'),
    mockgoose = require('mockgoose'),
    content = require('../../../controllers/content/index');

mockgoose(mongoose);
