import mongoose, { Document, Schema, Types } from 'mongoose';

export enum GeoPosition {
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
  position: GeoPosition;
  user: Types.ObjectId;
}

const schemaDefinition = {
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  name: { type: String, required: true },
  position: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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
        return { id: _id, ...rest };
      },
    },
  }
);

export const Beach = mongoose.model<Beach & Document>('Beach', schema);
