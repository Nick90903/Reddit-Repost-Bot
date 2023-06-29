const fs = require('fs');
const afs = require('fs/promises');
const snoowrap = require('snoowrap');
const { TwitterApi } = require('twitter-api-v2');
let config = '';
const keys = require('./keys.json');
const { rejects } = require('assert');
let userClient;
let r = '';
let lastID = '';
let post = '';
let title = '';
let id = '';

function loadConfig() {
    return new Promise((resolve, reject) => {
        fs.readFile('./configuration.json', 'utf-8', (err, data) => {
            if (err) reject(err);
            resolve(JSON.parse(data));
        });
    });
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

async function grabNew() {
    config = await loadConfig();
    post = await r.getSubreddit(config.subreddit).getNew({limit: 1});
    title = post[0].title;
    id = post[0].id;
    lastID = config.last;
    saveID();
}

async function saveID() {
    if(lastID == id) return;  
        obj = await loadConfig(); //now it an object
        obj.last = id; //add some data
        json = JSON.stringify(obj); //convert it back to json
        fs.writeFile('./configuration.json', json, 'utf8', (err) => {
            if(err) throw err;
        }); 

    console.log('New post detected, ID:', id, ' Title:', title, ' Posting to Twitter in', config.postDelay, ' ms');
    setTimeout(() => updateTwitter(id), config.postDelay);
}

async function updateTwitter(ident) {
    const tit = await r.getSubmission(ident).fetch();
    if(tit.removed_by_category){
        console.log('Post', tit.title, 'Removed')
    } else {
        //Edit the body of the tweet here.
        const {data: createdTweet} = await userClient.v2.tweet(tit.title + ' is #Free on r/FGF \n \n #FGF #FreeGameFindings \n https://www.reddit.com/comments/' + ident)
       console.log('Tweet', createdTweet.id, ':', createdTweet.text);
    }
}

async function startBot() {
    config = await loadConfig();
    console.log('Starting Reddit Repost Bot');
    initSnoo();
    await initTwitter();
    console.log('Watching', config.subreddit);
    config.redditDelay > 1000 ? setInterval(grabNew, config.redditDelay) : setInterval(grabNew, 1000);
}

startBot();