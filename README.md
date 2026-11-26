# Roybabu Mangayomi Extensions

Experimental manga and anime sources for Mangayomi.

## Add all repositories at once

[Add Manga, Anime and Novels to Mangayomi](https://intradeus.github.io/http-protocol-redirector?r=mangayomi%3A%2F%2Fadd-repo%3Frepo_name%3DRoybabu%2520Extensions%26repo_url%3Dhttps%3A%2F%2Fgithub.com%2FRoybabu%2FMangayomi-extension-%26manga_url%3Dhttps%3A%2F%2Fraw.githubusercontent.com%2FRoybabu%2FMangayomi-extension-%2Fmain%2Findex.json%26anime_url%3Dhttps%3A%2F%2Fraw.githubusercontent.com%2FRoybabu%2FMangayomi-extension-%2Fmain%2Fanime_index.json%26novel_url%3Dhttps%3A%2F%2Fraw.githubusercontent.com%2FRoybabu%2FMangayomi-extension-%2Fmain%2Fnovel_index.json)

The Novel catalog includes RoyalRoad (community maintained). Sources have not been tested on Mangayomi 0.9.97.

## Add the manga repository manually

In Mangayomi, open Settings > Browse and add the following as a manga extension repository:

```
https://raw.githubusercontent.com/Roybabu/Mangayomi-extension-/main/index.json
```

Refresh the extension list and install **Read Comics Online**, **Rizz Fables**, **Grabber Zone**, **Webtoons**, or **Comick.live (Unofficial)**.

## Status

The sources were written using the website layout observed in November 2026. They have not yet been tested in Mangayomi 0.9.97 or on Android. Test browsing, searching, chapters and images; the website may require security verification via the source WebView.

Grabber Zone and Webtoons are based on [m2k3a/mangayomi-extensions](https://github.com/m2k3a/mangayomi-extensions), licensed under Apache 2.0. The Webtoons source is modified to use the mobile domain and return manga chapters.

Comick.live is an unofficial namesake and is separate from comick.dev. The Comick.live source is adapted from [Keiyoushi extensions-source](https://github.com/keiyoushi/extensions-source), Apache-2.0.

## Anime repository

Add this URL to the anime repository list in Mangayomi:

```
https://raw.githubusercontent.com/Roybabu/Mangayomi-extension-/main/anime_index.json
```

UHDMovies is experimental. It indexes third-party download hosts and playback has not been verified in Mangayomi. UHDMovies is adapted from [m2k3a/mangayomi-extensions](https://github.com/m2k3a/mangayomi-extensions) under Apache-2.0, with the site domain and download parsing updated.
