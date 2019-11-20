# Actions Localizer

This action is a export localizer data from google sheet

## Inputs

### `CLIENT_ID`, `PROJECT_ID`, `LOCALIZER_CREDENTIAL_TOKEN`

**Required** Can get from google credential.

Example

![credential-example](.github/images/example.png)

### `LOCALIZER_REFRESH_TOKEN`

**Required** Can get after run manual localizer in local.
[How to get LOCALIZER_REFRESH_TOKEN](#Refresh-Token)

### `LOCALIZER_FILE`

**Required** Location file of localizer. The default is `./localizer.js`

Minimum input in `localizer.js`

```js
// localizer.js

module.exports = {
  url: "https://docs.google.com/spreadsheets/"
};
```

### Refresh Token

You can clone this project and run
`node refresh_token/index.js $CLIENT_ID $PROJECT_ID $LOCALIZER_CREDENTIAL_TOKEN`.
Google must be authenticate with your account and get some code in website.
After that please give that code to command line and press enter.
`LOCALIZER_REFRESH_TOKEN` is visible at command line.

![refresh-token-example](.github/images/example_refresh_token.png)

### Can add more configuration in file `localizer.js`

#### Example

```js
// localizer.js

module.exports = {
  dest: "./locales/",
  filename: {
    en: "en.js",
    de: "de.js"
  },
  url: "https://docs.google.com/spreadsheets/",
  sheetNames: ["sheet1", "sheet2"],
  module: "android-xml",
  ignoreColumns: ["th", "DE"]
};

// Remark: ignoreColumns is a case sensitive. If input not equal head line. System not ignore.
```

## We provide following configuration.

- **url**: Google Sheets URL. **(Required)**
- **dest**: Location of local file storage The default is `/locales/`.
  **(Optional)**
- **filename**: Filename will corresponds to language. If not, localizer will
  use `column headers`. **(Optional)**
  **(Optional)**
- **sheetNames**: Script will retrieve locales from specified sheet name via
  this config. If not, localizer will always retrieve locales from
  `first sheet`. But if you have multiple sheet name is a export.you also can
  provide array of sheet name (it'll be merged for same language name)
  **(Optional)**
- **module**: Type of output `esm`, `commonjs`, `android-xml` or
  `ios-strings`.The default is `esm`. **(Optional)**

## Example usage

```yml
- name: Localizer-Export
uses: 20Scoops-CNX/actions-localizer@master
with:
    LOCALIZER_CREDENTIAL_TOKEN: ${{ secrets.LOCALIZER_CREDENTIAL_TOKEN }}
    LOCALIZER_REFRESH_TOKEN: ${{ secrets.LOCALIZER_REFRESH_TOKEN }}
    LOCALIZER_FILE: './src/localizer.js'
```
