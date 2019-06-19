<p align="center">
  <img width="128px" src="https://github.com/pablopunk/art/raw/master/serve-bar/icon.png" />
</p>
<h2 align="center">Serve Bar</h2>
<p align="center">
  <i align="center">Drag & Drop to share files/folders in your network</i>
  <img src="https://github.com/pablopunk/art/raw/master/serve-bar/screen.gif" />
</p>

_Serve Bar_ allows you to drag any files or folders to the icon in the topbar and it will create an **http server** for each one of them. It will automatically open the created servers in your browser and also copy the URLs to your clipboard so you can share them easily.

![menu](https://github.com/pablopunk/art/raw/master/serve-bar/menu.png)

## Download

[▼ Download the latest release](https://github.com/pablopunk/serve-bar/releases).

It will only work on macOS as the drag-and-drop feature doesn't work on Linux and Windows.

## Performance

I know, it's built on electron. You're probably thinking _"Yet another RAM eating app"_. **NO!** Even though it is an electron app, there's no browser running, so the RAM usage is really small:

![ram](https://github.com/pablopunk/art/raw/master/serve-bar/ram.png)

It is also really **fast**. You can easily drag like 50 items into the topbar and they will be instantly shared (and without consuming a lot of RAM). Obviously you will have 50 tabs open in your browser so be careful trying this! And when I say 50, I could say 200, I just didn't try that many.

## Build

If you just wanna change the code and run the app:

```bash
npm install
npm start
```

If you want to make the production build:

```bash
npm run dist
```

If you want to make changes to the icon, just modify `assets/icon.svg` and then generate the `png` and the `icns` with `npm run dist`.

## Contribute

Feel free to open an _issue_ or a _PR_.

| ![me](https://www.gravatar.com/avatar/fa50aeff0ddd6e63273a068b04353d9d?s=100) |
| ----------------------------------------------------------------------------- |
| © 2017 [**Pablo Varela**](http://pablo.life)                                  |
