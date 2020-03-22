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

Unlink with `npm i react-recollect`.

Start the demo site:

```
npm start
```

And you're in business.

## Open in CodeSandbox

https://codesandbox.io/s/github/davidgilbertson/react-recollect/tree/master/demo
