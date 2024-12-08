import { atom } from 'recoil';

export const collabrateAtom = atom<boolean>({
  key: 'isCollab',
  default: false,
});

export const titleAtom = atom<string>({
  key: 'title',
  default: '',
});
