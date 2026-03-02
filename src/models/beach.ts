import mongoose, { Model } from 'mongoose';
export enum BeachPosition {
  S = 'S',
  E = 'E',
  W = 'W',
  N = 'N',
}

export interface Beach {
  _id?: string;
  lat: number;
  lng: number;
  name: string;
  position: BeachPosition;
}

const schema = new mongoose.Schema<Beach>(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    name: { type: String, required: true },
    position: { type: String, required: true },
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

export const Beach: Model<Beach> = mongoose.model('Beach', schema);
