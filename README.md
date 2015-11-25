# redux-side-effects

> What if your reducers were generators? You could yield side effects and return application state.

Believe it or not, but side effects are still tied with your application's domain. Ideally, you would be able to keep them in reducers. But wait! Everybody is saying that reducers must be pure! So yeah, just keep the reducer pure and reduce side effects as well.

## Why?

## Usage

## Examples

## Contribution

In case you are interested in contribution, feel free to send a PR. Keep in mind that any created issue is much appreciated. For local development:

```
  npm install
  npm run test:watch
```

You can also `npm link` the repo to your local Redux application so that it's possible to test the expected behaviour in real Redux application.

Please for any PR, don't forget to write unit test.

## Need Help?

You can reach me on [reactiflux](http://www.reactiflux.com) - username tomkis1, or DM me on [twitter](https://twitter.com/tomkisw).

## FAQ

> Does redux-side-effects work with working Redux application?

Yes! ... TBD

> My middlewares are not working anymore, what has just happened?

> Can I compose reducers?

Yes! ... TBD

> I keep getting warning "createEffectCapableStore enhancer from redux-side-effects package is used yet the provided root reducer is not a generator function", what does that mean?

> I am using combineReducers, how does this work with redux-side-effects?