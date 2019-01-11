## MongoDB

I highly recommend using MongoDB's Atlas for a cloud cluster rather than setting up a local DB.

If you have connection issues (errors like `MongoNetworkError` or `TransientTransactionError`), you have to whitelist any inbound IPs on MongoDB's Atlas. That includes your local dev IP and your production box IP. Alternatively, whitelist all IPs.

Using Mongoose, connecting to the cluster is as easy as
```
function mongoUri(adminUser, pwd) {
    return `mongodb+srv://${adminUser}:${pwd}@uber-footprint-ydfcz.azure.mongodb.net/database?retryWrites=true`;
}

mongoose.connect(mongoUri('admin', 'blahblah'), { useNewUrlParser: true });
```