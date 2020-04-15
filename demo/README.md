# A demo site for React Recollect

## Running locally

`cd demo`, `npm i`, `npm start`.

## Developing locally

To use this site when developing `react-recollect` locally, in the root of the
`react-recollect` repo, run:

```
npm run build:watch
```

Then in the `/demo` site directory...

```
cd demo
```

Create a symlink for `react-recollect`:

```
npm link ../
```

Now imports of `'react-recollect'` in the demo site will load from
`react-recollect/dist`.

Running `npm i` will undo this link, in which case you'll need to do it again to
relink.

Beware! Since this directory will have a `node_modules` directory, `react-dom`
may be loaded from there, rather than the `demo/node_modules` directory. To be
100% certain you're replicating what users get, you'll want to release as a
prerelease and install it from npm. This is also required to test that when the
package is installed, it doesn't install any `node_modules` when it shouldn't
(e.g. it should share hoistNonReactStatics with material-ui).

Unlink with `npm i react-recollect`.

Start the demo site:

```
npm start
```

And you're in business.

If your editor complains about ESLint rules, it might be struggling with nested
projects, if so, open `react-recollect/demo` as its own project. That's better
for searching/etc. anyway.

## Test the UMD build

To test loading Recollect via a script tag, run:

```
npm run serve:root
```

And go to http://localhost:3000/demo/public/browser.html

## Open in CodeSandbox

https://codesandbox.io/s/github/davidgilbertson/react-recollect/tree/master/demo
