import mongoose, { Schema, Types } from 'mongoose';
import { BaseModel } from '.';

export enum GeoPosition {
  S = 'S',
  E = 'E',
  W = 'W',
  N = 'N',
}

export interface Beach extends BaseModel {
  lat: number;
  lng: number;
  name: string;
  position: GeoPosition;
  userId: Types.ObjectId;
}

export interface ExistingBeach extends Beach {
  id: string;
}

const schemaDefinition = {
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  name: { type: String, required: true },
  position: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
};

const schema = new Schema(
  schemaDefinition as mongoose.SchemaDefinition<Beach>,
  {
    toJSON: {
      transform: (
        _: unknown,
        { _id, __v: _version, ...rest }: Record<string, unknown>
      ): Record<string, unknown> => {
        void _version;
        return { id: (_id as Types.ObjectId).toString(), ...rest };
      },
    },
  }
);

export const Beach = mongoose.model<Beach>('Beach', schema);
