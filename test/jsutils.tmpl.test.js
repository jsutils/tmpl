define({
    name : 'jsutils.tmpl.test',
    extend : "spamjs.view",
    using : ["jqtags.tab"]
}).as(function(test){

    test._init_ = function(){
        var self = this;
        this.$$.loadTemplate({
            src : this.path("test.html")
        }).done(function(d){
            module(["jsutils.file","jsutils.tmpl"], function(fileUtils,tmpl){


                //How to use it
                fileUtils.load_template(self.path("test2.html")).done(function(conent){
                    //content is RAW HTML
                    self.$$.find("#source").text(conent);
                    self.$$.find("#destination").text(tmpl._intercept_(conent));
                    self.$$.find("#parsed").text(tmpl.compile(conent)({
                        a : "A", b : "B", value : 34
                    }));



                });



            })

        });
    };

});