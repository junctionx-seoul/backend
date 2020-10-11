import { createSchema, ExtractDoc, Type, typedModel } from 'ts-mongoose';
import { exhibitionSchema } from './exhibition';
import { userSchema } from './user';

export const viewlogSchema = createSchema({
  viewBy: Type.ref(Type.objectId({ required: true })).to('User', userSchema),
  exhibition: Type.ref(Type.objectId({ required: true })).to(
    'Exhibition',
    exhibitionSchema,
  ),
});

export type viewlogDoc = ExtractDoc<typeof viewlogSchema>;
export const viewlogModel = typedModel('Viewlog', viewlogSchema);
