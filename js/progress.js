(function(window) {
    function Progress($progressBar, $progressLine, $progressDot) {
        // Progress对象是通过init()创建的
        return new Progress.prototype.init($progressBar, $progressLine, $progressDot);
    };
    Progress.prototype = {
        constructor: Progress,
        init: function($progressBar, $progressLine, $progressDot) {
            this.$progressBar = $progressBar;
            this.$progressLine = $progressLine;
            this.$progressDot = $progressDot;
        },
        isMove: false,
        progressClick: function(callBack) {
            // 在实例化的progress对象上调用这个progressClick()，this就指向progress对象
            var $this = this;
            this.$progressBar.click(function(event) {
                // this指向点击事件的对象this.$progressBar
                var normalLeft = $(this).offset().left;
                var eventLeft = event.pageX;
                $this.$progressLine.css('width', eventLeft - normalLeft);
                $this.$progressDot.css('left', eventLeft - normalLeft);
            })
        },
        progressMove: function(callBack) {
            var $this = this;
            var normalLeft = this.$progressBar.offset().left;
            var barWidth = this.$progressBar.width();
            var eventLeft;
            // 监听鼠标按下事件
            this.$progressBar.mousedown(function() {
                $this.isMove = true;
                // 监听鼠标移动事件
                $(document).mousemove(function(event) {
                    eventLeft = event.pageX;
                    var offset = eventLeft - normalLeft;
                    if (offset >= 0 && offset <= barWidth) {
                        // 设置前景的宽度
                        $this.$progressLine.css('width', eventLeft - normalLeft);
                        $this.$progressDot.css('left', eventLeft - normalLeft);
                    }
                })
            });
            // 监听鼠标抬起事件
            $(document).mouseup(function() {
                $(document).off('mousemove');
                $this.isMove = false;
                // 计算进度条比例
                var value = (eventLeft - normalLeft) / $this.$progressBar.width();
                callBack(value);
            })
        },
        setProgress: function(value) {
            if (this.isMove) return;
            if (value < 0 || value > 100) return;
            this.$progressLine.css({
                width: value + '%'
            });
            this.$progressDot.css({
                left: value + '%'
            });
        }
    };
    // Progress.prototype.init.prototype属性指向 Progress.prototype，就可以共享Player的原型对象里面的方法
    Progress.prototype.init.prototype = Progress.prototype;
    window.Progress = Progress;
})(window);