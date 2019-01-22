import Options from '../../helpers/Options';
import Utils from '../../helpers/utils';
import YouTubePopoutPlayer from './classes/YouTubePopoutPlayer.class';

(async function () {
    const disableOnPopout = await Options.GetLocalOption('behavior', 'disableOnPopout');
    if (!disableOnPopout || !Utils.IsPopoutPlayer(window.location)) {
        new YouTubePopoutPlayer();
    }
})();
