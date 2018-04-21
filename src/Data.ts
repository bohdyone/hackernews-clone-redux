export interface Item {
  id: number;
  kids?: number[];
  text: string;
  title: string;
  by: string;
  url: string;
  descendants: number;
}

export type IndexedItem = {
  index: number;
  item: Item;
  type: ItemType;
  parentId?: number;
  depth?: number;
};

export type IndexedItemDef = {
  index: number;
  id: number;
  type: ItemType;
  parentId?: number;
};

export type ItemType = 'comment' | 'story';
