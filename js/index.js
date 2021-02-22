$(function() {
    // 0.自定义滚动条
    $(".content_list").mCustomScrollbar();

    $audio = $('audio');
    var player = new Player($audio);
    var progress;
    var voiceProgress;
    var lyric;
    // 1.加载歌曲列表
    getPlayerList();

    function getPlayerList() {
        $.ajax({
            url: "./source/musiclist.json",
            dataType: "json",
            success: function(data) {
                player.musicList = data;
                // console.log(data);
                // 获取.json里面的数据，并且遍历，作为实参传进动态创建li的函数中
                $.each(data, function(index, ele) {
                    var $item = createMusicItems(index, ele);
                    var $musicList = $('.content_list ul');
                    $musicList.append($item);
                });
                initMusicInfo(data[0]);
                initMusicLyric(data[0]);
            },
            error: function(e) {
                console.log(e);
            }
        });
    }

    // 2 初始化歌曲信息
    function initMusicInfo(music) {
        // 获取歌曲信息元素
        var $musicImage = $('.song_info_pic img');
        var $musicName = $('.song_info__name a');
        var $musicSinger = $('.song_info__singer a');
        var $musicAlbum = $('.song_info__album a');
        var $musicProgressName = $('.music_progress_name');
        var $musicProgressTime = $('.music_progress_time');
        var $musicBg = $('.mask_bg');
        // 给获取到的元素赋值
        $musicImage.attr('src', music.cover)
        $musicName.text(music.name);
        $musicSinger.text(music.singer);
        $musicAlbum.text(music.album);
        $musicProgressName.text(music.name + ' / ' + music.singer);
        $musicProgressTime.text('00:00' + ' / ' + music.time);
        $musicBg.css('background', 'url("' + music.cover + '")');
    }

    // 3 初始化歌词信息
    function initMusicLyric(misic) {
        lyric = new Lyric(misic.link_lrc);
        var $lyricContainer = $('.song_lyric');
        $lyricContainer.html('');
        lyric.loadLyric(function() {
            // 创建歌词列表
            $.each(lyric.lyrics, function(index, ele) {
                $item = $('<li>' + ele + '</li>');
                $lyricContainer.append($item);
            })
        });
    }

    // 3 初始化进度条
    initProgress();

    function initProgress() {
        var $progressBar = $('.music_progress_bar');
        var $progressLine = $('.music_progress_line');
        var $progressDot = $('.music_progress_dot');
        progress = Progress($progressBar, $progressLine, $progressDot);
        progress.progressClick(function(value) {
            player.musicSeekTo(value);
        });
        progress.progressMove(function(value) {
            player.musicSeekTo(value);
        });

        var $voiceBar = $('.music_voice_bar');
        var $voiceLine = $('.music_voice_line');
        var $voiceDot = $('.music_voice_dot');
        voiceProgress = Progress($voiceBar, $voiceLine, $voiceDot);
        voiceProgress.progressClick(function(value) {
            player.musicVoiceSeekTo(value);
        });
        voiceProgress.progressMove(function(value) {
            player.musicVoiceSeekTo(value);
        });
    }
    // 2 初始化事件监听
    initEvents();

    function initEvents() {
        // 1.监听歌曲的移入移出事件
        // 动态创建的子菜单是一个浅拷贝，没有拷贝里面的事件，需要使用事件委托
        $('.content_list').delegate('.list_music', 'mouseenter', function() {
            // 显示子菜单
            $(this).find('.list_menu').stop().fadeIn(100);
            $(this).find('.list_time a').stop().fadeIn(100);
            // 隐藏时长
            $(this).find('.list_time span').stop().fadeOut(0);
        });
        $('.content_list').delegate('.list_music', 'mouseleave', function() {
            // 隐藏子菜单
            $(this).find('.list_menu').stop().fadeOut(100);
            $(this).find('.list_time a').stop().fadeOut(0);
            // 显示时长
            $(this).find('.list_time span').stop().fadeIn(0);
        });

        // 2.1.监听创建已存在的单个的复选框
        $('.list_title>.list_check').click(function() {
            // 添加类名
            $(this).toggleClass('list_checked');
            if ($(this).attr('class').indexOf('list_checked') != -1) {
                $('.list_music .list_check').addClass('list_checked');
            } else {
                $('.list_music .list_check').removeClass('list_checked');
            }
        });
        // 2.2.监听动态创建的复选框
        $('.content_list').delegate('.list_music .list_check', 'click', function() {
            // 添加类名
            $(this).toggleClass('list_checked');
            if ($(this).attr('class').indexOf('list_checked') == -1) {
                $('.list_title>.list_check').removeClass('list_checked');
            }
            // 这里还存在一个bug，就是当全部选中时，第一个复选框也选中，QQ音乐也存在这个bug，其实这个功能要不要无所谓，能全选中所有歌曲就行
        });

        // 定义播放按钮
        $musicPlay = $('.music_play');
        // 3.添加子菜单播放按钮（类名为.list_menu_play）的监听,事件委派
        $('.content_list').delegate('.list_menu .list_menu_play', 'click', function() {
            // 定义一个当前点击的类名为'.list_music'的父元素

            var $item = $(this).parents('.list_music');
            // console.log($item.get(0).index);
            // console.log($item.get(0).music);

            $(this).toggleClass('list_menu_play2');
            // 3.1.其他的按钮复原停止状态
            $item.siblings().find('.list_menu_play').removeClass('list_menu_play2');
            // 获取当前的属性名为'class'的字符串检测有无'list_menu_play2'此字符串
            if ($(this).hasClass('list_menu_play2')) {
                // 3.2.让两个播放按钮同步
                $musicPlay.addClass('music_play2');
                // 3.3.让文字高亮
                $item.find('div').css({
                    color: 'rgba(255, 255, 255, 1)'
                });
                // 排他
                $item.siblings().find('div').css({
                    color: 'rgba(255, 255, 255, 0.5)'
                });
            } else {
                $musicPlay.removeClass('music_play2');
                $(this).parents('.list_music').find('div').css({
                    color: 'rgba(255, 255, 255, 0.5)'
                })
            }
            //3.4. 切换序号的状态
            $item.children('.list_number').toggleClass('list_number2');
            $item.siblings().children('.list_number').removeClass('list_number2'); //排他
            //3.5. 播放音乐
            player.playMusic($item.get(0).index, $item.get(0).music);
            //3.6. 切换歌曲信息
            initMusicInfo($item.get(0).music);
            //3.7. 切换歌词信息
            initMusicLyric($item.get(0).music);
        });

        // 4.监听底部控制区域播放按钮的点击
        $('.music_play').click(function() {
            // 判断有没有播放过音乐
            if (player.currentIndex == -1) {
                // 没有播放过音乐
                $('.list_music').eq(0).find('.list_menu_play').trigger('click');
            } else {
                // 播放过音乐
                $('.list_music').eq(player.currentIndex).find('.list_menu_play').trigger('click');
            }
        });

        // 5.监听底部控制区域上一首按钮的点击
        $('.music_pre').click(function() {
            $('.list_music').eq(player.preIndex()).find('.list_menu_play').trigger('click');
        });

        // 6.监听底部控制区域下一首按钮的点击
        $('.music_next').click(function() {
            $('.list_music').eq(player.nextIndex()).find('.list_menu_play').trigger('click');
        });

        // 7.监听删除按钮点击
        $('.content_list').delegate('.list_menu_del', 'click', function() {
            var $item = $(this).parents('.list_music');
            //判断当前删除是否是正在播放的
            if ($item.get(0).index == player.currentIndex) {
                // 自动播放下一首
                $('.music_next').trigger('click');
            }

            $item.remove();
            // 删除后台数据
            player.changeMusic($item.get(0).index);

            // 重新排序
            $('.list_music').each(function(index, ele) {
                ele.index = index;
                $(ele).find('.list_number').text(index + 1);
            })
        })

        // 8.监听播放的进度
        player.musicTimeUpdate(function(currentTime, duration, timeStr) {
            // 同步时间
            $('.music_progress_time').text(timeStr);
            // 计算播放比例
            var value = currentTime / duration * 100;
            progress.setProgress(value);
            // 实现歌词同步
            var index = lyric.currentIndex(currentTime);
            var $item = $('.song_lyric li').eq(index);
            $item.addClass('cur');
            $item.siblings().removeClass('cur');

            if (index < 2) return;
            $('.song_lyric').css({
                marginTop: (-index + 2) * 30
            })
        });

        // 9.监听声音按钮的点击
        $('.music_voice_icon').click(function() {
            // 图标切换
            $(this).toggleClass('music_voice_icon2');
            if ($(this).attr('class').indexOf('music_voice_icon2') != -1) {
                // 变为没有声音
                player.musicVoiceSeekTo(0);
            } else {
                // 变为有声音
                player.musicVoiceSeekTo(1);
            }
        })
    }

    // 定义一个动态创建.list_music的li的方法，并且函数返回动态创建的li
    function createMusicItems(index, music) {
        var $item = $('<li class="list_music">' +
            '<div class="list_check">' +
            '<i></i>' +
            '</div>' +
            '<div class="list_number">' + (index + 1) + '</div>' +
            '<div class="list_name">' + music.name +
            '<div class="list_menu">' +
            '<a href="javascript:;" title="播放" class="list_menu_play"></a>' +
            '<a href="javascript:;" title="添加"></a>' +
            '<a href="javascript:;" title="分享"></a>' +
            '<a href="javascript:;" title="下载"></a>' +
            '</div>' +
            '</div>' +
            '<div class="list_singer">' + music.singer + '</div>' +
            '<div class="list_time">' +
            '<span>' + music.time + '</span>' +
            '<a href="javascript:;" title="删除" class="list_menu_del"></a>' +
            '</div>' +
            '</li>');
        //定义在全局对象中
        $item.get(0).index = index;
        $item.get(0).music = music;
        return $item;
    }

})