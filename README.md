# assetter (asset web server)

## Description

transpile/minify `.es`, `.scss` web server.

要するに「リクエストパスから es, scss などの alt ファイルを検出してコンパイルして、あたかも素の js, css があるかのように返してくれる」 web サーバーです。
（一応 fsd.js で変更監視もできるけどオマケ。メインは http）

## Install

```json
{
  "dependencies": {
    "@ryunosuke/assetter": "*"
  }
}
```

## Demo

```js
cd /path/to/project
node example/index.js
```

## Usage

### run

convert all founded file.

### http

#### GET

convert `.js` `.css` based on request path and http cache mechanism.

e.g.

- GET /hoge.js -> transpile via hoge.es
- GET /hoge.css -> transpile via hoge.scss
- GET /hoge.min.css -> minify via hoge.scss|css

#### POST

converts `.js` `.css` based on request file and put file.

- POST /hoge.js -> transpile via request file and put file
- POST /hoge.css -> transpile via request file and put file
- POST /hoge.min.css -> minify via request file and put file

if multiple file requested, combine all request files.

## Release

### internal memo

podman login docker.io
podman build ./ -t docker.io/arimaryunosuke/assetter:latest
podman run --rm\
  -e ASSETTER_CONFIG=config\
  -v ./example/:/assetter/example\
  -p 8080:8080\
  docker.io/arimaryunosuke/assetter:latest /assetter/example

podman push docker.io/arimaryunosuke/assetter:latest --format v2s2

### future task

- Refactor (division of responsibilities)
- Function reduction (no use function)
- Detail README.md
- Release 1.0.0

### 0.0.1

- release developing version
