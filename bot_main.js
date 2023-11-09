const fs = require('fs');
const snoowrap = require('snoowrap');
const { TwitterApi } = require('twitter-api-v2');
const rConf = require('./reddit_config.json');
const tConf = require('./twitter_config.json');
let config;
let log;
let userClient;
let r;
let lastID;
let post;
let templates;

// Used to load any configuration file
function loadConfig(file) {
    return new Promise((resolve, reject) => {
        fs.readFile(file, 'utf-8', (err, data) => {
            if (err) reject(err);
            resolve(JSON.parse(data));
        });
    });
}

// Used to save any file
function saveFile(file, obj) {
    return new Promise((resolve, reject) => {
        json = JSON.stringify(obj);
        fs.writeFile(file, json, 'utf-8', (err) => {if(err) reject(err)});
        resolve();
    })
}

function initSnoo() {
    console.log('Connecting to Reddit');
    r = new snoowrap({
        userAgent: rConf.userAgent,
        clientId: rConf.clientID,
        clientSecret: rConf.clientSecret,
        refreshToken: rConf.refreshToken
    });
    console.log('snoowrapper initialized');
};

async function initTwitter() {
    console.log('Connecting to Twitter');
    userClient = new TwitterApi({
        appKey: tConf.apiKey,
        appSecret: tConf.apiSecret,
        accessToken: tConf.accessToken,
        accessSecret: tConf.accessSecret,
    });
    console.log('Twitter Connected');
}

// Reloads all config files (So they can be changed without closing the bot) then checks the 4 most recent posts
async function apiGrabNew() {
    config = await loadConfig('./reddit_config.json');
    log = await loadConfig('./log.json');
    try{
        post = await r.getSubreddit(config.subreddit).getNew({limit: 4});
        console.log('Checking for new posts, Newest ID:', post[0].id);
        if(post[0].id == lastID) return;
        newDetected(post);
    } catch (error) {
        console.log(error, 'Reddit error');
    }
}

function newDetected(posts) {
    posts.forEach(item => {
        if(log.posted.includes(item.id)) return;
        console.log('New Post Detected', item.title, item.id);
        log.posted.shift();
        log.posted.push(item.id)
        lastID = item.id;
        saveFile('./log.json', log);
        console.log('New post detected, ID:', item.id, ' Title:', item.title, ' Posting to Twitter in', config.postDelay, ' ms');
        setTimeout(() => updateTwitter(item.id), config.postDelay);
    });
}

//  Set up your twitter posts here. Examples have been included for the original use of r/FreeGameFindings
//  Adding your own should be as simple as filtering any unwanted flairs and then adding their text
async function updateTwitter(ident) {
    const post = await r.getSubmission(ident).fetch();
    // Removes deleted/Removed and "Mod Posts" from repost queue
    if(post.removed_by_category || post.link_flair_text === "Mod Post"){
        console.log('Post', post.title, 'Removed from queue');
        return;
    // Custom template for "PSA" posts
    } else if(post.link_flair_text === 'PSA') {
        try {
            const {data: createdTweet} = await userClient.v2.tweet(templates.TTemplate.PSA.a + post.title + templates.TTemplate.PSA.a + ident);
            console.log('Tweet', createdTweet.id, ':', createdTweet.text);
        } catch (error) {
            console.log(error, 'Twitter error');
        }
    // Uses default template for all other posts
    } else {
        try {
            const {data: createdTweet} = await userClient.v2.tweet(post.title + templates.TTemplate.Base.a + ident);
            console.log('Tweet', createdTweet.id, ':', createdTweet.text);
        } catch (error) {
            console.log(error, 'Twitter error');
        }
    }
}

async function startBot() {
    config = await loadConfig('./reddit_config.json');
    templates = await loadConfig('./template.json');
    console.log('Starting Reddit Repost Bot');
    await initTwitter();
    initSnoo();
    console.log('Watching', config.subreddit, 'With delay', config.redditDelay, 'ms');
    config.redditDelay > 1000 ? setInterval(apiGrabNew, config.redditDelay) : setInterval(apiGrabNew, 1000);
}

startBot();