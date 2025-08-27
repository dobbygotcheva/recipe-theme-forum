const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cookieSecret = process.env.COOKIESECRET || 'SoftUni';


module.exports = (app) => {
    // Body parsing middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Cookie parsing middleware
    app.use(cookieParser(cookieSecret));

    // Static file serving
    app.use(express.static(path.resolve(__basedir, 'static')));
    
    // Serve uploaded files
    app.use('/uploads', express.static(path.resolve(__basedir, 'uploads')));
};