import mongoose, { Model } from 'mongoose';

export interface User {
  _id?: string;
  name: string;
  email: string;
  password: string;
}

const schema = new mongoose.Schema<User>(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: [true, 'Email must be unique'],
    },
    password: { type: String, required: true },
  },
  {
    toJSON: {
      transform: (
        _,
        { _id, __v: _version, ...rest }
      ): Record<string, unknown> => {
        void _version;
        return { id: _id, ...rest };
      },
    },
  }
);

export const User: Model<User> = mongoose.model('User', schema);
