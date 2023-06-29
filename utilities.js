const fs = require('fs');
const afs = require('fs/promises');
const snoowrap = require('snoowrap');
const { TwitterApi } = require('twitter-api-v2');
let config = '';
const keys = require('./keys.json');
let userClient;
let r = '';
let lastID = '';
let post = '';
let title = '';
let id = '';

function initSnoo() {
    console.log('Connecting to Reddit');
    fs.readFile('./configuration.json',(err, data) => {config = JSON.parse(data)})
    r = new snoowrap({
        userAgent: keys.userAgent,
        clientId: keys.clientID,
        clientSecret: keys.clientSecret,
        refreshToken: keys.refreshToken
    });
    console.log('snoowrapper initialized');
};

async function grabNew() {
    fs.readFile('./configuration.json',(err, data) => {config = JSON.parse(data)})
    post = await r.getSubreddit(config.subreddit).getNew({limit: 1});
    title = post[0].title;
    id = post[0].id;
    lastID = config.last;
    saveID();
}

function saveID() {
    if(lastID == id) {
    } else {
        fs.readFile('./configuration.json',(err, data) => {
            if (err){
                console.log(err);
            } else {
            obj = JSON.parse(data); //now it an object
            obj.last = id; //add some data
            json = JSON.stringify(obj); //convert it back to json
            fs.writeFile('./configuration.json', json, 'utf8', (err) => {
                if(err) throw err;
            }); // write it back 
        }});
        console.log('New post detected, ID:', id, ' Title:', title, ' Posting to Twitter in', config.postDelay, ' ms');
        setTimeout(() => updateTwitter(id), config.postDelay);
    }
}

async function updateTwitter(ident) {
    const tit = await r.getSubmission(ident).fetch();
    if(tit.removed_by_category){
        console.log('Post', tit.title, 'Removed')
    } else {
        //Edit the body of the tweet here.
        const {data: createdTweet} = await userClient.v2.tweet(tit.title + 'is #Free on r/FGF \n \n #FGF #FreeGameFindings \n https://www.reddit.com/comments/' + ident)
       console.log('Tweet', createdTweet.id, ':', createdTweet.text);
    }
}

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

async function startBot() {
    const data = await afs.readFile('./configuration.json', {encoding: 'utf-8'});
    config = JSON.parse(data);
    console.log('Starting Reddit Repost Bot');
    initSnoo();
    await initTwitter();
    console.log('Watching', config.subreddit);
    config.redditDelay > 1000 ? setInterval(grabNew, config.redditDelay) : setInterval(grabNew, 1000);
}

startBot();