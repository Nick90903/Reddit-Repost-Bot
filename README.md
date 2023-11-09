<!-- GETTING STARTED -->
## Getting Started

Setting up the bot is simple enough. You'll need to get your Reddit API Keys, Twitter API Keys, and NPM installed and updated.

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
      <li>Save <a href="https://imgbox.com/IsXjfzM7"> Client ID</a> (Will be the long string underlined in red)</li>
      <li>Save Client Secret</li>
    </ul>
  </li>
</ol>


### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/Nick90903/Reddit-Repost-Bot.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Enter your API keys into `keys.json`. Refresh token will be made using the <a href="https://not-an-aardvark.github.io/reddit-oauth-helper/">Reddit OAuth Helper</a> being sure to select "Read" and "Permanent" under "Scope Name"

4. Customize the watched subreddit in `reddit_config.json`
   ```js
   "subreddit":"Enter_Desired_Sub_Name"
   ```
5. The Twitter post delay (Time from Reddit post made to Tweet posted) in `reddit_config.json `
   ```js
   "postDelay":"YOUR_TIME_IN_MS"
   ```
<!-- USAGE EXAMPLES -->
## Usage

#### Changing Tweet Template
The templates are now stored in `template.json`.
<ol>
  <li>Navigate to `template.json` and open in your preferred editor</li>
  <li>Here you will see an example template</li>
  <li>Edit each possibility or add your own 
    <ul>
      <li>You can make custom templates for any of the supported sites (Twitter(X) is default. FB is in progress now)</li>
      <li>Under each site add each tag you want a specific template for</li>
      <li>Enter `bot_main.js` and head to Line 84. Here you will see the filtering for Reddit Tags.</li>
      <li><code>post</code> is the object of the Reddit post. You can use any of the operators from the <a href="https://not-an-aardvark.github.io/snoowrap/">Snoowrap Documentation</a>. I only needed the title so the example shows <code>post.title</code></li>
      <li>The identity of the reddit post, the short string used in the URL of the post, is appended to the end of each of the templates to complete the URL to load the thread in the Twitter post. It is added using <code>ident</code></li>
      <li>The final is a catch for any posts that do not meet any other template and you want posted using a generic template. This one sees the majority of use for the original purpose
    </ul>
    <li>Run <code>npm start</code> in your terminal to start the bot</li>
    <li>You should see the startup text confirming everything started properly, then you will see it checking the sub. The 4 most recent posts will be posted to Twitter then it will wait for any new posts</li>
  </li>
</ol>
