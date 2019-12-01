# prettier_d

<!-- [![Build Status]](https://travis-ci.org/mantoni/eslint_d.js) -->
<!-- [![SemVer]](http://semver.org) -->
<!-- [![License]](https://github.com/mantoni/eslint\_d.js/blob/master/LICENSE) -->

Makes [prettier][] fast.

## "But eslint is pretty fast already, right?"

Yes, it's really fast. But the node.js startup time and loading all the
required modules slows down linting times for a single file to ~700
milliseconds. `prettier_d` reduces this overhead by running a server in the
background. It brings the formatting time down to ~130 milliseconds. If you want
to format from within your editor whenever you save a file, `prettier_d` is for
you.

## Install

This will install the `prettier_d` command globally:

```bash
$ npm install -g prettier_d
```

## Usage

To start the server and lint a file, just run:

```bash
# Prettier needs to know the file name to do its thing.
$ cat file.js | prettier --stdin file.js
```

On the initial call, the `prettier_d` server is launched and then the given file
is formatted. Subsequent invocations are super fast.

## How does this work?

The first time you use `prettier_d`, a little server is started in the background
and bound to a random port. The port number is stored along with [a
token][change401] in `~/.prettier_d`. You can then run `prettier_d` commands the
same way you would use `prettier` and it will delegate to the background server.
It will load a [separate instance][change220] of prettier for each working
directory to make sure settings are kept local. If prettier is found in the
current working directories `node_modules` folder, then this version of prettier
is going to be used. Otherwise, the version of prettier that ships with
`prettier_d` is used as a fallback.

To keep the memory footprint low, `prettier_d` keeps only the last 10 used
instances in the internal [nanolru][] cache.

## Which versions of prettier are supported?

As far as I'm aware, all of them.

## Commands

Control the server like this:

```bash
$ prettier_d <command>
```

Available commands:

- `start`: start the server
- `stop`: stop the server
- `status`: print out whether the server is currently running
- `restart`: restart the server
- `[options] file.js [file.js] [dir]`: invoke `prettier` with the given options.
  The `prettier` engine will be created in the current directory. If the server
  is not yet running, it is started.

Type `prettier_d --help` to see the supported `prettier` options.

`prettier_d` will select a free port automatically and store the port number
along with an access token in `~/.prettier_d`.

## Moar speed

If you're really into performance and want the lowest possible latency, talk to
the `prettier_d` server with netcat. This will also eliminate the node.js startup
time.

```bash
$ PORT=`cat ~/.prettier_d | cut -d" " -f1`
$ TOKEN=`cat ~/.prettier_d | cut -d" " -f2`
$ echo "$TOKEN $PWD file.js" | nc localhost $PORT
```

Or if you want to work with stdin:

```bash
$ echo "$TOKEN $PWD --stdin" | cat - file.js | nc localhost $PORT
```

This runs `prettier` in under `50ms`!

## References

If you're interested in building something similar to this: Most of the logic
was extracted to [core_d][], a library that manages the background server.

## Compatibility

- `1.0.0`: prettier ^1.19.1

## License

MIT

[prettier]: https://prettier.io/
[nanolru]: https://github.com/s3ththompson/nanolru
[core_d]: https://github.com/mantoni/core_d.js
