<!-- GETTING STARTED -->
## Getting Started

Setting up the bot has is simple enough. You'll need to get your Reddit API Keys, Twitter API Keys, and NPM installed and updated.

### Prerequisites
<ol>
  <li>Youll need to install NPM and Node and have both updated to the newest version. I'd recommend <a href="https://github.com/nvm-sh/nvm"> using NVM </a> or other Node Version Management software.</li>
  <li><a href="https://developer.twitter.com/en/portal/dashboard">Generate Twitter Keys</a>
    <ul>
      <li>Read and Write permissions under "User authentication settings" -> "App permissions"</li>
      <li>Regenerate "Consumer Keys" and save</li>
      <li>Revoke and Regenerate "Access Token and Secret" and save</li>
    </ul>
  </li>
  <li><a href="https://www.reddit.com/prefs/apps">Create Reddit App</a>
    <ul>
      <li>"Create Another App" -> Set type to "Script" -> Redirect URI to <a href="https://not-an-aardvark.github.io/reddit-oauth-helper/">Reddit OAuth Helper</a></li>
      <li>Save Client ID (Will be the long string under the name at the top right of the app)</li>
      <li>Save Client Secret</li>
    </ul>
  </li>
</ol>


### Installation

_Below is an example of how you can instruct your audience on installing and setting up your app. This template doesn't rely on any external dependencies or services._

1. Clone the repo
   ```sh
   git clone https://github.com/Nick90903/Reddit-Repost-Bot.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Enter your API keys into `keys.json`. Refresh token will be made using the <a href="https://not-an-aardvark.github.io/reddit-oauth-helper/">Reddit OAuth Helper</a> being sure to select "Read" and "Permanent" under "Scope Name"

4. Customize the watched subreddit in `config.json`
   ```js
   "subreddit":"YOUR_SUBREDDIT_HERE"
   ```
5. The Twitter post delay (Time from Reddit post made to Tweet posted) in `config.json `
   ```js
   "postDelay":"YOUR_TIME_IN_MS"
   ```
<!-- USAGE EXAMPLES -->
## Usage

#### Changing Tweet Template
<ol>
  <li>Navigate to Utilities.js and open in your preferred editor</li>
  <li>On line 82 you will see the start or the "updateTwitter" function</li>
  <li>Edit each possibility or add your own 
    <ul>
      <li>The first check is making sure the reddit post still exists. This is done to make sure the OP or a moderator of the sub has not removed the post during the delay set earlier. Here you can also add checks for flairs you want ignored</li>
      <li>You can add as many checks as you want with a custom template for each Flair your subreddit has</li>
      <li><code>tit</code> is the object of the Reddit post. You can use any of the operators from the <a href="https://not-an-aardvark.github.io/snoowrap/">Snoowrap Documentation</a>. I only needed the title so the example shows <code>tit.title</code></li>
      <li>The identity of the reddit post, the short string used in the URL of the post, is appended to the end of each of the templates to complete the URL to load the thread in the Twitter post. It is added using <code>ident</code></li>
      <li>The final is a catch for any posts that do not meet any other template and you want posted using a generic template. This one sees the majority of use for the original purpose
    </ul>
    <li>Run <code>npm start</code> in your terminal to start the bot</li>
    <li>You should see the startup text confirming everything started properly, then you will see it checking the sub. The 4 most recent posts will be posted to Twitter then it will wait for any new posts</li>
  </li>
</ol>
