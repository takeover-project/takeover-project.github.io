function playerBlock(seriesData) {
    var $player = $('.player'),
        selects = {},
        viewedEpisodes = [];

    var season = 1,
        episode = 1,
        playerNum = 0;

    var playersTypes = {
        OK: 'ok.ru',
        SibNet: 'sibnet',
        ProtonVideo: 'protonvideo',
        YouTube: 'youtube',
        Vkontakte: 'vk.com',
        MP4UPLOAD: 'mp4upload.com',
        MAIL: 'mail.ru',
        MYVI: 'myvi.',
        Smotret_anime: 'smotret-anime.online'
    };

    function definePlayerType(link) {
        for (var i in playersTypes) {
            if (link.indexOf(playersTypes[i]) !== -1) return i;
        }
        return 'Другой плеер';
    }

    function markEpisodes(episodeNum) {
        if (episodeNum) {
            viewedEpisodes.push(season + '-' + episodeNum);
            $('#bs-select-2-' + (episodeNum - 1) + ' span').css('text-decoration', 'line-through');
        } else {
            var seasonEpisodes = viewedEpisodes.filter(v => +v.split('-').shift() === season);
            seasonEpisodes.forEach(v => {
                var num = +v.split('-')[1] - 1;
                $('#bs-select-2-' + num + ' span').css('text-decoration', 'line-through');
            });
        }
    }

    function setSelect(id, data) {
        var select = selects[id];
        if (select) {
            var firstValue = '';
            var itUpdate = !!select.html();
            var getOption = function (value, title, order) {
                if (order === 0) {
                    firstValue = value;
                } else if (id === 'player' && playerNum === value) {
                    firstValue = value;
                }
                return (
                    '<option value="' +
                    value +
                    '"' +
                    (order === 0 ? ' selected="selected"' : '') +
                    '>' +
                    title +
                    '</option>'
                );
            };
            select.html(
                data
                    .map((v, i) => {
                        if (id === 'player') {
                            var value = definePlayerType(v);
                            return getOption(value, value, i);
                        } else {
                            return getOption(i + 1, v.title, i);
                        }
                    })
                    .join('')
            );
            if (itUpdate) {
                select.selectpicker('refresh');
                if (firstValue) select.selectpicker('val', firstValue);
            }
            if (id === 'episode') {
                var seasonEpisodes = viewedEpisodes.filter(v => +v.split('-').shift() === season);
                seasonEpisodes.forEach(v => {
                    var episodeNum = +v.split('-')[1] - 1;
                    console.log('bs-select-2-' + episodeNum);
                    $('#bs-select-2-' + episodeNum + ' span').css('text-decoration', 'line-through');
                });
            }
        }
    }

    function addSelect(id, data, callback) {
        var select = $('<select></select', { class: 'selectpicker' }).on('change', callback);
        selects[id] = select;
        setSelect(id, data);
        select.appendTo('.control-panel');
    }

    function openPlayer() {
        var curSeason = seriesData[season - 1];
        if (curSeason) {
            var curEpisode = curSeason.folder[episode - 1];
            if (curEpisode) {
                var link =
                    playerNum && playersTypes[playerNum]
                        ? curEpisode.links.filter(v => v.indexOf(playersTypes[playerNum]) !== -1).shift()
                        : '';
                $player.attr('src', link || curEpisode.links[0]);
            }
        }
    }
    
    $('<div></div>', { class: 'control-panel' })
        .insertBefore($player);


    addSelect('season', seriesData, function () {
        season = parseInt($(this).val());
        episode = 1;
        var curSeason = seriesData[season - 1];
        if (curSeason) {
            setSelect('episode', curSeason.folder);
            setSelect('player', curSeason.folder[0].links);
            openPlayer();
        }
    });

    addSelect('episode', seriesData[0].folder, function () {
        episode = parseInt($(this).val());
        var curEpisode = seriesData[season - 1].folder[episode - 1];
        if (curEpisode) {
            setSelect('player', curEpisode.links);
            openPlayer();
            markEpisodes(episode);
        }
    });

    addSelect('player', seriesData[0].folder[0].links, function () {
        playerNum = $(this).val();
        openPlayer();
    });

    openPlayer();
}

window.getPlayerData = function (url) {
    var loadingError = function () {
        $('<p>Ошибка загрузки данных плеера</p>').insertBefore('.player');
    };
    $.get(url)
        .fail(loadingError)
        .done(function (data) {
            try {
                var json = JSON.parse(data);
                playerBlock(json);
            } catch (e) {
                console.log(e);
            }
        });
};
