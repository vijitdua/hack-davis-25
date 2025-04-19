This is how you can write a sample mongo db model:

```js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('User', userSchema);

```

how you can use

```js
import User from '../models/User.js';

const newUser = new User({ username: 'vijit', email: 'v@x.com', password: '123' });
await newUser.save();
```