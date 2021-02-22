(function(window) {
    function Player($audio) {
        // Player对象是通过init()创建的
        return new Player.prototype.init($audio);
    };
    Player.prototype = {
        constructor: Player,
        musicList: [],
        init: function($audio) {
            this.$audio = $audio;
            // .get()通过检索匹配jQuery对象得到对应的DOM元素
            this.audio = $audio.get(0);
        },
        currentIndex: -1,
        playMusic: function(index, music) {
            // 判断是否为同一首音乐
            if (this.currentIndex == index) {
                // 同一首音乐
                // 判断是否是是暂停状态
                if (this.audio.paused) {
                    // 原生的js播放
                    this.audio.play();
                } else {
                    // js暂停
                    this.audio.pause();
                }
            } else {
                // 一开始就不是同一首音乐
                // 不是同一首音乐
                this.$audio.attr('src', music.link_url);
                this.audio.play();
                this.currentIndex = index;
            }
        },
        //切换上一首索引的方法
        preIndex: function() {
            var index = this.currentIndex - 1;
            if (index < 0) {
                index = this.musicList.length - 1;
            }
            return index;
        },
        //切换下一首索引的方法
        nextIndex: function() {
            var index = this.currentIndex + 1;
            if (index > this.musicList.length - 1) {
                index = 0;
            }
            return index;
        },
        //删除对应的数据
        changeMusic: function(index) {
            // 在this.musicList数组中从第index+1位置删除一个元素
            this.musicList.splice(index, 1);
            // 判断当前删除的是否是正在播放音乐的前面的音乐，如果删除前面的音乐，需要将this.currentIndex改变
            if (index < this.currentIndex) {
                this.currentIndex -= 1;
            }
        },
        musicTimeUpdate: function(callBack) {
            var $this = this;
            this.$audio.on('timeupdate', function() {
                // 获取当前音乐播放的总时长
                var duration = $this.audio.duration;
                // 获取当前音乐的正在播放时间
                var currentTime = $this.audio.currentTime;
                var timeStr = $this.formatDate(duration, currentTime);
                callBack(currentTime, duration, timeStr);
            })
        },
        // 定义一个格式化时间的方法
        formatDate: function(duration, currentTime) {
            var endMin = parseInt(duration / 60);
            var endSec = parseInt(duration % 60);
            if (endMin < 10) {
                endMin = '0' + endMin;
            };
            if (endSec < 10) {
                endSec = '0' + endSec;
            }
            var startMin = parseInt(currentTime / 60);
            var startSec = parseInt(currentTime % 60);
            if (startMin < 10) {
                startMin = '0' + startMin;
            };
            if (startSec < 10) {
                startSec = '0' + startSec;
            };
            return startMin + ':' + startSec + ' / ' + endMin + ':' + endSec;
        },
        musicSeekTo: function(value) {
            if (isNaN(value)) return;
            this.audio.currentTime = this.audio.duration * value;
        },
        musicVoiceSeekTo: function(value) {
            if (isNaN(value)) return;
            // 0~1 0.1 0.2
            if (value < 0 || value > 1) return;
            this.audio.volume = value;
        }
    };
    // 将Player.prototype.init.prototype属性指向 Player.prototype，就可以共享Player的原型对象里面的方法
    Player.prototype.init.prototype = Player.prototype;
    window.Player = Player;
})(window);