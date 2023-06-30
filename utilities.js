const fs = require('fs');
const snoowrap = require('snoowrap');
const { TwitterApi } = require('twitter-api-v2');
const keys = require('./keys.json');
let config;
let log;
let userClient;
let r;
let lastID;
let post;

function loadConfig(file) {
    return new Promise((resolve, reject) => {
        fs.readFile(file, 'utf-8', (err, data) => {
            if (err) reject(err);
            resolve(JSON.parse(data));
        });
    });
}

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
        userAgent: keys.userAgent,
        clientId: keys.clientID,
        clientSecret: keys.clientSecret,
        refreshToken: keys.refreshToken
    });
    console.log('snoowrapper initialized');
};

async function initTwitter() {
    console.log('Connecting to Twitter');
    userClient = new TwitterApi({
        appKey: keys.twitterApiKey,
        appSecret: keys.twitterApiSecret,
        accessToken: keys.twitterAccessToken,
        accessSecret: keys.twitterAccessSecret,
    });
    console.log('Twitter Connected');
}

async function apiGrabNew() {
    config = await loadConfig('./configuration.json');
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

                //  Set up your twitter posts here. Examples have been
                //  included for the original use of r/FreeGameFindings
                
                //  Adding your own should be as simple as filtering
                //  any unwanted flairs and then adding their text
async function updateTwitter(ident) {
    const tit = await r.getSubmission(ident).fetch();
    if(tit.removed_by_category || tit.link_flair_text === "Mod Post"){
        console.log('Post', tit.title, 'Removed from queue');
        return;
    } else if(tit.link_flair_text === 'PSA') {
        try {
            const {data: createdTweet} = await userClient.v2.tweet('A new PSA is live on /r/FGF. \n' + tit.title + '\n \n #FGF #FreeGameFindings \n \n https://redd.it/' + ident);
            console.log('Tweet', createdTweet.id, ':', createdTweet.text);
        } catch (error) {
            console.log(error, 'Twitter error');
        }
    } else {
        try {
            const {data: createdTweet} = await userClient.v2.tweet(tit.title + ' is #Free, see the /r/FreeGameFindings thread below! \n \n #FGF #FreeGameFindings \n https://redd.it/' + ident);
            console.log('Tweet', createdTweet.id, ':', createdTweet.text);
        } catch (error) {
            console.log(error, 'Twitter error');
        }
    }
}

async function startBot() {
    config = await loadConfig('./configuration.json');
    console.log('Starting Reddit Repost Bot');
    await initTwitter();
    initSnoo();
    console.log('Watching', config.subreddit, 'With delay', config.redditDelay, 'ms');
    config.redditDelay > 1000 ? setInterval(apiGrabNew, config.redditDelay) : setInterval(apiGrabNew, 1000);
}

startBot();