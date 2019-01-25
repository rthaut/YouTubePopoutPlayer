export const YOUTUBE_EMBED_URL = 'https://www.youtube.com/embed/';

export const START_THRESHOLD = 5;   // TODO: should this be configurable?

export const OPTION_DEFAULTS = {
    'behavior': {
        'target': 'window',
        'disableOnPopout': true,
        'closeOriginal': false
    },
    'size': {
        'mode': 'current',
        'units': 'pixels',
        'width': 854,
        'height': 480
    },
    'advanced': {
        'title': ''
    }
};

export const VALID_SHORTCUT_KEYS = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
    'Comma', 'Period', 'Home', 'End', 'PageUp', 'PageDown', 'Space', 'Insert', 'Delete', 'Up', 'Down', 'Left', 'Right'
];

export const VALID_SHORTCUT_KEYS_DESCRIPTIONS = [
    'A-Z',
    '0-9',
    'F1-F12',
    'Comma, Period, Home, End, PageUp, PageDown, Space, Insert, Delete, Up, Down, Left, Right'
];

export const MSG_REGEX = new RegExp(/^__MSG_(\S+)__$/, 'gi');
