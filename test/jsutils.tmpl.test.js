define({
    name: 'jsutils.tmpl.test',
    extend: "spamjs.view",
    using: ["jqtags.tab"]
}).as(function(test,jqtab) {

    return {
        _init_: function() {
            var self = this;
            this.$$.loadTemplate({
                src: this.path("test2.html"), data : { value : 40}
            });
        },
        _ready_: function() {
        }
    };
});