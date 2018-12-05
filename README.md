[![](https://travis-ci.org/oipwg/oip-index.svg?branch=master)](https://travis-ci.org/oipwg/oip-index)
[![](https://img.shields.io/npm/v/oip-index.svg)](https://www.npmjs.com/package/oip-index)
# js-oip
`js-oip` is a javscript library to fully interact with the Open Index Protocol.

## Table of Contents
* [Installation Instructions](https://github.com/oipwg/oip-index/#installation-instructions)
* [Getting Started](https://github.com/oipwg/oip-index/#getting-started)
	* [Getting an Artifact_DEPRECATED from the Index](https://github.com/oipwg/oip-index/#)
	* [Use a Custom OIPd Server](https://github.com/oipwg/oip-index/#)
	* [Create a new Artifact_DEPRECATED](https://github.com/oipwg/oip-index/#)
* [API Documentation](https://github.com/oipwg/oip-index/#api-documentation)
	* [Index](https://oipwg.github.io/oip-index/Index_.html)
	* [Artifact_DEPRECATED](https://oipwg.github.io/oip-index/Artifact_DEPRECATED.html)
* [License](https://github.com/oipwg/oip-index/#license)

## Installation Instructions
You can install the latest version by running the following `npm install` command.
```bash
$ npm install --save js-oip
```
## Getting Started

### Getting an Artifact_DEPRECATED from the Index

To get an Artifact_DEPRECATED back from the Index, we will first need to spawn a new `Index` object. This `Index` object is what we will interact with in order to get Artifacts back from the Index.  After you have created a new `Index` you can lookup a specific Artifact_DEPRECATED using the [`.getArtifact(artifact_id)` method](https://oipwg.github.io/oip-index/Index_.html#getArtifact). The `getArtifact` method returns a Promise that will resolve to the requested [Artifact_DEPRECATED](https://oipwg.github.io/oip-index/Artifact_DEPRECATED.html), or will reject if there was an error.

```javascript
import { Index } from flo

var index = new Index()

index.getArtifact("513691").then((artifact) => {
    console.log(artifact.getTitle())
})
```

### Use a Custom OIPd Server

Using a custom OIPd server as your source for Artifacts is simple, yet powerful. To hookup to an OIPd server, simply pass the API url into the Index object when you create it. All requests made to the `index` object it creates will use the OIPd server you specified as its source of truth.
```javascript
import { Index } from flo

var index = new Index(oipd-api)
```

### Create a new Artifact_DEPRECATED

Creating a new Artifact_DEPRECATED allows you to build your own Artifact_DEPRECATED that can then be handed off to `oip-account` for publishing to the Index. To create a new Artifact_DEPRECATED, we first need to import the Artifact_DEPRECATED class from `oip-index`. After we have imported the class, we can then create a new Artifact_DEPRECATED.

```javascript
import { Artifact_DEPRECATED } from flo

var myArtifact = new Artifact_DEPRECATED();
```

After we have created our new Artifact_DEPRECATED, we can then start setting values on it, as well as adding files. In this example, I am just going to set the Title, and Description.

```javascript
myArtifact.setTitle("My Great Title")
myArtifact.setDescription("The description for the Artifact_DEPRECATED we are creating")
```

## API Documentation
Learn more about how each Class works, or take a look at all functions available to you.
* [Documentation Home](https://oipwg.github.io/oip-index/)
	* [Index](https://oipwg.github.io/oip-index/Index_.html)
	* [Artifact_DEPRECATED](https://oipwg.github.io/oip-index/Artifact_DEPRECATED.html)

## License
MIT License

Copyright (c) 2018 Open Index Protocol Working Group

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.