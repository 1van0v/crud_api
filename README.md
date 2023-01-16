# Simple CRUD app that can scale

To run application execute:

```
npm run start:prod
```

To run app in cluster mode:

```
npm run start:multi
```

Single instance can be tested with following script:

```
npm run test
```

In order to test cluster, it should be started in a separated terminal:

```
npm run start:multi
```

and then in the another terminal run:

```
npm run test:multi
```
