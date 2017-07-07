/**
 * Created by Kelatev on 04.07.2017.
 */
(function ($) {

    if ($.fn.selectD == null) {
        $.fn.selectD = function (options) {
            options = options || {};

            if (typeof options === 'object') {
                var self = this;
                self.each(function () {
                    //var instanceOptions = $.extend(true, {}, options);
                    var instanceOptions = $.extend({
                        // These are the defaults.
                        wrap_class: '',
                        text_class: '',
                        text_active_class: 'text_active_class',
                        dropdown_icon: null,
                        templateResult: function (item) {
                            return item.text;
                        },
                        onChange: null
                    }, options);

                    var instance = new SelectD($(this), self, instanceOptions);
                });

                return this;
            } else {
                throw new Error('Invalid arguments for SelectD: ' + options);
            }
        };
    }

    var SelectD = function ($element, $items, options) {
        this.$element = $element;
        this.$items = $items;

        this.options = options;

        this.build();
        this.renderLabel();
        this.renderItems();

        // Register any internal event handlers
        this._registerEvents();

        // Hide the original select
        $element.addClass('selectD-hidden-accessible');
        $element.attr('aria-hidden', 'true');
    };

    SelectD.prototype.build = function () {
        this.$element.hide();

        this.$wrap = this.$element.wrap('<span class="selectD-wrap ' + this.options.wrap_class + '">').parent();
        //this.$text = $('<span class="' + this.options.text_class + '"/>').appendTo(this.$wrap);

        if (this.options.dropdown_icon)
            this.$wrap.append(this.options.dropdown_icon);

        this.$container = $('<span class="selectD-container">').appendTo(this.$wrap);
        var dropdown = $('<span class="selectD-dropdown">');
        this.$container.append(dropdown);
        this.$list = $('<ul class="selectD-results">').appendTo(dropdown);

        this.parseOptions();
    };

    SelectD.prototype.parseOptions = function () {
        var self = this;
        this.items = [];
        this.selected = [];

        this.$element.find('option').each(function (a, b) {
            var that = $(b), value = that.val();
            self.items.push(a);
            self.items[a] = {"text": that.html().replace('&nbsp;', ' ').trim(), 'value': value, 'element': b};
            var width = that.attr('data-width');
            if (width) {
                self.items[a].width = width;
            }
            if (that.is(':selected')) {
                self.selected.push(value);
                self.selected[value] = self.items[a];

                if (self.options.onChange) {
                    self.options.onChange(self.$element, self.$items, value);
                }
            }
        });
    };

    SelectD.prototype.renderItems = function () {
        var self = this;
        this.$list.empty();
        $.each(this.items, function (a, b) {
            var li = $('<li>' + self.options.templateResult(b) + '</li>');
            if (self.selected.indexOf(b.value) > -1) {
                li.addClass('highlighted');
            } else {
                li.removeClass('highlighted');
            }
            li.click(function () {
                self.clickItem(b);
            });
            self.$list.append(li);
        });
    };
    SelectD.prototype.renderLabel = function () {
        var el = this.selected[this.selected[0]],
            text = el.text;
        //this.$text.html(text);
        this.$wrap.attr('title', text);
        if (this.options.text_active_class)
            if (text !== '')
                this.$wrap.addClass(this.options.text_active_class);
            else
                this.$wrap.removeClass(this.options.text_active_class);
        if (el.width) {
            this.$wrap.parent().css({'width': el.width + 'mm'});
        }
    };

    SelectD.prototype._registerEvents = function () {
        var self = this;

        this.$element.on('open', function () {
            $('.selectD-container--open').removeClass('selectD-container--open');
            self.$container.addClass('selectD-container--open');
            self.renderItems();
        });

        this.$element.on('close', function () {
            self.$container.removeClass('selectD-container--open');
            self.$wrap.append(self.$container);
        });

        this.$element.on('change', function () {
            self.renderLabel();

            self.close();
        });

        $('body').on('click', function () {
            self.close();
        });
        self.$wrap.on('click', function (ev) {
            ev.stopPropagation();
            if (self.$container.hasClass('selectD-container--open'))
                self.close();
            else
                self.open();
        });
        self.$list.on('click', function (ev) {
            ev.stopPropagation();
        });
        /*SelectD.items.on('click', 'li', function () {

         });*/
    };

    SelectD.prototype.clickItem = function (item) {
        this.selected = [item.value];
        this.selected[item.value] = item;
        this.$element.val(item.value);

        if (this.options.onChange) {
            this.options.onChange(this.$element, this.$items, item.value);
        }
        this.$element.trigger('change');
    };

    SelectD.prototype.open = function () {
        this.$container.appendTo('body');

        this.$container.find('.selectD-dropdown').css({'width': '250px'});
        this.$container.find('.selectD-dropdown').addClass('selectD-dropdown--below');

        this.$container.addClass('selectD-container--open');

        var wrap = this.$wrap;
        this.$container.css({
            'position': 'absolute',
            'top': wrap.offset().top + wrap.height(),
            'left': wrap.offset().left
        });

        this.$element.trigger('open', {});
    };

    SelectD.prototype.close = function () {
        this.$element.trigger('close');
    };

}(jQuery));