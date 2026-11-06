# IGotoHim Church — Responsive Website Prototype

## Pages
Home, About Us, Leadership, Ministries, Sermons, Events, Giving, Contact.

## Preview
Open `index.html` in a browser or serve this folder using any static web server (for example `python -m http.server 8000`). All page links are relative.

## YouTube — automatic newest sermon
Edit `assets/config.js` and enter the **official YouTube channel ID** (`UC` followed by 22 characters) in `youtubeChannelId`. The site derives the channel's uploads playlist (`UU...`) and embeds it on the Home and Sermons pages. The YouTube player follows the newest public uploads automatically, without manually changing the site. If the channel posts non-sermon videos, those may also appear: for sermons-only automation, publish sermons to a dedicated playlist and customize the player to that playlist.

Optional: enter a valid YouTube Data API v3 key in `youtubeApiKey` to display the 5 latest titled video choices. A client-side key should be HTTP-referrer restricted and API restricted; for production, a backend proxy is preferable. The channel ID could not be verified automatically, so it is intentionally blank.

## Other launch configuration
- Add a verified online giving URL to `givingUrl`.
- Add the current Bible Study joining URL to `bibleStudyUrl`.
- Replace illustrative stock photography with authorized church photos.
- Verify Wednesday Bible Study at 7:30 PM; the currently published site says 7 PM.
- Confirm ministry/leadership and special-event information before publishing.
- Contact and prayer forms currently use mailto and require the visitor to send from their own email app. For fully online submissions, integrate a secure form backend with anti-spam and privacy safeguards.
- This is a static prototype; no live site has been changed.
