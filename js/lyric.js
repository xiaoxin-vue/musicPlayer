(function(window) {
    function Lyric(path) {
        // Lyric对象是通过init()创建的
        return new Lyric.prototype.init(path);
    };
    Lyric.prototype = {
        constructor: Lyric,
        init: function(path) {
            this.path = path;
        },
        times: [],
        lyrics: [],
        index: -1,
        // 加载获取本地的lyric的.txt文本
        loadLyric: function(callBack) {
            $this = this;
            $.ajax({
                url: $this.path,
                dataType: "text",
                success: function(data) {
                    // console.log(data);
                    $this.parseLyric(data);
                    callBack();
                },
                error: function(e) {
                    console.log(e);
                }
            });
        },
        parseLyric: function(data) {
            $this = this;
            // 清空上一首音乐的歌词和时间
            $this.times = [];
            $this.lyrics = [];
            // split() 方法用于把一个字符串分割成字符串数组,用数组中的','替换data中的换行
            var array = data.split('\n');
            // console.log(array);
            // [00:00.92]
            var timeReg = /\[(\d*:\d*\.\d*)\]/;
            // 遍历取出每一条歌词
            $.each(array, function(index, ele) {
                // 处理歌词数组
                var lrc = ele.split(']')[1];
                // 排除空字符串
                if (lrc.length == 1) return true;
                $this.lyrics.push(lrc);

                // 处理时间数组
                // console.log(ele);
                var res = timeReg.exec(ele);
                // console.log(res);
                // return true相当于continue
                if (res == null) return true;
                var timeStr = res[1];
                var res2 = timeStr.split(':');
                var min = parseInt(res2[0] * 60);
                var sec = parseFloat(res2[1]);
                var time = parseFloat(Number(min + sec).toFixed(2));
                $this.times.push(time);


            });
            // console.log($this.times);
            // console.log($this.lyrics);
        },
        currentIndex: function(currentTime) {
            // console.log(currentTime);
            if (currentTime >= this.times[0]) {
                this.index++;
                this.times.shift(); // shift()删除数组最前面的元素
            }
            return this.index;
        }
    };
    // Lyric.prototype.init.prototype属性指向 Lyric.prototype，就可以共享Lyric的原型对象里面的方法
    Lyric.prototype.init.prototype = Lyric.prototype;
    window.Lyric = Lyric;
})(window);