<div align="center"><h1>Actions Localizer</h1></div>

This action is a export localizer data from google sheet

## Configuration with With

The following settings must be passed as environment variables as shown in the
example.

| Key              | Value                                           | Suggested Type | Required | Default                      |
| ---------------- | ----------------------------------------------- | -------------- | -------- | ---------------------------- |
| `CLIENT_ID`      | Can get from google credential at client_id.    | `secret env`   | **Yes**  | `CLIENT_ID of 20Scoops CNX`  |
| `PROJECT_ID`     | Can get from google credential at project_id.   | `secret env`   | **Yes**  | `PROJECT_ID of 20Scoops CNX` |
| `LOCALIZER_FILE` | Location file of localizer. [Example](#Example) | `env`          | No       | `./localizer.js`             |

## Configuration with Env

The following settings must be passed as environment variables as shown in the
example.

| Key                          | Value                                                                                             | Suggested Type | Required | Default |
| ---------------------------- | ------------------------------------------------------------------------------------------------- | -------------- | -------- | ------- |
| `LOCALIZER_CREDENTIAL_TOKEN` | Can get from google credential at client_secret.                                                  | `secret env`   | **Yes**  | N/A     |
| `LOCALIZER_REFRESH_TOKEN`    | Can get after run manual localizer in local [How to get LOCALIZER_REFRESH_TOKEN](#Refresh-Token). | `secret env`   | **Yes**  | N/A     |

### Refresh Token

You can clone this project and run `node refresh_token/index.js` and see comment
at command line. Google must be authenticate with your account and get some code
in website. After that please give that code to command line and press enter.
`LOCALIZER_REFRESH_TOKEN` is visible at command line.

### Can add more configuration in file `localizer.js`

#### Example

```js
// localizer.js

module.exports = {
  dest: './locales/',
  filename: {
    en: 'en.js',
    de: 'de.js',
  },
  url: 'https://docs.google.com/spreadsheets/',
  sheetName: ['sheet1', 'sheet2'],
  module: 'android-xml',
  ignoreColumns: ['th', 'DE'],
}
```

## We provide following configuration.

| Key             | Value                                                                   | Required | Default                      |
| --------------- | ----------------------------------------------------------------------- | -------- | ---------------------------- |
| `url`           | Google Sheets URL.                                                      | **Yes**  | N/A                          |
| `dest`          | Location of local file storage.                                         | No       | `./locales/`                 |
| `filename`      | Filename will corresponds to language.                                  | No       | `{en: 'en.js',de: 'de.js',}` |
| `ignoreColumns` | Script will ignore columns is select                                    | No       | `[]`                         |
| `sheetName`     | Script will retrieve locales from specified sheet name via this config. | No       | `''`                         |
| `module`        | Type of output `esm`, `commonjs`, `android-xml` or `ios-strings`.       | No       | `esm`                        |

\*\* If sheetName more than 1. You can set follow
`sheetName:['sheet1', 'sheet2']`

## Example usage

```yml
localizer:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v1
    - name: Localizer
      uses: ./
      with:
        CLIENT_ID: ${{ secrets.CLIENT_ID }}
        PROJECT_ID: ${{ secrets.PROJECT_ID }}
        LOCALIZER_FILE: '.github/test.js'
      env:
        LOCALIZER_CREDENTIAL_TOKEN: ${{ secrets.LOCALIZER_CREDENTIAL_TOKEN }}
        LOCALIZER_REFRESH_TOKEN: ${{ secrets.LOCALIZER_REFRESH_TOKEN }}
```
