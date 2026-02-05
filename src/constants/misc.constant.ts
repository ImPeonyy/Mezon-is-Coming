export const SLOT_ANIMATION_DURATION = 1;
export const SLOT_ANIMATION_REPEAT = 3;

export const LOADING_EMOJI_ID = '2007709435941621760';

export const SPIN_ITEM_TYPE = {
    COIN: 'coin',
    COIN_BAG: 'coin_bag',
    ENERGY: 'energy',
    ATTACK: 'attack',
    RAID: 'raid',
    SHIELD: 'shield',
};

export const SPIN_ITEM_REWARD = {
    COIN: 'coin',
    ENERGY: 'energy',
    ATTACK: 'attack',
    RAID: 'raid',
    SHIELD: 'shield',
};

export const DEFAULT_AVATAR = 'https://res.cloudinary.com/do2rk0jz8/image/upload/v1757571181/download_ygjzey.jpg';

export const IMAGE_TO_SPIN_TYPE = new Map<string, string>([
    ['1.png', SPIN_ITEM_TYPE.COIN],
    ['2.png', SPIN_ITEM_TYPE.COIN_BAG],
    ['3.png', SPIN_ITEM_TYPE.ENERGY],
    ['4.png', SPIN_ITEM_TYPE.COIN_BAG],
    ['5.png', SPIN_ITEM_TYPE.ATTACK],
    ['6.png', SPIN_ITEM_TYPE.SHIELD],
    ['7.png', SPIN_ITEM_TYPE.ENERGY],
    ['8.png', SPIN_ITEM_TYPE.RAID],
    ['9.png', SPIN_ITEM_TYPE.COIN],
]);
