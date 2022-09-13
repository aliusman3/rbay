import type { CreateItemAttrs } from '$services/types';
import { client } from '$services/redis';
import { serialize } from './serialize';
import { deserialize } from './deserialize';
import { genId } from '$services/utils';
import { itemsKey } from '$services/keys';

export const getItem = async (id: string) => {
    const item = await client.hGetAll(itemsKey(id));
    if (Object.keys(item).length === 0) {
        return null;
    }
    return deserialize(id, item);
};

export const getItems = async (ids: string[]) => {
    const commands = ids.map(id => client.hGetAll(itemsKey(id)));
    const items = await Promise.all(commands);
    return items.map((item, i) => {
        if (Object.keys(item).length === 0) {
            return null;
        }
        return deserialize(ids[i], item);
    });
};

export const createItem = async (attrs: CreateItemAttrs, userId: string) => {
    const id = genId();
    const serialized = serialize(attrs);

    await client.hSet(itemsKey(id), serialized);
    return id;
};
