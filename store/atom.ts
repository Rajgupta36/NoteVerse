import { atom } from "recoil";

export const collabrateAtom = atom<boolean>({
    key: 'isCollab',
    default: false,
});